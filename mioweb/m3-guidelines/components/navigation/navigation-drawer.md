# Navigation drawer

> Source: https://m3.material.io/components/navigation-drawer · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

> **Status (M3 Expressive, May 2025):** the navigation drawer is **no longer recommended**. Use the **expanded navigation rail** ([navigation-rail.md](navigation-rail.md)) instead — mostly the same functionality, adapts better across breakpoints. Ship this component for legacy/compatibility only, ideally as a thin skin over the expanded-rail item/indicator code (see §11 for which values differ).

## 1. Overview
- Gives access to destinations and app functionality (e.g. switching accounts). Either permanently on-screen or opened/closed via a navigation menu icon. **Exactly one destination is always active.**
- Essentially a **list inside a side sheet**; can include a headline, section labels (subheads) and dividers.
- Use for: apps with ≥5 top-level destinations; ≥2 levels of navigation hierarchy; quick navigation between unrelated destinations; replacing the rail/bar on large screens.
- Don't combine with another primary navigation component (e.g. navigation bar) on the same screen. One per breakpoint: bar → compact; rail → medium/expanded; standard drawer → expanded, large, extra-large.
- Differences from M2: new color mappings + dynamic color; two variants (standard, modal); rounded corners on the drawer's ending edge; pill active indicator.

## 2. Variants & configurations
| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Standard – permanently visible | Beside app content, part of the layout; cannot be closed | Expanded, large, extra-large. Best for frequent switching |
| Standard – dismissible | Opened/closed by a visible menu icon (e.g. top app bar); stays open until tapped again | Content-focused layouts (photo gallery), rare switching |
| Modal | Overlays content with a **scrim**; doesn't affect the layout grid | Any breakpoint, mainly compact/medium. Always opened from outside (e.g. menu icon in a rail). Dismiss: select an item, tap scrim, swipe toward anchoring edge |
| With headline / section labels / dividers | Organisation for long lists | Full-width dividers between **groups** only |
| Icons on / off | Destinations text-only or icon + text | All destinations have icons, or none |

## 3. Anatomy
1. **Sheet / container** — side sheet anchored to the start edge (left LTR, right RTL).
2. **Headline** (optional) — drawer title.
3. **Section label / subhead** (optional).
4. **Destination item** — actionable list item: **active indicator** (pill), **icon** (optional, before label; outlined/filled), **label text** (required), **badge label text** (optional, trailing), **state layer**.
5. **Divider** (optional) — full-width, between groups.
6. **Scrim** (modal only) — directly behind the sheet; tap dismisses.
7. **Focus ring** (web).

## 4. Tokens & specs
> **Source gap:** the page says "one token set" but publishes **no token table** — only a 9-role color diagram and a measurements table. Values marked † come from the published M3 `md.comp.navigation-drawer` token set (material-web); values marked ‡ are reconciled with the expanded navigation rail tokens; everything else is from the source text.

### 4.1 Color
Diagram roles: 1 surface-container-low (container) · 2 on-surface-variant (headline) · 3 on-secondary-container (active label) · 4 on-secondary-container (active badge label) · 5 secondary-container (active indicator) · 6 on-secondary-container (active icon) · 7 on-surface-variant (inactive label/icon) · 8 on-surface-variant (inactive badge label) · 9 scrim.

