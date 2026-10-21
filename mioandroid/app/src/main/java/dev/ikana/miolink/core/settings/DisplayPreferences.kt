package dev.ikana.miolink.core.settings

import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import java.io.IOException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map

/** How lists of links look. */
enum class LinkLayout {
    /** A card per link, with a large thumbnail and a two-line title. */
    Cards,

    /** A dense list row per link: small thumbnail, one-line title. */
    Condensed,
}

/** How the app shows things; the same on every screen. */
interface DisplayPreferences {
    val linkLayout: Flow<LinkLayout>

    suspend fun setLinkLayout(layout: LinkLayout)
}

/**
 * Stores [DisplayPreferences] in its own Preferences [DataStore], apart from
 * the server settings: nothing here is secret, so it can be backed up.
 */
class DisplayPreferencesStore(private val dataStore: DataStore<Preferences>) : DisplayPreferences {
    override val linkLayout: Flow<LinkLayout> = dataStore.data
        .catch { e ->
            if (e is IOException) {
                Log.w(TAG, "Couldn't read display preferences", e)
                emit(emptyPreferences())
            } else {
                throw e
            }
        }
        .map { prefs ->
            prefs[KEY_LINK_LAYOUT]?.let { name -> LinkLayout.entries.firstOrNull { it.name == name } }
                ?: LinkLayout.Cards
        }
        .distinctUntilChanged()

    override suspend fun setLinkLayout(layout: LinkLayout) {
        try {
            dataStore.edit { it[KEY_LINK_LAYOUT] = layout.name }
        } catch (e: IOException) {
            // Only a preference; not worth interrupting the user.
            Log.w(TAG, "Couldn't save the link layout", e)
        }
    }

    companion object {
        private const val TAG = "DisplayPreferences"

        /** DataStore file name. */
        const val DATASTORE_NAME = "display_preferences"

        private val KEY_LINK_LAYOUT = stringPreferencesKey("link_layout")
    }
}
