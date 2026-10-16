-- name: GetRevision :one
SELECT revision FROM sync_state WHERE id = 1;
