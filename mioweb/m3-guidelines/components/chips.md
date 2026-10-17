# Chips

> Source: https://m3.material.io/components/chips · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview

Chips show compact, contextual options: they help people enter information, make selections, filter content, or trigger actions for the current task.

- **Use for:** contextual, supplemental options presented as a **set** (forking paths for the current task); filtering a collection; converting user-entered text into discrete tokens; dynamically generated suggestions.
- **Do not use for:** major or progressive actions (Save, Cancel, Next, the last step of a task). Use buttons for those. Do not show a single chip by itself; chips always appear in a set.
- Chips vs. buttons: buttons are persistent fixtures of a layout and represent linear steps, with no more than 3 in a single arrangement. Chips are dynamic to the situation and appear as a group.
- Elevation defaults to 0. Use the elevated style only when more separation is needed, for example on images or dynamic backgrounds.

**Updates and differences**
- Aug 2024: the stroke color changed from **outline** to **outline variant**, so the outline is softer than a button's.
- Compared with M2: new color mappings with dynamic color, a rounded-rectangle shape (8dp), and new variants. Action chips are split into assist and suggestion chips, and choice chips are now a subset of filter chips.
- The source has no Expressive-specific chip changes such as new sizes, shape morph, or spring motion. Chips keep the baseline M3 spec.

## 2. Variants & configurations

| Variant | Purpose / author | Configurations | Notes |
| --- | --- | --- | --- |
| **Assist** (`md.comp.assist-chip`) | Smart or automated action, possibly spanning apps (e.g. "Add to calendar") | flat (outlined) / elevated; with or without a leading icon | Label usually starts with a verb. Can show progress or confirmation (Save to Saved). |
| **Filter** (`md.comp.filter-chip`) | Filters a collection | flat / elevated; selected / unselected; optional leading icon (checkmark when selected); optional trailing icon (remove or open menu) | Can be single-select or multi-select. Don't mix both behaviors on a page. |
| **Input** (`md.comp.input-chip`) | Discrete user-entered information (e.g. a contact in the "To" field) | selected / unselected; leading icon **or** avatar (optional); trailing remove icon (required) | Flat only. Elevation is level0 and there is no elevated token set. Editable, reorderable, and draggable between fields. |
| **Suggestion** (`md.comp.suggestion-chip`) | Product-generated suggestion (e.g. a quick reply) | flat / elevated; with or without a leading icon | Label is a noun or short phrase. |

- **Flat** chips have a 1dp outline-variant stroke and no fill.
- **Elevated** chips have a surface-container-low fill, level1 elevation, and no stroke.
- Chips come in one size: 32dp high. The source defines no sizes.

## 3. Anatomy

1. **Container**: an 8dp rounded rectangle, either outlined (flat) or filled and shadowed (elevated).
2. **Label text**: required, label-large, start-aligned, and vertically centered.
3. **Leading icon or image** (optional): an 18dp icon or logo, or a 24dp circular avatar (input chips). For a selected filter chip, this is the checkmark.
4. **Trailing icon**: required on input chips (remove). Optional on filter chips (remove, or a menu dropdown arrow). Always on the end side, so it moves left in RTL.
5. **State layer**: an overlay in the content color at the state opacity.
6. **Focus indicator**: an outer ring 3dp thick with a 2dp offset, in `secondary`.

## 4. Tokens & specs

### 4.1 Color

State-layer opacities: hover 0.08 (`--md-sys-state-hover-state-layer-opacity`), focus 0.10, pressed 0.10, dragged 0.16.

Disabled styling:
- Label and icons use `on-surface` at 0.38 opacity.
- The flat outline uses `on-surface` at 0.12.
- A selected or elevated disabled container uses `on-surface` at 0.12.
- The input chip avatar drops to 0.38 opacity.

#### Assist chip
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container (flat) | enabled | flat.outline.color (1dp) | `--md-sys-color-outline-variant` |
| Container (flat) | focus | flat.focus.outline.color | `--md-sys-color-on-surface` |
| Container (flat) | disabled | flat.disabled.outline.color @0.12 | `--md-sys-color-on-surface` |
| Container (elevated) | enabled | elevated.container.color | `--md-sys-color-surface-container-low` |
| Container (elevated) | disabled | elevated.disabled.container.color @0.12 | `--md-sys-color-on-surface` |
| Shadow | – | elevated.container.shadow-color | `--md-sys-color-shadow` |
| Label | enabled / hover / focus / pressed / dragged | label-text.color | `--md-sys-color-on-surface` |
| Label | disabled | disabled.label-text.color @0.38 | `--md-sys-color-on-surface` |
| Icon | enabled / hover / focus / pressed / dragged | with-icon.icon.color | `--md-sys-color-primary` |
| Icon | disabled | with-icon.disabled.icon.color @0.38 | `--md-sys-color-on-surface` |
| State layer | hover / focus / pressed / dragged | *.state-layer.color | `--md-sys-color-on-surface` |
| Focus indicator | focus-visible | focus.indicator.color | `--md-sys-color-secondary` |

#### Filter chip
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container (flat, unselected) | enabled | flat.unselected.outline.color (1dp) | `--md-sys-color-outline-variant` |
| Container (flat, unselected) | focus | flat.unselected.focus.outline.color | `--md-sys-color-on-surface-variant` |
| Container (flat, unselected) | disabled | flat.disabled.unselected.outline.color @0.12 | `--md-sys-color-on-surface` |
| Container (flat, selected) | enabled | flat.selected.container.color (outline 0dp) | `--md-sys-color-secondary-container` |
| Container (flat, selected) | disabled | flat.disabled.selected.container.color @0.12 | `--md-sys-color-on-surface` |
| Container (elevated, unselected) | enabled | elevated.unselected.container.color | `--md-sys-color-surface-container-low` |
| Container (elevated, selected) | enabled | elevated.selected.container.color | `--md-sys-color-secondary-container` |
| Container (elevated) | disabled | elevated.disabled.container.color @0.12 | `--md-sys-color-on-surface` |
| Label (unselected) | all enabled states | unselected.label-text.color | `--md-sys-color-on-surface-variant` |
| Label (selected) | all enabled states | selected.label-text.color | `--md-sys-color-on-secondary-container` |
| Label | disabled | disabled.label-text.color @0.38 | `--md-sys-color-on-surface` |
| Leading icon (unselected) | all enabled states | with-leading-icon.unselected.leading-icon.color | `--md-sys-color-primary` |
| Leading icon (selected) | all enabled states | with-leading-icon.selected.leading-icon.color | `--md-sys-color-on-secondary-container` |
| Trailing icon (unselected) | all enabled states | with-trailing-icon.unselected.trailing-icon.color | `--md-sys-color-on-surface-variant` |
| Trailing icon (selected) | all enabled states | with-trailing-icon.selected.trailing-icon.color | `--md-sys-color-on-secondary-container` |
| Icons | disabled | *.disabled.*-icon.color @0.38 | `--md-sys-color-on-surface` |
| State layer (unselected) | hover / focus / dragged | unselected.*.state-layer.color | `--md-sys-color-on-surface-variant` |
| State layer (unselected) | pressed | unselected.pressed.state-layer.color | `--md-sys-color-on-secondary-container` (as in source) |
| State layer (selected) | hover / focus / dragged | selected.*.state-layer.color | `--md-sys-color-on-secondary-container` |
| State layer (selected) | pressed | selected.pressed.state-layer.color | `--md-sys-color-on-surface-variant` (as in source) |
| Focus indicator | focus-visible | focus.indicator.color | `--md-sys-color-secondary` |

