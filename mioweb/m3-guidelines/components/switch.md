# Switch

> Source: https://m3.material.io/components/switch · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Switches toggle a single standalone option on/off (binary: on/off, true/false); the effect starts **immediately**, without saving.

- Best for settings and other standalone or verbose options; common in stacked settings lists.
- Use to: toggle a single item on or off; immediately activate/deactivate something.
- Don't use for: opposing options (e.g. List vs Map view → connected button group); multi-select lists that need a Save (→ checkboxes); single choice from a list (→ radio buttons); calls to action (→ button).
- Selection (on/off) must be visible at a glance.
- **M3 Expressive changes:** none specified in the source. Differences from M2: more accessible presentation, new color mappings meeting non-text contrast, optional icon in handle, taller and wider track (handle stays inside the track; formerly "thumb").

## 2. Variants & configurations

| Configuration | Unselected handle | Selected handle | Pressed handle |
| --- | --- | --- | --- |
| Without icons (default) | 16px, no icon | 24px, no icon | 28px |
| Icon on selected only | 16px, no icon | 24px + 16px icon (check) | 28px + 16px icon |
| Icons on selected and unselected | 24px + 16px icon (close) (`with-icon.handle`) | 24px + 16px icon (check) | 28px + 16px icon |
| Disabled (any of the above) | colors per §4.1, sizes unchanged | | no press |

Single size.

## 3. Anatomy
1. **Track** — 52×32px pill; `primary` fill when selected; `surface-container-highest` + 2px `outline` border when unselected.
2. **Handle** — circle that slides between ends; size 16 / 24 / 28px by state (§4.2).
3. **Icon** (optional) — 16px, centered in the handle; must communicate on/off (check / close).
4. **State layer** — 40px circle centered on the handle (state layer primitive + ripple primitive).
5. **Focus indicator** — focus ring primitive around the **track** (pill, 2px outer offset) (derived: source says focus "lands on the handle"; ring follows the outer shape so it never collides with the state layer).
6. **Touch target** — 48px tall × 52px wide minimum (touch target primitive; derived width: track width, the 48px height adds 8px above/below).
7. **Adjacent label** (external) — `on-surface`; supporting text `on-surface-variant`.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token (`md.comp.switch.…`) | System role |
| --- | --- | --- | --- |
| Track | selected (enabled/hover/focus/pressed) | `selected[.state].track.color` | `primary` |
| Track | unselected (all) | `unselected[.state].track.color` | `surface-container-highest` |
| Track outline | unselected (all) | `unselected[.state].track.outline.color` | `outline` (2px) |
| Track outline | selected | — | none (derived: outline color = track color / transparent) |
| Track | disabled selected | `disabled.selected.track.color` + `disabled.track.opacity` | `on-surface` @ 0.12 |
| Track | disabled unselected | `disabled.unselected.track.color` + `disabled.track.opacity` | `surface-container-highest` @ 0.12 |
| Track outline | disabled unselected | `disabled.unselected.track.outline.color` (+ `disabled.track.opacity`) | `on-surface` @ 0.12 |
| Handle | selected enabled | `selected.handle.color` | `on-primary` |
| Handle | selected hover / focus / pressed | `selected.{hover,focus,pressed}.handle.color` | `primary-container` |
| Handle | unselected enabled | `unselected.handle.color` | `outline` |
| Handle | unselected hover / focus / pressed | `unselected.{hover,focus,pressed}.handle.color` | `on-surface-variant` |
| Handle | disabled selected | `disabled.selected.handle.{color,opacity}` | `surface` @ 1.0 |
| Handle | disabled unselected | `disabled.unselected.handle.{color,opacity}` | `on-surface` @ 0.38 |
| Icon | selected (all states) | `selected[.state].icon.color` | `primary` |
| Icon | unselected (all states) | `unselected[.state].icon.color` | `surface-container-highest` |
| Icon | disabled selected | `disabled.selected.icon.{color,opacity}` | `on-surface` @ 0.38 |
| Icon | disabled unselected | `disabled.unselected.icon.{color,opacity}` | `surface-container-highest` @ 0.38 |
| State layer | selected hover / focus / pressed | `selected.{hover,focus,pressed}.state-layer.*` | `primary` @ 0.08 / 0.10 / 0.10 |
| State layer | unselected hover / focus / pressed | `unselected.{hover,focus,pressed}.state-layer.*` | `on-surface` @ 0.08 / 0.10 / 0.10 |
| Focus indicator | focus-visible | `focus.indicator.color` | `secondary` |
| Adjacent label / supporting text | all | — | `on-surface` / `on-surface-variant` |

