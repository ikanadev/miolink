package dev.ikana.miolink.tree

import dev.ikana.miolink.core.network.ApiError
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

/**
 * The read side of the cached tree, as screens see it. [TreeRepository] is
 * the implementation; ViewModel tests use a fake.
 */
interface TreeSource {
    fun directory(id: Long): Flow<DirectoryEntity?>

    /** Subdirectories of [parentId], by name. */
    fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>>

    /** Links in [directoryId], newest first. */
    fun links(directoryId: Long): Flow<List<LinkEntity>>

    /**
     * Every directory, the root included, ordered by id. Empty while nothing
     * is cached: a cached tree always holds the root.
     */
    fun allDirectories(): Flow<List<DirectoryEntity>>

    fun link(id: Long): Flow<LinkEntity?>

    /** What deleting directory [id] would remove with it, from the cache. */
    suspend fun subtreeCount(id: Long): SubtreeCount

    /** The cached revision, or null while nothing is cached. */
    val revision: Flow<Long?>

    /** Why the last [refresh] failed, or null after one succeeds. */
    val lastSyncError: StateFlow<ApiError?>

    /**
     * Brings the cache up to date. Returns the failure (null on success);
     * never throws an API failure.
     */
    suspend fun refresh(): ApiError?
}
