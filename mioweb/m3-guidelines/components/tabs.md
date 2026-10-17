# Tabs

> Source: https://m3.material.io/components/tabs · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
- Tabs organize groups of **related** content at the **same level of hierarchy**; tabs sit next to each other as peers.
- Two variants: **primary** (top of content pane, under an app bar; main destinations) and **secondary** (within a content area, a further level of hierarchy).
- Tab sets can be fixed or horizontally scrollable, so a UI can have as many tabs as needed.
- Don't use for **sequential** content (e.g. Chapter 1, 2, 3…) — use typography and space for hierarchy instead.
- Differences from M2: new color mappings + dynamic color; icons and labels vertically centered in the container.
- M3 Expressive: the source lists no Expressive-specific changes for tabs (no shape morph, no new sizes).

## 2. Variants & configurations
| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Primary tabs | Main content destinations, below top app bar. | Indicator 3dp, top radii 3dp, inset 2dp each side of the content, min length 24dp; active label & icon = `primary`. |
| Secondary tabs | Second level within content; always below primary tabs. | Indicator 2dp, full tab width (derived: "simpler style of indicator"); active label & icon = `on-surface`. Anatomy has no icon in the source diagram, but icon tokens exist → icons allowed. |
| Label only | Text label. | Height 48dp. |
| Icon + label (stacked) | Icon above label. | Height 64dp (primary token; secondary derived: same 64dp). Badge overlaps stacked icon by 6dp. |
| Icon + label (inline) | Icon beside label. | 8dp gap icon↔label; height 48dp (derived: single row fits 48dp). |
| Icon only | Icon, no visible label. | Only with globally recognized icons; needs accessible name; height 48dp (derived). |
| With badge | Small or large badge (see badges.md). | Inline label→badge gap 4dp; max 4 characters incl. "+". |
| Fixed | All tabs visible; equal-width sections. | Avoid more than 4 tabs. Each tab max width = widest tab; group uses fluid margin, aligned center or leading edge. |
| Scrollable | Horizontal scroll; tab width = label length + padding. | First tab offset **52dp** from the leading edge (web & mobile). Consistent padding; never loop. |

## 3. Anatomy
1. **Container** – full window width; holds the tabs; divider included in its height.
2. **Icon** (optional) – 24dp.
3. **Badge** (optional) – notification/count for a tab.
4. **Label** – describes tab content.
5. **Divider** – 1dp `outline-variant` line at the container's bottom edge, inside the container.
6. **Active indicator** – underline at the bottom of the active tab, drawn above the divider.
7. **State layer** – hover/focus/pressed overlay covering the whole tab (web mapping of the states diagram).
8. **Focus indicator** – 3dp inner ring (offset −3dp), rectangular (container shape none).

## 4. Tokens & specs
### 4.1 Color
**Primary tabs** (source color roles: 1 surface, 2 primary, 3 primary, 4 on-surface-variant, 5 on-surface-variant, 6 outline-variant, 7 primary)

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | `--md-comp-primary-navigation-tab-container-color` | `--md-sys-color-surface` |
| Active indicator | active | `--md-comp-primary-navigation-tab-active-indicator-color` | `--md-sys-color-primary` |
| Label | active, all states | `--md-comp-primary-navigation-tab-with-label-text-active[-hover\|-focus\|-pressed]-label-text-color` | `--md-sys-color-primary` |
| Icon | active, all states | `--md-comp-primary-navigation-tab-with-icon-active[-hover\|-focus\|-pressed]-icon-color` | `--md-sys-color-primary` |
| Label | inactive enabled | `--md-comp-primary-navigation-tab-with-label-text-inactive-label-text-color` | `--md-sys-color-on-surface-variant` |
| Label | inactive hover/focus/pressed | `…-with-label-text-inactive-{hover,focus,pressed}-label-text-color` | `--md-sys-color-on-surface` |
| Icon | inactive enabled | `--md-comp-primary-navigation-tab-with-icon-inactive-icon-color` | `--md-sys-color-on-surface-variant` |
| Icon | inactive hover/focus/pressed | `…-with-icon-inactive-{hover,focus,pressed}-icon-color` | `--md-sys-color-on-surface` |
| State layer | active hover 0.08 / focus 0.1 / pressed 0.1 | `--md-comp-primary-navigation-tab-active-{hover,focus,pressed}-state-layer-color` | `--md-sys-color-primary` |
| State layer | inactive hover 0.08 / focus 0.1 | `--md-comp-primary-navigation-tab-inactive-{hover,focus}-state-layer-color` | `--md-sys-color-on-surface` |
| State layer | inactive pressed 0.1 | `--md-comp-primary-navigation-tab-inactive-pressed-state-layer-color` | `--md-sys-color-primary` (ripple; source token) |
| Focus indicator | focused | `--md-comp-primary-navigation-tab-focus-indicator-color` | `--md-sys-color-secondary` |
| Divider | – | divider component (`md.comp.divider.color`) | `--md-sys-color-outline-variant` |

