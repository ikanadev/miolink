package thumbnail

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// putFile creates name in the store's directory with the given age.
func putFile(t *testing.T, s *Store, name string, age time.Duration) {
	t.Helper()
	path := filepath.Join(s.dir, name)
	if err := os.WriteFile(path, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	mtime := time.Now().Add(-age)
	if err := os.Chtimes(path, mtime, mtime); err != nil {
		t.Fatal(err)
	}
}

func exists(t *testing.T, s *Store, name string) bool {
	t.Helper()
	_, err := os.Stat(filepath.Join(s.dir, name))
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		t.Fatal(err)
	}
	return err == nil
}

func thumbName(c string) string {
	return strings.Repeat(c, 64) + ".jpg"
}

func referencedNames(names ...string) ReferencedFunc {
	return func(context.Context) ([]string, error) { return names, nil }
}

func TestCleanup(t *testing.T) {
	s := newStore(t)
	old := 2 * time.Hour
	recent := 10 * time.Minute

	var (
		unreferencedOld = thumbName("a")
		unreferencedNew = thumbName("b")
		referencedOld   = thumbName("c")
		unrelated       = "notes.txt"
		unrelatedJPEG   = "photo.jpg"
		staleTemp       = ".tmp-123.jpg"
		freshTemp       = ".tmp-456.jpg"
	)
	putFile(t, s, unreferencedOld, old)
	putFile(t, s, unreferencedNew, recent)
	putFile(t, s, referencedOld, old)
	putFile(t, s, unrelated, old)
	putFile(t, s, unrelatedJPEG, old)
	putFile(t, s, staleTemp, old)
	putFile(t, s, freshTemp, recent)
	// A directory with a thumbnail name is not a thumbnail.
	dirName := thumbName("d")
	if err := os.Mkdir(filepath.Join(s.dir, dirName), 0o755); err != nil {
		t.Fatal(err)
	}
	past := time.Now().Add(-old)
	if err := os.Chtimes(filepath.Join(s.dir, dirName), past, past); err != nil {
		t.Fatal(err)
	}

	removed, err := s.Cleanup(context.Background(), referencedNames(referencedOld, thumbName("e")))
	if err != nil {
		t.Fatalf("Cleanup: %v", err)
	}
	if removed != 2 {
		t.Errorf("removed = %d, want 2", removed)
	}

	want := map[string]bool{
		unreferencedOld: false,
		unreferencedNew: true,
		referencedOld:   true,
		unrelated:       true,
		unrelatedJPEG:   true,
		staleTemp:       false,
		freshTemp:       true,
		dirName:         true,
	}
	for name, kept := range want {
		if got := exists(t, s, name); got != kept {
			t.Errorf("%s exists = %v, want %v", name, got, kept)
		}
	}
}

func TestCleanupReferencedError(t *testing.T) {
	s := newStore(t)
	name := thumbName("a")
	putFile(t, s, name, 2*time.Hour)

	failing := func(context.Context) ([]string, error) { return nil, errors.New("db down") }
	if _, err := s.Cleanup(context.Background(), failing); err == nil {
		t.Fatal("Cleanup succeeded, want error")
	}
	if !exists(t, s, name) {
		t.Error("file removed although the references couldn't be read")
	}
}

func TestRunCleanupStopsOnCancel(t *testing.T) {
	s := newStore(t)
	name := thumbName("a")
	putFile(t, s, name, 2*time.Hour)

	ctx, cancel := context.WithCancel(context.Background())
	calls := make(chan struct{}, 10)
	referenced := func(context.Context) ([]string, error) {
		calls <- struct{}{}
		return nil, nil
	}

	done := make(chan struct{})
	go func() {
		s.RunCleanup(ctx, time.Hour, referenced)
		close(done)
	}()

	select {
	case <-calls:
	case <-time.After(5 * time.Second):
		t.Fatal("RunCleanup didn't run at startup")
	}
	cancel()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("RunCleanup didn't stop after cancel")
	}
	if exists(t, s, name) {
		t.Error("startup run didn't remove the unreferenced file")
	}
}
