# Time pickers

> Source: https://m3.material.io/components/time-pickers · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview
Time pickers let people enter a specific time value (hours, minutes, AM/PM period). They are **modal** (displayed in a dialog above a scrim) and cover the main content.

**Use when**: setting an alarm, scheduling a meeting, any hour/minute selection.
**Don't use**: for nuanced or granular selection (e.g. milliseconds for a stopwatch).

- Two variants: **dial** (clock face + time selector) and **input** (keyboard entry only).
- Must be easy to operate by hand on mobile; avoid scrolling — swap orientation or variant instead.

**Changes vs. M2**: new color mappings compatible with dynamic color (selected hour/minute box `primary-container`, selected period `tertiary-container`). No Expressive-specific changes (shape morph, spring tokens) documented on this page.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
|---|---|---|
| Dial – vertical (portrait) | Headline, time selector (hour : minute) + period selector in a row, 256dp clock dial below, actions at the bottom. | Default on mobile. Period selector vertical 52×80dp. |
| Dial – horizontal (landscape) | Time selector with the horizontal period selector beneath it on the start side; dial on the end side. | Period selector horizontal 216×38dp (= 96 + 24 + 96 time selector width). Larger breakpoints or limited viewport height. |
| Dial – 24h | No period selector; dial has two rings (outer 00–11, inner 12–23, see §11). | Time selector width 114dp in the 24h vertical layout. 24h vs 12h is set outside the component (system/locale). |
| Input – 12h | Hour field : minute field + vertical AM/PM selector; supporting text "Hour"/"Minute" below fields. | Field 96×72dp; period selector 52×72dp. |
| Input – 24h | Hour and minute fields only, no AM/PM. | |

Toggle dial ↔ input with the icon button at the start of the action row (keyboard icon on dial; clock icon on input).

## 3. Anatomy

**Dial**
1. Headline — "Select time" (label-medium).
2. Time selector separator — ":".
3. Container — dialog surface.
4. Period selector container — AM/PM segmented, outlined.
5. Period selector label text.
6. Clock dial selector center — 8dp dot at dial center.
7. Clock dial selector track — 2dp line from center to handle.
8. Text buttons — Cancel / OK.
9. Icon button — toggle to input (keyboard icon).
10. Clock dial selector container (handle) — 48dp circle on the selected value.
11. Clock dial label text — numbers on the dial.
12. Clock dial container — 256dp circle.
13. Time selector label text — hour/minute digits.
14. Time selector container — hour/minute boxes (selected one highlighted).

**Input**
1. Headline — "Enter time". 2. Time input field separator. 3. Container. 4. Period selector container. 5. Period selector label text. 6. Text buttons. 7. Icon button (clock icon). 8. Time input field supporting text ("Hour" / "Minute", below field). 9. Time input field label text (digits). 10. Time input field container.

## 4. Tokens & specs

### 4.1 Color

**Dial (`md.comp.time-picker`)**

| Part | State | Token | System role |
|---|---|---|---|
| Container | — | `container.color` | `--md-sys-color-surface-container-high` |
| Headline | — | `headline.color` | `--md-sys-color-on-surface-variant` |
| Time selector container | selected | `time-selector.selected.container.color` | `--md-sys-color-primary-container` |
| Time selector container | unselected | `time-selector.unselected.container.color` | `--md-sys-color-surface-container-highest` |
| Time selector label | selected (all states) | `time-selector.selected.(state.)label-text.color` | `--md-sys-color-on-primary-container` |
| Time selector label | unselected (all states) | `time-selector.unselected.(state.)label-text.color` | `--md-sys-color-on-surface` |
| Time selector state layer | selected / unselected | `time-selector.{selected,unselected}.{hover,focus,pressed}.state-layer.color` | on-primary-container / on-surface |
| Separator | — | `time-selector.separator.color` | `--md-sys-color-on-surface` |
| Period selector container | selected | `period-selector.selected.container.color` | `--md-sys-color-tertiary-container` |
| Period selector container | unselected | not tokenized | transparent (shows `surface-container-high`) |
| Period selector outline (+ divider) | — | `period-selector.outline.color` (1dp) | `--md-sys-color-outline` |
| Period label | selected / unselected (all states) | `period-selector.{selected,unselected}.(state.)label-text.color` | on-tertiary-container / on-surface-variant |
| Period state layer | selected / unselected | `period-selector.{selected,unselected}.{hover,focus,pressed}.state-layer.color` | on-tertiary-container / on-surface-variant |
| Clock dial | — | `clock-dial.color` | `--md-sys-color-surface-container-highest` |
| Dial label | selected / unselected | `clock-dial.{selected,unselected}.label-text.color` | on-primary / on-surface |
| Dial handle | — | `clock-dial.selector.handle.container.color` | `--md-sys-color-primary` |
| Dial center | — | `clock-dial.selector.center.container.color` | `--md-sys-color-primary` |
| Dial track | — | `clock-dial.selector.track.container.color` | `--md-sys-color-primary` |
| Icon button | — | (diagram) | `--md-sys-color-on-surface-variant` |
| Text buttons | — | (text button) | `--md-sys-color-primary` |

**Input (`md.comp.time-input`)**

