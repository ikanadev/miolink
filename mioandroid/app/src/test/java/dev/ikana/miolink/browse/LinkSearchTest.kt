package dev.ikana.miolink.browse

import dev.ikana.miolink.navigation.ROOT_DIRECTORY_ID
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LinkSearchTest {
    private fun dir(id: Long, parentId: Long?, name: String) = DirectoryEntity(id, parentId, name, 0)

    private fun link(id: Long, directoryId: Long, title: String, url: String = "https://example.com/$id") =
        LinkEntity(id, directoryId, title, url, null, 0, 0)

    /** root > Work (2) > Projects (3); root > Home (4) > Café recipes (5). */
    private val directories = listOf(
        dir(ROOT_DIRECTORY_ID, null, ""),
        dir(2, 1, "Work"),
        dir(3, 2, "Projects"),
        dir(4, 1, "Home"),
        dir(5, 4, "Café recipes"),
    )

    // Newest first, like TreeSource.allLinks().
    private val links = listOf(
        link(10, 1, "Kotlin coroutines guide"),
        link(11, 3, "Project roadmap", "https://docs.example.org/roadmap"),
        link(12, 5, "Crème brûlée"),
        link(13, 4, "Garden", "https://kotlinlang.org/garden"),
    )

    private fun search(query: String, scopeId: Long = ROOT_DIRECTORY_ID) =
        searchTree(query, scopeId, directories, links)

    @Test
    fun blankQueryFindsNothing() {
        assertTrue(search("").isEmpty)
        assertTrue(search("   ").isEmpty)
    }

    @Test
    fun matchesTitlesAndUrlsIgnoringCase() {
        val results = search("KOTLIN")
        assertEquals(listOf(10L, 13L), results.links.map { it.item.id })
        assertEquals(listOf(11L), search("docs.example").links.map { it.item.id })
    }

    @Test
    fun everyWordMustMatchInAnyOrder() {
        assertEquals(listOf(10L), search("guide kotlin").links.map { it.item.id })
        assertTrue(search("kotlin roadmap").isEmpty)
    }

    @Test
    fun ignoresAccents() {
        assertEquals(listOf(12L), search("creme brulee").links.map { it.item.id })
        assertEquals(listOf(5L), search("cafe").directories.map { it.item.id })
        assertEquals(listOf(5L), search("CAFÉ").directories.map { it.item.id })
    }

    @Test
    fun locationIsThePathBelowTheRoot() {
        val results = search("project")
        assertEquals(listOf(3L to "Work"), results.directories.map { it.item.id to it.location })
        assertEquals(listOf(11L to "Work / Projects"), results.links.map { it.item.id to it.location })
        assertEquals(listOf(""), search("coroutines").links.map { it.location })
    }

    @Test
    fun scopeLimitsResultsToTheSubtree() {
        assertEquals(listOf(11L), search("o", scopeId = 2).links.map { it.item.id })
        // The scope itself isn't a result; its subdirectories are.
        assertEquals(listOf(3L), search("o", scopeId = 2).directories.map { it.item.id })
        assertTrue(search("kotlin", scopeId = 2).isEmpty)
    }

    @Test
    fun neverReturnsTheRoot() {
        assertTrue(search("e").directories.none { it.item.id == ROOT_DIRECTORY_ID })
    }
}
