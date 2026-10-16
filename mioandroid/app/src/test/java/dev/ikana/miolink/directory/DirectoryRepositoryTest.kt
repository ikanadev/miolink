package dev.ikana.miolink.directory

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
import dev.ikana.miolink.gen.miolink.directory.v1.CreateDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.CreateDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.DeleteDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.DeleteDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.DirectoryServiceClientInterface
import dev.ikana.miolink.gen.miolink.directory.v1.MoveDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.MoveDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.RenameDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.RenameDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.createDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.deleteDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.directory
import dev.ikana.miolink.gen.miolink.directory.v1.moveDirectoryResponse
import dev.ikana.miolink.gen.miolink.directory.v1.renameDirectoryResponse
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeRequest
import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeResponse
import dev.ikana.miolink.gen.miolink.tree.v1.TreeServiceClientInterface
import dev.ikana.miolink.gen.miolink.tree.v1.getTreeResponse
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SubtreeCount
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
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class DirectoryRepositoryTest {
    /**
     * Answers like the backend with the directories in [names] and
     * [parents], reporting the revisions [previousRevision] -> [revision],
     * or fails with [failure].
     */
    private class FakeDirectoryService : DirectoryServiceClientInterface {
        var previousRevision = CACHED_REVISION
        var revision = CACHED_REVISION + 1
        var failure: Code? = null
        val names = mutableMapOf(2L to "Work", 3L to "Projects", 4L to "Old", 5L to "Home")
        val parents = mutableMapOf(2L to 1L, 3L to 2L, 4L to 3L, 5L to 1L)
        val calls = mutableListOf<String>()

        private fun <T : Any> answer(call: String, response: () -> T): ResponseMessage<T> {
            calls += call
            failure?.let { return ResponseMessage.Failure(ConnectException(it), emptyMap(), emptyMap()) }
            return ResponseMessage.Success(response(), emptyMap(), emptyMap())
        }

        private fun proto(id: Long) = directory {
            this.id = id
            parentId = parents.getValue(id)
            name = names.getValue(id)
            createdAt = 1_000L.toTimestamp()
        }

        override suspend fun createDirectory(
            request: CreateDirectoryRequest,
            headers: Headers,
        ): ResponseMessage<CreateDirectoryResponse> = answer("create ${request.parentId} ${request.name}") {
            names[NEW_ID] = request.name
            parents[NEW_ID] = request.parentId
            createDirectoryResponse {
                directory = proto(NEW_ID)
                previousRevision = this@FakeDirectoryService.previousRevision
                revision = this@FakeDirectoryService.revision
            }
        }

        override suspend fun renameDirectory(
            request: RenameDirectoryRequest,
            headers: Headers,
        ): ResponseMessage<RenameDirectoryResponse> = answer("rename ${request.id} ${request.name}") {
            names[request.id] = request.name
            renameDirectoryResponse {
                directory = proto(request.id)
                previousRevision = this@FakeDirectoryService.previousRevision
                revision = this@FakeDirectoryService.revision
            }
        }

        override suspend fun moveDirectory(
            request: MoveDirectoryRequest,
            headers: Headers,
        ): ResponseMessage<MoveDirectoryResponse> = answer("move ${request.id} ${request.newParentId}") {
            parents[request.id] = request.newParentId
            moveDirectoryResponse {
                directory = proto(request.id)
                previousRevision = this@FakeDirectoryService.previousRevision
                revision = this@FakeDirectoryService.revision
            }
        }

        override suspend fun deleteDirectory(
            request: DeleteDirectoryRequest,
            headers: Headers,
        ): ResponseMessage<DeleteDirectoryResponse> = answer("delete ${request.id}") {
            deleteDirectoryResponse {
                previousRevision = this@FakeDirectoryService.previousRevision
                revision = this@FakeDirectoryService.revision
            }
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
    private val directoryService = FakeDirectoryService()
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

    /** Caches root > Work (2) > Projects (3) > Old (4), root > Home (5), with links in 3 and 4. */
    private suspend fun TestScope.repository(): DirectoryRepository {
        dao.insertDirectories(
            listOf(
                DirectoryEntity(1, null, "", 0),
                DirectoryEntity(2, 1, "Work", 0),
                DirectoryEntity(3, 2, "Projects", 0),
                DirectoryEntity(4, 3, "Old", 0),
                DirectoryEntity(5, 1, "Home", 0),
            ),
        )
        dao.insertLinks(
            listOf(
                LinkEntity(10, 3, "a", "https://a.example", null, 0, 0),
                LinkEntity(11, 4, "b", "https://b.example", null, 0, 0),
                LinkEntity(12, 5, "c", "https://c.example", null, 0, 0),
            ),
        )
        dao.upsertSyncState(SyncStateEntity(revision = CACHED_REVISION, serverUrl = BASE_URL))
        val real = ConnectClients(OkHttpClient(), flowOf(null), backgroundScope)
        val clients: () -> ServiceClients = {
            val c = real.forSettings(ServerSettings(BASE_URL, "key"))
            ServiceClients(BASE_URL, c.health, treeService, directoryService, c.link)
        }
        val tree = TreeRepository(database, { clients() }, backgroundScope)
        return DefaultDirectoryRepository({ clients() }, tree)
    }

    /** What the server holds after another device changed it: only root and "Elsewhere". */
    private fun serverTree(revision: Long) = getTreeResponse {
        this.revision = revision
        directories += directory { id = 1; name = ""; createdAt = 0L.toTimestamp() }
        directories += directory { id = 40; parentId = 1; name = "Elsewhere"; createdAt = 0L.toTimestamp() }
    }

    @Test
    fun createAppliesTheNewDirectoryWhenRevisionsMatch() = runTest {
        val repository = repository()

        val id = repository.create(parentId = 2, name = "New")

        assertEquals(NEW_ID, id)
        assertEquals(listOf("create 2 New"), directoryService.calls)
        assertEquals(DirectoryEntity(NEW_ID, 2, "New", 1_000), dao.getDirectory(NEW_ID))
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun createRefreshesInsteadWhenAnotherDeviceChangedTheTree() = runTest {
        val repository = repository()
        directoryService.previousRevision = CACHED_REVISION + 3
        directoryService.revision = CACHED_REVISION + 4
        treeService.tree = serverTree(revision = CACHED_REVISION + 4)

        repository.create(parentId = 2, name = "New")

        assertEquals(1, treeService.calls)
        // The cache is the server's tree, not the local change.
        assertNull(dao.getDirectory(NEW_ID))
        assertNotNull(dao.getDirectory(40))
        assertEquals(CACHED_REVISION + 4, dao.getSyncState()!!.revision)
    }

    @Test
    fun renameAppliesTheNewName() = runTest {
        val repository = repository()

        repository.rename(3, "Renamed")

        assertEquals(DirectoryEntity(3, 2, "Renamed", 0), dao.getDirectory(3))
        // Renaming in place keeps the subtree.
        assertNotNull(dao.getDirectory(4))
        assertNotNull(dao.getLink(10))
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
    }

    @Test
    fun renameRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        directoryService.previousRevision = CACHED_REVISION + 1
        directoryService.revision = CACHED_REVISION + 2
        treeService.tree = serverTree(revision = CACHED_REVISION + 2)

        repository.rename(3, "Renamed")

        assertEquals(1, treeService.calls)
        assertNull(dao.getDirectory(3))
        assertEquals(CACHED_REVISION + 2, dao.getSyncState()!!.revision)
    }

    @Test
    fun moveAppliesTheNewParentAndKeepsTheSubtree() = runTest {
        val repository = repository()

        repository.move(3, newParentId = 5)

        assertEquals(5L, dao.getDirectory(3)!!.parentId)
        assertEquals(3L, dao.getDirectory(4)!!.parentId)
        assertNotNull(dao.getLink(11))
        assertEquals(CACHED_REVISION + 1, dao.getSyncState()!!.revision)
    }

    @Test
    fun moveRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        directoryService.previousRevision = CACHED_REVISION - 1
        treeService.tree = serverTree(revision = CACHED_REVISION + 1)

        repository.move(3, newParentId = 5)

        assertEquals(1, treeService.calls)
        assertNull(dao.getDirectory(3))
    }

    @Test
    fun deleteRemovesTheSubtreeAndItsLinks() = runTest {
        val repository = repository()
        // A recursive delete bumps the revision once per row.
        directoryService.revision = CACHED_REVISION + 4

        repository.delete(3)

        assertNull(dao.getDirectory(3))
        assertNull(dao.getDirectory(4))
        assertNull(dao.getLink(10))
        assertNull(dao.getLink(11))
        assertNotNull(dao.getDirectory(2))
        assertNotNull(dao.getLink(12))
        assertEquals(CACHED_REVISION + 4, dao.getSyncState()!!.revision)
        assertEquals(0, treeService.calls)
    }

    @Test
    fun deleteRefreshesWhenRevisionsDiffer() = runTest {
        val repository = repository()
        directoryService.previousRevision = CACHED_REVISION + 2
        directoryService.revision = CACHED_REVISION + 5
        treeService.tree = serverTree(revision = CACHED_REVISION + 5)

        repository.delete(3)

        assertEquals(1, treeService.calls)
        assertNull(dao.getDirectory(2))
        assertNotNull(dao.getDirectory(40))
    }

    @Test
    fun failureThrowsAndChangesNothing() = runTest {
        val repository = repository()
        directoryService.failure = Code.ALREADY_EXISTS

        try {
            repository.rename(3, "Old")
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals(ApiError.AlreadyExists(null), e.error)
        }
        assertEquals("Projects", dao.getDirectory(3)!!.name)
        assertEquals(CACHED_REVISION, dao.getSyncState()!!.revision)
    }

    @Test
    fun subtreeCountIncludesEveryLevel() = runTest {
        repository()

        assertEquals(SubtreeCount(subdirectories = 2, links = 2), dao.countSubtree(2))
        assertEquals(SubtreeCount(subdirectories = 0, links = 1), dao.countSubtree(5))
        assertEquals(SubtreeCount(subdirectories = 0, links = 0), dao.countSubtree(99))
    }

    private companion object {
        const val BASE_URL = "https://links.example.com"
        const val CACHED_REVISION = 7L
        const val NEW_ID = 20L
    }
}
