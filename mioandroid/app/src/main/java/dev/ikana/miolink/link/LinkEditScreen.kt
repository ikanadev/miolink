package dev.ikana.miolink.link

import android.content.ClipData
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.annotation.DrawableRes
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.ClipEntry
import androidx.compose.ui.platform.LocalClipboard
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.ui.ConfirmDeleteDialog
import dev.ikana.miolink.core.ui.DirectoryPicker
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.core.ui.PickerDirectory
import dev.ikana.miolink.core.ui.ProgressButtonContent
import dev.ikana.miolink.core.ui.ThumbnailImage
import dev.ikana.miolink.core.ui.openInCustomTab
import dev.ikana.miolink.link.components.linkWriteFailureText
import dev.ikana.miolink.link.components.message
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.ui.theme.MioLinkTheme
import java.text.DateFormat
import java.util.Date
import kotlinx.coroutines.launch

/**
 * Edits link [linkId]: its title, its directory and its metadata, or deletes
 * it. Opened right after `CreateLink` so the user can fix the title.
 *
 * [onClose] navigates back, with a message for the previous screen to show
 * when there is one (the link was deleted, here or elsewhere).
 */
@Composable
fun LinkEditScreen(
    linkId: Long,
    onClose: (message: String?) -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LinkEditViewModel = viewModel(factory = LinkEditViewModel.factory(linkId)),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val clipboard = LocalClipboard.current
    val toolbarColor = MaterialTheme.colorScheme.surfaceContainer.toArgb()
    val openFailed = stringResource(R.string.link_open_failed)
    val copied = stringResource(R.string.link_url_copied)
    val clipLabel = stringResource(R.string.link_url_label)

    val exitMessage = state.exit?.let { exitText(it) }
    LaunchedEffect(state.exit) {
        if (state.exit != null) onClose(exitMessage)
    }

    state.message?.let { message ->
        val text = message.text()
        val action = message.action()
        val actionLabel = action?.let {
            stringResource(if (it == MessageAction.Settings) R.string.browse_open_settings else R.string.browse_retry)
        }
        LaunchedEffect(message) {
            val isError = action != null
            val result = snackbarHostState.showSnackbar(
                message = text,
                actionLabel = actionLabel,
                withDismissAction = isError,
                duration = if (isError) SnackbarDuration.Long else SnackbarDuration.Short,
            )
            if (result == SnackbarResult.ActionPerformed) {
                when (action) {
                    MessageAction.Settings -> onOpenSettings()
                    MessageAction.RetrySave -> viewModel.onAction(LinkEditAction.Save)
                    MessageAction.RetryRefresh -> viewModel.onAction(LinkEditAction.RefreshMetadata)
                    null -> Unit
                }
            }
            viewModel.onAction(LinkEditAction.MessageShown(message))
        }
    }

    LinkEditContent(
        state = state,
        onAction = viewModel::onAction,
        onOpenUrl = { url ->
            if (!openInCustomTab(context, url, toolbarColor)) {
                scope.launch { snackbarHostState.showSnackbar(openFailed) }
            }
        },
        onCopyUrl = { url ->
            scope.launch {
                clipboard.setClipEntry(ClipEntry(ClipData.newPlainText(clipLabel, url)))
                // Android 13+ confirms copies itself.
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) snackbarHostState.showSnackbar(copied)
            }
        },
        modifier = modifier,
        snackbarHostState = snackbarHostState,
    )
}

private enum class MessageAction { Settings, RetrySave, RetryRefresh }

private fun LinkEditMessage.action(): MessageAction? = when (this) {
    is LinkEditMessage.WriteError -> MessageAction.Settings
    is LinkEditMessage.SaveFailed -> MessageAction.RetrySave
    is LinkEditMessage.RefreshFailed -> MessageAction.RetryRefresh
    is LinkEditMessage.Moved,
    is LinkEditMessage.MetadataRefreshed,
    LinkEditMessage.DirectoryGone,
    -> null
}

@Composable
private fun LinkEditMessage.text(): String = when (this) {
    is LinkEditMessage.Moved -> stringResource(
        R.string.link_moved_to,
        destination.ifEmpty { stringResource(R.string.app_name) },
    )
    is LinkEditMessage.MetadataRefreshed -> stringResource(
        if (changed) R.string.link_metadata_refreshed else R.string.link_metadata_unchanged,
    )
    is LinkEditMessage.SaveFailed -> stringResource(
        if (error == ApiError.Unreachable) R.string.link_save_unreachable else R.string.link_save_failed,
    )
    is LinkEditMessage.RefreshFailed -> stringResource(
        if (error == ApiError.Unreachable) R.string.link_refresh_unreachable else R.string.link_refresh_failed,
    )
    is LinkEditMessage.WriteError -> linkWriteFailureText(error)
    LinkEditMessage.DirectoryGone -> stringResource(R.string.browse_directory_gone)
}

