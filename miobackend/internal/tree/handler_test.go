package tree

import (
	"context"
	"testing"

	treev1 "miobackend/gen/miolink/tree/v1"
	"miobackend/internal/database"
	"miobackend/internal/database/sqlc"
)

const thumbName = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.jpg"

func newEnv(t *testing.T) (*Handler, *sqlc.Queries) {
	t.Helper()
	db, err := database.Open(":memory:")
	if err != nil {
		t.Fatalf("open database: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return NewHandler(db), sqlc.New(db)
}

func getTree(t *testing.T, h *Handler, known int64) *treev1.GetTreeResponse {
	t.Helper()
	resp, err := h.GetTree(context.Background(), &treev1.GetTreeRequest{KnownRevision: known})
	if err != nil {
		t.Fatalf("GetTree(%d): %v", known, err)
	}
	return resp
}

func TestGetTreeEmpty(t *testing.T) {
	h, q := newEnv(t)
	rev, err := q.GetRevision(context.Background())
	if err != nil {
		t.Fatalf("GetRevision: %v", err)
	}

	resp := getTree(t, h, 0)
	if resp.GetNotModified() {
		t.Fatal("not_modified = true, want the full tree")
	}
	if resp.GetRevision() != rev {
		t.Errorf("revision = %d, want %d", resp.GetRevision(), rev)
	}
	if len(resp.GetDirectories()) != 1 {
		t.Fatalf("directories = %v, want just the root", resp.GetDirectories())
	}
	root := resp.GetDirectories()[0]
	if root.GetId() != 1 || root.ParentId != nil || root.GetName() != "" {
		t.Errorf("root = %v, want id 1, no parent, empty name", root)
	}
	if len(resp.GetLinks()) != 0 {
		t.Errorf("links = %v, want none", resp.GetLinks())
	}
}

func TestGetTreeNotModified(t *testing.T) {
	h, _ := newEnv(t)
	rev := getTree(t, h, 0).GetRevision()

	resp := getTree(t, h, rev)
	if !resp.GetNotModified() {
		t.Fatal("not_modified = false, want true")
	}
	if resp.GetRevision() != rev {
		t.Errorf("revision = %d, want %d", resp.GetRevision(), rev)
	}
	if len(resp.GetDirectories()) != 0 || len(resp.GetLinks()) != 0 {
		t.Errorf("lists = %v / %v, want empty", resp.GetDirectories(), resp.GetLinks())
	}
}

func TestGetTreeStaleRevision(t *testing.T) {
	h, q := newEnv(t)
	ctx := context.Background()
	stale := getTree(t, h, 0).GetRevision()

	root := int64(1)
	dir, err := q.CreateDirectory(ctx, sqlc.CreateDirectoryParams{ParentID: &root, Name: "work", CreatedAt: 1000})
	if err != nil {
		t.Fatalf("CreateDirectory: %v", err)
	}
	thumb := thumbName
	l1, err := q.CreateLink(ctx, sqlc.CreateLinkParams{DirectoryID: dir.ID, Title: "A", Url: "https://a.example", Thumbnail: &thumb, CreatedAt: 2000})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	l2, err := q.CreateLink(ctx, sqlc.CreateLinkParams{DirectoryID: 1, Title: "B", Url: "https://b.example", CreatedAt: 3000})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}

	resp := getTree(t, h, stale)
	if resp.GetNotModified() {
		t.Fatal("not_modified = true, want the full tree")
	}
	if resp.GetRevision() <= stale {
		t.Errorf("revision = %d, want > %d", resp.GetRevision(), stale)
	}

	dirs := resp.GetDirectories()
	if len(dirs) != 2 || dirs[0].GetId() != 1 || dirs[1].GetId() != dir.ID {
		t.Fatalf("directories = %v, want root and %d by id", dirs, dir.ID)
	}
	if dirs[1].GetParentId() != 1 || dirs[1].GetName() != "work" || dirs[1].GetCreatedAt().AsTime().UnixMilli() != 1000 {
		t.Errorf("directory = %v", dirs[1])
	}

	links := resp.GetLinks()
	if len(links) != 2 || links[0].GetId() != l1.ID || links[1].GetId() != l2.ID {
		t.Fatalf("links = %v, want %d and %d by id", links, l1.ID, l2.ID)
	}
	if links[0].GetDirectoryId() != dir.ID || links[0].GetTitle() != "A" || links[0].GetUrl() != "https://a.example" {
		t.Errorf("link = %v", links[0])
	}
	if want := "/thumbnails/" + thumbName; links[0].GetThumbnailUrl() != want {
		t.Errorf("thumbnail_url = %q, want %q", links[0].GetThumbnailUrl(), want)
	}
	if links[1].GetThumbnailUrl() != "" || links[1].GetCreatedAt().AsTime().UnixMilli() != 3000 {
		t.Errorf("link = %v", links[1])
	}
}

func TestGetTreeRevisionChanges(t *testing.T) {
	h, q := newEnv(t)
	ctx := context.Background()

	l, err := q.CreateLink(ctx, sqlc.CreateLinkParams{DirectoryID: 1, Title: "A", Url: "https://a.example", CreatedAt: 1})
	if err != nil {
		t.Fatalf("CreateLink: %v", err)
	}
	rev := getTree(t, h, 0).GetRevision()

	// A view doesn't change the tree revision.
	if _, err := q.IncrementLinkViews(ctx, l.ID); err != nil {
		t.Fatalf("IncrementLinkViews: %v", err)
	}
	if !getTree(t, h, rev).GetNotModified() {
		t.Error("not_modified = false after a view, want true")
	}

	// A write does.
	if _, err := q.UpdateLinkTitle(ctx, sqlc.UpdateLinkTitleParams{Title: "B", ID: l.ID}); err != nil {
		t.Fatalf("UpdateLinkTitle: %v", err)
	}
	resp := getTree(t, h, rev)
	if resp.GetNotModified() {
		t.Fatal("not_modified = true after a write, want the full tree")
	}
	if resp.GetRevision() != rev+1 {
		t.Errorf("revision = %d, want %d", resp.GetRevision(), rev+1)
	}
	if got := resp.GetLinks()[0]; got.GetTitle() != "B" || got.GetViews() != 1 {
		t.Errorf("link = %v, want title B and 1 view", got)
	}
}
