package dev.ikana.miolink.directory

/** Why a directory name can't be used. */
sealed interface DirectoryNameError {
    data object Empty : DirectoryNameError

    /** More than [MAX_DIRECTORY_NAME_LENGTH] characters. */
    data object TooLong : DirectoryNameError

    data object ContainsSlash : DirectoryNameError

    /** `.` or `..`. */
    data object Reserved : DirectoryNameError

    /** A sibling already has this name (from the cache, or the server's `ALREADY_EXISTS`). */
    data object Duplicate : DirectoryNameError

    /** The server's `INVALID_ARGUMENT`, with its [message] when it sent one. */
    data class Rejected(val message: String?) : DirectoryNameError
}

/** A name the server (or a check before sending) refused, and why. */
data class RejectedName(val name: String, val error: DirectoryNameError)

/** Linux's NAME_MAX, counted in characters (code points) like the backend. */
const val MAX_DIRECTORY_NAME_LENGTH = 255

/**
 * Checks [name] with the backend's rules: 1-255 characters, no `/`, not `.`
 * or `..`. Also rejects a name already in [siblingNames] (case-sensitive),
 * which the server would refuse with `ALREADY_EXISTS`.
 *
 * Returns null when the name can be sent.
 */
fun validateDirectoryName(name: String, siblingNames: Collection<String> = emptySet()): DirectoryNameError? =
    when {
        name.isEmpty() -> DirectoryNameError.Empty
        name.codePointCount(0, name.length) > MAX_DIRECTORY_NAME_LENGTH -> DirectoryNameError.TooLong
        '/' in name -> DirectoryNameError.ContainsSlash
        name == "." || name == ".." -> DirectoryNameError.Reserved
        name in siblingNames -> DirectoryNameError.Duplicate
        else -> null
    }