| Part | State | Comp token (CSS) | System role |
| --- | --- | --- | --- |
| Container | — | `--md-comp-navigation-drawer-container-color` | `--md-sys-color-surface-container-low` (#f7f2fa) |
| Headline | — | `--md-comp-navigation-drawer-headline-color` † | `--md-sys-color-on-surface-variant` |
| Section label | — | (derived) | `--md-sys-color-on-surface-variant` |
| Active indicator | active | `--md-comp-navigation-drawer-active-indicator-color` | `--md-sys-color-secondary-container` |
| Icon / label / badge label | active, all states | `--md-comp-navigation-drawer-active-{icon,label-text,large-badge-label-text}-color` | `--md-sys-color-on-secondary-container` |
| State layer | active hover/focus/pressed | `--md-comp-navigation-drawer-active-{hover,focus,pressed}-state-layer-color` † | `--md-sys-color-on-secondary-container` |
| Icon / label / badge label | inactive, enabled | `--md-comp-navigation-drawer-inactive-{icon,label-text}-color`, `-large-badge-label-text-color` | `--md-sys-color-on-surface-variant` |
| Icon / label | inactive hover/focus/pressed | `--md-comp-navigation-drawer-inactive-{hover,focus,pressed}-{icon,label-text}-color` † | `--md-sys-color-on-surface` |
| State layer | inactive hover/focus | `--md-comp-navigation-drawer-inactive-{hover,focus}-state-layer-color` † | `--md-sys-color-on-surface` |
| State layer | inactive pressed | `--md-comp-navigation-drawer-inactive-pressed-state-layer-color` † | `--md-sys-color-on-secondary-container` (press previews the active style) |
| Scrim | modal | `--md-comp-navigation-drawer-scrim-color` (derived name) | `--md-sys-color-scrim` @ 0.32 (guidelines: scrim at 32% beneath modals and expanded navigation) |
| Divider | — | divider spec | `--md-sys-color-outline-variant` |
| Focus ring | focus | system | `--md-sys-color-secondary` (focus ring primitive) |

State-layer opacities: hover `--md-sys-state-hover-state-layer-opacity` (0.08), focus `--md-sys-state-focus-state-layer-opacity` (0.10), pressed `--md-sys-state-pressed-state-layer-opacity` (0.10). No disabled state (navigation components don't inherit disabled).

### 4.2 Size, layout & shape
| Attribute | Standard | Modal | Source |
| --- | --- | --- | --- |
| Container height | 100% | 100% | text |
| Container width | 360dp | 360dp (max: `100vw − 56px` on narrow windows, derived) | text |
| Container shape | 0,16,16,0dp → end corners `--md-sys-shape-corner-large` (16dp), mirrored in RTL | not stated → same as standard (`--md-sys-shape-corner-large-end`, derived) | text |
| Icon size | 24dp | 24dp | text |
| Active indicator | 336 × 56dp, radius 28dp (`--md-sys-shape-corner-full`) | same | text |
| Active indicator padding (inset from sheet sides) | 12dp | 12dp | text |
| Left / right padding (sheet edge → content) | 28dp / 28dp (= 12 inset + 16 inside indicator) | same | text |
| Padding between elements (items) | 0dp | 0dp | text |
| Label alignment | start | start | text |
| Item height | 56dp (= indicator height) | same | derived |
| Icon → label gap | 12dp † (rail horizontal item uses 8dp ‡) | same | derived |
| Label → badge label gap | ≥ 12dp, badge end-aligned at 28dp from sheet end | same | derived |
| Headline | 56dp tall row, 28dp inline padding, vertically centered | same | derived |
| Section label | 56dp tall row, 28dp inline padding (aligned with labels) | same | derived |
| Divider | 1dp, full width of the sheet, 0dp inset; 8dp block margin (derived) | same | text (full-width) / derived (margin) |
| Sheet block padding | 12dp top & bottom (derived) | same + `env(safe-area-inset-*)` | derived |

- Touch target: whole 56dp item (indicator box) ≥ 48dp. Content scrolls inside the sheet when it overflows.
- Labels: single line, **truncate with ellipsis** (source: truncate rather than wrap or shrink).

### 4.3 Typography
| Part | Typescale |
| --- | --- |
| Headline | `--md-sys-typescale-title-small-*` † |
| Label text | `--md-sys-typescale-label-large-*` † (matches rail `item.horizontal.label-text.font` ‡) |
| Badge label text | `--md-sys-typescale-label-large-*` † |
| Section label | `--md-sys-typescale-title-small-*` (derived, list subhead) |

### 4.4 Elevation
| Variant | Elevation |
| --- | --- |
| Standard | `--md-sys-elevation-level0` † (rail expanded standard: level0 ‡) |
| Modal | `--md-sys-elevation-level1` † (rail expanded modal uses level2 ‡; see §11) |

### 4.5 Component token list
No tokens in source. † = published M3 token set (material-web); derived = this library.
```
md.comp.navigation-drawer.container.color → md.sys.color.surface-container-low   (diagram)
md.comp.navigation-drawer.container.width → 360dp                               (text)
md.comp.navigation-drawer.container.height → 100%                               (text)
md.comp.navigation-drawer.container.shape → md.sys.shape.corner.large, end corners only (text: 0,16,16,0)
md.comp.navigation-drawer.standard.container.elevation → md.sys.elevation.level0 †
md.comp.navigation-drawer.modal.container.elevation → md.sys.elevation.level1 †
md.comp.navigation-drawer.headline.color → md.sys.color.on-surface-variant      (diagram)
md.comp.navigation-drawer.headline.font → md.sys.typescale.title-small †
md.comp.navigation-drawer.active-indicator.color → md.sys.color.secondary-container (diagram)
md.comp.navigation-drawer.active-indicator.height → 56dp                        (text)
md.comp.navigation-drawer.active-indicator.width → 336dp                        (text)
md.comp.navigation-drawer.active-indicator.shape → md.sys.shape.corner.full (28dp) (text)
md.comp.navigation-drawer.icon.size → 24dp                                      (text)
md.comp.navigation-drawer.active.icon.color → md.sys.color.on-secondary-container (diagram)
md.comp.navigation-drawer.active.label-text.color → md.sys.color.on-secondary-container (diagram)
md.comp.navigation-drawer.active.{hover,focus,pressed}.{icon,label-text}.color → md.sys.color.on-secondary-container †
md.comp.navigation-drawer.active.{hover,focus,pressed}.state-layer.color → md.sys.color.on-secondary-container †
md.comp.navigation-drawer.inactive.icon.color → md.sys.color.on-surface-variant (diagram)
md.comp.navigation-drawer.inactive.label-text.color → md.sys.color.on-surface-variant (diagram)
md.comp.navigation-drawer.inactive.{hover,focus,pressed}.{icon,label-text}.color → md.sys.color.on-surface †
md.comp.navigation-drawer.inactive.{hover,focus}.state-layer.color → md.sys.color.on-surface †
md.comp.navigation-drawer.inactive.pressed.state-layer.color → md.sys.color.on-secondary-container †
md.comp.navigation-drawer.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08) †
md.comp.navigation-drawer.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1) †
md.comp.navigation-drawer.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1) †
md.comp.navigation-drawer.label-text.font → md.sys.typescale.label-large †
md.comp.navigation-drawer.active.large-badge-label-text.color → md.sys.color.on-secondary-container (diagram; derived name)
md.comp.navigation-drawer.large-badge-label-text.color → md.sys.color.on-surface-variant †
md.comp.navigation-drawer.large-badge-label-text.font → md.sys.typescale.label-large †
md.comp.navigation-drawer.scrim.color → md.sys.color.scrim @ 0.32 (derived name; opacity from guidelines)
```

## 5. States & interaction
| State | Indicator | Icon | Label / badge | State layer (in indicator shape) |
| --- | --- | --- | --- | --- |
| Inactive | none | outlined, on-surface-variant | on-surface-variant | — |
| Inactive + hover | none | on-surface | on-surface | on-surface @ 0.08 |
| Inactive + focus | none | on-surface | on-surface | on-surface @ 0.10 + focus ring |
| Inactive + pressed | none (appears on selection) | on-surface | on-surface | on-secondary-container @ 0.10 + ripple |
| Active | secondary-container pill, appears in place | filled, on-secondary-container | on-secondary-container | — |
| Active + hover / focus / pressed | unchanged | unchanged | unchanged | on-secondary-container @ 0.08 / 0.10 + ring / 0.10 + ripple |

- Selecting: indicator appears in place; icon outlined → filled and darkens (light) / lightens (dark).
- Space/Enter selects and moves focus to the newly opened section if applicable.

## 6. Motion & behavior
- **Enter/exit** (enter-and-exit beyond bounds pattern): sheet slides from the start edge; scrim fades. No values in source → legacy transition tokens per guidelines ("exit temporarily, e.g. drawer → emphasized"): enter `--md-sys-motion-easing-emphasized-decelerate` + `--md-sys-motion-duration-medium4` (400ms); exit `--md-sys-motion-easing-emphasized-accelerate` + `--md-sys-motion-duration-short4` (200ms); scrim opacity with the same durations, linear. Dismissible standard drawer: same timings on `inline-size` (content reflows) or translate.
- **Selection**: indicator fades in place (fast effects spring); no spatial morph is described.
- **Scrolling**: drawer content scrolls vertically, independently; body stays stationary (`overscroll-behavior: contain`).
- **Visibility**: permanent standard (no close), dismissible standard (menu icon toggles), modal (opened from outside; closes on item select, scrim tap, swipe toward anchoring edge, Escape on web).
- **Responsive**: compact → modal drawer or swap for navigation bar (**web: below 320 CSS px, always swap to a navigation bar**). Medium/expanded → modal drawer alone or with a navigation rail (drawer may repeat rail destinations if hierarchy levels are visually separated); standard drawer allowed in single-pane expanded layouts. Large/XL → standard drawer, or a rail that transitions into a modal drawer. Animate component swaps (rail → drawer on portrait → landscape).

## 7. Usage guidelines
- Most frequent destinations at the top; group related destinations.
- Placement: always the **start edge**.
- Dividers: full-width, between groups only — never between individual destinations.
- Labels: clear, short; **truncate** if too long — never wrap, never shrink text.
- Icons: before text; recognizable conventional icons; for all destinations or none; other app UI should reuse them.
- Section labels: short subheads to group destinations.
- Can be open or closed by default.
- Don't pair with another primary navigation component on the same screen.

## 8. Accessibility
- **Roles (web mapping)**: `<nav aria-label="…">`; items as `<a href>` with `aria-current="page"` on the active one. The source shows the role announced as "tab" (Android); on web prefer links/`aria-current` for page navigation, or `role="tablist" aria-orientation="vertical"` + `role="tab"`/`aria-selected` only when items switch in-page views. Modal: native `<dialog>` + `showModal()` (inert background, Escape), named via `aria-label`/`aria-labelledby` (headline).
- Section labels: `<ul role="group" aria-labelledby>` per section. Dividers: `<li role="separator">` or `<hr>`.
- Badges: include badge content in the accessible name ("Inbox, 24 unread").
- Accessible name = destination name; more descriptive when ambiguous.

| Key | Action |
| --- | --- |
| Tab | Focus lands on the first navigation destination (initial focus) |
| Arrow Up/Down | Move between destinations |
| Home / End (web mapping, optional) | First / last destination |
| Space / Enter | Select focused destination; focus moves to the newly opened section (if applicable) |
| Escape (web mapping) | Close modal drawer, return focus to the trigger |

- Focus management (modal): on open focus the first item; trap focus; on close return focus to the opener.
- Touch target ≥48dp (items 56dp). Selected state not color-only: filled icon + indicator.

## 9. Implementation checklist
- [ ] Ship as deprecated alias; point docs to the expanded navigation rail.
- [ ] Properties: `variant` (`standard` | `modal`), `open`, `dismissible` (standard), `value`, `headline`, `aria-label`.
- [ ] Item: `label`, `icon`, `active-icon`, `badge` (text), `href`, `value`, `active`.
- [ ] Slots: headline, items, section labels, dividers, header content.
- [ ] Events: `change`, `open`, `close`, `cancel` (scrim/Escape/swipe).
- [ ] 360dp × 100% sheet, start-anchored, end corners 16dp, logical properties for RTL.
- [ ] Item: 56dp indicator, 12dp inset, full radius, 28dp content padding, 24dp icon, label-large, ellipsis truncation.
- [ ] Exactly one active item; outlined → filled icon on activation.
- [ ] State layer + ripple clipped to indicator; inactive hover/focus colors switch to on-surface.
- [ ] Independent scroll; modal scrim 32%, focus trap, dismissal paths, enter/exit motion, reduced motion.
- [ ] Responsive: modal ↔ standard by window class; navigation bar below 320 CSS px.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- standard -->
<nav class="md-drawer" aria-label="Mail">
  <h2 class="md-drawer__headline" id="dh">Mail</h2>
  <ul class="md-drawer__list" role="list">
    <li><a class="md-drawer-item" href="/inbox" aria-current="page">
      <span class="md-drawer-item__state-layer" aria-hidden="true"></span>
      <span class="md-drawer-item__icon" aria-hidden="true">…</span>
      <span class="md-drawer-item__label">Inbox</span>
      <span class="md-drawer-item__badge">24</span>
    </a></li>
    <li role="separator" class="md-drawer__divider"></li>
    <li><ul role="group" aria-labelledby="s1" class="md-drawer__section">
      <li class="md-drawer__section-label" id="s1" role="presentation">Labels</li>
      <!-- items -->
    </ul></li>
  </ul>
</nav>
<!-- modal: same content inside -->
<dialog class="md-drawer md-drawer--modal" aria-labelledby="dh">…</dialog>
```

**(b) Custom properties & layout**
```css
.md-drawer {
  --md-comp-navigation-drawer-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-navigation-drawer-container-width: 360px;
  --md-comp-navigation-drawer-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-navigation-drawer-container-elevation: var(--md-sys-elevation-level0);
  --md-comp-navigation-drawer-headline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-navigation-drawer-active-indicator-color: var(--md-sys-color-secondary-container);
  --md-comp-navigation-drawer-active-indicator-height: 56px;
  --md-comp-navigation-drawer-active-indicator-shape: var(--md-sys-shape-corner-full);
  --md-comp-navigation-drawer-icon-size: 24px;
  --md-comp-navigation-drawer-active-color: var(--md-sys-color-on-secondary-container);   /* icon, label, badge, state layer */
  --md-comp-navigation-drawer-inactive-color: var(--md-sys-color-on-surface-variant);
  --md-comp-navigation-drawer-inactive-interactive-color: var(--md-sys-color-on-surface); /* hover/focus/pressed icon+label, hover/focus layer */
  --md-comp-navigation-drawer-inactive-pressed-state-layer-color: var(--md-sys-color-on-secondary-container);
  --_inset: 12px; --_pad: 16px;            /* 12 + 16 = 28dp content padding */

  box-sizing: border-box; display: flex; flex-direction: column;
  inline-size: var(--md-comp-navigation-drawer-container-width); block-size: 100dvh;
  padding: 12px var(--_inset);             /* block padding derived */
  overflow-y: auto; overscroll-behavior: contain;
  background: var(--md-comp-navigation-drawer-container-color);
  border-start-end-radius: var(--md-comp-navigation-drawer-container-shape);
  border-end-end-radius: var(--md-comp-navigation-drawer-container-shape);
}
.md-drawer__headline, .md-drawer__section-label {
  display: flex; align-items: center; min-block-size: 56px; margin: 0; padding-inline: var(--_pad);
  color: var(--md-comp-navigation-drawer-headline-color);
  font: var(--md-sys-typescale-title-small-weight) var(--md-sys-typescale-title-small-size)/var(--md-sys-typescale-title-small-line-height) var(--md-sys-typescale-title-small-font);
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
}
.md-drawer__list, .md-drawer__section { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; }
.md-drawer__divider { block-size: 1px; margin-block: 8px; margin-inline: calc(-1 * var(--_inset)); background: var(--md-sys-color-outline-variant); }
.md-drawer-item {
  position: relative; isolation: isolate; display: flex; align-items: center; gap: 12px;
  min-block-size: var(--md-comp-navigation-drawer-active-indicator-height); padding-inline: var(--_pad);
  border-radius: var(--md-comp-navigation-drawer-active-indicator-shape);
  color: var(--md-comp-navigation-drawer-inactive-color); text-decoration: none; outline: none; cursor: pointer;
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}
.md-drawer-item__icon { flex: none; inline-size: var(--md-comp-navigation-drawer-icon-size); block-size: var(--md-comp-navigation-drawer-icon-size); font-size: var(--md-comp-navigation-drawer-icon-size); }
.md-drawer-item__label { flex: 1; min-inline-size: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.md-drawer-item__badge { flex: none; margin-inline-start: auto; }
.md-drawer-item__state-layer { position: absolute; inset: 0; z-index: -1; border-radius: inherit; overflow: hidden;
  background: var(--md-comp-navigation-drawer-inactive-interactive-color); opacity: 0; }
.md-drawer--modal {
  position: fixed; inset-block: 0; inset-inline-start: 0; inset-inline-end: auto; margin: 0; border: 0;
  max-inline-size: calc(100vw - 56px); max-block-size: none;
  --md-comp-navigation-drawer-container-elevation: var(--md-sys-elevation-level1);
  box-shadow: var(--md-comp-navigation-drawer-container-elevation);   /* elevation primitive */
}
.md-drawer--modal::backdrop { background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent); }
```

**(c) States**
```css
.md-drawer-item[aria-current="page"] { background: var(--md-comp-navigation-drawer-active-indicator-color); color: var(--md-comp-navigation-drawer-active-color); }
.md-drawer-item[aria-current="page"] .md-drawer-item__icon { font-variation-settings: "FILL" 1; }
.md-drawer-item[aria-current="page"] .md-drawer-item__state-layer { background: var(--md-comp-navigation-drawer-active-color); }
.md-drawer-item:not([aria-current="page"]):is(:hover, :focus-visible, :active) { color: var(--md-comp-navigation-drawer-inactive-interactive-color); }
.md-drawer-item:not([aria-current="page"]):active .md-drawer-item__state-layer { background: var(--md-comp-navigation-drawer-inactive-pressed-state-layer-color); }
@media (hover: hover) { .md-drawer-item:hover .md-drawer-item__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); } }
.md-drawer-item:focus-visible .md-drawer-item__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-drawer-item:active .md-drawer-item__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-drawer-item:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset); } /* inner: sheet scroll container would clip an outer ring */
```
Ripple primitive inside `.md-drawer-item__state-layer`. No disabled state.

**(d) Motion**
```css
.md-drawer-item { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
                              color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-drawer--modal {
  translate: -100% 0;
  transition: translate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-accelerate),
              display var(--md-sys-motion-duration-short4) allow-discrete, overlay var(--md-sys-motion-duration-short4) allow-discrete;
}
.md-drawer--modal[open] { translate: 0 0; transition-duration: var(--md-sys-motion-duration-medium4); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
@starting-style { .md-drawer--modal[open] { translate: -100% 0; } }
.md-drawer--modal:dir(rtl):not([open]) { translate: 100% 0; }
@starting-style { .md-drawer--modal:dir(rtl)[open] { translate: 100% 0; } }
.md-drawer--modal::backdrop { opacity: 0; transition: opacity var(--md-sys-motion-duration-short4) linear, display var(--md-sys-motion-duration-short4) allow-discrete, overlay var(--md-sys-motion-duration-short4) allow-discrete; }
.md-drawer--modal[open]::backdrop { opacity: 1; }
@starting-style { .md-drawer--modal[open]::backdrop { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .md-drawer--modal, .md-drawer--modal:dir(rtl) { translate: none; transition-property: opacity, display, overlay; }
  .md-drawer--modal:not([open]) { opacity: 0; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-drawer { border-inline-end: 1px solid CanvasText; }
  .md-drawer-item[aria-current="page"] { background: Highlight; color: HighlightText; forced-color-adjust: none; }
  .md-drawer-item:focus-visible { outline-color: CanvasText; }
}
```

**(f) Behaviour / JS**
- Item activation (click/Enter/Space): move `aria-current`, fire `change`; modal → `close()` then move focus to the opened section/content.
- Arrow Up/Down/Home/End move focus among items (skip headline/section labels/dividers); Tab enters at the first item.
- Modal: `showModal()` from the trigger; close on `cancel` (Escape/back), backdrop click (`event.target === dialog`), item selection, swipe toward the start edge (pointer events: track `dx`, translate the sheet, close past 50% width or fast fling; derived thresholds); return focus to the trigger.
- Dismissible standard: toggle `hidden`/`inline-size` with the trigger's `aria-expanded`.
- Below 320 CSS px window width: render a navigation bar instead (source requirement).

## 11. Source gaps & decisions
- No token table in source → token list built from the measurements table + color diagram; missing state/typography/elevation values taken from the published material-web set (†) and labelled.
- Reconciliation with the expanded rail (‡): both use a 56dp pill, label-large labels, secondary-container indicator, on-secondary-container active content, level0 standard elevation. Differences kept for drawer fidelity: container surface-container-low (rail surface / surface-container), fill-width indicator 336dp (rail hugs by default; rail `fill` option ≈ drawer), icon-label gap 12dp (rail 8dp), inactive hover/focus content on-surface (rail on-surface-variant + on-secondary-container layer), modal elevation level1 (rail level2), labels truncate (rail must not truncate). When implemented as an alias over the rail, override these via the drawer's custom properties.
- Modal container shape not stated → same end-corner 16dp as standard.
- Scrim opacity not stated in the page → 32% from guidelines.
- Motion values absent → legacy emphasized decelerate 400ms enter / emphasized accelerate 200ms exit (guidelines' transition rules for drawers; screen-level transitions avoid bouncy springs).
- Headline/section-label height, icon-label gap, divider margin, sheet block padding are image-only → 56dp / 12dp / 8dp / 12dp (derived).
- Role announced as "tab" in the source (Android) → web uses links with `aria-current` by default; tablist only for in-page view switching.
- Focus ring uses the inner offset because the scrolling sheet would clip an outer ring.
- Swipe-to-dismiss thresholds not given → 50% width or fling (derived).
