package dev.ikana.miolink.browse

import dev.ikana.miolink.core.network.ApiError
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
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    /** Only the whole-tree flows search reads. */
    private class FakeTree : TreeSource {
        val directories = MutableStateFlow(
            listOf(
                DirectoryEntity(ROOT_DIRECTORY_ID, null, "", 0),
                DirectoryEntity(2, ROOT_DIRECTORY_ID, "Reading", 0),
            ),
        )
        val links = MutableStateFlow(
            listOf(LinkEntity(10, 2, "Compose layouts", "https://developer.android.com/compose", null, 0, 0)),
        )
        override val lastSyncError = MutableStateFlow<ApiError?>(null)
        override val revision: Flow<Long?> = MutableStateFlow(1L)

        override fun directory(id: Long): Flow<DirectoryEntity?> = emptyFlow()
        override fun childDirectories(parentId: Long): Flow<List<DirectoryEntity>> = emptyFlow()
        override fun links(directoryId: Long): Flow<List<LinkEntity>> = emptyFlow()
        override fun allDirectories(): Flow<List<DirectoryEntity>> = directories
        override fun allLinks(): Flow<List<LinkEntity>> = links
        override fun link(id: Long): Flow<LinkEntity?> = emptyFlow()
        override suspend fun subtreeCount(id: Long) = SubtreeCount(0, 0)
        override suspend fun refresh(): ApiError? = null
    }

    private val tree = FakeTree()

    private fun TestScope.viewModel(scopeId: Long = ROOT_DIRECTORY_ID): SearchViewModel {
        val viewModel = SearchViewModel(scopeId, tree)
        backgroundScope.launch { viewModel.state.collect {} }
        return viewModel
    }

    @Test
    fun resultsFollowTheQuery() = runTest(dispatcher) {
        val viewModel = viewModel()
        advanceUntilIdle()
        assertTrue(viewModel.state.value.results.isEmpty)

        viewModel.onQueryChange("compose")
        advanceUntilIdle()
        val state = viewModel.state.value
        assertEquals("compose", state.query)
        assertEquals(listOf(10L to "Reading"), state.results.links.map { it.item.id to it.location })

        viewModel.onQueryChange("")
        advanceUntilIdle()
        assertTrue(viewModel.state.value.results.isEmpty)
    }

    @Test
    fun resultsFollowTheCache() = runTest(dispatcher) {
        val viewModel = viewModel()
        viewModel.onQueryChange("read")
        advanceUntilIdle()
        assertEquals(listOf(2L), viewModel.state.value.results.directories.map { it.item.id })

        tree.directories.value = tree.directories.value.map { if (it.id == 2L) it.copy(name = "Later") else it }
        advanceUntilIdle()
        assertTrue(viewModel.state.value.results.isEmpty)
    }
}
