Status: done

# 007 — Create, edit, move and delete links

Depends on: 006.

## Goal

All link writes, and the edit screen the user lands on after adding a link.

## Scope

- **`link/LinkRepository`:** `create(directoryId, url)`, `updateTitle(id,
  title)`, `move(id, directoryId)`, `delete(id)`, `refreshMetadata(id)`, each
  through `TreeRepository.applyWrite`. `create` returns the new link id.
- **`link/components/AddLinkSheet`:** a modal bottom sheet with a URL field
  (prefilled from the clipboard when it holds a URL). `CreateLink` can take a
  few seconds while the server fetches the page; show a `LoadingIndicator` in
  the button and keep the sheet open until it finishes. On success navigate
  to `LinkEdit(id)`.
- **`link/LinkEditScreen`:** thumbnail, editable title, URL (read-only, with
  open and copy actions), directory with a "Move" action using
  `core/ui/DirectoryPicker`, "Refresh metadata", and delete with
  confirmation. Save sends `UpdateLink` only if
  the title changed.
- **`browse/`:** wire "New link" in the FAB menu to `AddLinkSheet` for the
  current directory; long press on a link: edit, move, delete.

## Tests

Repository against in-memory Room and a fake `LinkServiceClient` for each
write (matching and stale revisions). `LinkEditViewModel`: only changed
titles are saved; a link deleted elsewhere closes the screen.
