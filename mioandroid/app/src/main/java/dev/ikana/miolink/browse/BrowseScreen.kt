package dev.ikana.miolink.browse

import android.content.ActivityNotFoundException
import android.content.Context
import androidx.annotation.StringRes
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.calculateEndPadding
import androidx.compose.foundation.layout.calculateStartPadding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumFlexibleTopAppBar
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.PullToRefreshDefaults
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.connectrpc.Code
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.directory.components.DirectoryListItem
import dev.ikana.miolink.link.components.LinkCard
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.ui.theme.MioLinkTheme
import kotlinx.coroutines.launch

/**
 * A directory's subdirectories and links, from the cached tree.
 *
 * [onNavigateTo] shows another directory already on the path (a breadcrumb,
 * or the nearest ancestor when this one was deleted on another device).
 */
@Composable
fun BrowseScreen(
    directoryId: Long,
    onOpenDirectory: (Long) -> Unit,
    onNavigateTo: (Long) -> Unit,
    onNavigateUp: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BrowseViewModel = viewModel(factory = BrowseViewModel.factory(directoryId)),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val colorScheme = MaterialTheme.colorScheme
    val openLinkFailed = stringResource(R.string.browse_open_link_failed)

    LaunchedEffect(state.redirectTo) {
        state.redirectTo?.let(onNavigateTo)
    }

    state.message?.let { message ->
        val text = stringResource(message.textRes())
        val actionLabel = message.actionRes()?.let { stringResource(it) }
        LaunchedEffect(message) {
            val result = snackbarHostState.showSnackbar(
                message = text,
                actionLabel = actionLabel,
                withDismissAction = actionLabel != null,
                duration = if (actionLabel != null) SnackbarDuration.Long else SnackbarDuration.Short,
            )
            if (result == SnackbarResult.ActionPerformed) {
                if (message.opensSettings()) onOpenSettings() else viewModel.onAction(BrowseAction.Refresh)
            }
            viewModel.onAction(BrowseAction.MessageShown(message))
        }
    }

    BrowseContent(
        state = state,
        onAction = { action ->
            when (action) {
                is BrowseAction.OpenDirectory -> onOpenDirectory(action.id)
                is BrowseAction.OpenAncestor -> onNavigateTo(action.id)
                BrowseAction.NavigateUp -> onNavigateUp()
                BrowseAction.OpenSettings -> onOpenSettings()
                is BrowseAction.OpenLink -> {
                    val toolbarColor = colorScheme.surfaceContainer.toArgb()
                    if (openInCustomTab(context, action.link.url, toolbarColor)) {
                        viewModel.onAction(action)
                    } else {
                        scope.launch { snackbarHostState.showSnackbar(openLinkFailed) }
                    }
                }
                else -> viewModel.onAction(action)
            }
        },
        modifier = modifier,
        snackbarHostState = snackbarHostState,
    )
}

/** Opens [url] in a Custom Tab. False when no browser can open it. */
private fun openInCustomTab(context: Context, url: String, toolbarColor: Int): Boolean = try {
    CustomTabsIntent.Builder()
        .setShowTitle(true)
        .setDefaultColorSchemeParams(
            CustomTabColorSchemeParams.Builder().setToolbarColor(toolbarColor).build(),
        )
        .build()
        .launchUrl(context, url.toUri())
    true
} catch (_: ActivityNotFoundException) {
    false
}

@StringRes
private fun BrowseMessage.textRes(): Int = when (this) {
    is BrowseMessage.Error -> when (error) {
        ApiError.Unauthenticated -> R.string.browse_error_unauthenticated
        ApiError.NotConfigured -> R.string.browse_error_not_configured
        ApiError.Unreachable -> R.string.browse_error_unreachable
        else -> R.string.browse_error_sync
    }
}

@StringRes
private fun BrowseMessage.actionRes(): Int? =
    if (opensSettings()) R.string.browse_open_settings else R.string.browse_retry

private fun BrowseMessage.opensSettings(): Boolean = when (this) {
    is BrowseMessage.Error -> error.needsSettings()
}

private fun ApiError.needsSettings(): Boolean =
    this == ApiError.Unauthenticated || this == ApiError.NotConfigured

private enum class ContentKind { Loading, SyncError, Tree }

/**
 * The directory's contents: a collapsing top bar with the name and the path
 * to it, then subdirectories and links. Pull to refresh; while nothing is
 * cached, a loading indicator or the sync error with a way to fix it.
 */
