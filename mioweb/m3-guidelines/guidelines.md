# Material 3 Expressive — Foundation guidelines for a web component library

> Framework-agnostic reference distilled from https://m3.material.io (Foundations, Styles) and the official M3 token database (content version 2026-10-13).
> Use this file for **everything shared across components**: tokens, color, typography, shape, elevation, icons, spacing, motion, interaction states, layout and accessibility. Every file in `components/` references the tokens defined here.

## How to use these docs

- **Three token tiers**: `md.ref.*` (raw palette/typeface values) → `md.sys.*` (semantic roles: color roles, type scale, shape, elevation, motion, state) → `md.comp.*` (component-specific, defined in each component file). Components must only consume `sys` tokens (via their `comp` tokens), never `ref` values or hex literals.
- **CSS custom property convention** (used across all files): replace dots with dashes and prefix with `--`: `md.sys.color.primary` → `--md-sys-color-primary`; `md.comp.button.filled.container.color` → `--md-comp-button-filled-container-color`. Typescale roles expand to `-font`, `-weight`, `-size`, `-line-height`, `-tracking`; springs to `-stiffness`, `-damping` plus the web helpers `-easing`, `-duration` (see Spring primitive).
- **Units**: `dp` → CSS `px`. Type sizes are given in `pt`/`sp` in the source → CSS `px` (or `rem` = px / 16 to respect user font scaling).
- **Values marked "derived" / "(implementation suggestion)" / "(web mapping)"** are not stated verbatim on m3.material.io; they are filled in from standard practice and should be reviewed.
- **Exact values** for every system token (light/dark, standard/medium/high contrast) are in the last section, *System token reference*.

## Contents

1. Design tokens
2. Color system
3. Color roles
4. Typography
5. Shape
6. Elevation
7. Icons
8. Spacing
9. Motion
10. Interaction states
11. Inputs, selection & gestures
12. Layout
13. Accessibility
14. Shared implementation primitives
15. System token reference (exact values)


---

## Design tokens

> Sources: https://m3.material.io/foundations/design-tokens · https://m3.material.io/styles/color/system · https://m3.material.io/styles/color/advanced

### What a token is

- A token is a **code-like name + a value** (e.g. `md.ref.palette.secondary90` → a color). The value can be a color, typeface, measurement, or **another token**.
- Tokens are named for **how/where they are used** (e.g. `md.comp.fab.primary.container.color`). If the value changes, the name and its use stay the same.
- Use tokens instead of hard-coded values everywhere: designs, tools and code reference the same names, so changes (themes, high contrast, typescale for TV, etc.) propagate consistently.

### Name anatomy

Parts are separated by periods, from most general to most specific:

1. System prefix: `md` (Material Design)
2. Token class: `ref` (reference), `sys` (system), `comp` (component)
3. Descriptive words that state the role/purpose (e.g. `color.on-secondary`)

### The three tiers

| Tier | Prefix | What it holds | Changes with context? | Should point to |
| --- | --- | --- | --- | --- |
| Reference | `md.ref.*` | Every available option: palette tones (`md.ref.palette.primary40`), typefaces (`md.ref.typeface.plain-medium`), raw measurements | **No.** Reference tokens are context-free | A static value (hex, font name, number) or another ref token |
| System | `md.sys.*` | Design decisions/roles that give the system its character: color roles, typescale, shape, elevation, motion, state | **Yes. This is where theming happens.** The same sys token resolves to different ref tokens per context (light/dark, contrast) | Reference tokens whenever possible, not static values |
| Component | `md.comp.*` | Properties of a component's elements (container, label text, icon, state layer...) per state: color, size, shape, elevation, typography | Only indirectly (via the sys tokens they point to) | System (or reference) tokens, **never hard-coded hex**. Raw dimensions/opacities are allowed |

Chain example: `md.comp.fab.primary.container.color` → `md.sys.color.primary-container` → `md.ref.palette.primary90` → hex value.

Rules:
- Not every stylistic choice of a component must be a token, but **when a design choice applies to multiple components of similar intent, use a token**.
- Component token tables in the spec are grouped first by **state** (enabled, disabled, hover, focus, pressed, dragged...) then by **element** (container, label text, icon...). Columns: Name, Token ID, Description, Context/value.
- Component tokens are officially "in development". Treat them as the canonical per-component API but expect additions.

### Contexts

- A **context** is a set of conditions under which a token resolves to a different value (a **contextual value**). Think of it as a tag: a value tagged "dark theme" overrides the default value in the dark-theme context.
- Contexts named in the source: **light / dark theme**, **contrast level** (standard / medium / high, tokenized since May 2025), **device form factor**, **dense layouts**, **right-to-left** writing systems.
- Color contexts to support in the library: `theme ∈ {light, dark}` × `contrast ∈ {standard, medium, high}` = 6 resolved color schemes for the same set of `--md-sys-color-*` names.

### Mapping to CSS custom properties

Replace dots with dashes and keep the official name:

| M3 token | CSS custom property |
| --- | --- |
| `md.ref.palette.primary40` | `--md-ref-palette-primary40` |
| `md.ref.typeface.brand` | `--md-ref-typeface-brand` |
| `md.sys.color.on-primary-container` | `--md-sys-color-on-primary-container` |
| `md.comp.button.filled.container.color` | `--md-comp-button-filled-container-color` |

Recommended layering (web mapping):

```css
/* 1. Reference: context-free palette tones (generated) */
:root { --md-ref-palette-primary40: …; --md-ref-palette-primary80: …; /* … */ }

/* 2. System: theming happens here (light/dark via light-dark(), contrast via [data-contrast]; see Theming recipe) */
:root                  { --md-sys-color-primary: light-dark(var(--md-ref-palette-primary40), var(--md-ref-palette-primary80)); /* … */ }
[data-contrast="high"] { /* re-point sys color tokens to the high-contrast tones */ }

/* 3. Component: inside the component's styles, default to sys tokens */
:host {
  background: var(--md-comp-button-filled-container-color, var(--md-sys-color-primary));
}
```

Implementation rules:
- **Components only read `--md-comp-*` tokens with a fallback to `--md-sys-*`**. They never read `--md-ref-*` or hex directly. That keeps dark theme, contrast levels and dynamic color working.
- **Theme switching** = swapping the values of `--md-sys-color-*` (and, for dynamic color, regenerating `--md-ref-palette-*` or the sys values directly). Support `prefers-color-scheme` as the default and allow an explicit attribute/class override (web mapping). `prefers-contrast: more` can map to the high (or medium) contrast level (web mapping).
- **Scoping:** because custom properties inherit, a subtree can get its own scheme (e.g. a content-based scheme on a media player card) by redefining `--md-sys-color-*` on that container. This is how "combine multiple color schemes" is implemented.
- **Override strategy, broadest to narrowest:**
  1. Global theme: set `--md-sys-*` on `:root`.
  2. Regional theme: set `--md-sys-*` on a container element.
  3. Single component type or instance: set `--md-comp-<component>-*` on the component/selector.
  Never override by targeting internal parts with hard-coded colors.
- If a remapping is needed, remap a component token to **another color role** (sys token), not to a palette tone or static value. Palette/static values break light/dark, contrast control and dynamic color.
- Distribute the baseline theme in a machine-readable form. M3 publishes the baseline as a **DSP (Design System Package)** JSON. Material Theme Builder exports tokens (Web, JSON, Android, Compose, Flutter).

---

## Color system

> Sources: https://m3.material.io/styles/color/system · /choosing-a-scheme · /static · /dynamic · /advanced · /resources

### What the system provides

- Built-in accessible color relationships, **26+ standard color roles** mapped to components (45 roles including add-ons, inverse, scrim and shadow), built-in dark theme, a static **baseline** scheme, and dynamic color (user-generated and content-based).
- Three contrast levels (standard / medium / high) for every role, in both themes.

### HCT color space

The system defines every color by **Hue, Chroma, Tone (HCT)**:

| Dimension | Range | Meaning |
| --- | --- | --- |
| Hue | 0–360 (circular; 0 = 360) | Red, orange, yellow, green, blue, violet… |
| Chroma | 0 → ~120 in practice (theoretically unbounded) | Colorfulness. 0 = grey/black/white. Max chroma depends on hue and tone |
| Tone | 0 (pure black) – 100 (pure white) | Perceived lightness (luminance). **Tone difference determines contrast** |

- HCT lets you change hue/chroma **without changing tone**, so contrast stays predictable.
- **Do not conflate HCT with HSL/RGB.** Colors with equal perceived brightness share an HCT tone but can have different HSL lightness. All palette math must be done in HCT (via Material Color Utilities), never by adjusting HSL lightness.
- Because of physical/screen limits, some hue+tone combinations cannot reach high chroma (e.g. bright light blue/red), so chroma may vary across tones within one palette.

### Generation pipeline (source color → UI)

1. **Source color.** Obtained in one of three ways:
   - A. **User-generated**: from the user's wallpaper, analyzed by **quantization** to select a single color.
   - B. **Content-based**: from in-app content (album art, logo, video preview, book cover), also via quantization.
   - C. **Hand-picked** by a designer. The baseline scheme uses a hand-picked source color.
2. **Algorithm.** Done by **Material Color Utilities (MCU)**. The common algorithms:
   - *User-generated color algorithm*: maps tones into the scheme by system design choices + user preferences.
   - *Content-based color algorithm*: adjusts tones to match the appearance of the source image while keeping accessible contrast. The same source color gives a slightly different scheme than the user-generated algorithm.
   - *Custom colors*: output closely matches the input colors (brand/semantic).
3. **Five key colors** are derived by manipulating hue and chroma: **primary, secondary, tertiary, neutral, neutral variant**. A sixth palette, **error**, is static (see below).
   - Conventional relationships: primary and tertiary are the most prominent. Tertiary is complementary to primary (different hue). Secondary, neutral variant, and neutral share primary's hue with progressively **less chroma** in that order.
4. **Tonal palettes**: one per key color. Tones **0–100 in steps of 10, plus 95, 98, 99** (13 tones). Some palettes include more values; the neutral palette needs extra tones for surfaces (e.g. 4, 6, 12, 17, 22, 24, 87, 92, 94, 96). Lower number = darker.
5. **Tones are assigned to color roles** using accessible relationships, for both light and dark theme (e.g. light: `primary` = primary40, `on-primary` = primary100). Primary roles come from the primary palette, surface roles from the neutral palette, and so on.
6. **Roles are applied to the UI.** Components are already mapped to roles, so a new source color re-colors the whole UI automatically.

Implementation: use **Material Color Utilities** (`@material/material-color-utilities` on npm) to do quantization (`QuantizerCelebi` + `Score`), HCT, tonal palettes, dynamic schemes, contrast levels, and harmonization (`Blend.harmonize`). Write the results into `--md-ref-palette-*` / `--md-sys-color-*`.

### Scheme variants (MCU, not listed on the source pages)

The source describes "user-generated", "content-based", "custom colors", fidelity, and "define your own dynamic scheme" (custom hue/chroma rules per color group). MCU implements these as `DynamicScheme` variants. Expose them as a `variant` option:

| Variant (MCU) | Character | Typical use |
| --- | --- | --- |
| `TONAL_SPOT` | Default. Calm, medium-chroma primary, low-chroma neutrals | User-generated (wallpaper) default; baseline-like look |
| `CONTENT` | Primary keeps the source color's chroma; tones adjusted to look like the source | Content-based color (album art, images) |
| `FIDELITY` | Like content, with container tones matched to the source color ("color fidelity") | Brand/custom colors where the input color must show up closely |
| `VIBRANT` | High chroma, primary hue preserved | More colorful dynamic themes |
| `EXPRESSIVE` | Hues rotated away from the source, playful | Expressive/branded moments |
| `NEUTRAL` | Very low chroma | Near-greyscale UI |
| `MONOCHROME` | Chroma 0 (pure greys) | Monochrome themes |
| `RAINBOW`, `FRUIT_SALAD` | Hue-shifted, playful | Playful/system styles |

All variants are generated for `isDark` true/false and a `contrastLevel` (MCU: `0` = standard, `0.5` = medium, `1.0` = high; `-1` = reduced also exists).

### Choosing a scheme

A **color scheme** = all of a product's colors, roles and relationships across light and dark themes. Two kinds:

| | Static | Dynamic |
| --- | --- | --- |
| What | Colors never change with user input or content | Accessible scheme generated automatically from a source color |
| Gets | Accessible colors, pre-made baseline scheme, no breakage of M2 apps, easy upgrade to dynamic later | Accessible colors, personalized colors (wallpaper or content), fidelity customizations, **user-controlled contrast** |
| Doesn't get | Personalized colors, colors from wallpaper/content, user-controlled contrast | Exactly the same colors on all devices |
| Use when | Not ready for dynamic color; migrating from M2; enterprise products; iOS | Showcasing personalization; colors from wallpaper/content; offering user-controlled contrast; unsure if you'll mix dynamic and static |

Design with the **baseline scheme first** so the right roles are mapped to the right components, then test across many source colors (Material Theme Builder "Shuffle" / several sources). **Color-role mappings stay the same across all schemes; only values change.**

#### Static schemes

- **Baseline** is the default static scheme (hand-picked source; accessible pairings; light + dark). Exact light/dark values are listed separately in this guide.
- **Custom brand (static) scheme**: hand-picked by your team from brand colors. Input a brand color as Primary source (optionally separate sources for Secondary, Tertiary, Error, Neutral, Neutral Variant) and the full scheme is generated. Your team creates and maintains it, so it costs more effort.
- **Define your own baseline scheme**: input primary, secondary, tertiary, neutral, neutral variant colors. Put each input into the matching category so the conventional relationships hold. Fidelity can be toggled.
- Export: Material Theme Builder exports to Jetpack Compose, Android Views, Flutter, **Web**, or JSON.

#### Dynamic color sources

| Source | Choose when |
| --- | --- |
| **User-generated** (wallpaper; Android) | You want a well-tested personalized experience and the latest Material features. On the web there is no OS wallpaper API, so accept a user-chosen source color/image instead (web mapping) |
| **Content-based** (in-app image) | Content is front-and-center; the team can do some advanced customization; it supports features like media players. Best on **contained elements adjacent to the source image** |
| **Multiple sources** | Requirements match both. Start from user-generated (or baseline) as the foundation, then customize |

Rules for content-based color and multiple schemes:
- Apply a foundation scheme (baseline or user-generated) app-wide, then map content-based roles onto **contained spaces** (a card, a player, a screen).
- Uses: build hierarchy/direct attention; link related items in lists (each card colored from its own image); full-screen immersive moments (media control, purchase flow).
- **Keep the source content visible** where its color is used. Don't apply content color where the content isn't visible.
- **Max two color schemes from different source types per screen** (e.g. user-generated + one type of content).
- **Don't replace semantic colors** (red error, green success) with content-based color.

### Contrast levels

| Level | Behavior |
| --- | --- |
| **Standard** (default) | Mixed high/low contrast to express hierarchy and reduce cognitive load. Role pairs are at least **3:1** |
| **Medium** | Minimum **3:1** for people who need more contrast but are uncomfortable with very high contrast (e.g. halation) |
| **High** | **7:1** for essential elements (e.g. content in a card, not the card container), reducing distractions |

- Applies automatically to both light and dark themes. Contrast values are tokenized: provide a full sys-color set per contrast level.
- Mechanism: tones of a pair move further apart (e.g. tone 50 on 98 ≈ 3:1; tone 30 on 98 ≈ 7:1).
- **Custom components support contrast levels only if they use the proper roles** (e.g. `primary-container` + `on-primary-container`) via tokens.

### Error (built-in static color)