**Secondary tabs** (source color roles: 1 surface, 2 on-surface, 3 on-surface-variant, 4 outline-variant, 5 primary)

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | `--md-comp-secondary-navigation-tab-container-color` | `--md-sys-color-surface` |
| Active indicator | active | `--md-comp-secondary-navigation-tab-active-indicator-color` | `--md-sys-color-primary` |
| Label | active | `--md-comp-secondary-navigation-tab-active-label-text-color` | `--md-sys-color-on-surface` |
| Label | inactive enabled | `--md-comp-secondary-navigation-tab-inactive-label-text-color` | `--md-sys-color-on-surface-variant` |
| Label | hover/focus/pressed (active or inactive) | `--md-comp-secondary-navigation-tab-{hover,focus,pressed}-label-text-color` | `--md-sys-color-on-surface` |
| Icon | active | `--md-comp-secondary-navigation-tab-with-icon-active-icon-color` | `--md-sys-color-on-surface` |
| Icon | inactive enabled | `--md-comp-secondary-navigation-tab-with-icon-inactive-icon-color` | `--md-sys-color-on-surface-variant` |
| Icon | hover/focus/pressed | `--md-comp-secondary-navigation-tab-with-icon-{hover,focus,pressed}-icon-color` | `--md-sys-color-on-surface` |
| State layer | hover 0.08 / focus 0.1 / pressed 0.1 | `--md-comp-secondary-navigation-tab-{hover,focus,pressed}-state-layer-color` | `--md-sys-color-on-surface` |
| Focus indicator | focused | `--md-comp-secondary-navigation-tab-focus-indicator-color` | `--md-sys-color-secondary` |
| Container shadow | – | `--md-comp-secondary-navigation-tab-container-shadow-color` | `--md-sys-color-shadow` |
| Divider | – | divider component | `--md-sys-color-outline-variant` |

No disabled state exists for tabs (guidelines: tabs do not inherit disabled).

### 4.2 Size, layout & shape
| Attribute | Value |
| --- | --- |
| Container height: label only / inline icon / icon only | 48dp (token; inline & icon-only derived) |
| Container height: stacked icon + label | 64dp (primary token; secondary derived) |
| Container shape | `--md-sys-shape-corner-none` |
| Icon size | 24dp |
| Divider | 1dp, inside container (included in height), bottom edge, full container width |
| Primary indicator height / shape | 3dp; top-left & top-right 3dp, bottom 0 |
| Secondary indicator height / shape | 2dp; square (derived: no shape token for secondary) |
| Primary indicator width | content (icon+label group) width, inset 2dp each side, min 24dp, centered |
| Secondary indicator width | full tab width (derived) |
| Inline icon ↔ label gap | 8dp |
| Inline label ↔ badge gap | 4dp |
| Stacked icon ↔ label gap | 0 (derived: 24 icon + 20 label line, centered in 64dp → 10dp top/bottom) |
| Badge overlap on stacked icon | 6dp (badge's leading edge sits 6dp inside the icon's trailing edge) |
| Tab horizontal padding | 16dp each side (derived: Material web) |
| Tab min inline size | 48dp (derived: touch target) |
| Label lines | 1; max 2 with ellipsis on label-only/inline tabs (source allows second line); stacked: 1 line (derived: 64dp has no room for 2) |
| Scrollable: leading offset of first tab | 52dp (`padding-inline-start`) |
| Fixed: compact window (<600px) | tabs fill container in equal columns |
| Fixed: ≥600px (derived breakpoint) | equal columns sized to widest tab; group aligned start or center |
| Min target | 48×48 CSS px; no density by default |

