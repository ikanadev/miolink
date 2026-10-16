package dev.ikana.miolink.core.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.ui.theme.MioLinkTheme
import kotlinx.coroutines.launch

/**
 * A directory as the picker sees it. `core` can't import the `tree` domain,
 * so callers map their cached directories to this.
 */
data class PickerDirectory(
    val id: Long,
    /** Null only for the root. */
    val parentId: Long?,
    /** Empty for the root. */
    val name: String,
)

/** One visible line of the picker's tree. */
data class DirectoryTreeRow(
    val directory: PickerDirectory,
    /** 0 for the root. */
    val depth: Int,
    val hasChildren: Boolean,
    val isExpanded: Boolean,
    /** Inside the disabled subtree: shown, but can't be picked. */
    val isDisabled: Boolean,
)

/** [rootId] and all its descendants in [directories]. Empty if it isn't there. */
fun subtreeIds(directories: List<PickerDirectory>, rootId: Long): Set<Long> {
    if (directories.none { it.id == rootId }) return emptySet()
    val children = directories.groupBy { it.parentId }
    val result = linkedSetOf(rootId)
    val queue = ArrayDeque(listOf(rootId))
    while (queue.isNotEmpty()) {
        children[queue.removeFirst()]?.forEach { if (result.add(it.id)) queue.addLast(it.id) }
    }
    return result
}

/** The ids from the root down to [id], both included. Empty if [id] isn't there. */
fun pathTo(directories: List<PickerDirectory>, id: Long): List<Long> {
    val byId = directories.associateBy { it.id }
    val path = ArrayList<Long>()
    var current = byId[id]
    while (current != null && current.id !in path) {
        path += current.id
        current = current.parentId?.let(byId::get)
    }
    return path.asReversed()
}

/**
 * The rows the picker shows: the tree depth first from the root, children by
 * name, descending only into [expanded] directories. Rows in the subtree of
 * [disabledSubtreeId] (it included) are disabled: a directory can't be moved
 * into itself or its descendants.
 */
fun directoryTreeRows(
    directories: List<PickerDirectory>,
    expanded: Set<Long>,
    disabledSubtreeId: Long? = null,
): List<DirectoryTreeRow> {
    val children = directories.groupBy { it.parentId }.mapValues { (_, list) -> list.sortedBy { it.name } }
    val disabled = disabledSubtreeId?.let { subtreeIds(directories, it) }.orEmpty()
    val rows = ArrayList<DirectoryTreeRow>()
    val visited = HashSet<Long>()
    // Depth first, iteratively: trees can be arbitrarily deep.
    val stack = ArrayDeque<Pair<PickerDirectory, Int>>()
    children[null].orEmpty().asReversed().forEach { stack.addLast(it to 0) }
    while (stack.isNotEmpty()) {
        val (directory, depth) = stack.removeLast()
        if (!visited.add(directory.id)) continue
        val kids = children[directory.id].orEmpty()
        val isExpanded = directory.id in expanded && kids.isNotEmpty()
        rows += DirectoryTreeRow(
            directory = directory,
            depth = depth,
            hasChildren = kids.isNotEmpty(),
            isExpanded = isExpanded,
            isDisabled = directory.id in disabled,
        )
        if (isExpanded) kids.asReversed().forEach { stack.addLast(it to depth + 1) }
    }
    return rows
}

private val ExpandedSaver = Saver<MutableState<Set<Long>>, LongArray>(
    save = { it.value.toLongArray() },
    restore = { mutableStateOf(it.toSet()) },
)

/**
 * A full-height modal bottom sheet for choosing a directory: the whole tree,
 * indented and expandable, with [currentDirectoryId] (where the item is now)
 * marked and expanded to. Used to move directories and links.
 *
 * The confirm button ([confirmLabel], such as "Move here") calls [onConfirm]
 * with the picked directory; it's disabled until one other than the current
 * location is picked, and while [isSaving], when it shows a loading
 * indicator and the sheet can't be dismissed. The caller removes the picker
 * when the write succeeds; on failure it passes [errorMessage] and the user
 * can try again.
 *
 * [disabledSubtreeId] greys out that directory and its descendants (moving a
 * directory can't create a cycle), with [disabledReason] under it.
 * [directories] is every cached directory, the root included; the root,
 * whose name is empty, is shown as [rootName].
 */
