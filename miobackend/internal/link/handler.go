// Package link implements miolink.link.v1.LinkService.
package link

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"connectrpc.com/connect"

	linkv1 "miobackend/gen/miolink/link/v1"
	"miobackend/gen/miolink/link/v1/linkv1connect"
	"miobackend/internal/database/sqlc"
	"miobackend/internal/linkmeta"
)

const (
	// maxURLLength is the longest URL a link may have, in characters.
	maxURLLength = 2048
	// maxTitleLength matches the CHECK on links.title.
	maxTitleLength = 500
)

// Store lists the sqlc queries the handler uses.
type Store interface {
	GetRevision(ctx context.Context) (int64, error)
	GetDirectory(ctx context.Context, id int64) (sqlc.Directory, error)
	GetLink(ctx context.Context, id int64) (sqlc.Link, error)
	CreateLink(ctx context.Context, arg sqlc.CreateLinkParams) (sqlc.Link, error)
	UpdateLinkTitle(ctx context.Context, arg sqlc.UpdateLinkTitleParams) (sqlc.Link, error)
	UpdateLinkMetadata(ctx context.Context, arg sqlc.UpdateLinkMetadataParams) (sqlc.Link, error)
	MoveLink(ctx context.Context, arg sqlc.MoveLinkParams) (sqlc.Link, error)
	DeleteLink(ctx context.Context, id int64) (int64, error)
	IncrementLinkViews(ctx context.Context, id int64) (int64, error)
}

// MetadataFetcher reads a page's title and preview image URL.
// *linkmeta.Fetcher implements it.
type MetadataFetcher interface {
	Fetch(ctx context.Context, rawURL string) (linkmeta.Metadata, error)
}

// ThumbnailSaver downloads an image, stores it as a thumbnail and returns its
// file name. *thumbnail.Store implements it.
type ThumbnailSaver interface {
	SaveFromURL(ctx context.Context, imageURL string) (string, error)
}

// Handler implements linkv1connect.LinkServiceHandler.
type Handler struct {
	db         *sql.DB
	store      Store // outside transactions
	newStore   func(tx *sql.Tx) Store
	fetcher    MetadataFetcher
	thumbnails ThumbnailSaver
	now        func() time.Time
}

var _ linkv1connect.LinkServiceHandler = (*Handler)(nil)

// NewHandler returns a LinkService handler backed by db that reads page
// metadata with fetcher and stores preview images with thumbnails.
func NewHandler(db *sql.DB, fetcher MetadataFetcher, thumbnails ThumbnailSaver) *Handler {
	queries := sqlc.New(db)
	return &Handler{
		db:         db,
		store:      queries,
		newStore:   func(tx *sql.Tx) Store { return queries.WithTx(tx) },
		fetcher:    fetcher,
		thumbnails: thumbnails,
		now:        time.Now,
	}
}

// revisions holds the tree revision before and after a write.
type revisions struct {
	previous, current int64
}

// inTx runs fn in a transaction between two revision reads, as every write RPC does.
func (h *Handler) inTx(ctx context.Context, fn func(Store) error) (revisions, error) {
	var revs revisions
	tx, err := h.db.BeginTx(ctx, nil)
	if err != nil {
		return revs, internalError("begin transaction", err)
	}
	defer tx.Rollback()

	store := h.newStore(tx)
	if revs.previous, err = store.GetRevision(ctx); err != nil {
		return revs, internalError("read revision", err)
	}
	if err := fn(store); err != nil {
		return revs, err
	}
	if revs.current, err = store.GetRevision(ctx); err != nil {
		return revs, internalError("read revision", err)
	}
	if err := tx.Commit(); err != nil {
		return revs, internalError("commit", err)
	}
	return revs, nil
}

