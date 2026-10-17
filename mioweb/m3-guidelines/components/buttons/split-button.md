# Split button

> Source: https://m3.material.io/components/split-button · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference and shared primitives. Builds on buttons.md (color, typography, icon sizes) and menus.md (the menu).

## 1. Overview

A split button pairs a main action (leading button) with a menu of related actions (trailing menu button). It reduces visual complexity by hiding extra options.

- Use to show an action plus a menu of related actions; works alone or next to buttons, icon buttons and button groups.
- Typically opens a menu; can be customized to open other components (e.g. cards). Don't modify the menu in unusual ways.
- Scale up in large breakpoints, or for hero emphasis in compact windows. May differ in size from neighbouring buttons.

**M3 Expressive changes (May 2025)**: new component. Separate menu button that rotates and changes shape when activated. Sizes XS, S, M, L, XL; color styles elevated, filled, tonal, outlined.

## 2. Variants & configurations

| Variant / configuration | Values | Notes |
| --- | --- | --- |
| Split button | single variant | |
| Size | XS 32, S 40 (default), M 56, L 96, XL 136 dp | Same sizes as buttons/icon buttons. |
| Color | Elevated, Filled (default, derived from buttons), Tonal, Outlined | Uses button color tokens (default, non-toggle); **no text style**; color does **not** change when the menu is open (only a state layer). |
| Leading button content | Label + icon, label only, icon only | |
| Trailing button content | Expand/collapse (menu) icon, always | Don't replace the icon. |

## 3. Anatomy

1. **Leading button** – main action; outer corners full, inner (trailing-side) corners small.
2. **Icon** (optional) – leading button icon.
3. **Label text** – leading button label (1–2 words).
4. **Trailing button** – menu icon button; toggles the menu; icon rotates 180°.
5. **Between-space** – 2dp gap between the two buttons.
6. **Menu** (external) – placed 4dp from the split button.
7. State layer, focus ring and touch target primitives per button (implicit).

## 4. Tokens & specs

### 4.1 Color

Reuses **button** color sets `md.comp.button.{elevated|filled|tonal|outlined}` — **default (un-prefixed) tokens** for both halves (see buttons.md §4.1/§4.5). The `selected.*` / `unselected.*` toggle tokens are **not** used.

| Style | Container | Label & icon & state layer | Outline | Elevation |
| --- | --- | --- | --- | --- |
| Elevated | `--md-sys-color-surface-container-low` | `--md-sys-color-primary` | — | level1 (disabled level0) |
| Filled | `--md-sys-color-primary` | `--md-sys-color-on-primary` | — | level0 |
| Tonal | `--md-sys-color-secondary-container` | `--md-sys-color-on-secondary-container` | — | level0 |
| Outlined | transparent | `--md-sys-color-on-surface-variant` | `--md-sys-color-outline-variant`, per half | — |

- State-layer opacity: hover 0.08, focus 0.10, pressed 0.10.
- **Trailing selected (menu open)**: same colors + a persistent state layer at 0.10 (source video "10% state layer"; derived: `--md-sys-state-pressed-state-layer-opacity`). Hover/focus while selected keep 0.10 (highest of the combined states).
- Disabled: container on-surface @ 0.10 (outlined: transparent, outline kept), content on-surface @ 0.38, elevation level0, no state layer.

### 4.2 Size, layout & shape

**Dimensions**

| Size | Height | Leading btn: leading / trailing space | Leading btn icon / icon–label gap (from buttons) | Trailing btn: leading / icon / trailing | Trailing btn width (derived: sum) | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| XS | 32dp | 12 / 10dp | 20 / 4dp | 13 / 22 / 13dp | 48dp | 2dp |
| S | 40dp | 16 / 12dp | 20 / 8dp | 13 / 22 / 13dp | 48dp | 2dp |
| M | 56dp | 24 / 24dp | 24 / 8dp | 15 / 26 / 15dp | 56dp | 2dp |
| L | 96dp | 48 / 48dp | 32 / 12dp | 29 / 38 / 29dp | 96dp | 2dp |
| XL | 136dp | 64 / 64dp | 40 / 16dp | 43 / 50 / 43dp | 136dp | 2dp |

- The asymmetric leading-button padding at XS/S (12/10, 16/12) is the source's optical centering for the asymmetric shape.
- Leading button icon-only: same leading/trailing space around the icon (derived; no token).
- Label: `white-space: nowrap`; never truncated (1–2 words).

**Corner radii** (outer = side away from the gap; inner = side facing the gap; `full` = height/2)

