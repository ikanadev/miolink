package dev.ikana.miolink.browse

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.text.input.TextFieldState
import androidx.compose.foundation.text.input.clearText
import androidx.compose.material3.AppBarWithSearch
import androidx.compose.material3.ExpandedFullScreenSearchBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.SearchBarScrollBehavior
import androidx.compose.material3.SearchBarState
import androidx.compose.material3.SearchBarValue
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.directory.components.DirectoryListItem
import kotlinx.coroutines.launch

/**
 * The search field, shared by the root's collapsed search bar and the
 * expanded search view. Expanded, it leads with a back button that closes
 * the search and ends with a clear button once there's a query.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SearchInputField(
    queryState: TextFieldState,
    searchBarState: SearchBarState,
    placeholder: String,
) {
    val scope = rememberCoroutineScope()
    val keyboard = LocalSoftwareKeyboardController.current
    val expanded = searchBarState.currentValue == SearchBarValue.Expanded
    SearchBarDefaults.InputField(
        textFieldState = queryState,
        searchBarState = searchBarState,
        // Results follow the query as it's typed; the key only hides the keyboard.
        onSearch = { keyboard?.hide() },
        placeholder = { Text(placeholder, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        leadingIcon = {
            if (expanded) {
                IconButton(onClick = { scope.launch { searchBarState.animateToCollapsed() } }) {
                    Icon(
                        painter = painterResource(R.drawable.ic_arrow_back),
                        contentDescription = stringResource(R.string.browse_search_close),
                    )
                }
            } else {
                Icon(painter = painterResource(R.drawable.ic_search), contentDescription = null)
            }
        },
        trailingIcon = if (expanded && queryState.text.isNotEmpty()) {
            {
                IconButton(onClick = { queryState.clearText() }) {
                    Icon(
                        painter = painterResource(R.drawable.ic_close),
                        contentDescription = stringResource(R.string.browse_search_clear),
                    )
                }
            }
        } else {
            null
        },
    )
}

/** The root's top bar: a search bar, with Settings after it. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun RootSearchAppBar(
    searchBarState: SearchBarState,
    inputField: @Composable () -> Unit,
    scrollBehavior: SearchBarScrollBehavior,
    onAction: (BrowseAction) -> Unit,
) {
    AppBarWithSearch(
        state = searchBarState,
        inputField = inputField,
        actions = {
            IconButton(onClick = { onAction(BrowseAction.OpenSettings) }) {
                Icon(
                    painter = painterResource(R.drawable.ic_settings),
                    contentDescription = stringResource(R.string.browse_open_settings),
                )
            }
        },
        scrollBehavior = scrollBehavior,
    )
}

/**
 * The expanded search, full screen: [search]'s results below the field.
 * Directories open in Browse; links open like the directory's own (tap) or
 * go to their edit screen (long press). The links follow
 * [BrowseUiState.linkLayout], with the same toggle.
 */
@Composable
internal fun BrowseSearchView(
    searchBarState: SearchBarState,
    inputField: @Composable () -> Unit,
    state: BrowseUiState,
    search: SearchUiState,
    onAction: (BrowseAction) -> Unit,
) {
    ExpandedFullScreenSearchBar(state = searchBarState, inputField = inputField) {
        val results = search.results
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .imePadding(),
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = 8.dp,
                bottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding() + 16.dp,
            ),
        ) {
            when {
                search.query.isBlank() -> item(key = "start") {
                    EmptyState(
                        icon = R.drawable.ic_search,
                        title = stringResource(R.string.browse_search_start_title),
                        message = stringResource(R.string.browse_search_start_message),
                        modifier = Modifier.padding(top = 48.dp),
                    )
                }
                results.isEmpty -> item(key = "no-results") {
                    EmptyState(
                        icon = R.drawable.ic_search,
                        title = stringResource(R.string.browse_search_no_results_title),
                        message = stringResource(R.string.browse_search_no_results_message, search.query.trim()),
                        modifier = Modifier.padding(top = 48.dp),
                    )
                }
                else -> {
                    if (results.directories.isNotEmpty()) {
                        item(key = "directories-header", contentType = "header") {
                            SectionHeader(R.string.browse_section_directories, Modifier.animateItem())
                        }
                        val count = results.directories.size
                        itemsIndexed(
                            items = results.directories,
                            key = { _, hit -> "directory-${hit.item.id}" },
                            contentType = { _, _ -> "directory" },
                        ) { index, hit ->
                            DirectoryListItem(
                                directory = hit.item,
                                index = index,
                                count = count,
                                onClick = { onAction(BrowseAction.OpenDirectory(hit.item.id)) },
                                location = hit.location.ifEmpty { null },
                                modifier = Modifier
                                    .animateItem()
                                    .padding(bottom = if (index < count - 1) ListItemDefaults.SegmentedGap else 0.dp),
                            )
                        }
                    }
                    if (results.links.isNotEmpty()) {
                        item(key = "links-header", contentType = "header") {
                            LinksHeader(state.linkLayout, onAction, Modifier.animateItem())
                        }
                        linkItems(
                            links = results.links.map { it.item },
                            layout = state.linkLayout,
                            onAction = onAction,
                            location = results.links.associate { it.item.id to it.location.ifEmpty { null } },
                            withActions = false,
                        )
                    }
                }
            }
        }
    }
}
