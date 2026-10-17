# Radio button

> Source: https://m3.material.io/components/radio-button · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Radio buttons let people make a **single selection** from a set of options; only one can be selected at a time.

- Use to: select a single option from a set; expose all available options at once.
- Use radio buttons (not switches) when only one item can be selected; use checkboxes for multi-select.
- Use when there are **five or fewer** options; with more, or when space is constrained, consider a dropdown menu (costs extra clicks and cognitive effort).
- Don't nest radio buttons; never allow multiple selected.
- Labels should be scannable; selected items are more prominent.
- **M3 Expressive changes:** none specified in the source. What's new vs M2: new color mappings, dynamic color.

## 2. Variants & configurations

| Configuration | Description | Notes |
| --- | --- | --- |
| Unselected | 20px ring, `on-surface-variant` | |
| Selected | 20px ring + inner dot, `primary` | |
| Disabled (selected / unselected) | `on-surface` @ 0.38 | |
| Error (derived) | ring + dot `error` | No error tokens in source; see §11 |
| Radio group | Mutually exclusive radios sharing a `name`, with a group title | Vertical stack preferred; horizontal = caution |

Single size only.

## 3. Anatomy
1. **Icon** (20×20px) — outer ring (2px stroke, derived); selected adds a centered filled dot (10px, derived).
2. **Adjacent label text** — required, `on-surface`, clickable.
3. **State layer** — 40px circle (state layer primitive + ripple primitive).
4. **Focus indicator** — focus ring primitive around the 40px circle (not tokenized for radio; same values as checkbox: 3px `secondary`, 2px outer offset).
5. **Touch target** — 48×48px (the native input itself).

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token (`md.comp.radio-button.…`) | System role |
| --- | --- | --- | --- |
| Icon (ring) | unselected enabled | `unselected.icon.color` | `on-surface-variant` |
| Icon (ring) | unselected hover / focus / pressed | `unselected.{hover,focus,pressed}.icon.color` | `on-surface` |
| Icon (ring + dot) | selected (enabled/hover/focus/pressed) | `selected[.state].icon.color` | `primary` |
| Icon | disabled selected / unselected | `disabled.{selected,unselected}.icon.{color,opacity}` | `on-surface` @ 0.38 |
| State layer | unselected hover / focus / pressed | `unselected.{hover,focus,pressed}.state-layer.*` | `on-surface` 0.08 / `on-surface` 0.10 / **`primary`** 0.10 |
| State layer | selected hover / focus / pressed | `selected.{hover,focus,pressed}.state-layer.*` | `primary` 0.08 / `primary` 0.10 / **`on-surface`** 0.10 |
| Focus ring | focus-visible | — (web mapping) | `secondary` |
| Icon / state layer | error (derived) | — | `error` (state layer `error` @ 0.08/0.10/0.10) |
| Adjacent label | all | — | `on-surface` (never changes) |

Pressed state-layer color previews the target state (unselected→`primary`, selected→`on-surface`).

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Icon size | 20×20px |
| Outer ring stroke | 2px (derived: matches checkbox outline; Android/web reference implementations) |
| Inner dot diameter | 10px (derived: web reference implementation; Compose uses 12dp) |
| State-layer size / shape | 40px circle (`--md-sys-shape-corner-full`, derived: shape not tokenized) |
| Target size | 48×48px |
| Label gap | none beyond the 48px target (derived); row min-height 48px |
| Group layout | vertical stack, 0 gap between 48px rows (derived) |

### 4.3 Typography
No internal text. Adjacent label typography not specified (derived: `body-large`; list typography when inside lists), color `on-surface`. Group title: derived `title-small` / `<legend>`.

### 4.4 Elevation
None.