> In the source, the pressed state-layer colors are swapped relative to the other states. This likely anticipates the selected/unselected state the chip will have after the press. Implement them exactly as tokenized.

#### Input chip
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container (unselected) | enabled | unselected.outline.color (1dp) | `--md-sys-color-outline-variant` |
| Container (unselected) | focus | unselected.focus.outline.color | `--md-sys-color-on-surface-variant` |
| Container (unselected) | disabled | disabled.unselected.outline.color @0.12 | `--md-sys-color-on-surface` |
| Container (selected) | enabled | selected.container.color (outline 0dp) | `--md-sys-color-secondary-container` |
| Container (selected) | disabled | disabled.selected.container.color @0.12 | `--md-sys-color-on-surface` |
| Label (unselected / selected) | enabled states | *.label-text.color | `--md-sys-color-on-surface-variant` / `--md-sys-color-on-secondary-container` |
| Label | disabled | disabled.label-text.color @0.38 | `--md-sys-color-on-surface` |
| Leading icon (unselected) | enabled | with-leading-icon.unselected.leading-icon.color | `--md-sys-color-on-surface-variant` |
| Leading icon (unselected) | hover / focus / pressed | …unselected.{state}.leading-icon.color | `--md-sys-color-primary` |
| Leading icon (unselected) | dragged | …unselected.dragged.leading-icon.color | `--md-sys-color-on-surface-variant` |
| Leading icon (selected) | enabled / hover / focus / pressed | …selected.*.leading-icon.color | `--md-sys-color-primary` |
| Leading icon (selected) | dragged | …selected.dragged.leading-icon.color | `--md-sys-color-on-secondary-container` |
| Trailing icon (unselected) | enabled / hover / focus / pressed | …unselected.*.trailing-icon.color | `--md-sys-color-on-surface-variant` |
| Trailing icon (selected) | enabled / hover / focus / pressed | …selected.*.trailing-icon.color | `--md-sys-color-on-secondary-container` |
| Trailing icon (both) | dragged | …dragged.trailing-icon.color | `--md-sys-color-primary` |
| Icons | disabled | *.disabled.*-icon.color @0.38 | `--md-sys-color-on-surface` |
| Avatar | disabled | with-avatar.disabled.avatar.opacity | 0.38 |
| State layer (unselected / selected) | hover / focus / pressed / dragged | *.state-layer.color | `--md-sys-color-on-surface-variant` / `--md-sys-color-on-secondary-container` |
| Focus indicator | focus-visible | focus.indicator.color | `--md-sys-color-secondary` |

#### Suggestion chip
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container (flat) | enabled | flat.outline.color (1dp) | `--md-sys-color-outline-variant` |
| Container (flat) | focus | flat.focus.outline.color | `--md-sys-color-on-surface-variant` |
| Container (flat) | disabled | flat.disabled.outline.color @0.12 | `--md-sys-color-on-surface` |
| Container (elevated) | enabled | elevated.container.color | `--md-sys-color-surface-container-low` |
| Container (elevated) | disabled | elevated.disabled.container.color @0.12 | `--md-sys-color-on-surface` |
| Label | enabled states | label-text.color | `--md-sys-color-on-surface-variant` |
| Label | disabled | disabled.label-text.color @0.38 | `--md-sys-color-on-surface` |
| Leading icon | enabled states | with-leading-icon.leading-icon.color | `--md-sys-color-primary` |
| Leading icon | disabled | @0.38 | `--md-sys-color-on-surface` |
| State layer | hover / focus / pressed / dragged | *.state-layer.color | `--md-sys-color-on-surface-variant` |
| Focus indicator | focus-visible | focus.indicator.color | `--md-sys-color-secondary` |

**Theming notes**
- The leading icon of unselected chips defaults to `primary`. `on-surface-variant` is an approved lower-emphasis alternative.
- To show interactivity at 3:1 contrast, you may use `outline` instead of `outline-variant` for the stroke (see §8).

### 4.2 Size, layout & shape

| Attribute | Assist | Filter | Input | Suggestion |
| --- | --- | --- | --- | --- |
| Container height | 32px | 32px | 32px | 32px |
| Corner radius | 8px (`--md-sys-shape-corner-small`) | 8px | 8px | 8px |
| Outline width (flat / unselected) | 1px | 1px (selected 0px) | 1px (selected 0px) | 1px |
| Icon size | 18px | 18px | 18px | 18px |
| Avatar | – | – | 24px, circular (`--md-sys-shape-corner-full`; Specs table says "12dp corner radius") | – |
| Start/end padding, no icon | 16px | 16px | start 16px (derived: same as other variants; source only lists icon/avatar padding) | 16px |
| Start/end padding on the icon side | 8px | 8px | 8px | 8px |
| Start padding with avatar | – | – | 4px | – |
| End padding next to avatar (avatar to label gap) | – | – | 8px | – |
| Gap between elements | 8px | 8px | 8px | 8px |
| Label alignment | start, vertically centered | same | same | same |

- **Touch target:** at least 48×48px for every chip, regardless of placement or density. The target can extend beyond the visible container.
- **Secondary action target** (a trailing remove or menu icon): needs its own 48×48px target that doesn't overlap the primary action. To get this, give the chip a min-width of **88px**, or give the label a min-width of **42px**.
- **Chip set spacing:** at least **8px** between chips, both horizontally and between wrapped lines.
- **Label length:** 20 characters or fewer. Labels truncate (ellipsis) when wrapped or when wider than the window. Single line always (`white-space: nowrap`); chip `max-width: 100%` of its set (web mapping).
- **Box model (derived from the measurements):** width = start padding + [leading 18px (or 24px avatar) + 8px] + label + [8px + trailing 18px] + end padding. Example: filter chip, selected, label 40px, with trailing → 8+18+8+40+8+18+8 = 108px.
- **Trailing icon visual target:** 18px icon; its focus ring and state feedback are drawn as a circle around the icon (derived: no token for a separate trailing state layer).

