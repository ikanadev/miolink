# Badges

> Source: https://m3.material.io/components/badges · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
- Badges indicate a notification, item count, or other information relating to a navigation destination. They are anchored inside the icon bounding box at the **upper trailing** edge, typically inside other components (navigation bar, navigation rail, app bars, tabs, icon buttons).
- Two variants: **small** (dot, no text) and **large** (count or short status label).
- Limit content to **four characters, including a "+"**.
- Keep the default color mapping (error / on-error).
- Differences from M2: new color mappings + dynamic color. M3 Expressive: no badge-specific changes in the source.

## 2. Variants & configurations
| Variant / placement | Description | Notes |
| --- | --- | --- |
| Small badge | 6dp dot; unread notification / status change. | Use where space is tight (app bars) — won't run into the screen edge. |
| Large badge | Pill with label text (count or status). | 16dp tall; width hugs content: 16dp (1 char) → 34dp (4 chars, "999+"); height fixed. |
| On icon (default) | Anchored to the icon box's upper trailing corner (offsets §4.2). | Nav bar, nav rail, icon buttons, stacked tabs. |
| Trailing edge of an element | Icon followed by text/another element (e.g. inline tab label) → large badge at the trailing edge, in flow. | 4dp gap from the text (tabs spec). |

Host configurations shown in the source (nav bar/rail destinations: inactive/active, with/without label, × small/large/large-max): badge styling is identical in all; only the host changes.

## 3. Anatomy
1. **Small badge** – 6dp circle.
2. **Large badge container** – 16dp pill.
3. **Large badge label**.
4. **Large badge max-character-count container** – 16×34dp.
5. **Large badge max-character-count label** – e.g. "999+".

## 4. Tokens & specs
### 4.1 Color
| Part | Variant | Token | System role |
| --- | --- | --- | --- |
| Container | small | `--md-comp-badge-color` | `--md-sys-color-error` |
| Container | large | `--md-comp-badge-large-color` | `--md-sys-color-error` |
| Label text | large | `--md-comp-badge-large-label-text-color` | `--md-sys-color-on-error` |

No interactive states (non-interactive; the host owns states). Custom colors discouraged; if used, container vs. surroundings and label vs. container must be ≥3:1.

### 4.2 Size, layout & shape
| Attribute | Value |
| --- | --- |
| Small badge size | 6×6dp (`md.comp.badge.size`) |
| Small badge shape | `--md-sys-shape-corner-full` (= 3dp radius) |
| Large badge height | 16dp (`md.comp.badge.large.size`) |
| Large badge min width | 16dp (1 char) |
| Large badge max width | 34dp (4 chars) |
| Large badge shape | `--md-sys-shape-corner-full` (= 8dp radius) |
| Large badge inline padding (edge ↔ text) | 4dp each side |
| Large badge label | single line, centered, no wrap; line-height 16 = container height |
| Small: icon top-trailing corner → badge bottom-leading corner (H×W) | 6×6dp |
| Large: icon top-trailing corner → badge bottom-leading corner (H×W) | 14×12dp |

Positioning relative to the icon box (24dp icon; logical properties, auto-mirrors in RTL):

| Variant | `inset-block-start` | `inset-inline-start` | Extent beyond icon box |
| --- | --- | --- | --- |
| Small | `0` (6 − 6) | `calc(100% - 6px)` | none (fully inside top-trailing corner) |
| Large | `-2px` (14 − 16) | `calc(100% - 12px)` | 2dp above; 4dp (1 char) to 22dp (4 chars) past the trailing edge |

- Width grows toward the trailing side; the leading edge (placement) never moves as the count increases.
- Hosts must not clip the badge (`overflow: visible` on the icon wrapper and its ancestors within the destination).
- Inline (trailing-edge) placement: badge in flow, vertically centered with the label, 4dp after it.

### 4.3 Typography
| Part | Typescale |
| --- | --- |
| Large badge label | `--md-sys-typescale-label-small-*` (Roboto 11/16, weight 500, tracking 0.5) |

### 4.4 Elevation
None (level0; no elevation tokens). Badge stacks above the icon (`z-index: 1` within the icon wrapper).

