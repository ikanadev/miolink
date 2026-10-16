package dev.ikana.miolink.core.settings

import android.content.Context
import android.util.Base64
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.RegistryConfiguration
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import java.io.IOException
import java.security.GeneralSecurityException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

/**
 * Stores [ServerSettings] in a Preferences [DataStore]. The base URL is
 * stored as-is; the API key is encrypted with [aead] and only its ciphertext
 * (Base64) is written.
 *
 * [aead] is lazy because building it touches Android Keystore, which is slow
 * and blocking; it's first used on [ioDispatcher].
 */
class ServerSettingsStore(
    private val dataStore: DataStore<Preferences>,
    aead: Lazy<Aead>,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    private val aead by aead

    /** The saved settings, or null until both values have been saved. */
    val settings: Flow<ServerSettings?> = dataStore.data
        .catch { e ->
            if (e is IOException) {
                Log.w(TAG, "Couldn't read settings", e)
                emit(emptyPreferences())
            } else {
                throw e
            }
        }
        .map { prefs -> prefs.toSettings() }
        .flowOn(ioDispatcher)
        .distinctUntilChanged()

    /** Saves [settings]. [ServerSettings.baseUrl] must already be normalized. */
    suspend fun save(settings: ServerSettings) {
        val ciphertext = withContext(ioDispatcher) {
            aead.encrypt(settings.apiKey.toByteArray(Charsets.UTF_8), ASSOCIATED_DATA)
        }
        dataStore.edit { prefs ->
            prefs[KEY_BASE_URL] = settings.baseUrl
            prefs[KEY_API_KEY] = Base64.encodeToString(ciphertext, Base64.NO_WRAP)
        }
    }

    private fun Preferences.toSettings(): ServerSettings? {
        val baseUrl = this[KEY_BASE_URL] ?: return null
        val encrypted = this[KEY_API_KEY] ?: return null
        val apiKey = try {
            aead.decrypt(Base64.decode(encrypted, Base64.NO_WRAP), ASSOCIATED_DATA)
                .toString(Charsets.UTF_8)
        } catch (e: GeneralSecurityException) {
            // The Keystore key is gone (app data restored on another device,
            // Keystore reset). The user has to enter the key again.
            Log.w(TAG, "Couldn't decrypt the stored API key", e)
            return null
        } catch (e: IllegalArgumentException) {
            Log.w(TAG, "Stored API key isn't valid Base64", e)
            return null
        }
        return ServerSettings(baseUrl = baseUrl, apiKey = apiKey)
    }

    companion object {
        private const val TAG = "ServerSettingsStore"

        /** DataStore file name, also excluded from backups in `res/xml`. */
        const val DATASTORE_NAME = "server_settings"

        /** SharedPreferences file holding the Tink keyset, excluded from backups. */
        const val KEYSET_PREFS_NAME = "miolink_api_key_keyset"
        private const val KEYSET_NAME = "api_key_keyset"
        private const val MASTER_KEY_URI = "android-keystore://miolink_api_key_master_key"

        private val KEY_BASE_URL = stringPreferencesKey("base_url")
        private val KEY_API_KEY = stringPreferencesKey("api_key_ciphertext")
        private val ASSOCIATED_DATA = "miolink.api_key".toByteArray(Charsets.UTF_8)

        /**
         * An AES-256-GCM [Aead] whose keyset lives in SharedPreferences,
         * itself encrypted by a master key in Android Keystore. Blocking: touches
         * Android Keystore.
         */
        fun createApiKeyAead(context: Context): Aead {
            AeadConfig.register()
            return AndroidKeysetManager.Builder()
                .withSharedPref(context, KEYSET_NAME, KEYSET_PREFS_NAME)
                .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
                .withMasterKeyUri(MASTER_KEY_URI)
                .build()
                .keysetHandle
                .getPrimitive(RegistryConfiguration.get(), Aead::class.java)
        }
    }
}
