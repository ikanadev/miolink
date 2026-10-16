# miobackend

Go backend for miolink, a personal single-user link manager. It exposes Connect
RPC services defined in `../proto` and stores data in SQLite.

Stack: Connect (connectrpc.com/connect), SQLite via `modernc.org/sqlite` (pure
Go, no cgo), golang-migrate for migrations, sqlc for queries.

The clients (`../mioandroid`, `../mioweb`) are separate projects that consume
the same protos. They keep a cached copy of the whole tree and sync it as
described below.

## Domain model

The schema is in `internal/database/migrations/000001_*.up.sql`.

- **Directories** form a tree, like a Linux filesystem, nested to any depth.
  A hidden root directory with `id = 1` always exists and is the only one
  without a parent. It can't be renamed, moved or deleted.
- Directory names follow Linux rules: 1-255 characters, no `/`, not `.` or
  `..`, unique among siblings (case-sensitive). The root's name is empty.
- **Links** have `id`, `directory_id`, `title`, `url`, `thumbnail`, `views` and
  `created_at`. Every link belongs to exactly one directory (the root if the
  user picks nothing). Duplicate titles and URLs are allowed.
- **Deletes are always recursive.** Deleting a directory removes its
  subdirectories and links (`ON DELETE CASCADE`); clients show a confirm
  dialog first.
- **Moves must not create cycles.** SQLite can't enforce this, so the move
  handler checks that the target isn't the directory itself or one of its
  descendants.
- IDs are `INTEGER PRIMARY KEY` (`int64`). Timestamps are `INTEGER` unix
  milliseconds, UTC.

## Sync

Clients cache the whole tree and only refetch it when it changed.

- `sync_state` is a single-row table (`id = 1`) holding the tree `revision`,
  an `int64` that starts at 1. Triggers bump it on every change to
  directories and links. They don't bump it for changes to `views`, so
  opening a link doesn't make every client refetch.
- `GetTree(known_revision)` returns `not_modified` (a bool flag, plus the
  current revision) when the client is
  current, or the full tree as flat lists with the new revision. Clients with
  no cache send 0. The tree is never paginated.
- Every write RPC returns `previous_revision` and `revision`, both read inside
  the write's transaction. If `previous_revision` equals the client's cached
  revision, the client applies the change locally. Otherwise another device
  changed something, and the client calls `GetTree`. A single write can bump
  the revision by more than 1 (a recursive delete bumps it once per row).

## Link metadata and thumbnails

- `CreateLink` only takes `directory_id` and `url`. The server fetches the
  page, reads its title and preview image, and stores the link. If the fetch
  fails, the title falls back to the URL's hostname and there is no
  thumbnail. The client then opens its edit screen so the user can change the
  title.
- The server fetches only public addresses (no loopback, private or link-local
  IPs, checked at dial time), with timeouts and size limits.
- Thumbnails are copied, never hotlinked. They are resized, re-encoded as JPEG
  (pure Go, no cgo) and stored under `MIOLINK_THUMBNAILS_DIR` (a Docker
  volume in production). Each file is named by the SHA-256 of its content.
  `links.thumbnail` holds that file name.
- `GET /thumbnails/{name}` is a plain HTTP route, not Connect. It serves the
  files with `Cache-Control: public, max-age=31536000, immutable`. Proto
  messages expose `thumbnail_url` as a path relative to the API base URL.
- `GET /thumbnails/{name}` is **public**: it doesn't require the API key.
  Web `<img>` tags can't send an `Authorization` header, and the names only
  hide which images were saved (a hash of a public image can be computed by
  anyone), so protecting them isn't worth making clients load images through
  `fetch`. The handler accepts only names matching `^[0-9a-f]{64}\.jpg$`
  (anything else is a 404, before touching the filesystem), so it can't
  reach other files. Stored images are re-encoded copies of public images;
  nothing private is served.
- Several links can share a file, so deleting a link never deletes its
  thumbnail directly. A cleanup (`thumbnail.Store.RunCleanup`, started in
  `main.go` at startup and then every 24 h) removes unreferenced files and
  stale `.tmp-*` files older than 1 hour; the age rule protects a file saved
  before its `CreateLink` transaction committed. It never touches other
  names in the directory.

## API overview