@Composable
private fun exitText(exit: LinkEditExit): String? = when (exit) {
    LinkEditExit.Saved, LinkEditExit.Discarded -> null
    is LinkEditExit.Deleted -> stringResource(R.string.link_deleted, exit.title)
    LinkEditExit.Gone -> stringResource(R.string.link_gone)
}

/**
 * A link's details: a large thumbnail, the editable title (saved from the
 * top bar, only when it changed), the URL with open and copy, the directory
 * with Move, and Refresh metadata and Delete. Leaving with an edited title
 * asks first.
 */
@Composable
fun LinkEditContent(
    state: LinkEditUiState,
    onAction: (LinkEditAction) -> Unit,
    onOpenUrl: (String) -> Unit,
    onCopyUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
) {
    BackHandler(enabled = state.hasChanges) { onAction(LinkEditAction.Close) }
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.link_edit_title)) },
                navigationIcon = { NavigateUpButton { onAction(LinkEditAction.Close) } },
                actions = {
                    TextButton(
                        onClick = { onAction(LinkEditAction.Save) },
                        enabled = state.canSave,
                        modifier = Modifier.padding(end = 8.dp),
                    ) {
                        ProgressButtonContent(
                            stringResource(R.string.link_save),
                            inProgress = state.pending == LinkEditOperation.Save,
                        )
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        val link = state.link
        if (link == null) {
            val description = stringResource(R.string.link_loading)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .semantics { contentDescription = description },
                contentAlignment = Alignment.Center,
            ) {
                LoadingIndicator()
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .imePadding(),
                contentAlignment = Alignment.TopCenter,
            ) {
                LinkDetails(
                    state = state,
                    link = link,
                    onAction = onAction,
                    onOpenUrl = onOpenUrl,
                    onCopyUrl = onCopyUrl,
                    modifier = Modifier
                        .widthIn(max = 600.dp)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                )
            }
        }
    }
    LinkEditDialogs(state, onAction)
}

@Composable
private fun LinkDetails(
    state: LinkEditUiState,
    link: LinkEntity,
    onAction: (LinkEditAction) -> Unit,
    onOpenUrl: (String) -> Unit,
    onCopyUrl: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val refreshing = state.pending == LinkEditOperation.RefreshMetadata
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Box(contentAlignment = Alignment.Center) {
            ThumbnailImage(
                url = link.thumbnailUrl,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(THUMBNAIL_ASPECT_RATIO),
                shape = MaterialTheme.shapes.extraLarge,
            )
            if (refreshing) {
                val description = stringResource(R.string.link_refreshing_metadata)
                LoadingIndicator(
                    modifier = Modifier
                        .size(64.dp)
                        .semantics { contentDescription = description },
                )
            }
        }
        TitleField(state, onAction, enabled = !refreshing)
        Surface(
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.surfaceContainerLow,
        ) {
            Column {
                DetailRow(
                    icon = R.drawable.ic_link,
                    overline = stringResource(R.string.link_url_label),
                    text = link.url,
                    trailing = {
                        Row {
                            IconButton(onClick = { onOpenUrl(link.url) }) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_open_in_new),
                                    contentDescription = stringResource(R.string.link_open),
                                )
                            }
                            IconButton(onClick = { onCopyUrl(link.url) }) {
                                Icon(
                                    painter = painterResource(R.drawable.ic_content_copy),
                                    contentDescription = stringResource(R.string.link_copy_url),
                                )
                            }
                        }
                    },
                )
                val rootName = stringResource(R.string.app_name)
                DetailRow(
                    icon = R.drawable.ic_folder,
                    overline = stringResource(R.string.link_directory_label),
                    text = state.directoryPath.joinToString(" / ") { it.name.ifEmpty { rootName } },
                    trailing = {
                        FilledTonalButton(
                            onClick = { onAction(LinkEditAction.ShowMove) },
                            enabled = !state.isBusy,
                        ) {
                            Text(stringResource(R.string.link_action_move))
                        }
                    },
                )
            }
        }
        Text(
            text = stringResource(
                R.string.link_added_on,
                DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(link.createdAt)),
                pluralStringResource(R.plurals.link_views, link.views.toCount(), link.views),
            ),
            modifier = Modifier.padding(horizontal = 4.dp),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            OutlinedButton(
                onClick = { onAction(LinkEditAction.RefreshMetadata) },
                enabled = !state.isBusy,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (!refreshing) {
                    Icon(
                        painter = painterResource(R.drawable.ic_refresh),
                        contentDescription = null,
                        modifier = Modifier.size(ButtonDefaults.IconSize),
                    )
                    Spacer(Modifier.size(ButtonDefaults.IconSpacing))
                }
                ProgressButtonContent(stringResource(R.string.link_refresh_metadata), inProgress = refreshing)
            }
            Text(
                text = stringResource(R.string.link_refresh_metadata_supporting),
                modifier = Modifier.padding(horizontal = 16.dp),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        OutlinedButton(
            onClick = { onAction(LinkEditAction.ShowDelete) },
            enabled = !state.isBusy,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = if (state.isBusy) 0.38f else 1f)),
        ) {
            Icon(
                painter = painterResource(R.drawable.ic_delete),
                contentDescription = null,
                modifier = Modifier.size(ButtonDefaults.IconSize),
            )
            Spacer(Modifier.size(ButtonDefaults.IconSpacing))
            Text(stringResource(R.string.link_action_delete))
        }
        Spacer(Modifier.size(8.dp))
    }
}

