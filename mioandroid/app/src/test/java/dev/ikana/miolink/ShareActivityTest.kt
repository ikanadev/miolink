package dev.ikana.miolink

import android.content.Intent
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.lifecycle.Lifecycle
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import dev.ikana.miolink.core.settings.ServerSettings
import java.net.ServerSocket
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowToast

/**
 * The real app wiring, except that the API key is encrypted with an
 * in-memory Tink AEAD: Android Keystore isn't available under Robolectric.
 */
class TestMioLinkApplication : MioLinkApplication() {
    override fun createContainer(): AppContainer = AppContainer(this, apiKeyAead = lazyOf(aead))

    private companion object {
        val aead: Aead by lazy {
            AeadConfig.register()
            KeysetHandle.generateNew(KeyTemplates.get("AES256_GCM"))
                .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
        }
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(application = TestMioLinkApplication::class)
class ShareActivityTest {
    @get:Rule
    val compose = createEmptyComposeRule()

    private val app: TestMioLinkApplication = ApplicationProvider.getApplicationContext()

    private fun shareIntent(text: String?) = Intent(app, ShareActivity::class.java)
        .setAction(Intent.ACTION_SEND)
        .setType("text/plain")
        .apply { if (text != null) putExtra(Intent.EXTRA_TEXT, text) }

    /** Saves settings for a local port nothing listens on: syncs fail fast, offline. */
    private fun configure() {
        val port = ServerSocket(0).use { it.localPort }
        runBlocking { app.container.serverSettingsStore.save(ServerSettings("http://127.0.0.1:$port", "test-key")) }
    }

    @Test
    fun shareWithAUrlShowsTheSheetInTheRoot() {
        configure()
        ActivityScenario.launch<ShareActivity>(shareIntent("A great read https://example.com/post?id=1")).use {
            compose.onNodeWithText("https://example.com/post?id=1").assertExists()
            compose.onNodeWithText(app.getString(R.string.link_add_save_in)).assertExists()
            compose.onNodeWithText(app.getString(R.string.app_name)).assertExists()
        }
    }

    @Test
    fun unconfiguredShareOpensSettingsFirst() {
        ActivityScenario.launch<ShareActivity>(shareIntent("https://example.com")).use {
            compose.onNodeWithText(app.getString(R.string.settings_welcome_title)).assertExists()
            compose.onNodeWithText("https://example.com").assertDoesNotExist()
        }
    }

    @Test
    fun shareWithoutAUrlFinishesWithAToast() {
        val activity = Robolectric.buildActivity(ShareActivity::class.java, shareIntent("just some text")).create().get()

        assertTrue(activity.isFinishing)
        assertEquals(app.getString(R.string.share_no_url), ShadowToast.getTextOfLatestToast())
    }

    @Test
    fun cancellingTheSheetFinishes() {
        configure()
        ActivityScenario.launch<ShareActivity>(shareIntent("https://example.com")).use { scenario ->
            compose.onNodeWithText(app.getString(R.string.cancel)).performClick()
            compose.waitForIdle()
            var finishing = false
            if (scenario.state != Lifecycle.State.DESTROYED) scenario.onActivity { finishing = it.isFinishing }
            assertTrue(finishing || scenario.state == Lifecycle.State.DESTROYED)
        }
    }
}
