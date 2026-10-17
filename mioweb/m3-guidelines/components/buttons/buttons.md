# Buttons

> Source: https://m3.material.io/components/buttons · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference and shared primitives (state layer, focus ring, ripple, touch target, elevation, spring, disabled, typography roles).

## 1. Overview

Buttons communicate actions people can take. Typical placement: dialogs, modal windows, forms, cards, toolbars, and inside standard button groups.

- Use for discrete actions. Don't overuse: too many buttons disrupt hierarchy; move low-priority actions to overflow menus, icon buttons, chips, text links or a navigation rail.
- Use the **filled** style for the single most important / final action of a flow (Save, Join now, Confirm), ideally one per page.
- Use **toggle** buttons only for binary selections (Save, Favorite).
- Label: 1–3 words, sentence case, single line, never truncated or wrapped.

**M3 Expressive changes (May 2025)**
- Two variants: **default** and **toggle** (selection) — toggle is new.
- Color styles became *configurations*: elevated, filled (default), tonal, outlined, text.
- Five sizes: XS, S (existing, default), M, L, XL.
- Two shapes: **round** (default) and **square**.
- Shape morphs when pressed and when selected.
- Small button padding: **16dp** (recommended, matches new sizes); 24dp is no longer recommended.

**Differences from M2**: new color mappings + dynamic color; icon and label share the same color; neutral text button no longer recommended; icon size 20dp (S); fully rounded corners; default height 40dp (M2: 36dp, slightly rounded).

## 2. Variants & configurations

| Variant / configuration | Values | Notes |
| --- | --- | --- |
| Variant | Default, Toggle (selection) | Toggle is M3 Expressive only. No toggle for the **text** style. |
| Color | Elevated, Filled (default), Tonal, Outlined, Text | Order of emphasis (source diagram): elevated, filled, tonal, outlined, text. Default vs toggle use different colors. Other roles (e.g. tertiary / on-tertiary) allowed if container vs text keep 3:1. |
| Size | XS (32), S (40, default), M (56), L (96), XL (136) dp height | Size tokens are separate from color tokens; any color × any size × any shape. |
| Shape | Round (default), Square | Round = `corner.full`; square radius depends on size. |
| Small button padding | 16dp (recommended), 24dp (not recommended) | Only applies to S. |
| Icon | Optional leading icon | One icon max; leading side (mirrors in RTL). Icon-only actions → use an icon button. |
| Width | Hug content (default) or responsive/stretch | Never narrower than label; constrain max width in large windows. |

## 3. Anatomy

1. **Container** – holds label and icon; carries color, shape, elevation, outline (outlined). Invisible at rest for text style; outlined has no fill (stroke only).
2. **Label text** – describes the action; required.
3. **Icon** (optional) – leading, same color as label.
4. **State layer** (implicit) – state layer primitive, color = content color.
5. **Focus indicator** (implicit) – focus ring primitive (outer offset), follows current radius.
6. **Target area** (implicit) – touch target primitive, ≥48×48dp for XS and S.

## 4. Tokens & specs

### 4.1 Color

Toggle (unselected / selected) uses `unselected.*` / `selected.*` tokens; default buttons use the un-prefixed tokens.

**Summary matrix**

| Style | Default container / content | Toggle unselected container / content | Toggle selected container / content |
| --- | --- | --- | --- |
| Elevated | `--md-sys-color-surface-container-low` / `--md-sys-color-primary` | surface-container-low / primary | `--md-sys-color-primary` / `--md-sys-color-on-primary` |
| Filled | `--md-sys-color-primary` / `--md-sys-color-on-primary` | `--md-sys-color-surface-container` / `--md-sys-color-on-surface-variant` | primary / on-primary |
| Tonal | `--md-sys-color-secondary-container` / `--md-sys-color-on-secondary-container` | secondary-container / on-secondary-container | `--md-sys-color-secondary` / `--md-sys-color-on-secondary` |
| Outlined | transparent, outline `--md-sys-color-outline-variant` / `--md-sys-color-on-surface-variant` | same as default | `--md-sys-color-inverse-surface` / `--md-sys-color-inverse-on-surface` |
| Text | transparent / `--md-sys-color-primary` | — | — |

- "Content" = label **and** icon **and** state-layer color (identical tokens in every style/selection state).
- Label/icon colors do **not** change across hover/focus/pressed (the per-state tokens alias the enabled value).
- State-layer opacities: hover 0.08, focus 0.10, pressed 0.10 (`--md-sys-state-*-state-layer-opacity`).

