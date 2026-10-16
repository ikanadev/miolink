package dev.ikana.miolink.core.settings

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NormalizeBaseUrlTest {
    @Test
    fun keepsValidUrls() {
        assertEquals("https://links.example.com", normalizeBaseUrl("https://links.example.com"))
        assertEquals("http://10.0.2.2:8080", normalizeBaseUrl("http://10.0.2.2:8080"))
        assertEquals("https://example.com/miolink", normalizeBaseUrl("https://example.com/miolink"))
    }

    @Test
    fun trimsWhitespaceAndTrailingSlashes() {
        assertEquals("https://links.example.com", normalizeBaseUrl("  https://links.example.com/  "))
        assertEquals("https://example.com/miolink", normalizeBaseUrl("https://example.com/miolink//"))
    }

    @Test
    fun acceptsUppercaseScheme() {
        assertEquals("HTTPS://links.example.com", normalizeBaseUrl("HTTPS://links.example.com"))
    }

    @Test
    fun rejectsMissingOrOtherSchemes() {
        assertNull(normalizeBaseUrl("links.example.com"))
        assertNull(normalizeBaseUrl("ftp://links.example.com"))
        assertNull(normalizeBaseUrl("//links.example.com"))
    }

    @Test
    fun rejectsBlankAndHostless() {
        assertNull(normalizeBaseUrl(""))
        assertNull(normalizeBaseUrl("   "))
        assertNull(normalizeBaseUrl("https://"))
    }

    @Test
    fun rejectsSpacesQueriesAndFragments() {
        assertNull(normalizeBaseUrl("https://links example.com"))
        assertNull(normalizeBaseUrl("https://links.example.com/?a=b"))
        assertNull(normalizeBaseUrl("https://links.example.com/#top"))
    }
}
