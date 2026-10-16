package dev.ikana.miolink.core.ui

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DirectoryPickerTest {
    /** root > Work (2) > Projects (3) > Old (4); root > Home (5); Work > Archive (6). */
    private val directories = listOf(
        PickerDirectory(1, null, ""),
        PickerDirectory(2, 1, "Work"),
        PickerDirectory(3, 2, "Projects"),
        PickerDirectory(4, 3, "Old"),
        PickerDirectory(5, 1, "Home"),
        PickerDirectory(6, 2, "Archive"),
    )

    private val all = directories.map { it.id }.toSet()

    @Test
    fun fullyExpandedTreeIsDepthFirstWithChildrenByName() {
        val rows = directoryTreeRows(directories, expanded = all)

        assertEquals(listOf(1L, 5L, 2L, 6L, 3L, 4L), rows.map { it.directory.id })
        assertEquals(listOf(0, 1, 1, 2, 2, 3), rows.map { it.depth })
        assertEquals(listOf(true, false, true, false, true, false), rows.map { it.hasChildren })
    }

    @Test
    fun collapsedDirectoriesHideTheirChildren() {
        val rows = directoryTreeRows(directories, expanded = setOf(1L))

        assertEquals(listOf(1L, 5L, 2L), rows.map { it.directory.id })
        val work = rows.single { it.directory.id == 2L }
        assertTrue(work.hasChildren)
        assertFalse(work.isExpanded)
    }

    @Test
    fun disablesTheMovedDirectoryAndItsDescendantsOnly() {
        val rows = directoryTreeRows(directories, expanded = all, disabledSubtreeId = 3)

        assertEquals(setOf(3L, 4L), rows.filter { it.isDisabled }.map { it.directory.id }.toSet())
    }

    @Test
    fun subtreeIncludesEveryDescendant() {
        assertEquals(setOf(2L, 3L, 4L, 6L), subtreeIds(directories, 2))
        assertEquals(setOf(5L), subtreeIds(directories, 5))
        assertEquals(emptySet<Long>(), subtreeIds(directories, 99))
    }

    @Test
    fun pathGoesFromTheRootDown() {
        assertEquals(listOf(1L, 2L, 3L, 4L), pathTo(directories, 4))
        assertEquals(listOf(1L), pathTo(directories, 1))
        assertEquals(emptyList<Long>(), pathTo(directories, 99))
    }
}
