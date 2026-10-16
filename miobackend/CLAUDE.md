# miobackend

Go backend for miolink, a personal single-user link manager. It exposes Connect
RPC services defined in `../proto` and stores data in SQLite.

Stack: Connect (connectrpc.com/connect), SQLite via `modernc.org/sqlite` (pure
Go, no cgo), golang-migrate for migrations, sqlc for queries.

## Commands

Run from `miobackend/`:

| Command | What it does |
| --- | --- |
| `make generate` | Regenerate protobuf/Connect code (buf, from repo root) and sqlc code |
| `make migration name=<snake_case>` | Create a new numbered up/down migration pair |
| `make run` | Start the server with settings from `.env` |
| `make test` / `make lint` | Run tests / `go vet` + `buf lint` + `buf format` check |
| `make keygen` | Create a new API key and print its `MIOLINK_API_KEY_HASH` value |

sqlc and the migrate CLI live in a separate `tools/go.mod` so their heavy
dependency trees stay out of the app's module. Invoke them through the
Makefile, never with `go get -tool` on the main module.

## Layout

```
cmd/miobackend/main.go   wiring only: config, DB, interceptors, handlers, server
gen/                     buf output; GENERATED, never edit
internal/config/         environment variables
internal/auth/           API key interceptor
internal/database/
  database.go            opens SQLite, applies embedded migrations on startup
  migrations/            golang-migrate files; also sqlc's schema
  queries/               sqlc input, one <domain>.sql per domain
  sqlc/                  sqlc output; GENERATED, never edit
internal/<domain>/       one package per proto domain (health, link, ...)
  handler.go             implements <domain>v1connect.<Domain>ServiceHandler
  convert.go             sqlc model <-> proto message
  handler_test.go
```

## Rules

### Generated code
- Never hand-edit `gen/` or `internal/database/sqlc/`. Change the `.proto`
  file, migration or query and run `make generate`.
- After changing a `.proto` file, follow `../proto/README.md` and run
  `make lint`.

### Domains
- One package per proto domain under `internal/`, named after the domain
  (`internal/link` for `miolink.link.v1`). Domain packages do not import each
  other.
- Each handler asserts its interface:
  `var _ linkv1connect.LinkServiceHandler = (*Handler)(nil)`.
- Handlers call sqlc directly. Don't add service or repository layers up
  front. Extract a `service.go` inside the same package only when a handler's
  logic outgrows it.
- Handlers depend on a narrow `Store` interface listing only the sqlc methods
  they use, not on `*sqlc.Queries`. Use `queries.WithTx(tx)` for transactions.
- `main.go` is the only place that constructs and wires dependencies.

### Conversions
- sqlc models never leave the domain package, and proto messages never reach
  sqlc. Map between them in that domain's `convert.go` with
  `toProto<Type>` / `from<Type>Request` style functions.
- Times are `google.protobuf.Timestamp` in protos and are stored in SQLite as
  UTC.

### Errors
- Handlers return `connect.NewError` with a precise code:
  `sql.ErrNoRows` -> `CodeNotFound`, invalid input -> `CodeInvalidArgument`,
  unique constraint violations -> `CodeAlreadyExists`, anything else ->
  `CodeInternal`.
- Don't leak SQL or internal error text to clients for `CodeInternal`; log it
  with `slog` and return a generic message.

### Database
- Schema changes only through new migrations (`make migration`). Never edit a
  migration that has been committed; add a new one.
- Every migration has a working `.down.sql`.
- Queries go in `internal/database/queries/<domain>.sql` with
  `-- name: <Verb><Noun> :one|:many|:exec` annotations.
- SQLite runs with a single connection, WAL and `foreign_keys` on (see
  `database.go`). Don't raise `SetMaxOpenConns`.

### Auth and configuration
- Every RPC is authenticated by `internal/auth` through
  `connect.WithInterceptors`. Pass the shared `interceptors` option to every
  new handler in `main.go`; no RPC is public.
- Configuration comes only from `MIOLINK_*` environment variables, loaded in
  `internal/config`. Document every new variable in `.env.example`.
- There is one API key shared by all clients. The server only knows its
  SHA-256 hash (`MIOLINK_API_KEY_HASH`). Never store, log or commit the
  plaintext key; `.env` and `*.db` files are gitignored.
- Don't reintroduce per-device keys or user accounts; this is a deliberate
  single-user design. Rotating the key means `make keygen`, updating the
  hash, and re-entering the key on every client.

### Tests
- Test handlers with a fake `Store` or an in-memory SQLite database opened
  through `database.Open(":memory:")`-style helpers; no network or external
  services.
