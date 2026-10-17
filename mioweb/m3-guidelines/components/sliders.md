# Sliders

> Source: https://m3.material.io/components/sliders · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Sliders let people select a value (or range) along a track — e.g. volume, brightness, image-filter intensity. They can use icons or labels to represent a numeric or relative scale.

- Present the full range of available values.
- Changes take effect **immediately** (live, while dragging).
- Three variants: **standard**, **centered**, **range**. Five sizes (XS–XL), horizontal/vertical orientation, optional inset icon, optional stops, optional value indicator.
- **M3 Expressive changes (May 2025):**
  - "Continuous" slider renamed **standard**; "discrete" slider is now the **stops** configuration.
  - New: vertical orientation; inset icon (standard only, M/L/XL); sizes XS (existing default), S, M, L, XL. S–XL are token-only outside Android Views: swap `md.comp.slider.xsmall.*` for the desired size set.
- Earlier refresh (Dec 2023) included: centered configuration (originally "web only") and range selection; vertical-bar handle that narrows when pressed; handle width change on selection; track shape adjusts when sliding to the edge; end stop indicator; larger value label; refreshed colors.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Standard | One value; active track from min to handle | Value starts from zero/beginning |
| Centered | One value in a negative↔positive range; active track from the center to the handle | End stops at both ends; no inset icon |
| Range | Two handles (min, max); active track between handles | Avoid vertical; no inset icon; end stops at both ends |
| Stops (formerly discrete) | Stop indicators at allowed values; handle snaps to nearest stop | Avoid too many stops |
| Value indicator | Bubble with the value while interacting | Optional; one visible at a time on range |
| Inset icon | Icon inside the track illustrating what the slider controls | Standard only; M/L/XL only (track ≥40px) |
| Orientation | Horizontal (default) / vertical | Vertical: min at bottom |
| Size | XS (default), S, M, L, XL | XL reserved for hero moments |

## 3. Anatomy
1. **Value indicator** (optional) — 48×44px `inverse-surface` container, `inverse-on-surface` label, 12px above the handle.
2. **Stop indicators** (optional) — 4px dots on the track; an **end stop** sits at the end of the inactive track (3:1 contrast anchor) unless the inactive track already has 3:1 contrast or end icons/text are used.
3. **Active track** — min → handle (centered: center → handle; range: between handles); `primary`.
4. **Handle** — 4px-wide vertical pill, height per size; narrows to 2px when focused/pressed. 6px gap to each track.
5. **Inactive track** — handle → max (range: outside the handles); `secondary-container`.
6. **Inset icon** (optional) — inside the active track at its start; moves to the inactive track when there isn't room.

Track outer corners use the per-size radius; **inner corners (next to the handle) are 2px**.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token (`md.comp.slider.…`) | System role |
| --- | --- | --- | --- |
| Active track | enabled / hover / focus / pressed | `active.track.color`, `focus.active.track.color`, `pressed.active.track.color` | `primary` |
| Active track | disabled | `disabled.active.track.{color,opacity}` | `on-surface` @ 0.38 |
| Inactive track | enabled / hover / focus / pressed | `inactive.track.color`, `focus.inactive.track.color`, `pressed.inactive.track.color` | `secondary-container` |
| Inactive track | disabled | `disabled.inactive.track.{color,opacity}` | `on-surface` @ 0.12 |
| Handle | enabled / hover / focus / pressed | `handle.color`, `active.handle.color`, `pressed.handle.color` | `primary` |
| Handle | disabled | `disabled.handle.{color,opacity}` | `on-surface` @ 0.38 |
| Stop on active track | enabled | `active.stop-indicator.container.{color,opacity}` (= `stop-indicator.color-selected`) | `on-primary` @ 1 |
| Stop on inactive track | enabled | `inactive.stop-indicator.container.{color,opacity}` (= `stop-indicator.color`) | `on-secondary-container` @ 1 |
| Stop on active track | disabled | `disabled.active.stop-indicator.container.color` | `inverse-on-surface` |
| Stop on inactive track | disabled | `disabled.inactive.stop-indicator.container.color` | `on-surface` |
| Value indicator container | shown | `value-indicator.container.color` | `inverse-surface` |
| Value indicator text | shown | `value-indicator.label.label-text.color` | `inverse-on-surface` |
| Inset icon | on active / on inactive track | — (derived from Color diagram roles 8 "on secondary container" / 9 "on primary") | `on-primary` / `on-secondary-container` |
| Inset icon | disabled (derived) | — | same as disabled stops: `inverse-on-surface` / `on-surface` @ 0.38 |
| Focus ring | focus-visible (derived) | — | `secondary` |

