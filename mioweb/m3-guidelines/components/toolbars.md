# Toolbars

> Source: https://m3.material.io/components/toolbars · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
- A container of **slots** holding actions related to the **current page** (icon buttons, buttons, text fields, images, custom components). Can scale to show more actions in larger windows; when actions don't fit, add a menu.
- Two expressive variants: **docked toolbar** (full width, bottom; global actions that stay the same across pages) and **floating toolbar** (floats above body content; contextual actions for the current page).
- Two color configurations: **standard** (default; low emphasis, focus on content) and **vibrant** (high emphasis on controls; can signal a temporary mode change, e.g. edit mode). Alternative color roles may be used for more/less emphasis.
- Floating toolbar can be **horizontal** (default) or **vertical**, and can be paired with a **FAB**.
- **Don't show at the same time as a navigation bar** (both bottom-placed). Nav bar on primary pages; toolbar on subsequent pages with actions.
- Floating toolbars can act as **tabs / local navigation** between related subsequent pages; never combine a toolbar with nav controls and a navigation bar.

**M3 Expressive changes**
- **Bottom app bar no longer recommended** → use **docked toolbar** (shorter height, standard or vibrant, more layout/element flexibility). Bottom app bar is still available.
- New **floating toolbar**: horizontal/vertical, standard/vibrant, many elements, pairs with FAB.
- vs M2 bottom app bar: dynamic color mappings, **no shadow** (M2 had 8dp), taller container, FAB contained in the container.
- Platform note (source): on Jetpack Compose the floating toolbar is a separate component and "floating toolbar with FAB" is fully supported; on other platforms (web) each component is added separately → compose toolbar + FAB in a wrapper (§10).

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Docked toolbar | Full-width bar at the bottom of the window | Height 64, `corner.none`, no elevation; ≥16 edge padding |
| Floating – horizontal (default) | Pill floating over content | Height 64, `corner.full`, level3; ≥16 margin to window edge |
| Floating – vertical | Vertical pill on either side | Width 64, ≥24 margin; medium+ windows (not recommended in compact) |
| Color: Standard (default) | `surface-container` container | Low emphasis |
| Color: Vibrant | `primary-container` container | High emphasis |
| Floating + FAB | FAB beside the toolbar, 8 gap | FAB: standard → secondary-container; vibrant → tertiary-container |
| Bottom app bar (baseline) | `surface-container` bar with icon buttons ± FAB | Not recommended; source points to the same toolbar token sets (no separate set) |

## 3. Anatomy
1. **Container** — docked: full-width rectangle; floating: fully-rounded pill (horizontal or vertical).
2. **Placed components / slots** — icon buttons (standard/tonal/filled; narrow/default/wide), buttons, text fields, images, custom components, dividers (large screens), overflow menu button (trailing slot).
3. **FAB** (optional, floating only) — sibling component next to the container.

The toolbar has no interactions of its own; all interaction belongs to the placed elements.

## 4. Tokens & specs

### 4.1 Color
Toolbar color sets define the container **and** the colors of contained buttons/icon buttons (unselected and **selected**/toggled). Hover/focus/pressed icon & label colors equal the resting ones (only the state layer is added).

| Part | State | Standard | Vibrant |
| --- | --- | --- | --- |
| Container | — | `surface-container` #f3edf7 | `primary-container` #eaddff |
| Button container | unselected | `surface-container` | `primary-container` |
| Button container | selected | `secondary-container` #e8def8 | `surface-container` |
| Icon / label text | unselected (rest, hover, focus, pressed) | `on-surface-variant` #49454f | `on-primary-container` #4f378b |
| Icon / label text | selected (all) | `on-secondary-container` #4a4458 | `on-surface` #1d1b20 |
| State layer | unselected hover / focus / pressed | `on-surface-variant` @ 0.08 / 0.10 / 0.10 | `on-primary-container` @ 0.08 / 0.10 / 0.10 |
| State layer | selected hover / focus / pressed | `on-secondary-container` @ same | `on-surface` @ same |
| Icon / label text | disabled | `on-surface` @ 0.38 | `on-surface` @ 0.38 |
| Button container | disabled | (derived: transparent — no token; unselected button container already equals the toolbar container) | same |
| FAB container / icon | — | `secondary-container` / `on-secondary-container` | `tertiary-container` #ffd8e4 / `on-tertiary-container` #633b48 |

