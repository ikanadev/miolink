package dev.ikana.miolink.settings

import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ConnectClients
import dev.ikana.miolink.core.network.getOrThrowApi
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.core.settings.ServerSettingsStore
import dev.ikana.miolink.gen.miolink.health.v1.pingRequest
import kotlinx.coroutines.flow.Flow

/** What the settings screen needs: the saved settings, saving, and Ping. */
interface SettingsRepository {
    val settings: Flow<ServerSettings?>

    suspend fun save(settings: ServerSettings)

    /** Calls `Ping` with [settings] (not the saved ones). Null on success. */
    suspend fun testConnection(settings: ServerSettings): ApiError?
}

class DefaultSettingsRepository(
    private val store: ServerSettingsStore,
    private val clients: ConnectClients,
) : SettingsRepository {
    override val settings: Flow<ServerSettings?> = store.settings

    override suspend fun save(settings: ServerSettings) = store.save(settings)

    override suspend fun testConnection(settings: ServerSettings): ApiError? = try {
        clients.forSettings(settings).health.ping(pingRequest {}).getOrThrowApi()
        null
    } catch (e: ApiException) {
        e.error
    }
}
