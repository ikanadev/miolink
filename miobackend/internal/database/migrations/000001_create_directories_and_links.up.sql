CREATE TABLE directories (
    id          INTEGER PRIMARY KEY,
    parent_id   INTEGER REFERENCES directories (id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    created_at  INTEGER NOT NULL, -- unix ms, UTC

    -- Exactly one root: id 1 has no parent, and every other directory has one.
    CHECK ((id = 1) = (parent_id IS NULL)),
    CHECK (parent_id <> id),
    -- Linux-style names: no '/', '.' or '..'. Only the root is unnamed.
    CHECK (id = 1 OR (length(name) BETWEEN 1 AND 255
                      AND instr(name, '/') = 0
                      AND name NOT IN ('.', '..'))),
    UNIQUE (parent_id, name)
);

INSERT INTO directories (id, parent_id, name, created_at) VALUES (1, NULL, '', 0);

CREATE TRIGGER directories_protect_root
BEFORE DELETE ON directories WHEN OLD.id = 1
BEGIN
    SELECT RAISE(ABORT, 'cannot delete root directory');
END;

CREATE TABLE links (
    id             INTEGER PRIMARY KEY,
    directory_id   INTEGER NOT NULL REFERENCES directories (id) ON DELETE CASCADE,
    title          TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
    url            TEXT    NOT NULL,
    thumbnail      TEXT,  -- stored file name (content hash + extension), not a URL
    views          INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
    created_at     INTEGER NOT NULL -- unix ms, UTC
);

CREATE INDEX links_directory_created ON links (directory_id, created_at DESC);

-- Tree revision for client sync. Every change clients cache bumps it; views
-- don't, so opening a link doesn't make every client refetch the tree.
CREATE TABLE sync_state (
    id        INTEGER PRIMARY KEY CHECK (id = 1),
    revision  INTEGER NOT NULL CHECK (revision >= 1)
);

-- 1 is the initial tree (root only); clients with no cache send 0.
INSERT INTO sync_state (id, revision) VALUES (1, 1);

CREATE TRIGGER directories_revision_insert AFTER INSERT ON directories
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;

CREATE TRIGGER directories_revision_update AFTER UPDATE OF name, parent_id ON directories
WHEN OLD.name IS NOT NEW.name OR OLD.parent_id IS NOT NEW.parent_id
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;

CREATE TRIGGER directories_revision_delete AFTER DELETE ON directories
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;

CREATE TRIGGER links_revision_insert AFTER INSERT ON links
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;

CREATE TRIGGER links_revision_update AFTER UPDATE OF directory_id, title, url, thumbnail ON links
WHEN OLD.directory_id IS NOT NEW.directory_id
  OR OLD.title IS NOT NEW.title
  OR OLD.url IS NOT NEW.url
  OR OLD.thumbnail IS NOT NEW.thumbnail
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;

CREATE TRIGGER links_revision_delete AFTER DELETE ON links
BEGIN
    UPDATE sync_state SET revision = revision + 1 WHERE id = 1;
END;
