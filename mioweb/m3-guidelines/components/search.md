# Search

> Source: https://m3.material.io/components/search · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
- Search lets people navigate a product with queries; use it for products with many items (files, messages).
- A **search bar** has a leading icon, hinted search text, and optional trailing icons/avatar. Selecting it opens **focused search** (formerly "search view"), showing suggestions or results in a list (docked or full-screen).
- Entry points: **search bar** (contents of one view, e.g. "Search your messages"); **search app bar** (app bar variant, search is the primary global function — see app-bars.md); **search icon button** (search is secondary).
- **M3 Expressive (Feb 2025):** bar + view collectively named **search**; styles **contained** (recommended) or **divided** (baseline, not recommended); gaps can group results; the bar **grows wider when focused** (margins 24dp → 12dp); new visual style, motion, more trailing-icon flexibility.
- M2 → M3 baseline: new color mappings + dynamic color; lower elevation, no shadow by default; formerly "open search bar".

## 2. Variants & configurations
| Category | Configuration | Description | Notes |
| --- | --- | --- | --- |
| Style | **Contained** (Expressive, recommended) | Filled pill bar persists; results in a separate filled container. | Bar shape identical unfocused/focused; only margins shrink. |
| Style | Divided (baseline) | Header + divider + results in one surface. | Not recommended in Expressive. |
| Layout | **Docked** | Results list opens below the bar; scrim over main content. | Medium & expanded windows (≥600px). Width 360–720dp; height 240dp – 2/3 window height. |
| Layout | **Full-screen** | Focused search fills the window. | Default in compact windows (<600px). |
| Trailing | Avatar / 1 icon button / 2 icon buttons / icon button + avatar | | Max two trailing elements. |
| Leading | Navigation icon button (menu, back) or non-functional search icon | | Focused search: leading becomes **back**. |
| Focused | Optional **clear** (×) trailing button | Clears input text. | Shown only when value is non-empty (derived). |
| Results | List component, optional gaps between groups, category labels, chips | | See lists.md. |

## 3. Anatomy
1. **Search bar container** – 56dp pill.
2. **Leading icon** – icon button (48dp target) or non-functional search icon.
3. **Supporting text** – hinted search text (placeholder).
4. **Trailing icon(s) / avatar** (optional).
5. **Input text** – replaces the hinted text while typing.
6. **Container for suggestions/results** – empty by default; filled with lists.
7. *(web additions)* Divider (divided style), scrim (docked), state layer + focus ring on the bar, live-region status.

## 4. Tokens & specs
Token sets: **`md.comp.search-bar`** = unfocused bar only; **`md.comp.search-view`** = everything while search is focused (all styles/layouts).

### 4.1 Color
**Search bar (unfocused)**

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | enabled | `--md-comp-search-bar-container-color` | `--md-sys-color-surface-container-high` |
| Leading icon | enabled | `--md-comp-search-bar-leading-icon-color` | `--md-sys-color-on-surface` |
| Trailing icon | enabled | `--md-comp-search-bar-trailing-icon-color` | `--md-sys-color-on-surface-variant` |
| Supporting text | enabled / hover / pressed | `--md-comp-search-bar-supporting-text-color`, `…-hover-supporting-text-color`, `…-pressed-supporting-text-color` | `--md-sys-color-on-surface-variant` |
| Input text | enabled | `--md-comp-search-bar-input-text-color` | `--md-sys-color-on-surface` |
| State layer | hover 0.08 | `--md-comp-search-bar-hover-state-layer-color` | `--md-sys-color-on-surface` |
| State layer | pressed 0.1 (ripple) | `--md-comp-search-bar-pressed-state-layer-color` | `--md-sys-color-on-surface` |
| Focus indicator | keyboard focus | `--md-comp-search-bar-focus-indicator-color` | `--md-sys-color-secondary` |

**Focused search (search view)**

