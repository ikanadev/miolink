# mioweb

Web client for miolink, a personal single-user link manager. SolidJS +
Vite, with a Material 3 Expressive component library built on Ark UI
(`@ark-ui/solid`) and plain CSS (CSS Modules). The link manager UI itself
isn't built yet; `App.tsx` shows the component gallery.

Read `../miobackend/CLAUDE.md` for the domain model and sync protocol, and
`../mioandroid/CLAUDE.md` for the client behavior the web app should match.

## Material 3

Components follow the Material 3 Expressive guidelines
(https://m3.material.io). Values that aren't verbatim from M3 (derived or
web mappings) say so in a comment.

## Commands

Run from `mioweb/` (pnpm):

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:3000 |
| `pnpm build` | Production build to `dist/` |
| `pnpm typecheck` | `tsc --noEmit` |

## Layout

```
src/
  index.tsx              imports styles/index.css, renders App
  App.tsx                the component gallery for now
  styles/
    index.css            fonts, token imports, document base (body = surface / on-surface, body-large)
    tokens/              M3 design tokens as CSS custom properties, on :root
      palette.css        md.ref.palette.* (baseline, source #6750a4)        M3 baseline values
      color.css          md.sys.color.* light/dark x standard/medium/high  M3 baseline values
      typography.css     md.ref.typeface.*, md.sys.typescale.* (baseline, emphasized, variable)
      shape.css, elevation.css, state.css, spacing.css, motion.css
  components/ui/
    shared/              interaction.module.css (state layer, focus ring, 48px target), Ripple.tsx
                         NavigationItem.tsx + navigation-item.module.css (nav bar/rail/drawer destination: pill,
                         state layer and ripple clipped to the indicator grid area, vertical/horizontal layouts,
                         badge or badge text, truncation), navigation-keys.ts (Arrow/Home/End between items)
    icon/                Icon (Material Symbols Outlined)
    buttons/             the 7 M3 button types, one folder each (button, icon-button, split-button,
                         button-group, fab, extended-fab, fab-menu), plus shared/:
      shared/            types.ts (ButtonSize, ButtonShape, FabColor), group-context.ts (ButtonGroup -> items),
                         button-base.module.css (Button + SplitButton sizes/colors), fab-base.module.css
                         (Fab, ExtendedFab, FabMenu host, elevation, enter/exit)
    loading-and-progress/  loading-indicator, linear-progress, circular-progress, plus shared/:
      shared/            motion.ts (easings, springs, reduced motion, shared rAF loop that pauses off screen),
                         progress.ts (value spring, wave amplitude, clocks), progress-base.module.css (colors, caps)
    <component>/         <Component>.tsx, <component>.module.css, index.ts
    index.ts             barrel export of every component
  gallery/
    Gallery.tsx          page with an app bar (theme and contrast switches) and one section per demo
    demos/<name>.demo.tsx  each exports `meta` ({ id, name }) and a default component; picked up by import.meta.glob
```

## Theming

- Every color is a `--md-sys-color-*` role defined with `light-dark()`, so
  the theme follows `color-scheme`: the OS preference by default,
  `data-theme="light" | "dark"` on `<html>` (or any subtree) to force one.
- Contrast: `data-contrast="standard" | "medium" | "high"`. Without it,
  `prefers-contrast: more` selects high.
- Motion: expressive by default; `data-motion-scheme="standard"` on any
  subtree. `prefers-reduced-motion` turns spatial springs into short
  non-overshooting curves inside `motion.css`, so components get it for free.
- `palette.css` and `color.css` hold M3's baseline scheme (source
  `#6750a4`). Replace them as a whole (a new source color or an M3 update)
  instead of tweaking single values.

## Component rules

- **Tokens only.** Components read `--md-sys-*` tokens, never `--md-ref-*`,
  hex values or `light-dark()`. Dark mode and contrast then work without
  component code.
- **No `--md-comp-*` variables.** M3 defines `md.comp.*` tokens, and
  its reference implementations read them as override hooks
  (`var(--md-comp-button-filled-container-color, var(--md-sys-color-primary))`).
  Don't copy that: write the value directly, a `--md-sys-*` token or a
  literal (`--_container-color: var(--md-sys-color-primary);`), so the CSS
  shows what's applied. One-off changes use `class`, inline `style` or a
  stronger selector. A parent that restyles a child component targets it
  (`.actions [data-color='text']:not(:disabled, ...) { --_label-color: ...; }`)
  instead of setting a variable on itself.
- **Private variables.** Values a component reuses or changes per state live
  in private variables that start with `--_`. State and variant rules change
  the `--_*` variables, and the properties use them once.
