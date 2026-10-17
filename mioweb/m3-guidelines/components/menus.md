# Menus

> Source: https://m3.material.io/components/menus · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview

A menu shows a temporary set of actions or choices on a surface that appears in front of all other UI.

- **Use for:**
  - overflow menus
  - text-field dropdowns (exposed dropdown or select)
  - select menus
  - context menus, opened by secondary click (right-click, two-finger tap) or press-and-hold
  - menus opened from icon buttons, buttons, split buttons, filter chips, or selected text or images
- **Don't use for:** actions that must always be visible. Use a **toolbar** instead.
- A menu takes less space than a set of radio buttons or chips.
- **M3 Expressive update (Nov 2025):**
  - Adds **vertical menus**, which are recommended for new designs. They bring rounded shapes, **standard** (surface-based) and **vibrant** (tertiary-based) color styles, a filled and shape-morphed selected state, gap-based grouping, and shape-morph focus between submenus.
  - The **baseline menu** (`md.comp.menu`) remains available but lacks these features.
- **Compared with M2:** new color mappings and dynamic color. Dropdown and exposed dropdown menus are both simply "menu".

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| **Vertical menu** (Expressive) | Rounded container (16px), items with 4px / 12px corners, selected item filled | Recommended for new designs |
| **Menu (baseline)** | Square-ish container (4px radius), 48px items | Legacy. `md.comp.menu` tokens are referenced but not listed on the page. |
| Color: **Standard** | Surface-container-low container; selected item in tertiary-container | Lower emphasis, utilitarian |
| Color: **Vibrant** (Expressive only) | Tertiary-container container; selected item in tertiary | Higher emphasis; use sparingly |
| Layout: **Standard** | One continuous list | – |
| Layout: **Grouped** (Expressive only) | Items split into groups separated by a **gap** (2px), each group its own rounded segment | Max 1–2 gaps per menu. Don't use in scrollable menus. **Gaps are not currently available on web**, so use dividers on web. |
| Dividers | 1px line separating groups | Use for scrollable menus, text-field dropdowns, and on web |
| Submenus | Cascading menus opened from an item | Best on large screens. Not on Jetpack Compose. |
| Selection | none / single-select / multi-select | Multi-select menus stay open until dismissed |
| Horizontal menu (tokens only) | Pill-shaped (full-radius) horizontal container; text items or icon-only items | `md.comp.menus.horizontal.*` tokens exist, but the page has no guidance for them |
| Filtering (autocomplete) | Text field filters the item list | Items ease into their new positions |

## 3. Anatomy

Vertical menu:
1. **Menu item**: the interactive row.
2. **Leading icon** (optional): 20px.
3. **Menu item text**: the label.
4. **Trailing icon** (optional): 20px, e.g. a submenu arrow or checkmark.
5. **Badge** (optional).
6. **Trailing text** (optional): e.g. a keyboard shortcut.
7. **Container**: the menu surface.
8. **Supporting text** (optional): a second line under the label.
9. **Label text** (optional): a section label or header for a group.
10. **Gap** (optional): separates groups (Expressive).
11. **Divider** (optional).
12. Also: a state layer per item, a focus ring per item (inner), and an optional custom **slot** (image, progress indicator, color swatch).

Baseline menu: list item, leading icon, trailing icon, container, trailing text, divider.

## 4. Tokens & specs

### 4.1 Color

State-layer opacity: hover 0.08, focus 0.10, pressed 0.10. "Active" (an item whose submenu is open) uses 0.08.

Disabled content is shown at 0.38 opacity.

#### Standard (`md.comp.menus.standard`)
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | container.color | `--md-sys-color-surface-container-low` |
| Shadow | – | container.shadow-color | `--md-sys-color-shadow` |
| Section label text | – | section-label-text.color | `--md-sys-color-on-surface-variant` |
| Item container | enabled | menu-item.container.color | `--md-sys-color-surface-container-low` |
| Label text | enabled / hover / focus / pressed | menu-item.label-text.color | `--md-sys-color-on-surface` |
| Supporting text, trailing supporting text | enabled | menu-item.supporting-text.color, …trailing-supporting-text.color | `--md-sys-color-on-surface-variant` |
| Leading / trailing icon | enabled / hover / focus / pressed | menu-item.*-icon.color | `--md-sys-color-on-surface-variant` |
| State layer | hover / focus / pressed / active | menu-item.*.state-layer.color | `--md-sys-color-on-surface` |
| All content | disabled | menu-item.disabled.*.color @0.38 | `--md-sys-color-on-surface` |
| Item container | selected | menu-item.selected.container.color | `--md-sys-color-tertiary-container` |
| All content | selected (all states) | menu-item.selected.*.color | `--md-sys-color-on-tertiary-container` |
| State layer | selected hover / focus / pressed | menu-item.selected.*.state-layer.color | `--md-sys-color-on-tertiary-container` |
| Item container | selected + disabled | selected.disabled.container.color @0.38 | `--md-sys-color-tertiary-container` |
| Content | selected + disabled | selected.disabled.*.color @0.38 | `--md-sys-color-on-tertiary-container` |
| Icon button (in menu) | enabled | icon-button.container.color / icon.color | `--md-sys-color-surface-container-low` / `--md-sys-color-on-surface-variant` |
| Icon button | selected | icon-button.selected.container.color / icon.color | `--md-sys-color-tertiary-container` / `--md-sys-color-on-tertiary-container` |
| Focus ring | focus-visible | menus.menu-item.focus.indicator.color | `--md-sys-color-secondary` |

