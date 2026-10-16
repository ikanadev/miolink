package dev.ikana.miolink

import android.app.Application
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewmodel.CreationExtras
import coil3.ImageLoader
import coil3.PlatformContext
import coil3.SingletonImageLoader

open class MioLinkApplication : Application(), SingletonImageLoader.Factory {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = createContainer()
        // Refresh the cached tree each time the app comes to the foreground.
        container.treeRepository.syncWhileStarted(
            ProcessLifecycleOwner.get().lifecycle,
            container.serverSettings,
        )
    }

    /** Builds the [AppContainer]; Robolectric tests override it (no Android Keystore there). */
    protected open fun createContainer(): AppContainer = AppContainer(this)

    /** Coil's `AsyncImage` uses the container's loader, which shares OkHttp. */
    override fun newImageLoader(context: PlatformContext): ImageLoader = container.imageLoader
}

/**
 * The [AppContainer], for use inside a ViewModel factory:
 *
 * ```
 * val Factory = viewModelFactory {
 *     initializer { MyViewModel(appContainer.someRepository) }
 * }
 * ```
 */
val CreationExtras.appContainer: AppContainer
    get() = (checkNotNull(this[APPLICATION_KEY]) as MioLinkApplication).container
