package dev.ikana.miolink.settings

import app.cash.turbine.test
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.settings.ServerSettings
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
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

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsViewModelTest {
    private val dispatcher = StandardTestDispatcher()

    @Before
    fun setUp() = Dispatchers.setMain(dispatcher)

    @After
    fun tearDown() = Dispatchers.resetMain()

    private class FakeRepository(saved: ServerSettings? = null) : SettingsRepository {
        override val settings = MutableStateFlow(saved)
        var tested: ServerSettings? = null
        var pingResult = CompletableDeferred<ApiError?>()

        override suspend fun save(settings: ServerSettings) {
            this.settings.value = settings
        }

        override suspend fun testConnection(settings: ServerSettings): ApiError? {
            tested = settings
            return pingResult.await()
        }
    }

    @Test
    fun firstRunStartsEmpty() = runTest(dispatcher) {
        val viewModel = SettingsViewModel(FakeRepository())
        advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state.isLoaded)
        assertTrue(state.isFirstRun)
        assertEquals("", state.baseUrl)
    }

    @Test
    fun loadsSavedSettings() = runTest(dispatcher) {
        val viewModel = SettingsViewModel(FakeRepository(ServerSettings("https://a.example.com", "key")))
        advanceUntilIdle()

        val state = viewModel.state.value
        assertFalse(state.isFirstRun)
        assertEquals("https://a.example.com", state.baseUrl)
        assertEquals("key", state.apiKey)
    }

    @Test
    fun invalidFieldsShowErrorsAndDontSave() = runTest(dispatcher) {
        val repository = FakeRepository()
        val viewModel = SettingsViewModel(repository)
        advanceUntilIdle()

        viewModel.onAction(SettingsAction.BaseUrlChanged("links.example.com"))
        viewModel.onAction(SettingsAction.Save)
        advanceUntilIdle()

        val state = viewModel.state.value
        assertEquals(FieldError.InvalidUrl, state.baseUrlError)
        assertEquals(FieldError.Required, state.apiKeyError)
        assertFalse(state.isSaved)
        assertNull(repository.settings.value)
    }

    @Test
    fun saveStoresNormalizedSettings() = runTest(dispatcher) {
        val repository = FakeRepository()
        val viewModel = SettingsViewModel(repository)
        advanceUntilIdle()

        viewModel.onAction(SettingsAction.BaseUrlChanged(" https://a.example.com/ "))
        viewModel.onAction(SettingsAction.ApiKeyChanged("key "))
        viewModel.onAction(SettingsAction.Save)
        advanceUntilIdle()

        assertEquals(ServerSettings("https://a.example.com", "key"), repository.settings.value)
        assertTrue(viewModel.state.value.isSaved)
    }

    @Test
    fun testConnectionReportsProgressAndResult() = runTest(dispatcher) {
        val repository = FakeRepository()
        val viewModel = SettingsViewModel(repository)
        advanceUntilIdle()
        viewModel.onAction(SettingsAction.BaseUrlChanged("https://a.example.com"))
        viewModel.onAction(SettingsAction.ApiKeyChanged("key"))

        viewModel.state.test {
            assertEquals(ConnectionStatus.Idle, awaitItem().connection)

            viewModel.onAction(SettingsAction.TestConnection)
            assertEquals(ConnectionStatus.Testing, expectMostRecentItem().connection)

            repository.pingResult.complete(ApiError.Unauthenticated)
            assertEquals(ConnectionStatus.Failed(ApiError.Unauthenticated), awaitItem().connection)
        }
        assertEquals(ServerSettings("https://a.example.com", "key"), repository.tested)
        // Nothing is saved by a test.
        assertNull(repository.settings.value)
    }

    @Test
    fun editingClearsTheTestResult() = runTest(dispatcher) {
        val repository = FakeRepository()
        repository.pingResult.complete(null)
        val viewModel = SettingsViewModel(repository)
        advanceUntilIdle()
        viewModel.onAction(SettingsAction.BaseUrlChanged("https://a.example.com"))
        viewModel.onAction(SettingsAction.ApiKeyChanged("key"))
        viewModel.onAction(SettingsAction.TestConnection)
        advanceUntilIdle()
        assertEquals(ConnectionStatus.Succeeded, viewModel.state.value.connection)

        viewModel.onAction(SettingsAction.ApiKeyChanged("other"))

        assertEquals(ConnectionStatus.Idle, viewModel.state.value.connection)
    }
}