| Part | State | Token | System role |
|---|---|---|---|
| Container | — | `container.color` | `--md-sys-color-surface-container-high` |
| Headline | — | `headline.color` | `--md-sys-color-on-surface-variant` |
| Field container | enabled | `time-input-field.container.color` | `--md-sys-color-surface-container-highest` |
| Field container | focus | `time-input-field.focus.container.color` | `--md-sys-color-primary-container` |
| Field outline | focus (2dp) | `time-input-field.focus.outline.color` | `--md-sys-color-primary` |
| Field label (digits) | enabled / hover | `time-input-field.label-text.color` / `.hover.label-text.color` | `--md-sys-color-on-surface` |
| Field label | focus | `time-input-field.focus.label-text.color` | `--md-sys-color-on-primary-container` |
| Field state layer | hover | `time-input-field.hover.state-layer.color` | `--md-sys-color-on-surface` |
| Separator | — | `time-input-field.separator.color` | `--md-sys-color-on-surface` |
| Supporting text | — | `time-input-field.supporting-text.color` | `--md-sys-color-on-surface-variant` |
| Period selector | as dial | `period-selector.*` | tertiary-container / on-tertiary-container / outline / on-surface-variant |
| Focus indicator | keyboard focus | `focus.indicator.color` | `--md-sys-color-secondary` |
| Field error (not tokenized) | invalid | — (derived) | outline `--md-sys-color-error` 2dp, supporting text `--md-sys-color-error` |

State-layer opacities: hover 0.08 (`--md-sys-state-hover-state-layer-opacity`), focus 0.10 (`--md-sys-state-focus-state-layer-opacity`), pressed 0.10 (`--md-sys-state-pressed-state-layer-opacity`). No disabled state is defined (derived for out-of-range values: on-surface @ 0.38, see §5).

### 4.2 Size, layout & shape

| Element | Value |
|---|---|
| Container W/H | Dynamic (hugs content) |
| Container padding | 24dp top/bottom, 24dp left/right |
| Headline alignment | Left (start) |
| Container shape | `corner.extra-large` 28dp |
| Time selector container (dial) | 96×80dp; 24h vertical layout width 114dp; `corner.small` 8dp |
| Period selector, vertical | 52×80dp (dial) / 52×72dp (input); `corner.small` 8dp; outline 1dp |
| Period selector, horizontal | 216×38dp |
| Time input field | 96×72dp, `corner.small` 8dp; focus outline 2dp |
| Clock dial | 256dp diameter, `corner.full` |
| Dial selector handle | 48dp diameter, `corner.full` |
| Dial selector center | 8dp diameter, `corner.full` |
| Dial selector track | 2dp wide |
| Focus indicator (input) | 3dp (`--md-sys-state-focus-indicator-thickness`), offset 2dp (`--md-sys-state-focus-indicator-outer-offset`), `secondary` |
| Dial targets | 48×48dp |

**Dial geometry (derived: Compose/MDC implementation values consistent with the tokens)**
- Coordinate system: dial center (128, 128) in a 256 box. Value *i* of *n* (n = 12) sits at angle θ = i·30° clockwise from 12 o'clock: `x = 128 + r·sin θ`, `y = 128 − r·cos θ`.
- Outer ring radius **r = 101dp** (= 128 − 24 handle radius − 3 inset); 24h inner ring **r = 69dp**. Each label is a 48×48 box (target) centered on its point; text body-large centered.
- 12h hours: 12 at top, then 1…11 clockwise. Minutes: 00, 05 … 55 at the same 12 positions; any minute (6° steps) selectable by dragging. 24h: outer 00 (top), 01…11; inner 12 (top), 13…23.
- Handle: 48dp `primary` circle centered on the selected value's point (same r as its ring). When a minute is not a multiple of 5, the handle sits between labels and shows a 4dp `on-primary` dot at its center (derived).
- Track: 2dp `primary` line from the center (128,128) to the handle center (drawn under the handle); center dot 8dp. Implement as one element rotated by θ: a `2px × r` bar with `transform-origin: bottom center`.
- Label under the handle renders `on-primary`: draw a second label layer in `on-primary` clipped to `circle(24px at handleX handleY)` (the handle) so a partially covered label is two-tone (derived from platform rendering).

**Layout (derived from Compose; measurement diagrams are images)**
- Vertical dial: headline → 20dp → time row [hour 96 · separator 24 · minute 96 · 12 gap · period 52] (= 280; 24h: 114 · 24 · 114 = 252) → 36dp → dial 256 (centered) → 24dp → action row 40dp (icon button start, Cancel/OK end, 8 gap). Container ≈ 328 wide.
- Horizontal dial: headline spans the top; below: start column [time row 216 wide → 12dp → period horizontal 216×38], 52dp gap (derived), end column dial 256; action row at bottom.
- Input: headline → 20dp → row [field 96×72 · separator 24 · field 96×72 · 12 gap · period 52×72], supporting text 7dp below each field (derived) → 24dp → action row.
- Separator ":" display-large, centered in its 24dp column, vertically centered on the 80/72dp boxes.
- Period selector: two segments (AM over PM vertically; AM then PM horizontally) split by a 1dp `outline` divider; outer corners 8dp, inner corners 0 (derived).

### 4.3 Typography

| Text | Typescale |
|---|---|
| Headline | label-medium |
| Time selector digits (dial) | display-large |
| Time selector separator / input separator | display-large |
| Time input field digits | display-medium |
| Time input supporting text | body-small |
| Period selector label | title-medium |
| Clock dial labels | body-large |

Use `font-variant-numeric: tabular-nums` on digits so values don't shift (derived). Digits are always 2-digit (`07`) in the selector/fields; dial hours unpadded in 12h (`7`), padded in 24h (`07`) — (derived, platform convention).

### 4.4 Elevation
- Container: level3 (`--md-sys-elevation-level3`, 6dp), shown over a scrim like a dialog (`elevation primitive`).

### 4.5 Component token list

