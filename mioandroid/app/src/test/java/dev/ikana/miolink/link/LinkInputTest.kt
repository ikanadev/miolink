package dev.ikana.miolink.link

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LinkInputTest {
    @Test
    fun acceptsHttpAndHttpsUrls() {
        assertEquals(LinkUrlInput.Valid("https://example.com/a?b=c"), parseLinkUrl("  https://example.com/a?b=c \n"))
        assertEquals(LinkUrlInput.Valid("HTTP://Example.com"), parseLinkUrl("HTTP://Example.com"))
    }

    @Test
    fun addsHttpsToABareHost() {
        assertEquals(LinkUrlInput.Valid("https://example.com/page"), parseLinkUrl("example.com/page"))
        assertEquals(LinkUrlInput.Valid("https://www.example.com"), parseLinkUrl("www.example.com"))
    }

    @Test
    fun rejectsWhatTheBackendRejects() {
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.Empty), parseLinkUrl("   "))
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.NotWebUrl), parseLinkUrl("ftp://example.com"))
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.NotWebUrl), parseLinkUrl("not a url"))
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.NotWebUrl), parseLinkUrl("https://"))
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.NotWebUrl), parseLinkUrl("localhost"))
        val long = "https://example.com/" + "a".repeat(MAX_LINK_URL_LENGTH)
        assertEquals(LinkUrlInput.Invalid(LinkUrlError.TooLong), parseLinkUrl(long))
    }

    @Test
    fun isWebUrlNeedsExactlyOneUrl() {
        assertTrue(isWebUrl("https://example.com"))
        assertFalse(isWebUrl("Look https://example.com"))
        assertFalse(isWebUrl("example.com"))
        assertFalse(isWebUrl("mailto:someone@example.com"))
    }

    @Test
    fun titlesAreCheckedAfterTrimming() {
        assertNull(validateLinkTitle("  A title "))
        assertEquals(LinkTitleError.Empty, validateLinkTitle("   "))
        assertNull(validateLinkTitle("é".repeat(MAX_LINK_TITLE_LENGTH)))
        assertEquals(LinkTitleError.TooLong, validateLinkTitle("x".repeat(MAX_LINK_TITLE_LENGTH + 1)))
        // Characters are code points, like the backend's runes.
        assertEquals(MAX_LINK_TITLE_LENGTH, titleLength("😀".repeat(MAX_LINK_TITLE_LENGTH)))
    }
}