- The error palette is **static by default in every dynamic scheme** (it doesn't follow the source color) but still adapts to light/dark (and contrast).
- You don't need to define your own semantic red. Use error roles.

### Fixed colors (add-on)

- `primary-fixed`, `secondary-fixed`, `tertiary-fixed` (+ `-dim` variants) keep the **same tone in light and dark themes**. They are an alternative to the matching container role when fixed behavior is wanted. See the roles table.
- **Don't use fixed colors where contrast against the surface is necessary** (e.g. a primary button on a permissions screen). Use `primary`/`secondary`/`tertiary` instead.

### Add-on roles

Most products don't need them ("if unsure, ignore them"): fixed / fixed-dim / on-fixed / on-fixed-variant accents, and `surface-dim` / `surface-bright`. A library should still **ship all of them as tokens** so products can opt in.

### Static colors (formerly "custom colors"), extended colors

- Add colors that stay static while the rest of the scheme is dynamic (e.g. **Success** green, brand color).
- From one input color, Material returns **four roles** that follow accent-group conventions: `<name>`, `on-<name>`, `<name>-container`, `on-<name>-container`. Apply them with the same pairing rules as primary etc.
- CSS naming (library convention): `--md-sys-color-<name>`, `--md-sys-color-on-<name>`, `--md-sys-color-<name>-container`, `--md-sys-color-on-<name>-container`, generated per theme and contrast level (MCU: build a `TonalPalette` from the color and assign tones like the primary group). Generate light and dark values.
- **Fidelity** can be enabled/disabled per static color if the output looks different from the input.

### Harmonization

- Optional: shifts a static color's **hue** toward the scheme's **primary** hue so it looks better with dynamic colors. Hue shift is **limited** so the semantic meaning stays (red gets warmer or cooler, never purple or orange).
- Code: MCU `Blend.harmonize(designColor, sourceColor)`. Expose a per-color `harmonize: boolean` option.
- Check results across a variety of schemes. **Don't harmonize colors that must stay absolutely consistent** (brand colors, real-world signage such as transit line colors).

### Color fidelity

- Scheme roles are mapped to fixed tones for contrast. Sometimes this keeps a color from looking as intended (e.g. too light to look vibrant). **Fidelity adjusts tones to match the input color without harming contrast.**
- Material Theme Builder: "match color" toggle. **On by default** for custom baseline schemes and static colors. In code: a per-role boolean flag (MCU `SchemeFidelity` / `SchemeContent` behavior).
- Because tones move, **always pair background roles with their own "on" role**.

### Custom color roles

Only if nothing else (remapping, static colors, custom baseline/dynamic scheme) works. Define each new role like Material does:
1. **Palette + reference tone** for light and dark (e.g. `primary-graphic` = primary50; palettes: primary, secondary, tertiary, neutral, neutralVariant, error).
2. **Pairings**: which roles it is used with as foreground/background, or which must keep a tone delta.
3. **Contrast**: verify Material minimums (e.g. `primary-graphic` on `primary-container` ≥ 3:1).

Then implement it as an MCU `DynamicColor` so it responds to theme, contrast level and source color. Expose it as `--md-sys-color-<custom-role>`.

### Custom dynamic scheme

To control appearance (e.g. more vibrant than default) while keeping dynamic color, provide your own **hue and chroma rules per color group** (primary, secondary, tertiary, neutral, neutral variant). Define a scheme variant and let MCU generate all roles.

### Tooling

- **Material Theme Builder** (Figma plugin): emulates dynamic color extraction, builds custom tonal schemes, checks contrast, exports tokens (incl. Web/JSON), and generates state layers.
- **Material Color Utilities**: the algorithm library behind dynamic color. Use it in the library's theming utility (e.g. `themeFromSourceColor(color, {variant, contrastLevel, isDark, staticColors})` → CSS custom properties).

---

## Color roles

> Source: https://m3.material.io/styles/color/roles

### Vocabulary

- **Surface**: backgrounds and large, low-emphasis areas.
- **Primary / Secondary / Tertiary**: accent roles for emphasizing or de-emphasizing foreground elements.
- **Container**: fill color for foreground elements (buttons, chips...). **Never use for text or icons.**
- **On-**: color for text/icons **on top of** its paired parent color (`on-primary` on `primary`).
- **Variant**: a lower-emphasis alternative to its non-variant pair (`outline-variant` vs `outline`).
- **Fixed**: same tone in light and dark themes. **Dim**: a deeper fixed tone.

### Accent hierarchy

- **Primary**: most important actions and elements needing the most emphasis (FAB, high-emphasis buttons, active states).
- **Secondary**: elements that don't need immediate attention or emphasis (selected nav icon, filter chips, tonal buttons, dismissive actions).
- **Tertiary**: smaller elements that need special emphasis but not immediate attention (badges, notifications, highlighted input field). Applied at the designer's discretion for broader color expression; balances primary and secondary.
- Be careful when changing roles purely for visual effect.

### All roles

Tone columns are the MCU standard-contrast tones (palette+tone), for reference only. They are not part of the source text and the exact values are listed elsewhere. P=primary, S=secondary, T=tertiary, E=error, N=neutral, NV=neutral variant palette.

#### Accent groups

| Role (`--md-sys-color-…`) | Purpose | Pair with (foreground on it / it on) | Typical component usage | Tone L / D |
| --- | --- | --- | --- | --- |
| `primary` | High-emphasis fills, text and icons against surface | Fill → `on-primary`. As text/icon → on any surface/surface-container | Filled button, selected/active indicators, switch track (on), slider, progress, checkbox/radio selected, text-button label, links | P40 / P80 |
| `on-primary` | Text/icons on `primary` | On `primary` only | Filled button label/icon, switch handle (on) | P100 / P20 |
| `primary-container` | Standout fill against surface for key components | Fill → `on-primary-container` | FAB (default), prominent tonal fills, selected items | P90 / P30 |
| `on-primary-container` | Text/icons on `primary-container` | On `primary-container` only | FAB icon/label | P30 (since Aug 2024; was P10) / P90 |
| `secondary` | Less prominent fills, text, icons against surface | Fill → `on-secondary` | Lower-emphasis accents | S40 / S80 |
| `on-secondary` | Text/icons on `secondary` | On `secondary` | | S100 / S20 |
| `secondary-container` | Less prominent fill against surface for recessive components | Fill → `on-secondary-container` | Tonal button, selected nav indicator (bar/rail/drawer), selected filter chip, tonal icon button, segmented button selected | S90 / S30 |
| `on-secondary-container` | Text/icons on `secondary-container` | On `secondary-container` | Tonal button label, active nav icon | S30 (Aug 2024) / S90 |
| `tertiary` | Complementary fills, text, icons against surface | Fill → `on-tertiary` | Contrasting accents | T40 / T80 |
| `on-tertiary` | Text/icons on `tertiary` | On `tertiary` | | T100 / T20 |
| `tertiary-container` | Complementary container color against surface (e.g. input fields, highlighted selection) | Fill → `on-tertiary-container` | Tertiary FAB, highlighted selected element | T90 / T30 |
| `on-tertiary-container` | Text/icons on `tertiary-container` | On `tertiary-container` | | T30 (Aug 2024) / T90 |
| `error` | Attention-grabbing fill, icon, text against surface for urgency | Fill → `on-error` | Text field error outline/supporting text/icon, badge (small/large) | E40 / E80 |
| `on-error` | Text/icons on `error` | On `error` | Badge label | E100 / E20 |
| `error-container` | Attention-grabbing fill against surface | Fill → `on-error-container` | Error banners, destructive tonal fills | E90 / E30 |
| `on-error-container` | Text/icons on `error-container` | On `error-container` | | E30 (Aug 2024) / E90 |

#### Surfaces

| Role | Purpose | Pair with | Typical component usage | Tone L / D |
| --- | --- | --- | --- | --- |
| `surface` | Default background | `on-surface`, `on-surface-variant`, accents, `outline(-variant)` | App/body background, page body region | N98 / N6 |
| `surface-dim` (add-on) | Dimmest surface in **both** themes (keeps relative brightness) | Same as surface | Recessed regions (e.g. a nav rail beside a bright chat window) | N87 / N6 |
| `surface-bright` (add-on) | Brightest surface in **both** themes | Same as surface | Emphasized content area on large screens | N98 / N24 |
| `surface-container-lowest` | Lowest-emphasis container | `on-surface`, `on-surface-variant` | Nested/lowest containers on large screens | N100 / N4 |
| `surface-container-low` | Low-emphasis container | same | Elevated button, elevated card, (modal) sheets/drawers | N96 / N10 |
| `surface-container` | **Default** container | same | Navigation region, nav bar/rail, top/bottom app bar, menus | N94 / N12 |
| `surface-container-high` | High-emphasis container | same | Dialogs, FAB on surface-colored variants, search bar | N92 / N17 |
| `surface-container-highest` | Highest-emphasis container | same | Filled text field container, switch track (off), filled card, input labels | N90 / N22 |
| `on-surface` | Text/icons on **any** surface or surface-container | On any surface role | Body text, titles, default icons. Also the base of disabled colors | N10 / N90 |
| `on-surface-variant` | Lower-emphasis text/icons on any surface/surface-container | On any surface role | Supporting text, inactive icons, placeholder, labels | NV30 / NV80 |
| `inverse-surface` | Fill that contrasts with surface (reverse of surrounding UI) | `inverse-on-surface`, `inverse-primary` | Snackbar container, plain tooltip | N20 / N90 |
| `inverse-on-surface` | Text/icons on `inverse-surface` | On `inverse-surface` | Snackbar text, tooltip text | N95 / N20 |
| `inverse-primary` | Actionable elements on `inverse-surface` | On `inverse-surface` | Snackbar action (text button) | P80 / P40 |
| `surface-variant` (legacy) | Pre-2023 role. Prefer `surface-container-highest` | `on-surface-variant` | Back-compat only | NV90 / NV30 |
| `background` / `on-background` (legacy) | Pre-2023 roles. Alias to `surface` / `on-surface` | | Back-compat only | = surface |
| `surface-tint` | Primary color formerly used for tonal elevation overlays. Tone-based surfaces replaced elevation tints in Feb 2023 | | Back-compat / custom elevation tint | = primary |

#### Outline and utility

| Role | Purpose | Pair with | Typical component usage | Tone L / D |
| --- | --- | --- | --- | --- |
| `outline` | Important boundaries; must give ≥3:1 against surface | Against surfaces | Text field outline, outlined button/chip border, checkbox unselected, radio unselected, focus/target boundaries | NV50 / NV60 |
| `outline-variant` | Decorative elements: dividers, and borders where other elements already provide 4.5:1 contrast | Against surfaces | Dividers, outlined card border, chip/button borders whose content has 4.5:1 | NV80 / NV30 |
| `scrim` | Overlay behind modal elements (apply with opacity in the component) | Over content | Modal dialog/sheet/drawer scrim (typically 32% opacity, defined per component) | N0 / N0 |
| `shadow` | Shadow color for elevation | | Elevation shadows | N0 / N0 |

#### Fixed accents (add-on, same in light and dark)

| Role | Purpose | Pair with | Typical usage | Tone L = D |
| --- | --- | --- | --- | --- |
| `primary-fixed` | Fill that keeps the same tone across themes; replaces `primary-container` when fixed behavior is wanted | `on-primary-fixed`, `on-primary-fixed-variant` | FAB container that doesn't change between themes; banners | P90 |
| `primary-fixed-dim` | Stronger/deeper fixed fill | `on-primary-fixed`, `on-primary-fixed-variant` | Icon button container | P80 |
| `on-primary-fixed` | Text/icons on `primary-fixed` (and dim) | On primary-fixed(-dim) | Emphasized text in custom banner | P10 |
| `on-primary-fixed-variant` | Lower-emphasis text/icons on `primary-fixed` (and dim) | On primary-fixed(-dim) | De-emphasized text in custom banner | P30 |
| `secondary-fixed` / `secondary-fixed-dim` | Same as primary, secondary group | `on-secondary-fixed`, `on-secondary-fixed-variant` | | S90 / S80 |
| `on-secondary-fixed` / `on-secondary-fixed-variant` | Text/icons on secondary fixed | | | S10 / S30 |
| `tertiary-fixed` / `tertiary-fixed-dim` | Same as primary, tertiary group | `on-tertiary-fixed`, `on-tertiary-fixed-variant` | | T90 / T80 |
| `on-tertiary-fixed` / `on-tertiary-fixed-variant` | Text/icons on tertiary fixed | | | T10 / T30 |

### Pairing and layering rules

- **Use colors only in their intended pairs/layering order.** Wrong pairings can look fine at standard contrast but break when contrast level or dynamic source changes. Example: `primary` with `on-primary` and `secondary-container` with `on-secondary-container` stay legible at every contrast level. `primary` with `primary-container` text, or `secondary-container` with `on-surface`, become illegible.
- Any `on-X` role is **guaranteed** sufficient contrast with `X`. Other combinations may not meet the Material requirements of **4.5:1 (small text)** and **3:1 (large text / UI boundaries)**.
- `on-surface` and `on-surface-variant` work on **every** surface and surface-container role (including dim/bright).
- Accent fills (`primary`, `secondary`, `tertiary`, `error`) and their containers sit on surface roles. Accent roles used as text/icons go directly on surfaces.
- Containers are fills only. Never use `*-container` for text or icons.
- Inverse roles only pair with each other.
- Fixed fills pair only with their `on-*-fixed` / `on-*-fixed-variant`.
- **Keep layout-region mappings the same across breakpoints** (e.g. body = `surface`, navigation = `surface-container` on mobile and tablet). Extra surface-container levels may be added at larger window sizes if applied consistently.
- Neutral components (nav bars, menus, dialogs...) have default surface-container mappings. Products may remap them, but only to other roles.
- Always apply roles (tokens), never palette tones or hex values, in components.

### Outline do/don't

- Don't use `outline` for dividers. Use `outline-variant`.
- Don't use `outline` for the border of components containing multiple elements (cards). Use `outline-variant`.
- Don't use `outline-variant` to create hierarchy or define the boundary of interactive targets. Use `outline` or another role with ≥3:1 against the surface.
- Caution: `outline-variant` may border targets (chips, buttons) **only if** their inner icons/text meet 4.5:1.

### Fixed colors do/don't

- Don't use fixed colors where contrast is necessary (they don't adapt to theme). Do use `primary`/`secondary`/`tertiary` for accents that need contrast.

### Surface bright/dim behavior

- `surface` inverts between themes (brightest region in light, dimmest in dark).
- `surface-bright` stays the **brightest** and `surface-dim` the **dimmest** in both themes.

### Disabled and interaction state colors

Not defined on the color pages; no extra disabled/state color roles exist. Disabled colors are `on-surface` at per-component opacities (Interaction states → Disabled color recipe); state layers use the content ("on-") color at the `md.sys.state.*` opacities (Interaction states → State layers).

### Do / Don't summary

- Do map every custom component to the standard roles via tokens. This gives dark theme, contrast levels and dynamic color for free.
- Do test components under light/dark, all 3 contrast levels, and several source hues (red, yellow, green, blue).
- Do use error roles for errors. Use static (and optionally harmonized) colors for other semantics such as success/warning.
- Don't use palette tones or hex in components. Don't pair roles outside their intended pairs. Don't replace semantic colors with content-based color. Don't harmonize brand colors.

---

## Typography

> Source: https://m3.material.io/styles/typography

### Fonts
- **Roboto** (static) is the default typeface for all M3 components and the M3 type scale. 3,300+ glyphs.
- **Roboto Flex** (variable) adds extended weights/widths and size-specific designs; 900+ glyphs (Latin, Greek, Cyrillic). Usable standalone for expression, but **not yet part of the M3 type scale**.
- **Roboto Serif** (variable): comfortable reading; usable anywhere, including UI.
- **Roboto Mono**: monospaced; use for code and aligned numbers.
- **Noto Sans**: global fallback collection (150+ scripts), metrically compatible with Roboto.
- **Google Sans Flex**: referenced by the expressive update (six variable axes; M3 shapes share its roundness attributes). Not the default token value; treat as a brand typeface option.
- Variable axes available:
  | Font | Axes |
  | --- | --- |
  | Roboto Flex | Slant, Width (25–150), Weight, Grade, Optical size. Advanced: XOPQ (thick stroke), YOPQ (thin stroke), XTRA (counter width), YTUC (uppercase height), YTLC (lowercase height), YTAS (ascender), YTDE (descender), YTFI (figure height) |
  | Roboto Mono | Weight, Italic |
  | Noto Sans | Width, Weight, Italic |
- **Fallback order** when using a variable font: `Roboto Flex → Roboto → Noto Sans` (per script). Web: `font-family: "Roboto Flex", Roboto, "Noto Sans", <script-specific Noto>, sans-serif;`

### Brand vs plain typeface
- The scale references two typeface tokens: **brand** (used by larger styles — Display, Headline) and **plain** (smaller styles — Title/Body/Label for readability). Both default to Roboto.
- Swap these two tokens to rebrand. Emphasized styles may use a different typeface from baseline.
- Web: expose `--md-ref-typeface-brand` and `--md-ref-typeface-plain`; each `--md-sys-typescale-*-font` resolves to one of them (implementation convention).

### Type scale: baseline vs emphasized
- One type scale, **30 styles = 15 baseline + 15 emphasized**. Five roles × three sizes: `display`, `headline`, `title`, `body`, `label` × `large|medium|small`.
- Each style has one composite token plus per-property tokens (font, weight, size, line-height, tracking).
  - Baseline: `md.sys.typescale.display-large` → `--md-sys-typescale-display-large-{font|weight|size|line-height|tracking}`
  - Emphasized: `md.sys.typescale.emphasized.display-large` → `--md-sys-typescale-emphasized-display-large-{…}`
- Emphasized styles = higher weight plus minor adjustments; same sizes as baseline. Baseline and emphasized are meant to be used together.
- **Components never use emphasized styles by default.** To emphasize, swap the baseline token for the emphasized token of the same role/size.
- Good uses of emphasized: badges, buttons for primary actions, extended FAB, selected list items, selected menu items, unread messages, selected states, key interactions, headlines/editorial.
  - *Weight* use: apply emphasized to text that already uses weight for hierarchy.
  - *Context* use: apply to selected/unread/active parts only. Both can combine.
- Scale is **Major Second (1.125)** anchored on 14 (body text base size). Products may drop styles or change sizes, but keep contrast between steps.

### Roles (how to apply)
| Role | Use | Rules |
| --- | --- | --- |
| Display | Largest; short important text or numerals; best on large screens | Expressive fonts (script/handwritten) OK; set matching optical size |
| Headline | Short high-emphasis text, smaller screens; primary passages/regions | Expressive fonts OK if line height/tracking keep readability |
| Title | Medium-emphasis, short; secondary passages/regions; app bar titles | Use caution with expressive fonts |
| Body | Long passages | Use readable text faces; avoid expressive/decorative fonts |
| Label | Utilitarian text in components, captions | Buttons use `label-large` |

### Customization rules
1. Change brand/plain typeface tokens first.
2. Adjust line height and tracking; **avoid changing type size** (affects component rendering/reflow).
3. Repeat for baseline and emphasized; keep emphasized consistently distinct (e.g., all wider).
- Heavier fonts → wider tracking; long ascenders/descenders → different line heights.
- Customizing may stop you receiving upstream token updates.

### Language height support (Aug 2026)
- Line heights adapt by script **language height category**: small (base: Latin except Vietnamese, Cyrillic, Greek, Hebrew), medium (~7% taller: Arabic, CJK, Indic, Thai, Vietnamese, most others), large (~30%: Burmese, Telugu), extra large (~100%: Nastaliq).
- Default to **medium**, switch by detected language (web: e.g. `:lang()` selectors overriding `--md-sys-typescale-*-line-height`).
- Components using vertical padding adapt automatically; fixed-height components are built for **small** and may need adaptation. Ignoring this causes overlapping text.

### Typesetting on web
- Web uses the **padding + bounding box** method: line-height = bounding box height; text vertically centered by CSS half-leading. Specify distances from container edges; compute with CSS (`calc()`), not baseline offsets (baseline method is for Android/platform-agnostic specs).
- Recommended line-height ratios: ~1.2× size for title/headline/display; ~1.5× for body/label (tokens already encode this).
- Use **tabular figures** (`font-variant-numeric: tabular-nums`) in tables, clocks, frequently changing values.
- Contrast: 4.5:1 for small text, 3:1 for large text. Default text color `on-surface` (alt: `on-surface-variant`). Links on surfaces: `primary` (or `tertiary` for less prominence) and **must be underlined**.

