# Segmented buttons

> Source: https://m3.material.io/components/segmented-buttons · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

> **Deprecated in M3 Expressive (May 2025):** segmented buttons are no longer recommended. Use the **connected button group** (see `button-groups.md`), which has mostly the same functionality with an updated visual design. This file documents the baseline component for legacy/migration support; only the baseline token set (`md.comp.outlined-segmented-button`, itself marked "not recommended") exists.

## 1. Overview

Segmented buttons help people select options, switch views, or sort elements.

- Two variants: **single-select** and **multi-select**.
- Segments can contain icons, label text, or both.
- Use for simple choices between **2–5** items; for more items or complex choices use chips.
- Can be placed on other components (bottom sheets, full-screen dialogs).

**Differences from M2**: new color mappings + dynamic color; optional check icon for selected state; 40dp container height; formerly "toggle buttons", now single/multi-select variants; fully rounded corners; sentence-case labels.

**Migration to connected button group**: single-select → connected group, single selection (toggle buttons, `role="radiogroup"`); multi-select → connected group, multi-select; outline + checkmark visuals are replaced by toggle-button colors and the selected-shape morph. Map `density` to the button density; drop `hideSelectedIcon`.

## 2. Variants & configurations

| Variant / configuration | Values | Notes |
| --- | --- | --- |
| Single-select | exactly one segment selected | Behaves like radio buttons. |
| Multi-select | 0..all segments selected | Selection not required; behaves like checkboxes. |
| Segments | 2–5 | Never more than 5; never wrap. |
| Content | label only, icon only, icon + label | Don't mix icon-only and text segments in one set. |
| Density | 0, -1, -2, -3 | Height only; each step removes 4dp (40 → 36 → 32 → 28dp). |

## 3. Anatomy

1. **Segment** – one selectable button.
2. **Container** – fully rounded outlined container (outer corners full; segments divided by the 1dp outline).
3. **Icon** (optional; spec diagram: "optional for unselected state") – leading icon.
4. **Label text** (optional) – short label.
5. **Selected icon** – checkmark shown in the selected segment.
6. State layer, focus ring, touch target (shared primitives).

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Segment fill | unselected | — | transparent |
| Segment fill | selected (+hover/focus/pressed) | `selected.container.color` | `--md-sys-color-secondary-container` |
| Outline | enabled | `outline.color` | `--md-sys-color-outline` |
| Outline | disabled | `disabled.outline.color` + `disabled.outline.opacity` | `--md-sys-color-on-surface` @ 0.12 |
| Label | unselected (enabled/hover/focus/pressed) | `unselected[.{hover|focus|pressed}].label-text.color` | `--md-sys-color-on-surface` |
| Label | selected (enabled/hover/focus/pressed) | `selected[.{hover|focus|pressed}].label-text.color` | `--md-sys-color-on-secondary-container` |
| Label | disabled | `disabled.label-text.color` + `.opacity` | on-surface @ 0.38 |
| Icon | unselected (with-icon/hover/focus/pressed) | `unselected.{with-icon|hover|focus|pressed}.icon.color` | `--md-sys-color-on-surface` |
| Icon (incl. checkmark) | selected | `selected.{with-icon|hover|focus|pressed}.icon.color` | `--md-sys-color-on-secondary-container` |
| Icon | disabled | `disabled.icon.color` + `.opacity` | on-surface @ 0.38 |
| State layer | unselected hover/focus/pressed | `unselected.{hover|focus|pressed}.state-layer.color` | `--md-sys-color-on-surface` |
| State layer | selected hover/focus/pressed | `selected.{hover|focus|pressed}.state-layer.color` | `--md-sys-color-on-secondary-container` |
| State-layer opacity | hover / focus / pressed | `{hover|focus|pressed}.state-layer.opacity` | `--md-sys-state-hover-state-layer-opacity` 0.08 / `--md-sys-state-focus-state-layer-opacity` 0.1 / 0.1 (pressed token references the **focus** opacity; same value) |
| Focus ring | focused | `focus.indicator.color` | `--md-sys-color-secondary` (focus ring primitive) |

