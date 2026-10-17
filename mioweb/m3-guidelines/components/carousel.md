# Carousel

> Source: https://m3.material.io/components/carousel · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
A carousel displays a scrollable collection of visual items (images, video) with optional brief label text. Items change size as they move through the carousel, and their visuals have a parallax effect when scrolled.

**Use when**
- Browsing many visual items (photos, event feeds) — multi-browse.
- Spotlighting large visual items (movies, featured apps) — hero / center-aligned hero.
- Immersive, vertically-scrolling image/video feeds — full-screen.
- Text-heavy, highly customized or traditional carousels — uncontained.

**Don't use when**
- Items need a lot of text or complicated imagery in a dynamic (multi-browse/hero) layout → uncontained layout or a series of cards.

**Status / changes**
- New in M3 (not in M2): dynamic item shapes/widths while scrolling, parallax, snap-scrolling.
- 2023: added uncontained, full-screen, centered, hero, multi-browse layouts.
- Nov 2025: new **uncontained multi-aspect ratio** layout.
- Research: previewed/"squished" items strongly signal more content; users expect ~10 items in a carousel that scrolls multiple items at once; all designs similarly usable.

## 2. Variants & configurations

| Layout | Visible items (compact) | Scroll | Notes |
| --- | --- | --- | --- |
| Multi-browse | ≥1 large + 1 medium + 1 small | Snap (recommended) | Browse many visuals; more large/medium items on larger screens. Compact: ≤3 items if they have text. |
| Uncontained | Same-size items bleeding past the trailing edge | Default (recommended) or snap | Traditional carousel; room for text/UI above/below items. |
| Uncontained multi-aspect ratio | Uncontained, variable widths | Default or snap | Item width between 9:16 (min) and 16:9 (max), e.g. 16:9, 9:16, 1:1, 3:4. Only when items truly vary. |
| Hero | 1 large + 1 small | Snap, one item at a time | Spotlight; more large items on larger screens. |
| Center-aligned hero | 1 centered large + 2 small (leading + trailing) | Snap | Most common centered carousel. |
| Full-screen | 1 edge-to-edge item | Snap, mandatory, vertical | Portrait only, compact & medium; never landscape; never default scrolling. Text/UI may overlay the image. |

| Configuration | Values |
| --- | --- |
| Alignment | `start` (default) or `center` (any layout can be centered; center-aligned hero most common) |
| Scroll behavior | `default` (free; uncontained only) or `snap` |
| Orientation | Horizontal; full-screen vertical |
| Item outline | Optional `with-outline` (1dp `outline`) |
| Large item max width | Customizable; drives how many items fit |

