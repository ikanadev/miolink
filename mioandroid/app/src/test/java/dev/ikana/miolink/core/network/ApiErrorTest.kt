package dev.ikana.miolink.core.network

import com.connectrpc.Code
import com.connectrpc.ConnectException
import com.connectrpc.ResponseMessage
import java.net.ConnectException as SocketConnectException
import java.net.UnknownHostException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.fail
import org.junit.Test

class ApiErrorTest {
    private fun error(code: Code, message: String? = null, cause: Throwable? = null) =
        ConnectException(code, message, cause).toApiError()

    @Test
    fun mapsAppCodes() {
        assertEquals(ApiError.Unauthenticated, error(Code.UNAUTHENTICATED))
        assertEquals(ApiError.NotFound, error(Code.NOT_FOUND))
        assertEquals(ApiError.AlreadyExists("name taken"), error(Code.ALREADY_EXISTS, "name taken"))
        assertEquals(ApiError.InvalidArgument("bad name"), error(Code.INVALID_ARGUMENT, "bad name"))
    }

    @Test
    fun mapsUnreachable() {
        assertEquals(ApiError.Unreachable, error(Code.UNAVAILABLE))
        assertEquals(ApiError.Unreachable, error(Code.DEADLINE_EXCEEDED))
        assertEquals(ApiError.Unreachable, error(Code.UNKNOWN, cause = UnknownHostException("x")))
        assertEquals(ApiError.Unreachable, error(Code.UNKNOWN, cause = SocketConnectException("x")))
    }

    @Test
    fun mapsEverythingElseToUnknown() {
        val others = Code.entries - setOf(
            Code.UNAUTHENTICATED,
            Code.NOT_FOUND,
            Code.ALREADY_EXISTS,
            Code.INVALID_ARGUMENT,
            Code.UNAVAILABLE,
            Code.DEADLINE_EXCEEDED,
        )
        for (code in others) {
            assertEquals(ApiError.Unknown(code), error(code))
        }
    }

    @Test
    fun getOrThrowApiReturnsMessageOrThrows() {
        assertEquals("ok", ResponseMessage.Success("ok", emptyMap(), emptyMap()).getOrThrowApi())

        val cause = ConnectException(Code.NOT_FOUND)
        try {
            ResponseMessage.Failure<String>(cause, emptyMap(), emptyMap()).getOrThrowApi()
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals(ApiError.NotFound, e.error)
            assertSame(cause, e.cause)
        }
    }
}
