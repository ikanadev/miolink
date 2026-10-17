# Cards

> Source: https://m3.material.io/components/cards · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Cards contain content and actions about a single topic. They have flexible layouts and dimensions based on their content (headline, subhead, supporting text, media, buttons, lists, other components).

**Use when**
- Displaying content and actions on a single subject that should be easy to scan.
- Providing an entry point to deeper detail or navigation (album, trip details).
- Grouping related items in a grid, vertical list or carousel collection.

**Don't use when**
- Spacing, headlines or dividers alone would create a simpler hierarchy (don't force content into cards).
- On compact screens a list may display the same content more compactly (consider swapping cards for lists).

**Changes vs. M2 (still current in M3 Expressive)**
- New color mappings, dynamic-color compatible.
- Lower elevation, no shadow by default (only the elevated variant rests with a shadow).
- Three official variants: elevated, filled, outlined.
- The source lists no Expressive-specific card changes (no new sizes, no shape morph); all variants use `md.sys.shape.corner.medium` (12dp).

## 2. Variants & configurations

| Variant | Description | Rest container / elevation |
| --- | --- | --- |
| Elevated | Drop shadow; more separation from background than filled, less than outlined | `surface-container-low`, level1 |
| Filled | Subtle separation from background; least emphasis | `surface-container-highest`, level0 |
| Outlined | Visual boundary (1dp outline); greatest emphasis | `surface`, level0, 1dp `outline-variant` border |

All three provide the same legibility/functionality — choice is stylistic.

| Configuration | Description |
| --- | --- |
| Non-actionable (default) | Pure container holding buttons, links, chips, sliders, etc. No hover/ripple/focus on the card itself; no role. |
| Directly actionable | Whole card is one target with `button` or `link` role. Must not contain other actionable elements. |
| Draggable | Card can be picked up and reordered (dragged state). |
| Swipeable | One swipe action per card (dismiss or change state, e.g. flag/archive). |
| Expandable | Reveals more content via container transform or height expansion. |
| Disabled | Actionable card only. Elevated/filled: disabled container color @ 0.38; outlined: outline `outline` @ 0.12. |

## 3. Anatomy
1. **Container** (only required part) — size from content; expresses elevation.
2. **Outline** (outlined only) — 1dp border.
3. **Media** (optional) — thumbnail (avatar/logo), image/illustration, video.
4. **Headline** (optional) — subject of the card.
5. **Subhead** (optional) — byline, tagged location.
6. **Supporting text** (optional) — body; may contain a link.
7. **Actions** (optional) — buttons, icon buttons, selection controls, overflow menu.
8. **Dividers** (optional) — full-width for expandable regions; inset to separate related content.
9. **Icon** (token only) — 24dp, `primary`.
10. **State layer / ripple / focus ring** — actionable cards only.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Elevated | Filled | Outlined |
| --- | --- | --- | --- | --- |
| Container | Enabled | `surface-container-low` | `surface-container-highest` | `surface` |
| Container | Disabled | `surface` @ 0.38 | `on-surface` @ 0.38 | (no token; stays `surface`) |
| Outline | Enabled / hover / pressed / dragged | — | — | `outline-variant` |
| Outline | Focused | — | — | `on-surface` |
| Outline | Disabled | — | — | `outline` @ 0.12 |
| Shadow | All | `shadow` | `shadow` | `shadow` |
| Icon | Enabled | `primary` | `primary` | `primary` |
| State layer | Hover / focus / pressed / dragged | `on-surface` @ 0.08 / 0.10 / 0.10 / 0.16 | same | same |
| Focus indicator | Focus-visible | `secondary` | `secondary` | `secondary` |

Content color is not tokenized by the card; child components use their own tokens. (derived) Plain text default: headline/subhead `on-surface`, supporting text `on-surface-variant`. Disabled content (derived): content wrapper at 0.38 opacity (separate layer, not the container).

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Shape | 12dp — `md.sys.shape.corner.medium` (all variants, all states) |
| Left/right padding | 16dp |
| Top/bottom padding | (derived) 16dp, to match horizontal padding; full-bleed media ignores padding |
| Gap between cards in a collection | 8dp max |
| Internal content gap | (derived) 8dp between text blocks, 16dp before action row |
| Text alignment | Start-aligned |
| Icon size | 24dp |
| Outline width (outlined) | 1dp (inside the box: `box-shadow: inset` or `border` with `box-sizing: border-box`) |
| Focus indicator | 3dp thickness, 2dp outer offset, follows 12dp radius |
| Width/height | Content-driven; no min/max in source |
| Touch target | Whole card when actionable; inner controls ≥48×48dp |

### 4.3 Typography
Not tokenized. Recommended (derived from M3 type-scale roles): headline → `title-large` (or `headline-small` for hero cards); subhead → `title-small` or `body-medium`; supporting text → `body-medium`. Use the typography-roles shorthand from guidelines.

### 4.4 Elevation

| State | Elevated | Filled | Outlined |
| --- | --- | --- | --- |
| Enabled | level1 (1dp) | level0 | level0 |
| Hovered | level2 (3dp) | level1 (1dp) | level1 (1dp) |
| Focused | level1 | level0 | level0 |
| Pressed | level1 | level0 | level0 |
| Dragged | level4 (8dp) | level3 (6dp) | level3 (6dp) |
| Disabled | level1 | level0 | level0 |

Rendered via the elevation primitive with `--md-sys-color-shadow`.

### 4.5 Component token list
All tokens verified against the source (all three sets non-deprecated).

**md.comp.elevated-card**
```
container.color → md.sys.color.surface-container-low (#f7f2fa)
container.elevation → md.sys.elevation.level1
container.shape → md.sys.shape.corner.medium (12dp)
container.shadow-color → md.sys.color.shadow (#000000)
icon.color → md.sys.color.primary (#6750a4)
icon.size → 24dp
hover.container.elevation → md.sys.elevation.level2
hover.state-layer.color → md.sys.color.on-surface
hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
focus.container.elevation → md.sys.elevation.level1
focus.state-layer.color → md.sys.color.on-surface
focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
focus.indicator.color → md.sys.color.secondary (#625b71)
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
pressed.container.elevation → md.sys.elevation.level1
pressed.state-layer.color → md.sys.color.on-surface
pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
dragged.container.elevation → md.sys.elevation.level4
dragged.state-layer.color → md.sys.color.on-surface
dragged.state-layer.opacity → md.sys.state.dragged.state-layer-opacity (0.16)
disabled.container.color → md.sys.color.surface (#fef7ff)
disabled.container.elevation → md.sys.elevation.level1
disabled.container.opacity → 0.38
```

**md.comp.filled-card** — same keys as elevated except:
```
container.color → md.sys.color.surface-container-highest (#e6e0e9)
container.elevation → md.sys.elevation.level0
hover.container.elevation → md.sys.elevation.level1
focus.container.elevation → md.sys.elevation.level0
pressed.container.elevation → md.sys.elevation.level0
dragged.container.elevation → md.sys.elevation.level3
disabled.container.color → md.sys.color.on-surface (#1d1b20)
disabled.container.elevation → md.sys.elevation.level0
disabled.container.opacity → 0.38
```
(container.shape, shadow-color, icon.*, *.state-layer.*, focus.indicator.* identical to elevated.)

**md.comp.outlined-card**
```
container.color → md.sys.color.surface (#fef7ff)
container.elevation → md.sys.elevation.level0
container.shape → md.sys.shape.corner.medium (12dp)
container.shadow-color → md.sys.color.shadow
outline.width → 1dp
outline.color → md.sys.color.outline-variant (#cac4d0)
icon.color → md.sys.color.primary
icon.size → 24dp
hover.container.elevation → md.sys.elevation.level1
hover.outline.color → md.sys.color.outline-variant
hover.state-layer.color → md.sys.color.on-surface
hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
focus.container.elevation → md.sys.elevation.level0
focus.outline.color → md.sys.color.on-surface
focus.state-layer.color → md.sys.color.on-surface
focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
pressed.container.elevation → md.sys.elevation.level0
pressed.outline.color → md.sys.color.outline-variant
pressed.state-layer.color → md.sys.color.on-surface
pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
dragged.container.elevation → md.sys.elevation.level3
dragged.outline.color → md.sys.color.outline-variant
dragged.state-layer.color → md.sys.color.on-surface
dragged.state-layer.opacity → md.sys.state.dragged.state-layer-opacity (0.16)
disabled.container.elevation → md.sys.elevation.level0
disabled.outline.color → md.sys.color.outline (#79747e)
disabled.outline.opacity → 0.12
```

## 5. States & interaction

| State | Container | Outline (outlined) | State layer | Elevation | Focus ring |
| --- | --- | --- | --- | --- | --- |
| Enabled | rest color | `outline-variant` | none | rest | — |
| Hover (actionable) | rest | `outline-variant` | 0.08 | +1 level | — |
| Focus-visible | rest | `on-surface` | 0.10 | rest | 3dp `secondary`, +2dp |
| Pressed | rest | `outline-variant` | 0.10 + ripple | rest | if keyboard-focused |
| Dragged | rest | `outline-variant` | 0.16 | level4 (elevated) / level3 | — |
| Disabled | disabled color @ 0.38 | `outline` @ 0.12 | none | rest | — (not focusable) |

- Only directly actionable cards get hover, state layer, ripple, focus ring and `cursor: pointer`. Non-actionable cards never react; their children handle their own states.
- Combined states: focus + hover shows the higher (0.10) state layer only (don't stack); dragged overrides all.
- No shape morph on press for cards.
- Dragged card renders above everything except app bars and navigation; siblings don't get pushed during the drag.

## 6. Motion & behavior
- **State changes**: elevation (box-shadow), state-layer opacity and outline color use the spring primitive `fast-effects` (no overshoot; ≈150ms).
- **Expanding**: container transform (card → detail / full screen) for expressive hero moments; legacy motion: 500ms `md.sys.motion.easing.emphasized` (guidelines transitions). Show all content when expanded; never scroll inside the card to reveal content (mobile).
- **Navigation**: forward/backward pattern for consecutive hierarchy levels (simpler, for common transitions).
- **Swipe**: one swipe action per card, anywhere on the card (dismiss or change state). No swipeable content (image carousels, pagination) inside; swiping must not detach portions of a card.
- **Pick up & move**: reorder within a collection; raise to dragged elevation; card follows pointer (`transform`), siblings reflow only on drop or animate into the gap after it (derived: use `default-spatial` for sibling reflow).
- **Scrolling**: content taller than the max card height is truncated (no scroll) and revealed by expanding; an expanded card taller than the screen scrolls with the page. Desktop may scroll inside the card.
- **Adaptive**: alignment can shift (start/end/center) across breakpoints; a horizontal compact card can become a vertical expanded card; use multiple columns on expanded, regroup related cards into rows or carousels rather than stretching; on compact, consider lists.
- **Reduced motion**: container transform → cross-fade; no swipe fling animation (snap); elevation changes stay (fade).

## 7. Usage guidelines
- One topic per card; clear hierarchy; easy to scan.
- Collections: grid (default; staggered/mosaic via custom layout), vertical list, or horizontal row/carousel. Cards in a collection are coplanar (same resting elevation) unless picked up.
- Filter/sort controls go outside the collection; a filter applies to every card.
- Avoid text/icons over images; if needed, add a translucent scrim or bounding shape for contrast.
- Overflow menu: upper-end or lower-end corner (source says right; mirror in RTL).
- Never place an action on an actionable surface.
- Avoid menus over a card in its draggable state; if required, don't cover the card.

## 8. Accessibility
- Non-actionable card: no role (plain container; `<article>`/`role=group` with `aria-labelledby` optional — web mapping). Every inner action is a tab stop, all visited before the next card.
- Directly actionable card: `button` or `link` role; it is a single tab stop. Accessible name = headline (+ subhead via `aria-describedby` optional).
- Decorative images: `alt=""`.
- Reading order example: heading → image → body → primary button → secondary button (put the heading first in DOM; visually reorder media with CSS `order` if media is on top).
- Dragging/swiping needs a single-pointer alternative: tap or long-press opens a menu (Move up/down/to…, Delete). Announce reorder through an `aria-live="polite"` region.

| Key | Action |
| --- | --- |
| Tab | Actionable cards: next card. Non-actionable: next actionable element inside |
| Space / Enter | Activate card (button: Space or Enter; link: Enter), or open secondary action (menu) |
| Arrow keys | Inside an opened menu: move between items |
| Tab (in menu) | Exit menu |

## 9. Implementation checklist
- [ ] API: `variant` = `elevated | filled | outlined` (default elevated); `href` (renders `<a>`), `actionable` (renders button pattern), `disabled`, `draggable`.
- [ ] Events: native `click` (actionable); `dragstart/dragmove/dragend` (custom); `swipe` (one per card, `detail.direction`).
- [ ] Regions: `media`, `headline`, `subhead`, `supporting-text`, `actions` (layout helpers only).
- [ ] State layer / ripple / focus ring only when actionable.
- [ ] Padding 16dp inline; radius 12dp; ≤8dp gap in collections.
- [ ] Elevation per state table; dragged z-index below app bars/navigation.
- [ ] Disabled colors via color-mix; `aria-disabled`; not focusable.
- [ ] Dev warning when interactive descendants exist inside an actionable card.
- [ ] No internal scroll on compact; truncate + expand.
- [ ] RTL (logical properties), forced-colors, reduced motion.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Non-actionable -->
<article class="md-card md-card--outlined" aria-labelledby="c1-h">
  <div class="md-card__media" part="media"><img src="…" alt=""></div>
  <div class="md-card__content" part="content">
    <h3 id="c1-h" class="md-card__headline">Title</h3>
    <p class="md-card__subhead">Subhead</p>
    <p class="md-card__text">Supporting text</p>
  </div>
  <div class="md-card__actions" part="actions"><!-- md buttons --></div>
</article>

<!-- Directly actionable (link): <a> may contain flow content without interactive descendants -->
<a class="md-card md-card--elevated md-card--actionable" href="/album/1">…same parts…</a>

<!-- Directly actionable (button): stretched-button pattern keeps headings valid -->
<article class="md-card md-card--filled md-card--actionable">
  …parts…
  <button class="md-card__action" aria-labelledby="c2-h" aria-describedby="c2-t"></button>
</article>
```
Each actionable card contains `<span class="md-card__state" part="state-layer"></span>` (state layer + ripple primitives) as first child.

**(b) Custom properties**
```css
.md-card {
  --md-card-container-color: var(--md-sys-color-surface-container-low);
  --md-card-container-elevation: var(--md-sys-elevation-level1);
  --md-card-hover-elevation: var(--md-sys-elevation-level2);
  --md-card-dragged-elevation: var(--md-sys-elevation-level4);
  --md-card-disabled-container-color: var(--md-sys-color-surface);
  --md-card-disabled-container-opacity: 0.38;
  --md-card-outline-width: 0px;
  --md-card-outline-color: transparent;
  --md-card-container-shape: var(--md-sys-shape-corner-medium);
  --md-card-state-layer-color: var(--md-sys-color-on-surface);
  --md-card-icon-color: var(--md-sys-color-primary);
  --md-card-icon-size: 24px;
  --md-card-padding-inline: 16px;
  --md-card-padding-block: 16px; /* derived */
}
.md-card--filled {
  --md-card-container-color: var(--md-sys-color-surface-container-highest);
  --md-card-container-elevation: var(--md-sys-elevation-level0);
  --md-card-hover-elevation: var(--md-sys-elevation-level1);
  --md-card-dragged-elevation: var(--md-sys-elevation-level3);
  --md-card-disabled-container-color: var(--md-sys-color-on-surface);
}
.md-card--outlined {
  --md-card-container-color: var(--md-sys-color-surface);
  --md-card-container-elevation: var(--md-sys-elevation-level0);
  --md-card-hover-elevation: var(--md-sys-elevation-level1);
  --md-card-dragged-elevation: var(--md-sys-elevation-level3);
  --md-card-disabled-container-color: var(--md-sys-color-surface);
  --md-card-disabled-container-opacity: 1;
  --md-card-outline-width: 1px;
  --md-card-outline-color: var(--md-sys-color-outline-variant);
}
.md-card {
  position: relative; display: flex; flex-direction: column;
  box-sizing: border-box; text-align: start; color: var(--md-sys-color-on-surface);
  background: var(--md-card-container-color);
  border-radius: var(--md-card-container-shape);
  box-shadow: var(--md-card-container-elevation), inset 0 0 0 var(--md-card-outline-width) var(--md-card-outline-color);
  overflow: hidden; /* clips media + state layer; focus ring uses outline so it's not clipped */
  text-decoration: none;
}
.md-card__content { padding: var(--md-card-padding-block) var(--md-card-padding-inline) 0; display: flex; flex-direction: column; gap: 8px; }
.md-card__actions { padding: 16px var(--md-card-padding-inline) var(--md-card-padding-block); display: flex; gap: 8px; justify-content: flex-end; }
.md-card__action { position: absolute; inset: 0; z-index: 1; background: none; border: 0; border-radius: inherit; cursor: pointer; }
.md-card__media > img { display: block; inline-size: 100%; object-fit: cover; }
```

**(c) States** (state-layer opacity variable consumed by the state layer primitive)
```css
.md-card--actionable { cursor: pointer; }
.md-card--actionable:hover { --md-card-state-opacity: var(--md-sys-state-hover-state-layer-opacity); box-shadow: var(--md-card-hover-elevation), inset 0 0 0 var(--md-card-outline-width) var(--md-card-outline-color); }
.md-card--actionable:is(:focus-visible, :has(.md-card__action:focus-visible)) {
  --md-card-state-opacity: var(--md-sys-state-focus-state-layer-opacity);
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
}
.md-card--outlined:is(:focus-visible, :has(.md-card__action:focus-visible)) { --md-card-outline-color: var(--md-sys-color-on-surface); }
.md-card__action:focus-visible { outline: none; } /* ring drawn on the card */
.md-card--actionable:active { --md-card-state-opacity: var(--md-sys-state-pressed-state-layer-opacity); box-shadow: var(--md-card-container-elevation), inset 0 0 0 var(--md-card-outline-width) var(--md-card-outline-color); }
.md-card[data-dragging] { --md-card-state-opacity: var(--md-sys-state-dragged-state-layer-opacity); box-shadow: var(--md-card-dragged-elevation), inset 0 0 0 var(--md-card-outline-width) var(--md-card-outline-color); z-index: var(--md-card-dragged-z, 5); /* below app bars/nav */ }
.md-card[aria-disabled="true"], .md-card:has(.md-card__action:disabled) {
  cursor: default; pointer-events: none;
  background: color-mix(in srgb, var(--md-card-disabled-container-color) calc(var(--md-card-disabled-container-opacity) * 100%), transparent);
}
.md-card--outlined[aria-disabled="true"] { --md-card-outline-color: color-mix(in srgb, var(--md-sys-color-outline) 12%, transparent); }
.md-card[aria-disabled="true"] > :not(.md-card__state) { opacity: 0.38; } /* derived: content layer */
```

**(d) Motion**
```css
.md-card { transition: box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) { .md-card { transition-duration: 0.01ms; } }
```
Container transform: use View Transitions (`view-transition-name` on the card and the destination container) with 500ms emphasized easing; under reduced motion use a plain cross-fade.

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-card { border: 1px solid CanvasText; box-shadow: none; }
  .md-card--actionable:focus-visible, .md-card--actionable:has(:focus-visible) { outline-color: Highlight; }
  .md-card[aria-disabled="true"] { border-color: GrayText; color: GrayText; }
}
```

**(f) Behaviour / JS**
- Actionable card: native `<a>`/`<button>` give keyboard activation; JS only warns (dev) if interactive descendants exist.
- Disabled link card: remove `href`, set `aria-disabled="true"`, `tabindex="-1"`.
- Drag: pointer events (`pointerdown` → long-press 300ms (derived) or drag handle) → set `data-dragging`, translate via `transform`, insert placeholder; on drop update order, announce via live region. Provide menu alternative (Move up/down, Delete).
- Swipe: horizontal pointer drag with threshold (derived: 40% of width or fling velocity) → emit `swipe`; snap back otherwise.

## 11. Source gaps & decisions
- Filled card `disabled.container.color` = `on-surface` @ 0.38 (elevated uses `surface`): implemented as given from the source token, via color-mix.
- Outlined card has no disabled container token → container stays `surface`; content layer 0.38 (derived).
- No vertical padding, internal gaps or typography in source → 16dp block padding, 8dp text gap, 16dp before actions, title-large/body-medium (derived).
- No max height value for truncation → library prop `max-block-size` (derived), overflow hidden + expand control.
- Source says overflow menu "upper-right/lower-right" → mapped to end corners for RTL.
- `<button>` cannot contain headings → stretched-button pattern for button-role cards; `<a>` used directly for link cards.
- No state-change motion in source → fast-effects spring for shadow/outline/state layer (guidelines: elevation changes use effects).
- Dragged z-order "above all except app bars and navigation" → configurable `--md-card-dragged-z` below app bar/nav z-index.
- Icon tokens (24dp, primary) have no anatomy element in source → applied as default `color`/size for icons placed directly in the card.
