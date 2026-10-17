# Navigation (group overview)

> Source: https://m3.material.io/components/navigation-bar, /navigation-rail, /navigation-drawer · M3 Expressive. Shared tokens and window size classes: [../../guidelines.md](../../guidelines.md) (Layout section).

| Component | Spec file | Status in M3 Expressive |
| --- | --- | --- |
| Navigation bar (flexible) | [navigation-bar.md](navigation-bar.md) | Current. Flexible bar (64dp, vertical or horizontal items) replaces the baseline bar. |
| Navigation rail (collapsed / expanded, standard / modal) | [navigation-rail.md](navigation-rail.md) | Current. Collapsed rail replaces the baseline rail; the **expanded rail replaces the navigation drawer**. |
| Navigation drawer (standard / modal) | [navigation-drawer.md](navigation-drawer.md) | **No longer recommended** — documented for compatibility/migration (no token table in source). |

## Choosing by window size class

| Window | Primary navigation |
| --- | --- |
| Compact (< 600dp) | Navigation bar, vertical items (3–5 destinations); a modal expanded rail may open from a menu icon. Web: below 320 CSS px always a navigation bar |
| Medium (600–839dp) | Collapsed navigation rail, or navigation bar with horizontal items (few destinations; choose by whether vertical or horizontal space matters more) |
| Expanded and larger (≥ 840dp) | Navigation rail — collapsed, or expanded standard beside content; modal expanded for dense layouts / >5 destinations |

## Shared rules

- **Exactly one destination is always active**; destinations are top-level, fixed in position and consistent across screens.
- One **persistent** primary navigation component per breakpoint — never a rail and a bar together. Swap components when the window class changes (animate the swap), preserving the selected destination. A modal (expanded rail / legacy modal drawer) may be opened from a menu icon on top of a rail.
- Navigation bar: fewer than 3 destinations → use tabs; more than 5 → modal expanded rail or tabs.
- Selection: icon outlined → filled (semibold if no filled glyph), pill indicator (`secondary-container`, `--md-sys-shape-corner-full`) expands from the icon center; destination screen uses the top-level (fade-through) transition.
- Active content colors: icon `on-secondary-container` everywhere. Label `secondary` for bar items and vertical (collapsed) rail items (Expressive change); `on-secondary-container` when the label sits inside the indicator (expanded rail, drawer).
- State layers: `on-secondary-container` at hover 0.08 / focus 0.10 / pressed 0.10, clipped to the indicator shape; the hit target is the whole item (full bar segment / full rail width). Use the state layer, ripple and focus ring primitives from guidelines.md. None of these components has a disabled state.
- Labels are required; never shrink type. Bar and rail labels must not truncate up to 2× text size; drawer labels truncate with ellipsis.
- Badges: icon top-end corner (bar, collapsed rail); after the label (expanded rail, drawer).

## Shared web mapping

- `<nav aria-label="…">` wrapping a `<ul>` of `<a href>` items; active item `aria-current="page"`; icons `aria-hidden`.
- Keyboard: bar = Tab between items; rail = Tab or Arrow Up/Down; drawer = Tab into the list, then arrows. Space/Enter selects.
- Modal variants (modal expanded rail, modal drawer): native `<dialog>` with `showModal()` — inert background, Escape closes, scrim via `::backdrop` (`--md-sys-color-scrim` at 32%), focus returns to the menu button.
- Motion: item selection uses the fast spatial/effects springs; rail expand/collapse uses the default spatial/effects springs; legacy drawer enter/exit uses emphasized decelerate/accelerate easing.

| Quick reference | Navigation bar | Collapsed rail | Expanded rail | Drawer (legacy) |
| --- | --- | --- | --- | --- |
| Container | 100% × 64dp, surface-container | 96dp (80 narrow), surface | 220–360dp; surface / modal surface-container | 360dp, surface-container-low |
| Item | vertical 56×32 pill or horizontal 40dp pill | vertical, 64dp tall, 56×32 pill | horizontal, 56dp pill (hug or fill) | 56dp × 336dp pill |
| Label | label-medium | label-medium | label-large | label-large |
| Elevation | level2 token, rendered tonal (no shadow) | level0 | level0 / modal level2 | level0 / modal level1 |
