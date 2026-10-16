package dev.ikana.miolink.link

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.ikana.miolink.appContainer
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** The write in flight; only one runs at a time. */
enum class LinkEditOperation { Save, Move, RefreshMetadata, Delete }

/** The dialog or sheet on top of the screen, if any. */
sealed interface LinkEditDialog {
    /** [failure] is why the last attempt failed, to retry. */
    data class Move(val failure: ApiError? = null) : LinkEditDialog
    data class Delete(val failure: ApiError? = null) : LinkEditDialog

    /** Leaving with an unsaved title. */
    data object DiscardChanges : LinkEditDialog
}

/** Something to tell the user once, in a snackbar. */
sealed interface LinkEditMessage {
    /** [destination] is the directory's name, empty for the root. */
    data class Moved(val destination: String) : LinkEditMessage

    /** [changed] is false when the page's title and image were the same. */
    data class MetadataRefreshed(val changed: Boolean) : LinkEditMessage

    data class SaveFailed(val error: ApiError) : LinkEditMessage
    data class RefreshFailed(val error: ApiError) : LinkEditMessage

    /** A write failed because of the settings (rejected API key, say). */
    data class WriteError(val error: ApiError) : LinkEditMessage

    /** A move found its destination gone (`NOT_FOUND`); the cache is refreshing. */
    data object DirectoryGone : LinkEditMessage
}

/** Why the screen closed itself; the screen navigates back. */
sealed interface LinkEditExit {
    data object Saved : LinkEditExit

    /** The user left, discarding an unsaved title. */
    data object Discarded : LinkEditExit
    data class Deleted(val title: String) : LinkEditExit

    /** The link no longer exists (deleted on another device). */
    data object Gone : LinkEditExit
}

data class LinkEditUiState(
    /** Null until the cache loads, and after the link is gone. */
    val link: LinkEntity? = null,
    /** The title field's text. */
    val title: String = "",
    /** The user edited the title; until then it follows the saved one. */
    val isTitleEdited: Boolean = false,
    /** The title field differs from the saved title (ignoring surrounding spaces). */
    val hasChanges: Boolean = false,
    /** What to show under the title field. */
    val titleError: LinkTitleError? = null,
    /** From the root down to the link's directory; the root's name is empty. */
    val directoryPath: List<DirectoryEntity> = emptyList(),
    /** Every cached directory, the root included, for the move picker. */
    val allDirectories: List<DirectoryEntity> = emptyList(),
    val pending: LinkEditOperation? = null,
    val dialog: LinkEditDialog? = null,
    val message: LinkEditMessage? = null,
    val exit: LinkEditExit? = null,
) {
    val isLoading: Boolean get() = link == null && exit == null
    val isBusy: Boolean get() = pending != null
    val canSave: Boolean get() = hasChanges && titleError == null && pending == null
}

sealed interface LinkEditAction {
    data class TitleChanged(val title: String) : LinkEditAction

    /** Sends `UpdateLink` if the title changed, then closes the screen. */
    data object Save : LinkEditAction

    /** Back or up: closes, or asks first if the title changed. */
    data object Close : LinkEditAction
    data object ConfirmDiscard : LinkEditAction

    data object ShowMove : LinkEditAction
    data class MoveTo(val directoryId: Long) : LinkEditAction
    data object ShowDelete : LinkEditAction
    data object ConfirmDelete : LinkEditAction
    data object RefreshMetadata : LinkEditAction

    /** Closes the dialog, unless a write from it is in flight. */
    data object DismissDialog : LinkEditAction
    data class MessageShown(val message: LinkEditMessage) : LinkEditAction
}

/**
 * Edits one link from the cached tree: its title (saved only when it
 * changed), its directory, its metadata, or deletes it. When the link
 * disappears from the cache (deleted on another device) the screen closes
 * with [LinkEditExit.Gone].
 *
 * Failures follow the browse screen: input errors under the title,
 * retryable ones in their dialog or a snackbar, `NOT_FOUND` refreshes the
 * tree, and a rejected API key gets a snackbar that offers Settings.
 */
