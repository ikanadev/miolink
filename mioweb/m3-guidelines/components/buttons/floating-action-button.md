# FAB (Floating action button)

> Source: https://m3.material.io/components/floating-action-button · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference and the shared implementation primitives (state layer, focus ring, ripple, touch target, elevation, spring).

## 1. Overview
- Icon-only button for the **most common or important action** on a screen; appears in front of all other content and persists while content scrolls.
- Use for primary, positive, constructive actions: create, compose, favorite, share, start a process. Can act on the current screen or open a new one.
- Do **not** use for minor or destructive actions (archive, trash), alerts/errors, limited tasks (cut text), or controls better suited to a toolbar (volume, font color).
- Not needed on every screen. Never more than **one FAB per screen**; individual components (e.g. cards) must not have their own FAB.
- Related: **extended FAB** (extended-fab.md) when a label is necessary; **FAB menu** (fab-menu.md) when many related actions exist. A FAB can transform into an extended FAB on larger screens or into a FAB menu when selected.

**M3 Expressive changes (May 2025)**
- Added **medium FAB** (80px). **Small FAB** no longer recommended (use a larger size). FAB and large FAB sizes unchanged.
- Variants are based on **size**, not color.
- Added solid color styles **primary, secondary, tertiary** (container = role, icon = on-role).
- Previous tonal styles renamed to match tokens: Primary → **Primary container**, Secondary → **Secondary container**, Tertiary → **Tertiary container** (values unchanged).
- **Surface** color FABs no longer recommended.
- vs M2: boxier rounded-square shape instead of a circle, dynamic color, large variant.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| FAB (default size) | 56×56 container, 24 icon | Smallest; compact windows where other actions are present |
| Medium FAB | 80×80 container, 28 icon | **Most recommended**; compact & medium windows |
| Large FAB | 96×96 container, 36 icon | Prominent primary action; expanded+ windows |
| Small FAB (baseline) | Not recommended | Source says baseline tokens include small FAB, but the token table only contains the surface set (see §11) |
| Color: Primary container (default) | primary-container / on-primary-container | Tonal |
| Color: Secondary container | secondary-container / on-secondary-container | Tonal |
| Color: Tertiary container | tertiary-container / on-tertiary-container | Tonal |
| Color: Primary | primary / on-primary | New in Expressive |
| Color: Secondary | secondary / on-secondary | New in Expressive |
| Color: Tertiary | tertiary / on-tertiary | New in Expressive |
| Color: Surface (baseline) | surface-container-high / primary; "lowered" uses surface-container-low | Not recommended |

Size and color are orthogonal: any size can use any color style.

## 3. Anatomy
1. **Container** — rounded-square surface carrying color, shape and elevation. Must not be covered by other elements (e.g. badges); must contrast with the surface below.
2. **Icon** — single, clear, **filled** (not outlined) icon.
3. **State layer** (implementation) — state layer primitive, color = icon color.
4. **Focus ring** (implementation) — focus ring primitive (outer offset).

## 4. Tokens & specs

### 4.1 Color
All styles follow: container = `<role>`, icon = `on-<role>`, state layer = icon color. Rule (source): with a non-default mapping the state layer color must equal the icon color.

