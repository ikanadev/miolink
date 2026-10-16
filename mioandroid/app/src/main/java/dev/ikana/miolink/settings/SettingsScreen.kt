package dev.ikana.miolink.settings

import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.connectrpc.Code
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.core.ui.NavigateUpButton
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * Server URL and API key. [onNavigateUp] is null on first launch, when this
 * is the only screen; there's nothing to go back to until settings are saved.
 * [onSaved] runs once they're saved; by default it navigates up.
 */
@Composable
fun SettingsScreen(
    onNavigateUp: (() -> Unit)?,
    modifier: Modifier = Modifier,
    onSaved: () -> Unit = { onNavigateUp?.invoke() },
    viewModel: SettingsViewModel = viewModel(factory = SettingsViewModel.Factory),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    LaunchedEffect(state.isSaved) {
        // On first launch the app swaps this screen for Browse by itself.
        if (state.isSaved) onSaved()
    }
    SettingsContent(
        state = state,
        onAction = viewModel::onAction,
        onNavigateUp = onNavigateUp,
        modifier = modifier,
    )
}

@Composable
fun SettingsContent(
    state: SettingsUiState,
    onAction: (SettingsAction) -> Unit,
    onNavigateUp: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_title)) },
                navigationIcon = { if (onNavigateUp != null) NavigateUpButton(onNavigateUp) },
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .imePadding(),
            contentAlignment = Alignment.TopCenter,
        ) {
            if (state.isLoaded) {
                SettingsForm(
                    state = state,
                    onAction = onAction,
                    modifier = Modifier
                        .widthIn(max = 600.dp)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                )
            }
        }
    }
}

