# Icon buttons

> Source: https://m3.material.io/components/icon-buttons · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview

Icon buttons display common, easily understood actions using a single system icon with a clear meaning.

- **Default** icon buttons perform an action or open another element (menu, search).
- **Toggle** icon buttons represent binary on/off actions (favorite, bookmark). Don't use toggle for actions without a selected state (e.g. overflow menu).
- Placed directly on a background or in containers: cards, app bars, toolbars; several can be placed in a standard button group for interaction/motion between them.
- Use only a few at once; in dense layouts group popular actions in a toolbar or button group.
- On web, show a **tooltip** describing the action on hover.

**M3 Expressive changes (May 2025)**
- Variants: default and toggle (selection); color styles are configurations (filled, tonal, outlined, standard).
- Shapes: round and square; shape morphs when pressed and when selected.
- Sizes: XS, S (default), M, L, XL. Widths: narrow, default, wide.
- In button groups, icon buttons interact with each other when pressed.
- Baseline filled/tonal/outlined icon-button token sets are **deprecated** in favor of the new sets (not documented here).

**Differences from M2**: new color mappings with dynamic color; what M2 called "toggle buttons" are now icon buttons with default and toggle variants.

## 2. Variants & configurations

| Variant / configuration | Values | Notes |
| --- | --- | --- |
| Variant | Default, Toggle (selection) | Both available in all 4 color styles. |
| Color | Filled (default), Tonal, Outlined, Standard | Emphasis: filled > tonal > outlined > standard. Other roles (e.g. tertiary/on-tertiary) allowed if 3:1 contrast. |
| Size | XS 32, S 40 (default), M 56, L 96, XL 136 dp | Height; default width equals height. |
| Width | Narrow, Default, Wide | Changes leading/trailing space only. |
| Shape | Round (default), Square | |

## 3. Anatomy

1. **Icon** – filled glyph for default buttons; outlined (unselected) / filled (selected) for toggles.
2. **Container** – contrast/separation; invisible at rest for standard; outline for outlined.
3. State layer, ripple, focus ring, touch target (implicit; shared primitives).
4. **Tooltip** (web) – shows the accessibility label on hover.

## 4. Tokens & specs

### 4.1 Color

| Style | Default container / icon | Toggle unselected container / icon | Toggle selected container / icon |
| --- | --- | --- | --- |
| Filled | `--md-sys-color-primary` / `--md-sys-color-on-primary` | `--md-sys-color-surface-container` / `--md-sys-color-on-surface-variant` | primary / on-primary |
| Tonal | `--md-sys-color-secondary-container` / `--md-sys-color-on-secondary-container` | secondary-container / on-secondary-container | `--md-sys-color-secondary` / `--md-sys-color-on-secondary` |
| Outlined | none + outline `--md-sys-color-outline-variant` / `--md-sys-color-on-surface-variant` | same as default | `--md-sys-color-inverse-surface` (no outline, derived) / `--md-sys-color-inverse-on-surface` |
| Standard | none / `--md-sys-color-on-surface-variant` | none / on-surface-variant | none / `--md-sys-color-primary` |

- **State layer** (state layer primitive): color = icon color of the current selection state; hover 0.08, focus 0.1, pressed 0.1. Icon and container colors constant across hover/focus/pressed. Standard: container invisible at rest, visible via state layer.
- **Disabled** (disabled primitive; same for unselected and selected unless stated):

| Style | Container | Icon | Outline |
| --- | --- | --- | --- |
| Filled | on-surface @ 0.1 | on-surface @ 0.38 | — |
| Tonal | on-surface @ 0.1 | on-surface @ 0.38 | — |
| Outlined | unselected: none; selected: on-surface @ 0.1 | on-surface @ 0.38 | unselected: outline-variant (full opacity per token); selected: none (derived) |
| Standard | none | on-surface @ 0.38 | — |

- Disabled: no state layer, no shape morph, no tooltip trigger change (tooltip still allowed on hover, derived).

### 4.2 Size, layout & shape

