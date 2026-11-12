package dev.ikana.miolink.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.ikana.miolink.appContainer
import dev.ikana.miolink.core.log.ErrorLogEntry
import dev.ikana.miolink.core.log.ErrorLogSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ErrorLogUiState(
    /** Newest first; null until the file has been read. */
    val entries: List<ErrorLogEntry>? = null,
    val isConfirmingClear: Boolean = false,
)

sealed interface ErrorLogAction {
    data object Clear : ErrorLogAction
    data object ConfirmClear : ErrorLogAction
    data object DismissClear : ErrorLogAction
}

class ErrorLogViewModel(private val log: ErrorLogSource) : ViewModel() {
    private val isConfirmingClear = MutableStateFlow(false)

    val state: StateFlow<ErrorLogUiState> = combine(log.entries, isConfirmingClear) { entries, confirming ->
        ErrorLogUiState(entries = entries, isConfirmingClear = confirming)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ErrorLogUiState())

    fun onAction(action: ErrorLogAction) {
        when (action) {
            ErrorLogAction.Clear -> isConfirmingClear.value = true
            ErrorLogAction.DismissClear -> isConfirmingClear.value = false
            ErrorLogAction.ConfirmClear -> {
                isConfirmingClear.update { false }
                viewModelScope.launch { log.clear() }
            }
        }
    }

    companion object {
        val Factory = viewModelFactory {
            initializer { ErrorLogViewModel(appContainer.errorLog) }
        }
    }
}