Spec color diagrams (contained icon-button styles; informative):
- Standard: filled (primary / on-primary), toggle tonal (secondary-container / on-secondary-container), standard icon button (primary per diagram — tokens say on-surface-variant; see §11).
- Vibrant: filled (primary / on-primary), toggle tonal (surface-container / on-surface), standard (on-primary-container).
- Bottom app bar: container `surface-container`.

### 4.2 Size, layout & shape

**Docked**

| Property | Value |
| --- | --- |
| Height | 64 |
| Width | 100% of window |
| Leading / trailing padding | 16 / 16 (`space200`) — minimum |
| Gap between items | default 32 (`max-spacing`), min 4 (`min-spacing`); compact → evenly spaced |
| Alignment | contents vertically centered; medium+ → center all, or center key action + others to edges |
| Shape | `corner.none`; may be rounded on web/large screens only (derived radius: `corner.full` from color-set `container.shape`) |
| Elevation | none (level0) |

**Floating**

| Property | Value |
| --- | --- |
| Cross size | horizontal height 64 / vertical width 64 |
| Leading / trailing internal padding | 8 / 8 (`space100`) (vertical: top / bottom) |
| Gap between items | 4 (`space50`) |
| Margin to window/pane edge | horizontal ≥16 (`space200`), vertical ≥24 (`space300`) |
| Main size | hugs items; max = window/pane − 2×margin; may be capped further |
| Shape | `corner.full` |
| Elevation | level3 (6dp); may be removed over visually distinct content |

**Floating toolbar FAB**

| State | Size | Icon | Shape | Elevation |
| --- | --- | --- | --- | --- |
| Expanded (toolbar expanded) | 56×56 | 24 | `corner.large` (16) | level1 (1dp) |
| Collapsed (`medium`) | 80×80 | 28 | `corner.large-increased` (20) | level2 (3dp) |
| Gap toolbar ↔ FAB | 8 (`space100`) | | | |

General (source): all toolbars default to 64 high, center-aligned, equal padding between items, min outside padding 16; every element ≥48×48 target. Web/large screens may shrink height and use extra-small buttons only when vertical space is limited (derived: 48 min with XS 32 buttons + touch target primitive).

### 4.3 Typography
No toolbar typography tokens; placed components use their own (button label `label-large`, text field `body-large`, etc.).

### 4.4 Elevation
- Docked: level0. Floating: level3 (removable). FAB: level1 expanded / level2 collapsed. No state-driven elevation changes on the container.

### 4.5 Component token list

**Floating (`md.comp.toolbar.floating`)**
- md.comp.toolbar.floating.horizontal.container.height → 64dp
- md.comp.toolbar.floating.vertical.container.width → 64dp
- md.comp.toolbar.floating.container.leading-space → md.sys.measurement.space100 (8dp)
- md.comp.toolbar.floating.container.trailing-space → md.sys.measurement.space100 (8dp)
- md.comp.toolbar.floating.horizontal.container.external-space → md.sys.measurement.space200 (16dp)
- md.comp.toolbar.floating.vertical.container.external-space → md.sys.measurement.space300 (24dp)
- md.comp.toolbar.floating.container.between-space → md.sys.measurement.space50 (4dp)
- md.comp.toolbar.floating.container.shape → md.sys.shape.corner.full
- md.comp.toolbar.floating.container.elevation → md.sys.elevation.level3 (6dp)

