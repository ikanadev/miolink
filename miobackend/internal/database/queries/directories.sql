-- name: CreateDirectory :one
INSERT INTO directories (parent_id, name, created_at)
VALUES (?, ?, ?)
RETURNING *;

-- name: GetDirectory :one
SELECT * FROM directories WHERE id = ?;

-- name: RenameDirectory :one
UPDATE directories SET name = ? WHERE id = ?
RETURNING *;

-- name: MoveDirectory :one
UPDATE directories SET parent_id = ? WHERE id = ?
RETURNING *;

-- name: DeleteDirectory :execrows
DELETE FROM directories WHERE id = ?;

-- name: CountAncestorMatches :one
-- Returns 1 when ancestor_id is descendant_id itself or one of its
-- ancestors, 0 otherwise. Walks up the tree from descendant_id.
WITH RECURSIVE chain AS (
    SELECT directories.id FROM directories WHERE directories.id = sqlc.arg(descendant_id)
    UNION ALL
    SELECT d.parent_id FROM directories AS d JOIN chain AS c ON d.id = c.id
    WHERE d.parent_id IS NOT NULL
)
SELECT COUNT(*) FROM directories
WHERE directories.id = sqlc.arg(ancestor_id) AND directories.id IN chain;