// ModalBottomSheet and SheetState are still experimental.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DirectoryPicker(
    directories: List<PickerDirectory>,
    title: String,
    confirmLabel: String,
    onConfirm: (directoryId: Long) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    currentDirectoryId: Long? = null,
    disabledSubtreeId: Long? = null,
    disabledReason: String? = null,
    isSaving: Boolean = false,
    errorMessage: String? = null,
    rootName: String = stringResource(R.string.app_name),
) {
    val saving by rememberUpdatedState(isSaving)
    val sheetState = rememberModalBottomSheetState(
        skipPartiallyExpanded = true,
        confirmValueChange = { it != SheetValue.Hidden || !saving },
    )
    val scope = rememberCoroutineScope()
    val hideThenDismiss: () -> Unit = {
        scope.launch { sheetState.hide() }.invokeOnCompletion { onDismiss() }
    }

    var expanded by rememberSaveable(saver = ExpandedSaver) {
        val roots = directories.filter { it.parentId == null }.map { it.id }
        mutableStateOf(roots.toSet() + currentDirectoryId?.let { pathTo(directories, it) }.orEmpty())
    }
    var selectedId by rememberSaveable { mutableStateOf<Long?>(null) }
    val rows = remember(directories, expanded, disabledSubtreeId) {
        directoryTreeRows(directories, expanded, disabledSubtreeId)
    }
    val selectable = selectedId?.let { id -> rows.any { it.directory.id == id && !it.isDisabled } } == true
    val canConfirm = selectable && selectedId != currentDirectoryId && !isSaving

    val listState = rememberLazyListState()
    LaunchedEffect(Unit) {
        val index = rows.indexOfFirst { it.directory.id == currentDirectoryId }
        if (index > 0) listState.scrollToItem((index - 2).coerceAtLeast(0))
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        modifier = modifier,
        sheetState = sheetState,
        sheetGesturesEnabled = !isSaving,
    ) {
        Column(Modifier.fillMaxHeight()) {
            Text(
                text = title,
                modifier = Modifier
                    .padding(horizontal = 24.dp)
                    .semantics { heading() },
                style = MaterialTheme.typography.headlineSmall,
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    modifier = Modifier.padding(start = 24.dp, end = 24.dp, top = 4.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.size(12.dp))
            HorizontalDivider()
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .selectableGroup(),
                state = listState,
                contentPadding = PaddingValues(vertical = 8.dp),
            ) {
                items(rows, key = { it.directory.id }) { row ->
                    val id = row.directory.id
                    PickerRow(
                        row = row,
                        name = row.directory.name.ifEmpty { rootName },
                        isSelected = id == selectedId,
                        isCurrent = id == currentDirectoryId,
                        disabledReason = disabledReason.takeIf { id == disabledSubtreeId },
                        enabled = !isSaving,
                        onSelect = { selectedId = id },
                        onToggle = { expanded = if (id in expanded) expanded - id else expanded + id },
                        modifier = Modifier.animateItem(),
                    )
                }
            }
            HorizontalDivider()
            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    modifier = Modifier
                        .padding(start = 24.dp, end = 24.dp, top = 12.dp)
                        .semantics { liveRegion = LiveRegionMode.Polite },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error,
                )
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
            ) {
                TextButton(onClick = hideThenDismiss, enabled = !isSaving) {
                    Text(stringResource(R.string.cancel))
                }
                Button(onClick = { selectedId?.let(onConfirm) }, enabled = canConfirm) {
                    ProgressButtonContent(confirmLabel, inProgress = isSaving)
                }
            }
        }
    }
}

@Composable
private fun PickerRow(
    row: DirectoryTreeRow,
    name: String,
    isSelected: Boolean,
    isCurrent: Boolean,
    disabledReason: String?,
    enabled: Boolean,
    onSelect: () -> Unit,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = MaterialTheme.colorScheme
    val rotation by animateFloatAsState(
        targetValue = if (row.isExpanded) 90f else 0f,
        animationSpec = MaterialTheme.motionScheme.fastSpatialSpec(),
        label = "expand chevron",
    )
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 2.dp)
            .clip(MaterialTheme.shapes.large)
            .background(if (isSelected) colors.secondaryContainer else Color.Transparent)
            .selectable(
                selected = isSelected,
                enabled = enabled && !row.isDisabled,
                role = Role.RadioButton,
                onClick = onSelect,
            )
            .heightIn(min = 56.dp)
            .padding(start = (row.depth * INDENT_DP).dp, end = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (row.hasChildren) {
            IconButton(onClick = onToggle) {
                Icon(
                    painter = painterResource(R.drawable.ic_chevron_right),
                    contentDescription = stringResource(
                        if (row.isExpanded) R.string.directory_picker_collapse else R.string.directory_picker_expand,
                        name,
                    ),
                    modifier = Modifier.rotate(rotation),
                )
            }
        } else {
            Spacer(Modifier.width(48.dp))
        }
        val contentAlpha = if (row.isDisabled) DISABLED_ALPHA else 1f
        Icon(
            painter = painterResource(R.drawable.ic_folder),
            contentDescription = null,
            modifier = Modifier.alpha(contentAlpha),
            tint = if (isCurrent) colors.primary else colors.onSurfaceVariant,
        )
        Spacer(Modifier.width(16.dp))
        Column(
            modifier = Modifier
                .weight(1f)
                .alpha(contentAlpha)
                .padding(vertical = 8.dp),
        ) {
            Text(
                text = name,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = if (isCurrent) FontWeight.Medium else null,
                color = if (isSelected) colors.onSecondaryContainer else colors.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            when {
                isCurrent -> Text(
                    text = stringResource(R.string.directory_picker_current_location),
                    style = MaterialTheme.typography.labelMedium,
                    color = colors.primary,
                )
                disabledReason != null -> Text(
                    text = disabledReason,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.onSurfaceVariant,
                )
            }
        }
        if (isSelected) {
            Icon(
                painter = painterResource(R.drawable.ic_check),
                contentDescription = null,
                tint = colors.onSecondaryContainer,
            )
        }
    }
}

private const val INDENT_DP = 20
private const val DISABLED_ALPHA = 0.38f

@Preview
@Composable
private fun DirectoryPickerPreview() {
    val directories = listOf(
        PickerDirectory(1, null, ""),
        PickerDirectory(2, 1, "Work"),
        PickerDirectory(3, 2, "Projects"),
        PickerDirectory(4, 3, "Archive"),
        PickerDirectory(5, 1, "Reading"),
    )
    MioLinkTheme(dynamicColor = false) {
        DirectoryPicker(
            directories = directories,
            title = "Move “Projects”",
            confirmLabel = "Move here",
            onConfirm = {},
            onDismiss = {},
            subtitle = "Choose the directory to move it into.",
            currentDirectoryId = 2,
            disabledSubtreeId = 3,
            disabledReason = "Can't move a directory into itself or a directory inside it",
        )
    }
}
