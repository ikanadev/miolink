# App bars

> Source: https://m3.material.io/components/app-bars · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
App bars display labels and page navigation controls at the top of the page. They describe the current page and provide 1–2 essential actions. Many page actions belong in a **toolbar** (see toolbars.md), not the app bar.

**Use when**
- Showing the current page/section/product title, a navigation affordance (Back / Menu) and 1–2 key actions; may include global controls (search, notifications).
- Providing an emphasized search entry point on a home page (search app bar).

**Don't use when**
- Many actions are needed → toolbar; avoid overflow menus in the app bar when possible.
- A second row of controls (e.g. chips) is needed → separate component; the app bar can animate on/off screen together with it.

**M3 Expressive changes (May 2025)**
- Renamed **top app bar → app bar**.
- New **search app bar**: icons inside and outside the search bar, optional centered text; opens the **search view** when selected.
- New **medium flexible** / **large flexible** replace baseline **medium** / **large** (not recommended): reduced height, larger title, subtitle, leading or centered text, wrapping, images and filled buttons.
- **Small** gains subtitle, centered text, images, filled buttons. **Center-aligned** merged into small (centered configuration).
- vs M2: on scroll no drop shadow — a color fill separates bar from content; larger default text; smaller default height.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Search app bar | Search container instead of headline | 64 high (`small` set); search container 56, `corner.full`; opens search view |
| Small | Single-line headline (`title-large`) | 64 high; dense layouts / scrolled pages; image may replace text; never wraps |
| Medium flexible | `headline-medium` headline, ≤2 lines | 112 / 136 with subtitle (min; hugs content); can collapse to small on scroll |
| Large flexible | `display-small` headline, ≤2 lines | 120 / 152 with subtitle (min; hugs content); can collapse to small on scroll |
| Medium / Large (baseline) | Not recommended → flexible variants | Baseline token sets not included in source text |
| Center-aligned (baseline) | Merged into small | `centered` alignment |
| Text alignment | leading (default) / centered | Headline + subtitle together |
| Subtitle | Optional line under headline | small `label-medium` · medium flex `label-large` · large flex `title-medium` |
| Image / logo | Brand imagery | Small: may replace all text. Flexible: above the text |
| Filled trailing icon button | Trailing icons replaced by **one** filled (primary) or tonal icon button, default or wide | Never more than one |
| Scroll color | flat ↔ on-scroll | §6 |
| Transparent on scroll | Container stays transparent; icon buttons get container fills | Consider narrow icon buttons (e.g. Back) |

## 3. Anatomy
Small / medium flexible / large flexible:
1. **Container** — full width, square corners.
2. **Leading button** — navigation icon button: Menu (opens modal expanded navigation rail) or Back.
3. **Trailing elements** — ≤2 icon buttons (or one filled/tonal), or an avatar.
4. **Headline**.
5. **Subtitle** (optional).
6. **Image / logo** (optional).

Search app bar: 1 container · 2 leading icon button (or product logo) · 3 hinted search text (must contain "Search") · 4 trailing icon or avatar (inside and/or outside the search container) · 5 search container (pill).

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | flat (scrollTop 0) | `container.color` | `surface` #fef7ff |
| Container | on scroll | `on-scroll.container.color` | `surface-container` #f3edf7 |
| Headline | — | `title.color` | `on-surface` #1d1b20 |
| Subtitle | — | `subtitle.color` | `on-surface-variant` #49454f |
| Leading icon | — | `leading-icon.color` | `on-surface` |
| Trailing icon | — | `trailing-icon.color` | `on-surface-variant` |
| Search container | flat | `search.container.color` | `surface-container` |
| Search container | on scroll | `search.on-scroll.container.color` | `surface-container-highest` #e6e0e9 |
| Search hint text | — | `search.label.color` | `on-surface-variant` |
| Search container state layer | hover / pressed | `search-bar.{hover,pressed}.state-layer.color` | `on-surface` @ 0.08 / 0.10 |
| Search container focus ring | focus-visible | `search-bar.focus.indicator.color` | `secondary` #625b71, 3px, outer offset 2px |
| Search leading icon / trailing icon (inside) | — | `search-bar.leading-icon.color` / `trailing-icon.color` | `on-surface` / `on-surface-variant` |