| Part | Token | System role |
| --- | --- | --- |
| Bar / docked results / divided surface | `--md-comp-search-view-container-color` | `--md-sys-color-surface-container-high` |
| Contained full-screen background | `--md-comp-search-view-contained-background-color` | `--md-sys-color-surface-container-low` |
| Header supporting text | `--md-comp-search-view-header-supporting-text-color` | `--md-sys-color-on-surface-variant` |
| Header input text | `--md-comp-search-view-header-input-text-color` | `--md-sys-color-on-surface` |
| Header leading icon | `--md-comp-search-view-header-leading-icon-color` | `--md-sys-color-on-surface` |
| Header trailing icon | `--md-comp-search-view-header-trailing-icon-color` | `--md-sys-color-on-surface-variant` |
| Divider (divided) | `--md-comp-search-view-divider-color` | `--md-sys-color-outline` |
| Scrim (docked) | — (derived) | `--md-sys-color-scrim` @ 32% |
| Caret | — (derived) | `--md-sys-color-primary` (text-field convention) |

Color-role diagrams — Full-screen: 1 surface-container-low, 2 on-surface-variant, 3 on-surface-variant, 4 surface-container-high, 5 on-surface-variant, 6 on-surface. Docked: 1 surface-container-high, 2–3 on-surface-variant, 4 surface-container-high, 5 on-surface-variant, 6 on-surface.

Contrast rule: never put a surface-container-high bar on a surface-container background; use surface-container roles more than one step apart. No disabled state in the source.

### 4.2 Size, layout & shape
**Search bar (contained, unfocused)**

| Attribute | Value |
| --- | --- |
| Width | min 360dp, max 720dp, fills its pane between (clamped to pane width below 360 + margins — derived) |
| Height | 56dp |
| Shape | `--md-sys-shape-corner-full` |
| Outer margin (inline) | 24dp (`space300`) unfocused → 12dp (`space150`) focused |
| Inner leading / trailing space, edge has an icon button | 4dp (`space50`) |
| Inner leading / trailing space, edge has no action | 16dp (`space200`) |
| Leading tap target ↔ label, label ↔ trailing tap target | 4dp (`space50`) |
| Trailing actions gap / leading / trailing space | 0dp / 4dp / 4dp |
| Icon | 24dp, inside 48×48 tap target |
| Avatar | 30dp, `corner-full`, inside 48dp target |
| Label | start-aligned, 1 line, ellipsis |
| Resulting label inset with leading button | 4 + 48 + 4 = 56dp from container edge (derived) |

**Focused search — contained**

| Element | Value |
| --- | --- |
| Full-screen container | 100% × 100% window; `corner-none`; background surface-container-low |
| Bar (both layouts) | 56dp, `corner-full`, surface-container-high; inline margin 12dp (`space150`) |
| Full-screen bar top offset | 12dp (derived: equals inline margin) |
| Full-screen "leading/trailing padding 16dp" | = 12dp margin + 4dp inner space to the tap target (interpretation) |
| Docked results | same width as bar (derived); min height 240dp, max 2/3 window height; `corner-medium` (12dp); surface-container-high |
| Docked bar ↔ results gap | 2dp (`space25`) |
| Icon ↔ label gap (from tap target) | 4dp (`space50`) |
| Results list | starts below the bar; scrolls beneath the bar (bar sticky) |

**Focused search — divided (baseline)**

| Element | Value |
| --- | --- |
| Full-screen header height | 72dp; container `corner-none`, full width, no margin |
| Docked header height | 56dp |
| Docked container (header + results) | `corner-extra-large` (28dp), 360–720dp × 240dp–2/3 h |
| Divider | 1dp `outline`, full width under header |
| Leading / trailing space; icon↔label spaces | 16dp each |

**Divided (baseline) unfocused bar**: same 56dp pill; leading/trailing space 16dp; icon↔label 16dp.

### 4.3 Typography
| Part | Typescale |
| --- | --- |
| Hinted text & input text (bar and view header) | `--md-sys-typescale-body-large-*` (Roboto 16/24, 400, tracking 0.5) |
| Suggestions / results / category labels | per lists.md |

### 4.4 Elevation
| Part | Token | Value |
| --- | --- | --- |
| Search bar container | `md.comp.search-bar.container.elevation` | `--md-sys-elevation-level3` |
| Search view container | `md.comp.search-view.container.elevation` | `--md-sys-elevation-level3` |

