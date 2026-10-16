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
import dev.ikana.miolink.directory.DirectoryNameError
import dev.ikana.miolink.directory.DirectoryRepository
import dev.ikana.miolink.directory.RejectedName
import dev.ikana.miolink.directory.validateDirectoryName
import dev.ikana.miolink.link.LinkRepository
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SubtreeCount
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

    /** A write failed in a way its dialog can't fix (the API key, say). */
    data class WriteError(val error: ApiError) : BrowseMessage

    /** Offers to open the new directory. */
    data class DirectoryCreated(val id: Long, val name: String) : BrowseMessage
    data class DirectoryRenamed(val name: String) : BrowseMessage

    /** [destination] is the new parent's name, empty for the root. */
    data class DirectoryMoved(val name: String, val destination: String) : BrowseMessage
    data class DirectoryDeleted(val name: String) : BrowseMessage

    /** A write found its directory gone (`NOT_FOUND`); the cache is refreshing. */
    data object DirectoryGone : BrowseMessage

    /** [destination] is the directory's name, empty for the root. */
    data class LinkMoved(val title: String, val destination: String) : BrowseMessage
    data class LinkDeleted(val title: String) : BrowseMessage

    /** A write found its link gone (`NOT_FOUND`); the cache is refreshing. */
    data object LinkGone : BrowseMessage

    /** Shown as is: a message another screen left for this one. */
    data class Text(val text: String) : BrowseMessage
}

/**
 * The dialog or sheet on top of the directory, if any. [failure] is why the
 * last attempt failed when the dialog can offer a retry (unreachable server,
 * a refused move); name problems go in [RejectedName] instead.
 */
sealed interface BrowseDialog {
    /** The long-press menu: rename, move, delete. */
    data class DirectoryActions(val directory: DirectoryEntity) : BrowseDialog

    data class NewDirectory(
        val rejected: RejectedName? = null,
        val failure: ApiError? = null,
    ) : BrowseDialog

    data class RenameDirectory(
        val directory: DirectoryEntity,
        val rejected: RejectedName? = null,
        val failure: ApiError? = null,
    ) : BrowseDialog

    data class MoveDirectory(
        val directory: DirectoryEntity,
        val failure: ApiError? = null,
    ) : BrowseDialog

    /** [count] is what the recursive delete removes with it, from the cache. */
    data class DeleteDirectory(
        val directory: DirectoryEntity,
        val count: SubtreeCount,
        val failure: ApiError? = null,
    ) : BrowseDialog

    /** `AddLinkSheet` for this directory. */
    data class AddLink(val failure: ApiError? = null) : BrowseDialog

    /** The long-press menu on a link: edit, move, delete. */
    data class LinkActions(val link: LinkEntity) : BrowseDialog

    data class MoveLink(
        val link: LinkEntity,
        val failure: ApiError? = null,
    ) : BrowseDialog

    data class DeleteLink(
        val link: LinkEntity,
        val failure: ApiError? = null,
    ) : BrowseDialog
}

/** The directory a dialog acts on, if it acts on one. */
val BrowseDialog.directory: DirectoryEntity?
    get() = when (this) {
        is BrowseDialog.DirectoryActions -> directory
        is BrowseDialog.RenameDirectory -> directory
        is BrowseDialog.MoveDirectory -> directory
        is BrowseDialog.DeleteDirectory -> directory
        is BrowseDialog.NewDirectory,
        is BrowseDialog.AddLink,
        is BrowseDialog.LinkActions,
        is BrowseDialog.MoveLink,
        is BrowseDialog.DeleteLink,
        -> null
    }