### 4.5 Component token list (`md.comp.radio-button` → `--md-comp-radio-button-*`)
Single token set in source; complete.
```
icon.size → 20px
state-layer.size → 40px
unselected.icon.color → sys.color.on-surface-variant
unselected.hover.icon.color → sys.color.on-surface
unselected.focus.icon.color → sys.color.on-surface
unselected.pressed.icon.color → sys.color.on-surface
selected.icon.color → sys.color.primary
selected.hover.icon.color → sys.color.primary
selected.focus.icon.color → sys.color.primary
selected.pressed.icon.color → sys.color.primary
disabled.unselected.icon.color → sys.color.on-surface
disabled.unselected.icon.opacity → 0.38
disabled.selected.icon.color → sys.color.on-surface
disabled.selected.icon.opacity → 0.38
unselected.hover.state-layer.color → sys.color.on-surface
unselected.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
unselected.focus.state-layer.color → sys.color.on-surface
unselected.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.10)
unselected.pressed.state-layer.color → sys.color.primary
unselected.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.10)
selected.hover.state-layer.color → sys.color.primary
selected.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
selected.focus.state-layer.color → sys.color.primary
selected.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.10)
selected.pressed.state-layer.color → sys.color.on-surface
selected.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.10)
```
Not in source (derived for web): `state-layer.shape` (full), `focus.indicator.*` (system focus ring values), error colors.

## 5. States & interaction

| State \ part | Ring (unselected) | Ring + dot (selected) | State layer | Focus ring |
| --- | --- | --- | --- | --- |
| Enabled | `on-surface-variant` | `primary` | none | — |
| Hover | `on-surface` | `primary` | 0.08 `on-surface` / `primary` | — |
| Focus-visible | `on-surface` | `primary` | 0.10 `on-surface` / `primary` | 3px `secondary` |
| Pressed | `on-surface` | `primary` | 0.10 `primary` / `on-surface` + ripple | — |
| Error (derived) | `error` | `error` | `error` | `secondary` |
| Disabled | `on-surface` @ 0.38 | `on-surface` @ 0.38 | none | — |

- Selection via the icon **or** the label. Selecting one deselects all others with the same `name`.
- Re-activating a selected radio does nothing; the user can't clear the group (provide "None"/"Not applicable" or a "Clear selection" action).
- Group may start with one or none selected; guidelines prefer one pre-selected.
- Disabled + error: disabled wins (derived).

## 6. Motion & behavior
- Selection takes effect immediately, unless inside a dialog/page that needs saving.
- Select/deselect transition: not in source (derived):
  - Dot **in**: `transform: scale(0→1)` with spring primitive fast spatial (`--md-sys-motion-spring-fast-spatial-easing`/`-duration`; slight overshoot in expressive scheme).
  - Dot **out** (radio losing selection): scale 1→0 with fast effects (no overshoot).
  - Ring color: fast effects.
  - Reduced motion: no scale; color/opacity change ≤50ms (`--md-sys-motion-duration-short1`).
- Density: opt-in only, never by default; density toggle targets ≥48×48. Dense option (derived): target 40px.
- RTL: no mirroring of the icon; native arrow keys already follow visual order.
- Adaptive behaviour: not specified (follow list/side-sheet grouping as for checkbox).

## 7. Usage guidelines
- Always pair each radio with its own adjacent label describing the choice.
- Stack radio buttons vertically; avoid horizontal lists (caution).
- One option should be **pre-selected** (guidelines); accessibility tab allows none — support both, default to pre-selected.
- To allow opting out, add a "Not applicable"/"None" option or a separate "Clear selection" action.
- ≤5 options; otherwise consider a dropdown.
- Don't nest radio groups; don't allow multi-select.

## 8. Accessibility
| Aspect | Web mapping |
| --- | --- |
| Group | `<fieldset>` + `<legend>` (group title) or `role="radiogroup"` + `aria-labelledby` |
| Item | native `<input type="radio">` with shared `name` (preferred) or `role="radio"` + `aria-checked` |
| Name | adjacent label text (`<label>` / `aria-labelledby`) |
| Disabled | `disabled` (whole group: `<fieldset disabled>`) |
| Required | `required` on any radio of the group (native) / `aria-required="true"` on radiogroup |
| Invalid | `aria-invalid="true"` + `aria-describedby` error text |

| Key | Action |
| --- | --- |
| Tab | Into the group: selected radio, or the **first** if none selected |
| Shift+Tab | Into the group: selected radio, or the **last** if none selected |
| Arrows | Move focus **and select** previous/next; wrap first↔last; skip disabled |
| Space | Select focused radio; if already selected, nothing |