### 4.3 Typography
| Part | Typescale |
| --- | --- |
| Label (primary & secondary) | `--md-sys-typescale-title-small-*` (Roboto 14/20, weight 500, tracking 0.1) |
| Badge | see badges.md (`label-small` for large badge) |

### 4.4 Elevation
- Container `--md-sys-elevation-level0` for both variants (secondary declares shadow color `--md-sys-color-shadow`).
- Source: "Tabs can be used to create elevation" while content scrolls under — no value given. Decision: when attached to a top app bar, tabs share the app bar's on-scroll container color (see app-bars.md) as one unit; standalone tabs stay level0.

### 4.5 Component token list
**md.comp.primary-navigation-tab**
```
container.color → md.sys.color.surface
container.shape → md.sys.shape.corner.none
container.height → 48dp
with-icon-and-label-text.container.height → 64dp
container.elevation → md.sys.elevation.level0
active-indicator.color → md.sys.color.primary
active-indicator.height → 3dp
active-indicator.shape → rounded 3,3,0,0dp (TL,TR,BR,BL: 3dp,3dp,0,0)
with-icon.icon.size → 24dp
with-icon.active.icon.color → md.sys.color.primary
with-icon.inactive.icon.color → md.sys.color.on-surface-variant
with-icon.active.hover.icon.color → md.sys.color.primary
with-icon.inactive.hover.icon.color → md.sys.color.on-surface
with-icon.active.focus.icon.color → md.sys.color.primary
with-icon.inactive.focus.icon.color → md.sys.color.on-surface
with-icon.active.pressed.icon.color → md.sys.color.primary
with-icon.inactive.pressed.icon.color → md.sys.color.on-surface
with-label-text.label-text.font → md.sys.typescale.title-small.font (Roboto)
with-label-text.label-text.line-height → md.sys.typescale.title-small.line-height (20)
with-label-text.label-text.size → md.sys.typescale.title-small.size (14)
with-label-text.label-text.weight → md.sys.typescale.title-small.weight (500)
with-label-text.label-text.tracking → md.sys.typescale.title-small.tracking (0.1)
with-label-text.active.label-text.color → md.sys.color.primary
with-label-text.inactive.label-text.color → md.sys.color.on-surface-variant
with-label-text.active.hover.label-text.color → md.sys.color.primary
with-label-text.inactive.hover.label-text.color → md.sys.color.on-surface
with-label-text.active.focus.label-text.color → md.sys.color.primary
with-label-text.inactive.focus.label-text.color → md.sys.color.on-surface
with-label-text.active.pressed.label-text.color → md.sys.color.primary
with-label-text.inactive.pressed.label-text.color → md.sys.color.on-surface
active.hover.state-layer.color → md.sys.color.primary
active.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
inactive.hover.state-layer.color → md.sys.color.on-surface
inactive.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
active.focus.state-layer.color → md.sys.color.primary
active.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
inactive.focus.state-layer.color → md.sys.color.on-surface
inactive.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
active.pressed.state-layer.color → md.sys.color.primary
active.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
inactive.pressed.state-layer.color → md.sys.color.primary
inactive.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.inner-offset (-3dp)
```
**md.comp.secondary-navigation-tab**
```
container.color → md.sys.color.surface
container.shape → md.sys.shape.corner.none
container.height → 48dp
container.elevation → md.sys.elevation.level0
container.shadow-color → md.sys.color.shadow
active-indicator.color → md.sys.color.primary
active-indicator.height → 2dp
with-icon.icon.size → 24dp
with-icon.active.icon.color → md.sys.color.on-surface
with-icon.inactive.icon.color → md.sys.color.on-surface-variant
with-icon.hover.icon.color → md.sys.color.on-surface
with-icon.focus.icon.color → md.sys.color.on-surface
with-icon.pressed.icon.color → md.sys.color.on-surface
label-text.font → md.sys.typescale.title-small.font (Roboto)
label-text.line-height → md.sys.typescale.title-small.line-height (20)
label-text.size → md.sys.typescale.title-small.size (14)
label-text.weight → md.sys.typescale.title-small.weight (500)
label-text.tracking → md.sys.typescale.title-small.tracking (0.1)
active.label-text.color → md.sys.color.on-surface
inactive.label-text.color → md.sys.color.on-surface-variant
hover.label-text.color → md.sys.color.on-surface
focus.label-text.color → md.sys.color.on-surface
pressed.label-text.color → md.sys.color.on-surface
hover.state-layer.color → md.sys.color.on-surface
hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
focus.state-layer.color → md.sys.color.on-surface
focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
pressed.state-layer.color → md.sys.color.on-surface
pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.inner-offset (-3dp)
```
(`*.label-text.type` tokens are composites of the font tokens above; omitted.)