### 4.3 Typography
All variants use `md.sys.typescale.label-large` (`--md-sys-typescale-label-large-*`) for the label: Roboto, weight 500, 14px size, 20px line height, 0.1px tracking. This is the same style as buttons.

### 4.4 Elevation
| Style | Enabled | Hover | Focus | Pressed | Dragged | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Flat (assist / suggestion / filter unselected) | level0 | level0 | level0 | level0 | level4 (8dp) | level0 |
| Flat filter, selected | level0 | **level1** | level0 | level0 | level4 | level0 |
| Elevated (assist / filter / suggestion) | level1 | level2 | level1 | level1 | level4 | level0 |
| Input | level0 | level0 | level0 | level0 | level4 | level0 |

Shadow color: `--md-sys-color-shadow`. Don't use elevation to signal the pressed state; use the ripple instead.

### 4.5 Component token list

**`md.comp.assist-chip`**
```
container.height → 32dp
container.shape → md.sys.shape.corner.small (8dp)
flat.container.elevation → md.sys.elevation.level0
flat.outline.color → md.sys.color.outline-variant
flat.outline.width → 1dp
flat.focus.outline.color → md.sys.color.on-surface
flat.disabled.outline.color → md.sys.color.on-surface
flat.disabled.outline.opacity → 0.12
elevated.container.color → md.sys.color.surface-container-low
elevated.container.elevation → md.sys.elevation.level1
elevated.container.shadow-color → md.sys.color.shadow
elevated.hover.container.elevation → md.sys.elevation.level2
elevated.focus.container.elevation → md.sys.elevation.level1
elevated.pressed.container.elevation → md.sys.elevation.level1
elevated.disabled.container.elevation → md.sys.elevation.level0
elevated.disabled.container.color → md.sys.color.on-surface
elevated.disabled.container.opacity → 0.12
dragged.container.elevation → md.sys.elevation.level4
label-text.font/line-height/size/weight/tracking/type → md.sys.typescale.label-large.*
label-text.color → md.sys.color.on-surface
hover|focus|pressed|dragged.label-text.color → md.sys.color.on-surface
disabled.label-text.color → md.sys.color.on-surface
disabled.label-text.opacity → 0.38
with-icon.icon.size → 18dp
with-icon.icon.color → md.sys.color.primary
with-icon.hover|focus|pressed|dragged.icon.color → md.sys.color.primary
with-icon.disabled.icon.color → md.sys.color.on-surface
with-icon.disabled.icon.opacity → 0.38
hover.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.hover.state-layer-opacity (0.08)
focus.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.focus.state-layer-opacity (0.1)
pressed.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.pressed.state-layer-opacity (0.1)
dragged.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.dragged.state-layer-opacity (0.16)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
```

**`md.comp.filter-chip`**
```
container.height → 32dp
container.shape → md.sys.shape.corner.small (8dp)
flat.container.elevation → md.sys.elevation.level0
flat.unselected.outline.color → md.sys.color.outline-variant
flat.unselected.outline.width → 1dp
flat.selected.container.color → md.sys.color.secondary-container
flat.selected.outline.width → 0dp
flat.unselected.focus.outline.color → md.sys.color.on-surface-variant
flat.selected.hover.container.elevation → md.sys.elevation.level1
flat.unselected.hover.container.elevation → md.sys.elevation.level0
flat.selected.focus.container.elevation → md.sys.elevation.level0
flat.unselected.focus.container.elevation → md.sys.elevation.level0
flat.selected.pressed.container.elevation → md.sys.elevation.level0
flat.unselected.pressed.container.elevation → md.sys.elevation.level0
flat.disabled.unselected.outline.color → md.sys.color.on-surface ; opacity → 0.12
flat.disabled.selected.container.color → md.sys.color.on-surface ; opacity → 0.12
elevated.container.elevation → md.sys.elevation.level1
elevated.container.shadow-color → md.sys.color.shadow
elevated.unselected.container.color → md.sys.color.surface-container-low
elevated.selected.container.color → md.sys.color.secondary-container
elevated.hover.container.elevation → md.sys.elevation.level2
elevated.focus.container.elevation → md.sys.elevation.level1
elevated.pressed.container.elevation → md.sys.elevation.level1
elevated.disabled.container.elevation → md.sys.elevation.level0
elevated.disabled.container.color → md.sys.color.on-surface ; opacity → 0.12
dragged.container.elevation → md.sys.elevation.level4
label-text.font/line-height/size/weight/tracking/type → md.sys.typescale.label-large.*
unselected.label-text.color → md.sys.color.on-surface-variant
selected.label-text.color → md.sys.color.on-secondary-container
unselected.hover|focus|pressed|dragged.label-text.color → md.sys.color.on-surface-variant
selected.hover|focus|pressed|dragged.label-text.color → md.sys.color.on-secondary-container
disabled.label-text.color → md.sys.color.on-surface ; opacity → 0.38
with-icon.icon.size → 18dp
with-leading-icon.unselected.leading-icon.color → md.sys.color.primary
with-leading-icon.unselected.hover|focus|pressed|dragged.leading-icon.color → md.sys.color.primary
with-leading-icon.selected.leading-icon.color → md.sys.color.on-secondary-container
with-leading-icon.selected.hover|focus|pressed|dragged.leading-icon.color → md.sys.color.on-secondary-container
with-trailing-icon.unselected.trailing-icon.color → md.sys.color.on-surface-variant
with-trailing-icon.unselected.hover|focus|pressed|dragged.trailing-icon.color → md.sys.color.on-surface-variant
with-trailing-icon.selected.trailing-icon.color → md.sys.color.on-secondary-container
with-trailing-icon.selected.hover|focus|pressed|dragged.trailing-icon.color → md.sys.color.on-secondary-container
with-leading-icon.disabled.leading-icon.color → md.sys.color.on-surface ; opacity → 0.38
with-trailing-icon.disabled.trailing-icon.color → md.sys.color.on-surface ; opacity → 0.38
unselected.hover.state-layer.color → md.sys.color.on-surface-variant ; opacity 0.08
unselected.focus.state-layer.color → md.sys.color.on-surface-variant ; opacity 0.1
unselected.pressed.state-layer.color → md.sys.color.on-secondary-container ; opacity 0.1
unselected.dragged.state-layer.color → md.sys.color.on-surface-variant ; opacity 0.16
selected.hover.state-layer.color → md.sys.color.on-secondary-container ; opacity 0.08
selected.focus.state-layer.color → md.sys.color.on-secondary-container ; opacity 0.1
selected.pressed.state-layer.color → md.sys.color.on-surface-variant ; opacity 0.1
selected.dragged.state-layer.color → md.sys.color.on-secondary-container ; opacity 0.16
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
```

