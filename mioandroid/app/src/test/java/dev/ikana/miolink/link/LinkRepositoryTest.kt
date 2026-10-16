package dev.ikana.miolink.link

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.connectrpc.Code
import com.connectrpc.ConnectException
import com.connectrpc.Headers
import com.connectrpc.ResponseMessage
import dev.ikana.miolink.core.database.MioDatabase
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ConnectClients
import dev.ikana.miolink.core.network.ServiceClients
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.gen.miolink.directory.v1.directory
import dev.ikana.miolink.gen.miolink.link.v1.CreateLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.CreateLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.DeleteLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.DeleteLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.LinkServiceClientInterface
import dev.ikana.miolink.gen.miolink.link.v1.MoveLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.MoveLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.RecordViewRequest
import dev.ikana.miolink.gen.miolink.link.v1.RecordViewResponse
import dev.ikana.miolink.gen.miolink.link.v1.RefreshLinkMetadataRequest
import dev.ikana.miolink.gen.miolink.link.v1.RefreshLinkMetadataResponse
import dev.ikana.miolink.gen.miolink.link.v1.UpdateLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.UpdateLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.createLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.deleteLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.link
import dev.ikana.miolink.gen.miolink.link.v1.moveLinkResponse
import dev.ikana.miolink.gen.miolink.link.v1.recordViewResponse
import dev.ikana.miolink.gen.miolink.link.v1.refreshLinkMetadataResponse
import dev.ikana.miolink.gen.miolink.link.v1.updateLinkResponse
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeRequest
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeResponse
import dev.ikana.miolink.gen.miolink.tree.v1.TreeServiceClientInterface
import dev.ikana.miolink.gen.miolink.tree.v1.getTreeResponse
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SyncStateEntity
import dev.ikana.miolink.tree.TreeDao
import dev.ikana.miolink.tree.TreeRepository
import dev.ikana.miolink.tree.toTimestamp
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class LinkRepositoryTest {
    /**
     * Answers like the backend for the links in [titles] and [directories],
     * reporting the revisions [previousRevision] -> [revision], or fails
     * with [failure].
     */
    private class FakeLinkService : LinkServiceClientInterface {
        var previousRevision = CACHED_REVISION
        var revision = CACHED_REVISION + 1
        var failure: Code? = null
        var views = 0L
        val titles = mutableMapOf(10L to "Example")
        val directories = mutableMapOf(10L to 1L)
        val thumbnails = mutableMapOf(10L to "")
        val calls = mutableListOf<String>()

        private fun <T : Any> answer(call: String, response: () -> T): ResponseMessage<T> {
            calls += call
            failure?.let { return ResponseMessage.Failure(ConnectException(it), emptyMap(), emptyMap()) }
            return ResponseMessage.Success(response(), emptyMap(), emptyMap())
        }

        private fun proto(id: Long) = link {
            this.id = id
            directoryId = directories.getValue(id)
            title = titles.getValue(id)
            url = "https://example.com/$id"
            thumbnailUrl = thumbnails[id].orEmpty()
            views = 4
            createdAt = 1_000L.toTimestamp()
        }

        override suspend fun createLink(
            request: CreateLinkRequest,
            headers: Headers,
        ): ResponseMessage<CreateLinkResponse> = answer("create ${request.directoryId} ${request.url}") {
            titles[NEW_ID] = "Fetched title"
            directories[NEW_ID] = request.directoryId
            thumbnails[NEW_ID] = "/thumbnails/abc.jpg"
            createLinkResponse {
                link = proto(NEW_ID)
                previousRevision = this@FakeLinkService.previousRevision
                revision = this@FakeLinkService.revision
            }
        }

        override suspend fun updateLink(
            request: UpdateLinkRequest,
            headers: Headers,
        ): ResponseMessage<UpdateLinkResponse> = answer("update ${request.id} ${request.title}") {
            titles[request.id] = request.title.trim()
            updateLinkResponse {
                link = proto(request.id)
                previousRevision = this@FakeLinkService.previousRevision
                revision = this@FakeLinkService.revision
            }
        }

        override suspend fun moveLink(
            request: MoveLinkRequest,
            headers: Headers,
        ): ResponseMessage<MoveLinkResponse> = answer("move ${request.id} ${request.directoryId}") {
            directories[request.id] = request.directoryId
            moveLinkResponse {
                link = proto(request.id)
                previousRevision = this@FakeLinkService.previousRevision
                revision = this@FakeLinkService.revision
            }
        }

        override suspend fun deleteLink(
            request: DeleteLinkRequest,
            headers: Headers,
        ): ResponseMessage<DeleteLinkResponse> = answer("delete ${request.id}") {
            deleteLinkResponse {
                previousRevision = this@FakeLinkService.previousRevision
                revision = this@FakeLinkService.revision
            }
        }

        override suspend fun refreshLinkMetadata(
            request: RefreshLinkMetadataRequest,
            headers: Headers,
        ): ResponseMessage<RefreshLinkMetadataResponse> = answer("refresh ${request.id}") {
            titles[request.id] = "Refreshed title"
            thumbnails[request.id] = "/thumbnails/new.jpg"
            refreshLinkMetadataResponse {
                link = proto(request.id)
                previousRevision = this@FakeLinkService.previousRevision
                revision = this@FakeLinkService.revision
            }
        }

        override suspend fun recordView(
            request: RecordViewRequest,
            headers: Headers,
        ): ResponseMessage<RecordViewResponse> = answer("view ${request.id}") {
            recordViewResponse { views = this@FakeLinkService.views }
        }
    }

    /** Answers GetTree with [tree]; counts the calls. */
    private class FakeTreeService : TreeServiceClientInterface {
        var tree: GetTreeResponse? = null
        var calls = 0

        override suspend fun getTree(request: GetTreeRequest, headers: Headers): ResponseMessage<GetTreeResponse> {
            calls++
            return ResponseMessage.Success(checkNotNull(tree), emptyMap(), emptyMap())
        }
    }

    private lateinit var database: MioDatabase
    private lateinit var dao: TreeDao
    private val service = FakeLinkService()
    private val treeService = FakeTreeService()

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

    /** Caches root > Work (2), with link 10 in the root. */
    private suspend fun TestScope.repository(): LinkRepository {
        dao.insertDirectories(listOf(DirectoryEntity(1, null, "", 0), DirectoryEntity(2, 1, "Work", 0)))
        dao.insertLinks(listOf(LinkEntity(10, 1, "Example", "https://example.com/10", null, 4, 0)))
        dao.upsertSyncState(SyncStateEntity(revision = CACHED_REVISION, serverUrl = BASE_URL))
        val real = ConnectClients(OkHttpClient(), flowOf(null), backgroundScope)
        val clients: () -> ServiceClients = {
            val c = real.forSettings(ServerSettings(BASE_URL, "key"))
            ServiceClients(BASE_URL, c.health, treeService, c.directory, service)
        }
        val tree = TreeRepository(database, { clients() }, backgroundScope)
        return DefaultLinkRepository({ clients() }, tree)
    }

    /** What the server holds after another device changed it: the root and link 50 only. */
    private fun serverTree(revision: Long) = getTreeResponse {
        this.revision = revision
        directories += directory { id = 1; name = ""; createdAt = 0L.toTimestamp() }
        links += link {
            id = 50
            directoryId = 1
            title = "Elsewhere"
            url = "https://elsewhere.example"
            createdAt = 0L.toTimestamp()
        }
    }

    /** Makes the next write report another device's change first. */
    private fun stale() {
        service.previousRevision = CACHED_REVISION + 2
        service.revision = CACHED_REVISION + 3
        treeService.tree = serverTree(revision = CACHED_REVISION + 3)
    }

    /** The cache was replaced by [serverTree] instead of applying the write. */
    private suspend fun assertRefreshedFromServer() {
        assertEquals(1, treeService.calls)
        assertNull(dao.getLink(10))
        assertNotNull(dao.getLink(50))
        assertEquals(CACHED_REVISION + 3, dao.getSyncState()!!.revision)
    }

    @Test
    fun createStoresTheFetchedLinkWithAnAbsoluteThumbnail() = runTest {
        val repository = repository()

        val id = repository.create(directoryId = 2, url = "https://example.com/new")

        assertEquals(NEW_ID, id)
        assertEquals(listOf("create 2 https://example.com/new"), service.calls)
        val created = dao.getLink(NEW_ID)!!
        assertEquals(2L, created.directoryId)
        assertEquals("Fetched title", created.title)
        assertEquals("$BASE_URL/thumbnails/abc.jpg", created.thumbnailUrl)
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun createRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        stale()

        assertEquals(NEW_ID, repository.create(directoryId = 1, url = "https://example.com/new"))

        assertRefreshedFromServer()
        assertNull(dao.getLink(NEW_ID))
    }

    @Test
    fun updateTitleStoresTheServersTitle() = runTest {
        val repository = repository()

        repository.updateTitle(10, "  New title ")

        assertEquals("New title", dao.getLink(10)!!.title)
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun updateTitleRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        stale()

        repository.updateTitle(10, "New title")

        assertRefreshedFromServer()
    }

    @Test
    fun moveChangesTheDirectory() = runTest {
        val repository = repository()

        repository.move(10, directoryId = 2)

        assertEquals(2L, dao.getLink(10)!!.directoryId)
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
    }

    @Test
    fun moveRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        stale()

        repository.move(10, directoryId = 2)

        assertRefreshedFromServer()
    }

    @Test
    fun deleteRemovesTheLink() = runTest {
        val repository = repository()

        repository.delete(10)

        assertNull(dao.getLink(10))
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun deleteRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        stale()

        repository.delete(10)

        assertRefreshedFromServer()
    }

    @Test
    fun refreshMetadataStoresTheNewTitleAndThumbnail() = runTest {
        val repository = repository()

        assertTrue(repository.refreshMetadata(10))

        val link = dao.getLink(10)!!
        assertEquals("Refreshed title", link.title)
        assertEquals("$BASE_URL/thumbnails/new.jpg", link.thumbnailUrl)
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
    }

    @Test
    fun refreshMetadataWithNothingNewKeepsTheRevision() = runTest {
        val repository = repository()
        service.revision = CACHED_REVISION

        assertFalse(repository.refreshMetadata(10))

        assertEquals(CACHED_REVISION, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun refreshMetadataRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        stale()

        repository.refreshMetadata(10)

        assertRefreshedFromServer()
    }

    @Test
    fun writeFailureThrowsAndChangesNothing() = runTest {
        val repository = repository()
        service.failure = Code.INVALID_ARGUMENT

        try {
            repository.updateTitle(10, "")
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals(ApiError.InvalidArgument(null), e.error)
        }
        assertEquals("Example", dao.getLink(10)!!.title)
        assertEquals(CACHED_REVISION, dao.getSyncState()!!.revision)
    }

    @Test
    fun recordViewStoresTheNewCountWithoutTouchingTheRevision() = runTest {
        val repository = repository()
        service.views = 5

        assertEquals(5L, repository.recordView(10))

        assertEquals(listOf("view 10"), service.calls)
        assertEquals(5L, dao.getLink(10)!!.views)
        assertEquals(CACHED_REVISION, dao.getSyncState()!!.revision)
    }

    @Test
    fun recordViewFailureThrowsAndChangesNothing() = runTest {
        val repository = repository()
        service.failure = Code.NOT_FOUND

        try {
            repository.recordView(10)
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals(ApiError.NotFound, e.error)
        }
        assertEquals(4L, dao.getLink(10)!!.views)
    }

    private companion object {
        const val BASE_URL = "https://links.example.com"
        const val CACHED_REVISION = 7L
        const val NEW_ID = 20L
    }
}
