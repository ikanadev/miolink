package dev.ikana.miolink.browse

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.ikana.miolink.appContainer
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.link.LinkRepository
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** One step of a directory's path. The root's [name] is empty. */
data class PathSegment(val id: Long, val name: String)

/** Something to tell the user once, in a snackbar. */
sealed interface BrowseMessage {
    /** A refresh or `RecordView` failed. */
    data class Error(val error: ApiError) : BrowseMessage
}

data class BrowseUiState(
    val directoryId: Long,
    /** The directory's name; empty for the root or before the cache loads. */
    val name: String = "",
    /** From the root down to the parent; empty at the root. */
    val ancestors: List<PathSegment> = emptyList(),
    /** Subdirectories, by name. */
    val directories: List<DirectoryEntity> = emptyList(),
    /** Links, newest first. */
    val links: List<LinkEntity> = emptyList(),
    /** A tree is cached. False on first launch until the first sync. */
    val hasCache: Boolean = false,
    /** Why the last sync failed; shown in full screen while nothing is cached. */
    val syncError: ApiError? = null,
    /** A pull-to-refresh (or retry) is running. */
    val isRefreshing: Boolean = false,
    val message: BrowseMessage? = null,
    /**
     * The directory no longer exists (deleted on another device): the
     * nearest ancestor that still does, to navigate to instead.
     */
    val redirectTo: Long? = null,
) {
    val isRoot: Boolean get() = directoryId == ROOT_DIRECTORY_ID

    /** Nothing to show yet: the first sync is running. */
    val isLoading: Boolean get() = !hasCache && (syncError == null || isRefreshing)

    val isEmpty: Boolean get() = hasCache && directories.isEmpty() && links.isEmpty()
}

sealed interface BrowseAction {
    data class OpenDirectory(val id: Long) : BrowseAction

    /** A breadcrumb was tapped. */
    data class OpenAncestor(val id: Long) : BrowseAction

    /** The link was opened in the browser; counts the view. */
    data class OpenLink(val link: LinkEntity) : BrowseAction
    data object NavigateUp : BrowseAction
    data object OpenSettings : BrowseAction

    /** Pull-to-refresh or a retry button. */
    data object Refresh : BrowseAction
    data class MessageShown(val message: BrowseMessage) : BrowseAction
}

/**
 * One directory's contents from the cached tree. Handles [BrowseAction.Refresh],
 * [BrowseAction.OpenLink] (the view count) and [BrowseAction.MessageShown];
 * navigation actions belong to the screen.
 */
class BrowseViewModel(
    private val directoryId: Long,
    private val tree: TreeSource,
    private val links: LinkRepository,
) : ViewModel() {
    private data class Local(val isRefreshing: Boolean = false, val message: BrowseMessage? = null)

    private val local = MutableStateFlow(Local())

    /** The last path seen to the directory, to find an ancestor if it disappears. */
    private var lastKnownAncestors: List<Long> = emptyList()

    val state: StateFlow<BrowseUiState> = combine(
        tree.allDirectories(),
        tree.childDirectories(directoryId),
        tree.links(directoryId),
        tree.lastSyncError,
        local,
    ) { all, children, links, syncError, local ->
        buildState(all, children, links, syncError, local)
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        BrowseUiState(directoryId = directoryId),
    )

    init {
        // Background syncs (the app coming to the foreground) that fail. The
        // current value is old news; a pull-to-refresh reports its own.
        viewModelScope.launch {
            tree.lastSyncError.drop(1).collect { error ->
                if (error != null && !local.value.isRefreshing) post(BrowseMessage.Error(error))
            }
        }
    }

    fun onAction(action: BrowseAction) {
        when (action) {
            BrowseAction.Refresh -> refresh()
            is BrowseAction.OpenLink -> recordView(action.link.id)
            is BrowseAction.MessageShown -> local.update {
                if (it.message == action.message) it.copy(message = null) else it
            }
            is BrowseAction.OpenDirectory,
            is BrowseAction.OpenAncestor,
            BrowseAction.NavigateUp,
            BrowseAction.OpenSettings,
            -> Unit
        }
    }

    private fun buildState(
        all: List<DirectoryEntity>,
        children: List<DirectoryEntity>,
        links: List<LinkEntity>,
        syncError: ApiError?,
        local: Local,
    ): BrowseUiState {
        val byId = all.associateBy { it.id }
        val current = byId[directoryId]
        val ancestors = current?.let { ancestorsOf(it, byId) }.orEmpty()
        if (current != null) lastKnownAncestors = ancestors.map { it.id }
        // An empty list means nothing is cached (a cached tree has the root).
        val redirectTo = if (current == null && all.isNotEmpty()) {
            lastKnownAncestors.lastOrNull { it in byId } ?: ROOT_DIRECTORY_ID
        } else {
            null
        }
        return BrowseUiState(
            directoryId = directoryId,
            name = current?.name.orEmpty(),
            ancestors = ancestors,
            directories = if (current != null) children else emptyList(),
            links = if (current != null) links else emptyList(),
            hasCache = all.isNotEmpty(),
            syncError = syncError,
            isRefreshing = local.isRefreshing,
            message = local.message,
            redirectTo = redirectTo,
        )
    }

    private fun refresh() {
        if (local.value.isRefreshing) return
        local.update { it.copy(isRefreshing = true) }
        viewModelScope.launch {
            val error = tree.refresh()
            local.update {
                it.copy(
                    isRefreshing = false,
                    message = error?.let(BrowseMessage::Error) ?: it.message,
                )
            }
        }
    }

    private fun recordView(linkId: Long) {
        viewModelScope.launch {
            try {
                links.recordView(linkId)
            } catch (e: ApiException) {
                Log.w(TAG, "Couldn't record a view: ${e.error}")
                when (e.error) {
                    // Deleted on another device; the refresh removes it here.
                    ApiError.NotFound -> tree.refresh()
                    ApiError.Unauthenticated -> post(BrowseMessage.Error(e.error))
                    // A lost view count isn't worth interrupting the user.
                    else -> Unit
                }
            }
        }
    }

    private fun post(message: BrowseMessage) = local.update { it.copy(message = message) }

    companion object {
        private const val TAG = "BrowseViewModel"

        fun factory(directoryId: Long): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                BrowseViewModel(
                    directoryId = directoryId,
                    tree = appContainer.treeRepository,
                    links = appContainer.linkRepository,
                )
            }
        }
    }
}

/** [directory]'s ancestors from the root down to its parent. */
internal fun ancestorsOf(
    directory: DirectoryEntity,
    byId: Map<Long, DirectoryEntity>,
): List<PathSegment> {
    val path = ArrayList<PathSegment>()
    val seen = hashSetOf(directory.id)
    var parentId = directory.parentId
    while (parentId != null && seen.add(parentId)) {
        val parent = byId[parentId] ?: break
        path += PathSegment(parent.id, parent.name)
        parentId = parent.parentId
    }
    return path.asReversed()
}
