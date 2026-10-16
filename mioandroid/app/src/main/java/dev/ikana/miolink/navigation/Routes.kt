package dev.ikana.miolink.navigation

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

/** The hidden root directory every tree has (see the backend's domain model). */
const val ROOT_DIRECTORY_ID = 1L

/** A directory's contents. The back stack starts at `Browse()`, the root. */
@Serializable
data class Browse(val directoryId: Long = ROOT_DIRECTORY_ID) : NavKey

/** Edit a link's title, URL and directory; opened right after CreateLink. */
@Serializable
data class LinkEdit(val linkId: Long) : NavKey

/**
 * The share flow's sheet for [url], shared from another app (`ShareActivity`
 * only; the main back stack never holds it).
 */
@Serializable
data class ShareLink(val url: String) : NavKey

/** Server URL and API key. */
@Serializable
data object Settings : NavKey
