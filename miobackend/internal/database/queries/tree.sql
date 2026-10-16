-- name: ListAllDirectories :many
SELECT * FROM directories ORDER BY id;

-- name: ListAllLinks :many
SELECT * FROM links ORDER BY id;
