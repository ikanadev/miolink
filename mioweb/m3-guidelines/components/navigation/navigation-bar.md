# Navigation bar

> Source: https://m3.material.io/components/navigation-bar · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview

A bottom bar that switches between 3–5 top-level destinations of equal importance. Destinations are fixed and consistent across app screens; exactly one is always active.

**Use when**
- 3–5 main pages of the product, on compact or medium windows (mobile/tablet).

**Don't use when**
- Fewer than 3 destinations → use tabs.
- More than 5 → use tabs within a page, or a modal expanded navigation rail behind a menu icon.
- Single tasks (e.g. viewing one email).
- Expanded / extra-large windows or desktop → use a navigation rail (or tabs).

**M3 Expressive changes (May 2025)**
- New **flexible navigation bar** replaces the baseline navigation bar (no longer recommended): shorter height (64dp), supports **horizontal** nav items in medium windows.
- Active label color changed from `on-surface-variant` to **`secondary`**.
- vs. M2: renamed from "bottom navigation"; no shadow; pill-shaped active indicator; dynamic color.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Flexible navigation bar | Recommended (Expressive) | 64dp container, full width, surface-container fill |
| Navigation bar (baseline) | Not recommended | Source repeats the same token set; baseline color diagram shows container = surface, active label = on-surface. Its taller height is only in images (not in text) — not documented here |
| Item layout: **vertical** (default) | Icon above label; indicator 56×32 behind icon | Compact windows. Items stretch to equally share container width |
| Item layout: **horizontal** | Icon + label side by side inside a 40dp-tall indicator | Medium windows. Fixed-width items, centered; extra space goes to outer margins |
| Destinations | 3, 4 or 5 | Never fewer than 3 or more than 5 |
| Badges | Small badge (dot) or large badge (count) | Optional, overlap icon top-right in both layouts |

## 3. Anatomy

