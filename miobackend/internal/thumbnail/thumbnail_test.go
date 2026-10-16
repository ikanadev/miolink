package thumbnail

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"hash/crc32"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"miobackend/internal/safehttp"
)

func newStore(t *testing.T) *Store {
	t.Helper()
	s, err := NewStore(filepath.Join(t.TempDir(), "thumbs"), safehttp.NewClient(safehttp.Options{AllowLoopback: true}))
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}
	return s
}

// serve starts a server that answers every request with contentType and body.
func serve(t *testing.T, contentType string, body []byte) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", contentType)
		_, _ = w.Write(body)
	}))
	t.Cleanup(srv.Close)
	return srv
}

func encodePNG(t *testing.T, img image.Image) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func encodeJPEG(t *testing.T, img image.Image) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, img, nil); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func solid(w, h int, c color.Color) *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := range h {
		for x := range w {
			img.Set(x, y, c)
		}
	}
	return img
}

// saveURL serves body and saves it through SaveFromURL.
func saveURL(t *testing.T, s *Store, contentType string, body []byte) (string, error) {
	t.Helper()
	srv := serve(t, contentType, body)
	return s.SaveFromURL(context.Background(), srv.URL+"/img")
}

// readThumb decodes the stored thumbnail called name.
func readThumb(t *testing.T, s *Store, name string) image.Image {
	t.Helper()
	if !ValidName(name) {
		t.Fatalf("name %q is not valid", name)
	}
	f, err := os.Open(filepath.Join(s.dir, name))
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	img, format, err := image.Decode(f)
	if err != nil {
		t.Fatal(err)
	}
	if format != "jpeg" {
		t.Fatalf("stored format = %s, want jpeg", format)
	}
	return img
}

func TestNewStoreCreatesDirectory(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "a", "b")
	if _, err := NewStore(dir, http.DefaultClient); err != nil {
		t.Fatal(err)
	}
	if info, err := os.Stat(dir); err != nil || !info.IsDir() {
		t.Fatalf("directory not created: %v", err)
	}
}

func TestSavePNGWithTransparency(t *testing.T) {
	s := newStore(t)
	// Fully transparent 800x400 with an opaque red left half.
	img := image.NewNRGBA(image.Rect(0, 0, 800, 400))
	for y := range 400 {
		for x := range 400 {
			img.Set(x, y, color.NRGBA{R: 255, A: 255})
		}
	}

	// Served with a misleading Content-Type; detection is by content.
	name, err := saveURL(t, s, "text/plain", encodePNG(t, img))
	if err != nil {
		t.Fatalf("SaveFromURL: %v", err)
	}
	thumb := readThumb(t, s, name)
	if b := thumb.Bounds(); b.Dx() != 400 || b.Dy() != 200 {
		t.Fatalf("size = %v, want 400x200", b.Size())
	}
	r, g, b, _ := thumb.At(350, 100).RGBA()
	if r>>8 < 240 || g>>8 < 240 || b>>8 < 240 {
		t.Errorf("transparent area = %d,%d,%d, want white", r>>8, g>>8, b>>8)
	}
	r, g, b, _ = thumb.At(50, 100).RGBA()
	if r>>8 < 200 || g>>8 > 60 || b>>8 > 60 {
		t.Errorf("opaque area = %d,%d,%d, want red", r>>8, g>>8, b>>8)
	}
}

func TestSaveJPEGNoUpscale(t *testing.T) {
	s := newStore(t)
	name, err := saveURL(t, s, "image/jpeg", encodeJPEG(t, solid(120, 90, color.NRGBA{B: 255, A: 255})))
	if err != nil {
		t.Fatalf("SaveFromURL: %v", err)
	}
	if b := readThumb(t, s, name).Bounds(); b.Dx() != 120 || b.Dy() != 90 {
		t.Fatalf("size = %v, want 120x90", b.Size())
	}
}

