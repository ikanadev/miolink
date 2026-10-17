# Navigation rail

> Source: https://m3.material.io/components/navigation-rail · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview

A vertical navigation component on the leading edge of the window holding navigation items, an optional menu button and an optional FAB. Comes in **collapsed** and **expanded** variants that transform into each other via the menu button.

**Use when**
- Medium, expanded, large or extra-large windows (tablet, desktop). Collapsed rail: 3–7 destinations (+ optional FAB).
- Expanded rail (standard) beside content on large windows; expanded **modal** over content for dense layouts / many destinations / compact windows (opened from a menu icon, e.g. in an app bar).

**Don't use when**
- Compact windows → use a navigation bar (a modal expanded rail may still open from a menu icon).
- Medium windows with few destinations → consider a navigation bar.
- Never use rail and nav bar simultaneously; never horizontal.

**M3 Expressive changes (May 2025)**
- Baseline navigation rail no longer recommended → **collapsed** rail (wider: 96dp).
- New **expanded** rail replaces the **navigation drawer**; layouts: standard (non-modal) or modal; behaviour: transition to collapsed, or hide when collapsed.
- Active label on vertical items changed from on-surface-variant to **secondary**.
- vs. M2: pill active indicator, dynamic color, predictive back (modal expanded).

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Collapsed | Narrow vertical rail with **vertical** items (icon above label) | Width 96dp (narrow option 80dp); 3–7 items; never hidden |
| Expanded – standard (default) | Wide rail beside body content, **horizontal** items (icon + label side by side) | Width 220–360dp; surface, level0, square corners. Content reflows |
| Expanded – modal | Overlaps body content | surface-container, level2, corner large; 32% scrim (guidelines); predictive back |
| Expanded behaviour: transition to collapsed | Menu button toggles collapsed ↔ expanded | Default |
| Expanded behaviour: hide when collapsed | No collapsed rail; expanded rail appears only from a menu icon | Immersive experiences; menu icon must stay accessible |
| Item alignment | Item group top- or center-aligned | Center on tablets for reach; menu & FAB always top-aligned |
| Container fill off | Rail sits directly on surface | Items need ≥3:1 contrast |
| Divider (optional) | Vertical divider on the edge adjacent to content | |
| Active indicator: hug (default) / fill | Expanded indicator hugs icon+label, or overridden to fill rail width | Fill resembles baseline navigation drawer |
| Baseline navigation rail | Not recommended | Same token sets in source; color diagram: active label on-surface |

## 3. Anatomy

