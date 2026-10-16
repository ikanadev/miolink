package dev.ikana.miolink

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.ikana.miolink.link.findSharedUrl
import dev.ikana.miolink.ui.theme.MioLinkTheme
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map

/**
 * The share target (`ACTION_SEND`, `text/plain`). It's a translucent
 * activity separate from [MainActivity]: it opens in the sharing app's task,
 * so the sheet appears over that app, back returns to it, and a Mio Link
 * window already open elsewhere keeps its place. See [ShareApp] for the flow.
 *
 * Shares without an http(s) URL end here with a toast.
 */
class ShareActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        val url = sharedUrl(intent)
        if (url == null) {
            Toast.makeText(this, R.string.share_no_url, Toast.LENGTH_LONG).show()
            finish()
            return
        }
        val isConfigured = (application as MioLinkApplication).container.serverSettings
            .map { it != null }
            .distinctUntilChanged()
        setContent {
            MioLinkTheme {
                // Null while the settings load (a few ms); the window is
                // transparent until the first screen is known.
                val configured by isConfigured.collectAsStateWithLifecycle(initialValue = null)
                configured?.let { ShareApp(url = url, isConfigured = it, onFinish = ::finishShare) }
            }
        }
    }

    /** Leaves the share flow, back to the app that shared, with an optional toast. */
    private fun finishShare(message: String?) {
        if (message != null) Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        finish()
    }

    private companion object {
        /** The URL in a `text/plain` share, or null for anything else. */
        fun sharedUrl(intent: Intent?): String? {
            if (intent?.action != Intent.ACTION_SEND) return null
            return findSharedUrl(intent.getCharSequenceExtra(Intent.EXTRA_TEXT))
        }
    }
}
