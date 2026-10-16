package dev.ikana.miolink.core.network

import com.connectrpc.Code
import com.connectrpc.ConnectException
import com.connectrpc.ResponseMessage
import java.io.IOException

/**
 * What went wrong with an RPC, in the terms the app reacts to (see "Network
 * and errors" in `mioandroid/CLAUDE.md`).
 */
sealed interface ApiError {
    /** No server URL and API key saved yet. */
    data object NotConfigured : ApiError

    /** The server couldn't be reached: no network, DNS, refused, TLS, timeout. */
    data object Unreachable : ApiError

    /** The API key was rejected. Send the user to settings. */
    data object Unauthenticated : ApiError

    /** The object no longer exists; the cache is stale and needs a refresh. */
    data object NotFound : ApiError

    /** A sibling with that name exists. [message] is the server's, for the input. */
    data class AlreadyExists(val message: String?) : ApiError

    /** The input was rejected. [message] is the server's, for the input. */
    data class InvalidArgument(val message: String?) : ApiError

    /** Anything else; show a generic error. [code] is for logs. */
    data class Unknown(val code: Code?) : ApiError
}

/**
 * An [ApiError] thrown by repositories. Its message never contains the API
 * key: the server doesn't echo it, and the client-side causes are transport
 * errors.
 */
class ApiException(val error: ApiError, cause: Throwable? = null) :
    Exception(error.toString(), cause)

/** Maps a Connect failure to the [ApiError] the app reacts to. */
fun ConnectException.toApiError(): ApiError = when (code) {
    Code.UNAUTHENTICATED -> ApiError.Unauthenticated
    Code.NOT_FOUND -> ApiError.NotFound
    Code.ALREADY_EXISTS -> ApiError.AlreadyExists(message)
    Code.INVALID_ARGUMENT -> ApiError.InvalidArgument(message)
    Code.UNAVAILABLE, Code.DEADLINE_EXCEEDED -> ApiError.Unreachable
    // connect-kotlin reports transport failures (unknown host, connection
    // refused, TLS errors) as UNKNOWN with the IOException as the cause.
    else -> if (exception is IOException) ApiError.Unreachable else ApiError.Unknown(code)
}

/** Returns the response message, or throws [ApiException] for a failure. */
fun <T> ResponseMessage<T>.getOrThrowApi(): T = when (this) {
    is ResponseMessage.Success -> message
    is ResponseMessage.Failure -> throw ApiException(cause.toApiError(), cause)
}
