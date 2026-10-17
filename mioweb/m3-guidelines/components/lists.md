# Lists

> Source: https://m3.material.io/components/lists · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Lists are vertical groups of text, icons, images and other elements, optimized for reading comprehension. They help people find a specific item and act on it.

**Use when**
- Communicating or selecting discrete items (e.g. choosing from a set of colors).
- Presenting short, scannable items in a consistent format, ordered logically (alphabetical, numerical).
- Navigation to detail pages (single-action), settings toggles, selections.

**Don't use when**
- At larger breakpoints, a card grid, carousel or list-detail layout may use the space better (swap components).

**M3 Expressive changes (Dec 2025)**
- New **expressive list** variant — recommended for new designs. Baseline list still available but "not recommended" in M3 Expressive. On web, expressive lists are built on top of baseline lists (same DOM, extra tokens).
- Visual styles: **standard** or **segmented** (segmented = individually shaped items separated by 2dp gaps; group outer corners 16dp).
- **Highlighted selection**: selected item gets `secondary-container` fill and 16dp corners.
- **Flexible slots** (leading / content / trailing).
- Expressive icon size 20dp (baseline 24dp); expressive leading image 8dp corners (baseline 0).

**M2 → M3 baseline (still applicable)**: new color mappings; consistent padding; item height set by tallest element — 56, 72 or 88dp; elements middle-aligned, top-aligned when the item is ≥88dp or has 3+ lines of text.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Expressive list | Rounded item shapes with state morph, highlighted selection, slots | Recommended |
| Baseline list | Square corners (`corner.none`), standard colors | Legacy |
| Style: standard | Contiguous items (gap 0) | Visual only |
| Style: segmented | Items separated by 2dp gaps, 16dp outer group corners | Expressive only |
| Single-action | Whole item is one action (e.g. navigation) | No secondary nested actions; can't be persistently selected |
| Multi-action | Primary action (leading + content) + secondary actions (trailing) | Item itself not selectable |
| Single-select | One item selected (radio) | No multi-actions, no nested actions, no checkboxes |
| Multi-select | Several items toggled (checkbox or switch) | No nested actions, no radios |
| Non-interactive | Informational only | No actions, not selectable, no states |
| Expand & collapse | Parent item reveals nested child items | `md.comp.list.expand` tokens |
| Swipe to reveal | Swipe reveals action buttons | Source: Android Views only → web optional (derived) |
| Line count | one-line 56dp / two-line 72dp / three-line 88dp (min heights) | Height = tallest element |