**`md.comp.input-chip`**
```
container.height → 32dp
container.shape → md.sys.shape.corner.small (8dp)
container.elevation → md.sys.elevation.level0
dragged.container.elevation → md.sys.elevation.level4
unselected.outline.color → md.sys.color.outline-variant
unselected.outline.width → 1dp
unselected.focus.outline.color → md.sys.color.on-surface-variant
selected.container.color → md.sys.color.secondary-container
selected.outline.width → 0dp
disabled.unselected.outline.color → md.sys.color.on-surface ; opacity → 0.12
disabled.selected.container.color → md.sys.color.on-surface ; opacity → 0.12
label-text.font/line-height/size/weight/tracking/type → md.sys.typescale.label-large.*
unselected.label-text.color (+ hover|focus|pressed|dragged) → md.sys.color.on-surface-variant
selected.label-text.color (+ hover|focus|pressed|dragged) → md.sys.color.on-secondary-container
disabled.label-text.color → md.sys.color.on-surface ; opacity → 0.38
with-leading-icon.leading-icon.size → 18dp
with-leading-icon.unselected.leading-icon.color → md.sys.color.on-surface-variant
with-leading-icon.unselected.hover|focus|pressed.leading-icon.color → md.sys.color.primary
with-leading-icon.unselected.dragged.leading-icon.color → md.sys.color.on-surface-variant
with-leading-icon.selected.leading-icon.color → md.sys.color.primary
with-leading-icon.selected.hover|focus|pressed.leading-icon.color → md.sys.color.primary
with-leading-icon.selected.dragged.leading-icon.color → md.sys.color.on-secondary-container
with-leading-icon.disabled.leading-icon.color → md.sys.color.on-surface ; opacity → 0.38
with-trailing-icon.trailing-icon.size → 18dp
with-trailing-icon.unselected.trailing-icon.color (+ hover|focus|pressed) → md.sys.color.on-surface-variant
with-trailing-icon.selected.trailing-icon.color (+ hover|focus|pressed) → md.sys.color.on-secondary-container
with-trailing-icon.unselected.dragged.trailing-icon.color → md.sys.color.primary
with-trailing-icon.selected.dragged.trailing-icon.color → md.sys.color.primary
with-trailing-icon.disabled.trailing-icon.color → md.sys.color.on-surface ; opacity → 0.38
with-avatar.avatar.size → 24dp
with-avatar.avatar.shape → md.sys.shape.corner.full
with-avatar.disabled.avatar.opacity → 0.38
unselected.hover|focus|pressed|dragged.state-layer.color → md.sys.color.on-surface-variant
selected.hover|focus|pressed|dragged.state-layer.color → md.sys.color.on-secondary-container
*.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08) ; *.focus → md.sys.state.focus.state-layer-opacity (0.1) ; *.pressed → md.sys.state.pressed.state-layer-opacity (0.1) ; *.dragged → md.sys.state.dragged.state-layer-opacity (0.16)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
```

**`md.comp.suggestion-chip`**
```
container.height → 32dp
container.shape → md.sys.shape.corner.small (8dp)
flat.container.elevation → md.sys.elevation.level0
flat.outline.color → md.sys.color.outline-variant
flat.outline.width → 1dp
flat.focus.outline.color → md.sys.color.on-surface-variant
flat.disabled.outline.color → md.sys.color.on-surface ; opacity → 0.12
elevated.container.color → md.sys.color.surface-container-low
elevated.container.elevation → md.sys.elevation.level1
elevated.container.shadow-color → md.sys.color.shadow
elevated.hover.container.elevation → md.sys.elevation.level2
elevated.focus.container.elevation → md.sys.elevation.level1
elevated.pressed.container.elevation → md.sys.elevation.level1
elevated.disabled.container.elevation → md.sys.elevation.level0
elevated.disabled.container.color → md.sys.color.on-surface ; opacity → 0.12
dragged.container.elevation → md.sys.elevation.level4
label-text.font/line-height/size/weight/tracking/type → md.sys.typescale.label-large.*
label-text.color (+ hover|focus|pressed|dragged) → md.sys.color.on-surface-variant
disabled.label-text.color → md.sys.color.on-surface ; opacity → 0.38
with-leading-icon.leading-icon.size → 18dp
with-leading-icon.leading-icon.color (+ hover|focus|pressed|dragged) → md.sys.color.primary
with-leading-icon.disabled.leading-icon.color → md.sys.color.on-surface ; opacity → 0.38
hover|focus|pressed|dragged.state-layer.color → md.sys.color.on-surface-variant (opacity 0.08 / 0.1 / 0.1 / 0.16)
focus.indicator.color → md.sys.color.secondary
focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset → md.sys.state.focus-indicator.outer-offset (2dp)
```

## 5. States & interaction

- **States:** enabled, hovered, focused, pressed, dragged, and disabled. Filter and input chips also have selected and unselected states.
- **State layer:** an overlay that fills the container shape, using the color from the tables above at opacity 0.08 (hover), 0.10 (focus), 0.10 (pressed), or 0.16 (dragged).
- **Pressed:** show a ripple. For elevated chips, keep elevation at level1; don't raise it on press.
- **Focus:**
  - Show the focus indicator ring on `:focus-visible`: 3px thick, 2px outside the container, in `secondary`, following the 8px radius plus the offset.
  - The flat outline also changes to its focus outline color.
- **Hover:** elevated chips rise to level2. A flat **selected** filter chip rises to level1.
- **Dragged:** all chips rise to level4 (8dp) and use a 0.16 state layer. Input chips can be dragged to reorder or to move between fields.
- **Filter selection:** selecting a chip fills the container with `secondary-container`, removes the outline (0px), and adds a leading checkmark icon at the start of the label. The width grows to fit the icon, and the start padding changes from 16px to 8px.
- **Filter chip with a custom leading icon:** when selected, the checkmark replaces the custom icon (derived: one leading slot; source shows the checkmark at the start edge). Width does not change in that case.
- **Single-select filter sets:** selecting a chip deselects the others.
- **Trailing action (filter remove/menu, input remove):** hover/press on it drives the chip's state layer (no separate tokens); keyboard focus on it shows its own circular focus ring, not the chip ring.
- **Selected + transient states:** state layer uses the selected color (`on-secondary-container`), except filter **pressed**, which uses the swapped token (see §4.1).
- **Disabled + selected:** container `on-surface` @0.12, no outline, content @0.38, elevation level0.
- **Disabled:** content at 0.38 opacity, outline or container at 0.12. Not focusable and not interactive.
- **Keyboard:** see §8.