#### Vibrant (`md.comp.menus.vibrant`)
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container, item container | – | container.color, menu-item.color | `--md-sys-color-tertiary-container` |
| Section label, label, supporting, trailing supporting text | enabled / hover / focus / pressed | *.color | `--md-sys-color-on-tertiary-container` |
| Leading / trailing icon | enabled | menu-item.*-icon.color | `--md-sys-color-on-tertiary-container` |
| Leading / trailing icon | hover / focus / pressed | menu-item.{state}.*-icon.color | `--md-sys-color-tertiary` |
| State layer | hover / focus / pressed / active | menu-item.*.state-layer.color | `--md-sys-color-on-tertiary-container` |
| All content | disabled | menu-item.disabled.*.color @0.38 | `--md-sys-color-on-tertiary-container` |
| Item container | selected | menu-item.selected.container.color | `--md-sys-color-tertiary` |
| All content | selected | menu-item.selected.*.color | `--md-sys-color-on-tertiary` |
| State layer | selected hover / focus / pressed | menu-item.selected.*.state-layer.color | `--md-sys-color-on-tertiary` |
| Content | selected + disabled | selected.disabled.*.opacity | 0.38 (container opacity not specified) |
| Icon button | enabled / selected | icon-button.container.color / icon.color | tertiary-container / on-tertiary-container; selected: tertiary / on-tertiary |
| Focus ring | focus-visible | menus.menu-item.focus.indicator.color | `--md-sys-color-secondary` |

#### Baseline menu (from color diagram; tokens not listed)
- Label text: on-surface.
- Icons, trailing text, and supporting text: on-surface-variant.
- State layer: on-surface at 0.08.
- Container: surface-container.
- Selected item: surface-container-highest.
- Divider: outline-variant.

### 4.2 Size, layout & shape

**Vertical menu** (from `md.comp.menus` tokens)

| Attribute | Value |
| --- | --- |
| Item height | 44px (Specs page), at density 0 |
| Item padding top / bottom | 8px (`space100`) |
| Item padding start / end | 16px (`space200`) |
| Gap between elements in an item | 12px (`space150`) |
| Leading / trailing icon size | 20px |
| Container corner (active menu) | 16px (`--md-sys-shape-corner-large`) |
| Container corner (inactive menu, e.g. the parent while a submenu is focused) | 8px (`--md-sys-shape-corner-small`) |
| Group shape (grouped layout segments) | 8px (`--md-sys-shape-corner-small`) |
| Group padding | 2px (`space25`) |
| Gap between groups | 2px (`space25`) |
| Item corner (default) | 4px (`--md-sys-shape-corner-extra-small`) |
| First item corner | 12px (`--md-sys-shape-corner-medium`) on the outer (top) corners, 4px on the inner (bottom) corners |
| Last item corner | 12px on the outer (bottom) corners, 4px on the inner (top) corners |
| Selected item corner | 12px (`--md-sys-shape-corner-medium`) on all corners |
| Container width | not specified for vertical menus → 112px min, 280px max (derived: baseline values); width = widest item |
| Container padding (ungrouped) | 2px all sides (derived: `group.padding`; keeps 12px item corners nearly concentric with the 16px container) |
| Grouped layout | each group is its own surface: 2px padding, outer corners of the first/last group 16px (container shape), corners facing a gap 8px (`group.shape`); groups 2px apart (derived reading of `group.shape` vs `container.shape`) |
| Item min-height | 44px; 48px under `(pointer: coarse)` (derived, to meet the 48px target without overlapping targets) |
| Item content | leading icon 20px · 12px gap · text column (label + optional supporting text) grows · 12px gap · badge / trailing text / trailing icon 20px |
| Label overflow | label wraps (derived: menus are 280px max; Compose wraps labels) ; supporting text max 2 lines with ellipsis (derived) |
| Divider | 1px `outline-variant`, full width of the container, 8px margin top/bottom (derived: baseline divider spec) |
| Section label | 16px inline padding, 8px top / 4px bottom (derived); `on-surface-variant` (standard) / `on-tertiary-container` (vibrant) |
| Submenu offset | opens at the parent item's inline-end edge, 4px gap (derived: "without overlapping"); its first item aligns with the parent item (shift up by the 2px container padding) |
| Viewport margin | 8px minimum from window edges when flipping/clamping (derived) |
| Focus ring | 3px, inner offset −3px (drawn inside the item) |
| Min target | 48×48px (items, and any slot content) |

**Density (web only):** levels 0 to −3. Each step reduces the item's top and bottom padding. The page doesn't give the per-step values; a derived suggestion is −4px of height per step, following the general M3 density rule.

**Horizontal menu** (tokens only)

| Attribute | Value |
| --- | --- |
| Container shape | full (`--md-sys-shape-corner-full`) |
| Container padding top / bottom | 8px |
| Item padding start / end | 12px |
| Item padding top / bottom | 6px |
| Gap between elements in an item | 12px |
| Item shape on hover / focus / press | 12px (medium) |
| Selected item shape on hover / focus / press | full |
| Icon-only item padding (all sides) | 16px |
| Gap between icon-only items | 4px |
| Selected icon-only item shape | full |

**Baseline menu**

| Attribute | Value |
| --- | --- |
| Container width | 112px min, 280px max |
| Corner radius | 4px |
| Item height | 48px |
| Item padding start / end (with or without icon) | 12px |
| Gap between elements | 12px |
| Leading / trailing icon | 24px |
| Divider | 1px tall, dynamic width, 8px padding top and bottom |
| Label alignment | start, vertically centered |

### 4.3 Typography
| Text | Typescale |
| --- | --- |
| Menu item label | `md.sys.typescale.label-large` → `--md-sys-typescale-label-large-*` (14/20, weight 500, tracking 0.1) |
| Supporting text | `md.sys.typescale.body-small` → `--md-sys-typescale-body-small-*` (12/16, weight 400, tracking 0.4) |
| Trailing supporting text (e.g. shortcut) | `md.sys.typescale.label-large` |
| Section label text | not specified → **derived decision: `label-medium`** (`--md-sys-typescale-label-medium-*`; smaller than items so it reads as a header) |
| Badge | see badges.md (large badge, label-small) |

### 4.4 Elevation
- Container: `md.sys.elevation.level2` (3dp) → `--md-sys-elevation-level2`, using the shadow color `--md-sys-color-shadow`.
- Items don't change elevation by state.

### 4.5 Component token list