No hover tokens and no state layer: the handle **width change** and value indicator are the interaction feedback.

### 4.2 Size, layout & shape

**Per size** (size token sets)

| Attribute | XS (default) | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| Track thickness (active = inactive) | 16px | 24px | 40px | 56px | 96px |
| Track outer corner (`active.track.shape.leading` / `inactive.track.shape.trailing`) | 8px | 8px | 12px | 16px | 28px |
| Handle height (length across the track) | 44px | 44px | **52px*** | 68px | 108px |
| Inset icon size | — | — | 24px | 24px | 32px |
| Inset icon padding | — | — | 6px | 6px | 8px |
| Component block size (derived: max(handle, 48px target)) | 48px | 48px | 52px | 68px | 108px |

\* Conflict: measurement table = 52px; token `medium.active.handle.height` = 44px. Decision: 52px (handle overhangs the track by 6px per side like L: 56→68 and XL: 96→108; 44px would be only 2px per side). Expose the token so it can be set to 44.

**Common**

| Attribute | Value |
| --- | --- |
| Handle width — enabled / hover / disabled | 4px (`handle.width`, `hover.handle.width`, `disabled.handle.width`) |
| Handle width — focus / pressed (dragging) | 2px |
| Handle shape | `--md-sys-shape-corner-full` |
| Handle ↔ track gap (`active.handle.leading-space` / `trailing-space` / `padding`) | 6px (`--md-sys-measurement-space75`), measured from the handle's current edge |
| Track inner corner (next to a handle) | 2px |
| Stop indicator size / shape | 4px circle (`--md-sys-shape-corner-full`) |
| End stop inset (`stop-indicator.trailing-space`) | 4px (`--md-sys-measurement-space50`) from track end to the dot's edge → dot center 6px from the end (derived) |
| Value indicator container | 48 wide × 44 tall; shape `--md-sys-shape-corner-full` (derived: pill in the spec image) |
| Value indicator gap (`value-indicator.active.bottom-space`) | 12px (`--md-sys-measurement-space150`) between the handle's top and the container's bottom |
| Touch target | whole track box is the hit area; component block size ≥48px |

**Derived geometry** (L = track length, hw = current handle width, g = 6px gap):
- Handle travel: center `c = 2px + f·(L − 4px)`, f = (value − min)/(max − min). (Matches a native range thumb 4px wide.)
- Standard: active = [0, c − hw/2 − g]; inactive = [c + hw/2 + g, L]. Segments with length ≤ 0 are hidden.
- Range: inactive [0, c₁ − hw/2 − g]; active [c₁ + hw/2 + g, c₂ − hw/2 − g]; inactive [c₂ + hw/2 + g, L].
- Centered (center m = L/2): inactive on both sides of the handle with gaps; active from m to the handle's gap edge drawn on top of the inactive track (no gap at m); at value = center, no active segment.
- When the handle narrows (4→2px) the gap stays 6px from the handle edge, so both segments lengthen 1px.
- "Track shape adjusts at the edge": a short segment's radii shrink to fit (browser radius clamping when radii exceed the box) and the segment vanishes at 0.
- Stops: one per allowed value at the value position; the extreme stops use the 4px end inset instead; stops falling inside the handle zone [c − hw/2 − g, c + hw/2 + g] are hidden; color depends on the segment they sit on.
- Inset icon: at `padding` from the active segment's start; if active length < icon + 2·padding, it moves onto the inactive segment, `padding` after its start (next to the handle gap).

### 4.3 Typography

| Part | Role |
| --- | --- |
| Value indicator label | font `--md-sys-typescale-label-large-font`, size `-label-large-size` (14px), line-height `-label-large-line-height` (20px); weight `--md-sys-typescale-body-large-weight` (400), tracking `--md-sys-typescale-body-large-tracking` (0.5px) — mixed roles exactly as the tokens specify |