- Alternate search container: `surface-bright` on darker backgrounds; any custom mapping needs ≥3:1 between search text and container.
- Icon buttons use their own icon-button tokens for states; the app bar only sets their icon color (above). Disabled actions → icon button disabled tokens.

### 4.2 Size, layout & shape

| Variant | Container height | Headline lines | Layout |
| --- | --- | --- | --- |
| Search | 64 | — | single row: leading · search container · trailing |
| Small | 64 (with or without subtitle) | 1 | single row: leading · text block · trailing |
| Medium flexible | 112 / 136 with subtitle | ≤2 | top row 64 (leading · trailing) + text block below |
| Large flexible | 120 / 152 with subtitle | ≤2 | top row 64 + text block below |

Common (tokens):
- Container: `corner.none`, 100% window width, never shorter than default height.
- Leading space 4 (`space50`); trailing space 4 (`space50`); gap between icon buttons 0 (`space0`) — 48px icon-button targets provide spacing.
- Icon 24; avatar 32 (in a 48 target, derived from search-bar `contained.avatar.target-size`).
- Search app bar: search container leading/trailing space 8 (`search.leading-space`/`trailing-space`, from the leading/trailing app-bar elements).

Search container internals (`search-bar.contained`): height 56; padding-inline 4 (16 when no actions inside: `no-actions.*-space`); icon ↔ label gap 4; trailing actions gap 0 with 4 leading/trailing space; avatar 30 round in 48 target; hint `body-large`. Width: 100% of the space between leading and trailing elements up to **312**, then grows to only **50%** of that space (source).

Derived layout values (measurement diagrams are image-only; values computed from tokens and line heights):
- Small/search single row: items vertically centered in 64. Title inline-start: 16 from container edge when no leading button (derived: 4 leading space + 12 inset); otherwise directly after the 48 leading button (52 from edge) (derived: Compose TopAppBar). Title inline-end: before trailing elements (or 16 from edge when none).
- Small with subtitle: title-large 28 + label-medium 16 = 44 stacked, centered in 64.
- Flexible text block: padding-inline 16 (derived); bottom padding = height − 64 − text lines: medium 112−64−36 = **12**, medium+subtitle 136−64−36−20 = **16**, large 120−64−44 = **12**, large+subtitle 152−64−44−24 = **20** (derived arithmetic). Two-line headlines add one line-height (+36 medium, +44 large); token heights are therefore `min-height`.
- Image/logo (flexible): above headline in the text block; max height = one headline line (derived). Small: logo replaces text, max height 32 (derived).

### 4.3 Typography

| Part | Variant | Role |
| --- | --- | --- |
| Search hint / input | Search | `body-large` (16/24, 400, 0.5) |
| Headline | Small | `title-large` (22/28) |
| Headline | Medium flexible | `headline-medium` (28/36) |
| Headline | Large flexible | `display-small` (36/44) |
| Subtitle | Small | `label-medium` (12/16, 500) |
| Subtitle | Medium flexible | `label-large` (14/20, 500) |
| Subtitle | Large flexible | `title-medium` (16/24, 500) |

Don't customize headline/subtitle sizes. Collapsed flexible (small state) uses `title-large`.

### 4.4 Elevation

| State | Token | Value |
| --- | --- | --- |
| Flat | `container.elevation` | `level0` |
| On scroll | `on-scroll.container.elevation` | `level2` (3dp) — rendered as the tonal color change only, **no shadow** (§11) |

### 4.5 Component token list

