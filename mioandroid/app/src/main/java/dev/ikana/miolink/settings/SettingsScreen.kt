package dev.ikana.miolink.settings

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.ui.theme.MioLinkTheme

/** Placeholder for the server settings; task 003 builds the real screen. */
@Composable
fun SettingsScreen(
    onNavigateUp: () -> Unit,
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
        EmptyState(
            icon = R.drawable.ic_settings,
            title = stringResource(R.string.settings_placeholder_title),
            message = stringResource(R.string.settings_placeholder_message),
            modifier = Modifier.padding(innerPadding),
        )
    }
}

@Preview
@Composable
private fun SettingsScreenPreview() {
    MioLinkTheme(dynamicColor = false) {
        SettingsScreen(onNavigateUp = {})
    }
}
