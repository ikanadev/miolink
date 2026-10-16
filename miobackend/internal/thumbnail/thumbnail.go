// Package thumbnail downloads preview images, turns them into small JPEGs
// stored on disk, and serves them over HTTP.
//
// Files are named by the SHA-256 of their content, so identical thumbnails
// share one file and a stored file never changes.
package thumbnail

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	// Decoders for the accepted input formats.
	_ "image/gif"
	_ "image/png"

	_ "golang.org/x/image/webp"

	"golang.org/x/image/draw"
)

const (
	// MaxDownloadBytes is the largest image body SaveFromURL accepts.
	MaxDownloadBytes = 10 << 20

	// MaxPixels is the largest image, in pixels, that is decoded. It is
	// checked from the header before decoding, so a small file can't claim
	// huge dimensions and exhaust memory.
	MaxPixels = 40_000_000

	// Width is the width of stored thumbnails. Narrower images keep their
	// size; they are never upscaled.
	Width = 400

	// JPEGQuality is the quality thumbnails are encoded with.
	JPEGQuality = 80
)

// acceptedFormats are the image.DecodeConfig format names Save accepts.
var acceptedFormats = map[string]bool{"jpeg": true, "png": true, "gif": true, "webp": true}

var (
	// ErrUnsupportedFormat is returned (wrapped) for anything that isn't a
	// JPEG, PNG, GIF or WebP image, including SVG.
	ErrUnsupportedFormat = errors.New("thumbnail: unsupported image format")

	// ErrTooLarge is returned (wrapped) for bodies above MaxDownloadBytes and
	// images above MaxPixels.
	ErrTooLarge = errors.New("thumbnail: image too large")

	// ErrStatus is returned (wrapped) when the image URL answers with a
	// non-2xx status.
	ErrStatus = errors.New("thumbnail: unexpected HTTP status")
)

// Store saves thumbnails in a directory.
type Store struct {
	dir    string
	client *http.Client
}

// NewStore returns a Store that keeps its files in dir, creating it if it's
// missing, and downloads images with client. Use a safehttp client.
func NewStore(dir string, client *http.Client) (*Store, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("thumbnail: create directory: %w", err)
	}
	return &Store{dir: dir, client: client}, nil
}

// URLPath returns the path, relative to the API base URL, that serves the
// thumbnail called name. Proto messages expose it as thumbnail_url.
func URLPath(name string) string {
	return "/thumbnails/" + name
}

// SaveFromURL downloads the image at imageURL, stores it as a thumbnail and
// returns the file name.
func (s *Store) SaveFromURL(ctx context.Context, imageURL string) (string, error) {
	u, err := url.Parse(imageURL)
	if err != nil {
		return "", fmt.Errorf("thumbnail: parse url: %w", err)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return "", fmt.Errorf("%w: scheme %q", ErrUnsupportedFormat, u.Scheme)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return "", fmt.Errorf("thumbnail: build request: %w", err)
	}
	req.Header.Set("Accept", "image/webp,image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.1")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("thumbnail: fetch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return "", fmt.Errorf("%w: %d", ErrStatus, resp.StatusCode)
	}
	if resp.ContentLength > MaxDownloadBytes {
		return "", fmt.Errorf("%w: %d bytes", ErrTooLarge, resp.ContentLength)
	}

	data, err := io.ReadAll(io.LimitReader(resp.Body, MaxDownloadBytes+1))
	if err != nil {
		return "", fmt.Errorf("thumbnail: read body: %w", err)
	}
	if len(data) > MaxDownloadBytes {
		return "", fmt.Errorf("%w: more than %d bytes", ErrTooLarge, MaxDownloadBytes)
	}
	return s.Save(data)
}

// Save turns the encoded image in data into a thumbnail, stores it and
// returns the file name. The format is detected from the content; the
// Content-Type the image was served with is ignored.
func (s *Store) Save(data []byte) (string, error) {
	out, err := Process(data)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(out)
	name := hex.EncodeToString(sum[:]) + ".jpg"
	if err := s.write(name, out); err != nil {
		return "", err
	}
	return name, nil
}

// Process decodes data, resizes it to Width pixels wide (never upscaling),
// flattens transparency onto white and returns it encoded as JPEG.
func Process(data []byte) ([]byte, error) {
	cfg, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUnsupportedFormat, err)
	}
	if !acceptedFormats[format] {
		return nil, fmt.Errorf("%w: %s", ErrUnsupportedFormat, format)
	}
	if cfg.Width <= 0 || cfg.Height <= 0 {
		return nil, fmt.Errorf("%w: empty image", ErrUnsupportedFormat)
	}
	if int64(cfg.Width)*int64(cfg.Height) > MaxPixels {
		return nil, fmt.Errorf("%w: %dx%d", ErrTooLarge, cfg.Width, cfg.Height)
	}

	src, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("%w: decode: %v", ErrUnsupportedFormat, err)
	}

	sb := src.Bounds()
	w, h := sb.Dx(), sb.Dy()
	if w > Width {
		h = max(1, int(int64(h)*Width/int64(w)))
		w = Width
	}

	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	draw.Draw(dst, dst.Bounds(), image.NewUniform(color.White), image.Point{}, draw.Src)
	if w == sb.Dx() && h == sb.Dy() {
		draw.Draw(dst, dst.Bounds(), src, sb.Min, draw.Over)
	} else {
		draw.CatmullRom.Scale(dst, dst.Bounds(), src, sb, draw.Over, nil)
	}

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, dst, &jpeg.Options{Quality: JPEGQuality}); err != nil {
		return nil, fmt.Errorf("thumbnail: encode: %w", err)
	}
	return buf.Bytes(), nil
}

// write stores data as name, unless a file with that name already exists.
// The data goes to a temporary file that is then renamed, so readers never
// see a partial file. Temporary names start with "." and never match
// ValidName.
func (s *Store) write(name string, data []byte) error {
	path := filepath.Join(s.dir, name)
	if _, err := os.Stat(path); err == nil {
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("thumbnail: stat: %w", err)
	}

	tmp, err := os.CreateTemp(s.dir, ".tmp-*.jpg")
	if err != nil {
		return fmt.Errorf("thumbnail: create temp file: %w", err)
	}
	tmpPath := tmp.Name()
	ok := false
	defer func() {
		if !ok {
			_ = os.Remove(tmpPath)
		}
	}()

	if _, err := tmp.Write(data); err != nil {
		_ = tmp.Close()
		return fmt.Errorf("thumbnail: write: %w", err)
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return fmt.Errorf("thumbnail: sync: %w", err)
	}
	if err := tmp.Close(); err != nil {
		return fmt.Errorf("thumbnail: close: %w", err)
	}
	if err := os.Chmod(tmpPath, 0o644); err != nil {
		return fmt.Errorf("thumbnail: chmod: %w", err)
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return fmt.Errorf("thumbnail: rename: %w", err)
	}
	ok = true
	return nil
}
