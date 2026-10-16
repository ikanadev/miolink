-- name: CreateLink :one
INSERT INTO links (directory_id, title, url, thumbnail, created_at)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: GetLink :one
SELECT * FROM links WHERE id = ?;

-- name: UpdateLinkTitle :one
UPDATE links SET title = ? WHERE id = ?
RETURNING *;

-- name: MoveLink :one
UPDATE links SET directory_id = ? WHERE id = ?
RETURNING *;

-- name: UpdateLinkMetadata :one
UPDATE links SET title = ?, thumbnail = ? WHERE id = ?
RETURNING *;

-- name: DeleteLink :execrows
DELETE FROM links WHERE id = ?;

-- name: ListThumbnails :many
SELECT DISTINCT thumbnail FROM links WHERE thumbnail IS NOT NULL;

-- name: IncrementLinkViews :one
UPDATE links SET views = views + 1 WHERE id = ?
RETURNING views;