- Disabled + selected fill: not specified → on-surface @ 0.12 (derived: same opacity as the disabled outline); label/icon on-surface @ 0.38; checkmark kept.

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Height | 40dp (`container.height`); density -1/-2/-3 → 36/32/28dp |
| Container width | Dynamic, based on labels (hugs content) |
| Segment width | Container width ÷ number of segments (equal; = widest segment content) |
| Outline width | 1dp, shared between adjacent segments (1dp divider, not 2) |
| Shape | `corner.full` on the container; first segment start corners and last segment end corners = full; inner edges square (0) |
| Label alignment | Center |
| Left/right padding | min 12dp per segment |
| Padding between elements (icon/check–label) | 8dp |
| Icon / checkmark size | 18dp (`with-icon.icon.size`) |
| Target size | 48dp tall (touch target primitive extends above/below at 40dp and denser heights) |
| Label overflow | single line, ellipsis (derived; never wrap) |
| Focus ring | thickness 3dp, outer offset 2dp; follows the segment's own corners |

- Large screens: cap segment padding (derived: max 24dp per side → `max-inline-size` per segment = content + 48dp) so the set doesn't fill the screen; never span the full width of larger screens/panes.
- Keep adequate margins from viewport/frame edges (use the pane margin).

**Segment content by type & state**

| Content | Unselected | Selected |
| --- | --- | --- |
| Icon + label | icon, 8dp, label | checkmark replaces icon (source) |
| Label only | label | checkmark, 8dp, label (optional check per "Differences"; default on, `hideSelectedIcon` to disable) |
| Icon only | icon | icon with `FILL` 1 (derived; checkmark would hide the meaning) |

### 4.3 Typography

Label: typography role primitive with `label-large` → `--md-sys-typescale-label-large-{font|weight|size|line-height|tracking}` (Roboto, 500, 14/20, 0.1). Sentence case.

### 4.4 Elevation

None (flat, level0).

### 4.5 Component token list

Prefix `md.comp.outlined-segmented-button.` omitted; CSS `--md-comp-outlined-segmented-button-<rest-with-dashes>`. Complete (single token set).

- `container.height` → 40dp
- `shape` → `md.sys.shape.corner.full`
- `outline.color` → outline; `outline.width` → 1dp
- `selected.container.color` → secondary-container
- `disabled.outline.color` → on-surface; `disabled.outline.opacity` → 0.12
- `label-text.font` → `md.sys.typescale.label-large.font`; `label-text.weight` → `md.sys.typescale.label-large.weight` (500); `label-text.size` → `md.sys.typescale.label-large.size` (14); `label-text.line-height` → `md.sys.typescale.label-large.line-height` (20); `label-text.tracking` → `md.sys.typescale.label-large.tracking` (0.1); `label-text.type` → `label-text.font`
- `unselected.label-text.color` → on-surface; `selected.label-text.color` → on-secondary-container
- `unselected.{hover|focus|pressed}.label-text.color` → on-surface; `selected.{hover|focus|pressed}.label-text.color` → on-secondary-container
- `disabled.label-text.color` → on-surface; `disabled.label-text.opacity` → 0.38
- `with-icon.icon.size` → 18dp
- `unselected.with-icon.icon.color` → on-surface; `selected.with-icon.icon.color` → on-secondary-container
- `unselected.{hover|focus|pressed}.icon.color` → on-surface; `selected.{hover|focus|pressed}.icon.color` → on-secondary-container
- `disabled.icon.color` → on-surface; `disabled.icon.opacity` → 0.38
- `unselected.{hover|focus|pressed}.state-layer.color` → on-surface; `selected.{hover|focus|pressed}.state-layer.color` → on-secondary-container
- `hover.state-layer.opacity` → `md.sys.state.hover.state-layer-opacity` (0.08); `focus.state-layer.opacity` → `md.sys.state.focus.state-layer-opacity` (0.1); `pressed.state-layer.opacity` → `md.sys.state.focus.state-layer-opacity` (0.1)
- `focus.indicator.color` → secondary; `focus.indicator.thickness` → `md.sys.state.focus-indicator.thickness` (3dp); `focus.indicator.outline.offset` → `md.sys.state.focus-indicator.outer-offset` (2dp)

## 5. States & interaction

