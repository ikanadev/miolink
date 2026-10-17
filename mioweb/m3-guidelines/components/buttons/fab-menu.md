# FAB menu

> Source: https://m3.material.io/components/fab-menu · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference and the shared implementation primitives (state layer, focus ring, ripple, elevation, spring, typography roles). Trigger FAB: floating-action-button.md.

## 1. Overview
- Opens **from a FAB** to show **2–6 related actions** floating on screen (e.g. all under "Share" or "Create"). Keeps the UI clean by concealing actions until needed.
- One menu size that pairs with **any FAB size** (FAB, medium, large).
- **Not** opened from extended FABs or any other component.
- Don't use when the FAB is paired with other components such as a **floating toolbar** or **navigation rail**.
- Don't use with one item; don't group unrelated actions.

**M3 Expressive changes (May 2025)**
- New component; **replaces the M2 speed dial** and any stacked small FABs.
- Contrasting close button vs item colors; dynamic color; compatible with any FAB color style.
- vs M2: larger pill-shaped labelled items instead of small round FABs.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| FAB menu (single variant) | Close button + 2–6 menu items | One size for all FAB sizes |
| Primary set | Close button `primary`/`on-primary`; items `primary-container`/`on-primary-container` | Pair with **primary** or **primary container** FAB |
| Secondary set | Close button `secondary`/`on-secondary`; items `secondary-container`/`on-secondary-container` | Pair with secondary / secondary container FAB |
| Tertiary set | Close button `tertiary`/`on-tertiary`; items `tertiary-container`/`on-tertiary-container` | Pair with tertiary / tertiary container FAB |
| Web desktop mode | FAB + standard **menu** component (menus.md) | Inherits states/specs from the baseline menu; FAB↔menu gap 4 recommended |

## 3. Anatomy
1. **Close button** — 56×56 circle that the FAB morphs into; toggles the menu. Occupies the FAB's place, sharing the FAB's **top-trailing corner** as anchor.
2. **Menu item** (list item) — pill with icon + label; stacked vertically above the close button, trailing-aligned, hugging contents.
3. State layer + focus ring on both (implementation; primitives).

## 4. Tokens & specs

### 4.1 Color