A list has only **one selection mode at a time** (may switch, can't combine). One selection interaction per item.

Leading: avatar, image/thumbnail, video, icon, checkbox, radio, (custom: badge, larger image). Trailing: text, icon, icon button, checkbox, switch, radio.

## 3. Anatomy
Container and label text are required; all others optional.
1. **Container** — list item container (and list group container in segmented/expand).
2. **Overline** — small text above label.
3. **Label text** — primary text.
4. **Supporting text** — 1–3 lines below label.
5. **Trailing supporting text** — meta-info (price, count, date).
6. **Trailing icon / icon button** — status or action; icon button height fills item height.
7. **Trailing selection control** — checkbox, radio, switch.
8. **Leading avatar container** + **avatar text** (initials).
9. **Leading icon**.
10. **Leading media** — image or video.
11. **Divider** — uncontained/complex lists only.
12. State layer, ripple, inner focus indicator.

**Slots (expressive):** leading | content | trailing. Content is the widest slot (flex: 1) and sits between; leading/trailing must be narrower. Slot content must keep list structure, standard padding, ≥48×48dp targets and not hinder navigation.

## 4. Tokens & specs

### 4.1 Color

**Unselected**

| Part | Enabled | Hover / focus / pressed / dragged | Disabled |
| --- | --- | --- | --- |
| Container | `surface` (standard and segmented) | `surface` + state layer `on-surface` 0.08 / 0.10 / 0.10 / 0.16 | `surface` |
| Label | `on-surface` | `on-surface` | `on-surface` @ 0.38 |
| Supporting text | `on-surface-variant` | — (unchanged) | `on-surface` @ 0.38 |
| Overline | `on-surface-variant` | — | `on-surface` @ 0.38 |
| Trailing supporting text | `on-surface-variant` | — | (derived) `on-surface` @ 0.38 |
| Leading icon | `on-surface-variant` | `on-surface-variant` | `on-surface` @ 0.38 |
| Trailing icon | `on-surface-variant` (`unselected.trailing-icon` = `on-surface` in selectable lists) | `on-surface-variant` | `on-surface` @ 0.38 |
| Avatar container / label | `primary-container` / `on-primary-container` | — | (derived) content @ 0.38 |
| Focus indicator | — | `secondary` (focus-visible) | — |

**Selected (expressive highlight)**

| Part | Enabled | Hover / focus / pressed | Dragged | Disabled |
| --- | --- | --- | --- | --- |
| Container | `secondary-container` | same + state layer `on-surface` 0.08 / 0.10 / 0.10 | same + 0.16 | `on-surface` @ 0.38 |
| Label | `on-secondary-container` | `on-secondary-container` | `on-secondary-container` | `on-surface` @ 0.38 |
| Supporting / trailing supporting / overline | `on-secondary-container` | — | — | `on-surface` @ 0.38 |
| Leading / trailing icon | `on-secondary-container` | **`on-surface`** | `on-surface` | `on-surface` @ 0.38 |

**Expand**

| Part | Collapsed | Expanded |
| --- | --- | --- |
| Item container (standard / segmented) | (list-item tokens) | `surface` |
| Trailing icon container (circle) | `surface` | `surface-container` |
| Trailing icon | `on-surface` | `on-surface` |

- Divider: `outline-variant` (color-roles diagram; see divider component).
- Optional: items with a leading image may use an image-derived (content-based) scheme for the container, at rest or on interaction.
- Disabled state layer token (`on-surface` @ 0.10) — see §11.

### 4.2 Size, layout & shape

**Item box model**

| Attribute | Value |
| --- | --- |
| Min height one / two / three-line | 56 / 72 / 88dp |
| Padding inline-start / inline-end | 16dp (`space200`) / 16dp (`space200`) |
| Padding block-start / block-end | 10dp (`space125`) each |
| Gap between leading, content, trailing | 12dp (`space150`) |
| Segmented gap between items | 2dp (`space25`) |
| Vertical alignment | Center; **top** when three-line (≥88dp) or 3+ text lines |
| Leading / trailing element top offset when top-aligned | 12dp from container top (source: "12dp when ≥88dp"; derived: = 10dp padding + 2dp) |
| Touch targets | ≥48dp |
| Label / supporting lines | Label 1 line (wrap or ellipsis), supporting 1–2 lines (`-webkit-line-clamp`), three-line max total |

Line count → height (derived mapping): one-line = label only (or overline-less single line); two-line = label + 1 supporting line, or overline + label; three-line = label + 2 supporting lines, or overline + label + supporting.

**Baseline layout table (source)**: label start padding 16; leading element start padding 16; leading icon top-aligned with top padding 8dp (12dp when ≥88dp); trailing element start padding 16 / end padding 24dp; divider 0dp above/below; full-width divider 100%; inset divider 16dp start / 24dp end. Expressive tokens use 16dp end padding and 16/16 divider insets — expressive uses the tokens.

**Element sizes**

| Element | Baseline | Expressive |
| --- | --- | --- |
| Leading / trailing icon | 24dp | 20dp |
| Leading avatar | 40dp circle (`corner.full`), initials `title-medium` | same (or expressive shape mask) |
| Leading image | 56×56dp, `corner.none` | 56×56dp, `corner.small` (8dp) |
| Leading video | small 100×56dp, large 114×64dp, `corner.small` (8dp) | same |
| Trailing icon button | width 48dp (derived), height = item height | same |
| Expand trailing icon container | `corner.full`; (derived) 40dp circle with the 20/24dp icon | same |
| Checkbox / radio / switch | Own component sizes (touch target ≥48dp) | same |

Large leading video (64dp) pushes a one-/two-line item to ≥ 84dp; height is always max(token min height, tallest element + 20dp padding).

**Shape**

| Element / state | Token | Value |
| --- | --- | --- |
| List group container (segmented, expand) | `list.container.shape` / `expand.container.shape` → `corner.large` | 16dp |
| Baseline item | `list-item.container.shape` → `corner.none` | 0 |
| Expressive item: enabled / disabled | `…container.expressive.shape` → `corner.extra-small` | 4dp |
| Expressive item: hovered | `corner.medium` | 12dp |
| Expressive item: focused / pressed / dragged | `corner.large` | 16dp |
| Selected (all states incl. disabled) | `selected…shape` → `corner.large` | 16dp |
| Expand trailing icon | `corner.full` | circle |

**Segmented shape rule**: unselected → 4dp inner corners, 16dp outer corners (first item's top corners and last item's bottom corners = group shape 16dp); selected → 16dp all corners. Per-corner value = `max(stateRadius, 16dp if corner is outer)`. Standard style uses the same per-state radii (visible on state layer / selected fill) with gap 0 (derived).

### 4.3 Typography

| Part | Role | Values |
| --- | --- | --- |
| Label text | `body-large` | 16/24, 0.5, 400 |
| Supporting text | `body-medium` | 14/20, 0.25, 400 |
| Overline | `label-small` | 11/16, 0.5, 500 |
| Trailing supporting text | `label-small` | 11/16, 0.5, 500 |
| Avatar label (initials) | `title-medium` | 16/24, 0.15, 500 |

### 4.4 Elevation
- level0 at rest and in all states except dragged.
- Dragged: level4 (8dp). Token group is labeled "baseline only", but expressive has a dragged shape token → apply level4 to expressive dragged items too (derived).

### 4.5 Component token list
Verified against source (sets: `md.comp.list` common, `md.comp.list.expand`).

**md.comp.list**
```
list-item.container.color → md.sys.color.surface (#fef7ff)
list-item.segmented.container.color → md.sys.color.surface
list-item.label-text.color → md.sys.color.on-surface (#1d1b20)
list-item.supporting-text.color → md.sys.color.on-surface-variant (#49454f)
list-item.overline.color → md.sys.color.on-surface-variant
list-item.leading-icon.color → md.sys.color.on-surface-variant
list-item.trailing-icon.color → md.sys.color.on-surface-variant
list-item.unselected.trailing-icon.color → md.sys.color.on-surface
list-item.trailing-supporting-text.color → md.sys.color.on-surface-variant
list-item.leading-avatar.color → md.sys.color.primary-container (#eaddff)
list-item.leading-avatar-label.color → md.sys.color.on-primary-container (#4f378b)
list-item.container.elevation → md.sys.elevation.level0
focus.indicator.color → md.sys.color.secondary (#625b71)
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.inner-offset (-3dp)
list-item.disabled.state-layer.color → md.sys.color.on-surface
list-item.disabled.state-layer.opacity → 0.1
list-item.disabled.{label-text,supporting-text,overline,leading-icon,trailing-icon}.color → md.sys.color.on-surface
list-item.disabled.{label-text,supporting-text,overline,leading-icon,trailing-icon}.opacity → 0.38
list-item.hover.state-layer.color → md.sys.color.on-surface
list-item.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
list-item.{hover,focus,pressed,dragged}.label-text.color → md.sys.color.on-surface
list-item.{hover,focus,pressed,dragged}.{leading,trailing}-icon.icon.color → md.sys.color.on-surface-variant
list-item.focus.state-layer.color → md.sys.color.on-surface
list-item.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
list-item.pressed.state-layer.color → md.sys.color.on-surface
list-item.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
list-item.dragged.container.elevation → md.sys.elevation.level4
list-item.dragged.state-layer.color → md.sys.color.on-surface
list-item.dragged.state-layer.opacity → md.sys.state.dragged.state-layer-opacity (0.16)
list-item.selected.dragged.label-text.color → md.sys.color.on-secondary-container (#4a4458)
list-item.selected.dragged.state-layer.color → md.sys.color.on-surface
list-item.selected.dragged.state-layer.opacity → md.sys.state.dragged.state-layer-opacity (0.16)
list-item.selected.dragged.{leading,trailing}-icon.color → md.sys.color.on-surface
list-item.leading-space → md.sys.measurement.space200 (16dp)
list-item.trailing-space → md.sys.measurement.space200 (16dp)
list-item.top-space → md.sys.measurement.space125 (10dp)
list-item.bottom-space → md.sys.measurement.space125 (10dp)
list-item.between-space → md.sys.measurement.space150 (12dp)
divider.leading-space → md.sys.measurement.space200 (16dp)
divider.trailing-space → md.sys.measurement.space200 (16dp)
divider.top-space → md.sys.measurement.space0 (0dp)
divider.bottom-space → md.sys.measurement.space0 (0dp)
segmented.gap → md.sys.measurement.space25 (2dp)
container.shape → md.sys.shape.corner.large (16dp)
list-item.container.shape → md.sys.shape.corner.none
list-item.container.expressive.shape → md.sys.shape.corner.extra-small (4dp)
list-item.disabled.container.expressive.shape → md.sys.shape.corner.extra-small (4dp)
list-item.hovered.container.expressive.shape → md.sys.shape.corner.medium (12dp)
list-item.{focused,pressed,dragged}.container.expressive.shape → md.sys.shape.corner.large (16dp)
list-item.selected.container.expressive.shape → md.sys.shape.corner.large (16dp)
list-item.selected.{disabled,hovered,focused,pressed,dragged}.container.expressive.shape → md.sys.shape.corner.large (16dp)
list-item.selected.container.shape → md.sys.shape.corner.large (16dp)
list-item.leading-avatar.shape → md.sys.shape.corner.full
list-item.leading-video.shape → md.sys.shape.corner.small (8dp)
list-item.leading-image.shape → md.sys.shape.corner.none
list-item.leading-image.expressive.shape → md.sys.shape.corner.small (8dp)
list-item.leading-avatar.size → 40dp
list-item.leading-avatar-label.{font,line-height,size,tracking,weight} → md.sys.typescale.title-medium.*
list-item.leading-icon.size → 24dp
list-item.leading-icon.expressive.size → 20dp
list-item.leading-image.width → 56dp
list-item.leading-image.height → 56dp
list-item.leading-video.width → 100dp
list-item.small.leading-video.width → 100dp
list-item.small.leading-video.height → 56dp
list-item.large.leading-video.width → 114dp
list-item.large.leading-video.height → 64dp
list-item.one-line.container.height → 56dp
list-item.two-line.container.height → 72dp
list-item.three-line.container.height → 88dp
list-item.trailing-icon.size → 24dp
list-item.trailing-icon.expressive.size → 20dp
list-item.label-text.{font,line-height,size,tracking,weight} → md.sys.typescale.body-large.*
list-item.supporting-text.{font,line-height,size,tracking,weight} → md.sys.typescale.body-medium.*
list-item.trailing-supporting-text.{font,line-height,size,tracking,weight} → md.sys.typescale.label-small.*
list-item.overline.{font,line-height,size,tracking,weight} → md.sys.typescale.label-small.*
list-item.selected.container.color → md.sys.color.secondary-container (#e8def8)
list-item.selected.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon,overline}.color → md.sys.color.on-secondary-container
list-item.selected.{hover,focus,pressed}.state-layer.color → md.sys.color.on-surface
list-item.selected.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
list-item.selected.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
list-item.selected.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
list-item.selected.{hover,focus,pressed}.label-text.color → md.sys.color.on-secondary-container
list-item.selected.{hover,focus,pressed}.{leading,trailing}-icon.color → md.sys.color.on-surface
list-item.selected.disabled.container.color → md.sys.color.on-surface
list-item.selected.disabled.container.opacity → 0.38
list-item.selected.disabled.{label-text,supporting-text,trailing-supporting-text,overline,leading-icon,trailing-icon}.color → md.sys.color.on-surface
list-item.selected.disabled.{…same parts}.opacity → 0.38
list-item.selected.disabled.state-layer.color → md.sys.color.on-surface
list-item.selected.disabled.state-layer.opacity → 0.1
```

**md.comp.list.expand**
```
expanded.list-item.container.color → md.sys.color.surface
expanded.list-item.segmented.container.color → md.sys.color.surface
collapsed.list-item.trailing-icon.container.color → md.sys.color.surface
collapsed.list-item.trailing-icon.icon.color → md.sys.color.on-surface
expanded.list-item.trailing-icon.container.color → md.sys.color.surface-container (#f3edf7)
expanded.list-item.trailing-icon.icon.color → md.sys.color.on-surface
container.shape → md.sys.shape.corner.large (16dp)
trailing-icon.shape → md.sys.shape.corner.full
```

## 5. States & interaction

| State | Container (unselected → selected) | Expressive radius | State layer | Content changes |
| --- | --- | --- | --- | --- |
| Enabled | `surface` → `secondary-container` | 4 → 16dp | — | selected: all text/icons `on-secondary-container` |
| Hover | same | 12 → 16dp | 0.08 | selected: icons → `on-surface` |
| Focus-visible | same | 16dp | 0.10 + inner focus ring (3dp `secondary`, −3dp) | selected: icons → `on-surface` |
| Pressed | same + ripple | 16dp | 0.10 | selected: icons → `on-surface` |
| Dragged | same, level4 | 16dp | 0.16 | selected: icons → `on-surface` |
| Disabled | `surface` → `on-surface` @ 0.38 | 4 → 16dp | none (see §11) | text/icons `on-surface` @ 0.38 |

- Non-interactive lists: no states at all.
- Multi-action: states apply to the primary action area and to each trailing icon button separately (icon buttons use their own tokens); item container only reacts to the primary area (derived).
- Selection applies to the whole item: item fill + inner control checked together; inner control is visual only (one interaction).
- Selection needs a non-color cue (checkbox/radio, check icon, or non-color style).
- Expand: trailing chevron in a circle; container `surface` → `surface-container` when expanded; chevron rotates 180° (derived).

## 6. Motion & behavior
- **Shape morph** (radius per state) → spring primitive `fast-spatial`. **Selection fill / content color / state layer** → `fast-effects`. (Not specified in source; derived from guidelines: component motion uses fast springs.)
- **Expand/collapse**: folder-like; container transform (parent-child), expanding vertically. Web: animate the nested region's height (`grid-template-rows: 0fr → 1fr`) with `default-spatial`; content fades in with `default-effects` (derived).
- **Drag to reorder** (optional): lift to level4 + 16dp shape; siblings shift with `default-spatial` (derived).
- **Swipe** (optional on web): reveals buttons; primary action is the final end-aligned option; full swipe triggers it and clears the item. Always provide a "more" alternative (tap/double tap/long press/menu).
- **Adaptive**: compact → edge-to-edge, selecting opens a detail page. Medium/expanded → list-detail side by side, multi-column, cards or carousel; reveal more content at larger sizes. Line length 40–60 chars ideal, up to 120 on large screens (increase line-height near 120); adjust margins / columns instead of stretching.
- **Reduced motion**: no shape morph animation (instant), expand without height animation (fade only).

## 7. Usage guidelines
- Short, scannable items; logical order; consistent element positions; align visuals and primary text.
- Label brief (wrap or truncate); supporting text 1–3 lines total, truncated per screen size.
- Leading icon relates to label; trailing icon shows status or action.
- Media anchored at the leading edge; never mid-row.
- Avatars: circular or expressive shapes for people/entities; square/rectangular for products/videos.
- Primary action takes the most space (leading + content); secondary actions trailing.
- Trailing text for meta info.
- Controls: checkbox (multi), switch (toggle settings), radio (single).
- Segmented gaps for contained lists; dividers only for uncontained/complex lists.

## 8. Accessibility
- Accessible name = label text + supporting text.
- Never rely on color alone for selection.

| List type | Container | Item | State |
| --- | --- | --- | --- |
| Single-select (source) | `role="listbox"`, `aria-label` describing selection type ("Select either bread, pita, or rice") | `role="option"`, name = visible label | `aria-selected` |
| Multi-select (source) | `role="listbox"` + `aria-multiselectable="true"` (web mapping) | `role="option"` | `aria-selected` |
| Single-action (web mapping) | `<ul>` | `<li>` with one `<a>`/`<button>` covering the item | — |
| Multi-action (web mapping) | `<ul>` | `<li>` with primary `<a>`/`<button>` + trailing `<button>`s | — |
| Non-interactive | `<ul>` | `<li>`, read without role semantics beyond list | — |

- Disabled: `aria-disabled="true"` (stay focusable in listbox per ARIA practice; skipped for activation).
- Expandable: toggle `<button aria-expanded aria-controls>`; nested `<ul>` with `role="group"` when inside a listbox (web mapping).
- Inner checkbox/radio/switch in select lists: `aria-hidden="true"`, `tabindex="-1"` (option carries the state).

| Key | Action |
| --- | --- |
| Tab | Into the list (first item, or the selected item if any) / out of the list |
| Down / Right | Next element; wraps last → first |
| Up / Left | Previous element; wraps first → last |
| Space / Enter | Activate item / select an unselected item / activate focused action |
| Home / End | (derived) First / last element |

- Single tab stop with roving tabindex (web mapping). Multi-action: the roving sequence includes every action (primary, then trailing actions, then next item's primary).
- Touch targets ≥48×48dp, including slot content.
- RTL: Left/Right keep "previous/next" semantics per source table (both axes equivalent), so no mirroring needed.

## 9. Implementation checklist
- [ ] List API: `variant` = `expressive | baseline`; `listStyle` = `standard | segmented`; `selection` = `none | single | multi`; `interaction` = `single-action | multi-action | non-interactive`; `label`; `name` (form).
- [ ] Item API: label, `supportingText`, `overline`, `trailingSupportingText`, `selected`, `disabled`, `href`, `value`, `expandable`/`expanded`, `lines` (auto, overridable).
- [ ] Slots: `leading`, default (content), `trailing`, `children` (nested list).
- [ ] Events: `change` (selected values), native `click` on actions, `toggle` (expand), `reorder`.
- [ ] Min heights 56/72/88; padding 16/16/10/10; gap 12; segmented gap 2; top-align at three-line.
- [ ] Shape per state & segmented outer-corner rule; baseline 0dp.
- [ ] Selection highlight + synced inner control; non-color cue.
- [ ] Inner focus ring; state layer; ripple; disabled.
- [ ] Roving tabindex with wrap; initial focus on selected.
- [ ] Form participation for select lists (hidden inputs or ElementInternals).
- [ ] RTL via logical properties; forced colors; reduced motion.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Single-action, segmented, expressive -->
<ul class="md-list md-list--segmented">
  <li class="md-list-item" data-lines="2">
    <a class="md-list-item__primary" href="/inbox/1" tabindex="0">
      <span class="md-list-item__state"></span>                       <!-- state layer + ripple primitives -->
      <span class="md-list-item__leading" part="leading"><img class="md-list-item__image" src="…" alt=""></span>
      <span class="md-list-item__content" part="content">
        <span class="md-list-item__overline">Overline</span>
        <span class="md-list-item__label">Label</span>
        <span class="md-list-item__supporting">Supporting text</span>
      </span>
      <span class="md-list-item__trailing" part="trailing"><span class="md-list-item__meta">Nov 17</span></span>
    </a>
  </li>
</ul>

<!-- Multi-action -->
<li class="md-list-item"><div class="md-list-item__row">
  <a class="md-list-item__primary" href="…">…leading + content…</a>
  <span class="md-list-item__trailing"><button class="md-icon-button" aria-label="Bookmark">…</button></span>
</div></li>

<!-- Single / multi select -->
<div class="md-list md-list--segmented" role="listbox" aria-label="Select either bread, pita, or rice" aria-multiselectable="false">
  <div class="md-list-item md-list-item__primary" role="option" aria-selected="true" tabindex="0" data-value="bread">
    <span class="md-list-item__state"></span>
    <span class="md-list-item__leading"><span class="md-radio" aria-hidden="true" data-checked></span></span>
    <span class="md-list-item__content"><span class="md-list-item__label">Bread</span><span class="md-list-item__supporting">Sourdough or wheat</span></span>
  </div>
</div>

<!-- Expandable -->
<li class="md-list-item md-list-item--expandable">
  <button class="md-list-item__primary" aria-expanded="false" aria-controls="sub1">…content…
    <span class="md-list-item__trailing"><span class="md-list-item__expand-icon" aria-hidden="true"></span></span>
  </button>
  <div class="md-list-item__children" id="sub1"><ul class="md-list">…</ul></div>
</li>
```

**(b) Custom properties**
```css
.md-list {
  --md-list-item-container-color: var(--md-sys-color-surface);
  --md-list-item-label-color: var(--md-sys-color-on-surface);
  --md-list-item-supporting-color: var(--md-sys-color-on-surface-variant);
  --md-list-item-overline-color: var(--md-sys-color-on-surface-variant);
  --md-list-item-trailing-text-color: var(--md-sys-color-on-surface-variant);
  --md-list-item-leading-icon-color: var(--md-sys-color-on-surface-variant);
  --md-list-item-trailing-icon-color: var(--md-sys-color-on-surface-variant);
  --md-list-item-avatar-color: var(--md-sys-color-primary-container);
  --md-list-item-avatar-label-color: var(--md-sys-color-on-primary-container);
  --md-list-item-selected-container-color: var(--md-sys-color-secondary-container);
  --md-list-item-selected-content-color: var(--md-sys-color-on-secondary-container);
  --md-list-item-state-layer-color: var(--md-sys-color-on-surface);
  --md-list-item-padding-inline-start: var(--md-sys-measurement-space200);
  --md-list-item-padding-inline-end: var(--md-sys-measurement-space200);
  --md-list-item-padding-block: var(--md-sys-measurement-space125);
  --md-list-item-gap: var(--md-sys-measurement-space150);
  --md-list-segmented-gap: 0px;
  --md-list-container-shape: var(--md-sys-shape-corner-large);
  --md-list-item-shape: var(--md-sys-shape-corner-extra-small);         /* baseline: corner-none */
  --md-list-item-hover-shape: var(--md-sys-shape-corner-medium);
  --md-list-item-active-shape: var(--md-sys-shape-corner-large);         /* focused/pressed/dragged/selected */
  --md-list-item-icon-size: 20px;                                         /* baseline 24px */
  --md-list-item-image-shape: var(--md-sys-shape-corner-small);          /* baseline corner-none */
  margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;
  gap: var(--md-list-segmented-gap);
}
.md-list--segmented { --md-list-segmented-gap: var(--md-sys-measurement-space25); }
.md-list--baseline { --md-list-item-shape: var(--md-sys-shape-corner-none); --md-list-item-hover-shape: var(--md-sys-shape-corner-none); --md-list-item-active-shape: var(--md-sys-shape-corner-none); --md-list-item-icon-size: 24px; --md-list-item-image-shape: var(--md-sys-shape-corner-none); }
```

**(c) Layout & states**
```css
.md-list-item { --_r: var(--md-list-item-shape); --_outer: 0px; }
.md-list--segmented > .md-list-item { --_outer: var(--md-list-container-shape); }
.md-list-item__primary {
  position: relative; display: flex; align-items: center; gap: var(--md-list-item-gap);
  min-block-size: 56px; box-sizing: border-box; inline-size: 100%;
  padding: var(--md-list-item-padding-block) var(--md-list-item-padding-inline-end) var(--md-list-item-padding-block) var(--md-list-item-padding-inline-start);
  background: var(--md-list-item-container-color); color: var(--md-list-item-label-color);
  border: 0; text-align: start; text-decoration: none; font: inherit; cursor: pointer;
  /* per-corner: outer corners of first/last segmented item never below 16dp */
  border-start-start-radius: var(--_ss, var(--_r)); border-start-end-radius: var(--_se, var(--_r));
  border-end-start-radius: var(--_es, var(--_r)); border-end-end-radius: var(--_ee, var(--_r));
  overflow: hidden; /* clips state layer & ripple */
}
.md-list--segmented > .md-list-item:first-child .md-list-item__primary { --_ss: max(var(--_r), var(--_outer)); --_se: max(var(--_r), var(--_outer)); }
.md-list--segmented > .md-list-item:last-child  .md-list-item__primary { --_es: max(var(--_r), var(--_outer)); --_ee: max(var(--_r), var(--_outer)); }
.md-list-item[data-lines="2"] .md-list-item__primary { min-block-size: 72px; }
.md-list-item[data-lines="3"] .md-list-item__primary { min-block-size: 88px; align-items: flex-start; }
.md-list-item[data-lines="3"] :is(.md-list-item__leading, .md-list-item__trailing) { margin-block-start: 2px; } /* 12dp from top */
.md-list-item__content { flex: 1 1 auto; min-inline-size: 0; display: flex; flex-direction: column; }
.md-list-item__label { font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font); letter-spacing: var(--md-sys-typescale-body-large-tracking); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.md-list-item__supporting { color: var(--md-list-item-supporting-color); font: var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size)/var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font); letter-spacing: var(--md-sys-typescale-body-medium-tracking); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: var(--md-list-item-supporting-lines, 2); overflow: hidden; }
.md-list-item__overline, .md-list-item__meta { color: var(--md-list-item-overline-color); font: var(--md-sys-typescale-label-small-weight) var(--md-sys-typescale-label-small-size)/var(--md-sys-typescale-label-small-line-height) var(--md-sys-typescale-label-small-font); letter-spacing: var(--md-sys-typescale-label-small-tracking); }
.md-list-item__meta { color: var(--md-list-item-trailing-text-color); }
.md-list-item__leading, .md-list-item__trailing { flex: none; display: flex; align-items: center; color: var(--md-list-item-leading-icon-color); }
.md-list-item__trailing { color: var(--md-list-item-trailing-icon-color); margin-inline-start: auto; }
.md-list-item__leading > svg, .md-list-item__trailing > svg { inline-size: var(--md-list-item-icon-size); block-size: var(--md-list-item-icon-size); }
.md-list-item__avatar { inline-size: 40px; block-size: 40px; border-radius: var(--md-sys-shape-corner-full); background: var(--md-list-item-avatar-color); color: var(--md-list-item-avatar-label-color); display: grid; place-items: center; font: var(--md-sys-typescale-title-medium-weight) var(--md-sys-typescale-title-medium-size)/var(--md-sys-typescale-title-medium-line-height) var(--md-sys-typescale-title-medium-font); letter-spacing: var(--md-sys-typescale-title-medium-tracking); }
.md-list-item__image { inline-size: 56px; block-size: 56px; object-fit: cover; border-radius: var(--md-list-item-image-shape); }
.md-list-item__video { inline-size: 100px; block-size: 56px; border-radius: var(--md-sys-shape-corner-small); object-fit: cover; }
.md-list-item__video--large { inline-size: 114px; block-size: 64px; }
.md-list-item__row { display: flex; align-items: stretch; }
.md-list-item__row > .md-list-item__primary { flex: 1; }
.md-list-item__row .md-icon-button { block-size: 100%; } /* icon button fills item height */