## 5. States & interaction
State × part matrix (P = primary, S = secondary):

| State | Label / icon | State layer | Indicator | Focus ring |
| --- | --- | --- | --- | --- |
| Active enabled | P `primary`; S `on-surface` | – | shown | – |
| Active hover | unchanged | P `primary` 0.08; S `on-surface` 0.08 | shown | – |
| Active focus-visible | unchanged | P `primary` 0.1; S `on-surface` 0.1 | shown | 3dp `secondary`, inset −3dp |
| Active pressed | unchanged | P `primary` 0.1; S `on-surface` 0.1 (ripple) | shown | if keyboard |
| Inactive enabled | `on-surface-variant` | – | hidden | – |
| Inactive hover | `on-surface` | `on-surface` 0.08 | hidden | – |
| Inactive focus-visible | `on-surface` | `on-surface` 0.1 | hidden | ring |
| Inactive pressed | `on-surface` | P `primary` 0.1; S `on-surface` 0.1 (ripple) | slides in on activation | if keyboard |

- Exactly one tab is active per set. States combine by the guidelines rule (highest-priority single layer: pressed > focus > hover).
- On click/tap: ripple at pointer, then indicator **shifts into position** from the previous tab.
- Disabled: not supported (see §11).

## 6. Motion & behavior
| What | Property | Motion |
| --- | --- | --- |
| Indicator move between tabs | `transform` (translateX + scaleX) | `--md-sys-motion-spring-fast-spatial-*` (CSS: `-easing` + `-duration`, ≈350ms expressive) — derived: source names no value; "all component motion is driven by fast spatial" |
| Label/icon color change | `color` | `--md-sys-motion-spring-fast-effects-*` (≈150ms) |
| State layer fade | `opacity` | fast effects |
| Ripple | – | ripple primitive |
| Scroll active tab into view (scrollable) | `scrollLeft` | `scrollIntoView({inline:'nearest', behavior:'smooth'})` (derived) |
| Panel change | – | **lateral** transition pattern (peers slide in unison, no fade) — owned by the panel container, not the tab bar |

- **Reduced motion**: indicator jumps (no transform animation) or cross-fades; smooth scrolling off; color changes kept, shortened.
- **Fixed tabs:** tap a tab or **swipe left/right in the content area**; avoid other horizontal-swipe content there.
- **Scrollable tabs:** swipe/drag the row; arrow keys also move focus (scroll focused tab into view). Never loop.
- **Scrolling content:** tabs stay pinned at top or scroll away and **return on upward scroll**; when attached to an app bar they move as one unit — never scroll tabs behind the app bar.
- **Responsive:** see §4.2 fixed layout rows; >4 tabs → use scrollable.
- **RTL:** tab order, 52dp offset side, arrow keys and indicator travel all mirror (logical properties).

## 7. Usage guidelines
- Primary when only one set is needed; secondary only for a second level; secondary always below primary.
- Tabs can join app bars, be embedded in a region, or nested in cards/sheets; they control the region below them.
- All tabs in a set share one topic; single row.
- Labels: short, clear, related to the title above; don't truncate unless required; prefer scrollable for long labels.
- Icons: simple, recognizable; icon-only only with globally recognized icons; never mix icon+label on some tabs and label-only on others.
- Badges: max 4 characters incl. "+"; update/remove once the user views the tab's content; small or large badges.
- Avoid more than 4 fixed tabs.