**Disabled (all styles, default and toggle)**

| Part | Token pattern | Value |
| --- | --- | --- |
| Container | `*.disabled.container.color` + `*.disabled.container.opacity` | `--md-sys-color-on-surface` @ 0.10 |
| Label, icon | `*.disabled.{label-text|icon}.color` + `.opacity` | `--md-sys-color-on-surface` @ 0.38 |
| Elevation | `*.disabled.container.elevation` | level0 (elevated, filled, tonal) |
| Outline (outlined) | `outlined[.unselected].disabled.outline.color` | `--md-sys-color-outline-variant` (no opacity token → full) |
| Selected container (outlined) | `outlined.selected.disabled.container.color` | on-surface @ 0.10 (`outlined.disabled.container.opacity`) |
| State layer | — | none (disabled shows no state layer) |

Disabled toggle: selected and unselected look identical except outlined selected (gets the 10% fill). Text default and outlined default/unselected: container stays transparent (decision, see §11).

### 4.2 Size, layout & shape

| Size | Height | Leading / trailing space | Icon size | Icon–label gap | Outline width | Label role | Touch target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| XS | 32dp | 12 / 12dp | 20dp | 4dp (`space50`) | 1dp | label-large (14/20) | 48dp (8dp extra top/bottom) |
| S (default) | 40dp | 16 / 16dp (`space200`) | 20dp | 8dp (`space100`) | 1dp | label-large (14/20) | 48dp (4dp extra top/bottom) |
| M | 56dp | 24 / 24dp (`space300`) | 24dp | 8dp (`space100`) | 1dp | title-medium (16/24) | = container |
| L | 96dp | 48 / 48dp (`space600`) | 32dp | 12dp (`space150`) | 2dp | headline-small (24/32) | = container |
| XL | 136dp | 64 / 64dp (`space800`) | 40dp | 16dp (`space200`) | 3dp | headline-large (32/40) | = container |

- **Padding with icon**: leading/trailing space is the same with or without a leading icon (single token set, no `with-icon` variant): `[leading-space][icon][icon-label-space][label][trailing-space]`.
- **Legacy S padding**: 24dp leading/trailing at 40dp height (opt-in only).
- **Vertical**: no vertical padding tokens; height is fixed, content centered (`align-items: center`). Label line-height < height for every size.
- **Outline** is drawn inside the container bounds (does not add to height/width) (derived: matches the spec diagrams where height is constant across styles).
- **Min width**: not specified (derived: none; the touch target primitive guarantees a 48dp hit area for short labels).
- Content (icon + label) stays grouped and centered as width grows.

**Corner radii** (per size; `full` = half the height)

| Shape / state | Token | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- | --- |
| Round, rest (unselected / default) | `container.shape.round` | full (16) | full (20) | full (28) | full (48) | full (68) |
| Square, rest (unselected / default) | `container.shape.square` | 12 (`medium`) | 12 (`medium`) | 16 (`large`) | 28 (`extra-large`) | 28 (`extra-large`) |
| Pressed (both shapes, any selection) | `pressed.container.shape` | 8 (`small`) | 8 (`small`) | 12 (`medium`) | 16 (`large`) | 16 (`large`) |
| Selected, round button | `selected.container.shape.round` | 12 (`medium`) | 12 | 16 | 28 | 28 |
| Selected, square button | `selected.container.shape.square` | full | full | full | full | full |

A selected round toggle takes the square radius; a selected square toggle becomes round; pressed overrides both.

### 4.3 Typography

| Size | Label role | CSS |
| --- | --- | --- |
| XS, S | `md.sys.typescale.label-large` | `--md-sys-typescale-label-large-*` |
| M | `md.sys.typescale.title-medium` | `--md-sys-typescale-title-medium-*` |
| L | `md.sys.typescale.headline-small` | `--md-sys-typescale-headline-small-*` |
| XL | `md.sys.typescale.headline-large` | `--md-sys-typescale-headline-large-*` |

Apply via the typography role pattern. Sentence case; no `text-transform`; `white-space: nowrap`.

### 4.4 Elevation

