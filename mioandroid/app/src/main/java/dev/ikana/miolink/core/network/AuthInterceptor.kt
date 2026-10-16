package dev.ikana.miolink.core.network

import okhttp3.Interceptor
import okhttp3.Response

/**
 * Adds `Authorization: Bearer <key>` to every request, with the key from
 * [apiKey]. The one place the header is set; never log what it adds.
 */
class AuthInterceptor(private val apiKey: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val key = apiKey()
        val request = if (key.isNullOrEmpty()) {
            chain.request()
        } else {
            chain.request().newBuilder().header(HEADER, "Bearer $key").build()
        }
        return chain.proceed(request)
    }

    private companion object {
        const val HEADER = "Authorization"
    }
}
