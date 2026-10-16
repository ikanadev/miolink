package dev.ikana.miolink

import android.app.Application
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewmodel.CreationExtras

class MioLinkApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
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