Source also says M3 has "lower elevation and no shadow by default" → bar: tonal only, no shadow by default (opt-in level3 shadow via elevation primitive). Docked results: level3 shadow on (derived: floating panel over scrim). Full-screen: no shadow.

### 4.5 Component token list
**md.comp.search-bar**
```
container.color → md.sys.color.surface-container-high
container.elevation → md.sys.elevation.level3
container.height → 56dp
container.shape → md.sys.shape.corner.full
leading-icon.color → md.sys.color.on-surface
trailing-icon.color → md.sys.color.on-surface-variant
supporting-text.color → md.sys.color.on-surface-variant
input-text.color → md.sys.color.on-surface
hover.state-layer.color → md.sys.color.on-surface
hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
hover.supporting-text.color → md.sys.color.on-surface-variant
pressed.state-layer.color → md.sys.color.on-surface
pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
pressed.supporting-text.color → md.sys.color.on-surface-variant
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
avatar.size → 30dp
avatar.shape → md.sys.shape.corner.full
icon.size → 24dp
supporting-text.font → md.sys.typescale.body-large.font (Roboto)
supporting-text.line-height → md.sys.typescale.body-large.line-height (24)
supporting-text.size → md.sys.typescale.body-large.size (16)
supporting-text.weight → md.sys.typescale.body-large.weight (400)
supporting-text.tracking → md.sys.typescale.body-large.tracking (0.5)
input-text.font/line-height/size/weight/tracking → md.sys.typescale.body-large.* (same values)
contained.leading-margin → md.sys.measurement.space300 (24dp)
contained.trailing-margin → md.sys.measurement.space300 (24dp)
contained.motion.spring → md.sys.motion.spring.fast.spatial (source shows damping 0.9)
contained.leading-space → md.sys.measurement.space50 (4dp)
contained.trailing-space → md.sys.measurement.space50 (4dp)
contained.no-actions.leading-space → md.sys.measurement.space200 (16dp)
contained.no-actions.trailing-space → md.sys.measurement.space200 (16dp)
contained.icon-label.gap → md.sys.measurement.space50 (4dp)
contained.avatar.target-size → 48dp
contained.trailing-actions.gap → md.sys.measurement.space0 (0dp)
contained.trailing-actions.leading-space → md.sys.measurement.space50 (4dp)
contained.trailing-actions.trailing-space → md.sys.measurement.space50 (4dp)
leading-space → md.sys.measurement.space200 (16dp)                         [baseline]
trailing-space → md.sys.measurement.space200 (16dp)                        [baseline]
leading-icon.leading-icon-label-space → md.sys.measurement.space200 (16dp) [baseline]
trailing-icon.label-trailing-icon-space → md.sys.measurement.space200 (16dp) [baseline]
```
**md.comp.search-view**
```
container.color → md.sys.color.surface-container-high
container.elevation → md.sys.elevation.level3
contained.background.color → md.sys.color.surface-container-low
header.supporting-text.color → md.sys.color.on-surface-variant
header.input-text.color → md.sys.color.on-surface
header.leading-icon.color → md.sys.color.on-surface
header.trailing-icon.color → md.sys.color.on-surface-variant
divider.color → md.sys.color.outline
full-screen.container.shape → md.sys.shape.corner.none
header.supporting-text.font/line-height/size/weight/tracking → md.sys.typescale.body-large.*
header.input-text.font/line-height/size/weight/tracking → md.sys.typescale.body-large.*
contained.leading-margin → md.sys.measurement.space150 (12dp)
contained.trailing-margin → md.sys.measurement.space150 (12dp)
contained.docked.bar-results.gap → md.sys.measurement.space25 (2dp)
contained.docked.results.shape → md.sys.shape.corner.medium (12dp)
contained.docked.bar.shape → md.sys.shape.corner.full
contained.full-screen.bar.container.height → 56dp
contained.icon-label.gap → md.sys.measurement.space50 (4dp)
docked.container.shape → md.sys.shape.corner.extra-large (28dp)            [divided]
full-screen.header.container.height → 72dp                               [divided]
docked.header.container.height → 56dp                                    [divided]
leading-space → md.sys.measurement.space200 (16dp)                       [divided]
trailing-space → md.sys.measurement.space200 (16dp)                      [divided]
leading-icon.leading-icon-label-space → md.sys.measurement.space200 (16dp) [divided]
trailing-icon.label-trailing-icon-space → md.sys.measurement.space200 (16dp) [divided]
```