**`md.comp.menus` (common)**
```
container.elevation → md.sys.elevation.level2
container.shape → md.sys.shape.corner.large (16dp)
active.container.shape → md.sys.shape.corner.large
inactive.container.shape → md.sys.shape.corner.small (8dp)
gap → md.sys.measurement.space25 (2dp)
group.padding → md.sys.measurement.space25 (2dp)
group.shape → md.sys.shape.corner.small
menu-item.height → 44dp
menu-item.top-space → md.sys.measurement.space100 (8dp)
menu-item.bottom-space → md.sys.measurement.space100 (8dp)
menu-item.leading-space → md.sys.measurement.space200 (16dp)
menu-item.trailing-space → md.sys.measurement.space200 (16dp)
menu-item.between-space → md.sys.measurement.space150 (12dp)
menu-item.leading-icon.size → 20dp
menu-item.trailing-icon.size → 20dp
menu-item.shape → md.sys.shape.corner.extra-small (4dp)
menu-item.first-child.shape → md.sys.shape.corner.medium (12dp)
menu-item.first-child.inner-corner.corner-size → md.sys.shape.corner.extra-small
menu-item.last-child.shape → md.sys.shape.corner.medium
menu-item.last-child.inner-corner.corner-size → md.sys.shape.corner.extra-small
menu-item.selected.shape → md.sys.shape.corner.medium
menu-item.label-text.{font,line-height,size,tracking,weight} → md.sys.typescale.label-large.*
menu-item.supporting-text.{font,line-height,size,tracking,weight} → md.sys.typescale.body-small.*
menu-item.trailing-supporting-text.{font,line-height,size,tracking,weight} → md.sys.typescale.label-large.*
menu-item.focus.indicator.color → md.sys.color.secondary
menu-item.focus.indicator.thickness → md.sys.state.focus-indicator.thickness (3dp)
menu-item.focus.indicator.outline.offset → md.sys.state.focus-indicator.inner-offset (-3dp)
horizontal.container.shape → md.sys.shape.corner.full
horizontal.container.top-space → md.sys.measurement.space100 (8dp)
horizontal.container.bottom-space → md.sys.measurement.space100 (8dp)
horizontal.menu-item.leading-space → md.sys.measurement.space150 (12dp)
horizontal.menu-item.trailing-space → md.sys.measurement.space150 (12dp)
horizontal.menu-item.between-space → md.sys.measurement.space150 (12dp)
horizontal.menu-item.top-space → md.sys.measurement.space75 (6dp)
horizontal.menu-item.bottom-space → md.sys.measurement.space75 (6dp)
horizontal.menu-item.hovered|focused|pressed.shape → md.sys.shape.corner.medium
horizontal.menu-item.selected.hovered|focused|pressed.shape → md.sys.shape.corner.full
horizontal.icon-only.menu-item.{leading,trailing,top,bottom}-space → md.sys.measurement.space200 (16dp)
horizontal.icon-only.gap → md.sys.measurement.space50 (4dp)
horizontal.icon-only.menu-item.selected.shape → md.sys.shape.corner.full
```

**`md.comp.menus.standard`**
```
container.color → md.sys.color.surface-container-low
container.shadow-color → md.sys.color.shadow
section-label-text.color → md.sys.color.on-surface-variant
menu-item.container.color → md.sys.color.surface-container-low
menu-item.label-text.color → md.sys.color.on-surface
menu-item.supporting-text.color → md.sys.color.on-surface-variant
menu-item.trailing-supporting-text.color → md.sys.color.on-surface-variant
menu-item.leading-icon.color → md.sys.color.on-surface-variant
menu-item.trailing-icon.color → md.sys.color.on-surface-variant
icon-button.container.color → md.sys.color.surface-container-low
icon-button.icon.color → md.sys.color.on-surface-variant
menu-item.disabled.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-surface ; .opacity → 0.38
disabled.icon-button.icon.color → md.sys.color.on-surface
menu-item.hovered.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.hover.state-layer-opacity (0.08)
menu-item.focused.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.focus.state-layer-opacity (0.1)
menu-item.pressed.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.pressed.state-layer-opacity (0.1)
menu-item.active.state-layer.color → md.sys.color.on-surface ; opacity → md.sys.state.hover.state-layer-opacity (0.08)
menu-item.hovered|focused|pressed.label-text.color → md.sys.color.on-surface
menu-item.hovered|focused|pressed.{leading,trailing}-icon.color → md.sys.color.on-surface-variant
icon-button.hovered|focused|pressed.state-layer.color → md.sys.color.on-surface
menu-item.selected.container.color → md.sys.color.tertiary-container
menu-item.selected.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-tertiary-container
icon-button.selected.container.color → md.sys.color.tertiary-container
icon-button.selected.icon.color → md.sys.color.on-tertiary-container
menu-item.selected.disabled.container.color → md.sys.color.tertiary-container ; opacity → 0.38
menu-item.selected.disabled.{label-text,leading-icon,trailing-icon,trailing-supporting-text}.color → md.sys.color.on-tertiary-container ; opacity → 0.38
icon-button.disabled.icon.color → md.sys.color.on-tertiary-container
menu-item.selected.hovered|focused|pressed.state-layer.color → md.sys.color.on-tertiary-container (opacity 0.08 / 0.1 / 0.1)
menu-item.selected.hovered|focused|pressed.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-tertiary-container
icon-button.selected.hovered|focused|pressed.state-layer.color → md.sys.color.on-tertiary-container
```

**`md.comp.menus.vibrant`**
```
container.color → md.sys.color.tertiary-container
menu-item.color → md.sys.color.tertiary-container
section-label-text.color → md.sys.color.on-tertiary-container
menu-item.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-tertiary-container
icon-button.container.color → md.sys.color.tertiary-container
icon-button.icon.color → md.sys.color.on-tertiary-container
menu-item.disabled.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-tertiary-container ; .opacity → 0.38
icon-button.disabled.icon.color → md.sys.color.on-tertiary-container
menu-item.hovered.state-layer.color → md.sys.color.on-tertiary-container ; opacity 0.08
menu-item.focused.state-layer.color → md.sys.color.on-tertiary-container ; opacity 0.1
menu-item.pressed.state-layer.color → md.sys.color.on-tertiary-container ; opacity 0.1
menu-item.active.state-layer.color → md.sys.color.on-tertiary-container ; opacity 0.08 (hover opacity)
menu-item.hovered|focused|pressed.{label-text,supporting-text,trailing-supporting-text}.color → md.sys.color.on-tertiary-container
menu-item.hovered|focused|pressed.{leading,trailing}-icon.color → md.sys.color.tertiary
icon-button.hovered|focused|pressed.state-layer.color → md.sys.color.on-tertiary-container
menu-item.selected.container.color → md.sys.color.tertiary
menu-item.selected.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.color → md.sys.color.on-tertiary
icon-button.selected.container.color → md.sys.color.tertiary
icon-button.selected.icon.color → md.sys.color.on-tertiary
menu-item.selected.disabled.{label-text,supporting-text,trailing-supporting-text,leading-icon,trailing-icon}.opacity → 0.38
icon-button.selected.disabled.icon.color → md.sys.color.on-tertiary
menu-item.selected.hovered|focused|pressed.state-layer.color → md.sys.color.on-tertiary (opacity 0.08 / 0.1 / 0.1)
menu-item.selected.hovered|focused|pressed.label-text.color → md.sys.color.on-tertiary
```