**`md.comp.time-picker` (dial)**
```
container.color → sys.color.surface-container-high
container.elevation → sys.elevation.level3
container.shape → sys.shape.corner.extra-large (28dp)
headline.color → sys.color.on-surface-variant
headline.{font,line-height,size,weight,tracking,type} → sys.typescale.label-medium.*
time-selector.container.width → 96dp
time-selector.24h-vertical.container.width → 114dp
time-selector.container.height → 80dp
time-selector.container.shape → sys.shape.corner.small (8dp)
time-selector.selected.container.color → sys.color.primary-container
time-selector.unselected.container.color → sys.color.surface-container-highest
time-selector.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.display-large.*
time-selector.selected.label-text.color → sys.color.on-primary-container
time-selector.unselected.label-text.color → sys.color.on-surface
time-selector.selected.{hover,focus,pressed}.label-text.color → sys.color.on-primary-container
time-selector.unselected.{hover,focus,pressed}.label-text.color → sys.color.on-surface
time-selector.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-primary-container
time-selector.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface
time-selector.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
time-selector.separator.color → sys.color.on-surface
time-selector.separator.{font,line-height,size,weight,tracking,type} → sys.typescale.display-large.*
period-selector.container.shape → sys.shape.corner.small (8dp)
period-selector.vertical.container.width → 52dp
period-selector.vertical.container.height → 80dp
period-selector.horizontal.container.width → 216dp
period-selector.horizontal.container.height → 38dp
period-selector.outline.color → sys.color.outline
period-selector.outline.width → 1dp
period-selector.selected.container.color → sys.color.tertiary-container
period-selector.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.title-medium.*
period-selector.selected.label-text.color → sys.color.on-tertiary-container
period-selector.unselected.label-text.color → sys.color.on-surface-variant
period-selector.selected.{hover,focus,pressed}.label-text.color → sys.color.on-tertiary-container
period-selector.unselected.{hover,focus,pressed}.label-text.color → sys.color.on-surface-variant
period-selector.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-tertiary-container
period-selector.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
period-selector.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
clock-dial.color → sys.color.surface-container-highest
clock-dial.shape → sys.shape.corner.full
clock-dial.container.size → 256dp
clock-dial.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.body-large.*
clock-dial.selected.label-text.color → sys.color.on-primary
clock-dial.unselected.label-text.color → sys.color.on-surface
clock-dial.selector.handle.container.color → sys.color.primary
clock-dial.selector.handle.container.shape → sys.shape.corner.full
clock-dial.selector.handle.container.size → 48dp
clock-dial.selector.center.container.color → sys.color.primary
clock-dial.selector.center.container.shape → sys.shape.corner.full
clock-dial.selector.center.container.size → 8dp
clock-dial.selector.track.container.color → sys.color.primary
clock-dial.selector.track.container.width → 2dp
```

**`md.comp.time-input` (input)**
```
container.color → sys.color.surface-container-high
container.elevation → sys.elevation.level3
container.shape → sys.shape.corner.extra-large (28dp)
headline.color → sys.color.on-surface-variant
headline.{font,line-height,size,weight,tracking,type} → sys.typescale.label-medium.*
focus.indicator.color → sys.color.secondary
focus.indicator.thickness → sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → sys.state.focus-indicator.outer-offset (2dp)
time-input-field.container.color → sys.color.surface-container-highest
time-input-field.container.shape → sys.shape.corner.small (8dp)
time-input-field.container.width → 96dp
time-input-field.container.height → 72dp
time-input-field.label-text.color → sys.color.on-surface
time-input-field.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.display-medium.*
time-input-field.hover.label-text.color → sys.color.on-surface
time-input-field.hover.state-layer.color → sys.color.on-surface
time-input-field.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
time-input-field.focus.container.color → sys.color.primary-container
time-input-field.focus.outline.color → sys.color.primary
time-input-field.focus.outline.width → 2dp
time-input-field.focus.label-text.color → sys.color.on-primary-container
time-input-field.separator.color → sys.color.on-surface
time-input-field.separator.{font,line-height,size,weight,tracking,type} → sys.typescale.display-large.*
time-input-field.supporting-text.color → sys.color.on-surface-variant
time-input-field.supporting-text.{font,line-height,size,weight,tracking,type} → sys.typescale.body-small.*
period-selector.container.shape → sys.shape.corner.small (8dp)
period-selector.container.width → 52dp
period-selector.container.height → 72dp
period-selector.outline.color → sys.color.outline
period-selector.outline.width → 1dp
period-selector.selected.container.color → sys.color.tertiary-container
period-selector.label-text.{font,line-height,size,weight,tracking,type} → sys.typescale.title-medium.*
period-selector.selected.label-text.color → sys.color.on-tertiary-container
period-selector.unselected.label-text.color → sys.color.on-surface-variant
period-selector.selected.{hover,focus,pressed}.label-text.color → sys.color.on-tertiary-container
period-selector.unselected.{hover,focus,pressed}.label-text.color → sys.color.on-surface-variant
period-selector.selected.{hover,focus,pressed}.state-layer.color → sys.color.on-tertiary-container
period-selector.unselected.{hover,focus,pressed}.state-layer.color → sys.color.on-surface-variant
period-selector.{hover,focus,pressed}.state-layer.opacity → sys.state.*.state-layer-opacity (0.08/0.1/0.1)
```
CSS: `md.comp.time-picker.clock-dial.color` → `--md-comp-time-picker-clock-dial-color`, etc.

## 5. States & interaction

