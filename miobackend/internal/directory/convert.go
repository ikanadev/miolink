package directory

import (
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	directoryv1 "miobackend/gen/miolink/directory/v1"
	"miobackend/internal/database/sqlc"
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

// fromCreateDirectoryRequest maps a create request to the insert parameters.
func fromCreateDirectoryRequest(req *directoryv1.CreateDirectoryRequest, now time.Time) sqlc.CreateDirectoryParams {
	parentID := req.GetParentId()
	return sqlc.CreateDirectoryParams{
		ParentID:  &parentID,
		Name:      req.GetName(),
		CreatedAt: now.UTC().UnixMilli(),
	}
}