**`md.comp.menu` (baseline):** the page references these tokens but doesn't list them. Use the baseline measurements and colors in §4.1 and §4.2.

## 5. States & interaction

- **Item states:** enabled, disabled, hovered, focused, pressed, **active** (the item whose submenu is open; it keeps a 0.08 state layer), and selected (combined with each of the others).
- **State layer:** fills the item's shape. Colors are listed in §4.1.
- **Focus ring:** 3px, `secondary`, drawn **inside** the item (−3px offset), so it is never clipped by the container.
- **Selected:**
  - The item fills (standard: tertiary-container; vibrant: tertiary) and its shape morphs to a 12px radius on all corners.
  - The default contrast between selected and unselected items is 3:1. Also add a checkmark as a non-color cue (recommended).
- **Disabled items:**
  - Content at 0.38 opacity.
  - They **can receive focus** but cannot be activated.
  - Keep conditionally unavailable items visible as disabled; don't remove them.
- **Dividers and gaps** are never focusable.
- **Shape morph between submenus:**
  - The focused (active) menu container uses a 16px radius.
  - Unfocused or inactive menus in the cascade morph to 8px.
  - The morph follows hover or keyboard focus as it moves across submenus.
- **Trigger element:**
  - Shows its pressed state while the menu is open, including when opened by keyboard.
  - Choosing an item doesn't change the trigger's icon.
- **Ripple:** shown on touch selection of an item.
- **Single-select:** selecting an item deselects the previous one, and the menu usually closes.
- **Multi-select:** the menu stays open until the user dismisses it.

## 6. Motion & behavior

- **Enter and exit:**
  - The menu expands from its trigger, linking the two visually.
  - The menu opens away from the screen edge: downward when the trigger is near the top, upward when it is near the bottom.
  - The page has no explicit durations or springs. Derived mapping (spring primitive):

| Animation | Property | Spring | CSS fallback |
| --- | --- | --- | --- |
| Enter: expand away from trigger | `clip-path` inset reveal along the block axis | default spatial | 0.38,1.21,0.22,1.00 · 500ms |
| Enter: fade | `opacity` 0→1 | fast effects | 150ms |
| Exit | `opacity` 1→0 (no clip) | fast effects | 150ms |
| Container corner morph (active ↔ inactive) | `border-radius` 16 ↔ 8px | fast spatial | 0.42,1.67,0.21,0.90 · 350ms |
| Item selected morph | item `border-radius` → 12px, background color | fast spatial / fast effects | 350ms / 150ms |
| State layer | `opacity` | fast effects | 150ms |
| Filter reflow | item `transform` (FLIP) | default spatial | 500ms |
| Submenu enter | same as menu, expanding along the inline axis | default spatial | 500ms |
- **Instant open:** in dense desktop products, menus may open instantly to reduce motion. This is also a good `prefers-reduced-motion` fallback.
- **Submenus:**
  - Open beside the parent item without overlapping it.
  - Have refined submenu motion with a container corner morph (16px ↔ 8px).
- **Filtering (autocomplete):** as the user types, remaining items ease into their new positions.
- **Scrolling:**
  - When items don't fit, the menu scrolls and shows a **persistent scrollbar**.
  - Gaps are not supported in scrolling menus; use dividers.
- **Placement and collision:**
  - The menu is positioned relative to the window edge and appears below, beside, or in front of its trigger.
  - If it would be cut off, reposition it to the left, right, or above the trigger.
  - A context menu appears at the pointer or next to the selection, and can open both above and below highlighted text.
- **Adaptive layout:**
  - In compact windows, consider a **bottom sheet** instead of the menu, since it has room for longer labels.
  - In medium and expanded windows, show the menu in context and use submenus for complex sets.

## 7. Usage guidelines

- **Color:** the standard style is the utilitarian default. Use the vibrant style sparingly, for emphasis.
- **Grouping:**
  - Group related items with a **gap** (more expressive) or a **divider** (subtler).
  - Gaps: keep the size fixed, use at most 1–2 per menu, and never use them in scrollable menus. Gaps aren't available on web.
  - Dividers: use them for scrollable menus, text-field dropdowns, and on web.
- **Item content:**
  - An item can have label text, a leading icon, a trailing icon, a badge, trailing text (keyboard shortcut), and supporting text.
  - Section label text can head a group.
- **Slots:**
  - An item can host simple custom content such as images, progress indicators, or color swatches.
  - Keep the item padding unchanged and targets at least 48×48px.
  - Slot content must follow menu interaction rules.
  - Never put buttons, switches, or other direct actions inside an item; each item performs one action.
- **Submenus:** place them to the side of the parent item. They are best on large screens.
- **Context menus:** open on secondary click or press-and-hold, and show actions related to the item.
- **Unavailable actions:** show them disabled rather than hiding them.

## 8. Accessibility