## 6. Motion & behavior

- The source gives no chip-specific springs or durations. Derived mapping (guidelines: small components use fast springs):

| Property | Spring primitive | CSS fallback |
| --- | --- | --- |
| State-layer opacity, container/label/icon color, outline color | fast effects | 0.31,0.94,0.34,1 · 150ms |
| Elevation (box-shadow) | fast effects | same |
| Checkmark reveal: leading slot width 0→18px, margin 0→8px, start padding 16→8px | fast spatial | 0.42,1.67,0.21,0.90 · 350ms |
| Checkmark icon opacity / scale 0.6→1 | fast effects | 150ms |

- The selection checkmark appears or disappears when a filter chip is toggled (source video, no timing values; values above derived).
- Reduced motion: width/padding change instantly; color/opacity keep the effects transition.
- **Assist chips:**
  - During an interaction, an assist chip can transform into a modal, transition to a full-screen view, or readjust inline to show more results.
  - It can show progress and confirmation, for example a label that changes from "Save" to "Saved".
- **Input chips:**
  - Can expand to show more information or options using a **container transform** transition.
  - In edit mode, an input chip reverts to a plain text string.
- **Chip sets:**
  - Wrap to new rows. If there would be more than 2 rows, consider horizontal scrolling instead.
  - A one-row field may scroll horizontally.
- **Overflowed input chips** in a text field behave like regular text. An unfocused field shows the start of the input; tapping it snaps to the end with the cursor active.
- **Adaptive layout:**
  - In medium and expanded windows, a filter chip may have a trailing icon (remove or menu).
  - In compact windows, the trailing icon's target is too small on its own, so the **whole chip** must trigger the action (for example, open the menu).

## 7. Usage guidelines

- **Choosing a variant:**
  - Action → assist chip.
  - Filtering a collection → filter chip.
  - User-authored information → input chip.
  - Product-authored suggestion → suggestion chip.
- **Sets:**
  - Always show chips in a set, never one chip alone. A filter set needs more than one option.
  - Place chips inline as a row, not stacked vertically.
  - Keep at least 8px between chips.
- **Labels:**
  - Keep labels to 20 characters or fewer, and drop articles.
  - Assist chips start with a verb (Get, Add).
  - Filter chips are nouns for what to **include**. Avoid negative phrasing such as "Exclude images".
  - Suggestion chips are nouns or short phrases.
- **Leading icons and images:**
  - A system icon can hint at the chip's category.
  - Avatars (24px) are larger than icons (18px).
- **Trailing icons:**
  - Input chips must have a remove icon.
  - Filter chips may have a remove icon or a menu arrow.
  - The trailing icon sits on the end side, so it appears on the left in RTL.
- **Elevation:** use the outline style on regular backgrounds and the elevated style only on images or complex backgrounds. Don't elevate chips placed directly on the page.
- **Placement:**
  - Assist chips go after primary content, for example below a card or persistently at the bottom of the screen.
  - Filter chips can sit under a search field, or in a side sheet when there are many.
  - Input chips can be inline with the cursor in a text field, in a stacked list, or in a horizontally scrolling list.
- **Selection behavior:** all chip sets on a page should be either single-select or multi-select, never a mix.
- **Input chip behavior:**
  - With the cursor right after a chip, pressing Backspace selects the whole chip, and a second Backspace deletes it.
  - Input chips can be edited, reordered, and moved between fields.
- **Density:** don't make chips denser by default. Offer it as a user choice, and keep the control that reverts it at least 48×48px.

## 8. Accessibility

- **Contrast:** the chip label needs at least 3:1 contrast with the background.
- **Showing interactivity:** use at least one of these secondary indicators:
  - a group label such as "Select type" before the chips
  - page context such as "Filter results"
  - the `outline` role for the stroke instead of `outline-variant`, giving 3:1
  - an interactive label or a leading icon
- **Icons and images** inside a chip are decorative: `aria-hidden="true"` / `alt=""`.
- **Roles:**

| Element | Label | Role (source, Web) | Web mapping (recommended) |
| --- | --- | --- | --- |
| Basic chip (one action) | "{chip content}" | gridcell | `<button>` (assist/suggestion); a chip that performs an action must expose button semantics |
| Selectable chip | "{chip content}" | gridcell | **Decision:** multi-select → `<button aria-pressed>` in a labelled `role="group"`; single-select → `<button role="radio" aria-checked>` in a labelled `role="radiogroup"` (matches the Android "radio button" role). `role="option"` in a `listbox` is an accepted alternative. |
| Remove icon (only action) | "Remove {chip content}" | – | Chip and icon form one focusable element; Delete/Backspace removes |
| Two actions (select + remove) | "{chip content}", then "Remove {chip content}" | button or checkbox | Two separate focusable elements: chip (button/checkbox) + remove `<button aria-label="Remove …">` |

- **Grid pattern (web mapping):** the source lists `gridcell` for the web. If you follow it, wrap the set in `role="grid"` with `role="row"`, which matches the APG grid pattern for input-chip fields.
- **Keyboard:**

| Key | Action |
| --- | --- |
| Tab | Move focus to an enabled chip or chip group |
| Space / Enter | Activate, select, or deselect the focused chip. In a multi-select set, each chip toggles independently. |
| Backspace / Delete | Remove the focused input chip |
| Arrow keys | Move focus between chips (roving tabindex, web mapping) |

- **Focus:** only one chip is focused at a time. After a chip is removed, move focus to the next chip, or the previous one if none follows, or to the input field (web mapping).
- **Mobile:** if remove is the only action, the remove icon is optional; the user can select the chip and press Delete.
- **Horizontal overflow:** let people see all chips without scrolling. Two methods:
  - **Reflow:** a leading "Show all" filter chip expands the set and pushes the content below down.
  - **Menu:** a leading button opens a menu of all chip options. Don't use this method when chips have a second action.
- **Drop-down chips (chip + menu):** the menu item label matches the item's text, and its icons are decorative.
- **Touch targets:** at least 48×48px per chip and per secondary action.

