package dev.ikana.miolink

import android.content.Context
import com.google.crypto.tink.Aead
import coil3.ImageLoader
import coil3.network.okhttp.OkHttpNetworkFetcherFactory
import coil3.request.crossfade
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import dev.ikana.miolink.core.database.MioDatabase
import dev.ikana.miolink.core.network.ConnectClients
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.core.settings.ServerSettingsStore
import dev.ikana.miolink.directory.DefaultDirectoryRepository
import dev.ikana.miolink.directory.DirectoryRepository
import dev.ikana.miolink.link.DefaultLinkRepository
import dev.ikana.miolink.link.LinkRepository
import dev.ikana.miolink.settings.DefaultSettingsRepository
import dev.ikana.miolink.settings.SettingsRepository
import dev.ikana.miolink.tree.TreeRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import okhttp3.OkHttpClient

/**
 * Builds and holds the app's long-lived dependencies (OkHttp, the Connect
 * client, Room, DataStore, repositories). This is the only place that
 * constructs them; ViewModels read them through [appContainer] in their
 * `viewModelFactory { initializer { ... } }`.
 */
class AppContainer(
    context: Context,
    /** Encrypts the stored API key; Android Keystore unless a test passes another. */
    apiKeyAead: Lazy<Aead>? = null,
) {
    val applicationContext: Context = context.applicationContext

    /** Lives as long as the process; for work that outlives any screen. */
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val serverSettingsStore = ServerSettingsStore(
        dataStore = PreferenceDataStoreFactory.create(
            scope = CoroutineScope(Dispatchers.IO + SupervisorJob()),
            produceFile = {
                applicationContext.preferencesDataStoreFile(ServerSettingsStore.DATASTORE_NAME)
            },
        ),
        aead = apiKeyAead ?: lazy { ServerSettingsStore.createApiKeyAead(applicationContext) },
    )

    /** The saved server settings; null until the user saves them. */
    val serverSettings: Flow<ServerSettings?> = serverSettingsStore.settings

    /** Shared by every RPC client (each adds its own auth) and Coil (no auth). */
    val okHttpClient: OkHttpClient = ConnectClients.createOkHttpClient()

    val connectClients = ConnectClients(okHttpClient, serverSettings, applicationScope)

    /** What repositories use to call the backend with the current settings. */
    val serviceClients: ServiceClientsProvider = connectClients

    val settingsRepository: SettingsRepository =
        DefaultSettingsRepository(serverSettingsStore, connectClients)

    val database: MioDatabase = MioDatabase.create(applicationContext)

    val treeRepository = TreeRepository(database, serviceClients, applicationScope)

    val directoryRepository: DirectoryRepository =
        DefaultDirectoryRepository(serviceClients, treeRepository)

    val linkRepository: LinkRepository = DefaultLinkRepository(serviceClients, treeRepository)

    /**
     * Loads thumbnails over [okHttpClient]. `GET /thumbnails/{name}` is
     * public, so requests carry no API key. Installed as Coil's singleton by
     * [MioLinkApplication].
     */
    val imageLoader: ImageLoader by lazy {
        ImageLoader.Builder(applicationContext)
            .components { add(OkHttpNetworkFetcherFactory(callFactory = { okHttpClient })) }
            .crossfade(true)
            .build()
    }
}