| Style | Enabled | Hovered | Focused | Pressed | Disabled |
| --- | --- | --- | --- | --- | --- |
| Elevated | level1 | level2 (derived: no token; guidelines "+1 level on hover", baseline M3 value) | level1 | level1 | level0 |
| Filled | level0 | level1 (derived: same rule; baseline M3 value) | level0 | level0 | level0 |
| Tonal | level0 | level1 (derived: same rule) | level0 | level0 | level0 |
| Outlined, Text | none | none | none | none | none |

Same for toggle unselected/selected. Shadow color: `--md-sys-color-shadow`. Rendered through the elevation primitive.

### 4.5 Component token list

Notation: `{a|b}` expands to one token per alternative; `[.x]` = optional segment (token exists with and without it). Prefix `md.comp.button.` omitted. CSS: `--md-comp-button-<rest-with-dashes>`. Verified complete against the source (6 sets: 5 color + 5 size; no common set is published).

**Color – Filled (`filled`)**
- `filled.container.color` → primary
- `filled.unselected.container.color` → surface-container
- `filled.selected.container.color` → primary
- `filled.container.shadow-color` → shadow
- `filled.container.elevation`, `filled.{focused|pressed|disabled}.container.elevation` → level0
- `filled[.{hovered|focused|pressed}].{label-text|icon}.color` → on-primary
- `filled.unselected[.{hovered|focused|pressed}].{label-text|icon}.color` → on-surface-variant
- `filled.selected[.{hovered|focused|pressed}].{label-text|icon}.color` → on-primary
- `filled.{hovered|focused|pressed}.state-layer.color` → on-primary
- `filled.unselected.{hovered|focused|pressed}.state-layer.color` → on-surface-variant
- `filled.selected.{hovered|focused|pressed}.state-layer.color` → on-primary
- `filled.hovered.state-layer.opacity` → state.hover (0.08); `filled.focused.state-layer.opacity` → state.focus (0.1); `filled.pressed.state-layer.opacity` → state.pressed (0.1)
- `filled.disabled.container.color` → on-surface; `filled.disabled.container.opacity` → 0.1
- `filled.disabled.{label-text|icon}.color` → on-surface; `filled.disabled.{label-text|icon}.opacity` → 0.38

**Color – Elevated (`elevated`)**
- `elevated.container.color`, `elevated.unselected.container.color` → surface-container-low
- `elevated.selected.container.color` → primary
- `elevated.container.shadow-color` → shadow
- `elevated.container.elevation`, `elevated.{focused|pressed}.container.elevation` → level1; `elevated.disabled.container.elevation` → level0
- `elevated[.unselected][.{hovered|focused|pressed}].{label-text|icon}.color` → primary
- `elevated.selected[.{hovered|focused|pressed}].{label-text|icon}.color` → on-primary
- `elevated[.unselected].{hovered|focused|pressed}.state-layer.color` → primary
- `elevated.selected.{hovered|focused|pressed}.state-layer.color` → on-primary
- `elevated.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1 (state tokens)
- `elevated.disabled.container.color` → on-surface; `elevated.disabled.container.opacity` → 0.1
- `elevated.disabled.{label-text|icon}.color` → on-surface; `.opacity` → 0.38

**Color – Tonal (`tonal`)**
- `tonal.container.color`, `tonal.unselected.container.color` → secondary-container
- `tonal.selected.container.color` → secondary
- `tonal.container.shadow-color` → shadow
- `tonal.container.elevation`, `tonal.{focused|pressed|disabled}.container.elevation` → level0
- `tonal[.unselected][.{hovered|focused|pressed}].{label-text|icon}.color` → on-secondary-container
- `tonal.selected[.{hovered|focused|pressed}].{label-text|icon}.color` → on-secondary
- `tonal[.unselected].{hovered|focused|pressed}.state-layer.color` → on-secondary-container
- `tonal.selected.{hovered|focused|pressed}.state-layer.color` → on-secondary
- `tonal.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1
- `tonal.disabled.container.color` → on-surface; `.opacity` → 0.1
- `tonal.disabled.{label-text|icon}.color` → on-surface; `.opacity` → 0.38

