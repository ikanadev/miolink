package dev.ikana.miolink.core.network

import com.connectrpc.ProtocolClientConfig
import com.connectrpc.extensions.GoogleJavaLiteProtobufStrategy
import com.connectrpc.impl.ProtocolClient
import com.connectrpc.okhttp.ConnectOkHttpClient
import com.connectrpc.protocols.NetworkProtocol
import com.connectrpc.simpleTimeouts
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.gen.miolink.directory.v1.DirectoryServiceClient
import dev.ikana.miolink.gen.miolink.directory.v1.DirectoryServiceClientInterface
import dev.ikana.miolink.gen.miolink.health.v1.HealthServiceClient
import dev.ikana.miolink.gen.miolink.health.v1.HealthServiceClientInterface
import dev.ikana.miolink.gen.miolink.link.v1.LinkServiceClient
import dev.ikana.miolink.gen.miolink.link.v1.LinkServiceClientInterface
import dev.ikana.miolink.gen.miolink.tree.v1.TreeServiceClient
import dev.ikana.miolink.gen.miolink.tree.v1.TreeServiceClientInterface
import java.util.concurrent.TimeUnit
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import okhttp3.OkHttpClient

/**
 * The generated Connect clients for one server, plus its [baseUrl] for
 * building thumbnail URLs. Repositories get a fresh one from
 * [ServiceClientsProvider.current] for every call, so they always use the
 * saved settings.
 */
class ServiceClients(
    val baseUrl: String,
    val health: HealthServiceClientInterface,
    val tree: TreeServiceClientInterface,
    val directory: DirectoryServiceClientInterface,
    val link: LinkServiceClientInterface,
) {
    /** Absolute URL of a proto `thumbnail_url`, or null when it's empty. */
    fun thumbnailUrl(path: String): String? = thumbnailUrl(baseUrl, path)
}

/** Where repositories get the [ServiceClients] for the current settings. */
fun interface ServiceClientsProvider {
    /**
     * The clients for the saved settings. Waits for settings to load once.
     *
     * @throws ApiException with [ApiError.NotConfigured] when nothing is saved.
     */
    suspend fun current(): ServiceClients
}

/**
 * Builds [ServiceClients] from [ServerSettings] and keeps the ones for the
 * saved settings, rebuilding them when the settings change.
 *
 * [okHttpClient] is the app's shared client (also used for thumbnails); each
 * set of settings gets a derived client, sharing its connection pool, with an
 * [AuthInterceptor] for that settings' key.
 */
class ConnectClients(
    private val okHttpClient: OkHttpClient,
    settings: Flow<ServerSettings?>,
    scope: CoroutineScope,
) : ServiceClientsProvider {
    // Wrapped so "not loaded yet" (null) differs from "not configured".
    private class Loaded(val settings: ServerSettings?)

    private val saved = settings
        .map { Loaded(it) }
        .stateIn(scope, SharingStarted.Eagerly, initialValue = null)

    private val lock = Any()
    private var cached: Pair<ServerSettings, ServiceClients>? = null

    override suspend fun current(): ServiceClients {
        val settings = saved.filterNotNull().first().settings
            ?: throw ApiException(ApiError.NotConfigured)
        synchronized(lock) {
            cached?.let { (cachedSettings, clients) ->
                if (cachedSettings == settings) return clients
            }
            return forSettings(settings).also { cached = settings to it }
        }
    }

    /**
     * Clients for [settings] that aren't saved yet, such as the values typed
     * in the settings screen for "Test connection".
     */
    fun forSettings(settings: ServerSettings): ServiceClients {
        val httpClient = ConnectOkHttpClient.configureClient(okHttpClient.newBuilder())
            .addInterceptor(AuthInterceptor { settings.apiKey })
            .build()
        val protocolClient = ProtocolClient(
            httpClient = ConnectOkHttpClient(httpClient),
            config = ProtocolClientConfig(
                host = settings.baseUrl,
                serializationStrategy = GoogleJavaLiteProtobufStrategy(),
                networkProtocol = NetworkProtocol.CONNECT,
                ioCoroutineContext = Dispatchers.IO,
                // CreateLink waits for the server to fetch the page, which has
                // its own timeouts; leave room for them.
                timeoutOracle = simpleTimeouts(unaryTimeout = 30.seconds, streamTimeout = null),
            ),
        )
        return ServiceClients(
            baseUrl = settings.baseUrl,
            health = HealthServiceClient(protocolClient),
            tree = TreeServiceClient(protocolClient),
            directory = DirectoryServiceClient(protocolClient),
            link = LinkServiceClient(protocolClient),
        )
    }

    companion object {
        /** The app's shared OkHttpClient: connect timeout only, no auth. */
        fun createOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }
}

/**
 * `baseUrl + path`, by plain concatenation: the backend returns
 * `/thumbnails/<name>` and [baseUrl] may carry a path prefix, which URL
 * resolution would drop. Returns null for an empty [path] (no thumbnail).
 */
fun thumbnailUrl(baseUrl: String, path: String): String? = when {
    path.isEmpty() -> null
    path.startsWith('/') -> baseUrl + path
    else -> "$baseUrl/$path"
}
