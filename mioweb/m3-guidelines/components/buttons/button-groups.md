# Button groups

> Source: https://m3.material.io/components/button-groups · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview

Button groups are invisible containers that lay out buttons and/or icon buttons, add spacing between them and modify their shape (and, for the standard variant, width) on press and selection.

- Two variants: **standard** and **connected**.
- Works with all button sizes: XS, S, M, L, XL; applies a default shape (round or square) to all buttons.
- Selection modes: single-select, multi-select, selection-required.
- **Standard**: adjacent buttons respond to each other (width "bounce"). Use to group related actions and add expression.
- **Connected**: buttons don't affect neighbours; use to select options, switch views or sort. **Replaces the segmented button** (no longer recommended). Use only for single/multi-select patterns with toggle buttons — avoid when none of the buttons can be toggled.

**M3 Expressive changes (May 2025)**: new component. Standard group added; connected group added (successor of segmented button); size and default-shape configurations added.

## 2. Variants & configurations

| Variant / configuration | Values | Notes |
| --- | --- | --- |
| Standard button group | — | Hugs content width; gap varies by size; pressed item grows 15%, neighbours compress. |
| Connected button group | — | 2dp gap at every size; outer corners full (round) or sized (square); inner corners per size; spans the full width of its parent. |
| Size | XS (32), S (40), M (56), L (96), XL (136) dp | Must match the size of the buttons inside. |
| Default shape | Round, Square | Applied to all child buttons. |
| Selection | None (actions), single-select, multi-select, selection-required | Selection-required: at least one item stays selected (derived: the last selected item can't be deselected). |
| Content | Buttons, icon buttons, or mixed | Avoid standard (no-container) icon buttons and text buttons — no container treatment. |
| Density | 0, -1, -2, -3 | Group adapts to the height of the buttons inside. |
| Resizing | Fixed or flexible | See §6. |

## 3. Anatomy

1. **Container** – invisible, non-focusable layout element; provides between-space and drives child shape/width morphs. Contains no buttons by default.
2. **Items** – buttons and/or icon buttons (default or toggle), styled with their own color tokens (filled, tonal, outlined, elevated).
3. **Overflow menu** (optional, from Guidelines › Presentation) – icon button + menu at the trailing end, holding trailing items collapsed at small breakpoints.

Common layouts: label buttons; label buttons + icon buttons; XS icon buttons; large icon buttons.

## 4. Tokens & specs

### 4.1 Color

Button groups have **no color properties**. Items use the default or toggle color styles of buttons/icon buttons (filled, tonal, outlined, elevated). See `buttons.md` and `icon-buttons.md`.

- Avoid standard icon buttons and text buttons in groups.
- Connected groups: don't mix color styles (makes selection/emphasis unclear).
- Standard groups: mixing colors/widths is encouraged to emphasize what's important.

### 4.2 Size, layout & shape

**Standard button group**

| Size | Container height | Between-space (gap) | Pressed item width |
| --- | --- | --- | --- |
| XS | 32dp | 18dp (literal; no sys token) | rest × 1.15 |
| S | 40dp | 12dp (`space150`) | rest × 1.15 |
| M | 56dp | 8dp (`space100`) | rest × 1.15 |
| L | 96dp | 8dp (`space100`) | rest × 1.15 |
| XL | 136dp | 8dp (`space100`) | rest × 1.15 |

- The larger XS/S gaps ensure each item gets a 48dp target; don't reduce them.
- Item shapes follow button/icon-button tokens (rest round/square, pressed, selected) — see `buttons.md` §4.2 / `icon-buttons.md`.
- Width hugs the items (`display: inline-flex`). Never wraps.

**Connected button group**

| Size | Height | Gap | Outer corners (round) | Outer corners (square) | Inner corner rest | Inner corner pressed | Inner corner selected |
| --- | --- | --- | --- | --- | --- | --- | --- |
| XS | 32dp | 2dp (`space25`) | full | 8dp (derived, see §11) | 8dp (`corner-value.small`) | 4dp (`corner-value.extra-small`) | 50% → 16px |
| S | 40dp | 2dp | full | 8dp | 8dp (small) | 4dp (extra-small) | 50% → 20px |
| M | 56dp | 2dp | full | 8dp | 8dp (small) | 4dp (extra-small) | 50% → 28px |
| L | 96dp | 2dp | full | 16dp | 16dp (`corner-value.large`) | 12dp (`corner-value.medium`) | 50% → 48px |
| XL | 136dp | 2dp | full | 20dp | 20dp (`corner-value.large-increased`) | 16dp (`corner-value.large`) | 50% → 68px |

- **Outer corners** = first item's start corners + last item's end corners (single item: all four). Round group: `corner.full`. Square group: values from the square measurement diagram (S–XL); XS see §11.
- **Inner corners** = corners facing a neighbour (first item's end corners, last item's start corners, all four for middle items).
- **50%** = 50% of the item **height** (web mapping: `calc(height / 2)`, not CSS `50%`, which yields an ellipse on non-square items). Selected item therefore becomes a pill (round group) — the square→round morph.
- Square group, selected item: outer corners also go to height/2 (derived from `buttons` `selected.container.shape.square` = full) → selected item is a pill in both shapes.
- **Pressed**: only the pressed item's inner corners change; outer corners stay (derived: group tokens override the button's own pressed shape on inner corners only).
- Items: `flex: 1 1 0` (equal widths, derived from "increasing the button widths inside"), group `inline-size: 100%`, optional `max-inline-size` in large windows (value is product-defined; suggestion 600px, derived).
- XS and S connected: **min item width 48dp**, 48dp target areas.
- Labels that don't fit truncate with an ellipsis (derived; groups never wrap).

