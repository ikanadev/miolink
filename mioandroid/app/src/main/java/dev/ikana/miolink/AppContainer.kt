package dev.ikana.miolink

import android.content.Context

/**
 * Builds and holds the app's long-lived dependencies (OkHttp, the Connect
 * client, Room, DataStore, repositories). This is the only place that
 * constructs them; ViewModels read them through [appContainer] in their
 * `viewModelFactory { initializer { ... } }`.
 *
 * Empty for now; later tasks add to it.
 */
class AppContainer(context: Context) {
    val applicationContext: Context = context.applicationContext
}
