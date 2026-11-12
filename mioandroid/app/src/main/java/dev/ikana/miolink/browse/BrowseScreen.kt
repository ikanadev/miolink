package dev.ikana.miolink.browse

import androidx.activity.compose.BackHandler
import androidx.annotation.StringRes
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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.input.clearText
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButtonMenu
import androidx.compose.material3.FloatingActionButtonMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumFlexibleTopAppBar
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.SearchBarValue
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.ToggleFloatingActionButton
import androidx.compose.material3.ToggleFloatingActionButtonDefaults.animateIcon
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.material3.animateFloatingActionButton
import androidx.compose.material3.rememberSearchBarState
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.PullToRefreshDefaults
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.traversalIndex
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.connectrpc.Code
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.settings.LinkLayout
import dev.ikana.miolink.core.ui.ConfirmDeleteDialog
import dev.ikana.miolink.core.ui.DirectoryPicker
import dev.ikana.miolink.core.ui.EmptyState
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.core.ui.PickerDirectory
import dev.ikana.miolink.core.ui.openInCustomTab
import dev.ikana.miolink.directory.components.DirectoryActionsSheet
import dev.ikana.miolink.directory.components.DirectoryListItem
import dev.ikana.miolink.directory.components.NewDirectoryDialog
import dev.ikana.miolink.directory.components.RenameDirectoryDialog
import dev.ikana.miolink.link.components.AddLinkSheet
import dev.ikana.miolink.link.components.LinkActionsSheet
import dev.ikana.miolink.link.components.LinkCard
import dev.ikana.miolink.link.components.LinkLayoutToggle
import dev.ikana.miolink.link.components.LinkListItem
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SubtreeCount
import dev.ikana.miolink.ui.theme.MioLinkTheme
import kotlinx.coroutines.launch

/**
 * A directory's subdirectories and links, from the cached tree.
 *
 * [onNavigateTo] shows another directory already on the path (a breadcrumb,
 * or the nearest ancestor when this one was deleted on another device).
 * [onEditLink] opens a link's edit screen. [incomingMessage] is a message
 * another screen left for this one (a link deleted from its edit screen),
 * shown in the snackbar; [onIncomingMessageShown] clears it.
 */