## 9. Implementation checklist

- [ ] One base chip with `variant`: `assist | filter | input | suggestion`, or four separate elements.
- [ ] Properties:
  - `label`, `elevated` (assist, filter, suggestion), `selected` (filter, input), `disabled`
  - `removable` (filter); input chips are always removable
  - `has-menu` (filter, trailing arrow)
  - `href`/`target` (assist link), `avatar` (input), `always-focusable` disabled (optional)
- [ ] Slots: `icon` (leading), `avatar` (input), `trailing-icon` (override).
- [ ] Events:
  - `click`/activate
  - `change`/`selected-change` (filter)
  - `remove` (input, and removable filter); cancelable, with a dispatched detail
  - `edit` (input)
- [ ] Internal structure: container (outline or elevation), state layer, ripple, focus ring, label, leading slot, and an optional separate trailing `<button>`.
- [ ] Padding follows content: 16px with no icon; 8px on the side with an icon; 4px before an avatar; 8px gap. Height is 32px.
- [ ] Selecting a filter chip shows a checkmark leading icon (18px) when it has no custom icon.
- [ ] Touch target: 48px tall via an invisible extension. A chip with a trailing action needs a min-width of 88px, or a label min-width of 42px.
- [ ] Chip set container:
  - role (grid, listbox, or toolbar)
  - single or multi selection mode
  - roving tabindex with arrow keys
  - wrap or horizontal-scroll modes
  - 8px gap
  - an optional "Show all" overflow pattern
- [ ] Input chip field: Backspace with the caret at the start selects the previous chip, and a second Backspace removes it. Supports edit mode (chip back to text), drag to reorder, and moving chips between fields.
- [ ] Truncate the label with an ellipsis when space is constrained; provide the full text for accessibility.
- [ ] RTL: mirror the padding and the trailing icon position.
- [ ] Respect `prefers-reduced-motion` for ripple and expansion transitions.
- [ ] Theme option for the leading icon color (`primary` by default, or `on-surface-variant`) and for the outline (`outline-variant` by default, or `outline` for higher contrast).

## 10. HTML/CSS implementation blueprint

### 10a. DOM skeleton
One structure for all variants. The root is a non-focusable wrapper that owns the container visuals; actions are native buttons (or a link) inside it.

```html
<!-- Assist (flat) / suggestion: single action -->
<span class="md-chip md-chip--assist">
  <span class="md-chip__outline" aria-hidden="true"></span>
  <span class="md-chip__state-layer" aria-hidden="true"></span>   <!-- ripple primitive lives here -->
  <button class="md-chip__primary" type="button">                 <!-- or <a href> for link chips -->
    <span class="md-chip__leading" aria-hidden="true"><svg class="md-chip__icon">…</svg></span>
    <span class="md-chip__label">Add to calendar</span>
  </button>
</span>

<!-- Filter, multi-select, with remove (two focusable actions) -->
<div role="group" aria-label="Filter results" class="md-chip-set">
  <span class="md-chip md-chip--filter">
    <span class="md-chip__outline" aria-hidden="true"></span>
    <span class="md-chip__state-layer" aria-hidden="true"></span>
    <button class="md-chip__primary" type="button" aria-pressed="true">
      <span class="md-chip__leading" aria-hidden="true">
        <svg class="md-chip__icon">…</svg>          <!-- optional custom icon -->
        <svg class="md-chip__check">…</svg>         <!-- checkmark, shown when selected -->
      </span>
      <span class="md-chip__label">Slides</span>
    </button>
    <button class="md-chip__trailing" type="button" aria-label="Remove Slides">
      <svg aria-hidden="true">…close…</svg>
    </button>
  </span>
</div>

<!-- Input chip, remove is the only action: ONE focusable element; trailing is a click target only -->
<span class="md-chip md-chip--input">
  <span class="md-chip__outline" aria-hidden="true"></span>
  <span class="md-chip__state-layer" aria-hidden="true"></span>
  <button class="md-chip__primary" type="button" aria-keyshortcuts="Delete Backspace" aria-description="Press Delete to remove">
    <img class="md-chip__avatar" src="…" alt="">
    <span class="md-chip__label">Ana López</span>
  </button>
  <span class="md-chip__trailing" data-action="remove" aria-hidden="true"><svg>…close…</svg></span>
</span>
```
- Filter + menu: trailing `<button aria-haspopup="menu" aria-expanded="false" aria-label="{label} options">` with arrow icon. Compact window (<600px): drop the trailing button, put `aria-haspopup`/`aria-expanded` on `.md-chip__primary` (whole chip opens the menu).
- Input chips in a text field: wrapper `role="grid"`, each chip `role="row"` > `role="gridcell"` containing the primary and remove buttons (source web role "gridcell").

### 10b. Custom properties
```css
.md-chip {
  --md-comp-chip-container-height: 32px;
  --md-comp-chip-container-shape: var(--md-sys-shape-corner-small);
  --md-comp-chip-container-color: transparent;
  --md-comp-chip-container-elevation: var(--md-sys-elevation-level0);
  --md-comp-chip-outline-width: 1px;
  --md-comp-chip-outline-color: var(--md-sys-color-outline-variant);
  --md-comp-chip-focus-outline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-chip-label-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-chip-leading-icon-color: var(--md-sys-color-primary);
  --md-comp-chip-trailing-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-chip-state-layer-color: var(--md-sys-color-on-surface-variant);
  --md-comp-chip-pressed-state-layer-color: var(--md-comp-chip-state-layer-color);
  --md-comp-chip-icon-size: 18px;
  --md-comp-chip-avatar-size: 24px;
  --md-comp-chip-avatar-shape: var(--md-sys-shape-corner-full);
  --md-comp-chip-focus-indicator-color: var(--md-sys-color-secondary);
  --md-comp-chip-focus-indicator-thickness: var(--md-sys-state-focus-indicator-thickness);
  --md-comp-chip-focus-indicator-offset: var(--md-sys-state-focus-indicator-outer-offset);
  --_disabled: var(--md-sys-color-on-surface);
}
/* variant defaults (md.comp.assist-chip / filter-chip / input-chip / suggestion-chip) */
.md-chip--assist {
  --md-comp-chip-label-text-color: var(--md-sys-color-on-surface);
  --md-comp-chip-state-layer-color: var(--md-sys-color-on-surface);
  --md-comp-chip-focus-outline-color: var(--md-sys-color-on-surface);
}
.md-chip--input { --md-comp-chip-leading-icon-color: var(--md-sys-color-on-surface-variant); }
.md-chip--elevated {                       /* assist / filter / suggestion only */
  --md-comp-chip-outline-width: 0px;
  --md-comp-chip-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-chip-container-elevation: var(--md-sys-elevation-level1);
}
```

