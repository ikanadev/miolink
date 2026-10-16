package dev.ikana.miolink

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import dev.ikana.miolink.browse.BrowseScreen
import dev.ikana.miolink.link.LinkEditScreen
import dev.ikana.miolink.navigation.Browse
import dev.ikana.miolink.navigation.LinkEdit
import dev.ikana.miolink.navigation.Settings
import dev.ikana.miolink.settings.SettingsScreen

/**
 * The app's navigation. Each screen owns its `Scaffold` (top bar, FAB,
 * insets); this only holds the back stack and maps route keys to screens.
 */
@Composable
fun MioLinkApp(modifier: Modifier = Modifier) {
    val backStack = rememberNavBackStack(Browse())
    val navigateUp: () -> Unit = { if (backStack.size > 1) backStack.removeLastOrNull() }

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = navigateUp,
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            // Scopes ViewModels to their entry; cleared when it's popped.
            rememberViewModelStoreNavEntryDecorator(),
        ),
        entryProvider = entryProvider {
            entry<Browse> { key ->
                BrowseScreen(
                    directoryId = key.directoryId,
                    onNavigateUp = navigateUp,
                    onOpenSettings = { backStack.add(Settings) },
                )
            }
            entry<LinkEdit> { key ->
                LinkEditScreen(linkId = key.linkId, onNavigateUp = navigateUp)
            }
            entry<Settings> {
                SettingsScreen(onNavigateUp = navigateUp)
            }
        },
    )
}