@Composable
fun BrowseScreen(
    directoryId: Long,
    onOpenDirectory: (Long) -> Unit,
    onNavigateTo: (Long) -> Unit,
    onNavigateUp: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenServerSettings: () -> Unit,
    onEditLink: (Long) -> Unit,
    modifier: Modifier = Modifier,
    incomingMessage: String? = null,
    onIncomingMessageShown: () -> Unit = {},
    viewModel: BrowseViewModel = viewModel(factory = BrowseViewModel.factory(directoryId)),
    searchViewModel: SearchViewModel = viewModel(factory = SearchViewModel.factory(directoryId)),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val search by searchViewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val colorScheme = MaterialTheme.colorScheme
    val openLinkFailed = stringResource(R.string.browse_open_link_failed)

    LaunchedEffect(state.redirectTo) {
        state.redirectTo?.let(onNavigateTo)
    }

    LaunchedEffect(state.editLinkId) {
        state.editLinkId?.let { id ->
            onEditLink(id)
            viewModel.onAction(BrowseAction.LinkEditOpened)
        }
    }

    LaunchedEffect(incomingMessage) {
        if (incomingMessage != null) {
            viewModel.onAction(BrowseAction.ShowText(incomingMessage))
            onIncomingMessageShown()
        }
    }

    state.message?.let { message ->
        val text = message.text()
        val action = message.action()
        val actionLabel = action?.let { stringResource(it.labelRes()) }
        LaunchedEffect(message) {
            // Errors wait for the user; confirmations come and go.
            val isError = action == MessageAction.Settings || action == MessageAction.Retry
            val result = snackbarHostState.showSnackbar(
                message = text,
                actionLabel = actionLabel,
                withDismissAction = isError,
                duration = if (isError) SnackbarDuration.Long else SnackbarDuration.Short,
            )
            if (result == SnackbarResult.ActionPerformed) {
                when (action) {
                    MessageAction.Settings -> onOpenServerSettings()
                    MessageAction.Retry -> viewModel.onAction(BrowseAction.Refresh)
                    is MessageAction.OpenDirectory -> onOpenDirectory(action.id)
                    null -> Unit
                }
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
                BrowseAction.OpenServerSettings -> onOpenServerSettings()
                is BrowseAction.EditLink -> onEditLink(action.id)
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
        search = search,
        onSearchQueryChange = searchViewModel::onQueryChange,
    )
}

/** What a snackbar's action button does. */
private sealed interface MessageAction {
    data object Settings : MessageAction
    data object Retry : MessageAction
    data class OpenDirectory(val id: Long) : MessageAction
}

@StringRes
private fun MessageAction.labelRes(): Int = when (this) {
    MessageAction.Settings -> R.string.browse_open_settings
    MessageAction.Retry -> R.string.browse_retry
    is MessageAction.OpenDirectory -> R.string.browse_open
}

@Composable
private fun BrowseMessage.text(): String = when (this) {
    is BrowseMessage.Error -> stringResource(
        when (error) {
            ApiError.Unauthenticated -> R.string.browse_error_unauthenticated
            ApiError.NotConfigured -> R.string.browse_error_not_configured
            ApiError.Unreachable -> R.string.browse_error_unreachable
            else -> R.string.browse_error_sync
        },
    )
    is BrowseMessage.WriteError -> stringResource(
        when (error) {
            ApiError.Unauthenticated -> R.string.browse_error_unauthenticated
            ApiError.NotConfigured -> R.string.browse_error_not_configured
            ApiError.Unreachable -> R.string.browse_error_unreachable
            else -> R.string.browse_write_error
        },
    )
    is BrowseMessage.DirectoryCreated -> stringResource(R.string.browse_directory_created, name)
    is BrowseMessage.DirectoryRenamed -> stringResource(R.string.browse_directory_renamed, name)
    is BrowseMessage.DirectoryMoved -> stringResource(
        R.string.browse_directory_moved,
        name,
        destination.ifEmpty { stringResource(R.string.app_name) },
    )
    is BrowseMessage.DirectoryDeleted -> stringResource(R.string.browse_directory_deleted, name)
    BrowseMessage.DirectoryGone -> stringResource(R.string.browse_directory_gone)
    is BrowseMessage.LinkMoved -> stringResource(
        R.string.browse_link_moved,
        title,
        destination.ifEmpty { stringResource(R.string.app_name) },
    )
    is BrowseMessage.LinkDeleted -> stringResource(R.string.link_deleted, title)
    BrowseMessage.LinkGone -> stringResource(R.string.link_gone)
    is BrowseMessage.Text -> text
}

private fun BrowseMessage.action(): MessageAction? = when (this) {
    is BrowseMessage.Error -> if (error.needsSettings()) MessageAction.Settings else MessageAction.Retry
    is BrowseMessage.WriteError -> MessageAction.Settings.takeIf { error.needsSettings() }
    is BrowseMessage.DirectoryCreated -> MessageAction.OpenDirectory(id)
    is BrowseMessage.DirectoryRenamed,
    is BrowseMessage.DirectoryMoved,
    is BrowseMessage.DirectoryDeleted,
    BrowseMessage.DirectoryGone,
    is BrowseMessage.LinkMoved,
    is BrowseMessage.LinkDeleted,
    BrowseMessage.LinkGone,
    is BrowseMessage.Text,
    -> null
}

private fun ApiError.needsSettings(): Boolean =
    this == ApiError.Unauthenticated || this == ApiError.NotConfigured

private enum class ContentKind { Loading, SyncError, Tree }

/**
 * The directory's contents: a collapsing top bar with the name and the path
 * to it, then subdirectories and links. Pull to refresh; while nothing is
 * cached, a loading indicator or the sync error with a way to fix it.
 *
 * Once a tree is cached, a FAB menu adds links and directories here; it
 * hides while scrolling down. A long press on a subdirectory or a link opens
 * its actions. [BrowseUiState.dialog] is shown on top.
 *
 * Search covers this directory's subtree. The root's top bar is a search
 * bar; other directories open the search from their top bar. The query goes
 * to [onSearchQueryChange] and [search] holds its results; closing the
 * search clears it.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BrowseContent(
    state: BrowseUiState,
    onAction: (BrowseAction) -> Unit,
    modifier: Modifier = Modifier,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    search: SearchUiState = SearchUiState(),
    onSearchQueryChange: (String) -> Unit = {},
) {
    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    val searchScrollBehavior = SearchBarDefaults.enterAlwaysSearchBarScrollBehavior()
    val searchBarState = rememberSearchBarState()
    val queryState = rememberTextFieldState()
    val scope = rememberCoroutineScope()
    LaunchedEffect(queryState) {
        snapshotFlow { queryState.text.toString() }.collect(onSearchQueryChange)
    }
    LaunchedEffect(searchBarState.currentValue) {
        if (searchBarState.currentValue == SearchBarValue.Collapsed) queryState.clearText()
    }
    val searchPlaceholder = if (state.isRoot || state.name.isEmpty()) {
        stringResource(R.string.browse_search_hint_root)
    } else {
        stringResource(R.string.browse_search_hint_directory, state.name)
    }
    val inputField = @Composable { SearchInputField(queryState, searchBarState, searchPlaceholder) }
    val kind = when {
        state.isLoading -> ContentKind.Loading
        !state.hasCache -> ContentKind.SyncError
        else -> ContentKind.Tree
    }
    var fabExpanded by rememberSaveable { mutableStateOf(false) }
    var fabVisible by rememberSaveable { mutableStateOf(true) }
    BackHandler(enabled = fabExpanded) { fabExpanded = false }
    val fabScrollConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                if (available.y < -FAB_SCROLL_THRESHOLD) {
                    fabVisible = false
                    fabExpanded = false
                } else if (available.y > FAB_SCROLL_THRESHOLD) {
                    fabVisible = true
                }
                return Offset.Zero
            }
        }
    }
    Scaffold(
        modifier = modifier
            .nestedScroll(fabScrollConnection)
            .nestedScroll(
                if (state.isRoot) searchScrollBehavior.nestedScrollConnection else scrollBehavior.nestedScrollConnection,
            ),
        topBar = {
            if (state.isRoot) {
                RootSearchAppBar(searchBarState, inputField, searchScrollBehavior, onAction)
            } else {
                BrowseTopBar(
                    state = state,
                    onAction = onAction,
                    scrollBehavior = scrollBehavior,
                    onSearch = { scope.launch { searchBarState.animateToExpanded() } },
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            if (kind == ContentKind.Tree) {
                CreateMenu(
                    visible = fabVisible,
                    expanded = fabExpanded,
                    onExpandedChange = { fabExpanded = it },
                    onAction = onAction,
                )
            }
        },
    ) { innerPadding ->
        val layoutDirection = LocalLayoutDirection.current
        // The list draws behind the navigation bar; the top bar stays above.
        val listPadding = PaddingValues(
            start = innerPadding.calculateStartPadding(layoutDirection) + 16.dp,
            end = innerPadding.calculateEndPadding(layoutDirection) + 16.dp,
            top = 8.dp,
            // Room to scroll the last item above the FAB.
            bottom = innerPadding.calculateBottomPadding() + 16.dp + FAB_CLEARANCE,
        )
        val pullState = rememberPullToRefreshState()
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
    if (kind == ContentKind.Tree) BrowseSearchView(searchBarState, inputField, state, search, onAction)
    BrowseDialogs(state, onAction)
}

/** Leaves room for the padding, so an empty list doesn't scroll. */
private const val FULL_HEIGHT_FRACTION = 0.9f

/** Scroll distance (px per event) that hides or shows the FAB, ignoring jitter. */
private const val FAB_SCROLL_THRESHOLD = 4f

/** A FAB's height plus its margin. */
private val FAB_CLEARANCE = 80.dp

/**
 * The FAB menu for adding things to this directory. Hidden (scaled away)
 * while [visible] is false, unless it's open.
 */
@Composable
private fun CreateMenu(
    visible: Boolean,
    expanded: Boolean,
    onExpandedChange: (Boolean) -> Unit,
    onAction: (BrowseAction) -> Unit,
) {
    val openLabel = stringResource(R.string.browse_create_menu_open)
    val closeLabel = stringResource(R.string.browse_create_menu_close)
    FloatingActionButtonMenu(
        expanded = expanded,
        button = {
            ToggleFloatingActionButton(
                checked = expanded,
                onCheckedChange = onExpandedChange,
                modifier = Modifier
                    .semantics {
                        traversalIndex = -1f
                        contentDescription = if (expanded) closeLabel else openLabel
                    }
                    .animateFloatingActionButton(visible = visible || expanded, alignment = Alignment.BottomEnd),
            ) {
                val icon by remember {
                    derivedStateOf { if (checkedProgress > 0.5f) R.drawable.ic_close else R.drawable.ic_add }
                }
                Icon(
                    painter = painterResource(icon),
                    contentDescription = null,
                    modifier = Modifier.animateIcon({ checkedProgress }),
                )
            }
        },
    ) {
        FloatingActionButtonMenuItem(
            onClick = {
                onExpandedChange(false)
                onAction(BrowseAction.ShowAddLink)
            },
            text = { Text(stringResource(R.string.browse_new_link)) },
            icon = { Icon(painterResource(R.drawable.ic_add_link), contentDescription = null) },
        )
        FloatingActionButtonMenuItem(
            onClick = {
                onExpandedChange(false)
                onAction(BrowseAction.ShowNewDirectory)
            },
            text = { Text(stringResource(R.string.browse_new_directory)) },
            icon = { Icon(painterResource(R.drawable.ic_create_new_folder), contentDescription = null) },
        )
    }
}

/** The dialog or sheet in [BrowseUiState.dialog], if any. */
@Composable
private fun BrowseDialogs(state: BrowseUiState, onAction: (BrowseAction) -> Unit) {
    val dismiss = { onAction(BrowseAction.DismissDialog) }
    when (val dialog = state.dialog) {
        null -> Unit
        is BrowseDialog.DirectoryActions -> {
            val directory = dialog.directory
            DirectoryActionsSheet(
                directory = directory,
                onRename = { onAction(BrowseAction.ShowRenameDirectory(directory)) },
                onMove = { onAction(BrowseAction.ShowMoveDirectory(directory)) },
                onDelete = { onAction(BrowseAction.ShowDeleteDirectory(directory)) },
                onDismiss = dismiss,
            )
        }
        is BrowseDialog.NewDirectory -> NewDirectoryDialog(
            siblingNames = state.directories.map { it.name },
            onConfirm = { onAction(BrowseAction.CreateDirectory(it)) },
            onDismiss = dismiss,
            isSaving = state.isSaving,
            rejected = dialog.rejected,
            errorMessage = dialog.failure?.let { writeFailureText(it) },
        )
        is BrowseDialog.RenameDirectory -> RenameDirectoryDialog(
            currentName = dialog.directory.name,
            siblingNames = state.directories.filter { it.id != dialog.directory.id }.map { it.name },
            onConfirm = { onAction(BrowseAction.RenameDirectory(dialog.directory.id, it)) },
            onDismiss = dismiss,
            isSaving = state.isSaving,
            rejected = dialog.rejected,
            errorMessage = dialog.failure?.let { writeFailureText(it) },
        )
        is BrowseDialog.MoveDirectory -> {
            val directory = dialog.directory
            DirectoryPicker(
                directories = rememberPickerDirectories(state.allDirectories),
                title = stringResource(R.string.directory_move_title, directory.name),
                confirmLabel = stringResource(R.string.directory_move_confirm),
                onConfirm = { onAction(BrowseAction.MoveDirectory(directory.id, it)) },
                onDismiss = dismiss,
                subtitle = stringResource(R.string.directory_move_subtitle),
                currentDirectoryId = directory.parentId,
                disabledSubtreeId = directory.id,
                disabledReason = stringResource(R.string.directory_move_into_itself),
                isSaving = state.isSaving,
                errorMessage = dialog.failure?.let { error ->
                    when (error) {
                        is ApiError.AlreadyExists -> stringResource(R.string.directory_move_duplicate, directory.name)
                        is ApiError.InvalidArgument -> stringResource(R.string.directory_move_rejected)
                        else -> writeFailureText(error)
                    }
                },
            )
        }
        is BrowseDialog.DeleteDirectory -> ConfirmDeleteDialog(
            title = stringResource(R.string.directory_delete_title, dialog.directory.name),
            message = deleteMessage(dialog.count),
            onConfirm = { onAction(BrowseAction.DeleteDirectory(dialog.directory.id)) },
            onDismiss = dismiss,
            isDeleting = state.isSaving,
            errorMessage = dialog.failure?.let { writeFailureText(it) },
        )
        is BrowseDialog.AddLink -> AddLinkSheet(
            directories = rememberPickerDirectories(state.allDirectories),
            directoryId = state.directoryId,
            onSave = { onAction(BrowseAction.CreateLink(it)) },
            onDismiss = dismiss,
            isSaving = state.isSaving,
            failure = dialog.failure,
        )
        is BrowseDialog.LinkActions -> {
            val link = dialog.link
            LinkActionsSheet(
                link = link,
                onEdit = {
                    dismiss()
                    onAction(BrowseAction.EditLink(link.id))
                },
                onMove = { onAction(BrowseAction.ShowMoveLink(link)) },
                onDelete = { onAction(BrowseAction.ShowDeleteLink(link)) },
                onDismiss = dismiss,
            )
        }
        is BrowseDialog.MoveLink -> {
            val link = dialog.link
            DirectoryPicker(
                directories = rememberPickerDirectories(state.allDirectories),
                title = stringResource(R.string.link_move_title, link.title.ifBlank { link.url }),
                confirmLabel = stringResource(R.string.directory_move_confirm),
                onConfirm = { onAction(BrowseAction.MoveLink(link.id, it)) },
                onDismiss = dismiss,
                subtitle = stringResource(R.string.link_move_subtitle),
                currentDirectoryId = link.directoryId,
                isSaving = state.isSaving,
                errorMessage = dialog.failure?.let { writeFailureText(it) },
            )
        }
        is BrowseDialog.DeleteLink -> ConfirmDeleteDialog(
            title = stringResource(R.string.link_delete_title),
            message = stringResource(R.string.link_delete_message, dialog.link.title.ifBlank { dialog.link.url }),
            onConfirm = { onAction(BrowseAction.DeleteLink(dialog.link.id)) },
            onDismiss = dismiss,
            isDeleting = state.isSaving,
            errorMessage = dialog.failure?.let { writeFailureText(it) },
        )
    }
}

@Composable
private fun rememberPickerDirectories(directories: List<DirectoryEntity>): List<PickerDirectory> =
    remember(directories) { directories.map { PickerDirectory(it.id, it.parentId, it.name) } }

/** Why a write failed, for a dialog that lets the user try again. */
@Composable
private fun writeFailureText(error: ApiError): String = stringResource(
    if (error == ApiError.Unreachable) R.string.browse_write_unreachable else R.string.browse_write_failed,
)

/** What a recursive delete takes with it, counted from the cache. */
@Composable
private fun deleteMessage(count: SubtreeCount): String {
    val directories = count.subdirectories.takeIf { it > 0 }?.let {
        pluralStringResource(R.plurals.directory_subdirectory_count, it, it)
    }
    val links = count.links.takeIf { it > 0 }?.let {
        pluralStringResource(R.plurals.directory_link_count, it, it)
    }
    val contents = if (directories != null && links != null) {
        stringResource(R.string.directory_delete_both, directories, links)
    } else {
        directories ?: links
    }
    return if (contents == null) {
        stringResource(R.string.directory_delete_message_empty)
    } else {
        stringResource(R.string.directory_delete_message, contents)
    }
}

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
            val renameLabel = stringResource(R.string.directory_action_rename)
            val moveLabel = stringResource(R.string.directory_action_move)
            val deleteLabel = stringResource(R.string.directory_action_delete)
            // The long press vibrates (combinedClickable's haptic feedback)
            // and opens the actions; screen readers get them as custom actions.
            DirectoryListItem(
                directory = directory,
                index = index,
                count = count,
                onClick = { onAction(BrowseAction.OpenDirectory(directory.id)) },
                onLongClick = { onAction(BrowseAction.ShowDirectoryActions(directory)) },
                onLongClickLabel = stringResource(R.string.directory_show_actions),
                modifier = Modifier
                    .animateItem()
                    .padding(bottom = if (index < count - 1) ListItemDefaults.SegmentedGap else 0.dp)
                    .semantics {
                        customActions = listOf(
                            CustomAccessibilityAction(renameLabel) {
                                onAction(BrowseAction.ShowRenameDirectory(directory))
                                true
                            },
                            CustomAccessibilityAction(moveLabel) {
                                onAction(BrowseAction.ShowMoveDirectory(directory))
                                true
                            },
                            CustomAccessibilityAction(deleteLabel) {
                                onAction(BrowseAction.ShowDeleteDirectory(directory))
                                true
                            },
                        )
                    },
            )
        }
    }
    if (state.links.isNotEmpty()) {
        item(key = "links-header", contentType = "header") {
            LinksHeader(state.linkLayout, onAction, Modifier.animateItem())
        }
        linkItems(state.links, state.linkLayout, onAction)
    }
}