**Docked (`md.comp.toolbar.docked`)**
- md.comp.toolbar.docked.container.height → 64dp
- md.comp.toolbar.docked.container.leading-space → md.sys.measurement.space200 (16dp)
- md.comp.toolbar.docked.container.trailing-space → md.sys.measurement.space200 (16dp)
- md.comp.toolbar.docked.container.max-spacing → 32dp
- md.comp.toolbar.docked.container.min-spacing → 4dp
- md.comp.toolbar.docked.container.shape → md.sys.shape.corner.none

**Floating FAB (`md.comp.toolbar.floating.fab`)**
- md.comp.toolbar.floating.fab.container.height → 56dp; .container.width → 56dp; .icon.size → 24dp
- md.comp.toolbar.floating.fab.container.shape → md.sys.shape.corner.large (16dp)
- md.comp.toolbar.floating.fab.container.elevation → md.sys.elevation.level1 (1dp)
- md.comp.toolbar.floating.fab.medium.container.height → 80dp; .medium.container.width → 80dp; .medium.icon.size → 28dp
- md.comp.toolbar.floating.fab.medium.container.shape → md.sys.shape.corner.large-increased (20dp)
- md.comp.toolbar.floating.fab.medium.container.elevation → md.sys.elevation.level2 (3dp)
- md.comp.toolbar.floating.fab.between-space → md.sys.measurement.space100 (8dp)
- md.comp.toolbar.floating.fab.standard.container.color → md.sys.color.secondary-container; .standard.icon.color → md.sys.color.on-secondary-container
- md.comp.toolbar.floating.fab.vibrant.container.color → md.sys.color.tertiary-container; .vibrant.icon.color → md.sys.color.on-tertiary-container

**Standard color (`md.comp.toolbar.standard.`)** (all colors `md.sys.color.*`)
- container.color → surface-container; container.shape → md.sys.shape.corner.full
- button.container.color → surface-container; selected.button.container.color → secondary-container
- icon.color, label-text.color → on-surface-variant; selected.icon.color, selected.label-text.color → on-secondary-container
- disabled.icon.color, disabled.label-text.color → on-surface; disabled.icon.opacity, disabled.label-text.opacity → 0.38
- {hovered,focused,pressed}.state-layer.color → on-surface-variant; selected.{hovered,focused,pressed}.state-layer.color → on-secondary-container
- hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08); focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.10); pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10)
- {hovered,focused,pressed}.{icon,label-text}.color → on-surface-variant; selected.{hovered,focused,pressed}.{icon,label-text}.color → on-secondary-container

**Vibrant color (`md.comp.toolbar.vibrant.`)**
- container.color → primary-container; container.shape → md.sys.shape.corner.full
- button.container.color → primary-container; selected.button.container.color → surface-container
- icon.color, label-text.color → on-primary-container; selected.icon.color, selected.label-text.color → on-surface
- disabled.icon.color, disabled.label-text.color → on-surface; disabled.*.opacity → 0.38
- {hovered,focused,pressed}.state-layer.color → on-primary-container; selected.{…}.state-layer.color → on-surface
- hovered/focused/pressed.state-layer.opacity → hover 0.08 / focus 0.10 / pressed 0.10 (sys state tokens)
- {hovered,focused,pressed}.{icon,label-text}.color → on-primary-container; selected.{…}.{icon,label-text}.color → on-surface

Note: color sets carry `container.shape` = `corner.full`; for docked the docked token `corner.none` wins (§11).

## 5. States & interaction

| Part \ state | Rest | Hover | Focus-visible | Pressed | Selected | Selected + hover/focus/press | Disabled |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Container | color set | — | — | — | — | — | — (individual items disable) |
| Item button container | `button.container` | same | same | same | `selected.button.container` | same | transparent (derived) |
| Item icon/label | `icon`/`label-text` | same | same | same | `selected.*` | same | on-surface @0.38 |
| Item state layer | — | color @0.08 | @0.10 + focus ring primitive | @0.10 + ripple primitive | — | `selected.*.state-layer` @0.08/0.10/0.10 | none |

