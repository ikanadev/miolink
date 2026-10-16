package dev.ikana.miolink.tree

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * A cached link. Deleted with its directory (`ON DELETE CASCADE`).
 *
 * [thumbnailUrl] is absolute (base URL + the proto's `thumbnail_url`), ready
 * for Coil, or null when the link has no thumbnail.
 */
@Entity(
    tableName = "links",
    foreignKeys = [
        ForeignKey(
            entity = DirectoryEntity::class,
            parentColumns = ["id"],
            childColumns = ["directory_id"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("directory_id")],
)
data class LinkEntity(
    @PrimaryKey val id: Long,
    @ColumnInfo(name = "directory_id") val directoryId: Long,
    val title: String,
    val url: String,
    @ColumnInfo(name = "thumbnail_url") val thumbnailUrl: String?,
    val views: Long,
    /** Unix milliseconds, UTC. */
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