| State | Fill | Label / icon | State layer | Outline |
| --- | --- | --- | --- | --- |
| Enabled, unselected | transparent | on-surface | — | outline |
| Hover / focus / pressed, unselected | transparent | on-surface | on-surface @ 0.08 / 0.1 / 0.1 | outline |
| Selected | secondary-container | on-secondary-container + check | — | outline |
| Hover / focus / pressed on selected | secondary-container | on-secondary-container | on-secondary-container @ 0.08 / 0.1 / 0.1 | outline |
| Disabled (unselected) | transparent | on-surface @ 0.38 | — | on-surface @ 0.12 |
| Disabled + selected (derived) | on-surface @ 0.12 | on-surface @ 0.38 + check | — | on-surface @ 0.12 |
| Focus-visible | + focus ring primitive (outer offset) on the segment | | | |

- Selection = color **and** checkmark (or filled glyph for icon-only) — never color alone.
- State layer is clipped to the segment shape (full outer corners on ends).
- Single-select: activating the selected segment does nothing (radio semantics; see §11).
- Multi-select: Space/Enter toggles the focused segment.
- No shape morph (baseline component).

## 6. Motion & behavior

- Not specified in source. Derived: fill/label/icon color and state-layer opacity use the fast effects spring (`--md-sys-motion-spring-fast-effects-easing` / `-duration`); checkmark enters with opacity 0→1 + scale 0.6→1 (fast effects), the replaced icon cross-fades out. Segment width doesn't change when the check appears (segments are already sized to the widest selected content).
- Segments never wrap; equal widths.
- Responsive: cap padding on large screens; keep viewport margins.
- RTL: order and corners mirror (logical properties); arrow keys follow visual direction.
- Reduced motion: no scale; instant or short fade only.

## 7. Usage guidelines

