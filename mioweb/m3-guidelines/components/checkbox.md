# Checkbox

> Source: https://m3.material.io/components/checkbox · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Checkboxes let people select one or more options from a list, or turn a single item on/off (mainly in desktop environments).

- Use when: multiple related options can be selected; presenting a list with sub-selections (parent/child); visually grouping similar options; toggling an item on/off on desktop.
- Use instead of switches for lists of multiple related options (they imply relation and take less space). Use radio buttons for single choice; switches for standalone/verbose settings.
- Labels should be scannable; selected items are more prominent than unselected.
- **M3 Expressive changes:** none specified in the source. Differences from M2: new color mappings (dynamic color), new **indeterminate** state, and **error** states for unselected, selected, and indeterminate.

## 2. Variants & configurations

| Configuration | Description | Notes |
| --- | --- | --- |
| Unselected | Empty 18px box with 2px outline | |
| Selected (checked) | Filled `primary` box with check mark | |
| Indeterminate | Filled `primary` box with dash | Parent of partially-checked children; uses `selected.*` tokens (no dedicated tokens in source) |
| Error (unselected / selected / indeterminate) | `error` replaces outline / container color; `on-error` icon | Invalid required field/group |
| Disabled (unselected / selected / indeterminate) | `on-surface` @ 0.38 | Not interactive, not focusable |
| Parent / child group | Parent checkbox controls children | See §6 |

Single size only. No density variants by default (§6).

## 3. Anatomy
1. **Container** — 18×18px box, 2px corner radius; 2px outline when unselected, solid fill (0px outline) when selected/indeterminate.
2. **Icon** — 18px check mark (selected) or dash (indeterminate), centered; `on-primary`.
3. **State layer** — 40px circle centered on the container (state layer primitive).
4. **Focus indicator** — focus ring primitive (3px `secondary`, 2px outer offset) drawn around the 40px state-layer circle (derived: Android draws around the state layer; keeps ring clear of the label).
5. **Touch target** — 48×48px (touch target primitive; here the native input itself is 48×48).
6. **Adjacent text label** (external) — `on-surface`, clickable, never changes color.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token (`md.comp.checkbox.…`) | System role |
| --- | --- | --- | --- |
| Outline (unselected) | enabled | `unselected.outline.color` | `on-surface-variant` (2px) |
| Outline (unselected) | hover / focus / pressed | `unselected.{hover,focus,pressed}.outline.color` | `on-surface` (2px) |
| Outline (unselected) | disabled | `unselected.disabled.outline.color` + `unselected.disabled.container.opacity` | `on-surface` @ 0.38 |
| Outline (unselected) | error (enabled/hover/focus/pressed) | `unselected.error[.state].outline.color` | `error` |
| Container (selected/indet.) | enabled/hover/focus/pressed | `selected[.state].container.color` | `primary` (outline 0px) |
| Container (selected/indet.) | disabled | `selected.disabled.container.{color,opacity}` | `on-surface` @ 0.38 |
| Container (selected/indet.) | error (all states) | `selected.error[.state].container.color` | `error` |
| Icon | selected (enabled/hover/focus/pressed) | `selected[.state].icon.color` | `on-primary` |
| Icon | selected error | `selected.error[.state].icon.color` | `on-error` |
| Icon | selected disabled | `selected.disabled.icon.color` | `surface` (opaque, on top of the 0.38 container) |
| State layer | unselected hover / focus / pressed | `unselected.{hover,focus,pressed}.state-layer.*` | `on-surface` @ 0.08 / `on-surface` @ 0.10 / **`primary`** @ 0.10 |
| State layer | selected hover / focus / pressed | `selected.{hover,focus,pressed}.state-layer.*` | `primary` @ 0.08 / `primary` @ 0.10 / **`on-surface`** @ 0.10 |
| State layer | error hover / focus / pressed (any selection) | `error.{hover,focus,pressed}.state-layer.*` | `error` @ 0.08 / 0.10 / 0.10 |
| Focus indicator | focus-visible | `focus.indicator.color` | `secondary` |
| Adjacent label | all | — | `on-surface` |

