// Command miobackend runs the miolink API server.
//
// This is the only place that wires dependencies together: configuration,
// database, interceptors and handlers.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"connectrpc.com/connect"
	connectcors "connectrpc.com/cors"
	"github.com/rs/cors"

	"miobackend/gen/miolink/directory/v1/directoryv1connect"
	"miobackend/gen/miolink/health/v1/healthv1connect"
	"miobackend/gen/miolink/link/v1/linkv1connect"
	"miobackend/gen/miolink/tree/v1/treev1connect"
	"miobackend/internal/auth"
	"miobackend/internal/config"
	"miobackend/internal/database"
	"miobackend/internal/directory"
	"miobackend/internal/health"
	"miobackend/internal/link"
	"miobackend/internal/linkmeta"
	"miobackend/internal/safehttp"
	"miobackend/internal/thumbnail"
	"miobackend/internal/tree"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	db, err := database.Open(cfg.DatabasePath)
	if err != nil {
		return err
	}
	defer db.Close()

	// Page and image fetches only reach public addresses.
	fetchClient := safehttp.NewClient(safehttp.Options{})
	thumbnails, err := thumbnail.NewStore(cfg.ThumbnailsDir, fetchClient)
	if err != nil {
		return err
	}

	interceptors := connect.WithInterceptors(auth.NewInterceptor(cfg.APIKeyHash))

	mux := http.NewServeMux()
	mux.Handle(healthv1connect.NewHealthServiceHandler(health.NewHandler(), interceptors))
	mux.Handle(treev1connect.NewTreeServiceHandler(tree.NewHandler(db), interceptors))
	mux.Handle(directoryv1connect.NewDirectoryServiceHandler(directory.NewHandler(db), interceptors))
	mux.Handle(linkv1connect.NewLinkServiceHandler(link.NewHandler(db, linkmeta.New(fetchClient), thumbnails), interceptors))
	// Public on purpose (no API key): see "Link metadata and thumbnails" in CLAUDE.md.
	mux.Handle(thumbnail.Pattern, thumbnails.Handler())

	// Connect over HTTP/1.1 and HTTP/2; unencrypted HTTP/2 (h2c) is for gRPC clients
	// when TLS is terminated by a reverse proxy.
	protocols := new(http.Protocols)
	protocols.SetHTTP1(true)
	protocols.SetUnencryptedHTTP2(true)

	server := &http.Server{
		Addr:              cfg.Addr,
		Handler:           withCORS(mux, cfg.CORSOrigins),
		Protocols:         protocols,
		ReadHeaderTimeout: 5 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	errc := make(chan error, 1)
	go func() {
		slog.Info("listening", "addr", cfg.Addr, "database", cfg.DatabasePath)
		errc <- server.ListenAndServe()
	}()

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// withCORS allows the web app's origins to call the API from the browser.
func withCORS(h http.Handler, origins []string) http.Handler {
	if len(origins) == 0 {
		return h
	}
	return cors.New(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: connectcors.AllowedMethods(),
		AllowedHeaders: append(connectcors.AllowedHeaders(), "Authorization"),
		ExposedHeaders: connectcors.ExposedHeaders(),
		MaxAge:         7200,
	}).Handler(h)
}
