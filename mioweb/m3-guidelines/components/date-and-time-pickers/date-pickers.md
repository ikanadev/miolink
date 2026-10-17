# Date pickers

> Source: https://m3.material.io/components/date-pickers · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview
Date pickers let people select a date or a range of dates. They can show past, present, or future dates, clearly mark important dates (today, selected), and follow the familiar calendar pattern.

**Use when**
- A person needs to pick one date, or a start and end date (for example booking a flight or reserving a hotel).
- Near-term dates: modal date picker or docked date picker.
- Distant past/future dates (such as a date of birth): modal date input or docked date picker. **Don't** use the modal date picker for these.

**Embedding**
- Compact window (mobile): in a dialog (modal date picker / modal date input; full-screen modal recommended).
- Medium and expanded windows (tablet/desktop): as a text-field drop-down (docked date picker).

**Changes vs. M2 (and baseline M3 notes)**
- Larger titles and labels, more spacing to fit 48dp targets.
- New color mappings compatible with dynamic color; no drop shadow in the visual style (containers are tonal, `surface-container-high`; tokens still list elevation level3 for docked/modal containers — see §11).
- Variants renamed to be device-independent: desktop picker → **docked date picker**; mobile picker → **modal date picker**; date input → **modal date input**.
- No Expressive-specific changes (shape morphing, spring tokens) are documented for this component in the source.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
|---|---|---|
| Docked date picker | Outlined text field; a calendar drops down below the field when the calendar icon is activated. Text entry and calendar both usable. | Calendar container 360×456dp, `corner.large` (16dp). Best for medium/expanded windows. Near and distant dates. |
| Docked: day selection | Month grid with month & year menu buttons, prev/next icon buttons, text buttons. | Height adjusts dynamically to the number of week rows (4–6) in the month. |
| Docked: month selection | Month menu (list) replaces the calendar. | List items 48dp; selected item `surface-variant` container + leading check icon (24dp). |
| Docked: year selection | Year menu (list) replaces the calendar. | While one menu is open, the other menu button is disabled. |
| Modal date picker – single date | Dialog: header (supporting text + headline with the selected date), month grid, actions. | Container 360×524dp, `corner.extra-large` (28dp); header 360×120dp. |
| Modal date picker – year selection | Grid of years replaces the calendar. | Year item 72×36dp, `corner.full`. |
| Modal date picker – date range (full-screen) | Header with close (×) icon button + **Save** text button, vertically scrolling months with month subheads. | Container `corner.none`, elevation level0; header 128dp; headline `title-large`. Covers the window. |
| Modal date input – single | Dialog with one outlined text field. | Container 328×512dp, `corner.extra-large`; header 328×120dp. |
| Modal date input – range | Dialog with start and end date text fields. | Same container tokens. |

Switching: modal date picker ↔ modal date input via the edit (pencil) / calendar icon button in the header.

## 3. Anatomy

**Docked date picker (calendar open)**
1. Outlined text field — direct text entry; contains the calendar trailing icon button (the exclusive entry point to the picker).
2. Menu button: month selection. 3. Menu button: year selection.
4. Icon buttons — previous/next month and previous/next year (one pair around each menu button).
5. Weekdays label text (not interactive). 6. Unselected date. 7. Today's date (1dp `primary` outline). 8. Outside-month date (0.38). 9. Text buttons (Clear, Cancel, OK). 10. Selected date (`primary` circle). 11. Container.

**Docked month/year menu open**: text field, menu button (pressed/open), other menu button (disabled), header (64dp), menu, selected list item (leading check icon), unselected list items, container.

**Modal date picker (day view)**: 1 headline (e.g. "Mon, Aug 17"), 2 supporting text ("Select date"), 3 header, 4 container, 5 icon button (edit → input mode), 6 icon buttons (prev/next month), 7 weekdays, 8 today, 9 unselected date, 10 text buttons (Cancel/OK), 11 selected date, 12 menu button (month + year; opens year selection), 13 divider (header/body).

**Modal date picker (year view)**: headline, supporting text, header, container, icon button, unselected year, selected year, text buttons, divider, menu button.

**Modal range picker (full-screen)**: headline (start – end), supporting text, close icon button, header, text button (Save), icon button (edit), weekdays label text, container, today, unselected date, in-range active indicator (continuous band), in-range date, month subhead, selected date (start/end), divider.

**Modal date input**: headline, supporting text, header, container, icon button (calendar → picker), outlined text field(s), text buttons, divider.

**Per date cell**: column cell (hit target) › day circle (container 40dp; selected fill or today outline) › state layer (40dp circle) › label text; optional range band behind the circle.

## 4. Tokens & specs

### 4.1 Color

**Docked**

| Part | State | Token | System role |
|---|---|---|---|
| Container | — | `docked.container.color` | `--md-sys-color-surface-container-high` |
| Weekday label | — | `docked.weekdays.label-text.color` | `--md-sys-color-on-surface` |
| Date label | unselected | `docked.date.unselected.label-text.color` | `--md-sys-color-on-surface` |
| Date label | outside month | `docked.date.unselected.outside-month.label-text.color` + `.opacity` 0.38 | `--md-sys-color-on-surface` |
| Date label | today | `docked.date.today.label-text.color` | `--md-sys-color-primary` |
| Date outline | today | `docked.date.today.container.outline.color` (1dp) | `--md-sys-color-primary` |
| Date container | selected | `docked.date.selected.container.color` | `--md-sys-color-primary` |
| Date label | selected | `docked.date.selected.label-text.color` | `--md-sys-color-on-primary` |
| Date state layer | unselected hover/focus/press | `docked.date.unselected.*.state-layer.color` | `--md-sys-color-on-surface-variant` |
| Date state layer | selected hover/focus/press | `docked.date.selected.*.state-layer.color` | `--md-sys-color-on-primary` |
| Date state layer | today hover/focus/press | `docked.date.today.*.state-layer.color` | `--md-sys-color-primary` |
| Menu button label / icon | enabled, hover, focus, pressed | `docked.menu-button.(state.)label-text.color` / `.icon.color` | `--md-sys-color-on-surface-variant` |
| Menu button state layer | hover/focus/pressed | `docked.menu-button.*.state-layer.color` | `--md-sys-color-on-surface-variant` |
| Menu button label / icon | disabled | `docked.menu-button.disabled.*.color` + opacity 0.38 | `--md-sys-color-on-surface` |
| Menu list item label | all | `docked.menu.list-item.(state.)label-text.color` | `--md-sys-color-on-surface` |
| Menu list item state layer | hover/focus/pressed | `docked.menu.list-item.*.state-layer.color` | `--md-sys-color-on-surface` |
| Menu list item container | selected | `docked.menu.list-item.selected.container.color` | `--md-sys-color-surface-variant` |
| Menu list item leading icon | selected | `docked.menu.list-item.selected.leading-icon.color` | `--md-sys-color-on-surface` |
| Menu list item leading icon | selected hover/focus/pressed | `docked.menu.list-item.selected.*.leading-icon.color` | `--md-sys-color-on-surface-variant` |
| Prev/next icon buttons | — | (standard icon button, diagram role) | `--md-sys-color-on-surface-variant` |
| Text field / text buttons | — | (outlined text field, text button) | `--md-sys-color-primary` (diagram) |
| Menu divider | — | not tokenized (diagram) | `--md-sys-color-outline-variant` |