Pressed state layer uses the color of the state being moved *to* (unselected→pressed shows `primary`; selected→pressed shows `on-surface`).

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Container size | 18×18px |
| Container corner radius | 2px (raw value; no sys shape token) |
| Outline width — unselected (all states incl. disabled/error) | 2px (drawn inside the 18px box) |
| Outline width — selected/indeterminate | 0px |
| Icon size / alignment | 18px, centered |
| Check / dash stroke | 2px (derived: matches outline width) |
| State-layer size / shape | 40px, `--md-sys-shape-corner-full` |
| Target size | 48×48px |
| Focus indicator thickness / offset | `--md-sys-state-focus-indicator-thickness` (3px) / `--md-sys-state-focus-indicator-outer-offset` (2px) |
| Label gap | 0 beyond the 48px target (derived: target edge to label gives ~15px visual gap from the box); label row min-height 48px |

### 4.3 Typography
No internal text. Adjacent label: not specified (derived: `body-large` standalone, `body-medium`/list typography inside lists), color `on-surface`.

### 4.4 Elevation
None.

### 4.5 Component token list (`md.comp.checkbox` → `--md-comp-checkbox-*`)
Single token set in source (`md.comp.checkbox`); all tokens below.
```
container.size → 18px
container.shape → 2px rounded corners
unselected.outline.color → sys.color.on-surface-variant
unselected.outline.width → 2px
unselected.hover.outline.color → sys.color.on-surface
unselected.hover.outline.width → 2px
unselected.focus.outline.color → sys.color.on-surface
unselected.focus.outline.width → 2px
unselected.pressed.outline.color → sys.color.on-surface
unselected.pressed.outline.width → 2px
unselected.disabled.outline.color → sys.color.on-surface
unselected.disabled.outline.width → 2px
unselected.disabled.container.opacity → 0.38
unselected.error.outline.color → sys.color.error
unselected.error.hover.outline.color → sys.color.error
unselected.error.focus.outline.color → sys.color.error
unselected.error.pressed.outline.color → sys.color.error
selected.container.color → sys.color.primary
selected.outline.width → 0px
selected.hover.container.color → sys.color.primary
selected.hover.outline.width → 0px
selected.focus.container.color → sys.color.primary
selected.focus.outline.width → 0px
selected.pressed.container.color → sys.color.primary
selected.pressed.outline.width → 0px
selected.disabled.container.color → sys.color.on-surface
selected.disabled.container.opacity → 0.38
selected.disabled.container.outline.width → 0px
selected.error.container.color → sys.color.error
selected.error.hover.container.color → sys.color.error
selected.error.focus.container.color → sys.color.error
selected.error.pressed.container.color → sys.color.error
icon.size → 18px
selected.icon.color → sys.color.on-primary
selected.hover.icon.color → sys.color.on-primary
selected.focus.icon.color → sys.color.on-primary
selected.pressed.icon.color → sys.color.on-primary
selected.disabled.icon.color → sys.color.surface
selected.error.icon.color → sys.color.on-error
selected.error.hover.icon.color → sys.color.on-error
selected.error.focus.icon.color → sys.color.on-error
selected.error.pressed.icon.color → sys.color.on-error
state-layer.size → 40px
state-layer.shape → sys.shape.corner.full
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
error.hover.state-layer.color → sys.color.error
error.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
error.focus.state-layer.color → sys.color.error
error.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.10)
error.pressed.state-layer.color → sys.color.error
error.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.10)
focus.indicator.color → sys.color.secondary
focus.indicator.thickness → sys.state.focus-indicator.thickness (3px)
focus.indicator.outline.offset → sys.state.focus-indicator.outer-offset (2px)
```
Indeterminate: no dedicated tokens — reuse `selected.*`. No motion tokens in source (see §6).

## 5. States & interaction

| State \ part | Container (unselected) | Container (selected/indet.) | Icon | State layer | Focus ring |
| --- | --- | --- | --- | --- | --- |
| Enabled | 2px `on-surface-variant` | `primary` fill | `on-primary` | none | none |
| Hover | 2px `on-surface` | `primary` | `on-primary` | 0.08 `on-surface` / `primary` | none |
| Focus-visible | 2px `on-surface` | `primary` | `on-primary` | 0.10 `on-surface` / `primary` | 3px `secondary` |
| Pressed | 2px `on-surface` | `primary` | `on-primary` | 0.10 `primary` / `on-surface` + ripple | — |
| Error (+hover/focus/pressed) | 2px `error` | `error` fill | `on-error` | `error` 0.08/0.10/0.10 | `secondary` |
| Disabled | 2px `on-surface` @ 0.38 | `on-surface` @ 0.38 | `surface` | none | none |

