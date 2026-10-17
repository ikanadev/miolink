# Divider

> Source: https://m3.material.io/components/divider · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
A divider is a thin line that groups content in lists and containers and creates hierarchy, including implied parent/child (nested) relationships.

**Use when**
- Items can't be grouped with open space alone.
- Grouping things (not separating every individual item).
- Separating interactive from non-interactive areas of a container (e.g. a card's body vs. its "Read more" link).

**Don't use when**
- Spacing/margins and type styles already separate content (e.g. repetitive list items).
- After every piece of content — too many dividers clutter the UI.
- In contained/segmented expressive lists — prefer gaps (see lists.md).

**Changes vs. M2**: new color mappings (dynamic color); vertical dividers added. No M3 Expressive-specific changes listed.

## 2. Variants & configurations

| Configuration | Inline-start margin | Inline-end margin | Use |
| --- | --- | --- | --- |
| Full-width | 0 | 0 (100% width) | Separate larger sections of unrelated content; on a surface or inside cards/lists; separate interactive from non-interactive areas |
| Inset | 16dp | 0dp | Separate related content within a section; align with content anchored by icons/avatars |
| Middle-inset | 16dp | 16dp | Mid-layout separation (e.g. body text vs. chips) |
| Orientation: horizontal | — | — | Default |
| Orientation: vertical | — | — | Side-by-side content on larger screens (text vs. media) |

## 3. Anatomy
1. **Divider** — a single 1dp line, `outline-variant`.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Line | Static (no states) | `md.comp.divider.color` | `outline-variant` (#cac4d0) |

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Thickness | 1dp (`md.comp.divider.thickness`) — block-size (horizontal) / inline-size (vertical) |
| Length | 100% of container minus insets; vertical stretches to the container's cross size |
| Inset margins | start 16dp / end 0dp |
| Middle-inset margins | start 16dp / end 16dp |
| Space between divider & supporting text | 4dp |
| Divider right margin / bottom margin | 8dp / 8dp (measurement diagram; context unspecified — see §11) |
| Inside lists | list tokens: divider leading/trailing space 16dp, top/bottom 0dp |
| Shape | None (square line) |

### 4.3 Typography
None. Optional supporting text next to a divider (4dp away) uses its own role — (derived) `label-small`/`body-small`, `on-surface-variant`.

### 4.4 Elevation
None.

### 4.5 Component token list
Verified against source.
```
md.comp.divider.thickness → 1dp
md.comp.divider.color → md.sys.color.outline-variant (#cac4d0)
```

## 5. States & interaction
Non-interactive; no states, no focus, no state layer.

## 6. Motion & behavior
No motion. Adaptive: vertical dividers arrange side-by-side content on larger screens; at compact (stacked layout) swap a vertical divider for a horizontal one (derived).

## 7. Usage guidelines
- Visible but not bold.
- Only when open space can't group items; group things rather than separate individual items.
- Full-width: unrelated sections; interactive vs. non-interactive areas; use sparingly.
- Inset: related content within a section (e.g. emails), used with anchoring elements (icons, avatars), aligned to the content's leading edge.
- Mixing both: full-width between different kinds of content, inset between nested items.
- Repetitive list formats may need no divider — margins alone are fine.

## 8. Accessibility
- Decorative; no contrast minimum.
- Web mapping: decorative → `<hr aria-hidden="true">` or `<div role="none">`; semantic group separator → `<hr>` (implicit `role="separator"`) or `role="separator"` + `aria-orientation="vertical"` for vertical.
- Never focusable; no `aria-valuenow`.

## 9. Implementation checklist
- [ ] API: `inset` = `none | start | middle`; `orientation` = `horizontal | vertical`; `decorative` (default true).
- [ ] 1px line via `--md-divider-thickness`, color `--md-divider-color`.
- [ ] Logical margins for RTL; insets overridable to align with list content.
- [ ] Vertical: `align-self: stretch`.
- [ ] Forced-colors visible.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<hr class="md-divider">                                   <!-- semantic separator -->
<hr class="md-divider md-divider--inset" aria-hidden="true">
<hr class="md-divider md-divider--middle-inset">
<div class="md-divider md-divider--vertical" role="separator" aria-orientation="vertical"></div>
```

**(b) Custom properties + (c) variants**
```css
.md-divider {
  --md-divider-color: var(--md-sys-color-outline-variant);
  --md-divider-thickness: 1px;
  --md-divider-inset-start: 0px;
  --md-divider-inset-end: 0px;
  display: block; box-sizing: border-box; flex: none;
  margin: 0; margin-inline: var(--md-divider-inset-start) var(--md-divider-inset-end);
  border: 0; border-block-start: var(--md-divider-thickness) solid var(--md-divider-color);
  block-size: 0; inline-size: auto; /* fills container minus margins */
}
.md-divider--inset { --md-divider-inset-start: 16px; }
.md-divider--middle-inset { --md-divider-inset-start: 16px; --md-divider-inset-end: 16px; }
.md-divider--vertical {
  border-block-start: 0; border-inline-start: var(--md-divider-thickness) solid var(--md-divider-color);
  inline-size: 0; block-size: auto; align-self: stretch; margin-inline: 0;
  margin-block: var(--md-divider-inset-start) var(--md-divider-inset-end);
}
```
Using a border (not background) keeps the line visible in forced-colors and print.

**(d) Motion**: none (no transitions; nothing to reduce).

**(e) Forced colors**
```css
@media (forced-colors: active) { .md-divider { border-color: CanvasText; } }
```

**(f) Behaviour**: none; no JS. A wrapper component only maps `inset`/`orientation` to classes and `decorative` to `aria-hidden`.

## 11. Source gaps & decisions
- Text says "inset dividers are equally indented from both sides by default", but the measurement table gives inset = 16dp start / 0dp end and a separate middle-inset = 16/16 → follow the table: `inset` = start only, `middle` = both.
- Table uses "left/right" → mapped to inline-start/end for RTL.
- "Divider right margin 8dp / bottom margin 8dp" has no stated context (diagram-only) → not applied by default; treat as spacing to adjacent content in the example layout (author-controlled margins).
- Vertical divider insets not specified → `inset` props map to block-start/end on vertical dividers (derived).
- Supporting-text typography not specified → derived suggestion only.