| Corner | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| Outer corners (both buttons, all states) | full (16; `container.shape`, XS also `outer-corner.corner-size` 50%) | full (20) | full (28) | full (48) | full (68) |
| Inner – enabled / disabled | 4 (`corner-value.extra-small`) | 4 | 4 | 8 (`corner-value.small`) | 12 (`corner-value.medium`) |
| Inner – hovered, focused (derived = hovered) | 8 (`corner-value.small`) | 12 (`corner-value.medium`) | 12 | 20 (`corner-value.large-increased`) | 20 |
| Inner – pressed | 8 | 12 | 12 | 20 | 20 |
| Trailing inner – selected (menu open, any interaction) | 50% → full (16) | full (20) | full (28) | full (48) | full (68) |

- Selected trailing button = fully rounded pill (XS/S: 48×32 / 48×40 pill; M–XL: circle).
- **Optical centering of the menu icon**: unselected icon offset from center XS −1, S −1, M −2, L −3, XL −6dp (derived direction: toward the inner/gap side, i.e. the flatter side; mirrors in RTL). Selected (symmetric) → centered.
- Touch target: each button ≥48×48dp; XS/S need 48dp-tall target areas (touch target primitive).

### 4.3 Typography

Not in split-button tokens (derived from buttons): XS/S `label-large`, M `title-medium`, L `headline-small`, XL `headline-large` (typography role pattern).

### 4.4 Elevation

Per button color tokens: elevated level1 (enabled/focused/pressed), level0 disabled; others level0. Each half casts its own shadow (derived). Hover lift as buttons.md §4.4 (derived).

### 4.5 Component token list

Prefix `md.comp.split-button.` omitted; CSS `--md-comp-split-button-<rest-with-dashes>`. Color: `md.comp.button.{elevated|filled|tonal|outlined}.*` default tokens (see buttons.md §4.5). Verified complete against the 5 size sets.

| Token (`<size>.` …) | xsmall | small | medium | large | xlarge |
| --- | --- | --- | --- | --- | --- |
| `container.height` | 32dp | 40dp | 56dp | 96dp | 136dp |
| `container.shape` | corner.full | corner.full | corner.full | corner.full | corner.full |
| `outer-corner.corner-size` | 50% | — | — | — | — |
| `between-space` | space25 (2) | space25 (2) | space25 (2) | space25 (2) | space25 (2) |
| `inner-corner.corner-size` | corner-value.extra-small (4) | extra-small (4) | extra-small (4) | small (8) | medium (12) |
| `inner-corner.hovered.corner-size` | corner-value.small (8) | medium (12) | medium (12) | large-increased (20) | large-increased (20) |
| `inner-corner.pressed.corner-size` | corner-value.small (8) | medium (12) | medium (12) | large-increased (20) | large-increased (20) |
| `trailing-button.inner-corner.selected.corner-size` | 50% | 50% | 50% | 50% | 50% |
| `leading-button.leading-space` | space150 (12) | space200 (16) | space300 (24) | space600 (48) | space800 (64) |
| `leading-button.trailing-space` | space125 (10) | space150 (12) | space300 (24) | space600 (48) | space800 (64) |
| `trailing-button.icon.size` | 22dp | 22dp | 26dp | 38dp | 50dp |
| `trailing-button.leading-space` | 13dp | 13dp | 15dp | 29dp | 43dp |
| `trailing-button.trailing-space` | 13dp | 13dp | 15dp | 29dp | 43dp |

## 5. States & interaction

**State × part matrix** (per half; each half is an independent button)

| State | Inner corners | Outer | Colors | State layer | Icon (trailing) |
| --- | --- | --- | --- | --- | --- |
| Enabled | inner | full | default | 0 | 0°, offset |
| Hovered | hovered | full | default | 0.08 | 0°, offset |
| Focused (`:focus-visible`) | hovered (derived) | full | default | 0.10 + focus ring | 0°, offset |
| Pressed (± focus) | pressed | full | default | 0.10 (+ ripple) | 0°, offset |
| Selected (trailing; menu open) (± hover/focus/press) | full (50%) | full | default | 0.10 | 180°, centered |
| Disabled | inner | full | disabled recipe | none | 0°, offset |

- Leading and trailing morph independently; hovering one half does not change the other (derived: source shows per-button states).
- **Icon rotation**: rotates **180° inwards** on open and back on close.
- Disabled: per button tokens; the halves can be disabled independently (derived), commonly both together.
- Keyboard: Tab moves between the two buttons; Space/Enter activates the focused one. Escape closes the menu and returns focus to the trailing button (web mapping, menu pattern).

## 6. Motion & behavior

