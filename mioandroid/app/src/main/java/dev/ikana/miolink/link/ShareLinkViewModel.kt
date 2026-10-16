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
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ShareLinkUiState(
    /** The URL found in the shared text; the sheet starts from it. */
    val url: String,
    /** Where the link will be saved: the root until the user picks another. */
    val directoryId: Long = ROOT_DIRECTORY_ID,
    /** Every cached directory, the root included; empty before the first sync. */
    val allDirectories: List<DirectoryEntity> = emptyList(),
    val isSaving: Boolean = false,
    /** Why the last save failed, shown in the sheet so the user can retry. */
    val failure: ApiError? = null,
    /** The API key is missing or was rejected; the screen opens Settings. */
    val needsSettings: Boolean = false,
    /** Set once `CreateLink` succeeds; the screen opens the link's editor. */
    val createdLinkId: Long? = null,
)

sealed interface ShareLinkAction {
    data class ChangeDirectory(val directoryId: Long) : ShareLinkAction
    data class Save(val url: String) : ShareLinkAction

    /** The screen opened Settings for [ShareLinkUiState.needsSettings]. */
    data object SettingsOpened : ShareLinkAction
}

/**
 * Saves a URL shared from another app. The sheet starts in the root
 * directory; the user can pick another before saving.
 *
 * On a cold start the cache may still be empty, so this refreshes the tree
 * once to fill the directory picker; saving to the root doesn't wait for it.
 * Failures follow the browse screen's add-link sheet, except that there's no
 * screen below to fall back to: `NOT_FOUND` (the chosen directory was deleted
 * elsewhere) refreshes and goes back to the root with a message, and a
 * missing or rejected API key sends the user to Settings.
 */
class ShareLinkViewModel(
    url: String,
    private val tree: TreeSource,
    private val links: LinkRepository,
) : ViewModel() {
    private val local = MutableStateFlow(ShareLinkUiState(url = url))

    val state: StateFlow<ShareLinkUiState> = combine(local, tree.allDirectories()) { local, directories ->
        // A chosen directory deleted on another device falls back to the root.
        val exists = directories.isEmpty() || directories.any { it.id == local.directoryId }
        local.copy(
            directoryId = if (exists) local.directoryId else ROOT_DIRECTORY_ID,
            allDirectories = directories,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), local.value)

    init {
        viewModelScope.launch {
            if (tree.revision.first() == null) tree.refresh()
        }
    }

    fun onAction(action: ShareLinkAction) {
        when (action) {
            is ShareLinkAction.ChangeDirectory -> local.update {
                if (it.isSaving) it else it.copy(directoryId = action.directoryId, failure = null)
            }
            is ShareLinkAction.Save -> save(action.url)
            ShareLinkAction.SettingsOpened -> local.update { it.copy(needsSettings = false) }
        }
    }

    private fun save(url: String) {
        if (local.value.isSaving || local.value.createdLinkId != null) return
        val directoryId = state.value.directoryId
        local.update { it.copy(isSaving = true, failure = null) }
        viewModelScope.launch {
            try {
                val id = links.create(directoryId, url)
                local.update { it.copy(isSaving = false, createdLinkId = id) }
            } catch (e: ApiException) {
                Log.w(TAG, "Saving a shared link failed: ${e.error}")
                when (e.error) {
                    ApiError.NotFound -> {
                        local.update {
                            it.copy(isSaving = false, directoryId = ROOT_DIRECTORY_ID, failure = e.error)
                        }
                        tree.refresh()
                    }
                    ApiError.Unauthenticated, ApiError.NotConfigured -> local.update {
                        it.copy(isSaving = false, needsSettings = true)
                    }
                    else -> local.update { it.copy(isSaving = false, failure = e.error) }
                }
            }
        }
    }

    companion object {
        private const val TAG = "ShareLinkViewModel"

        fun factory(url: String): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                ShareLinkViewModel(
                    url = url,
                    tree = appContainer.treeRepository,
                    links = appContainer.linkRepository,
                )
            }
        }
    }
}