### 4.3 Typography

None of its own; items use button/icon-button typography.

### 4.4 Elevation

None of its own (container invisible, level0); items use their own elevation (e.g. elevated style).

### 4.5 Component token list

Prefix `md.comp.button-group.` omitted. CSS: `--md-comp-button-group-<rest-with-dashes>`. All token sets non-deprecated.

**Standard** (`standard.{xsmall|small|medium|large|xlarge}`)
- `standard.<size>.container.height` → 32 / 40 / 56 / 96 / 136dp
- `standard.<size>.between-space` → 18dp / `md.sys.measurement.space150` (12dp) / `space100` (8dp) / `space100` (8dp) / `space100` (8dp)
- `standard.<size>.pressed.item.width.multiplier` → 15% (all sizes)
- `standard.<size>.pressed.item.width.motion.spring.stiffness` → `md.sys.motion.spring.fast.spatial.stiffness` (1400)
- `standard.<size>.pressed.item.width.motion.spring.dampening` → `md.sys.motion.spring.fast.spatial.damping` (0.9) — official token spells "dampening"

**Connected** (`connected.{xsmall|small|medium|large|xlarge}`)
- `connected.<size>.container.height` → 32 / 40 / 56 / 96 / 136dp
- `connected.<size>.between-space` → `md.sys.measurement.space25` (2dp)
- `connected.<size>.container.shape` → `md.sys.shape.corner.full`
- `connected.<size>.inner-corner.corner-size` → `md.sys.shape.corner-value.small` (8) / small (8) / small (8) / large (16) / large-increased (20)
- `connected.<size>.pressed.inner-corner.corner-size` → `md.sys.shape.corner-value.extra-small` (4) / extra-small (4) / extra-small (4) / medium (12) / large (16)
- `connected.<size>.selected.inner-corner.corner-size` → 50%

No motion tokens exist for connected corner morphs → use the button's `pressed.container.corner-size.motion.spring` (fast spatial 1400 / 0.9) (derived).

## 5. States & interaction

Items keep their own states (enabled, disabled, hovered, focused, pressed, selected) and colors. The group adds:

| Group | Pressed | Selected (toggle) | Hover / focus / disabled |
| --- | --- | --- | --- |
| Standard | Pressed item width × 1.15 + button pressed shape; adjacent items narrow so the group's outer width is unchanged (derived from "without disrupting the layout"); release springs back | Shape round↔square + color per button specs; brief width "bounce" against neighbours (same width pulse as press) | No group change; item specs apply |
| Connected | Pressed item's inner corners → pressed value; neighbours unaffected | Selected item's inner corners → height/2; neighbours unaffected; color per toggle specs | No group change |

- **Neighbour shrink (derived)**: Δ = 0.15 × pressed rest width; split equally between existing neighbours (1 at the ends, 2 in the middle); neighbours never shrink below 48px (XS/S) or their min-content icon width; leftover Δ is absorbed by the group (group grows) rather than clipping.
- **Selection logic**: single-select (selecting one deselects others); multi-select (independent toggles); selection-required (activating the only selected item does nothing).
- **Disabled items** keep their layout slot, are skipped by arrow navigation and never morph.
- **Selected + pressed** (connected): pressed inner value wins while pressed, then settles to selected value.

