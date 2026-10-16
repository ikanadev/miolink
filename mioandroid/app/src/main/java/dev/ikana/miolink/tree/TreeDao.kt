package dev.ikana.miolink.tree

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

/**
 * The cached tree. Screens observe it through the `observe*` flows; writes
 * change it only inside [TreeRepository.applyWrite] (or `refresh()`), so
 * every local change lands in the same transaction as its revision.
 *
 * There is deliberately no `REPLACE` insert for directories: SQLite
 * implements it as delete + insert, which would cascade to the subtree.
 */
@Dao
interface TreeDao {
    // Reads for the UI.

    @Query("SELECT * FROM directories WHERE id = :id")
    fun observeDirectory(id: Long): Flow<DirectoryEntity?>

    /** Subdirectories of [parentId], by name (case-sensitive, like the backend). */
    @Query("SELECT * FROM directories WHERE parent_id = :parentId ORDER BY name")
    fun observeChildDirectories(parentId: Long): Flow<List<DirectoryEntity>>

    /** Links in [directoryId], newest first. */
    @Query("SELECT * FROM links WHERE directory_id = :directoryId ORDER BY created_at DESC, id DESC")
    fun observeLinks(directoryId: Long): Flow<List<LinkEntity>>

    /** Every directory, the root included, for pickers that rebuild the nesting. */
    @Query("SELECT * FROM directories ORDER BY id")
    fun observeAllDirectories(): Flow<List<DirectoryEntity>>

    @Query("SELECT * FROM links WHERE id = :id")
    fun observeLink(id: Long): Flow<LinkEntity?>

    @Query("SELECT * FROM links WHERE id = :id")
    suspend fun getLink(id: Long): LinkEntity?

    @Query("SELECT * FROM directories WHERE id = :id")
    suspend fun getDirectory(id: Long): DirectoryEntity?

    /**
     * What deleting directory [id] removes with it: its subdirectories at any
     * depth and the links in it and in them. Zeros when it isn't cached.
     */
    @Query(
        """
        WITH RECURSIVE subtree(id) AS (
            SELECT id FROM directories WHERE id = :id
            UNION ALL
            SELECT d.id FROM directories d JOIN subtree s ON d.parent_id = s.id
        )
        SELECT MAX((SELECT COUNT(*) FROM subtree) - 1, 0) AS subdirectories,
               (SELECT COUNT(*) FROM links WHERE directory_id IN (SELECT id FROM subtree)) AS links
        """,
    )
    suspend fun countSubtree(id: Long): SubtreeCount

    // Sync state.

    @Query("SELECT * FROM sync_state WHERE id = 1")
    suspend fun getSyncState(): SyncStateEntity?

    /** The cached revision, or null with no cache. */
    @Query("SELECT revision FROM sync_state WHERE id = 1")
    fun observeRevision(): Flow<Long?>

    @Upsert
    suspend fun upsertSyncState(state: SyncStateEntity)

    @Query("UPDATE sync_state SET revision = :revision WHERE id = 1")
    suspend fun setRevision(revision: Long)

    // Local changes, for TreeRepository.applyWrite.

    /** Inserts a new directory or updates an existing one in place (no cascade). */
    @Upsert
    suspend fun upsertDirectory(directory: DirectoryEntity)

    @Query("UPDATE directories SET name = :name WHERE id = :id")
    suspend fun renameDirectory(id: Long, name: String)

    @Query("UPDATE directories SET parent_id = :parentId WHERE id = :id")
    suspend fun moveDirectory(id: Long, parentId: Long)

    /** Deletes the directory, its subdirectories and all their links. */
    @Query("DELETE FROM directories WHERE id = :id")
    suspend fun deleteDirectory(id: Long)

    /** Inserts a new link or updates an existing one in place. */
    @Upsert
    suspend fun upsertLink(link: LinkEntity)

    @Query("UPDATE links SET directory_id = :directoryId WHERE id = :id")
    suspend fun moveLink(id: Long, directoryId: Long)

    @Query("DELETE FROM links WHERE id = :id")
    suspend fun deleteLink(id: Long)

    /** For `RecordView`, which doesn't change the revision: call it directly. */
    @Query("UPDATE links SET views = :views WHERE id = :id")
    suspend fun setLinkViews(id: Long, views: Long)

    // Whole-tree operations, for TreeRepository. Call inside a transaction.

    /** Parents must come before their children (foreign keys are checked per row). */
    @Insert
    suspend fun insertDirectories(directories: List<DirectoryEntity>)

    @Insert
    suspend fun insertLinks(links: List<LinkEntity>)

    @Query("DELETE FROM links")
    suspend fun deleteAllLinks()

    @Query("DELETE FROM directories")
    suspend fun deleteAllDirectories()

    @Query("DELETE FROM sync_state")
    suspend fun deleteSyncState()
}
