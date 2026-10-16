package dev.ikana.miolink.core.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * Asks before deleting something. [message] says what will be lost (for a
 * directory, everything inside it). While [isDeleting] the buttons are
 * disabled, the dialog can't be dismissed, and the confirm button shows a
 * loading indicator; the caller closes the dialog when the delete finishes.
 * [errorMessage] explains a failed attempt, and the user can try again.
 */
@Composable
fun ConfirmDeleteDialog(
    title: String,
    message: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    isDeleting: Boolean = false,
    errorMessage: String? = null,
    confirmLabel: String = stringResource(R.string.delete),
) {
    AlertDialog(
        onDismissRequest = { if (!isDeleting) onDismiss() },
        modifier = modifier,
        icon = { Icon(painterResource(R.drawable.ic_delete), contentDescription = null) },
        title = { Text(title) },
        text = {
            Column {
                Text(message)
                if (errorMessage != null) {
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = errorMessage,
                        modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onConfirm,
                enabled = !isDeleting,
                colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error),
            ) {
                ProgressButtonContent(confirmLabel, inProgress = isDeleting)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !isDeleting) {
                Text(stringResource(R.string.cancel))
            }
        },
    )
}

@Preview
@Composable
private fun ConfirmDeleteDialogPreview() {
    MioLinkTheme(dynamicColor = false) {
        ConfirmDeleteDialog(
            title = "Delete “Work”?",
            message = "Everything inside it will be deleted too: 3 subdirectories and 12 links. " +
                "This can't be undone.",
            onConfirm = {},
            onDismiss = {},
        )
    }
}