Note: unlike checkbox/radio, the pressed state layer keeps the *current* selection's color. The Color diagram lists "on primary container" as a role, but no token maps to it; follow the tokens.

### 4.2 Size, layout & shape

| Element | Attribute | Value |
| --- | --- | --- |
| Track | Width × height | 52 × 32px |
| Track | Outline width | 2px (unselected; drawn inside the 52×32 box) |
| Track | Shape | `--md-sys-shape-corner-full` |
| Handle | Unselected, no icon | 16 × 16px |
| Handle | Unselected with icon (`with-icon`) | 24 × 24px |
| Handle | Selected (with or without icon) | 24 × 24px |
| Handle | Pressed (any selection, any icon config) | 28 × 28px |
| Handle | Shape | `--md-sys-shape-corner-full` |
| Icon | Size (selected / unselected) | 16px, centered in handle |
| State layer | Size / shape | 40px / `--md-sys-shape-corner-full`, centered on handle |
| Target | Size | 48px |
| Focus indicator | Thickness / offset | `--md-sys-state-focus-indicator-thickness` (3px) / `--md-sys-state-focus-indicator-outer-offset` (2px) |

Handle position (derived from the measurement diagrams): the handle center sits 16px from the track's start edge when unselected and 16px from the end edge when selected (centers at x = 16 and x = 36 of 52), vertically centered. All sizes share the center, so size changes grow/shrink in place. Implementation: a 32×32 "handle container" at inline-start translated by 20px (track width − track height) when selected.

Size precedence: `pressed` (28) > `selected` or `with-icon` (24) > `unselected` (16).

### 4.3 Typography
No internal text (never put "On"/"Off" inside the switch). Adjacent label typography not specified (derived: label `body-large`, supporting text `body-medium` per the Color image "large body text… body text").

### 4.4 Elevation
None.

### 4.5 Component token list (`md.comp.switch` → `--md-comp-switch-*`)
Single token set in source; complete.
```
track.width → 52px
track.height → 32px
track.outline.width → 2px
track.shape → sys.shape.corner.full
selected.track.color → sys.color.primary
selected.hover.track.color → sys.color.primary
selected.focus.track.color → sys.color.primary
selected.pressed.track.color → sys.color.primary
unselected.track.color → sys.color.surface-container-highest
unselected.hover.track.color → sys.color.surface-container-highest
unselected.focus.track.color → sys.color.surface-container-highest
unselected.pressed.track.color → sys.color.surface-container-highest
unselected.track.outline.color → sys.color.outline
unselected.hover.track.outline.color → sys.color.outline
unselected.focus.track.outline.color → sys.color.outline
unselected.pressed.track.outline.color → sys.color.outline
disabled.track.opacity → 0.12
disabled.selected.track.color → sys.color.on-surface
disabled.unselected.track.color → sys.color.surface-container-highest
disabled.unselected.track.outline.color → sys.color.on-surface
handle.shape → sys.shape.corner.full
unselected.handle.width → 16px
unselected.handle.height → 16px
with-icon.handle.width → 24px
with-icon.handle.height → 24px
selected.handle.width → 24px
selected.handle.height → 24px
pressed.handle.width → 28px
pressed.handle.height → 28px
selected.handle.color → sys.color.on-primary
selected.hover.handle.color → sys.color.primary-container
selected.focus.handle.color → sys.color.primary-container
selected.pressed.handle.color → sys.color.primary-container
unselected.handle.color → sys.color.outline
unselected.hover.handle.color → sys.color.on-surface-variant
unselected.focus.handle.color → sys.color.on-surface-variant
unselected.pressed.handle.color → sys.color.on-surface-variant
disabled.selected.handle.color → sys.color.surface
disabled.selected.handle.opacity → 1
disabled.unselected.handle.color → sys.color.on-surface
disabled.unselected.handle.opacity → 0.38
selected.icon.size → 16px
unselected.icon.size → 16px
selected.icon.color → sys.color.primary
selected.hover.icon.color → sys.color.primary
selected.focus.icon.color → sys.color.primary
selected.pressed.icon.color → sys.color.primary
unselected.icon.color → sys.color.surface-container-highest
unselected.hover.icon.color → sys.color.surface-container-highest
unselected.focus.icon.color → sys.color.surface-container-highest
unselected.pressed.icon.color → sys.color.surface-container-highest
disabled.selected.icon.color → sys.color.on-surface
disabled.selected.icon.opacity → 0.38
disabled.unselected.icon.color → sys.color.surface-container-highest
disabled.unselected.icon.opacity → 0.38
state-layer.size → 40px
state-layer.shape → sys.shape.corner.full
selected.hover.state-layer.color → sys.color.primary
selected.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
selected.focus.state-layer.color → sys.color.primary
selected.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.10)
selected.pressed.state-layer.color → sys.color.primary
selected.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.10)
unselected.hover.state-layer.color → sys.color.on-surface
unselected.hover.state-layer.opacity → sys.state.hover.state-layer-opacity (0.08)
unselected.focus.state-layer.color → sys.color.on-surface
unselected.focus.state-layer.opacity → sys.state.focus.state-layer-opacity (0.10)
unselected.pressed.state-layer.color → sys.color.on-surface
unselected.pressed.state-layer.opacity → sys.state.pressed.state-layer-opacity (0.10)
focus.indicator.color → sys.color.secondary
focus.indicator.thickness → sys.state.focus-indicator.thickness (3px)
focus.indicator.offset → sys.state.focus-indicator.outer-offset (2px)
```

