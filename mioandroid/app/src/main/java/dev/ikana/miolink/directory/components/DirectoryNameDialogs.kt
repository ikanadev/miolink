package dev.ikana.miolink.directory.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.tooling.preview.Preview
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.ProgressButtonContent
import dev.ikana.miolink.directory.DirectoryNameError
import dev.ikana.miolink.directory.MAX_DIRECTORY_NAME_LENGTH
import dev.ikana.miolink.directory.RejectedName
import dev.ikana.miolink.directory.validateDirectoryName
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * Asks for a new directory's name. [siblingNames] are the names already in
 * the parent, so a duplicate is caught before sending. See
 * [DirectoryNameDialog] for [isSaving], [rejected] and [errorMessage].
 */
@Composable
fun NewDirectoryDialog(
    siblingNames: Collection<String>,
    onConfirm: (name: String) -> Unit,
    onDismiss: () -> Unit,
    isSaving: Boolean = false,
    rejected: RejectedName? = null,
    errorMessage: String? = null,
) {
    DirectoryNameDialog(
        title = stringResource(R.string.directory_new_title),
        confirmLabel = stringResource(R.string.directory_create),
        initialName = "",
        siblingNames = siblingNames,
        onConfirm = onConfirm,
        onDismiss = onDismiss,
        isSaving = isSaving,
        rejected = rejected,
        errorMessage = errorMessage,
    )
}

/**
 * Asks for a directory's new name, starting from [currentName], selected so
 * typing replaces it. [siblingNames] are the other directories in the same
 * parent. Confirming is disabled until the name changes.
 */
@Composable
fun RenameDirectoryDialog(
    currentName: String,
    siblingNames: Collection<String>,
    onConfirm: (name: String) -> Unit,
    onDismiss: () -> Unit,
    isSaving: Boolean = false,
    rejected: RejectedName? = null,
    errorMessage: String? = null,
) {
    DirectoryNameDialog(
        title = stringResource(R.string.directory_rename_title),
        confirmLabel = stringResource(R.string.directory_rename),
        initialName = currentName,
        siblingNames = siblingNames,
        onConfirm = onConfirm,
        onDismiss = onDismiss,
        isSaving = isSaving,
        rejected = rejected,
        errorMessage = errorMessage,
    )
}

/**
 * A dialog with one name field, focused with the keyboard up. The name is
 * checked as the user types (from the first edit, not on open), and the
 * keyboard's Done key confirms like the button.
 *
 * While [isSaving], the button shows a loading indicator and the dialog
 * can't be dismissed. The caller closes it when the write succeeds; when the
 * server refuses the name it passes [rejected], shown under the field until
 * the name changes, and for any other failure [errorMessage].
 */
@Composable
private fun DirectoryNameDialog(
    title: String,
    confirmLabel: String,
    initialName: String,
    siblingNames: Collection<String>,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
    isSaving: Boolean,
    rejected: RejectedName?,
    errorMessage: String?,
) {
    var value by rememberSaveable(stateSaver = TextFieldValue.Saver) {
        mutableStateOf(TextFieldValue(initialName, selection = TextRange(0, initialName.length)))
    }
    var edited by rememberSaveable { mutableStateOf(false) }
    val name = value.text
    val validation = validateDirectoryName(name, siblingNames)
    val shownError = when {
        rejected != null && rejected.name == name -> rejected.error
        edited -> validation
        else -> null
    }
    val canConfirm = validation == null &&
        name != initialName &&
        rejected?.name != name &&
        !isSaving
    val confirm = { if (canConfirm) onConfirm(name) }

    val focusRequester = remember { FocusRequester() }
    val keyboard = LocalSoftwareKeyboardController.current
    LaunchedEffect(focusRequester) {
        focusRequester.requestFocus()
        keyboard?.show()
    }

    AlertDialog(
        onDismissRequest = { if (!isSaving) onDismiss() },
        icon = { Icon(painterResource(R.drawable.ic_create_new_folder), contentDescription = null) },
        title = { Text(title) },
        text = {
            OutlinedTextField(
                value = value,
                onValueChange = {
                    if (it.text != value.text) edited = true
                    value = it
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .focusRequester(focusRequester),
                readOnly = isSaving,
                label = { Text(stringResource(R.string.directory_name_label)) },
                supportingText = (shownError?.let { error -> { Text(error.message()) } })
                    ?: errorMessage?.let { message -> { Text(message) } },
                isError = shownError != null || errorMessage != null,
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Sentences,
                    imeAction = ImeAction.Done,
                ),
                keyboardActions = KeyboardActions(onDone = { confirm() }),
            )
        },
        confirmButton = {
            TextButton(onClick = confirm, enabled = canConfirm) {
                ProgressButtonContent(confirmLabel, inProgress = isSaving)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !isSaving) {
                Text(stringResource(R.string.cancel))
            }
        },
    )
}

/** What to show under the name field for this error. */
@Composable
fun DirectoryNameError.message(): String = when (this) {
    DirectoryNameError.Empty -> stringResource(R.string.directory_name_error_empty)
    DirectoryNameError.TooLong -> pluralStringResource(
        R.plurals.directory_name_error_too_long,
        MAX_DIRECTORY_NAME_LENGTH,
        MAX_DIRECTORY_NAME_LENGTH,
    )
    DirectoryNameError.ContainsSlash -> stringResource(R.string.directory_name_error_slash)
    DirectoryNameError.Reserved -> stringResource(R.string.directory_name_error_reserved)
    DirectoryNameError.Duplicate -> stringResource(R.string.directory_name_error_duplicate)
    is DirectoryNameError.Rejected ->
        message?.takeIf { it.isNotBlank() }?.replaceFirstChar { it.uppercase() }
            ?: stringResource(R.string.directory_name_error_rejected)
}

@Preview
@Composable
private fun NewDirectoryDialogPreview() {
    MioLinkTheme(dynamicColor = false) {
        NewDirectoryDialog(siblingNames = emptySet(), onConfirm = {}, onDismiss = {})
    }
}

@Preview
@Composable
private fun RenameDirectoryDialogRejectedPreview() {
    MioLinkTheme(dynamicColor = false) {
        RenameDirectoryDialog(
            currentName = "Work",
            siblingNames = setOf("Home"),
            onConfirm = {},
            onDismiss = {},
            rejected = RejectedName("Work", DirectoryNameError.Duplicate),
        )
    }
}
