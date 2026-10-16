package dev.ikana.miolink.link.components

import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.view.textclassifier.TextClassifier
import dev.ikana.miolink.link.isWebUrl

/**
 * The clipboard's URL, for prefilling a new link, or null when it doesn't
 * hold exactly one http(s) URL.
 *
 * Android 12+ shows a "pasted from your clipboard" toast whenever an app
 * reads it, so there it's only read when the system has already classified
 * the text as a URL; otherwise the user can still paste by hand.
 */
fun Context.clipboardWebUrl(): String? {
    val clipboard = getSystemService(ClipboardManager::class.java) ?: return null
    val description = clipboard.primaryClipDescription ?: return null
    if (!description.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN) &&
        !description.hasMimeType(ClipDescription.MIMETYPE_TEXT_URILIST)
    ) {
        return null
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val classified = description.classificationStatus == ClipDescription.CLASSIFICATION_COMPLETE
        if (!classified || description.getConfidenceScore(TextClassifier.TYPE_URL) < URL_CONFIDENCE) {
            return null
        }
    }
    return clipboardText()?.trim()?.takeIf(::isWebUrl)
}

/** Whether the clipboard holds text, checked without reading it (no toast). */
fun Context.clipboardHasText(): Boolean {
    val description = getSystemService(ClipboardManager::class.java)?.primaryClipDescription ?: return false
    return description.hasMimeType("text/*")
}

/** The clipboard's text. Reading it shows a toast on Android 12+. */
fun Context.clipboardText(): String? {
    val clip = getSystemService(ClipboardManager::class.java)?.primaryClip ?: return null
    if (clip.itemCount == 0) return null
    return clip.getItemAt(0).coerceToText(this)?.toString()
}

/** How sure the classifier must be that the clip is a URL to read it unasked. */
private const val URL_CONFIDENCE = 0.5f
