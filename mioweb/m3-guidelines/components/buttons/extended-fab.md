# Extended FAB

> Source: https://m3.material.io/components/extended-fab · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference and the shared implementation primitives (state layer, focus ring, ripple, elevation, spring, typography roles).

## 1. Overview
- FAB with a **text label** (and optional icon) for the most common or important action on a screen. More prominent than a regular FAB.
- Use when the label helps people understand the action (icon alone would be ambiguous), to add emphasis, or on long, scrolling views needing persistent access to an action (checkout, publish, new task).
- Only **one** extended FAB per screen. Don't use it as one option in a set of actions — use a filled button.
- Related: FAB (floating-action-button.md), FAB menu (fab-menu.md). FAB ⇄ extended FAB transform into each other depending on space/scroll.

**M3 Expressive changes (May 2025)**
- Three sizes aligned with FAB sizes: **small (56)**, **medium (80)**, **large (96)**, with larger type styles.
- **Baseline extended FAB (56) no longer recommended** → use **small** (type label-large → **title-medium**, inner padding reduced: icon-label gap 12→8, trailing 20→16).
- **Surface** (and branded) color extended FABs no longer recommended.
- Color styles same as FAB: primary/secondary/tertiary container (default primary-container) + primary/secondary/tertiary.
- vs M2: same height as FAB, boxier shape, simpler elevation model, dynamic color.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Small extended FAB | Height 56, title-medium, 24 icon | Default; replaces baseline |
| Medium extended FAB | Height 80, title-large, 28 icon | Larger breakpoints |
| Large extended FAB | Height 96, headline-small, 36 icon | Compact window with one prominent action, or larger breakpoints |
| Baseline extended FAB | Height 56, label-large, min width 80 | Not recommended |
| With / without icon | Icon optional; label mandatory | Never icon-only (that's a FAB) |
| Color: 6 styles | container = role, label/icon = on-role | Same as FAB |
| Color: Surface, Branded (baseline) | surface-container-high container | Not recommended |
| Collapsed (FAB form) | Same size family FAB: 56/80/96 square | Scroll / responsive transform (§6) |

## 3. Anatomy
1. **Container** — rounded rectangle hugging its contents; width grows/shrinks with label.
2. **Icon** (optional) — leading (trailing side in RTL).
3. **Label text** — 1–2 words, single line.
4. **State layer** (implementation) — state layer primitive, color = label/icon color.
5. **Focus ring** (implementation) — focus ring primitive (outer offset).

## 4. Tokens & specs

### 4.1 Color
Pattern for every `<set>`: container `--md-sys-color-<role>`; label, icon and state layer `--md-sys-color-on-<role>`; shadow `--md-sys-color-shadow`. State layer must equal the icon/label color. Label/icon color is constant across states.

| Style (`<set>`) | Container | Label / icon / state layer |
| --- | --- | --- |
| `primary-container` (default) | `--md-sys-color-primary-container` (#eaddff) | `--md-sys-color-on-primary-container` (#4f378b) |
| `secondary-container` | `--md-sys-color-secondary-container` (#e8def8) | `--md-sys-color-on-secondary-container` (#4a4458) |
| `tertiary-container` | `--md-sys-color-tertiary-container` (#ffd8e4) | `--md-sys-color-on-tertiary-container` (#633b48) |
| `primary` | `--md-sys-color-primary` (#6750a4) | `--md-sys-color-on-primary` (#ffffff) |
| `secondary` | `--md-sys-color-secondary` (#625b71) | `--md-sys-color-on-secondary` (#ffffff) |
| `tertiary` | `--md-sys-color-tertiary` (#7d5260) | `--md-sys-color-on-tertiary` (#ffffff) |
| `surface` (baseline) | `surface-container-high` (#ece6f0); lowered `surface-container-low` (#f7f2fa) | `--md-sys-color-primary` |
| `branded` (baseline) | same as surface | label enabled `--md-sys-color-on-surface` (#1d1b20); hover/focus/pressed label + state layer `--md-sys-color-primary`; no icon color token (derived: use `primary`) |

- State-layer opacities: hover 0.08, focus 0.10, pressed 0.10.
- Focus ring: `--md-sys-color-secondary`, 3px, 2px outer offset (tokenized only in baseline sets; applied to all).
- Disabled: no tokens (don't disable; hide instead).

### 4.2 Size, layout & shape

| Size | Height | Icon | Leading | Icon–label gap | Trailing | Corner radius | Label role | Collapsed (FAB) width / icon inset |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small | 56 | 24 | 16 (`space200`) | 8 (`space100`) | 16 (`space200`) | `--md-sys-shape-corner-large` 16 | title-medium | 56 / 16 |
| Medium | 80 | 28 | 26 | 12 (`space150`) | 26 | `--md-sys-shape-corner-large-increased` 20 | title-large | 80 / 26 |
| Large | 96 | 36 | 28 | 16 (`space200`) | 28 | `--md-sys-shape-corner-extra-large` 28 | headline-small | 96 / 30 |
| Baseline | 56 | 24 | 16 (`space200`) | 12 (`space150`) | 20 (`space250`) | `--md-sys-shape-corner-large` 16 | label-large | 56 / 16 |

- Width: hugs content (`inline-size: max-content`). Baseline min width **80** (source). Expressive sizes: no min width given → (derived) `min-inline-size` = container height so it's never narrower than its FAB.
- Without icon: leading/trailing spacing around label only (baseline "without icon" shows 16 padding; derived for expressive: use the size's leading/trailing).
- Corner radius equals the matching FAB size → collapsing never changes the radius, only width/padding.
- Label: single line, `white-space: nowrap`, never truncated; extends the container instead. Max width: none (derived: if it would exceed the window minus 2×16 margin, the label is too long — shorten copy).
- Content vertically centered; icon box = icon size.
- Screen margins: **16** from window edges (source); add `env(safe-area-inset-*)`.
- Touch target ≥ 48 for all sizes; no touch target primitive needed.

### 4.3 Typography

| Size | Role | Values (font / weight / size / line-height / tracking) |
| --- | --- | --- |
| Small | `md.sys.typescale.title-medium` | plain / 500 / 16 / 24 / 0.15 |
| Medium | `md.sys.typescale.title-large` | brand / 400 / 22 / 28 / 0 |
| Large | `md.sys.typescale.headline-small` | brand / 400 / 24 / 32 / 0 |
| Baseline / surface / branded | `md.sys.typescale.label-large` | plain / 500 / 14 / 20 / 0.1 |

Apply with the typography roles primitive.

### 4.4 Elevation
| State | Elevation | Lowered (baseline surface/branded) |
| --- | --- | --- |
| Enabled | level3 (6) | level1 (1) |
| Hovered | level4 (8) | level2 (3) |
| Focused | level3 | level1 |
| Pressed | level3 | level1 |

### 4.5 Component token list

**Size – Small (`md.comp.extended-fab.small`)**
- md.comp.extended-fab.small.container.height → 56dp
- md.comp.extended-fab.small.label-text → md.sys.typescale.title-medium
- md.comp.extended-fab.small.icon.size → 24dp
- md.comp.extended-fab.small.container.shape → md.sys.shape.corner.large (16dp)
- md.comp.extended-fab.small.leading-space → md.sys.measurement.space200 (16dp)
- md.comp.extended-fab.small.icon-label-space → md.sys.measurement.space100 (8dp)
- md.comp.extended-fab.small.trailing-space → md.sys.measurement.space200 (16dp)

**Size – Medium (`md.comp.extended-fab.medium`)**
- md.comp.extended-fab.medium.container.height → 80dp
- md.comp.extended-fab.medium.label-text → md.sys.typescale.title-large
- md.comp.extended-fab.medium.icon.size → 28dp
- md.comp.extended-fab.medium.container.shape → md.sys.shape.corner.large-increased (20dp)
- md.comp.extended-fab.medium.leading-space → 26dp
- md.comp.extended-fab.medium.icon-label-space → md.sys.measurement.space150 (12dp)
- md.comp.extended-fab.medium.trailing-space → 26dp

**Size – Large (`md.comp.extended-fab.large`)**
- md.comp.extended-fab.large.container.height → 96dp
- md.comp.extended-fab.large.label-text → md.sys.typescale.headline-small
- md.comp.extended-fab.large.icon.size → 36dp
- md.comp.extended-fab.large.container.shape → md.sys.shape.corner.extra-large (28dp)
- md.comp.extended-fab.large.leading-space → 28dp
- md.comp.extended-fab.large.icon-label-space → md.sys.measurement.space200 (16dp)
- md.comp.extended-fab.large.trailing-space → 28dp

**Size – Baseline (`md.comp.extended-fab`, not recommended)**
- md.comp.extended-fab.container.height → 56dp
- md.comp.extended-fab.leading-space → md.sys.measurement.space200 (16dp)
- md.comp.extended-fab.icon-label-space → md.sys.measurement.space150 (12dp)
- md.comp.extended-fab.trailing-space → md.sys.measurement.space250 (20dp)
- md.comp.extended-fab.label-text → md.sys.typescale.label-large
- md.comp.extended-fab.icon.size → 24dp
- md.comp.extended-fab.container.shape → md.sys.shape.corner.large (16dp)

**Color sets** — identical structure for `<set>` ∈ {`primary-container`, `secondary-container`, `tertiary-container`, `primary`, `secondary`, `tertiary`} (`<role>` = set, `<on>` = `on-<set>`):
- md.comp.extended-fab.<set>.container.color → md.sys.color.<role>
- md.comp.extended-fab.<set>.container.elevation → md.sys.elevation.level3
- md.comp.extended-fab.<set>.container.shadow-color → md.sys.color.shadow
- md.comp.extended-fab.<set>.label-text.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.icon.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.hovered.container.elevation → md.sys.elevation.level4
- md.comp.extended-fab.<set>.hovered.state-layer.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- md.comp.extended-fab.<set>.hovered.label-text.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.hovered.icon.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.focused.container.elevation → md.sys.elevation.level3
- md.comp.extended-fab.<set>.focused.state-layer.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.10)
- md.comp.extended-fab.<set>.focused.label-text.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.focused.icon.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.pressed.container.elevation → md.sys.elevation.level3
- md.comp.extended-fab.<set>.pressed.state-layer.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10)
- md.comp.extended-fab.<set>.pressed.label-text.color → md.sys.color.<on>
- md.comp.extended-fab.<set>.pressed.icon.color → md.sys.color.<on>

**Baseline – Surface (`md.comp.extended-fab.surface.*`, not recommended)**
- container.color → md.sys.color.surface-container-high; lowered.container.color → md.sys.color.surface-container-low
- container.shape → md.sys.shape.corner.large; container.height → 56dp
- container.elevation → md.sys.elevation.level3; lowered.container.elevation → md.sys.elevation.level1; container.shadow-color → md.sys.color.shadow
- hover.container.elevation → md.sys.elevation.level4; lowered.hover.container.elevation → md.sys.elevation.level2
- focus.container.elevation → md.sys.elevation.level3; lowered.focus.container.elevation → md.sys.elevation.level1
- pressed.container.elevation → md.sys.elevation.level3; lowered.pressed.container.elevation → md.sys.elevation.level1
- icon.size → 24dp; icon.color, hover.icon.color, focus.icon.color, pressed.icon.color → md.sys.color.primary
- label-text.color, hover.label-text.color, focus.label-text.color, pressed.label-text.color → md.sys.color.primary
- label-text.font / .line-height / .size / .weight / .tracking → md.sys.typescale.label-large.* (Roboto, 20, 14, 500, 0.1); label-text.type → label-large font (md.ref.typeface.plain)
- hover.state-layer.color → md.sys.color.primary; hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity
- focus.state-layer.color → md.sys.color.primary; focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity
- pressed.state-layer.color → md.sys.color.primary; pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity
- focus.indicator.color → md.sys.color.secondary; focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp); focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)

**Baseline – Branded (`md.comp.extended-fab.branded.*`, not recommended)** — same keys as Surface except:
- label-text.color → md.sys.color.on-surface; hover/focus/pressed.label-text.color → md.sys.color.primary
- icon.size → 36dp (as in source; see §11); no icon.color tokens
- state layers → md.sys.color.primary (0.08 / 0.10 / 0.10); focus indicator, container, elevation, shape, label typography same as Surface.

## 5. States & interaction

| State | Container | Label / icon | State layer | Elevation | Other |
| --- | --- | --- | --- | --- | --- |
| Enabled | role | on-role | — | level3 | — |
| Hovered | role | on-role | on-role @ 0.08 | level4 | no tooltip when expanded |
| Focused (`:focus-visible`) | role | on-role | on-role @ 0.10 | level3 | focus ring |
| Pressed | role | on-role | on-role @ 0.10 + ripple | level3 | — |
| Collapsed + hover/focus | role | icon only | as above | as above | tooltip with label (derived: behaves like FAB) |
| Disabled | — | — | — | — | not supported; hide |

- Icon + label = one focusable element. No press shape morph.

## 6. Motion & behavior
- **Appearing**: container expands on screen using the enter/exit transition pattern (derived: scale from center 0→1 like FAB + label fade).
- **Expanding**: container transform into any surface (app-structure or full screen).
- **Collapse/expand on scroll**: → FAB when scrolling down, → extended when scrolling up (also expand on reaching the bottom of the view, per FAB page).
- **FAB → extended (source)**: shape changes, icon moves to the leading side, label fades in. Reverse on collapse.
- **Morph mechanics (derived)**: same size family (small ⇄ FAB 56, medium ⇄ medium FAB 80, large ⇄ large FAB 96) so height and radius are constant; animate: label column width `1fr ⇄ 0fr`, icon-label gap → 0, padding-inline → (height − icon)/2, label opacity.
  - Width / padding / gap: spring primitive `default-spatial` (expressive scheme may overshoot slightly; clip with `overflow: hidden`).
  - Label opacity: `fast-effects`; on collapse fade out first (opacity reaches 0 before width finishes), on expand start fade after ~1/3 of width motion (derived: delay `--md-sys-motion-duration-short2`).
- Requires an icon to collapse; an icon-less extended FAB must not collapse (derived — a FAB can't be empty).
- **Responsive**: collapsed navigation rail → FAB; expanded rail → extended FAB.
- **Breakpoints**: compact/medium → bottom, center-aligned or trailing-edge aligned. Expanded+ → bottom-right of window (**both LTR and RTL**) or at the top of the expanded navigation rail.
- **RTL**: icon to the right of the label (logical properties do this automatically).

## 7. Usage guidelines
- Size: right emphasis; large OK in compact with a single prominent action; medium/large on larger breakpoints.
- Label: 1–2 words, clearly describes the action; account for localization growth; never wrap or truncate.
- Icon optional; must relate clearly to the label. Never icon-only.
- One extended FAB per screen; further high-level actions → buttons elsewhere.
- Placement: above the rest of the UI, off app bars. Not on toolbars, not in the upper half of a mobile screen, not on cards/dialogs/other containers, not over other actionable elements.
- Don't show with other floating components (floating toolbars pair with FABs, not extended FABs).

## 8. Accessibility
- **Role**: native `<button type="button">` (or `<a href>` for navigation). Visible label = accessible name; icon `aria-hidden="true"`.
- If `aria-label` is set it must **start with the visible label's first word** ("Create" → "Create a new invite") (label-in-name).
- Collapsed: keep the label element in the DOM (clipped + `opacity:0`, not `display:none`) so the name persists; show a tooltip on hover/focus.
- **Keyboard**:

| Key | Action |
| --- | --- |
| Tab | Moves focus to the extended FAB |
| Space / Enter | Activates the extended FAB |

- Focus order: prioritize (app bar → navigation → extended FAB). Large web screens: consider upper-left placement (expanded navigation rail).
- No tooltip while expanded (visible label).
- Contrast: label/icon vs container ≥ 4.5:1 for text (all token pairs satisfy) (web mapping).
- Collapsing must not move focus or change the accessible name.

## 9. Implementation checklist
- [ ] API: `label` (required), `icon` slot (optional), `size` = `small` (default) | `medium` | `large` (opt. `baseline`), `color` = 6 styles (default `primary-container`; opt. `surface`, `branded`, `lowered`), `collapsed` boolean, optional `href`, `aria-label` override, `click`.
- [ ] Structure: container → state layer, ripple, [icon], label wrapper (for width animation).
- [ ] Logical properties for RTL.
- [ ] Pure-CSS collapse animation; reduced-motion fallback.
- [ ] Optional scroll controller (collapse on scroll down, expand on scroll up / bottom reached).
- [ ] Label `nowrap`; no truncation.
- [ ] No disabled state; hide instead.
- [ ] All values via `--md-comp-extended-fab-*` → `--md-sys-*`.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<button type="button" class="md-efab" data-size="small" data-color="primary-container">
  <span class="md-efab__state-layer" part="state-layer" aria-hidden="true"></span><!-- + ripple primitive -->
  <span class="md-efab__icon material-symbols-rounded" part="icon" aria-hidden="true">edit</span>
  <span class="md-efab__label-wrap"><span class="md-efab__label" part="label">Compose</span></span>
</button>
<!-- collapsed: add data-collapsed; link variant: <a class="md-efab" href="…"> -->
```

**(b) Custom properties**
```css
.md-efab {
  --md-comp-extended-fab-container-height: 56px;
  --md-comp-extended-fab-icon-size: 24px;
  --md-comp-extended-fab-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-extended-fab-leading-space: var(--md-sys-measurement-space200);
  --md-comp-extended-fab-icon-label-space: var(--md-sys-measurement-space100);
  --md-comp-extended-fab-trailing-space: var(--md-sys-measurement-space200);
  --md-comp-extended-fab-label-font: var(--md-sys-typescale-title-medium-font);
  --md-comp-extended-fab-label-weight: var(--md-sys-typescale-title-medium-weight);
  --md-comp-extended-fab-label-size: var(--md-sys-typescale-title-medium-size);
  --md-comp-extended-fab-label-line-height: var(--md-sys-typescale-title-medium-line-height);
  --md-comp-extended-fab-label-tracking: var(--md-sys-typescale-title-medium-tracking);
  --md-comp-extended-fab-container-color: var(--md-sys-color-primary-container);
  --md-comp-extended-fab-content-color: var(--md-sys-color-on-primary-container); /* label + icon + state layer */
  --md-comp-extended-fab-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-extended-fab-hover-container-elevation: var(--md-sys-elevation-level4);
  --md-comp-extended-fab-focus-indicator-color: var(--md-sys-color-secondary);
}
.md-efab[data-size="medium"] {
  --md-comp-extended-fab-container-height: 80px; --md-comp-extended-fab-icon-size: 28px;
  --md-comp-extended-fab-container-shape: var(--md-sys-shape-corner-large-increased);
  --md-comp-extended-fab-leading-space: 26px; --md-comp-extended-fab-trailing-space: 26px;
  --md-comp-extended-fab-icon-label-space: var(--md-sys-measurement-space150);
  --md-comp-extended-fab-label-font: var(--md-sys-typescale-title-large-font);
  --md-comp-extended-fab-label-weight: var(--md-sys-typescale-title-large-weight);
  --md-comp-extended-fab-label-size: var(--md-sys-typescale-title-large-size);
  --md-comp-extended-fab-label-line-height: var(--md-sys-typescale-title-large-line-height);
  --md-comp-extended-fab-label-tracking: var(--md-sys-typescale-title-large-tracking);
}
.md-efab[data-size="large"] {
  --md-comp-extended-fab-container-height: 96px; --md-comp-extended-fab-icon-size: 36px;
  --md-comp-extended-fab-container-shape: var(--md-sys-shape-corner-extra-large);
  --md-comp-extended-fab-leading-space: 28px; --md-comp-extended-fab-trailing-space: 28px;
  --md-comp-extended-fab-icon-label-space: var(--md-sys-measurement-space200);
  --md-comp-extended-fab-label-font: var(--md-sys-typescale-headline-small-font);
  --md-comp-extended-fab-label-weight: var(--md-sys-typescale-headline-small-weight);
  --md-comp-extended-fab-label-size: var(--md-sys-typescale-headline-small-size);
  --md-comp-extended-fab-label-line-height: var(--md-sys-typescale-headline-small-line-height);
  --md-comp-extended-fab-label-tracking: var(--md-sys-typescale-headline-small-tracking);
}
/* color styles: same pattern as FAB, e.g. */
.md-efab[data-color="tertiary"] { --md-comp-extended-fab-container-color: var(--md-sys-color-tertiary); --md-comp-extended-fab-content-color: var(--md-sys-color-on-tertiary); }

.md-efab {
  --_collapsed-inset: calc((var(--md-comp-extended-fab-container-height) - var(--md-comp-extended-fab-icon-size)) / 2);
  position: relative; display: inline-flex; align-items: center; overflow: hidden; flex: none;
  block-size: var(--md-comp-extended-fab-container-height);
  min-inline-size: var(--md-comp-extended-fab-container-height);
  padding-block: 0;
  padding-inline: var(--md-comp-extended-fab-leading-space) var(--md-comp-extended-fab-trailing-space);
  gap: var(--md-comp-extended-fab-icon-label-space);
  border: 0; border-radius: var(--md-comp-extended-fab-container-shape);
  background: var(--md-comp-extended-fab-container-color); color: var(--md-comp-extended-fab-content-color);
  box-shadow: var(--md-comp-extended-fab-container-elevation); /* elevation primitive */
  font: var(--md-comp-extended-fab-label-weight) var(--md-comp-extended-fab-label-size)/var(--md-comp-extended-fab-label-line-height) var(--md-comp-extended-fab-label-font);
  letter-spacing: var(--md-comp-extended-fab-label-tracking);
  cursor: pointer; text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.md-efab__icon { flex: none; inline-size: var(--md-comp-extended-fab-icon-size); block-size: var(--md-comp-extended-fab-icon-size);
  font-size: var(--md-comp-extended-fab-icon-size); line-height: 1; font-variation-settings: 'FILL' 1; }
.md-efab__label-wrap { display: grid; grid-template-columns: 1fr; min-inline-size: 0; }
.md-efab__label { overflow: hidden; white-space: nowrap; }
.md-efab__state-layer { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: var(--md-comp-extended-fab-content-color); opacity: 0; }
/* collapsed (FAB form) */
.md-efab[data-collapsed] { padding-inline: var(--_collapsed-inset); gap: 0; }
.md-efab[data-collapsed] .md-efab__label-wrap { grid-template-columns: 0fr; }
.md-efab[data-collapsed] .md-efab__label { opacity: 0; }
```

**(c) States**
```css
.md-efab:hover { box-shadow: var(--md-comp-extended-fab-hover-container-elevation); }
.md-efab:hover .md-efab__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-efab:focus-visible .md-efab__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-efab:active .md-efab__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-efab:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-extended-fab-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
```
Note: `overflow: hidden` does not clip the host's own `outline`, so the outer ring remains visible.

**(d) Motion**
```css
.md-efab {
  transition:
    padding-inline var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
    gap var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
    box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
.md-efab__label-wrap { transition: grid-template-columns var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.md-efab__label { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing) var(--md-sys-motion-duration-short2); }
.md-efab[data-collapsed] .md-efab__label { transition-delay: 0s; }   /* fade out immediately */
.md-efab__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-efab, .md-efab__label-wrap { transition-duration: 1ms; }
  .md-efab__label { transition: opacity var(--md-sys-motion-duration-short2) linear; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-efab { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; box-shadow: none; }
  .md-efab:focus-visible { outline-color: Highlight; }
  .md-efab__state-layer { display: none; }
}
```

**(f) Behaviour/JS**
- Native button covers keyboard/click.
- Scroll controller (optional, outside core): on `scroll` of the scroll container (rAF-throttled) compare `scrollTop` with the last value; delta > 8px down → `data-collapsed`; delta > 8px up or `scrollTop + clientHeight >= scrollHeight - 1` → remove it (derived threshold). Never collapse when no icon slot.
- When collapsed, attach tooltip (tooltips.md) using the label text; detach when expanded.
- Responsive: toggle `data-collapsed` from the navigation rail's expanded state.

## 11. Source gaps & decisions
- **Morph timing/springs**: source only describes the sequence (shape, icon moves, label fades) → spring primitive `default-spatial` for geometry, `fast-effects` for label fade with short delay on expand.
- **Collapsed geometry**: not specified → matching FAB size (same height/radius tokens); padding = (height − icon)/2.
- **Min width (expressive)**: only baseline has 80 min → `min-inline-size` = container height.
- **Branded icon.size 36dp**: conflicts with 56 height baseline (surface uses 24) — kept as source states, but implementation uses 24 for branded (derived: 36 icon in a 56 container is inconsistent with all other 56 sets).
- **Branded icon color**: no token → use `primary` (matches surface and branded state colors).
- **Focus ring**: only in baseline sets → applied to all styles.
- **Placement contradiction**: accessibility tab says "lower right corner" in small windows; guidelines say bottom center or trailing edge → support both; trailing edge default.
- **Expressive "without icon" padding**: only baseline shown → use size's leading/trailing.
- **Scroll threshold / bottom detection**: not specified → 8px delta, 1px bottom tolerance.
- **Disabled**: no tokens; hide instead.
