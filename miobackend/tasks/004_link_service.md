Status: todo

# 004 — LinkService

Depends on: 002 and 003. If 001 is done, reuse its `sync.sql`; otherwise
create it.

## Goal

Implement `miolink.link.v1.LinkService`. Read "Domain model", "Sync" and
"Link metadata and thumbnails" in `../CLAUDE.md`.

## Scope

### Protos (`../proto/miolink/link/v1/`)

- `link.proto`: a `Link` message with `id`, `directory_id`, `title`, `url`,
  `thumbnail_url` (empty when there's none), `views` and `created_at`
  (`google.protobuf.Timestamp`).
- `link_service.proto`, each RPC with its own request and response:
  - `CreateLink(directory_id, url)` → `link`, `previous_revision`, `revision`
  - `UpdateLink(id, title)` → `link`, `previous_revision`, `revision`
  - `MoveLink(id, directory_id)` → `link`, `previous_revision`, `revision`
  - `DeleteLink(id)` → `previous_revision`, `revision`
  - `RecordView(id)` → `views` (the revision doesn't change)
  - `RefreshLinkMetadata(id)` → `link`, `previous_revision`, `revision`
- Run `make generate` and `make lint`.

### Queries and handler

- Queries in `internal/database/queries/links.sql`.
- Handler in `internal/link/` with `handler.go`, `convert.go` and tests.
- The handler's dependencies are a narrow `Store`, a metadata fetcher and a
  thumbnail saver. Make the last two interfaces so tests can use fakes.
- Wire it in `main.go` with the shared `interceptors`.

## Behaviour

- **URL validation:** an absolute `http` or `https` URL with a host, at most
  2048 characters, trimmed. Otherwise → `CodeInvalidArgument`.
- **`CreateLink`:**
  1. Fetch the metadata and save the thumbnail **before** opening the
     transaction, so slow network calls never hold the single SQLite
     connection.
  2. If the title is missing, use `linkmeta.FallbackTitle`. If the image
     fails, store no thumbnail. The link is created either way; a metadata
     failure is never an error for the client.
  3. Insert inside the revision transaction.
- **`UpdateLink`:** title of 1-500 characters after trimming.
- **`MoveLink`, `UpdateLink`, `DeleteLink`:** unknown link → `CodeNotFound`.
  An unknown target directory → `CodeNotFound`.
- **`RecordView`:** `UPDATE … SET views = views + 1 … RETURNING views`,
  without the revision dance.
- **`RefreshLinkMetadata`:** re-fetches and updates the title and thumbnail,
  network first, then the transaction. This overwrites a title the user
  edited, which is expected because the user asked for a refresh.
- `created_at` is now in unix ms, UTC.

## Tests

Use fake fetcher and saver implementations; no network. Cover: a create that
succeeds, a create whose metadata fails (hostname title, no thumbnail), an
invalid URL, an unknown directory, update, move, delete, that `RecordView`
doesn't change the revision, and the revision values on writes.

## Out of scope

Listing links (task 005) and cleaning up thumbnails (task 007).