## 8. Accessibility
- **Roles (web mapping, WAI-ARIA tabs pattern):** container `role="tablist"` (+ `aria-label` when no visible heading); each tab is a `<button role="tab" aria-selected aria-controls>`; panels `role="tabpanel" aria-labelledby`, `tabindex="0"` if they hold no focusable content. Roving tabindex: active tab `0`, others `-1`. If tabs are page links, use `<nav>` + `<a aria-current="page">` instead (no tab roles).
- Icon-only/ambiguous tabs need a descriptive name (e.g. video camera icon → "Video format media content").
- Badge text joins the accessible name or `aria-describedby` (e.g. "Inbox, 3 new"); small badge → visually-hidden "new".
- Active state = underline + color (never color alone).

| Key | Action |
| --- | --- |
| Tab | Into the tablist (lands on active tab), then out to the panel / next element |
| Left / Right Arrow | Focus previous / next tab, wrapping (RTL reversed) |
| Home / End | First / last tab (web mapping) |
| Space / Enter | Activate the focused tab (manual activation; source: Space/Enter only completes actions, never navigates) |

- Targets ≥48×48 CSS px; density only user-selectable.
- Horizontal scrolling of the tab row is acceptable for accessibility; never infinite-loop.

## 9. Implementation checklist
- [ ] `<md-tabs variant="primary|secondary" layout="fixed|scrollable" align="start|center">` + `<md-tab value icon badge>`; active via `value` or `aria-selected`.
- [ ] Event `change` (detail: value, previous), fired on user activation only; optional cancelable `beforechange`.
- [ ] Heights 48 / 64; divider inside container; full-width surface container, no radius.
- [ ] Primary indicator 3dp, 3dp top radii, content width −2dp each side, min 24dp; secondary 2dp full tab width.
- [ ] FLIP indicator animation; color/state-layer effects transitions; reduced-motion fallback.
- [ ] Scrollable: 52dp leading offset, hidden scrollbar, active/focused tab scrolled into view.
- [ ] Roving tabindex, arrows/Home/End/Space/Enter, RTL.
- [ ] Badges positioned per §4.2; label clamp; forced-colors fallback.
- [ ] Adding/removing tabs keeps exactly one active (fallback: first tab).

## 10. HTML/CSS implementation blueprint
**(a) DOM**
```html
<div class="md-tabs" data-variant="primary" data-layout="fixed" data-align="start">
  <div class="md-tabs__scroller">                 <!-- overflow-x for scrollable -->
    <div class="md-tabs__list" role="tablist" aria-label="Travel">
      <button class="md-tab" role="tab" id="t-1" aria-controls="p-1" aria-selected="true" tabindex="0" data-stacked>
        <span class="md-tab__state" aria-hidden="true"></span>   <!-- state layer + ripple -->
        <span class="md-tab__content">
          <span class="md-tab__icon-wrap"><svg class="md-tab__icon" aria-hidden="true"/><span class="md-badge">3</span></span>
          <span class="md-tab__label">Flights</span>
          <span class="md-tab__indicator" aria-hidden="true"></span> <!-- primary: inside content -->
        </span>
      </button>
      <!-- … more .md-tab with aria-selected="false" tabindex="-1" -->
    </div>
  </div>
</div>
<div role="tabpanel" id="p-1" aria-labelledby="t-1" tabindex="0">…</div>
```
Secondary: `.md-tab__indicator` is a direct child of `.md-tab` (full width). Inline badge (no stacked icon): `.md-badge` after `.md-tab__label`.

