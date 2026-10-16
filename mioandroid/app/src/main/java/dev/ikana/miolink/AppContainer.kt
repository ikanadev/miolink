package dev.ikana.miolink

import android.content.Context
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.preferencesDataStoreFile
import dev.ikana.miolink.core.database.MioDatabase
import dev.ikana.miolink.core.network.ConnectClients
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.core.settings.ServerSettingsStore
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
class AppContainer(context: Context) {
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
        aead = lazy { ServerSettingsStore.createApiKeyAead(applicationContext) },
    )

    /** The saved server settings; null until the user saves them. */
    val serverSettings: Flow<ServerSettings?> = serverSettingsStore.settings

    /** Shared by every RPC client (each adds its own auth) and, later, Coil. */
    val okHttpClient: OkHttpClient = ConnectClients.createOkHttpClient()

    val connectClients = ConnectClients(okHttpClient, serverSettings, applicationScope)

    /** What repositories use to call the backend with the current settings. */
    val serviceClients: ServiceClientsProvider = connectClients

    val settingsRepository: SettingsRepository =
        DefaultSettingsRepository(serverSettingsStore, connectClients)

    val database: MioDatabase = MioDatabase.create(applicationContext)

    val treeRepository = TreeRepository(database, serviceClients, applicationScope)
}
