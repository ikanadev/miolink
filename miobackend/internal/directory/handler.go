// Package directory implements miolink.directory.v1.DirectoryService.
package directory

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"
	"unicode/utf8"

	"connectrpc.com/connect"

	directoryv1 "miobackend/gen/miolink/directory/v1"
	"miobackend/gen/miolink/directory/v1/directoryv1connect"
	"miobackend/internal/database"
	"miobackend/internal/database/sqlc"
)

// rootID is the hidden root directory, which can't be renamed, moved or deleted.
const rootID = 1

// Store lists the sqlc queries the handler uses.
type Store interface {
	GetRevision(ctx context.Context) (int64, error)
	GetDirectory(ctx context.Context, id int64) (sqlc.Directory, error)
	CreateDirectory(ctx context.Context, arg sqlc.CreateDirectoryParams) (sqlc.Directory, error)
	RenameDirectory(ctx context.Context, arg sqlc.RenameDirectoryParams) (sqlc.Directory, error)
	MoveDirectory(ctx context.Context, arg sqlc.MoveDirectoryParams) (sqlc.Directory, error)
	DeleteDirectory(ctx context.Context, id int64) (int64, error)
	CountAncestorMatches(ctx context.Context, arg sqlc.CountAncestorMatchesParams) (int64, error)
}

// Handler implements directoryv1connect.DirectoryServiceHandler.
type Handler struct {
	db       *sql.DB
	newStore func(tx *sql.Tx) Store
	now      func() time.Time
}

var _ directoryv1connect.DirectoryServiceHandler = (*Handler)(nil)

