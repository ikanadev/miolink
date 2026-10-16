package dev.ikana.miolink.core.settings

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.KeysetHandle
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * Android Keystore isn't available under Robolectric, so the AEAD here is a
 * Tink keyset held in memory; the storage logic under test is the same.
 */
@RunWith(RobolectricTestRunner::class)
class ServerSettingsStoreTest {
    @get:Rule
    val folder = TemporaryFolder()

    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var dataStore: DataStore<Preferences>

    @Before
    fun setUp() {
        AeadConfig.register()
        dataStore = PreferenceDataStoreFactory.create(scope = scope) {
            folder.newFile("settings.preferences_pb").also { it.delete() }
        }
    }

    @After
    fun tearDown() {
        scope.cancel()
    }

    private fun newAead(): Aead = KeysetHandle.generateNew(KeyTemplates.get("AES256_GCM"))
        .getPrimitive(RegistryConfiguration.get(), Aead::class.java)

    @Test
    fun nullUntilSaved() = runTest {
        val store = ServerSettingsStore(dataStore, lazyOf(newAead()))
        assertNull(store.settings.first())
    }

    @Test
    fun savedSettingsReadBack() = runTest {
        val store = ServerSettingsStore(dataStore, lazyOf(newAead()))
        val settings = ServerSettings("https://links.example.com", "s3cret-api-key")

        store.save(settings)

        assertEquals(settings, store.settings.first())
    }

    @Test
    fun storedKeyIsNotPlaintext() = runTest {
        val store = ServerSettingsStore(dataStore, lazyOf(newAead()))
        store.save(ServerSettings("https://links.example.com", "s3cret-api-key"))

        val stored = dataStore.data.first().asMap().values.map { it.toString() }

        assertEquals(listOf("https://links.example.com"), stored.filter { it.startsWith("https://") })
        assertFalse(stored.any { it.contains("s3cret-api-key") })
    }

    @Test
    fun undecryptableKeyReadsAsNotConfigured() = runTest {
        ServerSettingsStore(dataStore, lazyOf(newAead()))
            .save(ServerSettings("https://links.example.com", "s3cret-api-key"))

        // Another key, as after a restore to a device without the Keystore key.
        val otherStore = ServerSettingsStore(dataStore, lazyOf(newAead()))

        assertNull(otherStore.settings.first())
    }

    @Test
    fun toStringHidesTheKey() {
        val text = ServerSettings("https://links.example.com", "s3cret-api-key").toString()
        assertFalse(text.contains("s3cret-api-key"))
    }
}
