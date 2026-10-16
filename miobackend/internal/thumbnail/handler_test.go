package thumbnail

import (
	"bytes"
	"image/color"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func newServer(t *testing.T, s *Store) *httptest.Server {
	t.Helper()
	mux := http.NewServeMux()
	mux.Handle(Pattern, s.Handler())
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv
}

func get(t *testing.T, url string) (*http.Response, []byte) {
	t.Helper()
	resp, err := http.Get(url)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return resp, body
}

func TestHandlerServesThumbnail(t *testing.T) {
	s := newStore(t)
	name, err := s.Save(encodePNG(t, solid(20, 20, color.White)))
	if err != nil {
		t.Fatal(err)
	}
	want, err := os.ReadFile(filepath.Join(s.dir, name))
	if err != nil {
		t.Fatal(err)
	}

	resp, body := get(t, newServer(t, s).URL+URLPath(name))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", resp.StatusCode)
	}
	for header, value := range map[string]string{
		"Content-Type":           "image/jpeg",
		"Cache-Control":          "public, max-age=31536000, immutable",
		"X-Content-Type-Options": "nosniff",
	} {
		if got := resp.Header.Get(header); got != value {
			t.Errorf("%s = %q, want %q", header, got, value)
		}
	}
	if !bytes.Equal(body, want) {
		t.Error("body differs from the stored file")
	}
}

func TestHandlerMissingFile(t *testing.T) {
	resp, _ := get(t, newServer(t, newStore(t)).URL+URLPath(strings.Repeat("0", 64)+".jpg"))
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", resp.StatusCode)
	}
}

func TestHandlerBadNames(t *testing.T) {
	s := newStore(t)
	// A file that exists in the directory but isn't a valid name must not be
	// reachable.
	if err := os.WriteFile(filepath.Join(s.dir, "secret.jpg"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	srv := newServer(t, s)
	hex := strings.Repeat("a", 64)
	for _, name := range []string{
		"secret.jpg",
		strings.ToUpper(hex) + ".jpg",
		hex + ".png",
		hex[:63] + ".jpg",
		hex + "a.jpg",
		hex,
		".tmp-123.jpg",
		"..%2Fsecret.jpg",
		"%2E%2E%2F" + hex + ".jpg",
		hex + ".jpg%00",
	} {
		resp, _ := get(t, srv.URL+"/thumbnails/"+name)
		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("%s: status = %d, want 404", name, resp.StatusCode)
		}
	}
}

func TestValidName(t *testing.T) {
	if !ValidName(strings.Repeat("0123456789abcdef", 4) + ".jpg") {
		t.Error("valid name rejected")
	}
	for _, name := range []string{"", ".jpg", "../x.jpg", strings.Repeat("a", 64) + ".jpg\n"} {
		if ValidName(name) {
			t.Errorf("ValidName(%q) = true", name)
		}
	}
}