- **Use cases:** navigate to, open, and close a menu; navigate between and select items.
- **Roles (web mapping):**
  - Menu container: `role="menu"`, labelled by its trigger via `aria-labelledby`, plus `aria-orientation="vertical"` (or horizontal for a horizontal menu).
  - Item: `role="menuitem"`. Single-select items use `role="menuitemradio"` and multi-select items use `role="menuitemcheckbox"`, each with `aria-checked`.
  - Disabled item: `aria-disabled="true"`, which keeps it focusable.
  - Divider: `role="separator"`. Group: `role="group"` with `aria-label` from its section label.
  - Item with a submenu: `aria-haspopup="menu"` and `aria-expanded`.
  - Trigger button: `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`.
  - For a select or text-field dropdown, the APG combobox and listbox pattern (`role="listbox"` / `option`) is the alternative.
- **Labels:** the item's accessible name equals its visible text. Icons in an item are decorative (`aria-hidden="true"`).
- **Focus:**
  - On open, move focus to the **first item**. A selected item is a common web alternative (derived).
  - On close, return focus to the trigger (web mapping; the source says the destination depends on the app).
- **Closing:** the menu closes when the user selects an option (single-select), presses Escape, clicks or taps outside, or uses the system back action.
- **Keyboard:**

| Key | Action |
| --- | --- |
| Tab | Moves focus to the menu trigger or menu. Tab inside an open menu closes it and moves on (web mapping). |
| Space / Enter | Closed: opens the menu or submenu. Open: selects the focused item. |
| Up / Down arrows | Closed: opens the menu. Open: moves focus to the previous or next item (wrap is optional). |
| Left / Right arrows | Opens or closes a submenu (mirrored in RTL) |
| Letter keys | Moves focus to the next item starting with that letter (typeahead) |
| Escape | Closes the menu (a submenu closes first, one level at a time) |
| Home / End | First / last item (web mapping) |

- **Selection cues:** use shape, color (3:1), **and** an icon such as a checkmark.
- **Targets:** at least 48×48px. At density 0 an item is 44px tall, so extend its touch target to 48px where touch input is expected (derived).

## 9. Implementation checklist

- [ ] Menu element properties:
  - `open`
  - `anchor` (element or id), or `positioning: anchor | popover | fixed | pointer` for context menus
  - `placement` with auto-flip
  - `color: standard | vibrant`
  - `variant: vertical | baseline`
  - `selection: none | single | multi`
  - `stay-open-on-select`
  - `density: 0 … -3`
  - `instant` (no animation)
  - `has-submenu`
- [ ] Menu item properties:
  - `type: menuitem | radio | checkbox`, `selected`, `disabled`, `href`
  - `keep-open`
  - slots: `leading`, `headline`/label, `supporting-text`, `trailing-text`, `trailing`/icon, `badge`
  - `typeahead-text`
- [ ] Also needed: a submenu item (opens on hover after a delay, or on Right/Enter), a divider, a group with a section label, and a gap (non-web only).
- [ ] Events: `open`, `opened`, `close` (with reason: selection, escape, outside, focusout), `closed`, item `select`/`action`.
- [ ] Render in the top layer (Popover API or a portal) above all UI. Use collision detection and flipping, and clamp the max-height to the viewport, enabling scroll and a persistent scrollbar.
- [ ] Container: 16px radius when active, 8px when inactive in a cascade, level2 elevation, 2px padding (group padding).
- [ ] Item corners: 4px by default; the first item has 12px top corners, the last item has 12px bottom corners; the selected item is 12px all round. Animate the corner morph.
- [ ] Grouped layout: each group is its own 8px-radius segment, 2px apart. Use a divider fallback on web.
- [ ] Roving focus (focus or `aria-activedescendant`), typeahead, disabled items that stay focusable but inert, and dividers that are not focusable.
- [ ] Trigger reflects the open state (pressed visual and `aria-expanded`); return focus on close.
- [ ] Autocomplete mode: a text field filters items and animates their reflow.
- [ ] Compact window: allow the host to swap the menu for a bottom sheet.
- [ ] Respect `prefers-reduced-motion` by opening instantly.

## 10. HTML/CSS implementation blueprint

### 10a. DOM skeleton
Top layer via the Popover API (`popover="auto"`: light dismiss + Escape for free); anchoring via CSS anchor positioning with a JS fallback.

```html
<button class="md-icon-button" id="more-btn" aria-haspopup="menu" aria-expanded="false"
        aria-controls="more-menu" popovertarget="more-menu" style="anchor-name: --more-btn">…</button>

<div id="more-menu" class="md-menu md-menu--standard" popover="auto"
     role="menu" aria-labelledby="more-btn" aria-orientation="vertical" style="position-anchor: --more-btn">

  <div class="md-menu__item" role="menuitem" tabindex="-1" aria-keyshortcuts="Control+P">
    <span class="md-menu__state-layer" aria-hidden="true"></span>         <!-- state layer + ripple primitives -->
    <svg class="md-menu__leading" aria-hidden="true">…</svg>
    <span class="md-menu__text">
      <span class="md-menu__label">Preview</span>
      <span class="md-menu__supporting">Opens in a new tab</span>
    </span>
    <span class="md-menu__trailing-text" aria-hidden="true">Ctrl+P</span> <!-- exposed via aria-keyshortcuts -->
  </div>

  <div class="md-menu__divider" role="separator"></div>

  <div class="md-menu__group" role="group" aria-labelledby="sec-sp">
    <div class="md-menu__section-label" id="sec-sp" role="presentation">Line spacing</div>
    <div class="md-menu__item" role="menuitemradio" aria-checked="true" tabindex="-1">
      <span class="md-menu__state-layer" aria-hidden="true"></span>
      <svg class="md-menu__leading md-menu__check" aria-hidden="true">…check…</svg>
      <span class="md-menu__text"><span class="md-menu__label">Single</span></span>
    </div>
    <div class="md-menu__item" role="menuitem" aria-disabled="true" tabindex="-1">…Redo…</div>
  </div>

  <!-- submenu item: the nested popover lives INSIDE the parent menu so popover=auto keeps the parent open -->
  <div class="md-menu__item" role="menuitem" tabindex="-1" aria-haspopup="menu" aria-expanded="false"
       aria-controls="sub-1" style="anchor-name: --sub-1-anchor">
    <span class="md-menu__state-layer" aria-hidden="true"></span>
    <span class="md-menu__text"><span class="md-menu__label">Custom</span></span>
    <svg class="md-menu__trailing" aria-hidden="true">…arrow_right…</svg>
    <div id="sub-1" class="md-menu md-menu--submenu" popover="auto" role="menu" aria-label="Custom"
         style="position-anchor: --sub-1-anchor">…items…</div>
  </div>
</div>
```
- Select / text-field dropdown: same visuals, but use the combobox + `role="listbox"` / `role="option"` + `aria-selected` pattern (focus stays in the field; `aria-activedescendant`).
- Slot content (image, swatch, progress) goes in `.md-menu__leading` or a `.md-menu__slot` cell; never a nested interactive control.