Native radios sharing a `name` in the same tree implement all of the above (roving focus included). Only custom `role="radio"` needs JS (§10f). Screen readers read label, then "radio button, n of m"; group announced as "radio group" with its title.

## 9. Implementation checklist
**Public API (suggested)**
- [ ] Radio: `checked`, `disabled`, `required`, `name`, `value`, `error`, label (slot/children or external `<label>`).
- [ ] Optional group element: `name`, `value`, `disabled`, `required`, `label`; vertical by default.
- [ ] Events: native `input` + `change` on the newly selected radio only; none on programmatic set or re-click.

**Native form participation**
- [ ] Preferred: light-DOM `<input type="radio">` — exclusivity, `required`/`valueMissing`, submission (only checked value), reset, `<fieldset disabled>`, keyboard all native.
- [ ] Note: native grouping only works within one tree (document or a single shadow root) — don't put each radio's input in its own shadow root.
- [ ] Custom element alternative: `formAssociated` + `ElementInternals`; enforce exclusivity across same-`name` radios in the same form (or root); `setFormValue(checked ? value : null)`; group-wide `valueMissing` when required and none checked; `formResetCallback` (restore `defaultChecked`), `formDisabledCallback`, `formStateRestoreCallback`; roving `tabindex`.
- [ ] Disabled radios aren't submitted.

**Edge cases**
- [ ] Pressed state-layer color = target-state color.
- [ ] Disabled colors via color-mix (not element opacity) so the label isn't faded unintentionally.
- [ ] Forced colors and reduced motion (§10).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<fieldset class="md-radio-group">
  <legend class="md-radio-group__label">Ringtone</legend>
  <label class="md-radio-field">
    <span class="md-radio">
      <input class="md-radio__input" type="radio" name="ringtone" value="chime" checked>
      <span class="md-radio__state-layer" aria-hidden="true"></span>
      <svg class="md-radio__icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle class="md-radio__ring" cx="10" cy="10" r="9"/>   <!-- r 9 + 2px stroke = 20px outer -->
        <circle class="md-radio__dot"  cx="10" cy="10" r="5"/>
      </svg>
    </span>
    <span class="md-radio-field__label">Chime</span>
  </label>
  <!-- … -->
</fieldset>
```

**(b) Custom properties**
```css
.md-radio {
  --md-comp-radio-button-icon-size: 20px;
  --md-comp-radio-button-state-layer-size: 40px;
  --md-comp-radio-button-unselected-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-radio-button-unselected-hover-icon-color: var(--md-sys-color-on-surface);
  --md-comp-radio-button-selected-icon-color: var(--md-sys-color-primary);
  --md-comp-radio-button-disabled-unselected-icon-color: var(--md-sys-color-on-surface);
  --md-comp-radio-button-disabled-unselected-icon-opacity: 0.38;
  --md-comp-radio-button-disabled-selected-icon-color: var(--md-sys-color-on-surface);
  --md-comp-radio-button-disabled-selected-icon-opacity: 0.38;
  --_icon: var(--md-comp-radio-button-unselected-icon-color);
  --_sl: var(--md-sys-color-on-surface);
  --_sl-pressed: var(--md-sys-color-primary);
  position: relative; display: inline-grid; place-items: center; inline-size: 48px; block-size: 48px; flex: none;
}
.md-radio-group { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; }
.md-radio-field { display: inline-flex; align-items: center; min-block-size: 48px; cursor: pointer; color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.md-radio__input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; z-index: 1; }
.md-radio__state-layer { position: absolute; inline-size: var(--md-comp-radio-button-state-layer-size); aspect-ratio: 1;
  border-radius: var(--md-sys-shape-corner-full); background: var(--_sl); opacity: 0; }