**`md.comp.app-bar` (common)**
- container.color → md.sys.color.surface; on-scroll.container.color → md.sys.color.surface-container
- search.container.color → md.sys.color.surface-container; search.on-scroll.container.color → md.sys.color.surface-container-highest
- search.label.color → md.sys.color.on-surface-variant
- container.elevation → md.sys.elevation.level0; on-scroll.container.elevation → md.sys.elevation.level2
- title.color → md.sys.color.on-surface; subtitle.color → md.sys.color.on-surface-variant
- leading-icon.color → md.sys.color.on-surface; trailing-icon.color → md.sys.color.on-surface-variant
- leading-space, trailing-space → md.sys.measurement.space50 (4dp); icon-button-space → md.sys.measurement.space0 (0dp)
- search.leading-space, search.trailing-space → md.sys.measurement.space100 (8dp)
- container.shape → md.sys.shape.corner.none
- avatar.size → 32dp; icon.size → 24dp

**`md.comp.app-bar.small`** (small + search app bar)
- container.height → 64dp
- title.font → md.sys.typescale.title-large; subtitle.font → md.sys.typescale.label-medium
- search.label-text.font → md.sys.typescale.body-large
- search.container.shape → md.sys.shape.corner.full; search.container.height → 56dp

**`md.comp.app-bar.medium-flexible`**
- container.height → 112dp; with-subtitle.container.height → 136dp
- title.font → md.sys.typescale.headline-medium; subtitle.font → md.sys.typescale.label-large

**`md.comp.app-bar.large-flexible`**
- container.height → 120dp; with-subtitle.container.height → 152dp
- title.font → md.sys.typescale.display-small; subtitle.font → md.sys.typescale.title-medium

**`md.comp.search-bar`** (search container in the search app bar; full spec in search.md)
- Contained: leading-margin, trailing-margin → md.sys.measurement.space300 (24dp); motion.spring → md.sys.motion.spring.fast.spatial; leading-space, trailing-space → md.sys.measurement.space50 (4dp); no-actions.leading-space, no-actions.trailing-space → md.sys.measurement.space200 (16dp); icon-label.gap → md.sys.measurement.space50 (4dp); avatar.target-size → 48dp; trailing-actions.gap → md.sys.measurement.space0; trailing-actions.leading-space, trailing-actions.trailing-space → md.sys.measurement.space50 (4dp)
- Common: container.height → 56dp; container.shape → md.sys.shape.corner.full; avatar.size → 30dp; avatar.shape → md.sys.shape.corner.full; icon.size → 24dp; supporting-text.* and input-text.* (font, line-height, size, weight, tracking) → md.sys.typescale.body-large.* (Roboto, 24, 16, 400, 0.5)
- Enabled: container.color → md.sys.color.surface-container-high; container.elevation → md.sys.elevation.level3; leading-icon.color → md.sys.color.on-surface; trailing-icon.color → md.sys.color.on-surface-variant; supporting-text.color → md.sys.color.on-surface-variant; input-text.color → md.sys.color.on-surface (container color/elevation overridden by app-bar search tokens, §11)
- Hovered: hover.state-layer.color → md.sys.color.on-surface; hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08); hover.supporting-text.color → md.sys.color.on-surface-variant
- Pressed: pressed.state-layer.color → md.sys.color.on-surface; pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10); pressed.supporting-text.color → md.sys.color.on-surface-variant
- Focused: focus.indicator.color → md.sys.color.secondary; focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp); focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
- Baseline: leading-space, trailing-space, leading-icon.leading-icon-label-space, trailing-icon.label-trailing-icon-space → md.sys.measurement.space200 (16dp)