### 10b. Custom properties
```css
.md-menu {
  /* md.comp.menus (common) */
  --md-comp-menus-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-menus-inactive-container-shape: var(--md-sys-shape-corner-small);
  --md-comp-menus-container-elevation: var(--md-sys-elevation-level2);
  --md-comp-menus-gap: 2px;                                   /* space25 */
  --md-comp-menus-group-padding: 2px;                         /* space25 */
  --md-comp-menus-group-shape: var(--md-sys-shape-corner-small);
  --md-comp-menus-menu-item-height: 44px;
  --md-comp-menus-menu-item-top-space: 8px;                   /* space100 */
  --md-comp-menus-menu-item-bottom-space: 8px;
  --md-comp-menus-menu-item-leading-space: 16px;              /* space200 */
  --md-comp-menus-menu-item-trailing-space: 16px;
  --md-comp-menus-menu-item-between-space: 12px;              /* space150 */
  --md-comp-menus-menu-item-icon-size: 20px;
  --md-comp-menus-menu-item-shape: var(--md-sys-shape-corner-extra-small);
  --md-comp-menus-menu-item-first-last-shape: var(--md-sys-shape-corner-medium);
  --md-comp-menus-menu-item-selected-shape: var(--md-sys-shape-corner-medium);
  --md-comp-menus-focus-indicator-color: var(--md-sys-color-secondary);
  --md-comp-menus-focus-indicator-thickness: var(--md-sys-state-focus-indicator-thickness);
  --md-comp-menus-focus-indicator-offset: var(--md-sys-state-focus-indicator-inner-offset);
  --md-menu-density: 0;                                       /* 0 … -3, web only */
}
.md-menu--standard {   /* md.comp.menus.standard */
  --md-comp-menus-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-menus-section-label-color: var(--md-sys-color-on-surface-variant);
  --md-comp-menus-label-color: var(--md-sys-color-on-surface);
  --md-comp-menus-supporting-color: var(--md-sys-color-on-surface-variant);
  --md-comp-menus-icon-color: var(--md-sys-color-on-surface-variant);
  --md-comp-menus-interactive-icon-color: var(--md-sys-color-on-surface-variant);  /* hovered/focused/pressed */
  --md-comp-menus-state-layer-color: var(--md-sys-color-on-surface);
  --md-comp-menus-disabled-color: var(--md-sys-color-on-surface);
  --md-comp-menus-selected-container-color: var(--md-sys-color-tertiary-container);
  --md-comp-menus-selected-content-color: var(--md-sys-color-on-tertiary-container);
}
.md-menu--vibrant {    /* md.comp.menus.vibrant */
  --md-comp-menus-container-color: var(--md-sys-color-tertiary-container);
  --md-comp-menus-section-label-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-label-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-supporting-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-icon-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-interactive-icon-color: var(--md-sys-color-tertiary);
  --md-comp-menus-state-layer-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-disabled-color: var(--md-sys-color-on-tertiary-container);
  --md-comp-menus-selected-container-color: var(--md-sys-color-tertiary);
  --md-comp-menus-selected-content-color: var(--md-sys-color-on-tertiary);
}
```
A submenu inherits the color style of its parent unless it sets its own class.