@Composable
fun BrowseContent(
    state: BrowseUiState,
    onAction: (BrowseAction) -> Unit,
    modifier: Modifier = Modifier,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
) {
    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    Scaffold(
        modifier = modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = { BrowseTopBar(state, onAction, scrollBehavior) },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        val layoutDirection = LocalLayoutDirection.current
        // The list draws behind the navigation bar; the top bar stays above.
        val listPadding = PaddingValues(
            start = innerPadding.calculateStartPadding(layoutDirection) + 16.dp,
            end = innerPadding.calculateEndPadding(layoutDirection) + 16.dp,
            top = 8.dp,
            bottom = innerPadding.calculateBottomPadding() + 16.dp,
        )
        val pullState = rememberPullToRefreshState()
        val kind = when {
            state.isLoading -> ContentKind.Loading
            !state.hasCache -> ContentKind.SyncError
            else -> ContentKind.Tree
        }
        PullToRefreshBox(
            isRefreshing = state.isRefreshing && kind != ContentKind.Loading,
            onRefresh = { onAction(BrowseAction.Refresh) },
            modifier = Modifier
                .fillMaxSize()
                .padding(top = innerPadding.calculateTopPadding()),
            state = pullState,
            enabled = kind != ContentKind.Loading,
            indicator = {
                PullToRefreshDefaults.LoadingIndicator(
                    state = pullState,
                    isRefreshing = state.isRefreshing && kind != ContentKind.Loading,
                    modifier = Modifier.align(Alignment.TopCenter),
                )
            },
        ) {
            Crossfade(targetState = kind, label = "browse content") { shown ->
                when (shown) {
                    ContentKind.Loading -> LoadingContent()
                    ContentKind.SyncError -> LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = listPadding,
                    ) {
                        item(key = "error") {
                            SyncErrorState(
                                error = state.syncError,
                                onAction = onAction,
                                modifier = Modifier.fillParentMaxHeight(FULL_HEIGHT_FRACTION),
                            )
                        }
                    }
                    ContentKind.Tree -> LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = listPadding,
                    ) {
                        directoryContents(state, onAction)
                    }
                }
            }
        }
    }
}

/** Leaves room for the padding, so an empty list doesn't scroll. */
private const val FULL_HEIGHT_FRACTION = 0.9f

private fun LazyListScope.directoryContents(
    state: BrowseUiState,
    onAction: (BrowseAction) -> Unit,
) {
    if (state.isEmpty) {
        item(key = "empty") {
            EmptyState(
                icon = R.drawable.ic_folder,
                title = stringResource(
                    if (state.isRoot) R.string.browse_empty_title else R.string.browse_empty_directory_title,
                ),
                message = stringResource(
                    if (state.isRoot) R.string.browse_empty_message else R.string.browse_empty_directory_message,
                ),
                modifier = Modifier
                    .animateItem()
                    .fillParentMaxHeight(FULL_HEIGHT_FRACTION),
            )
        }
        return
    }
    if (state.directories.isNotEmpty()) {
        item(key = "directories-header", contentType = "header") {
            SectionHeader(R.string.browse_section_directories, Modifier.animateItem())
        }
        val count = state.directories.size
        itemsIndexed(
            items = state.directories,
            key = { _, directory -> "directory-${directory.id}" },
            contentType = { _, _ -> "directory" },
        ) { index, directory ->
            DirectoryListItem(
                directory = directory,
                index = index,
                count = count,
                onClick = { onAction(BrowseAction.OpenDirectory(directory.id)) },
                modifier = Modifier
                    .animateItem()
                    .padding(bottom = if (index < count - 1) ListItemDefaults.SegmentedGap else 0.dp),
            )
        }
    }
    if (state.links.isNotEmpty()) {
        item(key = "links-header", contentType = "header") {
            SectionHeader(R.string.browse_section_links, Modifier.animateItem())
        }
        itemsIndexed(
            items = state.links,
            key = { _, link -> "link-${link.id}" },
            contentType = { _, _ -> "link" },
        ) { index, link ->
            LinkCard(
                link = link,
                onClick = { onAction(BrowseAction.OpenLink(link)) },
                modifier = Modifier
                    .animateItem()
                    .padding(bottom = if (index < state.links.size - 1) 8.dp else 0.dp),
            )
        }
    }
}

@Composable
private fun SectionHeader(@StringRes text: Int, modifier: Modifier = Modifier) {
    Text(
        text = stringResource(text),
        modifier = modifier
            .fillMaxWidth()
            .padding(start = 4.dp, top = 16.dp, bottom = 8.dp)
            .semantics { heading() },
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary,
    )
}