**Color – Outlined (`outlined`)** (no shadow/elevation tokens; no `unselected.container.color`)
- `outlined.outline.color` → outline-variant
- `outlined[.unselected].{hovered|focused|pressed}.outline.color` → outline-variant
- `outlined[.unselected].disabled.outline.color` → outline-variant
- `outlined.selected.container.color` → inverse-surface
- `outlined[.unselected][.{hovered|focused|pressed}].{label-text|icon}.color` → on-surface-variant
- `outlined.selected[.{hovered|focused|pressed}].{label-text|icon}.color` → inverse-on-surface
- `outlined[.unselected].{hovered|focused|pressed}.state-layer.color` → on-surface-variant
- `outlined.selected.{hovered|focused|pressed}.state-layer.color` → inverse-on-surface
- `outlined.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1
- `outlined.selected.disabled.container.color` → on-surface; `outlined.disabled.container.opacity` → 0.1
- `outlined.disabled.{label-text|icon}.color` → on-surface; `.opacity` → 0.38

**Color – Text (`text`)** (no toggle; no enabled container tokens)
- `text[.{hovered|focused|pressed}].{label-text|icon}.color` → primary
- `text.{hovered|focused|pressed}.state-layer.color` → primary
- `text.{hovered|focused|pressed}.state-layer.opacity` → 0.08 / 0.1 / 0.1
- `text.disabled.container.color` → on-surface; `.opacity` → 0.1
- `text.disabled.{label-text|icon}.color` → on-surface; `.opacity` → 0.38

**Size sets** (`xsmall | small | medium | large | xlarge`)

| Token (`<size>.` …) | xsmall | small | medium | large | xlarge |
| --- | --- | --- | --- | --- | --- |
| `container.height` | 32dp | 40dp | 56dp | 96dp | 136dp |
| `outlined.outline.width` | 1dp | 1dp | 1dp | 2dp | 3dp |
| `icon.size` | 20dp | 20dp | 24dp | 32dp | 40dp |
| `label-text` | typescale.label-large | label-large | title-medium | headline-small | headline-large |
| `leading-space` | 12dp (literal) | space200 (16) | space300 (24) | space600 (48) | space800 (64) |
| `trailing-space` | 12dp (literal) | space200 (16) | space300 (24) | space600 (48) | space800 (64) |
| `icon-label-space` | space50 (4) | space100 (8) | space100 (8) | space150 (12) | space200 (16) |
| `container.shape.round` | corner.full | corner.full | corner.full | corner.full | corner.full |
| `container.shape.square` | corner.medium (12) | corner.medium (12) | corner.large (16) | corner.extra-large (28) | corner.extra-large (28) |
| `pressed.container.shape` | corner.small (8) | corner.small (8) | corner.medium (12) | corner.large (16) | corner.large (16) |
| `selected.container.shape.round` | corner.medium (12) | corner.medium (12) | corner.large (16) | corner.extra-large (28) | corner.extra-large (28) |
| `selected.container.shape.square` | corner.full | corner.full | corner.full | corner.full | corner.full |
| `pressed.container.corner-size.motion.spring.stiffness` | spring.fast.spatial.stiffness (1400) | same | same | same | same |
| `pressed.container.corner-size.motion.spring.damping` | spring.fast.spatial.damping (0.9) | same | same | same | same |

(1400 / 0.9 are the standard-scheme values; in the expressive motion scheme the same sys token resolves to 800 / 0.6.)

## 5. States & interaction

**State × part matrix** (content = label + icon; SL = state layer)

| State | Container | Content | SL opacity | Elevation | Radius |
| --- | --- | --- | --- | --- | --- |
| Enabled | style color | style content color | 0 | rest | rest (round/square) |
| Hovered | unchanged | unchanged | 0.08 | +1 (derived, §4.4) | rest |
| Focused (`:focus-visible`) | unchanged | unchanged | 0.10 + focus ring | rest | rest |
| Pressed | unchanged | unchanged | 0.10 (+ ripple) | rest | pressed |
| Selected (toggle) | selected color | selected content | — | rest | selected (swapped) |
| Selected + hover/focus/pressed | selected color | selected content | 0.08 / 0.10 / 0.10 in **selected content color** | as above | selected → pressed when pressed |
| Disabled (any selection) | on-surface @ 0.10 (transparent for text and unselected/default outlined) | on-surface @ 0.38 | none | level0 | rest/selected radius kept, never pressed |

- Only one SL at a time; precedence pressed > focus > hover.
- **Shape morph – pressed**: both shapes morph to the same pressed radius; spring back on release.
- **Shape morph – selected**: round → square radius; square → full. Pressed shape applies on top.
- **Toggle behaviour**: activation flips `selected`; color + radius change; label may change (keep similar character count); icon switches outlined → filled glyph (or heavier weight if no filled version).
- **Keyboard**: Tab focuses; Space or Enter activates (toggles if toggle).
- **Disabled**: not focusable, no hover/press (native `disabled`); optional `aria-disabled="true"` mode keeps it focusable but inert (web mapping).

## 6. Motion & behavior

| Property | Spring (sys token) | CSS (spring primitive helpers) |
| --- | --- | --- |
| `border-radius` (press, select) | fast spatial (`pressed.container.corner-size.motion.spring.*`) | `--md-sys-motion-spring-fast-spatial-duration` / `-easing` |
| background-color, color, outline color (select toggle) | fast effects (derived: guidelines rule "effects springs on color/opacity") | `--md-sys-motion-spring-fast-effects-duration` / `-easing` |
| State-layer opacity | fast effects (derived) | same |
| box-shadow (hover lift) | fast effects (derived: guidelines "animate shadow with an effects spring") | same |

- **Animate numeric radii**, never `9999px`: interpolating from 9999px stays visually "full" for most of the animation. Use `full = height / 2` (16/20/28/48/68px).
- **Rapid clicks (web)**: "use a modified motion curve to avoid resonant effects" when rapid repeated clicks are expected (e.g. next track). Implementation: CSS transitions already retarget from the current value; with a JS spring keep current value + velocity on retarget (spring primitive) instead of restarting.
- **Reduced motion**: radius changes become instant (no morph); color/SL fades keep ≤ fast effects duration.
- **Adaptive**: buttons can change size, alignment and arrangement across window size classes (e.g. end-aligned below content in compact; start-aligned beside content in large). Constrain max width to avoid long flat buttons. Keep DOM/visual order identical across sizes.
- Width can be responsive (stretch to layout grid); icon + label always stay grouped and centered.

## 7. Usage guidelines

- **Hierarchy**: filled (highest after FAB) > tonal > outlined > text; elevated only when visual separation from a prominent background is needed (avoid overusing shadows). In button groups, give primary actions more emphasis by size, color or shape.
- **Filled**: important final actions; ideally one per page; may use tertiary colors.
- **Tonal**: lower-priority actions needing more emphasis than outline (e.g. Next in onboarding); secondary color mapping.
- **Outlined**: medium emphasis; pairs with filled for alternative actions; place on simple backgrounds (gradients OK). Caution on images — add a contrasting fill or use filled. Looks like chips — avoid placing next to chips.
- **Text**: lowest priority, esp. multiple options; used in cards, dialogs, snackbars. Don't underline (use hyperlinks for links). Label color must be distinguishable from non-button text. In dialogs, align to trailing edge.
- **Label**: concise (1–3 words), sentence case, single line, no truncation/wrap. Toggle labels: similar length in both states.
- **Icon**: optional, leading side only (right of label in RTL); never stacked above label; never two icons; must clearly communicate meaning.
- **Width**: hugs label by default; can stretch responsively; never smaller than label.

## 8. Accessibility

- **Role** (web mapping): native `<button>`; `<a href>` only for navigation (link styled as button).
- **Toggle** (web mapping): `aria-pressed="true|false"` reflecting `selected`. If the label changes between states, omit `aria-pressed` (the label change conveys the state).
- **Disabled**: `disabled` attribute (or `aria-disabled="true"` if it must remain focusable). Links: remove `href`, add `aria-disabled="true"`.
- **Label**: accessible name = visible label (Done, Send, Reply); extra context via `aria-describedby` or a name that *starts with* the visible label. Icons are decorative (`aria-hidden="true"`).
- **Keyboard**

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move focus to / from the button |
| Space or Enter | Activate (toggle selection for toggle buttons) |

- **Target**: ≥48×48dp for XS (32dp) and S (40dp) buttons.
- **Contrast**: 3:1 against background — measured from the container for elevated/filled/tonal, and from the label for outlined/text.
- **Text scaling**: at 200% text size, labels should fit within two lines (Android guidance); choose concise strings; if truncated, provide another single-tap way to the full content.
- Keep element order identical across breakpoints.

## 9. Implementation checklist

- [ ] Public API: `color` (`elevated|filled|tonal|outlined|text`, default `filled`), `size` (`xsmall|small|medium|large|xlarge`, default `small`), `shape` (`round|square`, default `round`), `toggle` (bool), `selected` (bool), `disabled`, `type` (`button|submit|reset`), `href`/`target` (renders `<a>`), leading `icon` slot, default slot = label; optional `selected-icon` / `selected-label`.
- [ ] Events: native `click`; toggles fire `change` after `selected` flips (`preventDefault()` on click cancels the flip).
- [ ] Ignore `toggle` with `color="text"` (warn in dev).
- [ ] Parts: host (container: fill, radius, shadow, focus ring) → outline → state layer (+ ripple) → touch target → icon + label.
- [ ] All values through `--md-comp-button-*` → `--md-sys-*`; size, color and shape composable independently.
- [ ] Radius state machine (rest / selected / pressed) with numeric `full` and spring transition; reduced-motion fallback.
- [ ] Outline width per size (1/1/1/2/3dp), hidden when outlined toggle is selected.
- [ ] Disabled per §4.1, no SL, no pointer events, elevation 0.
- [ ] `white-space: nowrap`; logical properties for RTL; optional full-width.
- [ ] `aria-pressed` for toggles; accessible name = visible label.
- [ ] Legacy 24dp S padding behind an explicit opt-in.

## 10. HTML/CSS implementation blueprint

**(a) DOM**

```html
<!-- default -->
<button class="md-button" type="button" data-color="filled" data-size="small" data-shape="round">
  <span class="md-button__outline" part="outline" aria-hidden="true"></span>   <!-- outlined only -->
  <span class="md-button__state-layer" part="state-layer" aria-hidden="true"></span>
  <span class="md-button__touch" part="touch-target" aria-hidden="true"></span>  <!-- XS, S -->
  <span class="md-button__icon" part="icon" aria-hidden="true">add</span>       <!-- optional, first child = leading in LTR and RTL -->
  <span class="md-button__label" part="label">Add item</span>
