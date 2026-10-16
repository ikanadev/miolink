package dev.ikana.miolink.link

import app.cash.turbine.test
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SubtreeCount
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.UnconfinedTestDispatcher
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
class ShareLinkViewModelTest {
    @Before
    fun setUp() = Dispatchers.setMain(UnconfinedTestDispatcher())

    @After
    fun tearDown() = Dispatchers.resetMain()

    private class FakeTree(cached: Boolean = true) : TreeSource {
        val directories = MutableStateFlow(
            if (cached) listOf(DirectoryEntity(1, null, "", 0), DirectoryEntity(2, 1, "Work", 0)) else emptyList(),
        )
        override val lastSyncError = MutableStateFlow<ApiError?>(null)
        override val revision = MutableStateFlow(if (cached) 7L else null)
        var refreshes = 0

        override fun directory(id: Long): Flow<DirectoryEntity?> =
            directories.map { all -> all.firstOrNull { it.id == id } }

        override fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>> = emptyFlow()

        override fun links(directoryId: Long): Flow<List<LinkEntity>> = emptyFlow()

        override fun allDirectories(): Flow<List<DirectoryEntity>> = directories

        override fun link(id: Long): Flow<LinkEntity?> = flowOf(null)

        override suspend fun subtreeCount(id: Long) = SubtreeCount(0, 0)

        override suspend fun refresh(): ApiError? {
            refreshes++
            return null
        }
    }

    private class FakeLinks : LinkRepository {
        val calls = mutableListOf<String>()
        var failure: ApiError? = null

        override suspend fun create(directoryId: Long, url: String): Long {
            calls += "create $directoryId $url"
            failure?.let { throw ApiException(it) }
            return 42
        }

        override suspend fun updateTitle(id: Long, title: String) = Unit
        override suspend fun move(id: Long, directoryId: Long) = Unit
        override suspend fun delete(id: Long) = Unit
        override suspend fun refreshMetadata(id: Long) = false
        override suspend fun recordView(id: Long) = 0L
    }

    private val links = FakeLinks()

    @Test
    fun startsInTheRootWithTheSharedUrl() = runTest {
        val viewModel = ShareLinkViewModel("https://example.com", FakeTree(), links)

        viewModel.state.test {
            val state = awaitItem()
            assertEquals("https://example.com", state.url)
            assertEquals(ROOT_DIRECTORY_ID, state.directoryId)
            assertEquals(2, state.allDirectories.size)
        }
    }

    @Test
    fun refreshesOnlyWhenNothingIsCached() = runTest {
        val cached = FakeTree()
        ShareLinkViewModel("https://example.com", cached, links)
        assertEquals(0, cached.refreshes)

        val empty = FakeTree(cached = false)
        ShareLinkViewModel("https://example.com", empty, links)
        assertEquals(1, empty.refreshes)
    }

    @Test
    fun savesInTheChosenDirectory() = runTest {
        val viewModel = ShareLinkViewModel("https://example.com", FakeTree(), links)

        viewModel.state.test {
            awaitItem()
            viewModel.onAction(ShareLinkAction.ChangeDirectory(2))
            assertEquals(2L, awaitItem().directoryId)
            viewModel.onAction(ShareLinkAction.Save("https://example.com/edited"))

            assertEquals(42L, expectMostRecentItem().createdLinkId)
            assertEquals(listOf("create 2 https://example.com/edited"), links.calls)
        }
    }

    @Test
    fun keepsTheSheetWithTheFailureToRetry() = runTest {
        links.failure = ApiError.Unreachable
        val viewModel = ShareLinkViewModel("https://example.com", FakeTree(), links)

        viewModel.state.test {
            awaitItem()
            viewModel.onAction(ShareLinkAction.Save("https://example.com"))

            val state = expectMostRecentItem()
            assertEquals(ApiError.Unreachable, state.failure)
            assertFalse(state.isSaving)
            assertNull(state.createdLinkId)
        }
    }

    @Test
    fun deletedDirectoryRefreshesAndFallsBackToTheRoot() = runTest {
        val tree = FakeTree()
        val viewModel = ShareLinkViewModel("https://example.com", tree, links)

        viewModel.state.test {
            awaitItem()
            viewModel.onAction(ShareLinkAction.ChangeDirectory(2))
            links.failure = ApiError.NotFound
            viewModel.onAction(ShareLinkAction.Save("https://example.com"))

            val state = expectMostRecentItem()
            assertEquals(ROOT_DIRECTORY_ID, state.directoryId)
            assertEquals(ApiError.NotFound, state.failure)
            assertEquals(1, tree.refreshes)
        }
    }

    @Test
    fun directoryDeletedBySyncFallsBackToTheRoot() = runTest {
        val tree = FakeTree()
        val viewModel = ShareLinkViewModel("https://example.com", tree, links)

        viewModel.state.test {
            awaitItem()
            viewModel.onAction(ShareLinkAction.ChangeDirectory(2))
            assertEquals(2L, awaitItem().directoryId)
            tree.directories.value = tree.directories.value.filter { it.id != 2L }

            assertEquals(ROOT_DIRECTORY_ID, expectMostRecentItem().directoryId)
        }
    }

    @Test
    fun rejectedApiKeyAsksForSettings() = runTest {
        links.failure = ApiError.Unauthenticated
        val viewModel = ShareLinkViewModel("https://example.com", FakeTree(), links)

        viewModel.state.test {
            awaitItem()
            viewModel.onAction(ShareLinkAction.Save("https://example.com"))
            assertTrue(expectMostRecentItem().needsSettings)

            viewModel.onAction(ShareLinkAction.SettingsOpened)
            assertFalse(awaitItem().needsSettings)
        }
    }
}
