package dev.ikana.miolink.core.ui

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LoadingIndicator
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import dev.ikana.miolink.R

/**
 * A button's label with a small [LoadingIndicator] before it while
 * [inProgress], for buttons that send an RPC and wait for it (disable the
 * button meanwhile).
 */
@Composable
fun ProgressButtonContent(text: String, inProgress: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        if (inProgress) {
            val description = stringResource(R.string.progress_working)
            LoadingIndicator(
                modifier = Modifier
                    .size(ButtonDefaults.IconSize)
                    .semantics { contentDescription = description },
                color = LocalContentColor.current,
            )
            Spacer(Modifier.width(ButtonDefaults.IconSpacing))
        }
        Text(text)
    }
}
