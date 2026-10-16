Status: todo

# 001 — DirectoryService

Depends on: nothing.

## Goal

Implement `miolink.directory.v1.DirectoryService` so clients can create,
rename, move and delete directories. Read the "Domain model" and "Sync"
sections of `../CLAUDE.md` first.

## Scope

### Protos (`../proto/miolink/directory/v1/`)

- `directory.proto`: a `Directory` message with `id`, `parent_id`, `name`
  and `created_at` (`google.protobuf.Timestamp`). The root (id 1) has no
  parent: make `parent_id` `optional` (or document that 0 means none).
- `directory_service.proto` with these RPCs, each with its own request and
  response message:
  - `CreateDirectory(parent_id, name)` → `directory`, `previous_revision`, `revision`
  - `RenameDirectory(id, name)` → `directory`, `previous_revision`, `revision`
  - `MoveDirectory(id, new_parent_id)` → `directory`, `previous_revision`, `revision`
  - `DeleteDirectory(id)` → `previous_revision`, `revision`
- Follow `../proto/README.md`, document every message and field, then run
  `make generate` and `make lint`.

### Queries

- `internal/database/queries/sync.sql`: `GetRevision :one` (create it if
  another task hasn't already). Other domains reuse it.
- `internal/database/queries/directories.sql`: insert, get by id, rename,
  move, delete, and the ancestor check below.

### Handler (`internal/directory/`)

- `handler.go`, `convert.go` and `handler_test.go`, following the rules in
  `../CLAUDE.md`. Wire it in `cmd/miobackend/main.go` with the shared
  `interceptors`.

## Behaviour

- Every write runs in one transaction: `GetRevision`, then the change, then
  `GetRevision`. Both values go in the response.
- Validate names in the handler with the same rules as the schema (1-255
  characters, no `/`, not `.` or `..`) and return `CodeInvalidArgument`. The
  `CHECK` constraints remain as a backstop.
- Sibling name conflict → `CodeAlreadyExists`.
- Unknown `id` or parent → `CodeNotFound`.
- The root (id 1) can't be renamed, moved or deleted → `CodeInvalidArgument`.
- `MoveDirectory` rejects moving a directory into itself or any of its
  descendants (`CodeInvalidArgument`). Check this inside the transaction with
  a recursive CTE that walks up from `new_parent_id` and looks for `id`.
  SQLite doesn't allow CTEs inside triggers, so this check has to live in the
  handler.
- Moving to the current parent is allowed. It changes nothing and doesn't
  bump the revision.
- `DeleteDirectory` is always recursive; the cascade does the work.
- Use `created_at = now` in unix ms, UTC.

## Tests

Use a real SQLite database via `database.Open` (a temporary file or
`:memory:`). Cover: creating nested directories, a duplicate sibling name,
invalid names, every operation on the root, moving into a descendant,
recursive delete (the links go too), and that `previous_revision` and
`revision` are correct.

## Out of scope

Listing directories. That's `GetTree` (task 005).
