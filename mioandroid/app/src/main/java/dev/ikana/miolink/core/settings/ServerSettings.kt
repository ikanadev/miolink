package dev.ikana.miolink.core.settings

import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

/**
 * Where the backend lives and the API key every request carries.
 *
 * [baseUrl] is normalized (see [normalizeBaseUrl]): `http://` or `https://`,
 * no trailing `/`. It may carry a path prefix (`https://example.com/miolink`).
 */
data class ServerSettings(val baseUrl: String, val apiKey: String) {
    // Keeps the key out of logs and crash reports that print this object.
    override fun toString(): String = "ServerSettings(baseUrl=$baseUrl, apiKey=***)"
}

/**
 * Returns [input] trimmed and without trailing `/`, or null when it isn't an
 * `http://` or `https://` URL with a host. No other rewriting happens: the
 * URL is stored as the user typed it.
 */
fun normalizeBaseUrl(input: String): String? {
    val url = input.trim().trimEnd('/')
    val scheme = url.substringBefore("://", missingDelimiterValue = "").lowercase()
    if (scheme != "http" && scheme != "https") return null
    if (url.any { it.isWhitespace() }) return null
    val parsed = url.toHttpUrlOrNull() ?: return null
    if (parsed.host.isEmpty() || parsed.query != null || parsed.fragment != null) return null
    return url
}