class LinkEditViewModel(
    private val linkId: Long,
    private val tree: TreeSource,
    private val links: LinkRepository,
) : ViewModel() {
    private data class Local(
        /** What the user typed; null while untouched, so the field follows the saved title. */
        val editedTitle: String? = null,
        val rejectedTitle: RejectedTitle? = null,
        val pending: LinkEditOperation? = null,
        val dialog: LinkEditDialog? = null,
        val message: LinkEditMessage? = null,
        val exit: LinkEditExit? = null,
    )

    private val local = MutableStateFlow(Local())

    val state: StateFlow<LinkEditUiState> = combine(
        tree.link(linkId),
        tree.allDirectories(),
        tree.revision,
        local,
    ) { link, directories, revision, local ->
        buildState(link, directories, revision, local)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), LinkEditUiState())

    fun onAction(action: LinkEditAction) {
        when (action) {
            is LinkEditAction.TitleChanged -> local.update { it.copy(editedTitle = action.title) }
            LinkEditAction.Save -> save()
            LinkEditAction.Close -> close()
            LinkEditAction.ConfirmDiscard -> local.update { it.copy(dialog = null, exit = LinkEditExit.Discarded) }
            LinkEditAction.ShowMove -> showDialog(LinkEditDialog.Move())
            is LinkEditAction.MoveTo -> move(action.directoryId)
            LinkEditAction.ShowDelete -> showDialog(LinkEditDialog.Delete())
            LinkEditAction.ConfirmDelete -> delete()
            LinkEditAction.RefreshMetadata -> refreshMetadata()
            LinkEditAction.DismissDialog -> local.update {
                if (it.pending != null && it.dialog !is LinkEditDialog.DiscardChanges) it else it.copy(dialog = null)
            }
            is LinkEditAction.MessageShown -> local.update {
                if (it.message == action.message) it.copy(message = null) else it
            }
        }
    }

    private fun buildState(
        link: LinkEntity?,
        directories: List<DirectoryEntity>,
        revision: Long?,
        local: Local,
    ): LinkEditUiState {
        // With a tree cached, a missing link was deleted (here, by our own
        // delete, which sets its own exit, or elsewhere).
        val exit = local.exit ?: if (link == null && revision != null && local.pending != LinkEditOperation.Delete) {
            LinkEditExit.Gone
        } else {
            null
        }
        val title = local.editedTitle ?: link?.title.orEmpty()
        val hasChanges = link != null && local.editedTitle != null && title.trim() != link.title
        val validation = validateLinkTitle(title)
        val titleError = when {
            local.rejectedTitle != null && local.rejectedTitle.title == title -> local.rejectedTitle.error
            // An empty title shows once the user has edited it.
            local.editedTitle != null -> validation
            else -> validation?.takeIf { it == LinkTitleError.TooLong }
        }
        return LinkEditUiState(
            link = link,
            title = title,
            isTitleEdited = local.editedTitle != null,
            hasChanges = hasChanges,
            titleError = titleError,
            directoryPath = link?.let { pathTo(it.directoryId, directories) }.orEmpty(),
            allDirectories = directories,
            pending = local.pending,
            dialog = local.dialog.takeIf { link != null },
            message = local.message,
            exit = exit,
        )
    }

    private fun showDialog(dialog: LinkEditDialog) =
        local.update { if (it.pending != null) it else it.copy(dialog = dialog) }

    private fun post(message: LinkEditMessage) = local.update { it.copy(message = message) }

    /**
     * The title the user typed, when it differs from the saved one. Read
     * from [local] rather than [state], which may not have caught up yet.
     */
    private fun changedTitle(): String? {
        val saved = state.value.link?.title ?: return null
        return local.value.editedTitle?.takeIf { it.trim() != saved }
    }

    private fun close() {
        if (changedTitle() != null) {
            local.update { it.copy(dialog = LinkEditDialog.DiscardChanges) }
        } else {
            local.update { it.copy(exit = LinkEditExit.Discarded) }
        }
    }

    private fun save() {
        if (local.value.pending != null) return
        // Only a changed, valid title is sent.
        val edited = changedTitle() ?: return
        val title = edited.trim()
        if (validateLinkTitle(title) != null) return
        if (local.value.rejectedTitle?.title == edited) return
        run(LinkEditOperation.Save, onFailure = { error ->
            when (error) {
                is ApiError.InvalidArgument -> local.update {
                    it.copy(rejectedTitle = RejectedTitle(edited, LinkTitleError.Rejected(error.message)))
                }
                else -> post(LinkEditMessage.SaveFailed(error))
            }
        }) {
            links.updateTitle(linkId, title)
            local.update { it.copy(editedTitle = null, exit = LinkEditExit.Saved) }
        }
    }

    private fun move(directoryId: Long) {
        if (local.value.dialog !is LinkEditDialog.Move) return
        val destination = state.value.allDirectories.firstOrNull { it.id == directoryId }?.name.orEmpty()
        run(
            LinkEditOperation.Move,
            onFailure = { error -> local.update { it.copy(dialog = LinkEditDialog.Move(error)) } },
            onNotFound = {
                // Either the link (the screen then closes) or the destination is gone.
                local.update { it.copy(dialog = null) }
                tree.refresh()
                if (tree.link(linkId).first() != null) post(LinkEditMessage.DirectoryGone)
            },
        ) {
            links.move(linkId, directoryId)
            local.update { it.copy(dialog = null, message = LinkEditMessage.Moved(destination)) }
        }
    }

    private fun delete() {
        if (local.value.dialog !is LinkEditDialog.Delete) return
        val title = state.value.link?.title.orEmpty()
        run(
            LinkEditOperation.Delete,
            onFailure = { error -> local.update { it.copy(dialog = LinkEditDialog.Delete(error)) } },
            onNotFound = {
                // Already deleted elsewhere: what the user wanted.
                local.update { it.copy(dialog = null, exit = LinkEditExit.Deleted(title)) }
                tree.refresh()
            },
        ) {
            links.delete(linkId)
            local.update { it.copy(dialog = null, exit = LinkEditExit.Deleted(title)) }
        }
    }

    private fun refreshMetadata() {
        run(LinkEditOperation.RefreshMetadata, onFailure = { post(LinkEditMessage.RefreshFailed(it)) }) {
            val changed = links.refreshMetadata(linkId)
            // The server replaced the title; show it instead of the edit.
            local.update {
                it.copy(editedTitle = null, rejectedTitle = null, message = LinkEditMessage.MetadataRefreshed(changed))
            }
        }
    }

    /**
     * Runs one write at a time. `NOT_FOUND` runs [onNotFound] (by default a
     * refresh, which closes the screen if the link is gone); a rejected or
     * missing API key closes any dialog with a snackbar; other failures go
     * to [onFailure].
     */
    private fun run(
        operation: LinkEditOperation,
        onFailure: (ApiError) -> Unit,
        onNotFound: suspend () -> Unit = { tree.refresh() },
        block: suspend () -> Unit,
    ) {
        if (local.value.pending != null) return
        local.update { it.copy(pending = operation) }
        viewModelScope.launch {
            try {
                block()
                local.update { it.copy(pending = null) }
            } catch (e: ApiException) {
                Log.w(TAG, "A link write failed: ${e.error}")
                local.update { it.copy(pending = null) }
                when (e.error) {
                    ApiError.NotFound -> onNotFound()
                    ApiError.Unauthenticated, ApiError.NotConfigured -> local.update {
                        it.copy(dialog = null, message = LinkEditMessage.WriteError(e.error))
                    }
                    else -> onFailure(e.error)
                }
            }
        }
    }

    companion object {
        private const val TAG = "LinkEditViewModel"

        fun factory(linkId: Long): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                LinkEditViewModel(
                    linkId = linkId,
                    tree = appContainer.treeRepository,
                    links = appContainer.linkRepository,
                )
            }
        }
    }
}

/** The directories from the root down to [directoryId], both included. */
private fun pathTo(directoryId: Long, directories: List<DirectoryEntity>): List<DirectoryEntity> {
    val byId = directories.associateBy { it.id }
    val path = ArrayList<DirectoryEntity>()
    val seen = HashSet<Long>()
    var current = byId[directoryId]
    while (current != null && seen.add(current.id)) {
        path += current
        current = current.parentId?.let(byId::get)
    }
    return path.asReversed()
}
