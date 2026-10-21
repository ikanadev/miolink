package dev.ikana.miolink.link.components

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ButtonGroupDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.ToggleButton
import androidx.compose.material3.ToggleButtonDefaults
import androidx.compose.material3.ToggleButtonSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dev.ikana.miolink.R
import dev.ikana.miolink.core.settings.LinkLayout
import dev.ikana.miolink.ui.theme.MioLinkTheme

/**
 * Picks the [LinkLayout] of link lists: an extra-small connected button
 * group with an icon-only button per layout, announced as radio buttons.
 */
@Composable
fun LinkLayoutToggle(
    layout: LinkLayout,
    onLayoutChange: (LinkLayout) -> Unit,
    modifier: Modifier = Modifier,
) {
    val options = LinkLayout.entries
    Row(
        modifier = modifier.selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(ButtonGroupDefaults.ConnectedSpaceBetween),
    ) {
        options.forEachIndexed { index, option ->
            val label = stringResource(option.labelRes)
            ToggleButton(
                checked = option == layout,
                onCheckedChange = { onLayoutChange(option) },
                modifier = Modifier.semantics { role = Role.RadioButton },
                buttonSize = ToggleButtonSize.ExtraSmall,
                shapes = when (index) {
                    0 -> ButtonGroupDefaults.connectedLeadingButtonShapes()
                    options.lastIndex -> ButtonGroupDefaults.connectedTrailingButtonShapes()
                    else -> ButtonGroupDefaults.connectedMiddleButtonShapes()
                },
                contentPadding = ToggleButtonDefaults.contentPaddingFor(ToggleButtonSize.ExtraSmall),
            ) {
                Icon(
                    painter = painterResource(option.iconRes),
                    contentDescription = label,
                    modifier = Modifier.size(ButtonDefaults.ExtraSmallIconSize),
                )
            }
        }
    }
}

private val LinkLayout.iconRes: Int
    @DrawableRes get() = when (this) {
        LinkLayout.Cards -> R.drawable.ic_view_agenda
        LinkLayout.Condensed -> R.drawable.ic_view_list
    }

private val LinkLayout.labelRes: Int
    @StringRes get() = when (this) {
        LinkLayout.Cards -> R.string.link_layout_cards
        LinkLayout.Condensed -> R.string.link_layout_condensed
    }

@Preview
@Composable
private fun LinkLayoutTogglePreview() {
    MioLinkTheme(dynamicColor = false) {
        LinkLayoutToggle(layout = LinkLayout.Condensed, onLayoutChange = {}, modifier = Modifier.padding(16.dp))
    }
}
