package dev.ikana.miolink.tree

import android.database.SQLException
import android.util.Log
import androidx.lifecycle.Lifecycle
import androidx.room.withTransaction
import dev.ikana.miolink.core.database.MioDatabase
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.network.getOrThrowApi
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeResponse
import dev.ikana.miolink.gen.miolink.tree.v1.getTreeRequest
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * The cached tree and the client side of the revision protocol (see "Data
 * flow and sync" in `mioandroid/CLAUDE.md`).
 *
 * Room is the source of truth for the UI: screens observe the flows below,
 * which change when [refresh] replaces the tree or [applyWrite] applies a
 * write. [scope] runs refreshes, so a refresh outlives the screen that asked
 * for it and concurrent callers can share it.
 */
class TreeRepository(
    private val database: MioDatabase,
    private val serviceClients: ServiceClientsProvider,
    private val scope: CoroutineScope,
) : TreeSource {
    private val dao = database.treeDao()

    private val _lastSyncError = MutableStateFlow<ApiError?>(null)

    /** Why the last [refresh] failed, or null after one succeeds. */
    override val lastSyncError: StateFlow<ApiError?> = _lastSyncError.asStateFlow()

    private val refreshLock = Mutex()
    private var inFlight: Deferred<ApiError?>? = null

    override fun directory(id: Long): Flow<DirectoryEntity?> = dao.observeDirectory(id)

    /** Subdirectories of [parentId], by name. */
    override fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>> =
        dao.observeChildDirectories(parentId)

    /** Links in [directoryId], newest first. */
    override fun links(directoryId: Long): Flow<List<LinkEntity>> = dao.observeLinks(directoryId)

    /** Every directory, the root included, ordered by id. */
    override fun allDirectories(): Flow<List<DirectoryEntity>> = dao.observeAllDirectories()

    override fun link(id: Long): Flow<LinkEntity?> = dao.observeLink(id)

    /** The cached revision, or null while nothing is cached. */
    override val revision: Flow<Long?> = dao.observeRevision()

    /**
     * Stores a link's new view count. `RecordView` doesn't change the
     * revision, so this bypasses [applyWrite].
     */
    suspend fun setLinkViews(linkId: Long, views: Long) = dao.setLinkViews(linkId, views)

    /**
     * Brings the cache up to date with `GetTree`. Concurrent calls share one
     * request. Never throws an API failure: it returns it (null on success),
     * logs it and exposes it in [lastSyncError]. A failure never clears the
     * cache.
     */
    override suspend fun refresh(): ApiError? {
        val request = refreshLock.withLock {
            inFlight?.takeIf { it.isActive }
                ?: scope.async { fetchAndStore() }.also { inFlight = it }
        }
        return request.await()
    }

    /**
     * Applies a write RPC's result to the cache. If [previousRevision] is the
     * cached revision, runs [change] and stores [revision] in one
     * transaction. Otherwise another device changed the tree first, so
     * [change] is skipped and the tree is refetched.
     *
     * Returns whether [change] was applied. Either way the UI updates from
     * Room.
     */
    suspend fun applyWrite(
        previousRevision: Long,
        revision: Long,
        change: suspend TreeDao.() -> Unit,
    ): Boolean {
        val applied = try {
            database.withTransaction {
                if (dao.getSyncState()?.revision != previousRevision) return@withTransaction false
                dao.change()
                dao.setRevision(revision)
                true
            }
        } catch (e: SQLException) {
            // The cache didn't hold what the change needs (a parent that's
            // gone, say); the transaction rolled back. Refetch instead.
            Log.w(TAG, "Couldn't apply a write locally", e)
            false
        }
        if (!applied) {
            refresh()
            // A refresh already in flight may have started before this write.
            if ((dao.getSyncState()?.revision ?: 0) < revision) refresh()
        }
        return applied
    }

    /**
     * Refreshes whenever [lifecycle] (the process's) reaches STARTED while
     * [settings] exist, and when the settings change while started, which
     * also clears the cache of a previous server.
     */
    fun syncWhileStarted(lifecycle: Lifecycle, settings: Flow<ServerSettings?>): Job = scope.launch {
        val started = lifecycle.currentStateFlow
            .map { it.isAtLeast(Lifecycle.State.STARTED) }
            .distinctUntilChanged()
        combine(started, settings) { isStarted, saved -> isStarted && saved != null }
            .collect { shouldSync -> if (shouldSync) refresh() }
    }

    private suspend fun fetchAndStore(): ApiError? = try {
        val clients = serviceClients.current()
        val baseUrl = clients.baseUrl
        var attempts = 0
        while (true) {
            attempts++
            val known = database.withTransaction {
                val state = dao.getSyncState()
                if (state != null && state.serverUrl != baseUrl) {
                    // A different server is a different tree.
                    clearCache()
                    0L
                } else {
                    state?.revision ?: 0L
                }
            }
            val response = clients.tree
                .getTree(getTreeRequest { knownRevision = known })
                .getOrThrowApi()
            val stored = database.withTransaction {
                // A write applied while the request was in flight is newer
                // than this response may be; fetch again rather than lose it.
                val state = dao.getSyncState()?.takeIf { it.serverUrl == baseUrl }
                if ((state?.revision ?: 0L) != known) return@withTransaction false
                if (!response.notModified) replaceTree(response, baseUrl)
                true
            }
            if (stored || attempts >= MAX_ATTEMPTS) break
        }
        _lastSyncError.value = null
        null
    } catch (e: CancellationException) {
        throw e
    } catch (e: ApiException) {
        Log.w(TAG, "Couldn't refresh the tree: ${e.error}", e)
        _lastSyncError.value = e.error
        e.error
    } catch (e: Exception) {
        Log.e(TAG, "Couldn't store the tree", e)
        ApiError.Unknown(null).also { _lastSyncError.value = it }
    }

    private suspend fun replaceTree(response: GetTreeResponse, baseUrl: String) {
        clearCache()
        dao.insertDirectories(parentsFirst(response.directoriesList.map { it.toEntity() }))
        dao.insertLinks(response.linksList.map { it.toEntity(baseUrl) })
        dao.upsertSyncState(SyncStateEntity(revision = response.revision, serverUrl = baseUrl))
    }

    private suspend fun clearCache() {
        dao.deleteAllLinks()
        dao.deleteAllDirectories()
        dao.deleteSyncState()
    }

    private companion object {
        const val TAG = "TreeRepository"
        const val MAX_ATTEMPTS = 3
    }
}