**Modal (calendar)**

| Part | State | Token | System role |
|---|---|---|---|
| Container | — | `modal.container.color` | `--md-sys-color-surface-container-high` |
| Header supporting text | — | `modal.header.supporting-text.color` | `--md-sys-color-on-surface-variant` |
| Header headline | — | `modal.header.headline.color` | `--md-sys-color-on-surface-variant` |
| Weekday label | — | `modal.weekdays.label-text.color` | `--md-sys-color-on-surface` |
| Date label | unselected / today / selected | `modal.date.{unselected,today,selected}.label-text.color` | on-surface / primary / on-primary |
| Date container | selected | `modal.date.selected.container.color` | `--md-sys-color-primary` |
| Date outline | today (1dp) | `modal.date.today.container.outline.color` | `--md-sys-color-primary` |
| Date state layer | unselected / selected / today | `modal.date.{unselected,selected,today}.{hover,focus,pressed}.state-layer.color` | on-surface-variant / on-primary / primary |
| Range active indicator | in range | `modal.range-selection.active-indicator.container.color` | `--md-sys-color-secondary-container` |
| In-range date label | — | `modal.range-selection.date.in-range.label-text.color` | `--md-sys-color-on-secondary-container` |
| In-range state layer | hover/focus/pressed | `modal.range-selection.date.in-range.*.state-layer.color` | `--md-sys-color-on-primary-container` (see §11) |
| Month subhead (range) | — | `modal.range-selection.month.subhead.color` | `--md-sys-color-on-surface-variant` |
| Year label | unselected / selected | `modal.year-selection.year.{unselected,selected}.label-text.color` | on-surface-variant / on-primary |
| Year container | selected | `modal.year-selection.year.selected.container.color` | `--md-sys-color-primary` |
| Year state layer | unselected / selected | `modal.year-selection.year.{unselected,selected}.*.state-layer.color` | on-surface-variant / on-primary |
| Menu button, icon buttons | — | (diagram) | `--md-sys-color-on-surface-variant` |
| Divider | — | (diagram) | `--md-sys-color-outline-variant` |

**Modal date input**: container `surface-container-high`; supporting text & headline `on-surface-variant`; text field focus/label `primary`; divider `outline-variant`.

**State layer opacities** (all sets): hover 0.08 (`--md-sys-state-hover-state-layer-opacity`), focus 0.10 (`--md-sys-state-focus-state-layer-opacity`), pressed 0.10 (`--md-sys-state-pressed-state-layer-opacity`).
**Disabled**: menu button content `on-surface` @ 0.38 (tokenized). Disabled dates/years appear in the states diagram but are not tokenized → (derived) label `on-surface` @ 0.38, no state layer, selected-and-disabled container `on-surface` @ 0.12 (disabled recipe).

### 4.2 Size, layout & shape

| Element | Docked | Modal | Modal input |
|---|---|---|---|
| Container W×H | 360×456dp (height adapts to rows) | 360×524dp | 328×512dp |
| Container shape | `corner.large` 16dp | `corner.extra-large` 28dp (range: `corner.none`) | `corner.extra-large` 28dp |
| Header | 64dp (menu-button row) | 360×120dp (range: 128dp) | 328×120dp |
| Date cell (column × row) | 48×48dp (`date.container`) | 48dp column (derived: 336 / 7) × 40dp row; circle 40×40dp (`date.container`) | — |
| Date state layer | 40×40dp circle | 40×40dp circle | — |
| Date container shape | `corner.full` | `corner.full` | — |
| Today outline width | 1dp | 1dp | — |
| Menu button | 40dp high, `corner.full`, icon 18dp | — | — |
| Menu list item | 48dp high, leading icon 24dp | — | — |
| Year item | — | 72×36dp, state layer 72×36dp, `corner.full` | — |
| Range active indicator | — | 40dp high, `corner.full` | — |

**Grid geometry (derived: from the container widths and cell tokens; measurement diagrams are images)**
- Grid = 7 columns × 48px = 336px, centered → 12px inline padding in a 360px container.
- Docked vertical stack: header 64 + weekday row 48 + 6 week rows × 48 + action row 56 = **456** (matches token) → 5 rows = 408, 4 rows = 360. The container height is content-driven; 456 is the 6-row maximum.
- Modal vertical stack: header 120 (+1px divider inside) + nav row 56 + weekday row 40 + 6 rows × 40 + 8 gap + action row 60 = **524**. The grid area is fixed (always 6 rows) so the dialog doesn't jump between months.
- Modal header: padding-inline 24px start / 12px end, padding-top 16px, padding-bottom 12px; supporting text on top, headline baseline-aligned bottom with the mode icon button at the trailing end.
- Nav row (modal): menu button (month + year, label-large, 18px drop-down arrow) at start with 16px start padding; prev/next 48px icon buttons at end with 12px end padding.
- Docked header (64dp): two groups `‹ [Month ▾] ›` and `‹ [Year ▾] ›`, `justify-content: space-between`, 12px inline padding; icon buttons 48px target / 40px visual, 24px icon.
- Action row: text buttons at the end, 8px gap; Clear (optional) at the start; padding 8px 12px 12px.
- Year grid (modal): 3 columns, `justify-content: space-evenly`, row gap 16px (derived), 12px inline padding, scrolls vertically within the same area as the day grid; the selected year is scrolled into view (centered) on open.
- Docked menus: list items 48dp, padding-inline 16px, leading check slot 24px + 16px gap (selected only; unselected items keep the label aligned via a 40px start inset — derived), scrollable within the calendar area; divider below the header.
- Range picker: header 128dp (top row 56: close icon button start, Save text button end; below: supporting text + headline, padding-inline 64px start to align with title — derived from top app bar). Sticky weekday row 40dp under the header; each month: subhead row 48dp (padding-inline 24px) followed by its week rows (48dp tall rows derived for touch on full-screen).
- Touch targets for all interactive elements: **48×48dp minimum** (`touch target primitive` on modal date circles: the 48px column already provides it horizontally; extend the hit area vertically with the cell pseudo-element). Don't increase density.
- Sizes do **not** scale responsively with the window size.