## 5. States & interaction
| State | Container | State layer | Text / icons | Focus ring |
| --- | --- | --- | --- | --- |
| Enabled (unfocused) | surface-container-high | – | hint on-surface-variant; leading on-surface; trailing on-surface-variant | – |
| Hover (bar area outside nested buttons) | same | on-surface 0.08 | unchanged | – |
| Keyboard focus on input (not yet opened) | same | on-surface 0.1 (derived: focus opacity) | unchanged | 3dp secondary, outer offset 2dp, pill shape |
| Pressed | same | on-surface 0.1 ripple | unchanged | – |
| Open (focused search) | contained: bar unchanged, margins 12dp; divided: header | – (children keep own states) | input on-surface, caret primary | none on bar; nested buttons/list items use their own |

- Nested icon buttons and avatar have their own state layers (icon-buttons.md); hovering them suppresses the bar's hover layer (`:has()`).
- Leading icon in focused search = **back**: releases focus, dismisses suggestions/results, restores the bar (value kept — derived).
- **Clear** (×) empties input, keeps search open, refocuses input.
- Hinted text is replaced by input text on typing. After a query executes, input text stays visible but **not focused** (blur input; results remain).
- Results list items: enabled / hover / focus / pressed per lists.md; the highlighted option (`aria-activedescendant`) shows the list focus state layer.

## 6. Motion & behavior
| Transition | Properties | Motion |
| --- | --- | --- |
| Contained bar widen / narrow (24 → 12dp margins) | `margin-inline` | `contained.motion.spring` = `--md-sys-motion-spring-fast-spatial-*` |
| Full-screen open (contained) | background surface-container-low opacity; bar translateY from its in-page position to top 12dp (FLIP) | background: fast effects; bar: fast spatial (derived) |
| Docked results open | `clip-path: inset(0 0 100% 0 round 12px)` → `inset(0 round 12px)` + opacity | default spatial for clip (partial-screen surface), fast effects for opacity (derived; enter-within-bounds pattern, expand downward) |
| Scrim | opacity 0 → 1 | default effects (derived) |
| Close | reverse, effects durations (shorter exit) | |
| Divided full-screen | container transform (bar → full-screen header) per transitions pattern; web approximation = fade + clip expand | default spatial (derived) |
| Layout swap on resize | instant (no animation) | derived |

- **Reduced motion:** no margin spring/FLIP/clip; fade only (fast effects) or instant.
- **Focused search content:** historical suggestions before typing; suggestions/results while typing; or wait for executed query.
- **Execute:** Enter in the input, or select a suggestion/result directly.
- **Scroll (unfocused bar):** either scroll away and reappear on scroll-up (see app-bars.md hide-on-scroll), or stay pinned.
- **Adaptive:** bar stays in its pane and scales 360–720dp; internal elements anchor start/end. Focused layout: full-screen <600px, docked ≥600px (window size classes); swap live on resize.
- **Predictive back (Android):** detach & scale toward gesture. Web: optional; full-screen open pushes a history entry so browser Back closes it (derived).
- Focused search can be a standalone destination (e.g. nav bar item) → render open, full-screen/docked, without a back button collapsing it.
- **RTL:** leading/trailing mirror via logical properties; back arrow icon mirrors.

## 7. Usage guidelines
- Place the bar at the top of the screen/content, close to the content it searches.
- surface-container-high bar on white/tonal surface backgrounds only.
- Leading: a navigational icon button **or** a non-functional search icon.
- Trailing: 1–2 icons/icon buttons (voice, location/profile, overflow, decorative search); avatar + at most one other icon button.
- Hinted text: short description of what is searchable ("Search replies").
- Results: list component with variety/context (leading icons, category labels like "Recent", avatars, filter chips); **gaps** separate groups.
- Focused search shows a clear status that content is searched (search icon or "Results"/"Quick results" label).
- Prefer contained; divided is legacy.