/**
 * [links] in [layout]: cards, or condensed segmented rows. A tap opens the
 * link. With [withActions], a long press opens its actions sheet, also
 * offered as accessibility actions; without (search results), it edits the
 * link. [location] gives a link's directory path, shown after its title.
 */
internal fun LazyListScope.linkItems(
    links: List<LinkEntity>,
    layout: LinkLayout,
    onAction: (BrowseAction) -> Unit,
    location: Map<Long, String?> = emptyMap(),
    withActions: Boolean = true,
) {
    val count = links.size
    itemsIndexed(
        items = links,
        key = { _, link -> "link-${link.id}" },
        contentType = { _, _ -> "link-$layout" },
    ) { index, link ->
        val editLabel = stringResource(R.string.link_action_edit)
        val moveLabel = stringResource(R.string.link_action_move)
        val deleteLabel = stringResource(R.string.link_action_delete)
        val onClick = { onAction(BrowseAction.OpenLink(link)) }
        val onLongClick = {
            onAction(if (withActions) BrowseAction.ShowLinkActions(link) else BrowseAction.EditLink(link.id))
        }
        val onLongClickLabel = if (withActions) stringResource(R.string.link_show_actions) else editLabel
        val gap = when (layout) {
            LinkLayout.Cards -> 8.dp
            LinkLayout.Condensed -> ListItemDefaults.SegmentedGap
        }
        val itemModifier = Modifier
            .animateItem()
            .padding(bottom = if (index < count - 1) gap else 0.dp)
            .semantics {
                if (withActions) {
                    customActions = listOf(
                        CustomAccessibilityAction(editLabel) {
                            onAction(BrowseAction.EditLink(link.id))
                            true
                        },
                        CustomAccessibilityAction(moveLabel) {
                            onAction(BrowseAction.ShowMoveLink(link))
                            true
                        },
                        CustomAccessibilityAction(deleteLabel) {
                            onAction(BrowseAction.ShowDeleteLink(link))
                            true
                        },
                    )
                }
            }
        when (layout) {
            LinkLayout.Cards -> LinkCard(
                link = link,
                onClick = onClick,
                location = location[link.id],
                onLongClick = onLongClick,
                onLongClickLabel = onLongClickLabel,
                modifier = itemModifier,
            )
            LinkLayout.Condensed -> LinkListItem(
                link = link,
                index = index,
                count = count,
                onClick = onClick,
                location = location[link.id],
                onLongClick = onLongClick,
                onLongClickLabel = onLongClickLabel,
                modifier = itemModifier,
            )
        }
    }
}