### 4.3 Typography

| Text | Typescale |
|---|---|
| Weekday labels | body-large (`--md-sys-typescale-body-large-*`) |
| Date labels | body-large |
| Year labels | body-large |
| Docked menu button label | label-large |
| Docked menu list item | body-large |
| Modal header supporting text | label-large |
| Modal header headline (single) | headline-large |
| Range header headline | title-large |
| Range month subhead | title-small |
| Modal input supporting text | label-large |
| Modal input headline | headline-large |
| Modal nav menu button (month + year) | label-large (derived: same as docked menu button; not tokenized for modal) |

Date numerals: use `font-variant-numeric: tabular-nums` so columns align (derived).

### 4.4 Elevation
- Docked container: level3 (`--md-sys-elevation-level3`, 6dp).
- Modal container: level3. Range (full-screen) container: level0.
- Modal input container: level3.
- Visual guidance: "no shadow" — tonal surface (`surface-container-high`). Implement via `elevation primitive` so themes decide (see §11).

### 4.5 Component token list

**`md.comp.date-picker.docked`**
```
container.color → sys.color.surface-container-high
container.elevation → sys.elevation.level3
container.shape → sys.shape.corner.large (16dp)
container.width → 360dp
container.height → 456dp
header.height → 64dp
weekdays.label-text.color → sys.color.on-surface
weekdays.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.body-large.*
date.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.body-large.*
date.container.shape → sys.shape.corner.full
date.container.width → 48dp
date.container.height → 48dp
date.state-layer.shape → sys.shape.corner.full
date.state-layer.width → 40dp
date.state-layer.height → 40dp
date.unselected.label-text.color → sys.color.on-surface
date.unselected.outside-month.label-text.color → sys.color.on-surface
date.unselected.outside-month.label-text.opacity → 0.38
date.today.label-text.color → sys.color.primary
date.today.container.outline.color → sys.color.primary
date.today.container.outline.width → 1dp
date.selected.container.color → sys.color.primary
date.selected.label-text.color → sys.color.on-primary
date.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
date.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-primary
date.today.{hover,focus,pressed}.state-layer.color → sys.color.primary
date.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
date.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.1)
date.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.1)
menu-button.container.shape → sys.shape.corner.full
menu-button.container.height → 40dp
menu-button.icon.color → sys.color.on-surface-variant
menu-button.icon.size → 18dp
menu-button.label-text.color → sys.color.on-surface-variant
menu-button.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.label-large.*
menu-button.{hover,focus,pressed}.icon.color → sys.color.on-surface-variant
menu-button.{hover,focus,pressed}.label-text.color → sys.color.on-surface-variant
menu-button.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
menu-button.{hover,focus,pressed}.state-layer.opacity → sys.state.{hover,focus,pressed}.state-layer-opacity (0.08/0.1/0.1)
menu-button.disabled.icon.color → sys.color.on-surface · .opacity → 0.38
menu-button.disabled.label-text.color → sys.color.on-surface · .opacity → 0.38
menu.list-item.container.height → 48dp
menu.list-item.label-text.color → sys.color.on-surface
menu.list-item.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.body-large.*
menu.list-item.{hover,focus,pressed}.label-text.color → sys.color.on-surface
menu.list-item.{hover,focus,pressed}.state-layer.color → sys.color.on-surface
menu.list-item.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
menu.list-item.selected.container.color → sys.color.surface-variant
menu.list-item.selected.leading-icon.color → sys.color.on-surface
menu.list-item.selected.leading-icon.size → 24dp
menu.list-item.selected.{hover,focus,pressed}.leading-icon.color → sys.color.on-surface-variant
```

**`md.comp.date-picker.modal`**
```
container.color → sys.color.surface-container-high
container.elevation → sys.elevation.level3
container.shape → sys.shape.corner.extra-large (28dp)
container.width → 360dp
container.height → 524dp
header.container.width → 360dp
header.container.height → 120dp
header.headline.color → sys.color.on-surface-variant
header.headline.{font,line-height,size,weight,tracking,type} → sys.typescale.headline-large.*
header.supporting-text.color → sys.color.on-surface-variant
header.supporting-text.{font,line-height,size,weight,tracking,type} → sys.typescale.label-large.*
weekdays.label-text.color → sys.color.on-surface
weekdays.label-text.{font,…,type} → sys.typescale.body-large.*
date.label-text.{font,…,type} → sys.typescale.body-large.*
date.container.shape → sys.shape.corner.full
date.container.width → 40dp
date.container.height → 40dp
date.state-layer.shape → sys.shape.corner.full
date.state-layer.width → 40dp
date.state-layer.height → 40dp
date.unselected.label-text.color → sys.color.on-surface
date.today.label-text.color → sys.color.primary
date.today.container.outline.color → sys.color.primary
date.today.container.outline.width → 1dp
date.selected.label-text.color → sys.color.on-primary
date.selected.container.color → sys.color.primary
date.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
date.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-primary
date.today.{hover,focus,pressed}.state-layer.color → sys.color.primary
date.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
range-selection.container.elevation → sys.elevation.level0
range-selection.container.shape → sys.shape.corner.none
range-selection.header.container.height → 128dp
range-selection.header.headline.{font,line-height,size,weight,tracking,type} → sys.typescale.title-large.*
range-selection.month.subhead.color → sys.color.on-surface-variant
range-selection.month.subhead.{font,…,type} → sys.typescale.title-small.*
range-selection.active-indicator.container.color → sys.color.secondary-container
range-selection.active-indicator.container.shape → sys.shape.corner.full
range-selection.active-indicator.container.height → 40dp
range-selection.date.in-range.label-text.color → sys.color.on-secondary-container
range-selection.date.in-range.{hover,focus,pressed}.state-layer.color → sys.color.on-primary-container
range-selection.date.in-range.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
year-selection.year.container.width → 72dp
year-selection.year.container.height → 36dp
year-selection.year.state-layer.shape → sys.shape.corner.full
year-selection.year.state-layer.width → 72dp
year-selection.year.state-layer.height → 36dp
year-selection.year.label-text.{font,…,type} → sys.typescale.body-large.*
year-selection.year.unselected.label-text.color → sys.color.on-surface-variant
year-selection.year.selected.label-text.color → sys.color.on-primary
year-selection.year.selected.container.color → sys.color.primary
year-selection.year.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
year-selection.year.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-primary
year-selection.year.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
```

