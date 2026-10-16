package dev.ikana.miolink.tree

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * A cached directory. [parentId] is null only for the root (id 1). The
 * cascade mirrors the backend: deleting a directory deletes its subtree and
 * their links in one `DELETE`.
 */
@Entity(
    tableName = "directories",
    foreignKeys = [
        ForeignKey(
            entity = DirectoryEntity::class,
            parentColumns = ["id"],
            childColumns = ["parent_id"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("parent_id")],
)
data class DirectoryEntity(
    @PrimaryKey val id: Long,
    @ColumnInfo(name = "parent_id") val parentId: Long?,
    val name: String,
    /** Unix milliseconds, UTC. */
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