Centered, single line, `font-variant-numeric: tabular-nums` (derived); values longer than the 48px width grow the container horizontally (derived: `min-inline-size: 48px`, padding-inline 4px).

### 4.4 Elevation
None (value indicator level 0; not specified).

### 4.5 Component token list

**`md.comp.slider` (common)** → `--md-comp-slider-*`
```
active.track.color → sys.color.primary
inactive.track.color → sys.color.secondary-container
focus.active.track.color → sys.color.primary
focus.inactive.track.color → sys.color.secondary-container
pressed.active.track.color → sys.color.primary
pressed.inactive.track.color → sys.color.secondary-container
disabled.active.track.color → sys.color.on-surface
disabled.active.track.opacity → 0.38
disabled.inactive.track.color → sys.color.on-surface
disabled.inactive.track.opacity → 0.12
active.track.height → 16px
inactive.track.height → 16px
active.track.shape → sys.shape.corner.full
inactive.track.shape → sys.shape.corner.full
active.track.outer-corner.corner-size → sys.shape.corner.full
active.track.inner-corner.corner-size → 2px (top/bottom corners adjacent to the handle)
handle.color → sys.color.primary
handle.height → 44px
handle.width → 4px
handle.shape → sys.shape.corner.full
active.handle.color → sys.color.primary
active.handle.height → 44px
active.handle.width → 4px
active.handle.shape → sys.shape.corner.full
active.handle.leading-space → sys.measurement.space75 (6px)
active.handle.trailing-space → sys.measurement.space75 (6px)
active.handle.padding → sys.measurement.space75 (6px)
hover.handle.width → 4px
focus.handle.width → 2px
pressed.handle.width → 2px
pressed.handle.color → sys.color.primary
disabled.handle.color → sys.color.on-surface
disabled.handle.opacity → 0.38
disabled.handle.width → 4px
stop-indicator.size → 4px
stop-indicator.shape → sys.shape.corner.full
stop-indicator.trailing-space → sys.measurement.space50 (4px)
stop-indicator.color → sys.color.on-secondary-container
stop-indicator.color-selected → sys.color.on-primary
active.stop-indicator.container.color → sys.color.on-primary
active.stop-indicator.container.opacity → 1
inactive.stop-indicator.container.color → sys.color.on-secondary-container
inactive.stop-indicator.container.opacity → 1
disabled.active.stop-indicator.container.color → sys.color.inverse-on-surface
disabled.inactive.stop-indicator.container.color → sys.color.on-surface
value-indicator.container.color → sys.color.inverse-surface
value-indicator.label.label-text.color → sys.color.inverse-on-surface
value-indicator.label.label-text.font → sys.typescale.label-large.font
value-indicator.label.label-text.size → sys.typescale.label-large.size (14px)
value-indicator.label.label-text.line-height → sys.typescale.label-large.line-height (20px)
value-indicator.label.label-text.weight → sys.typescale.body-large.weight (400)
value-indicator.label.label-text.tracking → sys.typescale.body-large.tracking (0.5px)
value-indicator.active.bottom-space → sys.measurement.space150 (12px)
```

**Size sets** → `--md-comp-slider-{xsmall|small|medium|large|xlarge}-*`
```
xsmall.active.track.height → 16px      xsmall.inactive.track.height → 16px
xsmall.active.track.shape.leading → 8px   xsmall.inactive.track.shape.trailing → 8px
xsmall.active.handle.height → 44px

small.active.track.height → 24px       small.inactive.track.height → 24px
small.active.track.shape.leading → 8px    small.inactive.track.shape.trailing → 8px
small.active.handle.height → 44px

medium.active.track.height → 40px      medium.inactive.track.height → 40px
medium.active.track.shape.leading → 12px  medium.inactive.track.shape.trailing → 12px
medium.active.handle.height → 44px   (measurement table: 52px — see §4.2)
medium.icon.size → 24px                medium.icon.padding → 6px

large.active.track.height → 56px       large.inactive.track.height → 56px
large.active.track.shape.leading → 16px   large.inactive.track.shape.trailing → 16px
large.active.handle.height → 68px
large.icon.size → 24px                 large.icon.padding → 6px

xlarge.active.track.height → 96px      xlarge.inactive.track.height → 96px
xlarge.active.track.shape.leading → 28px  xlarge.inactive.track.shape.trailing → 28px
xlarge.active.handle.height → 108px
xlarge.icon.size → 32px                xlarge.icon.padding → 8px
```
Size sets override the common `active/inactive.track.height`, outer-corner size and `active.handle.height`. `shape.leading` (active) and `shape.trailing` (inactive) are the outer-end radii; centered/range segments that touch both ends use the same value (derived).

