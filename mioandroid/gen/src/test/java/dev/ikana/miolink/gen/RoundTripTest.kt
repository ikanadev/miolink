package dev.ikana.miolink.gen

import dev.ikana.miolink.gen.miolink.tree.v1.GetTreeRequest
import dev.ikana.miolink.gen.miolink.tree.v1.getTreeRequest
import org.junit.Assert.assertEquals
import org.junit.Test

class RoundTripTest {
    @Test
    fun getTreeRequestRoundTrips() {
        val request = getTreeRequest { knownRevision = 42L }

        val parsed = GetTreeRequest.parseFrom(request.toByteArray())

        assertEquals(request, parsed)
        assertEquals(42L, parsed.knownRevision)
    }
}
