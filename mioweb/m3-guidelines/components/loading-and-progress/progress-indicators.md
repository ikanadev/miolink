# Progress indicators

> Source: https://m3.material.io/components/progress-indicators · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.
>
> **Provenance labels:** **[source]** = m3.material.io. **[Compose]** = Jetpack Compose reference implementation (`androidx-main`: `material3/ProgressIndicator.kt`, `WavyProgressIndicator.kt`, `internal/LinearWavyProgressModifiers.kt`, `internal/CircularWavyProgressModifiers.kt`, checked 2026-10-16), used where the source has no numbers. **(derived …)/(web mapping)** = our decision.

## 1. Overview
Progress indicators show the status of an ongoing process (loading an app, submitting a form, saving updates) and capture attention through motion. [source]

**Use when** [source]
- Wait is **long (>5s)**. Short (200ms–5s) → loading indicator (`loading-indicator.md`). Instant (<200ms) → nothing.
- **Determinate**: known progress and wait time; must represent progress accurately.
- **Indeterminate**: process running, wait unknown. Switch indeterminate → determinate as soon as information is available.

**Don't** [source]
- Add an indicator per item of a group; use one for the group (unless items are activated independently).
- Mix variants for the same process across the product.
- For very long waits, consider letting people navigate away.

**Changes** [source]
- Aug 2024 (Expressive): configurable **track thickness**; **wavy** shape.
- Dec 2023 (NTC): end **stop indicator**, higher track/indicator contrast, new motion, rounded corners.
- Common token set `md.comp.progress-indicator.*` + `.circular` / `.linear`; the old separate baseline sets are "no longer recommended".

## 2. Variants & configurations
| Variant / configuration | Description | Notes |
|---|---|---|
| Linear | Bar; fills leading → trailing edge. [source] | Spans its container's width; ≥4dp inset each end; not in elements <40dp. Height 4dp flat / 10dp wavy. |
| Circular | Ring; fills from the top, clockwise. [source] | 40dp flat / 48dp wavy; flexible 24–240dp. |
| Behavior: determinate (default) / indeterminate | [source] | Indeterminate: "move along a fixed track, growing and shrinking". |
| Track thickness: fixed 4dp (default) / configurable | [source] | Thicker diagrams are "sample measurements", not tokens. |
| Shape: flat (default) / wavy | Wave on the active indicator only; track stays flat. [source] | Wavy increases container height; use flat at very small sizes (e.g. small buttons). |

## 3. Anatomy
1. **Active indicator**: progress so far (determinate) or growing/shrinking segment(s) (indeterminate). Round caps. Appears as a **dot** at very low progress. [source]
2. **Track**: remaining path; separated from the active indicator by a 4dp gap (token). Round caps.
3. **Stop indicator**: 4dp circle at the trailing end of **linear determinate** only; not for indeterminate or circular. Required when the track's contrast is < 3:1 with its container or the surface behind. [source]

## 4. Tokens & specs