</button>
<!-- toggle -->
<button class="md-button" type="button" data-color="tonal" data-toggle aria-pressed="false">…</button>
<!-- link -->
<a class="md-button" data-color="text" href="/more">…</a>
```

**(b) Custom properties** (comp token → sys default; one block per color and size)

```css
.md-button {
  /* size: small (default) */
  --_height: var(--md-comp-button-small-container-height, 40px);
  --_leading: var(--md-comp-button-small-leading-space, var(--md-sys-measurement-space200));
  --_trailing: var(--md-comp-button-small-trailing-space, var(--md-sys-measurement-space200));
  --_gap: var(--md-comp-button-small-icon-label-space, var(--md-sys-measurement-space100));
  --_icon-size: var(--md-comp-button-small-icon-size, 20px);
  --_outline-width: var(--md-comp-button-small-outlined-outline-width, 1px);
  --_full: calc(var(--_height) / 2);
  --_r-square: var(--md-comp-button-small-container-shape-square, var(--md-sys-shape-corner-medium));
  --_r-pressed: var(--md-comp-button-small-pressed-container-shape, var(--md-sys-shape-corner-small));
  /* color: filled (default) */
  --_container: var(--md-comp-button-filled-container-color, var(--md-sys-color-primary));
  --_content: var(--md-comp-button-filled-label-text-color, var(--md-sys-color-on-primary));
  --_elevation: var(--md-comp-button-filled-container-elevation, var(--md-sys-elevation-level0));
  --_elevation-hover: var(--md-sys-elevation-level1);          /* derived */
  --_outline-color: transparent;
}
.md-button[data-size="xsmall"] { --_height: 32px; --_leading: 12px; --_trailing: 12px;
  --_gap: var(--md-sys-measurement-space50); --_icon-size: 20px; --_outline-width: 1px;
  --_r-square: var(--md-sys-shape-corner-medium); --_r-pressed: var(--md-sys-shape-corner-small); }