**`md.comp.date-input.modal`**
```
container.color → sys.color.surface-container-high
container.elevation → sys.elevation.level3
container.shape → sys.shape.corner.extra-large (28dp)
container.width → 328dp
container.height → 512dp
header.container.width → 328dp
header.container.height → 120dp
header.headline.color → sys.color.on-surface-variant
header.headline.{font,line-height,size,weight,tracking,type} → sys.typescale.headline-large.*
header.supporting-text.color → sys.color.on-surface-variant
header.supporting-text.{font,line-height,size,weight,tracking,type} → sys.typescale.label-large.*
```
CSS: `md.comp.date-picker.docked.container.color` → `--md-comp-date-picker-docked-container-color`, etc.

## 5. States & interaction

**State × part matrix (date cell)**

| Cell kind | Circle | Label | State layer color (h/f/p) | Extra |
|---|---|---|---|---|
| Unselected | none | on-surface | on-surface-variant | — |
| Outside month (docked) | none | on-surface @ 0.38 | on-surface-variant | interactive (selecting switches month, derived) |
| Today (not selected) | 1px primary outline | primary | primary | `aria-current="date"` |
| Selected (incl. range start/end) | primary fill | on-primary | on-primary | today outline hidden (fill wins, derived) |
| In range (modal range) | none (band behind) | on-secondary-container | on-primary-container | today in range keeps 1px primary outline (derived) |
| Disabled (min/max/predicate) | none (selected: on-surface @ 0.12) | on-surface @ 0.38 | none | no hover/press layer; reachable by arrow keys (`aria-disabled`), Enter/click ignored (APG, derived) |
| Year unselected / selected | none / primary pill 72×36 | on-surface-variant / on-primary | on-surface-variant / on-primary | — |

- State layer: circle 40×40 (dates) or pill 72×36 (years) centered in the cell; opacities hover 0.08 / focus 0.10 / pressed 0.10 (`state layer primitive`, one layer at a time); pressed adds the `ripple primitive`.
- Focus: `focus ring primitive` on the 40px circle / year pill (outer offset; shape full), plus focus state layer.
- Range band: continuous `secondary-container` band 40dp tall between start and end; it starts at the start circle's center and ends at the end circle's center so the circles sit on its rounded ends; at week-row boundaries the band runs to the grid edge (square cut) and continues on the next row (derived; see §11). Start == end → no band.
- Hover on a range end while choosing the end date: (derived) preview band at 0.5 opacity is optional; not in source.
- Docked menu buttons: when a menu (month or year) is open, that button shows pressed/expanded state (arrow rotated 180°) and the other button is disabled (0.38).
- Menu list item states: state layer full-bleed `on-surface`; selected adds `surface-variant` container + check icon; focus ring uses the inner offset (full-bleed item).
- Header headline updates live with the pending selection (e.g. "Mon, Aug 17"; range "Aug 17 – Aug 23"); with nothing selected it shows a placeholder ("Selected date" / "Start date – End date", derived) while supporting text stays "Select date".

## 6. Motion & behavior
- **Docked open/close**: calendar drops down just below the field (enter & exit within bounds: reveal along y from the field edge). Reveal with `clip-path: inset(0 0 100% 0)` → `inset(0)` on `spring primitive` default spatial (standard scheme override — no overshoot on a popup, derived) + opacity on fast effects; close: fast effects fade (shorter than enter).
- **Docked height**: container height animates to the row count of the displayed month (default spatial, standard scheme; derived). Use a measured `height` transition or `interpolate-size: allow-keywords`.
- **Docked view swap**: year/month menu **replaces** the calendar in place (fade-through on fast effects; derived).
- **Month change**: modal single — swipe horizontally (lateral transition: grid slides ±inline-size on default spatial, standard scheme); arrows trigger the same slide. Docked arrows: same lateral slide (derived). Range — scroll vertically through months (native scrolling, `scroll-snap` not required).
- **Year view (modal)**: tap the menu button → crossfade calendar ↔ year grid (fast effects), arrow icon rotates 180° (fast spatial); scroll vertically through years.
- **Modal enter/exit**: same as dialogs (see ../dialogs.md). Range full-screen: enter & exit beyond bounds (slide up from bottom, derived from full-screen dialog).
- **Dismissal**: confirm (**OK**/**Save**) or dismiss (**Cancel**/×); interacting outside (scrim) dismisses (cancel); until then the picker retains focus.
- **Mode switching**: edit icon → modal date input; calendar icon → modal date picker. Pending selection carries over; invalid typed input blocks switching back until fixed (derived).
- **Reduced motion**: no slides/reveals/height animation — instant or short opacity crossfade.
- **Responsive**: compact → modal / full-screen modal; medium & expanded → docked. Component sizes do not scale with window size. Docked popup flips above the field when there isn't room below (web mapping).

## 7. Usage guidelines
- Pick variant by distance of dates: near → modal picker; distant (date of birth) → modal input or docked.
- For dates that don't need a calendar, the modal date input can be the **default** view; alternatively a plain text field with appropriate hint text in a form.
- On compact windows prefer the full-screen modal picker for readability and touch targets.
- Indicate selection with color; range in-between dates connected with a subtle highlight; today visually distinct from selected (outline vs. fill).
- Remove the optional **Clear** button if not needed (fewer tab stops).
- **Don't** scale the picker up responsively on large screens.
- Truncated labels (weekday initials) expose the full text via tooltip on hover.

## 8. Accessibility
- Always allow manual text entry (docked: the text field; modal: the edit icon to switch to input).
- The calendar icon is the **exclusive** entry point to the picker; text field and calendar icon button are separate tab stops.
- **Input formatting**: no input masks. Format after Enter or blur (e.g. `08172323` → `08/17/2023`). Accept dashes, spaces, slashes, dots, and optional leading 0 for single-digit month/day.
- Text field accessible name states the purpose (e.g. "Event date") and matches placeholder when empty. Helper text gives the format ("MM/DD/YYYY" default, customizable) and is the field's description (`aria-describedby`).
- Each date's accessible name is the full date ("Monday, August 17, 2023"), not just "17".
- Date label contrast ≥ 4.5:1 against background.
- Keyboard shortcuts are shown in tooltips of the respective buttons and included in their accessible description (e.g. previous year button: "Shift + Page up"; web: `aria-keyshortcuts` + `aria-describedby`).
- Weekday headers are not focusable; tooltip on hover with full day name.
- Touch targets 48×48dp. Announce month/year changes via a polite live region (web mapping).

**Roles (source + web mapping)**