/** The link a dialog acts on, if it acts on one. */
val BrowseDialog.link: LinkEntity?
    get() = when (this) {
        is BrowseDialog.LinkActions -> link
        is BrowseDialog.MoveLink -> link
        is BrowseDialog.DeleteLink -> link
        else -> null
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
    /** Every cached directory, the root included, for the move picker. */
    val allDirectories: List<DirectoryEntity> = emptyList(),
    /** A tree is cached. False on first launch until the first sync. */
    val hasCache: Boolean = false,
    /** Why the last sync failed; shown in full screen while nothing is cached. */
    val syncError: ApiError? = null,
    /** A pull-to-refresh (or retry) is running. */
    val isRefreshing: Boolean = false,
    val message: BrowseMessage? = null,
    val dialog: BrowseDialog? = null,
    /** A write from [dialog] is in flight. */
    val isSaving: Boolean = false,
    /**
     * The directory no longer exists (deleted on another device): the
     * nearest ancestor that still does, to navigate to instead.
     */
    val redirectTo: Long? = null,
    /** A link was just created here: open its edit screen, then [BrowseAction.LinkEditOpened]. */
    val editLinkId: Long? = null,
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

    // Directory writes. The root is never listed, so it has none of these.

    data object ShowNewDirectory : BrowseAction

    /** A long press on a subdirectory. */
    data class ShowDirectoryActions(val directory: DirectoryEntity) : BrowseAction
    data class ShowRenameDirectory(val directory: DirectoryEntity) : BrowseAction
    data class ShowMoveDirectory(val directory: DirectoryEntity) : BrowseAction

    /** Counts what the delete removes, then asks to confirm. */
    data class ShowDeleteDirectory(val directory: DirectoryEntity) : BrowseAction

    /** Closes the dialog, unless a write from it is in flight. */
    data object DismissDialog : BrowseAction

    /** Creates [name] in this directory. */
    data class CreateDirectory(val name: String) : BrowseAction
    data class RenameDirectory(val id: Long, val name: String) : BrowseAction
    data class MoveDirectory(val id: Long, val newParentId: Long) : BrowseAction
    data class DeleteDirectory(val id: Long) : BrowseAction

    // Links.

    /** Opens `LinkEditScreen`; handled by the screen. */
    data class EditLink(val id: Long) : BrowseAction

    /** The screen opened [BrowseUiState.editLinkId]. */
    data object LinkEditOpened : BrowseAction

    /** Another screen left a message to show here. */
    data class ShowText(val text: String) : BrowseAction

    data object ShowAddLink : BrowseAction

    /** Creates a link to [url] (already checked) in this directory. */
    data class CreateLink(val url: String) : BrowseAction

    /** A long press on a link. */
    data class ShowLinkActions(val link: LinkEntity) : BrowseAction
    data class ShowMoveLink(val link: LinkEntity) : BrowseAction
    data class ShowDeleteLink(val link: LinkEntity) : BrowseAction
    data class MoveLink(val id: Long, val directoryId: Long) : BrowseAction
    data class DeleteLink(val id: Long) : BrowseAction
}

/**
 * One directory's contents from the cached tree. Handles refreshes, the view
 * count of [BrowseAction.OpenLink], messages, and the directory and link
 * dialogs and writes; navigation actions belong to the screen. A created
 * link opens its edit screen through [BrowseUiState.editLinkId].
 *
 * A write keeps its dialog open until it finishes. `ALREADY_EXISTS` and
 * `INVALID_ARGUMENT` stay in the dialog (under the name field), as do
 * failures worth retrying; `NOT_FOUND` closes it and refreshes, and a
 * rejected API key closes it with a snackbar that offers Settings.
 */
