Status: todo

# 004 — Tree cache and sync

Depends on: 003.

## Goal

Keep a local copy of the whole tree in Room and implement the client side of
the revision protocol. Read "Data flow and sync" in `../CLAUDE.md` and "Sync"
in `../../miobackend/CLAUDE.md`.

## Scope

- **Libraries:** Room (`room-runtime`, `room-ktx`, `room-compiler` with the KSP
  plugin), `lifecycle-process`; for tests Robolectric, `room-testing`,
  `kotlinx-coroutines-test`, Turbine.
- **`core/database/`:** `MioDatabase` with `exportSchema = true` (schemas
  committed under `app/schemas/`), version 1.
- **`tree/` entities:**
  - `DirectoryEntity(id, parentId: Long?, name, createdAt)` with a foreign key
    on `parentId` → `id`, `ON DELETE CASCADE`, index on `parentId`.
  - `LinkEntity(id, directoryId, title, url, thumbnailUrl: String?, views,
    createdAt)` with a foreign key on `directoryId`, `ON DELETE CASCADE`, index
    on `directoryId`.
  - `SyncStateEntity(id = 1, revision: Long, serverUrl: String)`.
  The cascades mirror the backend, so a local recursive delete is one
  `DELETE`.
- **`TreeDao`:** observe a directory, its child directories (ordered by name)
  and its links (ordered by `createdAt` descending) as `Flow`s; observe all
  directories (for the move picker); replace the whole tree; the revision.
- **`TreeRepository`:**
  - `refresh()`: `GetTree(knownRevision)` (0 with no cache). On
    `not_modified` do nothing. Otherwise replace all rows and the revision in
    one transaction. Concurrent calls share one in-flight request (a `Mutex`).
  - `applyWrite(previousRevision, revision, change: suspend TreeDao.() -> Unit)`:
    in one transaction, if `previousRevision` equals the cached revision, run
    `change` and store `revision`; otherwise skip `change`. After the
    transaction, call `refresh()` if it was skipped.
  - When the saved server URL differs from `SyncStateEntity.serverUrl`, clear
    the cache before the next refresh (a different server is a different
    tree).
- **`convert.kt`:** proto ↔ entity, `Timestamp` ↔ epoch millis.
- **Triggers:** `refresh()` on `ProcessLifecycleOwner` `ON_START` while
  settings exist. Failures are logged and exposed as a `Flow` of the last sync
  error for the UI; they never clear the cache.

## Tests

Robolectric + in-memory Room + a fake `TreeServiceClient`: first sync with
revision 0; `not_modified` leaves rows untouched; a stale revision replaces
everything; `applyWrite` applies when revisions match and refreshes when they
don't; deleting a directory cascades to subdirectories and links; changing the
server URL clears the cache.
