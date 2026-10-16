package linkmeta

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"miobackend/internal/safehttp"
)

func newFetcher() *Fetcher {
	return New(safehttp.NewClient(safehttp.Options{AllowLoopback: true}))
}

// serve starts a server that answers every request with contentType and body.
func serve(t *testing.T, contentType string, body []byte) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", contentType)
		_, _ = w.Write(body)
	}))
	t.Cleanup(srv.Close)
	return srv
}

func fetch(t *testing.T, url string) Metadata {
	t.Helper()
	m, err := newFetcher().Fetch(context.Background(), url)
	if err != nil {
		t.Fatalf("Fetch: %v", err)
	}
	return m
}

func TestFetchOpenGraph(t *testing.T) {
	srv := serve(t, "text/html; charset=utf-8", []byte(`<!doctype html>
<html><head>
<title>Plain title</title>
<meta name="twitter:title" content="Twitter title">
<meta property="og:title" content="  OG
   title  ">
<meta name="twitter:image" content="https://cdn.example.com/twitter.png">
<meta property="og:image" content="https://cdn.example.com/og.png">
</head><body></body></html>`))

	m := fetch(t, srv.URL)
	if m.Title != "OG title" {
		t.Errorf("Title = %q, want %q", m.Title, "OG title")
	}
	if m.ImageURL != "https://cdn.example.com/og.png" {
		t.Errorf("ImageURL = %q", m.ImageURL)
	}
}

func TestFetchTwitterFallback(t *testing.T) {
	srv := serve(t, "text/html", []byte(`<html><head><title>Plain</title>
<meta name="twitter:title" content="Twitter title">
<meta name="twitter:image" content="https://cdn.example.com/t.png">
</head></html>`))

	m := fetch(t, srv.URL)
	if m.Title != "Twitter title" || m.ImageURL != "https://cdn.example.com/t.png" {
		t.Errorf("got %+v", m)
	}
}

func TestFetchTitleOnly(t *testing.T) {
	srv := serve(t, "text/html", []byte("<html><head><title>\n  Hello &amp;\t world \n</title></head><body><svg><title>icon</title></svg></body></html>"))

	m := fetch(t, srv.URL)
	if m.Title != "Hello & world" {
		t.Errorf("Title = %q", m.Title)
	}
	if m.ImageURL != "" {
		t.Errorf("ImageURL = %q, want empty", m.ImageURL)
	}
}

func TestFetchRelativeImageAfterRedirect(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/start", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/articles/post", http.StatusFound)
	})
	mux.HandleFunc("/articles/post", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write([]byte(`<html><head><meta property="og:image" content="img/cover.jpg"></head></html>`))
	})
	srv := httptest.NewServer(mux)
	defer srv.Close()

	m := fetch(t, srv.URL+"/start")
	if want := srv.URL + "/articles/img/cover.jpg"; m.ImageURL != want {
		t.Errorf("ImageURL = %q, want %q", m.ImageURL, want)
	}
}

func TestFetchBaseHref(t *testing.T) {
	srv := serve(t, "text/html", []byte(`<html><head><base href="https://static.example.com/assets/">
<meta property="og:image" content="cover.jpg"></head></html>`))

	m := fetch(t, srv.URL)
	if m.ImageURL != "https://static.example.com/assets/cover.jpg" {
		t.Errorf("ImageURL = %q", m.ImageURL)
	}
}

func TestFetchIgnoresNonHTTPImage(t *testing.T) {
	srv := serve(t, "text/html", []byte(`<html><head>
<meta property="og:image" content="javascript:alert(1)">
<meta name="twitter:image" content="/ok.png"></head></html>`))

	m := fetch(t, srv.URL)
	if m.ImageURL != srv.URL+"/ok.png" {
		t.Errorf("ImageURL = %q", m.ImageURL)
	}
}

func TestFetchNonHTML(t *testing.T) {
	srv := serve(t, "application/json", []byte(`{"title":"<title>nope</title>"}`))

	m := fetch(t, srv.URL)
	if m != (Metadata{}) {
		t.Errorf("got %+v, want empty", m)
	}
}

func TestFetchOversizedBody(t *testing.T) {
	padding := strings.Repeat("<p>filler</p>", MaxBodyBytes/len("<p>filler</p>")+1)

	t.Run("metadata before the limit", func(t *testing.T) {
		srv := serve(t, "text/html", []byte("<html><head><title>Early</title></head><body>"+padding+"</body></html>"))
		if m := fetch(t, srv.URL); m.Title != "Early" {
			t.Errorf("Title = %q, want %q", m.Title, "Early")
		}
	})

	t.Run("metadata after the limit", func(t *testing.T) {
		srv := serve(t, "text/html", []byte("<html><body>"+padding+"<title>Late</title></body></html>"))
		if m := fetch(t, srv.URL); m.Title != "" {
			t.Errorf("Title = %q, want empty", m.Title)
		}
	})
}

func TestFetchCharset(t *testing.T) {
	// "Café ñandú" in windows-1252/ISO-8859-1: é = 0xE9, ñ = 0xF1, ú = 0xFA.
	latin1Title := []byte("Caf\xe9 \xf1and\xfa")

	t.Run("header", func(t *testing.T) {
		body := append(append([]byte("<html><head><title>"), latin1Title...), "</title></head></html>"...)
		srv := serve(t, "text/html; charset=ISO-8859-1", body)
		if m := fetch(t, srv.URL); m.Title != "Café ñandú" {
			t.Errorf("Title = %q", m.Title)
		}
	})

	t.Run("meta tag", func(t *testing.T) {
		body := append(append([]byte(`<html><head><meta charset="windows-1252"><title>`), latin1Title...), "</title></head></html>"...)
		srv := serve(t, "text/html", body)
		if m := fetch(t, srv.URL); m.Title != "Café ñandú" {
			t.Errorf("Title = %q", m.Title)
		}
	})
}

func TestFetchErrorStatus(t *testing.T) {
	srv := httptest.NewServer(http.NotFoundHandler())
	defer srv.Close()

	if _, err := newFetcher().Fetch(context.Background(), srv.URL); err == nil {
		t.Error("expected an error for 404")
	}
}

func TestFetchRejectsOtherSchemes(t *testing.T) {
	if _, err := newFetcher().Fetch(context.Background(), "file:///etc/passwd"); err == nil {
		t.Error("expected an error for file://")
	}
}

func TestCleanTitle(t *testing.T) {
	if got := CleanTitle("  a \n\t b  "); got != "a b" {
		t.Errorf("CleanTitle = %q", got)
	}
	long := strings.Repeat("é", MaxTitleLength+20)
	if got := CleanTitle(long); len([]rune(got)) != MaxTitleLength {
		t.Errorf("len = %d, want %d", len([]rune(got)), MaxTitleLength)
	}
}

func TestFallbackTitle(t *testing.T) {
	tests := map[string]string{
		"https://www.example.com/path?q=1": "www.example.com",
		"http://example.com:8080/":         "example.com",
		"https://[2001:db8::1]/":           "2001:db8::1",
		"not a url":                        "not a url",
	}
	for in, want := range tests {
		if got := FallbackTitle(in); got != want {
			t.Errorf("FallbackTitle(%q) = %q, want %q", in, got, want)
		}
	}
}
