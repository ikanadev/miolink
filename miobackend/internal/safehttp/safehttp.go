// Package safehttp builds an HTTP client for fetching URLs supplied by the
// user. It only connects to public IP addresses, so a link can't be used to
// reach the server's own network (SSRF).
package safehttp

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/netip"
	"syscall"
	"time"
)

const (
	// UserAgent is sent with every request.
	UserAgent = "Mozilla/5.0 (compatible; miolink/1.0; +link preview)"

	// MaxRedirects is the maximum number of redirects the client follows.
	MaxRedirects = 5

	// Timeout bounds a whole request, including redirects and reading the body.
	Timeout = 10 * time.Second
)

// ErrBlockedAddress is returned (wrapped) when a connection would reach an
// address that isn't public.
var ErrBlockedAddress = errors.New("safehttp: address is not public")

// ErrScheme is returned (wrapped) for URLs whose scheme isn't http or https.
var ErrScheme = errors.New("safehttp: only http and https URLs are allowed")

// ErrTooManyRedirects is returned (wrapped) after MaxRedirects redirects.
var ErrTooManyRedirects = errors.New("safehttp: too many redirects")

// Options configures NewClient. The zero value is the production setting.
type Options struct {
	// AllowLoopback permits connections to loopback addresses, so tests can
	// reach httptest servers. Never enable it in production.
	AllowLoopback bool
}

// NewClient returns an *http.Client that only connects to public addresses.
//
// The check runs on the resolved IP in the dialer's Control hook, so it
// covers every connection: redirects and DNS rebinding included. Proxies from
// the environment are ignored, because the check would then apply to the
// proxy's address instead of the target's.
func NewClient(opts Options) *http.Client {
	dialer := &net.Dialer{
		Timeout:   5 * time.Second,
		KeepAlive: 30 * time.Second,
		Control: func(_, address string, _ syscall.RawConn) error {
			return checkAddress(address, opts.AllowLoopback)
		},
	}
	transport := &http.Transport{
		Proxy:                 nil,
		DialContext:           dialer.DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          10,
		IdleConnTimeout:       60 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: Timeout,
		ExpectContinueTimeout: time.Second,
	}
	return &http.Client{
		Transport: &roundTripper{next: transport},
		Timeout:   Timeout,
		CheckRedirect: func(_ *http.Request, via []*http.Request) error {
			if len(via) > MaxRedirects {
				return ErrTooManyRedirects
			}
			return nil
		},
	}
}

// roundTripper enforces the scheme and User-Agent on every request, including
// the ones the client makes to follow redirects.
type roundTripper struct {
	next http.RoundTripper
}

func (rt *roundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	if req.URL.Scheme != "http" && req.URL.Scheme != "https" {
		if req.Body != nil {
			_ = req.Body.Close()
		}
		return nil, fmt.Errorf("%w: %q", ErrScheme, req.URL.Scheme)
	}
	req = req.Clone(req.Context())
	req.Header.Set("User-Agent", UserAgent)
	return rt.next.RoundTrip(req)
}

func checkAddress(address string, allowLoopback bool) error {
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrBlockedAddress, err)
	}
	addr, err := netip.ParseAddr(host)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrBlockedAddress, err)
	}
	if !isPublic(addr, allowLoopback) {
		return fmt.Errorf("%w: %s", ErrBlockedAddress, addr)
	}
	return nil
}

// nonPublic lists ranges not covered by the netip.Addr predicates.
var nonPublic = []netip.Prefix{
	netip.MustParsePrefix("0.0.0.0/8"),       // "this network"
	netip.MustParsePrefix("100.64.0.0/10"),   // CGNAT
	netip.MustParsePrefix("192.0.0.0/24"),    // IETF protocol assignments
	netip.MustParsePrefix("192.0.2.0/24"),    // TEST-NET-1
	netip.MustParsePrefix("198.18.0.0/15"),   // benchmarking
	netip.MustParsePrefix("198.51.100.0/24"), // TEST-NET-2
	netip.MustParsePrefix("203.0.113.0/24"),  // TEST-NET-3
	netip.MustParsePrefix("240.0.0.0/4"),     // reserved, includes broadcast
	netip.MustParsePrefix("100::/64"),        // discard-only
	netip.MustParsePrefix("2001:db8::/32"),   // documentation
}

// nat64 embeds an IPv4 address in its last 32 bits.
var nat64 = netip.MustParsePrefix("64:ff9b::/96")

// isPublic reports whether addr is a globally reachable unicast address.
func isPublic(addr netip.Addr, allowLoopback bool) bool {
	addr = addr.Unmap()
	if addr.Is6() && nat64.Contains(addr) {
		b := addr.As16()
		addr = netip.AddrFrom4([4]byte{b[12], b[13], b[14], b[15]})
	}
	if addr.IsLoopback() {
		return allowLoopback
	}
	if !addr.IsValid() ||
		addr.IsUnspecified() ||
		addr.IsPrivate() ||
		addr.IsLinkLocalUnicast() ||
		addr.IsLinkLocalMulticast() ||
		addr.IsInterfaceLocalMulticast() ||
		addr.IsMulticast() {
		return false
	}
	for _, p := range nonPublic {
		if p.Contains(addr) {
			return false
		}
	}
	return true
}
