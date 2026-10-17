# Material 3 Expressive — implementation guidelines (framework-agnostic)

Markdown specs for building a Material 3 Expressive web component library in any framework. Source: m3.material.io (Foundations, Styles, Components — Overview/Specs/Guidelines/Accessibility tabs) and the official M3 token database, content version 2026-10-13.

## Start here

- [guidelines.md](guidelines.md) — cross-component foundations: token architecture & CSS custom-property naming, color system and roles (light/dark, standard/medium/high contrast values), typography (baseline + emphasized type scale), shape scale & morphing, elevation, icons, spacing, motion (springs, easing, durations), interaction states & focus ring, layout/breakpoints, accessibility, and the full system token reference.

## Components

Every component file follows the same structure: 1 Overview · 2 Variants & configurations · 3 Anatomy · 4 Tokens & specs (color, size/shape, typography, elevation, full `md.comp.*` token list) · 5 States & interaction · 6 Motion & behavior · 7 Usage guidelines · 8 Accessibility · 9 Implementation checklist · **10 HTML/CSS implementation blueprint** (DOM skeleton, component custom properties, state selectors, motion, forced-colors, JS responsibilities) · **11 Source gaps & decisions** (conflicts/omissions in m3.material.io and the decision taken).

Component blueprints build on the **Shared implementation primitives** section of `guidelines.md` (host anatomy, state layer, focus ring, ripple, touch target, elevation, springs, shape morph, disabled, typography, scrim/modal layer, RTL, forced-colors, reduced-motion, theming). Every `md.sys.*` token referenced by a component is validated against the official token database and documented with its value in `guidelines.md`.

The `components/` folder mirrors the m3.material.io navigation: grouped components (Buttons, Date & time pickers, Loading & progress, Navigation, Sheets) live in their own folder, with a `README.md` group overview explaining how to choose between them.

- [App bars](components/app-bars.md)
- [Badges](components/badges.md)
- **Buttons/** — [group overview](components/buttons/README.md)
  - [Buttons](components/buttons/buttons.md)
  - [Button groups](components/buttons/button-groups.md)
  - [Extended FAB](components/buttons/extended-fab.md)
  - [FAB menu](components/buttons/fab-menu.md)
  - [FAB (Floating action button)](components/buttons/floating-action-button.md)
  - [Icon buttons](components/buttons/icon-buttons.md)
  - [Segmented buttons](components/buttons/segmented-buttons.md)
  - [Split button](components/buttons/split-button.md)
- [Cards](components/cards.md)
- [Carousel](components/carousel.md)
- [Checkbox](components/checkbox.md)
- [Chips](components/chips.md)
- **Date & time pickers/** — [group overview](components/date-and-time-pickers/README.md)
  - [Date pickers](components/date-and-time-pickers/date-pickers.md)
  - [Time pickers](components/date-and-time-pickers/time-pickers.md)
- [Dialogs](components/dialogs.md)
- [Divider](components/divider.md)
- [Lists](components/lists.md)
- **Loading & progress/** — [group overview](components/loading-and-progress/README.md)
  - [Loading indicator](components/loading-and-progress/loading-indicator.md)
  - [Progress indicators](components/loading-and-progress/progress-indicators.md)
- [Menus](components/menus.md)
- **Navigation/** — [group overview](components/navigation/README.md)
  - [Navigation bar](components/navigation/navigation-bar.md)
  - [Navigation drawer](components/navigation/navigation-drawer.md)
  - [Navigation rail](components/navigation/navigation-rail.md)
- [Radio button](components/radio-button.md)
- [Search](components/search.md)
- **Sheets/** — [group overview](components/sheets/README.md)
  - [Bottom sheets](components/sheets/bottom-sheets.md)
  - [Side sheets](components/sheets/side-sheets.md)
- [Sliders](components/sliders.md)
- [Snackbar](components/snackbar.md)
- [Switch](components/switch.md)
- [Tabs](components/tabs.md)
- [Text fields](components/text-fields.md)
- [Toolbars](components/toolbars.md)
- [Tooltips](components/tooltips.md)

## Conventions

- `md.sys.color.primary` → `--md-sys-color-primary`; `md.comp.<component>.<part>.<property>` → `--md-comp-<component>-<part>-<property>`.
- `dp` → `px`. Token values shown in component files are for the baseline light scheme; the theme switches them through the `--md-sys-*` layer.
- Notes marked **derived**, **(implementation suggestion)** or **(web mapping)** are not stated verbatim in the source; review them. Values marked **[Compose]** (loading/progress motion) come from the Jetpack Compose Material 3 implementation, since the web spec gives no timings. Conflicts found in the source (e.g. token vs. diagram mismatches) are called out inline in each file.
- Deprecated in M3 Expressive: segmented buttons (use connected button groups), navigation drawer (use the expanded navigation rail), bottom app bar (use the docked toolbar), small FAB.