.md-button[data-size="medium"] { --_height: 56px; --_leading: var(--md-sys-measurement-space300); --_trailing: var(--md-sys-measurement-space300);
  --_gap: var(--md-sys-measurement-space100); --_icon-size: 24px; --_outline-width: 1px;
  --_r-square: var(--md-sys-shape-corner-large); --_r-pressed: var(--md-sys-shape-corner-medium); }
.md-button[data-size="large"] { --_height: 96px; --_leading: var(--md-sys-measurement-space600); --_trailing: var(--md-sys-measurement-space600);
  --_gap: var(--md-sys-measurement-space150); --_icon-size: 32px; --_outline-width: 2px;
  --_r-square: var(--md-sys-shape-corner-extra-large); --_r-pressed: var(--md-sys-shape-corner-large); }
.md-button[data-size="xlarge"] { --_height: 136px; --_leading: var(--md-sys-measurement-space800); --_trailing: var(--md-sys-measurement-space800);
  --_gap: var(--md-sys-measurement-space200); --_icon-size: 40px; --_outline-width: 3px;
  --_r-square: var(--md-sys-shape-corner-extra-large); --_r-pressed: var(--md-sys-shape-corner-large); }
/* (each size value above is wrapped in var(--md-comp-button-<size>-…, …) like the small block) */
.md-button[data-size="small"][data-padding="wide"] { --_leading: 24px; --_trailing: 24px; } /* legacy, not recommended */