## 8. Accessibility
- **Roles (web mapping):** root `<search>` (or `role="search"`). Input `<input type="search" role="combobox" aria-expanded aria-controls aria-autocomplete="list" aria-activedescendant>`; accessible name = hinted text via `aria-label` (placeholder alone is not a label). Results container `role="listbox"` with `role="option"` items; if items are links/compound actions use a plain list (`<ul>`) and Tab/arrow roving instead.
- Native role equivalents: Android "Text field", iOS "Search field".
- Announce suggestion/result changes via a polite live region (`role="status"`, e.g. "5 suggestions").
- Leading/trailing icon buttons and avatar need their own labels (back: "Back" / "Close search"; clear: "Clear search").
- Full-screen open: modal — background `inert`, focus stays inside, Escape/back closes, focus returns to the bar input. Docked: non-modal popup; clicking the scrim or focus leaving the root closes.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move between interactive elements (leading button, input, trailing buttons, results) |
| Space / Enter (unopened bar) | Open focused search with the input ready (Space does not insert a character) |
| Printable key / ArrowDown (unopened) | Open and pass the key through (derived) |
| Enter (open) | Execute search, or activate highlighted option |
| Arrow Up / Down | Move highlight through options (`aria-activedescendant`) |
| Escape (web mapping) | First clears highlight/suggestions; second closes focused search, focus to input |

- **Initial focus:** first interactive element — the leading icon button if present, else the text field.
- Targets ≥48×48 (icon buttons and avatar in 48dp targets).

## 9. Implementation checklist
- [ ] API: `value`, `placeholder` (hint + accessible name), `variant` (`contained` | `divided`), `layout` (`auto` | `docked` | `full-screen`), `open`, `scroll-behavior` (`pinned` | `hide-on-scroll`).
- [ ] Slots: `leading`, `trailing` (≤2), `content` (lists, chips, gaps, labels); back + clear built in.
- [ ] Events: `input`, `search` (Enter), `open`, `close`, `clear`, `select`.
- [ ] Bar 56dp pill, 360–720dp, margins 24→12dp with fast spatial spring; inner spacing 4/16dp per edge.
- [ ] Docked: 2dp gap, 12dp results radius, 240dp–66.67vh, scrim 32%, level3 shadow; divided docked 28dp radius container.
- [ ] Full-screen: fixed inset 0, surface-container-low, bar sticky at top 12dp, results scroll beneath, background inert.
- [ ] Auto layout by window width (600px).
- [ ] Combobox ARIA, live region, focus return, Escape, history entry.
- [ ] Edge cases: empty-results state, long query (ellipsis in unfocused bar), RTL, reduced motion, forced colors, contrast against background.

