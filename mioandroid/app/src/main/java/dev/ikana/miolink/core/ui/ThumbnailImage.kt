package dev.ikana.miolink.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import dev.ikana.miolink.R
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * A link's thumbnail, cropped to fill [modifier]'s size. [url] is absolute
 * (`LinkEntity.thumbnailUrl`) or null when the link has none.
 *
 * A link icon on a tonal background shows while the image loads, when it
 * fails and when there is no thumbnail; the image crossfades in over it
 * (the app's Coil `ImageLoader` enables crossfade). Decorative: the link's
 * title says what it is.
 */
@Composable
fun ThumbnailImage(
    url: String?,
    modifier: Modifier = Modifier,
    shape: Shape = MaterialTheme.shapes.medium,
) {
    Box(
        modifier = modifier
            .clip(shape)
            .background(MaterialTheme.colorScheme.secondaryContainer),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_link),
            contentDescription = null,
            modifier = Modifier.size(28.dp),
            tint = MaterialTheme.colorScheme.onSecondaryContainer,
        )
        if (url != null) {
            AsyncImage(
                model = url,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }
    }
}

@Preview
@Composable
private fun ThumbnailImagePlaceholderPreview() {
    MioLinkTheme(dynamicColor = false) {
        ThumbnailImage(url = null, modifier = Modifier.size(72.dp))
    }
}
