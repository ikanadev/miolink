package dev.ikana.miolink.link

import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.network.getOrThrowApi
import dev.ikana.miolink.gen.miolink.link.v1.createLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.deleteLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.moveLinkRequest
import dev.ikana.miolink.gen.miolink.link.v1.recordViewRequest
import dev.ikana.miolink.gen.miolink.link.v1.refreshLinkMetadataRequest
import dev.ikana.miolink.gen.miolink.link.v1.updateLinkRequest
import dev.ikana.miolink.tree.TreeRepository
import dev.ikana.miolink.tree.toEntity

/**
 * Link RPCs, applied to the cached tree through [TreeRepository.applyWrite]
 * (see "Data flow and sync"). Every method throws [ApiException] when the
 * call fails, and then changes nothing locally. Input isn't validated here;
 * check it with [parseLinkUrl] and [validateLinkTitle] first.
 */
interface LinkRepository {
    /**
     * Saves [url] in [directoryId]. The server fetches the page for its title
     * and thumbnail first, so this can take a few seconds.
     *
     * @return the new link's id.
     */
    suspend fun create(directoryId: Long, url: String): Long

    /** Sets link [id]'s title; the server trims it. */
    suspend fun updateTitle(id: Long, title: String)

    suspend fun move(id: Long, directoryId: Long)

    suspend fun delete(id: Long)

    /**
     * Fetches the page again and replaces the title (even one the user
     * edited) and thumbnail.
     *
     * @return whether anything changed.
     */
    suspend fun refreshMetadata(id: Long): Boolean

    /**
     * Counts one view of link [id] and stores the server's new count. Views
     * don't change the tree revision, so this skips the revision check.
     *
     * @return the new view count.
     */
    suspend fun recordView(id: Long): Long
}

class DefaultLinkRepository(
    private val serviceClients: ServiceClientsProvider,
    private val tree: TreeRepository,
) : LinkRepository {
    override suspend fun create(directoryId: Long, url: String): Long {
        val clients = serviceClients.current()
        val response = clients.link
            .createLink(
                createLinkRequest {
                    this.directoryId = directoryId
                    this.url = url
                },
            )
            .getOrThrowApi()
        val created = response.link.toEntity(clients.baseUrl)
        tree.applyWrite(response.previousRevision, response.revision) { upsertLink(created) }
        return created.id
    }

    override suspend fun updateTitle(id: Long, title: String) {
        val clients = serviceClients.current()
        val response = clients.link
            .updateLink(
                updateLinkRequest {
                    this.id = id
                    this.title = title
                },
            )
            .getOrThrowApi()
        val updated = response.link.toEntity(clients.baseUrl)
        tree.applyWrite(response.previousRevision, response.revision) { upsertLink(updated) }
    }

    override suspend fun move(id: Long, directoryId: Long) {
        val response = serviceClients.current().link
            .moveLink(
                moveLinkRequest {
                    this.id = id
                    this.directoryId = directoryId
                },
            )
            .getOrThrowApi()
        val moved = response.link
        tree.applyWrite(response.previousRevision, response.revision) { moveLink(moved.id, moved.directoryId) }
    }

    override suspend fun delete(id: Long) {
        val response = serviceClients.current().link
            .deleteLink(deleteLinkRequest { this.id = id })
            .getOrThrowApi()
        tree.applyWrite(response.previousRevision, response.revision) { deleteLink(id) }
    }

    override suspend fun refreshMetadata(id: Long): Boolean {
        val clients = serviceClients.current()
        val response = clients.link
            .refreshLinkMetadata(refreshLinkMetadataRequest { this.id = id })
            .getOrThrowApi()
        val refreshed = response.link.toEntity(clients.baseUrl)
        // Unchanged metadata leaves the revision as it was; applying the
        // same row is harmless and still detects a stale cache.
        tree.applyWrite(response.previousRevision, response.revision) { upsertLink(refreshed) }
        return response.revision != response.previousRevision
    }

    override suspend fun recordView(id: Long): Long {
        val response = serviceClients.current().link
            .recordView(recordViewRequest { this.id = id })
            .getOrThrowApi()
        tree.setLinkViews(id, response.views)
        return response.views
    }
}