| Element | Label | Role |
|---|---|---|
| Previous/next month and year | "{label}" (e.g. "Previous month") | `button` |
| Month and year dropdowns | "{label}" (e.g. "Select month, August") | `button` + `aria-haspopup="listbox"` / `aria-expanded` (web mapping) |
| Days of the week | full day name | `columnheader` |
| Month grid | month + year (`aria-label`) | `grid` (rows `row`, cells `gridcell`; `aria-selected`; today `aria-current="date"`; `aria-disabled`) |
| Modal picker | headline/supporting text | `dialog` + `aria-modal="true"` (web mapping) |
| Month/year menu, modal year grid | — | `listbox` / `option` + `aria-selected` (web mapping) |

**Keyboard** (source table; first row in source is malformed)

| Key | Action |
|---|---|
| Enter / Return (Space: web mapping) | Selects the focused date; on the picker, closes the calendar and saves the selected date |
| Arrow keys | Move focus by day (←/→, mirrored in RTL) and week (↑/↓) — (web mapping, APG grid) |
| Page Up / Page Down | Same date in previous / next month |
| Shift + Page Up / Page Down | Same date in previous / next year |
| Home / End | First / last day of the month (source states "first day" for both; End → last day) |
| Shift + M | Move to month list dropdown |
| Shift + Y | Move to year list dropdown |
| Escape | Close picker without saving, return focus to the calendar icon button (web mapping) |
| Tab | Field → calendar button → header controls → grid (one tab stop, roving tabindex) → actions |

- Focus management: on open, focus the selected date (else today, else first enabled date in view); on close, return focus to the calendar icon button. Modal traps focus (native `<dialog>`). Moving focus to a date outside the view changes the month (clamp day: Jan 31 + 1 month → Feb 28/29).

## 9. Implementation checklist
- [ ] Components: `date-picker` (variant `docked` | `modal` | `modal-input` | `fullscreen-range`), shared calendar grid, year grid, month/year menus.
- [ ] Props: `value` (ISO `YYYY-MM-DD`), `range` + `start`/`end`, `min`, `max`, `isDateDisabled(fn)`, `firstDayOfWeek` (default from locale), `locale`, `format` (display & parse), `open`, `mode` (`calendar` | `input`), `showOutsideDays` (docked), `headline`, `supportingText`, `confirmLabel`, `cancelLabel`, `clearable`, `label`, `helperText` (default "MM/DD/YYYY"), `name`, `required`.
- [ ] Events: `change` (committed), `input` (pending), `open`, `close`, `cancel`, `mode-change`, `view-change` (month/year).
- [ ] Slots: header actions, footer actions, field/trigger.
- [ ] Pending selection separate from committed value; commit on OK/Save or Enter; discard on Cancel/scrim/Escape.
- [ ] Docked: anchor below the text field (flip above), animate height to row count; menus replace calendar; disable the other menu button while one is open.
- [ ] Today outline vs. selected fill; outside-month dates at 0.38.
- [ ] Range: band, start/end circles, same-day range, end-before-start → restart with new start (§11).
- [ ] Roving tabindex grid with full-date names, `aria-selected`, `aria-current="date"`.
- [ ] Locale-aware weekday names/initials + full-name tooltips; RTL.
- [ ] Lenient parser, format on blur/Enter, no masks; error via text field error state + `aria-invalid`.
- [ ] 48px hit targets; forced-colors and reduced-motion fallbacks; native form participation.

## 10. HTML/CSS implementation blueprint

### (a) DOM skeleton
```html
<!-- Docked: field + popover calendar -->
<div class="md-date-field">
  <!-- outlined text field (see ../text-fields.md); NOT type=date (native masks) -->
  <input id="d1" type="text" inputmode="numeric" autocomplete="off"
         aria-describedby="d1-help" placeholder="MM/DD/YYYY">
  <button class="md-icon-button" popovertarget="cal1" aria-label="Choose date"
          aria-haspopup="dialog" aria-expanded="false">…calendar icon…</button>
  <span id="d1-help">MM/DD/YYYY</span>
  <input type="hidden" name="date" value="2026-08-17"> <!-- form value (ISO) -->
</div>

<div id="cal1" popover="auto" role="dialog" aria-label="Choose date"
     class="md-date-picker" data-variant="docked">
  <div part="header" class="dp-header">            <!-- 64px -->
    <div class="dp-group">
      <button class="md-icon-button" aria-label="Previous month" aria-keyshortcuts="PageUp">‹</button>
      <button class="dp-menu-button" aria-haspopup="listbox" aria-expanded="false">Aug <span class="dp-arrow"></span></button>
      <button class="md-icon-button" aria-label="Next month" aria-keyshortcuts="PageDown">›</button>
    </div>
    <div class="dp-group"> …same for year (Shift+PageUp/PageDown)… </div>
  </div>
  <div part="body" class="dp-body">                  <!-- calendar OR menu view -->
    <table role="grid" aria-label="August 2026" class="dp-grid">
      <thead><tr>
        <th scope="col" aria-label="Sunday"><span aria-hidden="true" title="Sunday">S</span></th> …
      </tr></thead>
      <tbody>
        <tr>
          <td role="gridcell" tabindex="-1" aria-label="Sunday, July 26, 2026" data-outside>
            <span class="dp-day">26</span></td> …
          <td role="gridcell" tabindex="0" aria-selected="true" aria-label="Monday, August 17, 2026">
            <span class="dp-day">17</span></td>
          <td role="gridcell" tabindex="-1" aria-current="date" …><span class="dp-day">5</span></td>
        </tr> …
      </tbody>
    </table>
    <!-- menu view (hidden while calendar shown) -->
    <ul role="listbox" class="dp-menu" aria-label="Month" hidden>
      <li role="option" aria-selected="true" tabindex="0"><span class="dp-check"></span>August</li> …
    </ul>
  </div>
  <div part="actions" class="dp-actions">
    <button class="md-text-button dp-clear">Clear</button>
    <span class="dp-spacer"></span>
    <button class="md-text-button" value="cancel">Cancel</button>
    <button class="md-text-button" value="ok">OK</button>
  </div>
  <div class="dp-live" aria-live="polite" hidden-visually></div>
</div>

<!-- Modal: native <dialog> (scrim, focus trap, Escape) -->
<dialog class="md-date-picker" data-variant="modal" aria-labelledby="h1">
  <header part="header" class="dp-modal-header">       <!-- 120px; range: 128px -->
    <span part="supporting-text" class="dp-supporting">Select date</span>
    <h2 part="headline" id="h1" class="dp-headline">Mon, Aug 17</h2>
    <button class="md-icon-button dp-mode" aria-label="Switch to text input">✎</button>
  </header>
  <div class="dp-nav">                                   <!-- 56px -->
    <button class="dp-menu-button" aria-haspopup="listbox" aria-expanded="false">August 2026 <span class="dp-arrow"></span></button>
    <button class="md-icon-button" aria-label="Previous month">‹</button>
    <button class="md-icon-button" aria-label="Next month">›</button>
  </div>
  <div part="body" class="dp-body"> grid (same as docked) | year listbox:
    <div role="listbox" class="dp-years" aria-label="Year">
      <button role="option" aria-selected="false" tabindex="-1" class="dp-year">2025</button> …
    </div>
  </div>
  <form method="dialog" part="actions" class="dp-actions">
    <button value="cancel">Cancel</button><button value="ok">OK</button></form>
</dialog>
<!-- Range full-screen: same <dialog> with data-variant="range": header top row
     [close ×][spacer][Save], weekday row sticky, .dp-months scroll container with
     <section><h3 class="dp-subhead">August 2026</h3><table role="grid">…</table></section> per month.
     Range cells add data-range="start|middle|end" and aria-selected="true" on start/end/middle. -->
```

