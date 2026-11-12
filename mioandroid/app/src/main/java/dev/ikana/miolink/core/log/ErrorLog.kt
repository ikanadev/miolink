package dev.ikana.miolink.core.log

import android.util.Log
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

/** One recorded error: when, where ([tag]) and what (message and stack trace). */
data class ErrorLogEntry(val time: String, val tag: String, val body: String)

/** What the error log screen needs: the entries, newest first, and clearing them. */
interface ErrorLogSource {
    val entries: Flow<List<ErrorLogEntry>>

    suspend fun clear()
}

/**
 * The error log on disk: a plain text file of entries separated by blank
 * lines, oldest first. It only holds unexpected errors (see [ErrorLog]), so
 * it stays small; past [maxBytes] the oldest entries are dropped.
 *
 * Entries never contain the API key: messages are written by the app, and
 * the exceptions it records come from storage and the transport, which don't
 * see the key in plain text (the server doesn't echo it either).
 */
class ErrorLogFile(
    private val file: File,
    private val maxBytes: Int = DEFAULT_MAX_BYTES,
    private val clock: () -> Long = System::currentTimeMillis,
) : ErrorLogSource {
    private val lock = Any()
    private val version = MutableStateFlow(0)

    override val entries: Flow<List<ErrorLogEntry>> = version
        .map { read() }
        .flowOn(Dispatchers.IO)

    /** Appends an entry. Blocking; [ErrorLog] calls it off the main thread, except for crashes. */
    fun append(tag: String, message: String, throwable: Throwable?) {
        val time = SimpleDateFormat(TIME_FORMAT, Locale.US).format(Date(clock()))
        val body = buildString {
            append(message.trim())
            if (throwable != null) append('\n').append(throwable.stackTraceToString().trim())
        }.replace(BLANK_LINES, "\n").take(MAX_ENTRY_CHARS)
        val entry = "$time$SEPARATOR$tag\n$body\n\n"
        synchronized(lock) {
            try {
                file.parentFile?.mkdirs()
                file.appendText(entry)
                if (file.length() > maxBytes) trim()
            } catch (e: IOException) {
                Log.w(TAG, "Couldn't write the error log", e)
                return
            }
        }
        version.value++
    }

    override suspend fun clear() {
        withContext(Dispatchers.IO) {
            synchronized(lock) { file.delete() }
        }
        version.value++
    }

    private fun read(): List<ErrorLogEntry> {
        val text = synchronized(lock) {
            try {
                if (file.exists()) file.readText() else ""
            } catch (e: IOException) {
                Log.w(TAG, "Couldn't read the error log", e)
                ""
            }
        }
        return text.split("\n\n")
            .filter { it.isNotBlank() }
            .map { raw ->
                val header = raw.substringBefore('\n')
                ErrorLogEntry(
                    time = header.substringBefore(SEPARATOR),
                    tag = header.substringAfter(SEPARATOR, missingDelimiterValue = ""),
                    body = raw.substringAfter('\n', missingDelimiterValue = ""),
                )
            }
            .asReversed()
    }

    /** Keeps the newest half of the file, starting at an entry. */
    private fun trim() {
        val text = file.readText()
        val tail = text.takeLast(maxBytes / 2)
        val start = tail.indexOf("\n\n")
        file.writeText(if (start >= 0) tail.substring(start + 2) else "")
    }

    private companion object {
        const val TAG = "ErrorLogFile"
        const val DEFAULT_MAX_BYTES = 128 * 1024
        const val MAX_ENTRY_CHARS = 16 * 1024
        const val TIME_FORMAT = "yyyy-MM-dd HH:mm:ss.SSS Z"
        const val SEPARATOR = "  "
        val BLANK_LINES = Regex("\n\\s*\n")
    }
}

/**
 * Reports unexpected errors: bugs, storage and Keystore failures, server
 * errors the app has no handling for, and crashes. Expected failures (no
 * network, a rejected API key, a stale cache, invalid input) go to Logcat
 * only. Like `android.util.Log`, it's called statically from anywhere; until
 * [install] runs (in tests, say) it only writes to Logcat.
 */
object ErrorLog {
    @Volatile
    private var file: ErrorLogFile? = null
    private var crashHandlerInstalled = false
    private val writer: Executor by lazy {
        Executors.newSingleThreadExecutor { runnable ->
            Thread(runnable, "ErrorLog").apply { isDaemon = true }
        }
    }

    /**
     * Records to [file] from now on, and records uncaught exceptions before
     * the previous handler (the system's, which ends the process) runs.
     */
    @Synchronized
    fun install(file: ErrorLogFile) {
        this.file = file
        if (crashHandlerInstalled) return
        crashHandlerInstalled = true
        val previous = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            try {
                // Synchronously: the process ends right after.
                this.file?.append("Crash", "Uncaught exception in thread ${thread.name}", throwable)
            } catch (_: Throwable) {
                // Never get in the way of the crash itself.
            }
            previous?.uncaughtException(thread, throwable)
        }
    }

    /** Logs to Logcat and appends to the error log. */
    fun record(tag: String, message: String, throwable: Throwable? = null) {
        Log.e(tag, message, throwable)
        val target = file ?: return
        writer.execute { target.append(tag, message, throwable) }
    }
}