/**
 * The title, with a clear button and a character count near the limit. The
 * text lives here and is mirrored to the ViewModel, so typing never waits on
 * it; it follows the saved title while the user hasn't edited it (after
 * Refresh metadata, say).
 */
@Composable
private fun TitleField(state: LinkEditUiState, onAction: (LinkEditAction) -> Unit, enabled: Boolean) {
    val focusManager = LocalFocusManager.current
    var value by rememberSaveable(stateSaver = TextFieldValue.Saver) {
        mutableStateOf(TextFieldValue(state.title, selection = TextRange(state.title.length)))
    }
    val savedTitle = state.link?.title
    LaunchedEffect(savedTitle, state.isTitleEdited) {
        if (!state.isTitleEdited && value.text != state.title) {
            value = TextFieldValue(state.title, selection = TextRange(state.title.length))
        }
    }
    val length = titleLength(value.text)
    val showCount = length >= MAX_LINK_TITLE_LENGTH - COUNT_THRESHOLD
    val saving = state.pending == LinkEditOperation.Save
    OutlinedTextField(
        value = value,
        onValueChange = {
            if (it.text != value.text) onAction(LinkEditAction.TitleChanged(it.text))
            value = it
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = enabled,
        readOnly = saving,
        label = { Text(stringResource(R.string.link_title_label)) },
        trailingIcon = if (value.text.isNotEmpty() && !saving) {
            {
                IconButton(
                    onClick = {
                        value = TextFieldValue("")
                        onAction(LinkEditAction.TitleChanged(""))
                    },
                ) {
                    Icon(
                        painter = painterResource(R.drawable.ic_close),
                        contentDescription = stringResource(R.string.link_title_clear),
                    )
                }
            }
        } else {
            null
        },
        supportingText = if (state.titleError != null || showCount) {
            {
                Row {
                    Text(
                        text = state.titleError?.message().orEmpty(),
                        modifier = Modifier.weight(1f),
                    )
                    if (showCount) {
                        val countDescription = pluralStringResource(
                            R.plurals.link_title_count_description,
                            MAX_LINK_TITLE_LENGTH,
                            length,
                            MAX_LINK_TITLE_LENGTH,
                        )
                        Text(
                            text = "$length/$MAX_LINK_TITLE_LENGTH",
                            modifier = Modifier
                                .padding(start = 16.dp)
                                .semantics { contentDescription = countDescription },
                            textAlign = TextAlign.End,
                        )
                    }
                }
            }
        } else {
            null
        },
        isError = state.titleError != null,
        maxLines = TITLE_MAX_LINES,
        keyboardOptions = KeyboardOptions(
            capitalization = KeyboardCapitalization.Sentences,
            imeAction = ImeAction.Done,
        ),
        keyboardActions = KeyboardActions(
            onDone = {
                focusManager.clearFocus()
                if (state.canSave) onAction(LinkEditAction.Save)
            },
        ),
    )
}

@Composable
private fun DetailRow(
    @DrawableRes icon: Int,
    overline: String,
    text: String,
    trailing: @Composable () -> Unit,
) {
    ListItem(
        headlineContent = { Text(text, maxLines = 3, overflow = TextOverflow.Ellipsis) },
        overlineContent = { Text(overline) },
        leadingContent = {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(MaterialTheme.colorScheme.secondaryContainer, MaterialTheme.shapes.medium),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(icon),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSecondaryContainer,
                )
            }
        },
        trailingContent = trailing,
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
    )
}

