package dev.ikana.miolink.tree

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.connectrpc.Code
import com.connectrpc.ConnectException
import com.connectrpc.Headers
import com.connectrpc.ResponseMessage
import dev.ikana.miolink.core.database.MioDatabase
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ConnectClients
import dev.ikana.miolink.core.network.ServiceClients
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.gen.miolink.directory.v1.directory
import dev.ikana.miolink.gen.miolink.link.v1.link
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeRequest
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeResponse
import dev.ikana.miolink.gen.miolink.tree.v1.TreeServiceClientInterface
import dev.ikana.miolink.gen.miolink.tree.v1.getTreeResponse
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.yield
import okhttp3.OkHttpClient
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class TreeRepositoryTest {
    private class FakeTreeService : TreeServiceClientInterface {
        val requests = mutableListOf<Long>()
        val responses = ArrayDeque<ResponseMessage<GetTreeResponse>>()
        var gate: CompletableDeferred<Unit>? = null

        override suspend fun getTree(
            request: GetTreeRequest,
            headers: Headers,
        ): ResponseMessage<GetTreeResponse> {
            requests += request.knownRevision
            gate?.await()
            return responses.removeFirst()
        }

        fun respond(response: GetTreeResponse) {
            responses += ResponseMessage.Success(response, emptyMap(), emptyMap())
        }

        fun fail(code: Code) {
            responses += ResponseMessage.Failure(ConnectException(code), emptyMap(), emptyMap())
        }
    }

    private lateinit var database: MioDatabase
    private lateinit var dao: TreeDao
    private val service = FakeTreeService()
    private var baseUrl = SERVER_A

    @Before
    fun setUp() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            MioDatabase::class.java,
        ).allowMainThreadQueries().build()
        dao = database.treeDao()
    }

    @After
    fun tearDown() = database.close()

    private fun kotlinx.coroutines.test.TestScope.repository(): TreeRepository {
        val real = ConnectClients(OkHttpClient(), flowOf(null), backgroundScope)
        return TreeRepository(
            database = database,
            serviceClients = {
                val clients = real.forSettings(ServerSettings(baseUrl, "key"))
                ServiceClients(baseUrl, clients.health, service, clients.directory, clients.link)
            },
            scope = backgroundScope,
        )
    }

    private fun tree(revision: Long, vararg extra: Pair<Long, Long>) = getTreeResponse {
        this.revision = revision
        directories += directory { id = 1; name = ""; createdAt = 0L.toTimestamp() }
        // A child created before its parent: the parent has the larger id.
        directories += directory { id = 2; parentId = 3; name = "child"; createdAt = 2_000L.toTimestamp() }
        directories += directory { id = 3; parentId = 1; name = "parent"; createdAt = 3_000L.toTimestamp() }
        links += link {
            id = 10; directoryId = 2; title = "Example"; url = "https://example.com"
            thumbnailUrl = "/thumbnails/abc.jpg"; views = 4; createdAt = 1_500L.toTimestamp()
        }
        for ((linkId, directoryId) in extra) {
            links += link { id = linkId; this.directoryId = directoryId; title = "t$linkId"; url = "u" }
        }
    }

    @Test
    fun firstSyncSendsZeroAndStoresTheTree() = runTest {
        service.respond(tree(revision = 5))
        val repository = repository()

        assertNull(repository.refresh())

        assertEquals(listOf(0L), service.requests)
        assertEquals(SyncStateEntity(revision = 5, serverUrl = SERVER_A), dao.getSyncState())
        assertEquals(listOf("parent"), repository.childDirectories(1).first().map { it.name })
        assertEquals(DirectoryEntity(2, 3, "child", 2_000), dao.getDirectory(2))
        assertEquals(
            LinkEntity(10, 2, "Example", "https://example.com", "$SERVER_A/thumbnails/abc.jpg", 4, 1_500),
            dao.getLink(10),
        )
        assertNull(repository.lastSyncError.value)
    }

    @Test
    fun notModifiedLeavesRowsUntouched() = runTest {
        service.respond(tree(revision = 5))
        val repository = repository()
        repository.refresh()
        dao.upsertLink(dao.getLink(10)!!.copy(title = "local"))

        service.respond(getTreeResponse { notModified = true; revision = 5 })
        assertNull(repository.refresh())

        assertEquals(listOf(0L, 5L), service.requests)
        assertEquals("local", dao.getLink(10)!!.title)
        assertEquals(5L, dao.getSyncState()!!.revision)
    }

    @Test
    fun staleRevisionReplacesEverything() = runTest {
        service.respond(tree(revision = 5, 11L to 3L))
        val repository = repository()
        repository.refresh()

        service.respond(tree(revision = 9, 12L to 1L))
        repository.refresh()

        assertEquals(listOf(0L, 5L), service.requests)
        assertNull(dao.getLink(11))
        assertEquals(1L, dao.getLink(12)!!.directoryId)
        assertEquals(9L, dao.getSyncState()!!.revision)
    }

    @Test
    fun failureIsExposedAndKeepsTheCache() = runTest {
        service.respond(tree(revision = 5))
        val repository = repository()
        repository.refresh()

        service.fail(Code.UNAUTHENTICATED)
        assertEquals(ApiError.Unauthenticated, repository.refresh())

        assertEquals(ApiError.Unauthenticated, repository.lastSyncError.value)
        assertEquals(5L, dao.getSyncState()!!.revision)
        assertTrue(dao.getLink(10) != null)
    }

    @Test
    fun concurrentRefreshesShareOneRequest() = runTest {
        service.respond(tree(revision = 5))
        service.gate = CompletableDeferred()
        val repository = repository()

        val first = async { repository.refresh() }
        val second = async { repository.refresh() }
        yield()
        service.gate!!.complete(Unit)

        assertNull(first.await())
        assertNull(second.await())
        assertEquals(listOf(0L), service.requests)
    }

    @Test
    fun applyWriteAppliesWhenRevisionsMatch() = runTest {
        service.respond(tree(revision = 5))
        val repository = repository()
        repository.refresh()

        val applied = repository.applyWrite(previousRevision = 5, revision = 6) {
            renameDirectory(3, "renamed")
        }

        assertTrue(applied)
        assertEquals("renamed", dao.getDirectory(3)!!.name)
        assertEquals(6L, dao.getSyncState()!!.revision)
        assertEquals(1, service.requests.size)
    }

    @Test
    fun applyWriteRefreshesWhenRevisionsDiffer() = runTest {
        service.respond(tree(revision = 5))
        val repository = repository()
        repository.refresh()

        service.respond(tree(revision = 8, 12L to 1L))
        val applied = repository.applyWrite(previousRevision = 7, revision = 8) {
            renameDirectory(3, "renamed")
        }

        assertFalse(applied)
        assertEquals("parent", dao.getDirectory(3)!!.name)
        assertEquals(listOf(0L, 5L), service.requests)
        assertEquals(8L, dao.getSyncState()!!.revision)
        assertTrue(dao.getLink(12) != null)
    }

    @Test
    fun deletingADirectoryCascades() = runTest {
        service.respond(tree(revision = 5, 11L to 3L, 12L to 1L))
        val repository = repository()
        repository.refresh()

        repository.applyWrite(previousRevision = 5, revision = 9) { deleteDirectory(3) }

        assertNull(dao.getDirectory(3))
        assertNull(dao.getDirectory(2))
        assertNull(dao.getLink(10))
        assertNull(dao.getLink(11))
        assertTrue(dao.getLink(12) != null)
        assertEquals(listOf(1L), repository.allDirectories().first().map { it.id })
    }

    @Test
    fun changingTheServerUrlClearsTheCache() = runTest {
        service.respond(tree(revision = 5, 11L to 3L))
        val repository = repository()
        repository.refresh()

        baseUrl = SERVER_B
        service.fail(Code.UNAVAILABLE)
        assertEquals(ApiError.Unreachable, repository.refresh())

        // Cleared before the request, which then sent 0.
        assertEquals(listOf(0L, 0L), service.requests)
        assertNull(dao.getSyncState())
        assertTrue(repository.allDirectories().first().isEmpty())
        assertNull(dao.getLink(11))

        service.respond(tree(revision = 2))
        repository.refresh()
        assertEquals(SyncStateEntity(revision = 2, serverUrl = SERVER_B), dao.getSyncState())
        assertEquals("$SERVER_B/thumbnails/abc.jpg", dao.getLink(10)!!.thumbnailUrl)
    }

    private companion object {
        const val SERVER_A = "https://a.example.com"
        const val SERVER_B = "https://b.example.com/miolink"
    }
}