- Touch: tap → ripple. Cursor: hover state; click → ripple in both selected and unselected states.
- Placed components otherwise follow their own specs (icon buttons, buttons, text fields, menus). Filled/tonal icon buttons placed for emphasis keep their own colors (§4.1 diagrams).

## 6. Motion & behavior
- **Scroll — docked**: stays, or animates offscreen (slide down).
- **Scroll — floating**: stays, animates offscreen, **or** collapses into a single high-emphasis action. Never collapse **and** move offscreen together.
- Collapse (source: Compose): all actions except the key one / FAB hide; FAB grows 56 → 80 (`fab` → `fab.medium` tokens).
- Springs (derived; source gives none): translate offscreen/onscreen → `spring-default-spatial` (partial-screen, per motion guidance); collapse/expand width, FAB size & radius → `spring-fast-spatial`; item opacity → `spring-fast-effects`; elevation/shadow → `spring-default-effects`.
- Hide/show trigger (derived): hide after ≥ 1 container height of downward scroll, show on any upward scroll, at scroll end, and whenever focus enters the toolbar.
- **Adaptive — docked**: always 100% width; compact → evenly spaced; medium+ → centered group, or key action centered + others to edges. Web/large: may be rounded and placed elsewhere on the page; dividers group many items.
- **Adaptive — floating**: as big as needed up to the 16 margin; excess trailing actions go into an overflow menu in the trailing slot, revealed again as width grows; width may be capped. No extra padding beyond items. Vertical not recommended in compact.
- **Multiple toolbars**: larger breakpoints only, at opposite edges, stylistically distinct. Compact → one toolbar.
- **RTL**: mirror icons/text that need it; if order matters flip it (e.g. "Next" stays on trailing edge). Logical properties handle padding/placement.

## 7. Usage guidelines
- Docked: bottom of window only; not with a navigation bar. Straight corners on mobile (rounded implies expansion). Any arrangement with ≥16 edge padding; 32 between items is only the default. Don't overload.
- Floating: fully visible on screen, never past window/pane edge → overflow menu. Horizontal ≥16 from edge; vertical ≥24, either side in larger breakpoints, **opposite the navigation rail** (use the centered rail configuration).
- Vertical: narrow or default icon buttons, **not wide**.
- No **square** icon buttons in floating toolbars (allowed in docked).
- Emphasize **one** action (filled/tonal/standard mix, custom color role, wide vs narrow, or a FAB). Not a filled button + FAB together; don't mix many control designs.
- FAB: next to a floating toolbar for the highest-priority action. Not extended FAB; not FAB menu (see buttons/fab-menu.md).

## 8. Accessibility
- Web: container `role="toolbar"` (source); name with `aria-label`/`aria-labelledby` (web mapping); `aria-orientation="vertical"` for vertical (web mapping).
- Initial focus on the first interactive element (source).
- Keyboard (source): **Tab or Arrows** navigate between interactive elements; **Space/Enter** activate. Web mapping: roving tabindex (single Tab stop; Left/Right — Up/Down when vertical — move, Home/End first/last; RTL reverses Left/Right). Exception: a toolbar containing a text field keeps arrows for caret movement inside it; Tab leaves the field.
- Toggle items `aria-pressed`; local-navigation items `aria-current="page"` (or tablist semantics).
- Overflow button `aria-haspopup="menu"` + `aria-expanded`.
- Disabled items: prefer `aria-disabled="true"` so they stay discoverable within the roving order (web mapping).
- Must stay reachable when hidden/collapsed on scroll: reveal on focus; hidden toolbar gets `inert` only when fully off screen.
- All targets ≥48×48 (touch target primitive).