| Part | Enabled | Hover | Focus (keyboard) | Pressed | Selected |
|---|---|---|---|---|---|
| Time selector box (dial) | surface-container-highest / on-surface | + on-surface 0.08 | + 0.10 layer + focus ring (8dp + offset) | + 0.10 + ripple | primary-container / on-primary-container; layers on-primary-container |
| Period segment | transparent / on-surface-variant | + 0.08 | + 0.10 + focus ring (inner offset; clipped by outline) | + 0.10 + ripple | tertiary-container / on-tertiary-container; layers on-tertiary-container |
| Dial value | on-surface label | (derived) on-surface 0.08 circle 48dp | focus ring around the 48dp circle | handle jumps to value | handle under value, on-primary label |
| Input field | surface-container-highest / on-surface | + on-surface 0.08 | primary-container fill, 2dp primary outline, on-primary-container digits (any focus, not only keyboard) | — | — |
| Out-of-range value (derived, min/max) | on-surface @ 0.38, not selectable | none | focusable via arrows, not selectable | none | — |

- **Time selector (dial)**: hour and minute boxes choose which unit the dial edits; exactly one is selected. Selecting hour on the dial (pointer up) auto-advances to minutes (derived, platform behavior).
- **Dial**: tap a number or drag the handle/track; the handle snaps to hours (30° steps) and to minutes (6° steps, labels every 5). Moving the dial updates the corresponding time selector simultaneously; changes made in the input variant carry back to the dial.
- **Period selector**: radio behaviour; changing period keeps the hour digits (07 AM → 07 PM).
- **Focus ring**: `focus ring primitive` for boxes, segments, dial values, buttons (input-variant tokens confirm 3dp / 2dp / secondary). Input fields show their tokenized 2dp outline instead.

## 6. Motion & behavior
- **Enter/exit**: dialog enter/exit transition pattern (see ../dialogs.md); no durations on this page.
- **Dismiss**: **OK** confirms and closes; **Cancel** dismisses; clicking outside (scrim) dismisses (= Cancel). Otherwise retains focus.
- **Dial ↔ input toggle** (keyboard icon lower-start / clock icon): swap contents with a fade-through on `spring primitive` fast effects; container size animates on default spatial (standard scheme override, no overshoot — derived).
- **Handle**: animates angle to a tapped value along the shortest arc (fast spatial; derived); follows the pointer 1:1 while dragging (no animation); ring change (outer ↔ inner in 24h) animates radius on fast spatial.
- **Hours ↔ minutes switch**: labels crossfade (fast effects) and handle animates to the new value's angle.
- **Reduced motion**: no handle rotation animation (jump), crossfades only (short).
- **Adaptive**: switch vertical ↔ horizontal on larger breakpoints or limited viewport height; fall back to the input variant when the horizontal dial can't fit without scrolling; never apply density to the dial; never crop at the screen edge; the picker never scrolls and doesn't scroll with the background. Decision thresholds (derived): vertical dial needs ≈ 560px viewport height; horizontal ≈ 400px height and 600px width; otherwise input variant.

## 7. Usage guidelines
- Display in a modal dialog above a scrim; never obscure it with other elements.
- Hours and minutes are **separate inputs**. 12h clock: AM/PM selector to the right of minutes. 24h clock: no AM/PM.
- 24h vs 12h comes from outside the component (system/locale), not a user control within the picker.
- Input selector differs from regular text fields: highlight on the selected field, larger shape/size/font, label (supporting text) **below** the field.
- Dial always mimics a round watch face.
- The input picker should be reachable from any dial picker via the keyboard icon. If time selection doesn't need a dial, make the input picker the default.
- Text buttons: **Cancel** (exit) and **OK** (save).

## 8. Accessibility
- Always allow manual text entry; input picker reachable from the dial with the keyboard icon. If the screen can't fit the dial, show the input selector alone.
- Dial targets 48×48dp.
- Screen readers announce role first, then the text. Dial values announce as "{Value} hours/minutes of {Total}" (e.g. "Hour 7 of 12").

| Element | Accessible label | Role (source) | Web mapping |
|---|---|---|---|
| Hour input | "Hour" | Text input | `<input type="text" inputmode="numeric" maxlength="2">` (label = supporting text via `<label>`) |
| Minute input | "Minute" | Text input | same |
| AM/PM selection | "AM" / "PM" | Radio button (in list) | `role="radiogroup"` ("Period") with native `<input type="radio">` ×2 |
| Keyboard button | "Toggle input picker" | Button | `button` |
| Clock button | "Toggle dial picker" | Button | `button` |
| Cancel / OK | "Cancel" / "OK" | Button | `button` |
| Dial time selection | "{Value} hours/minutes of {Total}" | Button | dial = `role="listbox"` ("Select hours"/"Select minutes"), each value `role="option"` with `aria-label="7 hours"`, `aria-posinset`/`aria-setsize` (gives "7 of 12"), `aria-selected` (web mapping) |
| Hour/minute time selector boxes (dial) | "Hour, 07" / "Minute, 30" | — | `role="radiogroup"` of two `button role="radio"` with `aria-checked` (web mapping) |
| Container | headline | — | `<dialog>` with `aria-labelledby` headline |

**Keyboard**

| Key | Action |
|---|---|
| Tab / Shift+Tab | Focus moves through controls; dial is one tab stop landing on the selected value (source: "focus lands on time slot") |
| Space / Enter | Activates the focused (non-disabled) time slot / control |
| Arrow keys (dial) | Move focus to the next/previous value clockwise/counter-clockwise (Right/Down = clockwise) (web mapping) |
| Arrow Up/Down (time selector box) | Increment/decrement the unit by 1 with wrap (web mapping) |
| Digits (time selector box / input field) | Type value; input field auto-advances hour → minute after 2 digits (derived) |
| Escape | Cancel and close (native `<dialog>` `cancel`) |

