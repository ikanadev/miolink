package dev.ikana.miolink.browse

import app.cash.turbine.test
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.link.LinkRepository
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

// Robolectric for android.util.Log, which the ViewModel logs failures with.
@RunWith(RobolectricTestRunner::class)
@OptIn(ExperimentalCoroutinesApi::class)
class BrowseViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    /** The tree in memory, ordered like the DAO's queries. */
    private class FakeTree : TreeSource {
        val directories = MutableStateFlow<List<DirectoryEntity>>(emptyList())
        val allLinks = MutableStateFlow<List<LinkEntity>>(emptyList())
        override val lastSyncError = MutableStateFlow<ApiError?>(null)
        var refreshes = 0
        var refreshResult = CompletableDeferred<ApiError?>()

        override fun directory(id: Long): Flow<DirectoryEntity?> =
            directories.map { all -> all.firstOrNull { it.id == id } }

        override fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>> =
            directories.map { all -> all.filter { it.parentId == parentId }.sortedBy { it.name } }

        override fun links(directoryId: Long): Flow<List<LinkEntity>> =
            allLinks.map { all ->
                all.filter { it.directoryId == directoryId }
                    .sortedWith(compareByDescending<LinkEntity> { it.createdAt }.thenByDescending { it.id })
            }

        override fun allDirectories(): Flow<List<DirectoryEntity>> =
            directories.map { all -> all.sortedBy { it.id } }

        override fun link(id: Long): Flow<LinkEntity?> =
            allLinks.map { all -> all.firstOrNull { it.id == id } }

        override val revision: Flow<Long?> = directories.map { if (it.isEmpty()) null else 1L }

        override suspend fun refresh(): ApiError? {
            refreshes++
            return refreshResult.await().also { lastSyncError.value = it }
        }
    }

    private class FakeLinks : LinkRepository {
        val viewed = mutableListOf<Long>()
        var failure: ApiError? = null

        override suspend fun recordView(id: Long): Long {
            viewed += id
            failure?.let { throw ApiException(it) }
            return 1
        }
    }

    private val tree = FakeTree()
    private val links = FakeLinks()

    private fun dir(id: Long, parentId: Long?, name: String) = DirectoryEntity(id, parentId, name, 0)

    private fun link(id: Long, directoryId: Long, createdAt: Long) =
        LinkEntity(id, directoryId, "t$id", "https://example.com/$id", null, 0, createdAt)

    /** root > Work (2) > Projects (3) > Old (4); root > Home (5). */
    private val sampleTree = listOf(
        dir(ROOT_DIRECTORY_ID, null, ""),
        dir(2, 1, "Work"),
        dir(3, 2, "Projects"),
        dir(4, 3, "Old"),
        dir(5, 1, "Home"),
    )

    private fun TestScope.viewModel(directoryId: Long): BrowseViewModel {
        val viewModel = BrowseViewModel(directoryId, tree, links)
        // stateIn(WhileSubscribed) only runs while collected, like on screen.
        backgroundScope.launch { viewModel.state.collect {} }
        return viewModel
    }

    @Test
    fun buildsThePathFromTheRoot() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(3)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals("Projects", state.name)
        assertEquals(
            listOf(PathSegment(ROOT_DIRECTORY_ID, ""), PathSegment(2, "Work")),
            state.ancestors,
        )
        assertFalse(state.isRoot)
        assertFalse(state.isLoading)
    }

    @Test
    fun rootHasNoAncestors() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state.isRoot)
        assertEquals(emptyList<PathSegment>(), state.ancestors)
    }

    @Test
    fun directoriesByNameAndLinksNewestFirst() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        tree.allLinks.value = listOf(link(10, 1, 100), link(11, 1, 300), link(12, 1, 200), link(13, 2, 400))
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(listOf("Home", "Work"), state.directories.map { it.name })
        assertEquals(listOf(11L, 12L, 10L), state.links.map { it.id })
        assertFalse(state.isEmpty)
    }

    @Test
    fun emptyDirectory() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(4)
        advanceUntilIdle()

        assertTrue(viewModel.state.value.isEmpty)
    }

    @Test
    fun loadingUntilTheFirstSyncThenItsError() = runTest(dispatcher) {
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        assertTrue(viewModel.state.value.isLoading)
        assertFalse(viewModel.state.value.isEmpty)

        tree.lastSyncError.value = ApiError.Unreachable
        advanceUntilIdle()
        val state = viewModel.state.value
        assertFalse(state.isLoading)
        assertFalse(state.hasCache)
        assertEquals(ApiError.Unreachable, state.syncError)
        // A missing cache isn't a missing directory.
        assertNull(state.redirectTo)
    }

    @Test
    fun deletedDirectoryRedirectsToTheNearestExistingAncestor() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(4)
        advanceUntilIdle()
        assertNull(viewModel.state.value.redirectTo)

        // Another device deleted Projects, and with it Old.
        tree.directories.value = sampleTree.filter { it.id != 3L && it.id != 4L }
        advanceUntilIdle()

        assertEquals(2L, viewModel.state.value.redirectTo)
        assertEquals(emptyList<DirectoryEntity>(), viewModel.state.value.directories)
    }

    @Test
    fun deletedDirectoryWithNoAncestorLeftRedirectsToTheRoot() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(4)
        advanceUntilIdle()

        tree.directories.value = sampleTree.filter { it.id == ROOT_DIRECTORY_ID || it.id == 5L }
        advanceUntilIdle()

        assertEquals(ROOT_DIRECTORY_ID, viewModel.state.value.redirectTo)
    }

    @Test
    fun unknownDirectoryRedirectsToTheRoot() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(99)
        advanceUntilIdle()

        assertEquals(ROOT_DIRECTORY_ID, viewModel.state.value.redirectTo)
    }

    @Test
    fun movedDirectoryUpdatesItsPath() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(3)
        advanceUntilIdle()

        tree.directories.value = sampleTree.map { if (it.id == 3L) it.copy(parentId = 5) else it }
        advanceUntilIdle()

        assertEquals(listOf(1L, 5L), viewModel.state.value.ancestors.map { it.id })
        assertNull(viewModel.state.value.redirectTo)
    }

    @Test
    fun pullToRefreshShowsProgressAndReportsFailures() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()

        viewModel.onAction(BrowseAction.Refresh)
        viewModel.onAction(BrowseAction.Refresh)
        advanceUntilIdle()
        assertTrue(viewModel.state.value.isRefreshing)
        assertEquals(1, tree.refreshes)

        tree.refreshResult.complete(ApiError.Unreachable)
        advanceUntilIdle()
        val state = viewModel.state.value
        assertFalse(state.isRefreshing)
        val message = BrowseMessage.Error(ApiError.Unreachable)
        assertEquals(message, state.message)

        viewModel.onAction(BrowseAction.MessageShown(message))
        advanceUntilIdle()
        assertNull(viewModel.state.value.message)
    }

    @Test
    fun backgroundSyncFailureShowsAMessage() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()

        viewModel.state.test {
            skipItems(1)
            tree.lastSyncError.value = ApiError.Unauthenticated
            val state = awaitItem()
            assertEquals(BrowseMessage.Error(ApiError.Unauthenticated), state.message)
            // Cached data stays.
            assertEquals(2, state.directories.size)
        }
    }

    @Test
    fun openingALinkRecordsAView() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)

        viewModel.onAction(BrowseAction.OpenLink(link(10, 1, 0)))
        advanceUntilIdle()

        assertEquals(listOf(10L), links.viewed)
        assertEquals(0, tree.refreshes)
        assertNull(viewModel.state.value.message)
    }

    @Test
    fun viewOfALinkDeletedElsewhereRefreshes() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        tree.refreshResult.complete(null)
        links.failure = ApiError.NotFound
        val viewModel = viewModel(ROOT_DIRECTORY_ID)

        viewModel.onAction(BrowseAction.OpenLink(link(10, 1, 0)))
        advanceUntilIdle()

        assertEquals(1, tree.refreshes)
        assertNull(viewModel.state.value.message)
    }

    @Test
    fun viewRejectedApiKeyOffersSettings() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        links.failure = ApiError.Unauthenticated
        val viewModel = viewModel(ROOT_DIRECTORY_ID)

        viewModel.onAction(BrowseAction.OpenLink(link(10, 1, 0)))
        advanceUntilIdle()

        assertEquals(BrowseMessage.Error(ApiError.Unauthenticated), viewModel.state.value.message)
    }
}
