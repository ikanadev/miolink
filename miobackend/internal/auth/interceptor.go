// Package auth authenticates requests with a single shared API key.
package auth

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"errors"
	"net/http"
	"strings"

	"connectrpc.com/connect"
)

var errUnauthenticated = errors.New("invalid or missing API key")

// Interceptor rejects any request without a valid "Authorization: Bearer <key>" header.
// It covers both unary and streaming handlers, so new RPCs are protected by default.
type Interceptor struct {
	keyHash [32]byte
}

// NewInterceptor returns an Interceptor that accepts the key whose SHA-256 hash is keyHash.
func NewInterceptor(keyHash [32]byte) *Interceptor {
	return &Interceptor{keyHash: keyHash}
}

var _ connect.Interceptor = (*Interceptor)(nil)

func (i *Interceptor) WrapUnary(next connect.UnaryFunc) connect.UnaryFunc {
	return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
		if req.Spec().IsClient {
			return next(ctx, req)
		}
		if err := i.authenticate(req.Header()); err != nil {
			return nil, err
		}
		return next(ctx, req)
	}
}

func (i *Interceptor) WrapStreamingClient(next connect.StreamingClientFunc) connect.StreamingClientFunc {
	return next
}

func (i *Interceptor) WrapStreamingHandler(next connect.StreamingHandlerFunc) connect.StreamingHandlerFunc {
	return func(ctx context.Context, conn connect.StreamingHandlerConn) error {
		if err := i.authenticate(conn.RequestHeader()); err != nil {
			return err
		}
		return next(ctx, conn)
	}
}

func (i *Interceptor) authenticate(header http.Header) error {
	token, ok := strings.CutPrefix(header.Get("Authorization"), "Bearer ")
	if !ok || token == "" {
		return connect.NewError(connect.CodeUnauthenticated, errUnauthenticated)
	}

	hash := sha256.Sum256([]byte(token))
	if subtle.ConstantTimeCompare(hash[:], i.keyHash[:]) != 1 {
		return connect.NewError(connect.CodeUnauthenticated, errUnauthenticated)
	}
	return nil
}