/* States */
.md-list-item__primary:hover { --_r: var(--md-list-item-hover-shape); --md-list-item-state-opacity: var(--md-sys-state-hover-state-layer-opacity); }
.md-list-item__primary:focus-visible {
  --_r: var(--md-list-item-active-shape); --md-list-item-state-opacity: var(--md-sys-state-focus-state-layer-opacity);
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset);
}
.md-list-item__primary:active { --_r: var(--md-list-item-active-shape); --md-list-item-state-opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-list-item[data-dragging] .md-list-item__primary { --_r: var(--md-list-item-active-shape); --md-list-item-state-opacity: var(--md-sys-state-dragged-state-layer-opacity); box-shadow: var(--md-sys-elevation-level4); position: relative; z-index: 1; }
.md-list-item__primary[aria-selected="true"], .md-list-item[data-selected] .md-list-item__primary {
  --_r: var(--md-list-item-active-shape);
  --md-list-item-container-color: var(--md-list-item-selected-container-color);
  --md-list-item-label-color: var(--md-list-item-selected-content-color);
  --md-list-item-supporting-color: var(--md-list-item-selected-content-color);
  --md-list-item-overline-color: var(--md-list-item-selected-content-color);
  --md-list-item-trailing-text-color: var(--md-list-item-selected-content-color);
  --md-list-item-leading-icon-color: var(--md-list-item-selected-content-color);
  --md-list-item-trailing-icon-color: var(--md-list-item-selected-content-color);
}
.md-list-item__primary[aria-selected="true"]:is(:hover, :focus-visible, :active) { --md-list-item-leading-icon-color: var(--md-sys-color-on-surface); --md-list-item-trailing-icon-color: var(--md-sys-color-on-surface); }
.md-list-item__primary:is([aria-disabled="true"], :disabled) {
  cursor: default; --md-list-item-state-opacity: 0;
  --_dis: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --md-list-item-label-color: var(--_dis); --md-list-item-supporting-color: var(--_dis); --md-list-item-overline-color: var(--_dis);
  --md-list-item-trailing-text-color: var(--_dis); --md-list-item-leading-icon-color: var(--_dis); --md-list-item-trailing-icon-color: var(--_dis);
}
.md-list-item__primary:is([aria-disabled="true"], :disabled):not([aria-selected="true"]) { --_r: var(--md-list-item-shape); }
.md-list-item__primary[aria-selected="true"][aria-disabled="true"] { --md-list-item-container-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent); }
.md-list-item__primary:is([aria-disabled="true"], :disabled) :is(img, video, .md-list-item__avatar) { opacity: 0.38; } /* derived */

