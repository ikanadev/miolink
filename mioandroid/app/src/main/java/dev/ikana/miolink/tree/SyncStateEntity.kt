package dev.ikana.miolink.tree

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * The single row (`id = 1`) saying which tree is cached: the backend's tree
 * [revision] and the [serverUrl] it came from. No row means no cache.
 */
@Entity(tableName = "sync_state")
data class SyncStateEntity(
    @PrimaryKey val id: Long = ID,
    val revision: Long,
    @ColumnInfo(name = "server_url") val serverUrl: String,
) {
    companion object {
        const val ID = 1L
    }
}