### 4.5 Component token list
**md.comp.badge**
```
color → md.sys.color.error
shape → md.sys.shape.corner.full
size → 6dp
large.color → md.sys.color.error
large.shape → md.sys.shape.corner.full
large.size → 16dp
large.label-text.color → md.sys.color.on-error
large.label-text.font → md.sys.typescale.label-small.font (Roboto)
large.label-text.line-height → md.sys.typescale.label-small.line-height (16)
large.label-text.size → md.sys.typescale.label-small.size (11)
large.label-text.tracking → md.sys.typescale.label-small.tracking (0.5)
large.label-text.weight → md.sys.typescale.label-small.weight (500)
```
(`large.label-text.type` is a composite of the font tokens; omitted.)

## 5. States & interaction
- Non-interactive: no hover/focus/pressed/disabled; never focusable; `pointer-events: none` so the host receives input.
- Appearance identical on active and inactive hosts.
- Unread-notification badge: **hidden once its destination is selected**; after the user views the content, update or remove the value.
- Count 0 → badge hidden (derived).

## 6. Motion & behavior
| Change | Motion |
| --- | --- |
| Hide on selection | scale 1 → 0 (origin: badge's leading-bottom corner, i.e. toward the icon) with `--md-sys-motion-spring-fast-spatial-*` + opacity 1 → 0 with fast effects (derived; source shows the badge disappearing, no values) |
| Appear | reverse of hide |
| Count change / width change | instant (derived: avoid distracting motion on frequent updates) |

- Reduced motion: no scale; opacity only (fast effects) or instant.
- Overflow formatting: values > `max` (default 999) render `${max}+` ("999+"); status labels truncated to 4 chars.
- RTL: badge moves to the mirrored upper corner (logical properties); scale origin mirrors.

## 7. Usage guidelines
- Small: unread/new status; use in tight spaces (app bars).
- Large: counts/status where collisions aren't an issue (navigation rail).
- Icon followed by text/another element (tabs): large badge at the trailing edge; never let a large badge overlap a trailing element — move it or use a small badge.
- Fixed positions only — never arbitrary or over the icon center.
- Never cut off or collide with other elements.
- Default colors only.

## 8. Accessibility
- **Web mapping:** the badge text is read **after** the destination name, as part of the host's accessible name/description: e.g. `aria-label="Inbox, 3 new"` or `aria-describedby` → visually-hidden text. The visual badge gets `aria-hidden="true"` to avoid double announcement.
- Numeric badges announce the number ("3 new notifications"; wording configurable). Small (non-counting) badges announce **"New notification"**.
- "999+" announces "more than 999 …".
- Live count updates: optional polite live region at host/app level, throttled.
- Contrast ≥3:1 (container vs. surroundings, label vs. container); defaults pass.
- Forced colors: background is lost → force a visible system color (blueprint e).

## 9. Implementation checklist
- [ ] API: `value` (string|number; empty/absent → small), `max` (999), `label` (announcement override), `hidden`, `placement` (`icon` | `inline`).
- [ ] Enforce ≤4 chars incl. "+"; 0 → hidden.
- [ ] Icon placement offsets per §4.2; inline mode 4dp after text.
- [ ] Colors from `--md-comp-badge-*`.
- [ ] Hosts compose accessible text; badge `aria-hidden`.
- [ ] Hide/show animation host-triggered, reduced-motion aware.
- [ ] Hosts don't clip; app bars prefer small.

## 10. HTML/CSS implementation blueprint
**(a) DOM**
```html
<!-- on an icon (host provides the positioned icon wrapper) -->
<span class="md-badge-anchor">
  <svg class="icon" aria-hidden="true">…</svg>
  <span class="md-badge" data-size="large" aria-hidden="true">3</span>   <!-- small: empty, data-size="small" -->
</span>
<!-- host accessible name carries the meaning -->
<button aria-label="Inbox, 3 new notifications">…</button>
<!-- inline, after a label -->
<span class="label">Inbox</span><span class="md-badge md-badge--inline" data-size="large" aria-hidden="true">12</span>
```
**(b) Custom properties**
```css
.md-badge {
  --md-comp-badge-color: var(--md-sys-color-error);
  --md-comp-badge-shape: var(--md-sys-shape-corner-full);
  --md-comp-badge-size: 6px;
  --md-comp-badge-large-color: var(--md-sys-color-error);
  --md-comp-badge-large-shape: var(--md-sys-shape-corner-full);
  --md-comp-badge-large-size: 16px;
  --md-comp-badge-large-label-text-color: var(--md-sys-color-on-error);
  --md-comp-badge-large-padding: 4px;
}
```
**Layout**
```css
.md-badge-anchor { position: relative; display: inline-flex; overflow: visible; }
.md-badge { box-sizing: border-box; pointer-events: none; user-select: none; z-index: 1; }
.md-badge-anchor > .md-badge { position: absolute; }
.md-badge[data-size="small"] {
  inline-size: var(--md-comp-badge-size); block-size: var(--md-comp-badge-size);
  border-radius: var(--md-comp-badge-shape); background: var(--md-comp-badge-color);
  inset-block-start: 0; inset-inline-start: calc(100% - 6px); }
.md-badge[data-size="large"] {
  display: inline-flex; align-items: center; justify-content: center; white-space: nowrap;
  block-size: var(--md-comp-badge-large-size); min-inline-size: var(--md-comp-badge-large-size); max-inline-size: 34px;
  padding-inline: var(--md-comp-badge-large-padding);
  border-radius: var(--md-comp-badge-large-shape); background: var(--md-comp-badge-large-color);
  color: var(--md-comp-badge-large-label-text-color);
  font: var(--md-sys-typescale-label-small-weight) var(--md-sys-typescale-label-small-size)/var(--md-sys-typescale-label-small-line-height) var(--md-sys-typescale-label-small-font);
  letter-spacing: var(--md-sys-typescale-label-small-tracking); font-variant-numeric: tabular-nums; }
.md-badge-anchor > .md-badge[data-size="large"] { inset-block-start: -2px; inset-inline-start: calc(100% - 12px); }
.md-badge--inline { position: static; margin-inline-start: 4px; align-self: center; }
.md-badge[hidden] { display: none; }
```
**(c) States** — none of its own. Host may toggle `data-hiding` (animation) then `hidden`.

**(d) Motion**
```css
.md-badge { transform-origin: left bottom; }
.md-badge:dir(rtl) { transform-origin: right bottom; }
.md-badge[data-hiding] { transform: scale(0); opacity: 0;
  transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
              opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
@starting-style { .md-badge:not([hidden]) { transform: scale(0); opacity: 0; } }   /* appear */
@media (prefers-reduced-motion: reduce) {
  .md-badge[data-hiding] { transform: none; transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
  @starting-style { .md-badge:not([hidden]) { transform: none; } }
}
```
(Appear needs a `transition` on the base rule for `@starting-style` to animate; use the same pair as `[data-hiding]`.)

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-badge { forced-color-adjust: none; background: CanvasText; color: Canvas; }
}
```

**(f) Behaviour / JS**
- `format(value, max=999)`: number > max → `${max}+`; string → first 4 chars; 0/empty for large → hidden (empty → small).
- Expose `accessibleText` ("3 new notifications" / "New notification" / "More than 999 new notifications") for hosts to append to their label.
- Host on selection: set `data-hiding`, on `transitionend` set `hidden` (reduced motion: immediately).
- No events, no keyboard handling.

## 11. Source gaps & decisions
- Positioning given as corner-to-corner distances only → converted to `inset-*` relative to the icon box (small fully inside; large −2px top, 12px inside trailing edge).
- "Padding between badge and text container 4dp" → inline padding 4dp; with min-width 16dp and max 34dp (4 chars).
- Small radius 3dp / large 8dp in table = `corner-full` tokens → use the token.
- Hide animation shown but not specified → fast spatial scale + fast effects fade; count changes not animated.
- Count 0 behaviour, `max` default, announcement wording for "999+" → derived.
- Inline (trailing-edge) placement gap from tabs spec (4dp); vertical alignment centered (derived).
- Forced colors: system background would remove the dot → `forced-color-adjust: none` with CanvasText.