## 6. Motion & behavior

- Width and corner morph: fast spatial spring (`--md-sys-motion-spring-fast-spatial-stiffness` 1400, `-damping` 0.9). CSS fallback: `--md-sys-motion-spring-fast-spatial-easing` / `-duration` (spring primitive).
- Standard group: width changes happen inside the group's between-space so surroundings don't move.
- **Resizing**: single line, never wrap. Multiple groups may be stacked but don't interact vertically.
  - **Fixed**: define button width (narrow → wide), size (XS → XL) or padding per breakpoint (via container/media queries).
  - **Flexible**: items grow/shrink automatically (`flex: 1 1 auto` with max widths); group grows until all flexible buttons reach their largest width. Don't stretch icon buttons beyond the "wide" width.
  - Compact windows: smaller, narrower buttons; large/XL windows: larger, wider buttons. Preserve hierarchy at every breakpoint.
- **Overflow**: trailing items collapse into an overflow menu (trailing end) when they don't fit, reappear when space returns. Buttons outside the group are unaffected.
- **Density**: group height follows its buttons' density (0, -1, -2, -3).
- **Reduced motion**: no width bounce; corner/shape changes snap (or short effects transition).

## 7. Usage guidelines

- Standard: all buttons the same size and shape by default. Multiple sizes only for hero moments. Different shape only when selected or to add meaning/contrast. Vary width and color for emphasis.
- Primary vs secondary: give the primary more emphasis via size, color or shape.
- Connected: related, selectable content (options, view switching, sorting, filters). Not when no item can be toggled. Don't mix color styles. Span the parent width; cap in large windows.
- No standard icon buttons or text buttons inside groups. No wrapping.

## 8. Accessibility

- Each item needs a ≥48×48dp target. XS/S standard groups use larger gaps (18/12dp) for this — don't reduce. XS/S connected items have min width 48dp and 48dp targets (touch target primitive extends vertically).
- Container is not focusable and needs no label. Label each item per button / icon button guidance.
- Users must be able to identify which items are selected (not by color alone: shape morph + optional selected icon).
- **Roles (web mapping)**:
  - Action group: `role="group"` (optional `aria-label`); items `<button>`.
  - Multi-select: `role="group"`, items `<button aria-pressed>`.
  - Single-select (and single + required): `role="radiogroup"`, items `<button role="radio" aria-checked>`.
- **Focus**: initial focus lands on the first button (selected item for radiogroup), never the container.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Action / multi-select groups: each button is a tab stop (source table). Radiogroup: one tab stop (roving tabindex). |
| Left / Right (and Up / Down) | Move focus to previous / next enabled item; wraps; Left/Right mirrored in RTL. Radiogroup: arrows don't auto-select (derived: selection may trigger view changes). |
| Home / End | First / last enabled item (web mapping) |
| Space / Enter | Activate / toggle / select the focused item |

## 9. Implementation checklist

- [ ] API: `variant` (`standard|connected`), `size` (`xsmall|small|medium|large|xlarge`), `shape` (`round|square`) propagated to children, `selection` (`none|single|multi`), `required`, `value`/`values`, `name` (form), `overflow`, `layout` (`fixed|flexible`), `disabled`.
- [ ] Events: `change` (bubbles) after selection changes; item `click` untouched.
- [ ] Children: buttons and icon buttons only; propagate size/shape/toggle mode; dev warning on text or standard icon buttons.
- [ ] Container inline-flex, nowrap, gap = between-space; connected = 100% width, equal-flex items, 48px min (XS/S).
- [ ] Standard press/select width pulse with fast spatial spring; neighbours compensate.
- [ ] Connected per-item corner radii via logical properties; pressed/selected inner overrides.
- [ ] Selection logic + `aria-pressed`/`aria-checked` sync; form value.
- [ ] Keyboard per §8; container not focusable.
- [ ] Overflow via ResizeObserver; DOM order preserved.
- [ ] Reduced motion and forced colors.

## 10. HTML/CSS implementation blueprint

**(a) DOM**