## 9. Implementation checklist
- [ ] API: `variant` = `docked` | `floating`; `orientation` = `horizontal` | `vertical` (floating); `color` = `standard` | `vibrant`; `elevated` (floating, default true); `layout` (docked) = `even` | `center` | `edges`; `scroll-behavior` = `none` | `hide` | `collapse` (collapse floating only); `label`.
- [ ] Slots: default (items), `overflow` (trailing), `fab` (floating only).
- [ ] Toolbar publishes item color custom properties inherited by slotted icon buttons (selected/unselected/state layer).
- [ ] Docked: 64 high, 16 inline padding, gap 4–32, radius 0, no shadow, bottom + safe-area inset.
- [ ] Floating: inline-flex pill, 64 cross size, 8 padding, 4 gap, level3, max size = viewport − 2×margin; overflow detection with ResizeObserver.
- [ ] FAB: 8 gap; colors from color config; 56 ↔ 80 on collapse.
- [ ] Scroll hide or collapse (never both); reduced-motion; forced-colors.
- [ ] `role="toolbar"`, orientation, roving focus; RTL via logical properties.
- [ ] Bottom app bar: legacy alias of docked/standard if needed.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- floating + FAB (wrapper only when a FAB is present) -->
<div class="m3-toolbar-group" data-color="standard">
  <div class="m3-toolbar" part="container" role="toolbar" aria-label="Formatting"
       data-variant="floating" data-orientation="horizontal" data-color="standard">
    <button class="m3-toolbar__item" part="item" aria-pressed="false" aria-label="Bold"><span class="icon">format_bold</span></button>
    <button class="m3-toolbar__item" part="item" aria-pressed="true" aria-label="Italic"><span class="icon">format_italic</span></button>
    <button class="m3-toolbar__item" part="item" aria-disabled="true" aria-label="Underline"><span class="icon">format_underlined</span></button>
    <button class="m3-toolbar__overflow" part="overflow" aria-haspopup="menu" aria-expanded="false" aria-label="More"><span class="icon">more_vert</span></button>
  </div>
  <button class="m3-toolbar__fab" part="fab" aria-label="Add"><span class="icon">add</span></button>