func TestSaveWebP(t *testing.T) {
	data, err := os.ReadFile("testdata/gopher.webp")
	if err != nil {
		t.Fatal(err)
	}
	s := newStore(t)
	name, err := saveURL(t, s, "image/webp", data)
	if err != nil {
		t.Fatalf("SaveFromURL: %v", err)
	}
	if b := readThumb(t, s, name).Bounds(); b.Dx() <= 0 || b.Dx() > Width {
		t.Fatalf("size = %v", b.Size())
	}
}

func TestRejectsSVG(t *testing.T) {
	svg := []byte(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>`)
	s := newStore(t)
	if _, err := saveURL(t, s, "image/svg+xml", svg); !errors.Is(err, ErrUnsupportedFormat) {
		t.Fatalf("err = %v, want ErrUnsupportedFormat", err)
	}
	assertEmpty(t, s)
}

// pngHeader returns a PNG signature and IHDR chunk claiming w x h pixels,
// which is all image.DecodeConfig reads.
func pngHeader(w, h uint32) []byte {
	ihdr := make([]byte, 13)
	binary.BigEndian.PutUint32(ihdr[0:], w)
	binary.BigEndian.PutUint32(ihdr[4:], h)
	ihdr[8] = 8 // bit depth
	ihdr[9] = 6 // RGBA
	chunk := append([]byte("IHDR"), ihdr...)

	var buf bytes.Buffer
	buf.WriteString("\x89PNG\r\n\x1a\n")
	_ = binary.Write(&buf, binary.BigEndian, uint32(len(ihdr)))
	buf.Write(chunk)
	_ = binary.Write(&buf, binary.BigEndian, crc32.ChecksumIEEE(chunk))
	return buf.Bytes()
}

func TestRejectsTooManyPixels(t *testing.T) {
	s := newStore(t)
	if _, err := saveURL(t, s, "image/png", pngHeader(10_000, 10_000)); !errors.Is(err, ErrTooLarge) {
		t.Fatalf("err = %v, want ErrTooLarge", err)
	}
	assertEmpty(t, s)
}

func TestRejectsTooManyBytes(t *testing.T) {
	s := newStore(t)
	body := make([]byte, MaxDownloadBytes+1)
	copy(body, encodePNG(t, solid(10, 10, color.Black)))
	if _, err := saveURL(t, s, "image/png", body); !errors.Is(err, ErrTooLarge) {
		t.Fatalf("err = %v, want ErrTooLarge", err)
	}
}

func TestRejectsErrorStatus(t *testing.T) {
	srv := httptest.NewServer(http.NotFoundHandler())
	t.Cleanup(srv.Close)
	if _, err := newStore(t).SaveFromURL(context.Background(), srv.URL); !errors.Is(err, ErrStatus) {
		t.Fatalf("err = %v, want ErrStatus", err)
	}
}

func TestBlocksLoopbackWithProductionClient(t *testing.T) {
	srv := serve(t, "image/png", encodePNG(t, solid(10, 10, color.Black)))
	s, err := NewStore(t.TempDir(), safehttp.NewClient(safehttp.Options{}))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := s.SaveFromURL(context.Background(), srv.URL); !errors.Is(err, safehttp.ErrBlockedAddress) {
		t.Fatalf("err = %v, want ErrBlockedAddress", err)
	}
}

func TestSaveSameImageTwice(t *testing.T) {
	s := newStore(t)
	data := encodePNG(t, solid(500, 300, color.NRGBA{G: 200, A: 255}))
	first, err := s.Save(data)
	if err != nil {
		t.Fatal(err)
	}
	second, err := saveURL(t, s, "image/png", data)
	if err != nil {
		t.Fatal(err)
	}
	if first != second {
		t.Fatalf("names differ: %s, %s", first, second)
	}
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 1 || entries[0].Name() != first {
		t.Fatalf("directory has %v, want only %s", entries, first)
	}
}

func assertEmpty(t *testing.T, s *Store) {
	t.Helper()
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 0 {
		t.Fatalf("directory not empty: %v", entries)
	}
}

func TestURLPath(t *testing.T) {
	name := strings.Repeat("a", 64) + ".jpg"
	if got := URLPath(name); got != "/thumbnails/"+name {
		t.Fatalf("URLPath = %q", got)
	}
}