// NewHandler returns a DirectoryService handler backed by db.
func NewHandler(db *sql.DB) *Handler {
	queries := sqlc.New(db)
	return &Handler{
		db:       db,
		newStore: func(tx *sql.Tx) Store { return queries.WithTx(tx) },
		now:      time.Now,
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

// CreateDirectory creates a directory inside an existing one.
func (h *Handler) CreateDirectory(ctx context.Context, req *directoryv1.CreateDirectoryRequest) (*directoryv1.CreateDirectoryResponse, error) {
	if err := validateName(req.GetName()); err != nil {
		return nil, err
	}
	var dir sqlc.Directory
	revs, err := h.inTx(ctx, func(s Store) error {
		if _, err := getDirectory(ctx, s, req.GetParentId(), "parent directory"); err != nil {
			return err
		}
		var err error
		dir, err = s.CreateDirectory(ctx, fromCreateDirectoryRequest(req, h.now()))
		return writeError("create directory", err)
	})
	if err != nil {
		return nil, err
	}
	return &directoryv1.CreateDirectoryResponse{
		Directory:        toProtoDirectory(dir),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// RenameDirectory changes a directory's name.
func (h *Handler) RenameDirectory(ctx context.Context, req *directoryv1.RenameDirectoryRequest) (*directoryv1.RenameDirectoryResponse, error) {
	if req.GetId() == rootID {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("the root directory can't be renamed"))
	}
	if err := validateName(req.GetName()); err != nil {
		return nil, err
	}
	var dir sqlc.Directory
	revs, err := h.inTx(ctx, func(s Store) error {
		var err error
		dir, err = s.RenameDirectory(ctx, sqlc.RenameDirectoryParams{Name: req.GetName(), ID: req.GetId()})
		if errors.Is(err, sql.ErrNoRows) {
			return connect.NewError(connect.CodeNotFound, errors.New("directory not found"))
		}
		return writeError("rename directory", err)
	})
	if err != nil {
		return nil, err
	}
	return &directoryv1.RenameDirectoryResponse{
		Directory:        toProtoDirectory(dir),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// MoveDirectory moves a directory under a new parent, refusing to create cycles.
func (h *Handler) MoveDirectory(ctx context.Context, req *directoryv1.MoveDirectoryRequest) (*directoryv1.MoveDirectoryResponse, error) {
	id, newParentID := req.GetId(), req.GetNewParentId()
	if id == rootID {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("the root directory can't be moved"))
	}
	var dir sqlc.Directory
	revs, err := h.inTx(ctx, func(s Store) error {
		var err error
		if dir, err = getDirectory(ctx, s, id, "directory"); err != nil {
			return err
		}
		if _, err := getDirectory(ctx, s, newParentID, "new parent directory"); err != nil {
			return err
		}
		if dir.ParentID != nil && *dir.ParentID == newParentID {
			return nil // Already there: nothing changes and the revision stays.
		}
		// SQLite can't prevent cycles, so walk up from the new parent looking for id.
		matches, err := s.CountAncestorMatches(ctx, sqlc.CountAncestorMatchesParams{
			AncestorID:   id,
			DescendantID: newParentID,
		})
		if err != nil {
			return internalError("check ancestors", err)
		}
		if matches > 0 {
			return connect.NewError(connect.CodeInvalidArgument, errors.New("a directory can't be moved into itself or one of its subdirectories"))
		}
		dir, err = s.MoveDirectory(ctx, sqlc.MoveDirectoryParams{ParentID: &newParentID, ID: id})
		return writeError("move directory", err)
	})
	if err != nil {
		return nil, err
	}
	return &directoryv1.MoveDirectoryResponse{
		Directory:        toProtoDirectory(dir),
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// DeleteDirectory deletes a directory; its subdirectories and links go with it.
func (h *Handler) DeleteDirectory(ctx context.Context, req *directoryv1.DeleteDirectoryRequest) (*directoryv1.DeleteDirectoryResponse, error) {
	if req.GetId() == rootID {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("the root directory can't be deleted"))
	}
	revs, err := h.inTx(ctx, func(s Store) error {
		n, err := s.DeleteDirectory(ctx, req.GetId())
		if err != nil {
			return internalError("delete directory", err)
		}
		if n == 0 {
			return connect.NewError(connect.CodeNotFound, errors.New("directory not found"))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &directoryv1.DeleteDirectoryResponse{
		PreviousRevision: revs.previous,
		Revision:         revs.current,
	}, nil
}

// validateName applies the Linux-style name rules also enforced by the schema.
func validateName(name string) error {
	switch n := utf8.RuneCountInString(name); {
	case n == 0:
		return connect.NewError(connect.CodeInvalidArgument, errors.New("name must not be empty"))
	case n > 255:
		return connect.NewError(connect.CodeInvalidArgument, errors.New("name must be at most 255 characters"))
	case strings.Contains(name, "/"):
		return connect.NewError(connect.CodeInvalidArgument, errors.New(`name must not contain "/"`))
	case name == "." || name == "..":
		return connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("name must not be %q", name))
	}
	return nil
}

// getDirectory loads a directory, mapping a missing row to CodeNotFound.
func getDirectory(ctx context.Context, s Store, id int64, what string) (sqlc.Directory, error) {
	dir, err := s.GetDirectory(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return dir, connect.NewError(connect.CodeNotFound, fmt.Errorf("%s not found", what))
	}
	if err != nil {
		return dir, internalError("get directory", err)
	}
	return dir, nil
}

// writeError maps an insert or update error; sibling name conflicts are CodeAlreadyExists.
func writeError(op string, err error) error {
	if err == nil {
		return nil
	}
	var cerr *connect.Error
	if errors.As(err, &cerr) {
		return err
	}
	if database.IsUniqueViolation(err) {
		return connect.NewError(connect.CodeAlreadyExists, errors.New("a directory with that name already exists here"))
	}
	return internalError(op, err)
}

// internalError logs err and returns a generic CodeInternal error.
func internalError(op string, err error) error {
	slog.Error("directory: "+op, "error", err)
	return connect.NewError(connect.CodeInternal, errors.New("internal error"))
}
