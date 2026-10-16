package dev.ikana.miolink.directory

import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.network.getOrThrowApi
import dev.ikana.miolink.gen.miolink.directory.v1.createDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.deleteDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.moveDirectoryRequest
import dev.ikana.miolink.gen.miolink.directory.v1.renameDirectoryRequest
import dev.ikana.miolink.tree.TreeRepository
import dev.ikana.miolink.tree.toEntity

/**
 * Directory RPCs, applied to the cached tree through
 * [TreeRepository.applyWrite] (see "Data flow and sync"). Every method
 * throws [ApiException] when the call fails, and then changes nothing
 * locally. Names aren't validated here; check them with
 * [validateDirectoryName] first.
 */
interface DirectoryRepository {
    /** Creates directory [name] in [parentId]. Returns the new directory's id. */
    suspend fun create(parentId: Long, name: String): Long

    suspend fun rename(id: Long, name: String)

    /** Moves [id] under [newParentId]; the server rejects cycles. */
    suspend fun move(id: Long, newParentId: Long)

    /** Deletes [id] with its subdirectories and links. */
    suspend fun delete(id: Long)
}

class DefaultDirectoryRepository(
    private val serviceClients: ServiceClientsProvider,
    private val tree: TreeRepository,
) : DirectoryRepository {
    override suspend fun create(parentId: Long, name: String): Long {
        val response = serviceClients.current().directory
            .createDirectory(
                createDirectoryRequest {
                    this.parentId = parentId
                    this.name = name
                },
            )
            .getOrThrowApi()
        val created = response.directory.toEntity()
        tree.applyWrite(response.previousRevision, response.revision) { upsertDirectory(created) }
        return created.id
    }

    override suspend fun rename(id: Long, name: String) {
        val response = serviceClients.current().directory
            .renameDirectory(
                renameDirectoryRequest {
                    this.id = id
                    this.name = name
                },
            )
            .getOrThrowApi()
        val renamed = response.directory
        tree.applyWrite(response.previousRevision, response.revision) {
            renameDirectory(renamed.id, renamed.name)
        }
    }

    override suspend fun move(id: Long, newParentId: Long) {
        val response = serviceClients.current().directory
            .moveDirectory(
                moveDirectoryRequest {
                    this.id = id
                    this.newParentId = newParentId
                },
            )
            .getOrThrowApi()
        val moved = response.directory
        tree.applyWrite(response.previousRevision, response.revision) {
            moveDirectory(moved.id, moved.parentId)
        }
    }

    override suspend fun delete(id: Long) {
        val response = serviceClients.current().directory
            .deleteDirectory(deleteDirectoryRequest { this.id = id })
            .getOrThrowApi()
        // The foreign keys cascade to the subtree and its links.
        tree.applyWrite(response.previousRevision, response.revision) { deleteDirectory(id) }
    }
}
