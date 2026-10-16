package dev.ikana.miolink.link

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

/** Placeholder for editing link [linkId]; task 007 builds the real screen. */
@Suppress("UNUSED_PARAMETER")
@Composable
fun LinkEditScreen(
    linkId: Long,
    onNavigateUp: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.link_edit_title)) },
                navigationIcon = { NavigateUpButton(onNavigateUp) },
            )
        },
    ) { innerPadding ->
        EmptyState(
            icon = R.drawable.ic_link,
            title = stringResource(R.string.link_edit_placeholder_title),
            message = stringResource(R.string.link_edit_placeholder_message),
            modifier = Modifier.padding(innerPadding),
        )
    }
}

@Preview
@Composable
private fun LinkEditScreenPreview() {
    MioLinkTheme(dynamicColor = false) {
        LinkEditScreen(linkId = 1, onNavigateUp = {})
    }
}
