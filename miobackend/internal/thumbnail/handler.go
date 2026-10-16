package thumbnail

import (
	"errors"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
)

// Pattern is the route the handler is mounted on.
const Pattern = "GET /thumbnails/{name}"

// validName matches the only file names the store produces: the hex SHA-256
// of the content plus ".jpg". Anything else, including path traversal, is
// rejected before touching the filesystem.
var validName = regexp.MustCompile(`^[0-9a-f]{64}\.jpg$`)

// ValidName reports whether name is a well-formed thumbnail file name.
func ValidName(name string) bool {
	return validName.MatchString(name)
}

// Handler serves stored thumbnails on Pattern. It is a plain HTTP route, not
// a Connect RPC, and it is public: see "Link metadata and thumbnails" in
// miobackend/CLAUDE.md.
func (s *Store) Handler() http.Handler {
	return http.HandlerFunc(s.serve)
}

func (s *Store) serve(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if !ValidName(name) {
		http.NotFound(w, r)
		return
	}

	f, err := os.Open(filepath.Join(s.dir, name))
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			slog.Error("thumbnail: open", "name", name, "error", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		http.NotFound(w, r)
		return
	}
	defer f.Close()

	info, err := f.Stat()
	if err != nil || !info.Mode().IsRegular() {
		if err != nil {
			slog.Error("thumbnail: stat", "name", name, "error", err)
		}
		http.NotFound(w, r)
		return
	}

	h := w.Header()
	h.Set("Content-Type", "image/jpeg")
	h.Set("Cache-Control", "public, max-age=31536000, immutable")
	h.Set("X-Content-Type-Options", "nosniff")
	// The content never changes for a name, so the name is a strong ETag.
	h.Set("ETag", `"`+name[:64]+`"`)
	http.ServeContent(w, r, name, info.ModTime(), f)
}
