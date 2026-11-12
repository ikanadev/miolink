package dev.ikana.miolink.settings

import app.cash.turbine.test
import dev.ikana.miolink.core.log.ErrorLogEntry
import dev.ikana.miolink.core.log.ErrorLogSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
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

@OptIn(ExperimentalCoroutinesApi::class)
class ErrorLogViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private class FakeLog(entries: List<ErrorLogEntry>) : ErrorLogSource {
        override val entries = MutableStateFlow(entries)

        override suspend fun clear() {
            entries.value = emptyList()
        }
    }

    private val entry = ErrorLogEntry("2026-11-12 10:00:00.000 +0000", "Tag", "boom")

    @Test
    fun showsTheEntries() = runTest(dispatcher) {
        val viewModel = ErrorLogViewModel(FakeLog(listOf(entry)))
        viewModel.state.test {
            assertNull(awaitItem().entries)
            assertEquals(listOf(entry), awaitItem().entries)
        }
    }

    @Test
    fun clearAsksFirst() = runTest(dispatcher) {
        val viewModel = ErrorLogViewModel(FakeLog(listOf(entry)))
        viewModel.state.test {
            skipItems(2)

            viewModel.onAction(ErrorLogAction.Clear)
            assertTrue(awaitItem().isConfirmingClear)

            viewModel.onAction(ErrorLogAction.DismissClear)
            val dismissed = awaitItem()
            assertFalse(dismissed.isConfirmingClear)
            assertEquals(listOf(entry), dismissed.entries)

            viewModel.onAction(ErrorLogAction.Clear)
            skipItems(1)
            viewModel.onAction(ErrorLogAction.ConfirmClear)
            assertFalse(awaitItem().isConfirmingClear)
            assertEquals(emptyList<ErrorLogEntry>(), awaitItem().entries)
        }
    }

    @Test
    fun reportListsEntriesOldestFirstAfterTheVersions() {
        val older = ErrorLogEntry("2026-11-12 09:00:00.000 +0000", "Crash", "first")
        val report = errorLogReport("1.0 (2)", "Android 16 (API 36), Google Pixel", listOf(entry, older))
        assertEquals(
            "Mio Link 1.0 (2)\nAndroid 16 (API 36), Google Pixel\n\n" +
                "2026-11-12 09:00:00.000 +0000  Crash\nfirst\n\n" +
                "2026-11-12 10:00:00.000 +0000  Tag\nboom\n",
            report,
        )
    }
}