.md-radio__icon { inline-size: var(--md-comp-radio-button-icon-size); block-size: var(--md-comp-radio-button-icon-size); }
.md-radio__ring { fill: none; stroke: var(--_icon); stroke-width: 2px; }
.md-radio__dot  { fill: var(--_icon); transform-origin: center; transform-box: fill-box; transform: scale(0); }
```

**(c) States**
```css
.md-radio:has(:checked) { --_icon: var(--md-comp-radio-button-selected-icon-color); --_sl: var(--md-sys-color-primary); --_sl-pressed: var(--md-sys-color-on-surface); }
.md-radio:has(:checked) .md-radio__dot { transform: scale(1); }
.md-radio:has(:not(:checked):enabled:hover, :not(:checked):focus-visible, :not(:checked):enabled:active) { --_icon: var(--md-comp-radio-button-unselected-hover-icon-color); }
.md-radio:has(:enabled:hover) .md-radio__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-radio:has(:focus-visible) .md-radio__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-radio:has(:enabled:active) .md-radio__state-layer { background: var(--_sl-pressed); opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-radio:has(:focus-visible) .md-radio__state-layer::after { content: ""; position: absolute; border-radius: inherit;
  inset: calc(-1 * var(--md-sys-state-focus-indicator-outer-offset));
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary); }
/* error (derived) */
.md-radio:has(:user-invalid, [aria-invalid="true"]) { --_icon: var(--md-sys-color-error); --_sl: var(--md-sys-color-error); --_sl-pressed: var(--md-sys-color-error); }
/* disabled */
.md-radio:has(:disabled) { --_icon: color-mix(in srgb, var(--md-comp-radio-button-disabled-unselected-icon-color) calc(var(--md-comp-radio-button-disabled-unselected-icon-opacity) * 100%), transparent); }
.md-radio:has(:disabled:checked) { --_icon: color-mix(in srgb, var(--md-comp-radio-button-disabled-selected-icon-color) calc(var(--md-comp-radio-button-disabled-selected-icon-opacity) * 100%), transparent); }
.md-radio:has(:disabled) .md-radio__state-layer { display: none; }
.md-radio-field:has(:disabled) { cursor: default; color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); /* derived */ }
```

**(d) Motion**
```css
.md-radio__ring, .md-radio__dot { transition: stroke var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  fill var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-radio__dot { transition: transform var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); } /* out */
.md-radio:has(:checked) .md-radio__dot { transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); } /* in */
.md-radio__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
@media (prefers-reduced-motion: reduce) {
  .md-radio * { transition-duration: var(--md-sys-motion-duration-short1) !important; }
  .md-radio__dot { transition-property: opacity !important; }
  .md-radio:not(:has(:checked)) .md-radio__dot { transform: scale(1); opacity: 0; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-radio { --_icon: CanvasText; }
  .md-radio:has(:checked) { --_icon: Highlight; }
  .md-radio:has(:disabled) { --_icon: GrayText; }
  .md-radio__state-layer { display: none; }
  .md-radio:has(:focus-visible) .md-radio__icon { outline: 2px solid Highlight; outline-offset: 4px; border-radius: 50%; }
}
```

**(f) Behaviour / JS**
- Native inputs: none required (exclusivity, arrows with wrap, Tab-to-checked, Space all native).
- Ripple primitive on `pointerdown`.
- Custom `role="radio"` only: roving `tabindex` (0 on checked or first/last enabled per Tab direction, −1 others); Arrow Up/Left = previous, Down/Right = next (Left/Right swapped under `dir=rtl`), wrapping, skipping disabled, moving focus **and** selecting + firing `input`/`change`; Space selects.

## 11. Source gaps & decisions
- No ring stroke / dot size → 2px ring, 10px dot (web reference); configurable via the SVG.
- No `state-layer.shape` token → full circle, consistent with checkbox/switch.
- No focus indicator tokens → system focus ring values (3px `secondary`, 2px outer offset) as in checkbox.
- No error state/tokens → `error` for ring, dot and state layer when `:user-invalid`/`aria-invalid` (mirrors checkbox error mapping).
- No motion spec → dot scales in on fast spatial spring, out on fast effects; color on fast effects.
- Guidelines say "always one pre-selected"; accessibility tab allows none → support both, recommend pre-selection.
- Disabled label color unspecified → `on-surface` @ 0.38 (derived).
- Label typography unspecified → `body-large`.
