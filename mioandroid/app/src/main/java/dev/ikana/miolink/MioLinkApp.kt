package dev.ikana.miolink

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.IntOffset
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.NavKey
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
 *
 * Until server settings are saved ([isConfigured] false) the app opens
 * [Settings] alone, without a back arrow; saving them swaps it for [Browse].
 */
@Composable
fun MioLinkApp(isConfigured: Boolean, modifier: Modifier = Modifier) {
    val backStack = rememberNavBackStack(if (isConfigured) Browse() else Settings)
    val navigateUp: () -> Unit = { if (backStack.size > 1) backStack.removeLastOrNull() }
    // A message a closing screen leaves for the Browse entry below it.
    var pendingMessage by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(isConfigured) {
        if (isConfigured && backStack.toList() == listOf(Settings)) backStack[0] = Browse()
    }

    // Shared-axis X, with the theme's expressive springs.
    val spatial = MaterialTheme.motionScheme.defaultSpatialSpec<IntOffset>()
    val effects = MaterialTheme.motionScheme.defaultEffectsSpec<Float>()
    val forward = {
        (slideInHorizontally(spatial) { it / SLIDE_DIVISOR } + fadeIn(effects)) togetherWith
            (slideOutHorizontally(spatial) { -it / SLIDE_DIVISOR } + fadeOut(effects))
    }
    val backward = {
        (slideInHorizontally(spatial) { -it / SLIDE_DIVISOR } + fadeIn(effects)) togetherWith
            (slideOutHorizontally(spatial) { it / SLIDE_DIVISOR } + fadeOut(effects))
    }

    NavDisplay(
        backStack = backStack,
        modifier = modifier,
        onBack = navigateUp,
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            // Scopes ViewModels to their entry; cleared when it's popped.
            rememberViewModelStoreNavEntryDecorator(),
        ),
        transitionSpec = { forward() },
        popTransitionSpec = { backward() },
        entryProvider = entryProvider {
            entry<Browse> { key ->
                // Only the entry on top acts, so a double tap or an entry
                // still animating out can't navigate twice.
                val ifOnTop: (() -> Unit) -> Unit = { if (backStack.lastOrNull() == key) it() }
                BrowseScreen(
                    directoryId = key.directoryId,
                    onOpenDirectory = { id -> ifOnTop { backStack.add(Browse(id)) } },
                    onNavigateTo = { id -> ifOnTop { backStack.showDirectory(id) } },
                    onNavigateUp = { ifOnTop(navigateUp) },
                    onOpenSettings = { ifOnTop { backStack.add(Settings) } },
                    onEditLink = { id -> ifOnTop { backStack.add(LinkEdit(id)) } },
                    incomingMessage = pendingMessage.takeIf { backStack.lastOrNull() == key },
                    onIncomingMessageShown = { pendingMessage = null },
                )
            }
            entry<LinkEdit> { key ->
                val ifOnTop: (() -> Unit) -> Unit = { if (backStack.lastOrNull() == key) it() }
                LinkEditScreen(
                    linkId = key.linkId,
                    onClose = { message ->
                        ifOnTop {
                            pendingMessage = message
                            navigateUp()
                        }
                    },
                    onOpenSettings = { ifOnTop { backStack.add(Settings) } },
                )
            }
            entry<Settings> {
                SettingsScreen(onNavigateUp = navigateUp.takeIf { backStack.size > 1 })
            }
        },
    )
}

/** Entering slides in a quarter of the width; the rest is the fade. */
private const val SLIDE_DIVISOR = 4

/**
 * Replaces the top entry with directory [id]: pops back to it when it's
 * already below (a breadcrumb or an ancestor), otherwise swaps it in.
 */
private fun MutableList<NavKey>.showDirectory(id: Long) {
    val target = Browse(id)
    val index = subList(0, lastIndex).indexOfLast { it == target }
    if (index >= 0) {
        while (size > index + 1) removeAt(lastIndex)
    } else {
        this[lastIndex] = target
    }
}