- Focus: on open focus the hour selector (dial) / hour field (input); trap focus (native modal dialog); on close return focus to the trigger. Toggle dial ↔ input moves focus to the hour control of the new view.

## 9. Implementation checklist
- [ ] Props: `value` (`HH:mm`, 24h canonical), `variant` (`dial` | `input`), `orientation` (`vertical` | `horizontal` | `auto`), `hourCycle` (`h12` | `h23`, default from `Intl.DateTimeFormat().resolvedOptions().hourCycle`), `headline` ("Select time" / "Enter time"), `minuteStep`, `min`/`max`, `open`, `confirmLabel`, `cancelLabel`, `name`, `required`.
- [ ] Events: `change` (on OK), `input` (live), `cancel`, `close`, `variant-change`.
- [ ] Pending vs committed value; commit only on OK.
- [ ] Dial geometry per §4.2 (r 101 / 69, 30° steps, handle 48, track 2, center 8).
- [ ] Pointer: tap and drag with pointer capture, angle → value, ring by distance (24h: d < 85 → inner, derived midpoint), respect `minuteStep`.
- [ ] Two-way sync between boxes / input fields and dial.
- [ ] Period selector vertical (52×80/72) or horizontal (216×38); hidden for 24h.
- [ ] Input fields: numeric, 2-digit, validate/clamp, auto-advance, error state.
- [ ] Auto orientation/variant from viewport; no scrolling, no density.
- [ ] Locale-aware AM/PM labels (`Intl.DateTimeFormat(locale,{hour:'numeric',hour12:true}).formatToParts` → `dayPeriod`) and digits.
- [ ] Forced colors, reduced motion, form participation.

## 10. HTML/CSS implementation blueprint

### (a) DOM skeleton
```html
<dialog class="md-time-picker" data-variant="dial" data-orientation="vertical" aria-labelledby="tp-h">
  <form method="dialog" class="tp-form">
    <h2 id="tp-h" part="headline" class="tp-headline">Select time</h2>

    <div class="tp-display">                                   <!-- time row; dir=ltr keeps hh:mm order -->
      <div class="tp-time" role="radiogroup" aria-label="Edit hour or minute" dir="ltr">
        <button type="button" role="radio" aria-checked="true"  class="tp-box" aria-label="Hour, 07">07</button>
        <span class="tp-sep" aria-hidden="true">:</span>
        <button type="button" role="radio" aria-checked="false" class="tp-box" aria-label="Minute, 30">30</button>
      </div>
      <fieldset class="tp-period" role="radiogroup" aria-label="Period">  <!-- 12h only -->
        <label><input type="radio" name="period" value="am" checked><span>AM</span></label>
        <label><input type="radio" name="period" value="pm"><span>PM</span></label>
      </fieldset>
    </div>

    <div class="tp-dial" part="dial" style="--tp-angle: 210deg; --tp-r: 101px">  <!-- 256px -->
      <div class="tp-track" aria-hidden="true"></div>
      <div class="tp-handle" aria-hidden="true"></div>
      <div class="tp-center" aria-hidden="true"></div>
      <div role="listbox" aria-label="Select hours" class="tp-values">
        <!-- one per value; --i = position 0..11, --r = ring radius -->
        <div role="option" id="h7" class="tp-value" style="--i:7" aria-label="7 hours"
             aria-posinset="7" aria-setsize="12" aria-selected="true" tabindex="0">7</div> …
      </div>
      <div class="tp-values tp-values--on-handle" aria-hidden="true"> …same labels… </div>
    </div>

    <!-- input variant replaces .tp-display + .tp-dial with: -->
    <!-- <div class="tp-inputs" dir="ltr">
           <label class="tp-field"><input inputmode="numeric" maxlength="2" value="07" aria-describedby="tp-err"><span>Hour</span></label>
           <span class="tp-sep" aria-hidden="true">:</span>
           <label class="tp-field"><input inputmode="numeric" maxlength="2" value="30"><span>Minute</span></label>
         </div> + .tp-period -->

    <div class="tp-actions">
      <button type="button" class="md-icon-button tp-toggle" aria-label="Toggle input picker">⌨</button>
      <span class="tp-spacer"></span>
      <button value="cancel" class="md-text-button">Cancel</button>
      <button value="ok" class="md-text-button">OK</button>
    </div>
  </form>
</dialog>
<input type="hidden" name="time" value="07:30">   <!-- form value, or ElementInternals -->
```

