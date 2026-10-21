package dev.ikana.miolink.browse

import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import java.text.Normalizer

/**
 * A search hit. [location] is the path of the directory holding it, from
 * below the root ("Work / Reading"), empty when it's in the root.
 */
data class SearchHit<T>(val item: T, val location: String)

data class SearchResults(
    /** Directories whose name matches, by path. */
    val directories: List<SearchHit<DirectoryEntity>> = emptyList(),
    /** Links whose title or URL matches, newest first. */
    val links: List<SearchHit<LinkEntity>> = emptyList(),
) {
    val isEmpty: Boolean get() = directories.isEmpty() && links.isEmpty()
}

/**
 * Searches the cached tree below directory [scopeId] (its whole subtree,
 * not the directory itself) for [query].
 *
 * Every word of the query must appear, in any order, in a directory's name
 * or a link's title or URL. Matching ignores case and accents ("cafe" finds
 * "Café"). A blank query finds nothing. [links] keeps its order (newest
 * first).
 */
fun searchTree(
    query: String,
    scopeId: Long,
    directories: List<DirectoryEntity>,
    links: List<LinkEntity>,
): SearchResults {
    val terms = query.normalizedForSearch().split(WHITESPACE).filter { it.isNotEmpty() }
    if (terms.isEmpty()) return SearchResults()
    fun matches(vararg fields: String): Boolean {
        val text = fields.joinToString("\n") { it.normalizedForSearch() }
        return terms.all { it in text }
    }

    val byId = directories.associateBy { it.id }
    val paths = HashMap<Long, String?>()
    // The path below the root, or null when the directory isn't under the scope.
    fun pathOf(id: Long): String? {
        if (id in paths) return paths[id]
        val segments = ArrayList<String>()
        var inScope = false
        var current = byId[id]
        val seen = HashSet<Long>()
        while (current != null && seen.add(current.id)) {
            if (current.id == scopeId) inScope = true
            if (current.parentId == null) break
            segments += current.name
            current = byId[current.parentId]
        }
        return (if (inScope) segments.asReversed().joinToString(" / ") else null).also { paths[id] = it }
    }

    val directoryHits = directories.mapNotNull { directory ->
        val parentId = directory.parentId ?: return@mapNotNull null
        if (directory.id == scopeId || !matches(directory.name)) return@mapNotNull null
        val location = pathOf(parentId) ?: return@mapNotNull null
        SearchHit(directory, location)
    }.sortedWith(compareBy({ it.location.lowercase() }, { it.item.name.lowercase() }))
    val linkHits = links.mapNotNull { link ->
        if (!matches(link.title, link.url)) return@mapNotNull null
        val location = pathOf(link.directoryId) ?: return@mapNotNull null
        SearchHit(link, location)
    }
    return SearchResults(directoryHits, linkHits)
}

private val WHITESPACE = Regex("\\s+")
private val COMBINING_MARKS = Regex("\\p{M}+")

/** Lowercase, without accents, for matching. */
private fun String.normalizedForSearch(): String =
    Normalizer.normalize(this, Normalizer.Form.NFD).replace(COMBINING_MARKS, "").lowercase()
