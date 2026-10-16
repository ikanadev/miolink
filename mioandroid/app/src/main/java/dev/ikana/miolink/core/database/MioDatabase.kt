package dev.ikana.miolink.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import dev.ikana.miolink.tree.DirectoryEntity
import dev.ikana.miolink.tree.LinkEntity
import dev.ikana.miolink.tree.SyncStateEntity
import dev.ikana.miolink.tree.TreeDao

/**
 * The app's Room database: a cache of the server's tree. Room has to list
 * every entity and DAO here, so this is the one place `core` refers to a
 * domain package.
 *
 * Schemas are exported to `app/schemas/` and committed. A version bump needs
 * a migration (or, since this is only a cache, a destructive fallback that
 * forces a full refetch).
 */
@Database(
    entities = [DirectoryEntity::class, LinkEntity::class, SyncStateEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class MioDatabase : RoomDatabase() {
    abstract fun treeDao(): TreeDao

    companion object {
        /** File name, also excluded from backups in `res/xml`. */
        const val NAME = "miolink.db"

        fun create(context: Context): MioDatabase =
            Room.databaseBuilder(context.applicationContext, MioDatabase::class.java, NAME).build()
    }
}
