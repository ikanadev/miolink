# Build stage. The generated code (gen/, internal/database/sqlc/) is committed,
# so buf and sqlc aren't needed here.
FROM docker.io/library/golang:1.27.2 AS build
WORKDIR /src
ENV CGO_ENABLED=0 GOWORK=off
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -trimpath -ldflags="-s -w" -o /out/miobackend ./cmd/miobackend
# /data is the volume mount point. A fresh named volume copies the ownership
# of this directory, so the nonroot user (65532) can write to it.
RUN mkdir -p /out/data && chown 65532:65532 /out/data

# Final stage: static binary on distroless (includes CA certificates).
FROM gcr.io/distroless/static:nonroot
COPY --from=build /out/miobackend /miobackend
COPY --from=build --chown=65532:65532 /out/data /data
# Container-internal settings; ../compose.yaml doesn't repeat them. It maps
# its host port to 8080 and mounts the data volume at /data, so changing
# these means changing those too.
ENV MIOLINK_ADDR=:8080 \
    MIOLINK_DATABASE_PATH=/data/miolink.db \
    MIOLINK_THUMBNAILS_DIR=/data/thumbnails
VOLUME /data
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/miobackend"]
