package dev.ikana.miolink.settings

import androidx.annotation.DrawableRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * The settings menu: the server connection (URL and API key) and the error
 * log. First-run setup opens the connection screen directly, not this one.
 */
@Composable
fun SettingsScreen(
    onNavigateUp: () -> Unit,
    onOpenServerSettings: () -> Unit,
    onOpenErrorLog: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_title)) },
                navigationIcon = { NavigateUpButton(onNavigateUp) },
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentAlignment = Alignment.TopCenter,
        ) {
            Column(
                modifier = Modifier
                    .widthIn(max = 600.dp)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(ListItemDefaults.SegmentedGap),
            ) {
                SettingsItem(
                    icon = R.drawable.ic_dns,
                    title = stringResource(R.string.settings_server_connection),
                    summary = stringResource(R.string.settings_server_connection_summary),
                    index = 0,
                    onClick = onOpenServerSettings,
                )
                SettingsItem(
                    icon = R.drawable.ic_bug_report,
                    title = stringResource(R.string.settings_error_log),
                    summary = stringResource(R.string.settings_error_log_summary),
                    index = 1,
                    onClick = onOpenErrorLog,
                )
            }
        }
    }
}

@Composable
private fun SettingsItem(
    @DrawableRes icon: Int,
    title: String,
    summary: String,
    index: Int,
    onClick: () -> Unit,
) {
    SegmentedListItem(
        onClick = onClick,
        shapes = ListItemDefaults.segmentedShapes(index = index, count = ITEM_COUNT),
        leadingContent = { Icon(painterResource(icon), contentDescription = null) },
        trailingContent = { Icon(painterResource(R.drawable.ic_chevron_right), contentDescription = null) },
        supportingContent = { Text(summary) },
    ) {
        Text(title)
    }
}

private const val ITEM_COUNT = 2

@Preview
@Composable
private fun SettingsScreenPreview() {
    MioLinkTheme(dynamicColor = false) {
        SettingsScreen(onNavigateUp = {}, onOpenServerSettings = {}, onOpenErrorLog = {})
    }
}
