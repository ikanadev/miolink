package dev.ikana.miolink.link.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import dev.ikana.miolink.R
import dev.ikana.miolink.core.network.ApiError
import dev.ikana.miolink.link.LinkTitleError
import dev.ikana.miolink.link.LinkUrlError
import dev.ikana.miolink.link.MAX_LINK_TITLE_LENGTH
import dev.ikana.miolink.link.MAX_LINK_URL_LENGTH

/** What to show under the URL field for this error. */
@Composable
fun LinkUrlError.message(): String = when (this) {
    LinkUrlError.Empty -> stringResource(R.string.link_url_error_empty)
    LinkUrlError.TooLong -> pluralStringResource(
        R.plurals.link_url_error_too_long,
        MAX_LINK_URL_LENGTH,
        MAX_LINK_URL_LENGTH,
    )
    LinkUrlError.NotWebUrl -> stringResource(R.string.link_url_error_not_web)
    is LinkUrlError.Rejected -> message.serverText() ?: stringResource(R.string.link_url_error_rejected)
}

/** What to show under the title field for this error. */
@Composable
fun LinkTitleError.message(): String = when (this) {
    LinkTitleError.Empty -> stringResource(R.string.link_title_error_empty)
    LinkTitleError.TooLong -> pluralStringResource(
        R.plurals.link_title_error_too_long,
        MAX_LINK_TITLE_LENGTH,
        MAX_LINK_TITLE_LENGTH,
    )
    is LinkTitleError.Rejected -> message.serverText() ?: stringResource(R.string.link_title_error_rejected)
}

/**
 * Why a link write failed, for a dialog or sheet that lets the user try
 * again (input errors go under their field instead).
 */
@Composable
fun linkWriteFailureText(error: ApiError): String = stringResource(
    when (error) {
        ApiError.Unreachable -> R.string.link_write_unreachable
        ApiError.Unauthenticated -> R.string.link_write_unauthenticated
        ApiError.NotConfigured -> R.string.link_write_not_configured
        else -> R.string.link_write_failed
    },
)

private fun String?.serverText(): String? =
    this?.takeIf { it.isNotBlank() }?.replaceFirstChar { it.uppercase() }