### (b) Custom properties
```css
.md-time-picker {
  --md-comp-time-picker-container-color: var(--md-sys-color-surface-container-high);
  --md-comp-time-picker-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-time-picker-container-shape: var(--md-sys-shape-corner-extra-large);
  --md-comp-time-picker-headline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-time-picker-time-selector-container-width: 96px;
  --md-comp-time-picker-time-selector-container-height: 80px;
  --md-comp-time-picker-time-selector-container-shape: var(--md-sys-shape-corner-small);
  --md-comp-time-picker-time-selector-selected-container-color: var(--md-sys-color-primary-container);
  --md-comp-time-picker-time-selector-selected-label-text-color: var(--md-sys-color-on-primary-container);
  --md-comp-time-picker-time-selector-unselected-container-color: var(--md-sys-color-surface-container-highest);
  --md-comp-time-picker-time-selector-unselected-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-time-picker-time-selector-separator-color: var(--md-sys-color-on-surface);
  --md-comp-time-picker-period-selector-width: 52px;
  --md-comp-time-picker-period-selector-height: 80px;
  --md-comp-time-picker-period-selector-shape: var(--md-sys-shape-corner-small);
  --md-comp-time-picker-period-selector-outline-color: var(--md-sys-color-outline);
  --md-comp-time-picker-period-selector-outline-width: 1px;
  --md-comp-time-picker-period-selector-selected-container-color: var(--md-sys-color-tertiary-container);
  --md-comp-time-picker-period-selector-selected-label-text-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-time-picker-period-selector-unselected-label-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-time-picker-clock-dial-color: var(--md-sys-color-surface-container-highest);
  --md-comp-time-picker-clock-dial-container-size: 256px;
  --md-comp-time-picker-clock-dial-selected-label-text-color: var(--md-sys-color-on-primary);
  --md-comp-time-picker-clock-dial-unselected-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-time-picker-clock-dial-selector-handle-container-color: var(--md-sys-color-primary);
  --md-comp-time-picker-clock-dial-selector-handle-container-size: 48px;
  --md-comp-time-picker-clock-dial-selector-center-container-size: 8px;
  --md-comp-time-picker-clock-dial-selector-track-container-width: 2px;
  /* input variant */
  --md-comp-time-input-time-input-field-container-color: var(--md-sys-color-surface-container-highest);
  --md-comp-time-input-time-input-field-container-width: 96px;
  --md-comp-time-input-time-input-field-container-height: 72px;
  --md-comp-time-input-time-input-field-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-time-input-time-input-field-focus-container-color: var(--md-sys-color-primary-container);
  --md-comp-time-input-time-input-field-focus-outline-color: var(--md-sys-color-primary);
  --md-comp-time-input-time-input-field-focus-outline-width: 2px;
  --md-comp-time-input-time-input-field-focus-label-text-color: var(--md-sys-color-on-primary-container);
  --md-comp-time-input-time-input-field-supporting-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-time-input-focus-indicator-color: var(--md-sys-color-secondary);

  background: var(--md-comp-time-picker-container-color);
  border-radius: var(--md-comp-time-picker-container-shape);
  box-shadow: var(--md-comp-time-picker-container-elevation);   /* elevation primitive */
  padding: 24px; border: 0; inline-size: max-content; max-inline-size: calc(100vw - 32px);
  overflow: visible;
}
.md-time-picker[data-variant="input"] { --md-comp-time-picker-period-selector-height: 72px; }
.md-time-picker[data-hour-cycle="h23"] { --md-comp-time-picker-time-selector-container-width: 114px; } /* 24h vertical */
.md-time-picker[data-hour-cycle="h23"][data-orientation="horizontal"] { --md-comp-time-picker-time-selector-container-width: 96px; }

.tp-form { display: grid; grid-template-areas: "head" "display" "dial" "actions"; justify-items: start; }
.tp-headline { grid-area: head; margin: 0 0 20px; color: var(--md-comp-time-picker-headline-color);
  font: var(--md-sys-typescale-label-medium-weight) var(--md-sys-typescale-label-medium-size)/var(--md-sys-typescale-label-medium-line-height) var(--md-sys-typescale-label-medium-font);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking); }
.tp-display { grid-area: display; display: flex; gap: 12px; align-items: stretch; }
.tp-time { display: flex; align-items: center; }
.tp-box { position: relative; inline-size: var(--md-comp-time-picker-time-selector-container-width);
  block-size: var(--md-comp-time-picker-time-selector-container-height); border: 0;
  border-radius: var(--md-comp-time-picker-time-selector-container-shape);
  background: var(--md-comp-time-picker-time-selector-unselected-container-color);
  color: var(--md-comp-time-picker-time-selector-unselected-label-text-color);
  font: var(--md-sys-typescale-display-large-weight) var(--md-sys-typescale-display-large-size)/var(--md-sys-typescale-display-large-line-height) var(--md-sys-typescale-display-large-font);
  letter-spacing: var(--md-sys-typescale-display-large-tracking); font-variant-numeric: tabular-nums;
  --_sl: var(--md-sys-color-on-surface); }                     /* state layer + ripple primitives */
.tp-sep { inline-size: 24px; text-align: center; color: var(--md-comp-time-picker-time-selector-separator-color);
  font: var(--md-sys-typescale-display-large-weight) var(--md-sys-typescale-display-large-size)/var(--md-sys-typescale-display-large-line-height) var(--md-sys-typescale-display-large-font); }
.tp-period { display: flex; flex-direction: column; margin: 0; padding: 0;
  inline-size: var(--md-comp-time-picker-period-selector-width); block-size: var(--md-comp-time-picker-period-selector-height);
  border: var(--md-comp-time-picker-period-selector-outline-width) solid var(--md-comp-time-picker-period-selector-outline-color);
  border-radius: var(--md-comp-time-picker-period-selector-shape); overflow: hidden; }
.tp-period label { position: relative; flex: 1; display: grid; place-items: center; cursor: pointer;
  color: var(--md-comp-time-picker-period-selector-unselected-label-text-color); --_sl: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-title-medium-weight) var(--md-sys-typescale-title-medium-size)/var(--md-sys-typescale-title-medium-line-height) var(--md-sys-typescale-title-medium-font);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking); }
.tp-period label + label { border-block-start: var(--md-comp-time-picker-period-selector-outline-width) solid var(--md-comp-time-picker-period-selector-outline-color); }
.tp-period input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: inherit; }
[data-orientation="horizontal"] .tp-period { flex-direction: row; inline-size: 216px; block-size: 38px; }
[data-orientation="horizontal"] .tp-period label + label { border-block-start: 0;
  border-inline-start: var(--md-comp-time-picker-period-selector-outline-width) solid var(--md-comp-time-picker-period-selector-outline-color); }
[data-orientation="horizontal"] .tp-form { grid-template-areas: "head head" "display dial" "actions actions"; column-gap: 52px; }
[data-orientation="horizontal"] .tp-display { flex-direction: column; }

/* dial */
.tp-dial { grid-area: dial; justify-self: center; margin-block: 36px 24px; position: relative;
  inline-size: var(--md-comp-time-picker-clock-dial-container-size); aspect-ratio: 1;
  border-radius: var(--md-sys-shape-corner-full); background: var(--md-comp-time-picker-clock-dial-color);
  touch-action: none; user-select: none; }
.tp-value { position: absolute; inset-block-start: 50%; inset-inline-start: 50%; inline-size: 48px; block-size: 48px;
  margin: -24px; display: grid; place-items: center; border-radius: 50%;
  translate: calc(sin(var(--i) * 30deg) * var(--r, 101px)) calc(cos(var(--i) * 30deg) * var(--r, 101px) * -1);
  color: var(--md-comp-time-picker-clock-dial-unselected-label-text-color);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.tp-value[data-inner] { --r: 69px; }
.tp-dial { direction: ltr; }   /* the clock face never mirrors; "12"/"00" uses --i:0 */
.tp-handle, .tp-track, .tp-center { position: absolute; inset-block-start: 50%; inset-inline-start: 50%; pointer-events: none; }
.tp-track { inline-size: var(--md-comp-time-picker-clock-dial-selector-track-container-width); block-size: var(--tp-r);
  margin-inline-start: calc(var(--md-comp-time-picker-clock-dial-selector-track-container-width) / -2); translate: 0 -100%;
  transform-origin: bottom center; rotate: var(--tp-angle); background: var(--md-comp-time-picker-clock-dial-selector-handle-container-color); }
.tp-handle { inline-size: var(--md-comp-time-picker-clock-dial-selector-handle-container-size); aspect-ratio: 1; margin: -24px;
  border-radius: 50%; background: var(--md-comp-time-picker-clock-dial-selector-handle-container-color);
  translate: calc(sin(var(--tp-angle)) * var(--tp-r)) calc(cos(var(--tp-angle)) * var(--tp-r) * -1); }
.tp-handle[data-between]::after { content: ""; position: absolute; inset: 22px; border-radius: 50%;
  background: var(--md-comp-time-picker-clock-dial-selected-label-text-color); }  /* 4px dot for off-label minutes */
.tp-center { inline-size: var(--md-comp-time-picker-clock-dial-selector-center-container-size); aspect-ratio: 1; margin: -4px;
  border-radius: 50%; background: var(--md-comp-time-picker-clock-dial-selector-handle-container-color); }
.tp-values--on-handle { position: absolute; inset: 0; pointer-events: none;
  clip-path: circle(24px at calc(50% + sin(var(--tp-angle)) * var(--tp-r)) calc(50% - cos(var(--tp-angle)) * var(--tp-r))); }
.tp-values--on-handle .tp-value { color: var(--md-comp-time-picker-clock-dial-selected-label-text-color); }

/* input variant */
.tp-field { display: grid; gap: 7px; color: var(--md-comp-time-input-time-input-field-supporting-text-color);
  font: var(--md-sys-typescale-body-small-weight) var(--md-sys-typescale-body-small-size)/var(--md-sys-typescale-body-small-line-height) var(--md-sys-typescale-body-small-font);
  letter-spacing: var(--md-sys-typescale-body-small-tracking); }
.tp-field input { inline-size: var(--md-comp-time-input-time-input-field-container-width);
  block-size: var(--md-comp-time-input-time-input-field-container-height); box-sizing: border-box; text-align: center;
  border: var(--md-comp-time-input-time-input-field-focus-outline-width) solid transparent;
  border-radius: var(--md-sys-shape-corner-small); background: var(--md-comp-time-input-time-input-field-container-color);
  color: var(--md-comp-time-input-time-input-field-label-text-color); caret-color: var(--md-sys-color-primary);
  font: var(--md-sys-typescale-display-medium-weight) var(--md-sys-typescale-display-medium-size)/var(--md-sys-typescale-display-medium-line-height) var(--md-sys-typescale-display-medium-font);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking); font-variant-numeric: tabular-nums; outline: none; }
```

