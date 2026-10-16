package dev.ikana.miolink.link

import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
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
class LinkEditViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private class FakeTree : TreeSource {
        val directories = MutableStateFlow(
            listOf(
                DirectoryEntity(1, null, "", 0),
                DirectoryEntity(2, 1, "Work", 0),
                DirectoryEntity(3, 2, "Reading", 0),
            ),
        )
        val links = MutableStateFlow(listOf(LinkEntity(10, 3, "Example", "https://example.com", null, 2, 0)))
        override val lastSyncError = MutableStateFlow<ApiError?>(null)
        override val revision = MutableStateFlow<Long?>(7)
        var refreshes = 0

        override fun directory(id: Long): Flow<DirectoryEntity?> =
            directories.map { all -> all.firstOrNull { it.id == id } }

        override fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>> =
            directories.map { all -> all.filter { it.parentId == parentId } }

        override fun links(directoryId: Long): Flow<List<LinkEntity>> =
            links.map { all -> all.filter { it.directoryId == directoryId } }

        override fun allDirectories(): Flow<List<DirectoryEntity>> = directories

        override fun link(id: Long): Flow<LinkEntity?> = links.map { all -> all.firstOrNull { it.id == id } }

        override suspend fun subtreeCount(id: Long) = SubtreeCount(0, 0)