## 5. States & interaction

| State \ part | Track | Handle (unsel. / sel.) | Handle size | Icon | State layer |
| --- | --- | --- | --- | --- | --- |
| Enabled | `surface-container-highest` + `outline` 2px / `primary` | `outline` / `on-primary` | 16 (24 w/ icon) / 24 | `surface-container-highest` / `primary` | — |
| Hover | same | `on-surface-variant` / `primary-container` | unchanged | same | 0.08 `on-surface` / `primary` |
| Focus-visible | same + focus ring | `on-surface-variant` / `primary-container` | unchanged | same | 0.10 |
| Pressed / dragging | same | `on-surface-variant` / `primary-container` | **28** | same | 0.10 + ripple |
| Disabled | `surface-container-highest` (+ `on-surface` outline) @ 0.12 / `on-surface` @ 0.12 | `on-surface` @ 0.38 / `surface` @ 1 | unchanged | @ 0.38 | none |

- **Toggle:** handle slides to the other end and resizes (16→24 on, 24→16 off unless icons on both); track fills; check icon appears.
- **Cursor:** pointer over the whole target; hover shows the state layer ("hover area grows"); click grows handle to 28.
- **Touch / drag:** handle grows to 28 on press; can be dragged along the track; release commits to the nearest end (derived: past the midpoint flips the state; otherwise snaps back).
- Clicking the adjacent label toggles the switch.

## 6. Motion & behavior
- On toggle the handle slides to the opposite end and changes size; the action takes effect immediately.
- Motion values not in the component page; guidelines name switches as a **fast** spring user ("switch handle color" on fast effects):
  - Handle position (`translate`) and size (`width`/`height`, or `scale`): spring primitive fast spatial (`--md-sys-motion-spring-fast-spatial-easing` / `-duration`, 350ms approximation; slight overshoot in expressive).
  - Track, handle, icon colors and state-layer opacity: fast effects (≈150ms).
  - Icon in/out: opacity + `scale(0.5→1)` (derived), fast effects; icon swap check↔close cross-fades.
  - During drag: no transition on position (follow pointer 1:1, clamped); on release, spring to the end with the pointer's velocity if using a JS spring.
  - Reduced motion: no slide/scale animation — snap position and size; keep color transitions ≤50ms (`--md-sys-motion-duration-short1`).
- Density: opt-in only, never default; density toggles ≥48×48. Dense mode (derived): target 40px tall; track unchanged.
- RTL: unselected handle at the right; selected slides left; drag direction mirrored. Icons (check/close) not mirrored.

