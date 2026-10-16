package dev.ikana.miolink.core.network

import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.gen.miolink.health.v1.pingRequest
import java.net.ServerSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import mockwebserver3.MockResponse
import mockwebserver3.MockWebServer
import okhttp3.OkHttpClient
import okhttp3.Request
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test

/** Against a local MockWebServer; nothing leaves the machine. */
class ConnectClientsTest {
    private val server = MockWebServer()
    private val scope = CoroutineScope(Job())
    private val okHttp = ConnectClients.createOkHttpClient()

    @Before
    fun setUp() = server.start()

    @After
    fun tearDown() {
        server.close()
        scope.cancel()
    }

    private fun baseUrl(path: String = "") = server.url(path).toString().trimEnd('/')

    @Test
    fun authInterceptorAddsBearerHeader() {
        server.enqueue(MockResponse.Builder().code(200).build())
        val client = OkHttpClient.Builder().addInterceptor(AuthInterceptor { "the-key" }).build()

        client.newCall(Request.Builder().url(server.url("/")).build()).execute().close()

        assertEquals("Bearer the-key", server.takeRequest().headers["Authorization"])
    }

    @Test
    fun authInterceptorSkipsMissingKey() {
        server.enqueue(MockResponse.Builder().code(200).build())
        val client = OkHttpClient.Builder().addInterceptor(AuthInterceptor { null }).build()

        client.newCall(Request.Builder().url(server.url("/")).build()).execute().close()

        assertNull(server.takeRequest().headers["Authorization"])
    }

    @Test
    fun pingSendsKeyToPrefixedPath() = runTest {
        server.enqueue(protoOk())
        val clients = ConnectClients(okHttp, MutableStateFlow(null), scope)
            .forSettings(ServerSettings(baseUrl("/miolink"), "the-key"))

        clients.health.ping(pingRequest {}).getOrThrowApi()

        val request = server.takeRequest()
        assertEquals("/miolink/miolink.health.v1.HealthService/Ping", request.url.encodedPath)
        assertEquals("Bearer the-key", request.headers["Authorization"])
    }

    @Test
    fun rejectedKeyIsUnauthenticated() = runTest {
        server.enqueue(
            MockResponse.Builder()
                .code(401)
                .setHeader("Content-Type", "application/json")
                .body("""{"code":"unauthenticated","message":"invalid API key"}""")
                .build(),
        )
        val clients = ConnectClients(okHttp, MutableStateFlow(null), scope)
            .forSettings(ServerSettings(baseUrl(), "wrong"))

        assertEquals(ApiError.Unauthenticated, pingError(clients))
    }

    @Test
    fun closedPortIsUnreachable() = runTest {
        val port = ServerSocket(0).use { it.localPort }
        val clients = ConnectClients(okHttp, MutableStateFlow(null), scope)
            .forSettings(ServerSettings("http://127.0.0.1:$port", "key"))

        assertEquals(ApiError.Unreachable, pingError(clients))
    }

    @Test
    fun currentFollowsSavedSettings() = runTest {
        val settings = MutableStateFlow<ServerSettings?>(null)
        val clients = ConnectClients(okHttp, settings, backgroundScope)

        try {
            clients.current()
            fail("expected NotConfigured")
        } catch (e: ApiException) {
            assertEquals(ApiError.NotConfigured, e.error)
        }

        settings.value = ServerSettings("https://a.example.com", "key")
        runCurrent()
        val first = clients.current()
        assertEquals("https://a.example.com", first.baseUrl)
        assertSame(first, clients.current())

        settings.value = ServerSettings("https://b.example.com", "key")
        runCurrent()
        assertEquals("https://b.example.com", clients.current().baseUrl)
    }

    @Test
    fun thumbnailUrlConcatenates() {
        assertEquals(
            "https://example.com/miolink/thumbnails/ab.jpg",
            thumbnailUrl("https://example.com/miolink", "/thumbnails/ab.jpg"),
        )
        assertEquals("https://example.com/thumbnails/ab.jpg", thumbnailUrl("https://example.com", "thumbnails/ab.jpg"))
        assertNull(thumbnailUrl("https://example.com", ""))
    }

    private suspend fun pingError(clients: ServiceClients): ApiError? = try {
        clients.health.ping(pingRequest {}).getOrThrowApi()
        null
    } catch (e: ApiException) {
        e.error
    }

    private fun protoOk() = MockResponse.Builder()
        .code(200)
        .setHeader("Content-Type", "application/proto")
        .build()
}
