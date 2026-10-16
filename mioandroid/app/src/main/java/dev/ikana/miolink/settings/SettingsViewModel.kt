package dev.ikana.miolink.settings

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.ikana.miolink.appContainer
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.settings.ServerSettings
import dev.ikana.miolink.core.settings.normalizeBaseUrl
import java.io.IOException
import java.security.GeneralSecurityException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class FieldError { Required, InvalidUrl }

sealed interface ConnectionStatus {
    data object Idle : ConnectionStatus
    data object Testing : ConnectionStatus
    data object Succeeded : ConnectionStatus
    data class Failed(val error: ApiError) : ConnectionStatus
}

data class SettingsUiState(
    /** False until the saved settings have been read into the fields. */
    val isLoaded: Boolean = false,
    /** Nothing is saved yet: the app can't do anything until the user saves. */
    val isFirstRun: Boolean = false,
    val baseUrl: String = "",
    val apiKey: String = "",
    val baseUrlError: FieldError? = null,
    val apiKeyError: FieldError? = null,
    val connection: ConnectionStatus = ConnectionStatus.Idle,
    val isSaving: Boolean = false,
    /** The last save failed (storage or Keystore error). */
    val saveFailed: Boolean = false,
    /** Set once the settings were saved; the screen leaves. */
    val isSaved: Boolean = false,
)

sealed interface SettingsAction {
    data class BaseUrlChanged(val value: String) : SettingsAction
    data class ApiKeyChanged(val value: String) : SettingsAction
    data object TestConnection : SettingsAction
    data object Save : SettingsAction
}

class SettingsViewModel(private val repository: SettingsRepository) : ViewModel() {
    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    private var testJob: Job? = null

    init {
        viewModelScope.launch {
            val saved = repository.settings.first()
            _state.update {
                it.copy(
                    isLoaded = true,
                    isFirstRun = saved == null,
                    baseUrl = saved?.baseUrl ?: it.baseUrl,
                    apiKey = saved?.apiKey ?: it.apiKey,
                )
            }
        }
    }

    fun onAction(action: SettingsAction) {
        when (action) {
            is SettingsAction.BaseUrlChanged -> edit { it.copy(baseUrl = action.value, baseUrlError = null) }
            is SettingsAction.ApiKeyChanged -> edit { it.copy(apiKey = action.value, apiKeyError = null) }
            SettingsAction.TestConnection -> testConnection()
            SettingsAction.Save -> save()
        }
    }

    /** A field changed: a previous test result no longer applies. */
    private fun edit(change: (SettingsUiState) -> SettingsUiState) {
        testJob?.cancel()
        _state.update { change(it).copy(connection = ConnectionStatus.Idle) }
    }

    private fun testConnection() {
        val settings = validated() ?: return
        testJob?.cancel()
        _state.update { it.copy(connection = ConnectionStatus.Testing) }
        testJob = viewModelScope.launch {
            val error = repository.testConnection(settings)
            _state.update {
                it.copy(
                    connection = if (error == null) {
                        ConnectionStatus.Succeeded
                    } else {
                        ConnectionStatus.Failed(error)
                    },
                )
            }
        }
    }

    private fun save() {
        if (_state.value.isSaving) return
        val settings = validated() ?: return
        _state.update { it.copy(isSaving = true, saveFailed = false) }
        viewModelScope.launch {
            val saved = try {
                repository.save(settings)
                true
            } catch (e: IOException) {
                Log.w(TAG, "Couldn't save settings", e)
                false
            } catch (e: GeneralSecurityException) {
                Log.w(TAG, "Couldn't encrypt the API key", e)
                false
            }
            _state.update { it.copy(isSaving = false, isSaved = saved, saveFailed = !saved) }
        }
    }

    /** The fields as [ServerSettings], or null after setting field errors. */
    private fun validated(): ServerSettings? {
        val current = _state.value
        val baseUrl = normalizeBaseUrl(current.baseUrl)
        val apiKey = current.apiKey.trim()
        val baseUrlError = when {
            current.baseUrl.isBlank() -> FieldError.Required
            baseUrl == null -> FieldError.InvalidUrl
            else -> null
        }
        val apiKeyError = if (apiKey.isEmpty()) FieldError.Required else null
        _state.update { it.copy(baseUrlError = baseUrlError, apiKeyError = apiKeyError) }
        if (baseUrl == null || apiKeyError != null) return null
        // Show the normalized URL, so the user sees what's stored.
        _state.update { it.copy(baseUrl = baseUrl, apiKey = apiKey) }
        return ServerSettings(baseUrl = baseUrl, apiKey = apiKey)
    }

    companion object {
        private const val TAG = "SettingsViewModel"

        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer { SettingsViewModel(appContainer.settingsRepository) }
        }
    }
}