## 7. Usage guidelines
- Always pair with an inline label describing what the switch controls **when on**; keep it short and direct.
- Don't put text ("On"/"Off") inside the switch — use an icon instead.
- Icons must unambiguously communicate on/off (check / X); avoid ambiguous icons (moon, pencil).
- Commonly stacked in settings lists (label leading, switch trailing).
- Switches control binary options, not opposing ones; never use as a CTA; never for multi-selection needing Save.

## 8. Accessibility
| Aspect | Web mapping |
| --- | --- |
| Role | native `<input type="checkbox" role="switch">` (also add Safari's `switch` attribute optionally); custom: element with `role="switch"` |
| State | native `checked` (exposed as on/off); custom: `aria-checked="true\|false"` |
| Name | adjacent label (`<label>`/`aria-labelledby`); more descriptive `aria-label` when visible text is ambiguous (e.g. "Photo album access") |
| Description | supporting text via `aria-describedby` |
| Disabled | `disabled` |
| Icons | decorative, `aria-hidden="true"` |

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Focus lands on the switch (handle) |
| Space or Enter | Toggles on/off |

Native checkboxes don't toggle on Enter (Enter submits the form) — add a keydown handler (§10f). Target ≥48×48px; track/handle roles meet 3:1 non-text contrast.

## 9. Implementation checklist
**Public API (suggested)**
- [ ] `selected` (alias `checked`), `disabled`, `required`, `name`, `value` (default `"on"`).
- [ ] `icons` (icons on both), `show-only-selected-icon`; slots `on-icon` / `off-icon` (defaults: check / close).
- [ ] Label via slot/children or external `<label>`.
- [ ] Events: native `input` + `change` on user toggle only (incl. drag commit and Enter).

**Native form participation**
- [ ] Preferred: light-DOM `<input type="checkbox" role="switch">`; submits `name=value` only when on; `required` → `valueMissing` when off; reset restores `defaultChecked`; `<fieldset disabled>` honored.
- [ ] Custom element alternative: `formAssociated` + `ElementInternals` (`internals.role = 'switch'`, `ariaChecked`), `setFormValue(selected ? value : null)`, `setValidity`, `formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`.

**Edge cases**
- [ ] Handle size precedence (pressed > selected/with-icon > unselected).
- [ ] Disabled colors via color-mix; disabled selected handle is fully opaque `surface`.
- [ ] Drag with pointer capture; `pointercancel` reverts; tap without drag toggles once (no double toggle from synthetic click).
- [ ] Forced colors, reduced motion, RTL (§10).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<label class="md-switch-field">
  <span class="md-switch-field__text">
    <span class="md-switch-field__label">Dark theme</span>
    <span class="md-switch-field__supporting" id="dt-desc">Use dark colors app-wide</span>
  </span>
  <span class="md-switch" data-icons="selected"><!-- none | selected | both -->
    <input class="md-switch__input" type="checkbox" role="switch" switch name="dark" aria-describedby="dt-desc">
    <span class="md-switch__track" aria-hidden="true">
      <span class="md-switch__handle-container">
        <span class="md-switch__state-layer"></span>
        <span class="md-switch__handle">
          <svg class="md-switch__icon md-switch__icon--on" viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57z"/></svg>
          <svg class="md-switch__icon md-switch__icon--off" viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224z"/></svg>
        </span>
      </span>
    </span>
  </span>
</label>
```
The input covers the full 52×48 target (`opacity:0`) and owns focus/keyboard/form; visuals are siblings.

**(b) Custom properties**
```css
.md-switch {
  --md-comp-switch-track-width: 52px;
  --md-comp-switch-track-height: 32px;
  --md-comp-switch-track-outline-width: 2px;
  --md-comp-switch-track-shape: var(--md-sys-shape-corner-full);
  --md-comp-switch-handle-shape: var(--md-sys-shape-corner-full);
  --md-comp-switch-unselected-handle-width: 16px;
  --md-comp-switch-with-icon-handle-width: 24px;
  --md-comp-switch-selected-handle-width: 24px;
  --md-comp-switch-pressed-handle-width: 28px;
  --md-comp-switch-selected-icon-size: 16px;
  --md-comp-switch-state-layer-size: 40px;
  --md-comp-switch-selected-track-color: var(--md-sys-color-primary);
  --md-comp-switch-unselected-track-color: var(--md-sys-color-surface-container-highest);
  --md-comp-switch-unselected-track-outline-color: var(--md-sys-color-outline);
  --md-comp-switch-selected-handle-color: var(--md-sys-color-on-primary);
  --md-comp-switch-selected-hover-handle-color: var(--md-sys-color-primary-container);
  --md-comp-switch-unselected-handle-color: var(--md-sys-color-outline);
  --md-comp-switch-unselected-hover-handle-color: var(--md-sys-color-on-surface-variant);
  --md-comp-switch-selected-icon-color: var(--md-sys-color-primary);
  --md-comp-switch-unselected-icon-color: var(--md-sys-color-surface-container-highest);
  --md-comp-switch-disabled-track-opacity: 0.12;
  --md-comp-switch-focus-indicator-color: var(--md-sys-color-secondary);
  /* internal */
  --_track: var(--md-comp-switch-unselected-track-color);
  --_outline: var(--md-comp-switch-unselected-track-outline-color);
  --_handle: var(--md-comp-switch-unselected-handle-color);
  --_icon: var(--md-comp-switch-unselected-icon-color);
  --_sl: var(--md-sys-color-on-surface);
  --_size: var(--md-comp-switch-unselected-handle-width);
  --_x: 0px;  /* handle-container offset */
  position: relative; display: inline-grid; place-items: center; flex: none;
  inline-size: var(--md-comp-switch-track-width); block-size: 48px;
}
.md-switch-field { display: flex; align-items: center; justify-content: space-between; gap: 16px; /* derived */ min-block-size: 48px; cursor: pointer; }
.md-switch-field__label { color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); }
.md-switch-field__supporting { display: block; color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size)/var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking); }
.md-switch__input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; z-index: 1; appearance: none; }
.md-switch__track { position: relative; box-sizing: border-box;
  inline-size: var(--md-comp-switch-track-width); block-size: var(--md-comp-switch-track-height);
  border-radius: var(--md-comp-switch-track-shape); background: var(--_track);
  box-shadow: inset 0 0 0 var(--md-comp-switch-track-outline-width) var(--_outline); }
