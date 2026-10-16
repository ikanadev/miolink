Status: todo

# 003 — Thumbnail storage and serving

Depends on: 002 (`safehttp`).

## Goal

Download a preview image, turn it into a small JPEG stored on disk, and serve
it over HTTP. Read "Link metadata and thumbnails" in `../CLAUDE.md`.

## Before starting: ask the user

Should `GET /thumbnails/{name}` require the API key? Web `<img>` tags can't
send an `Authorization` header, so requiring it means clients must load
images with `fetch` and display the result. The names are content hashes,
but a hash of a public image can be computed by anyone, so they only hide
which images were saved. Implement whichever the user chooses and record the
decision in `../CLAUDE.md`.

## Scope (`internal/thumbnail`)

- **Config:** `MIOLINK_THUMBNAILS_DIR` (default `thumbnails`) in
  `internal/config`, documented in `.env.example`. Create the directory on
  startup if it's missing.
- **`Store.SaveFromURL(ctx, imageURL) (name string, err error)`:**
  - Download with the `safehttp` client, at most about 10 MiB.
  - Check the dimensions with `image.DecodeConfig` before decoding, and
    reject huge images (e.g. above 40 megapixels).
  - Decode JPEG, PNG, GIF and WebP (`golang.org/x/image/webp`). Reject other
    formats; SVG is never accepted.
  - Resize to 400 px wide, keeping the aspect ratio (`golang.org/x/image/draw`),
    without upscaling.
  - Flatten transparency onto white and encode as JPEG, quality about 80.
    Encoding must stay in pure Go: there's no cgo, which is why it's not WebP.
  - Name the file `<sha256 of the JPEG bytes in hex>.jpg`. If a file with
    that name already exists, reuse it. Otherwise write a temporary file and
    rename it, so readers never see a partial file.
- **HTTP handler for `GET /thumbnails/{name}`:**
  - Accept only names matching `^[0-9a-f]{64}\.jpg$`; anything else → 404.
  - Send `Content-Type: image/jpeg`,
    `Cache-Control: public, max-age=31536000, immutable` and
    `X-Content-Type-Options: nosniff`.
  - Mount it in `main.go` inside the same CORS wrapper as the RPCs.
- **`URLPath(name) string`:** builds `/thumbnails/<name>`, the relative path
  that proto messages expose as `thumbnail_url`.

## Tests

Cover: PNG with transparency, JPEG, WebP, an SVG (rejected), an oversized
image, saving the same image twice (one file), and the handler's bad-name,
404, header and body responses.

## Out of scope

Calling this from `CreateLink` (task 004) and deleting unused files
(task 007).
