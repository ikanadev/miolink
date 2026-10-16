package dev.ikana.miolink.link

import java.net.URI
import java.net.URISyntaxException

/** The longest URL the backend accepts, in characters (code points). */
const val MAX_LINK_URL_LENGTH = 2048

/** The longest title the backend accepts, in characters, after trimming. */
const val MAX_LINK_TITLE_LENGTH = 500

/** Why a URL can't be saved, checked before sending it. */
sealed interface LinkUrlError {
    data object Empty : LinkUrlError
    data object TooLong : LinkUrlError

    /** Not an absolute http(s) URL with a host. */
    data object NotWebUrl : LinkUrlError

    /** The server refused it (`INVALID_ARGUMENT`); [message] is the server's. */
    data class Rejected(val message: String?) : LinkUrlError
}

/** What the user typed, checked and ready to send. */
sealed interface LinkUrlInput {
    data class Valid(val url: String) : LinkUrlInput
    data class Invalid(val error: LinkUrlError) : LinkUrlInput
}

/**
 * Checks a URL the way the backend does: absolute `http` or `https` with a
 * host, at most [MAX_LINK_URL_LENGTH] characters. Surrounding whitespace is
 * dropped, and a bare host such as `example.com/page` gets `https://`, so
 * typing an address the way browsers allow works.
 */
fun parseLinkUrl(input: String): LinkUrlInput {
    val trimmed = input.trim()
    if (trimmed.isEmpty()) return LinkUrlInput.Invalid(LinkUrlError.Empty)
    val url = if (!trimmed.contains("://") && looksLikeHost(trimmed)) "https://$trimmed" else trimmed
    if (url.codePointCount(0, url.length) > MAX_LINK_URL_LENGTH) {
        return LinkUrlInput.Invalid(LinkUrlError.TooLong)
    }
    return if (isWebUrl(url)) LinkUrlInput.Valid(url) else LinkUrlInput.Invalid(LinkUrlError.NotWebUrl)
}

/** Whether [text] is exactly one absolute http(s) URL with a host (no spaces around it). */
fun isWebUrl(text: String): Boolean {
    if (text.isEmpty() || text.any { it.isWhitespace() }) return false
    val uri = try {
        URI(text)
    } catch (_: URISyntaxException) {
        return false
    }
    val scheme = uri.scheme?.lowercase()
    return (scheme == "http" || scheme == "https") && !uri.host.isNullOrEmpty()
}

/** `example.com`, `example.com/path`: a dot before any `/`, no spaces. */
private fun looksLikeHost(text: String): Boolean {
    if (text.any { it.isWhitespace() }) return false
    val host = text.substringBefore('/').substringBefore('?').substringBefore('#')
    return host.contains('.') && !host.startsWith('.') && !host.endsWith('.')
}

/** Why a title can't be saved, checked before sending it. */
sealed interface LinkTitleError {
    data object Empty : LinkTitleError
    data object TooLong : LinkTitleError

    /** The server refused it (`INVALID_ARGUMENT`); [message] is the server's. */
    data class Rejected(val message: String?) : LinkTitleError
}

/** A title the server refused, shown under the field until it changes. */
data class RejectedTitle(val title: String, val error: LinkTitleError)

/** Checks [title] like the backend: 1-500 characters after trimming. */
fun validateLinkTitle(title: String): LinkTitleError? {
    val trimmed = title.trim()
    return when {
        trimmed.isEmpty() -> LinkTitleError.Empty
        titleLength(trimmed) > MAX_LINK_TITLE_LENGTH -> LinkTitleError.TooLong
        else -> null
    }
}

/** Length in characters as the backend counts them (code points), after trimming. */
fun titleLength(title: String): Int {
    val trimmed = title.trim()
    return trimmed.codePointCount(0, trimmed.length)
}