### 10c. Layout, positioning and state selectors
```css
.md-menu {
  /* popover UA reset */
  margin: 0; border: 0; inset: auto; overflow: hidden auto; overscroll-behavior: contain;
  box-sizing: border-box; min-inline-size: 112px; max-inline-size: 280px;
  padding: var(--md-comp-menus-group-padding);
  border-radius: var(--md-comp-menus-container-shape);
  background: var(--md-comp-menus-container-color);
  box-shadow: var(--md-comp-menus-container-elevation);          /* elevation primitive */
  color: var(--md-comp-menus-label-color);
  scrollbar-gutter: stable;                                      /* persistent scrollbar space */
  /* anchoring */
  position: fixed;
  position-area: block-end span-inline-end;                      /* below, aligned to trigger start */
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  position-try-order: most-block-size;
  max-block-size: calc(100% - 8px);                              /* % of the position-area: fits available space */
}
.md-menu--submenu { position-area: inline-end span-block-end; margin-inline-start: 4px; margin-block-start: calc(-1 * var(--md-comp-menus-group-padding));
  position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline; }
.md-menu[data-context] { position-area: none; inset-inline-start: var(--x); inset-block-start: var(--y); } /* pointer-anchored (JS clamps) */
.md-menu[data-inactive] { border-radius: var(--md-comp-menus-inactive-container-shape); }

.md-menu__item {
  position: relative; isolation: isolate; box-sizing: border-box; cursor: pointer; outline: none;
  display: flex; align-items: center; gap: var(--md-comp-menus-menu-item-between-space);
  min-block-size: calc(var(--md-comp-menus-menu-item-height) + var(--md-menu-density) * 4px);
  padding-block: calc(var(--md-comp-menus-menu-item-top-space) + var(--md-menu-density) * 2px)
                 calc(var(--md-comp-menus-menu-item-bottom-space) + var(--md-menu-density) * 2px);
  padding-inline: var(--md-comp-menus-menu-item-leading-space) var(--md-comp-menus-menu-item-trailing-space);
  border-radius: var(--md-comp-menus-menu-item-shape);
  color: var(--md-comp-menus-label-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}
@media (pointer: coarse) { .md-menu__item { min-block-size: 48px; } }
/* first/last item corners (outer 12px, inner 4px) — per menu, or per group when grouped */
:is(.md-menu, .md-menu__group) > .md-menu__item:nth-child(1 of .md-menu__item) {
  border-start-start-radius: var(--md-comp-menus-menu-item-first-last-shape); border-start-end-radius: var(--md-comp-menus-menu-item-first-last-shape); }
:is(.md-menu, .md-menu__group) > .md-menu__item:nth-last-child(1 of .md-menu__item) {
  border-end-start-radius: var(--md-comp-menus-menu-item-first-last-shape); border-end-end-radius: var(--md-comp-menus-menu-item-first-last-shape); }
.md-menu__state-layer { position: absolute; inset: 0; z-index: -1; border-radius: inherit; overflow: hidden; pointer-events: none;
  background: var(--md-comp-menus-state-layer-color); opacity: 0; }   /* state layer primitive */
.md-menu__leading, .md-menu__trailing { flex: none; inline-size: var(--md-comp-menus-menu-item-icon-size); block-size: var(--md-comp-menus-menu-item-icon-size);
  color: var(--md-comp-menus-icon-color); fill: currentColor; }
.md-menu__text { flex: 1; min-inline-size: 0; display: flex; flex-direction: column; }
.md-menu__supporting { color: var(--md-comp-menus-supporting-color);
  font: var(--md-sys-typescale-body-small-weight) var(--md-sys-typescale-body-small-size)/var(--md-sys-typescale-body-small-line-height) var(--md-sys-typescale-body-small-font);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.md-menu__trailing-text { flex: none; color: var(--md-comp-menus-supporting-color); }  /* label-large inherited */
.md-menu__divider { block-size: 1px; margin-block: 8px; background: var(--md-sys-color-outline-variant); }
.md-menu__section-label { padding: 8px 16px 4px; color: var(--md-comp-menus-section-label-color);
  font: var(--md-sys-typescale-label-medium-weight) var(--md-sys-typescale-label-medium-size)/var(--md-sys-typescale-label-medium-line-height) var(--md-sys-typescale-label-medium-font);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking); }
/* grouped (gap) layout: container becomes transparent; each group is a surface */
.md-menu--grouped { background: none; box-shadow: none; padding: 0; overflow: visible; display: flex; flex-direction: column; gap: var(--md-comp-menus-gap); }
.md-menu--grouped > .md-menu__group { padding: var(--md-comp-menus-group-padding); background: var(--md-comp-menus-container-color);
  box-shadow: var(--md-comp-menus-container-elevation); border-radius: var(--md-comp-menus-group-shape); }
.md-menu--grouped > .md-menu__group:first-child { border-start-start-radius: var(--md-comp-menus-container-shape); border-start-end-radius: var(--md-comp-menus-container-shape); }
.md-menu--grouped > .md-menu__group:last-child  { border-end-start-radius: var(--md-comp-menus-container-shape); border-end-end-radius: var(--md-comp-menus-container-shape); }

/* states */
@media (hover: hover) { .md-menu__item:not([aria-disabled="true"]):hover > .md-menu__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); } }
.md-menu__item[aria-expanded="true"] > .md-menu__state-layer { opacity: var(--md-sys-state-hover-state-layer-opacity); }   /* active */
.md-menu__item:focus-visible > .md-menu__state-layer { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-menu__item:not([aria-disabled="true"]):active > .md-menu__state-layer { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-menu__item:not([aria-disabled="true"]):is(:hover, :focus-visible, :active) { --md-comp-menus-icon-color: var(--md-comp-menus-interactive-icon-color); }
.md-menu__item:focus-visible {                                  /* focus ring primitive, inner offset */
  outline: var(--md-comp-menus-focus-indicator-thickness) solid var(--md-comp-menus-focus-indicator-color);
  outline-offset: var(--md-comp-menus-focus-indicator-offset); }
.md-menu__item:is([aria-checked="true"], [aria-selected="true"]) {
  border-radius: var(--md-comp-menus-menu-item-selected-shape);
  background: var(--md-comp-menus-selected-container-color);
  --md-comp-menus-label-color: var(--md-comp-menus-selected-content-color);
  --md-comp-menus-supporting-color: var(--md-comp-menus-selected-content-color);
  --md-comp-menus-icon-color: var(--md-comp-menus-selected-content-color);
  --md-comp-menus-interactive-icon-color: var(--md-comp-menus-selected-content-color);
  --md-comp-menus-state-layer-color: var(--md-comp-menus-selected-content-color);
}
.md-menu__item:not([aria-checked="true"], [aria-selected="true"]) > .md-menu__check { visibility: hidden; }  /* reserve space (derived) */
.md-menu__item[aria-disabled="true"] { cursor: default;
  --md-comp-menus-label-color: color-mix(in srgb, var(--md-comp-menus-disabled-color) 38%, transparent);
  --md-comp-menus-supporting-color: var(--md-comp-menus-label-color);
  --md-comp-menus-icon-color: var(--md-comp-menus-label-color); }
.md-menu__item[aria-disabled="true"]:is([aria-checked="true"], [aria-selected="true"]) {
  --md-comp-menus-label-color: color-mix(in srgb, var(--md-comp-menus-selected-content-color) 38%, transparent);
  background: color-mix(in srgb, var(--md-comp-menus-selected-container-color) 38%, transparent); }
```
RTL: logical properties throughout; `position-area: … span-inline-end` and the submenu `inline-end` mirror automatically; mirror the submenu arrow icon (`.md-menu__trailing:dir(rtl) { scale: -1 1; }`).

### 10d. Motion
```css
.md-menu {
  transition:
    opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    clip-path var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing),
    border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    display var(--md-sys-motion-spring-fast-effects-duration) allow-discrete,
    overlay var(--md-sys-motion-spring-fast-effects-duration) allow-discrete;
  clip-path: inset(-24px);                                  /* open: unclipped incl. shadow */
}
@starting-style {
  .md-menu:popover-open { opacity: 0; clip-path: inset(-24px -24px 100% -24px); }           /* grows downward */
  .md-menu[data-placement="top"]:popover-open { clip-path: inset(100% -24px -24px -24px); } /* grows upward */
  .md-menu--submenu:popover-open { clip-path: inset(-24px 100% -24px -24px); }              /* grows toward inline-end (LTR) */
}
.md-menu:not(:popover-open) { opacity: 0; clip-path: inset(-24px); }   /* exit: fade only, shorter than enter */
.md-menu__item { transition: border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
  background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-menu__state-layer { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-menu[data-instant], .md-menu[data-instant] * { transition: none; }   /* dense desktop products */
@media (prefers-reduced-motion: reduce) {
  .md-menu { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear, display 0s allow-discrete, overlay 0s allow-discrete; clip-path: none; }
  @starting-style { .md-menu:popover-open { clip-path: none; } }
  .md-menu__item { transition: background-color var(--md-sys-motion-spring-fast-effects-duration) linear; }
}
```
`data-placement` is set by JS after opening (compare menu and anchor rects) because CSS cannot yet read which fallback was used everywhere (`@container anchored(fallback: …)` where supported).

