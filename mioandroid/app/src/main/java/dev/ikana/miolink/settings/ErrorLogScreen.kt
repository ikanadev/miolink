package dev.ikana.miolink.settings

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.pm.PackageInfoCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.ikana.miolink.R
import dev.ikana.miolink.core.log.ErrorLogEntry
import dev.ikana.miolink.core.ui.ConfirmDeleteDialog
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.ui.theme.MioLinkTheme

/** The unexpected errors recorded on this device, newest first, to read, share or clear. */
@Composable
fun ErrorLogScreen(
    onNavigateUp: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ErrorLogViewModel = viewModel(factory = ErrorLogViewModel.Factory),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val subject = stringResource(R.string.error_log_share_subject)
    ErrorLogContent(
        state = state,
        onAction = viewModel::onAction,
        onShare = { entries -> context.shareErrorLog(subject, entries) },
        onNavigateUp = onNavigateUp,
        modifier = modifier,
    )
}

@Composable
fun ErrorLogContent(
    state: ErrorLogUiState,
    onAction: (ErrorLogAction) -> Unit,
    onShare: (List<ErrorLogEntry>) -> Unit,
    onNavigateUp: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val entries = state.entries
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_error_log)) },
                navigationIcon = { NavigateUpButton(onNavigateUp) },
                actions = {
                    if (!entries.isNullOrEmpty()) {
                        IconButton(onClick = { onShare(entries) }) {
                            Icon(
                                painter = painterResource(R.drawable.ic_share),
                                contentDescription = stringResource(R.string.error_log_share),
                            )
                        }
                        IconButton(onClick = { onAction(ErrorLogAction.Clear) }) {
                            Icon(
                                painter = painterResource(R.drawable.ic_delete),
                                contentDescription = stringResource(R.string.error_log_clear),
                            )
                        }
                    }
                },
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentAlignment = Alignment.TopCenter,
        ) {
            when {
                entries == null -> Unit
                entries.isEmpty() -> EmptyState(
                    icon = R.drawable.ic_check_circle,
                    title = stringResource(R.string.error_log_empty_title),
                    message = stringResource(R.string.error_log_empty_message),
                )
                else -> LazyColumn(
                    modifier = Modifier.widthIn(max = 840.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(entries) { entry -> ErrorLogEntryCard(entry) }
                }
            }
        }
    }

    if (state.isConfirmingClear) {
        ConfirmDeleteDialog(
            title = stringResource(R.string.error_log_clear_title),
            message = stringResource(R.string.error_log_clear_message),
            onConfirm = { onAction(ErrorLogAction.ConfirmClear) },
            onDismiss = { onAction(ErrorLogAction.DismissClear) },
            confirmLabel = stringResource(R.string.error_log_clear_confirm),
        )
    }
}

@Composable
private fun ErrorLogEntryCard(entry: ErrorLogEntry) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surfaceContainer,
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = entry.tag,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.error,
            )
            Text(
                text = entry.time,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            SelectionContainer {
                Text(
                    text = entry.body,
                    style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                )
            }
        }
    }
}

/**
 * The log as plain text, oldest first, after the app and device versions
 * (release stack traces are obfuscated by R8; the version picks the mapping
 * file to retrace them with).
 */
internal fun errorLogReport(appVersion: String, device: String, entries: List<ErrorLogEntry>): String =
    buildString {
        append("Mio Link ").append(appVersion).append('\n')
        append(device).append("\n\n")
        entries.asReversed().forEach { entry ->
            append(entry.time).append("  ").append(entry.tag).append('\n')
            append(entry.body).append("\n\n")
        }
    }.trimEnd() + "\n"

private fun Context.shareErrorLog(subject: String, entries: List<ErrorLogEntry>) {
    @Suppress("DEPRECATION")
    val info = packageManager.getPackageInfo(packageName, 0)
    val appVersion = "${info.versionName} (${PackageInfoCompat.getLongVersionCode(info)})"
    val device = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT}), ${Build.MANUFACTURER} ${Build.MODEL}"
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, subject)
        putExtra(Intent.EXTRA_TEXT, errorLogReport(appVersion, device, entries))
    }
    startActivity(Intent.createChooser(send, null))
}

private val previewEntries = listOf(
    ErrorLogEntry(
        time = "2026-11-12 18:04:51.220 -0500",
        tag = "TreeRepository",
        body = "Couldn't refresh the tree: Unknown(code=INTERNAL_ERROR)\n" +
            "dev.ikana.miolink.core.network.ApiException: Unknown(code=INTERNAL_ERROR)\n" +
            "\tat dev.ikana.miolink.core.network.ApiErrorKt.getOrThrowApi(ApiError.kt:72)",
    ),
    ErrorLogEntry(
        time = "2026-11-12 17:58:02.003 -0500",
        tag = "Crash",
        body = "Uncaught exception in thread main\njava.lang.IllegalStateException: boom",
    ),
)

@Preview
@Composable
private fun ErrorLogPreview() {
    MioLinkTheme(dynamicColor = false) {
        ErrorLogContent(
            state = ErrorLogUiState(entries = previewEntries),
            onAction = {},
            onShare = {},
            onNavigateUp = {},
        )
    }
}

@Preview
@Composable
private fun ErrorLogEmptyPreview() {
    MioLinkTheme(dynamicColor = false) {
        ErrorLogContent(
            state = ErrorLogUiState(entries = emptyList()),
            onAction = {},
            onShare = {},
            onNavigateUp = {},
        )
    }
}