.md-button[data-color="elevated"] { --_container: var(--md-sys-color-surface-container-low); --_content: var(--md-sys-color-primary);
  --_elevation: var(--md-sys-elevation-level1); --_elevation-hover: var(--md-sys-elevation-level2); }
.md-button[data-color="tonal"] { --_container: var(--md-sys-color-secondary-container); --_content: var(--md-sys-color-on-secondary-container); }
.md-button[data-color="outlined"] { --_container: transparent; --_content: var(--md-sys-color-on-surface-variant);
  --_outline-color: var(--md-sys-color-outline-variant); --_elevation: none; --_elevation-hover: none; }
.md-button[data-color="text"] { --_container: transparent; --_content: var(--md-sys-color-primary); --_elevation: none; --_elevation-hover: none; }
/* toggle */
.md-button[data-color="filled"][aria-pressed="false"] { --_container: var(--md-sys-color-surface-container); --_content: var(--md-sys-color-on-surface-variant); }
.md-button[data-color="elevated"][aria-pressed="true"],
.md-button[data-color="filled"][aria-pressed="true"]  { --_container: var(--md-sys-color-primary); --_content: var(--md-sys-color-on-primary); }
.md-button[data-color="tonal"][aria-pressed="true"]   { --_container: var(--md-sys-color-secondary); --_content: var(--md-sys-color-on-secondary); }
.md-button[data-color="outlined"][aria-pressed="true"]{ --_container: var(--md-sys-color-inverse-surface); --_content: var(--md-sys-color-inverse-on-surface); --_outline-color: transparent; }
```

**(c) Base + state selectors**

```css
.md-button {
  position: relative; isolation: isolate; box-sizing: border-box;
  display: inline-flex; align-items: center; justify-content: center; gap: var(--_gap);
  block-size: var(--_height); padding-block: 0;
  padding-inline: var(--_leading) var(--_trailing);
  border: 0; margin: 0; cursor: pointer; text-decoration: none; white-space: nowrap;
  -webkit-tap-highlight-color: transparent; user-select: none;
  background: var(--_container); color: var(--_content);
  box-shadow: var(--_elevation);
  --_radius: var(--_full);
  border-radius: var(--_radius);   /* state rules only change --_radius, so wrappers (split button, groups) can override corners */
  /* typography role: label-large (XS,S) / title-medium (M) / headline-small (L) / headline-large (XL) */
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}
.md-button[data-shape="square"]                      { --_radius: var(--_r-square); }
.md-button[aria-pressed="true"]                      { --_radius: var(--_r-square); }   /* round selected */
.md-button[data-shape="square"][aria-pressed="true"] { --_radius: var(--_full); }       /* square selected */
.md-button:is(:active, [data-pressed]):not(:disabled) { --_radius: var(--_r-pressed); }
/* per-size type role (same pattern as label-large above) */
.md-button[data-size="medium"] { font: var(--md-sys-typescale-title-medium-weight) var(--md-sys-typescale-title-medium-size)/var(--md-sys-typescale-title-medium-line-height) var(--md-sys-typescale-title-medium-font); letter-spacing: var(--md-sys-typescale-title-medium-tracking); }
.md-button[data-size="large"]  { font: var(--md-sys-typescale-headline-small-weight) var(--md-sys-typescale-headline-small-size)/var(--md-sys-typescale-headline-small-line-height) var(--md-sys-typescale-headline-small-font); letter-spacing: var(--md-sys-typescale-headline-small-tracking); }
.md-button[data-size="xlarge"] { font: var(--md-sys-typescale-headline-large-weight) var(--md-sys-typescale-headline-large-size)/var(--md-sys-typescale-headline-large-line-height) var(--md-sys-typescale-headline-large-font); letter-spacing: var(--md-sys-typescale-headline-large-tracking); }

