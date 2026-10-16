// Package linkmeta reads a web page's title and preview image URL.
package linkmeta

import (
	"context"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"strings"
	"unicode/utf8"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"golang.org/x/net/html/charset"
)

const (
	// MaxBodyBytes is how much of a page's body is read. Anything after it is
	// ignored; the metadata normally sits in <head>.
	MaxBodyBytes = 2 << 20

	// MaxTitleLength is the maximum title length in characters, matching the
	// links.title column.
	MaxTitleLength = 500
)

// Metadata is what Fetch finds in a page. Fields are empty when the page
// doesn't provide them.
type Metadata struct {
	Title    string
	ImageURL string
}

// Fetcher fetches pages with an HTTP client. Use a safehttp client.
type Fetcher struct {
	client *http.Client
}

// New returns a Fetcher that uses client.
func New(client *http.Client) *Fetcher {
	return &Fetcher{client: client}
}

// Fetch downloads rawURL and extracts its metadata. Responses that aren't
// text/html yield empty Metadata and no error. Non-2xx responses and
// transport failures are errors. Callers use FallbackTitle when Fetch fails or
// Title is empty.
func (f *Fetcher) Fetch(ctx context.Context, rawURL string) (Metadata, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return Metadata{}, fmt.Errorf("linkmeta: parse url: %w", err)
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return Metadata{}, fmt.Errorf("linkmeta: unsupported scheme %q", u.Scheme)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return Metadata{}, fmt.Errorf("linkmeta: new request: %w", err)
	}
	req.Header.Set("Accept", "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1")

	resp, err := f.client.Do(req)
	if err != nil {
		return Metadata{}, fmt.Errorf("linkmeta: fetch: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return Metadata{}, fmt.Errorf("linkmeta: unexpected status %d", resp.StatusCode)
	}

	contentType := resp.Header.Get("Content-Type")
	if mediaType, _, err := mime.ParseMediaType(contentType); err != nil || mediaType != "text/html" {
		return Metadata{}, nil
	}

	body, err := charset.NewReader(io.LimitReader(resp.Body, MaxBodyBytes), contentType)
	if err != nil {
		return Metadata{}, fmt.Errorf("linkmeta: charset: %w", err)
	}
	doc, err := html.Parse(body)
	if err != nil {
		return Metadata{}, fmt.Errorf("linkmeta: parse html: %w", err)
	}

	return extract(doc, resp.Request.URL), nil
}

// extract picks the metadata out of a parsed document. pageURL is the final
// URL after redirects and resolves relative image URLs.
func extract(doc *html.Node, pageURL *url.URL) Metadata {
	meta := map[string]string{} // first content per lower-cased property/name
	var titleText, baseHref string
	haveTitle, haveBase := false, false

	for n := range doc.Descendants() {
		if n.Type != html.ElementNode {
			continue
		}
		switch n.DataAtom {
		case atom.Meta:
			key := strings.ToLower(strings.TrimSpace(attr(n, "property")))
			if key == "" {
				key = strings.ToLower(strings.TrimSpace(attr(n, "name")))
			}
			if key == "" {
				continue
			}
			if content := strings.TrimSpace(attr(n, "content")); content != "" {
				if _, ok := meta[key]; !ok {
					meta[key] = content
				}
			}
		case atom.Title:
			// Skip <title> inside <svg>, which is an SVG element.
			if !haveTitle && n.Namespace == "" {
				titleText = textContent(n)
				haveTitle = true
			}
		case atom.Base:
			if !haveBase {
				baseHref = attr(n, "href")
				haveBase = true
			}
		}
	}

	var m Metadata
	for _, t := range []string{meta["og:title"], meta["twitter:title"], titleText} {
		if t = CleanTitle(t); t != "" {
			m.Title = t
			break
		}
	}

	base := pageURL
	if baseHref != "" {
		if b, err := pageURL.Parse(strings.TrimSpace(baseHref)); err == nil {
			base = b
		}
	}
	for _, img := range []string{meta["og:image"], meta["og:image:url"], meta["og:image:secure_url"], meta["twitter:image"], meta["twitter:image:src"]} {
		if resolved := resolve(base, img); resolved != "" {
			m.ImageURL = resolved
			break
		}
	}
	return m
}

// resolve returns ref resolved against base, or "" if it isn't a valid
// http(s) URL.
func resolve(base *url.URL, ref string) string {
	ref = strings.TrimSpace(ref)
	if ref == "" {
		return ""
	}
	u, err := base.Parse(ref)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return ""
	}
	return u.String()
}

// CleanTitle collapses whitespace, trims, and cuts s to MaxTitleLength
// characters.
func CleanTitle(s string) string {
	s = strings.Join(strings.Fields(strings.ToValidUTF8(s, "")), " ")
	if utf8.RuneCountInString(s) > MaxTitleLength {
		s = strings.TrimSpace(string([]rune(s)[:MaxTitleLength]))
	}
	return s
}

// FallbackTitle returns the URL's hostname, for when Fetch fails or finds no
// title. If there is no hostname it returns the cleaned URL itself.
func FallbackTitle(rawURL string) string {
	if u, err := url.Parse(strings.TrimSpace(rawURL)); err == nil && u.Hostname() != "" {
		return CleanTitle(u.Hostname())
	}
	return CleanTitle(rawURL)
}

func attr(n *html.Node, key string) string {
	for _, a := range n.Attr {
		if a.Namespace == "" && strings.EqualFold(a.Key, key) {
			return a.Val
		}
	}
	return ""
}

func textContent(n *html.Node) string {
	var b strings.Builder
	for d := range n.Descendants() {
		if d.Type == html.TextNode {
			b.WriteString(d.Data)
		}
	}
	return b.String()
}
