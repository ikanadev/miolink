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
import dev.ikana.miolink.gen.miolink.link.v1.recordViewResponse
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SyncStateEntity
import dev.ikana.miolink.tree.TreeRepository
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class LinkRepositoryTest {
    /** Answers RecordView with [views], or fails with [failure]. */
    private class FakeLinkService : LinkServiceClientInterface {
        val viewed = mutableListOf<Long>()
        var views = 0L
        var failure: Code? = null

        override suspend fun recordView(
            request: RecordViewRequest,
            headers: Headers,
        ): ResponseMessage<RecordViewResponse> {
            viewed += request.id
            failure?.let { return ResponseMessage.Failure(ConnectException(it), emptyMap(), emptyMap()) }
            return ResponseMessage.Success(recordViewResponse { views = this@FakeLinkService.views }, emptyMap(), emptyMap())
        }

        override suspend fun createLink(request: CreateLinkRequest, headers: Headers): ResponseMessage<CreateLinkResponse> = TODO()
        override suspend fun updateLink(request: UpdateLinkRequest, headers: Headers): ResponseMessage<UpdateLinkResponse> = TODO()
        override suspend fun moveLink(request: MoveLinkRequest, headers: Headers): ResponseMessage<MoveLinkResponse> = TODO()
        override suspend fun deleteLink(request: DeleteLinkRequest, headers: Headers): ResponseMessage<DeleteLinkResponse> = TODO()
        override suspend fun refreshLinkMetadata(
            request: RefreshLinkMetadataRequest,
            headers: Headers,
        ): ResponseMessage<RefreshLinkMetadataResponse> = TODO()
    }

    private lateinit var database: MioDatabase
    private val service = FakeLinkService()

    @Before
    fun setUp() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            MioDatabase::class.java,
        ).allowMainThreadQueries().build()
    }

    @After
    fun tearDown() = database.close()

    private suspend fun TestScope.repository(): LinkRepository {
        val dao = database.treeDao()
        dao.insertDirectories(listOf(DirectoryEntity(1, null, "", 0)))
        dao.insertLinks(listOf(LinkEntity(10, 1, "Example", "https://example.com", null, 4, 0)))
        dao.upsertSyncState(SyncStateEntity(revision = 7, serverUrl = BASE_URL))
        val real = ConnectClients(OkHttpClient(), flowOf(null), backgroundScope)
        val clients: suspend () -> ServiceClients = {
            val c = real.forSettings(ServerSettings(BASE_URL, "key"))
            ServiceClients(BASE_URL, c.health, c.tree, c.directory, service)
        }
        val tree = TreeRepository(database, { clients() }, backgroundScope)
        return DefaultLinkRepository({ clients() }, tree)
    }

    @Test
    fun recordViewStoresTheNewCountWithoutTouchingTheRevision() = runTest {
        val repository = repository()
        service.views = 5

        assertEquals(5L, repository.recordView(10))

        val dao = database.treeDao()
        assertEquals(listOf(10L), service.viewed)
        assertEquals(5L, dao.getLink(10)!!.views)
        assertEquals(7L, dao.getSyncState()!!.revision)
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
        assertEquals(4L, database.treeDao().getLink(10)!!.views)
    }

    private companion object {
        const val BASE_URL = "https://links.example.com"
    }
}