## 5. States & interaction

| State \ part | Active track | Inactive track | Handle | Stops | Value indicator |
| --- | --- | --- | --- | --- | --- |
| Enabled | `primary` | `secondary-container` | `primary`, 4px | `on-primary` / `on-secondary-container` | hidden |
| Hover | same | same | 4px; cursor `pointer` (derived; source: "cursor changes") | same | hidden |
| Focus-visible | same | same | **2px** + focus ring | same | shown (derived) |
| Pressed / dragging | same | same | **2px** | same | shown |
| Disabled | `on-surface` @ 0.38 | `on-surface` @ 0.12 | `on-surface` @ 0.38, 4px | `inverse-on-surface` / `on-surface` | hidden |

- **Select & drag:** standard → handle follows pointer smoothly; with stops → snaps to the nearest stop while dragging.
- **Select jump:** pressing the track moves the (nearest, for range) handle to that point / nearest stop, animated, then dragging continues.
- **Range:** each handle independently focusable; handles can't cross (clamp `start ≤ end`; equal allowed); pressed/focused handle on top; only its value indicator is shown.
- **Inset icon:** on the active track; moves to the inactive track when the active track is too short. Optionally swap icon at minimum (volume → mute).
- Focus ring: focus ring primitive around the handle pill (derived; source only says focus "lands on the handle").

## 6. Motion & behavior
Not specified in source beyond "handle adjusts width", "tracks adjust in shape when sliding to the edge". Derived:
- Handle width 4↔2px: spring primitive fast spatial (`--md-sys-motion-spring-fast-spatial-easing` / `-duration`); tracks follow (gap stays 6px).
- Select-jump / keyboard step: handle + track ends animate with fast spatial spring; during drag no transition (1:1 with pointer).
- Value indicator: fade + scale from the handle (`transform-origin: bottom center`, 0.8→1) with fast effects in, fast effects out (≈150ms).
- Stop colors switch instantly as the active segment passes them.
- Reduced motion: no position/width animation (instant), indicator fades only ≤50ms (`--md-sys-motion-duration-short1`).
- Values update continuously: `input` during drag/keys, `change` on release / key commit.
- Orientation: vertical → min at bottom, Up increases. Horizontal LTR increases left→right; RTL reverses (track, keys, stops, icon side).
- Responsive: larger sizes increase targets/emphasis; XL only for hero moments where the slider is the page focus.

## 7. Usage guidelines
- Standard: value starts at zero/beginning. Centered: zero/default in the middle. Range: min and max; **avoid vertical range sliders**.
- Value indicator appears while interacting; not required if the value is shown elsewhere. Alternative: an adjacent text field kept in two-way sync and reachable with **Tab directly after the slider**.
- Stops: avoid too many. End stop guarantees 3:1 contrast at the end of the inactive track; remove only if the inactive track already has 3:1. Icons/text at the ends (− / +) can replace end stops.
- Inset icon: only standard M/L/XL; never XS/S, centered or range; must illustrate what the slider controls.
- Active and inactive tracks always share the same thickness.

## 8. Accessibility
| Aspect | Web mapping |
| --- | --- |
| Role | native `<input type="range">` per handle (implicit `slider` role) |
| Values | native `min`/`max`/`step`/`value`; `aria-valuetext` for formatted/relative values ("50%", "−2 EV") |
| Orientation | vertical: `writing-mode: vertical-lr; direction: rtl` on the input (exposes vertical orientation) + `aria-orientation="vertical"` for older engines |
| Name | adjacent label (`<label for>` / `aria-labelledby`); range: distinct names, e.g. "Price minimum" / "Price maximum" |
| Disabled | `disabled` |
| External stepper icons | `<button>` with labels |
| Inset/end icons, stops, value indicator | `aria-hidden="true"` (value exposed by the input) |