| Set | Close button container | Close icon + state layer | Item container | Item icon + label + state layer |
| --- | --- | --- | --- | --- |
| Primary | `--md-sys-color-primary` (#6750a4) | `--md-sys-color-on-primary` (#ffffff) | `--md-sys-color-primary-container` (#eaddff) | `--md-sys-color-on-primary-container` (#4f378b) |
| Secondary | `--md-sys-color-secondary` (#625b71) | `--md-sys-color-on-secondary` (#ffffff) | `--md-sys-color-secondary-container` (#e8def8) | `--md-sys-color-on-secondary-container` (#4a4458) |
| Tertiary | `--md-sys-color-tertiary` (#7d5260) | `--md-sys-color-on-tertiary` (#ffffff) | `--md-sys-color-tertiary-container` (#ffd8e4) | `--md-sys-color-on-tertiary-container` (#633b48) |

- Shadow color (both parts): `--md-sys-color-shadow`.
- State-layer opacity: hover 0.08, focus 0.10, pressed 0.10. Content colors don't change by state.
- Focus ring: no token → focus ring primitive (`--md-sys-color-secondary`, 3px, 2px outer offset) (derived from FAB baseline token).
- Disabled: no tokens/states; don't render unavailable actions (derived; same rule as FAB).

### 4.2 Size, layout & shape

| Element | Property | Value |
| --- | --- | --- |
| Close button | Container | 56×56 (always, regardless of FAB size) |
| | Icon | 20 (close "×") |
| | Shape | `--md-sys-shape-corner-full` (circle) |
| | Space to the item stack | 8 (`--md-sys-measurement-space100`, `close-button.between-space`) |
| Menu item | Height | 56 ("same measurements as the medium button") |
| | Icon | 24 |
| | Shape | `--md-sys-shape-corner-full` (pill) |
| | Leading / trailing padding | 24 / 24 (`--md-sys-measurement-space300`) |
| | Icon–label gap | 8 (`--md-sys-measurement-space100`) |
| | Space between items | 4 (`--md-sys-measurement-space50`) |
| | Width | hugs content; no fixed/equal widths; no truncation; single-line label |
| | Without icon (caution) | padding 24/24 around label (derived) |
| Stack | Item count | 2–6 |
| | Alignment | items' trailing edges align with the close button's trailing edge |
| | Order | DOM/visual top → bottom = item 1 … item n, then close button |
| Window | Margins | 16 (compact/medium); **24** in large & extra-large windows |
| | Anchor | close button and FAB share the **top-trailing corner** |
| | Close button bottom offset | = margin + FAB size − 56 → FAB 16, medium FAB **40**, large FAB **56** (source; formula derived) |
| Web desktop | FAB ↔ menu gap | variable, **4** recommended |

- Touch targets: all elements ≥ 48×48 by default.
- All elements stay rounded — don't change shapes.

### 4.3 Typography
- Menu item label: `md.sys.typescale.title-medium` (plain / 500 / 16 / 24 / 0.15) via typography roles primitive.
- Close button: icon only.

### 4.4 Elevation
| Element | Enabled | Hovered | Focused | Pressed |
| --- | --- | --- | --- | --- |
| Close button | level3 (6) | level4 (8) | level3 | level3 |
| Menu item | **level0** (0) | level4 (8) | level3 (6) | level3 (6) |

Items have no shadow at rest (source tokens); they rise on interaction.

### 4.5 Component token list

**Common (`md.comp.fab-menu`)**
- md.comp.fab-menu.close-button.container.height → 56dp
- md.comp.fab-menu.close-button.container.width → 56dp
- md.comp.fab-menu.close-button.icon.size → 20dp
- md.comp.fab-menu.close-button.container.elevation → md.sys.elevation.level3
- md.comp.fab-menu.close-button.container.shape → md.sys.shape.corner.full
- md.comp.fab-menu.close-button.between-space → md.sys.measurement.space100 (8dp)
- md.comp.fab-menu.menu-item.container.height → 56dp
- md.comp.fab-menu.menu-item.label-text → md.sys.typescale.title-medium
- md.comp.fab-menu.menu-item.icon.size → 24dp
- md.comp.fab-menu.menu-item.container.elevation → md.sys.elevation.level0
- md.comp.fab-menu.menu-item.container.shape → md.sys.shape.corner.full
- md.comp.fab-menu.menu-item.leading-space → md.sys.measurement.space300 (24dp)
- md.comp.fab-menu.menu-item.icon-label-space → md.sys.measurement.space100 (8dp)
- md.comp.fab-menu.menu-item.trailing-space → md.sys.measurement.space300 (24dp)
- md.comp.fab-menu.menu-item.between-space → md.sys.measurement.space50 (4dp)

**Close button color** — `<s>` ∈ {primary, secondary, tertiary}, `<on>` = on-`<s>`:
- md.comp.fab-menu.<s>.close-button.container.color → md.sys.color.<s>
- md.comp.fab-menu.<s>.close-button.container.shadow-color → md.sys.color.shadow
- md.comp.fab-menu.<s>.close-button.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.hovered.container.elevation → md.sys.elevation.level4
- md.comp.fab-menu.<s>.close-button.hovered.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- md.comp.fab-menu.<s>.close-button.hovered.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.focused.container.elevation → md.sys.elevation.level3
- md.comp.fab-menu.<s>.close-button.focused.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.10)
- md.comp.fab-menu.<s>.close-button.focused.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.pressed.container.elevation → md.sys.elevation.level3
- md.comp.fab-menu.<s>.close-button.pressed.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<s>.close-button.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10)
- md.comp.fab-menu.<s>.close-button.pressed.icon.color → md.sys.color.<on>

**List item color** — `<c>` ∈ {primary-container, secondary-container, tertiary-container}, `<on>` = on-`<c>`:
- md.comp.fab-menu.<c>.list-item.container.color → md.sys.color.<c>
- md.comp.fab-menu.<c>.list-item.container.shadow-color → md.sys.color.shadow
- md.comp.fab-menu.<c>.list-item.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.label-text.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.hovered.container.elevation → md.sys.elevation.level4
- md.comp.fab-menu.<c>.list-item.hovered.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- md.comp.fab-menu.<c>.list-item.hovered.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.hovered.label-text.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.focused.container.elevation → md.sys.elevation.level3
- md.comp.fab-menu.<c>.list-item.focused.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.10)
- md.comp.fab-menu.<c>.list-item.focused.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.focused.label-text.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.pressed.container.elevation → md.sys.elevation.level3
- md.comp.fab-menu.<c>.list-item.pressed.state-layer.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10)
- md.comp.fab-menu.<c>.list-item.pressed.icon.color → md.sys.color.<on>
- md.comp.fab-menu.<c>.list-item.pressed.label-text.color → md.sys.color.<on>