class BrowseViewModel(
    private val directoryId: Long,
    private val tree: TreeSource,
    private val links: LinkRepository,
    private val directories: DirectoryRepository,
) : ViewModel() {
    private data class Local(
        val isRefreshing: Boolean = false,
        val message: BrowseMessage? = null,
        val dialog: BrowseDialog? = null,
        val isSaving: Boolean = false,
        val editLinkId: Long? = null,
    )

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
            BrowseAction.ShowNewDirectory -> showDialog(BrowseDialog.NewDirectory())
            is BrowseAction.ShowDirectoryActions -> showDialog(BrowseDialog.DirectoryActions(action.directory))
            is BrowseAction.ShowRenameDirectory -> showDialog(BrowseDialog.RenameDirectory(action.directory))
            is BrowseAction.ShowMoveDirectory -> showDialog(BrowseDialog.MoveDirectory(action.directory))
            is BrowseAction.ShowDeleteDirectory -> showDelete(action.directory)
            BrowseAction.DismissDialog -> local.update { if (it.isSaving) it else it.copy(dialog = null) }
            is BrowseAction.CreateDirectory -> createDirectory(action.name)
            is BrowseAction.RenameDirectory -> renameDirectory(action.id, action.name)
            is BrowseAction.MoveDirectory -> moveDirectory(action.id, action.newParentId)
            is BrowseAction.DeleteDirectory -> deleteDirectory(action.id)
            BrowseAction.LinkEditOpened -> local.update { it.copy(editLinkId = null) }
            is BrowseAction.ShowText -> post(BrowseMessage.Text(action.text))
            BrowseAction.ShowAddLink -> showDialog(BrowseDialog.AddLink())
            is BrowseAction.CreateLink -> createLink(action.url)
            is BrowseAction.ShowLinkActions -> showDialog(BrowseDialog.LinkActions(action.link))
            is BrowseAction.ShowMoveLink -> showDialog(BrowseDialog.MoveLink(action.link))
            is BrowseAction.ShowDeleteLink -> showDialog(BrowseDialog.DeleteLink(action.link))
            is BrowseAction.MoveLink -> moveLink(action.id, action.directoryId)
            is BrowseAction.DeleteLink -> deleteLink(action.id)
            is BrowseAction.OpenDirectory,
            is BrowseAction.OpenAncestor,
            BrowseAction.NavigateUp,
            BrowseAction.OpenSettings,
            is BrowseAction.EditLink,
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
        // A dialog about a directory or link deleted (or moved away)
        // elsewhere has nothing left to act on.
        val linkIds = links.mapTo(HashSet()) { it.id }
        val dialog = local.dialog?.takeIf { dialog ->
            local.isSaving ||
                (dialog.directory.let { it == null || it.id in byId } && dialog.link.let { it == null || it.id in linkIds })
        }
        return BrowseUiState(
            directoryId = directoryId,
            name = current?.name.orEmpty(),
            ancestors = ancestors,
            directories = if (current != null) children else emptyList(),
            links = if (current != null) links else emptyList(),
            allDirectories = all,
            hasCache = all.isNotEmpty(),
            syncError = syncError,
            isRefreshing = local.isRefreshing,
            message = local.message,
            dialog = dialog,
            isSaving = local.isSaving,
            redirectTo = redirectTo,
            editLinkId = local.editLinkId,
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

    private fun showDialog(dialog: BrowseDialog) = local.update { if (it.isSaving) it else it.copy(dialog = dialog) }

    private fun showDelete(directory: DirectoryEntity) {
        if (local.value.isSaving) return
        // Close the actions sheet while the subtree is counted.
        local.update { it.copy(dialog = null) }
        viewModelScope.launch {
            val count = tree.subtreeCount(directory.id)
            showDialog(BrowseDialog.DeleteDirectory(directory, count))
        }
    }

    /** The current names in this directory, except [exceptId]'s. */
    private fun siblingNames(exceptId: Long? = null): Set<String> =
        state.value.directories.filter { it.id != exceptId }.mapTo(HashSet()) { it.name }

    /** Directory [id], from the open dialog or else the cache. */
    private fun directoryById(id: Long): DirectoryEntity? =
        local.value.dialog?.directory?.takeIf { it.id == id }
            ?: state.value.allDirectories.firstOrNull { it.id == id }

    private fun createDirectory(name: String) {
        validateDirectoryName(name, siblingNames())?.let { error ->
            showDialog(BrowseDialog.NewDirectory(rejected = RejectedName(name, error)))
            return
        }
        write(
            onFailure = { error ->
                BrowseDialog.NewDirectory(rejected = error.rejectedName(name), failure = error.retryable())
            },
        ) {
            val id = directories.create(directoryId, name)
            BrowseMessage.DirectoryCreated(id, name)
        }
    }

    private fun renameDirectory(id: Long, name: String) {
        val directory = directoryById(id) ?: return
        validateDirectoryName(name, siblingNames(exceptId = id))?.let { error ->
            showDialog(BrowseDialog.RenameDirectory(directory, rejected = RejectedName(name, error)))
            return
        }
        write(
            onFailure = { error ->
                BrowseDialog.RenameDirectory(
                    directory = directory,
                    rejected = error.rejectedName(name),
                    failure = error.retryable(),
                )
            },
        ) {
            directories.rename(id, name)
            BrowseMessage.DirectoryRenamed(name)
        }
    }

    private fun moveDirectory(id: Long, newParentId: Long) {
        val directory = directoryById(id) ?: return
        val destination = directoryById(newParentId)?.name.orEmpty()
        write(onFailure = { error -> BrowseDialog.MoveDirectory(directory, failure = error) }) {
            directories.move(id, newParentId)
            BrowseMessage.DirectoryMoved(directory.name, destination)
        }
    }

    private fun deleteDirectory(id: Long) {
        val dialog = local.value.dialog as? BrowseDialog.DeleteDirectory ?: return
        if (dialog.directory.id != id) return
        write(onFailure = { error -> dialog.copy(failure = error) }) {
            directories.delete(id)
            BrowseMessage.DirectoryDeleted(dialog.directory.name)
        }
    }

    private fun createLink(url: String) {
        if (local.value.dialog !is BrowseDialog.AddLink) return
        write(onFailure = { error -> BrowseDialog.AddLink(failure = error) }) {
            val id = links.create(directoryId, url)
            local.update { it.copy(editLinkId = id) }
            null
        }
    }

    /** Link [id], from the open dialog or else this directory's links. */
    private fun linkById(id: Long): LinkEntity? =
        local.value.dialog?.link?.takeIf { it.id == id } ?: state.value.links.firstOrNull { it.id == id }

    private fun moveLink(id: Long, directoryId: Long) {
        val link = linkById(id) ?: return
        val destination = directoryById(directoryId)?.name.orEmpty()
        write(
            onFailure = { error -> BrowseDialog.MoveLink(link, failure = error) },
            gone = BrowseMessage.LinkGone,
        ) {
            links.move(id, directoryId)
            BrowseMessage.LinkMoved(link.title, destination)
        }
    }

    private fun deleteLink(id: Long) {
        val dialog = local.value.dialog as? BrowseDialog.DeleteLink ?: return
        if (dialog.link.id != id) return
        write(onFailure = { error -> dialog.copy(failure = error) }, gone = BrowseMessage.LinkGone) {
            links.delete(id)
            BrowseMessage.LinkDeleted(dialog.link.title)
        }
    }

    /**
     * Runs a write from the open dialog: marks it saving, then closes it with
     * [block]'s message (if any), or handles the failure (see the class
     * comment); [onFailure] gives the dialog to show again for the failures
     * it keeps, and [gone] is the message for `NOT_FOUND`.
     */
    private fun write(
        onFailure: (ApiError) -> BrowseDialog,
        gone: BrowseMessage = BrowseMessage.DirectoryGone,
        block: suspend () -> BrowseMessage?,
    ) {
        if (local.value.isSaving) return
        local.update { it.copy(isSaving = true) }
        viewModelScope.launch {
            try {
                val message = block()
                local.update { it.copy(isSaving = false, dialog = null, message = message ?: it.message) }
            } catch (e: ApiException) {
                Log.w(TAG, "A write failed: ${e.error}")
                when (e.error) {
                    ApiError.NotFound -> {
                        local.update { it.copy(isSaving = false, dialog = null, message = gone) }
                        tree.refresh()
                    }
                    ApiError.Unauthenticated, ApiError.NotConfigured -> local.update {
                        it.copy(isSaving = false, dialog = null, message = BrowseMessage.WriteError(e.error))
                    }
                    else -> local.update { it.copy(isSaving = false, dialog = onFailure(e.error)) }
                }
            }
        }
    }

    companion object {
        private const val TAG = "BrowseViewModel"

        fun factory(directoryId: Long): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                BrowseViewModel(
                    directoryId = directoryId,
                    tree = appContainer.treeRepository,
                    links = appContainer.linkRepository,
                    directories = appContainer.directoryRepository,
                )
            }
        }
    }
}

/** The name field's error for a server refusal, or null for other failures. */
private fun ApiError.rejectedName(name: String): RejectedName? = when (this) {
    is ApiError.AlreadyExists -> RejectedName(name, DirectoryNameError.Duplicate)
    is ApiError.InvalidArgument -> RejectedName(name, DirectoryNameError.Rejected(message))
    else -> null
}

/** This failure, unless it's about the name (shown by [rejectedName] instead). */
private fun ApiError.retryable(): ApiError? =
    takeUnless { it is ApiError.AlreadyExists || it is ApiError.InvalidArgument }

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