@Composable
private fun SettingsForm(
    state: SettingsUiState,
    onAction: (SettingsAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val focusManager = LocalFocusManager.current
    var showApiKey by rememberSaveable { mutableStateOf(false) }
    val busy = state.isSaving

    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(
            text = stringResource(
                if (state.isFirstRun) R.string.settings_welcome_title else R.string.settings_server_title,
            ),
            style = MaterialTheme.typography.headlineSmall,
        )
        Text(
            text = stringResource(
                if (state.isFirstRun) R.string.settings_welcome_message else R.string.settings_server_message,
            ),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        OutlinedTextField(
            value = state.baseUrl,
            onValueChange = { onAction(SettingsAction.BaseUrlChanged(it)) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !busy,
            label = { Text(stringResource(R.string.settings_base_url_label)) },
            placeholder = { Text(stringResource(R.string.settings_base_url_placeholder)) },
            supportingText = {
                Text(
                    stringResource(
                        when (state.baseUrlError) {
                            FieldError.Required -> R.string.settings_base_url_required
                            FieldError.InvalidUrl -> R.string.settings_base_url_invalid
                            null -> R.string.settings_base_url_supporting
                        },
                    ),
                )
            },
            isError = state.baseUrlError != null,
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                capitalization = KeyboardCapitalization.None,
                autoCorrectEnabled = false,
                keyboardType = KeyboardType.Uri,
                imeAction = ImeAction.Next,
            ),
            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
        )

        OutlinedTextField(
            value = state.apiKey,
            onValueChange = { onAction(SettingsAction.ApiKeyChanged(it)) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !busy,
            label = { Text(stringResource(R.string.settings_api_key_label)) },
            supportingText = {
                Text(
                    stringResource(
                        if (state.apiKeyError != null) {
                            R.string.settings_api_key_required
                        } else {
                            R.string.settings_api_key_supporting
                        },
                    ),
                )
            },
            isError = state.apiKeyError != null,
            singleLine = true,
            visualTransformation = if (showApiKey) {
                VisualTransformation.None
            } else {
                PasswordVisualTransformation()
            },
            trailingIcon = {
                IconButton(onClick = { showApiKey = !showApiKey }) {
                    Icon(
                        painter = painterResource(
                            if (showApiKey) R.drawable.ic_visibility_off else R.drawable.ic_visibility,
                        ),
                        contentDescription = stringResource(
                            if (showApiKey) R.string.settings_api_key_hide else R.string.settings_api_key_show,
                        ),
                    )
                }
            },
            keyboardOptions = KeyboardOptions(
                capitalization = KeyboardCapitalization.None,
                autoCorrectEnabled = false,
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(
                onDone = {
                    focusManager.clearFocus()
                    onAction(SettingsAction.Save)
                },
            ),
        )

        ConnectionResult(state.connection)

        AnimatedVisibility(visible = state.saveFailed) {
            Text(
                text = stringResource(R.string.settings_save_failed),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.End),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            val testing = state.connection == ConnectionStatus.Testing
            OutlinedButton(
                onClick = {
                    focusManager.clearFocus()
                    onAction(SettingsAction.TestConnection)
                },
                enabled = !busy && !testing,
            ) {
                if (testing) {
                    LoadingIndicator(modifier = Modifier.size(ButtonDefaults.IconSize))
                    Spacer(Modifier.size(ButtonDefaults.IconSpacing))
                }
                Text(stringResource(R.string.settings_test_connection))
            }
            Button(
                onClick = {
                    focusManager.clearFocus()
                    onAction(SettingsAction.Save)
                },
                enabled = !busy,
            ) {
                Text(
                    stringResource(
                        if (state.isFirstRun) R.string.settings_save_first_run else R.string.settings_save,
                    ),
                )
            }
        }
    }
}

/** The result of "Test connection", announced to accessibility services. */
@Composable
private fun ConnectionResult(status: ConnectionStatus) {
    val isResult = status is ConnectionStatus.Succeeded || status is ConnectionStatus.Failed
    // Keep showing the last result while it animates out.
    var lastResult by remember { mutableStateOf(status) }
    if (isResult) lastResult = status
    AnimatedVisibility(visible = isResult) {
        val succeeded = lastResult == ConnectionStatus.Succeeded
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .semantics { liveRegion = LiveRegionMode.Polite },
            shape = MaterialTheme.shapes.large,
            color = if (succeeded) {
                MaterialTheme.colorScheme.secondaryContainer
            } else {
                MaterialTheme.colorScheme.errorContainer
            },
            contentColor = if (succeeded) {
                MaterialTheme.colorScheme.onSecondaryContainer
            } else {
                MaterialTheme.colorScheme.onErrorContainer
            },
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    painter = painterResource(if (succeeded) R.drawable.ic_check_circle else R.drawable.ic_error),
                    contentDescription = null,
                )
                Text(
                    text = stringResource(
                        when (val result = lastResult) {
                            is ConnectionStatus.Failed -> result.error.connectionErrorMessage()
                            else -> R.string.settings_connection_ok
                        },
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }
}

@StringRes
private fun ApiError.connectionErrorMessage(): Int = when (this) {
    ApiError.Unreachable -> R.string.settings_connection_unreachable
    ApiError.Unauthenticated -> R.string.settings_connection_unauthenticated
    // A server without miolink's Health service answers 404, which Connect
    // reports as UNIMPLEMENTED (or NOT_FOUND from some proxies).
    ApiError.NotFound -> R.string.settings_connection_not_miolink
    is ApiError.Unknown -> if (code == Code.UNIMPLEMENTED) {
        R.string.settings_connection_not_miolink
    } else {
        R.string.settings_connection_failed
    }
    else -> R.string.settings_connection_failed
}

@Preview
@Composable
private fun SettingsFirstRunPreview() {
    MioLinkTheme(dynamicColor = false) {
        SettingsContent(
            state = SettingsUiState(isLoaded = true, isFirstRun = true),
            onAction = {},
            onNavigateUp = null,
        )
    }
}

@Preview
@Composable
private fun SettingsTestingPreview() {
    MioLinkTheme(dynamicColor = false) {
        SettingsContent(
            state = SettingsUiState(
                isLoaded = true,
                baseUrl = "https://links.example.com",
                apiKey = "secret",
                connection = ConnectionStatus.Testing,
            ),
            onAction = {},
            onNavigateUp = {},
        )
    }
}

@Preview
@Composable
private fun SettingsErrorsPreview() {
    MioLinkTheme(dynamicColor = false) {
        SettingsContent(
            state = SettingsUiState(
                isLoaded = true,
                baseUrl = "links.example.com",
                baseUrlError = FieldError.InvalidUrl,
                apiKeyError = FieldError.Required,
                connection = ConnectionStatus.Failed(ApiError.Unauthenticated),
            ),
            onAction = {},
            onNavigateUp = {},
        )
    }
}