.md-button__icon { inline-size: var(--_icon-size); block-size: var(--_icon-size); font-size: var(--_icon-size); flex: none; }
.md-button__icon > svg { inline-size: 100%; block-size: 100%; fill: currentColor; }
.md-button[aria-pressed="true"] .md-button__icon { font-variation-settings: 'FILL' 1; } /* Material Symbols filled glyph */
.md-button__outline { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  border: var(--_outline-width) solid var(--_outline-color); }
/* state layer primitive: background = var(--_content); opacities per state */
@media (hover: hover) { .md-button:hover:not(:disabled) { box-shadow: var(--_elevation-hover); } }
/* focus ring primitive (outer offset) on .md-button:focus-visible; follows border-radius */
/* touch target primitive: .md-button__touch { position:absolute; inset-block:50%; inset-inline:0; min-block-size:48px; translate:0 -50% } */

.md-button:disabled, .md-button[aria-disabled="true"] {
  cursor: default; pointer-events: none; box-shadow: none;
  color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent);
}
.md-button:is([data-color="text"], [data-color="outlined"]:not([aria-pressed="true"])):is(:disabled, [aria-disabled="true"]) { background: transparent; }
.md-button:is(:disabled, [aria-disabled="true"]) .md-button__state-layer { display: none; }
.md-button[data-color="outlined"]:is(:disabled,[aria-disabled="true"]):not([aria-pressed="true"]) { --_outline-color: var(--md-sys-color-outline-variant); }
.md-button[data-full-width] { display: flex; inline-size: 100%; }
```

**(d) Motion**

```css
.md-button {
  transition:
    border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
    background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
    box-shadow var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
}
@media (prefers-reduced-motion: reduce) { .md-button { transition-property: background-color, color, box-shadow; } }
```

**(e) Forced colors**

```css
@media (forced-colors: active) {
  .md-button { border: 1px solid ButtonText; color: ButtonText; background: ButtonFace; forced-color-adjust: none; }
  .md-button[aria-pressed="true"] { background: Highlight; color: HighlightText; border-color: Highlight; }
  .md-button:disabled, .md-button[aria-disabled="true"] { color: GrayText; border-color: GrayText; background: ButtonFace; }
  .md-button:focus-visible { outline-color: Highlight; }
  .md-button__state-layer { display: none; }
}
```

**(f) Behaviour / JS**
- Toggle: on `click` (not default-prevented) flip `aria-pressed`, swap `selected-label`/`selected-icon` if provided, dispatch `change`. If a label swap is used, drop `aria-pressed`.
- Enter fires `click` on keydown without an `:active` phase: set `data-pressed` for ~100ms (derived) so the pressed morph is visible; Space uses native `:active`.
- Ripple primitive on `pointerdown` (center for keyboard).
- `aria-disabled` mode: cancel `click`/`keydown` activation in capture phase.
- Native form participation comes from `<button type>`; default `type="button"` in the library (derived: avoids accidental submits).

## 11. Source gaps & decisions

- **No hovered elevation tokens** (any style) → derived +1 level on hover (elevated 2, filled/tonal 1) from the guidelines elevation rule / baseline M3; exposed as `--_elevation-hover` so it can be set to the rest level.
- **Disabled container for text / outlined**: tokens give on-surface @ 0.10 yet the container is "invisible at rest" → keep transparent for text and unselected/default outlined; apply only `outlined.selected.disabled.container.color` (it has a dedicated token).
- **Selected outlined outline**: no `selected.outline.color` token → outline hidden (inverse-surface fill).
- **Spring values**: tokens reference `spring.fast.spatial` (1400/0.9 = standard scheme); expressive scheme resolves to 800/0.6 → always reference the sys token, never the literal.
- **Color/state-layer/shadow motion** not specified → fast effects spring (guidelines rule).
- **`corner.full` in morphs**: implemented as `height/2` so radius interpolation is visible.
- **Min width / vertical padding** not specified → none; fixed height + centered content.
- **"Elevated is the same as tonal but with a shadow"** (guidelines text) conflicts with tokens (surface-container-low / primary) → tokens win.
- **"Leading and trailing icons 20dp"** (M2 differences) vs "icon on leading side only" → only a leading icon is supported.
- **Target-area text says "icon buttons"** in the buttons page → interpreted as XS and S buttons (diagram shows buttons).
- **Toggle icon change** (outlined → filled) is guidance only → `'FILL' 1` for Material Symbols, or a `selected-icon` slot.
- **Rapid-click "modified motion curve"** not given → rely on retargeting transitions/springs from the current value.
