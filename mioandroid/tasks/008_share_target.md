Status: todo

# 008 — Save links from the share sheet

Depends on: 007.

## Goal

Make sharing a URL from any app (browser, YouTube, ...) to Mio Link the main
way to save links.

## Scope

- **Manifest:** an `ACTION_SEND` intent filter for `text/plain` on
  `MainActivity` (`launchMode="singleTask"` or handle `onNewIntent`, so a share
  while the app is open reuses it).
- **Extracting the URL:** take `EXTRA_TEXT` and find the first `http(s)` URL in
  it (apps often share "Title https://..."); ignore shares without one, with
  a toast.
- **Flow:** open `AddLinkSheet` prefilled with the URL and the root directory
  selected, with a way to pick another directory (`DirectoryPicker`) before
  saving. On success go to `LinkEdit(id)`; back from there returns to the app
  that shared, not into Mio Link's back stack.
- If settings aren't configured yet, open `Settings` first and continue with
  the share after saving.

## Tests

URL extraction cases (plain URL, text with a URL, several URLs, none). A
Robolectric test that launching `MainActivity` with a share intent shows the
sheet with the URL.