@Composable
private fun BrowseTopBar(
    state: BrowseUiState,
    onAction: (BrowseAction) -> Unit,
    scrollBehavior: TopAppBarScrollBehavior,
) {
    val title = if (state.isRoot) stringResource(R.string.app_name) else state.name
    MediumFlexibleTopAppBar(
        title = { Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        subtitle = if (state.ancestors.isNotEmpty()) {
            { Breadcrumbs(state.ancestors, onAction) }
        } else {
            null
        },
        navigationIcon = {
            if (!state.isRoot) NavigateUpButton { onAction(BrowseAction.NavigateUp) }
        },
        actions = {
            if (state.isRoot) {
                IconButton(onClick = { onAction(BrowseAction.OpenSettings) }) {
                    Icon(
                        painter = painterResource(R.drawable.ic_settings),
                        contentDescription = stringResource(R.string.browse_open_settings),
                    )
                }
            }
        },
        scrollBehavior = scrollBehavior,
    )
}

/**
 * The path from the root to the parent, each step tappable. Scrolled to the
 * end, so the closest ancestors stay visible in deep trees.
 */
@Composable
private fun Breadcrumbs(ancestors: List<PathSegment>, onAction: (BrowseAction) -> Unit) {
    val scrollState = rememberScrollState()
    LaunchedEffect(ancestors, scrollState.maxValue) { scrollState.scrollTo(scrollState.maxValue) }
    val rootName = stringResource(R.string.app_name)
    val path = ancestors.joinToString(" / ") { it.name.ifEmpty { rootName } }
    val pathDescription = stringResource(R.string.browse_path, path)
    Row(
        modifier = Modifier
            .horizontalScroll(scrollState)
            .semantics { contentDescription = pathDescription },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ancestors.forEachIndexed { index, segment ->
            if (index > 0) {
                Icon(
                    painter = painterResource(R.drawable.ic_chevron_right),
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                )
            }
            val name = segment.name.ifEmpty { rootName }
            Text(
                text = name,
                modifier = Modifier
                    .clip(MaterialTheme.shapes.small)
                    .clickable(
                        onClickLabel = stringResource(R.string.browse_open_directory, name),
                        role = Role.Button,
                    ) { onAction(BrowseAction.OpenAncestor(segment.id)) }
                    .padding(horizontal = 4.dp, vertical = 2.dp),
                maxLines = 1,
            )
        }
    }
}

@Composable
private fun LoadingContent() {
    val description = stringResource(R.string.browse_loading)
    Box(
        modifier = Modifier
            .fillMaxSize()
            .semantics { contentDescription = description },
        contentAlignment = Alignment.Center,
    ) {
        LoadingIndicator()
    }
}

/** Nothing is cached and the sync failed: say why and how to fix it. */
@Composable
private fun SyncErrorState(
    error: ApiError?,
    onAction: (BrowseAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val needsSettings = error?.needsSettings() == true
    val (title, message) = when (error) {
        ApiError.NotConfigured -> R.string.browse_not_configured_title to R.string.browse_not_configured_message
        ApiError.Unauthenticated -> R.string.browse_unauthenticated_title to R.string.browse_unauthenticated_message
        ApiError.Unreachable -> R.string.browse_unreachable_title to R.string.browse_unreachable_message
        else -> R.string.browse_sync_failed_title to R.string.browse_sync_failed_message
    }
    EmptyState(
        icon = if (needsSettings) R.drawable.ic_settings else R.drawable.ic_error,
        title = stringResource(title),
        message = stringResource(message),
        modifier = modifier,
        action = {
            Button(
                onClick = {
                    onAction(if (needsSettings) BrowseAction.OpenSettings else BrowseAction.Refresh)
                },
            ) {
                Text(stringResource(if (needsSettings) R.string.browse_open_settings else R.string.browse_retry))
            }
        },
    )
}

// Previews.

private val previewDirectories = listOf(
    DirectoryEntity(id = 2, parentId = 3, name = "Articles", createdAt = 0),
    DirectoryEntity(id = 4, parentId = 3, name = "Recipes", createdAt = 0),
    DirectoryEntity(id = 5, parentId = 3, name = "Tools", createdAt = 0),
)

private val previewLinks = listOf(
    LinkEntity(
        id = 10, directoryId = 3, title = "Material 3 Expressive: what's new and how to use it",
        url = "https://m3.material.io/blog/building-with-m3-expressive", thumbnailUrl = null,
        views = 12, createdAt = 0,
    ),
    LinkEntity(
        id = 11, directoryId = 3, title = "Connect RPC", url = "https://connectrpc.com/docs/",
        thumbnailUrl = null, views = 1, createdAt = 0,
    ),
)

@Composable
private fun BrowsePreview(state: BrowseUiState) {
    MioLinkTheme(dynamicColor = false) {
        BrowseContent(state = state, onAction = {})
    }
}

@Preview(name = "Populated")
@Composable
private fun BrowsePopulatedPreview() = BrowsePreview(
    BrowseUiState(
        directoryId = 3,
        name = "Reading",
        ancestors = listOf(PathSegment(ROOT_DIRECTORY_ID, ""), PathSegment(6, "Work")),
        directories = previewDirectories,
        links = previewLinks,
        hasCache = true,
    ),
)

@Preview(name = "Empty root")
@Composable
private fun BrowseEmptyPreview() = BrowsePreview(
    BrowseUiState(directoryId = ROOT_DIRECTORY_ID, hasCache = true),
)

@Preview(name = "Loading")
@Composable
private fun BrowseLoadingPreview() = BrowsePreview(BrowseUiState(directoryId = ROOT_DIRECTORY_ID))

@Preview(name = "Sync error")
@Composable
private fun BrowseSyncErrorPreview() = BrowsePreview(
    BrowseUiState(directoryId = ROOT_DIRECTORY_ID, syncError = ApiError.Unknown(Code.INTERNAL_ERROR)),
)

@Preview(name = "Unauthenticated")
@Composable
private fun BrowseUnauthenticatedPreview() = BrowsePreview(
    BrowseUiState(directoryId = ROOT_DIRECTORY_ID, syncError = ApiError.Unauthenticated),
)