- **Toggle cycle:** unselected ↔ selected. Indeterminate is set programmatically only; user activation of an indeterminate checkbox → checked (native behaviour clears `indeterminate`).
- Clicking the adjacent label toggles the checkbox; label color never changes.
- Disabled + error: disabled wins (derived: no error color on non-interactive controls).
- Error appears after user interaction or form submit (`:user-invalid`), or when set explicitly (`aria-invalid="true"`).

## 6. Motion & behavior
- Selection must communicate state "clearly and instantly"; on/off actions execute immediately (no Save).
- Check-mark drawing/animation: not in source (derived, matches the "instant" guidance and fast effects for color):
  - Container fill/outline color: spring primitive, fast effects (`--md-sys-motion-spring-fast-effects-easing` / `-duration`, ≈150ms).
  - Check mark **in**: stroke draws from the short leg to the long leg (`stroke-dashoffset` 1→0 with `pathLength="1"`), 150ms (`--md-sys-motion-duration-short3`), `--md-sys-motion-easing-emphasized-decelerate`, starting with the fill.
  - Dash **in**: draws from centre outwards (`scaleX` 0→1), same timing.
  - Check ↔ dash: cross-fade 50ms (`--md-sys-motion-duration-short1`) — no morph.
  - **Out** (→ unselected): icon disappears immediately; container color fades with fast effects.
  - Reduced motion: no stroke draw; color changes only, ≤50ms.
- **Parent-child:** parent checked → all children checked; parent unchecked → all children unchecked; some but not all checked → parent indeterminate; activating an indeterminate parent → all children checked.
- Responsive: in expanded window sizes, group related checkboxes in a contained region (e.g. side sheet).
- Density: opt-in only, never by default; controls to change density stay ≥48×48. If dense mode is offered: target may drop to 40px (derived: = state layer), container stays 18px.
- RTL: icon not mirrored (check mark is not directional); label follows `dir`.

## 7. Usage guidelines
- Use for multi-select related options; don't use a list of switches for this.
- Provide a parent checkbox for select/deselect all where useful.
- Each checkbox is independent of the others in the group (except parent/child logic).
- Adjacent text label uses `on-surface`; both label and box are clickable.
- Labels: concise, scannable.

## 8. Accessibility
| Aspect | Web mapping |
| --- | --- |
| Role | native `<input type="checkbox">` (preferred) or `role="checkbox"` |
| State | `checked`; indeterminate via `input.indeterminate = true` (exposed as `mixed`) or `aria-checked="mixed"` on custom roles |
| Name | `<label>` wrapping or `for`; otherwise `aria-label`/`aria-labelledby`. Accessible label = adjacent text label |
| Disabled | `disabled` (removes from tab order) |
| Error | `aria-invalid="true"` + `aria-describedby` → error text |
| Group | `<fieldset>` + `<legend>` (or `role="group"` + `aria-labelledby`); parent checkbox `aria-controls` = child ids |

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move focus to next/previous enabled checkbox |
| Space | Toggle (indeterminate → checked) |

Source's keyboard table (Enter, Backspace/Delete, Arrows) is copied from chips — not implemented (see §11). Screen readers announce label then role/state ("Pickles, checkbox, checked").

## 9. Implementation checklist
**Public API (suggested)**
- [ ] `checked`, `indeterminate`, `disabled`, `required`, `error` (force invalid styling), `name`, `value` (default `"on"`).
- [ ] Label via slot/children or external `<label>`.
- [ ] Events: native `input` + `change` (bubbling); none on programmatic changes.

**Native form participation**
- [ ] Native inner `<input type="checkbox">` inside a light-DOM `<label>`: form submission, `required`, validity, reset and `<fieldset disabled>` all come free.
- [ ] Custom element alternative: `static formAssociated = true` + `ElementInternals`; `setFormValue(checked ? value : null)` (indeterminate submits per underlying `checked`); `setValidity({valueMissing:true}, msg, anchor)` when `required && !checked`; `formResetCallback` → restore `defaultChecked` and clear `indeterminate`; `formDisabledCallback`; `formStateRestoreCallback`; delegate focus.
- [ ] Show error styling on `:user-invalid` / after `invalid` event; support `setCustomValidity()`, `checkValidity()`, `reportValidity()`.

