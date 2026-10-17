# Loading indicator

> Source: https://m3.material.io/components/loading-indicator · shape morph: https://m3.material.io/styles/shape (Shape morph tab) · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.
>
> **Provenance labels used in this file:** **[source]** = stated on m3.material.io. **[Compose]** = read from the Jetpack Compose reference implementation (`androidx-main`: `material3/LoadingIndicator.kt`, `MaterialShapes.kt`, `pulltorefresh/PullToRefresh.kt`, checked 2026-10-16); these are implementation facts, not guideline text, and may change. **(derived …)/(web mapping)** = our decision for the web.

## 1. Overview
A loading indicator shows, through a looping **shape-morph** animation, that an activity is in progress when progress isn't detectable or doesn't need to be shown. It grabs attention, mitigates perceived latency, and is never decorative. [source]

**Use when** [source]
- Short waits: **200ms – 5s**. (Instant <200ms → no indicator; long >5s → progress indicator.)
- Pull-to-refresh (contained configuration).
- Inside components (buttons, tab icon) to show an ongoing action (validating a form, checking for updates).
- Recommended **replacement for most indeterminate circular progress indicators**.

**Don't use** [source]
- For processes that go indeterminate → determinate: transition between **progress indicators** instead; never transition a loading indicator into a progress indicator.
- As decoration.

**M3 Expressive (May 2025)**: new component (no baseline M3 equivalent). Contained or uncontained, uses shape and motion, scales in size, used in pull-to-refresh. [source]

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
|---|---|---|
| Loading indicator, Default (uncontained) | Morphing active indicator only, `primary`. | Directly on a surface. [source] |
| Loading indicator, Contained | Active indicator (`on-primary-container`) on a circular `primary-container` container. | Over other content; always for pull-to-refresh. [source] |
| Size | Default 48dp; flexible **24–240dp**. | Container : indicator ratio (48 : 38) constant when resizing. Very large sizes only on large/extra-large windows. [source] |

Only one token set (`md.comp.loading-indicator`). [source]

## 3. Anatomy
1. **Active indicator**: looping shape-morph sequence of **seven** unique Material 3 shapes (Material shape library), drawn inside a 38dp area. [source]
2. **Container (optional)**: 48dp circle (`corner.full`). In the default configuration the 48dp box is still the layout size ("to ensure sufficient margins, the size is 48dp while the shape container is 38dp"). [source]

## 4. Tokens & specs