</div>
<!-- docked -->
<div class="m3-toolbar" role="toolbar" aria-label="Message actions" data-variant="docked" data-layout="even">…</div>
```
Items are icon buttons / buttons per their own files (state layer, focus ring, ripple, touch target primitives).

**(b) Custom properties**
```css
.m3-toolbar {
  --md-comp-toolbar-docked-container-height: 64px;
  --md-comp-toolbar-docked-container-leading-space: var(--md-sys-measurement-space200);
  --md-comp-toolbar-docked-container-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-toolbar-docked-container-max-spacing: 32px;
  --md-comp-toolbar-docked-container-min-spacing: 4px;
  --md-comp-toolbar-docked-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-toolbar-floating-container-size: 64px;            /* h-height / v-width */
  --md-comp-toolbar-floating-container-leading-space: var(--md-sys-measurement-space100);
  --md-comp-toolbar-floating-container-trailing-space: var(--md-sys-measurement-space100);
  --md-comp-toolbar-floating-container-between-space: var(--md-sys-measurement-space50);
  --md-comp-toolbar-floating-horizontal-container-external-space: var(--md-sys-measurement-space200);
  --md-comp-toolbar-floating-vertical-container-external-space: var(--md-sys-measurement-space300);
  --md-comp-toolbar-floating-container-shape: var(--md-sys-shape-corner-full);
  --md-comp-toolbar-floating-container-elevation: var(--md-sys-elevation-level3);
}
.m3-toolbar[data-color="standard"], .m3-toolbar-group[data-color="standard"] {
  --_container: var(--md-sys-color-surface-container);
  --_btn: var(--md-sys-color-surface-container);
  --_btn-selected: var(--md-sys-color-secondary-container);
  --_on: var(--md-sys-color-on-surface-variant);
  --_on-selected: var(--md-sys-color-on-secondary-container);
  --_fab: var(--md-sys-color-secondary-container);
  --_on-fab: var(--md-sys-color-on-secondary-container);
}
.m3-toolbar[data-color="vibrant"], .m3-toolbar-group[data-color="vibrant"] {
  --_container: var(--md-sys-color-primary-container);
  --_btn: var(--md-sys-color-primary-container);
  --_btn-selected: var(--md-sys-color-surface-container);
  --_on: var(--md-sys-color-on-primary-container);
  --_on-selected: var(--md-sys-color-on-surface);
  --_fab: var(--md-sys-color-tertiary-container);
  --_on-fab: var(--md-sys-color-on-tertiary-container);
}
```

**Layout**
```css
.m3-toolbar { display: flex; align-items: center; box-sizing: border-box; background: var(--_container); }
.m3-toolbar[data-variant="docked"] {
  position: fixed; inset-inline: 0; inset-block-end: 0;
  min-block-size: calc(var(--md-comp-toolbar-docked-container-height) + env(safe-area-inset-bottom));
  padding-block-end: env(safe-area-inset-bottom);
  padding-inline: var(--md-comp-toolbar-docked-container-leading-space) var(--md-comp-toolbar-docked-container-trailing-space);
  border-radius: var(--md-comp-toolbar-docked-container-shape);
  gap: var(--md-comp-toolbar-docked-container-min-spacing);
  justify-content: space-evenly;                         /* data-layout="even" (compact default) */
}
.m3-toolbar[data-variant="docked"][data-layout="center"] { justify-content: center; gap: var(--md-comp-toolbar-docked-container-max-spacing); }
.m3-toolbar[data-variant="docked"][data-layout="edges"] { justify-content: space-between; } /* key action centered via order/auto margins */
.m3-toolbar[data-variant="floating"] {
  display: inline-flex; border-radius: var(--md-comp-toolbar-floating-container-shape);
  box-shadow: var(--md-comp-toolbar-floating-container-elevation);  /* elevation primitive */
  gap: var(--md-comp-toolbar-floating-container-between-space);
  block-size: var(--md-comp-toolbar-floating-container-size);
  padding-inline: var(--md-comp-toolbar-floating-container-leading-space) var(--md-comp-toolbar-floating-container-trailing-space);
  max-inline-size: calc(100% - 2 * var(--md-comp-toolbar-floating-horizontal-container-external-space));
}
.m3-toolbar[data-variant="floating"][data-orientation="vertical"] {
  flex-direction: column; block-size: auto; inline-size: var(--md-comp-toolbar-floating-container-size);
  padding-inline: 0;
  padding-block: var(--md-comp-toolbar-floating-container-leading-space) var(--md-comp-toolbar-floating-container-trailing-space);
  max-block-size: calc(100% - 2 * var(--md-comp-toolbar-floating-vertical-container-external-space));
}
.m3-toolbar[data-elevated="false"] { box-shadow: none; }
.m3-toolbar-group { position: fixed; inset-block-end: var(--md-comp-toolbar-floating-horizontal-container-external-space);
  inset-inline: 0; margin-inline: auto; inline-size: fit-content; display: flex; align-items: center;
  gap: var(--md-sys-measurement-space100); }                   /* fab.between-space */
.m3-toolbar__fab {
  inline-size: 56px; block-size: 56px; --_icon: 24px;
  border-radius: var(--md-sys-shape-corner-large); box-shadow: var(--md-sys-elevation-level1);
  background: var(--_fab); color: var(--_on-fab); border: 0;
}
.m3-toolbar-group[data-collapsed] .m3-toolbar__fab {
  inline-size: 80px; block-size: 80px; --_icon: 28px;
  border-radius: var(--md-sys-shape-corner-large-increased); box-shadow: var(--md-sys-elevation-level2);
}
```

**(c) Item states** (applied to placed standard icon buttons/buttons; filled/tonal emphasis buttons keep their own tokens)
```css
.m3-toolbar__item, .m3-toolbar__overflow { background: var(--_btn); color: var(--_on); --_sl: var(--_on); }
.m3-toolbar__item[aria-pressed="true"], .m3-toolbar__item[aria-current="page"] {
  background: var(--_btn-selected); color: var(--_on-selected); --_sl: var(--_on-selected); }