- **Variants and state as attributes.** Use `data-*` attributes on the root
  (`data-variant`, `data-size`, ...) and ARIA state (`aria-pressed`,
  `aria-selected`, `:disabled`) as selectors, not one class per variant. Ark
  parts already expose `data-scope`, `data-part` and `data-state`.
- **Interaction.** Interactive roots compose
  `interactive` (state layer on `::before`, focus ring on `:focus-visible`,
  disabled) and, for controls smaller than 48px, `target` (48px hit area on
  `::after`) from `shared/interaction.module.css`, and render `<Ripple />` as
  their first child for pressed feedback. The Ripple also sets
  `data-key-pressed` on its host during Space/Enter presses, so pressed
  shapes can use `:is(:active, [data-key-pressed])` (not `data-pressed`,
  which Ark's Toggle uses for "on"). The state layer and ripple use
  `--_state-layer-color`, which defaults to `currentColor` (the content
  color). Set `--_focus-ring-offset` to
  `var(--md-sys-state-focus-indicator-inner-offset)` for full-bleed items.
- **Disabled colors** use `color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)`
  (content) and the container opacity from the component's tokens. Don't
  lower the opacity of the whole element.
- **Typography.** Set all five properties of a typescale role (`font`,
  `weight`, `size`, `line-height`, `tracking`) from its tokens.
- **Motion.** Spatial springs (`--md-sys-motion-spring-*-spatial-{easing,duration}`)
  for size, position and corner radius; effects springs for color and
  opacity; the legacy easing/duration tokens for enter/exit transitions.
- **Elevation.** `box-shadow: var(--md-sys-elevation-levelN)` only where M3
  asks for a shadow; tonal surfaces are the default separation.
- **Icons** are `<Icon name="..." />` (Material Symbols ligatures, `filled`,
  `size`, `mirror` for directional glyphs). Parents can set `--md-icon-size`
  and `--md-icon-optical-size`.
- **Layout.** Logical properties (`padding-inline`, `inset-inline-start`,
  `border-start-start-radius`) so RTL works. px for spacing and sizes, rem
  (from the type tokens) for text.
- **Ark UI** provides behavior and accessibility: use its parts whenever the
  component has one (Dialog, Menu, Tooltip, Toast, Field, Toggle, Tabs,
  Switch, Checkbox, ...), style them with the `class` prop and their data
  attributes, and look up props, examples and data attributes through the
  Ark UI MCP server. Overlays render in a `Portal` and use
  `z-index: calc(1000 + var(--layer-index, 0))` on the content (see Ark's
  styling guide for positioner and backdrop).
- **Solid.** Split own props with `splitProps` and spread the rest on the
  root element. Merge `class` as `` local.class ? `${styles.root} ${local.class}` : styles.root ``.
  Don't destructure props. Resolve slot children with `children()` only when
  you need to inspect them.
- **Accessibility.** Native elements first; icon-only controls take a
  required `label` used as `aria-label`; follow M3's keyboard interactions for
  the component.
- **Exports.** `index.ts` in the component folder exports the component and
  its public types; `components/ui/index.ts` re-exports every folder.
- **Demo.** Each component has `src/gallery/demos/<name>.demo.tsx` showing
  its variants, states and disabled/selected cases.

## Implemented components

| Folder | Component | Ark UI |
| --- | --- | --- |
| `icon` | Icon | — |
| `buttons/button` | Button (elevated/filled/tonal/outlined/text; xsmall–xlarge; round/square; toggle; link; legacy padding) | Toggle |
| `buttons/icon-button` | IconButton (default, toggle; filled/tonal/outlined/standard; xsmall–xlarge; narrow/default/wide; round/square; link; optional tooltip) | Toggle |
| `buttons/split-button` | SplitButton (elevated/filled/tonal/outlined; xsmall–xlarge; label/icon/icon-only leading button; menu) | Menu |
| `buttons/button-group` | ButtonGroup (standard with press bounce, connected; size/shape for items; none/single/multi selection, required) | ToggleGroup |
| `buttons/fab` | Fab (3 sizes, 6 colors + surface, lowered, enter/exit via `visible`, tooltip) | — (uses `tooltip`) |
| `buttons/extended-fab` | ExtendedFab (4 sizes, colors, collapse to FAB with tooltip, `createExtendedOnScroll`, `visible`) | — (uses `tooltip`) |
| `buttons/fab-menu` | FabMenu, FabMenuItem (FAB morphs into the close button; primary/secondary/tertiary sets; disclosure) | — |
| `app-bar` | AppBar (small, medium flexible, large flexible, search; pinned/collapse/enter-always; the search variant renders `SearchBar` from the `search*` props, or hosts a `Search` through `search`) | — |
| `search` | Search (contained/divided; bar with leading search icon or nav button, up to two trailing icon buttons/avatar; focused view docked ≥600px with scrim, widening bar and clip-revealed results, or full screen with FLIP bar, sticky header, history entry; combobox input with `aria-activedescendant` over `ListItem` options (List's option mode), `SearchGroup` category labels and gaps, header slot for chips, empty state, polite status; Back, Clear, Escape clears highlight then closes, focus returns to the bar), SearchBar (trigger-only pill used by the search app bar) | Dialog (focused view) |
| `toolbar` | Toolbar, ToolbarAction, ToolbarFab, ToolbarDivider (docked 64px full width with even/center/edges layouts, or floating pill, horizontal/vertical, level3 or flat; standard/vibrant item colors applied to standard icon buttons and text buttons; FAB 8px after it, secondary/tertiary container, 56 → 80px on collapse; `role="toolbar"` roving tabindex with Arrow/Home/End, RTL, arrows left to text fields; trailing actions move into an overflow menu as they stop fitting, plus fixed `menu` items; hide or collapse on scroll, revealed by focus; `fixed` placement with safe-area insets) | Menu (overflow) |
| `text-field` | TextField (filled/outlined, floating label, icons, prefix/suffix, error, counter, multiline) | Field |
| `list` | List, ListItem, ListItemAvatar, ListItemImage, ListDivider (expressive/baseline, segmented, selection, expand; combobox option mode for `Search`) | Listbox, Collapsible |
| `card` | Card + CardAction (stretched link/button), media and text parts | — |
| `carousel` | Carousel, CarouselItem (multi-browse and hero with start/center alignment, laid out by the keyline engine in `keylines.ts`: items morph large/medium/small with scroll over a large-width visual (parallax), snap markers, hero one item per swipe; uncontained and uncontained multi-aspect (9:16–16:9) flow rows, free or snapping; full-screen vertical mandatory snap; link or button items with title/label/short label adapting to size over a scrim, outline, disabled (focusable), press radius morph; every item a tab stop announced "i of n", Arrow/Home/End, cross-axis arrows leave, focus scrolls the item to its snap position, RTL; mouse drag to scroll; `onIndexChange` on scrollend; reduced motion turns morphing layouts into same-size rows) | — (Ark's Carousel assumes flow-laid, same-size slides with its own snap points and controls; M3's masked keyline morph needs its own layout) |
| `checkbox` | Checkbox (unchecked/checked/indeterminate, error incl. `:user-invalid`, disabled, visible or hidden label), CheckboxGroup, CheckboxIcon (decorative box for rows that are the control, e.g. multi-select `ListItem`) | Checkbox |
| `chip` | AssistChip (icon, link), SuggestionChip, FilterChip (checkmark, remove or menu trailing), InputChip (icon/avatar, remove, Delete/Backspace), all flat/elevated, selected, disabled, dragged; ChipSet (wrap/scroll, none/single/multi selection, required, roving tabindex, focus moves after removal, strong outline / neutral icon options); InputChipField (chips typed into a field, Backspace select/remove, edit) | Toggle, TagsInput |
| `date-picker` | DatePicker (docked: outlined field(s) + 360px drop-down with month/year menu buttons replacing the grid with lists, prev/next month and year, outside days at 38%, Enter on a date commits; modal: dialog with header (supporting text, live headline, pencil/calendar mode switch), month + year menu opening a 3-column year grid, fixed 6-row grid with month slide; modal date input (`modal-input`, text fields in the dialog); range with a band, hover preview, full-screen vertically scrolling months below 600px (Save/close bar); pending selection committed by OK/Save, discarded by Cancel/Escape/outside; today outline vs selected fill, min/max and `isDateUnavailable`; locale names, digits, typed format (lenient parse on blur/Enter, no masks) and week start; ISO `string[]` value, hidden form inputs) | DatePicker (inline), Popover, Dialog |
| `time-picker` | TimePicker (modal dialog: dial with hour/minute time selector boxes (radios; Arrow Up/Down, typed digits, Left/Right), AM/PM period selector (native radios, vertical 52px or horizontal 216×38) and a 256px clock face (listbox of options with a roving tab stop; tap/drag with pointer capture, hour → minute auto-advance, 24h inner ring, handle angle on the shortest arc, two-tone label under the handle, between-label minute dot); vertical/horizontal/auto orientation from the viewport, falling back to the input picker alone; input picker with 96×72 numeric fields, auto-advance, error state, OK disabled while invalid; keyboard ↔ clock toggle; 12h/24h from the locale, localized AM/PM and digits; `minuteStep`, min/max at 38%; pending time committed by OK; optional field with lenient typed parsing; `HH:mm` value, hidden form input) | Dialog (Ark has no dial time picker) |
| `radio-button` | RadioGroup (vertical/horizontal, title, controlled/uncontrolled, required with `:user-invalid` error, error, disabled), RadioButton (visible or hidden label, error, disabled), RadioButtonIcon (decorative icon for rows that are the control, e.g. single-select `ListItem`) | RadioGroup |
| `switch` | Switch (selected/unselected, icons none/selected/both, handle morph 16/24/28px, disabled, label leading with supporting text, Enter toggles, form value), SwitchIcon (decorative track for rows that are the control, e.g. multi-select `ListItem`) | Switch |
| `slider` | Slider (standard/centered/range; xsmall–xlarge; horizontal/vertical; stops with end stops colored by segment and hidden under the handle; value indicator with formatter/aria-valuetext; inset icon for standard M–XL that moves past the handle, `iconMin` swap; 4→2px handle on press/focus with 6px gaps; Space + Arrows large step; disabled; form names) | Slider |
| `tabs` | Tabs, TabList, Tab, TabPanel (primary/secondary; label, icon, icon + label stacked or inline; small/large badges on the icon or after the label; fixed with start/center alignment from 600px, scrollable with 52px offset; FLIP indicator on the fast spatial spring; manual activation; disabled tab) | Tabs |
| `navigation-bar` | NavigationBar, NavigationBarItem (flexible 64px bar; vertical/horizontal/auto layout at 600px; links or buttons with `aria-current`; pill grows from the icon center, reduced pill on hover; filled/`activeIcon` when active, bold label; small/large badges; controlled/uncontrolled, reselect; hide on scroll, `fixed`; built on `shared/NavigationItem`) | — (native `<nav>`/`<ul>`, Tab navigation) |
| `navigation-rail` | NavigationRail, NavigationRailItem, NavigationRailSection (collapsed 96/narrow 80px with vertical items ↔ expanded 220–360px with horizontal items via the menu button, measured width animation with content reflow and label fade; modal expanded rail with scrim, growing from the collapsed width; hide-when-collapsed, standard or modal; FAB ↔ extended FAB; badges on the icon or after the label; hug/fill indicator; top/center alignment; divider, no fill; secondary destinations with subheads; links or buttons, Arrow/Home/End; built on `shared/NavigationItem`) | Dialog (modal) |
| `navigation-drawer` | NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection, NavigationDrawerDivider (legacy, the expanded rail replaces it; 360px sheet on the start edge with end corners, headline, header slot, subheads, full-width dividers; 56px full-width pill fading in place, label-large truncated with an ellipsis, badge text at the end, optional icons; standard permanent or dismissible with width animation and content reflow; modal with scrim sliding in/out on emphasized easing, swipe to dismiss, closes on selection, close reasons; links or buttons, Arrow/Home/End; RTL; built on `shared/NavigationItem`) | Dialog (modal) |
| `menu` | Menu.* (standard/vibrant, items, checkbox/radio, submenus, groups, context menu) | Menu |
| `tooltip` | Tooltip (plain), RichTooltip (subhead, actions, persistent) | Tooltip, Popover |
| `dialog` | Dialog.* (basic, full-screen with compact swap, busy, close reasons) | Dialog |
| `bottom-sheet` | BottomSheet.* (modal with scrim / standard; detents with drag to resize, swipe to dismiss; drag handle button cycling detents; headline, close (modal) or collapse (standard) at full height; busy, dismissible, minimized, close reasons) | Drawer |
| `side-sheet` | SideSheet.* (modal in a portal with scrim / standard in the layout flow, the main content shrinking as it opens; docked or detached; end or start side, RTL; header with optional back, headline, close always; scrolling body, `flush`; actions with divider; standard edge divider; width up to 400px; busy, dismissible, close reasons) | Dialog |
| `divider` | Divider (full-width/start inset/middle inset, horizontal/vertical, decorative or separator); `ListDivider` composes its styles | — |
| `snackbar` | `snackbar` / `createSnackbar` + `SnackbarHost` (action, close, queue, replace) | Toast |
| `badge` | Badge (small dot, large 1-4 chars with `max+`; on an icon or inline; scale in/out; `badgeAccessibleText`) | — |
| `loading-and-progress/loading-indicator` | LoadingIndicator (7-shape morph, contained, 24–240px, paused, reduced motion) | — |
| `loading-and-progress/linear-progress` | LinearProgress (determinate/indeterminate, flat/wavy, thickness, track, stop indicator) | — (own `role="progressbar"`) |
| `loading-and-progress/circular-progress` | CircularProgress (determinate/indeterminate, flat/wavy, 24–240px, thickness, track) | — (own `role="progressbar"`) |
