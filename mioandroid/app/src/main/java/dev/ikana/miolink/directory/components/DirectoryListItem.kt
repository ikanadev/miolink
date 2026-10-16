package dev.ikana.miolink.directory.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * A subdirectory in a list of [count] directories, at [index]: an Expressive
 * segmented list item, so consecutive directories read as one group.
 * [onLongClick], when set, opens the directory's actions.
 */
@Composable
fun DirectoryListItem(
    directory: DirectoryEntity,
    index: Int,
    count: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    onLongClick: (() -> Unit)? = null,
    onLongClickLabel: String? = null,
) {
    SegmentedListItem(
        onClick = onClick,
        shapes = ListItemDefaults.segmentedShapes(index = index, count = count),
        modifier = modifier,
        onLongClick = onLongClick,
        onLongClickLabel = onLongClickLabel,
        leadingContent = {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = MaterialTheme.shapes.medium,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    painter = painterResource(R.drawable.ic_folder),
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
        },
        trailingContent = {
            Icon(
                painter = painterResource(R.drawable.ic_chevron_right),
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
    ) {
        Text(
            text = directory.name,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Preview
@Composable
private fun DirectoryListItemPreview() {
    MioLinkTheme(dynamicColor = false) {
        Column(Modifier.padding(16.dp)) {
            listOf("Reading list", "Work", "Recipes").forEachIndexed { index, name ->
                if (index > 0) Spacer(Modifier.height(ListItemDefaults.SegmentedGap))
                DirectoryListItem(
                    directory = DirectoryEntity(index.toLong() + 2, 1, name, 0),
                    index = index,
                    count = 3,
                    onClick = {},
                )
            }
        }
    }
}