| Key | Action |
| --- | --- |
| Tab | Focus the handle (each handle of a range in turn) |
| Arrows | ± one step / one stop (Right/Up increase; RTL: Left increases) — native |
| Space + Arrows | ± larger interval (derived: 10% of range, or next stop when stops are shown) — JS |
| Page Up / Page Down | ± larger interval (web convention, same as Space + Arrows) — native in most browsers |
| Home / End | Min / max — native |

Contrast: inactive-track end ≥3:1 (end stop or end icons). Target ≥48px.

## 9. Implementation checklist
**Public API (suggested)**
- [ ] `variant`: `standard` | `centered` | `range`; `size`: `xs` | `s` | `m` | `l` | `xl`; `orientation`: `horizontal` | `vertical`.
- [ ] `min` (0), `max` (100), `step` (1), `value`; range: `value-start` / `value-end`.
- [ ] `stops` (show stop indicators, snapping by `step`), `labeled` (value indicator), `value-label` formatter (also feeds `aria-valuetext`), `end-stop` (default true).
- [ ] `icon` slot (honored only for standard M/L/XL), optional `icon-min` slot.
- [ ] `disabled`, `name`; range: `name-start` / `name-end`.
- [ ] Events: `input` (continuous), `change` (commit).

**Native form participation**
- [ ] Light-DOM `<input type="range">` per handle: submission (`name=value`), reset (`defaultValue`), `<fieldset disabled>`, clamping/snapping to `min`/`max`/`step` all native.
- [ ] Range: two inputs (`name-start`, `name-end`, or same `name` twice); JS keeps `start.max = end.value`-style clamping (don't change native `min/max` — clamp in `input` handler).
- [ ] Custom element alternative: `ElementInternals` with `setFormValue(value)` (range: `FormData` with two entries); `formResetCallback` → default (native default = midpoint `min + (max−min)/2`; centered default = midpoint); `formDisabledCallback`; `formStateRestoreCallback`. No intrinsic validity failures; keep `setCustomValidity` for parity.

**Edge cases**
- [ ] Medium handle 52 vs 44 (§4.2).
- [ ] Inset icon placement switch; icon swap at min.
- [ ] Stops hidden under the handle zone; color by segment.
- [ ] Range nearest-handle selection on track press; equal values: pick by press side of the handle.
- [ ] Vertical, RTL, forced colors, reduced motion (§10).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<div class="md-slider" data-variant="standard" data-size="m" data-stops data-labeled
     style="--_f: 0.5">                          <!-- --_f = (value-min)/(max-min), set by JS -->
  <div class="md-slider__track" aria-hidden="true">
    <span class="md-slider__seg md-slider__seg--active"></span>
    <span class="md-slider__seg md-slider__seg--inactive"></span>
    <span class="md-slider__stops"><!-- JS: <i style="--_p:0.1"></i>… --></span>
    <span class="md-slider__icon"><svg>…</svg></span>
  </div>
  <span class="md-slider__handle" aria-hidden="true">
    <span class="md-slider__value">50</span>
  </span>
  <input class="md-slider__input" type="range" min="0" max="100" step="10" value="50"
         name="volume" aria-labelledby="vol-label">
</div>
<!-- range: two .md-slider__handle (data-handle="start|end", --_f on each) and two inputs; segments: inactive, active, inactive -->
```
The native input overlays the whole component (`opacity:0`, thumb styled 4px × full height so its travel equals the visual handle travel); it receives pointer, keyboard, focus, and form participation. For **range**, inputs get `pointer-events:none` and JS handles pointers (nearest handle) and forwards values.

**(b) Custom properties**
```css
.md-slider {
  --md-comp-slider-active-track-color: var(--md-sys-color-primary);
  --md-comp-slider-inactive-track-color: var(--md-sys-color-secondary-container);
  --md-comp-slider-handle-color: var(--md-sys-color-primary);
  --md-comp-slider-handle-width: 4px;
  --md-comp-slider-pressed-handle-width: 2px;
  --md-comp-slider-focus-handle-width: 2px;
  --md-comp-slider-active-handle-leading-space: var(--md-sys-measurement-space75);
  --md-comp-slider-active-track-inner-corner-corner-size: 2px;
  --md-comp-slider-stop-indicator-size: 4px;
  --md-comp-slider-stop-indicator-trailing-space: var(--md-sys-measurement-space50);
  --md-comp-slider-stop-indicator-color: var(--md-sys-color-on-secondary-container);
  --md-comp-slider-stop-indicator-color-selected: var(--md-sys-color-on-primary);
  --md-comp-slider-value-indicator-container-color: var(--md-sys-color-inverse-surface);
  --md-comp-slider-value-indicator-label-label-text-color: var(--md-sys-color-inverse-on-surface);
  --md-comp-slider-value-indicator-active-bottom-space: var(--md-sys-measurement-space150);
  /* size set (XS default) */
  --_track: var(--md-comp-slider-xsmall-active-track-height, 16px);
  --_outer: var(--md-comp-slider-xsmall-active-track-shape-leading, 8px);
  --_handle-h: var(--md-comp-slider-xsmall-active-handle-height, 44px);
  --_icon: 0px; --_icon-pad: 0px;
  /* internal */
  --_hw: var(--md-comp-slider-handle-width);
  --_gap: var(--md-comp-slider-active-handle-leading-space);
  --_c: calc(2px + var(--_f) * (100% - 4px));            /* handle center along the inline axis */
  --_a: var(--md-comp-slider-active-track-color);
  --_i: var(--md-comp-slider-inactive-track-color);
  --_h: var(--md-comp-slider-handle-color);
  --_sa: var(--md-comp-slider-stop-indicator-color-selected);
  --_si: var(--md-comp-slider-stop-indicator-color);
  position: relative; display: block; min-inline-size: 120px; /* derived */
  block-size: max(var(--_handle-h), 48px); touch-action: none;
}
.md-slider[data-size="s"]  { --_track: var(--md-comp-slider-small-active-track-height, 24px); --_outer: var(--md-comp-slider-small-active-track-shape-leading, 8px); --_handle-h: var(--md-comp-slider-small-active-handle-height, 44px); }
.md-slider[data-size="m"]  { --_track: var(--md-comp-slider-medium-active-track-height, 40px); --_outer: var(--md-comp-slider-medium-active-track-shape-leading, 12px); --_handle-h: 52px; --_icon: var(--md-comp-slider-medium-icon-size, 24px); --_icon-pad: var(--md-comp-slider-medium-icon-padding, 6px); }
.md-slider[data-size="l"]  { --_track: var(--md-comp-slider-large-active-track-height, 56px); --_outer: var(--md-comp-slider-large-active-track-shape-leading, 16px); --_handle-h: var(--md-comp-slider-large-active-handle-height, 68px); --_icon: var(--md-comp-slider-large-icon-size, 24px); --_icon-pad: var(--md-comp-slider-large-icon-padding, 6px); }
.md-slider[data-size="xl"] { --_track: var(--md-comp-slider-xlarge-active-track-height, 96px); --_outer: var(--md-comp-slider-xlarge-active-track-shape-leading, 28px); --_handle-h: var(--md-comp-slider-xlarge-active-handle-height, 108px); --_icon: var(--md-comp-slider-xlarge-icon-size, 32px); --_icon-pad: var(--md-comp-slider-xlarge-icon-padding, 8px); }

.md-slider__track { position: absolute; inset-inline: 0; inset-block-start: 50%; translate: 0 -50%; block-size: var(--_track); }
.md-slider__seg { position: absolute; inset-block: 0; }
.md-slider__seg--active { inset-inline-start: 0; inline-size: max(0px, calc(var(--_c) - var(--_hw) / 2 - var(--_gap)));
  background: var(--_a);
  border-start-start-radius: var(--_outer); border-end-start-radius: var(--_outer);
  border-start-end-radius: var(--md-comp-slider-active-track-inner-corner-corner-size); border-end-end-radius: var(--md-comp-slider-active-track-inner-corner-corner-size); }
.md-slider__seg--inactive { inset-inline-end: 0; inline-size: max(0px, calc(100% - var(--_c) - var(--_hw) / 2 - var(--_gap)));
  background: var(--_i);
  border-start-end-radius: var(--_outer); border-end-end-radius: var(--_outer);
  border-start-start-radius: var(--md-comp-slider-active-track-inner-corner-corner-size); border-end-start-radius: var(--md-comp-slider-active-track-inner-corner-corner-size); }
.md-slider__handle { position: absolute; inset-block-start: 50%; inset-inline-start: var(--_c);
  inline-size: var(--_hw); block-size: var(--_handle-h); translate: -50% -50%;
  border-radius: var(--md-sys-shape-corner-full); background: var(--_h); }
.md-slider__handle:dir(rtl) { translate: 50% -50%; }
.md-slider__stops { position: absolute; inset: 0; }
.md-slider__stops i { position: absolute; inset-block-start: 50%; translate: -50% -50%;
  inset-inline-start: calc(2px + var(--_p) * (100% - 4px));
  inline-size: var(--md-comp-slider-stop-indicator-size); aspect-ratio: 1; border-radius: var(--md-sys-shape-corner-full);
  background: var(--_si); }
.md-slider__stops i.is-active { background: var(--_sa); }   /* JS: p < f (standard) / between handles (range) */
.md-slider__stops i.is-hidden { visibility: hidden; }       /* JS: inside the handle zone */
.md-slider__stops i.is-end { inset-inline-start: auto;
  inset-inline-end: var(--md-comp-slider-stop-indicator-trailing-space); translate: 0 -50%; }
.md-slider__icon { position: absolute; inset-block-start: 50%; translate: 0 -50%; inline-size: var(--_icon); block-size: var(--_icon);
  inset-inline-start: var(--_icon-pad); color: var(--_sa); display: none; }
.md-slider[data-variant="standard"]:is([data-size="m"],[data-size="l"],[data-size="xl"]) .md-slider__icon { display: block; }
.md-slider.icon-on-inactive .md-slider__icon { inset-inline-start: calc(var(--_c) + var(--_hw) / 2 + var(--_gap) + var(--_icon-pad)); color: var(--_si); }
.md-slider__value { position: absolute; inset-block-end: calc(100% + var(--md-comp-slider-value-indicator-active-bottom-space));
  inset-inline-start: 50%; translate: -50% 0; writing-mode: horizontal-tb;
  min-inline-size: 48px; block-size: 44px; padding-inline: 4px; box-sizing: border-box;
  display: grid; place-items: center; border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-comp-slider-value-indicator-container-color); color: var(--md-comp-slider-value-indicator-label-label-text-color);
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking); font-variant-numeric: tabular-nums;
  opacity: 0; scale: 0.8; transform-origin: bottom center; pointer-events: none; }
