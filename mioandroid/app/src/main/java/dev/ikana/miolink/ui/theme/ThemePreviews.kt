package dev.ikana.miolink.ui.theme

import android.content.res.Configuration
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ContainedLoadingIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.Wallpapers
import androidx.compose.ui.unit.dp

// Previews that show the theme's colors, shapes and Expressive components in
// light, dark and dynamic color. Not used by the app.

@Composable
private fun ThemeSample() {
    Surface(color = MaterialTheme.colorScheme.surface) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text("Mio Link", style = MaterialTheme.typography.headlineMedium)
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                LoadingIndicator()
                ContainedLoadingIndicator()
            }
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Button(onClick = {}) { Text("Save") }
                FilledTonalButton(onClick = {}) { Text("Test") }
                OutlinedButton(onClick = {}) { Text("Move") }
                TextButton(onClick = {}) { Text("Cancel") }
            }
            Card {
                Text(
                    "A card on surfaceContainerHighest, medium shape.",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            val colors = MaterialTheme.colorScheme
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(
                    colors.primary,
                    colors.primaryContainer,
                    colors.secondary,
                    colors.secondaryContainer,
                    colors.tertiary,
                    colors.tertiaryContainer,
                    colors.error,
                ).forEach { Swatch(it) }
            }
        }
    }
}

@Composable
private fun Swatch(color: Color) {
    Box(
        Modifier
            .size(32.dp)
            .background(color, MaterialTheme.shapes.small),
    )
}

@Preview(name = "Light")
@Composable
private fun ThemeLightPreview() {
    MioLinkTheme(darkTheme = false, dynamicColor = false) { ThemeSample() }
}

@Preview(name = "Dark", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
private fun ThemeDarkPreview() {
    MioLinkTheme(darkTheme = true, dynamicColor = false) { ThemeSample() }
}

@Preview(name = "Dynamic light", apiLevel = 35, wallpaper = Wallpapers.GREEN_DOMINATED_EXAMPLE)
@Composable
private fun ThemeDynamicLightPreview() {
    MioLinkTheme(darkTheme = false, dynamicColor = true) { ThemeSample() }
}

@Preview(
    name = "Dynamic dark",
    apiLevel = 35,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    wallpaper = Wallpapers.RED_DOMINATED_EXAMPLE,
)
@Composable
private fun ThemeDynamicDarkPreview() {
    MioLinkTheme(darkTheme = true, dynamicColor = true) { ThemeSample() }
}