### (c) State selectors
```css
.tp-box[aria-checked="true"] { background: var(--md-comp-time-picker-time-selector-selected-container-color);
  color: var(--md-comp-time-picker-time-selector-selected-label-text-color); --_sl: var(--md-sys-color-on-primary-container); }
.tp-period label:has(:checked) { background: var(--md-comp-time-picker-period-selector-selected-container-color);
  color: var(--md-comp-time-picker-period-selector-selected-label-text-color); --_sl: var(--md-sys-color-on-tertiary-container); }
/* state layer primitive on .tp-box::before, .tp-period label::before, .tp-value::before (circle) */
@media (hover: hover) {
  :is(.tp-box, .tp-period label, .tp-value):hover::before { opacity: var(--md-sys-state-hover-state-layer-opacity); }
  .tp-field input:hover:not(:focus) { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, var(--md-comp-time-input-time-input-field-container-color)); }
}
:is(.tp-box, .tp-value):focus-visible::before, .tp-period label:has(:focus-visible)::before { opacity: var(--md-sys-state-focus-state-layer-opacity); }
:is(.tp-box, .tp-period label, .tp-value):active::before { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
:is(.tp-box, .tp-value):focus-visible {          /* focus ring primitive */
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-time-input-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
.tp-period label:has(:focus-visible) { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-time-input-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset); }
.tp-value[aria-selected="true"] { color: var(--md-comp-time-picker-clock-dial-selected-label-text-color); }
.tp-value[aria-disabled="true"] { color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
.tp-field input:focus { background: var(--md-comp-time-input-time-input-field-focus-container-color);
  border-color: var(--md-comp-time-input-time-input-field-focus-outline-color);
  color: var(--md-comp-time-input-time-input-field-focus-label-text-color); }
.tp-field input[aria-invalid="true"] { border-color: var(--md-sys-color-error); }
.tp-field:has([aria-invalid="true"]) { color: var(--md-sys-color-error); }
```

