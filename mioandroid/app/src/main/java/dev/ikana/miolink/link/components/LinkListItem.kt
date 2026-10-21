package dev.ikana.miolink.link.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.SegmentedListItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.core.ui.ThumbnailImage
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * A link in the condensed layout, at [index] of [count]: a segmented list
 * item with a small thumbnail, a one-line title and the host and view count,
 * so many links fit on screen. [location], when set, names the link's
 * directory (search results). [onLongClick], when set, opens its actions.
 */
@Composable
fun LinkListItem(
    link: LinkEntity,
    index: Int,
    count: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    location: String? = null,
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
            ThumbnailImage(
                url = link.thumbnailUrl,
                modifier = Modifier.size(40.dp),
                iconSize = 20.dp,
            )
        },
        supportingContent = {
            Text(
                text = linkDetails(link, location),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        },
    ) {
        Text(
            text = link.title.ifBlank { link.url },
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Preview
@Composable
private fun LinkListItemPreview() {
    MioLinkTheme(dynamicColor = false) {
        Column(Modifier.padding(16.dp)) {
            listOf(
                "Material 3 Expressive: building delightful, emotional interfaces",
                "Connect RPC",
                "",
            ).forEachIndexed { index, title ->
                if (index > 0) Spacer(Modifier.height(ListItemDefaults.SegmentedGap))
                LinkListItem(
                    link = LinkEntity(
                        id = index.toLong(),
                        directoryId = 1,
                        title = title,
                        url = "https://www.example.com/articles/$index",
                        thumbnailUrl = null,
                        views = index.toLong(),
                        createdAt = 0,
                    ),
                    index = index,
                    count = 3,
                    onClick = {},
                    location = "Reading".takeIf { index == 1 },
                )
            }
        }
    }
}