**`md.comp.search-view`** (opened from the search app bar; full spec in search.md)
- Color: container.color → md.sys.color.surface-container-high; contained.background.color → md.sys.color.surface-container-low; container.elevation → md.sys.elevation.level3; header.supporting-text.color → md.sys.color.on-surface-variant; header.input-text.color → md.sys.color.on-surface; header.leading-icon.color → md.sys.color.on-surface; header.trailing-icon.color → md.sys.color.on-surface-variant; divider.color → md.sys.color.outline
- Common: full-screen.container.shape → md.sys.shape.corner.none; header.supporting-text.* and header.input-text.* → md.sys.typescale.body-large.*
- Contained (expressive): leading-margin, trailing-margin → md.sys.measurement.space150 (12dp); docked.bar-results.gap → md.sys.measurement.space25 (2dp); docked.results.shape → md.sys.shape.corner.medium (12dp); docked.bar.shape → md.sys.shape.corner.full; full-screen.bar.container.height → 56dp; icon-label.gap → md.sys.measurement.space50 (4dp)
- Divided (baseline): docked.container.shape → md.sys.shape.corner.extra-large (28dp); full-screen.header.container.height → 72dp; docked.header.container.height → 56dp; leading-space, trailing-space, leading-icon.leading-icon-label-space, trailing-icon.label-trailing-icon-space → md.sys.measurement.space200 (16dp)

Baseline medium/large app bar token sets: referenced but **not included in the source text** (not recommended; not implemented).

## 5. States & interaction

| Part \ state | Rest (flat) | Scrolled | Hover | Focus-visible | Pressed |
| --- | --- | --- | --- | --- | --- |
| Container | `surface` | `surface-container` (or transparent option) | — | — | — |
| Search container | `surface-container` | `surface-container-highest` | +on-surface @0.08 | +@0.10 (derived: focus opacity) + focus ring | +@0.10 + ripple |
| Leading / trailing icon buttons | icon-button standard, icon color per §4.1 | transparent option → filled container (derived: `surface-container` + icon color unchanged) | per icon button | per icon button | per icon button |
| Headline / subtitle | per §4.1 | flexible may collapse to small | — | — | — |

- Container itself is not interactive. Interactive children: icon buttons, avatar, logo (optional action), search container.
- Touch: tap → ripple. Cursor: hover state; click → ripple in active and inactive states. Keyboard: focus ring on every interactive element.
- Search container activation (click/Enter/Space) opens the search view (search.md).

## 6. Motion & behavior
- **Scroll fill**: same color as background at top; fill with `surface-container` when content scrolls under it (scrollTop > 0). Color animates with `spring-fast-effects` (derived; source gives no timing). Search container swaps simultaneously.
- **Transparent on scroll** (option): container stays transparent; icon buttons gain container fills.
- **Pinned** (default) or **hide/reveal**: hides when content scrolls down (finger up), reappears on scroll up. Hide = translateY(−100%) with `spring-default-spatial` (derived: partial-screen "beyond bounds" transition); also reveal on focus-within.
- **Collapse (compress)**: medium/large flexible → small when scrolled; stay small until scrolled back to top. Never transform into a search app bar. Web mapping: height interpolates from token height to 64 driven by scroll offset (scroll-linked, no spring) or, for threshold collapse, `spring-default-spatial` on height and `spring-fast-effects` cross-fade between the large text block and a small inline title.
- Moves together with an attached controls row (chips) when hiding.
- **Search**: search bar → search view transform uses `md.sys.motion.spring.fast.spatial` (`search-bar.contained.motion.spring`).
- **Resizing**: always 100% width; trailing actions collapse into an overflow menu at smaller breakpoints. Search container 100% up to 312, then 50%. Search app bar: ≤2 trailing icons + avatar on mobile, ≤4 on large screens.
- **RTL**: layout mirrors automatically (logical properties); mirror directional icons (Back arrow).