| Style | Container | Icon + state layer |
| --- | --- | --- |
| Primary container (default) | `--md-sys-color-primary-container` (#eaddff) | `--md-sys-color-on-primary-container` (#4f378b) |
| Secondary container | `--md-sys-color-secondary-container` (#e8def8) | `--md-sys-color-on-secondary-container` (#4a4458) |
| Tertiary container | `--md-sys-color-tertiary-container` (#ffd8e4) | `--md-sys-color-on-tertiary-container` (#633b48) |
| Primary | `--md-sys-color-primary` (#6750a4) | `--md-sys-color-on-primary` (#ffffff) |
| Secondary | `--md-sys-color-secondary` (#625b71) | `--md-sys-color-on-secondary` (#ffffff) |
| Tertiary | `--md-sys-color-tertiary` (#7d5260) | `--md-sys-color-on-tertiary` (#ffffff) |
| Surface (baseline) | `--md-sys-color-surface-container-high` (#ece6f0); lowered `surface-container-low` (#f7f2fa) | `--md-sys-color-primary` (#6750a4) |

- Shadow color (all): `--md-sys-color-shadow`.
- Icon color does not change between states (hovered/focused/pressed icon tokens = enabled value).
- State-layer opacities: hover 0.08, focus 0.10, pressed 0.10 (`--md-sys-state-*-state-layer-opacity`).
- Focus ring color: `--md-sys-color-secondary` (only tokenized in the surface set; applied to all — see §11).
- **Disabled:** no tokens. Guideline: don't disable the FAB — hide it if the action is unavailable.

### 4.2 Size, layout & shape

| Size | Container (W×H) | Icon | Corner radius | Icon inset (derived: (container − icon)/2) |
| --- | --- | --- | --- | --- |
| FAB | 56×56 | 24 | `--md-sys-shape-corner-large` (16px) | 16 |
| Medium FAB | 80×80 | 28 | `--md-sys-shape-corner-large-increased` (20px) | 26 |
| Large FAB | 96×96 | 36 | `--md-sys-shape-corner-extra-large` (28px) | 30 |
| Surface (baseline) | 56×56 | 24 | `--md-sys-shape-corner-large` (16px) | 16 |

- Icon centered (grid/flex centering); padding images only in source, so use fixed width/height + centering rather than padding.
- No pressed/selected shape morph for FAB (none in tokens).
- Touch target: all sizes ≥ 48×48, touch target primitive not needed.
- Focus ring: thickness `--md-sys-state-focus-indicator-thickness` (3px), offset `--md-sys-state-focus-indicator-outer-offset` (2px), radius follows container.
- Placement margins (derived: layout margins from guidelines): 16px from window edges in compact; 24px in medium/expanded; add `env(safe-area-inset-*)`.

### 4.3 Typography
None (icon only). Tooltip text uses the plain tooltip's typography (tooltips.md).

### 4.4 Elevation

| State | All color styles | Surface "lowered" (baseline) |
| --- | --- | --- |
| Enabled | level3 (6dp) | level1 (1dp) |
| Hovered | level4 (8dp) | level2 (3dp) |
| Focused | level3 | level1 |
| Pressed | level3 | level1 |

Rendered via the elevation primitive (`--md-sys-elevation-levelN` → box-shadow, shadow color `--md-sys-color-shadow`).

### 4.5 Component token list

**Size – Regular (`md.comp.fab`)**
- md.comp.fab.container.height → 56dp
- md.comp.fab.container.width → 56dp
- md.comp.fab.icon.size → 24dp
- md.comp.fab.container.shape → md.sys.shape.corner.large (16dp)

**Size – Medium (`md.comp.fab.medium`)**
- md.comp.fab.medium.container.height → 80dp
- md.comp.fab.medium.container.width → 80dp
- md.comp.fab.medium.container.shape → md.sys.shape.corner.large-increased (20dp)
- md.comp.fab.medium.icon.size → 28dp

**Size – Large (`md.comp.fab.large`)**
- md.comp.fab.large.container.height → 96dp
- md.comp.fab.large.container.width → 96dp
- md.comp.fab.large.container.shape → md.sys.shape.corner.extra-large (28dp)
- md.comp.fab.large.icon.size → 36dp

**Color sets** — identical structure for each `<set>` ∈ {`primary-container`, `secondary-container`, `tertiary-container`, `primary`, `secondary`, `tertiary`}; `<role>` = set name, `<on>` = `on-<set>`:
- md.comp.fab.<set>.container.color → md.sys.color.<role>
- md.comp.fab.<set>.container.shadow-color → md.sys.color.shadow
- md.comp.fab.<set>.container.elevation → md.sys.elevation.level3
- md.comp.fab.<set>.icon.color → md.sys.color.<on>
- md.comp.fab.<set>.hovered.container.elevation → md.sys.elevation.level4
- md.comp.fab.<set>.hovered.state-layer.color → md.sys.color.<on>
- md.comp.fab.<set>.hovered.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
- md.comp.fab.<set>.hovered.icon.color → md.sys.color.<on>
- md.comp.fab.<set>.focused.container.elevation → md.sys.elevation.level3
- md.comp.fab.<set>.focused.state-layer.color → md.sys.color.<on>
- md.comp.fab.<set>.focused.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.10)
- md.comp.fab.<set>.focused.icon.color → md.sys.color.<on>
- md.comp.fab.<set>.pressed.container.elevation → md.sys.elevation.level3
- md.comp.fab.<set>.pressed.state-layer.color → md.sys.color.<on>
- md.comp.fab.<set>.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.10)
- md.comp.fab.<set>.pressed.icon.color → md.sys.color.<on>

**Baseline – Surface (`md.comp.fab.surface`, not recommended)**
- md.comp.fab.surface.container.color → md.sys.color.surface-container-high
- md.comp.fab.surface.lowered.container.color → md.sys.color.surface-container-low
- md.comp.fab.surface.container.shape → md.sys.shape.corner.large
- md.comp.fab.surface.container.width / .height → 56dp
- md.comp.fab.surface.container.elevation → md.sys.elevation.level3
- md.comp.fab.surface.lowered.container.elevation → md.sys.elevation.level1
- md.comp.fab.surface.container.shadow-color → md.sys.color.shadow
- md.comp.fab.surface.icon.size → 24dp
- md.comp.fab.surface.icon.color → md.sys.color.primary
- md.comp.fab.surface.{hover,focus,pressed}.icon.color → md.sys.color.primary
- md.comp.fab.surface.hover.state-layer.color → md.sys.color.primary; .opacity → md.sys.state.hover.state-layer-opacity
- md.comp.fab.surface.focus.state-layer.color → md.sys.color.primary; .opacity → md.sys.state.focus.state-layer-opacity
- md.comp.fab.surface.pressed.state-layer.color → md.sys.color.primary; .opacity → md.sys.state.pressed.state-layer-opacity
- md.comp.fab.surface.hover.container.elevation → md.sys.elevation.level4; md.comp.fab.surface.lowered.hover.container.elevation → md.sys.elevation.level2
- md.comp.fab.surface.focus.container.elevation → md.sys.elevation.level3; md.comp.fab.surface.lowered.focus.container.elevation → md.sys.elevation.level1
- md.comp.fab.surface.pressed.container.elevation → md.sys.elevation.level3; md.comp.fab.surface.lowered.pressed.container.elevation → md.sys.elevation.level1
- md.comp.fab.surface.focus.indicator.color → md.sys.color.secondary
- md.comp.fab.surface.focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
- md.comp.fab.surface.focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)

## 5. States & interaction

| State | Container | Icon | State layer | Elevation | Other |
| --- | --- | --- | --- | --- | --- |
| Enabled | role | on-role | — | level3 | — |
| Hovered | role | on-role | on-role @ 0.08 | level4 | tooltip with action label (web) |
| Focused (`:focus-visible`) | role | on-role | on-role @ 0.10 | level3 | focus ring; tooltip recommended |
| Pressed | role | on-role | on-role @ 0.10 + ripple | level3 | — |
| Hover + focus | role | on-role | 0.10 (highest of active states, derived) | level4 (hover wins, derived) | ring |
| Disabled | — | — | — | — | not supported; hide the FAB |

- Opening a FAB menu or expanding to a surface: see §6.

## 6. Motion & behavior
- **Appearing**: expands outward from its center (scale 0 → 1); icon may animate too. FAB moves independently of content.
- **Exit**: reverse (scale 1 → 0) (derived: symmetric with appear).
- **Screen transitions**: on layout change, FAB disappears and reappears; reappear only if relevant to the new screen, in the same position if possible.
- **Tabs**: on tab/page switch the FAB briefly disappears, then reappears once new content settles; never slides with body content.
- **Expanding**: morphs into any surface (app-structure surface or full screen) via the **container transform** pattern; can transition into a FAB menu (fab-menu.md).
- **Scrolling**: FAB stays in place (extended FABs may collapse on scroll — extended-fab.md).
- **Springs** (source gives none; derived per motion guidelines): appear/exit scale → spring primitive `default-spatial`; elevation/state-layer opacity → `fast-effects`; container transform → `default-spatial` for bounds, `default-effects` for fades.
- **Adaptive**: compact/medium → bottom trailing corner, medium FAB; expanded+ → upper leading area (e.g. inside navigation rail), large FAB. Can sit above the navigation bar or be nested in it; can be aligned left, center, or right.
- **RTL**: placement mirrors (bottom-end); icon mirrors only if directional (e.g. send/arrow) — follow guidelines RTL rules.

## 7. Usage guidelines
- One FAB per screen; only for the primary action.
- Choose size by hierarchy: FAB (compact, crowded), medium (default), large (prominent, expanded windows).
- Icon: clear, common (add, message, edit), filled style; no ambiguous icons.
- No badges/notifications on the FAB; no actions duplicated elsewhere on screen.
- Container must contrast with its background.
- No FABs on individual components such as cards.

## 8. Accessibility
- **Role**: native `<button type="button">` (or `<a href>` if it navigates). Accessible name via `aria-label` describing the action ("Compose a new message"), not the icon. Icon `aria-hidden="true"`.
- Opens a menu: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (see fab-menu.md) (web mapping).
- **Keyboard**:

| Key | Action |
| --- | --- |
| Tab | Focus lands on the FAB |
| Space / Enter | Activates the FAB's action |

- **Focus order**: prioritize the FAB (e.g. app bar → navigation bar → FAB, skipping other content); put FAB early in DOM order rather than using positive `tabindex`.
- Tooltip on hover/focus surfacing the label (web); tooltip is `role="tooltip"` and does not replace `aria-label`.
- Don't disable; hide when unavailable (remove from DOM or `hidden`, so it leaves the tab order).
- Icon/container contrast ≥ 3:1.
- Don't fully obscure another element's focus indicator; add `scroll-padding-bottom` / bottom margin to scroll containers ≥ FAB height + margin.
- Hidden (exiting) FAB must be `inert` during exit animation.

## 9. Implementation checklist
- [ ] API: `size` = `fab` (default) | `medium` | `large` (`small` not implemented — no tokens); `color` = `primary-container` (default) | `secondary-container` | `tertiary-container` | `primary` | `secondary` | `tertiary` (optional `surface`, `lowered`); `label` (required → `aria-label` + tooltip); icon slot; optional `href`; native `click`.
- [ ] Optional `hidden` with scale enter/exit animation.
- [ ] Structure: container (button) → state layer, ripple, icon; focus ring on host via outline.
- [ ] All colors/sizes via `--md-comp-fab-*` defaulting to `--md-sys-*`.
- [ ] Elevation level3 rest, level4 hover.
- [ ] No disabled styling; dev warning if `disabled` is set.
- [ ] Tooltip on hover/focus (web).
- [ ] reduced-motion and forced-colors fallbacks.
- [ ] Positioning helper (fixed, bottom-end, safe-area insets) optional, outside component core.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<button type="button" class="md-fab" data-size="medium" data-color="primary-container"
        aria-label="Compose a new message">
  <span class="md-fab__state-layer" part="state-layer" aria-hidden="true"></span><!-- + ripple primitive -->
  <span class="md-fab__icon material-symbols-rounded" part="icon" aria-hidden="true">edit</span>
</button>
<!-- link variant: <a class="md-fab" href="/compose" aria-label="…">…</a> -->
```

**(b) Custom properties**
```css
.md-fab {
  --md-comp-fab-container-size: 56px;
  --md-comp-fab-icon-size: 24px;
  --md-comp-fab-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-fab-container-color: var(--md-sys-color-primary-container);
  --md-comp-fab-icon-color: var(--md-sys-color-on-primary-container);
  --md-comp-fab-state-layer-color: var(--md-comp-fab-icon-color);
  --md-comp-fab-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-fab-hover-container-elevation: var(--md-sys-elevation-level4);
  --md-comp-fab-focus-indicator-color: var(--md-sys-color-secondary);
}
.md-fab[data-size="medium"] { --md-comp-fab-container-size: 80px; --md-comp-fab-icon-size: 28px;
  --md-comp-fab-container-shape: var(--md-sys-shape-corner-large-increased); }
.md-fab[data-size="large"]  { --md-comp-fab-container-size: 96px; --md-comp-fab-icon-size: 36px;
  --md-comp-fab-container-shape: var(--md-sys-shape-corner-extra-large); }
.md-fab[data-color="secondary-container"] { --md-comp-fab-container-color: var(--md-sys-color-secondary-container); --md-comp-fab-icon-color: var(--md-sys-color-on-secondary-container); }
.md-fab[data-color="tertiary-container"]  { --md-comp-fab-container-color: var(--md-sys-color-tertiary-container);  --md-comp-fab-icon-color: var(--md-sys-color-on-tertiary-container); }
.md-fab[data-color="primary"]   { --md-comp-fab-container-color: var(--md-sys-color-primary);   --md-comp-fab-icon-color: var(--md-sys-color-on-primary); }
.md-fab[data-color="secondary"] { --md-comp-fab-container-color: var(--md-sys-color-secondary); --md-comp-fab-icon-color: var(--md-sys-color-on-secondary); }
.md-fab[data-color="tertiary"]  { --md-comp-fab-container-color: var(--md-sys-color-tertiary);  --md-comp-fab-icon-color: var(--md-sys-color-on-tertiary); }
.md-fab[data-color="surface"]   { --md-comp-fab-container-color: var(--md-sys-color-surface-container-high); --md-comp-fab-icon-color: var(--md-sys-color-primary); }
.md-fab[data-color="surface"][data-lowered] { --md-comp-fab-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-fab-container-elevation: var(--md-sys-elevation-level1); --md-comp-fab-hover-container-elevation: var(--md-sys-elevation-level2); }

.md-fab {
  position: relative; display: inline-grid; place-items: center; flex: none;
  inline-size: var(--md-comp-fab-container-size); block-size: var(--md-comp-fab-container-size);
  padding: 0; border: 0; border-radius: var(--md-comp-fab-container-shape);
  background: var(--md-comp-fab-container-color); color: var(--md-comp-fab-icon-color);
  box-shadow: var(--md-comp-fab-container-elevation); /* elevation primitive */
  cursor: pointer; text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.md-fab__icon { font-size: var(--md-comp-fab-icon-size); inline-size: var(--md-comp-fab-icon-size);
  block-size: var(--md-comp-fab-icon-size); line-height: 1; font-variation-settings: 'FILL' 1; }
.md-fab__icon > svg { inline-size: 100%; block-size: 100%; fill: currentColor; }
.md-fab__state-layer { position: absolute; inset: 0; border-radius: inherit;
  background: var(--md-comp-fab-state-layer-color); opacity: 0; pointer-events: none; }
```

**(c) States**
```css
.md-fab:hover { box-shadow: var(--md-comp-fab-hover-container-elevation); }
.md-fab:hover .md-fab__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-fab:focus-visible .md-fab__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-fab:active .md-fab__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-fab:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-comp-fab-focus-indicator-color);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
.md-fab:focus:not(:focus-visible) { outline: none; }
```

**(d) Motion**
```css
.md-fab { transition: box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  scale var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.md-fab__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-fab[data-hidden] { scale: 0; pointer-events: none; }        /* exit: scale to center; add inert */
@starting-style { .md-fab { scale: 0; } }                        /* enter from center */
@media (prefers-reduced-motion: reduce) {
  .md-fab { transition: box-shadow 1ms, opacity var(--md-sys-motion-duration-short2) linear; }
  .md-fab[data-hidden] { scale: 1; opacity: 0; }
  @starting-style { .md-fab { scale: 1; opacity: 0; } }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-fab { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; forced-color-adjust: none; box-shadow: none; }
  .md-fab:focus-visible { outline-color: Highlight; }
  .md-fab__state-layer { display: none; }
}
```

**(f) Behaviour/JS**
- None required for a plain FAB (native button handles Enter/Space/click).
- Tooltip: show on `pointerenter`/`focus` after delay, hide on `pointerleave`/`blur`/Escape (tooltips.md).
- Show/hide: toggle `data-hidden` + `inert`; on tab change, hide → swap → show after content transition ends.
- Dev warning when `disabled` is set or more than one FAB is visible (optional).

## 11. Source gaps & decisions
- **Small FAB**: source says it's still available and "baseline tokens include small FAB", but the baseline token table contains only `md.comp.fab.surface` → not implemented; documented as not recommended.
- **Focus ring color/offset**: only tokenized in the deprecated surface set → applied to all color styles (secondary, 3px, 2px outer offset), consistent with the focus ring primitive.
- **Padding**: shown only in images → derived icon inset from tokens; implemented via centering, not padding.
- **Motion**: no spring/duration values for FAB appear/exit/elevation → used spring primitive (`default-spatial` for scale, `fast-effects` for shadow/state layer), labelled derived.
- **Hover + focus combination**: not specified → highest state-layer opacity, hover elevation.
- **Disabled**: no tokens; source says never disable → no disabled style, hide instead.
- **Placement margins**: not specified on the FAB page → 16px compact / 24px medium+ (derived from layout margins) + safe-area insets.
- **Forced colors**: not in source → system color border/outline (web mapping).