**Edge cases**
- [ ] Pressed state-layer color = target-state color.
- [ ] Disabled selected: container `on-surface` @ 0.38 via color-mix, icon `surface` opaque.
- [ ] Forced colors, reduced motion (§10e/§10d).
- [ ] Parent/child logic as an optional group helper.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<label class="md-checkbox-field">
  <span class="md-checkbox">
    <input class="md-checkbox__input" type="checkbox" name="extras" value="pickles">
    <span class="md-checkbox__state-layer" aria-hidden="true"></span><!-- state layer + ripple primitive -->
    <span class="md-checkbox__container" aria-hidden="true">
      <svg class="md-checkbox__icon" viewBox="0 0 18 18">
        <path class="md-checkbox__check" pathLength="1" d="M3.5 9.5 7 13l7.5-7.5"/>
        <path class="md-checkbox__dash" d="M4 9h10"/>
      </svg>
    </span>
  </span>
  <span class="md-checkbox-field__label">Pickles</span>
</label>
```
The 48×48 input is the hit area and focus target (`opacity:0`, on top); visuals are siblings selected with `:checked ~`. Check/dash path geometry is derived (§11).

**(b) Custom properties**
```css
.md-checkbox {
  --md-comp-checkbox-container-size: 18px;
  --md-comp-checkbox-container-shape: 2px;
  --md-comp-checkbox-icon-size: 18px;
  --md-comp-checkbox-state-layer-size: 40px;
  --md-comp-checkbox-state-layer-shape: var(--md-sys-shape-corner-full);
  --md-comp-checkbox-unselected-outline-width: 2px;
  --md-comp-checkbox-unselected-outline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-checkbox-unselected-hover-outline-color: var(--md-sys-color-on-surface);
  --md-comp-checkbox-unselected-error-outline-color: var(--md-sys-color-error);
  --md-comp-checkbox-unselected-disabled-container-opacity: 0.38;
  --md-comp-checkbox-selected-container-color: var(--md-sys-color-primary);
  --md-comp-checkbox-selected-icon-color: var(--md-sys-color-on-primary);
  --md-comp-checkbox-selected-error-container-color: var(--md-sys-color-error);
  --md-comp-checkbox-selected-error-icon-color: var(--md-sys-color-on-error);
  --md-comp-checkbox-selected-disabled-container-color: var(--md-sys-color-on-surface);
  --md-comp-checkbox-selected-disabled-container-opacity: 0.38;
  --md-comp-checkbox-selected-disabled-icon-color: var(--md-sys-color-surface);
  --md-comp-checkbox-focus-indicator-color: var(--md-sys-color-secondary);
  /* internal */
  --_outline: var(--md-comp-checkbox-unselected-outline-color);
  --_fill: var(--md-comp-checkbox-selected-container-color);
  --_icon: var(--md-comp-checkbox-selected-icon-color);
  --_sl: var(--md-sys-color-on-surface);           /* state-layer color */
  --_sl-pressed: var(--md-sys-color-primary);
  position: relative; display: inline-grid; place-items: center;
  inline-size: 48px; block-size: 48px; flex: none;
}
.md-checkbox-field { display: inline-flex; align-items: center; min-block-size: 48px; cursor: pointer;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.md-checkbox__input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; z-index: 1; }
.md-checkbox__state-layer { position: absolute; inline-size: var(--md-comp-checkbox-state-layer-size); aspect-ratio: 1;
  border-radius: var(--md-comp-checkbox-state-layer-shape); background: var(--_sl); opacity: 0; }
.md-checkbox__container { position: relative; box-sizing: border-box;
  inline-size: var(--md-comp-checkbox-container-size); block-size: var(--md-comp-checkbox-container-size);
  border-radius: var(--md-comp-checkbox-container-shape);
  box-shadow: inset 0 0 0 var(--md-comp-checkbox-unselected-outline-width) var(--_outline); } /* inset shadow, not border: icon box stays fixed */
.md-checkbox__icon { position: absolute; inset: 0; inline-size: var(--md-comp-checkbox-icon-size);
  fill: none; stroke: var(--_icon); stroke-width: 2px; }
.md-checkbox__check { stroke-dasharray: 1; stroke-dashoffset: 1; }
.md-checkbox__dash  { transform-origin: center; transform: scaleX(0); }
```

**(c) States**
```css
.md-checkbox:has(:checked, :indeterminate) { --_sl: var(--md-sys-color-primary); --_sl-pressed: var(--md-sys-color-on-surface); }
.md-checkbox:has(:checked, :indeterminate) .md-checkbox__container { box-shadow: none; background: var(--_fill); }
.md-checkbox:has(:checked:not(:indeterminate)) .md-checkbox__check { stroke-dashoffset: 0; }
.md-checkbox:has(:indeterminate) .md-checkbox__dash { transform: scaleX(1); }