## 7. Usage guidelines
- One action, two if necessary; primary action alters or exits the whole page (Send, Save, Edit).
- Emphasize one action with filled or tonal (optionally wide) icon button; never multiple filled/tonal; if filled/tonal, use only one icon button.
- ≤2 trailing icon buttons, most-used closest to the leading edge. Don't open "more actions" menus from them; use a toolbar.
- Filled icons preferred; outlined acceptable (e.g. unselected toggles).
- Headline: brief; page, section or product. Never truncate. Small: never wrap; flexible: ≤2 lines. Leading or centered; subtitle follows.
- Images/logos: high quality, must not disrupt function.
- Container: square corners, default height, full width; don't reposition or reshape.
- Search: placeholder contains "Search" ("Search", "Search inbox", "Search Photos"). Leading may be a logo (cosmetic or Home/refresh) — never opens the expanded nav rail. Not 3 icons + avatar.

## 8. Accessibility
- Container: `<header>` (implicit `banner` only when page-level, outside `<main>`/`<article>`). Not `role="toolbar"` (source: Tab navigation).
- Headline: heading element (`<h1>` for the page title, web mapping); accessible name = visible text, add context with visually hidden text if needed.
- Actions: `<button>` with `aria-label` describing the action ("Back", "Open navigation menu", "View on map"); toggles `aria-pressed`; menu button `aria-haspopup="menu"` + `aria-expanded`.
- Search app bar: search container is a `<button>` whose accessible name is the hint text, inside `role="search"`; opening moves focus to the view's input; closing returns focus to the bar (web mapping).
- Initial focus: leading button. Keyboard (source): **Tab** next element; **Space/Enter** activate. Shift+Tab previous (web mapping).
- Must stay reachable while scrolled: reveal hidden bar on `focusin`; collapsed flexible keeps all actions.
- Logo: action → accessible name; cosmetic → `alt=""`.
- Targets ≥48×48 (touch target primitive). Contrast: search text vs container ≥3:1 (source).

## 9. Implementation checklist
- API: `variant` = `search` | `small` (default) | `medium-flexible` | `large-flexible`; `centered`; `scroll-behavior` = `pinned` | `hide` | `collapse` (flexible only); `scroll-target`; `transparent-on-scroll`; reflected `scrolled`; events `scrolled-change`, `search-open`.
- Slots: `leading`, `headline`, `subtitle`, `image`, `trailing`; search: `search-trailing` (inside), `trailing` (outside), `avatar`.
- [ ] Token heights as `min-height`; 4 inline padding; 0 gap; 24 icons; 32 avatar.
- [ ] Headline: small single-line no-wrap (no ellipsis — developer warning if overflowing); flexible `line-clamp: 2`.
- [ ] Color swap on scroll; no box-shadow.
- [ ] Collapse flexible → small; hide/reveal; reveal on focus.
- [ ] Search container width rule; overflow menu for trailing actions (optional).
- [ ] RTL via logical properties; dev warnings for >2 trailing actions or >1 filled/tonal.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<header class="m3-app-bar" data-variant="medium-flexible" data-align="start" part="container">
  <div class="m3-app-bar__row" part="row">
    <div class="m3-app-bar__leading" part="leading"><button class="m3-icon-button" aria-label="Back">…</button></div>
    <div class="m3-app-bar__inline-text" part="inline-text" aria-hidden="true">Inbox</div><!-- small-state title (flexible collapsed) -->
    <div class="m3-app-bar__trailing" part="trailing"><button class="m3-icon-button" aria-label="Edit">…</button></div>
  </div>
  <div class="m3-app-bar__text" part="text">
    <img class="m3-app-bar__image" part="image" alt="">                <!-- optional -->
    <h1 class="m3-app-bar__headline" part="headline">Inbox</h1>
    <p class="m3-app-bar__subtitle" part="subtitle">24 unread</p>   <!-- optional -->
  </div>