### (b) Custom properties
```css
.md-date-picker {
  /* container */
  --md-comp-date-picker-container-color: var(--md-sys-color-surface-container-high);
  --md-comp-date-picker-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-date-picker-container-shape: var(--md-sys-shape-corner-extra-large);
  --md-comp-date-picker-container-width: 360px;
  /* header */
  --md-comp-date-picker-header-headline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-date-picker-header-supporting-text-color: var(--md-sys-color-on-surface-variant);
  /* weekdays & dates */
  --md-comp-date-picker-weekdays-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-date-picker-date-container-width: 40px;   /* docked: 48px cell, see below */
  --md-comp-date-picker-date-container-height: 40px;
  --md-comp-date-picker-date-state-layer-size: 40px;
  --md-comp-date-picker-date-unselected-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-date-picker-date-unselected-state-layer-color: var(--md-sys-color-on-surface-variant);
  --md-comp-date-picker-date-today-label-text-color: var(--md-sys-color-primary);
  --md-comp-date-picker-date-today-container-outline-color: var(--md-sys-color-primary);
  --md-comp-date-picker-date-today-container-outline-width: 1px;
  --md-comp-date-picker-date-today-state-layer-color: var(--md-sys-color-primary);
  --md-comp-date-picker-date-selected-container-color: var(--md-sys-color-primary);
  --md-comp-date-picker-date-selected-label-text-color: var(--md-sys-color-on-primary);
  --md-comp-date-picker-date-selected-state-layer-color: var(--md-sys-color-on-primary);
  --md-comp-date-picker-date-outside-month-label-text-opacity: 0.38;
  /* range */
  --md-comp-date-picker-range-active-indicator-color: var(--md-sys-color-secondary-container);
  --md-comp-date-picker-range-active-indicator-height: 40px;
  --md-comp-date-picker-range-in-range-label-text-color: var(--md-sys-color-on-secondary-container);
  --md-comp-date-picker-range-in-range-state-layer-color: var(--md-sys-color-on-primary-container);
  --md-comp-date-picker-range-month-subhead-color: var(--md-sys-color-on-surface-variant);
  /* year */
  --md-comp-date-picker-year-width: 72px;
  --md-comp-date-picker-year-height: 36px;
  --md-comp-date-picker-year-unselected-label-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-date-picker-year-selected-container-color: var(--md-sys-color-primary);
  --md-comp-date-picker-year-selected-label-text-color: var(--md-sys-color-on-primary);
  /* menu button & menu (docked) */
  --md-comp-date-picker-menu-button-height: 40px;
  --md-comp-date-picker-menu-button-color: var(--md-sys-color-on-surface-variant);
  --md-comp-date-picker-menu-button-icon-size: 18px;
  --md-comp-date-picker-menu-list-item-height: 48px;
  --md-comp-date-picker-menu-list-item-color: var(--md-sys-color-on-surface);
  --md-comp-date-picker-menu-list-item-selected-container-color: var(--md-sys-color-surface-variant);
  --md-comp-date-picker-menu-list-item-selected-leading-icon-size: 24px;
  --md-comp-date-picker-divider-color: var(--md-sys-color-outline-variant);

  inline-size: var(--md-comp-date-picker-container-width);
  background: var(--md-comp-date-picker-container-color);
  border-radius: var(--md-comp-date-picker-container-shape);
  box-shadow: var(--md-comp-date-picker-container-elevation);   /* elevation primitive */
  color: var(--md-sys-color-on-surface);
  padding: 0; border: 0; overflow: clip;
}
.md-date-picker[data-variant="docked"] {
  --md-comp-date-picker-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-date-picker-date-cell-height: 48px;   /* date.container 48×48 */
  max-block-size: 456px;
}
.md-date-picker[data-variant="modal"] { --md-comp-date-picker-date-cell-height: 40px; block-size: 524px; }
.md-date-picker[data-variant="input"] { --md-comp-date-picker-container-width: 328px; block-size: 512px; }
.md-date-picker[data-variant="range"] {
  --md-comp-date-picker-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-date-picker-container-elevation: var(--md-sys-elevation-level0);
  --md-comp-date-picker-date-cell-height: 48px;
  inline-size: 100vw; block-size: 100dvh; max-inline-size: none; max-block-size: none;
}

.dp-modal-header { block-size: 120px; padding: 16px 12px 12px 24px; display: grid;
  grid-template: "sup sup" auto "head mode" 1fr / 1fr auto; align-items: end;
  border-block-end: 1px solid var(--md-comp-date-picker-divider-color); }
.dp-supporting { grid-area: sup; color: var(--md-comp-date-picker-header-supporting-text-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking); }
.dp-headline { grid-area: head; margin: 0; color: var(--md-comp-date-picker-header-headline-color);
  font: var(--md-sys-typescale-headline-large-weight) var(--md-sys-typescale-headline-large-size)/var(--md-sys-typescale-headline-large-line-height) var(--md-sys-typescale-headline-large-font);
  letter-spacing: var(--md-sys-typescale-headline-large-tracking);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-variant="range"] .dp-headline { /* title-large */
  font: var(--md-sys-typescale-title-large-weight) var(--md-sys-typescale-title-large-size)/var(--md-sys-typescale-title-large-line-height) var(--md-sys-typescale-title-large-font);
  letter-spacing: var(--md-sys-typescale-title-large-tracking); }
.dp-header { block-size: 64px; padding-inline: 12px; display: flex; align-items: center; justify-content: space-between; }
.dp-nav { block-size: 56px; padding-inline: 16px 12px; display: flex; align-items: center; }
.dp-nav .dp-menu-button { margin-inline-end: auto; }

.dp-menu-button { position: relative; block-size: var(--md-comp-date-picker-menu-button-height);
  padding-inline: 12px 8px; gap: 8px; display: inline-flex; align-items: center; border: 0; background: none;
  border-radius: var(--md-sys-shape-corner-full); color: var(--md-comp-date-picker-menu-button-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking); }   /* state layer + focus ring + touch target primitives */
.dp-arrow { inline-size: var(--md-comp-date-picker-menu-button-icon-size); aspect-ratio: 1; }

.dp-grid { border-collapse: collapse; table-layout: fixed; inline-size: 336px; margin-inline: 12px;
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); font-variant-numeric: tabular-nums; }
.dp-grid th { block-size: 48px; font-weight: inherit; color: var(--md-comp-date-picker-weekdays-label-text-color); }
[data-variant="modal"] .dp-grid th { block-size: 40px; }
.dp-grid td { position: relative; inline-size: 48px; block-size: var(--md-comp-date-picker-date-cell-height);
  padding: 0; text-align: center; cursor: pointer; outline: none; }
.dp-grid td::after { content: ""; position: absolute; inset: 50% 0 auto; block-size: 48px; translate: 0 -50%; } /* touch target primitive (vertical) */
.dp-day { position: relative; z-index: 1; display: inline-grid; place-items: center;
  inline-size: var(--md-comp-date-picker-date-state-layer-size); block-size: var(--md-comp-date-picker-date-state-layer-size);
  border-radius: var(--md-sys-shape-corner-full);
  color: var(--md-comp-date-picker-date-unselected-label-text-color);
  --_sl: var(--md-comp-date-picker-date-unselected-state-layer-color); }
.dp-day::before { content: ""; position: absolute; inset: 0; border-radius: inherit;  /* state layer primitive */
  background: var(--_sl); opacity: 0; pointer-events: none;
  transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
```