/* Expand */
.md-list-item__expand-icon { inline-size: 40px; block-size: 40px; border-radius: var(--md-sys-shape-corner-full); background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); display: grid; place-items: center; }
[aria-expanded="true"] .md-list-item__expand-icon { background: var(--md-sys-color-surface-container); }
.md-list-item__children { display: grid; grid-template-rows: 0fr; }
.md-list-item__children > * { overflow: hidden; }
[aria-expanded="true"] + .md-list-item__children { grid-template-rows: 1fr; }
.md-list-item--expandable:has([aria-expanded="true"]) { border-radius: var(--md-sys-shape-corner-large); background: var(--md-sys-color-surface); overflow: hidden; }
```

**(d) Motion**
```css
.md-list-item__primary { transition:
  border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  border-start-start-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  border-start-end-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  border-end-start-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  border-end-end-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-list-item__children { transition: grid-template-rows var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.md-list-item__expand-icon > svg { transition: rotate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); }
[aria-expanded="true"] .md-list-item__expand-icon > svg { rotate: 180deg; }
@media (prefers-reduced-motion: reduce) {
  .md-list-item__primary, .md-list-item__children, .md-list-item__expand-icon > svg { transition-property: background-color, color; }
}
```
Radius overshoot from the expressive spatial curve is fine (negative radii clamp to 0).

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-list-item__primary { forced-color-adjust: none; background: Canvas; color: CanvasText; }
  .md-list-item__primary[aria-selected="true"] { background: Highlight; color: HighlightText; }
  .md-list-item__primary:focus-visible { outline-color: CanvasText; }
  .md-list-item__primary:is([aria-disabled="true"], :disabled) { color: GrayText; }
  .md-list--segmented .md-list-item__primary { border: 1px solid CanvasText; }
}
```

**(f) JS responsibilities**
- Roving tabindex: one item/action has `tabindex=0`; on list `keydown` handle Up/Left (prev, wrap), Down/Right (next, wrap), Home/End; focus target = selected item when entering (set its tabindex 0).
- Multi-action: roving set = all `.md-list-item__primary` + trailing buttons in DOM order.
- Select lists: click/Space/Enter on option → update `aria-selected` (single: clear others), sync inner control `data-checked`, dispatch `change`; mirror value into hidden `<input type="radio|checkbox" name>` or `ElementInternals.setFormValue` for form participation. Disabled options ignore activation.
- Single-action: native `<a>`/`<button>` activation (Space on links: call `click()` per source requirement "Space or Enter activate").
- Compute `data-lines` from present text (overline/supporting line count via `ResizeObserver` if wrapping) unless set explicitly.
- Expand: toggle `aria-expanded`; set `inert` on collapsed children.
- Drag/swipe (optional): pointer events, `data-dragging`, live-region announcement, menu alternative.

## 11. Source gaps & decisions
- `disabled.state-layer` (on-surface @ 0.10) has no visual description; disabled items never show hover/press → not rendered (derived). Kept in token list.
- `selected.disabled.container` = `on-surface` @ 0.38 combined with `on-surface` @ 0.38 content gives very low contrast; implemented as the token says, exposed as a custom property so products can lower it (e.g. 0.12) if needed.
- Segmented items use `surface` (same as page) → separation shows only if the list sits on a different surface; recommend placing segmented lists on `surface-container*` backgrounds or overriding `--md-list-item-container-color` (derived).
- Baseline table says trailing end padding 24dp and inset divider 16/24; expressive tokens say 16/16 → expressive uses tokens, baseline variant may set 24dp end padding.
- Baseline "leading icon top padding 8dp" for non-top-aligned items conflicts with centered alignment → centered alignment wins; 12dp top offset only for three-line items.
- Line-count rules for overline not stated → overline counts as a line (derived).
- Dragged tokens labeled "baseline only" → applied to expressive too (shape token exists).
- Expand trailing icon size/container size not given → 40dp circle, 20/24dp icon (derived).
- Shape/selection motion not specified → fast-spatial (shape), fast-effects (color); expand → default-spatial height.
- Swipe is Android Views only in source → optional on web, menu alternative mandatory.
- Multi-select listbox ARIA (`aria-multiselectable`) not stated in source table → added (web mapping).
- Trailing icon button width not given → 48dp (touch target).
