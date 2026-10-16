package dev.ikana.miolink.tree

import com.google.protobuf.Timestamp
import dev.ikana.miolink.core.network.thumbnailUrl
import dev.ikana.miolink.gen.miolink.directory.v1.Directory
import dev.ikana.miolink.gen.miolink.link.v1.Link

/** Unix milliseconds, UTC. Sub-millisecond precision is dropped. */
fun Timestamp.toEpochMillis(): Long = seconds * 1_000 + nanos / 1_000_000

/** A [Timestamp] for unix milliseconds, UTC. */
fun Long.toTimestamp(): Timestamp = Timestamp.newBuilder()
    .setSeconds(Math.floorDiv(this, 1_000L))
    .setNanos(Math.floorMod(this, 1_000L).toInt() * 1_000_000)
    .build()

fun Directory.toEntity(): DirectoryEntity = DirectoryEntity(
    id = id,
    parentId = if (hasParentId()) parentId else null,
    name = name,
    createdAt = createdAt.toEpochMillis(),
)

/** [baseUrl] turns the proto's relative `thumbnail_url` into an absolute one. */
fun Link.toEntity(baseUrl: String): LinkEntity = LinkEntity(
    id = id,
    directoryId = directoryId,
    title = title,
    url = url,
    thumbnailUrl = thumbnailUrl(baseUrl, thumbnailUrl),
    views = views,
    createdAt = createdAt.toEpochMillis(),
)

fun DirectoryEntity.toProto(): Directory = Directory.newBuilder()
    .setId(id)
    .also { builder -> parentId?.let(builder::setParentId) }
    .setName(name)
    .setCreatedAt(createdAt.toTimestamp())
    .build()

/**
 * Orders [directories] so every parent comes before its children, as the
 * foreign key needs when inserting them. Server order (by id) isn't enough:
 * a directory can be moved into one created after it. Directories that
 * can't be reached from a root (a missing parent, which a consistent
 * snapshot never has) go last, where their insert fails.
 */
internal fun parentsFirst(directories: List<DirectoryEntity>): List<DirectoryEntity> {
    val children = directories.groupBy { it.parentId }
    val result = ArrayList<DirectoryEntity>(directories.size)
    val visited = HashSet<Long>()
    val queue = ArrayDeque(children[null].orEmpty())
    while (queue.isNotEmpty()) {
        val directory = queue.removeFirst()
        if (!visited.add(directory.id)) continue
        result += directory
        children[directory.id]?.let(queue::addAll)
    }
    directories.filterTo(result) { it.id !in visited }
    return result
}