/* state layer primitive uses --_sl at hover 0.08 / focus 0.10 / pressed 0.10 */
.m3-toolbar__item:is(:disabled,[aria-disabled="true"]) {
  background: transparent; color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
.m3-toolbar__item:is(:disabled,[aria-disabled="true"])::before { display: none; } /* no state layer */
/* focus ring primitive on :focus-visible (outer offset) */
```

**(d) Motion**
```css
.m3-toolbar, .m3-toolbar-group {
  transition: transform var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
              box-shadow var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing);
}
.m3-toolbar[data-variant="docked"][data-hidden] { transform: translateY(100%); }
.m3-toolbar-group[data-hidden], .m3-toolbar[data-variant="floating"][data-hidden] {
  transform: translateY(calc(100% + var(--md-comp-toolbar-floating-horizontal-container-external-space))); }
.m3-toolbar__fab { transition-property: inline-size, block-size, border-radius;
  transition-duration: var(--md-sys-motion-spring-fast-spatial-duration);
  transition-timing-function: var(--md-sys-motion-spring-fast-spatial-easing); }
.m3-toolbar-group[data-collapsed] .m3-toolbar > :not([data-key]) { display: none; } /* or animate width+opacity (fast spatial / fast effects) */
@media (prefers-reduced-motion: reduce) {
  .m3-toolbar, .m3-toolbar-group, .m3-toolbar__fab { transition-duration: 0s; }
  /* or swap translate for an opacity fade using spring-fast-effects */
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .m3-toolbar { border: 1px solid CanvasText; box-shadow: none; }
  .m3-toolbar__item[aria-pressed="true"], .m3-toolbar__item[aria-current="page"] {
    background: Highlight; color: HighlightText; forced-color-adjust: none; }
  .m3-toolbar__item:is(:disabled,[aria-disabled="true"]) { color: GrayText; }
  .m3-toolbar__fab { border: 1px solid ButtonText; }
}
```

**(f) Behaviour / JS**
- Roving tabindex: one item `tabindex="0"`, others `-1`; arrows per orientation (Left/Right mirrored in RTL), Home/End; skip arrow handling while focus is in a text input. Disabled (`aria-disabled`) items remain focusable but ignore activation.
- Toggle items: flip `aria-pressed` on click; local-nav items set `aria-current`.
- Overflow (floating): ResizeObserver on the container's available space; move trailing items (from the end) into the overflow menu until it fits; restore when space grows. Hide the overflow button when empty.
- Scroll (`scroll-behavior`): track scroll direction on the scroll container; `hide` toggles `[data-hidden]`; `collapse` toggles `[data-collapsed]` on the group. Never both. Remove `[data-hidden]` on `focusin`; set `inert` on the toolbar only after the hide transition ends.
- FAB stays a separate `<button>`; it is not part of the toolbar's roving order (own Tab stop after the toolbar).

## 11. Source gaps & decisions
- Color sets define `container.shape = corner.full` for both docked and floating; docked set says `corner.none` → docked uses `corner.none`, `corner.full` used only for the optional rounded docked on web/large screens.
- Standard color diagram labels the standard icon button "Primary"; tokens say `on-surface-variant` → tokens win.
- No disabled button-container token → transparent (derived), no state layer (per guidelines Interaction states).
- No motion tokens/durations for hide, show or collapse → springs chosen in §6 (derived from motion guidance: partial-screen = default spatial).
- Docked `max-spacing`/`min-spacing` don't say how to distribute → compact `space-evenly` with min gap 4; medium+ `center` with gap 32 (derived from adaptive guidance).
- Collapse-to-key-action is documented as Compose-only → on web provided as opt-in `collapse` behaviour; FAB 56→80 per `fab.medium` tokens.
- Docked elevation not tokenized; M2 diff says "no shadow" → level0.
- Bottom app bar specs say "one token set" but only repeat toolbar sets (no height token) → treat as docked standard alias.
- Scroll hide threshold, reveal-on-focus and `inert` handling are not in the source → web mappings in §6/§10f.
- Source allows "Tab or Arrows"; roving tabindex chosen (APG toolbar pattern) for a single Tab stop.
