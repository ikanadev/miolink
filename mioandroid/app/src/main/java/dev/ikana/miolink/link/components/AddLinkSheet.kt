package dev.ikana.miolink.link.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.ui.DirectoryPicker
import dev.ikana.miolink.core.ui.PickerDirectory
import dev.ikana.miolink.core.ui.ProgressButtonContent
import dev.ikana.miolink.core.ui.pathTo
import dev.ikana.miolink.link.LinkUrlError
import dev.ikana.miolink.link.LinkUrlInput
import dev.ikana.miolink.link.parseLinkUrl
import kotlinx.coroutines.launch

/**
 * A modal bottom sheet that asks for a URL to save in [directoryId]. It holds
 * only the form; the caller runs `CreateLink` and owns the result, so the
 * browse screen and the share flow can both use it.
 *
 * The URL field is focused with a URL keyboard. It starts from [initialUrl]
 * (a shared link) or else the clipboard when it holds an http(s) URL, and
 * offers a paste button while empty. The URL is checked like the backend
 * does (a bare `example.com` gets `https://`) on the first save attempt, then
 * as the user types; [onSave] receives the normalized URL.
 *
 * [directories] (every cached directory, the root included) names the
 * destination in a "Save in" row. With [onDirectoryChange], the row offers
 * "Change", which opens a [DirectoryPicker]; the caller updates
 * [directoryId].
 *
 * While [isSaving] (the server is fetching the page, which can take a few
 * seconds) the Save button shows a loading indicator, the form is read-only
 * and the sheet can't be dismissed. The caller removes the sheet when the
 * write succeeds; on failure it passes [failure]: `INVALID_ARGUMENT` shows
 * under the field until the URL changes, anything else above the buttons.
 */
// ModalBottomSheet and SheetState are still experimental.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddLinkSheet(
    directories: List<PickerDirectory>,
    directoryId: Long,
    onSave: (url: String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    onDirectoryChange: ((directoryId: Long) -> Unit)? = null,
    initialUrl: String? = null,
    isSaving: Boolean = false,
    failure: ApiError? = null,
    rootName: String = stringResource(R.string.app_name),
) {
    val saving by rememberUpdatedState(isSaving)
    val sheetState = rememberModalBottomSheetState(
        skipPartiallyExpanded = true,
        confirmValueChange = { it != SheetValue.Hidden || !saving },
    )
    val scope = rememberCoroutineScope()
    val hideThenDismiss: () -> Unit = {
        scope.launch { sheetState.hide() }.invokeOnCompletion { onDismiss() }
    }
    var picking by rememberSaveable { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = { if (!isSaving) onDismiss() },
        modifier = modifier,
        sheetState = sheetState,
        sheetGesturesEnabled = !isSaving,
    ) {
        AddLinkForm(
            directoryPath = directoryPath(directories, directoryId, rootName),
            onSave = onSave,
            onCancel = hideThenDismiss,
            onChangeDirectory = if (onDirectoryChange != null) {
                { picking = true }
            } else {
                null
            },
            initialUrl = initialUrl,
            isSaving = isSaving,
            failure = failure,
        )
    }

    if (picking && onDirectoryChange != null) {
        DirectoryPicker(
            directories = directories,
            title = stringResource(R.string.link_add_pick_directory_title),
            confirmLabel = stringResource(R.string.link_add_pick_directory_confirm),
            onConfirm = { id ->
                onDirectoryChange(id)
                picking = false
            },
            onDismiss = { picking = false },
            currentDirectoryId = directoryId,
            rootName = rootName,
        )
    }
}

/** "Mio Link / Work / Projects" for [directoryId], or null when it isn't cached. */
private fun directoryPath(directories: List<PickerDirectory>, directoryId: Long, rootName: String): String? {
    if (directories.isEmpty()) return null
    val byId = directories.associateBy { it.id }
    val path = pathTo(directories, directoryId).mapNotNull { byId[it] }
    if (path.isEmpty()) return null
    return path.joinToString(" / ") { it.name.ifEmpty { rootName } }
}

