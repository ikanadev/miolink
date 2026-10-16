Status: done

# 002 — Safe HTTP fetching and link metadata

Depends on: nothing.

## Goal

Build the two non-domain packages the server uses to read a web page's title
and preview image. There are no RPCs in this task. Read "Link metadata and
thumbnails" in `../CLAUDE.md`.

## Scope

### `internal/safehttp`

An `*http.Client` constructor for fetching URLs the user supplies.

- Refuses connections to loopback, private (RFC 1918, ULA), link-local,
  CGNAT, multicast and unspecified addresses, IPv4 and IPv6. Check the
  resolved IP in the dialer's `Control` hook, not the host name, so that
  redirects and DNS rebinding are covered too.
- Only `http` and `https`, at most 5 redirects, an overall timeout of about
  10 s, and a fixed `User-Agent`.
- An option to allow loopback, for tests with `httptest`. Never enable it
  in production.

### `internal/linkmeta`

`Fetch(ctx, url) (Metadata, error)`, where `Metadata` holds `Title` and
`ImageURL`.

- Read at most about 2 MiB of the body, and only for `text/html`. Respect
  the page's charset (`golang.org/x/net/html/charset`).
- Parse with `golang.org/x/net/html`. For the title, prefer `og:title`, then
  `twitter:title`, then `<title>`. For the image, prefer `og:image`, then
  `twitter:image`. Resolve relative image URLs against the final URL after
  redirects.
- Clean the title: collapse whitespace and trim, then cut it to 500
  characters (the schema limit).
- A separate `FallbackTitle(url)` returns the URL's hostname. Callers use it
  when `Fetch` fails or finds no title.

## Tests

Use `httptest` servers with the loopback option. Cover: OG tags, `<title>`
only, a relative `og:image`, a non-HTML response, an oversized body, and a
non-UTF-8 charset. Separately, check that the default client refuses
`127.0.0.1`, `10.x`, `169.254.x` and `[::1]`.

## Out of scope

Downloading or storing images (task 003) and calling this from an RPC
(task 004).