## 3. Anatomy
1. **Container** — rectangle holding all items; any size; visible count depends on layout and breakpoint.
2. **Large item** — primary visual; customizable max width.
3. **Medium item** — width adjusts to available space.
4. **Small item** — 40–56dp wide; preview hint.
5. **Item visual** (web part) — image/video laid out at large-item width and clipped by the item mask → parallax.
6. **Item text** (optional) — brief title/label; adapts to item size (large: title + label; medium: title hidden; small: abbreviated label).
7. **Item outline** (optional) — 1dp.
8. State layer, ripple, focus indicator per item.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Item container | Enabled | `md.comp.carousel-item.container.color` | `surface` (#fef7ff) |
| Item container | Disabled | `…disabled.container.color` @ `…disabled.container.opacity` 0.38 | `surface` |
| Shadow | All | `…container.shadow-color` | `shadow` |
| State layer | Hover / focus / pressed | `…{hover,focus,pressed}.state-layer.color` @ 0.08 / 0.10 / 0.10 | `on-surface` |
| Outline (with-outline) | Enabled / hover / pressed | `…with-outline.{,hover.,pressed.}outline.color` | `outline` (#79747e) |
| Outline (with-outline) | Focused | `…with-outline.focus.outline.color` | `on-surface` |
| Outline (with-outline) | Disabled | `…with-outline.disabled.outline.color` @ 0.12 | `outline` |
| Focus indicator | Focus-visible | `…focus.indicator.color` | `secondary` |

Carousel container: no token → transparent (derived). Item text over imagery: (derived) `inverse-on-surface`/white text on a `scrim` gradient, or `on-surface` on a solid `surface` background.

### 4.2 Size, layout & shape

| Layout | Alignment | Leading / trailing padding | Top / bottom padding | Gap | Large | Medium | Small | Radius |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Multi-browse | Vertically centered | 16 / 16dp | 8dp | 8dp | Dynamic or user-set | Dynamic | 40–56dp | 28dp |
| Uncontained | Vertically centered | 16dp / 0 (items bleed over padding) | 8dp | 8dp | Single fixed size | — | — | 28dp |
| Uncontained multi-aspect | Vertically centered | 16dp / 0 | 8dp | 8dp | height × ratio, ratio ∈ [9:16, 16:9] | — | — | 28dp |
| Hero | Vertically centered | 16 / 16dp | 8dp | 8dp | Dynamic | — | 40–56dp | 28dp |
| Center-aligned hero | Vertically centered | 16 / 16dp | 8dp | 8dp | Dynamic | — | 40–56dp | 28dp |
| Full-screen | Centered | 0 / 0 | 0 | 16dp | Viewport | — | — | (derived) 0 — edge-to-edge |

- Item shape: `md.sys.shape.corner.extra-large` (28dp) on all four corners of the mask.
- Item height = container block-size − 16dp (top/bottom padding); not specified in source — author sets the carousel `block-size` (derived default 220px).
- Outline width (with-outline): 1dp, inside the mask.
- Focus indicator: 3dp, 2dp outer offset, follows the current mask radius.
- **Show all** button below carousel: 4dp padding. Header arrow icon button: 48dp, header aligned to leading edge.
- Default large max width (derived, Compose sample value): 186dp for multi-browse/uncontained; hero = available width − 8dp gap − 56dp small.

### 4.3 Typography
Not tokenized. Keep text brief: ≤2 lines at compact unless background is a single color. Recommended (derived): title → `title-medium`, label → `label-large` (small items: abbreviated `label-medium`).

### 4.4 Elevation

| State | Elevation |
| --- | --- |
| Enabled / focused / pressed / disabled | level0 |
| Hovered | level1 (1dp) |

### 4.5 Component token list
Verified against source (`md.comp.carousel-item`, only set).
```
container.color → md.sys.color.surface (#fef7ff)
container.elevation → md.sys.elevation.level0
container.shadow-color → md.sys.color.shadow (#000000)
container.shape → md.sys.shape.corner.extra-large (28dp)
hover.container.elevation → md.sys.elevation.level1
hover.state-layer.color → md.sys.color.on-surface (#1d1b20)
hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
focus.container.elevation → md.sys.elevation.level0
focus.state-layer.color → md.sys.color.on-surface
focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
focus.indicator.color → md.sys.color.secondary (#625b71)
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
pressed.container.elevation → md.sys.elevation.level0
pressed.state-layer.color → md.sys.color.on-surface
pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
disabled.container.color → md.sys.color.surface
disabled.container.elevation → md.sys.elevation.level0
disabled.container.opacity → 0.38
with-outline.outline.color → md.sys.color.outline (#79747e)
with-outline.outline.width → 1dp
with-outline.hover.outline.color → md.sys.color.outline
with-outline.focus.outline.color → md.sys.color.on-surface
with-outline.pressed.outline.color → md.sys.color.outline
with-outline.disabled.outline.color → md.sys.color.outline
with-outline.disabled.outline.opacity → 0.12
```

## 5. States & interaction

| State | Mask / container | State layer | Outline (with-outline) | Elevation | Other |
| --- | --- | --- | --- | --- | --- |
| Enabled | `surface` | — | `outline` | 0 | — |
| Hover | — | `on-surface` 0.08 | `outline` | level1 | `cursor: pointer` |
| Focus-visible | — | 0.10 | `on-surface` | 0 | Focus ring 3dp `secondary` +2dp; item scrolls to its snap position |
| Pressed | radius 28 → 20dp (derived) | 0.10 + ripple | `outline` | 0 | Ripple also on inactive (small/medium) items |
| Disabled | `surface` @ 0.38, visual @ 0.38 (derived) | — | `outline` @ 0.12 | 0 | `aria-disabled`, skipped by activation |

- Source: "tapping on a carousel item changes the shape slightly" → (derived) corner radius 28dp → `md.sys.shape.corner.large-increased` (20dp) while pressed, `fast-spatial` spring; returns on release.
- Activating an inactive (small/medium) item: activate it (do not just scroll); (derived) libraries may offer `scrollOnActivateInactive` instead.

## 6. Motion & behavior
- **Parallax**: the item mask changes width while the visual stays at large width, centered in the mask → the visual moves at a different speed than the mask.
- **Dynamic sizing**: items morph between large/medium/small widths continuously with scroll (masked, never scaled).
- **Default scrolling**: free, items stop anywhere — uncontained only.
- **Snap-scrolling**: items snap to the layout grid on release. Hero: one item per swipe (`scroll-snap-stop: always`); multi-browse: many items per fling. Full-screen: always snaps to container edges, never stops halfway.
- Spring/duration: not in source → native scroll physics; programmatic scroll (`scrollTo`, focus) uses `behavior: "smooth"`; press shape uses `fast-spatial`, state layer/elevation `fast-effects`.
- **Adaptive**: visible count grows with container width (compact: up to 3; larger: more items that scale). Full-screen always 1. Recompute on resize.
- **Reduced motion**: no parallax, no size change — all items the same (large) size; carousel reaches window edges (no inline padding clipping); hero shows the next item only partially.

### 6.1 Layout algorithm (keyline model) — derived
Source gives only constraints (small 40–56dp, gaps, paddings, large max width). The algorithm below is modeled on the Material Components Android / Compose carousel strategies; label: (derived).

**Notation**: `Wc` container inline size; `ps`, `pe` leading/trailing padding; `W = Wc − ps − pe`; `g` gap (8); `Lmax` large max width; `Smin=40`, `Smax=56`; `n` item count.

**Step 1 — targets**
```
Lt = min(Lmax, W)
St = clamp(Lt / 3, Smin, Smax)
Mt = (Lt + St) / 2
```

**Step 2 — choose counts** (l large, m medium, s small)
- Multi-browse: s ∈ {1}, m ∈ {1, 0}; l from `max(1, floor((W − Mt − St − 2g) / (Lt + g)))` up to `ceil(W / (Lt + g))`.
- Hero (start): s = 1, m = 0; l from `max(1, floor((W − St − g) / (Lt + g)))` (compact → 1).
- Center-aligned hero: s = 2 (one each side), m = 0, l as hero with `W − 2(St + g)`.
- If `n ≤ l` or `W < Lt + g + Smin`: show `n` large items, no small/medium.

**Step 3 — fit each candidate** (`k = l + m + s` visible slots; `A = W − (k − 1)·g`)
```
L0 = (A − m·Mt − s·St) / l
E  = (L0 − Lt) · l                                  // total surplus (+) or deficit (−) vs. target larges
S  = s ? clamp(St + E / s, Smin, Smax) : 0          // small absorbs first, within 40–56
E2 = E − s·(S − St)
M  = m ? clamp(Mt + E2 / m, 0.9·Mt, 1.1·Mt) : 0     // then medium, ±10% flex
L  = (A − m·M − s·S) / l                            // large takes the remainder
valid if S < M < L (or m = 0) and L ≥ 2·Smax (derived legibility floor)
cost = |L − Lt|
```
Pick the lowest-cost valid candidate; on ties prefer more large items.

**Step 4 — keyline states.** A keyline = `{center c, size w}` in viewport coordinates, indexed `j` with an *unadjusted* offset `u_j = ps + L/2 + j·(L + g)` (where the item would be if all items were large). Lay out slot sizes left→right with gaps to get `c_j`. Add one **anchor** keyline before (j = −1) and after (j = k), size `S`, centered `g + S/2` outside the container edge.

| Layout | Start state | Middle state | End state |
| --- | --- | --- | --- |
| Multi-browse | `L×l, M, S` | = start | `S, M, L×l` |
| Hero | `L×l, S` | = start | `S, L×l` |
| Center-aligned hero | `L×l, S, S` | `S, L×l, S` | `S, S, L×l` |

**Step 5 — scroll range & state interpolation.**
```
step = L + g
P (max scroll) = max(0, (n − k) · step)   // at p = P the last item sits on the end state's last focal keyline (j = k − 1)
```
- If `P = 0` (n ≤ k): use the start state only (no interpolation).
- Start-aligned: state = lerp(start, end, `t = clamp((p − (P − (k − l)·step)) / ((k − l)·step), 0, 1)`), lerping each keyline's `c` and `w` pairwise (same indices).
- Center-aligned hero: lerp start→middle over `p ∈ [0, step]`, middle→end over `p ∈ [P − step, P]`.

**Step 6 — place items** (every frame on scroll, `p = scrollLeft`):
```
for item i: u = ps + L/2 + i·step − p
  find j with u_j ≤ u < u_{j+1}; t = (u − u_j) / step
  center = lerp(c_j, c_{j+1}, t); width = lerp(w_j, w_{j+1}, t)
  outside [u_{−1}, u_k] → hidden (visibility: hidden)
  item.style.transform = translateX(p + center − width/2) ; item.style.inlineSize = width
  visual stays inline-size L, centered in the item (parallax)
  sizeClass = width ≥ (L+M)/2 ? large : width ≤ (M+S)/2 ? small : medium   (m = 0 → split at (L+S)/2)
```
RTL: compute in logical coordinates, then `x_physical = Wc − x − width`; `scrollLeft` is negative in RTL (use `Math.abs`).

**Step 7 — snap points**: `p_i = min(i·step, P)` for i = 0…n−1 (dedupe). Implement as zero-size marker elements in the track at `inset-inline-start: p_i` with `scroll-snap-align: start`.

**Uncontained**: no keylines. Items fixed `inline-size = Lt` (multi-aspect: `block-size × ratio`, ratio clamped to [9/16, 16/9]); flex row, `gap: 8px`, `padding-inline-start: 16px`, `scroll-padding-inline-start: 16px`; optional `scroll-snap-align: start`. No parallax (mask never changes).

**Full-screen**: vertical scroller, each item `block-size: 100%` of the container, `gap: 16px`, `scroll-snap-type: y mandatory`, items `scroll-snap-align: start; scroll-snap-stop: always`.

## 7. Usage guidelines
- Items emphasize visuals; text optional and brief, adapting to size.
- Except uncontained, items must be fully visible on screen; scrolled items resize and snap.
- Set large size so images/text are legible; never so small the image is unrecognizable.
- Multi-browse: avoid for lots of text/complex imagery; compact → ≤3 items with text.
- Uncontained multi-aspect: only when items have various widths.
- Hero: one large focus item + peek of next. Center-aligned hero adds a leading preview item.
- Full-screen: taller-than-wide content, portrait compact/medium only.
- **Vertically-scrolling pages** (not full-screen): provide a way to see all items without horizontal scrolling — **Show all** button below the carousel (4dp padding) opening a vertical page of all items; with a header, a 48dp arrow icon button next to/in the header row (header leading-aligned), header repeated on the all-items page. Alternatives only if needed: Show all in nearby navigation, or control buttons above/below.
- Don't put arrows/buttons inside or beside the carousel (reducing width) or overlay them on its edge.

## 8. Accessibility
- Use cases: reach the carousel, move between items, activate, skip over.
- **Roles (web mapping)**: M3 "container" role → `<section aria-roledescription="carousel" aria-label="…">` with a `<ul role="list">`; each item `<li>` containing the activatable `<a>`/`<button>` (the focus target). Item label includes position and total: `aria-label="3 of 10, Title"` (or `aria-roledescription="slide"` + `aria-label` on a `role="group"` for non-activatable items).
- Initial **Tab** focuses the first item (never the container); Tab/Arrows move between items; Up/Down leave the carousel to the next/previous focusable (e.g. Show all).
- Focused item scrolls to its snap position (`p_i`) so it is large and fully visible.
- Decorative visuals: `alt=""` when the label describes them.
- Small items (40–56dp) are under 48dp wide: (derived) pointer hit area = mask; keyboard/Show-all provide the accessible path.
- Text over imagery needs contrast (scrim), especially full-screen.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Next / previous item (first Tab lands on first item) |
| Left / Right arrows | Previous / next item (mirrored in RTL) |
| Up / Down arrows | Leave carousel (previous / next focusable element) |
| Home / End | (derived) First / last item |
| Space / Enter | Activate focused item (Enter for links) |

## 9. Implementation checklist
- [ ] API: `layout` = `multi-browse | uncontained | uncontained-multi-aspect | hero | full-screen`; `align` = `start | center`; `snap` (default true except uncontained); `largeItemMaxWidth`; `itemOutline`; `label`.
- [ ] Item API: `disabled`, `href`/button, `aspectRatio` (multi-aspect), text slots `title`, `label`, `label-short`.
- [ ] Events: native `click` on items; `carousel-change` (`detail.index` = first focal item) after scroll settles (`scrollend`).
- [ ] Layout engine §6.1 with ResizeObserver; expose `data-size` per item.
- [ ] Snap markers; hero `scroll-snap-stop: always`.
- [ ] States + press radius morph; disabled.
- [ ] Keyboard per §8; roving not needed (all items tabbable).
- [ ] Reduced motion & RTL & forced colors.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<section class="md-carousel" data-layout="multi-browse" data-align="start"
         aria-roledescription="carousel" aria-label="Featured albums">
  <div class="md-carousel__scroller" part="scroller">          <!-- overflow-x:auto, snap -->
    <ul class="md-carousel__track" role="list" part="track">   <!-- inline-size = P + Wc (JS) -->
      <li class="md-carousel__item" data-size="large" part="item">
        <a class="md-carousel__mask" href="/a/1" aria-label="1 of 10, Title" part="mask">
          <span class="md-carousel__state"></span>            <!-- state layer + ripple primitives -->
          <img class="md-carousel__visual" src="…" alt="" part="visual">
          <span class="md-carousel__text" part="text">
            <span class="md-carousel__title">Title</span><span class="md-carousel__label">Label</span>
          </span>
        </a>
      </li>
      …
      <span class="md-carousel__snap" style="inset-inline-start:0px"></span> …
    </ul>
  </div>
</section>
<!-- after the carousel on scrolling pages -->
<a class="md-button md-button--text md-carousel-show-all" href="/all">Show all</a>
```

**(b) Custom properties**
```css
.md-carousel {
  --md-carousel-item-container-color: var(--md-sys-color-surface);
  --md-carousel-item-container-shape: var(--md-sys-shape-corner-extra-large);
  --md-carousel-item-pressed-shape: var(--md-sys-shape-corner-large-increased); /* derived */
  --md-carousel-item-hover-elevation: var(--md-sys-elevation-level1);
  --md-carousel-item-state-layer-color: var(--md-sys-color-on-surface);
  --md-carousel-item-outline-color: var(--md-sys-color-outline);
  --md-carousel-item-outline-width: 0px;           /* 1px with [data-outline] */
  --md-carousel-item-disabled-opacity: 0.38;
  --md-carousel-padding-inline-start: 16px;
  --md-carousel-padding-inline-end: 16px;
  --md-carousel-padding-block: 8px;
  --md-carousel-gap: 8px;
  --md-carousel-small-min: 40px;
  --md-carousel-small-max: 56px;
  --md-carousel-large-max: 186px;                   /* derived */
  display: block; block-size: 220px;                /* derived default */
}
.md-carousel[data-layout^="uncontained"] { --md-carousel-padding-inline-end: 0px; }
.md-carousel[data-layout="full-screen"] { --md-carousel-padding-inline-start: 0px; --md-carousel-padding-inline-end: 0px; --md-carousel-padding-block: 0px; --md-carousel-gap: 16px; --md-carousel-item-container-shape: 0px; block-size: 100dvh; }
.md-carousel[data-outline] { --md-carousel-item-outline-width: 1px; }
```

**(c) Structure & states**
```css
.md-carousel__scroller { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; block-size: 100%; scroll-snap-type: x mandatory; }
.md-carousel[data-snap="false"] .md-carousel__scroller { scroll-snap-type: none; }
.md-carousel__track { position: relative; block-size: 100%; margin: 0; padding: 0; list-style: none; overflow: clip; }
.md-carousel__snap { position: absolute; inset-block-start: 0; inline-size: 0; block-size: 1px; scroll-snap-align: start; }
.md-carousel[data-layout="hero"] .md-carousel__snap { scroll-snap-stop: always; }
.md-carousel__item { position: absolute; inset-block: var(--md-carousel-padding-block); inset-inline-start: 0; contain: layout style; will-change: transform, inline-size; }
.md-carousel__mask {
  position: relative; display: block; block-size: 100%; inline-size: 100%; overflow: hidden;
  border-radius: var(--md-carousel-item-container-shape);
  background: var(--md-carousel-item-container-color);
  box-shadow: inset 0 0 0 var(--md-carousel-item-outline-width) var(--md-carousel-item-outline-color);
  color: inherit; text-decoration: none; cursor: pointer;
}
.md-carousel__visual { position: absolute; inset-block: 0; inset-inline-start: 50%; inline-size: var(--md-carousel-large, 100%); block-size: 100%; object-fit: cover; translate: -50% 0; }
.md-carousel__text { position: absolute; inset-inline: 16px; inset-block-end: 16px; /* derived */ }
.md-carousel__item[data-size="medium"] .md-carousel__title,
.md-carousel__item[data-size="small"] .md-carousel__title { display: none; }
.md-carousel__item[data-size="small"] .md-carousel__label { /* JS swaps in label-short */ }

.md-carousel__mask:hover { --md-carousel-state-opacity: var(--md-sys-state-hover-state-layer-opacity); box-shadow: var(--md-carousel-item-hover-elevation), inset 0 0 0 var(--md-carousel-item-outline-width) var(--md-carousel-item-outline-color); }
.md-carousel__mask:focus-visible {
  --md-carousel-state-opacity: var(--md-sys-state-focus-state-layer-opacity);
  --md-carousel-item-outline-color: var(--md-sys-color-on-surface);
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
}
.md-carousel__mask:active { --md-carousel-state-opacity: var(--md-sys-state-pressed-state-layer-opacity); border-radius: var(--md-carousel-item-pressed-shape); }
.md-carousel__mask[aria-disabled="true"] {
  pointer-events: none; cursor: default;
  background: color-mix(in srgb, var(--md-carousel-item-container-color) 38%, transparent);
  --md-carousel-item-outline-color: color-mix(in srgb, var(--md-sys-color-outline) 12%, transparent);
}
.md-carousel__mask[aria-disabled="true"] > :not(.md-carousel__state) { opacity: var(--md-carousel-item-disabled-opacity); }

/* Uncontained: plain flow */
.md-carousel[data-layout^="uncontained"] .md-carousel__track { display: flex; gap: var(--md-carousel-gap); padding-inline-start: var(--md-carousel-padding-inline-start); padding-block: var(--md-carousel-padding-block); inline-size: max-content; overflow: visible; }
.md-carousel[data-layout^="uncontained"] .md-carousel__scroller { scroll-padding-inline-start: var(--md-carousel-padding-inline-start); }
.md-carousel[data-layout^="uncontained"] .md-carousel__item { position: relative; inset: auto; inline-size: var(--md-carousel-large-max); scroll-snap-align: start; }
.md-carousel[data-layout="uncontained-multi-aspect"] .md-carousel__item { inline-size: auto; aspect-ratio: clamp(0.5625, var(--ratio, 1), 1.7778); }
/* Full-screen: vertical */
.md-carousel[data-layout="full-screen"] .md-carousel__scroller { overflow: hidden auto; scroll-snap-type: y mandatory; }
.md-carousel[data-layout="full-screen"] .md-carousel__track { display: flex; flex-direction: column; gap: var(--md-carousel-gap); overflow: visible; }
.md-carousel[data-layout="full-screen"] .md-carousel__item { position: relative; inset: auto; flex: 0 0 100%; scroll-snap-align: start; scroll-snap-stop: always; }
```

**(d) Motion**
```css
.md-carousel__mask { transition:
  border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-carousel__mask { transition: none; }
  .md-carousel__mask:active { border-radius: var(--md-carousel-item-container-shape); }
  /* JS: switch keyline layouts to uncontained-style fixed widths (all items L), padding-inline 0 with scroll-padding 16px; hero item width = W − 24px so next item peeks partially */
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-carousel__mask { border: 1px solid CanvasText; }
  .md-carousel__mask:focus-visible { outline-color: Highlight; }
  .md-carousel__mask[aria-disabled="true"] { border-color: GrayText; }
}
```

**(f) JS responsibilities**
- ResizeObserver on the section → run §6.1 steps 1–5, set track `inline-size = P + Wc`, regenerate snap markers, set `--md-carousel-large: L px`.
- `scroll` listener (rAF-throttled) → step 6 per item (transform + inline-size + `data-size`). `scrollend` → dispatch `carousel-change`.
- `focusin` on an item → `scroller.scrollTo({left: ±p_i, behavior: reducedMotion ? 'auto' : 'smooth'})` (sign per RTL).
- `keydown` on items: Left/Right (RTL-mirrored) focus prev/next item; Home/End; Up/Down move focus to the previous/next focusable outside the carousel; `preventDefault` to stop native scroll.
- `matchMedia('(prefers-reduced-motion: reduce)')` change → re-layout.
- Update each item's `aria-label` "i of n, title" when items change.

## 11. Source gaps & decisions
- No layout/keyline math in source → §6.1 algorithm modeled on Material Components Android/Compose strategies (derived); constraints from source honored (small 40–56dp, gaps, padding).
- No default large max width → 186dp (Compose sample value); hero default fills width minus one small item.
- No carousel height → author-set `block-size`, derived default 220px; item height = height − 16dp.
- "Changes the shape slightly" on tap → radius 28 → 20dp (`corner.large-increased`) with fast-spatial spring (derived).
- Full-screen radius unspecified → 0 (edge-to-edge); token default 28dp kept for other layouts.
- Masking via real `inline-size` + `overflow: hidden` + `border-radius` (not `clip-path`), so the hover shadow and focus outline stay visible; item uses `contain: layout style` (no `paint`, which would clip them). Cost: one isolated layout per item per frame.
- Center-aligned multi-browse/uncontained not detailed in source → center variants of any layout use mirrored-symmetric middle state like center-aligned hero (derived).
- Disabled item content opacity not tokenized → visual/text at 0.38 (derived).
- M3 "container" role → `aria-roledescription="carousel"` on a labelled `<section>` (web mapping).
- Uncontained: no size change → no parallax (mask constant).
- Home/End keys not in source → added (derived, common carousel pattern).