</header>
<!-- small: text block lives inside the row (between leading and trailing) -->
<!-- search -->
<header class="m3-app-bar" data-variant="search">
  <div class="m3-app-bar__row">
    <div class="m3-app-bar__leading"><button class="m3-icon-button" aria-label="Open navigation menu">…</button></div>
    <div class="m3-app-bar__search-slot" role="search">
      <button class="m3-app-bar__search" part="search" aria-haspopup="dialog" aria-expanded="false">
        <span class="m3-app-bar__search-hint">Search inbox</span>
        <span class="m3-app-bar__search-trailing"><!-- icon buttons inside --></span>
      </button>
    </div>
    <div class="m3-app-bar__trailing"><button class="m3-avatar-button" aria-label="Account">…</button></div>
  </div>
</header>
```
Note: icon buttons placed inside the search `<button>` would be nested interactive content → render the search container as a `<div>` with the hint as a `<button>` filling it and inner icon buttons as siblings (web mapping).

**(b) Custom properties**
```css
.m3-app-bar {
  --md-comp-app-bar-container-color: var(--md-sys-color-surface);
  --md-comp-app-bar-on-scroll-container-color: var(--md-sys-color-surface-container);
  --md-comp-app-bar-search-container-color: var(--md-sys-color-surface-container);
  --md-comp-app-bar-search-on-scroll-container-color: var(--md-sys-color-surface-container-highest);
  --md-comp-app-bar-search-label-color: var(--md-sys-color-on-surface-variant);
  --md-comp-app-bar-title-color: var(--md-sys-color-on-surface);
  --md-comp-app-bar-subtitle-color: var(--md-sys-color-on-surface-variant);
  --md-comp-app-bar-leading-icon-color: var(--md-sys-color-on-surface);
  --md-comp-app-bar-trailing-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-app-bar-leading-space: var(--md-sys-measurement-space50);
  --md-comp-app-bar-trailing-space: var(--md-sys-measurement-space50);
  --md-comp-app-bar-icon-button-space: var(--md-sys-measurement-space0);
  --md-comp-app-bar-search-leading-space: var(--md-sys-measurement-space100);
  --md-comp-app-bar-search-trailing-space: var(--md-sys-measurement-space100);
  --md-comp-app-bar-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-app-bar-icon-size: 24px;
  --md-comp-app-bar-avatar-size: 32px;
  --md-comp-app-bar-small-container-height: 64px;
  --md-comp-app-bar-small-search-container-height: 56px;
  --md-comp-app-bar-small-search-container-shape: var(--md-sys-shape-corner-full);
  --md-comp-app-bar-medium-flexible-container-height: 112px;
  --md-comp-app-bar-medium-flexible-with-subtitle-container-height: 136px;
  --md-comp-app-bar-large-flexible-container-height: 120px;
  --md-comp-app-bar-large-flexible-with-subtitle-container-height: 152px;
}
```

**Layout & typography**
```css
.m3-app-bar { display: flex; flex-direction: column; inline-size: 100%; box-sizing: border-box;
  background: var(--md-comp-app-bar-container-color); border-radius: var(--md-comp-app-bar-container-shape);
  position: sticky; inset-block-start: 0; z-index: 1; /* derived */ }
.m3-app-bar__row { position: relative; display: flex; align-items: center; block-size: var(--md-comp-app-bar-small-container-height);
  padding-inline: var(--md-comp-app-bar-leading-space) var(--md-comp-app-bar-trailing-space); }
.m3-app-bar__leading { color: var(--md-comp-app-bar-leading-icon-color); }
.m3-app-bar__trailing { display: flex; gap: var(--md-comp-app-bar-icon-button-space); margin-inline-start: auto;
  color: var(--md-comp-app-bar-trailing-icon-color); }
.m3-app-bar__headline { margin: 0; color: var(--md-comp-app-bar-title-color); }
.m3-app-bar__subtitle { margin: 0; color: var(--md-comp-app-bar-subtitle-color); }
/* small */
.m3-app-bar[data-variant="small"] .m3-app-bar__text { flex: 1; min-inline-size: 0; padding-inline: 12px 4px; } /* derived; 0 start inset when leading present */
.m3-app-bar[data-variant="small"] .m3-app-bar__leading + .m3-app-bar__text { padding-inline-start: 0; }
.m3-app-bar[data-variant="small"] .m3-app-bar__headline { white-space: nowrap;
  font: var(--md-sys-typescale-title-large-weight) var(--md-sys-typescale-title-large-size)/var(--md-sys-typescale-title-large-line-height) var(--md-sys-typescale-title-large-font);
  letter-spacing: var(--md-sys-typescale-title-large-tracking); }
