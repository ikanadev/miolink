package link

import (
	"context"
	"errors"
	"testing"
	"time"

	"connectrpc.com/connect"

	linkv1 "miobackend/gen/miolink/link/v1"
	"miobackend/internal/database"
	"miobackend/internal/database/sqlc"
	"miobackend/internal/linkmeta"
)

type fakeFetcher struct {
	meta  linkmeta.Metadata
	err   error
	calls []string
}

func (f *fakeFetcher) Fetch(_ context.Context, rawURL string) (linkmeta.Metadata, error) {
	f.calls = append(f.calls, rawURL)
	return f.meta, f.err
}

type fakeSaver struct {
	name  string
	err   error
	calls []string
}

func (f *fakeSaver) SaveFromURL(_ context.Context, imageURL string) (string, error) {
	f.calls = append(f.calls, imageURL)
	return f.name, f.err
}

var fixedNow = time.Date(2026, 10, 15, 12, 0, 0, 0, time.UTC)

const thumbName = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.jpg"

type env struct {
	h       *Handler
	fetcher *fakeFetcher
	saver   *fakeSaver
	q       *sqlc.Queries
}

func newEnv(t *testing.T) *env {
	t.Helper()
	db, err := database.Open(":memory:")
	if err != nil {
		t.Fatalf("open database: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	e := &env{
		fetcher: &fakeFetcher{meta: linkmeta.Metadata{Title: "  Example   Page ", ImageURL: "https://example.com/og.png"}},
		saver:   &fakeSaver{name: thumbName},
		q:       sqlc.New(db),
	}
	e.h = NewHandler(db, e.fetcher, e.saver)
	e.h.now = func() time.Time { return fixedNow }
	return e
}

func (e *env) revision(t *testing.T) int64 {
	t.Helper()
	rev, err := e.q.GetRevision(context.Background())
	if err != nil {
		t.Fatalf("GetRevision: %v", err)
	}
	return rev
}

func (e *env) createDirectory(t *testing.T, name string) int64 {
	t.Helper()
	parent := int64(1)
	d, err := e.q.CreateDirectory(context.Background(), sqlc.CreateDirectoryParams{ParentID: &parent, Name: name, CreatedAt: 1})
	if err != nil {
		t.Fatalf("CreateDirectory: %v", err)
	}
	return d.ID
}

func (e *env) createLink(t *testing.T) *linkv1.Link {
	t.Helper()
	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: 1, Url: "https://example.com/page"})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	return resp.GetLink()
}

func wantCode(t *testing.T, err error, code connect.Code) {
	t.Helper()
	if got := connect.CodeOf(err); err == nil || got != code {
		t.Fatalf("error = %v (code %v), want code %v", err, got, code)
	}
}

func TestCreateLink(t *testing.T) {
	e := newEnv(t)
	before := e.revision(t)

	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{
		DirectoryId: 1,
		Url:         "  https://example.com/page  ",
	})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	l := resp.GetLink()
	if l.GetTitle() != "Example Page" {
		t.Errorf("title = %q, want %q", l.GetTitle(), "Example Page")
	}
	if l.GetUrl() != "https://example.com/page" {
		t.Errorf("url = %q, want trimmed URL", l.GetUrl())
	}
	if want := "/thumbnails/" + thumbName; l.GetThumbnailUrl() != want {
		t.Errorf("thumbnail_url = %q, want %q", l.GetThumbnailUrl(), want)
	}
	if l.GetDirectoryId() != 1 || l.GetViews() != 0 || l.GetId() == 0 {
		t.Errorf("unexpected link %v", l)
	}
	if !l.GetCreatedAt().AsTime().Equal(fixedNow) {
		t.Errorf("created_at = %v, want %v", l.GetCreatedAt().AsTime(), fixedNow)
	}
	if resp.GetPreviousRevision() != before || resp.GetRevision() != before+1 {
		t.Errorf("revisions = %d -> %d, want %d -> %d", resp.GetPreviousRevision(), resp.GetRevision(), before, before+1)
	}
	if len(e.fetcher.calls) != 1 || e.fetcher.calls[0] != "https://example.com/page" {
		t.Errorf("fetcher calls = %v", e.fetcher.calls)
	}
	if len(e.saver.calls) != 1 || e.saver.calls[0] != "https://example.com/og.png" {
		t.Errorf("saver calls = %v", e.saver.calls)
	}
}