/** The "Links" heading, with the layout toggle at its end. */
@Composable
internal fun LinksHeader(
    layout: LinkLayout,
    onAction: (BrowseAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    SectionHeader(R.string.browse_section_links, modifier) {
        LinkLayoutToggle(layout = layout, onLayoutChange = { onAction(BrowseAction.SetLinkLayout(it)) })
    }
}

/** A list section's heading, with optional [trailing] controls at its end. */
@Composable
internal fun SectionHeader(
    @StringRes text: Int,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = SECTION_HEADER_MIN_HEIGHT)
            .padding(start = 4.dp, top = 8.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = stringResource(text),
            modifier = Modifier
                .weight(1f)
                .semantics { heading() },
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
        )
        trailing?.invoke()
    }
}

/** Room for the layout toggle, so headers with and without it line up. */
private val SECTION_HEADER_MIN_HEIGHT = 48.dp

@Composable
private fun BrowseTopBar(
    state: BrowseUiState,
    onAction: (BrowseAction) -> Unit,
    scrollBehavior: TopAppBarScrollBehavior,
    onSearch: () -> Unit,
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
            if (state.hasCache) {
                IconButton(onClick = onSearch) {
                    Icon(
                        painter = painterResource(R.drawable.ic_search),
                        contentDescription = stringResource(R.string.browse_search),
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
                    onAction(if (needsSettings) BrowseAction.OpenServerSettings else BrowseAction.Refresh)
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

