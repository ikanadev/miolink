Status: todo

# 005 — Browse screen

Depends on: 004.

## Goal

The main screen: show one directory's subdirectories and links from the
cache, navigate the tree, and open links. Read-only except for `RecordView`.

## Scope

- **Libraries:** Coil 3 (`coil-compose`, `coil-network-okhttp`) using the
  app's `OkHttpClient` (set up an `ImageLoader` in `AppContainer`),
  `androidx.browser` for Custom Tabs.
- **`link/LinkRepository`:** start it with `recordView(id)`: call `RecordView`
  and write the returned `views` straight into Room (no revision check; see
  "Data flow and sync").
- **`browse/BrowseViewModel`:** takes a `directoryId`; exposes a `StateFlow`
  of the directory, its path from the root (for the title/breadcrumb), child
  directories and links. A missing directory (deleted on another device)
  navigates up to the nearest existing ancestor.
- **`browse/BrowseScreen`** (stateful `BrowseScreen` + stateless
  `BrowseContent`):
  - Top app bar with the directory name (the root shows "Mio Link") and a
    back arrow outside the root; a settings action at the root.
  - Directories first, then links as `LinkCard`s (thumbnail, title, host).
  - Tapping a directory pushes `Browse(id)`. Tapping a link opens it in a
    Custom Tab and calls `recordView`.
  - Pull-to-refresh calls `TreeRepository.refresh()`. The first load with
    an empty cache shows `LoadingIndicator`. Empty directories show an empty
    state. Sync errors show a snackbar without hiding cached data;
    `UNAUTHENTICATED` offers to open settings.
- **`core/ui/ThumbnailImage`:** Coil `AsyncImage` with a placeholder for links
  without a thumbnail.

## Tests

`BrowseViewModel` with a fake tree source: path building, ordering, and the
missing-directory case. A `BrowseContent` preview for empty, loading and
populated states.