@Composable
private fun LinkEditDialogs(state: LinkEditUiState, onAction: (LinkEditAction) -> Unit) {
    val link = state.link ?: return
    val dismiss = { onAction(LinkEditAction.DismissDialog) }
    val title = link.title.ifBlank { link.url }
    when (val dialog = state.dialog) {
        null -> Unit
        is LinkEditDialog.Move -> {
            val directories = remember(state.allDirectories) {
                state.allDirectories.map { PickerDirectory(it.id, it.parentId, it.name) }
            }
            DirectoryPicker(
                directories = directories,
                title = stringResource(R.string.link_move_title, title),
                confirmLabel = stringResource(R.string.directory_move_confirm),
                onConfirm = { onAction(LinkEditAction.MoveTo(it)) },
                onDismiss = dismiss,
                subtitle = stringResource(R.string.link_move_subtitle),
                currentDirectoryId = link.directoryId,
                isSaving = state.pending == LinkEditOperation.Move,
                errorMessage = dialog.failure?.let { linkWriteFailureText(it) },
            )
        }
        is LinkEditDialog.Delete -> ConfirmDeleteDialog(
            title = stringResource(R.string.link_delete_title),
            message = stringResource(R.string.link_delete_message, title),
            onConfirm = { onAction(LinkEditAction.ConfirmDelete) },
            onDismiss = dismiss,
            isDeleting = state.pending == LinkEditOperation.Delete,
            errorMessage = dialog.failure?.let { linkWriteFailureText(it) },
        )
        LinkEditDialog.DiscardChanges -> AlertDialog(
            onDismissRequest = dismiss,
            title = { Text(stringResource(R.string.link_discard_title)) },
            text = { Text(stringResource(R.string.link_discard_message)) },
            confirmButton = {
                TextButton(onClick = { onAction(LinkEditAction.ConfirmDiscard) }) {
                    Text(stringResource(R.string.link_discard))
                }
            },
            dismissButton = {
                TextButton(onClick = dismiss) {
                    Text(stringResource(R.string.link_keep_editing))
                }
            },
        )
    }
}

/** Open Graph images are 1.91:1. */
private const val THUMBNAIL_ASPECT_RATIO = 1.91f

/** The count shows within this many characters of the limit. */
private const val COUNT_THRESHOLD = 100

private const val TITLE_MAX_LINES = 5

private fun Long.toCount(): Int = coerceAtMost(Int.MAX_VALUE.toLong()).toInt()

// Previews.

private val previewLink = LinkEntity(
    id = 1,
    directoryId = 3,
    title = "Material 3 Expressive: building delightful, emotional interfaces",
    url = "https://m3.material.io/blog/building-with-m3-expressive",
    thumbnailUrl = null,
    views = 12,
    createdAt = 1_760_000_000_000,
)

private val previewDirectories = listOf(
    DirectoryEntity(1, null, "", 0),
    DirectoryEntity(2, 1, "Work", 0),
    DirectoryEntity(3, 2, "Reading", 0),
)

@Preview
@Composable
private fun LinkEditPreview() {
    MioLinkTheme(dynamicColor = false) {
        LinkEditContent(
            state = LinkEditUiState(
                link = previewLink,
                title = previewLink.title,
                directoryPath = previewDirectories,
                allDirectories = previewDirectories,
            ),
            onAction = {},
            onOpenUrl = {},
            onCopyUrl = {},
        )
    }
}

@Preview
@Composable
private fun LinkEditChangedPreview() {
    MioLinkTheme(dynamicColor = false) {
        LinkEditContent(
            state = LinkEditUiState(
                link = previewLink,
                title = "",
                hasChanges = true,
                titleError = LinkTitleError.Empty,
                directoryPath = previewDirectories,
                allDirectories = previewDirectories,
                pending = LinkEditOperation.RefreshMetadata,
            ),
            onAction = {},
            onOpenUrl = {},
            onCopyUrl = {},
        )
    }
}