1. **Container** — vertical surface on the leading edge.
2. **Menu button** (optional) — icon button toggling collapsed/expanded; icon changes when expanded (e.g. `menu` → `menu_open`).
3. **FAB / extended FAB** (optional) — top-aligned; FAB when collapsed, extended FAB when expanded. Resting elevation level0 when nested.
4. **Navigation item** — target spans the full rail width.
5. **Icon** — active (filled) / inactive (outlined).
6. **Active indicator** — full-rounded pill; vertical items: 56×32 behind icon; horizontal items: 56dp-tall pill hugging icon + label.
7. **Label text** — active / inactive.
8. **Large badge** + **large badge label** (optional).
9. **Small badge** (optional).
10. (optional) **Secondary destinations / subheads** — only in the expanded rail.
11. (optional) **Divider**, **logo**.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container (collapsed) | — | `md.comp.nav-rail.collapsed.container.color` | `--md-sys-color-surface` (#fef7ff) |
| Container (expanded standard) | — | `md.comp.nav-rail.expanded.container.color` | `--md-sys-color-surface` |
| Container (expanded modal) | — | `md.comp.nav-rail.expanded.modal.container.color` | `--md-sys-color-surface-container` (#f3edf7) |
| Active indicator | Active | `md.comp.nav-rail.item.active.indicator.color` | `--md-sys-color-secondary-container` (#e8def8) |
| Icon | Active | `md.comp.nav-rail.item.active.icon.color` | `--md-sys-color-on-secondary-container` (#4a4458) |
| Icon | Inactive | `md.comp.nav-rail.item.inactive.icon.color` | `--md-sys-color-on-surface-variant` (#49454f) |
| Label | Active, vertical item | `md.comp.nav-rail.item.active.label-text.color` | `--md-sys-color-secondary` (#625b71) |
| Label | Active, horizontal item (inside indicator) | color diagram (no token) | `--md-sys-color-on-secondary-container` |
| Label | Inactive | `md.comp.nav-rail.item.inactive.label-text.color` | `--md-sys-color-on-surface-variant` |
| State layer | Hover | `md.comp.nav-rail.item.{active,inactive}.hovered.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-hover-state-layer-opacity` (0.08) |
| State layer | Focus | `…focused.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-focus-state-layer-opacity` (0.10) |
| State layer | Pressed | `…pressed.state-layer.color` | `--md-sys-color-on-secondary-container` @ `--md-sys-state-pressed-state-layer-opacity` (0.10) |
| Badges | — | badge spec | `--md-sys-color-error`, label `--md-sys-color-on-error` |
| Scrim (modal) | — | none (guidelines: scrim at 32% beneath modals and expanded navigation) | `--md-sys-color-scrim` @ 0.32 |
| Divider | — | divider spec | `--md-sys-color-outline-variant` |
| Focus ring | Focus | system | `--md-sys-color-secondary` (focus ring primitive) |

- Color diagram labels the container "Surface container (optional)" while tokens say `surface` — tokens win (see §11). Inactive state-layer opacities reuse the system opacities. No disabled state.

### 4.2 Size, layout & shape

Container:

| Spec | Collapsed | Expanded |
| --- | --- | --- |
| Width | 96dp (narrow: 80dp) | hug content, min 220dp, max 360dp |
| Height | 100% of window (block-size 100dvh, web mapping) | 100% |
| Top space (container top → first element) | 44dp | 44dp |
| Header (menu/FAB) → first item | ≥ 40dp (`item.header-space-minimum`, see §11) | ≥ 40dp |
| Menu ↔ FAB gap | not in text (derived: 4dp) | same |
| Shape | `--md-sys-shape-corner-none` | standard: none; modal: `--md-sys-shape-corner-large` (16dp) on end corners only (`--md-sys-shape-corner-large-end`, derived: start edge is flush with the window) |
| Space between items | 4dp (`collapsed.item.vertical-space`) | 0dp (derived; no token) |
| Bottom padding | not specified (derived: 16dp, scroll if overflow) | same |

Items:

| Spec | Vertical item (collapsed) | Horizontal item (expanded) |
| --- | --- | --- |
| Item height | 64dp (`item.container.height`) | 56dp (`item.short.container.height` = indicator height, derived mapping) |
| Item block padding | 6dp top/bottom (`item.container.vertical-space`): 6 + 32 + 4 + 16 + 6 = 64 | 0 (indicator fills height) |
| Item inline padding | 16dp / 16dp (`item.vertical.leading/trailing-space`) → max label width = rail width − 32 | hug: indicator starts 20dp from rail start (derived: (96 − 56)/2, keeps icon x fixed during expand); fill: 16dp / 16dp (`item.horizontal.full-width.*`) |
| Active indicator | 56 × 32dp, centered | height 56dp; inner padding 16dp / 16dp (`item.active-indicator.leading/trailing-space`); width = 16 + 24 + 8 + label + 16 |
| Icon–label gap | 4dp (`item.vertical.icon-label-space`) | 8dp (`item.horizontal.icon-label-space`) |
| Label | centered below indicator; may wrap at word break | start-aligned, single line (wraps only under text scaling) |
| Badge | icon top-end corner | after the label, 8dp gap (derived), inside the pill |

Common:
- Icon size 24dp; indicator shape `--md-sys-shape-corner-full`; item container shape none.
- Target area always spans the full rail width (and full item height), even when the indicator hugs content; ≥48×48dp.
- Items grow vertically with text scaling, keeping default padding.
- Rail content area scrolls vertically if items overflow (derived); header stays at top.

### 4.3 Typography

| Part | Typescale |
| --- | --- |
| Label – vertical item (collapsed) | `--md-sys-typescale-label-medium-*` (500 12/16) |
| Label – horizontal item (expanded) | `--md-sys-typescale-label-large-*` (500 14/20) |
| Subhead for secondary destinations (expanded) | not specified (derived: `--md-sys-typescale-title-small-*`, on-surface-variant, 16dp inline padding) |

Active label keeps the same weight (source asks for weight change only for icons, not labels).

### 4.4 Elevation

| Configuration | Token | Value |
| --- | --- | --- |
| Collapsed | `md.comp.nav-rail.collapsed.container.elevation` | `--md-sys-elevation-level0` |
| Expanded standard | `md.comp.nav-rail.expanded.container.elevation` | `--md-sys-elevation-level0` |
| Expanded modal | `md.comp.nav-rail.expanded.modal.container.elevation` | `--md-sys-elevation-level2` (3dp, shadow via elevation primitive) |
| Over horizontally scrolling content | guideline | optionally `--md-sys-elevation-level1` (or divider + fill change) |
| Nested FAB | guideline | level0 resting |

### 4.5 Component token list

**`md.comp.nav-rail` (common colors/states)**
- item.active.indicator.color → md.sys.color.secondary-container
- item.active.label-text.color → md.sys.color.secondary
- item.inactive.label-text.color → md.sys.color.on-surface-variant
- item.active.icon.color → md.sys.color.on-secondary-container
- item.inactive.icon.color → md.sys.color.on-surface-variant
- item.active.hovered.state-layer.color → md.sys.color.on-secondary-container
- item.active.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- item.inactive.hovered.state-layer.color → md.sys.color.on-secondary-container
- item.active.focused.state-layer.color → md.sys.color.on-secondary-container
- item.active.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
- item.inactive.focused.state-layer.color → md.sys.color.on-secondary-container
- item.active.pressed.state-layer.color → md.sys.color.on-secondary-container
- item.active.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
- item.inactive.pressed.state-layer.color → md.sys.color.on-secondary-container

**`md.comp.nav-rail.item` (common item)**
- icon.size → 24dp
- active-indicator.shape → md.sys.shape.corner.full
- active-indicator.leading-space → md.sys.measurement.space200 (16dp)
- active-indicator.icon-label-space → md.sys.measurement.space100 (8dp)
- active-indicator.trailing-space → md.sys.measurement.space200 (16dp)
- container.height → 64dp
- container.vertical-space → md.sys.measurement.space75 (6dp)
- header-space-minimum → md.sys.measurement.space500 (40dp)
- container.shape → md.sys.shape.corner.none
- short.container.height → 56dp

**`md.comp.nav-rail.item.vertical`**
- label-text.font → md.sys.typescale.label-medium
- active-indicator.width → 56dp
- active-indicator.height → 32dp
- icon-label-space → md.sys.measurement.space50 (4dp)
- leading-space → md.sys.measurement.space200 (16dp)
- trailing-space → md.sys.measurement.space200 (16dp)

**`md.comp.nav-rail.item.horizontal`**
- label-text.font → md.sys.typescale.label-large
- active-indicator.height → 56dp
- full-width.leading-space → md.sys.measurement.space200 (16dp)
- full-width.trailing-space → md.sys.measurement.space200 (16dp)
- icon-label-space → md.sys.measurement.space100 (8dp)

**`md.comp.nav-rail.collapsed`**
- container.color → md.sys.color.surface
- container.width → 96dp
- narrow.container.width → 80dp
- container.elevation → md.sys.elevation.level0
- container.shape → md.sys.shape.corner.none
- top-space → 44dp
- item.vertical-space → md.sys.measurement.space50 (4dp)

**`md.comp.nav-rail.expanded`**
- container.color → md.sys.color.surface
- modal.container.color → md.sys.color.surface-container
- container.shape → md.sys.shape.corner.none
- modal.container.shape → md.sys.shape.corner.large (16dp)
- container.width.minimum → 220dp
- container.width.maximum → 360dp
- top-space → 44dp
- container.elevation → md.sys.elevation.level0
- modal.container.elevation → md.sys.elevation.level2

## 5. States & interaction

| State | Icon | Label | Indicator | State layer |
| --- | --- | --- | --- | --- |
| Inactive | outlined, on-surface-variant | on-surface-variant | none | — |
| Inactive + hover / focus / pressed | unchanged | unchanged | none | 0.08 / 0.10 + focus ring / 0.10 + ripple, drawn in the indicator shape |
| Active | filled (semibold if no filled glyph), on-secondary-container | vertical: secondary; horizontal: on-secondary-container | secondary-container pill | — |
| Active + hover / focus / pressed | unchanged | unchanged | unchanged | 0.08 / 0.10 + ring / 0.10 + ripple |

- State layer / ripple / focus ring take the indicator's shape and size (vertical 56×32; horizontal hug or fill pill); the hit target is the full-width item.
- Selecting: icon outlined → filled, icon & label change color, indicator expands from icon center.
- Menu button: toggles expanded/collapsed (or opens/closes the hidden rail); icon swaps.
- Modal expanded: dismiss via scrim click, Escape, menu button, or selecting a destination (derived: navigation completes the task).

## 6. Motion & behavior

| Transition | Property | Motion |
| --- | --- | --- |
| Collapse ↔ expand (standard) | rail width 96 ↔ 220–360dp; content reflows | default spatial spring (guidelines: "expanding nav rail") |
| | item layout vertical ↔ horizontal; indicator 56×32 ↔ hug×56 | default spatial spring (FLIP / view transition, see §10d) |
| | collapsed label out / expanded label in, secondary destinations in | default effects spring, fade out fully before fading in (clean fade) |
| | FAB ↔ extended FAB | per extended-fab.md, same default spatial spring |
| | menu icon swap | fast effects cross-fade |
| Modal open/close | rail width (from collapsed width or 0 when hidden) + scrim | default spatial (width/translate); scrim opacity default effects |
| Hide-when-collapsed | translateX(−100%) ↔ 0 (mirrored in RTL) | default spatial in; exit uses default effects-speed curve (exits shorter) (derived) |
| Selection | indicator scale from icon center; icon fill/color | fast spatial / fast effects; destination uses top-level (fade-through) transition |

- Predictive back (Android, modal expanded only): rail pops off the window edge following the gesture. Web mapping: `<dialog>` closes on Android back via the platform close request; no gesture preview.
- Scrolling: rail stays fixed while content scrolls vertically. With horizontal scrolling content, rail may scroll off or stay fixed; when fixed add divider + fill change, or level1 elevation.
- Adaptive: Compact → nav bar (modal expanded rail via menu icon OK). Medium → collapsed rail. Expanded+ → rail; standard vs. modal by horizontal space and destination count (>5 → consider modal expanded). Rail may transform into a nav bar when shrinking; never show both.
- RTL: rail on the right; slide/corner directions mirror (logical properties).

## 7. Usage guidelines

- Always on the leading edge, outside all panes, vertical; never inside body content, never horizontal.
- Same place on every screen; the only visible navigation element (tabs may add an extra layer).
- Collapsed: 3–7 items, never hidden. Expanded may reveal secondary destinations.
- Expanded rail always opens from a menu icon.
- Items grouped top- or center-aligned; menu & FAB always top-aligned. FAB above items, never below.
- Logo at top allowed with caution — must not look like a button; never use a logo as the menu button.
- Active indicator on one item only.
- Icons symbolize page content; filled active, outlined inactive; semibold weight if no filled variant. Max two colors for destinations.
- Labels required, one word; avoid wrapping (if needed break between words or hyphenate); never truncate/ellipsize; never shrink type.
- Badges: collapsed rail → icon top-right; expanded rail → next to label.
- Divider optional, on the edge adjacent to content.
- When hidden, content may fill the space as long as the menu icon remains accessible.

## 8. Accessibility

- **Roles (web mapping)**: `<nav aria-label="…">` containing a `<ul>` of links (`aria-current="page"` on the active one) or buttons. Menu button: `<button aria-expanded aria-controls="rail-id" aria-label="Expand navigation | Collapse navigation">`. Modal expanded rail: native `<dialog>` opened with `showModal()` (background inert, Escape → `cancel`), labelled via `aria-label`; focus returns to the menu button on close.
- Accessible name = visible label; add context if ambiguous ("Recent" → "Recent images"). Badges included in the name or via `aria-describedby`. Collapsed-state labels stay in the accessibility tree (they are visible).
- Initial focus: first interactive element (menu, FAB, or first item). From menu/FAB, Tab enters items; Tab **or** Arrow Up/Down move between items (all items stay tabbable; arrows are an addition, not a roving tabindex).

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move between interactive elements (menu → FAB → items) |
| Arrow Up / Down | Move focus to previous / next item (wraps: derived) |
| Home / End | First / last item (web mapping, optional) |
| Space / Enter | Activate the focused element |
| Escape | Close modal expanded rail (web mapping) |

- Touch target spans full rail width, ≥48dp high. Icons ≥3:1 contrast with container (also when fill is off).
- Text scaling: items grow vertically; full label visible up to 2× text size; truncation allowed beyond.
- Selected state not color-only: filled icon + indicator.

## 9. Implementation checklist

Suggested API:
- Rail: `expanded` (boolean, reflected), `modal` (boolean), `expanded-behavior`: `collapse | hide`, `narrow` (80dp collapsed), `alignment`: `top | center`, `indicator`: `hug | fill`, `no-fill`, `divider`, `value`; events `change`, `expanded-change`, `close` (modal).
- Slots: `menu`, `fab` (library toggles FAB ↔ extended FAB with `expanded`), default (items), `secondary` (shown only when expanded), `logo`.
- Item: `label`, `icon` / `active-icon`, `href`, `active`, `badge` (`dot | number`), `badge-value`.

Internals & edge cases:
- [ ] Collapsed 96dp / narrow 80dp, 44dp top space, ≥40dp header→items, 4dp between 64dp vertical items (56×32 pill, 4dp gap, label-medium).
- [ ] Expanded 220–360dp, 56dp horizontal items (16/8/16 pill, label-large), indicator `hug` (20dp start offset) or `fill` (16dp margins).
- [ ] Full-width hit target for items regardless of indicator width.
- [ ] Animated width + item layout morph; content reflow in standard mode; FAB → extended FAB.
- [ ] Modal: `<dialog>`, surface-container, end corners 16dp, level2, scrim, Escape/scrim/menu dismiss, return focus.
- [ ] Hide-when-collapsed: rail `hidden`/closed dialog removes it from layout & AT.
- [ ] Badge placement by state (icon corner vs. after label).
- [ ] Rail sticky full-height; inner list scrolls on overflow.
- [ ] RTL via logical properties.
- [ ] Dev warnings: <3 or >7 primary items in collapsed rail; multiple active items.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- standard (in layout) -->
<nav class="md-nav-rail" id="rail" data-expanded="false" aria-label="Main">
  <div class="md-nav-rail__header">
    <button class="md-icon-button" aria-expanded="false" aria-controls="rail" aria-label="Expand navigation">…</button>
    <button class="md-fab">…</button>                 <!-- becomes extended FAB when expanded -->
  </div>
  <ul class="md-nav-rail__list" role="list">
    <li><a class="md-rail-item" href="/inbox" aria-current="page">
      <span class="md-rail-item__indicator" aria-hidden="true"><span class="md-rail-item__state-layer"></span></span>
      <span class="md-rail-item__icon" aria-hidden="true">…<span class="md-badge" hidden></span></span>
      <span class="md-rail-item__label">Inbox</span>
      <span class="md-badge md-badge--trailing" hidden></span>  <!-- expanded placement -->
    </a></li>
  </ul>
  <div class="md-nav-rail__secondary" hidden><!-- subheads + items, expanded only --></div>
</nav>

<!-- modal expanded (same inner markup) -->
<dialog class="md-nav-rail md-nav-rail--modal" data-expanded="true" aria-label="Main">…</dialog>
```

**(b) Custom properties & layout**
```css
.md-nav-rail {
  --md-comp-nav-rail-collapsed-container-width: 96px;           /* narrow: 80px */
  --md-comp-nav-rail-collapsed-container-color: var(--md-sys-color-surface);
  --md-comp-nav-rail-collapsed-top-space: 44px;
  --md-comp-nav-rail-collapsed-item-vertical-space: var(--md-sys-measurement-space50);
  --md-comp-nav-rail-expanded-container-color: var(--md-sys-color-surface);
  --md-comp-nav-rail-expanded-modal-container-color: var(--md-sys-color-surface-container);
  --md-comp-nav-rail-expanded-modal-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-nav-rail-expanded-modal-container-elevation: var(--md-sys-elevation-level2);
  --md-comp-nav-rail-expanded-container-width-minimum: 220px;
  --md-comp-nav-rail-expanded-container-width-maximum: 360px;
  --md-comp-nav-rail-expanded-top-space: 44px;
  --md-comp-nav-rail-item-header-space-minimum: var(--md-sys-measurement-space500);
  --md-comp-nav-rail-item-icon-size: 24px;
  --md-comp-nav-rail-item-container-height: 64px;
  --md-comp-nav-rail-item-short-container-height: 56px;
  --md-comp-nav-rail-item-container-vertical-space: var(--md-sys-measurement-space75);
  --md-comp-nav-rail-item-active-indicator-shape: var(--md-sys-shape-corner-full);
  --md-comp-nav-rail-item-active-indicator-leading-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-active-indicator-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-vertical-active-indicator-width: 56px;
  --md-comp-nav-rail-item-vertical-active-indicator-height: 32px;
  --md-comp-nav-rail-item-vertical-icon-label-space: var(--md-sys-measurement-space50);
  --md-comp-nav-rail-item-vertical-leading-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-vertical-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-horizontal-active-indicator-height: 56px;
  --md-comp-nav-rail-item-horizontal-icon-label-space: var(--md-sys-measurement-space100);
  --md-comp-nav-rail-item-horizontal-full-width-leading-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-horizontal-full-width-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-nav-rail-item-active-indicator-color: var(--md-sys-color-secondary-container);
  --md-comp-nav-rail-item-active-icon-color: var(--md-sys-color-on-secondary-container);
  --md-comp-nav-rail-item-inactive-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-nav-rail-item-active-label-text-color: var(--md-sys-color-secondary);
  --md-comp-nav-rail-item-inactive-label-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-nav-rail-item-state-layer-color: var(--md-sys-color-on-secondary-container);
  --_hug-start: calc((var(--md-comp-nav-rail-collapsed-container-width) - var(--md-comp-nav-rail-item-vertical-active-indicator-width)) / 2); /* 20px, derived */

  position: sticky; inset-block-start: 0; block-size: 100dvh; box-sizing: border-box;
  display: flex; flex-direction: column;
  inline-size: var(--md-comp-nav-rail-collapsed-container-width);
  padding-block: var(--md-comp-nav-rail-collapsed-top-space) 16px;
  background: var(--md-comp-nav-rail-collapsed-container-color);
  border-radius: var(--md-sys-shape-corner-none);
}
.md-nav-rail[data-expanded="true"] {
  inline-size: fit-content;
  min-inline-size: var(--md-comp-nav-rail-expanded-container-width-minimum);
  max-inline-size: var(--md-comp-nav-rail-expanded-container-width-maximum);
  padding-block-start: var(--md-comp-nav-rail-expanded-top-space);
  background: var(--md-comp-nav-rail-expanded-container-color);
}
.md-nav-rail__header { display: flex; flex-direction: column; align-items: center; gap: 4px; /* derived */
  margin-block-end: var(--md-comp-nav-rail-item-header-space-minimum); }
.md-nav-rail[data-expanded="true"] .md-nav-rail__header { align-items: flex-start; padding-inline-start: var(--_hug-start); }
.md-nav-rail__list { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 0 1 auto;
  display: flex; flex-direction: column; gap: var(--md-comp-nav-rail-collapsed-item-vertical-space); }
.md-nav-rail[data-align="center"] .md-nav-rail__list { margin-block: auto; }
.md-nav-rail[data-expanded="true"] .md-nav-rail__list { gap: 0; }
.md-nav-rail[data-divider] { border-inline-end: 1px solid var(--md-sys-color-outline-variant); }

/* vertical item (collapsed) */
.md-rail-item {
  position: relative; display: grid; justify-items: center; align-content: start;
  grid-template-areas: "icon" "label";
  grid-template-rows: var(--md-comp-nav-rail-item-vertical-active-indicator-height) auto;
  row-gap: var(--md-comp-nav-rail-item-vertical-icon-label-space);
  min-block-size: var(--md-comp-nav-rail-item-container-height); box-sizing: border-box;
  padding-block: var(--md-comp-nav-rail-item-container-vertical-space);
  padding-inline: var(--md-comp-nav-rail-item-vertical-leading-space) var(--md-comp-nav-rail-item-vertical-trailing-space);
  color: var(--md-comp-nav-rail-item-inactive-label-text-color); text-decoration: none; outline: none; cursor: pointer;
}
.md-rail-item__indicator {
  grid-area: icon; position: relative; isolation: isolate; overflow: hidden;
  inline-size: var(--md-comp-nav-rail-item-vertical-active-indicator-width);
  block-size: var(--md-comp-nav-rail-item-vertical-active-indicator-height);
  border-radius: var(--md-comp-nav-rail-item-active-indicator-shape);
}
.md-rail-item__indicator::before { content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: var(--md-comp-nav-rail-item-active-indicator-color); transform: scaleX(0); opacity: 0; }
.md-rail-item__state-layer { position: absolute; inset: 0; border-radius: inherit;
  background: var(--md-comp-nav-rail-item-state-layer-color); opacity: 0; }
.md-rail-item__icon { grid-area: icon; align-self: center; position: relative; z-index: 1;
  inline-size: var(--md-comp-nav-rail-item-icon-size); block-size: var(--md-comp-nav-rail-item-icon-size);
  font-size: var(--md-comp-nav-rail-item-icon-size); color: var(--md-comp-nav-rail-item-inactive-icon-color); }
.md-rail-item__label { grid-area: label; z-index: 1; max-inline-size: 100%; text-align: center; hyphens: auto;
  font: var(--md-sys-typescale-label-medium-weight) var(--md-sys-typescale-label-medium-size)/var(--md-sys-typescale-label-medium-line-height) var(--md-sys-typescale-label-medium-font);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking); }
.md-badge--trailing { display: none; }

/* horizontal item (expanded) */
.md-nav-rail[data-expanded="true"] .md-rail-item {
  grid-template-areas: "icon label badge"; grid-template-columns: var(--md-comp-nav-rail-item-icon-size) auto auto;
  grid-template-rows: var(--md-comp-nav-rail-item-horizontal-active-indicator-height);
  justify-content: start; align-items: center; column-gap: var(--md-comp-nav-rail-item-horizontal-icon-label-space);
  min-block-size: var(--md-comp-nav-rail-item-short-container-height); padding-block: 0;
  padding-inline: calc(var(--_hug-start) + var(--md-comp-nav-rail-item-active-indicator-leading-space)) 0;
}
.md-nav-rail[data-expanded="true"] .md-rail-item__indicator {
  grid-area: 1 / 1 / 2 / -1; inline-size: auto; justify-self: stretch;
  block-size: var(--md-comp-nav-rail-item-horizontal-active-indicator-height);
  margin-inline: calc(-1 * var(--md-comp-nav-rail-item-active-indicator-leading-space)) calc(-1 * var(--md-comp-nav-rail-item-active-indicator-trailing-space));
}
.md-nav-rail[data-expanded="true"] .md-rail-item__label { text-align: start; white-space: nowrap;
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking); }
.md-nav-rail[data-expanded="true"] .md-rail-item__icon .md-badge { display: none; }
.md-nav-rail[data-expanded="true"] .md-badge--trailing { display: inline-flex; grid-area: badge; } /* 8px gap = column-gap */
/* fill option: indicator spans rail width minus 16/16 */
.md-nav-rail[data-expanded="true"][data-indicator="fill"] .md-rail-item {
  grid-template-columns: var(--md-comp-nav-rail-item-icon-size) 1fr auto;
  padding-inline: calc(var(--md-comp-nav-rail-item-horizontal-full-width-leading-space) + var(--md-comp-nav-rail-item-active-indicator-leading-space))
                  calc(var(--md-comp-nav-rail-item-horizontal-full-width-trailing-space) + var(--md-comp-nav-rail-item-active-indicator-trailing-space));
}

/* modal */
.md-nav-rail--modal {
  position: fixed; inset-block: 0; inset-inline-start: 0; inset-inline-end: auto; margin: 0; border: 0;
  max-block-size: none; block-size: 100dvh;
  background: var(--md-comp-nav-rail-expanded-modal-container-color);
  border-start-end-radius: var(--md-comp-nav-rail-expanded-modal-container-shape);
  border-end-end-radius: var(--md-comp-nav-rail-expanded-modal-container-shape);
  box-shadow: var(--md-comp-nav-rail-expanded-modal-container-elevation); /* elevation primitive → shadow */
}
.md-nav-rail--modal::backdrop { background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent); }
```

**(c) States**
```css
.md-rail-item[aria-current="page"] { color: var(--md-comp-nav-rail-item-active-label-text-color); }
.md-nav-rail[data-expanded="true"] .md-rail-item[aria-current="page"] { color: var(--md-sys-color-on-secondary-container); }
.md-rail-item[aria-current="page"] .md-rail-item__indicator::before { transform: none; opacity: 1; }
.md-rail-item[aria-current="page"] .md-rail-item__icon { color: var(--md-comp-nav-rail-item-active-icon-color); font-variation-settings: "FILL" 1; }
@media (hover: hover) { .md-rail-item:hover .md-rail-item__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); } }
.md-rail-item:focus-visible .md-rail-item__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-rail-item:active .md-rail-item__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-rail-item:focus-visible .md-rail-item__indicator {       /* focus ring primitive, outer offset */
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
```
Ripple primitive inside `.md-rail-item__state-layer`. No disabled state.

**(d) Motion**
```css
.md-nav-rail { transition: inline-size var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
                           background-color var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing); }
.md-rail-item__indicator::before { transition:
  transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-rail-item, .md-rail-item__icon, .md-rail-item__state-layer { transition:
  color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
/* modal enter (allow-discrete for <dialog> display/overlay) */
.md-nav-rail--modal { transition: translate var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
  display var(--md-sys-motion-spring-default-spatial-duration) allow-discrete, overlay var(--md-sys-motion-spring-default-spatial-duration) allow-discrete;
  translate: -100% 0; }
.md-nav-rail--modal[open] { translate: 0 0; }
@starting-style { .md-nav-rail--modal[open] { translate: -100% 0; } }
.md-nav-rail--modal:dir(rtl):not([open]) { translate: 100% 0; }
@starting-style { .md-nav-rail--modal:dir(rtl)[open] { translate: 100% 0; } }
.md-nav-rail--modal::backdrop { transition: opacity var(--md-sys-motion-spring-default-effects-duration) linear; }
@media (prefers-reduced-motion: reduce) {
  .md-nav-rail, .md-nav-rail--modal { transition-property: opacity; translate: none; }
  .md-rail-item__indicator::before { transform: none; }
}
```
Width `inline-size: fit-content` can't be interpolated: JS measures the expanded width first, sets an explicit px `inline-size`, then removes it on `transitionend` (or use `interpolate-size: allow-keywords` where supported). Item morph: wrap the toggle in `document.startViewTransition()` with `view-transition-name` per indicator/icon/label and `::view-transition-group(*) { animation-timing-function: var(--md-sys-motion-spring-default-spatial-easing); animation-duration: var(--md-sys-motion-spring-default-spatial-duration); }`; fallback: instant item layout switch while the width animates and labels cross-fade.

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-nav-rail { border-inline-end: 1px solid CanvasText; }
  .md-rail-item[aria-current="page"] .md-rail-item__indicator::before { background: Highlight; forced-color-adjust: none; }
  .md-rail-item[aria-current="page"] .md-rail-item__icon,
  .md-nav-rail[data-expanded="true"] .md-rail-item[aria-current="page"] .md-rail-item__label { color: HighlightText; forced-color-adjust: none; }
  .md-rail-item:focus-visible .md-rail-item__indicator { outline-color: CanvasText; }
}
```

**(f) Behaviour / JS**
- Menu button: standard → toggle `data-expanded`, `aria-expanded`, `aria-label`, swap icon, FAB ↔ extended FAB, show/hide `.md-nav-rail__secondary`; modal/hide → `dialog.showModal()` / `close()`. Fire `expanded-change`.
- Modal: close on `cancel` (Escape/back), backdrop click (`click` with `event.target === dialog`), menu button, item activation; restore focus to the menu button.
- Item activation (click/Enter/Space): move `aria-current`, fire `change`; Space on `<a>` → `preventDefault()` + `click()`.
- Arrow Up/Down/Home/End: move focus among `.md-rail-item` elements in the list (Tab order unchanged).
- Dev warnings for item count and multiple active items; `narrow` → set width var to 80px.

## 11. Source gaps & decisions

- Collapsed container: color diagram says "Surface container (optional)", tokens say `surface` → tokens used; fill can be turned off (`no-fill` = transparent).
- `item.header-space-minimum` (40dp) is unexplained in text → used as the minimum gap between the header (menu/FAB) and the first item (previous draft applied it to section headers; corrected).
- `item.short.container.height` (56dp) is unexplained → height of horizontal (expanded) items, matching the 56dp indicator.
- Expanded item spacing, hug-mode start offset, menu↔FAB gap, bottom padding are image-only → 0dp, 20dp (keeps icon x stable during morph), 4dp, 16dp (derived).
- Active label color for horizontal items exists only in the color diagram (on-secondary-container); no token → applied via selector.
- Modal shape token is `corner.large` on all corners → applied to end corners only, start edge flush with window (derived; consistent with drawer).
- Scrim not mentioned on the rail page → `--md-sys-color-scrim` @ 0.32 per guidelines ("beneath modals and expanded navigation").
- Motion values absent → guidelines' mapping: default spatial/effects for expanding rail and its content opacity; fast for selection.
- Predictive back has no web equivalent → native `<dialog>` close request (Escape / Android back).
- Keyboard: source allows Tab **or** arrows between items → both supported, no roving tabindex.
- Subhead typography for secondary destinations not specified → title-small (derived).