.md-checkbox:has(:enabled:hover, :focus-visible, :enabled:active) { --_outline: var(--md-comp-checkbox-unselected-hover-outline-color); }
.md-checkbox:has(:enabled:hover) .md-checkbox__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-checkbox:has(:focus-visible) .md-checkbox__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-checkbox:has(:enabled:active) .md-checkbox__state-layer { background: var(--_sl-pressed); opacity: var(--md-sys-state-pressed-state-layer-opacity); }
/* focus ring primitive, on the state-layer circle */
.md-checkbox:has(:focus-visible) .md-checkbox__state-layer::after { content: ""; position: absolute;
  inset: calc(-1 * var(--md-sys-state-focus-indicator-outer-offset)); border-radius: inherit;
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-checkbox-focus-indicator-color); }

/* error */
.md-checkbox:has(:user-invalid, [aria-invalid="true"]) {
  --_outline: var(--md-comp-checkbox-unselected-error-outline-color);
  --_fill: var(--md-comp-checkbox-selected-error-container-color);
  --_icon: var(--md-comp-checkbox-selected-error-icon-color);
  --_sl: var(--md-sys-color-error); --_sl-pressed: var(--md-sys-color-error); }

/* disabled (after error so it wins) */
.md-checkbox:has(:disabled) { --_icon: var(--md-comp-checkbox-selected-disabled-icon-color);
  --_outline: color-mix(in srgb, var(--md-sys-color-on-surface) calc(var(--md-comp-checkbox-unselected-disabled-container-opacity) * 100%), transparent);
  --_fill: color-mix(in srgb, var(--md-comp-checkbox-selected-disabled-container-color) calc(var(--md-comp-checkbox-selected-disabled-container-opacity) * 100%), transparent); }
.md-checkbox-field:has(:disabled) { cursor: default; color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); /* derived */ }
.md-checkbox:has(:disabled) .md-checkbox__state-layer { display: none; }
```
`:has()` fallback: put state classes on `.md-checkbox` from JS, or use `input:checked ~ .md-checkbox__container`.

**(d) Motion**
```css
.md-checkbox__container { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-checkbox__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
.md-checkbox:has(:checked) .md-checkbox__check,
.md-checkbox:has(:indeterminate) .md-checkbox__dash { transition: stroke-dashoffset var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-decelerate),
  transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-decelerate); }
/* unchecking: no transition on the icon (instant out) */
@media (prefers-reduced-motion: reduce) {
  .md-checkbox * { transition-duration: var(--md-sys-motion-duration-short1) !important; }
  .md-checkbox__check, .md-checkbox__dash { transition: none !important; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-checkbox { --_outline: CanvasText; --_fill: Highlight; --_icon: HighlightText; }
  .md-checkbox:has(:disabled) { --_outline: GrayText; --_fill: GrayText; --_icon: Canvas; }
  .md-checkbox__state-layer { display: none; }
  .md-checkbox:has(:focus-visible) .md-checkbox__container { outline: 2px solid Highlight; outline-offset: 4px; }
}
```

**(f) Behaviour / JS**
- None needed for a plain checkbox (Space toggles natively; label click toggles).
- `indeterminate` has no HTML attribute: set `input.indeterminate` from a property/attribute reflection.
- Ripple primitive on `pointerdown` (skip when disabled).
- Parent helper: on child `change` compute all/none/some → parent `checked`/`indeterminate`; on parent `change` set all children `checked = parent.checked` and dispatch `change` on each.

## 11. Source gaps & decisions
- Keyboard table copies chip text (Enter, Backspace/Delete, Arrows) → implement native checkbox keys only (Tab, Space); Enter submits the form natively.
- No indeterminate tokens → reuse `selected.*` (incl. error/disabled).
- No motion spec for container fill or check mark → fast effects spring for color; 150ms emphasized-decelerate stroke draw in, instant out (matches "instantly communicates").
- No check/dash glyph geometry → 2px-stroke path `M3.5 9.5 7 13l7.5-7.5` and dash `M4 9h10` in an 18px box (derived to fit inside the 2px-corner container).
- Focus ring placement not stated → around the 40px state-layer circle with the 2px outer offset token.
- Container "opacity" tokens for disabled → implemented with `color-mix` on the color, not element `opacity`, so the `surface` icon stays opaque.
- Disabled label color not specified → `on-surface` @ 0.38 (derived from disabled recipe).
- Error trigger not specified → `:user-invalid` or explicit `aria-invalid="true"`/`error` prop.
- Label typography/spacing not specified → `body-large`, label directly after the 48px target.
