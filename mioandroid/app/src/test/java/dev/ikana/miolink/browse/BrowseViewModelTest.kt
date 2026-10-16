package dev.ikana.miolink.browse

import app.cash.turbine.test
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.directory.DirectoryNameError
import dev.ikana.miolink.directory.DirectoryRepository
import dev.ikana.miolink.directory.RejectedName
import dev.ikana.miolink.link.LinkRepository
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SubtreeCount
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

        override suspend fun subtreeCount(id: Long): SubtreeCount {
            val all = directories.value
            val ids = mutableSetOf(id)
            while (ids.addAll(all.filter { it.parentId in ids }.map { it.id })) Unit
            return SubtreeCount(ids.size - 1, allLinks.value.count { it.directoryId in ids })
        }

        override suspend fun refresh(): ApiError? {
            refreshes++
            return refreshResult.await().also { lastSyncError.value = it }
        }
    }

    private class FakeLinks : LinkRepository {
        val viewed = mutableListOf<Long>()
        val calls = mutableListOf<String>()
        var failure: ApiError? = null

        private fun call(description: String) {
            calls += description
            failure?.let { throw ApiException(it) }
        }

        override suspend fun create(directoryId: Long, url: String): Long {
            call("create $directoryId $url")
            return 77
        }

        override suspend fun updateTitle(id: Long, title: String) = call("update $id $title")

        override suspend fun move(id: Long, directoryId: Long) = call("move $id $directoryId")

        override suspend fun delete(id: Long) = call("delete $id")

        override suspend fun refreshMetadata(id: Long): Boolean {
            call("refresh $id")
            return true
        }

        override suspend fun recordView(id: Long): Long {
            viewed += id
            failure?.let { throw ApiException(it) }
            return 1
        }
    }

    /** Records calls; fails with [failure], or suspends on [gate] when set. */
    private class FakeDirectories : DirectoryRepository {
        val calls = mutableListOf<String>()
        var failure: ApiError? = null
        var gate: CompletableDeferred<Unit>? = null

        private suspend fun call(description: String) {
            calls += description
            gate?.await()
            failure?.let { throw ApiException(it) }
        }

        override suspend fun create(parentId: Long, name: String): Long {
            call("create $parentId $name")
            return 42
        }

        override suspend fun rename(id: Long, name: String) = call("rename $id $name")

        override suspend fun move(id: Long, newParentId: Long) = call("move $id $newParentId")

        override suspend fun delete(id: Long) = call("delete $id")
    }

    private val tree = FakeTree()
    private val links = FakeLinks()
    private val directories = FakeDirectories()

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
        val viewModel = BrowseViewModel(directoryId, tree, links, directories)
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

    // Directory writes.

    @Test
    fun createDirectoryClosesTheDialogAndOffersToOpenIt() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(2)
        viewModel.onAction(BrowseAction.ShowNewDirectory)
        advanceUntilIdle()
        assertEquals(BrowseDialog.NewDirectory(), viewModel.state.value.dialog)

        directories.gate = CompletableDeferred()
        viewModel.onAction(BrowseAction.CreateDirectory("Ideas"))
        advanceUntilIdle()
        assertTrue(viewModel.state.value.isSaving)
        // The dialog can't be dismissed while saving.
        viewModel.onAction(BrowseAction.DismissDialog)
        advanceUntilIdle()
        assertEquals(BrowseDialog.NewDirectory(), viewModel.state.value.dialog)

        directories.gate!!.complete(Unit)
        advanceUntilIdle()
        val state = viewModel.state.value
        assertEquals(listOf("create 2 Ideas"), directories.calls)
        assertNull(state.dialog)
        assertFalse(state.isSaving)
        assertEquals(BrowseMessage.DirectoryCreated(42, "Ideas"), state.message)
    }

    @Test
    fun invalidOrDuplicateNamesAreNotSent() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(2)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowNewDirectory)

        viewModel.onAction(BrowseAction.CreateDirectory("a/b"))
        advanceUntilIdle()
        assertEquals(
            BrowseDialog.NewDirectory(rejected = RejectedName("a/b", DirectoryNameError.ContainsSlash)),
            viewModel.state.value.dialog,
        )

        // Projects is already in Work.
        viewModel.onAction(BrowseAction.CreateDirectory("Projects"))
        advanceUntilIdle()
        assertEquals(
            BrowseDialog.NewDirectory(rejected = RejectedName("Projects", DirectoryNameError.Duplicate)),
            viewModel.state.value.dialog,
        )
        assertEquals(emptyList<String>(), directories.calls)
    }

    @Test
    fun alreadyExistsFromTheServerStaysUnderTheNameField() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        val work = sampleTree.single { it.id == 2L }
        viewModel.onAction(BrowseAction.ShowRenameDirectory(work))
        directories.failure = ApiError.AlreadyExists("name already exists")

        viewModel.onAction(BrowseAction.RenameDirectory(2, "Office"))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(
            BrowseDialog.RenameDirectory(work, rejected = RejectedName("Office", DirectoryNameError.Duplicate)),
            state.dialog,
        )
        assertFalse(state.isSaving)
        assertNull(state.message)
    }

    @Test
    fun unreachableServerKeepsTheDialogOpenToRetry() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        val home = sampleTree.single { it.id == 5L }
        viewModel.onAction(BrowseAction.ShowMoveDirectory(home))
        directories.failure = ApiError.Unreachable

        viewModel.onAction(BrowseAction.MoveDirectory(5, 2))
        advanceUntilIdle()

        assertEquals(BrowseDialog.MoveDirectory(home, failure = ApiError.Unreachable), viewModel.state.value.dialog)
    }

    @Test
    fun notFoundClosesTheDialogAndRefreshes() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        tree.refreshResult.complete(null)
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        val home = sampleTree.single { it.id == 5L }
        viewModel.onAction(BrowseAction.ShowRenameDirectory(home))
        directories.failure = ApiError.NotFound

        viewModel.onAction(BrowseAction.RenameDirectory(5, "House"))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertNull(state.dialog)
        assertEquals(BrowseMessage.DirectoryGone, state.message)
        assertEquals(1, tree.refreshes)
    }

    @Test
    fun rejectedApiKeyClosesTheDialogAndOffersSettings() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowNewDirectory)
        directories.failure = ApiError.Unauthenticated

        viewModel.onAction(BrowseAction.CreateDirectory("Ideas"))
        advanceUntilIdle()

        assertNull(viewModel.state.value.dialog)
        assertEquals(BrowseMessage.WriteError(ApiError.Unauthenticated), viewModel.state.value.message)
    }

    @Test
    fun deleteAsksWithTheSubtreeCountThenDeletes() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        tree.allLinks.value = listOf(link(10, 3, 0), link(11, 4, 0), link(12, 5, 0))
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        val work = sampleTree.single { it.id == 2L }

        viewModel.onAction(BrowseAction.ShowDeleteDirectory(work))
        advanceUntilIdle()
        assertEquals(
            BrowseDialog.DeleteDirectory(work, SubtreeCount(subdirectories = 2, links = 2)),
            viewModel.state.value.dialog,
        )

        viewModel.onAction(BrowseAction.DeleteDirectory(2))
        advanceUntilIdle()
        assertEquals(listOf("delete 2"), directories.calls)
        assertNull(viewModel.state.value.dialog)
        assertEquals(BrowseMessage.DirectoryDeleted("Work"), viewModel.state.value.message)
    }

    @Test
    fun moveReportsTheDestination() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(2)
        advanceUntilIdle()
        val projects = sampleTree.single { it.id == 3L }
        viewModel.onAction(BrowseAction.ShowMoveDirectory(projects))

        viewModel.onAction(BrowseAction.MoveDirectory(3, 5))
        advanceUntilIdle()

        assertEquals(listOf("move 3 5"), directories.calls)
        assertEquals(BrowseMessage.DirectoryMoved("Projects", "Home"), viewModel.state.value.message)
    }

    @Test
    fun dialogForADirectoryDeletedElsewhereCloses() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        viewModel.onAction(BrowseAction.ShowDirectoryActions(sampleTree.single { it.id == 5L }))
        advanceUntilIdle()
        assertTrue(viewModel.state.value.dialog is BrowseDialog.DirectoryActions)

        tree.directories.value = sampleTree.filter { it.id != 5L }
        advanceUntilIdle()

        assertNull(viewModel.state.value.dialog)
    }

    // Links.

    @Test
    fun createLinkClosesTheSheetAndOpensTheEditScreen() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(2)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowAddLink)

        viewModel.onAction(BrowseAction.CreateLink("https://example.com"))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(listOf("create 2 https://example.com"), links.calls)
        assertNull(state.dialog)
        assertEquals(77L, state.editLinkId)
        assertNull(state.message)

        viewModel.onAction(BrowseAction.LinkEditOpened)
        advanceUntilIdle()
        assertNull(viewModel.state.value.editLinkId)
    }

    @Test
    fun createLinkFailureStaysInTheSheet() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(2)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowAddLink)
        links.failure = ApiError.InvalidArgument("url must have a host")

        viewModel.onAction(BrowseAction.CreateLink("https://"))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(BrowseDialog.AddLink(failure = ApiError.InvalidArgument("url must have a host")), state.dialog)
        assertNull(state.editLinkId)
    }

    @Test
    fun moveLinkReportsTheDestination() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val link = link(10, ROOT_DIRECTORY_ID, 0)
        tree.allLinks.value = listOf(link)
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowMoveLink(link))

        viewModel.onAction(BrowseAction.MoveLink(10, 5))
        advanceUntilIdle()

        assertEquals(listOf("move 10 5"), links.calls)
        assertNull(viewModel.state.value.dialog)
        assertEquals(BrowseMessage.LinkMoved("t10", "Home"), viewModel.state.value.message)
    }

    @Test
    fun deleteLinkAsksThenDeletes() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val link = link(10, ROOT_DIRECTORY_ID, 0)
        tree.allLinks.value = listOf(link)
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()

        viewModel.onAction(BrowseAction.ShowDeleteLink(link))
        advanceUntilIdle()
        assertEquals(BrowseDialog.DeleteLink(link), viewModel.state.value.dialog)
        viewModel.onAction(BrowseAction.DeleteLink(10))
        advanceUntilIdle()

        assertEquals(listOf("delete 10"), links.calls)
        assertNull(viewModel.state.value.dialog)
        assertEquals(BrowseMessage.LinkDeleted("t10"), viewModel.state.value.message)
    }

    @Test
    fun linkWriteNotFoundRefreshesWithALinkMessage() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        tree.refreshResult.complete(null)
        val link = link(10, ROOT_DIRECTORY_ID, 0)
        tree.allLinks.value = listOf(link)
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        advanceUntilIdle()
        viewModel.onAction(BrowseAction.ShowDeleteLink(link))
        links.failure = ApiError.NotFound

        viewModel.onAction(BrowseAction.DeleteLink(10))
        advanceUntilIdle()

        assertNull(viewModel.state.value.dialog)
        assertEquals(BrowseMessage.LinkGone, viewModel.state.value.message)
        assertEquals(1, tree.refreshes)
    }

    @Test
    fun linkActionsForALinkDeletedElsewhereClose() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val link = link(10, ROOT_DIRECTORY_ID, 0)
        tree.allLinks.value = listOf(link)
        val viewModel = viewModel(ROOT_DIRECTORY_ID)
        viewModel.onAction(BrowseAction.ShowLinkActions(link))
        advanceUntilIdle()
        assertEquals(BrowseDialog.LinkActions(link), viewModel.state.value.dialog)

        tree.allLinks.value = emptyList()
        advanceUntilIdle()

        assertNull(viewModel.state.value.dialog)
    }

    @Test
    fun aMessageFromAnotherScreenIsShown() = runTest(dispatcher) {
        tree.directories.value = sampleTree
        val viewModel = viewModel(ROOT_DIRECTORY_ID)

        viewModel.onAction(BrowseAction.ShowText("Deleted “x”"))
        advanceUntilIdle()

        assertEquals(BrowseMessage.Text("Deleted “x”"), viewModel.state.value.message)
    }
}