### 10e. Forced colors
```css
@media (forced-colors: active) {
  .md-menu, .md-menu--grouped > .md-menu__group { border: 1px solid CanvasText; box-shadow: none; }
  .md-menu--grouped { border: 0; }
  .md-menu__state-layer { display: none; }
  .md-menu__item:hover, .md-menu__item[aria-expanded="true"] { outline: 1px solid Highlight; outline-offset: -1px; }
  .md-menu__item:focus-visible { outline-color: Highlight; }
  .md-menu__item:is([aria-checked="true"], [aria-selected="true"]) { forced-color-adjust: none; background: SelectedItem; color: SelectedItemText;
    --md-comp-menus-icon-color: SelectedItemText; --md-comp-menus-supporting-color: SelectedItemText; --md-comp-menus-label-color: SelectedItemText; }
  .md-menu__item[aria-disabled="true"] { color: GrayText; --md-comp-menus-icon-color: GrayText; }
  .md-menu__divider { background: CanvasText; }
}
```

### 10f. Behaviour (JS)
- **Open:** trigger click / Enter / Space / ArrowDown (ArrowUp → focus last item, web mapping) → `showPopover()`; set trigger `aria-expanded="true"` and keep its pressed visual (`[aria-expanded="true"]` → pressed state layer); focus the first item (roving `tabindex`: focused item `0`, others `-1`; disabled items stay focusable).
- **Anchoring fallback** when `CSS.supports('anchor-name: --a')` is false: on open, `scroll`, and `resize` (rAF-throttled) compute `trigger.getBoundingClientRect()`; place below-start; if `bottom > innerHeight - 8` and more space above → place above (`data-placement="top"`); if `right > innerWidth - 8` → align to trigger end; clamp to an 8px viewport margin; set `max-height` to the available space. Submenus: try inline-end of the parent item, else inline-start. Context menus: place at `clientX/clientY` (or selection rect), same flip/clamp.
- **Keyboard (open menu):** ArrowDown/ArrowUp next/previous item (wrap), Home/End first/last, typeahead (buffer letters for 500ms, match label start, skip dividers), Enter/Space activate, ArrowRight (ArrowLeft in RTL) opens a submenu and focuses its first item, ArrowLeft (ArrowRight in RTL) / Escape closes the submenu and refocuses its parent item, Escape on the root menu closes it, Tab closes the whole cascade and lets focus move on.
- **Activation:** `menuitem` → dispatch `select`, close the cascade (unless `keep-open`). `menuitemradio` → set `aria-checked` on it, clear siblings in its group, close. `menuitemcheckbox` → toggle, stay open (multi-select). Disabled items ignore activation.
- **Submenus by pointer:** open after 300ms hover intent, close siblings; keep open while the pointer travels toward the submenu (safe triangle or 300ms grace) (derived). The menu containing hover/focus has no `data-inactive`; all other menus in the cascade get `data-inactive` (16px ↔ 8px morph).
- **Close:** light dismiss (`popover=auto`), Escape, selection, Tab, `toggle` event → set trigger `aria-expanded="false"`; return focus to the trigger (web mapping) unless closing via Tab/outside click.
- **Filtering (autocomplete):** filter items on `input`, animate survivors with FLIP (record rects → update DOM → invert with `transform` → play with the default spatial spring); `aria-activedescendant` from the field.
- **Compact windows (<600px):** host may render the same item model inside a bottom sheet instead (see sheets/bottom-sheets.md).
- **Ripple primitive** on touch `pointerdown` of an item.

## 11. Source gaps & decisions

- No vertical-menu container width → 112–280px from the baseline spec.
- No container padding token for ungrouped menus → 2px (`group.padding`); grouped menus: each group is a surface with 16px outer / 8px gap-facing corners.
- "Gaps are not currently available on web" refers to Google's web libraries → this library supports `.md-menu--grouped` but defaults to dividers; gaps are disallowed in scrollable menus.
- Divider measurements only exist for the baseline menu → reused (1px, 8px block margin, `outline-variant`).
- Section label typography/padding not specified → label-medium, 8/16/4px padding.
- Density levels 0…−3 have no values → −2px block padding per side per step (−4px height).
- 44px item height is below the 48px target → items become 48px under `(pointer: coarse)`; no overlapping pseudo-element targets.
- Vibrant selected+disabled container has no token (standard uses tertiary-container @0.38) → apply the same 38% recipe to `tertiary`.
- Vibrant selected+hover/focus/pressed only tokenize the label → all selected content stays `on-tertiary`.
- Standard has `disabled.icon-button.icon.color` (on-surface) and `icon-button.disabled.icon.color` (on-tertiary-container, listed under selected-disabled) → kept as two tokens (unselected vs selected disabled); `icon-button.*` tokens style icon-only items (horizontal menus) and are not used by vertical items.
- Horizontal menu tokens exist without guidance → documented in §4.2 only; no blueprint (out of scope until guidance exists).
- No enter/exit timings → clip reveal on default spatial + fast effects fade; exit fade only; instant mode for dense desktop and reduced motion.
- Checkmark position for selected items not specified → leading slot (space reserved in selectable groups).
- Focus destination after close "depends on the app" → return to trigger by default.
- Submenu hover delay and gap not specified → 300ms intent/grace, 4px gap.
- Baseline `md.comp.menu` tokens referenced but not listed → baseline built from the measurement table + color-role diagram in §4.1/4.2.
