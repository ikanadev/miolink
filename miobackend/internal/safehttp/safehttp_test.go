package safehttp

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/netip"
	"strconv"
	"strings"
	"testing"
)

func get(t *testing.T, client *http.Client, url string) (*http.Response, error) {
	t.Helper()
	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, url, nil)
	if err != nil {
		t.Fatal(err)
	}
	resp, err := client.Do(req)
	if err == nil {
		t.Cleanup(func() { _ = resp.Body.Close() })
	}
	return resp, err
}

func TestDefaultClientRefusesNonPublicAddresses(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {}))
	defer srv.Close()

	client := NewClient(Options{})
	// The Control hook rejects the address before connecting, so none of
	// these reach the network.
	for _, url := range []string{
		srv.URL,
		"http://127.0.0.1:1/",
		"http://10.0.0.1/",
		"http://169.254.169.254/latest/meta-data/",
		"http://[::1]:1/",
	} {
		_, err := get(t, client, url)
		if !errors.Is(err, ErrBlockedAddress) {
			t.Errorf("GET %s: got error %v, want ErrBlockedAddress", url, err)
		}
	}
}

func TestAllowLoopback(t *testing.T) {
	var gotUA string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotUA = r.UserAgent()
		_, _ = w.Write([]byte("ok"))
	}))
	defer srv.Close()

	client := NewClient(Options{AllowLoopback: true})
	resp, err := get(t, client, srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d", resp.StatusCode)
	}
	if gotUA != UserAgent {
		t.Errorf("User-Agent = %q, want %q", gotUA, UserAgent)
	}

	// Loopback is the only exception: private addresses stay blocked.
	if _, err := get(t, client, "http://10.0.0.1/"); !errors.Is(err, ErrBlockedAddress) {
		t.Errorf("GET 10.0.0.1: got %v, want ErrBlockedAddress", err)
	}
}

func TestRedirectToBlockedAddress(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://10.1.2.3/", http.StatusFound)
	}))
	defer srv.Close()

	_, err := get(t, NewClient(Options{AllowLoopback: true}), srv.URL)
	if !errors.Is(err, ErrBlockedAddress) {
		t.Errorf("got %v, want ErrBlockedAddress", err)
	}
}

func TestRedirectLimit(t *testing.T) {
	// /n redirects to /n-1; /0 answers.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n, _ := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/"))
		if n == 0 {
			_, _ = w.Write([]byte("ok"))
			return
		}
		http.Redirect(w, r, fmt.Sprintf("/%d", n-1), http.StatusFound)
	}))
	defer srv.Close()

	client := NewClient(Options{AllowLoopback: true})
	if _, err := get(t, client, srv.URL+"/5"); err != nil {
		t.Errorf("5 redirects: %v", err)
	}
	if _, err := get(t, client, srv.URL+"/6"); !errors.Is(err, ErrTooManyRedirects) {
		t.Errorf("6 redirects: got %v, want ErrTooManyRedirects", err)
	}
}

func TestRedirectToOtherScheme(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "ftp://example.com/file", http.StatusFound)
	}))
	defer srv.Close()

	_, err := get(t, NewClient(Options{AllowLoopback: true}), srv.URL)
	if !errors.Is(err, ErrScheme) {
		t.Errorf("got %v, want ErrScheme", err)
	}
}

func TestIsPublic(t *testing.T) {
	tests := map[string]bool{
		"8.8.8.8":          true,
		"93.184.216.34":    true,
		"2606:4700::1111":  true,
		"127.0.0.1":        false,
		"127.8.9.10":       false,
		"10.0.0.1":         false,
		"172.16.5.4":       false,
		"192.168.1.1":      false,
		"169.254.169.254":  false,
		"100.64.0.1":       false,
		"100.127.255.254":  false,
		"0.0.0.0":          false,
		"224.0.0.1":        false,
		"255.255.255.255":  false,
		"::":               false,
		"::1":              false,
		"fc00::1":          false,
		"fd12:3456::1":     false,
		"fe80::1":          false,
		"ff02::1":          false,
		"::ffff:127.0.0.1": false,
		"::ffff:10.0.0.1":  false,
		"::ffff:8.8.8.8":   true,
		"64:ff9b::a00:1":   false, // NAT64 for 10.0.0.1
		"64:ff9b::808:808": true,  // NAT64 for 8.8.8.8
		"2001:db8::1":      false,
		"198.18.0.1":       false,
		"192.0.2.1":        false,
	}
	for s, want := range tests {
		if got := isPublic(netip.MustParseAddr(s), false); got != want {
			t.Errorf("isPublic(%s) = %v, want %v", s, got, want)
		}
	}
	if !isPublic(netip.MustParseAddr("127.0.0.1"), true) {
		t.Error("loopback should be allowed with allowLoopback")
	}
	if !isPublic(netip.MustParseAddr("::1"), true) {
		t.Error("IPv6 loopback should be allowed with allowLoopback")
	}
}