| Service | RPCs |
| --- | --- |
| `miolink.health.v1.HealthService` | `Ping` |
| `miolink.tree.v1.TreeService` | `GetTree` |
| `miolink.directory.v1.DirectoryService` | `CreateDirectory`, `RenameDirectory`, `MoveDirectory`, `DeleteDirectory` |
| `miolink.link.v1.LinkService` | `CreateLink`, `UpdateLink`, `MoveLink`, `DeleteLink`, `RecordView`, `RefreshLinkMetadata` |

`../proto/README.md` has the proto conventions. Work that hasn't been built
yet is described in `tasks/`.

## Tasks

`tasks/NNN_<name>.md` files each describe one unit of work, sized for one
session. Each one lists its dependencies; finish those first. A task file
starts with a `Status:` line. Set it to `done` in the commit that completes
the task. If the work changes a decision recorded in this file, update this
file too.

## Commands

Run from `miobackend/`:

| Command | What it does |
| --- | --- |
| `make generate` | Regenerate protobuf/Connect code (buf, from repo root) and sqlc code |
| `make migration name=<snake_case>` | Create a new numbered up/down migration pair |
| `make run` | Start the server with settings from `.env` |
| `make test` / `make lint` | Run tests / `go vet` + `buf lint` + `buf format` check |
| `make keygen` | Create a new API key and print its `MIOLINK_API_KEY_HASH` value |
| `make docker-build` | Build the `miobackend` Docker image (`DOCKER=podman` to use Podman) |
| `make docker-up` | Build and start the server with `docker compose`; data lives in the `data` volume at `/data` (`down -v` deletes it) |

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
internal/safehttp/       HTTP client that only reaches public addresses
internal/linkmeta/       fetches a page's title and preview image URL
internal/thumbnail/      thumbnail processing, storage, HTTP route, cleanup
internal/<domain>/       one package per proto domain (health, tree, directory, link)
  handler.go             implements <domain>v1connect.<Domain>ServiceHandler
  convert.go             sqlc model <-> proto message
  handler_test.go
tasks/                   NNN_<name>.md work items, one per session
Dockerfile               multi-stage build, distroless/static:nonroot runtime
compose.yaml             one service, named volume at /data, secrets from .env
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
  other. They may import the non-domain packages (`safehttp`, `linkmeta`,
  `thumbnail`), which never import domain packages.
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
  `INTEGER` unix milliseconds, UTC.

### Errors
- Handlers return `connect.NewError` with a precise code:
  `sql.ErrNoRows` -> `CodeNotFound`, invalid input -> `CodeInvalidArgument`,
  unique constraint violations -> `CodeAlreadyExists` (detect them with
  `database.IsUniqueViolation`), anything else -> `CodeInternal`.
- Don't leak SQL or internal error text to clients for `CodeInternal`; log it
  with `slog` and return a generic message.

### Database
- Schema changes only through new migrations (`make migration`). Never edit a
  migration that has been committed; add a new one.
- Every migration has a working `.down.sql`.
- Queries go in `internal/database/queries/<domain>.sql` with
  `-- name: <Verb><Noun> :one|:many|:exec` annotations. Queries shared by
  domains, such as reading the sync revision, go in `sync.sql`.
- Write RPCs run in one transaction: read the revision, apply the change,
  read the revision again, commit. The triggers do the bumping; handlers
  never update `sync_state`.
- SQLite runs with a single connection, WAL and `foreign_keys` on (see
  `database.go`). Don't raise `SetMaxOpenConns`.

### Auth and configuration
- Every RPC is authenticated by `internal/auth` through
  `connect.WithInterceptors`. Pass the shared `interceptors` option to every
  new handler in `main.go`; no RPC is public. The one deliberate exception
  is `GET /thumbnails/{name}`, a plain HTTP route rather than an RPC (see
  "Link metadata and thumbnails"). Don't add other unauthenticated routes.
- Configuration comes only from `MIOLINK_*` environment variables, loaded in
  `internal/config`. Document every new variable in `.env.example`.
- There is one API key shared by all clients. The server only knows its
  SHA-256 hash (`MIOLINK_API_KEY_HASH`). Never store, log or commit the
  plaintext key; `.env`, `*.db` files and `/thumbnails/` are gitignored.
- Don't reintroduce per-device keys or user accounts; this is a deliberate
  single-user design. Rotating the key means `make keygen`, updating the
  hash, and re-entering the key on every client.

### Tests
- Test handlers with a fake `Store` or an in-memory SQLite database opened
  through `database.Open(":memory:")`-style helpers; no network or external
  services.
