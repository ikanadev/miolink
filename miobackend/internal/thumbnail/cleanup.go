package thumbnail

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	// CleanupMinAge is how old an unreferenced file must be before Cleanup
	// removes it. It protects a file that CreateLink saved before its
	// transaction committed, and temporary files of writes in progress.
	CleanupMinAge = time.Hour

	// CleanupInterval is how often RunCleanup runs Cleanup.
	CleanupInterval = 24 * time.Hour

	// tmpPrefix starts the names of the temporary files write creates.
	tmpPrefix = ".tmp-"
)

// ReferencedFunc returns the names of the thumbnails that links still use.
type ReferencedFunc func(ctx context.Context) ([]string, error)

// Cleanup removes thumbnails that referenced doesn't return and stale
// temporary files left by interrupted writes, as long as they are older than
// CleanupMinAge. Files whose names are neither thumbnail names nor temporary
// names are never touched. It returns how many files it removed.
func (s *Store) Cleanup(ctx context.Context, referenced ReferencedFunc) (int, error) {
	return s.cleanup(ctx, referenced, time.Now())
}

func (s *Store) cleanup(ctx context.Context, referenced ReferencedFunc, now time.Time) (int, error) {
	// List the directory before reading the references: a file saved after
	// the listing isn't considered, and one saved before it is either
	// referenced by then or protected by its age.
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return 0, fmt.Errorf("thumbnail: read directory: %w", err)
	}

	names, err := referenced(ctx)
	if err != nil {
		return 0, fmt.Errorf("thumbnail: list referenced: %w", err)
	}
	keep := make(map[string]bool, len(names))
	for _, name := range names {
		keep[name] = true
	}

	cutoff := now.Add(-CleanupMinAge)
	removed := 0
	var errs []error
	for _, e := range entries {
		name := e.Name()
		isTemp := strings.HasPrefix(name, tmpPrefix)
		if !e.Type().IsRegular() || keep[name] || (!isTemp && !ValidName(name)) {
			continue
		}
		info, err := e.Info()
		if errors.Is(err, os.ErrNotExist) {
			continue
		} else if err != nil {
			errs = append(errs, fmt.Errorf("thumbnail: stat %s: %w", name, err))
			continue
		}
		if !info.ModTime().Before(cutoff) {
			continue
		}
		if err := os.Remove(filepath.Join(s.dir, name)); err != nil && !errors.Is(err, os.ErrNotExist) {
			errs = append(errs, fmt.Errorf("thumbnail: remove %s: %w", name, err))
			continue
		}
		removed++
	}
	return removed, errors.Join(errs...)
}

// RunCleanup runs Cleanup now and then every interval until ctx is done,
// logging the result of each run.
func (s *Store) RunCleanup(ctx context.Context, interval time.Duration, referenced ReferencedFunc) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		removed, err := s.Cleanup(ctx, referenced)
		if err != nil && ctx.Err() == nil {
			slog.Error("thumbnail cleanup", "removed", removed, "error", err)
		} else if err == nil {
			slog.Info("thumbnail cleanup", "removed", removed)
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}
