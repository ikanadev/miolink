package dev.ikana.miolink.link

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.ikana.miolink.core.ui.PickerDirectory
import dev.ikana.miolink.link.components.AddLinkSheet

/**
 * The share flow's sheet: [AddLinkSheet] prefilled with [url], saving in the
 * root unless the user picks another directory ("Change").
 *
 * [onCreated] receives the new link's id; [onDismiss] runs when the user
 * cancels; [onOpenSettings] when the API key is missing or was rejected.
 */
@Composable
fun ShareLinkScreen(
    url: String,
    onCreated: (linkId: Long) -> Unit,
    onDismiss: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ShareLinkViewModel = viewModel(factory = ShareLinkViewModel.factory(url)),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val created by rememberUpdatedState(onCreated)
    val openSettings by rememberUpdatedState(onOpenSettings)

    LaunchedEffect(state.createdLinkId) {
        state.createdLinkId?.let { created(it) }
    }
    LaunchedEffect(state.needsSettings) {
        if (state.needsSettings) {
            viewModel.onAction(ShareLinkAction.SettingsOpened)
            openSettings()
        }
    }

    if (state.createdLinkId == null) {
        val directories = remember(state.allDirectories) {
            state.allDirectories.map { PickerDirectory(it.id, it.parentId, it.name) }
        }
        AddLinkSheet(
            directories = directories,
            directoryId = state.directoryId,
            onSave = { viewModel.onAction(ShareLinkAction.Save(it)) },
            onDismiss = onDismiss,
            modifier = modifier,
            // The picker needs the tree; until the first sync the row shows
            // the root without "Change".
            onDirectoryChange = if (directories.isNotEmpty()) {
                { viewModel.onAction(ShareLinkAction.ChangeDirectory(it)) }
            } else {
                null
            },
            initialUrl = state.url,
            isSaving = state.isSaving,
            failure = state.failure,
        )
    }
}