Token naming in source: common tokens use `menu-item`, color tokens use `list-item` — kept as given.

## 5. States & interaction

| Part × state | Container | Content | State layer | Elevation |
| --- | --- | --- | --- | --- |
| Trigger (closed) | FAB tokens (floating-action-button.md) | | | |
| Close button enabled | `<s>` | `on-<s>` | — | level3 |
| Close button hover / focus-visible / pressed | `<s>` | `on-<s>` | 0.08 / 0.10 (+ ring) / 0.10 + ripple | level4 / level3 / level3 |
| Item enabled | `<s>-container` | `on-<s>-container` | — | level0 |
| Item hover / focus-visible / pressed | `<s>-container` | `on-<s>-container` | 0.08 / 0.10 (+ ring) / 0.10 + ripple | level4 / level3 / level3 |

- Close button toggles open ⇄ closed.
- Item activation: performs action and closes the menu (derived), or container-transforms into the destination surface (source).
- Closes on Escape, outside pointerdown, and focus leaving the component (web mapping).
- Web desktop mode: states per menus.md (enabled, hovered, selected).

## 6. Motion & behavior
- **Opening (source)**: FAB transforms into the close button; items appear with the **enter/exit transition**; originate from a trailing corner of the FAB, preferably the **top** one.
- **Morph mechanics (derived)**: one element plays both roles. Pinned at top-trailing; animate `inline-size`/`block-size` (FAB size → 56), `border-radius` (FAB corner → full), `background-color` (FAB container → close-button container), `color`; icon crossfades FAB icon → close icon (20) with a 90° rotation (derived). For the 56 FAB only radius and color change.
  - Size/radius: spring primitive `fast-spatial`; colors/opacity: `fast-effects`.
- **Items enter (derived)**: each item fades (opacity 0→1, `fast-effects`) and scales from 0.8 → 1 / translates 8px upward-from-below, `transform-origin: bottom inline-end`, using `default-spatial`; stagger 25ms per item starting from the item nearest the close button.
- **Closing**: reverse — items exit (no stagger, `fast-effects` fade + scale to 0.8), then close button morphs back into the FAB.
- **Scrolling**: when window height is limited, items scroll **behind** the close button; close button always visible and unobstructed.
- **Expanding**: any item can container-transform into another surface (e.g. full-screen dialog).
- **Scrim**: none in source → none (derived); the page stays visible, outside click closes.
- **Adaptive**: any window size; pair with the FAB size for the window class; stays anchored to the same corner/edge. Margins 16 → 24 in large/XL. Web desktop: FAB + menu component, gap 4.
- **RTL**: anchored to the left edge, layout and icon/label order mirrored.
- Open menu must not fully obscure another element's focus indicator.

## 7. Usage guidelines
- Always opens from a FAB, in the same place as that FAB.
- Trailing-edge aligned (left in RTL, mirrored).
- 2–6 closely related items; never 1; never unrelated actions.
- Color set matches the FAB style family: primary ↔ primary/primary-container FAB; secondary ↔ secondary/secondary-container; tertiary ↔ tertiary/tertiary-container.
- Items always have label text; keep icons (remove only if necessary); never icon-only items.
- Items hug contents with consistent padding; don't truncate, set equal widths, or change shapes.
- Not with floating toolbar or navigation rail; not from extended FABs.

