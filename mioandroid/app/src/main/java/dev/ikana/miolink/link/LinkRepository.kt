package dev.ikana.miolink.link

import dev.ikana.miolink.core.network.ApiException
import dev.ikana.miolink.core.network.ServiceClientsProvider
import dev.ikana.miolink.core.network.getOrThrowApi
import dev.ikana.miolink.gen.miolink.link.v1.recordViewRequest
import dev.ikana.miolink.tree.TreeRepository

/** Link RPCs, applied to the cached tree (see "Data flow and sync"). */
interface LinkRepository {
    /**
     * Counts one view of link [id] and stores the server's new count. Views
     * don't change the tree revision, so this skips the revision check.
     *
     * @return the new view count.
     * @throws ApiException when the call fails.
     */
    suspend fun recordView(id: Long): Long
}

class DefaultLinkRepository(
    private val serviceClients: ServiceClientsProvider,
    private val tree: TreeRepository,
) : LinkRepository {
    override suspend fun recordView(id: Long): Long {
        val response = serviceClients.current().link
            .recordView(recordViewRequest { this.id = id })
            .getOrThrowApi()
        tree.setLinkViews(id, response.views)
        return response.views
    }
}