func TestCreateLinkMetadataFails(t *testing.T) {
	e := newEnv(t)
	e.fetcher.meta = linkmeta.Metadata{}
	e.fetcher.err = errors.New("connection refused")

	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: 1, Url: "https://www.example.org/a/b?c=d"})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	if got := resp.GetLink().GetTitle(); got != "www.example.org" {
		t.Errorf("title = %q, want hostname", got)
	}
	if got := resp.GetLink().GetThumbnailUrl(); got != "" {
		t.Errorf("thumbnail_url = %q, want empty", got)
	}
	if len(e.saver.calls) != 0 {
		t.Errorf("saver called without an image URL: %v", e.saver.calls)
	}
}

func TestCreateLinkThumbnailFails(t *testing.T) {
	e := newEnv(t)
	e.saver.err = errors.New("thumbnail: unsupported image format")

	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: 1, Url: "https://example.com"})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	if resp.GetLink().GetTitle() != "Example Page" || resp.GetLink().GetThumbnailUrl() != "" {
		t.Errorf("unexpected link %v", resp.GetLink())
	}
}

func TestCreateLinkInvalidURL(t *testing.T) {
	long := "https://example.com/"
	for len(long) <= maxURLLength {
		long += "a"
	}
	for _, u := range []string{"", "   ", "example.com", "/relative", "ftp://example.com/x", "javascript:alert(1)", "https://", "http:///path", "https://exa mple.com", long} {
		e := newEnv(t)
		_, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: 1, Url: u})
		wantCode(t, err, connect.CodeInvalidArgument)
		if len(e.fetcher.calls) != 0 {
			t.Errorf("%q: fetched an invalid URL", u)
		}
	}
}

func TestCreateLinkUnknownDirectory(t *testing.T) {
	e := newEnv(t)
	before := e.revision(t)
	_, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: 999, Url: "https://example.com"})
	wantCode(t, err, connect.CodeNotFound)
	if e.revision(t) != before {
		t.Error("revision changed on a failed create")
	}
}

func TestCreateLinkInSubdirectory(t *testing.T) {
	e := newEnv(t)
	dir := e.createDirectory(t, "news")
	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: dir, Url: "https://example.com"})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	if resp.GetLink().GetDirectoryId() != dir {
		t.Errorf("directory_id = %d, want %d", resp.GetLink().GetDirectoryId(), dir)
	}
}

func TestUpdateLink(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)
	before := e.revision(t)

	resp, err := e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: l.GetId(), Title: "  My title  "})
	if err != nil {
		t.Fatalf("UpdateLink: %v", err)
	}
	if resp.GetLink().GetTitle() != "My title" {
		t.Errorf("title = %q", resp.GetLink().GetTitle())
	}
	if resp.GetPreviousRevision() != before || resp.GetRevision() != before+1 {
		t.Errorf("revisions = %d -> %d, want %d -> %d", resp.GetPreviousRevision(), resp.GetRevision(), before, before+1)
	}

	// Same title again: nothing changes, so the revision stays.
	resp, err = e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: l.GetId(), Title: "My title"})
	if err != nil {
		t.Fatalf("UpdateLink: %v", err)
	}
	if resp.GetPreviousRevision() != resp.GetRevision() {
		t.Errorf("unchanged title bumped the revision: %d -> %d", resp.GetPreviousRevision(), resp.GetRevision())
	}
}

func TestUpdateLinkErrors(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)

	long := make([]rune, maxTitleLength+1)
	for i := range long {
		long[i] = 'é'
	}
	for _, title := range []string{"", "   ", string(long)} {
		_, err := e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: l.GetId(), Title: title})
		wantCode(t, err, connect.CodeInvalidArgument)
	}
	_, err := e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: l.GetId(), Title: string(long[:maxTitleLength])})
	if err != nil {
		t.Errorf("500-character title: %v", err)
	}
	_, err = e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: 999, Title: "x"})
	wantCode(t, err, connect.CodeNotFound)
}

func TestMoveLink(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)
	dir := e.createDirectory(t, "target")
	before := e.revision(t)

	resp, err := e.h.MoveLink(context.Background(), &linkv1.MoveLinkRequest{Id: l.GetId(), DirectoryId: dir})
	if err != nil {
		t.Fatalf("MoveLink: %v", err)
	}
	if resp.GetLink().GetDirectoryId() != dir {
		t.Errorf("directory_id = %d, want %d", resp.GetLink().GetDirectoryId(), dir)
	}
	if resp.GetPreviousRevision() != before || resp.GetRevision() != before+1 {
		t.Errorf("revisions = %d -> %d, want %d -> %d", resp.GetPreviousRevision(), resp.GetRevision(), before, before+1)
	}

	_, err = e.h.MoveLink(context.Background(), &linkv1.MoveLinkRequest{Id: l.GetId(), DirectoryId: 999})
	wantCode(t, err, connect.CodeNotFound)
	_, err = e.h.MoveLink(context.Background(), &linkv1.MoveLinkRequest{Id: 999, DirectoryId: 1})
	wantCode(t, err, connect.CodeNotFound)
}