### (c) State selectors
```css
td[data-outside] .dp-day { color: color-mix(in srgb, var(--md-comp-date-picker-date-unselected-label-text-color) 38%, transparent); }
td[aria-current="date"] .dp-day { color: var(--md-comp-date-picker-date-today-label-text-color);
  box-shadow: inset 0 0 0 var(--md-comp-date-picker-date-today-container-outline-width) var(--md-comp-date-picker-date-today-container-outline-color);
  --_sl: var(--md-comp-date-picker-date-today-state-layer-color); }
td[aria-selected="true"]:not([data-range="middle"]) .dp-day { background: var(--md-comp-date-picker-date-selected-container-color);
  color: var(--md-comp-date-picker-date-selected-label-text-color); box-shadow: none;
  --_sl: var(--md-comp-date-picker-date-selected-state-layer-color); }
td[data-range="middle"] .dp-day { color: var(--md-comp-date-picker-range-in-range-label-text-color);
  --_sl: var(--md-comp-date-picker-range-in-range-state-layer-color); }
/* range band: drawn on the cell, behind .dp-day; logical properties → RTL-safe */
td[data-range]::before { content: ""; position: absolute; inset-block: 50% auto; translate: 0 -50%;
  block-size: var(--md-comp-date-picker-range-active-indicator-height);
  background: var(--md-comp-date-picker-range-active-indicator-color); inset-inline: 0; }
td[data-range="start"]::before { inset-inline-start: 50%; }
td[data-range="end"]::before   { inset-inline-end: 50%; }
td[data-range="start"][data-range-end]::before { display: none; }       /* same-day range */
td[aria-disabled="true"] { cursor: default; }
td[aria-disabled="true"] .dp-day { color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
td[aria-disabled="true"] .dp-day::before { display: none; }

@media (hover: hover) { td:not([aria-disabled="true"]):hover .dp-day::before { opacity: var(--md-sys-state-hover-state-layer-opacity); } }
td:focus-visible .dp-day::before { opacity: var(--md-sys-state-focus-state-layer-opacity); }
td:not([aria-disabled="true"]):active .dp-day::before { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
td:focus-visible .dp-day {   /* focus ring primitive */
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }

.dp-year { position: relative; inline-size: var(--md-comp-date-picker-year-width); block-size: var(--md-comp-date-picker-year-height);
  border: 0; border-radius: var(--md-sys-shape-corner-full); background: none;
  color: var(--md-comp-date-picker-year-unselected-label-text-color); --_sl: var(--md-sys-color-on-surface-variant); }
.dp-year[aria-selected="true"] { background: var(--md-comp-date-picker-year-selected-container-color);
  color: var(--md-comp-date-picker-year-selected-label-text-color); --_sl: var(--md-sys-color-on-primary); }
.dp-years { display: grid; grid-template-columns: repeat(3, auto); justify-content: space-evenly; row-gap: 16px;
  padding-inline: 12px; overflow-y: auto; }

.dp-menu-button[aria-expanded="true"] .dp-arrow { rotate: 180deg; }
.dp-menu-button:disabled { color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
.dp-menu [role="option"] { position: relative; block-size: var(--md-comp-date-picker-menu-list-item-height);
  padding-inline: 56px 16px; display: flex; align-items: center; color: var(--md-comp-date-picker-menu-list-item-color); }
.dp-menu [role="option"][aria-selected="true"] { background: var(--md-comp-date-picker-menu-list-item-selected-container-color); padding-inline-start: 16px; gap: 16px; }
.dp-menu [role="option"]:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset); }
.dp-subhead { block-size: 48px; padding-inline: 24px; margin: 0; display: flex; align-items: center;
  color: var(--md-comp-date-picker-range-month-subhead-color);
  font: var(--md-sys-typescale-title-small-weight) var(--md-sys-typescale-title-small-size)/var(--md-sys-typescale-title-small-line-height) var(--md-sys-typescale-title-small-font);
  letter-spacing: var(--md-sys-typescale-title-small-tracking); }
```

