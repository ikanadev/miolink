package dev.ikana.miolink

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.ikana.miolink.ui.theme.MioLinkTheme
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        val isConfigured = (application as MioLinkApplication).container.serverSettings
            .map { it != null }
            .distinctUntilChanged()
        setContent {
            MioLinkTheme {
                // Null while the settings load (a few ms); the window
                // background shows until the start screen is known.
                val configured by isConfigured.collectAsStateWithLifecycle(initialValue = null)
                configured?.let { MioLinkApp(isConfigured = it) }
            }
        }
    }
}
