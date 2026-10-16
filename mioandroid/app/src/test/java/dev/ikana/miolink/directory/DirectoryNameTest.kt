package dev.ikana.miolink.directory

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class DirectoryNameTest {
    @Test
    fun acceptsOrdinaryNames() {
        assertNull(validateDirectoryName("Work"))
        assertNull(validateDirectoryName("a"))
        assertNull(validateDirectoryName(" spaced out "))
        assertNull(validateDirectoryName(".hidden"))
        assertNull(validateDirectoryName("..."))
        assertNull(validateDirectoryName("a\\b"))
    }

    @Test
    fun rejectsEmpty() = assertEquals(DirectoryNameError.Empty, validateDirectoryName(""))

    @Test
    fun rejectsSlash() {
        assertEquals(DirectoryNameError.ContainsSlash, validateDirectoryName("a/b"))
        assertEquals(DirectoryNameError.ContainsSlash, validateDirectoryName("/"))
    }

    @Test
    fun rejectsDotAndDotDot() {
        assertEquals(DirectoryNameError.Reserved, validateDirectoryName("."))
        assertEquals(DirectoryNameError.Reserved, validateDirectoryName(".."))
    }

    @Test
    fun countsCharactersNotUtf16Units() {
        assertNull(validateDirectoryName("x".repeat(255)))
        assertEquals(DirectoryNameError.TooLong, validateDirectoryName("x".repeat(256)))
        // An emoji is one character but two UTF-16 units, as the backend counts runes.
        val emoji = "📁"
        assertNull(validateDirectoryName(emoji.repeat(255)))
        assertEquals(DirectoryNameError.TooLong, validateDirectoryName(emoji.repeat(256)))
    }

    @Test
    fun rejectsSiblingNamesCaseSensitively() {
        val siblings = setOf("Work", "Home")
        assertEquals(DirectoryNameError.Duplicate, validateDirectoryName("Work", siblings))
        assertNull(validateDirectoryName("work", siblings))
    }
}
