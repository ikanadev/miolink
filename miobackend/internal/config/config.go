// Package config loads the server configuration from environment variables.
package config

import (
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"
)

// Config is the server configuration.
type Config struct {
	// Addr is the address the HTTP server listens on.
	Addr string
	// DatabasePath is the path to the SQLite database file.
	DatabasePath string
	// APIKeyHash is the SHA-256 hash of the API key shared by all clients.
	// Only the hash is configured; the key itself never reaches the server.
	APIKeyHash [32]byte
	// CORSOrigins are the browser origins allowed to call the API.
	CORSOrigins []string
	// ThumbnailsDir is the directory thumbnails are stored in.
	ThumbnailsDir string
}

// Load reads the configuration from the environment.
//
//	MIOLINK_ADDR           listen address (default ":8080")
//	MIOLINK_DATABASE_PATH  SQLite file path (default "miolink.db")
//	MIOLINK_API_KEY_HASH   required; SHA-256 of the API key, 64 hex characters
//	MIOLINK_CORS_ORIGINS   optional; comma-separated allowed origins
//	MIOLINK_THUMBNAILS_DIR thumbnail directory (default "thumbnails")
func Load() (Config, error) {
	hash, err := parseHash(os.Getenv("MIOLINK_API_KEY_HASH"))
	if err != nil {
		return Config{}, fmt.Errorf("MIOLINK_API_KEY_HASH: %w", err)
	}

	return Config{
		Addr:          getenv("MIOLINK_ADDR", ":8080"),
		DatabasePath:  getenv("MIOLINK_DATABASE_PATH", "miolink.db"),
		APIKeyHash:    hash,
		CORSOrigins:   splitList(os.Getenv("MIOLINK_CORS_ORIGINS")),
		ThumbnailsDir: getenv("MIOLINK_THUMBNAILS_DIR", "thumbnails"),
	}, nil
}

func parseHash(raw string) ([32]byte, error) {
	var hash [32]byte
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return hash, errors.New("required; generate one with: make keygen")
	}
	decoded, err := hex.DecodeString(raw)
	if err != nil || len(decoded) != len(hash) {
		return hash, errors.New("must be a SHA-256 hash (64 hex characters)")
	}
	copy(hash[:], decoded)
	return hash, nil
}

func getenv(name, fallback string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return fallback
}

func splitList(raw string) []string {
	var out []string
	for part := range strings.SplitSeq(raw, ",") {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}
