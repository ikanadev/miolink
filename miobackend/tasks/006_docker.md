Status: todo

# 006 — Docker image and compose file

Depends on: 003 (for `MIOLINK_THUMBNAILS_DIR`).

## Goal

Run the backend in Docker, with the database and thumbnails in a mounted
volume.

## Scope (in `miobackend/`)

- **`Dockerfile`:**
  - Multi-stage. The build stage uses `golang:<version from go.mod>`.
  - Build with `CGO_ENABLED=0` and `GOWORK=off`. The generated code is
    committed, so buf and sqlc aren't needed in the image.
  - The final stage is `gcr.io/distroless/static:nonroot`. It includes CA
    certificates, which outbound HTTPS fetches need.
- **`.dockerignore`:** exclude `.env`, `*.db*`, `bin/`, `tasks/` and the
  local thumbnails directory.
- **`compose.yaml`:**
  - One service with a named volume mounted at `/data`.
  - Set `MIOLINK_DATABASE_PATH=/data/miolink.db` and
    `MIOLINK_THUMBNAILS_DIR=/data/thumbnails`.
  - Read `MIOLINK_API_KEY_HASH` and `MIOLINK_CORS_ORIGINS` from `.env`.
  - Publish port 8080.
- The `nonroot` user must be able to write to `/data`. Check that it works
  with a fresh named volume.
- **Makefile:** add `docker-build` and `docker-up` targets. Mention them in
  the Commands table in `../CLAUDE.md`.

## Done when

`docker compose up` starts the server, `Ping` works with the API key, and
the database and thumbnails survive `docker compose down` followed by `up`.
Note that `down -v` deletes them.
