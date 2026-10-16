// Package tree implements miolink.tree.v1.TreeService.
package tree

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"

	"connectrpc.com/connect"

	directoryv1 "miobackend/gen/miolink/directory/v1"
	linkv1 "miobackend/gen/miolink/link/v1"
	treev1 "miobackend/gen/miolink/tree/v1"
	"miobackend/gen/miolink/tree/v1/treev1connect"
	"miobackend/internal/database/sqlc"
)

// Store lists the sqlc queries the handler uses.
type Store interface {
	GetRevision(ctx context.Context) (int64, error)
	ListAllDirectories(ctx context.Context) ([]sqlc.Directory, error)
	ListAllLinks(ctx context.Context) ([]sqlc.Link, error)
}

// Handler implements treev1connect.TreeServiceHandler.
type Handler struct {
	db       *sql.DB
	newStore func(tx *sql.Tx) Store
}

var _ treev1connect.TreeServiceHandler = (*Handler)(nil)

// NewHandler returns a TreeService handler backed by db.
func NewHandler(db *sql.DB) *Handler {
	queries := sqlc.New(db)
	return &Handler{
		db:       db,
		newStore: func(tx *sql.Tx) Store { return queries.WithTx(tx) },
	}
}

// GetTree returns the whole tree, or not_modified when the client is current.
// The revision and both lists are read in one transaction, so they form a
// consistent snapshot.
func (h *Handler) GetTree(ctx context.Context, req *treev1.GetTreeRequest) (*treev1.GetTreeResponse, error) {
	tx, err := h.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, internalError("begin transaction", err)
	}
	defer tx.Rollback()

	store := h.newStore(tx)
	revision, err := store.GetRevision(ctx)
	if err != nil {
		return nil, internalError("read revision", err)
	}
	if req.GetKnownRevision() == revision {
		return &treev1.GetTreeResponse{NotModified: true, Revision: revision}, nil
	}

	dirs, err := store.ListAllDirectories(ctx)
	if err != nil {
		return nil, internalError("list directories", err)
	}
	links, err := store.ListAllLinks(ctx)
	if err != nil {
		return nil, internalError("list links", err)
	}
	if err := tx.Commit(); err != nil {
		return nil, internalError("commit", err)
	}

	resp := &treev1.GetTreeResponse{
		Revision:    revision,
		Directories: make([]*directoryv1.Directory, len(dirs)),
		Links:       make([]*linkv1.Link, len(links)),
	}
	for i, d := range dirs {
		resp.Directories[i] = toProtoDirectory(d)
	}
	for i, l := range links {
		resp.Links[i] = toProtoLink(l)
	}
	return resp, nil
}

// internalError logs err and returns a generic CodeInternal error.
func internalError(op string, err error) error {
	slog.Error("tree: "+op, "error", err)
	return connect.NewError(connect.CodeInternal, errors.New("internal error"))
}