### Web units
- Font size: `sp → rem` with ratio 1/16 (`rem = sp / 16`): 10sp=0.625rem, 12sp=0.75rem, 24sp=1.5rem, 60sp=3.75rem. Use rem for font sizes (and line heights) so they scale with user font settings.
- Letter spacing: the source formula `tracking (px) / font size` (e.g. 0.2 / 16 = 0.0125) labels the web unit "rem", but that ratio is font-relative (an `em` value). Library decision (derived): tracking tokens hold the px value from the token DB and are emitted as `rem = px / 16` (absolute, scales with the root font size, identical to the `em` ratio at the token's own size). Use `em` only for custom sizes that should keep proportional tracking.
- dp (layout) → CSS px 1:1.

### Variable font axes & editorial treatments
- Editorial treatments: standalone showcase moments driven by type (custom large sizes, blocky looks), combinable with motion/shape/color for hero moments. Three uses: **celebrating content**, **voice of the user** (user-personalized type), **bespoke functionality** (e.g. axis values driven by a slider).
- Rules: create tokens for each recurring editorial treatment and apply them consistently; match emotional tone to task; don't mix multiple/clashing styles in one layout; don't mimic personalization theming; **never use editorial treatments for labels or purely informational text**.
- Axes (web: `font-variation-settings` / `font-weight`, `font-stretch`, `font-optical-sizing`):
  - **Weight** (`wght`): primary thickness. Avoid very light weights for body/small sizes; avoid excessive weight at small sizes.
  - **Grade** (`GRAD`, Roboto Flex −200…150): thickness change **without changing width/reflow**. Use negative grade in dark mode to counter apparent heaviness; positive grade for selected states (e.g. selected filter chip).
  - **Width** (`wdth`, 25–150): narrow for tight spaces (nav labels); avoid wide widths in limited space (top app bar).
  - **Optical size** (`opsz`): match optical size to rendered size; never large opsz at small sizes (`font-optical-sizing: auto` on web).

## Shape

> Source: https://m3.material.io/styles/shape

### Principles
- Rectangular shapes are fully rounded in all corners by default; individual corners can be adjusted (asymmetric).
- Use abstract shapes thoughtfully and **sparingly** (decoration, emphasis, delight); never on text-heavy containers; don't compromise clarity.
- Shape is **versatile, not semantic**: don't assign a fixed meaning to a shape.
- Embrace **tension**: mixing sharp and round shapes is encouraged for state, attention, aesthetics.
- Shapes echo typography (Google Sans Flex roundness); use them in harmony.
- Most creative freedom in non-interactive/decorative use: image crops, avatar masks, graphics. Layered shape + motion can create a 2.5D effect.

### Corner radius scale (10 steps)
| Step | Token | Value |
| --- | --- | --- |
| None | `--md-sys-shape-corner-none` | 0 |
| Extra small | `--md-sys-shape-corner-extra-small` | 4px |
| Small | `--md-sys-shape-corner-small` | 8px |
| Medium | `--md-sys-shape-corner-medium` | 12px |
| Large | `--md-sys-shape-corner-large` | 16px |
| Large increased *(expressive)* | `--md-sys-shape-corner-large-increased` | 20px |
| Extra large | `--md-sys-shape-corner-extra-large` | 28px |
| Extra large increased *(expressive)* | `--md-sys-shape-corner-extra-large-increased` | 32px |
| Extra extra large *(expressive)* | `--md-sys-shape-corner-extra-extra-large` | 48px |
| Full | `--md-sys-shape-corner-full` | fully rounded |

- **Full** is now its own token (previously 50% of component size). Web: `9999px` for static shapes (pill/stadium ends on non-square elements; `50%` would give an ellipse). For animated morphs to/from full use the element's half-height in px (see Shape morph recipe).
- Token families (source: "shape corner tokens to define all corners, and corner-value tokens for individual corners"): `md.sys.shape.corner.*` (whole-shape values incl. partial families `extra-small.top`, `large.top`, `large.start`, `large.end`, `extra-large.top`) and `md.sys.shape.corner-value.*` (single numeric radius per step, used for individual/inner corners and interpolation). Both symmetric and asymmetric shapes use the same scale.
- **Inner corners**: in closely grouped items (menus, split buttons, button groups) the inner-facing corners use a smaller value; inner-corner component tokens always map to **individual corner** shape tokens. Web: use logical properties `border-start-start-radius`, `border-end-start-radius`, etc. so RTL flips correctly.

### Customization
- **Style level**: change the value of a scale step (e.g. medium) → all components mapped to it change.
- **Component level**: remap a component's shape token to a different step (e.g. buttons default to `full`; remap to `small`/`medium`).
- **Shape family**: rounded (default) or **cut** (straight chamfer). Cut corners clip more content → add extra padding in dense components. Web: cut corners need `clip-path: polygon(...)` (or CSS `corner-shape: bevel` where supported, progressive enhancement).
- Avoid large/full corners on information-dense components (e.g. cards with lots of content).

### Optical roundness (nested shapes)
- Never give nested objects the same radius as their container.
- `inner radius = outer radius − padding` (e.g. 48 − 14 = 34). Web: `border-radius: max(0px, calc(var(--outer) - var(--pad)))`.

### Shape library & morphing
- Material shape library: **35 shapes** (added May 2025) with seamless morphing between any pair. Used by **standard button group** (press/selection morph) and **loading indicator**.
- The source page lists the shapes only as images. Names per the Jetpack Compose `MaterialShapes` API (reference): Circle, Square, Slanted, Arch, Fan, Arrow, SemiCircle, Oval, Pill, Triangle, Diamond, ClamShell, Pentagon, Gem, Sunny, VerySunny, Cookie4Sided, Cookie6Sided, Cookie7Sided, Cookie9Sided, Cookie12Sided, Ghostish, Clover4Leaf, Clover8Leaf, Burst, SoftBurst, Boom, SoftBoom, Flower, Puffy, PuffyDiamond, PixelCircle, PixelTriangle, Bun, Heart.
- Use morph to communicate: interaction states (selected), actions in progress (typing, loading), environment changes (sound, temperature, time). Morph should respond to tap/swipe/scroll/release/long-press.
- Morphing uses the **expressive** motion scheme by default (spatial spring); can switch to standard.
- **Web availability: not provided by Material** (Compose only). Implementation approach:
  - Rounded rectangles (incl. corner-radius changes, e.g. button press/selection morphs): animate `border-radius` per corner — cheapest and sufficient for components (see Shape morph recipe).
  - Library shapes: ship each as normalized SVG path data (or polygon with rounded vertices, as in AndroidX `graphics-shapes` RoundedPolygon). Apply via `clip-path: path()`/`shape()` or an SVG `<clipPath>`/`mask` with `clipPathUnits="objectBoundingBox"`. For morphing, pre-resample both shapes to the **same number of cubic segments with aligned start points** (the RoundedPolygon/Morph algorithm), then interpolate control points per frame driven by a spring; CSS `clip-path` interpolation only works natively when both paths have identical command structure.
  - Reduced motion: disable decorative morphing (snap to end shape).

## Elevation

> Source: https://m3.material.io/styles/elevation

### Model
- Elevation = z-axis distance (dp). All surfaces/components have an elevation value. Tokens encode **distance only — no shadow or color**; each platform chooses how to render.
- Six levels:
  | Level | dp | Resting use |
  | --- | --- | --- |
  | 0 | 0 | App bar (not scrolled), filled/tonal/outlined buttons, button groups, filled/outlined cards, carousel, chips, full-screen dialog, FAB/extended FAB in nav rail, FAB menu items, icon buttons, list, nav rail, segmented button, docked side sheet, slider, split button, tabs |
  | 1 | 1 | Banner, modal bottom sheet, elevated button, elevated card, elevated chips, modal nav drawer, modal side sheet |
  | 2 | 3 | Scrolled app bar, menu, navigation bar, rich tooltip, toolbar |
  | 3 | 6 | Date/time pickers, modal dialogs, FAB, extended FAB, FAB menu close button, search |
  | 4 | 8 | Never resting; interaction states only |
  | 5 | 12 | Never resting; interaction states only (e.g. dragged) |
- Resting levels are 0–3; levels 4–5 are reserved for user-interacted states (hover, dragged).
- **Surface tint color is deprecated** — do not overlay primary tint by elevation. Use the elevation level tokens 0–5.

### How elevation is expressed
- Default M3 separation = **tonal difference** between surface color roles (surface vs surface-container-*). Surface roles are not tied to elevation; overlapping containment areas must use **different** surface roles.
- Alternatives: **shadow** or **scrim**. A surface must show its edges, overlap, and distance.
- Interactive components' edges must meet accessible contrast vs. what's beneath (e.g. FAB on content needs a shadow).
- **Use visible shadows only when needed**: (1) to protect elements on busy/patterned backgrounds; (2) to encourage interaction (temporary lift on focus/selection/swipe/drag). Less is more; keep few levels in a UI.
- Small/sharp shadow = close; large/soft = far.
- **Scrim**: `scrim` color role at **32% opacity** beneath modals and expanded navigation.

### State changes
- Don't change components' default resting elevation.
- Elevation changes respond to system events / interaction and must be consistent across similar elements: hover (and usually focus) raises **+1 level** (e.g. FAB 3→4; all Material buttons +1 on hover). Pressed returns to resting (component specs define exact per-state levels). Dragged commonly uses level 4/5 per component spec.
- Animate shadow changes with an **effects** spring / standard easing (no overshoot).

### Shadows on web
The source gives **no shadow values**; each platform chooses. Rendering (box-shadow per level, themeable shadow color, clip-path caveat) is defined once in the **Elevation primitive** (Shared implementation primitives). Components at level 0 that only signal elevation via tone render no shadow.

## Icons

> Source: https://m3.material.io/styles/icons

- **Material Symbols** (variable icon font) is the default; styles **Outlined, Rounded, Sharp**. Legacy Material Icons lack variable axes. Use one style consistently per icon set; don't mix.
  - Outlined: light, works in dense UIs. Some symbols should stay filled (full-body humans, proprietary icons).
  - Rounded: pairs with heavy type/curved brands. Sharp: 0dp corners, crisp at small sizes.
- **Sizes**: standard **24px**; also **20px** (desktop, dense, small visuals), **40px** and **48px** (display/headline type, large screens, highlighted primary actions).
- **Grid**: 24 grid, 20×20 live area with 2px padding; content may extend into padding for visual weight, never outside the trim area. Keylines: square 18, circle Ø20, vertical rect 16w×20h, horizontal rect 20w×16h. Position on whole pixels. Default corner radius 2 (outlined: square interior corners; sharp: 0). Stroke 2 / weight 400; optical corrections may use 1.5 strokes. Icons face forward (no tilt/isometric).
- **Axes** (web: `font-variation-settings: 'FILL' f, 'wght' w, 'GRAD' g, 'opsz' o`):
  - **Weight** `wght` 100–700 (default 400). Min **200** at 24px; avoid excessive weight; apply consistently, don't mix in one group. Match icon weight to adjacent text weight.
  - **Fill** `FILL` 0–1. Use to convey state: **unfilled = unselected, filled = selected** (e.g. nav bar/rail active destination). Animate 0→1 with an effects spring.
  - **Grade** `GRAD` (−25, 0, 200 in Material Symbols). Default **0 for dark icon on light background, −25 for light icon on dark background** (visual bleed compensation, i.e. dark theme). Positive grade for emphasized/active states. Match text grade where the font has one.
  - **Optical size** `opsz` 20–48: set equal to rendered size so stroke stays consistent (20 for dense desktop, 40–48 for highlighted primary actions).
- **With text**: same size as text, same optical weight, and shift the symbol's baseline down ≈ **11.5% of the text size** (web: `vertical-align: -0.115em` or flex-centering inside components).
- **Touch target**: 24px icon → **48×48px** target by default. Mouse/keyboard-primary dense layouts: 20px icon → 40×40px target.
- **Accessibility**: label abstract icons; navigation items must have labels; below 20px complex or key-action icons need an accompanying text label. Decorative icons `aria-hidden="true"`; icon-only controls need `aria-label` (web mapping). Localize metaphors (cart/bag/basket) and be mindful of cultural color/symbol meanings.
- Icon color comes from component tokens (`on-surface-variant`, `on-primary`, etc.); use `currentColor`.

## Spacing

> Source: https://m3.material.io/styles/spacing

- 8dp scale: **`md.sys.measurement.space100` = 8px** → `--md-sys-measurement-space100`. Token suffix = multiplier × 100 (space200 = 16, space50 = 4, space25 = 2; a custom space225 would be 18). Main units cover 0×–9× of 8; nested units defined: 0.25× (2), 0.5× (4), 0.75× (6), 1.25× (10). Material defines only the recommended steps; extend following the multiplier pattern.
- Note: spacing system tokens are currently only wired in Jetpack Compose; web libraries should still define them as CSS custom properties and map component padding tokens to them.
- **Three categories**: padding (inside an element), gap (between elements in a container), margin (outside an element). Positions: vertical, horizontal, top, bottom, leading, trailing. Leading/trailing flip in RTL → use logical CSS properties (`padding-inline-start`, `margin-inline`, `gap`).
- **Prefer padding and gaps over margins**. Define padding/gap on the parent container; avoid margins on child elements. Use margins only beyond parent padding or in page layouts.
- Simple components: one horizontal gap + one vertical gap. Complex components: name gaps by neighbours (e.g. `icon-label gap`).
- Layouts: panes, spacers and margins structure the page; padding and gaps organize content inside panes.
- Example (search): 8px vertical padding, 8px horizontal gaps, 24px horizontal margins (12px when focused).
- **Text scaling**: when text scales up to 200%, keep the same spacing (don't scale padding with font size → spacing in px, type in rem).
- Customization: (1) remap a component's spacing token (e.g. button top padding space125→space200); (2) add custom system steps/patterns (e.g. `surface-content.padding.horizontal` shared by cards and sheets); (3) adaptive layout/density: map to different system tokens per form factor; density adapts **vertical padding** (density 0 to −4).
- Component token naming: new tokens use `padding|margin|gap` + position (e.g. `leading-padding`); legacy tokens use `leading-space`, `trailing-space`, `top-space`, `bottom-space`, `between-space`. Support both names where component tokens still use legacy ones.

## Motion

> Sources: https://m3.material.io/styles/motion/overview · /easing-and-duration · /transitions

### Motion physics system (M3 Expressive)
- Physics-based, **replaces** easing+duration for components and interactions. Web status: "compatible with Compose springs" — use real springs when possible; otherwise use the provided cubic-bezier + duration approximations for animations without interruption or gestures.
- **Motion schemes**: `expressive` (opinionated; overshoot/bounce; the source says to use it "for most situations, particularly hero moments and key interactions") and `standard` (functional, minimal bounce; utilitarian products). **Library default = expressive** (decision: follows the motion guidelines; the token DB's default context is standard, which only affects which values a token tool shows first). Custom schemes allowed. The scheme is selected at product level and is **not part of the token name**; swapping the scheme re-resolves all spring tokens. Schemes can be overridden per subtree/element (web: re-declare `--md-sys-motion-spring-*` custom properties on a subtree, e.g. `[data-motion-scheme="standard"]`).
- **Spring** = stiffness + damping (ratio) + initial velocity. Springs handle gestures, interruption and retargeting (preserve current velocity when a new target arrives).
- Tokens: 2 types × 3 speeds → `md.sys.motion.spring.{fast|default|slow}.{spatial|effects}` → `--md-sys-motion-spring-{speed}-{type}-{stiffness|damping}`.
  - **Spatial**: position (x/y), rotation, size, corner radius/shape — overshoots and settles (in expressive).
  - **Effects**: color, opacity — **no overshoot** (critically damped).
  - **Speed**: default = most motion, partial-screen (bottom sheet, expanding nav rail; content opacity in rail); fast = small components (switches, buttons; switch handle color); slow = full-screen animations/content refresh.
- All component motion is driven primarily by **expressive fast spatial** and **expressive fast effects**.
- Exact spring values vary by device class (wearable/phone/tablet) but ordering fast > default > slow is constant.
- Values (stiffness / damping ratio, from the token DB; same as Jetpack Compose `MotionScheme`): expressive spatial fast 800/0.6, default 380/0.8, slow 200/0.8; standard spatial fast 1400/0.9, default 700/0.9, slow 300/0.9; effects (both schemes) fast 3800/1, default 1600/1, slow 800/1.

### Web: spring → curve conversion (from source)
| Spring | cubic-bezier | Duration |
| --- | --- | --- |
| Expressive fast spatial | 0.42, 1.67, 0.21, 0.90 | 350ms |
| Expressive default spatial | 0.38, 1.21, 0.22, 1.00 | 500ms |
| Expressive slow spatial | 0.39, 1.29, 0.35, 0.98 | 650ms |
| Standard fast / default / slow spatial | 0.27, 1.06, 0.18, 1.00 | 350 / 500 / 750ms |
| Expressive **and** standard fast effects | 0.31, 0.94, 0.34, 1.00 | 150ms |
| Expressive **and** standard default effects | 0.34, 0.80, 0.34, 1.00 | 200ms |
| Expressive **and** standard slow effects | 0.34, 0.88, 0.34, 1.00 | 300ms |

These become the `-easing`/`-duration` custom properties of the **Spring primitive** (Shared implementation primitives), next to `-stiffness`/`-damping` for the JS solver.

### Implementing springs on the web
Model (unit mass m = 1, normalized displacement from 0 → 1, k = stiffness, ζ = damping ratio; if a damping coefficient c is given instead, ζ = c / (2·√(k·m))):
- ω₀ = √k ; ω_d = ω₀·√(1 − ζ²)
- Underdamped (ζ < 1): `x(t) = 1 − e^(−ζω₀t)·[cos(ω_d t) + ((ζω₀ − v₀)/ω_d)·sin(ω_d t)]`  (v₀ = initial velocity in normalized units/s; 0 for most transitions)
- Critically damped (ζ = 1): `x(t) = 1 − e^(−ω₀t)·(1 + (ω₀ − v₀)·t)`
- **Duration** (settling time to tolerance ε, e.g. 0.001 of distance): `T ≈ ln(1/ε) / (ζ·ω₀)` for underdamped; for ζ = 1 solve `e^(−ω₀T)(1+ω₀T) = ε` numerically (≈ 9.23/ω₀ for ε = 0.001). Example: k = 800, ζ = 0.6 → ζω₀ ≈ 16.97 → T ≈ 0.41s (source rounds to 350ms using a looser threshold).
- **CSS `linear()` approximation** (best fidelity without JS): sample x(t) at N points (≈ 40–60, more for bouncy springs) over [0, T] and emit `transition-timing-function: linear(x0, x1, …, xN)` with `transition-duration: T`. Overshoot values > 1 are allowed. Generate at build time from stiffness/damping tokens. Fallback for browsers without `linear()`: the cubic-bezier table above.
- **JS solver** (gestures, interruption, retargeting): semi-implicit Euler per `requestAnimationFrame` with ≤4ms sub-steps, velocity kept on retarget; code outline in the Spring primitive. The Web Animations API can also play a pre-sampled `linear()` easing; on interruption read the current value + estimated velocity and start a new spring.
- Use **spatial** springs only on transform/size/radius properties; **effects** springs on opacity/color. Prefer animating `transform`/`opacity` for performance.

### Legacy easing & duration (still used for transitions)
- No longer maintained, but **still used for page/screen transitions** (transition patterns below) and as fallback for teams not on Expressive.
- Easing sets: **Emphasized** (most transitions; captures M3 style) and **Standard** (small utility transitions; also fallback where Emphasized isn't supported — Emphasized is a two-segment path `M0,0 C0.05,0 0.133333,0.06 0.166666,0.4 C0.208333,0.82 0.25,1 1,1`; the source lists CSS as "N/A (Use Standard as a fallback)". Library decision: `--md-sys-motion-easing-emphasized` = a `linear()` sampled from that path (value in the Reference CSS skeleton), falling back to the standard curve `cubic-bezier(0.2, 0, 0, 1)` where `linear()` is unsupported).
- Choose type by relation to screen: begin & end on screen → emphasized (500ms) / standard (300ms); enter → emphasized decelerate (400ms) / standard decelerate (250ms); exit permanently → emphasized accelerate (200ms) / standard accelerate (200ms); exit temporarily (retrievable, e.g. drawer) → emphasized.
- Duration rules: scale with area covered (small ≈ 200ms, large ≈ 500ms); exits/dismiss/collapse shorter than enters; extra-long (>600ms) only for ambient transitions without user input. Token families short1–4, medium1–4, long1–4, extra-long1–4 (values in token reference). Examples: selection controls 200ms standard; FAB→sheet 400ms emphasized; card→fullscreen 500ms emphasized; ambient carousel auto-advance 1000ms emphasized.

### Transition patterns
| Pattern | Use | Behaviour |
| --- | --- | --- |
| **Container transform** | Element expands to show detail (card → page, list item, image, search box, sheet, FAB, chip) | Persistent container (or hero element) morphs bounds/shape between start and end; strongest relationship, most expressive. Reserve for hero moments and shallow hierarchies; not for deep/utility hierarchies; use instead of forward/backward for hero moments. |
| **Forward & backward** | Consecutive hierarchy levels (inbox → thread) | Horizontal slide; Android style slides with fade (short distance); iOS parallax. Use platform defaults. |
| **Lateral** | Peer content (tabs, carousels, galleries) | Grouped elements slide in unison, no fade/parallax; hints swipe. Not for hierarchy or top-level nav. |
| **Top level** | Nav bar/rail/drawer destinations | Exiting screen quickly fades out, then entering fades in (fade through). No grouping/persistent elements; never lateral slide. |
| **Enter & exit (within bounds)** | FAB, dialogs, menus, snackbars, time pickers, tooltips | Android/M3: expand/collapse along x or y axis away from nearest edge (top menu expands down, bottom snackbar up); avoid scale and z-axis motion. iOS: uniform scale in, fade out. Short fades only. |
| **Enter & exit (beyond bounds)** | App bars, banners, nav bar/rail/drawer, sheets | Slide on/off screen while expanding/collapsing along the axis; may be scroll-driven (app bar, nav bar hide on scroll); coplanar side sheets shrink content area. Directions form the spatial model: notifications top, nav drawer leading edge, bottom sheet/keyboard bottom. Not for hierarchical navigation. |
| **Skeleton loaders** | Loading → loaded | Subtle pulse moving top-left → bottom-right; content quickly fades in over the skeleton when loaded. |

Transition quality rules: consistent per pattern; stable layouts (no popping/shifting content); no jump cuts by default (allowed when pure efficiency matters, e.g. productivity menus); coherent spatial model; unified direction along one axis with only hero elements persistent; **clean fades** — fully fade out before fading in; if a cross-fade is unavoidable, keep it short during the fastest part; don't slowly fade sheets over content; **simple style — common transitions must not use bouncy springs** (so screen transitions use emphasized easing/effects-style curves, not expressive spatial overshoot).

### Reduced motion
- Respect `@media (prefers-reduced-motion: reduce)` (web mapping of the platform setting). When on:
  - Replace sliding/scaling/container transforms with **subtle fades**.
  - Disable decorative effects: parallax, **shape morphing**, bounce/overshoot (fall back to effects springs or instant changes).
  - Keep state-communicating changes (color, fill, opacity) but shorten them.
- Implementation: **Reduced-motion recipe** (spatial spring durations → 0ms, effects kept; JS runners jump to target).

---

## Interaction states

> Sources: https://m3.material.io/foundations/interaction/states (focus-indicator and disabled values are confirmed against the component token tables for buttons, cards, chips, lists, switch and text fields).

### State model
- States always have **two visual indicators**, which keeps them accessible: never rely on color alone. Typical pairs are state layer + elevation, state layer + focus ring, or color + check icon.
- States: **enabled, disabled, hovered, focused, pressed, dragged**, plus the persistent **selected / activated** states (see Selection).
- Apply states consistently across all components.
- States can be combined (for example selected + hovered, selected + focused). See "Combining states" below.

### State layers: how to build them
- A state layer is a semi-transparent overlay that sits **between the container and the content**. The stacking order is (1) container, (2) state layer, (3) content.
- **Color** is the component's content color, usually the "on" role paired with the container. Examples:
  - `secondary-container` container → `on-secondary-container` state layer.
  - `surface` container with `primary` content → `primary` state layer.
  - Filled button: `md.comp.button.filled.hovered.state-layer.color` → `md.sys.color.on-primary`.
  - If a component has an icon, the icon color decides the state layer color. If it has no icon, the label text color does.
- **Opacity** is fixed per state:

| State | System token | CSS property | Value |
|---|---|---|---|
| Hover | `md.sys.state.hover.state-layer-opacity` | `--md-sys-state-hover-state-layer-opacity` | 0.08 |
| Focus | `md.sys.state.focus.state-layer-opacity` | `--md-sys-state-focus-state-layer-opacity` | 0.10 |
| Pressed | `md.sys.state.pressed.state-layer-opacity` | `--md-sys-state-pressed-state-layer-opacity` | 0.10 |
| Dragged | `md.sys.state.dragged.state-layer-opacity` | `--md-sys-state-dragged-state-layer-opacity` | 0.16 |

- **Shape:** the layer can cover the whole component, one element inside it, or a circle over part of the component (for example the handle of a switch or the icon of a checkbox).
- **Size:** for icon-like controls the state layer is **40dp** while the interactive target is **48dp**. The target is larger than the visible layer.
- **One layer at a time.** Only one state layer is applied to an element at any moment. When states combine, use the highest-priority opacity: dragged (0.16) > pressed (0.10) > focus (0.10) > hover (0.08).
- **Transitions:** hover appears and disappears with a low-emphasis animated fade.

Web implementation: **State layer primitive** (Shared implementation primitives).

### Per-state rules

| State | Trigger | Emphasis / visual | Inherited by | NOT inherited by | Concurrency |
|---|---|---|---|---|---|
| **Enabled** | Default | Default component style | All interactive components | — | — |
| **Disabled** | Programmatic | Color change + reduced elevation (to level0) | Buttons, cards, checkboxes, chips, list items, radio buttons, switches, text fields (action, selection and input components) | App bars, badges, dialogs, FABs, menus, navigation bar/drawer/rail, sheets, tabs, tooltips | Any number per layout |
| **Hovered** | Cursor (or stylus) pauses over an element | Low-emphasis overlay (0.08) | Buttons, cards, checkbox, chips, date/time pickers, list items, slider, switch, text fields (also FAB, icon button, segmented button) | App bars, badges, dialogs, menus, navigation bar/drawer/rail, sheets, tabs (the container; actionable children inside them still get hover) | **One** per layout |
| **Focused** | Tab key (or equivalent), voice | Higher-emphasis overlay (0.10) + keyboard focus indicator | Buttons, cards, checkbox, chips, date/time pickers, list items, selection controls, text fields | App bars, badges, banner, card (as a container), dialogs, navigation bar/drawer/rail, sheets (the container; actionable children still get focus) | **One** per layout |
| **Pressed** | Tap or click via cursor, keyboard or voice | High emphasis: ripple overlay (0.10). Some components (buttons, cards) can also change elevation. In M3 Expressive, buttons and similar components can also shape-morph | Buttons, cards, checkbox, chips, list items, text fields | App bars, badges, bottom navigation, dialogs, menus, sheets, tabs (the container) | **One** per layout |
| **Dragged** | Press (touch-and-hold) and move | Low emphasis overlay (0.16), so it does not distract. List items, chips and cards can also raise elevation | Cards, chips, list items, sliders | App bars, badges, buttons, dialogs, menus, navigation bar/drawer/rail | **One** per layout |

Disabled behavior:
- A disabled component **cannot be focused, dragged or pressed**, and it shows no hover or other state layer.
- If an action is unavailable, **hide the FAB** rather than disabling it.
- Disabled states are **exempt from contrast requirements**.

### Disabled color recipe (from the component tokens)
Disabled colors are always `md.sys.color.on-surface` (unless the component token names another role) at a **per-component opacity token**; there are no disabled color roles. Values verified in the component token tables:

| Part | Opacity | Components |
|---|---|---|
| Content: label, icon, input/supporting text, handle, avatar | **0.38** | All (buttons, chips, lists, menus, text fields, radio, checkbox, slider, switch…) |
| Container fill | **0.10** | Buttons (all variants), filled/tonal icon buttons, selected outlined icon button |
| | **0.12** | Chips (elevated, selected flat), switch track, slider inactive track |
| | **0.38** | Cards (elevated, filled), checkbox container, selected list items and menu items, slider active track |
| | **0.04** | Filled text field container |
| Outline | **0.12** | Outlined card, flat chips, outlined text field, outlined segmented button |
| Filled text field active indicator | **0.38** | Filled text field |
| Elevation | `md.sys.elevation.level0` | All elevated components |

- `md.sys.state.disabled.state-layer-opacity` = 0.38 is the system default; components still declare their own tokens (some, e.g. list items, keep a 0.10 disabled state-layer token — it is never shown since disabled shows no state layers).
- Web implementation: **Disabled recipe** (Shared implementation primitives): opacity applied to the color via `color-mix()`, never element `opacity`.

### Focus indicator (keyboard focus ring)
- Shown when an element is reached by **keyboard (Tab)** or another non-pointer input. It is a ring-like outline around the focused element. While focused, the element can be operated with the keyboard.

| Property | System token | CSS property | Value |
|---|---|---|---|
| Thickness | `md.sys.state.focus-indicator.thickness` | `--md-sys-state-focus-indicator-thickness` | **3dp** |
| Outer offset (default) | `md.sys.state.focus-indicator.outer-offset` | `--md-sys-state-focus-indicator-outer-offset` | **2dp** (ring outside the container) |
| Inner offset (inset) | `md.sys.state.focus-indicator.inner-offset` | `--md-sys-state-focus-indicator-inner-offset` | **-3dp** (ring inside the container: list items and other full-bleed items) |
| Color | `md.sys.color.secondary` | `--md-sys-color-secondary` | (baseline #625b71) |

- Shape: the ring follows the container's corner shape, offset outward (derived: radius = container radius + offset).
- It appears together with the focus state layer (0.10).
- Some components also change their own outline on focus. Examples: outlined text field outline becomes 3dp `primary` (`error` when invalid); filled text field active indicator becomes 3dp; outlined card and flat chips use an `on-surface` / `on-surface-variant` focus outline.
- **Escape** removes visible focus indicators (see Inputs).
- Web implementation: **Focus ring primitive** (`outline` on `:focus-visible`, kept as a real outline in forced colors).

### Ripple (pressed)
- The ripple is the pressed-state overlay: on-color at 0.10. It can cover the whole component, an element inside it, or a circle over part of it.
- A mouse click or stylus tap must give **the same feedback as touch**, including the ripple.
- Web implementation: **Ripple primitive** (pointer origin on `pointerdown`, center for Enter/Space, clipped by the state layer, static pressed layer under reduced motion).

### Combining states
- Hover can combine with focused, activated, selected or pressed.
- Focus can combine with hover, activated or selected.
- Pressed can combine with hover, focused, activated or selected.
- Selected and activated states are persistent color or shape changes. Transient states (hover, focus, pressed, dragged) add a state layer on top, using the content color of the *current* (for example selected) style.
- States appear in the order the user triggers them: enabled → hover → pressed.

## Inputs, selection & gestures

> Sources: .../interaction/inputs, .../interaction/selection, .../interaction/gestures

### General
- Design every component for **touch, pointer (mouse, trackpad, stylus) and physical keyboard** together, whatever the device. Tablets and phones can run desktop-like sessions.
- Where a device does not recognize mouse or stylus input, treat the mouse as touch.

### Input device → expected behavior

| Input action | Behavior |
|---|---|
| Mouse / trackpad movement | Show a cursor |
| Primary click | Same feedback as touch (ripple). Handle click separately from touch events |
| Secondary click (right click, two-finger click) | Open a **context menu** for the clicked object |
| Hover | Change component state (hover layer). Show **tooltips** where applicable (cursor or stylus) |
| Highlight / drag over text | Select text with the cursor |
| Mouse wheel / two-finger drag | Scroll the list **under the cursor** (only that pane), vertically and horizontally. Horizontal carousels must scroll with the wheel and with a horizontal two-finger gesture |
| Trackpad pinch | Zoom the element or page |
| Physical keyboard attached | Hide the virtual keyboard; show it again when the physical keyboard is removed |

### Cursors (web mapping: CSS `cursor`)
- Pointer (default arrow): the default for controls (`cursor: default`).
- Hand: for **links and linked images** (`cursor: pointer`).
- Resize arrows: on the boundaries of resizable elements, such as pane drag handles (`col-resize`, `ew-resize`, ...).
- I-beam: over selectable or editable text (`cursor: text`).
- Stylus: normally no cursor, unless it shows tool properties such as brush size or shape.

### Text interactions
- Single click places the caret. Double click selects a word. Triple click selects a paragraph. A single click elsewhere deselects and moves the caret.
- Mouse, trackpad or stylus selection: highlight in a **single color**, no touch handles, use the right-click context menu (even on touch devices).
- Touch selection: **always show the touch controls** (handles), even if other inputs are connected.
- Dragging with touch in a text area scrolls it. Dragging with a mouse selects text.

### Keyboard conventions
- **Tab / Shift+Tab** move focus between interactive elements in a logical order, usually left to right and top to bottom. The focused element shows the focus ring.
- **Arrow keys** move *within* a component, such as menu items, grid cells, chip sets, tabs or radio groups. A composite group is one tab stop (web mapping: roving `tabindex` or `aria-activedescendant`).
- **Enter** activates links and buttons, submits forms, and performs the common action (for example sending a message).
- **Space** activates buttons, toggles checkboxes, switches and list items, and plays or pauses media.
- **Escape** dismisses visible modal elements (menus, dialogs, bottom sheets), removes visible focus indicators (resetting focus order to the start), and removes the text caret **without** clearing typed text. It also clears selections.
- Keyboard shortcuts: by default use **two or more keys**, and document every custom shortcut. If a shortcut uses a single key, provide at least one of these: a remap to include a non-printable modifier (most preferred); activation only while the relevant component is focused (preferred); a way to turn it off (temporary fallback only).

### Selection
- Selection is shown with a **check mark icon, a checkbox, a change in surface color**, or a combination. A whole component or part of it can be selected. Selection can happen by tap, cursor, keyboard or voice.
- Components that inherit selection: cards, checkboxes, chips, data tables, icon buttons, list items, menu items, pickers, radio buttons, segmented buttons, sliders, switch.
- An **active indicator** marks the single current item in navigation bar, navigation drawer, navigation rail and tabs. Its color and shape vary per component. **Only one item** can be selected at a time.
- Touch:
  - Enter selection mode with a **long press** (or two-finger touch), or with a shortcut such as tapping the item's avatar. Then tap more items to add them.
  - Exit by deselecting every item, or with a toolbar action.
  - Batch-select with long press + drag, **unless** long press + drag already means "pick up and move" in that context.
- Desktop (click):
  - When selection is the **primary** activity, checkboxes are always visible.
  - When it is secondary, show a checkbox on **hover** for that item, and show checkboxes on **all** items once one item is selected.
- (web mapping) Use `aria-selected` (option, tab, row, gridcell), `aria-checked` (checkbox, switch, menuitemcheckbox, radio), `aria-pressed` (toggle buttons), `aria-current="page"` (navigation destinations), and `aria-multiselectable` on listbox or grid containers.

### Gestures
- UI must respond to gestures **in real time**.

| Gesture | Use |
|---|---|
| Tap | Navigate or activate |
| Double tap | Zoom in or out of content |
| Long press | Extra functionality, such as entering selection mode |
| Scroll / pan | Move surfaces vertically, horizontally or freely |
| Swipe | Switch peer views (tabs). Reveal or complete actions (for example list item swipe actions) |
| Predictive back (Android) | Swipe from the edge to preview going back. Supported by bottom sheet, navigation bar, navigation rail, search bar, side sheet. The user can cancel before completing |
| Drag | Move elements, slide surfaces in and out, reorder |
| Pick up and move | Long press + drag to reorder (for example calendar events) |
| Pinch | Scale surfaces or navigate between screens (for example a photo to full screen) |
| Compound | Move smoothly between gestures (pan + pinch on maps) |

- Every gesture-only action needs an accessible alternative, such as a button or menu item (derived; required by WCAG 2.5.1 / 2.5.7). Swipe gestures mirror in RTL.

## Layout

> Sources: .../layout/layout-overview, breakpoints, grids-spacing, scaffold, canonical-examples, bidirectionality-rtl. Material layout guidance applies to web. Treat dp as CSS px.

### Terms
- **Breakpoints**: previously called "window size classes".
- **Adaptive design**: previously "responsive layout".
- **Pane**: the container all content lives in. A layout has 1–3 panes, which can be fixed, flexible, floating or semi-permanent.
- **Bars**: app bar and navigation bar regions at the top or bottom edge.
- **Rails**: the perimeter around panes, holding navigation rail, toolbars, FAB and chat input.
- **Safety region**: reserved for system UI such as the status bar or gesture bar. Never put primary content in it.
- **Spacer**: the gap between panes.
- **Margin**: from the window edge to content.
- **Gap**: between elements inside a container.
- **Drag handle**: resizes panes.
- **Rulers**: global alignment lines.
- **Fold**: hinge area on foldable devices.

### Breakpoints (window width)

| Breakpoint | Width (dp) | CSS (web mapping) | Typical devices | Panes (recommended / allowed) | Margins | Spacer between panes |
|---|---|---|---|---|---|---|
| **Compact** | < 600 | `(max-width: 599.98px)` | Phone portrait | 1 / 1 | **16dp** | — |
| **Medium** | 600–839 | `(min-width: 600px) and (max-width: 839.98px)` | Tablet portrait, unfolded foldable portrait | 1 / 1 or 2 | **24dp** | **24dp** |
| **Expanded** | 840–1199 | `(min-width: 840px) and (max-width: 1199.98px)` | Phone landscape, tablet landscape, foldable landscape, desktop | 2 / 1 | **24dp** | **24dp** |
| **Large** | 1200–1599 | `(min-width: 1200px) and (max-width: 1599.98px)` | Desktop | 2 / 1 | **24dp** | **24dp** |
| **Extra-large** | ≥ 1600 | `(min-width: 1600px)` | Desktop, ultra-wide | 2 / 1 or 3 | **24dp** | **24dp** |

- **Height breakpoints**: Android also defines compact, medium and expanded *height* classes, but they are rarely needed because most content scrolls vertically.
- (web mapping) Prefer **container queries** on the pane for component adaptation, and media queries on the window for the scaffold. Design for breakpoints, not devices: the available space changes with multi-window use, folding and rotation, so layouts must transition **dynamically** at runtime.

### Recommended components per breakpoint

| Breakpoint | Navigation | Communication | Supplemental action / selection |
|---|---|---|---|
| Compact | Navigation bar, or modal expanded navigation rail | Simple (basic) dialog, full-screen dialog | Bottom sheet |
| Medium | Navigation bar, or modal expanded rail. Single-pane layouts may use a collapsed navigation rail; two-pane layouts use a navigation bar | Simple dialog | Menu |
| Expanded | Collapsed or (modal or standard) expanded navigation rail | Simple dialog | Menu |
| Large | Modal or standard expanded navigation rail (collapsed is also allowed) | Simple dialog | Menu |
| Extra-large | Modal or standard expanded navigation rail. Expanded is best here | Simple dialog | Menu |

- Allowed swaps:
  - Navigation bar (compact) → collapsed rail (medium, expanded).
  - Collapsed rail (medium, expanded) → expanded rail (large, extra-large).
  - Modal expanded rail (compact, medium) → standard expanded rail (expanded+).
  - Full-screen dialog → basic dialog.
  - Bottom sheet → menu.
  - FAB ↔ extended FAB.
- Swaps must be functionally equivalent and serve an ergonomic purpose. **Don't** swap a button for a chip or a menu. Be careful swapping list items and cards.
- The rail can be hidden in secondary destinations if the primary destination stays reachable via back. Put sorting, filtering and secondary navigation (tabs) inside the pane.

### Adapting across breakpoints: five questions
1. **Reveal**: show hidden UI, such as an open rail or a second pane.
2. **Divide**: 1 pane for compact and medium, 2 for expanded and large, consider 3 for extra-large. Two panes at medium only for low-density content (for example settings). Single-pane immersive layouts suit games, video, video calls and creative tools at any size.
3. **Resize**: cards, feeds, lists and panes can grow. Keep text at **40–60 characters per line** by adjusting margins and type styles.
4. **Reposition**: reflow content and add columns. Move actions from the bottom (compact) to the leading edge (medium and expanded). Internal elements anchor left, right or center, and button icon + label stay centered together.
5. **Swap**: exchange functionally equivalent components (see above).

Component adaptation strategies: **resizing** (hug the content vs. fill the container), **showing and hiding** (for example list items reveal more text), and **presentation changes** (orientation, color, type, shape, configuration, such as FAB → extended FAB or rail → expanded).

### Grid & columns
- A grid underlies every layout. Column count, width and spacing change with the breakpoint.
- Source examples: **4 columns at compact** and **8 columns at medium/foldable** (an 8-column tablet with two 4-column panes). The source does not give exact counts for expanded, large and extra-large. Derived from classic M3: 12 columns.
- Columns are blocks of content *within a pane*.
- Placement order: (1) bars and rails nearest the screen edges (navigation bar or rail, toolbars, app bars), then (2) panes in the main region.
- **Rulers** are alignment lines:
  - margin ruler (adjustable narrower or wider for expressive negative space or full-bleed media);
  - bar and safety rulers (keep actionable content out of system UI);
  - title ruler (aligns the app bar title, icons and components);
  - content rulers (first: hero, headline, primary component; secondary: supplementary text and actions).
  - Components and media may use different margin rulers. Example: a full-width photo grid next to a search bar with wider margins.

### Panes & scaffold

**Scaffold**: safety region → bars → rails → panes.
- **Bars** frame the screen and can span one pane or the whole window.
  - App bar at the top, below the safety region: title + 1–2 essential actions.
  - Navigation bar at the bottom, above the safety region: 3–5 destinations, compact and medium.
- **Rails** are the perimeter regions.
  - On compact, the top and bottom rail regions hold toolbars, chat inputs, FABs and screen-level controls. A floating toolbar sits above the navigation bar.
  - On larger screens, the leading rail holds the navigation rail (collapsed or expanded). The trailing rail holds supporting controls such as a vertical toolbar.
- **Panes** hold all content. Each pane is a single destination.
  - **Fixed** panes keep their width. **Flexible** panes grow and shrink. Every layout needs **at least one flexible** pane.
  - Panes can be **permanent** or **temporary** (dismissible, which resizes the others).
  - **Single pane**: one flexible pane, usable at any breakpoint, recommended for compact and medium.
  - **Split pane**: two flexible panes with the **spacer visually centered**. Navigation (rail or drawer) shrinks only the leading pane, so the navigation plus the first pane = 50% and the second pane = 50%. With a navigation bar or no navigation, each pane is 50%. Best for foldables and dynamic layouts. At medium, use 50/50 and no custom widths.
  - **Fixed + flexible**: the fixed pane is **360dp at expanded** and **412dp at large and extra-large**. Either order is fine. The fixed pane is often temporary (side sheet, low-density list).
  - **Three panes**: extra-large only, using a **standard side sheet** as the third pane (side sheet max width 400dp). The rail can stay, collapse or hide. **Never more than 3 panes.**
- **Containment**:
  - Implicit grouping: panes blend with the background.
  - Explicit grouping: distinct container color or outline.
  - XR: panes always use a container color.
- **Drag handles** (pane resizing):
  - Split panes resize freely or snap. Fixed + flexible: the handle fully collapses or expands the fixed pane.
  - The handle must also **toggle** layout sizes on selection: tap, double tap or long press, plus keyboard access (web mapping: `role="separator"` with `aria-valuenow`, `aria-orientation="vertical"`, focusable, arrow keys to resize, Enter to toggle collapse).
  - Snap widths at expanded, large and extra-large: **360dp, 412dp**, or split with the spacer centered.
  - **Persistent resizing** (the default for most layouts): remember the user's width across sessions and breakpoint changes. A layout collapsed to one pane stays collapsed.
  - **Temporary resizing** (supporting pane layouts): reset to the default when the pane or app is reopened.
- **Multi-pane presentation**:
  - **Co-planar**: side by side. Persistent tool panels must be co-planar.
  - **Floating**: above the other panes, like a dialog. Temporary tasks stay floating at every breakpoint. On large screens floating is the default and the scrim is optional. Movable or resizable floating panes need accessible controls.
  - **Docked**: pinned to an edge, like a bottom sheet. At medium and expanded it can become floating or co-planar. On large screens, prefer co-planar.
- **Adaptive strategies**:
  - **Show/hide**: panes enter or exit.
  - **Levitate**: a pane becomes floating or docked relative to its trigger.
  - **Reflow**: panes reorder or stack. For example, in portrait the supporting pane moves below the primary pane.

### Canonical layouts

| Layout | Use | Compact | Medium | Expanded+ |
|---|---|---|---|---|
| **Feed** | Grid of cards or lists for browsing (news, photos, social) | Single column; items fill the pane width | Multiple columns, mixed widths (for example 4 equal columns) | More, wider columns. Items reflow on rotation, unfold or multi-window. Order follows position |
| **List-detail** | Parent/child data (inbox + message, files + folder, settings + category) | 1 pane (list *or* detail) | 1 pane (recommended for dense content or deep focus) or 2 (browsing). For 2 panes use a navigation bar or modal rail | 2 panes |
| **Supporting pane** | Primary (~2/3) + secondary content that only makes sense with the primary (docs + comments, video + up next) | Supporting pane **below** (flexible); a bottom sheet works well | Below (flexible) | Leading or trailing, **fixed 360dp** |

List-detail behavior:
- Show the back button **only** in single-pane detail. Show the selected state **only** in two-pane list.
- With no item selected, a single pane shows the list and two panes show a placeholder or empty state in the detail pane.
- Going from 1 to 2 panes with an item selected: show both panes, with that item's detail.
- Going from 2 to 1 pane: usually show the detail with an app bar. For multi-select, show the list with the selection kept. Return to the view the user last saw.
- Keep state when switching details (read/unread status, scroll position).

Custom layouts: build on the canonical layouts or layer scaffold elements. **Layering** with levitate suits focused tasks such as a cart, comments or event creation.

### Spacing
- Use spacing to **group** related items:
  - Implicit grouping: proximity and open space, as in carousels or an image + caption.
  - Explicit grouping: outlines, dividers, shadows, cards. Explicit grouping can also signal that something is interactive.
- Use spacing to **direct attention**:
  - **Rhythm**: consistent spacing, for example equal horizontal gaps between cards of different heights.
  - **Similarity**: same size and spacing for like items; always align leading thumbnails, avatars and icons.
  - **Proximity**: put buttons close to the content they affect.
  - **Continuity**: put related items in a row, column or container, such as a chip row.
- **Expression**: give key content generous negative space and the brightest surfaces. Keep focal points consistent across pages. Denser layouts feel serious and focused; more spacious layouts feel calm and open. Desktop can use more generous spacing than mobile.
- Margins and spacers per breakpoint are in the breakpoint table. Specific spacing tokens are not given on these pages (see the spacing system reference).

### Density
- **Information density** (layout spacing: margins, spacers, padding) is separate from **component density** (internal component spacing).
- Component density scale: **0** is the default, then **-1, -2, -3** for increasingly dense. Each step usually takes **4dp** off the top and bottom padding or the height.
  - Keep grouped content centered in the container.
  - **Text size must not change** with density.
  - Example: the text field label-to-input distance stays 20dp.
- Rules:
  - Density is **opt-in** by the user and must not apply by default if it would push targets below **48×48 CSS px**.
  - Density controls themselves must use default 48×48 targets so the change can be undone.
  - Density **must not change automatically** across breakpoints or orientation.
  - **Don't** increase density for focused tasks such as menus (example: a 38dp item height is too small) or for alerting components such as snackbars and dialogs.
  - Use higher density for data-heavy views (tables, dashboards, finance, news) and lower density for focused or aesthetic products.
- Units: `dp = px × 160 / dpi`. 1dp equals 1 physical px at 160dpi. Treat 1dp as 1 CSS px on the web.

### Ergonomics / reachability
- **Compact**: put navigation near the bottom edge.
- **Medium/expanded tablets and foldables in landscape**: the **top 25%** of the screen is hard to reach, so limit interactions there. Also avoid putting essential controls too close to the bottom edge.
- Ergonomic regions: inconvenient (stretch), comfortable, challenging.

### Bidirectionality & RTL mirroring
- Use **leading/trailing** (start/end), never left/right. (web mapping) Use CSS logical properties (`margin-inline-start`, `inset-inline-end`, `padding-inline`, `border-start-start-radius`), `dir="rtl"` or `:dir(rtl)` for mirrored assets, and `text-align: start`.
- **Mirror**:
  - The whole layout order and alignment. Reading starts at the top right.
  - All canonical layouts (feed, list-detail, supporting pane).
  - Navigation rail and expanded rail on the **right** (leading edge).
  - App bar layout.
  - Toolbar tool order (the FAB moves to the left).
  - Badge position (top-left of the icon).
  - Text field leading and trailing icons.
  - The chip trailing icon (at the end, so on the left).
  - Directional icons (back, forward, arrows, send). Help or question-mark icons in some languages, such as Urdu and Persian.
  - Linear progress indicators (fill from the right) — **except Hebrew** (stays LTR).
  - Linear representations of time.
  - Swipe gestures (for example swipe-to-reveal from the left) and predictive back.
  - The 12h clock AM/PM selector goes to the left.
- **Do not mirror**:
  - Circular progress (still clockwise).
  - Clocks and clock-face direction, clock icons, circular refresh icons, and clockwise arrows.
  - **Media controls and media progress** (always LTR).
  - Timelines and media controls in Hebrew.
  - Graphs and charts for Persian and Urdu (stay LTR).
  - Email addresses, URLs and phone numbers: keep their logical order (for example the domain stays to the right of the username).
- Text needs both RTL **alignment** and RTL **directionality**. Applying LTR direction to RTL text scrambles word order. Watch text entry, caret position, punctuation, phone numbers and URLs. (web mapping) Use `dir="auto"` on user-generated text, and `<bdi>` or `unicode-bidi: isolate` for embedded opposite-direction strings.

## Accessibility

> Sources: .../foundations/overview, designing, building-for-all, usability (WCAG-based).

### Principles
- **Accessibility by default**. Design for low vision, blindness, hearing, cognitive and motor impairments, and situational disabilities.
- **Honor individuals**: offer customization and respect user preferences and settings.
- **Learn before, not after**: research with people of a wide range of abilities.
- **Requirements as a starting point**: treat WCAG as a minimum.
- **Building for all**: consider age, culture, disability, literacy, ethnicity, gender, geography, physical attributes, race, religion, sexual orientation, socioeconomic status and tech proficiency. Co-design with overlooked communities and mitigate bias in ML/AI features.
- **Usability** (separate from accessibility): efficiency, errors, learnability, memorability, satisfaction. M3 Expressive tactics (color contrast, containment, size, shape and shape morph, typography, sparing motion) make key actions faster to find: up to 4× faster in M3 Expressive research. The primary action should be the largest and most reachable element. Don't combine too many expressive tactics at once.

### Assistive technology to support
- Keyboard and directional controllers (D-pad, trackball).
- Screen readers (TalkBack, VoiceOver, NVDA, JAWS) and braille displays.
- Switch access (scanning).
- Voice input, tracking input, magnifiers.
- Prefer **native or semantic elements** (semantic HTML, native `<dialog>`, `<button>`, `<input>`). Custom elements need extra assistive-technology testing.

### Target size & spacing

| Rule | Value |
|---|---|
| Touch target (minimum) | **48×48dp** (about 9mm physical; recommended 7–10mm). The target can extend beyond the visual bounds: a 24dp icon or a 40dp state layer still gets a 48dp target |
| Pointer target (mouse or stylus) | at least **44×44dp** |
| iOS reference | 44×44pt |
| Target spacing | **8dp** or more between targets |
| Density | Never below 48×48 by default (see Density) |

(web mapping) Expand the hit area with a transparent `::before` (or padding) of at least 48×48px centered on the control, without changing its visual size. This also satisfies WCAG 2.5.8 (24px minimum) and 2.5.5 (44px).

### Contrast

| Element | Minimum contrast |
|---|---|
| Small text | **4.5:1** against the background |
| Large text (≥14pt bold or ≥18pt regular) and graphics | **3:1** |
| Non-text UI in a **cluster** (for example button containers in a group) | **3:1** container vs. background |
| Standalone prominent elements (for example a FAB) | 3:1 container vs. background not required |
| Disabled states | Exempt |

- When grouping components, use types that each reach 3:1 against the background.
- Never convey state by color alone: use the two-indicator rule for states, check marks for selection, and icons plus text for errors.
- (web mapping) Under `@media (prefers-contrast: more)`, switch to the high-contrast color scheme if one is provided. Under `@media (forced-colors: active)`, use system colors (`CanvasText`, `Highlight`, `ButtonText`), keep outlines and borders visible, and keep focus rings as `outline`.

### Structure, landmarks & headings (web)
- Screen readers follow the **DOM order**, not the CSS visual order. Write HTML in reading order. Visual reordering (`order`, grid placement, `row-reverse`) must not break the logical order.
- The eight landmark roles:
  - **navigation**: there can be several, each with a distinct label.
  - **search**.
  - **main**: only one.
  - **banner**: only one.
  - **complementary**.
  - **contentinfo**: only one.
  - **region**: must have a label. Regions can be nested in main.
  - **form**.
- Label landmarks that repeat, and every region. Don't include the role word in the label (use "Primary", not "Primary navigation").
- Headings:
  - Base headings on content hierarchy, not visual style. Visual prominence does not need to match the heading level.
  - Use H1–H6 in order and never skip a level.
  - Use a single H1 for the page title.
  - Headings must be meaningful titles.

### Focus order & keyboard traversal
- All goals must be achievable with **Tab, arrow keys, Enter, Space, Escape** and common shortcuts.
- Use the default tab order (DOM order: left to right, top to bottom). Customize only for special patterns. Avoid positive `tabindex`.
- Reduce the number of tab stops. Group a composite widget into **one tab stop** and use **arrow keys** inside it.
- Define the **initial focus** for each screen (on the most common goal, for example the search field) and for complex components (dialogs, complex cards).
- Modal or floating content (dialogs, modal panes, menus):
  - Move focus inside on open, to the relevant first element.
  - Make content behind it inert.
  - On close, return focus to the trigger.
  - If it opened automatically, send focus to the next logical element on close.
  - A modal floating pane dismisses when the user interacts with content behind it.
- Non-modal floating panes: focus can move in and out freely, and the pane appears in a logical reading order.
- Co-planar and docked panes: focus order matches the visual pane arrangement.
- Docked panes follow the same rules as modal or non-modal panes.
- (web mapping):
  - `inert` on background content for modals.
  - `:focus-visible` for the ring.
  - Roving `tabindex` or `aria-activedescendant` for composites.
  - Follow WAI-ARIA APG keyboard patterns per component.
  - Never remove the outline without a replacement.

### Labels (accessible names)
- **Needs a label**:
  - Icon-only buttons or controls, or controls whose text lacks context (an edit pencil, repeated "Save").
  - Interactive images.
  - Visual cues (progress, errors).
  - Meaningful icons (status).
  - Meaningful images (diagrams, substantive photos, illustrations).
  - Generic links ("Learn more").
- **No extra label needed**: non-interactive text, and buttons with sufficient text ("Download image").
- Labels describe **purpose, not appearance**: "Voice search", not "Microphone"; "Search", not "Magnifying glass". Be concise and include content, purpose and behavior.
- **Never include the role** in the label: "Got it", not "Got it button". The role is announced automatically.
- Mark decorative images and icons as hidden.
- Assign a role to every interactive element. Elements that look the same may need different roles.
- (web mapping):
  - Use `aria-label` or `aria-labelledby` for icon buttons.
  - Use `alt=""` + `aria-hidden="true"` for decorative content.
  - Native roles first, then explicit ARIA roles (`button`, `switch`, `checkbox`, `tab`, `menuitem`, `slider`, ...).
  - Use `aria-describedby` for supporting and error text.
  - Use `aria-live` or `role="status"` / `alert` for dynamic messages (snackbars, errors).

### Text scaling & readability
- Keep line length at **40–60 characters**. Adjust margins and type to keep it there, especially at large and extra-large.
- Density changes must not change text size.
- (web mapping) Size type and components in `rem` so they respect the user's font size. Support 200% text zoom and 400% page zoom (reflow at 320 CSS px width) without loss of content or function. Avoid fixed heights on text containers. Containers must grow with text (use min-height, not height).

### Motion sensitivity
- Use motion sparingly. It should emphasize key moments and must not distract. Avoid animating several things at once, such as text width changes alongside a shape morph.
- (web mapping) Under `@media (prefers-reduced-motion: reduce)`:
  - Replace spatial springs, shape morphs, ripples and large transitions with instant changes or short opacity fades.
  - Never autoplay looping motion without a pause control.
  - Avoid flashing (WCAG 2.3.1).

### Implementation checklist
- [ ] State layer element in every interactive component: content-colored, with sys state opacities (0.08 / 0.10 / 0.10 / 0.16), one at a time, 40dp for icon controls.
- [ ] Focus ring: 3dp, `secondary`, 2dp outer offset (−3dp inner for full-bleed items), follows the shape, shown on `:focus-visible` only.
- [ ] Disabled: on-surface content at 0.38, container/outline per component token (see Disabled color recipe), elevation level0, not focusable, no state layers.
- [ ] Ripple for pointer, touch and keyboard. Same feedback for mouse and touch.
- [ ] 48×48 targets (44 for pointer at minimum), 8dp spacing.
- [ ] Contrast: 4.5:1 for small text, 3:1 for large text, graphics and clustered containers.
- [ ] Keyboard: Tab between, arrows within, Enter/Space activate, Escape dismisses or clears. Shortcuts use two or more keys.
- [ ] Breakpoint-aware scaffold: 16dp / 24dp margins, 24dp spacer, 360/412dp fixed panes, centered split spacer, at most 3 panes.
- [ ] Logical properties everywhere. Mirror and don't-mirror lists respected.
- [ ] Reduced motion, forced colors, prefers-contrast and text zoom supported.

---

## Shared implementation primitives

> Framework-agnostic HTML/CSS (+ minimal JS) building blocks. Component files reference them **by name** ("state layer primitive", "focus ring primitive", …) and only specify their own tokens/values. Everything here is a web mapping of the rules above; values not stated by the source are marked (derived) or (implementation suggestion). Private per-component variables use the `--_name` convention; library-level helpers that are not M3 tokens use `--md-<name>` (never `--md-sys-*`).

### Host anatomy (shared by all interactive components)

```html
<button class="md-host" type="button">
  <span class="md-state-layer" part="state-layer" aria-hidden="true"></span> <!-- state layer + ripple -->
  <span class="md-touch-target" part="touch-target" aria-hidden="true"></span> <!-- only if visual < 48px -->
  <!-- content: icon / label / … -->
</button>
```

```css
.md-host {
  position: relative; isolation: isolate;     /* new stacking context: layer z-index:-1 sits above the host background, below content */
  box-sizing: border-box; border: 0; margin: 0;
  font: inherit; color: var(--_content-color);
  background-color: var(--_container-color, transparent);
  border-radius: var(--_shape);
  cursor: pointer; -webkit-tap-highlight-color: transparent; user-select: none;
  outline: none;                              /* focus ring primitive re-adds it on :focus-visible */
}
```

### State layer primitive

Overlay between container and content, color = the content color (icon color if present, else label color), opacity from `md.sys.state.*`. One layer at a time; priority dragged > pressed > focus > hover (source order below).

```css
.md-state-layer {
  position: absolute; inset: 0; z-index: -1;
  border-radius: inherit; overflow: hidden; pointer-events: none;
  background-color: var(--_state-layer-color, currentColor);
  opacity: 0;
  transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
@media (hover: hover) {                                       /* no stuck hover after touch */
  .md-host:hover > .md-state-layer        { opacity: var(--md-sys-state-hover-state-layer-opacity); }
}
.md-host:focus-visible > .md-state-layer  { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.md-host:active > .md-state-layer,
.md-host[data-pressed] > .md-state-layer  { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
.md-host[data-dragging] > .md-state-layer { opacity: var(--md-sys-state-dragged-state-layer-opacity); }
.md-host:is(:disabled, [aria-disabled="true"]) > .md-state-layer { opacity: 0; }
```
- Variants: cover a sub-part (put `.md-state-layer` inside that part, e.g. switch handle, checkbox icon) or a **circle** (`inset:auto; inline-size:40px; block-size:40px; border-radius:50%`, centered) for icon-like controls: state layer 40px, target 48px.
- Without ripple the layer can be a `::before` pseudo-element with the same rules.
- Selected/activated styles change `--_container-color`/`--_content-color`/`--_state-layer-color`; the transient layer then uses the selected content color.

### Ripple primitive

Optional pressed feedback inside the state layer (the static pressed layer above is the minimum). Same feedback for mouse, pen, touch and keyboard.

```css
.md-ripple {
  position: absolute; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, var(--_state-layer-color, currentColor) max(100% - 70px, 65%), transparent 100%);
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
  transform: translate(-50%, -50%) scale(0.2);
  animation: md-ripple-grow 450ms var(--md-sys-motion-easing-standard) forwards; /* (implementation suggestion) */
}
.md-ripple[data-release] { transition: opacity 375ms linear; opacity: 0; }    /* (implementation suggestion) */
@keyframes md-ripple-grow { to { transform: translate(-50%, -50%) scale(1); } }
@media (prefers-reduced-motion: reduce) { .md-ripple { display: none; } }
```
```js
// JS: pointerdown → origin = pointer position; keydown Enter/Space → origin = center.
function ripple(layer, x, y) {               // x,y relative to layer box
  const r = layer.getBoundingClientRect(), d = 2 * Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
  const s = Object.assign(document.createElement('span'), { className: 'md-ripple' });
  Object.assign(s.style, { left: `${x}px`, top: `${y}px`, width: `${d}px`, height: `${d}px` });
  layer.append(s);
  const end = () => { s.dataset.release = ''; s.addEventListener('transitionend', () => s.remove(), { once: true }); };
  addEventListener('pointerup', end, { once: true }); addEventListener('pointercancel', end, { once: true });
  return end;                                 // call on keyup for keyboard activation
}
```
Ignore non-primary buttons and `disabled`; do not start a ripple when the press becomes a scroll (`pointercancel`).

### Focus ring primitive

```css
.md-host:focus-visible {
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-secondary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);          /* 2px, outside */
}
.md-host.md-focus-inward:focus-visible {                                     /* clipped / full-bleed items (list items, tabs, menu items) */
  outline-offset: var(--md-sys-state-focus-indicator-inner-offset);          /* -3px, inside */
}
```
- `outline` follows `border-radius` in current browsers, so the ring follows the container shape (radius + offset) automatically. Use a separate `[part=focus-ring]` element (absolutely positioned, `inset: calc(-1 * offset)`, `border-radius: calc(var(--_shape) + offset)`) only when the ring must follow a different element than the host.
- Only on `:focus-visible`; Escape hides it (JS: add `data-focus-hidden` to the root until the next keyboard Tab, and gate the rule with `:root:not([data-focus-hidden])`).
- Never replace it with `box-shadow` (invisible in forced colors).

### Touch target primitive

Invisible ≥48×48px hit area centered on controls whose visual box is smaller (icon buttons 40px, checkbox 18px, radio 20px, small chips 32px…).

```css
.md-touch-target {
  position: absolute; top: 50%; left: 50%;    /* physical centering is direction-agnostic */
  inline-size: max(100%, 48px); block-size: max(100%, 48px);
  translate: -50% -50%;
}
/* or as a pseudo-element: .md-host::after { content: ""; …same rules… } */
@media (pointer: fine) { .md-dense .md-touch-target { inline-size: max(100%, 40px); block-size: max(100%, 40px); } } /* opt-in density only */
```
The host must not have `overflow: hidden` (that clips the target); clipping lives on `.md-state-layer`. Keep ≥8px between targets.

### Elevation primitive

Elevation tokens are distances; the web renders them as shadows (implementation suggestion: two-layer key + ambient shadows from the Material web components) with a themeable color from `md.sys.color.shadow`.

```css
:root {
  --md-elevation-key: color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent);
  --md-elevation-ambient: color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent);
  --md-sys-elevation-level0: none;                                                                   /* 0dp  */
  --md-sys-elevation-level1: 0 1px 2px 0 var(--md-elevation-key), 0 1px 3px 1px var(--md-elevation-ambient);   /* 1dp  */
  --md-sys-elevation-level2: 0 1px 2px 0 var(--md-elevation-key), 0 2px 6px 2px var(--md-elevation-ambient);   /* 3dp  */
  --md-sys-elevation-level3: 0 1px 3px 0 var(--md-elevation-key), 0 4px 8px 3px var(--md-elevation-ambient);   /* 6dp  */
  --md-sys-elevation-level4: 0 2px 3px 0 var(--md-elevation-key), 0 6px 10px 4px var(--md-elevation-ambient);  /* 8dp  */
  --md-sys-elevation-level5: 0 4px 4px 0 var(--md-elevation-key), 0 8px 12px 6px var(--md-elevation-ambient);  /* 12dp */
}
.md-host {
  box-shadow: var(--md-comp-x-container-elevation, var(--md-sys-elevation-level0));
  transition: box-shadow var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing);
}
```
- Components set `--md-comp-<c>-container-elevation` (and per-state values: hover usually +1 level, pressed back to resting, disabled `level0`).
- `var()` inside a custom property resolves where it is declared: to theme shadow color per subtree, re-declare `--md-elevation-key/-ambient` (and the levels) on that subtree.
- Put the shadow on an unclipped wrapper/`::before` when the container uses `clip-path` (clip-path clips shadows). Tonal separation (surface-container roles) remains the default way to show elevation; components at level 0 render no shadow.

### Spring primitive

Every spring token is exposed as four custom properties: `--md-sys-motion-spring-<speed>-<type>-{stiffness,damping,easing,duration}` (`speed` ∈ fast|default|slow, `type` ∈ spatial|effects). `stiffness`/`damping` feed the JS solver; `easing`/`duration` are the source's web conversion table, for CSS transitions without interruption or gestures. **Library default scheme: expressive** (motion guidelines); standard via `data-motion-scheme="standard"` on any subtree.

```css
:root, [data-motion-scheme="expressive"] {
  --md-sys-motion-spring-fast-spatial-stiffness: 800;  --md-sys-motion-spring-fast-spatial-damping: 0.6;
  --md-sys-motion-spring-fast-spatial-easing: cubic-bezier(0.42, 1.67, 0.21, 0.90);  --md-sys-motion-spring-fast-spatial-duration: 350ms;
  --md-sys-motion-spring-default-spatial-stiffness: 380;  --md-sys-motion-spring-default-spatial-damping: 0.8;
  --md-sys-motion-spring-default-spatial-easing: cubic-bezier(0.38, 1.21, 0.22, 1.00);  --md-sys-motion-spring-default-spatial-duration: 500ms;
  --md-sys-motion-spring-slow-spatial-stiffness: 200;  --md-sys-motion-spring-slow-spatial-damping: 0.8;
  --md-sys-motion-spring-slow-spatial-easing: cubic-bezier(0.39, 1.29, 0.35, 0.98);  --md-sys-motion-spring-slow-spatial-duration: 650ms;
}
[data-motion-scheme="standard"] {
  --md-sys-motion-spring-fast-spatial-stiffness: 1400;  --md-sys-motion-spring-fast-spatial-damping: 0.9;
  --md-sys-motion-spring-fast-spatial-easing: cubic-bezier(0.27, 1.06, 0.18, 1.00);  --md-sys-motion-spring-fast-spatial-duration: 350ms;
  --md-sys-motion-spring-default-spatial-stiffness: 700;  --md-sys-motion-spring-default-spatial-damping: 0.9;
  --md-sys-motion-spring-default-spatial-easing: cubic-bezier(0.27, 1.06, 0.18, 1.00);  --md-sys-motion-spring-default-spatial-duration: 500ms;
  --md-sys-motion-spring-slow-spatial-stiffness: 300;  --md-sys-motion-spring-slow-spatial-damping: 0.9;
  --md-sys-motion-spring-slow-spatial-easing: cubic-bezier(0.27, 1.06, 0.18, 1.00);  --md-sys-motion-spring-slow-spatial-duration: 750ms;
}
:root {                                                    /* effects: identical in both schemes */
  --md-sys-motion-spring-fast-effects-stiffness: 3800;  --md-sys-motion-spring-fast-effects-damping: 1;
  --md-sys-motion-spring-fast-effects-easing: cubic-bezier(0.31, 0.94, 0.34, 1.00);  --md-sys-motion-spring-fast-effects-duration: 150ms;
  --md-sys-motion-spring-default-effects-stiffness: 1600;  --md-sys-motion-spring-default-effects-damping: 1;
  --md-sys-motion-spring-default-effects-easing: cubic-bezier(0.34, 0.80, 0.34, 1.00);  --md-sys-motion-spring-default-effects-duration: 200ms;
  --md-sys-motion-spring-slow-effects-stiffness: 800;  --md-sys-motion-spring-slow-effects-damping: 1;
  --md-sys-motion-spring-slow-effects-easing: cubic-bezier(0.34, 0.88, 0.34, 1.00);  --md-sys-motion-spring-slow-effects-duration: 300ms;
}
/* usage: transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing); */
```
- Optional higher fidelity: replace `-easing` with a build-time `linear()` sampled from the spring (see Motion → Implementing springs) and set `-duration` to its settling time; keep the cubic-bezier as `@supports not (transition-timing-function: linear(0, 1))` fallback.
- Spatial easings overshoot (y > 1): only use them on transform/size/radius, never on opacity/color.

JS solver outline (gestures, interruption, retargeting):
```js
export function readSpring(el, speed = 'fast', type = 'spatial') {
  const cs = getComputedStyle(el), p = (k) => parseFloat(cs.getPropertyValue(`--md-sys-motion-spring-${speed}-${type}-${k}`));
  return { stiffness: p('stiffness'), damping: p('damping') };
}
export function animateSpring({ stiffness, damping, from, to, velocity = 0, onUpdate, onDone }) {
  const c = 2 * damping * Math.sqrt(stiffness);           // mass = 1, damping = ratio ζ
  let x = from, v = velocity, target = to, last, raf;
  const eps = 1e-3 * Math.max(1, Math.abs(to - from));
  const step = (now) => {
    let dt = Math.min((now - (last ?? now)) / 1000, 0.064); last = now;
    while (dt > 0) { const h = Math.min(dt, 0.004); v += (-stiffness * (x - target) - c * v) * h; x += v * h; dt -= h; } // semi-implicit Euler, ≤4ms sub-steps
    if (Math.abs(x - target) < eps && Math.abs(v) < eps * 10) { onUpdate(target); onDone?.(); return; }
    onUpdate(x); raf = requestAnimationFrame(step);
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onUpdate(to); onDone?.(); }
  else raf = requestAnimationFrame(step);
  return { retarget: (t) => { target = t; }, stop: () => cancelAnimationFrame(raf), get value() { return x; }, get velocity() { return v; } };
}
```
Retargeting keeps `x`/`v` (no jump); a drag release passes the pointer velocity (normalized to the animated unit) as `velocity`.

### Disabled recipe

Use `:disabled` on native controls; `aria-disabled="true"` when the control must stay focusable (e.g. to expose a tooltip). Disabled = no state layer, no ripple, not focusable/pressable/draggable, elevation `level0`, exempt from contrast rules. Never use element `opacity` (it fades container and content together and breaks the separate opacities).

```css
.md-host:is(:disabled, [aria-disabled="true"]) {
  cursor: default; pointer-events: none;      /* keep pointer-events if a tooltip must still show; then guard click in JS */
  color: color-mix(in srgb, var(--md-sys-color-on-surface) calc(var(--_disabled-content-opacity, 0.38) * 100%), transparent);
  background-color: color-mix(in srgb, var(--_disabled-container-color, var(--md-sys-color-on-surface)) calc(var(--_disabled-container-opacity, 0.10) * 100%), transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-on-surface) calc(var(--_disabled-outline-opacity, 0.12) * 100%), transparent);
  box-shadow: var(--md-sys-elevation-level0);
}
@media (forced-colors: active) { .md-host:is(:disabled, [aria-disabled="true"]) { color: GrayText; border-color: GrayText; } }
```
Per-component opacities (`--_disabled-*`) come from the component token tables; values are in Interaction states → Disabled color recipe.

### Typography role mixin

CSS has no mixins: each role is applied with the same five-property pattern (utility classes for app code; inline pattern with component tokens inside components).

```css
.md-typescale-body-large {
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size) / var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}
/* inside a component (comp token → sys fallback): */
.label {
  font: var(--md-comp-x-label-text-weight, var(--md-sys-typescale-label-large-weight))
        var(--md-comp-x-label-text-size, var(--md-sys-typescale-label-large-size)) /
        var(--md-comp-x-label-text-line-height, var(--md-sys-typescale-label-large-line-height))
        var(--md-comp-x-label-text-font, var(--md-sys-typescale-label-large-font));
  letter-spacing: var(--md-comp-x-label-text-tracking, var(--md-sys-typescale-label-large-tracking));
}
```
- Emphasized: same pattern with `--md-sys-typescale-emphasized-<role>-*`. Selected-state weight changes: prefer swapping only `-weight` (or `GRAD` on variable fonts) so text doesn't reflow.
- Long labels: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` (single line) or `display: -webkit-box; -webkit-line-clamp: N; -webkit-box-orient: vertical` (multi-line); components state which.

### Shape morph recipe

Rounded-rectangle morphs (press/select squish, FAB menu, button groups, toolbar) animate `border-radius` between corner tokens with the **spatial** spring of the component (usually fast spatial); color changes in the same interaction use the matching **effects** spring.

```css
@property --_radius { syntax: '<length>'; inherits: false; initial-value: 0px; }   /* registered → animatable, overshoot allowed */
.md-host {
  --_radius: var(--md-comp-x-container-shape, var(--md-sys-shape-corner-medium));
  border-radius: var(--_radius);
  transition: --_radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
}
.md-host:active, .md-host[data-pressed] { --_radius: var(--md-comp-x-pressed-container-shape, var(--md-sys-shape-corner-small)); }
.md-host[aria-pressed="true"]          { --_radius: var(--md-comp-x-selected-container-shape, var(--md-sys-shape-corner-large)); }
```
- **Full in morphs**: never interpolate to `9999px` (the browser scales overlapping radii, so the visible change happens in the last ~1% of the curve, i.e. a snap). Use the real half-height in px: `--_full: calc(var(--_height) / 2)` (heights come from the component size tokens). `9999px` is fine for static pill shapes.
- **Percentages**: `50%` is only correct for square elements (circle); on non-square boxes it produces an ellipse, and %↔px interpolation is relative to each axis. Prefer px for all component radii.
- **Asymmetric / inner corners**: animate the logical longhands (`border-start-start-radius`, `border-start-end-radius`, `border-end-start-radius`, `border-end-end-radius`) with one registered property per side, e.g. `--_outer` and `--_inner` (button group / split button inner corners).
- Overshoot that drives a radius below 0 is clamped to 0 by the browser (harmless). `transition` restarts from the current value on interruption (no velocity); use the JS solver for gesture-driven morphs.
- Library (non-rectangular) shapes: see Shape → Shape library & morphing. Reduced motion: snap to the end radius (transition-duration 0).

### Scrim / modal layer recipe

- Prefer the **top layer**: `<dialog>` + `showModal()` (dialogs, modal sheets, modal drawers/rails) and the `popover` attribute (menus, tooltips, rich tooltips, snackbars via `popover="manual"`). The top layer needs no z-index, escapes `overflow`/`transform` ancestors, and `showModal()` makes the rest of the page inert, traps focus, and handles Escape (`cancel` event).
- Scrim: `scrim` role at 32% opacity, animated with the default effects spring:
```css
dialog.md-modal::backdrop {
  background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent);
  transition: opacity var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing);
}                                                      /* exit animation: also transition `overlay`/`display` with allow-discrete on the dialog */
@starting-style { dialog.md-modal[open]::backdrop { opacity: 0; } }
:root:has(dialog.md-modal[open]:modal) { overflow: hidden; }          /* scroll lock */
```
- Non-top-layer fallback z-index scale (implementation suggestion; library helpers, not M3 tokens): `--md-z-app-bar: 100; --md-z-fab: 200; --md-z-standard-sheet: 300; --md-z-scrim: 400; --md-z-modal: 500; --md-z-menu: 600; --md-z-snackbar: 700; --md-z-tooltip: 800`. When not using `<dialog>`: set `inert` on all siblings of the modal's root container, move focus inside, restore on close.
- Focus: initial focus on the first meaningful element (or `autofocus`); on close return focus to the trigger (store `document.activeElement` before opening). Clicking the scrim dismisses when the component allows it (`dialog.addEventListener('click', e => e.target === dialog && dialog.close())`, with the surface as an inner element).

### RTL recipe

- Layout with logical properties only: `padding-inline-start/end`, `margin-inline`, `inset-inline-start/end`, `border-start-start-radius` …, `text-align: start`, flex/grid (auto-mirrors). Never `left/right` except for symmetric centering.
- Transforms do not mirror: use a direction multiplier: `.md-host { --_dir: 1; } .md-host:dir(rtl) { --_dir: -1; }` → `translate: calc(var(--_dir) * 100%) 0`.
- Directional icons (back, forward, arrow, send, chevron) mirror: `:dir(rtl) .md-icon[data-mirror] { transform: scaleX(-1); }`. Don't mirror the items listed under Layout → Bidirectionality (clocks, circular progress, media controls…).
- Keyboard: Left/Right arrows map to previous/next in **visual** order (swap in RTL); read direction in JS via `getComputedStyle(el).direction`. Swipe gestures and slider values mirror too (except media progress).

### Forced-colors recipe

```css
@media (forced-colors: active) {
  .md-host { outline: 1px solid ButtonText; outline-offset: -1px; } /* fills disappear: draw the container edge without changing layout */
  .md-state-layer, .md-ripple { display: none; }
  .md-host:focus-visible { outline: var(--md-sys-state-focus-indicator-thickness) solid Highlight; outline-offset: var(--md-sys-state-focus-indicator-outer-offset); }
  .md-host:is([aria-pressed="true"], [aria-selected="true"], [aria-current], :checked) { background: Highlight; color: HighlightText; forced-color-adjust: none; }
  .md-host:is(:disabled, [aria-disabled="true"]) { color: GrayText; border-color: GrayText; }
  .md-icon { color: currentColor; } svg { fill: currentColor; }
}
```
Shadows are removed by the browser; selected state must therefore also be carried by a non-color cue (icon, check, outline) per the two-indicator rule. Use `forced-color-adjust: none` only where the component paints system colors itself (e.g. selected indicator above) or for color swatches.

### Reduced-motion recipe

```css
@media (prefers-reduced-motion: reduce) {
  :root, [data-motion-scheme] {
    --md-sys-motion-spring-fast-spatial-duration: 0ms;
    --md-sys-motion-spring-default-spatial-duration: 0ms;
    --md-sys-motion-spring-slow-spatial-duration: 0ms;            /* spatial (move/scale/morph) → instant */
  }                                                                /* effects (fade/color) keep their short durations */
  .md-ripple { display: none; }
}
```
JS animations check `matchMedia('(prefers-reduced-motion: reduce)')` (built into the solver above). Replace large spatial transitions (container transform, sheet slide) with a short fade (default effects); stop looping decorative motion unless it conveys status, and give looping indicators a pause/stop path.

### Theming recipe

- **Attributes** (on `:root` or any subtree): `data-theme="light|dark"` (absent → follows `prefers-color-scheme`), `data-contrast="standard|medium|high"` (absent → standard, or high under `prefers-contrast: more`), `data-motion-scheme="expressive|standard"`.
- **Light/dark** uses `light-dark()` inside each color token plus `color-scheme`, so one declaration per role serves both themes and subtrees can switch theme:
```css
:root { color-scheme: light dark; }
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"]  { color-scheme: dark; }
/* every --md-sys-color-* = light-dark(<light>, <dark>)  — full lists in Reference CSS skeleton */
```
  (`light-dark()` in an unregistered custom property resolves where the color is used, so `color-scheme` of the consuming element decides. Fallback for older browsers: duplicate the dark values in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` and `[data-theme="dark"] {…}`.)
- **Contrast**: one block per level (`:root, [data-contrast="standard"]`, `[data-contrast="medium"]`, `[data-contrast="high"]`); for the OS preference, repeat the high block inside `@media (prefers-contrast: more) { :root:not([data-contrast]) {…} }` (build step) or set the attribute from JS.
- **Dynamic/brand color** with Material Color Utilities (MCU), writing the same custom properties:
```js
import { argbFromHex, hexFromArgb, Hct, SchemeTonalSpot, MaterialDynamicColors } from '@material/material-color-utilities';
const ROLES = ['primary','on-primary','primary-container','on-primary-container','inverse-primary', /* …all 48 roles from the token reference… */ 'scrim','shadow'];
const camel = (r) => r.replace(/-(\w)/g, (_, c) => c.toUpperCase());
export function applyTheme(el, sourceHex, { contrastLevel = 0, Scheme = SchemeTonalSpot } = {}) {   // 0 | 0.5 | 1
  const src = Hct.fromInt(argbFromHex(sourceHex));
  const light = new Scheme(src, false, contrastLevel), dark = new Scheme(src, true, contrastLevel);
  for (const role of ROLES) {
    const dc = MaterialDynamicColors[camel(role)];                // DynamicColor (API of MCU 0.2/0.3; verify names on upgrade)
    el.style.setProperty(`--md-sys-color-${role}`, `light-dark(${hexFromArgb(dc.getArgb(light))}, ${hexFromArgb(dc.getArgb(dark))})`);
  }
}
```
  Scheme classes: `SchemeTonalSpot` (default), `SchemeContent`, `SchemeFidelity`, `SchemeVibrant`, `SchemeExpressive`, `SchemeNeutral`, `SchemeMonochrome`, `SchemeRainbow`, `SchemeFruitSalad`. Call once per contrast level if the UI exposes a contrast switch. Static/extended colors: build a `TonalPalette` (optionally `Blend.harmonize` first) and assign tones like the primary group. `color-mix()`-based derived values (scrim, disabled, shadows) follow automatically.

---

## System token reference (exact values)

All values below were resolved from the official M3 token database used by m3.material.io (DSDB "Google Material 3", content version 2026-10-13). Context used: platform = web, audience = 3p, contrast = default unless stated. `dp` = CSS `px`; `pt` (type) = CSS `px` (use `rem` = value/16 if you want text scaling to follow user font size).

### Baseline tonal palettes (`md.ref.palette.*`)

The baseline scheme is generated from source color `#6750A4`. In a themed product, these palettes are regenerated from the brand/dynamic source color (see Color system) — the *roles* below never change, only the palette tones they point to.

| Tone | primary | secondary | tertiary | error | neutral | neutral-variant |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| 99 | #FFFBFE | #FFFBFE | #FFFBFA | #FFFBF9 | #FFFBFF | #FFFBFE |
| 98 | #FEF7FF | #FEF7FF | #FFF8F8 | #FFF8F7 | #FEF7FF | #FDF7FF |
| 96 | – | – | – | – | #F7F2FA | – |
| 95 | #F6EDFF | #F6EDFF | #FFECF1 | #FCEEEE | #F5EFF7 | #F5EEFA |
| 94 | – | – | – | – | #F3EDF7 | – |
| 92 | – | – | – | – | #ECE6F0 | – |
| 90 | #EADDFF | #E8DEF8 | #FFD8E4 | #F9DEDC | #E6E0E9 | #E7E0EC |
| 87 | – | – | – | – | #DED8E1 | – |
| 80 | #D0BCFF | #CCC2DC | #EFB8C8 | #F2B8B5 | #CAC5CD | #CAC4D0 |
| 70 | #B69DF8 | #B0A7C0 | #D29DAC | #EC928E | #AEA9B1 | #AEA9B4 |
| 60 | #9A82DB | #958DA5 | #B58392 | #E46962 | #938F96 | #938F99 |
| 50 | #7F67BE | #7A7289 | #986977 | #DC362E | #79767D | #79747E |
| 40 | #6750A4 | #625B71 | #7D5260 | #B3261E | #605D64 | #605D66 |
| 30 | #4F378B | #4A4458 | #633B48 | #8C1D18 | #48464C | #49454F |
| 24 | – | – | – | – | #3B383E | – |
| 22 | – | – | – | – | #36343B | – |
| 20 | #381E72 | #332D41 | #492532 | #601410 | #322F35 | #322F37 |
| 17 | – | – | – | – | #2B2930 | – |
| 12 | – | – | – | – | #211F26 | – |
| 10 | #21005D | #1D192B | #31111D | #410E0B | #1D1B20 | #1D1A22 |
| 6 | – | – | – | – | #141218 | – |
| 4 | – | – | – | – | #0F0D13 | – |
| 0 | #000000 | #000000 | #000000 | #000000 | #000000 | #000000 |

### Color scheme roles (`md.sys.color.*`) — standard contrast

CSS: `--md-sys-color-<role>`. Palette tone in parentheses.

| Role | Light | Dark |
| --- | --- | --- |
| primary | primary40 `#6750A4` | primary80 `#D0BCFF` |
| on-primary | primary100 `#FFFFFF` | primary20 `#381E72` |
| primary-container | primary90 `#EADDFF` | primary30 `#4F378B` |
| on-primary-container | primary30 `#4F378B` | primary90 `#EADDFF` |
| inverse-primary | primary80 `#D0BCFF` | primary40 `#6750A4` |
| primary-fixed | primary90 `#EADDFF` | primary90 `#EADDFF` |
| primary-fixed-dim | primary80 `#D0BCFF` | primary80 `#D0BCFF` |
| on-primary-fixed | primary10 `#21005D` | primary10 `#21005D` |
| on-primary-fixed-variant | primary30 `#4F378B` | primary30 `#4F378B` |
| secondary | secondary40 `#625B71` | secondary80 `#CCC2DC` |
| on-secondary | secondary100 `#FFFFFF` | secondary20 `#332D41` |
| secondary-container | secondary90 `#E8DEF8` | secondary30 `#4A4458` |
| on-secondary-container | secondary30 `#4A4458` | secondary90 `#E8DEF8` |
| secondary-fixed | secondary90 `#E8DEF8` | secondary90 `#E8DEF8` |
| secondary-fixed-dim | secondary80 `#CCC2DC` | secondary80 `#CCC2DC` |
| on-secondary-fixed | secondary10 `#1D192B` | secondary10 `#1D192B` |
| on-secondary-fixed-variant | secondary30 `#4A4458` | secondary30 `#4A4458` |
| tertiary | tertiary40 `#7D5260` | tertiary80 `#EFB8C8` |
| on-tertiary | tertiary100 `#FFFFFF` | tertiary20 `#492532` |
| tertiary-container | tertiary90 `#FFD8E4` | tertiary30 `#633B48` |
| on-tertiary-container | tertiary30 `#633B48` | tertiary90 `#FFD8E4` |
| tertiary-fixed | tertiary90 `#FFD8E4` | tertiary90 `#FFD8E4` |
| tertiary-fixed-dim | tertiary80 `#EFB8C8` | tertiary80 `#EFB8C8` |
| on-tertiary-fixed | tertiary10 `#31111D` | tertiary10 `#31111D` |
| on-tertiary-fixed-variant | tertiary30 `#633B48` | tertiary30 `#633B48` |
| error | error40 `#B3261E` | error80 `#F2B8B5` |
| on-error | error100 `#FFFFFF` | error20 `#601410` |
| error-container | error90 `#F9DEDC` | error30 `#8C1D18` |
| on-error-container | error30 `#8C1D18` | error90 `#F9DEDC` |
| surface | neutral98 `#FEF7FF` | neutral6 `#141218` |
| on-surface | neutral10 `#1D1B20` | neutral90 `#E6E0E9` |
| surface-variant | neutral-variant90 `#E7E0EC` | neutral-variant30 `#49454F` |
| on-surface-variant | neutral-variant30 `#49454F` | neutral-variant80 `#CAC4D0` |
| surface-container-lowest | neutral100 `#FFFFFF` | neutral4 `#0F0D13` |
| surface-container-low | neutral96 `#F7F2FA` | neutral10 `#1D1B20` |
| surface-container | neutral94 `#F3EDF7` | neutral12 `#211F26` |
| surface-container-high | neutral92 `#ECE6F0` | neutral17 `#2B2930` |
| surface-container-highest | neutral90 `#E6E0E9` | neutral22 `#36343B` |
| surface-bright | neutral98 `#FEF7FF` | neutral24 `#3B383E` |
| surface-dim | neutral87 `#DED8E1` | neutral6 `#141218` |
| inverse-surface | neutral20 `#322F35` | neutral90 `#E6E0E9` |
| inverse-on-surface | neutral95 `#F5EFF7` | neutral20 `#322F35` |
| background | neutral98 `#FEF7FF` | neutral6 `#141218` |
| on-background | neutral10 `#1D1B20` | neutral90 `#E6E0E9` |
| outline | neutral-variant50 `#79747E` | neutral-variant60 `#938F99` |
| outline-variant | neutral-variant80 `#CAC4D0` | neutral-variant30 `#49454F` |
| scrim | neutral0 `#000000` | neutral0 `#000000` |
| shadow | neutral0 `#000000` | neutral0 `#000000` |

### Color scheme roles — medium & high contrast (baseline)

Provide these as alternate themes (e.g. `[data-contrast="medium"]`, `[data-contrast="high"]`, and/or `@media (prefers-contrast: more)`).

| Role | Light MC | Light HC | Dark MC | Dark HC |
| --- | --- | --- | --- | --- |
| primary | #4F378B | #381E72 | #EADDFF | #F6EDFF |
| on-primary | #FFFFFF | #FFFFFF | #21005D | #000000 |
| primary-container | #6750A4 | #4F378B | #9A82DB | #D0BCFF |
| on-primary-container | #FFFFFF | #FFFFFF | #000000 | #000000 |
| inverse-primary | #D0BCFF | #D0BCFF | #4F378B | #381E72 |
| primary-fixed | #6750A4 | #4F378B | #EADDFF | #EADDFF |
| primary-fixed-dim | #4F378B | #381E72 | #D0BCFF | #D0BCFF |
| on-primary-fixed | #FFFFFF | #FFFFFF | #000000 | #000000 |
| on-primary-fixed-variant | #FFFFFF | #FFFFFF | #381E72 | #000000 |
| secondary | #4A4458 | #332D41 | #E8DEF8 | #F6EDFF |
| on-secondary | #FFFFFF | #FFFFFF | #1D192B | #000000 |
| secondary-container | #625B71 | #4A4458 | #958DA5 | #CCC2DC |
| on-secondary-container | #FFFFFF | #FFFFFF | #000000 | #000000 |
| secondary-fixed | #625B71 | #4A4458 | #E8DEF8 | #E8DEF8 |
| secondary-fixed-dim | #4A4458 | #332D41 | #CCC2DC | #CCC2DC |
| on-secondary-fixed | #FFFFFF | #FFFFFF | #000000 | #000000 |
| on-secondary-fixed-variant | #FFFFFF | #FFFFFF | #332D41 | #000000 |
| tertiary | #633B48 | #492532 | #FFD8E4 | #FFECF1 |
| on-tertiary | #FFFFFF | #FFFFFF | #31111D | #000000 |
| tertiary-container | #7D5260 | #633B48 | #B58392 | #EFB8C8 |
| on-tertiary-container | #FFFFFF | #FFFFFF | #000000 | #000000 |
| tertiary-fixed | #7D5260 | #633B48 | #FFD8E4 | #FFD8E4 |
| tertiary-fixed-dim | #633B48 | #492532 | #EFB8C8 | #EFB8C8 |
| on-tertiary-fixed | #FFFFFF | #FFFFFF | #000000 | #000000 |
| on-tertiary-fixed-variant | #FFFFFF | #FFFFFF | #492532 | #000000 |
| error | #8C1D18 | #601410 | #F9DEDC | #FCEEEE |
| on-error | #FFFFFF | #FFFFFF | #410E0B | #000000 |
| error-container | #B3261E | #8C1D18 | #E46962 | #F2B8B5 |
| on-error-container | #FFFFFF | #FFFFFF | #000000 | #000000 |
| surface | #FEF7FF | #FEF7FF | #141218 | #141218 |
| on-surface | #000000 | #000000 | #FFFFFF | #FFFFFF |
| surface-variant | #E7E0EC | #E7E0EC | #49454F | #49454F |
| on-surface-variant | #322F37 | #000000 | #E7E0EC | #FFFFFF |
| surface-container-lowest | #FFFFFF | #FFFFFF | #0F0D13 | #0F0D13 |
| surface-container-low | #F7F2FA | #F7F2FA | #1D1B20 | #1D1B20 |
| surface-container | #F3EDF7 | #F3EDF7 | #211F26 | #211F26 |
| surface-container-high | #ECE6F0 | #ECE6F0 | #2B2930 | #2B2930 |
| surface-container-highest | #E6E0E9 | #E6E0E9 | #36343B | #36343B |
| surface-bright | #FEF7FF | #FEF7FF | #3B383E | #3B383E |
| surface-dim | #DED8E1 | #DED8E1 | #141218 | #141218 |
| inverse-surface | #322F35 | #322F35 | #E6E0E9 | #E6E0E9 |
| inverse-on-surface | #FFFFFF | #FFFFFF | #1D1B20 | #000000 |
| background | #FEF7FF | #FEF7FF | #141218 | #141218 |
| on-background | #000000 | #000000 | #FFFFFF | #FFFFFF |
| outline | #49454F | #322F37 | #AEA9B4 | #F5EEFA |
| outline-variant | #79747E | #49454F | #938F99 | #CAC4D0 |
| scrim / shadow | #000000 | #000000 | #000000 | #000000 |

Note: with dynamic/custom color, MC/HC schemes must be generated by the color algorithm (contrast level 0.5 / 1.0 in Material Color Utilities), not copied from this table.

### Typography

Reference typefaces (`md.ref.typeface.*`):

| Token | Value |
| --- | --- |
| md.ref.typeface.brand | Roboto |
| md.ref.typeface.plain | Roboto |
| md.ref.typeface.variable.brand / .variable.plain | Roboto Flex |
| md.ref.typeface.weight-regular / -medium / -semibold / -bold | 400 / 500 / 600 / 700 |

Type scale — baseline (`md.sys.typescale.<role>.{font,weight,size,line-height,tracking}`):

| Role | Font | Weight | Size | Line height | Tracking |
| --- | --- | --- | --- | --- | --- |
| display-large | brand | 400 | 57 | 64 | -0.25 |
| display-medium | brand | 400 | 45 | 52 | 0 |
| display-small | brand | 400 | 36 | 44 | 0 |
| headline-large | brand | 400 | 32 | 40 | 0 |
| headline-medium | brand | 400 | 28 | 36 | 0 |
| headline-small | brand | 400 | 24 | 32 | 0 |
| title-large | brand | 400 | 22 | 28 | 0 |
| title-medium | plain | 500 | 16 | 24 | 0.15 |
| title-small | plain | 500 | 14 | 20 | 0.1 |
| body-large | plain | 400 | 16 | 24 | 0.5 |
| body-medium | plain | 400 | 14 | 20 | 0.25 |
| body-small | plain | 400 | 12 | 16 | 0.4 |
| label-large | plain | 500 | 14 | 20 | 0.1 |
| label-medium | plain | 500 | 12 | 16 | 0.5 |
| label-small | plain | 500 | 11 | 16 | 0.5 |

Type scale — emphasized (`md.sys.typescale.emphasized.<role>.*`): identical font, size, line height and tracking; only weight changes:

| Roles | Emphasized weight |
| --- | --- |
| display-*, headline-*, title-large | 500 |
| title-medium, title-small | 700 |
| body-large, body-medium, body-small | 500 |
| label-large, label-medium, label-small | 700 |

Composite tokens: `md.sys.typescale.<role>` and `md.sys.typescale.emphasized.<role>` bundle the five property tokens (font, weight, size, line-height, tracking). CSS has no composite: apply with the Typography role mixin.

Variable-font sets (`md.sys.typescale.variable.<role>.*` and `md.sys.typescale.variable.emphasized.<role>.*`, 30 roles × the same five properties + composite):
- `size`, `line-height`, `tracking`, `weight` = **identical** to the static set of the same role (`variable.<role>` = baseline, `variable.emphasized.<role>` = emphasized). The source pages show no differing values.
- `font` = `md.ref.typeface.variable.brand` / `.variable.plain` (Roboto Flex) following the same brand/plain split as the static role.
- Axes are set with `font-variation-settings` (not separate sys tokens in this set): `wght` = the weight, `wdth` 100, `opsz` = font size (`font-optical-sizing: auto`), `GRAD` 0 (derived from the Roboto Flex defaults).
- CSS: `--md-sys-typescale-variable-<role>-{font,weight,size,line-height,tracking}`; default them to `var()` of the static role and override only `-font`, e.g. `--md-sys-typescale-variable-body-large-font: var(--md-ref-typeface-variable-plain); --md-sys-typescale-variable-body-large-size: var(--md-sys-typescale-body-large-size);` (same pattern for `-variable-emphasized-`).

Units: sizes/line heights/tracking in px (CSS emits rem = px/16, see Typography → Web units).

### Shape (`md.sys.shape.*`)

| Token | Value | CSS |
| --- | --- | --- |
| corner.none | 0 | `--md-sys-shape-corner-none: 0px` |
| corner.extra-small | 4dp | `4px` |
| corner.extra-small.top | 4dp top-left/top-right, 0 bottom | `4px 4px 0 0` |
| corner.small | 8dp | `8px` |
| corner.medium | 12dp | `12px` |
| corner.large | 16dp | `16px` |
| corner.large.top | 16 16 0 0 | `16px 16px 0 0` |
| corner.large.start | 16dp on start corners | `16px 0 0 16px` (mirror in RTL) |
| corner.large.end | 16dp on end corners | `0 16px 16px 0` (mirror in RTL) |
| corner.large-increased | 20dp | `20px` |
| corner.extra-large | 28dp | `28px` |
| corner.extra-large.top | 28 28 0 0 | `28px 28px 0 0` |
| corner.extra-large-increased | 32dp | `32px` |
| corner.extra-extra-large | 48dp | `48px` |
| corner.full | circular (50% of the shorter side) | `9999px` (or `calc(height/2)`) |

Numeric `corner-value.*` tokens exist with the same numbers (none 0, extra-small 4, small 8, medium 12, large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48) for animating/interpolating radii (shape morph).

### Elevation (`md.sys.elevation.*`)

| Level | dp |
| --- | --- |
| level0 | 0 |
| level1 | 1 |
| level2 | 3 |
| level3 | 6 |
| level4 | 8 |
| level5 | 12 |

Shadow color: `md.sys.color.shadow`. Rendering per level: Elevation primitive. Note: the CSS custom property `--md-sys-elevation-levelN` holds the box-shadow; the dp distance is only documentation.

### State (`md.sys.state.*`)

| Token | Value |
| --- | --- |
| hover.state-layer-opacity | 0.08 |
| focus.state-layer-opacity | 0.10 |
| pressed.state-layer-opacity | 0.10 |
| dragged.state-layer-opacity | 0.16 |
| disabled.state-layer-opacity | 0.38 (system default disabled opacity; components use their own tokens) |
| focus-indicator.thickness | 3dp |
| focus-indicator.outer-offset | 2dp |
| focus-indicator.inner-offset | -3dp |

Per-component disabled opacities: Interaction states → Disabled color recipe.

### Spacing (`md.sys.measurement.space*`)

| Token | Value |
| --- | --- |
| space0 | 0 |
| space25 | 2dp |
| space50 | 4dp |
| space75 | 6dp |
| space100 | 8dp |
| space125 | 10dp |
| space150 | 12dp |
| space175 | 14dp |
| space200 | 16dp |
| space250 | 20dp |
| space300 | 24dp |
| space400 | 32dp |
| space450 | 36dp |
| space500 | 40dp |
| space600 | 48dp |
| space700 | 56dp |
| space800 | 64dp |
| space900 | 72dp |

### Motion (`md.sys.motion.*`)

Springs — M3 Expressive physics. Two motion schemes: **expressive** (library default, per the motion guidelines; overshoot/bounce) and **standard** (functional, minimal bounce; the token DB's default context). Per-subtree override via `data-motion-scheme`. *Spatial* springs move position/size/shape/rotation and may overshoot; *effects* springs animate color/opacity and never overshoot.

| Token | Standard (damping / stiffness) | Expressive (damping / stiffness) |
| --- | --- | --- |
| spring.fast.spatial | 0.9 / 1400 | 0.6 / 800 |
| spring.default.spatial | 0.9 / 700 | 0.8 / 380 |
| spring.slow.spatial | 0.9 / 300 | 0.8 / 200 |
| spring.fast.effects | 1 / 3800 | 1 / 3800 |
| spring.default.effects | 1 / 1600 | 1 / 1600 |
| spring.slow.effects | 1 / 800 | 1 / 800 |

(damping = damping ratio ζ; stiffness in N/m with mass = 1.)

- **Composite tokens** `md.sys.motion.spring.<speed>.<type>` (e.g. `md.sys.motion.spring.fast.spatial`) = {`.damping`, `.stiffness`} of the active scheme; the scheme is not in the name. CSS: four properties `-stiffness`, `-damping`, `-easing`, `-duration` (Spring primitive has the concrete per-scheme values).
- **`md.sys.motion.path`**: legacy-system token (source: "easing, duration, and path tokens are used by the legacy system, so can be ignored"). No value is given; treat as a straight (linear) path — curved/arc motion is not part of the library. Not exposed as a CSS property.

Easing (legacy duration-based system, still valid for CSS transitions):

| Token | cubic-bezier |
| --- | --- |
| easing.emphasized | two-segment path; source CSS = "N/A (use Standard as a fallback)". Library: `linear()` sampled from the path (skeleton), fallback `cubic-bezier(0.2, 0, 0, 1)` |
| easing.emphasized.decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| easing.emphasized.accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` |
| easing.standard | `cubic-bezier(0.2, 0, 0, 1)` |
| easing.standard.decelerate | `cubic-bezier(0, 0, 0, 1)` |
| easing.standard.accelerate | `cubic-bezier(0.3, 0, 1, 1)` |
| easing.legacy | `cubic-bezier(0.4, 0, 0.2, 1)` |
| easing.legacy.decelerate | `cubic-bezier(0, 0, 0.2, 1)` |
| easing.legacy.accelerate | `cubic-bezier(0.4, 0, 1, 1)` |
| easing.linear | `cubic-bezier(0, 0, 1, 1)` |

Durations:

| Token | ms | Token | ms |
| --- | --- | --- | --- |
| short1 | 50 | long1 | 450 |
| short2 | 100 | long2 | 500 |
| short3 | 150 | long3 | 550 |
| short4 | 200 | long4 | 600 |
| medium1 | 250 | extra-long1 | 700 |
| medium2 | 300 | extra-long2 | 800 |
| medium3 | 350 | extra-long3 | 900 |
| medium4 | 400 | extra-long4 | 1000 |

### Reference CSS skeleton

Complete `:root` layer for the baseline theme (generated from the tables above). Color roles use `light-dark()` (see Theming recipe); elevation, focus ring, springs and the other helpers are in Shared implementation primitives.

```css
:root {
  color-scheme: light dark;
  /* reference typefaces */
  --md-ref-typeface-brand: Roboto, "Noto Sans", sans-serif;
  --md-ref-typeface-plain: Roboto, "Noto Sans", sans-serif;
  --md-ref-typeface-variable-brand: "Roboto Flex", Roboto, "Noto Sans", sans-serif;
  --md-ref-typeface-variable-plain: "Roboto Flex", Roboto, "Noto Sans", sans-serif;

  /* typescale (size/line-height/tracking in rem = px / 16) */
  --md-sys-typescale-display-large-font: var(--md-ref-typeface-brand); --md-sys-typescale-display-large-weight: 400; --md-sys-typescale-display-large-size: 3.5625rem; --md-sys-typescale-display-large-line-height: 4rem; --md-sys-typescale-display-large-tracking: -0.015625rem;
  --md-sys-typescale-display-medium-font: var(--md-ref-typeface-brand); --md-sys-typescale-display-medium-weight: 400; --md-sys-typescale-display-medium-size: 2.8125rem; --md-sys-typescale-display-medium-line-height: 3.25rem; --md-sys-typescale-display-medium-tracking: 0;
  --md-sys-typescale-display-small-font: var(--md-ref-typeface-brand); --md-sys-typescale-display-small-weight: 400; --md-sys-typescale-display-small-size: 2.25rem; --md-sys-typescale-display-small-line-height: 2.75rem; --md-sys-typescale-display-small-tracking: 0;
  --md-sys-typescale-headline-large-font: var(--md-ref-typeface-brand); --md-sys-typescale-headline-large-weight: 400; --md-sys-typescale-headline-large-size: 2rem; --md-sys-typescale-headline-large-line-height: 2.5rem; --md-sys-typescale-headline-large-tracking: 0;
  --md-sys-typescale-headline-medium-font: var(--md-ref-typeface-brand); --md-sys-typescale-headline-medium-weight: 400; --md-sys-typescale-headline-medium-size: 1.75rem; --md-sys-typescale-headline-medium-line-height: 2.25rem; --md-sys-typescale-headline-medium-tracking: 0;
  --md-sys-typescale-headline-small-font: var(--md-ref-typeface-brand); --md-sys-typescale-headline-small-weight: 400; --md-sys-typescale-headline-small-size: 1.5rem; --md-sys-typescale-headline-small-line-height: 2rem; --md-sys-typescale-headline-small-tracking: 0;
  --md-sys-typescale-title-large-font: var(--md-ref-typeface-brand); --md-sys-typescale-title-large-weight: 400; --md-sys-typescale-title-large-size: 1.375rem; --md-sys-typescale-title-large-line-height: 1.75rem; --md-sys-typescale-title-large-tracking: 0;
  --md-sys-typescale-title-medium-font: var(--md-ref-typeface-plain); --md-sys-typescale-title-medium-weight: 500; --md-sys-typescale-title-medium-size: 1rem; --md-sys-typescale-title-medium-line-height: 1.5rem; --md-sys-typescale-title-medium-tracking: 0.009375rem;
  --md-sys-typescale-title-small-font: var(--md-ref-typeface-plain); --md-sys-typescale-title-small-weight: 500; --md-sys-typescale-title-small-size: 0.875rem; --md-sys-typescale-title-small-line-height: 1.25rem; --md-sys-typescale-title-small-tracking: 0.00625rem;
  --md-sys-typescale-body-large-font: var(--md-ref-typeface-plain); --md-sys-typescale-body-large-weight: 400; --md-sys-typescale-body-large-size: 1rem; --md-sys-typescale-body-large-line-height: 1.5rem; --md-sys-typescale-body-large-tracking: 0.03125rem;
  --md-sys-typescale-body-medium-font: var(--md-ref-typeface-plain); --md-sys-typescale-body-medium-weight: 400; --md-sys-typescale-body-medium-size: 0.875rem; --md-sys-typescale-body-medium-line-height: 1.25rem; --md-sys-typescale-body-medium-tracking: 0.015625rem;
  --md-sys-typescale-body-small-font: var(--md-ref-typeface-plain); --md-sys-typescale-body-small-weight: 400; --md-sys-typescale-body-small-size: 0.75rem; --md-sys-typescale-body-small-line-height: 1rem; --md-sys-typescale-body-small-tracking: 0.025rem;
  --md-sys-typescale-label-large-font: var(--md-ref-typeface-plain); --md-sys-typescale-label-large-weight: 500; --md-sys-typescale-label-large-size: 0.875rem; --md-sys-typescale-label-large-line-height: 1.25rem; --md-sys-typescale-label-large-tracking: 0.00625rem;
  --md-sys-typescale-label-medium-font: var(--md-ref-typeface-plain); --md-sys-typescale-label-medium-weight: 500; --md-sys-typescale-label-medium-size: 0.75rem; --md-sys-typescale-label-medium-line-height: 1rem; --md-sys-typescale-label-medium-tracking: 0.03125rem;
  --md-sys-typescale-label-small-font: var(--md-ref-typeface-plain); --md-sys-typescale-label-small-weight: 500; --md-sys-typescale-label-small-size: 0.6875rem; --md-sys-typescale-label-small-line-height: 1rem; --md-sys-typescale-label-small-tracking: 0.03125rem;
  --md-sys-typescale-emphasized-display-large-font: var(--md-sys-typescale-display-large-font); --md-sys-typescale-emphasized-display-large-weight: 500; --md-sys-typescale-emphasized-display-large-size: var(--md-sys-typescale-display-large-size); --md-sys-typescale-emphasized-display-large-line-height: var(--md-sys-typescale-display-large-line-height); --md-sys-typescale-emphasized-display-large-tracking: var(--md-sys-typescale-display-large-tracking);
  --md-sys-typescale-emphasized-display-medium-font: var(--md-sys-typescale-display-medium-font); --md-sys-typescale-emphasized-display-medium-weight: 500; --md-sys-typescale-emphasized-display-medium-size: var(--md-sys-typescale-display-medium-size); --md-sys-typescale-emphasized-display-medium-line-height: var(--md-sys-typescale-display-medium-line-height); --md-sys-typescale-emphasized-display-medium-tracking: var(--md-sys-typescale-display-medium-tracking);
  --md-sys-typescale-emphasized-display-small-font: var(--md-sys-typescale-display-small-font); --md-sys-typescale-emphasized-display-small-weight: 500; --md-sys-typescale-emphasized-display-small-size: var(--md-sys-typescale-display-small-size); --md-sys-typescale-emphasized-display-small-line-height: var(--md-sys-typescale-display-small-line-height); --md-sys-typescale-emphasized-display-small-tracking: var(--md-sys-typescale-display-small-tracking);
  --md-sys-typescale-emphasized-headline-large-font: var(--md-sys-typescale-headline-large-font); --md-sys-typescale-emphasized-headline-large-weight: 500; --md-sys-typescale-emphasized-headline-large-size: var(--md-sys-typescale-headline-large-size); --md-sys-typescale-emphasized-headline-large-line-height: var(--md-sys-typescale-headline-large-line-height); --md-sys-typescale-emphasized-headline-large-tracking: var(--md-sys-typescale-headline-large-tracking);
  --md-sys-typescale-emphasized-headline-medium-font: var(--md-sys-typescale-headline-medium-font); --md-sys-typescale-emphasized-headline-medium-weight: 500; --md-sys-typescale-emphasized-headline-medium-size: var(--md-sys-typescale-headline-medium-size); --md-sys-typescale-emphasized-headline-medium-line-height: var(--md-sys-typescale-headline-medium-line-height); --md-sys-typescale-emphasized-headline-medium-tracking: var(--md-sys-typescale-headline-medium-tracking);
  --md-sys-typescale-emphasized-headline-small-font: var(--md-sys-typescale-headline-small-font); --md-sys-typescale-emphasized-headline-small-weight: 500; --md-sys-typescale-emphasized-headline-small-size: var(--md-sys-typescale-headline-small-size); --md-sys-typescale-emphasized-headline-small-line-height: var(--md-sys-typescale-headline-small-line-height); --md-sys-typescale-emphasized-headline-small-tracking: var(--md-sys-typescale-headline-small-tracking);
  --md-sys-typescale-emphasized-title-large-font: var(--md-sys-typescale-title-large-font); --md-sys-typescale-emphasized-title-large-weight: 500; --md-sys-typescale-emphasized-title-large-size: var(--md-sys-typescale-title-large-size); --md-sys-typescale-emphasized-title-large-line-height: var(--md-sys-typescale-title-large-line-height); --md-sys-typescale-emphasized-title-large-tracking: var(--md-sys-typescale-title-large-tracking);
  --md-sys-typescale-emphasized-title-medium-font: var(--md-sys-typescale-title-medium-font); --md-sys-typescale-emphasized-title-medium-weight: 700; --md-sys-typescale-emphasized-title-medium-size: var(--md-sys-typescale-title-medium-size); --md-sys-typescale-emphasized-title-medium-line-height: var(--md-sys-typescale-title-medium-line-height); --md-sys-typescale-emphasized-title-medium-tracking: var(--md-sys-typescale-title-medium-tracking);
  --md-sys-typescale-emphasized-title-small-font: var(--md-sys-typescale-title-small-font); --md-sys-typescale-emphasized-title-small-weight: 700; --md-sys-typescale-emphasized-title-small-size: var(--md-sys-typescale-title-small-size); --md-sys-typescale-emphasized-title-small-line-height: var(--md-sys-typescale-title-small-line-height); --md-sys-typescale-emphasized-title-small-tracking: var(--md-sys-typescale-title-small-tracking);
  --md-sys-typescale-emphasized-body-large-font: var(--md-sys-typescale-body-large-font); --md-sys-typescale-emphasized-body-large-weight: 500; --md-sys-typescale-emphasized-body-large-size: var(--md-sys-typescale-body-large-size); --md-sys-typescale-emphasized-body-large-line-height: var(--md-sys-typescale-body-large-line-height); --md-sys-typescale-emphasized-body-large-tracking: var(--md-sys-typescale-body-large-tracking);
  --md-sys-typescale-emphasized-body-medium-font: var(--md-sys-typescale-body-medium-font); --md-sys-typescale-emphasized-body-medium-weight: 500; --md-sys-typescale-emphasized-body-medium-size: var(--md-sys-typescale-body-medium-size); --md-sys-typescale-emphasized-body-medium-line-height: var(--md-sys-typescale-body-medium-line-height); --md-sys-typescale-emphasized-body-medium-tracking: var(--md-sys-typescale-body-medium-tracking);
  --md-sys-typescale-emphasized-body-small-font: var(--md-sys-typescale-body-small-font); --md-sys-typescale-emphasized-body-small-weight: 500; --md-sys-typescale-emphasized-body-small-size: var(--md-sys-typescale-body-small-size); --md-sys-typescale-emphasized-body-small-line-height: var(--md-sys-typescale-body-small-line-height); --md-sys-typescale-emphasized-body-small-tracking: var(--md-sys-typescale-body-small-tracking);
  --md-sys-typescale-emphasized-label-large-font: var(--md-sys-typescale-label-large-font); --md-sys-typescale-emphasized-label-large-weight: 700; --md-sys-typescale-emphasized-label-large-size: var(--md-sys-typescale-label-large-size); --md-sys-typescale-emphasized-label-large-line-height: var(--md-sys-typescale-label-large-line-height); --md-sys-typescale-emphasized-label-large-tracking: var(--md-sys-typescale-label-large-tracking);
  --md-sys-typescale-emphasized-label-medium-font: var(--md-sys-typescale-label-medium-font); --md-sys-typescale-emphasized-label-medium-weight: 700; --md-sys-typescale-emphasized-label-medium-size: var(--md-sys-typescale-label-medium-size); --md-sys-typescale-emphasized-label-medium-line-height: var(--md-sys-typescale-label-medium-line-height); --md-sys-typescale-emphasized-label-medium-tracking: var(--md-sys-typescale-label-medium-tracking);
  --md-sys-typescale-emphasized-label-small-font: var(--md-sys-typescale-label-small-font); --md-sys-typescale-emphasized-label-small-weight: 700; --md-sys-typescale-emphasized-label-small-size: var(--md-sys-typescale-label-small-size); --md-sys-typescale-emphasized-label-small-line-height: var(--md-sys-typescale-label-small-line-height); --md-sys-typescale-emphasized-label-small-tracking: var(--md-sys-typescale-label-small-tracking);

  /* shape */
  --md-sys-shape-corner-none: 0px; --md-sys-shape-corner-extra-small: 4px; --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px; --md-sys-shape-corner-large: 16px; --md-sys-shape-corner-large-increased: 20px;
  --md-sys-shape-corner-extra-large: 28px; --md-sys-shape-corner-extra-large-increased: 32px;
  --md-sys-shape-corner-extra-extra-large: 48px; --md-sys-shape-corner-full: 9999px;
  --md-sys-shape-corner-extra-small-top: 4px 4px 0 0; --md-sys-shape-corner-large-top: 16px 16px 0 0;
  --md-sys-shape-corner-extra-large-top: 28px 28px 0 0;
  --md-sys-shape-corner-large-start: 16px 0 0 16px;  /* physical shorthand order; in RTL apply via logical longhands */
  --md-sys-shape-corner-large-end: 0 16px 16px 0;
  --md-sys-shape-corner-value-none: 0px; --md-sys-shape-corner-value-extra-small: 4px; --md-sys-shape-corner-value-small: 8px;
  --md-sys-shape-corner-value-medium: 12px; --md-sys-shape-corner-value-large: 16px; --md-sys-shape-corner-value-large-increased: 20px;
  --md-sys-shape-corner-value-extra-large: 28px; --md-sys-shape-corner-value-extra-large-increased: 32px;
  --md-sys-shape-corner-value-extra-extra-large: 48px;

  /* state */
  --md-sys-state-hover-state-layer-opacity: 0.08; --md-sys-state-focus-state-layer-opacity: 0.1;
  --md-sys-state-pressed-state-layer-opacity: 0.1; --md-sys-state-dragged-state-layer-opacity: 0.16;
  --md-sys-state-disabled-state-layer-opacity: 0.38;
  --md-sys-state-focus-indicator-thickness: 3px; --md-sys-state-focus-indicator-outer-offset: 2px;
  --md-sys-state-focus-indicator-inner-offset: -3px;

  /* spacing */
  --md-sys-measurement-space0: 0px; --md-sys-measurement-space25: 2px; --md-sys-measurement-space50: 4px; --md-sys-measurement-space75: 6px; --md-sys-measurement-space100: 8px; --md-sys-measurement-space125: 10px; --md-sys-measurement-space150: 12px; --md-sys-measurement-space175: 14px; --md-sys-measurement-space200: 16px;
  --md-sys-measurement-space250: 20px; --md-sys-measurement-space300: 24px; --md-sys-measurement-space400: 32px; --md-sys-measurement-space450: 36px; --md-sys-measurement-space500: 40px; --md-sys-measurement-space600: 48px; --md-sys-measurement-space700: 56px; --md-sys-measurement-space800: 64px; --md-sys-measurement-space900: 72px;

  /* motion — legacy easing & duration (springs: see spring primitive) */
  --md-sys-motion-easing-emphasized: linear(0, 0.003 2%, 0.013 4%, 0.03 6%, 0.056 8%, 0.093 10%, 0.146 12%, 0.222 14%, 0.341 16%, 0.52 18%, 0.636 20%, 0.706 22%, 0.773 25%, 0.84 30%, 0.883 35%, 0.912 40%, 0.951 50%, 0.973 60%, 0.991 75%, 1);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-legacy: cubic-bezier(0.4, 0, 0.2, 1);
  --md-sys-motion-easing-legacy-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --md-sys-motion-easing-legacy-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --md-sys-motion-easing-linear: cubic-bezier(0, 0, 1, 1);
  --md-sys-motion-duration-short1: 50ms; --md-sys-motion-duration-short2: 100ms; --md-sys-motion-duration-short3: 150ms; --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms; --md-sys-motion-duration-medium2: 300ms; --md-sys-motion-duration-medium3: 350ms; --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms; --md-sys-motion-duration-long2: 500ms; --md-sys-motion-duration-long3: 550ms; --md-sys-motion-duration-long4: 600ms;
  --md-sys-motion-duration-extra-long1: 700ms; --md-sys-motion-duration-extra-long2: 800ms; --md-sys-motion-duration-extra-long3: 900ms; --md-sys-motion-duration-extra-long4: 1000ms;
}
@supports not (transition-timing-function: linear(0, 1)) {
  :root { --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1); }   /* source: "use Standard as a fallback" */
}
[data-theme="light"] { color-scheme: light; }
[data-theme="dark"]  { color-scheme: dark; }

/* color roles: light-dark(<light>, <dark>) per contrast level */
:root, [data-contrast="standard"] {
  --md-sys-color-primary: light-dark(#6750A4, #D0BCFF);
  --md-sys-color-on-primary: light-dark(#FFFFFF, #381E72);
  --md-sys-color-primary-container: light-dark(#EADDFF, #4F378B);
  --md-sys-color-on-primary-container: light-dark(#4F378B, #EADDFF);
  --md-sys-color-inverse-primary: light-dark(#D0BCFF, #6750A4);
  --md-sys-color-primary-fixed: light-dark(#EADDFF, #EADDFF);
  --md-sys-color-primary-fixed-dim: light-dark(#D0BCFF, #D0BCFF);
  --md-sys-color-on-primary-fixed: light-dark(#21005D, #21005D);
  --md-sys-color-on-primary-fixed-variant: light-dark(#4F378B, #4F378B);
  --md-sys-color-secondary: light-dark(#625B71, #CCC2DC);
  --md-sys-color-on-secondary: light-dark(#FFFFFF, #332D41);
  --md-sys-color-secondary-container: light-dark(#E8DEF8, #4A4458);
  --md-sys-color-on-secondary-container: light-dark(#4A4458, #E8DEF8);
  --md-sys-color-secondary-fixed: light-dark(#E8DEF8, #E8DEF8);
  --md-sys-color-secondary-fixed-dim: light-dark(#CCC2DC, #CCC2DC);
  --md-sys-color-on-secondary-fixed: light-dark(#1D192B, #1D192B);
  --md-sys-color-on-secondary-fixed-variant: light-dark(#4A4458, #4A4458);
  --md-sys-color-tertiary: light-dark(#7D5260, #EFB8C8);
  --md-sys-color-on-tertiary: light-dark(#FFFFFF, #492532);
  --md-sys-color-tertiary-container: light-dark(#FFD8E4, #633B48);
  --md-sys-color-on-tertiary-container: light-dark(#633B48, #FFD8E4);
  --md-sys-color-tertiary-fixed: light-dark(#FFD8E4, #FFD8E4);
  --md-sys-color-tertiary-fixed-dim: light-dark(#EFB8C8, #EFB8C8);
  --md-sys-color-on-tertiary-fixed: light-dark(#31111D, #31111D);
  --md-sys-color-on-tertiary-fixed-variant: light-dark(#633B48, #633B48);
  --md-sys-color-error: light-dark(#B3261E, #F2B8B5);
  --md-sys-color-on-error: light-dark(#FFFFFF, #601410);
  --md-sys-color-error-container: light-dark(#F9DEDC, #8C1D18);
  --md-sys-color-on-error-container: light-dark(#8C1D18, #F9DEDC);
  --md-sys-color-surface: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-surface: light-dark(#1D1B20, #E6E0E9);
  --md-sys-color-surface-variant: light-dark(#E7E0EC, #49454F);
  --md-sys-color-on-surface-variant: light-dark(#49454F, #CAC4D0);
  --md-sys-color-surface-container-lowest: light-dark(#FFFFFF, #0F0D13);
  --md-sys-color-surface-container-low: light-dark(#F7F2FA, #1D1B20);
  --md-sys-color-surface-container: light-dark(#F3EDF7, #211F26);
  --md-sys-color-surface-container-high: light-dark(#ECE6F0, #2B2930);
  --md-sys-color-surface-container-highest: light-dark(#E6E0E9, #36343B);
  --md-sys-color-surface-bright: light-dark(#FEF7FF, #3B383E);
  --md-sys-color-surface-dim: light-dark(#DED8E1, #141218);
  --md-sys-color-inverse-surface: light-dark(#322F35, #E6E0E9);
  --md-sys-color-inverse-on-surface: light-dark(#F5EFF7, #322F35);
  --md-sys-color-background: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-background: light-dark(#1D1B20, #E6E0E9);
  --md-sys-color-outline: light-dark(#79747E, #938F99);
  --md-sys-color-outline-variant: light-dark(#CAC4D0, #49454F);
  --md-sys-color-scrim: light-dark(#000000, #000000);
  --md-sys-color-shadow: light-dark(#000000, #000000);
}
[data-contrast="medium"] {
  --md-sys-color-primary: light-dark(#4F378B, #EADDFF);
  --md-sys-color-on-primary: light-dark(#FFFFFF, #21005D);
  --md-sys-color-primary-container: light-dark(#6750A4, #9A82DB);
  --md-sys-color-on-primary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-inverse-primary: light-dark(#D0BCFF, #4F378B);
  --md-sys-color-primary-fixed: light-dark(#6750A4, #EADDFF);
  --md-sys-color-primary-fixed-dim: light-dark(#4F378B, #D0BCFF);
  --md-sys-color-on-primary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-primary-fixed-variant: light-dark(#FFFFFF, #381E72);
  --md-sys-color-secondary: light-dark(#4A4458, #E8DEF8);
  --md-sys-color-on-secondary: light-dark(#FFFFFF, #1D192B);
  --md-sys-color-secondary-container: light-dark(#625B71, #958DA5);
  --md-sys-color-on-secondary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-secondary-fixed: light-dark(#625B71, #E8DEF8);
  --md-sys-color-secondary-fixed-dim: light-dark(#4A4458, #CCC2DC);
  --md-sys-color-on-secondary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-secondary-fixed-variant: light-dark(#FFFFFF, #332D41);
  --md-sys-color-tertiary: light-dark(#633B48, #FFD8E4);
  --md-sys-color-on-tertiary: light-dark(#FFFFFF, #31111D);
  --md-sys-color-tertiary-container: light-dark(#7D5260, #B58392);
  --md-sys-color-on-tertiary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-tertiary-fixed: light-dark(#7D5260, #FFD8E4);
  --md-sys-color-tertiary-fixed-dim: light-dark(#633B48, #EFB8C8);
  --md-sys-color-on-tertiary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-tertiary-fixed-variant: light-dark(#FFFFFF, #492532);
  --md-sys-color-error: light-dark(#8C1D18, #F9DEDC);
  --md-sys-color-on-error: light-dark(#FFFFFF, #410E0B);
  --md-sys-color-error-container: light-dark(#B3261E, #E46962);
  --md-sys-color-on-error-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-surface: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-surface: light-dark(#000000, #FFFFFF);
  --md-sys-color-surface-variant: light-dark(#E7E0EC, #49454F);
  --md-sys-color-on-surface-variant: light-dark(#322F37, #E7E0EC);
  --md-sys-color-surface-container-lowest: light-dark(#FFFFFF, #0F0D13);
  --md-sys-color-surface-container-low: light-dark(#F7F2FA, #1D1B20);
  --md-sys-color-surface-container: light-dark(#F3EDF7, #211F26);
  --md-sys-color-surface-container-high: light-dark(#ECE6F0, #2B2930);
  --md-sys-color-surface-container-highest: light-dark(#E6E0E9, #36343B);
  --md-sys-color-surface-bright: light-dark(#FEF7FF, #3B383E);
  --md-sys-color-surface-dim: light-dark(#DED8E1, #141218);
  --md-sys-color-inverse-surface: light-dark(#322F35, #E6E0E9);
  --md-sys-color-inverse-on-surface: light-dark(#FFFFFF, #1D1B20);
  --md-sys-color-background: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-background: light-dark(#000000, #FFFFFF);
  --md-sys-color-outline: light-dark(#49454F, #AEA9B4);
  --md-sys-color-outline-variant: light-dark(#79747E, #938F99);
  --md-sys-color-scrim: light-dark(#000000, #000000);
  --md-sys-color-shadow: light-dark(#000000, #000000);
}
[data-contrast="high"] {
  --md-sys-color-primary: light-dark(#381E72, #F6EDFF);
  --md-sys-color-on-primary: light-dark(#FFFFFF, #000000);
  --md-sys-color-primary-container: light-dark(#4F378B, #D0BCFF);
  --md-sys-color-on-primary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-inverse-primary: light-dark(#D0BCFF, #381E72);
  --md-sys-color-primary-fixed: light-dark(#4F378B, #EADDFF);
  --md-sys-color-primary-fixed-dim: light-dark(#381E72, #D0BCFF);
  --md-sys-color-on-primary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-primary-fixed-variant: light-dark(#FFFFFF, #000000);
  --md-sys-color-secondary: light-dark(#332D41, #F6EDFF);
  --md-sys-color-on-secondary: light-dark(#FFFFFF, #000000);
  --md-sys-color-secondary-container: light-dark(#4A4458, #CCC2DC);
  --md-sys-color-on-secondary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-secondary-fixed: light-dark(#4A4458, #E8DEF8);
  --md-sys-color-secondary-fixed-dim: light-dark(#332D41, #CCC2DC);
  --md-sys-color-on-secondary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-secondary-fixed-variant: light-dark(#FFFFFF, #000000);
  --md-sys-color-tertiary: light-dark(#492532, #FFECF1);
  --md-sys-color-on-tertiary: light-dark(#FFFFFF, #000000);
  --md-sys-color-tertiary-container: light-dark(#633B48, #EFB8C8);
  --md-sys-color-on-tertiary-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-tertiary-fixed: light-dark(#633B48, #FFD8E4);
  --md-sys-color-tertiary-fixed-dim: light-dark(#492532, #EFB8C8);
  --md-sys-color-on-tertiary-fixed: light-dark(#FFFFFF, #000000);
  --md-sys-color-on-tertiary-fixed-variant: light-dark(#FFFFFF, #000000);
  --md-sys-color-error: light-dark(#601410, #FCEEEE);
  --md-sys-color-on-error: light-dark(#FFFFFF, #000000);
  --md-sys-color-error-container: light-dark(#8C1D18, #F2B8B5);
  --md-sys-color-on-error-container: light-dark(#FFFFFF, #000000);
  --md-sys-color-surface: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-surface: light-dark(#000000, #FFFFFF);
  --md-sys-color-surface-variant: light-dark(#E7E0EC, #49454F);
  --md-sys-color-on-surface-variant: light-dark(#000000, #FFFFFF);
  --md-sys-color-surface-container-lowest: light-dark(#FFFFFF, #0F0D13);
  --md-sys-color-surface-container-low: light-dark(#F7F2FA, #1D1B20);
  --md-sys-color-surface-container: light-dark(#F3EDF7, #211F26);
  --md-sys-color-surface-container-high: light-dark(#ECE6F0, #2B2930);
  --md-sys-color-surface-container-highest: light-dark(#E6E0E9, #36343B);
  --md-sys-color-surface-bright: light-dark(#FEF7FF, #3B383E);
  --md-sys-color-surface-dim: light-dark(#DED8E1, #141218);
  --md-sys-color-inverse-surface: light-dark(#322F35, #E6E0E9);
  --md-sys-color-inverse-on-surface: light-dark(#FFFFFF, #000000);
  --md-sys-color-background: light-dark(#FEF7FF, #141218);
  --md-sys-color-on-background: light-dark(#000000, #FFFFFF);
  --md-sys-color-outline: light-dark(#322F37, #F5EEFA);
  --md-sys-color-outline-variant: light-dark(#49454F, #CAC4D0);
  --md-sys-color-scrim: light-dark(#000000, #000000);
  --md-sys-color-shadow: light-dark(#000000, #000000);
}
/* prefers-contrast: repeat the [data-contrast="high"] declarations in
   @media (prefers-contrast: more) { :root:not([data-contrast]) { … } } */
```