1. **Container** — full-width bottom surface.
2. **Navigation item** — the interactive destination (holds icon, label, indicator).
3. **Icon** — 24dp; filled when active, outlined when inactive.
4. **Label text** — required, 1–2 words.
5. **Active indicator** — full-rounded pill behind icon (vertical) or icon+label (horizontal); only on the active item.
6. **State layer** — hover/focus/pressed overlay on the indicator area.
7. **Small badge** (optional).
8. **Large badge** + **large badge label** (optional).
9. **Focus ring** (web).

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | — | `md.comp.nav-bar.container.color` | `--md-sys-color-surface-container` (#f3edf7) |
| Active indicator | Active | `md.comp.nav-bar.item.active.indicator.color` | `--md-sys-color-secondary-container` (#e8def8) |
| Icon | Active | `md.comp.nav-bar.item.active.icon.color` | `--md-sys-color-on-secondary-container` (#4a4458) |
| Icon | Inactive | `md.comp.nav-bar.item.inactive.icon.color` | `--md-sys-color-on-surface-variant` (#49454f) |
| Label | Active | `md.comp.nav-bar.item.active.label-text.color` | `--md-sys-color-secondary` (#625b71) |
| Label | Inactive | `md.comp.nav-bar.item.inactive.label-text.color` | `--md-sys-color-on-surface-variant` (#49454f) |
| State layer | Hover (active & inactive) | `md.comp.nav-bar.item.{active,inactive}.hovered.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-hover-state-layer-opacity` (0.08) |
| State layer | Focus (active & inactive) | `…focused.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-focus-state-layer-opacity` (0.10) |
| State layer | Pressed (active & inactive) | `…pressed.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-pressed-state-layer-opacity` (0.10) |
| Shadow color | — | `md.comp.nav-bar.container.shadow-color` | `--md-sys-color-shadow` |
| Focus ring | Focus | — (system) | `--md-sys-color-secondary` (focus ring primitive) |

- Inactive state-layer opacities are not separately tokenized; use the same system opacities (0.08 / 0.10 / 0.10).
- Badge colors: see badge spec.
- Disabled state: none (navigation bar is in the "not inherited by" list for disabled in guidelines).

### 4.2 Size, layout & shape

| Spec | Vertical item | Horizontal item |
| --- | --- | --- |
| Container height | 64dp (min; grows with text scaling) | 64dp |
| Active indicator size | 56dp × 32dp | height 40dp; width = 16 + icon 24 + 4 + label + 16 (hug) |
| Indicator inline padding | — (icon centered) | leading 16dp, trailing 16dp |
| Icon–label space | 4dp (label below indicator) | 4dp (inside indicator) |
| Item block padding | 6dp top & bottom (`item.vertical.container.between-space`; derived: 6 + 32 + 4 + 16 label line + 6 = 64) | centered: (64 − 40) / 2 = 12dp (derived) |
| Item width | flexible, equal share of container width | fixed (hug); group centered; extra space goes to outer margins |

Common:
- Icon size 24dp. Item gap (`item.between-space`) 0dp.
- Indicator shape `--md-sys-shape-corner-full`. Container shape `--md-sys-shape-corner-none`.
- Container spans 100% of window width; items centered within it.
- Touch target: whole item area (vertical: full-height equal segment; horizontal: full 64dp height × item width) — always ≥48×48dp.
- Horizontal items: exact outer margins and per-item width are in measurement images only. Decision (derived): all horizontal items share the width of the widest pill (`grid-auto-columns: 1fr` in a centered grid), group centered; gap 0 per `item.between-space`. Spacing stays identical across medium/expanded widths; only outer margins change.
- Large text: bar grows vertically to fit wrapped labels while keeping default padding.

### 4.3 Typography

| Part | State | Typescale |
| --- | --- | --- |
| Label (vertical & horizontal) | Inactive | `--md-sys-typescale-label-medium-*` (Roboto 500 12/16, tracking 0.5) |
| Label (vertical & horizontal) | Active | same, with weight `--md-sys-typescale-emphasized-label-medium-weight` (700) |

- Token `label-text.font` → `md.sys.typescale.label-medium` for both states. The Accessibility tab asks for a **bold** label when selected and **medium** when unselected; the emphasized label-medium role is the system's bold variant of the same role (derived: only weight changes, so no layout shift beyond glyph width).

### 4.4 Elevation

| State | Token | Value |
| --- | --- | --- |
| Enabled | `md.comp.nav-bar.container.elevation` | `--md-sys-elevation-level2` (3dp) |

Note: the guidelines say M3 nav bars have **no shadow**; separation is by the surface-container color fill. Implement the elevation tonally (color only); no visible box-shadow (decision, see §11).

### 4.5 Component token list

**`md.comp.nav-bar` (common)**
- container.height → 64dp
- container.shape → md.sys.shape.corner.none
- container.color → md.sys.color.surface-container
- container.elevation → md.sys.elevation.level2
- container.shadow-color → md.sys.color.shadow
- item.between-space → md.sys.measurement.space0 (0dp)
- item.icon.size → 24dp
- item.active-indicator.shape → md.sys.shape.corner.full
- item.active-indicator.icon-label-space → 4dp
- item.active.indicator.color → md.sys.color.secondary-container
- item.active.icon.color → md.sys.color.on-secondary-container
- item.inactive.icon.color → md.sys.color.on-surface-variant
- item.active.label-text.color → md.sys.color.secondary
- item.inactive.label-text.color → md.sys.color.on-surface-variant
- item.active.hovered.state-layer.color → md.sys.color.on-secondary-container
- item.active.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- item.inactive.hovered.state-layer.color → md.sys.color.on-secondary-container
- item.active.focused.state-layer.color → md.sys.color.on-secondary-container
- item.active.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
- item.inactive.focused.state-layer.color → md.sys.color.on-secondary-container
- item.active.pressed.state-layer.color → md.sys.color.on-secondary-container
- item.active.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
- item.inactive.pressed.state-layer.color → md.sys.color.on-secondary-container

**`md.comp.nav-bar.item.vertical`**
- label-text.font → md.sys.typescale.label-medium
- active-indicator.height → 32dp
- active-indicator.width → 56dp
- container.between-space → md.sys.measurement.space75 (6dp)
- active-indicator.icon-label-space → md.sys.measurement.space50 (4dp)

**`md.comp.nav-bar.item.horizontal`**
- label-text.font → md.sys.typescale.label-medium
- active-indicator.height → 40dp
- active-indicator.leading-space → md.sys.measurement.space200 (16dp)
- active-indicator.trailing-space → md.sys.measurement.space200 (16dp)
- active-indicator.icon-label-space → md.sys.measurement.space50 (4dp)

## 5. States & interaction

| State | Icon | Label | Indicator | State layer |
| --- | --- | --- | --- | --- |
| Inactive | outlined, on-surface-variant | on-surface-variant, 500 | none | — |
| Inactive + hover | outlined, on-surface-variant | unchanged | appears in a **reduced** state (derived: scaleX 0.5 → visible area, color secondary-container) | 0.08 on-secondary-container |
| Inactive + focus | as inactive | unchanged | none | 0.10 + focus ring |
| Inactive + pressed | switches to filled on selection | — | expands from icon center | 0.10 + ripple |
| Active | filled (or semibold if no filled glyph), on-secondary-container | secondary, 700 | secondary-container pill | — |
| Active + hover / focus / pressed | unchanged | unchanged | unchanged | 0.08 / 0.10 (+ ring) / 0.10 (+ ripple) |

- State layer and ripple are clipped to the indicator pill (vertical 56×32; horizontal 40dp-high pill), not the whole item.
- Re-selecting the active item scrolls its page to top.
- Keyboard: Tab moves between items; Space/Enter selects.

## 6. Motion & behavior

- **Selection**: active indicator expands from the center of the icon on **one axis only** (width) — `transform: scaleX(0→1)` with the fast spatial spring (spring primitive, `--md-sys-motion-spring-fast-spatial-*`); icon fill/color and label color/weight with the fast effects spring (derived: guidelines state all component motion uses expressive fast spatial/effects; source gives no durations).
- **Navigation**: top-level (fade-through) transition to the destination screen. Destination state can be **preserved** (scroll position, tab, inline search) or **reset** — product decision; frequent switching → preserve.
- **No swipe** between destinations.
- **Scroll**: bar may hide when scrolling down and reveal when scrolling up (translateY 100%, enter/exit beyond bounds). **Never hide while a screen reader is active.**
- **Temporary coverage**: may be covered by dialogs, bottom sheets, drawers, on-screen keyboard during a flow; never permanently obstructed.
- **Adaptive**: Compact → nav bar (vertical items) or modal nav rail. Medium → nav bar (horizontal items) or nav rail. Expanded / extra-large → navigation rail. Container always 100% width; horizontal items stay centered with same spacing.
- **Text scaling**: bar grows vertically; labels may wrap with scaled text; full label must be visible up to 2× text size, truncation allowed beyond.

## 7. Usage guidelines

- Always at bottom of window, full width. FAB sits above the nav bar, end-aligned; never overlaps the bar.
- 3–5 destinations; fixed positions — never scroll or reorder them.
- Every item needs a label (1–2 words); don't remove labels, don't wrap/truncate (at default size), don't shrink text to fit.
- Icons symbolize the page; filled for active, outlined for inactive; if no filled variant, use semibold weight.
- Active and inactive icons ≥3:1 contrast with container; no multiple/low-contrast colors.
- Active indicator only on one destination at a time.
- Badges: top-right of the icon (overlapping it) in both layouts; small badge = update, large badge = count.
- Use nav bar for distinct pages; tabs for related content within a page.

## 8. Accessibility

- **Roles (web mapping)**: `<nav aria-label="…">` wrapping `<ul>`; each item `<a href>` with `aria-current="page"` on the active one, or `<button aria-current="page">` for in-app state. `role="tablist"` is **not** used because the source specifies Tab (not arrow-key) navigation.
- Accessible name = destination name; add context when ambiguous (visible "Library" → `aria-label="Music library"`).
- Badges: include count/status in the accessible name or via `aria-describedby` ("Messages, 3 new") (web mapping).
- Icons are decorative (`aria-hidden="true"`).
- Initial focus: first navigation item.
- Don't hide the bar on scroll when assistive tech is in use (web: opt-out flag; always reveal on `:focus-within`).
- Selected state must not rely on color only: filled icon + indicator + bold label.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move between navigation items |
| Space / Enter | Select the focused navigation item (Space on `<a>` needs JS, web mapping) |

- Touch target ≥48×48dp. Icon contrast ≥3:1 with container. Labels visible at up to 200% text size.

## 9. Implementation checklist

Suggested API:
- Container: `layout`: `vertical | horizontal | auto` (auto: vertical <600px, horizontal 600–839px); `value`; `hide-on-scroll` (boolean); event `change` (detail: value); event `reselect` (for scroll-to-top).
- Item: `label` (required), `icon` & `active-icon` slots (outlined/filled), `href` (optional), `active` (reflected), `badge` (`none | dot | number`), `badge-value`, `aria-label` override.

Internals & edge cases:
- [ ] Enforce 3–5 items (dev warning otherwise).
- [ ] 64dp min-height, grows with text scaling; surface-container fill; no box-shadow.
- [ ] Vertical: equal-width items; 6dp top padding; 56×32 pill behind icon; 4dp gap to label.
- [ ] Horizontal: equal fixed-width items (widest pill), group centered; 40dp pill with 16dp side padding and 4dp icon–label gap.
- [ ] State layer + ripple clipped to the pill; hover shows reduced indicator on inactive items.
- [ ] Indicator enter animation: scaleX from center (one axis only).
- [ ] Icon swap outlined → filled (or font-variation `FILL` 1 / `wght` 600 for variable icon fonts).
- [ ] Label weight 700 active, 500 inactive; never truncate below 2× text size.
- [ ] Badge positioned at icon top-right, mirrored in RTL.
- [ ] Hide/reveal on scroll; never hide when focus is inside or AT opt-out set.
- [ ] Safe-area inset padding at bottom (`env(safe-area-inset-bottom)`).

## 10. HTML/CSS implementation blueprint

**(a) DOM** — one label element; the layout switches with CSS grid only.
```html
<nav class="md-nav-bar" data-layout="vertical" aria-label="Main">
  <ul class="md-nav-bar__list" role="list">
    <li>
      <a class="md-nav-item" href="/home" aria-current="page">
        <span class="md-nav-item__indicator" part="indicator" aria-hidden="true">
          <span class="md-nav-item__state-layer"></span>   <!-- + ripple primitive -->
        </span>
        <span class="md-nav-item__icon" part="icon" aria-hidden="true">
          <!-- outlined glyph; filled glyph when active -->
          <span class="md-badge" hidden></span>            <!-- see badges.md -->
        </span>
        <span class="md-nav-item__label" part="label">Home</span>
      </a>
    </li>
    <!-- 3–5 items -->
  </ul>
</nav>
```

**(b) Custom properties & layout**
```css
.md-nav-bar {
  --md-comp-nav-bar-container-height: 64px;
  --md-comp-nav-bar-container-color: var(--md-sys-color-surface-container);
  --md-comp-nav-bar-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-nav-bar-container-elevation: var(--md-sys-elevation-level2); /* tonal only, no shadow */
  --md-comp-nav-bar-item-between-space: var(--md-sys-measurement-space0);
  --md-comp-nav-bar-item-icon-size: 24px;
  --md-comp-nav-bar-item-active-indicator-shape: var(--md-sys-shape-corner-full);
  --md-comp-nav-bar-item-active-indicator-color: var(--md-sys-color-secondary-container);
  --md-comp-nav-bar-item-active-icon-color: var(--md-sys-color-on-secondary-container);
  --md-comp-nav-bar-item-inactive-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-nav-bar-item-active-label-text-color: var(--md-sys-color-secondary);
  --md-comp-nav-bar-item-inactive-label-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-nav-bar-item-state-layer-color: var(--md-sys-color-on-secondary-container);
  --md-comp-nav-bar-item-vertical-active-indicator-width: 56px;
  --md-comp-nav-bar-item-vertical-active-indicator-height: 32px;
  --md-comp-nav-bar-item-vertical-container-between-space: var(--md-sys-measurement-space75);
  --md-comp-nav-bar-item-horizontal-active-indicator-height: 40px;
  --md-comp-nav-bar-item-horizontal-active-indicator-leading-space: var(--md-sys-measurement-space200);
  --md-comp-nav-bar-item-horizontal-active-indicator-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-nav-bar-item-active-indicator-icon-label-space: var(--md-sys-measurement-space50);

  position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 2;  /* derived */
  background: var(--md-comp-nav-bar-container-color);
  border-radius: var(--md-comp-nav-bar-container-shape);
  padding-block-end: env(safe-area-inset-bottom, 0px);
}
.md-nav-bar__list {
  display: flex; gap: var(--md-comp-nav-bar-item-between-space);
  margin: 0; padding: 0; list-style: none;
  min-block-size: var(--md-comp-nav-bar-container-height);
}
.md-nav-bar__list > li { flex: 1 1 0; min-inline-size: 0; display: flex; }

/* vertical item (default) */
.md-nav-item {
  flex: 1; display: grid; justify-items: center; align-content: start;
  grid-template-areas: "icon" "label";
  grid-template-rows: var(--md-comp-nav-bar-item-vertical-active-indicator-height) auto;
  row-gap: var(--md-comp-nav-bar-item-active-indicator-icon-label-space);
  padding-block: var(--md-comp-nav-bar-item-vertical-container-between-space);
  color: var(--md-comp-nav-bar-item-inactive-label-text-color);
  text-decoration: none; outline: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.md-nav-item__indicator {
  grid-area: icon; position: relative; isolation: isolate; overflow: hidden;
  inline-size: var(--md-comp-nav-bar-item-vertical-active-indicator-width);
  block-size: var(--md-comp-nav-bar-item-vertical-active-indicator-height);
  border-radius: var(--md-comp-nav-bar-item-active-indicator-shape);
}
.md-nav-item__indicator::before {                       /* the visible pill */
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: var(--md-comp-nav-bar-item-active-indicator-color);
  transform: scaleX(0); opacity: 0;
}
.md-nav-item__state-layer { position: absolute; inset: 0; border-radius: inherit;
  background: var(--md-comp-nav-bar-item-state-layer-color); opacity: 0; }
.md-nav-item__icon {
  grid-area: icon; align-self: center; position: relative; z-index: 1;
  inline-size: var(--md-comp-nav-bar-item-icon-size); block-size: var(--md-comp-nav-bar-item-icon-size);
  font-size: var(--md-comp-nav-bar-item-icon-size); color: var(--md-comp-nav-bar-item-inactive-icon-color);
}
.md-nav-item__label {
  grid-area: label; position: relative; z-index: 1; max-inline-size: 100%;
  font: var(--md-sys-typescale-label-medium-weight) var(--md-sys-typescale-label-medium-size)/var(--md-sys-typescale-label-medium-line-height) var(--md-sys-typescale-label-medium-font);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  text-align: center; overflow-wrap: anywhere;          /* may wrap only under text scaling */
}

/* horizontal item: pill wraps icon + label */
.md-nav-bar[data-layout="horizontal"] .md-nav-bar__list {
  display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;  /* equal width = widest item */
  justify-content: center;
}
.md-nav-bar[data-layout="horizontal"] .md-nav-bar__list > li { flex: none; justify-content: center; }
.md-nav-bar[data-layout="horizontal"] .md-nav-item {
  flex: none; grid-template-areas: "icon label"; grid-template-rows: var(--md-comp-nav-bar-item-horizontal-active-indicator-height);
  grid-template-columns: var(--md-comp-nav-bar-item-icon-size) auto; align-content: center; align-items: center;
  column-gap: var(--md-comp-nav-bar-item-active-indicator-icon-label-space);
  padding-block: 0;
  padding-inline: var(--md-comp-nav-bar-item-horizontal-active-indicator-leading-space) var(--md-comp-nav-bar-item-horizontal-active-indicator-trailing-space);
}
.md-nav-bar[data-layout="horizontal"] .md-nav-item__indicator {
  grid-area: 1 / 1 / 2 / -1; inline-size: auto; justify-self: stretch;
  block-size: var(--md-comp-nav-bar-item-horizontal-active-indicator-height);
  margin-inline: calc(-1 * var(--md-comp-nav-bar-item-horizontal-active-indicator-leading-space)) calc(-1 * var(--md-comp-nav-bar-item-horizontal-active-indicator-trailing-space));
}
.md-nav-bar[data-layout="horizontal"] .md-nav-item__label { white-space: nowrap; text-align: start; }
.md-badge { position: absolute; inset-block-start: -2px; inset-inline-start: calc(100% - 6px); } /* derived; RTL via logical props */
```
In horizontal layout the `<a>` (64dp tall row cell) remains the hit target; the pill is 40dp, vertically centered.

**(c) States**
```css
.md-nav-item[aria-current="page"] { color: var(--md-comp-nav-bar-item-active-label-text-color); }
.md-nav-item[aria-current="page"] .md-nav-item__indicator::before { transform: none; opacity: 1; }
.md-nav-item[aria-current="page"] .md-nav-item__icon {
  color: var(--md-comp-nav-bar-item-active-icon-color); font-variation-settings: "FILL" 1; }
.md-nav-item[aria-current="page"] .md-nav-item__label { font-weight: var(--md-sys-typescale-emphasized-label-medium-weight); }
/* state layer primitive (clipped to the pill) */
@media (hover: hover) {
  .md-nav-item:hover .md-nav-item__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
  .md-nav-item:not([aria-current="page"]):hover .md-nav-item__indicator::before { transform: scaleX(.5); opacity: 1; } /* reduced indicator, derived */
}
.md-nav-item:focus-visible .md-nav-item__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-nav-item:active .md-nav-item__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
/* focus ring primitive on the pill; overflow:hidden clips outlines only of children, not the element itself */
.md-nav-item:focus-visible .md-nav-item__indicator {
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
}
```
No disabled state.

**(d) Motion**
```css
.md-nav-item__indicator::before {
  transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
              opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
.md-nav-item__icon, .md-nav-item, .md-nav-item__state-layer {
  transition: color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
              opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
.md-nav-bar { transition: transform var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-easing-standard); }
.md-nav-bar[data-hidden] { transform: translateY(100%); }
@media (prefers-reduced-motion: reduce) {
  .md-nav-item__indicator::before { transition-property: opacity; transform: none; }
  .md-nav-bar { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
}
```
Hide-on-scroll uses the standard easing (not the bouncy spring) per "common transitions must not use bouncy springs".

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-nav-bar { border-block-start: 1px solid CanvasText; }
  .md-nav-item[aria-current="page"] .md-nav-item__indicator::before { background: Highlight; forced-color-adjust: none; }
  .md-nav-item[aria-current="page"] .md-nav-item__icon { color: HighlightText; forced-color-adjust: none; }
  .md-nav-item:focus-visible .md-nav-item__indicator { outline-color: CanvasText; }
}
```

**(f) Behaviour / JS**
- Click/Enter/Space on an item: set `aria-current="page"` on it, remove from others; dispatch `change`. If already active, dispatch `reselect` (consumer scrolls to top). Space on `<a>` → `preventDefault()` + `click()`.
- Layout: `ResizeObserver`/container query on window width → `data-layout` vertical (<600px) / horizontal (600–839px) when `layout="auto"`.
- Hide-on-scroll: listen to scroll direction on the scroll container; set `data-hidden` on downward scroll, clear on upward; never set while `:focus-within` or the AT opt-out is active.
- Dev warning if item count is outside 3–5.

## 11. Source gaps & decisions

- Previous draft used an invented "label-medium weight prominent" token (not a system token); source only says "bold label" when selected → mapped to `--md-sys-typescale-emphasized-label-medium-weight` (700), the system's bold variant of label-medium.
- Inactive focused/hovered/pressed opacities not tokenized → reuse the active opacities (same system tokens).
- Token sets for the baseline bar are identical to the flexible set in the source; baseline height/colors differ only in images → baseline not specified separately; recommend the flexible bar.
- Container elevation token = level2, but text says "no shadow" → tonal only, no box-shadow.
- Vertical top/bottom padding not stated → `item.vertical.container.between-space` (6dp) interpreted as block padding (sums to 64dp exactly).
- Horizontal item width and outer margins only in images → equal-width items sized to the widest pill, group centered, gap 0 (`item.between-space`).
- "Reduced" hover indicator has no dimensions → scaleX(0.5) of the pill (derived).
- No motion durations/springs given → fast spatial spring for the indicator width, fast effects for colors (per guidelines' "all component motion uses fast spatial/effects").
- Badge offset only in images → defer to badges.md; positioned at the icon's top-end corner.
- z-index not given → 2 (below scrims, sheets and dialogs that may temporarily cover it).
