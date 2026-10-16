package dev.ikana.miolink

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import dev.ikana.miolink.link.LinkEditScreen
import dev.ikana.miolink.link.ShareLinkScreen
import dev.ikana.miolink.navigation.LinkEdit
import dev.ikana.miolink.navigation.Settings
import dev.ikana.miolink.navigation.ShareLink
import dev.ikana.miolink.settings.SettingsScreen

/**
 * The share flow inside [ShareActivity], with its own back stack:
 *
 * - [ShareLink]: the add-link sheet over the sharing app, prefilled with
 *   [url] and saving in the root unless the user picks another directory.
 *   Cancelling it ends the flow.
 * - [Settings] first when [isConfigured] is false (back ends the flow,
 *   saving continues to the sheet), or over the sheet when the server
 *   rejects the API key.
 * - [LinkEdit] replaces the sheet once the link is created. Leaving it ends
 *   the flow, so back returns to the app that shared rather than into Mio
 *   Link; its message, or "Saved", shows as a toast.
 *
 * [onFinish] ends the activity, with a message to toast.
 */
@Composable
fun ShareApp(
    url: String,
    isConfigured: Boolean,
    onFinish: (message: String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    val backStack = rememberNavBackStack(if (isConfigured) ShareLink(url) else Settings)
    val saved = stringResource(R.string.share_saved)
    val finish: () -> Unit = { onFinish(saved.takeIf { backStack.lastOrNull() is LinkEdit }) }
    val back: () -> Unit = { if (backStack.size > 1) backStack.removeLastOrNull() else finish() }

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = back,
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator(),
        ),
        entryProvider = entryProvider {
            entry<ShareLink> { key ->
                val ifOnTop: (() -> Unit) -> Unit = { if (backStack.lastOrNull() == key) it() }
                ShareLinkScreen(
                    url = key.url,
                    onCreated = { id -> ifOnTop { backStack.replaceAll(LinkEdit(id)) } },
                    onDismiss = { ifOnTop { onFinish(null) } },
                    onOpenSettings = { ifOnTop { backStack.add(Settings) } },
                )
            }
            entry<LinkEdit> { key ->
                val ifOnTop: (() -> Unit) -> Unit = { if (backStack.lastOrNull() == key) it() }
                LinkEditScreen(
                    linkId = key.linkId,
                    onClose = { message -> ifOnTop { onFinish(message ?: saved) } },
                    onOpenSettings = { ifOnTop { backStack.add(Settings) } },
                )
            }
            entry<Settings> {
                SettingsScreen(
                    onNavigateUp = back,
                    onSaved = {
                        // First run: continue with the share. Otherwise return
                        // to the screen that asked for Settings.
                        if (backStack.size > 1) backStack.removeLastOrNull() else backStack.replaceAll(ShareLink(url))
                    },
                )
            }
        },
    )
}

/** Makes [key] the only entry. */
private fun MutableList<NavKey>.replaceAll(key: NavKey) {
    this[lastIndex] = key
    while (size > 1) removeAt(0)
}
