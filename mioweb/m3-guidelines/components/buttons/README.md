# Buttons (group overview)

> Source: https://m3.material.io/components/all-buttons · M3 Expressive. Shared tokens and conventions: [../../guidelines.md](../../guidelines.md).

Material 3 has **10 types of buttons**, implemented by the components in this folder:

| # | Type | Spec file |
| --- | --- | --- |
| 1 | Button | [buttons.md](buttons.md) |
| 2 | Toggle button | [buttons.md](buttons.md) (toggle / selection variant) |
| 3 | Icon button | [icon-buttons.md](icon-buttons.md) |
| 4 | Toggle icon button | [icon-buttons.md](icon-buttons.md) (toggle variant) |
| 5 | Split button | [split-button.md](split-button.md) |
| 6 | Standard button group | [button-groups.md](button-groups.md) |
| 7 | Connected button group | [button-groups.md](button-groups.md) |
| 8 | Floating action button (FAB) | [floating-action-button.md](floating-action-button.md) |
| 9 | Extended FAB | [extended-fab.md](extended-fab.md) |
| 10 | FAB menu | [fab-menu.md](fab-menu.md) |
| – | Segmented buttons (not in the all-buttons list; **no longer recommended** in Expressive per its own page — use the connected button group) | [segmented-buttons.md](segmented-buttons.md) |

## Choosing a button by emphasis

| Emphasis | Component | Rationale | Example actions |
| --- | --- | --- | --- |
| **High** — primary, most important or most common action on a screen | Extended FAB, FAB, FAB menu | Largest and most prominent buttons, designed for a page's primary action. Extended FAB is best on large screens. FAB menu provides multiple options. | Create, Compose, New thread, New file |
| High | Button (filled) | Primary color palette makes it the most prominent button after the FAB. Use for final or unblocking actions in a flow. | Save, Confirm, Done |
| High | Split button | Primary color palette + menu icon; for key actions with multiple options. | Send, Add, Create |
| High | Standard button group | Uses color, motion and shape to capture attention; shows multiple key actions. | Back, Pause, Next |
| **Medium** — important actions that don't distract from the main task | Button (tonal) | Secondary color palette, less prominent than filled. For final/unblocking or supporting actions. | Save, Confirm, Done |
| Medium | Button (elevated) | Has a shadow (source also says "secondary color palette", but the elevated tokens are surface-container-low / primary — follow the tokens, see buttons.md §11). Only use when the button needs visual separation from a patterned background. | Reply, View all, Add to cart, Take out of trash |
| Medium | Button (outlined) | Actions that need attention but aren't primary (e.g. "See all", "Add to cart"); also the button for changing one's mind / escaping a flow. | Reply, View all, Add to cart, Take out of trash |
| **Low** — optional or supplementary actions | Connected button group | Shows multiple related options; use for changing the content visible on a page. | Walk, Bike, Drive |
| Low | Button (text) | No outline or fill; for actions not essential to the user journey. | Learn more, View all, Change account, Turn on |
| Low | Icon button | Most compact and subtle; for optional supplementary actions (e.g. Bookmark, Star). | Add to favorites, Print |

## Hierarchy

- **One high-emphasis button per screen** for the primary action. The arrangement of elements must make clear that other buttons are less important.
- More than one button can be shown at a time; use different color styles to create hierarchy and signal the importance of each.
- A button's level of emphasis determines its appearance, typography and placement.

## Placement rules

- Combine button styles on the same screen to focus attention on a primary action while offering alternatives (e.g. filled button for a high-emphasis action, text button for a low-emphasis one, extended FAB for the highest-emphasis action).
- **Do** pair a higher-emphasis button with a lower-emphasis one for the more important action: filled + text, filled + outlined (medium next to high), outlined + text (low next to medium).
- **Do** use a filled button on its own for a single important action.
- **Don't** stack one button below another when there's room to place them side by side.
- In the source's side-by-side examples the lower-emphasis button sits on the leading side and the higher-emphasis one on the trailing side (derived from the DO images; mirrors in RTL).

## Shared base (implementation note, derived)

All button-family components build on one internal base; the reference implementation is the `.md-button` blueprint in [buttons.md §10](buttons.md#10-htmlcss-implementation-blueprint). Each per-file §10 only adds what differs.

| Shared mechanism | Defined in | Reused by |
| --- | --- | --- |
| Native `<button>` host, inline-flex content row (icon + label, `gap` = icon-label-space), logical padding for RTL | buttons.md §10(a,c) | all |
| Color vars `--_container` / `--_content` / `--_outline-color` / `--_elevation` per color style + toggle `aria-pressed` overrides | buttons.md §10(b) | buttons, split button (default colors only), button groups |
| Size vars (`--_height`, spacing, icon size, outline width, type role) per XS–XL | buttons.md §10(b) | buttons, split button (overrides padding/icon), groups |
| Radius state machine via a single `--_radius` var (rest / selected / pressed, numeric `full = height/2`), fast-spatial spring transition | buttons.md §10(c,d) | buttons, icon buttons; split button and connected groups override per-corner longhands |
| State layer, focus ring, ripple, touch target, elevation, disabled recipe, spring helpers | guidelines.md shared primitives (by name) | all |
| Forced-colors and reduced-motion fallbacks | buttons.md §10(d,e) | all |

Per-component blueprints: [buttons.md](buttons.md) · [icon-buttons.md](icon-buttons.md) · [split-button.md](split-button.md) · [button-groups.md](button-groups.md) · [floating-action-button.md](floating-action-button.md) · [extended-fab.md](extended-fab.md) · [fab-menu.md](fab-menu.md) · [segmented-buttons.md](segmented-buttons.md) (§10 in each).

- Keep **color** (elevated / filled / tonal / outlined / text, or standard / filled / tonal / outlined for icon buttons) and **size** (XS–XL) as independent, orthogonal properties, mirroring the split color/size token sets.
- Toggle variants (button, icon button) and selection inside connected button groups share the same `selected/unselected` token pattern and should share the same selection API (`selected` property + `aria-pressed`, or radio/checkbox semantics as described in each file).