## 10. HTML/CSS implementation blueprint
**(a) DOM**
```html
<search class="md-search" data-variant="contained" data-layout="docked">     <!-- data-open when focused -->
  <div class="md-search__scrim" aria-hidden="true"></div>
  <div class="md-search__surface">                       <!-- becomes fixed full-screen surface -->
    <div class="md-search__bar">
      <span class="md-search__state" aria-hidden="true"></span>
      <span class="md-search__leading">
        <button class="md-icon-button" aria-label="Open menu">…</button>     <!-- or decorative <svg aria-hidden> -->
        <button class="md-icon-button md-search__back" aria-label="Back" hidden>…</button>
      </span>
      <input class="md-search__input" type="search" role="combobox" aria-label="Search messages"
             placeholder="Search messages" aria-expanded="false" aria-controls="sr-1" aria-autocomplete="list" autocomplete="off">
      <span class="md-search__trailing">
        <button class="md-icon-button md-search__clear" aria-label="Clear search" hidden>…</button>
        <button class="md-icon-button" aria-label="Voice search">…</button>
        <button class="md-search__avatar" aria-label="Account"><img alt=""></button>
      </span>
    </div>
    <hr class="md-search__divider">                       <!-- divided only -->
    <div class="md-search__results" id="sr-1" role="listbox" aria-label="Suggestions">…list…</div>
    <div class="md-search__status" role="status"></div>   <!-- visually hidden -->
  </div>
</search>
```
**(b) Custom properties**
```css
.md-search {
  --md-comp-search-bar-container-color: var(--md-sys-color-surface-container-high);
  --md-comp-search-bar-container-height: 56px;
  --md-comp-search-bar-container-shape: var(--md-sys-shape-corner-full);
  --md-comp-search-bar-leading-icon-color: var(--md-sys-color-on-surface);
  --md-comp-search-bar-trailing-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-search-bar-supporting-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-search-bar-input-text-color: var(--md-sys-color-on-surface);
  --md-comp-search-bar-state-layer-color: var(--md-sys-color-on-surface);
  --md-comp-search-bar-focus-indicator-color: var(--md-sys-color-secondary);
  --md-comp-search-bar-avatar-size: 30px;
  --md-comp-search-bar-icon-size: 24px;
  --md-comp-search-bar-margin: var(--md-sys-measurement-space300);           /* 24px */
  --md-comp-search-bar-leading-space: var(--md-sys-measurement-space50);     /* 16px (space200) when no leading action */
  --md-comp-search-bar-trailing-space: var(--md-sys-measurement-space50);
  --md-comp-search-bar-icon-label-gap: var(--md-sys-measurement-space50);
  --md-comp-search-view-container-color: var(--md-sys-color-surface-container-high);
  --md-comp-search-view-contained-background-color: var(--md-sys-color-surface-container-low);
  --md-comp-search-view-margin: var(--md-sys-measurement-space150);          /* 12px */
  --md-comp-search-view-bar-results-gap: var(--md-sys-measurement-space25);  /* 2px */
  --md-comp-search-view-docked-results-shape: var(--md-sys-shape-corner-medium);
  --md-comp-search-view-divider-color: var(--md-sys-color-outline);
  --md-comp-search-view-container-elevation: var(--md-sys-elevation-level3);
}
.md-search[data-variant="divided"] {
  --md-comp-search-bar-leading-space: var(--md-sys-measurement-space200);
  --md-comp-search-bar-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-search-bar-icon-label-gap: var(--md-sys-measurement-space200);
  --md-comp-search-view-docked-shape: var(--md-sys-shape-corner-extra-large);
}
```
**Layout**
```css
.md-search { position: relative; display: block; }
.md-search__bar { position: relative; isolation: isolate; display: flex; align-items: center;
  gap: var(--md-comp-search-bar-icon-label-gap);
  block-size: var(--md-comp-search-bar-container-height);
  inline-size: auto; min-inline-size: min(360px, 100% - 2 * var(--md-comp-search-bar-margin)); max-inline-size: 720px;
  margin-inline: var(--md-comp-search-bar-margin);
  padding-inline: var(--md-comp-search-bar-leading-space) var(--md-comp-search-bar-trailing-space);
  border-radius: var(--md-comp-search-bar-container-shape); background: var(--md-comp-search-bar-container-color); }
.md-search__bar:not(:has(.md-search__leading button:not([hidden]))) { padding-inline-start: var(--md-sys-measurement-space200); }
.md-search__bar:not(:has(.md-search__trailing > :not([hidden]))) { padding-inline-end: var(--md-sys-measurement-space200); }
.md-search__leading, .md-search__trailing { display: flex; color: var(--md-comp-search-bar-leading-icon-color); }
.md-search__trailing { color: var(--md-comp-search-bar-trailing-icon-color); gap: 0; }
.md-search__leading > *, .md-search__trailing > * { inline-size: 48px; block-size: 48px; }   /* tap targets */
.md-search__leading > svg { inline-size: 24px; block-size: 24px; padding: 12px; box-sizing: content-box; } /* decorative icon */
.md-search__avatar img { inline-size: var(--md-comp-search-bar-avatar-size); block-size: var(--md-comp-search-bar-avatar-size); border-radius: var(--md-sys-shape-corner-full); }
.md-search__input { flex: 1; min-inline-size: 0; border: 0; background: none; outline: none; padding: 0;
  color: var(--md-comp-search-bar-input-text-color); caret-color: var(--md-sys-color-primary); text-overflow: ellipsis;
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.md-search__input::placeholder { color: var(--md-comp-search-bar-supporting-text-color); opacity: 1; }
.md-search__input::-webkit-search-cancel-button { display: none; }   /* use own clear button */
.md-search__results, .md-search__scrim, .md-search__divider { display: none; }
/* open: contained bar widens */
.md-search[data-open] { --md-comp-search-bar-margin: var(--md-comp-search-view-margin); z-index: var(--md-search-z, 100); }
/* docked */
.md-search[data-open][data-layout="docked"] .md-search__scrim { display: block; position: fixed; inset: 0; z-index: -1;
  background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent); }
.md-search[data-open][data-layout="docked"] .md-search__results { display: block; position: absolute;
  inset-inline: var(--md-comp-search-bar-margin); max-inline-size: 720px;
  inset-block-start: calc(var(--md-comp-search-bar-container-height) + var(--md-comp-search-view-bar-results-gap));
  min-block-size: 240px; max-block-size: calc(66.667dvh - var(--md-comp-search-bar-container-height)); overflow-y: auto;
  border-radius: var(--md-comp-search-view-docked-results-shape); background: var(--md-comp-search-view-container-color);
  box-shadow: var(--md-comp-search-view-container-elevation); /* elevation primitive */ }
/* full-screen */
.md-search[data-open][data-layout="full-screen"] .md-search__surface { position: fixed; inset: 0; overflow-y: auto;
  background: var(--md-comp-search-view-contained-background-color); border-radius: var(--md-sys-shape-corner-none); }
.md-search[data-open][data-layout="full-screen"] .md-search__bar { position: sticky; inset-block-start: var(--md-comp-search-view-margin);
  margin-block-start: var(--md-comp-search-view-margin); max-inline-size: none; z-index: 1; }
.md-search[data-open][data-layout="full-screen"] .md-search__results { display: block; padding-block-start: var(--md-comp-search-view-margin); }
/* divided open: bar becomes header, divider shown */
.md-search[data-variant="divided"][data-open] .md-search__bar { margin: 0; border-radius: 0; }
.md-search[data-variant="divided"][data-open][data-layout="full-screen"] .md-search__bar { block-size: 72px; inset-block-start: 0; }
.md-search[data-variant="divided"][data-open][data-layout="full-screen"] .md-search__surface { background: var(--md-comp-search-view-container-color); }
.md-search[data-variant="divided"][data-open] .md-search__divider { display: block; margin: 0; border: 0; border-block-start: 1px solid var(--md-comp-search-view-divider-color); }
.md-search[data-variant="divided"][data-open][data-layout="docked"] .md-search__surface { position: absolute; inset-inline: var(--md-comp-search-bar-margin);
  max-inline-size: 720px; border-radius: var(--md-comp-search-view-docked-shape); overflow: hidden; background: var(--md-comp-search-view-container-color); }
.md-search[data-variant="divided"][data-open][data-layout="docked"] .md-search__results { position: static; border-radius: 0; box-shadow: none; }
```
(Full-screen: keep a placeholder of the bar's in-flow height so page layout doesn't jump — the root keeps `min-block-size: 56px` while `.md-search__surface` is fixed.)