## 8. Accessibility
- **Pattern (web mapping)**: expressive layout = **disclosure** (matches the source's focus model: focus stays on the close button, Tab moves to items, Android role Button). Desktop menu mode = **menu button** (menus.md, APG).
- **Toggle (FAB/close button, same element)**: `<button aria-expanded="false|true" aria-controls="menu-id">`. Accessible name describes the menu it opens ("Share options"); name stays constant, state via `aria-expanded` (Android: "Toggle menu" + expanded/collapsed). Icons `aria-hidden`.
- **Items**: `<ul id="menu-id">` of `<li><button>` (or `<a href>`); name = visible label ("Reply all").
- **Focus**: on open, focus stays on the close button; next Tab → **top** item, then downward (DOM order: toggle, then list top→bottom; visual order handled by CSS). On close, focus remains/returns on the toggle (FAB).
- **Keyboard**:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Next / previous interactive element (close button → top item → … → bottom item) |
| Space / Enter | Activate focused button or item |
| Escape | Close menu, focus the FAB (web mapping) |
| Arrow Up / Down | Only in desktop menu mode (`role="menu"`, APG) |

- Touch targets ≥ 48×48 (met). Close button never obstructed.
- Closed items are `hidden`/`inert` (not focusable, not announced).

## 9. Implementation checklist
- [ ] API: `open` (reflects), `color` = `primary` | `secondary` | `tertiary` (default from trigger FAB color family), trigger FAB props (size, icon, `label`), items (icon + label, optional `href`), `close-icon`; events `open`, `close`, item `click`.
- [ ] Dev warning outside 2–6 items.
- [ ] Wrapper fixed at bottom-end with margins; toggle pinned top-trailing within FAB box; item list above (gap 8 to close button, 4 between).
- [ ] Morph + item enter/exit; reduced-motion → fades only.
- [ ] Scrollable list region that passes behind the close button.
- [ ] Logical properties for RTL.
- [ ] Focus management, Escape / outside click.
- [ ] Optional desktop mode with menus.md, gap 4.
- [ ] All values via `--md-comp-fab-menu-*` → `--md-sys-*`.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<div class="md-fab-menu" data-color="primary" data-fab-size="medium"> <!-- add data-open when open -->
  <button type="button" class="md-fab md-fab-menu__toggle" data-size="medium" data-color="primary-container"
          aria-expanded="false" aria-controls="share-menu" aria-label="Share options">
    <span class="md-fab__state-layer" aria-hidden="true"></span>
    <span class="md-fab-menu__fab-icon material-symbols-rounded" aria-hidden="true">share</span>
    <span class="md-fab-menu__close-icon material-symbols-rounded" aria-hidden="true">close</span>
  </button>
  <ul class="md-fab-menu__list" id="share-menu" part="list" hidden>
    <li><button type="button" class="md-fab-menu__item" part="item">
      <span class="md-fab-menu__state-layer" aria-hidden="true"></span>
      <span class="md-fab-menu__item-icon material-symbols-rounded" aria-hidden="true">mail</span>
      <span class="md-fab-menu__item-label">Email</span>
    </button></li>
    <!-- 2–6 items, top → bottom -->
  </ul>
</div>
```

**(b) Custom properties & layout**
```css
.md-fab-menu {
  --md-comp-fab-menu-close-button-size: 56px;
  --md-comp-fab-menu-close-button-icon-size: 20px;
  --md-comp-fab-menu-close-button-shape: var(--md-sys-shape-corner-full);
  --md-comp-fab-menu-close-button-elevation: var(--md-sys-elevation-level3);
  --md-comp-fab-menu-close-button-hover-elevation: var(--md-sys-elevation-level4);
  --md-comp-fab-menu-close-button-between-space: var(--md-sys-measurement-space100);
  --md-comp-fab-menu-item-height: 56px;
  --md-comp-fab-menu-item-icon-size: 24px;
  --md-comp-fab-menu-item-shape: var(--md-sys-shape-corner-full);
  --md-comp-fab-menu-item-elevation: var(--md-sys-elevation-level0);
  --md-comp-fab-menu-item-hover-elevation: var(--md-sys-elevation-level4);
  --md-comp-fab-menu-item-focus-elevation: var(--md-sys-elevation-level3);
  --md-comp-fab-menu-item-leading-space: var(--md-sys-measurement-space300);
  --md-comp-fab-menu-item-icon-label-space: var(--md-sys-measurement-space100);
  --md-comp-fab-menu-item-trailing-space: var(--md-sys-measurement-space300);
  --md-comp-fab-menu-item-between-space: var(--md-sys-measurement-space50);
  --md-comp-fab-menu-close-button-container-color: var(--md-sys-color-primary);
  --md-comp-fab-menu-close-button-icon-color: var(--md-sys-color-on-primary);
  --md-comp-fab-menu-item-container-color: var(--md-sys-color-primary-container);
  --md-comp-fab-menu-item-content-color: var(--md-sys-color-on-primary-container);
  --md-comp-fab-menu-margin: 16px;           /* 24px in large/XL windows */
  --_fab-size: 56px;                          /* 80 medium, 96 large */
}
.md-fab-menu[data-fab-size="medium"] { --_fab-size: 80px; }
.md-fab-menu[data-fab-size="large"]  { --_fab-size: 96px; }
.md-fab-menu[data-color="secondary"] {
  --md-comp-fab-menu-close-button-container-color: var(--md-sys-color-secondary);
  --md-comp-fab-menu-close-button-icon-color: var(--md-sys-color-on-secondary);
  --md-comp-fab-menu-item-container-color: var(--md-sys-color-secondary-container);
  --md-comp-fab-menu-item-content-color: var(--md-sys-color-on-secondary-container); }
.md-fab-menu[data-color="tertiary"] {
  --md-comp-fab-menu-close-button-container-color: var(--md-sys-color-tertiary);
  --md-comp-fab-menu-close-button-icon-color: var(--md-sys-color-on-tertiary);
  --md-comp-fab-menu-item-container-color: var(--md-sys-color-tertiary-container);
  --md-comp-fab-menu-item-content-color: var(--md-sys-color-on-tertiary-container); }
@media (min-width: 1200px) { .md-fab-menu { --md-comp-fab-menu-margin: 24px; } } /* large & XL window classes */

/* wrapper = the FAB's box; toggle pinned to its top-trailing corner */
.md-fab-menu {
  position: fixed; z-index: var(--md-fab-z, 10);
  inset-block-end: calc(var(--md-comp-fab-menu-margin) + env(safe-area-inset-bottom));
  inset-inline-end: calc(var(--md-comp-fab-menu-margin) + env(safe-area-inset-right));
  inline-size: var(--_fab-size); block-size: var(--_fab-size);
}
.md-fab-menu__toggle { position: absolute; inset-block-start: 0; inset-inline-end: 0; z-index: 1; }
.md-fab-menu__close-icon { position: absolute; font-size: var(--md-comp-fab-menu-close-button-icon-size); opacity: 0; rotate: -90deg; }

/* item stack: bottom aligned to close button bottom, scrolls behind it */
.md-fab-menu__list {
  position: absolute; inset-inline-end: 0;
  inset-block-end: calc(var(--_fab-size) - var(--md-comp-fab-menu-close-button-size)); /* = close button bottom */
  margin: 0; list-style: none;
  padding-block: var(--md-comp-fab-menu-margin) calc(var(--md-comp-fab-menu-close-button-size) + var(--md-comp-fab-menu-close-button-between-space));
  padding-inline: 8px 0;                      /* room for focus ring/shadow (derived) */
  display: flex; flex-direction: column; align-items: flex-end; gap: var(--md-comp-fab-menu-item-between-space);
  max-block-size: calc(100dvh - var(--md-comp-fab-menu-margin) - (var(--_fab-size) - var(--md-comp-fab-menu-close-button-size)));
  overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
}
.md-fab-menu__list[hidden] { display: none; }
.md-fab-menu__item {
  position: relative; display: inline-flex; align-items: center; flex: none;
  block-size: var(--md-comp-fab-menu-item-height);
  padding-inline: var(--md-comp-fab-menu-item-leading-space) var(--md-comp-fab-menu-item-trailing-space);
  gap: var(--md-comp-fab-menu-item-icon-label-space);
  border: 0; border-radius: var(--md-comp-fab-menu-item-shape);
  background: var(--md-comp-fab-menu-item-container-color); color: var(--md-comp-fab-menu-item-content-color);
  box-shadow: var(--md-comp-fab-menu-item-elevation);
  font: var(--md-sys-typescale-title-medium-weight) var(--md-sys-typescale-title-medium-size)/var(--md-sys-typescale-title-medium-line-height) var(--md-sys-typescale-title-medium-font);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  white-space: nowrap; cursor: pointer;
}
.md-fab-menu__item-icon { font-size: var(--md-comp-fab-menu-item-icon-size); inline-size: var(--md-comp-fab-menu-item-icon-size); line-height: 1; }
.md-fab-menu__state-layer { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: var(--md-comp-fab-menu-item-content-color); opacity: 0; }

/* open: toggle becomes the close button */
.md-fab-menu[data-open] .md-fab-menu__toggle {
  inline-size: var(--md-comp-fab-menu-close-button-size); block-size: var(--md-comp-fab-menu-close-button-size);
  border-radius: var(--md-comp-fab-menu-close-button-shape);
  --md-comp-fab-container-color: var(--md-comp-fab-menu-close-button-container-color);
  --md-comp-fab-icon-color: var(--md-comp-fab-menu-close-button-icon-color);
}
.md-fab-menu[data-open] .md-fab-menu__fab-icon { opacity: 0; rotate: 90deg; }
.md-fab-menu[data-open] .md-fab-menu__close-icon { opacity: 1; rotate: 0deg; }
```

**(c) States**
```css
.md-fab-menu__item:hover { box-shadow: var(--md-comp-fab-menu-item-hover-elevation); }
.md-fab-menu__item:focus-visible, .md-fab-menu__item:active { box-shadow: var(--md-comp-fab-menu-item-focus-elevation); }
.md-fab-menu__item:hover .md-fab-menu__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-fab-menu__item:focus-visible .md-fab-menu__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-fab-menu__item:active .md-fab-menu__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-fab-menu__item:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
/* close button hover/focus/pressed: reuse FAB rules (state layer = icon color, hover level4) */
```

**(d) Motion**
```css
.md-fab-menu__toggle {
  transition: inline-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    block-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
.md-fab-menu__fab-icon, .md-fab-menu__close-icon {
  transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    rotate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
}
.md-fab-menu__list > li {
  transform-origin: bottom right; /* inline-end; use bottom left under [dir=rtl] */
  transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    scale var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
    translate var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing);
  transition-delay: calc(var(--_i-from-bottom, 0) * 25ms);   /* set --_i-from-bottom per item */
}
@starting-style { .md-fab-menu__list > li { opacity: 0; scale: 0.8; translate: 0 8px; } }
.md-fab-menu[data-closing] .md-fab-menu__list > li { opacity: 0; scale: 0.8; transition-delay: 0s; }
:dir(rtl) .md-fab-menu__list > li { transform-origin: bottom left; }
@media (prefers-reduced-motion: reduce) {
  .md-fab-menu__toggle, .md-fab-menu__list > li { transition-property: opacity, background-color, color; transition-duration: var(--md-sys-motion-duration-short2); transition-delay: 0s; }
  @starting-style { .md-fab-menu__list > li { scale: 1; translate: none; } }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-fab-menu__item, .md-fab-menu__toggle { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; box-shadow: none; }
  .md-fab-menu__item:focus-visible, .md-fab-menu__toggle:focus-visible { outline-color: Highlight; }
  .md-fab-menu__state-layer { display: none; }
}
```

**(f) Behaviour/JS**
- Toggle click: open → remove `hidden` from list, set `data-open`, `aria-expanded="true"`; focus stays on toggle. Close → set `data-closing`, on `transitionend` (or timeout ≈ exit duration) set `hidden`, remove `data-open`/`data-closing`, `aria-expanded="false"`.
- Item click: run action (or start container transform), then close and focus the toggle.
- Escape anywhere inside → close + focus toggle. `pointerdown` outside wrapper → close (no focus move). `focusout` to outside the wrapper → close.
- Set `--_i-from-bottom` per item (n−1 … 0) for stagger.
- Validate 2–6 items; derive `data-color` from trigger FAB color family if not set.
- Desktop mode (expanded+ on web): render items in the menus.md menu anchored to the FAB (gap 4, opening above when FAB is at bottom, below when in the top of a nav rail), `aria-haspopup="menu"`, APG menu keyboard.

## 11. Source gaps & decisions
- **Morph/enter motion values**: source only names the patterns (transform, enter/exit, top-trailing origin) → `fast-spatial` for size/radius, `fast-effects` for color/opacity, `default-spatial` + 25ms stagger for items (derived).
- **Close-button offset per FAB size**: source gives 16/40/56 by image; formalized as margin + FAB size − 56 (consistent with all three).
- **ARIA**: source says web = FAB + menu, but its focus model (focus stays on close button, Tab to items, Android role Button) conflicts with APG menu (focus moves into menu, arrows). Decision: disclosure pattern for the expressive layout, menu-button pattern only in desktop menu mode.
- **Scrim / outside dismissal**: not specified → no scrim; outside click/Escape/focus-out closes.
- **Focus ring**: no FAB-menu token → focus ring primitive (secondary, 3px, 2px).
- **Item activation closes menu**: not stated → close after activation unless it container-transforms.
- **Disabled items**: no tokens → not supported; omit unavailable actions.
- **Large/XL breakpoint for 24 margin**: CSS uses 1200px (large window class lower bound per guidelines layout breakpoints).
- **Scroll region**: "items scroll behind close button" → list extends under the close button with bottom padding = 56 + 8 and lower z-index.
- **Token prefix inconsistency** (`menu-item` vs `list-item`): kept verbatim.
