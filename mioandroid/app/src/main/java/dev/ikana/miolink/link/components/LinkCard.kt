package dev.ikana.miolink.link.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.ui.ThumbnailImage
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.ui.theme.MioLinkTheme
import java.net.URI
import java.net.URISyntaxException

/**
 * A link in a list: thumbnail, title (two lines at most), host and view
 * count. [onLongClick], when set, opens the link's actions.
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun LinkCard(
    link: LinkEntity,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    onLongClick: (() -> Unit)? = null,
    onLongClickLabel: String? = null,
) {
    val shape = MaterialTheme.shapes.large
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .combinedClickable(
                onClickLabel = stringResource(R.string.link_open),
                role = Role.Button,
                onLongClickLabel = onLongClickLabel,
                onLongClick = onLongClick,
                onClick = onClick,
            ),
        shape = shape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        ),
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            ThumbnailImage(
                url = link.thumbnailUrl,
                modifier = Modifier.size(72.dp),
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = link.title.ifBlank { link.url },
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = listOf(
                        hostOf(link.url),
                        pluralStringResource(R.plurals.link_views, link.views.toCount(), link.views),
                    ).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

/** The URL's host without a leading `www.`, or the URL itself if it has none. */
fun hostOf(url: String): String {
    val host = try {
        URI(url).host
    } catch (_: URISyntaxException) {
        null
    }
    return host?.removePrefix("www.")?.takeIf { it.isNotEmpty() } ?: url
}

private fun Long.toCount(): Int = coerceAtMost(Int.MAX_VALUE.toLong()).toInt()

@Preview
@Composable
private fun LinkCardPreview() {
    MioLinkTheme(dynamicColor = false) {
        LinkCard(
            link = LinkEntity(
                id = 1,
                directoryId = 1,
                title = "Material 3 Expressive: building delightful, emotional interfaces",
                url = "https://www.example.com/articles/m3-expressive",
                thumbnailUrl = null,
                views = 3,
                createdAt = 0,
            ),
            onClick = {},
            modifier = Modifier.padding(16.dp),
        )
    }
}