- 2–5 segments; >5 → chips. Choices should be scoped.
- Labels short, clear, consistent in length; if too long, use an icon alone.
- One label type for all segments (don't mix icon-only with text). Icon-only segments must clearly communicate the option.
- Single-select: one option, switch views, sort (e.g. beverage size). Multi-select: filters (e.g. price range).
- Prefer the connected button group for new work.

## 8. Accessibility

- Outline contrast ≥3:1 against background/surface.
- Selection conveyed by checkmark + color.
- Initial focus: first segment (leftmost LTR, rightmost RTL) regardless of selection (source) — see §11 for the native-radio deviation.
- Labels: from visible text (Relevance, Distance); icon-only: label describes the meaning (e.g. "Inexpensive" for "$").
- **Roles** (source: single = "Radiogroup", multi = "Checkbox"). Web mapping: native `<input type="radio">` / `<input type="checkbox">` inside a `<fieldset>` (gives roles, `:checked`, form participation); group label via `<legend>` (visually hidden if needed) or `aria-label`. Checkmark/icon `aria-hidden`.
- Disabled segment: native `disabled` on the input.

| Key | Action |
| --- | --- |
| Tab | Single-select: into/out of the group (one tab stop). Multi-select: between segments (each checkbox a tab stop, source table) |
| Arrow keys | Move between segments (visual direction; RTL mirrored). Single-select: native radios also select on arrow |
| Space / Enter | Single: select focused segment (Space native; Enter added in JS). Multi: toggle focused segment |

## 9. Implementation checklist

- [ ] Mark deprecated; document migration to connected button group.
- [ ] API: `multiselect`, `name`, `value`/`values`, `density` (0..-3), `hideSelectedIcon`, `disabled`; segments (2–5) with `value`, `label`, `icon`, `disabled`, `selected`; dev warning outside 2–5 or mixed label types.
- [ ] Events: native `change` / `input` bubble from inputs; component-level `change` with value(s).
- [ ] Layout: inline-grid of equal columns, shared 1dp outline, outer corners full, inner square.
- [ ] Segment content per §4.2 table; colors per §4.1; state layer clipped.
- [ ] Focus ring, 48dp target at all densities.
- [ ] Keyboard per §8; RTL.
- [ ] No wrapping; capped segment padding on large screens.
- [ ] Reduced motion, forced colors.

## 10. HTML/CSS implementation blueprint

**(a) DOM**

```html
<fieldset class="md-segmented" data-density="0">          <!-- multi: add data-multiselect, use type="checkbox" -->
  <legend class="md-visually-hidden">Sort by</legend>
  <label class="md-segmented__segment" part="segment">
    <input class="md-segmented__input" type="radio" name="sort" value="relevance" checked>
    <span class="md-segmented__state-layer" aria-hidden="true"></span>   <!-- state layer + ripple primitives -->
    <svg class="md-segmented__check" part="check" aria-hidden="true" viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
    <span class="md-segmented__icon material-symbols-outlined" part="icon" aria-hidden="true">sort</span>
    <span class="md-segmented__label" part="label">Relevance</span>
  </label>
  <!-- … 2–5 segments; icon-only segments: no label span, input gets aria-label="Inexpensive" -->
</fieldset>
```
The input is visually hidden (`opacity:0; position:absolute; inset:0; margin:0`) and covers the segment so it is the hit area and focus target; visuals react via `:has()` / sibling selectors.

**(b) Custom properties**

```css
.md-segmented {
  --md-comp-outlined-segmented-button-container-height: 40px;
  --md-comp-outlined-segmented-button-shape: var(--md-sys-shape-corner-full);
  --md-comp-outlined-segmented-button-outline-color: var(--md-sys-color-outline);
  --md-comp-outlined-segmented-button-outline-width: 1px;
  --md-comp-outlined-segmented-button-selected-container-color: var(--md-sys-color-secondary-container);
  --md-comp-outlined-segmented-button-unselected-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-outlined-segmented-button-selected-label-text-color: var(--md-sys-color-on-secondary-container);
  --md-comp-outlined-segmented-button-with-icon-icon-size: 18px;
  --md-comp-outlined-segmented-button-disabled-outline-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  --md-comp-outlined-segmented-button-disabled-label-text-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --md-comp-outlined-segmented-button-focus-indicator-color: var(--md-sys-color-secondary);
  --_h: calc(var(--md-comp-outlined-segmented-button-container-height) - var(--_density, 0) * 4px);
}
.md-segmented[data-density="-1"] { --_density: 1; }
.md-segmented[data-density="-2"] { --_density: 2; }
.md-segmented[data-density="-3"] { --_density: 3; }
```

**(c) Layout & state selectors**

```css
.md-segmented { display: inline-grid; grid-auto-flow: column; grid-auto-columns: 1fr; margin: 0; padding: 0; border: 0; min-inline-size: 0; }
/* hugs content by default; if stretched, cap: max-inline-size = n × (widest content + 2 × 24px) (set by JS or author) */
.md-segmented__segment {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  block-size: var(--_h); padding-inline: 12px; min-inline-size: 48px;
  border: var(--md-comp-outlined-segmented-button-outline-width) solid var(--md-comp-outlined-segmented-button-outline-color);
  margin-inline-start: calc(-1 * var(--md-comp-outlined-segmented-button-outline-width)); /* shared divider */
  color: var(--md-comp-outlined-segmented-button-unselected-label-text-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  white-space: nowrap; cursor: pointer;
}
.md-segmented__segment:first-of-type { margin-inline-start: 0;
  border-start-start-radius: var(--md-comp-outlined-segmented-button-shape); border-end-start-radius: var(--md-comp-outlined-segmented-button-shape); }
.md-segmented__segment:last-of-type {
  border-start-end-radius: var(--md-comp-outlined-segmented-button-shape); border-end-end-radius: var(--md-comp-outlined-segmented-button-shape); }
.md-segmented__label { overflow: hidden; text-overflow: ellipsis; min-inline-size: 0; }
.md-segmented__icon, .md-segmented__check { inline-size: var(--md-comp-outlined-segmented-button-with-icon-icon-size); block-size: var(--md-comp-outlined-segmented-button-with-icon-icon-size); font-size: var(--md-comp-outlined-segmented-button-with-icon-icon-size); fill: currentColor; flex: none; }
.md-segmented__check { display: none; }
.md-segmented__state-layer { position: absolute; inset: 0; border-radius: inherit; background: currentColor; opacity: 0; pointer-events: none; }
/* touch target: input itself, extended to 48px tall */
.md-segmented__input { position: absolute; inset-inline: 0; inset-block-start: 50%; translate: 0 -50%; block-size: max(48px, 100%); margin: 0; opacity: 0; cursor: inherit; z-index: 1; }

/* selected */
.md-segmented__segment:has(:checked) { background: var(--md-comp-outlined-segmented-button-selected-container-color); color: var(--md-comp-outlined-segmented-button-selected-label-text-color); }
.md-segmented__segment:has(:checked) .md-segmented__check { display: block; }
.md-segmented__segment:has(:checked):has(.md-segmented__label) .md-segmented__icon { display: none; }       /* check replaces icon */
.md-segmented__segment:has(:checked):not(:has(.md-segmented__label)) .md-segmented__check { display: none; } /* icon-only */
.md-segmented__segment:has(:checked):not(:has(.md-segmented__label)) .md-segmented__icon { font-variation-settings: 'FILL' 1; }
.md-segmented[data-hide-selected-icon] .md-segmented__check { display: none; }
/* interaction */
.md-segmented__segment:hover:not(:has(:disabled)) .md-segmented__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-segmented__segment:has(:focus-visible) .md-segmented__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-segmented__segment:active:not(:has(:disabled)) .md-segmented__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-segmented__segment:has(:focus-visible) { z-index: 2;
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-outlined-segmented-button-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
/* disabled */
.md-segmented__segment:has(:disabled) { cursor: default; color: var(--md-comp-outlined-segmented-button-disabled-label-text-color);
  border-color: var(--md-comp-outlined-segmented-button-disabled-outline-color); }
.md-segmented__segment:has(:disabled:checked) { background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent); }
.md-segmented__segment:not(:has(:disabled)) { z-index: 1; } /* enabled outline paints over a disabled neighbour's shared edge */
```

**(d) Motion**

```css
.md-segmented__segment { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-segmented__check { animation: md-seg-check var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@keyframes md-seg-check { from { opacity: 0; scale: .6; } }
@media (prefers-reduced-motion: reduce) { .md-segmented__check { animation: none; } }
```

**(e) Forced colors**

```css
@media (forced-colors: active) {
  .md-segmented__segment { border-color: ButtonText; color: ButtonText; }
  .md-segmented__segment:has(:checked) { forced-color-adjust: none; background: Highlight; color: HighlightText; border-color: ButtonText; }
  .md-segmented__segment:has(:disabled) { color: GrayText; border-color: GrayText; }
  .md-segmented__segment:has(:focus-visible) { outline-color: Highlight; }
}
```

**(f) Behaviour (JS)**

- Mostly native. Add: Enter key → `input.click()` (radios/checkboxes don't activate on Enter natively); multi-select arrow keys move focus between checkboxes (Left/Right by visual direction, skip disabled, no wrap needed but allowed).
- Emit a component `change` with `value` (single) or `values` array (multi) on input `change`.
- Single-select initial state: if no `checked`, leave none checked until the user picks (native radio behaviour) — or set the first segment checked when `required` (derived).
- Dev-time warnings: segment count outside 2–5; mixed icon-only/text segments.

## 11. Source gaps & decisions

- **Pressed state-layer opacity** token references the *focus* opacity token (value 0.1) → use the focus token value (matches pressed 0.1 anyway).
- **Disabled + selected fill** unspecified → on-surface @ 0.12.
- **Label-only checkmark** ("optional check icon") → shown by default, `hideSelectedIcon` opt-out. **Icon-only** selected → filled glyph instead of check (keeps meaning, satisfies "not color alone").
- **Max padding** on large screens unspecified → 24dp per side cap (derived).
- **Shared outline**: images show a single 1dp divider → negative 1dp margin overlap; enabled edge paints over disabled edge.
- **Initial focus / Tab**: source says focus starts on the first segment regardless of selection, and its keyboard table says "Tab: navigate between buttons". Decision: native radios (tab stop = checked radio, arrows select) for single-select for robust semantics and form participation — deviation documented; native checkboxes (each a tab stop) for multi-select, with added arrow navigation.
- **Single-select "select or unselect"** with Space/Enter → radio semantics (no unselect). **Multi-select "select all of the segments"** in the source key list is read as "Space/Enter can progressively select every segment", not a select-all shortcut.
- **Motion** unspecified → fast effects spring for color/check (derived).
- **Density** — source: only height changes (−4dp/step); target stays 48dp.
