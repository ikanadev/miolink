package dev.ikana.miolink.core.ui

import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import dev.ikana.miolink.R

/** The back arrow for a top app bar's `navigationIcon`. */
@Composable
fun NavigateUpButton(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            painter = painterResource(R.drawable.ic_arrow_back),
            contentDescription = stringResource(R.string.navigate_up),
        )
    }
}