**(b) Custom properties**
```css
.md-tabs {
  --md-comp-tabs-container-color: var(--md-sys-color-surface);
  --md-comp-tabs-container-height: 48px;
  --md-comp-tabs-stacked-container-height: 64px;
  --md-comp-tabs-divider-color: var(--md-sys-color-outline-variant);
  --md-comp-tabs-indicator-color: var(--md-sys-color-primary);
  --md-comp-tabs-icon-size: 24px;
  --md-comp-tabs-focus-indicator-color: var(--md-sys-color-secondary);
  /* primary */
  --md-comp-tabs-indicator-height: 3px;
  --md-comp-tabs-indicator-shape: 3px 3px 0 0;
  --md-comp-tabs-active-color: var(--md-sys-color-primary);        /* label + icon */
  --md-comp-tabs-inactive-color: var(--md-sys-color-on-surface-variant);
  --md-comp-tabs-interactive-color: var(--md-sys-color-on-surface);  /* inactive hover/focus/pressed */
  --md-comp-tabs-active-state-layer-color: var(--md-sys-color-primary);
  --md-comp-tabs-inactive-state-layer-color: var(--md-sys-color-on-surface);
  --md-comp-tabs-inactive-pressed-state-layer-color: var(--md-sys-color-primary);
}
.md-tabs[data-variant="secondary"] {
  --md-comp-tabs-indicator-height: 2px;
  --md-comp-tabs-indicator-shape: 0;
  --md-comp-tabs-active-color: var(--md-sys-color-on-surface);
  --md-comp-tabs-active-state-layer-color: var(--md-sys-color-on-surface);
  --md-comp-tabs-inactive-pressed-state-layer-color: var(--md-sys-color-on-surface);
}
```
**Layout**
```css
.md-tabs { background: var(--md-comp-tabs-container-color); box-shadow: inset 0 -1px 0 var(--md-comp-tabs-divider-color); }
.md-tabs__list { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); }
@media (min-width: 600px) {           /* fixed: equal columns = widest tab */
  .md-tabs[data-layout="fixed"] .md-tabs__list { width: max-content; grid-auto-columns: 1fr; }
  .md-tabs[data-align="center"] .md-tabs__list { margin-inline: auto; }
}
.md-tabs[data-layout="scrollable"] .md-tabs__scroller { overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
.md-tabs[data-layout="scrollable"] .md-tabs__list { grid-auto-columns: max-content; width: max-content;
  padding-inline-start: 52px; scroll-padding-inline: 52px; }
.md-tab { position: relative; isolation: isolate; display: flex; align-items: center; justify-content: center;
  min-block-size: var(--md-comp-tabs-container-height); min-inline-size: 48px; padding: 0 16px;
  border: 0; border-radius: 0; background: none; cursor: pointer; color: var(--md-comp-tabs-inactive-color);
  font: var(--md-sys-typescale-title-small-weight) var(--md-sys-typescale-title-small-size)/var(--md-sys-typescale-title-small-line-height) var(--md-sys-typescale-title-small-font);
  letter-spacing: var(--md-sys-typescale-title-small-tracking); -webkit-tap-highlight-color: transparent; }
.md-tab[data-stacked] { min-block-size: var(--md-comp-tabs-stacked-container-height); }
.md-tab__content { position: relative; display: inline-flex; align-items: center; gap: 8px; height: 100%; }
.md-tab[data-stacked] .md-tab__content { flex-direction: column; gap: 0; }
.md-tab__icon { inline-size: var(--md-comp-tabs-icon-size); block-size: var(--md-comp-tabs-icon-size); fill: currentColor; }
.md-tab__label { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; text-overflow: ellipsis; }
.md-tab[data-stacked] .md-tab__label { -webkit-line-clamp: 1; white-space: nowrap; }
.md-tab__label + .md-badge { margin-inline-start: -4px; }  /* 8px flex gap → 4px label↔badge */
.md-tab__icon-wrap { position: relative; display: inline-flex; }
.md-tab__icon-wrap > .md-badge { position: absolute; inset-inline-start: calc(100% - 6px); /* vertical offset: badges.md */ }
/* indicator */
.md-tab__indicator { position: absolute; inset-block-end: 0; block-size: var(--md-comp-tabs-indicator-height);
  background: var(--md-comp-tabs-indicator-color); border-radius: var(--md-comp-tabs-indicator-shape);
  opacity: 0; transform-origin: left center; }
/* primary: inside .md-tab__content (content box stretches to tab height so bottom = tab bottom);
   2px inset, but never narrower than 24px (inset goes negative and stays centered) */
.md-tabs[data-variant="primary"] .md-tab__content { align-self: stretch; }
.md-tabs[data-variant="primary"] .md-tab__indicator { inset-inline: min(2px, calc(50% - 12px)); }
.md-tabs[data-variant="secondary"] .md-tab__indicator { inset-inline: 0; }
.md-tab[aria-selected="true"] .md-tab__indicator { opacity: 1; }
```

