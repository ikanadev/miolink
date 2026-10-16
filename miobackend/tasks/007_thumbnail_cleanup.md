Status: todo

# 007 — Remove unused thumbnails

Depends on: 003 and 004.

## Goal

Delete thumbnail files that no link references any more. These are left
behind by deleted links, recursive directory deletes and metadata refreshes.
Several links can share one file, so handlers never delete files themselves.

## Scope

- **Query:** `ListThumbnails :many` returns the distinct non-null
  `links.thumbnail` values.
- **`thumbnail.Cleanup(ctx, referenced func(ctx) ([]string, error))`:**
  - Lists the files in the thumbnails directory.
  - Deletes those that aren't referenced **and** are older than 1 hour.
    The age rule protects a file that `CreateLink` saved before its
    transaction committed.
  - Ignores files that don't match the thumbnail name pattern, and removes
    stale temporary files from interrupted writes.
- **Scheduling:** run it once at startup and then every 24 h from
  `main.go`, stopping when the server shuts down. Log how many files were
  removed with `slog`.
- The `thumbnail` package must not import any domain package. Pass the
  referenced-names function in from `main.go`.

## Tests

Use a temporary directory and fake modification times. Cover: an
unreferenced old file (removed), an unreferenced new file (kept), a
referenced file (kept), an unrelated file name (kept), and a leftover
temporary file (removed).