.m3-app-bar[data-variant="small"] .m3-app-bar__subtitle { /* label-medium via typography role pattern */ }
/* flexible */
.m3-app-bar[data-variant$="flexible"] .m3-app-bar__text { padding-inline: 16px; padding-block-end: var(--_pb); }
.m3-app-bar[data-variant$="flexible"] .m3-app-bar__headline { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
.m3-app-bar[data-variant="medium-flexible"] { min-block-size: var(--md-comp-app-bar-medium-flexible-container-height); --_pb: 12px; }
.m3-app-bar[data-variant="medium-flexible"]:has(.m3-app-bar__subtitle) { min-block-size: var(--md-comp-app-bar-medium-flexible-with-subtitle-container-height); --_pb: 16px; }
.m3-app-bar[data-variant="large-flexible"] { min-block-size: var(--md-comp-app-bar-large-flexible-container-height); --_pb: 12px; }
.m3-app-bar[data-variant="large-flexible"]:has(.m3-app-bar__subtitle) { min-block-size: var(--md-comp-app-bar-large-flexible-with-subtitle-container-height); --_pb: 20px; }
/* headline roles: medium-flexible headline-medium + subtitle label-large; large-flexible display-small + subtitle title-medium (typography role pattern) */
.m3-app-bar[data-align="center"] .m3-app-bar__text { text-align: center; }
.m3-app-bar[data-variant="small"][data-align="center"] .m3-app-bar__text { position: absolute; inset-inline: 0; margin-inline: auto; inline-size: fit-content; max-inline-size: calc(100% - 2 * 104px); } /* derived: room for 2 icon buttons + padding */
.m3-app-bar__inline-text { display: none; }
/* search */
.m3-app-bar__search-slot { flex: 1; display: flex; justify-content: center; min-inline-size: 0;
  padding-inline: var(--md-comp-app-bar-search-leading-space) var(--md-comp-app-bar-search-trailing-space);
  container-type: inline-size; }
.m3-app-bar__search { position: relative; display: flex; align-items: center; gap: var(--md-sys-measurement-space50);
  inline-size: max(min(100%, 312px), 50cqi);   /* 100% up to 312, then 50% of the space */
  block-size: var(--md-comp-app-bar-small-search-container-height);
  border-radius: var(--md-comp-app-bar-small-search-container-shape); border: 0;
  padding-inline: var(--md-sys-measurement-space200);   /* no-actions; 4px when icons inside */
  background: var(--md-comp-app-bar-search-container-color); color: var(--md-comp-app-bar-search-label-color);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.m3-app-bar__search:has(.m3-app-bar__search-trailing > *) { padding-inline-end: var(--md-sys-measurement-space50); }
```

**(c) State selectors**
```css
.m3-app-bar[data-scrolled] { background: var(--md-comp-app-bar-on-scroll-container-color); }   /* no box-shadow */
.m3-app-bar[data-scrolled] .m3-app-bar__search { background: var(--md-comp-app-bar-search-on-scroll-container-color); }
.m3-app-bar[data-transparent-on-scroll][data-scrolled] { background: transparent; }
.m3-app-bar[data-transparent-on-scroll][data-scrolled] .m3-icon-button { background: var(--md-sys-color-surface-container); } /* derived fill */
/* search container: state layer primitive (on-surface; hover 0.08, focus 0.10, pressed 0.10), ripple primitive,
   focus ring primitive (outer offset, radius full) on :focus-visible */
.m3-app-bar[data-collapsed] .m3-app-bar__text { display: none; }          /* or animate, see (d) */
.m3-app-bar[data-collapsed] .m3-app-bar__inline-text { display: block; flex: 1; } /* title-large; AT exposure swap in (f) */
.m3-app-bar[data-hidden] { transform: translateY(-100%); }
```

**(d) Motion**
```css
.m3-app-bar { transition:
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  transform var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.m3-app-bar__search { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
/* scroll-linked collapse (preferred): JS sets --_p (0→1) from scroll offset;
   block-size: calc(H - (H - 64px) * var(--_p)); text block opacity: 1 - var(--_p) * 2; inline-text opacity: var(--_p) * 2 - 1 */
@media (prefers-reduced-motion: reduce) {
  .m3-app-bar, .m3-app-bar__search { transition-duration: 0s; }
  /* collapse/hide happen instantly (or as a short opacity fade with spring-fast-effects) */
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .m3-app-bar { border-block-end: 1px solid CanvasText; }   /* tonal separation is lost */
  .m3-app-bar__search { border: 1px solid ButtonText; }
  .m3-app-bar__search:focus-visible { outline-color: Highlight; }
}
```

**(f) Behaviour / JS**
- Scroll observer on `scroll-target` (default the document scroller): set `[data-scrolled]` when scrollTop > 0 (or IntersectionObserver on a 1px sentinel at the content top). Fire `scrolled-change`.
- `hide`: track direction; down → `[data-hidden]`, up → remove; remove on `focusin`; use `inert` only while fully hidden.
- `collapse` (flexible): progress `--_p = clamp(0, scrollTop / (H − 64), 1)`; set `[data-collapsed]` at 1; stays collapsed until scrollTop = 0 (source). Expose the headline text in the inline title and keep only one copy exposed to AT (heading in text block; inline copy `aria-hidden`; when collapsed, swap: move `aria-hidden` to the hidden block and add `role="heading" aria-level="1"` to the inline copy).
- Search: on activation emit `search-open`, set `aria-expanded="true"`, open search view, focus its input; on close restore focus to the search button.
- Overflow (optional): ResizeObserver moves trailing actions beyond the limit into an overflow menu.
- Keyboard: native Tab order; no arrow-key handling.

## 11. Source gaps & decisions
- `on-scroll.container.elevation = level2` vs "no drop shadow, color fill instead" → apply color change only; elevation token kept for platforms using tonal elevation; no `box-shadow`.
- `search-bar.container.color` (surface-container-high) and `elevation` (level3) are for the standalone search bar → app bar uses `app-bar.search.*` colors and no shadow (derived: app-bar search tokens are more specific; source says default search container is surface container).
- No focus state-layer token on `search-bar` → use `md.sys.state.focus.state-layer-opacity` (0.10) per guidelines.
- Measurement diagrams (title insets, bottom padding, image size) are image-only → paddings derived arithmetically from token heights and line heights (§4.2); title inset 16 / after leading button from Compose implementation.
- Flexible heights vs 2-line wrapping: tokens give single-line heights → used as `min-height`, container hugs content (source: "hug the text contents").
- Collapsed flexible state: source says "transform into small app bars" without specifics → collapsed geometry = small tokens (64, `title-large`).
- No motion timing for scroll fill, hide/reveal, collapse → fast effects (color), default spatial (hide), scroll-linked (collapse).
- Transparent-on-scroll icon button fill color unspecified → `surface-container` (derived: matches on-scroll container).
- Small centered title max width not specified → reserve symmetric space for trailing actions (derived).
- Search container width rule (100% to 312, then 50%) implemented as `max(min(100%, 312px), 50cqi)` (web mapping).
- Nesting icon buttons inside a button-search container is invalid HTML → div container + hint button (web mapping).
- Baseline medium/large token sets absent from source → not documented/implemented.
- Small headline must neither wrap nor truncate → `nowrap` + dev warning; recommend medium flexible for long titles.