### 10c. Layout and state selectors
```css
.md-chip {
  position: relative; isolation: isolate; box-sizing: border-box;
  display: inline-flex; align-items: center; vertical-align: middle;
  height: var(--md-comp-chip-container-height); max-width: 100%;
  border-radius: var(--md-comp-chip-container-shape);
  background: var(--md-comp-chip-container-color);
  box-shadow: var(--md-comp-chip-container-elevation);           /* elevation primitive */
  color: var(--md-comp-chip-label-text-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}
.md-chip__outline { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  border: var(--md-comp-chip-outline-width) solid var(--md-comp-chip-outline-color); }
.md-chip__state-layer { position: absolute; inset: 0; border-radius: inherit; overflow: hidden;
  pointer-events: none; background: var(--md-comp-chip-state-layer-color); opacity: 0; }  /* state layer primitive */
.md-chip__primary {
  all: unset; position: relative; z-index: 1; box-sizing: border-box; cursor: pointer;
  display: inline-flex; align-items: center; height: 100%; min-width: 0;
  padding-inline: 16px; border-radius: inherit;
}
.md-chip__primary::after { content: ""; position: absolute; inset-inline: 0; top: 50%; height: 48px; translate: 0 -50%; } /* touch target primitive */
.md-chip__leading { display: inline-grid; flex: none; width: var(--md-comp-chip-icon-size); height: var(--md-comp-chip-icon-size);
  margin-inline-end: 8px; color: var(--md-comp-chip-leading-icon-color); overflow: hidden; }
.md-chip__leading > * { grid-area: 1/1; width: 100%; height: 100%; }
.md-chip__avatar { flex: none; width: var(--md-comp-chip-avatar-size); height: var(--md-comp-chip-avatar-size);
  border-radius: var(--md-comp-chip-avatar-shape); object-fit: cover; margin-inline-end: 8px; }
.md-chip__label { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.md-chip__trailing { all: unset; position: relative; z-index: 1; flex: none; cursor: pointer;
  width: var(--md-comp-chip-icon-size); height: var(--md-comp-chip-icon-size);
  margin-inline: 8px; border-radius: var(--md-sys-shape-corner-full); color: var(--md-comp-chip-trailing-icon-color); }
.md-chip__trailing::after { content: ""; position: absolute; inset: 50% auto auto 50%; width: 48px; height: 48px; translate: -50% -50%; }

/* padding by content */
.md-chip:has(.md-chip__leading) .md-chip__primary { padding-inline-start: 8px; }
.md-chip:has(.md-chip__avatar)  .md-chip__primary { padding-inline-start: 4px; }
.md-chip:has(.md-chip__trailing) .md-chip__primary { padding-inline-end: 0; }
.md-chip:has(button.md-chip__trailing) { min-width: 88px; }     /* 2 × 48px targets */
.md-chip:has(button.md-chip__trailing) .md-chip__label { min-width: 42px; }
/* filter without custom icon: hide empty leading slot until selected */
.md-chip--filter:not(:has(.md-chip__icon)) .md-chip__leading { width: 0; margin-inline-end: 0; }
.md-chip--filter:not(:has(.md-chip__icon)) .md-chip__primary { padding-inline-start: 16px; }
.md-chip__check { opacity: 0; scale: .6; }

/* transient states (one layer at a time; highest wins by source order) */
@media (hover: hover) { .md-chip:not(:has(:disabled)):hover > .md-chip__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); } }
.md-chip:has(> :focus-visible) > .md-chip__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-chip:has(> :active:not(:disabled)) > .md-chip__state-layer { background: var(--md-comp-chip-pressed-state-layer-color);
  opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-chip[data-dragging] { --md-comp-chip-container-elevation: var(--md-sys-elevation-level4); cursor: grabbing; }
.md-chip[data-dragging] > .md-chip__state-layer { opacity: var(--md-sys-state-dragged-state-layer-opacity); }

/* focus */
.md-chip:has(> .md-chip__primary:focus-visible) {                  /* focus ring primitive */
  outline: var(--md-comp-chip-focus-indicator-thickness) solid var(--md-comp-chip-focus-indicator-color);
  outline-offset: var(--md-comp-chip-focus-indicator-offset);
  --md-comp-chip-outline-color: var(--md-comp-chip-focus-outline-color);
}
.md-chip__trailing:focus-visible { outline: var(--md-comp-chip-focus-indicator-thickness) solid var(--md-comp-chip-focus-indicator-color);
  outline-offset: var(--md-comp-chip-focus-indicator-offset); }

/* elevation per state (elevated styles) */
.md-chip--elevated:not(:has(:disabled)):hover { --md-comp-chip-container-elevation: var(--md-sys-elevation-level2); }

/* selected (filter / input) */
.md-chip:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"], [aria-selected="true"])) {
  --md-comp-chip-outline-width: 0px;
  --md-comp-chip-container-color: var(--md-sys-color-secondary-container);
  --md-comp-chip-label-text-color: var(--md-sys-color-on-secondary-container);
  --md-comp-chip-leading-icon-color: var(--md-sys-color-on-secondary-container);
  --md-comp-chip-trailing-icon-color: var(--md-sys-color-on-secondary-container);
  --md-comp-chip-state-layer-color: var(--md-sys-color-on-secondary-container);
}
.md-chip--filter:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"])) {
  --md-comp-chip-pressed-state-layer-color: var(--md-sys-color-on-surface-variant);   /* token swap */
}
.md-chip--filter:not(:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"]))) {
  --md-comp-chip-pressed-state-layer-color: var(--md-sys-color-on-secondary-container);
}
.md-chip--filter:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"])) .md-chip__leading { width: var(--md-comp-chip-icon-size); margin-inline-end: 8px; }
.md-chip--filter:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"])) .md-chip__primary { padding-inline-start: 8px; }
.md-chip--filter:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"])) .md-chip__check { opacity: 1; scale: 1; }
.md-chip--filter:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"])) .md-chip__icon { opacity: 0; }
.md-chip--filter:not(.md-chip--elevated):has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"]):not(:disabled)):hover {
  --md-comp-chip-container-elevation: var(--md-sys-elevation-level1); }
.md-chip--input:has(> .md-chip__primary[aria-selected="true"]) { --md-comp-chip-leading-icon-color: var(--md-sys-color-primary); }
/* input leading icon: primary on hover/focus/pressed (unselected); dragged reverts */
.md-chip--input:is(:hover, :has(> :focus-visible), :has(> :active)) { --md-comp-chip-leading-icon-color: var(--md-sys-color-primary); }
.md-chip--input[data-dragging] { --md-comp-chip-leading-icon-color: var(--md-comp-chip-label-text-color);
  --md-comp-chip-trailing-icon-color: var(--md-sys-color-primary); }

/* disabled */
.md-chip:has(> .md-chip__primary:is(:disabled, [aria-disabled="true"])) {
  --md-comp-chip-label-text-color: color-mix(in srgb, var(--_disabled) 38%, transparent);
  --md-comp-chip-leading-icon-color: var(--md-comp-chip-label-text-color);
  --md-comp-chip-trailing-icon-color: var(--md-comp-chip-label-text-color);
  --md-comp-chip-outline-color: color-mix(in srgb, var(--_disabled) 12%, transparent);
  --md-comp-chip-container-elevation: var(--md-sys-elevation-level0);
  pointer-events: none;
}
.md-chip--elevated:has(> .md-chip__primary:disabled),
.md-chip:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"], [aria-selected="true"]):disabled) {
  --md-comp-chip-container-color: color-mix(in srgb, var(--_disabled) 12%, transparent);
}
.md-chip:has(> .md-chip__primary:disabled) .md-chip__avatar { opacity: .38; }

/* set */
.md-chip-set { display: flex; flex-wrap: wrap; gap: 8px; }
.md-chip-set--scroll { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; padding-block: 8px; } /* padding keeps the focus ring/shadow unclipped (derived) */
```
RTL: all spacing uses logical properties; trailing icon follows the end edge automatically. Directional icons (menu arrow) are not mirrored (symmetric).