Container width = leading-space + icon + trailing-space; height = `container.height`; icon centered.

| Size | Height | Icon | Narrow (L/T → width) | Default (L/T → width) | Wide (L/T → width) | Outline width |
| --- | --- | --- | --- | --- | --- | --- |
| XS | 32dp | 20dp | 4dp → 28dp | 6dp → 32dp | 10dp → 40dp | 1dp |
| S | 40dp | 24dp | 4dp → 32dp | 8dp → 40dp | 14dp → 52dp | 1dp |
| M | 56dp | 24dp | 12dp → 48dp | 16dp → 56dp | 24dp → 72dp | 1dp |
| L | 96dp | 32dp | 16dp → 64dp | 32dp → 96dp | 48dp → 128dp | 2dp |
| XL | 136dp | 40dp | 32dp → 104dp | 48dp → 136dp | 72dp → 184dp | 3dp |

- Outline is drawn **inside** the box (`border` with `box-sizing: border-box`, or inset `box-shadow`) so outer size never changes (derived).
- Icon: Material Symbols with `opsz` = icon size; `FILL` 0/1 for unselected/selected toggles.

**Corner radii**

| | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| Round (rest) | full | full | full | full | full |
| Square (rest) | 12dp (`corner.medium`) | 12dp | 16dp (`corner.large`) | 28dp (`corner.extra-large`) | 28dp |
| Pressed (both shapes, any selection) | 8dp (`corner.small`) | 8dp | 12dp (`corner.medium`) | 16dp (`corner.large`) | 16dp |
| Selected, round button | 12dp | 12dp | 16dp | 28dp | 28dp |
| Selected, square button | full | full | full | full | full |