.md-switch__handle-container { position: absolute; inset-block: 0; inset-inline-start: 0;
  inline-size: var(--md-comp-switch-track-height); display: grid; place-items: center; translate: var(--_x) 0; }
.md-switch__state-layer, .md-switch__handle { grid-area: 1 / 1; border-radius: var(--md-comp-switch-handle-shape); }
.md-switch__state-layer { inline-size: var(--md-comp-switch-state-layer-size); aspect-ratio: 1; background: var(--_sl); opacity: 0; }
.md-switch__handle { inline-size: var(--_size); block-size: var(--_size); background: var(--_handle); display: grid; place-items: center; }
.md-switch__icon { grid-area: 1 / 1; inline-size: var(--md-comp-switch-selected-icon-size); fill: var(--_icon); opacity: 0; scale: 0.5; }
```

**(c) States**
```css
.md-switch[data-icons="both"] { --_size: var(--md-comp-switch-with-icon-handle-width); }
.md-switch[data-icons="both"]:has(:not(:checked)) .md-switch__icon--off { opacity: 1; scale: 1; }
.md-switch:has(:checked) { --_x: calc(var(--md-comp-switch-track-width) - var(--md-comp-switch-track-height));
  --_track: var(--md-comp-switch-selected-track-color); --_outline: var(--md-comp-switch-selected-track-color);
  --_handle: var(--md-comp-switch-selected-handle-color); --_icon: var(--md-comp-switch-selected-icon-color);
  --_sl: var(--md-sys-color-primary); --_size: var(--md-comp-switch-selected-handle-width); }
.md-switch:not([data-icons="none"]):has(:checked) .md-switch__icon--on { opacity: 1; scale: 1; }
.md-switch:dir(rtl):has(:checked) { --_x: calc(var(--md-comp-switch-track-height) - var(--md-comp-switch-track-width)); }