func TestDeleteLink(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)
	before := e.revision(t)

	resp, err := e.h.DeleteLink(context.Background(), &linkv1.DeleteLinkRequest{Id: l.GetId()})
	if err != nil {
		t.Fatalf("DeleteLink: %v", err)
	}
	if resp.GetPreviousRevision() != before || resp.GetRevision() != before+1 {
		t.Errorf("revisions = %d -> %d, want %d -> %d", resp.GetPreviousRevision(), resp.GetRevision(), before, before+1)
	}
	if _, err := e.q.GetLink(context.Background(), l.GetId()); err == nil {
		t.Error("link still exists")
	}

	_, err = e.h.DeleteLink(context.Background(), &linkv1.DeleteLinkRequest{Id: l.GetId()})
	wantCode(t, err, connect.CodeNotFound)
}

func TestRecordView(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)
	before := e.revision(t)

	for want := int64(1); want <= 3; want++ {
		resp, err := e.h.RecordView(context.Background(), &linkv1.RecordViewRequest{Id: l.GetId()})
		if err != nil {
			t.Fatalf("RecordView: %v", err)
		}
		if resp.GetViews() != want {
			t.Errorf("views = %d, want %d", resp.GetViews(), want)
		}
	}
	if e.revision(t) != before {
		t.Errorf("revision changed from %d to %d", before, e.revision(t))
	}

	_, err := e.h.RecordView(context.Background(), &linkv1.RecordViewRequest{Id: 999})
	wantCode(t, err, connect.CodeNotFound)
}

func TestRefreshLinkMetadata(t *testing.T) {
	e := newEnv(t)
	l := e.createLink(t)
	if _, err := e.h.UpdateLink(context.Background(), &linkv1.UpdateLinkRequest{Id: l.GetId(), Title: "edited"}); err != nil {
		t.Fatalf("UpdateLink: %v", err)
	}
	e.fetcher.meta = linkmeta.Metadata{Title: "New title"}
	before := e.revision(t)

	resp, err := e.h.RefreshLinkMetadata(context.Background(), &linkv1.RefreshLinkMetadataRequest{Id: l.GetId()})
	if err != nil {
		t.Fatalf("RefreshLinkMetadata: %v", err)
	}
	got := resp.GetLink()
	if got.GetTitle() != "New title" || got.GetThumbnailUrl() != "" {
		t.Errorf("unexpected refreshed link %v", got)
	}
	if got.GetUrl() != l.GetUrl() || !got.GetCreatedAt().AsTime().Equal(l.GetCreatedAt().AsTime()) {
		t.Errorf("refresh changed url or created_at: %v", got)
	}
	if resp.GetPreviousRevision() != before || resp.GetRevision() != before+1 {
		t.Errorf("revisions = %d -> %d, want %d -> %d", resp.GetPreviousRevision(), resp.GetRevision(), before, before+1)
	}
	if last := e.fetcher.calls[len(e.fetcher.calls)-1]; last != l.GetUrl() {
		t.Errorf("fetched %q, want %q", last, l.GetUrl())
	}

	_, err = e.h.RefreshLinkMetadata(context.Background(), &linkv1.RefreshLinkMetadataRequest{Id: 999})
	wantCode(t, err, connect.CodeNotFound)
}

func TestDeleteDirectoryRemovesLinks(t *testing.T) {
	e := newEnv(t)
	dir := e.createDirectory(t, "gone")
	resp, err := e.h.CreateLink(context.Background(), &linkv1.CreateLinkRequest{DirectoryId: dir, Url: "https://example.com"})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	if _, err := e.q.DeleteDirectory(context.Background(), dir); err != nil {
		t.Fatalf("DeleteDirectory: %v", err)
	}
	_, err = e.h.RecordView(context.Background(), &linkv1.RecordViewRequest{Id: resp.GetLink().GetId()})
	wantCode(t, err, connect.CodeNotFound)
}