| What | Motion | CSS |
| --- | --- | --- |
| Menu icon rotation (180°) | **standard** motion scheme (source); fast spatial (derived: small component) = 1400 / 0.9 | `cubic-bezier(0.27, 1.06, 0.18, 1.00)` 350ms (guidelines conversion table, standard fast spatial) — literal so it stays standard even if the product uses the expressive scheme |
| Inner-corner morph (hover/press/select) | not specified (derived: fast spatial spring as buttons' `pressed.container.corner-size.motion.spring`) | `--md-sys-motion-spring-fast-spatial-duration` / `-easing` |
| Icon re-centering (offset → 0) | same as rotation (derived) | translate transition, same curve |
| State layer / colors / shadow | fast effects (derived) | `--md-sys-motion-spring-fast-effects-*` |

- **Rotation direction "inwards"** (derived): the chevron's sweep passes the gap side: LTR `rotate(180deg)` (clockwise: down → left → up), RTL `rotate(-180deg)`; closing reverses to 0.
- **Menu placement**: align the menu with the trailing button when possible (menu leading edge = trailing button leading edge). If there's no room, align to a side of the leading or trailing button. Depending on breakpoint/scroll it may appear above or below: top/bottom aligned to the trailing button, or top/bottom right/left aligned. Always align to one of the button edges. **Gap: 4dp** from the split button.
- RTL: whole layout mirrors (trailing button on the left).
- Reduced motion: no corner morph; icon rotation becomes instant (state still conveyed by `aria-expanded` and the 10% layer).
- Adaptive: scale up size at larger breakpoints.

## 7. Usage guidelines

- Leading label: brief, 1–2 words, with an icon that best matches the action. Avoid long labels.
- Trailing button: always the expand/collapse icon (it rotates); don't change it.
- Split buttons can sit next to buttons and button groups; prominent controls may be larger than secondary ones.
- Open a menu; don't restyle the menu unusually.

## 8. Accessibility

- Each button: ≥48×48dp target; XS/S need 48dp-tall target areas.
- Focus order: leading button, then trailing button (DOM order; visual order mirrors in RTL; may depend on OS settings).
- **Labels**: leading button = same as a normal button (visible label, e.g. "Watch later"; icon-only → `aria-label`). Trailing button = describes additional options related to the main action (e.g. "More watch options") and exposes expanded/collapsed state.
- **Web mapping**: wrapper `role="group"` (optional `aria-label`). Leading: `<button>`. Trailing: `<button aria-haspopup="menu" aria-expanded="true|false" aria-controls="<menu-id>" aria-label="More … options">`. Menu follows menus.md (focus moves into the menu on open, Escape closes and restores focus to the trailing button).

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move between leading and trailing buttons |
| Space or Enter | Activate the focused button (trailing: open/close menu) |
| Arrow Down / Arrow Up (web mapping, optional) | On trailing button: open menu, focus first / last item |
| Escape (web mapping) | Close menu, focus trailing button |

## 9. Implementation checklist

- [ ] API: `color` (`elevated|filled|tonal|outlined`, default `filled`), `size` (`xsmall|small|medium|large|xlarge`, default `small`), `label`, `icon` slot, `menu-label` (trailing accessible name), `open`, `disabled` (+ optional per-half), `menu` slot / menu reference.
- [ ] Events: `click` (leading action), `toggle` (trailing open state change), menu selection passthrough.
- [ ] Structure: group (inline-flex, gap 2dp) → leading button + trailing button (fixed width per size) → anchored menu.
- [ ] Inner-corner radius state machine per half: rest / hover-focus / pressed / selected(full), numeric `full`, animated.
- [ ] Menu icon: rotation 180° (standard scheme curve), optical offset when closed, centered when open, RTL mirrored.
- [ ] Menu positioning: anchor to trailing button, 4dp offset, flip/shift while staying edge-aligned.
- [ ] `aria-expanded`/`aria-haspopup`/`aria-controls` sync; focus return on close; close on outside click.
- [ ] 48dp hit areas for XS/S; logical properties for RTL.
- [ ] Reject `text` color; colors unchanged when open (state layer only).

## 10. HTML/CSS implementation blueprint

**(a) DOM**

```html
<div class="md-split-button" role="group" data-color="filled" data-size="small">
  <button class="md-split-button__leading md-button" type="button" part="leading">
    <span class="md-button__state-layer" aria-hidden="true"></span>
    <span class="md-button__touch" aria-hidden="true"></span>
    <span class="md-button__icon" aria-hidden="true">schedule</span>
    <span class="md-button__label">Watch later</span>
  </button>
  <button class="md-split-button__trailing md-button" type="button" part="trailing"
          aria-haspopup="menu" aria-expanded="false" aria-controls="m1" aria-label="More watch options">
    <span class="md-button__state-layer" aria-hidden="true"></span>
    <span class="md-button__touch" aria-hidden="true"></span>
    <span class="md-split-button__menu-icon" part="menu-icon" aria-hidden="true">keyboard_arrow_down</span>
  </button>
</div>
<div id="m1" class="md-menu" role="menu" popover>…</div>  <!-- see menus.md -->
```
Both halves reuse the `.md-button` base (buttons.md §10: color vars, outline part, state layer, disabled, focus ring); split-button only overrides size/padding/shape.

**(b) Custom properties**

```css
.md-split-button {
  --_height: var(--md-comp-split-button-small-container-height, 40px);
  --_gap: var(--md-comp-split-button-small-between-space, var(--md-sys-measurement-space25));
  --_full: calc(var(--_height) / 2);
  --_inner: var(--md-comp-split-button-small-inner-corner-corner-size, var(--md-sys-shape-corner-value-extra-small));
  --_inner-hover: var(--md-comp-split-button-small-inner-corner-hovered-corner-size, var(--md-sys-shape-corner-value-medium));
  --_inner-pressed: var(--md-comp-split-button-small-inner-corner-pressed-corner-size, var(--md-sys-shape-corner-value-medium));
  --_lead-start: var(--md-comp-split-button-small-leading-button-leading-space, var(--md-sys-measurement-space200));
  --_lead-end: var(--md-comp-split-button-small-leading-button-trailing-space, var(--md-sys-measurement-space150));
  --_trail-icon: var(--md-comp-split-button-small-trailing-button-icon-size, 22px);
  --_trail-pad: var(--md-comp-split-button-small-trailing-button-leading-space, 13px); /* = trailing-space */
  --_icon-offset: -1px;  /* optical offset (source measurement) */
  display: inline-flex; gap: var(--_gap); vertical-align: middle;
}
.md-split-button[data-size="xsmall"] { --_height: 32px; --_inner: var(--md-sys-shape-corner-value-extra-small); --_inner-hover: var(--md-sys-shape-corner-value-small); --_inner-pressed: var(--md-sys-shape-corner-value-small);
  --_lead-start: var(--md-sys-measurement-space150); --_lead-end: var(--md-sys-measurement-space125); --_trail-icon: 22px; --_trail-pad: 13px; --_icon-offset: -1px; }
.md-split-button[data-size="medium"] { --_height: 56px; --_inner: var(--md-sys-shape-corner-value-extra-small); --_inner-hover: var(--md-sys-shape-corner-value-medium); --_inner-pressed: var(--md-sys-shape-corner-value-medium);
  --_lead-start: var(--md-sys-measurement-space300); --_lead-end: var(--md-sys-measurement-space300); --_trail-icon: 26px; --_trail-pad: 15px; --_icon-offset: -2px; }
.md-split-button[data-size="large"] { --_height: 96px; --_inner: var(--md-sys-shape-corner-value-small); --_inner-hover: var(--md-sys-shape-corner-value-large-increased); --_inner-pressed: var(--md-sys-shape-corner-value-large-increased);
  --_lead-start: var(--md-sys-measurement-space600); --_lead-end: var(--md-sys-measurement-space600); --_trail-icon: 38px; --_trail-pad: 29px; --_icon-offset: -3px; }
.md-split-button[data-size="xlarge"] { --_height: 136px; --_inner: var(--md-sys-shape-corner-value-medium); --_inner-hover: var(--md-sys-shape-corner-value-large-increased); --_inner-pressed: var(--md-sys-shape-corner-value-large-increased);
  --_lead-start: var(--md-sys-measurement-space800); --_lead-end: var(--md-sys-measurement-space800); --_trail-icon: 50px; --_trail-pad: 43px; --_icon-offset: -6px; }
/* (wrap each value in var(--md-comp-split-button-<size>-…, …) as in the small block) */
/* the child .md-button also needs data-size on each half (icon size, gap, type role) — set by the wrapper/JS */
```

**(c) Layout & state selectors**

```css
.md-split-button > .md-button { block-size: var(--_height); --_r-inner: var(--_inner); }
.md-split-button > .md-split-button__leading  { padding-inline: var(--_lead-start) var(--_lead-end);
  border-start-start-radius: var(--_full); border-end-start-radius: var(--_full);
  border-start-end-radius: var(--_r-inner); border-end-end-radius: var(--_r-inner); }
.md-split-button > .md-split-button__trailing { padding-inline: var(--_trail-pad);
  border-start-end-radius: var(--_full); border-end-end-radius: var(--_full);
  border-start-start-radius: var(--_r-inner); border-end-start-radius: var(--_r-inner); }
@media (hover: hover) { .md-split-button > .md-button:hover:not(:disabled) { --_r-inner: var(--_inner-hover); } }
.md-split-button > .md-button:focus-visible { --_r-inner: var(--_inner-hover); }
.md-split-button > .md-button:is(:active, [data-pressed]):not(:disabled) { --_r-inner: var(--_inner-pressed); }
.md-split-button__trailing[aria-expanded="true"] { --_r-inner: var(--_full); }   /* wins: placed last */
.md-split-button__trailing[aria-expanded="true"] .md-button__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }

.md-split-button__menu-icon { inline-size: var(--_trail-icon); block-size: var(--_trail-icon); font-size: var(--_trail-icon);
  position: relative; inset-inline-start: var(--_icon-offset); rotate: 0deg; }
.md-split-button__trailing[aria-expanded="true"] .md-split-button__menu-icon { inset-inline-start: 0; rotate: 180deg; }
.md-split-button:dir(rtl) .md-split-button__trailing[aria-expanded="true"] .md-split-button__menu-icon { rotate: -180deg; }

/* menu anchoring (web mapping, CSS anchor positioning; JS fallback where unsupported) */
.md-split-button__trailing { anchor-name: --split-trailing; }
#m1 { position-anchor: --split-trailing; position-area: block-end span-inline-end; margin-block: 4px;
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline; }
```
(`.md-button` only sets `border-radius: var(--_radius)` at base specificity; the split-button longhands above (higher specificity) replace it, and the button's own pressed/selected radius rules — which only change `--_radius` — no longer apply. Do not set `data-shape`/`aria-pressed` on the halves.)

**(d) Motion**

```css
.md-split-button > .md-button { transition:
  border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-split-button__menu-icon { transition: rotate 350ms cubic-bezier(0.27, 1.06, 0.18, 1), inset-inline-start 350ms cubic-bezier(0.27, 1.06, 0.18, 1); }
@media (prefers-reduced-motion: reduce) {
  .md-split-button > .md-button { transition-property: background-color, box-shadow; }
  .md-split-button__menu-icon { transition: none; }
}
```

**(e) Forced colors**: inherits buttons.md §10(e) per half; the open trailing button uses `background: Highlight; color: HighlightText` (`[aria-expanded="true"]`), so the open state is visible without the state layer.

**(f) Behaviour / JS**
- Trailing `click` / Enter / Space toggles `aria-expanded` and shows/hides the menu (`popover` + `showPopover()`/`hidePopover()`); ArrowDown/ArrowUp open and focus first/last item.
- On menu close (Escape, item select, outside click via `popover` light-dismiss): set `aria-expanded="false"`, return focus to the trailing button (not on outside click to another focusable target).
- Positioning fallback (no anchor positioning): compute from `getBoundingClientRect()` of the trailing button: preferred below, menu start edge = trailing start edge, 4px gap; flip vertically / align to the end edge (trailing or leading button) when overflowing the viewport; re-run on scroll/resize.
- Propagate `size`/`color`/`disabled` to both halves.

## 11. Source gaps & decisions

- **"50%" corner sizes** (`outer-corner`, `trailing-button.inner-corner.selected`) mean 50% of the shorter side (platform shape semantics); CSS `50%` on a 48×32 box makes ellipses → implemented as `height/2`.
- **`outer-corner.corner-size` only exists for XS** → all sizes use `container.shape` = full (same visual result).
- **No focused inner-corner token** → focused uses the hovered value (source: "inner corners change shape for hovered, focused, and pressed").
- **Selected state-layer color/opacity not tokenized** → default content color @ pressed opacity 0.10 (source video: 10%).
- **Rotation spring**: only "standard motion scheme" stated → standard fast spatial, as the literal conversion-table curve (350ms), independent of the product's scheme.
- **Corner-morph spring** not specified → fast spatial spring, same as buttons.
- **Optical offset direction** not stated → toward the inner/gap side (flatter side carries more visual weight); mirrored in RTL; 0 when selected.
- **"Rotates inwards"** → clockwise in LTR (sweeps past the leading button), counter-clockwise in RTL.
- **Leading icon size, icon–label gap, typography** absent from split-button tokens → taken from the button size set of the same size.
- **Default color** not stated → filled (as buttons).
- **Hover elevation** for elevated → as buttons.md (derived +1).
