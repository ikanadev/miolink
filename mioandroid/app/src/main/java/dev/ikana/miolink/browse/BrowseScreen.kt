package dev.ikana.miolink.browse

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.ui.theme.MioLinkTheme

/** Placeholder for a directory's contents; task 005 builds the real screen. */
@Composable
fun BrowseScreen(
    directoryId: Long,
    onNavigateUp: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val isRoot = directoryId == ROOT_DIRECTORY_ID
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        stringResource(
                            if (isRoot) R.string.app_name else R.string.browse_directory_title,
                        ),
                    )
                },
                navigationIcon = { if (!isRoot) NavigateUpButton(onNavigateUp) },
                actions = {
                    IconButton(onClick = onOpenSettings) {
                        Icon(
                            painter = painterResource(R.drawable.ic_settings),
                            contentDescription = stringResource(R.string.browse_open_settings),
                        )
                    }
                },
            )
        },
    ) { innerPadding ->
        EmptyState(
            icon = R.drawable.ic_folder,
            title = stringResource(R.string.browse_empty_title),
            message = stringResource(R.string.browse_empty_message),
            modifier = Modifier.padding(innerPadding),
        )
    }
}

@Preview
@Composable
private fun BrowseScreenPreview() {
    MioLinkTheme(dynamicColor = false) {
        BrowseScreen(directoryId = ROOT_DIRECTORY_ID, onNavigateUp = {}, onOpenSettings = {})
    }
}