// CreateLink fetches the page's metadata and thumbnail, then stores the link.
func (h *Handler) CreateLink(ctx context.Context, req *linkv1.CreateLinkRequest) (*linkv1.CreateLinkResponse, error) {
	rawURL, err := validateURL(req.GetUrl())
	if err != nil {
		return nil, err
	}
	// Network first, so slow fetches never hold the single SQLite connection.
	meta := h.fetchMetadata(ctx, rawURL)

	var link sqlc.Link
	revs, err := h.inTx(ctx, func(s Store) error {
		if err := checkDirectory(ctx, s, req.GetDirectoryId()); err != nil {
			return err
		}
		var err error
		link, err = s.CreateLink(ctx, fromCreateLinkRequest(req, rawURL, meta, h.now()))
		return writeError("create link", err)
	})
	if err != nil {
		return nil, err
	}
	return &linkv1.CreateLinkResponse{
		Link:             toProtoLink(link),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// UpdateLink changes a link's title.
func (h *Handler) UpdateLink(ctx context.Context, req *linkv1.UpdateLinkRequest) (*linkv1.UpdateLinkResponse, error) {
	title, err := validateTitle(req.GetTitle())
	if err != nil {
		return nil, err
	}
	var link sqlc.Link
	revs, err := h.inTx(ctx, func(s Store) error {
		var err error
		link, err = s.UpdateLinkTitle(ctx, sqlc.UpdateLinkTitleParams{Title: title, ID: req.GetId()})
		return writeError("update link", err)
	})
	if err != nil {
		return nil, err
	}
	return &linkv1.UpdateLinkResponse{
		Link:             toProtoLink(link),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// MoveLink moves a link to another directory.
func (h *Handler) MoveLink(ctx context.Context, req *linkv1.MoveLinkRequest) (*linkv1.MoveLinkResponse, error) {
	var link sqlc.Link
	revs, err := h.inTx(ctx, func(s Store) error {
		if err := checkDirectory(ctx, s, req.GetDirectoryId()); err != nil {
			return err
		}
		var err error
		link, err = s.MoveLink(ctx, sqlc.MoveLinkParams{DirectoryID: req.GetDirectoryId(), ID: req.GetId()})
		return writeError("move link", err)
	})
	if err != nil {
		return nil, err
	}
	return &linkv1.MoveLinkResponse{
		Link:             toProtoLink(link),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// DeleteLink deletes a link. Its thumbnail file stays until the periodic
// cleanup, because other links may share it.
func (h *Handler) DeleteLink(ctx context.Context, req *linkv1.DeleteLinkRequest) (*linkv1.DeleteLinkResponse, error) {
	revs, err := h.inTx(ctx, func(s Store) error {
		n, err := s.DeleteLink(ctx, req.GetId())
		if err != nil {
			return internalError("delete link", err)
		}
		if n == 0 {
			return linkNotFound()
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &linkv1.DeleteLinkResponse{
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// RecordView counts a view. Views don't bump the revision, so there is no
// revision transaction.
func (h *Handler) RecordView(ctx context.Context, req *linkv1.RecordViewRequest) (*linkv1.RecordViewResponse, error) {
	views, err := h.store.IncrementLinkViews(ctx, req.GetId())
	if err != nil {
		return nil, writeError("record view", err)
	}
	return &linkv1.RecordViewResponse{Views: views}, nil
}

// RefreshLinkMetadata fetches the page again and replaces the title and thumbnail.
func (h *Handler) RefreshLinkMetadata(ctx context.Context, req *linkv1.RefreshLinkMetadataRequest) (*linkv1.RefreshLinkMetadataResponse, error) {
	current, err := h.store.GetLink(ctx, req.GetId())
	if err != nil {
		return nil, writeError("get link", err)
	}
	// Network first, outside the transaction.
	meta := h.fetchMetadata(ctx, current.Url)

	var link sqlc.Link
	revs, err := h.inTx(ctx, func(s Store) error {
		var err error
		link, err = s.UpdateLinkMetadata(ctx, sqlc.UpdateLinkMetadataParams{
			Title:     meta.title,
			Thumbnail: meta.thumbnail,
			ID:        req.GetId(),
		})
		return writeError("refresh link metadata", err)
	})
	if err != nil {
		return nil, err
	}
	return &linkv1.RefreshLinkMetadataResponse{
		Link:             toProtoLink(link),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// metadata is what a link stores from its page.
type metadata struct {
	title     string
	thumbnail *string // file name, nil when there is none
}

// fetchMetadata reads the page title and saves its preview image. Failures are
// logged and never returned: the title falls back to the hostname and the
// thumbnail to none.
func (h *Handler) fetchMetadata(ctx context.Context, rawURL string) metadata {
	page, err := h.fetcher.Fetch(ctx, rawURL)
	if err != nil {
		slog.Info("link: fetch metadata", "url", rawURL, "error", err)
	}
	meta := metadata{title: linkmeta.CleanTitle(page.Title)}
	if meta.title == "" {
		meta.title = linkmeta.FallbackTitle(rawURL)
	}
	if page.ImageURL != "" {
		name, err := h.thumbnails.SaveFromURL(ctx, page.ImageURL)
		if err != nil {
			slog.Info("link: save thumbnail", "url", rawURL, "image", page.ImageURL, "error", err)
		} else {
			meta.thumbnail = &name
		}
	}
	return meta
}

// validateURL trims rawURL and checks that it is an absolute http or https
// URL with a host and at most maxURLLength characters.
func validateURL(rawURL string) (string, error) {
	rawURL = strings.TrimSpace(rawURL)
	if rawURL == "" {
		return "", connect.NewError(connect.CodeInvalidArgument, errors.New("url must not be empty"))
	}
	if utf8.RuneCountInString(rawURL) > maxURLLength {
		return "", connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("url must be at most %d characters", maxURLLength))
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return "", connect.NewError(connect.CodeInvalidArgument, errors.New("url is not valid"))
	}
	if scheme := strings.ToLower(u.Scheme); scheme != "http" && scheme != "https" {
		return "", connect.NewError(connect.CodeInvalidArgument, errors.New("url must start with http:// or https://"))
	}
	if u.Hostname() == "" {
		return "", connect.NewError(connect.CodeInvalidArgument, errors.New("url must have a host"))
	}
	return rawURL, nil
}

// validateTitle trims title and checks its length against the schema's rule.
func validateTitle(title string) (string, error) {
	title = strings.TrimSpace(title)
	switch n := utf8.RuneCountInString(title); {
	case n == 0:
		return "", connect.NewError(connect.CodeInvalidArgument, errors.New("title must not be empty"))
	case n > maxTitleLength:
		return "", connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("title must be at most %d characters", maxTitleLength))
	}
	return title, nil
}

// checkDirectory returns CodeNotFound when the directory doesn't exist.
func checkDirectory(ctx context.Context, s Store, id int64) error {
	_, err := s.GetDirectory(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return connect.NewError(connect.CodeNotFound, errors.New("directory not found"))
	}
	if err != nil {
		return internalError("get directory", err)
	}
	return nil
}

// writeError maps a query error; a missing row means the link doesn't exist.
func writeError(op string, err error) error {
	if err == nil {
		return nil
	}
	var cerr *connect.Error
	if errors.As(err, &cerr) {
		return err
	}
	if errors.Is(err, sql.ErrNoRows) {
		return linkNotFound()
	}
	return internalError(op, err)
}

func linkNotFound() error {
	return connect.NewError(connect.CodeNotFound, errors.New("link not found"))
}

// internalError logs err and returns a generic CodeInternal error.
func internalError(op string, err error) error {
	slog.Error("link: "+op, "error", err)
	return connect.NewError(connect.CodeInternal, errors.New("internal error"))
}