.md-slider__input { position: absolute; inset: 0; margin: 0; inline-size: 100%; block-size: 100%; opacity: 0; cursor: pointer; appearance: none; background: none; }
.md-slider__input::-webkit-slider-thumb { appearance: none; inline-size: 4px; block-size: var(--_handle-h); }
.md-slider__input::-moz-range-thumb { inline-size: 4px; block-size: var(--_handle-h); border: 0; }
/* vertical: rotate the logical axes (min at bottom) */
.md-slider[data-orientation="vertical"] { writing-mode: vertical-lr; direction: rtl; inline-size: max(var(--_handle-h), 48px); block-size: auto; min-block-size: 120px; }
.md-slider[data-orientation="vertical"] .md-slider__track { translate: -50% 0; }
.md-slider[data-orientation="vertical"] :is(.md-slider__handle, .md-slider__stops i) { translate: -50% 50%; }
.md-slider[data-orientation="vertical"] :is(.md-slider__stops i.is-end, .md-slider__icon) { translate: -50% 0; }
.md-slider[data-orientation="vertical"] .md-slider__value { translate: 0 50%; } /* sits beside the handle (block-end side), derived */
/* centered: JS sets --_m:.5; active segment from center to the handle edge, drawn over a full inactive track (see §4.2) */
```
Centered and range use the same primitives with extra segments: each segment's `inset-inline-start`/`inline-size` computed from `--_c`, `--_c2`, `--_m` with the formulas in §4.2.

**(c) States**
```css
.md-slider:has(.md-slider__input:focus-visible),
.md-slider.is-pressed { --_hw: var(--md-comp-slider-pressed-handle-width); }
.md-slider[data-labeled]:is(.is-pressed, :has(.md-slider__input:focus-visible)) .md-slider__value { opacity: 1; scale: 1; }
.md-slider:has(.md-slider__input:focus-visible) .md-slider__handle { outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
.md-slider:has(.md-slider__input:disabled) {
  --_a: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --_i: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  --_h: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --_sa: var(--md-sys-color-inverse-on-surface); --_si: var(--md-sys-color-on-surface); --_hw: 4px; }
.md-slider:has(.md-slider__input:disabled) .md-slider__input { cursor: default; }
```
`.is-pressed` is set on `pointerdown` and removed on `pointerup`/`pointercancel` (`:active` on the input is unreliable during drag).

**(d) Motion**
```css
.md-slider__handle, .md-slider__seg, .md-slider__icon { transition:
  inset-inline-start var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  inline-size var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-slider.is-dragging :is(.md-slider__handle, .md-slider__seg, .md-slider__icon) { transition-property: inline-size, background-color; } /* position follows pointer 1:1, width still animates */
.md-slider__value { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  scale var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-slider * { transition-duration: 0s !important; }
  .md-slider__value { transition: opacity var(--md-sys-motion-duration-short1) linear !important; scale: 1; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-slider { --_a: Highlight; --_i: CanvasText; --_h: Highlight; --_sa: HighlightText; --_si: Canvas; }
  .md-slider__seg--inactive { background: Canvas; border: 1px solid CanvasText; box-sizing: border-box; }
  .md-slider:has(:disabled) { --_a: GrayText; --_h: GrayText; --_i: GrayText; }
  .md-slider__value { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }
}
```

**(f) Behaviour / JS**
- On `input`: compute `--_f` (and `--_f2` for range), update value-indicator text and `aria-valuetext` via formatter, recompute stop classes (`is-active`, `is-hidden`) and `.icon-on-inactive` (active length < `--_icon` + 2·`--_icon-pad`), re-dispatch `input`; on `change` re-dispatch `change`.
- Pointer: `pointerdown` → `.is-pressed`; after first `pointermove` → `.is-dragging` (disables position transition); `pointerup`/`pointercancel` → remove both. Native input handles jump + drag for single-handle variants.
- Range: inputs `pointer-events:none`; on track `pointerdown` pick the nearest handle (ties → side of the press), `setPointerCapture`, convert x/y → value (respect RTL/vertical), snap to `step`, clamp `start ≤ end`, set input value + fire events; raise the active handle's `z-index`; show only its value indicator.
- Keyboard: native arrows/Page/Home/End; add Space+Arrow: track Space keydown/keyup, on arrow with Space held `preventDefault` and step by large interval (10% of range or 1 stop with stops).
- Inset icon swap at min (`value === min` → `icon-min` slot).

## 11. Source gaps & decisions
- Medium handle: table 52 vs token 44 → 52px (consistent overhang), token exposed.
- No motion values → fast spatial spring for handle width/position, fast effects for color/indicator; no transition on position while dragging.
- No focus ring tokens → system focus ring around the handle pill; value indicator shown on keyboard focus.
- No hover spec beyond "cursor changes" → `cursor: pointer`, no visual change.
- No inset icon color tokens → `on-primary` (active) / `on-secondary-container` (inactive) from the Color diagram roles that duplicate stop colors.
- Value indicator shape and min width growth not specified → pill, `min-inline-size: 48px`.
- Value label mixes `label-large` font/size/line-height with `body-large` weight/tracking → implemented exactly as tokenized.
- Handle travel/end-stop geometry not dimensioned → center travels 2px…L−2px (native 4px thumb), end stop 4px from track end to dot edge.
- Disabled stop colors have no opacity token → full-opacity colors as tokenized.
- Range crossing not specified → clamp, equal allowed.
- "Space & arrows" larger step has no native equivalent → JS (plus native Page Up/Down); interval 10% (derived).
- Centered: gap rule at the center not specified → active drawn over the inactive track with no gap at the center.
- Track min length not specified → `min-inline-size: 120px` (derived).