### (d) Motion
```css
/* docked popover: anchor + reveal */
.md-date-field { anchor-name: --date-field; }   /* the outlined field container */
.md-date-picker[data-variant="docked"] { position: fixed; position-anchor: --date-field; margin: 0;
  position-area: block-end span-inline-end; margin-block-start: 4px;  /* derived gap */
  position-try-fallbacks: flip-block;
  clip-path: inset(0 0 100% 0 round var(--md-comp-date-picker-container-shape)); opacity: 0;
  transition: clip-path var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
              opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
              display var(--md-sys-motion-spring-default-spatial-duration) allow-discrete,
              overlay var(--md-sys-motion-spring-default-spatial-duration) allow-discrete;
  /* standard-scheme springs on this subtree: no overshoot for popups (derived) */ }
.md-date-picker[data-variant="docked"]:popover-open { clip-path: inset(0 round var(--md-comp-date-picker-container-shape)); opacity: 1; }
@starting-style { .md-date-picker[data-variant="docked"]:popover-open { clip-path: inset(0 0 100% 0 round var(--md-comp-date-picker-container-shape)); opacity: 0; } }
.dp-body { transition: block-size var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); interpolate-size: allow-keywords; }
/* month change: JS sets data-dir="next|prev" on the outgoing/incoming grids */
@keyframes dp-in-next { from { translate: 100% 0; } } @keyframes dp-in-prev { from { translate: -100% 0; } }
.dp-grid[data-enter="next"] { animation: dp-in-next var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.dp-grid[data-enter="prev"] { animation: dp-in-prev var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.dp-arrow { transition: rotate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-date-picker, .dp-body, .dp-arrow { transition-duration: 0s; }
  .md-date-picker[data-variant="docked"] { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
  .dp-grid[data-enter] { animation: none; }
}
```
Modal enter/exit: reuse the dialog motion (../dialogs.md). RTL: JS swaps `next`/`prev` for `data-enter` when `dir=rtl` so the incoming grid slides from the logical end.

### (e) Forced colors
```css
@media (forced-colors: active) {
  .md-date-picker { border: 1px solid CanvasText; }                        /* shadow/tonal surface disappear */
  td[aria-selected="true"]:not([data-range="middle"]) .dp-day,
  .dp-year[aria-selected="true"], .dp-menu [aria-selected="true"] { forced-color-adjust: none; background: Highlight; color: HighlightText; }
  td[aria-current="date"] .dp-day { outline: 1px solid CanvasText; box-shadow: none; }
  td[data-range]::before { forced-color-adjust: none; background: transparent; border-block: 1px solid Highlight; }
  td[aria-disabled="true"] .dp-day, td[data-outside] .dp-day, .dp-menu-button:disabled { color: GrayText; }
  .dp-day::before { display: none; }                                       /* state layers are dropped anyway */
  td:focus-visible .dp-day { outline-color: Highlight; }
}
```

### (f) Behaviour / JS responsibilities
- Calendar model: build weeks with `Intl.Locale(locale).getWeekInfo?.().firstDay` (fallback 0/1 per locale table); weekday narrow labels via `Intl.DateTimeFormat(locale,{weekday:'narrow'})`, full names for `aria-label`/tooltip; cell names via `{weekday:'long', month:'long', day:'numeric', year:'numeric'}`. Work in plain calendar dates (no time zone shifts: use `Date.UTC` or Temporal.PlainDate).
- Roving tabindex: exactly one `td[tabindex=0]`; arrows/Page/Home/End per §8 (swap ←/→ when `dir=rtl`); crossing the month edge re-renders and announces "August 2026" in the live region; clamp days; skip nothing (disabled cells focusable but not selectable).
- Shift+M / Shift+Y focus the month / year menu buttons (docked) or open the year view (modal).
- Selection: click/Enter/Space sets pending value, updates headline; docked & modal commit on OK (Enter on a date in docked commits and closes, per source); Cancel/Escape/scrim/light-dismiss discard. Range: first pick = start, second = end; picking a date before start restarts with it as new start (§11); set `data-range` on cells.
- Docked: `popover="auto"` (light dismiss = cancel); on `toggle` set `aria-expanded` on the calendar button; JS fallback positioning when CSS anchor positioning is unsupported (`getBoundingClientRect`, flip if `innerHeight - rect.bottom < 456`). Opening a month/year menu disables the other menu button, focuses the selected option, Enter/click selects and returns to the calendar with focus on the menu button.
- Modal: `dialog.showModal()`; on `cancel` event restore pending; `close` with `returnValue` `ok` → commit. Mode toggle swaps body between grid and text field(s); parse on blur/Enter.
- Swipe (modal single): pointer events on the grid with `touch-action: pan-y`; horizontal drag > 1/3 width or velocity → change month.
- Parsing: strip `[-./\s]`, accept 1–2 digit month/day, 2/4 digit year per `format`; format on blur/Enter; invalid → text field error + `aria-invalid="true"` + helper replaced by error text.
- Form participation: hidden `<input name>` with ISO value, or form-associated custom element (`ElementInternals.setFormValue`, `setValidity` for `required`/min/max); range submits two values (`name-start`, `name-end`).
- Focus return: on close, focus the calendar icon button (docked/modal launched from field) or the invoking element.

## 11. Source gaps & decisions
- **Elevation vs. "no shadow"**: tokens give level3 for docked/modal/input, while the overview says M3 pickers have no shadow. Decision: keep the token (themes may render level3 as a shadow or tonal only); docked keeps a shadow because it floats over page content.
- **Padding/geometry** only in measurement images. Decision: derived the stacks in §4.2 so that they sum exactly to the token heights (docked 456, modal 524) and widths (7×48 + 2×12 = 360).
- **Modal date container 40×40 vs. 48dp targets**: columns are 48px (360 − 24 / 7); rows 40px with a 48px vertical hit area pseudo-element (overlaps neighbours by 4px, acceptable as only pointer targets overlap, not visuals).
- **Range band at week-row breaks**: not specified. Decision: square-cut at row/grid edges and continue on the next row; rounded ends occur only under start/end circles (token `corner.full` applied there).
- **In-range state layer `on-primary-container`** while label is `on-secondary-container`: inconsistent pair but kept as tokenized.
- **Today + selected**: not specified; selected fill wins, outline hidden (matches Compose/MDC behaviour).
- **Disabled dates / disabled selected**: not tokenized; on-surface @ 0.38 label, on-surface @ 0.12 container (disabled recipe).
- **Keyboard table**: first row is malformed ("Enter/return | Enter/return"); Home/End both say "first day of the month" → End = last day. Arrow keys and Escape not listed → APG grid mapping.
- **"Interacting outside of the dialog will also dismiss the time picker"** — copy error in the date-picker source; read as date picker.
- **Range end before start**: not specified; restart with the tapped date as new start (Compose behaviour). Same-day range allowed (no band).
- **Motion**: no durations/springs on the page; used spring primitive (default spatial, standard scheme for popups and month slides; fast effects for color/opacity), dialogs' enter/exit for modal.
- **Modal nav menu button / icon button tokens**: not in modal set; reuse docked menu-button tokens and standard icon button.
- **Native `<input type=date>`** rejected: it applies input masks, which the source forbids.
