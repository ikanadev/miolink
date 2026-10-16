package link

import (
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	linkv1 "miobackend/gen/miolink/link/v1"
	"miobackend/internal/database/sqlc"
	"miobackend/internal/thumbnail"
)

// toProtoLink maps a stored link to its proto message.
func toProtoLink(l sqlc.Link) *linkv1.Link {
	var thumbnailURL string
	if l.Thumbnail != nil && *l.Thumbnail != "" {
		thumbnailURL = thumbnail.URLPath(*l.Thumbnail)
	}
	return &linkv1.Link{
		Id:           l.ID,
		DirectoryId:  l.DirectoryID,
		Title:        l.Title,
		Url:          l.Url,
		ThumbnailUrl: thumbnailURL,
		Views:        l.Views,
		CreatedAt:    timestamppb.New(time.UnixMilli(l.CreatedAt)),
	}
}

// fromCreateLinkRequest maps a create request, its validated URL and the
// fetched metadata to the insert parameters.
func fromCreateLinkRequest(req *linkv1.CreateLinkRequest, rawURL string, meta metadata, now time.Time) sqlc.CreateLinkParams {
	return sqlc.CreateLinkParams{
		DirectoryID: req.GetDirectoryId(),
		Title:       meta.title,
		Url:         rawURL,
		Thumbnail:   meta.thumbnail,
		CreatedAt:   now.UTC().UnixMilli(),
	}
}