**(c) States**
```css
.md-tab[aria-selected="true"] { color: var(--md-comp-tabs-active-color); }
.md-tab__state { position: absolute; inset: 0; pointer-events: none; background: var(--md-comp-tabs-inactive-state-layer-color); opacity: 0; }
.md-tab[aria-selected="true"] .md-tab__state { background: var(--md-comp-tabs-active-state-layer-color); }
@media (hover: hover) {
  .md-tab:hover { color: var(--_hover-color, var(--md-comp-tabs-interactive-color)); }
  .md-tab:hover .md-tab__state { opacity: var(--md-sys-state-hover-state-layer-opacity); }
}
.md-tab:focus-visible { color: var(--_hover-color, var(--md-comp-tabs-interactive-color));
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-tabs-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset); }
.md-tab:focus-visible .md-tab__state { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-tab:active { color: var(--_hover-color, var(--md-comp-tabs-interactive-color)); }
.md-tab:not([aria-selected="true"]):active .md-tab__state { background: var(--md-comp-tabs-inactive-pressed-state-layer-color); }
.md-tab:active .md-tab__state { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-tab[aria-selected="true"] { --_hover-color: var(--md-comp-tabs-active-color); } /* active keeps its color */
.md-tab:focus:not(:focus-visible) { outline: none; }
```
State layer = state layer primitive; ripple = ripple primitive (inside `.md-tab__state`, give `.md-tab__state` `overflow:hidden` to clip it).

**(d) Motion**
```css
.md-tab { transition: color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-tab__state { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-tab__indicator.is-animating { transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-tab__indicator.is-animating { transition: none; }
  .md-tabs__scroller { scroll-behavior: auto; }
}
```
FLIP (JS): `from = oldIndicator.getBoundingClientRect(); to = newIndicator.getBoundingClientRect();` set on new indicator (no transition) `transform: translateX(${from.left - to.left}px) scaleX(${from.width / to.width})`, force reflow, add `.is-animating`, set `transform: none`; remove class on `transitionend`. Interrupted mid-flight: read current rect of the animating indicator as `from`. (Scale distorts the 3px top radii negligibly.)

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-tabs { box-shadow: none; border-block-end: 1px solid CanvasText; }
  .md-tab__indicator { forced-color-adjust: none; background: Highlight; }
  .md-tab[aria-selected="true"] { color: Highlight; }
  .md-tab:focus-visible { outline-color: Highlight; }
  .md-tab__state { display: none; }
}
```

**(f) Behaviour / JS**
- Click/tap or Space/Enter on a tab → set `aria-selected` true on it, false on others; move `tabindex`; animate indicator; `scrollIntoView` (scrollable); show the controlled panel (`hidden` on others); dispatch `change`.
- Keydown on tablist: Arrow Left/Right (swap in RTL via `getComputedStyle(el).direction`), Home, End move focus only (manual activation); wrap at ends.
- Optional: swipe in panel area (pointer events, horizontal intent > vertical) → activate adjacent tab.
- ResizeObserver: re-measure nothing needed for static indicator (CSS-positioned); only FLIP needs rects at change time.
- MutationObserver on tabs: guarantee exactly one active.

## 11. Source gaps & decisions
- Measurement caption says primary indicator has a "fully rounded corner radius"; token & table say 3,3,0,0 → used token (3dp radius on a 3dp bar = visually full top rounding).
- Table lists "Active indicator shape 3,3,0,0" generically; only primary has a shape token → secondary indicator square.
- "Inset 2dp each side" has no reference box → interpreted as inset from the content (icon+label) group; min 24dp centered.
- Secondary indicator width not specified → full tab width (Material web behaviour; "simpler indicator").
- Secondary stacked height token missing → 64dp, same as primary.
- No indicator motion values → fast spatial spring (component-level motion rule); color via fast effects.
- Horizontal tab padding, min width, fixed-layout breakpoint (600px), label 2-line clamp rule for stacked tabs → derived (see §4.2).
- Disabled not in source and guidelines say tabs don't inherit disabled → no disabled API; if forced by product, hide the tab instead.
- Elevation-on-scroll mentioned without value → follow attached app bar; standalone stays level0.
- Source keyboard text mixes Tab and Arrow for moving between tabs → WAI-ARIA roving tabindex (arrows between tabs, Tab exits), manual activation per "Space/Enter activates".
- Source anatomy omits icon for secondary tabs but tokens define icon colors → icons allowed on secondary.