```html
<!-- standard, actions -->
<div class="md-button-group" data-variant="standard" data-size="small" data-shape="round" role="group" aria-label="Call controls">
  <button class="md-button" data-color="tonal">…</button>
  <button class="md-icon-button" aria-label="Mute" aria-pressed="false">…</button>
  <!-- optional overflow -->
  <button class="md-icon-button md-button-group__overflow" aria-label="More" aria-haspopup="menu" aria-expanded="false" hidden>…</button>
</div>

<!-- connected, single-select -->
<div class="md-button-group" data-variant="connected" data-size="small" data-shape="round" role="radiogroup" aria-label="View">
  <button class="md-button" role="radio" aria-checked="true"  tabindex="0">My files</button>
  <button class="md-button" role="radio" aria-checked="false" tabindex="-1">Shared</button>
  <button class="md-button" role="radio" aria-checked="false" tabindex="-1">Computers</button>
</div>
```

Items are the regular button / icon-button components; the group only sets size/shape attributes on them and overrides `border-*-radius` and `inline-size`.

**(b) Custom properties**

```css
.md-button-group {
  --md-comp-button-group-standard-xsmall-between-space: 18px;
  --md-comp-button-group-standard-small-between-space: var(--md-sys-measurement-space150);
  --md-comp-button-group-standard-medium-between-space: var(--md-sys-measurement-space100);
  --md-comp-button-group-standard-large-between-space: var(--md-sys-measurement-space100);
  --md-comp-button-group-standard-xlarge-between-space: var(--md-sys-measurement-space100);
  --md-comp-button-group-standard-pressed-item-width-multiplier: 1.15;
  --md-comp-button-group-connected-between-space: var(--md-sys-measurement-space25);
  --md-comp-button-group-connected-container-shape: var(--md-sys-shape-corner-full);
  --_spring-ease: var(--md-sys-motion-spring-fast-spatial-easing);
  --_spring-dur: var(--md-sys-motion-spring-fast-spatial-duration);
}
.md-button-group[data-size="xsmall"] { --_h: 32px;  --_inner: var(--md-sys-shape-corner-value-small);           --_inner-pressed: var(--md-sys-shape-corner-value-extra-small); --_gap-std: var(--md-comp-button-group-standard-xsmall-between-space); }
.md-button-group[data-size="small"]  { --_h: 40px;  --_inner: var(--md-sys-shape-corner-value-small);           --_inner-pressed: var(--md-sys-shape-corner-value-extra-small); --_gap-std: var(--md-comp-button-group-standard-small-between-space); }
.md-button-group[data-size="medium"] { --_h: 56px;  --_inner: var(--md-sys-shape-corner-value-small);           --_inner-pressed: var(--md-sys-shape-corner-value-extra-small); --_gap-std: var(--md-comp-button-group-standard-medium-between-space); }
.md-button-group[data-size="large"]  { --_h: 96px;  --_inner: var(--md-sys-shape-corner-value-large);           --_inner-pressed: var(--md-sys-shape-corner-value-medium);      --_gap-std: var(--md-comp-button-group-standard-large-between-space); }
.md-button-group[data-size="xlarge"] { --_h: 136px; --_inner: var(--md-sys-shape-corner-value-large-increased); --_inner-pressed: var(--md-sys-shape-corner-value-large);       --_gap-std: var(--md-comp-button-group-standard-xlarge-between-space); }
/* --_h is the density-0 height; with density, set --_h to the child's computed height */
```

**(c) Layout & state selectors**

```css
.md-button-group { display: inline-flex; flex-wrap: nowrap; align-items: center; }
.md-button-group[data-variant="standard"]  { gap: var(--_gap-std); }
.md-button-group[data-variant="connected"] { display: flex; inline-size: 100%; gap: var(--md-comp-button-group-connected-between-space); }
.md-button-group[data-variant="connected"] > * {
  flex: 1 1 0; min-inline-size: 0;
  --_outer: var(--md-comp-button-group-connected-container-shape);
  --_i: var(--_inner);                         /* current inner radius */
  border-start-start-radius: var(--_i); border-end-start-radius: var(--_i);
  border-start-end-radius: var(--_i);   border-end-end-radius: var(--_i);
  transition: border-radius var(--_spring-dur) var(--_spring-ease);
}
.md-button-group[data-shape="square"][data-variant="connected"] > * { --_outer: var(--_inner); }
.md-button-group[data-size="xsmall"][data-variant="connected"] > *,
.md-button-group[data-size="small"][data-variant="connected"] > * { min-inline-size: 48px; }
.md-button-group[data-variant="connected"] > :first-child { border-start-start-radius: var(--_outer); border-end-start-radius: var(--_outer); }
.md-button-group[data-variant="connected"] > :last-child  { border-start-end-radius: var(--_outer);   border-end-end-radius: var(--_outer); }
/* selected: inner → height/2 ; square group: outer too */
.md-button-group[data-variant="connected"] > :is([aria-pressed="true"],[aria-checked="true"]) { --_i: calc(var(--_h) / 2); }
.md-button-group[data-shape="square"][data-variant="connected"] > :is([aria-pressed="true"],[aria-checked="true"]) { --_outer: calc(var(--_h) / 2); }
/* pressed wins over selected */
.md-button-group[data-variant="connected"] > :not(:disabled):active,
.md-button-group[data-variant="connected"] > [data-pressed] { --_i: var(--_inner-pressed); }
/* standard: JS writes --_w on items during the pulse */
.md-button-group[data-variant="standard"] > * { inline-size: var(--_w, auto); flex: none;
  transition: inline-size var(--_spring-dur) var(--_spring-ease); }
```

