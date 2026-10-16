package dev.ikana.miolink.core.ui

import android.content.ActivityNotFoundException
import android.content.Context
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.net.toUri

/**
 * Opens [url] in a Custom Tab with [toolbarColor] (an ARGB color, usually
 * the theme's `surfaceContainer`). False when no browser can open it.
 */
fun openInCustomTab(context: Context, url: String, toolbarColor: Int): Boolean = try {
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