### 4.1 Color
| Configuration | Part | Token | Value |
|---|---|---|---|
| Default | Active indicator | `md.comp.loading-indicator.active-indicator.color` | `--md-sys-color-primary` (#6750a4) |
| Default | Container | — | transparent [Compose: `Color.Transparent`] |
| Contained | Container | `md.comp.loading-indicator.contained.container.color` | `--md-sys-color-primary-container` (#eaddff) |
| Contained | Active indicator | `md.comp.loading-indicator.contained.active-indicator.color` | `--md-sys-color-on-primary-container` (#4f378b) |

- Inside another component, recolor so the indicator has ≥ 3:1 against that component (e.g. use the button's label color). [source: accessibility]
- No interactive or disabled states.

### 4.2 Size, layout & shape
| Property | Value |
|---|---|
| Box / container W×H | 48×48dp (`container.width/height`) |
| Active indicator size | 38dp (`active-indicator.size`) |
| Container shape | `--md-sys-shape-corner-full` (circle) |
| Size range | 24–240dp [source] |
| Scaling | indicator = S × 38/48 (≈ 0.7917 S) at any size S. E.g. 24→19, 96→76, 240→190 (derived from the constant-ratio rule) |

The 38dp is the rendered shape size *including rotation clearance*: [Compose] scales every shape by `min over shapes(max(bounds.w/maxBounds.w, bounds.h/maxBounds.h)) × 38/48` of the box, where `maxBounds` is the shape's bounding box under any rotation, so no shape is clipped while spinning and all shapes look similar in size. Each frame the path is re-centred on its own bounding-box centre.

### 4.3 Typography
None.

### 4.4 Elevation
None (level0). [Compose] pull-to-refresh loading indicator elevation = `ElevationTokens.Level0`.

### 4.5 Component token list
**`md.comp.loading-indicator`** (all from source)
```
active-indicator.color             → md.sys.color.primary
contained.container.color          → md.sys.color.primary-container
contained.active-indicator.color   → md.sys.color.on-primary-container
active-indicator.size              → 38dp
container.height                   → 48dp
container.width                    → 48dp
container.shape                    → md.sys.shape.corner.full
```
No motion tokens exist for this component; motion values in §6 are [Compose].

## 5. States & interaction
- Non-interactive, not focusable; exposed as a progress bar. [source]
- Container visible ⇒ indicator color switches `primary` → `on-primary-container`. [source]
- Lifecycle states (web mapping): `hidden` → `active` (looping) → `hidden`. Pull-to-refresh adds `pulling` (determinate morph tied to pull), `armed` (past threshold), `refreshing` (looping), `cancelled` (gesture reversed past threshold), `done`. (§6.3)

## 6. Motion & behavior

### 6.1 What the source states
- Active indicator = looping morph through **seven unique Material 3 shapes**. [source] The source does **not** name the shapes or give timings.
- Shape morphing uses the **expressive motion scheme** by default (switchable to standard); morph API for **web "is not currently available"**. [source: styles/shape]
- Material shape library = 35 shapes; any shape can morph into any other. [source: styles/shape]

### 6.2 Reference sequence & timing [Compose, verified in `LoadingIndicator.kt`]
Shapes, in order, then back to 1 (`IndeterminateIndicatorPolygons`; geometry from `MaterialShapes.kt`, unit-square coordinates, `reps` = rotational copies around (0.5,0.5), `mirror` = each rep also mirrored):

| # | Shape | Definition [Compose] |
|---|---|---|
| 1 | Soft burst | custom: (0.193,0.277) r0.053; (0.176,0.055) r0.053; reps 10 |
| 2 | Cookie 9-sided | `RoundedPolygon.star(9, innerRadius 0.8, rounding 0.5)`, rotated −90° |
| 3 | Pentagon | custom: (0.500,−0.009) r0.172; (1.030,0.365) r0.164; (0.828,0.970) r0.169; reps 1, mirror |
| 4 | Pill | custom: (0.961,0.039) r0.426; (1.001,0.428) r0; (1.000,0.609) r1.0; reps 2, mirror |
| 5 | Sunny | `RoundedPolygon.star(8, innerRadius 0.8, rounding 0.15)` |
| 6 | Cookie 4-sided | custom: (1.237,1.236) r0.258; (0.500,0.918) r0.233; reps 4 |
| 7 | Oval | `RoundedPolygon.circle()` scaled (1, 0.64), rotated −45° |

All shapes are `normalized()` (fit to the unit square) before morphing.

Animation model:
| Item | Value [Compose] |
|---|---|
| Morph interval | a new morph starts every **650ms** (full 7-shape loop = 4550ms) |
| Morph progress `p` | 0 → 1 with **spring stiffness 200, damping ratio 0.6**, visibility threshold 0.1 (settles < 650ms; peak overshoot ≈ 1.095, derived from ζ). On finish: advance shape index, snap `p` to 0, `base += 90° (mod 360)` |
| Global rotation `g` | 0 → 360° **linear, 4666ms**, infinite restart |
| Drawn rotation | `θ = 90·p + base + g`, clockwise; `base` starts at 90°. Each morph adds a quarter turn that springs (and overshoots ≈ 8.5°) with `p`; continuous at shape boundaries because `90·1 + base_old = base_new` |
| Shape | `Morph(shape[i], shape[i+1]).toPath(p)`; `p` is **not** clamped, so the outline slightly overshoots too |
| Determinate (Compose only) | Circle (rotated 18°) → Soft burst, `θ = −180°·progress` (CCW). Used by pull-to-refresh while pulling (§6.3); **not** a standalone guideline variant (source: not for determinate progress) |

Note: the spring (200/0.6) is a component constant, not one of the `md.sys.motion.spring.*` tokens (expressive default spatial is 380/0.8). Keep it as a component-level constant (derived: matches reference implementation; no token in source).

### 6.3 Pull-to-refresh
[source]: Jetpack Compose only in the guidelines; for lists/grids/card collections with newest content at the top and frequently updated content; use the **contained** configuration; may sit on top of or adjacent to content; must pass a **threshold** before refreshing; completing past the threshold refreshes, reversing past it cancels; stays visible until refresh completes and new content is visible (or the user navigates away); **never scrolls off-screen** with the content.

[Compose] values (adopt for web, derived):
| Item | Value |
|---|---|
| Positional threshold / max pull distance | 80dp / 80dp |
| Indicator offset | `translateY = fraction × 80dp − 48dp` (starts fully above the top edge, clipped to the scroll container's top) |
| While pulling (`fraction` = pull / threshold) | determinate morph circle → soft burst with `p = clamp(fraction, 0, 1)`, rotation `−180°·p`; beyond threshold extra rotation `−(fraction − 1)·180°` |
| On release past threshold | settle to threshold position, cross-fade determinate → indeterminate using **default effects** spring (`--md-sys-motion-spring-default-effects-*`) |
| Done | animate offset back to −48dp, then hide |

### 6.4 Responsive [source]
48dp is ideal for compact windows; scale up with larger panes/windows to stay proportional to the surrounding empty space; 24dp ≤ size ≤ 240dp.

### 6.5 Web implementation of the morph (web mapping)
There is no web shape-morph API [source], so ship **precomputed, vertex-matched cubic Béziers**:

1. **Build time (exact)**: in a small Kotlin/JVM script using `androidx.graphics:graphics-shapes`, rebuild the 7 polygons from the §6.2 table (copy `customPolygon` from `MaterialShapes.kt`), `normalized()` them, and for each consecutive pair (7 incl. 7→1) create `Morph(a, b)`; export `morph.asCubics(0f)` and `morph.asCubics(1f)` as two flat arrays of `[x0,y0,c1x,c1y,c2x,c2y,x1,y1]` per cubic (same length within a pair — that is the vertex matching). Also export the scale factor of §4.2. Emit `loading-shapes.json` (~10–15KB).
2. **Runtime**: each frame, for morph `i` and progress `p`, lerp every coordinate `start + (end − start)·p` and build `d = "M x0 y0 C … Z"` (one `C` per cubic). Set it on a single `<path>` in a `viewBox="0 0 1 1"` SVG; apply `transform="rotate(θ 0.5 0.5) translate(0.5 0.5) scale(s) translate(-cx -cy)"` where `s` = scale factor, `(cx,cy)` = bbox centre of the current point set.
3. **Clock**: one `requestAnimationFrame` loop drives `g = 360·(t mod 4666)/4666`; morph `p` from the analytic underdamped spring in guidelines ("Implementing springs on the web") with k=200, ζ=0.6, restarted every 650ms.
4. **Fallback (no JVM)**: export the 7 shapes as SVG from the Material shape library (Figma kit), sample each outline to N=128 points by polar ray-casting from the centre (all 7 are star-convex), align start angle 0°, lerp radii; render as a closed Catmull-Rom → cubic path. Visually close, not exact (derived).
5. CSS-only alternative: `@keyframes` on the CSS `d` property with the 14 exported paths (Chromium/Firefox only; Safari lacks `d` animation), so JS stays the primary path.

## 7. Usage guidelines [source]
- Pick by expected wait: <200ms none; 200ms–5s loading indicator; >5s progress indicator; for very long waits allow navigating away.
- Center on the page/container being loaded; when loading more items, center in the empty space where new content appears; don't overlap existing content.
- May be placed inside components (button taking a few seconds, tab icon).
- Container when over other content; none when directly on a surface; always for pull-to-refresh.
- Don't transition a loading indicator into a determinate progress indicator.

## 8. Accessibility
- Role **progress bar** [source] → `role="progressbar"` without `aria-valuenow` (indeterminate) (web mapping).
- Label describing purpose, e.g. "Loading news article", "Refreshing page" [source] → `aria-label`.
- Loading region `aria-busy="true"`; announce completion via the content or a polite live region (web mapping).
- Indicator ≥ 3:1 against its background (container or surface); the container has no requirement; in another component ≥ 3:1 against that component. [source]
- Pull-to-refresh must have a single-pointer alternative (Refresh button in the app bar, menu, or next to the content), keyboard-operable. [source]
- Reduced motion (web mapping, per guidelines "Reduced motion"): stop morphing (hold shape 1), keep only the linear global rotation slowed to 2× period (9332ms) so activity is still visible; no quarter-turn spring.

| Key | Action |
|---|---|
| — | Indicator is not focusable. The alternative Refresh control is a `<button>` (Enter/Space). |

## 9. Implementation checklist
- [ ] Attributes: `contained` (bool), `size` (px, default 48, clamp 24–240), `label`, `paused`; color override via `--md-comp-loading-indicator-active-indicator-color`.
- [ ] Square box `size`; optional circular container; indicator scaled `38/48` with rotation-safe scale factor.
- [ ] Morph engine per §6.5 (650ms interval, spring 200/0.6, 90°/morph, 4666ms global rotation, 7-shape closed loop).
- [ ] Pause rAF when `paused`, hidden (`IntersectionObserver`, `document.hidden`) or disconnected.
- [ ] Reduced-motion and forced-colors fallbacks.
- [ ] `role="progressbar"` + `aria-label`; no value attributes.
- [ ] Optional pull-to-refresh controller (§6.3) + non-gesture refresh button.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<div class="m3-loading-indicator" role="progressbar" aria-label="Loading news article"
     data-contained style="--md-loading-indicator-size: 48px">
  <svg part="indicator" viewBox="0 0 1 1" aria-hidden="true" focusable="false">
    <path part="shape" d="…"/>   <!-- d + transform written by JS each frame -->
  </svg>
</div>
```
Container = the host's background (no extra element).

**(b) Custom properties**
```css
.m3-loading-indicator {
  --md-comp-loading-indicator-active-indicator-color: var(--md-sys-color-primary);
  --md-comp-loading-indicator-contained-container-color: var(--md-sys-color-primary-container);
  --md-comp-loading-indicator-contained-active-indicator-color: var(--md-sys-color-on-primary-container);
  --md-comp-loading-indicator-container-shape: var(--md-sys-shape-corner-full);
  --md-loading-indicator-size: 48px;                 /* clamp 24–240px */
  --_size: clamp(24px, var(--md-loading-indicator-size), 240px);
  --_color: var(--md-comp-loading-indicator-active-indicator-color);

  display: inline-grid; place-items: center; flex: none;
  inline-size: var(--_size); block-size: var(--_size);
  border-radius: var(--md-comp-loading-indicator-container-shape);
  background: transparent; contain: strict;
}
.m3-loading-indicator > svg { inline-size: 100%; block-size: 100%; overflow: visible; }
.m3-loading-indicator path { fill: var(--_color); }   /* scale s already includes 38/48 */
```

**(c) Configuration selectors**
```css
.m3-loading-indicator[data-contained] {
  background: var(--md-comp-loading-indicator-contained-container-color);
  --_color: var(--md-comp-loading-indicator-contained-active-indicator-color);
}
.m3-loading-indicator[hidden] { display: none; }
/* In a button: .m3-button .m3-loading-indicator { --md-comp-loading-indicator-active-indicator-color: currentColor; --md-loading-indicator-size: 24px; } */
```

**(d) Motion**: JS-driven (§6.5); no CSS transitions on the SVG. Show/hide: fade `opacity` with default effects spring helpers (`--md-sys-motion-spring-default-effects-easing/-duration`).
```css
@media (prefers-reduced-motion: reduce) {
  /* JS: hold shape 1, no morph, no quarter-turn; rotate host svg slowly */
  .m3-loading-indicator[data-reduced] > svg { animation: m3-li-spin 9332ms linear infinite; }
}
@keyframes m3-li-spin { to { transform: rotate(1turn); } }
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .m3-loading-indicator { --_color: CanvasText; }
  .m3-loading-indicator[data-contained] { background: Canvas; outline: 1px solid CanvasText; }
}
```

**(f) JS responsibilities**
- Load `loading-shapes.json` once (module-level cache); one shared rAF ticker for all instances.
- Per frame: compute `g`, `p` (spring), `θ`; lerp cubics; write `d` and `transform`.
- Start on connect/visible, stop on `paused`, `hidden`, `IntersectionObserver` not intersecting, `visibilitychange`, disconnect.
- Read `matchMedia('(prefers-reduced-motion: reduce)')` (listen for changes) → set `data-reduced`, stop JS morph.
- No keyboard handling; never focusable. Parent region manages `aria-busy`.
- Pull-to-refresh controller: pointer/touch tracking on the scroller at `scrollTop = 0`, fraction = pull/80px, determinate morph while pulling, refresh on release when fraction ≥ 1, cancel otherwise; keep the indicator `position: sticky/absolute` at the top of the viewport, not inside scrolling content.

## 11. Source gaps & decisions
- **Seven shapes & timings not in source** → adopted the Compose reference values (§6.2), now verified against `LoadingIndicator.kt`/`MaterialShapes.kt` rather than memory; labelled [Compose].
- **Morph spring (200/0.6) is not a sys motion token** → kept as component constant; source only says "expressive scheme by default".
- **Web morph API "not currently available"** → precomputed matched-cubic morph (§6.5) with polar-resampling fallback.
- **Image alt texts say "secondary container"** for the container; tokens and captions say `primary-container` → tokens win.
- **Determinate loading indicator** exists in Compose but the source forbids determinate use → only used internally for the pull-to-refresh pull phase.
- **Pull-to-refresh is "Jetpack Compose only"** in the source → offered on web as an optional controller using Compose's 80dp threshold; non-gesture refresh mandatory.
- **"Loading indicator can be wavy"** sentence on styles/shape refers to the wavy progress indicator, not this component → ignored.
- **Reduced motion** not specified → hold shape, slow linear spin (still communicates activity).
- **Elevation/shadow** not specified → none (Compose uses level0 for pull-to-refresh).
