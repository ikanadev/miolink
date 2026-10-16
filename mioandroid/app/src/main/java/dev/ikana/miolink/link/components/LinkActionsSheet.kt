package dev.ikana.miolink.link.components

import androidx.annotation.DrawableRes
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.ThumbnailImage
import dev.ikana.miolink.tree.LinkEntity
import kotlinx.coroutines.launch

/**
 * What can be done with [link], opened by a long press on it: edit, move
 * and delete. Picking one hides the sheet, then calls its callback.
 */
// ModalBottomSheet and SheetState are still experimental.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LinkActionsSheet(
    link: LinkEntity,
    onEdit: () -> Unit,
    onMove: () -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    // Once an action is picked, hiding the sheet must not also dismiss what
    // the action opens.
    var acting by remember { mutableStateOf(false) }
    val hideThen: (() -> Unit) -> Unit = { action ->
        if (!acting) {
            acting = true
            scope.launch { sheetState.hide() }.invokeOnCompletion { action() }
        }
    }
    ModalBottomSheet(onDismissRequest = { if (!acting) onDismiss() }, sheetState = sheetState) {
        Column(Modifier.padding(bottom = 16.dp)) {
            ListItem(
                headlineContent = {
                    Text(
                        text = link.title.ifBlank { link.url },
                        modifier = Modifier.semantics { heading() },
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                },
                supportingContent = { Text(hostOf(link.url), maxLines = 1, overflow = TextOverflow.Ellipsis) },
                leadingContent = { ThumbnailImage(url = link.thumbnailUrl, modifier = Modifier.size(48.dp)) },
                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
            )
            HorizontalDivider(Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
            ActionItem(R.drawable.ic_edit, stringResource(R.string.link_action_edit)) { hideThen(onEdit) }
            ActionItem(R.drawable.ic_drive_file_move, stringResource(R.string.link_action_move)) { hideThen(onMove) }
            ActionItem(
                icon = R.drawable.ic_delete,
                label = stringResource(R.string.link_action_delete),
                color = MaterialTheme.colorScheme.error,
            ) { hideThen(onDelete) }
        }
    }
}

@Composable
private fun ActionItem(
    @DrawableRes icon: Int,
    label: String,
    color: Color = Color.Unspecified,
    onClick: () -> Unit,
) {
    val contentColor = if (color == Color.Unspecified) MaterialTheme.colorScheme.onSurface else color
    ListItem(
        headlineContent = { Text(label) },
        modifier = Modifier.clickable(role = Role.Button, onClick = onClick),
        leadingContent = { Icon(painterResource(icon), contentDescription = null) },
        colors = ListItemDefaults.colors(
            containerColor = Color.Transparent,
            headlineColor = contentColor,
            leadingIconColor = if (color == Color.Unspecified) MaterialTheme.colorScheme.onSurfaceVariant else color,
        ),
    )
}