        override suspend fun refresh(): ApiError? {
            refreshes++
            return null
        }
    }

    /** Applies writes to [tree] like the real repository; fails with [failure]. */
    private class FakeLinks(private val tree: FakeTree) : LinkRepository {
        val calls = mutableListOf<String>()
        var failure: ApiError? = null
        var gate: CompletableDeferred<Unit>? = null

        private suspend fun call(description: String) {
            calls += description
            gate?.await()
            failure?.let { throw ApiException(it) }
        }

        private fun change(id: Long, block: (LinkEntity) -> LinkEntity?) {
            tree.links.value = tree.links.value.mapNotNull { if (it.id == id) block(it) else it }
        }

        override suspend fun create(directoryId: Long, url: String): Long {
            call("create $directoryId $url")
            return 99
        }

        override suspend fun updateTitle(id: Long, title: String) {
            call("update $id $title")
            change(id) { it.copy(title = title.trim()) }
        }

        override suspend fun move(id: Long, directoryId: Long) {
            call("move $id $directoryId")
            change(id) { it.copy(directoryId = directoryId) }
        }

        override suspend fun delete(id: Long) {
            call("delete $id")
            change(id) { null }
        }

        override suspend fun refreshMetadata(id: Long): Boolean {
            call("refresh $id")
            change(id) { it.copy(title = "Fetched") }
            return true
        }

        override suspend fun recordView(id: Long): Long = 0
    }

    private val tree = FakeTree()
    private val links = FakeLinks(tree)

    private fun TestScope.viewModel(): LinkEditViewModel {
        val viewModel = LinkEditViewModel(10, tree, links)
        backgroundScope.launch { viewModel.state.collect {} }
        advanceUntilIdle()
        return viewModel
    }

    @Test
    fun showsTheLinkAndItsPath() = runTest(dispatcher) {
        val viewModel = viewModel()

        val state = viewModel.state.value
        assertEquals("Example", state.title)
        assertEquals(listOf(1L, 2L, 3L), state.directoryPath.map { it.id })
        assertFalse(state.hasChanges)
        assertFalse(state.canSave)
    }

    @Test
    fun anUnchangedTitleIsNotSaved() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.Save)
        // Only surrounding spaces differ.
        viewModel.onAction(LinkEditAction.TitleChanged(" Example  "))
        advanceUntilIdle()
        assertFalse(viewModel.state.value.hasChanges)
        viewModel.onAction(LinkEditAction.Save)
        advanceUntilIdle()

        assertEquals(emptyList<String>(), links.calls)
        assertNull(viewModel.state.value.exit)
    }

    @Test
    fun aChangedTitleIsSavedTrimmedThenTheScreenCloses() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.TitleChanged("  Better title "))
        advanceUntilIdle()
        assertTrue(viewModel.state.value.canSave)
        viewModel.onAction(LinkEditAction.Save)
        advanceUntilIdle()

        assertEquals(listOf("update 10 Better title"), links.calls)
        assertEquals(LinkEditExit.Saved, viewModel.state.value.exit)
    }

    @Test
    fun aBlankTitleIsNotSent() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.TitleChanged("   "))
        advanceUntilIdle()
        assertEquals(LinkTitleError.Empty, viewModel.state.value.titleError)
        assertFalse(viewModel.state.value.canSave)
        viewModel.onAction(LinkEditAction.Save)
        advanceUntilIdle()

        assertEquals(emptyList<String>(), links.calls)
    }

    @Test
    fun aRejectedTitleShowsUnderTheFieldUntilItChanges() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.failure = ApiError.InvalidArgument("title must be at most 500 characters")

        viewModel.onAction(LinkEditAction.TitleChanged("New"))
        viewModel.onAction(LinkEditAction.Save)
        advanceUntilIdle()
        assertEquals(
            LinkTitleError.Rejected("title must be at most 500 characters"),
            viewModel.state.value.titleError,
        )
        assertNull(viewModel.state.value.exit)

        viewModel.onAction(LinkEditAction.TitleChanged("Newer"))
        advanceUntilIdle()
        assertNull(viewModel.state.value.titleError)
    }

    @Test
    fun anUnreachableServerKeepsTheEditAndOffersRetry() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.failure = ApiError.Unreachable

        viewModel.onAction(LinkEditAction.TitleChanged("New"))
        viewModel.onAction(LinkEditAction.Save)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(LinkEditMessage.SaveFailed(ApiError.Unreachable), state.message)
        assertEquals("New", state.title)
        assertTrue(state.canSave)
    }

    @Test
    fun aLinkDeletedElsewhereClosesTheScreen() = runTest(dispatcher) {
        val viewModel = viewModel()
        assertNull(viewModel.state.value.exit)

        tree.links.value = emptyList()
        advanceUntilIdle()

        assertEquals(LinkEditExit.Gone, viewModel.state.value.exit)
    }

    @Test
    fun nothingIsGoneBeforeTheCacheLoads() = runTest(dispatcher) {
        tree.revision.value = null
        tree.links.value = emptyList()
        val viewModel = viewModel()

        assertTrue(viewModel.state.value.isLoading)
        assertNull(viewModel.state.value.exit)
    }

    @Test
    fun closingWithChangesAsksFirst() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.TitleChanged("New"))
        viewModel.onAction(LinkEditAction.Close)
        advanceUntilIdle()
        assertEquals(LinkEditDialog.DiscardChanges, viewModel.state.value.dialog)
        assertNull(viewModel.state.value.exit)

        viewModel.onAction(LinkEditAction.ConfirmDiscard)
        advanceUntilIdle()
        assertEquals(LinkEditExit.Discarded, viewModel.state.value.exit)
        assertEquals(emptyList<String>(), links.calls)
    }

    @Test
    fun closingWithoutChangesLeavesAtOnce() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.Close)
        advanceUntilIdle()

        assertEquals(LinkEditExit.Discarded, viewModel.state.value.exit)
    }

    @Test
    fun deletingClosesTheScreenAsDeletedNotGone() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.gate = CompletableDeferred()

        viewModel.onAction(LinkEditAction.ShowDelete)
        viewModel.onAction(LinkEditAction.ConfirmDelete)
        advanceUntilIdle()
        assertEquals(LinkEditOperation.Delete, viewModel.state.value.pending)
        // The dialog can't be dismissed while deleting.
        viewModel.onAction(LinkEditAction.DismissDialog)
        advanceUntilIdle()
        assertEquals(LinkEditDialog.Delete(), viewModel.state.value.dialog)

        links.gate!!.complete(Unit)
        advanceUntilIdle()
        assertEquals(listOf("delete 10"), links.calls)
        assertEquals(LinkEditExit.Deleted("Example"), viewModel.state.value.exit)
    }

    @Test
    fun moveClosesThePickerWithAMessage() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.ShowMove)
        viewModel.onAction(LinkEditAction.MoveTo(2))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(listOf("move 10 2"), links.calls)
        assertNull(state.dialog)
        assertEquals(LinkEditMessage.Moved("Work"), state.message)
        assertEquals(listOf(1L, 2L), state.directoryPath.map { it.id })
    }

    @Test
    fun moveFailureStaysInThePicker() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.failure = ApiError.Unreachable

        viewModel.onAction(LinkEditAction.ShowMove)
        viewModel.onAction(LinkEditAction.MoveTo(2))
        advanceUntilIdle()

        assertEquals(LinkEditDialog.Move(ApiError.Unreachable), viewModel.state.value.dialog)
    }

    @Test
    fun moveToADirectoryDeletedElsewhereRefreshes() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.failure = ApiError.NotFound

        viewModel.onAction(LinkEditAction.ShowMove)
        viewModel.onAction(LinkEditAction.MoveTo(2))
        advanceUntilIdle()

        assertEquals(1, tree.refreshes)
        assertNull(viewModel.state.value.dialog)
        assertEquals(LinkEditMessage.DirectoryGone, viewModel.state.value.message)
    }

    @Test
    fun refreshMetadataReplacesAnEditedTitle() = runTest(dispatcher) {
        val viewModel = viewModel()

        viewModel.onAction(LinkEditAction.TitleChanged("Mine"))
        viewModel.onAction(LinkEditAction.RefreshMetadata)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(listOf("refresh 10"), links.calls)
        assertEquals("Fetched", state.title)
        assertFalse(state.hasChanges)
        assertEquals(LinkEditMessage.MetadataRefreshed(changed = true), state.message)
    }

    @Test
    fun aRejectedApiKeyOffersSettings() = runTest(dispatcher) {
        val viewModel = viewModel()
        links.failure = ApiError.Unauthenticated

        viewModel.onAction(LinkEditAction.ShowDelete)
        viewModel.onAction(LinkEditAction.ConfirmDelete)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertNull(state.dialog)
        assertNull(state.exit)
        assertEquals(LinkEditMessage.WriteError(ApiError.Unauthenticated), state.message)
    }
}