@Composable
private fun AddLinkForm(
    directoryPath: String?,
    onSave: (String) -> Unit,
    onCancel: () -> Unit,
    onChangeDirectory: (() -> Unit)?,
    initialUrl: String?,
    isSaving: Boolean,
    failure: ApiError?,
) {
    val context = LocalContext.current
    var value by rememberSaveable(stateSaver = TextFieldValue.Saver) {
        val text = initialUrl.orEmpty()
        mutableStateOf(TextFieldValue(text, selection = TextRange(text.length)))
    }
    // The clipboard is checked once per sheet, not after every rotation.
    var clipboardChecked by rememberSaveable { mutableStateOf(initialUrl != null) }
    // Errors show from the first save attempt on, not while typing the URL.
    var attempted by rememberSaveable { mutableStateOf(false) }
    // The URL last sent, to tie a server refusal to it.
    var submitted by rememberSaveable { mutableStateOf<String?>(null) }
    var canPaste by remember { mutableStateOf(false) }

    val focusRequester = remember { FocusRequester() }
    val keyboard = LocalSoftwareKeyboardController.current
    LaunchedEffect(focusRequester) {
        if (!clipboardChecked) {
            clipboardChecked = true
            context.clipboardWebUrl()?.let { url ->
                // Selected, so typing replaces it.
                value = TextFieldValue(url, selection = TextRange(0, url.length))
            }
        }
        canPaste = context.clipboardHasText()
        focusRequester.requestFocus()
        keyboard?.show()
    }

    val input = parseLinkUrl(value.text)
    val rejected = (failure as? ApiError.InvalidArgument)
        ?.takeIf { input is LinkUrlInput.Valid && input.url == submitted }
        ?.let { LinkUrlError.Rejected(it.message) }
    val inputError = (input as? LinkUrlInput.Invalid)?.error
    val shownError = rejected ?: inputError?.takeIf { attempted || it == LinkUrlError.TooLong }
    val otherFailure = failure?.takeUnless { it is ApiError.InvalidArgument }
    val save = {
        attempted = true
        if (!isSaving && input is LinkUrlInput.Valid && rejected == null) {
            submitted = input.url
            onSave(input.url)
        }
    }

    Column(Modifier.padding(start = 24.dp, end = 24.dp, bottom = 16.dp)) {
        Text(
            text = stringResource(R.string.link_add_title),
            modifier = Modifier.semantics { heading() },
            style = MaterialTheme.typography.headlineSmall,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = stringResource(R.string.link_add_message),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(20.dp))
        OutlinedTextField(
            value = value,
            onValueChange = { if (!isSaving) value = it },
            modifier = Modifier
                .fillMaxWidth()
                .focusRequester(focusRequester),
            readOnly = isSaving,
            label = { Text(stringResource(R.string.link_url_label)) },
            placeholder = { Text(stringResource(R.string.link_url_placeholder)) },
            leadingIcon = { Icon(painterResource(R.drawable.ic_link), contentDescription = null) },
            trailingIcon = when {
                isSaving -> null
                value.text.isNotEmpty() -> {
                    {
                        IconButton(onClick = { value = TextFieldValue("") }) {
                            Icon(
                                painter = painterResource(R.drawable.ic_close),
                                contentDescription = stringResource(R.string.link_url_clear),
                            )
                        }
                    }
                }
                canPaste -> {
                    {
                        IconButton(
                            onClick = {
                                context.clipboardText()?.trim()?.let { text ->
                                    value = TextFieldValue(text, selection = TextRange(text.length))
                                }
                            },
                        ) {
                            Icon(
                                painter = painterResource(R.drawable.ic_content_paste),
                                contentDescription = stringResource(R.string.link_url_paste),
                            )
                        }
                    }
                }
                else -> null
            },
            supportingText = {
                Text(
                    when {
                        shownError != null -> shownError.message()
                        isSaving -> stringResource(R.string.link_add_fetching)
                        else -> stringResource(R.string.link_url_supporting)
                    },
                )
            },
            isError = shownError != null,
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                capitalization = KeyboardCapitalization.None,
                autoCorrectEnabled = false,
                keyboardType = KeyboardType.Uri,
                imeAction = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(onDone = { save() }),
        )
        if (directoryPath != null) {
            Spacer(Modifier.height(8.dp))
            DestinationRow(directoryPath, onChangeDirectory, enabled = !isSaving)
        }
        AnimatedVisibility(visible = otherFailure != null) {
            Text(
                text = otherFailure?.let { linkWriteFailureText(it) }.orEmpty(),
                modifier = Modifier
                    .padding(top = 12.dp)
                    .semantics { liveRegion = LiveRegionMode.Polite },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
            )
        }
        Spacer(Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
        ) {
            TextButton(onClick = onCancel, enabled = !isSaving) {
                Text(stringResource(R.string.cancel))
            }
            Button(onClick = save, enabled = !isSaving && value.text.isNotBlank() && rejected == null) {
                ProgressButtonContent(stringResource(R.string.link_add_save), inProgress = isSaving)
            }
        }
    }
}

/** Where the link will be saved, with "Change" when the caller allows it. */
@Composable
private fun DestinationRow(path: String, onChange: (() -> Unit)?, enabled: Boolean) {
    ListItem(
        headlineContent = { Text(path, maxLines = 2, overflow = TextOverflow.Ellipsis) },
        overlineContent = { Text(stringResource(R.string.link_add_save_in)) },
        leadingContent = {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(MaterialTheme.colorScheme.secondaryContainer, MaterialTheme.shapes.medium),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_folder),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSecondaryContainer,
                )
            }
        },
        trailingContent = onChange?.let { change ->
            {
                TextButton(onClick = change, enabled = enabled) {
                    Text(stringResource(R.string.link_add_change_directory))
                }
            }
        },
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
    )
}
