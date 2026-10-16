// Package health implements miolink.health.v1.HealthService.
package health

import (
	"context"

	healthv1 "miobackend/gen/miolink/health/v1"
	"miobackend/gen/miolink/health/v1/healthv1connect"
)

// Handler implements healthv1connect.HealthServiceHandler.
type Handler struct{}

var _ healthv1connect.HealthServiceHandler = (*Handler)(nil)

// NewHandler returns a HealthService handler.
func NewHandler() *Handler {
	return &Handler{}
}

// Ping succeeds whenever the request reaches it; authentication is done by the interceptor.
func (h *Handler) Ping(context.Context, *healthv1.PingRequest) (*healthv1.PingResponse, error) {
	return &healthv1.PingResponse{}, nil
}