### 10d. Motion
```css
.md-chip, .md-chip__outline, .md-chip__leading > *, .md-chip__state-layer {
  transition-property: background-color, color, border-color, box-shadow, opacity, scale;
  transition-duration: var(--md-sys-motion-spring-fast-effects-duration);       /* spring primitive, 150ms */
  transition-timing-function: var(--md-sys-motion-spring-fast-effects-easing);
}
.md-chip--filter .md-chip__leading, .md-chip--filter .md-chip__primary {
  transition: width var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
              margin var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
              padding var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
}
@media (prefers-reduced-motion: reduce) {
  .md-chip--filter .md-chip__leading, .md-chip--filter .md-chip__primary { transition: none; }
  .md-chip__check { scale: 1; }
}
```
Ripple primitive on `pointerdown` inside `.md-chip__state-layer` (static pressed layer under reduced motion).

### 10e. Forced colors
```css
@media (forced-colors: active) {
  .md-chip__outline { border: 1px solid ButtonText; }            /* also for elevated/selected chips */
  .md-chip__state-layer { display: none; }
  .md-chip { box-shadow: none; }
  .md-chip:has(> .md-chip__primary:is([aria-pressed="true"], [aria-checked="true"], [aria-selected="true"])) {
    forced-color-adjust: none; background: SelectedItem; color: SelectedItemText;
    --md-comp-chip-leading-icon-color: SelectedItemText; --md-comp-chip-trailing-icon-color: SelectedItemText; }
  .md-chip:has(> .md-chip__primary:disabled) { color: GrayText; }
  .md-chip:has(> .md-chip__primary:disabled) .md-chip__outline { border-color: GrayText; }
  .md-chip:has(> .md-chip__primary:focus-visible), .md-chip__trailing:focus-visible { outline-color: Highlight; }
  .md-chip svg { fill: currentColor; }
}
```

### 10f. Behaviour (JS)
- **Filter toggle:** primary `click` → flip `aria-pressed` (multi) / set `aria-checked="true"` and clear siblings (single, radiogroup); dispatch `change`. The checkmark/padding change is pure CSS.
- **Form participation (web mapping):** chips are not form controls; a chip set that must submit renders hidden `<input type="checkbox|radio" name value>` per chip (or uses `ElementInternals` in a custom element) kept in sync with the selected state.
- **Remove (input; removable filter):** trailing `click`, or `Delete`/`Backspace` on a focused primary → dispatch cancelable `remove`; if not prevented, remove the chip and move focus to the next chip, else the previous, else the associated text input.
- **Input field Backspace:** caret at position 0 of the text input → first Backspace focuses/selects the last chip, second removes it.
- **Roving tabindex in a set:** one chip primary has `tabindex="0"`, others `-1`; ArrowRight/ArrowLeft (swapped in RTL) and Home/End move focus (derived); in a grid, ArrowRight moves from a chip's primary to its remove button.
- **Menu chip:** toggles `aria-expanded`, opens the menu anchored to the chip (see menus.md); the selected menu item updates the chip label.
- **Drag (optional reorder):** on drag start set `[data-dragging]` on the chip (level4 + 0.16 layer); clear on drop; announce the new position via a live region.
- **Disabled:** use native `disabled` on buttons (removes from tab order). For `<a>` chips use `aria-disabled="true"` + `tabindex="-1"` and block `click`.

## 11. Source gaps & decisions

- Color-role diagrams for assist and suggestion chips still list **Outline**; tokens (and Aug 2024 update) use **outline-variant** → tokens win; `outline` is an opt-in high-contrast theme option.
- Filter pressed state-layer colors are swapped relative to other states in the tokens → implemented exactly as tokenized via `--md-comp-chip-pressed-state-layer-color`.
- Input chip leading icon: unselected enabled = `on-surface-variant`, but hover/focus/pressed = `primary`; dragged trailing icon = `primary` → implemented as tokenized even though inconsistent.
- No token for input-chip start padding when there is no leading element → 16px (matches other variants).
- Avatar shape: Specs table says "12dp corner radius" on a 24dp avatar, token says `corner.full` → same result; use `corner-full`.
- No tokens for the trailing action's own state layer/focus ring → it shares the chip state layer; it gets its own circular focus ring (outer offset) because it is a separate focusable element.
- Filter chip with a custom leading icon + selected: source unspecified → checkmark replaces the icon in place.
- Selection motion has no values (video only) → fast spatial for size/padding, fast effects for color/opacity/elevation.
- Web role in source is `gridcell` for all chips, which needs a grid container → used only for input-chip fields; standalone sets use group + `aria-pressed` (multi) or radiogroup + `role="radio"` (single).
- No Expressive changes (sizes, shape morph, springs) exist for chips in the source → no shape morph on press; corner stays 8px.
- Chip-set scroll edge treatment, Home/End keys and drag announcement are not in the source → derived as above.