Item labels inside connected items: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`. Focus ring (focus ring primitive, outer offset) follows each item's per-corner radii automatically because `outline` follows `border-radius`.

**(d) Motion**

- Corner radii: CSS transition above (fast spatial easing/duration). Width pulse: JS spring (stiffness/damping tokens) or WAAPI with the `linear()` easing; interruption keeps current width.
```css
@media (prefers-reduced-motion: reduce) {
  .md-button-group > * { transition: none !important; }
}
```

**(e) Forced colors**

```css
@media (forced-colors: active) {
  .md-button-group > :is([aria-pressed="true"],[aria-checked="true"]) { forced-color-adjust: none; background: Highlight; color: HighlightText; }
  .md-button-group > * { border: 1px solid ButtonText; } /* separates connected segments */
}
```

**(f) Behaviour (JS)**

- Propagate `size`/`shape`/`disabled` to children; set `role` per selection mode.
- Selection: on item `click` → single: set `aria-checked` true on target, false on others; multi: toggle `aria-pressed`; required: ignore deselect of last selected. Fire `change`. Form: `ElementInternals.setFormValue` (custom element) or hidden `<input name>` (web mapping).
- Standard width pulse: on `pointerdown` / Space-Enter `keydown` (and on selection change): measure rest widths (`getBoundingClientRect`), set `--_w` on pressed = w × 1.15, neighbours = w − Δ/n (clamped); on `pointerup`/`pointercancel`/`keyup` (selection: next frame) clear `--_w` back to measured rest, then to `auto` on `transitionend`. Skip under reduced motion. Set `data-pressed` during keyboard activation for connected groups.
- Keyboard: arrows/Home/End move focus among enabled items (logical direction via `getComputedStyle(el).direction`); roving `tabindex` for radiogroup.
- Overflow: `ResizeObserver` on the group's parent; when `scrollWidth > clientWidth`, move trailing items (by index from end) into the overflow menu (render as menu items with the same labels/actions), show the overflow button; reverse when space returns.

## 11. Source gaps & decisions

- **XS inner corner**: round diagram text says 4dp, token says 8dp → use token 8dp.
- **Square-group outer corners**: diagram lists XS 4 / S 8 / M 8 / L 16 / XL 20dp (no token); these equal the inner-corner list, so S–XL use those values and XS uses 8dp (same token-over-diagram decision). Result: square group at rest has uniform radii per size.
- **"50%"** for selected inner corners interpreted as half the item height (pill), since CSS `50%` produces ellipses on wide items.
- **Neighbour compensation** amount not specified → Δ split equally among neighbours, clamped at 48px; group grows if clamping prevents it.
- **Connected corner motion** has no token → reuse button pressed corner-size spring (fast spatial).
- **Spring values**: tokens resolve to 1400/0.9 (standard-scheme fast spatial in the baseline table); expressive scheme re-resolves the same sys token (see guidelines Motion). Use the sys token, never the literal.
- **Selected width bounce** magnitude not given → reuse the 15% pressed multiplier as a single pulse.
- **Keyboard**: source table lists both Tab between buttons and arrows inside → actions/multi keep every button tabbable + arrows; single-select uses radiogroup roving tabindex.
- **Max width** for connected groups in large windows unspecified → product-defined, suggested 600px.
- **Overflow menu** has no spec beyond placement → standard icon button (more_vert) + menu component.
- XS standard gap 18dp has no sys token (would be "space225") → literal 18px.
