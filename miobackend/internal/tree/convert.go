package tree

import (
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	directoryv1 "miobackend/gen/miolink/directory/v1"
	linkv1 "miobackend/gen/miolink/link/v1"
	"miobackend/internal/database/sqlc"
	"miobackend/internal/thumbnail"
)

// toProtoDirectory maps a stored directory to its proto message.
func toProtoDirectory(d sqlc.Directory) *directoryv1.Directory {
	return &directoryv1.Directory{
		Id:        d.ID,
		ParentId:  d.ParentID,
		Name:      d.Name,
		CreatedAt: timestamppb.New(time.UnixMilli(d.CreatedAt)),
	}
}

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
