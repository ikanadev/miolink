package dev.ikana.miolink.core.log

import java.io.File
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class ErrorLogFileTest {
    @get:Rule
    val folder = TemporaryFolder()

    private fun logFile(maxBytes: Int = 128 * 1024): Pair<File, ErrorLogFile> {
        val file = File(folder.root, "logs/errors.log")
        return file to ErrorLogFile(file, maxBytes)
    }

    @Test
    fun startsEmpty() = runTest {
        val (_, log) = logFile()
        assertEquals(emptyList<ErrorLogEntry>(), log.entries.first())
    }

    @Test
    fun readsEntriesNewestFirstWithTheirStackTraces() = runTest {
        val (_, log) = logFile()
        log.append("TreeRepository", "Couldn't store the tree", IllegalStateException("boom"))
        log.append("SettingsViewModel", "Couldn't save settings", null)

        val entries = log.entries.first()
        assertEquals(listOf("SettingsViewModel", "TreeRepository"), entries.map { it.tag })
        assertEquals("Couldn't save settings", entries[0].body)
        assertTrue(entries[1].body.startsWith("Couldn't store the tree\njava.lang.IllegalStateException: boom\n\tat "))
    }

    @Test
    fun blankLinesInMessagesDontSplitEntries() = runTest {
        val (_, log) = logFile()
        log.append("Tag", "first\n\nsecond", null)

        val entries = log.entries.first()
        assertEquals(1, entries.size)
        assertEquals("first\nsecond", entries[0].body)
    }

    @Test
    fun dropsTheOldestEntriesPastTheLimit() = runTest {
        val (file, log) = logFile(maxBytes = 2_000)
        repeat(50) { log.append("Tag", "error $it", null) }

        assertTrue(file.length() <= 2_000)
        val entries = log.entries.first()
        assertEquals("error 49", entries.first().body)
        assertFalse(entries.any { it.body == "error 0" })
        // Every kept entry is whole.
        assertTrue(entries.all { it.tag == "Tag" && it.body.startsWith("error ") })
    }

    @Test
    fun clearDeletesTheFile() = runTest {
        val (file, log) = logFile()
        log.append("Tag", "error", null)

        log.clear()

        assertFalse(file.exists())
        assertEquals(emptyList<ErrorLogEntry>(), log.entries.first())
    }
}
