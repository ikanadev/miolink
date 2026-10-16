Status: todo

# 005 — TreeService (GetTree)

Depends on: 001 and 004, for the `Directory` and `Link` proto messages.

## Goal

Implement `miolink.tree.v1.TreeService.GetTree`, which clients use to load
and sync the cached tree. Read "Sync" in `../CLAUDE.md`.

## Scope

- **Protos (`../proto/miolink/tree/v1/tree_service.proto`):**
  `GetTree(known_revision)` returns either `not_modified = true`, or
  `revision` with `repeated miolink.directory.v1.Directory directories` and
  `repeated miolink.link.v1.Link links`. Import the messages from their own
  domains instead of redefining them (see `../proto/README.md`). A `oneof`
  or a bool flag are both fine; document the choice.
- **Queries:** list all directories and all links in a stable order (by id).
  Reuse `GetRevision` from `sync.sql`.
- **Handler (`internal/tree/`):** domain packages don't import each other, so
  this package has its own `convert.go` for directories and links. Use
  `thumbnail.URLPath` for `thumbnail_url`.

## Behaviour

- Read the revision and both lists in **one read transaction**, so the
  snapshot is consistent and the returned revision matches it.
- If `known_revision` equals the current revision → `not_modified` with no
  lists.
- Otherwise return everything, the root directory included (`id` 1, no
  parent). Clients rebuild the nesting from `parent_id` and `directory_id`.
- No pagination. This is an intentional exception to the List convention in
  `../proto/README.md`; say so in the RPC comment.

## Tests

Cover: an empty tree with `known_revision` 0 (just the root), the
`not_modified` case, a stale revision returning the full tree, and the
revision changing after a write but not after `RecordView`.