- `full` on web = `calc(height / 2)` for animatable radii (derived; `9999px` doesn't interpolate smoothly to 8–28px).
- Target: ≥48×48dp for XS and S at all widths (touch target primitive); M+ already ≥48 (narrow M = 48).

### 4.3 Typography

None (icon only). Tooltip uses plain tooltip typography (see tooltips.md).

### 4.4 Elevation

No elevation tokens; all styles level0, no shadow.

### 4.5 Component token list

Prefix `md.comp.icon-button.` omitted; CSS `--md-comp-icon-button-<rest-with-dashes>`. `{a|b}` = one token each; `[.x]` = with and without segment. Values are sys color roles unless noted.

**Color – Filled (`filled`)**
- `filled.container.color` → primary; `filled.unselected.container.color` → surface-container; `filled.selected.container.color` → primary
- `filled[.{hovered|focused|pressed}].icon.color` → on-primary
- `filled.unselected[.{hovered|focused|pressed}].icon.color` → on-surface-variant
- `filled.selected[.{hovered|focused|pressed}].icon.color` → on-primary
- `filled.{hovered|focused|pressed}.state-layer.color` → on-primary; `filled.unselected.{…}.state-layer.color` → on-surface-variant; `filled.selected.{…}.state-layer.color` → on-primary
- `filled.{hovered|focused|pressed}.state-layer.opacity` → `md.sys.state.hover.state-layer-opacity` 0.08 / `md.sys.state.focus.state-layer-opacity` 0.1 / `md.sys.state.pressed.state-layer-opacity` 0.1
- `filled.disabled.container.color` → on-surface; `filled.disabled.container.opacity` → 0.1
- `filled.disabled.icon.color` → on-surface; `filled.disabled.icon.opacity` → 0.38

**Color – Tonal (`tonal`)**
- `tonal[.unselected].container.color` → secondary-container; `tonal.selected.container.color` → secondary
- `tonal[.unselected][.{hovered|focused|pressed}].icon.color` → on-secondary-container
- `tonal.selected[.{hovered|focused|pressed}].icon.color` → on-secondary
- `tonal[.unselected].{hovered|focused|pressed}.state-layer.color` → on-secondary-container; `tonal.selected.{…}.state-layer.color` → on-secondary
- `tonal.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1 (state tokens)
- `tonal.disabled.container.color` → on-surface; `tonal.disabled.container.opacity` → 0.1
- `tonal.disabled.icon.color` → on-surface; `tonal.disabled.icon.opacity` → 0.38

**Color – Outlined (`outlined`)**
- `outlined[.unselected].outline.color` → outline-variant
- `outlined[.unselected].disabled.outline.color` → outline-variant
- `outlined.selected.container.color` → inverse-surface
- `outlined[.unselected][.{hovered|focused|pressed}].icon.color` → on-surface-variant
- `outlined.selected[.{hovered|focused|pressed}].icon.color` → inverse-on-surface
- `outlined[.unselected].{hovered|focused|pressed}.state-layer.color` → on-surface-variant; `outlined.selected.{…}.state-layer.color` → inverse-on-surface
- `outlined.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1
- `outlined.selected.disabled.container.color` → on-surface; `outlined.selected.disabled.container.opacity` → 0.1
- `outlined.disabled.icon.color` → on-surface; `outlined.disabled.icon.opacity` → 0.38

**Color – Standard (`standard`)**
- `standard[.unselected][.{hovered|focused|pressed}].icon.color` → on-surface-variant
- `standard.selected[.{hovered|focused|pressed}].icon.color` → primary
- `standard[.unselected].{hovered|focused|pressed}.state-layer.color` → on-surface-variant; `standard.selected.{…}.state-layer.color` → primary
- `standard.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1
- `standard.disabled.icon.color` → on-surface; `standard.disabled.icon.opacity` → 0.38

**Size sets** (`{xsmall|small|medium|large|xlarge}.` …; spaces are sys measurement tokens, shapes sys corner tokens)

| Token | xsmall | small | medium | large | xlarge |
| --- | --- | --- | --- | --- | --- |
| `container.height` | 32dp | 40dp | 56dp | 96dp | 136dp |
| `icon.size` | 20dp | 24dp | 24dp | 32dp | 40dp |
| `default.{leading|trailing}-space` | space75 (6) | space100 (8) | space200 (16) | space400 (32) | space600 (48) |
| `narrow.{leading|trailing}-space` | space50 (4) | space50 (4) | space150 (12) | space200 (16) | space400 (32) |
| `wide.{leading|trailing}-space` | space125 (10) | space175 (14) | space300 (24) | space600 (48) | space900 (72) |
| `outlined.outline.width` | 1dp | 1dp | 1dp | 2dp | 3dp |
| `container.shape.round` | full | full | full | full | full |
| `container.shape.square` | medium (12) | medium (12) | large (16) | extra-large (28) | extra-large (28) |
| `pressed.container.shape` | small (8) | small (8) | medium (12) | large (16) | large (16) |
| `selected.container.shape.round` | medium (12) | medium (12) | large (16) | extra-large (28) | extra-large (28) |
| `selected.container.shape.square` | full | full | full | full | full |
| `pressed.container.corner-size.motion.spring.stiffness` | `md.sys.motion.spring.fast.spatial.stiffness` (1400) | same | same | same | same |
| `pressed.container.corner-size.motion.spring.damping` | `md.sys.motion.spring.fast.spatial.damping` (0.9) | same | same | same | same |

## 5. States & interaction

State × part matrix (per style, values from §4.1):

| State | Container | Icon | State layer | Radius |
| --- | --- | --- | --- | --- |
| Enabled | rest color | rest color | 0 | rest (round/square) |
| Hovered | same | same | 0.08 | rest |
| Focused (`:focus-visible`) | same | same | 0.1 + focus ring primitive | rest |
| Pressed | same | same | 0.1 (+ ripple primitive) | pressed |
| Selected (+hover/focus/press) | selected color | selected color, filled glyph | selected state-layer color | selected (pressed while pressed) |
| Disabled (± selected) | §4.1 disabled | on-surface @ 0.38 | none | rest / selected rest |

- **Pressed shape morph**: round and square morph to the same pressed radius.
- **Selected shape morph**: round → selected.round (smaller radius); square → full.
- **Toggle icon**: outlined glyph unselected, filled glyph selected. If no filled version exists, increase weight to semibold (600), bold (700) if not enough — selection conveyed by ≥2 properties, not color alone (not for default buttons).
- **In button groups**: width changes and neighbour interaction — see button-groups.md.
- **Hover (web)**: tooltip with the accessibility label (describes the action, not the icon name).

## 6. Motion & behavior

- Corner radius: fast spatial spring (`--md-sys-motion-spring-fast-spatial-stiffness` / `-damping`; CSS helpers `-easing`/`-duration`) — spring primitive.
- Container/icon color, state-layer opacity, icon `FILL`/`wght`: fast effects spring (`--md-sys-motion-spring-fast-effects-*`) (derived: effects springs for color/opacity per guidelines).
- **Density**: none by default (keeps 48×48 targets). Optional user-chosen density: −4px height per step down to −3 (derived; widths/radii unchanged); touch target stays 48×48.
- Adaptive: use size and width to keep hierarchy; buttons of similar importance share the same size.
- RTL: symmetric; mirror only directional icons (arrow_back etc.) via `:dir(rtl)` `transform: scaleX(-1)` (web mapping).
- Reduced motion: radii snap; color changes keep a short effects transition.

## 7. Usage guidelines

- System icons with clear, unambiguous meaning; common actions only; only a few at once.
- **Filled**: highest emphasis, key actions (download, delete); sparingly. **Tonal**: secondary actions paired with a high-emphasis action. **Outlined**: medium emphasis (e.g. browsing card sets). **Standard**: low emphasis or on colorful surfaces.
- Use filled/tonal/outlined when more separation from the background is needed (e.g. on images).
- When mixing button types, use color styles to make the primary action clear.
- Emphasize the main action (play/pause, start/stop) by color or size; equal-importance buttons share the same size.

## 8. Accessibility

- Native `<button type="button">` (or `<a href>` for navigation); icon `aria-hidden="true"`; accessible name via `aria-label` describing the action (Add to favorites, Bookmark, Send message).
- Toggle: `aria-pressed="true|false"`, label constant (if the label must change with state, drop `aria-pressed`).
- Disabled: native `disabled`; use `aria-disabled="true"` instead when it must stay focusable (e.g. to show a tooltip explaining why) — then block activation in JS.
- Tooltip: on hover **and** keyboard focus (web mapping); since it repeats the name, mark it `aria-hidden="true"` (or use it as the name via `aria-labelledby` and omit `aria-label`). Dismiss on Escape.
- Contrast: icon ≥3:1 against surface/background (container ≥3:1 for container styles).
- Target: ≥48×48 CSS px even when nested.

| Key | Action |
| --- | --- |
| Tab | Focus lands on the (non-disabled) icon button |
| Space or Enter | Activates (toggles) the icon button |
| Escape | Hides the tooltip (web mapping) |

## 9. Implementation checklist

- [ ] API: `color` (`filled|tonal|outlined|standard`, default `filled`), `size` (`xsmall|small|medium|large|xlarge`, default `small`), `width` (`narrow|default|wide`), `shape` (`round|square`), `toggle`, `selected`, `disabled`, `label` (required), `href`/`target`, `type`, `name`/`value`; slots `icon`, `selected-icon`.
- [ ] Events: `click`; `change` (bubbles) when toggled.
- [ ] Box: height token, padding-inline = leading/trailing space, icon size; outline inside.
- [ ] State layer, ripple, focus ring, touch target primitives; standard has transparent container.
- [ ] Radius by state (rest / selected / pressed) animated with fast spatial spring.
- [ ] Icon swap outlined → filled (or `FILL` axis / weight fallback).
- [ ] Tooltip on hover/focus.
- [ ] Dev warning if `toggle` without a selected glyph strategy (derived).
- [ ] Reduced motion, forced colors.

## 10. HTML/CSS implementation blueprint

**(a) DOM**

```html
<button class="md-icon-button" type="button" data-color="filled" data-size="small" data-width="default" data-shape="round"
        aria-label="Add to favorites" aria-pressed="false" data-toggle>
  <span class="md-icon-button__state-layer" part="state-layer" aria-hidden="true"></span><!-- state layer + ripple primitives -->
  <span class="md-icon-button__icon material-symbols-rounded" part="icon" aria-hidden="true">favorite</span>
  <span class="md-icon-button__touch" aria-hidden="true"></span><!-- touch target primitive -->
</button>
<div class="md-tooltip" role="tooltip" aria-hidden="true" popover="manual">Add to favorites</div>
```
For glyphs without a `FILL` axis, slot two icons (`[slot=icon]`, `[slot=selected-icon]`) and show one based on `aria-pressed`.

**(b) Custom properties**

```css
.md-icon-button {
  /* size (small default) */
  --md-comp-icon-button-container-height: 40px;
  --md-comp-icon-button-icon-size: 24px;
  --md-comp-icon-button-leading-space: var(--md-sys-measurement-space100);
  --md-comp-icon-button-trailing-space: var(--md-sys-measurement-space100);
  --md-comp-icon-button-outline-width: 1px;
  --md-comp-icon-button-container-shape: calc(var(--md-comp-icon-button-container-height) / 2);
  --md-comp-icon-button-container-shape-square: var(--md-sys-shape-corner-medium);
  --md-comp-icon-button-pressed-container-shape: var(--md-sys-shape-corner-small);
  --md-comp-icon-button-selected-container-shape-round: var(--md-sys-shape-corner-medium);
  /* color (filled default) */
  --md-comp-icon-button-container-color: var(--md-sys-color-primary);
  --md-comp-icon-button-icon-color: var(--md-sys-color-on-primary);
  --md-comp-icon-button-outline-color: transparent;
}
.md-icon-button[data-size="xsmall"] { --md-comp-icon-button-container-height: 32px;  --md-comp-icon-button-icon-size: 20px; --_d: var(--md-sys-measurement-space75);  --_n: var(--md-sys-measurement-space50);  --_w: var(--md-sys-measurement-space125); --md-comp-icon-button-container-shape-square: var(--md-sys-shape-corner-medium);      --md-comp-icon-button-pressed-container-shape: var(--md-sys-shape-corner-small);  --md-comp-icon-button-selected-container-shape-round: var(--md-sys-shape-corner-medium); }
.md-icon-button[data-size="small"],
.md-icon-button:not([data-size])    { --_d: var(--md-sys-measurement-space100); --_n: var(--md-sys-measurement-space50);  --_w: var(--md-sys-measurement-space175); }
.md-icon-button[data-size="medium"] { --md-comp-icon-button-container-height: 56px;  --md-comp-icon-button-icon-size: 24px; --_d: var(--md-sys-measurement-space200); --_n: var(--md-sys-measurement-space150); --_w: var(--md-sys-measurement-space300); --md-comp-icon-button-container-shape-square: var(--md-sys-shape-corner-large);       --md-comp-icon-button-pressed-container-shape: var(--md-sys-shape-corner-medium); --md-comp-icon-button-selected-container-shape-round: var(--md-sys-shape-corner-large); }
.md-icon-button[data-size="large"]  { --md-comp-icon-button-container-height: 96px;  --md-comp-icon-button-icon-size: 32px; --_d: var(--md-sys-measurement-space400); --_n: var(--md-sys-measurement-space200); --_w: var(--md-sys-measurement-space600); --md-comp-icon-button-outline-width: 2px; --md-comp-icon-button-container-shape-square: var(--md-sys-shape-corner-extra-large); --md-comp-icon-button-pressed-container-shape: var(--md-sys-shape-corner-large);  --md-comp-icon-button-selected-container-shape-round: var(--md-sys-shape-corner-extra-large); }
.md-icon-button[data-size="xlarge"] { --md-comp-icon-button-container-height: 136px; --md-comp-icon-button-icon-size: 40px; --_d: var(--md-sys-measurement-space600); --_n: var(--md-sys-measurement-space400); --_w: var(--md-sys-measurement-space900); --md-comp-icon-button-outline-width: 3px; --md-comp-icon-button-container-shape-square: var(--md-sys-shape-corner-extra-large); --md-comp-icon-button-pressed-container-shape: var(--md-sys-shape-corner-large);  --md-comp-icon-button-selected-container-shape-round: var(--md-sys-shape-corner-extra-large); }
.md-icon-button                       { --md-comp-icon-button-leading-space: var(--_d); --md-comp-icon-button-trailing-space: var(--_d); }
.md-icon-button[data-width="narrow"]  { --md-comp-icon-button-leading-space: var(--_n); --md-comp-icon-button-trailing-space: var(--_n); }
.md-icon-button[data-width="wide"]    { --md-comp-icon-button-leading-space: var(--_w); --md-comp-icon-button-trailing-space: var(--_w); }

/* color styles: [data-toggle] uses unselected roles; [aria-pressed=true] selected roles */
.md-icon-button[data-color="filled"][data-toggle]                    { --md-comp-icon-button-container-color: var(--md-sys-color-surface-container); --md-comp-icon-button-icon-color: var(--md-sys-color-on-surface-variant); }
.md-icon-button[data-color="filled"][aria-pressed="true"]            { --md-comp-icon-button-container-color: var(--md-sys-color-primary); --md-comp-icon-button-icon-color: var(--md-sys-color-on-primary); }
.md-icon-button[data-color="tonal"]                                  { --md-comp-icon-button-container-color: var(--md-sys-color-secondary-container); --md-comp-icon-button-icon-color: var(--md-sys-color-on-secondary-container); }
.md-icon-button[data-color="tonal"][aria-pressed="true"]             { --md-comp-icon-button-container-color: var(--md-sys-color-secondary); --md-comp-icon-button-icon-color: var(--md-sys-color-on-secondary); }
.md-icon-button[data-color="outlined"]                               { --md-comp-icon-button-container-color: transparent; --md-comp-icon-button-icon-color: var(--md-sys-color-on-surface-variant); --md-comp-icon-button-outline-color: var(--md-sys-color-outline-variant); }
.md-icon-button[data-color="outlined"][aria-pressed="true"]          { --md-comp-icon-button-container-color: var(--md-sys-color-inverse-surface); --md-comp-icon-button-icon-color: var(--md-sys-color-inverse-on-surface); --md-comp-icon-button-outline-color: transparent; }
.md-icon-button[data-color="standard"]                               { --md-comp-icon-button-container-color: transparent; --md-comp-icon-button-icon-color: var(--md-sys-color-on-surface-variant); }
.md-icon-button[data-color="standard"][aria-pressed="true"]          { --md-comp-icon-button-icon-color: var(--md-sys-color-primary); }
```

**(c) Base, states**

```css
.md-icon-button {
  position: relative; display: inline-flex; align-items: center; justify-content: center; flex: none;
  box-sizing: border-box; block-size: var(--md-comp-icon-button-container-height);
  padding: 0; /* width set explicitly; icon centered by flex (leading = trailing at every size) */
  border: var(--md-comp-icon-button-outline-width) solid var(--md-comp-icon-button-outline-color);
  inline-size: calc(var(--md-comp-icon-button-leading-space) + var(--md-comp-icon-button-icon-size) + var(--md-comp-icon-button-trailing-space));
  border-radius: var(--_r, var(--md-comp-icon-button-container-shape));
  background: var(--md-comp-icon-button-container-color); color: var(--md-comp-icon-button-icon-color);
  cursor: pointer; -webkit-tap-highlight-color: transparent; outline: none;
}
.md-icon-button > .md-icon-button__icon { font-size: var(--md-comp-icon-button-icon-size); inline-size: 1em; block-size: 1em;
  font-variation-settings: 'FILL' 0, 'opsz' var(--_opsz, 24); } /* set --_opsz to the icon px value (20–48) */
.md-icon-button:not([data-toggle]) > .md-icon-button__icon,
.md-icon-button[aria-pressed="true"] > .md-icon-button__icon { font-variation-settings: 'FILL' 1, 'opsz' var(--_opsz, 24); }
.md-icon-button[data-shape="square"]                    { --_r: var(--md-comp-icon-button-container-shape-square); }
.md-icon-button[aria-pressed="true"]                    { --_r: var(--md-comp-icon-button-selected-container-shape-round); }
.md-icon-button[data-shape="square"][aria-pressed="true"] { --_r: calc(var(--md-comp-icon-button-container-height) / 2); }
.md-icon-button:not(:disabled,[aria-disabled="true"]):active,
.md-icon-button[data-pressed]                           { --_r: var(--md-comp-icon-button-pressed-container-shape); }
/* state layer: inset:0, border-radius:inherit, background: currentColor, opacity per state (state layer primitive) */
.md-icon-button:focus-visible { /* focus ring primitive, outer offset; follows border-radius */ }
.md-icon-button__touch { position: absolute; inset: 50% auto auto 50%; translate: -50% -50%;
  min-inline-size: 48px; min-block-size: 48px; inline-size: 100%; block-size: 100%; }
/* disabled */
.md-icon-button:is(:disabled,[aria-disabled="true"]) { cursor: default; pointer-events: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent); }
.md-icon-button:is(:disabled,[aria-disabled="true"]):is([data-color="standard"],[data-color="outlined"]:not([aria-pressed="true"])) { background: transparent; }
.md-icon-button:is(:disabled,[aria-disabled="true"]) .md-icon-button__state-layer { display: none; }
```
(`[aria-disabled]` keeps focusability; it needs `pointer-events: auto` for the tooltip and JS to cancel `click`.)

**(d) Motion**

```css
.md-icon-button {
  transition:
    border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    border-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
.md-icon-button__icon { transition: font-variation-settings var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) { .md-icon-button { transition-property: background-color, color, border-color; } }
```

**(e) Forced colors**

```css
@media (forced-colors: active) {
  .md-icon-button { border-color: ButtonText; }
  .md-icon-button[data-color="standard"] { border-color: transparent; }
  .md-icon-button[aria-pressed="true"] { forced-color-adjust: none; background: Highlight; color: HighlightText; border-color: Highlight; }
  .md-icon-button:disabled { color: GrayText; border-color: GrayText; }
  .md-icon-button:focus-visible { outline-color: Highlight; }
}
```

**(f) Behaviour (JS)**

- Toggle: on `click` flip `aria-pressed`, dispatch `change`; with `aria-disabled` cancel the click.
- `data-pressed`: set on `keydown` Space/Enter, clear on `keyup`/`blur` so keyboard activation shows the pressed morph.
- Tooltip: show after ~500ms hover delay or immediately on `:focus-visible` (derived; see tooltips.md for timings), position above/below the button with anchor positioning or JS; hide on `pointerleave`, `blur`, Escape.
- Icon weight fallback: when no filled glyph exists, selected sets `font-variation-settings: 'wght' 600` (700 if needed).
- Form: `type="submit"` + `name`/`value` work natively for `<button>`.

## 11. Source gaps & decisions

- **Outlined selected outline**: no `selected.outline.color` token → outline transparent (hidden under inverse-surface fill).
- **Outlined disabled outline**: token keeps outline-variant with no opacity → use it unmodified.
- **Selected-disabled**: no separate tokens for filled/tonal → same disabled container/icon as unselected.
- **Width** has no explicit token → leading + icon + trailing (matches the default = height rule at every size).
- **`full` radius** implemented as height/2 so radius transitions to/from pressed values animate linearly.
- **Color/icon-fill motion** not specified → fast effects spring; corners use the token-specified fast spatial spring.
- **Density**: source discourages default density, gives no values → optional −4px/step, targets stay 48px.
- **Disabled state images** label "10% state layer" → interpreted as the 0.1 disabled container opacity (tokens), not a state layer.
- **Tooltip timing** not specified here → defer to tooltips.md.
- Deprecated baseline token sets (filled/tonal/outlined icon-button) intentionally omitted.