### (d) Motion
```css
.tp-handle, .tp-track { transition: translate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  rotate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  block-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
.tp-dial[data-dragging] :is(.tp-handle, .tp-track) { transition: none; }   /* follow the pointer */
@property --tp-angle { syntax: "<angle>"; inherits: true; initial-value: 0deg; }   /* lets the clip-path follow */
@property --tp-r { syntax: "<length>"; inherits: true; initial-value: 101px; }
.tp-dial { transition: --tp-angle var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  --tp-r var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
.tp-values { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.tp-box, .tp-period label, .tp-field input { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) {
  .tp-dial, .tp-handle, .tp-track { transition: none; }
}
```
JS sets `--tp-angle` to the unwrapped angle (previous + shortest delta) so the transition takes the short arc. Dialog enter/exit: reuse ../dialogs.md.

### (e) Forced colors
```css
@media (forced-colors: active) {
  .md-time-picker { border: 1px solid CanvasText; }
  .tp-box, .tp-field input { border: 1px solid CanvasText; }
  .tp-box[aria-checked="true"], .tp-period label:has(:checked) { forced-color-adjust: none; background: Highlight; color: HighlightText; }
  .tp-dial { forced-color-adjust: none; background: Canvas; border: 1px solid CanvasText; }
  .tp-value { color: CanvasText; }
  .tp-handle, .tp-track, .tp-center { background: Highlight; }
  .tp-values--on-handle .tp-value { color: HighlightText; }
  .tp-field input:focus { border-color: Highlight; }
}
```

### (f) Behaviour / JS responsibilities
- State: `{hour24, minute, unit: 'hour'|'minute', variant, orientation}`; derive 12h display + period from `hour24`.
- Dial pointer: on `pointerdown` set capture + `data-dragging`; angle = `atan2(x − cx, cy − y)` (0 at top, clockwise, normalize 0–360); hour = round(angle/30) % 12 (24h: distance from center < 85px → inner ring); minute = round(angle/6) % 60 (snap to `minuteStep`). Update `--tp-angle`/`--tp-r`, the handle's `data-between`, the box text and `aria-selected`. On `pointerup` in hour mode → switch unit to minute (auto-advance, derived).
- Dial keyboard: listbox with roving tabindex; arrows move focus around the ring (wrap; 24h: Up/Down switches ring — derived); Enter/Space selects the focused value (source). Live update `aria-label` of the time selector boxes.
- Time selector boxes: click/Enter/Space select the unit (re-renders dial labels with crossfade); ArrowUp/Down ±1 with wrap; digits typed set the value (derived).
- Input fields: accept digits only (`beforeinput` filter, no masking of separators needed); after 2 digits in hour → focus minute; on blur clamp/validate (hour 1–12 or 0–23, minute 0–59); invalid → `aria-invalid="true"` and error supporting text; OK disabled while invalid.
- Variant toggle: preserve pending value; move focus to the new view's hour control; auto-select variant/orientation from `matchMedia` (§6) and `resize`.
- Dialog: `showModal()`; scrim click closes as cancel (`click` on the `<dialog>` element outside the form box); `close` with `returnValue === 'ok'` commits and fires `change`; restore focus to the trigger.
- Form: hidden `<input name>` with `HH:mm`, or form-associated custom element (`ElementInternals.setFormValue`, `setValidity` for required/min/max).

## 11. Source gaps & decisions
- **24h ring layout conflict**: guidance text says "even numbers inner, odd outer"; the image caption says "hours 0–11 outer, 12–23 inner". Decision: outer 00–11, inner 12–23 (caption; matches all M3 platform implementations).
- **Dial label radii (101/69dp), off-label minute dot, two-tone label under handle**: not in source; taken from the Compose implementation, consistent with 256/48 tokens.
- **Spacing between elements** (20/36/24/12/24 sep/52 horizontal gap, 7dp supporting text gap): diagram-only; derived from Compose. Horizontal period width 216 = 96 + 24 + 96 confirms the 24dp separator.
- **Hour → minute auto-advance**: not in source; adopted (platform behavior), only on pointer selection.
- **Dial role**: source says each dial value is a "Button"; web uses a listbox of options (single tab stop, arrow navigation, posinset gives "7 of 12"). AM/PM uses native radios (source: radio button).
- **Disabled / min-max**: no disabled tokens; out-of-range values use on-surface @ 0.38 and are not selectable.
- **Input field error**: not tokenized; uses `error` for outline and supporting text (text-field convention).
- **Focus indicator tokens** exist only on `time-input`; applied to both variants (same sys values).
- **Unselected period container**: not tokenized → transparent.
- **Motion**: none specified beyond "dialog enter/exit"; spring primitive fast spatial for handle, fast effects for colors/crossfades, standard scheme for container size.
- **RTL**: clock face and hh:mm order are not mirrored (`dir="ltr"` on time row and dial); headline/actions/period placement follow document direction (derived).
- **Viewport thresholds** for orientation/variant switching are not given; proposed 560px height (vertical dial) / 400px (horizontal) / else input.