.md-switch:has(:enabled:hover, :focus-visible, :enabled:active) { --_handle: var(--md-comp-switch-unselected-hover-handle-color); }
.md-switch:has(:checked:enabled:hover, :checked:focus-visible, :checked:enabled:active) { --_handle: var(--md-comp-switch-selected-hover-handle-color); }
.md-switch:has(:enabled:hover) .md-switch__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-switch:has(:focus-visible) .md-switch__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-switch:has(:enabled:active), .md-switch.is-dragging { --_size: var(--md-comp-switch-pressed-handle-width); }
.md-switch:has(:enabled:active) .md-switch__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-switch:has(:focus-visible) .md-switch__track { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-switch-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }

/* disabled: opacity on colors, not on elements */
.md-switch:has(:disabled) { --_dt: calc(var(--md-comp-switch-disabled-track-opacity) * 100%);
  --_track: color-mix(in srgb, var(--md-sys-color-surface-container-highest) var(--_dt), transparent);
  --_outline: color-mix(in srgb, var(--md-sys-color-on-surface) var(--_dt), transparent);
  --_handle: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --_icon: color-mix(in srgb, var(--md-sys-color-surface-container-highest) 38%, transparent); }
.md-switch:has(:disabled:checked) {
  --_track: color-mix(in srgb, var(--md-sys-color-on-surface) var(--_dt), transparent); --_outline: transparent;
  --_handle: var(--md-sys-color-surface);
  --_icon: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
.md-switch:has(:disabled) .md-switch__state-layer { display: none; }
.md-switch-field:has(:disabled) { cursor: default; }
.md-switch-field:has(:disabled) .md-switch-field__text { color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); /* derived */ }
```
JS drag reads `getComputedStyle(el).direction` to negate the offset under RTL.

**(d) Motion**
```css
.md-switch__handle-container { transition: translate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
.md-switch__handle { transition: inline-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  block-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-switch__track { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-switch__icon, .md-switch__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  scale var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-switch.is-dragging .md-switch__handle-container { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .md-switch__handle-container, .md-switch__handle { transition-property: background-color; }
  .md-switch * { transition-duration: var(--md-sys-motion-duration-short1) !important; }
  .md-switch__icon { scale: 1; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-switch { --_track: Canvas; --_outline: CanvasText; --_handle: CanvasText; --_icon: Canvas; }
  .md-switch:has(:checked) { --_track: Highlight; --_outline: Highlight; --_handle: HighlightText; --_icon: Highlight; }
  .md-switch:has(:disabled) { --_track: Canvas; --_outline: GrayText; --_handle: GrayText; --_icon: Canvas; }
  .md-switch__track { border: 2px solid var(--_outline); box-shadow: none; } /* box-shadow is removed in forced colors */
  .md-switch__state-layer { display: none; }
}
```

**(f) Behaviour / JS**
- `keydown` Enter on the input → `preventDefault()` (stop implicit form submit) and `input.click()` (fires `input`/`change`). Space is native.
- Drag (optional): `pointerdown` on the target → `setPointerCapture`, add `.is-dragging`; `pointermove` sets `--_x` clamped to [0, 20px] (negated under RTL); `pointerup` → if final position crosses 10px from the start state, toggle (`input.click()`), else restore; suppress the subsequent native click so it doesn't toggle twice; `pointercancel` → restore, remove `.is-dragging`.
- Ripple primitive on `pointerdown` inside the state layer.
- Icon config attribute (`data-icons`) reflects `icons` / `show-only-selected-icon`.

## 11. Source gaps & decisions
- No motion tokens/durations → fast spatial spring for handle position/size, fast effects for color (guidelines: switches use fast springs).
- Handle position not given numerically → centers at 16px from each end (diagram; equals track height / 2); implemented as a 32px container translated by 20px.
- Selected track outline not tokenized → outline color = track color (visually none).
- `disabled.track.opacity` applied to both track fill and unselected outline (only one opacity token exists).
- Source says focus "lands on the handle" but tokens give a single ring → ring drawn around the track pill (handle is not separately focusable on web).
- Pressed state layer keeps current-selection color (tokens), unlike checkbox/radio — implemented as tokens say.
- Source keyboard: Space **or Enter** toggles → Enter handler added on top of native checkbox.
- Drag commit rule not specified → midpoint threshold; velocity carry-over when a JS spring is used.
- "On primary container" in the Color diagram has no token → ignored.
- Target width not given → track width (52px), 48px tall.
- Label/supporting typography not specified → `body-large` / `body-medium`; label–switch gap 16px (derived from list item spacing).
