Status: todo

# 006 — Create, rename, move and delete directories

Depends on: 005.

## Goal

All directory writes, applied through the revision protocol.

## Scope

- **`directory/DirectoryRepository`:** `create(parentId, name)`,
  `rename(id, name)`, `move(id, newParentId)`, `delete(id)`. Each calls the
  RPC and then `TreeRepository.applyWrite` with the matching local change
  (insert/update the returned `Directory`, or delete by id and let the
  cascade remove the subtree).
- **Validation before sending,** mirroring the backend: 1–255 characters, no
  `/`, not `.` or `..`. `ALREADY_EXISTS` and `INVALID_ARGUMENT` from the server
  are shown under the name field.
- **`directory/components/`:** `NewDirectoryDialog` and
  `RenameDirectoryDialog`.
- **`core/ui/DirectoryPicker`:** a tree of all directories, used to move
  directories here and links in 007 (it lives in `core` because `directory`
  and `link` can't import each other). It takes the directory list and an
  optional subtree to disable; moving a directory disables the directory
  itself and its descendants, since the server rejects cycles.
- **`browse/`:**
  - A `FloatingActionButtonMenu` with "New directory" (and "New link", wired
    in 007).
  - Long press (or an overflow menu) on a directory: rename, move, delete.
    Delete shows `ConfirmDeleteDialog` (in `core/ui/`) saying how many
    subdirectories and links will be deleted with it, counted from the cache.
  - The root has none of these actions.

## Tests

Repository against in-memory Room and a fake `DirectoryServiceClient`: each
write applied locally when revisions match and refreshed when they don't;
delete removes the subtree. Name validation cases. Picker exclusion of
descendants.