**(c) States**
```css
.md-search__state { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; overflow: hidden;
  background: var(--md-comp-search-bar-state-layer-color); opacity: 0; }
@media (hover: hover) {
  .md-search:not([data-open]) .md-search__bar:hover:not(:has(button:hover)) .md-search__state { opacity: var(--md-sys-state-hover-state-layer-opacity); }
}
.md-search:not([data-open]) .md-search__bar:has(.md-search__input:focus-visible) {
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-search-bar-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
.md-search:not([data-open]) .md-search__bar:has(.md-search__input:focus-visible) .md-search__state { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-search:not([data-open]) .md-search__bar:active:not(:has(button:active)) .md-search__state { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-search[data-open] .md-search__leading > :not(.md-search__back) { display: none; }
.md-search[data-open] .md-search__back { display: inline-flex; }
```
State layer = state layer primitive; pressed = ripple primitive; nested buttons use icon-buttons.md.

**(d) Motion**
```css
.md-search__bar { transition: margin-inline var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
.md-search__state { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-search[data-open] .md-search__scrim { animation: md-search-fade var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing); }
.md-search[data-open][data-layout="docked"] .md-search__results {
  animation: md-search-reveal var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
             md-search-fade var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-search[data-open][data-layout="full-screen"] .md-search__surface { animation: md-search-fade var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@keyframes md-search-fade { from { opacity: 0; } }
@keyframes md-search-reveal { from { clip-path: inset(0 0 100% 0 round 12px); } to { clip-path: inset(0 round 12px); } }
@media (prefers-reduced-motion: reduce) {
  .md-search__bar { transition: none; }
  .md-search[data-open][data-layout="docked"] .md-search__results { animation: md-search-fade var(--md-sys-motion-spring-fast-effects-duration) linear; }
}
```
Closing: JS sets `data-closing`, plays reverse animations (effects durations), then removes `data-open` on `animationend`. Full-screen bar FLIP: before opening record bar rect; after open translate from old to new top with fast spatial spring.

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-search__bar { border: 1px solid CanvasText; }
  .md-search[data-open] .md-search__results { border: 1px solid CanvasText; }
  .md-search__bar:has(.md-search__input:focus-visible) { outline-color: Highlight; }
  .md-search__state { display: none; }
  .md-search__scrim { forced-color-adjust: none; }
  .md-search__input::placeholder { color: GrayText; }
}
```

**(f) Behaviour / JS**
- Open on: pointer click in the bar (outside nested buttons), Enter/Space/ArrowDown/printable key while input focused (Space/Enter `preventDefault`). Not on plain Tab focus (so the unfocused focus ring is reachable).
- On open: set `data-open`, `aria-expanded="true"`, resolve layout (`auto` → `matchMedia('(min-width: 600px)')`), full-screen: `inert` on page siblings, `history.pushState`; focus input.
- Input: toggle clear button on value; debounce suggestion fetch; update `role=status` text ("N suggestions").
- Arrow Up/Down: move `aria-activedescendant` among `[role=option]`, scroll into view; Enter: activate option or dispatch `search` then blur input (results stay).
- Back button / Escape (second press) / scrim click / `popstate`: close, remove `inert`, restore 24dp margins, return focus to input (keep value).
- Resize: re-evaluate layout while open; swap without animation.
- Hide-on-scroll: delegate to the shared app-bar scroll behaviour.

## 11. Source gaps & decisions
- `contained.motion.spring` shows damping 0.9 (= standard-scheme fast spatial); expressive fast spatial is 0.6 → reference the scheme-resolved `--md-sys-motion-spring-fast-spatial-*`; products wanting the source's no-bounce widening set `data-motion-scheme="standard"` on the search.
- Elevation tokens = level3 but overview says "no shadow by default" → bar tonal without shadow; docked results get level3 shadow (floating over scrim).
- Focused contained measurement "leading/trailing padding 16dp" conflicts with the 12dp margin token → read as 12dp margin + 4dp inner space to the tap target.
- No scrim token/opacity → `scrim` @ 32% (guidelines convention).
- Docked results width not specified → equals bar width; min 240dp applies only when open.
- Full-screen bar top offset not specified → 12dp. Results "scroll beneath the bar" → sticky bar.
- Open/close transitions not specified (only the widening spring) → clip reveal + fades per enter/exit pattern; divided style approximates container transform.
- Source keyboard table "Space/Enter activates the text field" → bar opens on Space/Enter (Space not typed), not on Tab focus, so the specified unfocused focus ring is visible.
- Clear button visibility, value retention on back, history-based back → derived web behaviours.
- No disabled state → none provided.
- Compact/medium threshold for layout swap → 600px (window size classes in guidelines).