### 4.1 Color
| Part | Token | Value |
|---|---|---|
| Active indicator | `md.comp.progress-indicator.active-indicator.color` | `--md-sys-color-primary` (#6750a4) |
| Track | `md.comp.progress-indicator.track.color` | `--md-sys-color-secondary-container` (#e8def8) |
| Stop indicator | `md.comp.progress-indicator.stop-indicator.color` | `--md-sys-color-primary` (#6750a4) |

- In a button: active indicator = button's label/icon color, **remove the track** (≥3:1). [source]
- Non-interactive: no hover/focus/pressed/disabled states.
- [Compose] defaults the **circular indeterminate** track to transparent; we keep the track (source: "move along a fixed track"); set `--md-comp-progress-indicator-track-color: transparent` to match Compose.

### 4.2 Size, layout & shape

**Linear**
| Property | Flat | Wavy | Token |
|---|---|---|---|
| Container height | 4dp | 10dp | `linear.height` / `linear.with-wave.height` |
| Active indicator thickness | 4dp | 4dp | `linear.active-indicator.thickness` |
| Track thickness | 4dp | 4dp | `linear.track.thickness` |
| Wave amplitude | — | 3dp | `linear.active-indicator.wave.amplitude` |
| Wavelength, determinate | — | 40dp | `linear.active-indicator.wave.wavelength` |
| Wavelength, indeterminate | — | 20dp | `linear.indeterminate.active-indicator.wave.wavelength` |
| Gap track ↔ active indicator | 4dp | 4dp | `linear.track-active-indicator-space` → `space50` |
| Stop indicator size | 4dp | 4dp | `linear.stop-indicator.size` |
| Stop indicator trailing space | 0dp | 0dp | `linear.stop-indicator.trailing-space` → `space0` |
| End insets | ≥4dp, modifiable [source] | same | — |
| Min width | 40dp [source] | 40dp | — |
| Default width | 100% of container (source: "always span the width"); [Compose] 240dp when unconstrained | | — |

Wavy height = thickness + 2 × amplitude = 4 + 6 = 10dp (derived; matches token). Amplitude = centre of rest line → centre of peak; wavelength = peak to adjacent peak. [source]

**Circular**
| Property | Flat | Wavy | Token |
|---|---|---|---|
| Size (outer diameter) | 40dp | 48dp | `circular.size` / `circular.with-wave.size` |
| Active indicator thickness | 4dp | 4dp | `circular.active-indicator.thickness` |
| Track thickness | 4dp | 4dp | `circular.track.thickness` |
| Wave amplitude | — | 1.6dp | `circular.active-indicator.wave.amplitude` |
| Wavelength | — | 15dp | `circular.active-indicator.wave.wavelength` |
| Gap | 4dp | 4dp | `circular.track-active-indicator-space` → `space50` |
| Size range | 24–240dp | 24–240dp [source] | — |

Derived geometry (web):
- Flat ring centreline radius `R = (S − t)/2` (40dp → 18dp). Wavy: `R = (S − t)/2 − A` (48dp → 20.4dp) so peaks touch the box edge.
- Wave count `N = max(5, round(2πR/λ))` ([Compose] formula, min 5) → 9 waves at 48dp. Wavelength is adjusted so waves close seamlessly.
- Waveform scales with size [source]: at size S use `A = 1.6·S/48`, `λ = 15·S/48` (derived), thickness unchanged unless configured.
- Shapes: all parts `corner.full` → round line caps (`stroke-linecap: round`).

**Gap & cap geometry** [Compose]: because caps add t/2 to each end, the centreline gap is `gap + t`; visible space between active cap and track cap = 4dp. Near 0 the gap shrinks: track starts at `p + min(p, gap + t)` (fractions of length). Circular: gap angle = `(gap + t)/(π·D)·360°` with D = ring diameter; track drawn from `sweep + min(sweep, gapAngle)` for `360° − sweep − 2·min(sweep, gapAngle)`.

**Low progress**: active indicator shown as a dot of diameter t as soon as p > 0 [source]; at p = 0 nothing is drawn (derived: "appears as soon as progress begins").

**Stop indicator position** [Compose]: diameter `min(4dp, track thickness)`, centre at `W − d/2 − min((h − d)/2, 6dp)`, i.e. centred in the track's round end cap for thicker tracks. Wavy linear: the dot shrinks when the active head reaches it (size reduces by the overlap) and disappears at 100%.

**Thickness configuration** (derived): set active and track thickness together; linear flat height = thickness; linear wavy height = thickness + 2A; circular keep S, recompute R. Gap stays 4dp.

### 4.3 Typography
None. Any percentage text lives outside the component.

### 4.4 Elevation
None (level0).

### 4.5 Component token list
**`md.comp.progress-indicator`** (common)
```
active-indicator.color   → md.sys.color.primary
track.color              → md.sys.color.secondary-container
stop-indicator.color     → md.sys.color.primary
active-indicator.shape   → md.sys.shape.corner.full
track.shape              → md.sys.shape.corner.full
stop-indicator.shape     → md.sys.shape.corner.full
```
**`md.comp.progress-indicator.circular`**
```
size                           → 40dp
with-wave.size                 → 48dp
active-indicator.thickness     → 4dp
track.thickness                → 4dp
track-active-indicator-space   → md.sys.measurement.space50 (4dp)
active-indicator.wave.amplitude  → 1.6dp
active-indicator.wave.wavelength → 15dp
```
**`md.comp.progress-indicator.linear`**
```
height                         → 4dp
with-wave.height               → 10dp
active-indicator.thickness     → 4dp
track.thickness                → 4dp
stop-indicator.size            → 4dp
track-active-indicator-space   → md.sys.measurement.space50 (4dp)
stop-indicator.trailing-space  → md.sys.measurement.space0 (0dp)
active-indicator.wave.amplitude  → 3dp
active-indicator.wave.wavelength → 40dp
indeterminate.active-indicator.wave.wavelength → 20dp
```
No motion tokens in the source; see §6.

## 5. States & interaction
- Non-interactive, not focusable; discoverable as `progressbar`.
- Modes: determinate (value 0–1) ↔ indeterminate (no value). Indeterminate → determinate: switch immediately; the active indicator animates from 0 to the value with the progress animation (derived; Compose uses separate composables, no morph).
- Completion: reaches 100% (wavy amplitude flattens at ≥95%), then the host hides it (fade with default effects spring helpers) (derived).

## 6. Motion & behavior

### 6.1 Direction [source]
Linear: leading → trailing (mirrored in RTL). Circular: from 12 o'clock, clockwise; not mirrored in RTL.

### 6.2 Determinate value changes
| Item | Value |
|---|---|
| Progress animation | [Compose] `ProgressAnimationSpec` = spring ζ = 1, stiffness 50 (`StiffnessVeryLow`), threshold 0.001 → ≈1300ms. CSS: `transition: --_p 1300ms linear(0, 0.114, 0.319, 0.514, 0.669, 0.781, 0.858, 0.910, 0.944, 0.965, 0.978, 0.987, 0.992, 0.995, 0.997, 0.998, 0.999, 1)` (derived: sampled from the spring) |
| Wavy amplitude | [Compose] amplitude factor `a = 0` when p ≤ 0.1 or p ≥ 0.95, else 1. Increasing: 500ms (`--md-sys-motion-duration-long2`) `--md-sys-motion-easing-standard`; decreasing: 500ms `--md-sys-motion-easing-emphasized-accelerate` |
| Wave travel | [Compose] phase moves **one wavelength per second** (linear, infinite) while a > 0: linear det. 40dp/s, indet. 20dp/s; circular 1 wave/s |

### 6.3 Linear indeterminate [Compose, adopted]
Cycle **1750ms**, infinite. Two segments; each end (head/tail) is a fraction 0→1 of the length, easing `--md-sys-motion-easing-emphasized-accelerate` within its window, 0 before, 1 after:

| Value | Start | End | Keyframe % (of 1750ms) |
|---|---|---|---|
| Segment 1 head | 0ms | 1000ms | 0% → 57.14% |
| Segment 1 tail | 250ms | 1250ms | 14.29% → 71.43% |
| Segment 2 head | 650ms | 1500ms | 37.14% → 85.71% |
| Segment 2 tail | 900ms | 1750ms | 51.43% → 100% |

Segments drawn from tail to head (heads lead toward the trailing edge). Track drawn in three parts around them, each separated by the gap: `[head1 + g, 1]`, `[head2 + g, tail1 − g]`, `[0, tail2 − g]` (omit when empty). Same keyframes for wavy (amplitude fixed at 1, wavelength 20dp, wave travelling). No stop indicator.

### 6.4 Circular indeterminate [Compose, adopted]
Cycle **6000ms**, infinite; three layered animations:
| Animation | Keyframes |
|---|---|
| Global rotation | 0 → 1080° linear over 6000ms |
| Additional rotation ("kick") | +90° in 300ms, hold to 1500ms; 180° at 1800ms, hold to 3000ms; 270° at 3300ms, hold to 4500ms; 360° at 4800ms, hold to 6000ms. Each 300ms move uses `--md-sys-motion-easing-emphasized-decelerate` (see §11) |
| Sweep | 0.10 → 0.87 of the circle (0–3000ms, linear), 0.87 → 0.10 (3000–6000ms, `--md-sys-motion-easing-standard`) |

Drawn: arc from 0 to `sweep·360°` (min 0.1° so caps render a dot), rotated by `global + kick − 90°` (start at top); track arc fills the rest with gaps (§4.2). Wavy circular: same, with wave on the arc (amplitude 1) and travelling phase.

### 6.5 Responsive [source]
Linear adapts to container width; circular 24–240dp by placement/breakpoint (very large only on large/XL windows).

### 6.6 SVG/CSS rendering approach (web mapping)
- **Linear flat**: pure CSS boxes (no SVG) — active, track and stop are absolutely positioned pill `<span>`s using logical insets, driven by a registered `--_p` number; RTL for free.
- **Linear wavy**: `<svg>` sized to the box (ResizeObserver gives W in px). One wave `<path>` spanning `W + 2λ`: built from quadratic half-waves `M0,c Q λ/4,c−2A λ/2,c T λ,c T 3λ/2,c …` (c = h/2; control at ±2A gives peak ±A, as Compose). Show only the active span with `stroke-dasharray`/`stroke-dashoffset` (set `pathLength` = path's x-extent so dash units ≈ x units — exact per whole wavelength); travel = `translateX(−phase)` on the path + equal dash offset. Amplitude factor via `transform: scaleY(a)` around c with `vector-effect: non-scaling-stroke`. Track = flat `<line>` (or CSS box).
- **Circular flat**: `<svg viewBox="0 0 S S">` with two `<circle r=R>` (track, active), `pathLength="360"`, `stroke-dasharray: sweep 360`, rotated −90°.
- **Circular wavy**: active as a `<path>` sampled from `r(θ) = R + a·A·sin(N(θ − φ))` from 0 to sweep (≥8 points per wave, joined with `L` or Catmull-Rom cubics), rebuilt per frame while animating; track as `<circle>` with dasharray.
- **Indeterminate**: CSS `@keyframes` on registered custom properties (`@property --_h1 { syntax: '<number>'; inherits: true; initial-value: 0 }` etc.) for flat linear; rAF in JS for anything wavy (same keyframe tables evaluated with the cubic-bezier easings).

## 7. Usage guidelines [source]
- One indicator per group/process; not on every item/button.
- **Linear placement**: on the edge of the loading container (top of page = whole page; on a card = that card; on the expanding edge if the container changes shape); may sit mid-container.
- **Circular placement**: centred on the loading container/page (button, card); for loading more items, in the empty space where content will appear, not over existing content; short loads → loading indicator.
- **In buttons**: circular; flat at very small sizes; label/icon color; no track.
- Wavy for expressive tone/longer processes.
- Stop indicator required if track contrast < 3:1 with container/surface; remove only with ≥3:1 on all surrounding surfaces.
- Linear: full width of its element, ≥4dp each end, not in elements <40dp. Circular: 24–240dp.

## 8. Accessibility
- Role **progress bar** [source] → `role="progressbar"` (web mapping; not native `<progress>` because it can't be styled consistently).
- Label = process + affected content: "Loading news article", "Refreshing page", "Loading my episodes" [source] → `aria-label`/`aria-labelledby`.
- Determinate: `aria-valuemin="0" aria-valuemax="100" aria-valuenow="45"` (+ optional `aria-valuetext`). Indeterminate: omit `aria-valuenow`; the loading region may set `aria-busy="true"` (web mapping).
- Active & stop indicator ≥3:1 against the background; in another component ≥3:1 against it [source].
- `prefers-reduced-motion` (derived): stop wave travel (static wave), drop circular kicks (global rotation only), keep linear indeterminate segments (they convey activity), determinate value changes jump or use 150ms.
- RTL: mirror linear only.

| Key | Action |
|---|---|
| — | Not interactive; no keyboard behaviour |

## 9. Implementation checklist
- [ ] Attributes: `variant` (`linear`|`circular`), `value` (0–1; absent = indeterminate), `max`, `shape` (`flat`|`wavy`), `thickness`, `size` (circular), `track` (bool, default true), `stop-indicator` (bool, default true; linear determinate only), `label`.
- [ ] Gap/cap math per §4.2; dot at low progress; nothing at 0.
- [ ] Wave per §6.6; amplitude rule (0 at ≤10% / ≥95%); phase 1 wavelength/s; scale A/λ with circular size.
- [ ] Indeterminate keyframes per §6.3/§6.4.
- [ ] Value animation (spring 50/1.0).
- [ ] Pause rAF when not visible/disconnected.
- [ ] ARIA, RTL, reduced motion, forced colors.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Linear, flat, determinate -->
<div class="m3-progress m3-progress--linear" role="progressbar" aria-label="Loading news article"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="45" style="--md-progress-value: 0.45">
  <span part="active"></span><span part="track"></span><span part="stop"></span>
</div>
<!-- Linear, indeterminate (flat): two segments, three track parts -->
<div class="m3-progress m3-progress--linear" data-indeterminate role="progressbar" aria-label="Loading my episodes">
  <span part="active seg1"></span><span part="active seg2"></span>
  <span part="track t1"></span><span part="track t2"></span><span part="track t3"></span>
</div>
<!-- Circular (flat or wavy) -->
<div class="m3-progress m3-progress--circular" role="progressbar" aria-label="Refreshing page"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="30">
  <svg part="svg" viewBox="0 0 40 40" aria-hidden="true">
    <g class="rot"><circle part="track" cx="20" cy="20" r="18" pathLength="360"/>
      <circle part="active" cx="20" cy="20" r="18" pathLength="360"/></g>   <!-- wavy: <path part="active"> -->
  </svg>
</div>
<!-- Linear wavy: <svg part="svg"><line part="track"/><path part="active"/><circle part="stop"/></svg> -->
```

**(b) Custom properties**
```css
@property --_p  { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --_h1 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --_t1 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --_h2 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --_t2 { syntax: '<number>'; inherits: true; initial-value: 0; }

.m3-progress {
  --md-comp-progress-indicator-active-indicator-color: var(--md-sys-color-primary);
  --md-comp-progress-indicator-track-color: var(--md-sys-color-secondary-container);
  --md-comp-progress-indicator-stop-indicator-color: var(--md-sys-color-primary);
  --md-comp-progress-indicator-active-indicator-shape: var(--md-sys-shape-corner-full);
  --md-comp-progress-indicator-track-shape: var(--md-sys-shape-corner-full);
  --md-comp-progress-indicator-stop-indicator-shape: var(--md-sys-shape-corner-full);
  --_ease-acc: var(--md-sys-motion-easing-emphasized-accelerate);
  display: block; position: relative; contain: layout paint;
}
.m3-progress--linear {
  --md-comp-progress-indicator-linear-height: 4px;
  --md-comp-progress-indicator-linear-with-wave-height: 10px;
  --md-comp-progress-indicator-linear-active-indicator-thickness: 4px;
  --md-comp-progress-indicator-linear-track-thickness: 4px;
  --md-comp-progress-indicator-linear-stop-indicator-size: 4px;
  --md-comp-progress-indicator-linear-track-active-indicator-space: var(--md-sys-measurement-space50);
  --md-comp-progress-indicator-linear-stop-indicator-trailing-space: var(--md-sys-measurement-space0);
  --md-comp-progress-indicator-linear-active-indicator-wave-amplitude: 3px;
  --md-comp-progress-indicator-linear-active-indicator-wave-wavelength: 40px;
  --md-comp-progress-indicator-linear-indeterminate-active-indicator-wave-wavelength: 20px;
  --_t: var(--md-comp-progress-indicator-linear-track-thickness);
  --_g: var(--md-comp-progress-indicator-linear-track-active-indicator-space);
  --_p: clamp(0, var(--md-progress-value, 0), 1);
  block-size: var(--md-comp-progress-indicator-linear-height);
  min-inline-size: 40px; margin-inline: 4px;          /* source: ≥4dp end insets */
}
.m3-progress--linear[data-shape="wavy"] { block-size: var(--md-comp-progress-indicator-linear-with-wave-height); }
.m3-progress--circular {
  --md-comp-progress-indicator-circular-size: 40px;
  --md-comp-progress-indicator-circular-with-wave-size: 48px;
  --md-comp-progress-indicator-circular-active-indicator-thickness: 4px;
  --md-comp-progress-indicator-circular-track-thickness: 4px;
  --md-comp-progress-indicator-circular-track-active-indicator-space: var(--md-sys-measurement-space50);
  --md-comp-progress-indicator-circular-active-indicator-wave-amplitude: 1.6px;
  --md-comp-progress-indicator-circular-active-indicator-wave-wavelength: 15px;
  --_size: var(--md-comp-progress-indicator-circular-size);
  display: inline-block; inline-size: var(--_size); block-size: var(--_size);
}
.m3-progress--circular[data-shape="wavy"] { --_size: var(--md-comp-progress-indicator-circular-with-wave-size); }
```

**(c) Parts & state selectors (linear flat)**
```css
.m3-progress--linear > span { position: absolute; inset-block: 0; margin-block: auto; block-size: var(--_t);
  border-radius: var(--md-comp-progress-indicator-track-shape); }
/* determinate: active [0, a], track [a+g, 100%], a = max(t, p·100%) ; nothing when p = 0 */
.m3-progress--linear [part~="active"] { inset-inline-start: 0; inline-size: max(var(--_t), calc(var(--_p) * 100%));
  background: var(--md-comp-progress-indicator-active-indicator-color); }
.m3-progress--linear [part~="track"] { inset-inline-end: 0;
  inline-size: max(0px, calc(100% - max(var(--_t), var(--_p) * 100%) - var(--_g)));
  background: var(--md-comp-progress-indicator-track-color); }
.m3-progress--linear[data-zero] [part~="active"] { display: none; }               /* JS sets data-zero at p = 0 */
.m3-progress--linear[data-zero] [part~="track"] { inline-size: 100%; }
.m3-progress--linear [part="stop"] { inset-inline-end: var(--md-comp-progress-indicator-linear-stop-indicator-trailing-space);
  inline-size: var(--md-comp-progress-indicator-linear-stop-indicator-size);
  block-size: var(--md-comp-progress-indicator-linear-stop-indicator-size);
  border-radius: var(--md-comp-progress-indicator-stop-indicator-shape);
  background: var(--md-comp-progress-indicator-stop-indicator-color); }
.m3-progress[data-indeterminate] [part="stop"], .m3-progress[data-no-stop] [part="stop"] { display: none; }
.m3-progress[data-no-track] [part~="track"] { display: none; }
/* indeterminate segments/track parts: positions from --_t1/_h1/_t2/_h2 */
.m3-progress[data-indeterminate] [part~="seg1"] { inset-inline-start: calc(var(--_t1) * 100%); inline-size: max(var(--_t), calc((var(--_h1) - var(--_t1)) * 100%));
  opacity: min(1, calc((var(--_h1) - var(--_t1)) * 1000)); }   /* hidden while head = tail (before start / after end) */
.m3-progress[data-indeterminate] [part~="seg2"] { inset-inline-start: calc(var(--_t2) * 100%); inline-size: max(var(--_t), calc((var(--_h2) - var(--_t2)) * 100%));
  opacity: min(1, calc((var(--_h2) - var(--_t2)) * 1000)); }
/* gap only applied next to a segment that is on the track ([Compose]: start = head > 0 ? head + gap : 0; end = tail < 1 ? tail − gap : 1) */
.m3-progress[data-indeterminate] [part~="t1"] { --_s: calc(var(--_h1) * 100% + var(--_g) * min(1, var(--_h1) * 1000));
  inset-inline-start: var(--_s); inline-size: max(0px, calc(100% - var(--_s))); }
.m3-progress[data-indeterminate] [part~="t2"] { --_s: calc(var(--_h2) * 100% + var(--_g) * min(1, var(--_h2) * 1000));
  --_e: calc(var(--_t1) * 100% - var(--_g) * min(1, (1 - var(--_t1)) * 1000));
  inset-inline-start: var(--_s); inline-size: max(0px, calc(var(--_e) - var(--_s))); }
.m3-progress[data-indeterminate] [part~="t3"] { inset-inline-start: 0;
  inline-size: max(0px, calc(var(--_t2) * 100% - var(--_g) * min(1, (1 - var(--_t2)) * 1000))); }
```
Circular (SVG):
```css
.m3-progress--circular svg { inline-size: 100%; block-size: 100%; overflow: visible; }
.m3-progress--circular circle, .m3-progress--circular path { fill: none; stroke-linecap: round;
  stroke-width: var(--md-comp-progress-indicator-circular-active-indicator-thickness); }
.m3-progress--circular [part="track"] { stroke: var(--md-comp-progress-indicator-track-color);
  stroke-width: var(--md-comp-progress-indicator-circular-track-thickness); }
.m3-progress--circular [part="active"] { stroke: var(--md-comp-progress-indicator-active-indicator-color); }
.m3-progress--circular .rot { transform-origin: center; transform: rotate(-90deg); }
/* JS writes stroke-dasharray/dashoffset in "degrees" (pathLength=360): active = "sweep 360"; track = "len 360" + dashoffset = -(sweep + gapA) */
```

**(d) Motion**
```css
.m3-progress--linear:not([data-indeterminate]) { transition: --_p 1300ms linear(0, 0.114, 0.319, 0.514, 0.669, 0.781, 0.858, 0.910, 0.944, 0.965, 0.978, 0.987, 0.992, 0.995, 0.997, 0.998, 0.999, 1); }
.m3-progress--linear[data-indeterminate] {
  animation: m3-pi-h1 1750ms infinite, m3-pi-t1 1750ms infinite, m3-pi-h2 1750ms infinite, m3-pi-t2 1750ms infinite;
}
@keyframes m3-pi-h1 { 0% { --_h1: 0; animation-timing-function: var(--_ease-acc); } 57.143%, 100% { --_h1: 1; } }
@keyframes m3-pi-t1 { 0%, 14.286% { --_t1: 0; animation-timing-function: var(--_ease-acc); } 71.429%, 100% { --_t1: 1; } }
@keyframes m3-pi-h2 { 0%, 37.143% { --_h2: 0; animation-timing-function: var(--_ease-acc); } 85.714%, 100% { --_h2: 1; } }
@keyframes m3-pi-t2 { 0%, 51.429% { --_t2: 0; animation-timing-function: var(--_ease-acc); } 100% { --_t2: 1; } }

/* circular indeterminate: rotation layers in CSS, sweep via JS (or @property --_sweep) */
.m3-progress--circular[data-indeterminate] svg { animation: m3-pc-global 6000ms linear infinite; }
.m3-progress--circular[data-indeterminate] .rot { animation: m3-pc-kick 6000ms infinite; }
@keyframes m3-pc-global { to { transform: rotate(1080deg); } }
@keyframes m3-pc-kick {
  0%      { transform: rotate(-90deg);  animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
  5%, 25% { transform: rotate(0deg);    animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
  30%, 50%{ transform: rotate(90deg);   animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
  55%, 75%{ transform: rotate(180deg);  animation-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
  80%,100%{ transform: rotate(270deg); }
}
@media (prefers-reduced-motion: reduce) {
  .m3-progress--circular[data-indeterminate] .rot { animation: none; }
  .m3-progress--linear:not([data-indeterminate]) { transition-duration: 150ms; }
  /* JS: wave phase frozen */
}
```
(`5%` = 300ms, `25%` = 1500ms, etc. of 6000ms; the −90° base keeps the start at 12 o'clock.)

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .m3-progress { --md-comp-progress-indicator-active-indicator-color: Highlight;
    --md-comp-progress-indicator-stop-indicator-color: Highlight;
    --md-comp-progress-indicator-track-color: GrayText; forced-color-adjust: none; }
}
```

**(f) JS responsibilities**
- Map `value`/`max` → `--md-progress-value` and `aria-valuenow`; remove both for indeterminate; set `data-zero` at 0.
- ResizeObserver for linear wavy (W) and circular wavy (R, N).
- One rAF loop (shared) for: wave phase (λ per second), amplitude tween (500ms, standard up / emphasized-accelerate down; rule 0 at ≤0.1 or ≥0.95), circular sweep keyframes (6000ms) and wavy path rebuild. Stop when not visible/disconnected, `document.hidden`, or reduced motion (freeze phase).
- RTL: linear flat uses logical insets; linear wavy SVG gets `transform: scaleX(-1)` under `:dir(rtl)`; circular never mirrored.

## 11. Source gaps & decisions
- **No motion values in source** → adopted Compose's keyframes/durations (linear 1750ms two-segment; circular 6000ms rotation+kick+sweep; value spring 50/1.0; amplitude 500ms tweens; wave speed 1λ/s); labelled [Compose].
- **Compose keyframe easing quirk**: in Compose `keyframes`, `using` sets the easing of the interval *starting* at that keyframe, so the circular kick's emphasized-decelerate actually applies to the hold, and the sweep grows linearly/shrinks with standard. We apply the evident intent for the kick (300ms emphasized-decelerate moves) and keep the effective sweep behaviour.
- **Circular indeterminate track**: source says "fixed track", Compose defaults to transparent → we show the track; documented override.
- **Wavy circular geometry**: Compose uses a morph from circle to a star polygon (inner radius 0.75) with amplitude as morph progress; tokens give A = 1.6dp, λ = 15dp → web uses an explicit sine `r(θ)` with token values (derived, visually equivalent).
- **Waveform scaling with circular size**: source says proportions stay the same → A and λ scale by S/48 (derived).
- **Stop trailing space**: token 0dp; Compose adds up to 6dp to centre the dot in thick-track end caps → adopted as the thick-track rule.
- **End insets 4dp**: "screen edge" inset → default `margin-inline: 4px`, overridable.
- **0% rendering**: Compose draws a dot even at 0; source says the dot appears "as soon as progress begins" → nothing at 0.
- **Indeterminate → determinate**: no defined transition → immediate switch, value animates from 0.
- **Thick variants**: only samples → thickness is a free parameter; gap stays 4dp.
- **Linear default width**: Compose 240dp; source "span the width" → 100%.
