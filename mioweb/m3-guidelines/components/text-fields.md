# Text fields

> Source: https://m3.material.io/components/text-fields · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
Text fields let people enter text into a UI (forms, dialogs, contact/payment info).

- Two variants with **identical functionality**: **filled** (higher emphasis) and **outlined** (lower emphasis; simplifies dense forms).
- Must look interactive; the state (blank, populated, focused, error, disabled) must be visible at a glance.
- Keep labels and error messages brief and actionable.
- Use when someone must type free-form text. Don't use single-line fields for long responses — use multi-line or a text area.
- **M3 Expressive changes:** none in the source (no shape-morph/spring tokens). Differences from M2: new color mappings, dynamic-color compatible.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| Filled | Container fill `surface-container-highest` + bottom active indicator | Top corners 4px, bottom square |
| Outlined | Transparent container, 1px outline all around | 4px all corners; floated label sits in a notch in the top outline |
| Single-line | One line; overflow scrolls horizontally with the caret | Default |
| Multi-line | Starts single-line, grows as text wraps (pushes content down) | |
| Text area | Fixed, taller height; wraps and scrolls vertically | Preferred over multi-line **on the web**; must fit mobile screens |
| Leading icon | Optional 24px icon at start | Swaps sides in RTL |
| Trailing icon | Optional 24px icon/icon button at end: signifier (e.g. calendar), valid/error, clear, voice, dropdown, visibility toggle | Swaps sides in RTL |
| Image | 24px-high image as trailing element (e.g. card brand) | |
| Prefix / suffix text | Static text before/after the input (currency, unit, email domain) | `on-surface-variant` |
| Supporting text | Helper line below (persistent or focus-only) | Replaced by error text in error state |
| Character counter | `used/limit`, trailing-aligned below | |
| Error | Error colors on indicator/outline, label, trailing icon, caret, supporting text | Error icon strongly recommended |
| Read-only | Styled like enabled; clearly labeled read-only | |
| Dense | Opt-in only (density −1…−3) | See §4.2 |

## 3. Anatomy
**Filled** (source numbering): 1 Container · 2 Leading icon (opt.) · 3 Label text, empty field · 4 Label text, populated field · 5 Trailing icon (opt.) · 6 Focused active indicator · 7 Caret · 8 Input text · 9 Supporting text (opt.) · 10 Enabled active indicator. (+ hover state layer over the container — token-only part.)

**Outlined**: 1 Enabled container outline · 2 Leading icon (opt.) · 3 Label text, empty · 4 Label text, populated (in outline notch, 4px each side) · 5 Trailing icon (opt.) · 6 Focused container outline · 7 Caret · 8 Input text · 9 Supporting text (opt.).

Below-field row (both): supporting/error text (start) + character counter (end).

## 4. Tokens & specs

### 4.1 Color
Short names below are relative to `--md-comp-filled-text-field-` / `--md-comp-outlined-text-field-`.

| Part | Enabled | Hover | Focus | Disabled | Error | Error hover | Error focus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Container (filled) | surface-container-highest | + SL on-surface @0.08 | = | on-surface @0.04 | = | + SL on-surface @0.08 | = |
| Active indicator (filled) | on-surface-variant 1px | on-surface 1px | primary 3px (see §11) | on-surface @0.38 1px | error 1px | on-error-container 1px | error 3px |
| Outline (outlined) | outline 1px | on-surface 1px | primary 3px | on-surface @0.12 1px | error 1px | on-error-container 1px | error 3px |
| Label (filled) | on-surface-variant | on-surface-variant | primary | on-surface @0.38 | error | on-error-container | error |
| Label (outlined) | on-surface-variant | **on-surface** | primary | on-surface @0.38 | error | on-error-container | error |
| Input text | on-surface | on-surface | on-surface | on-surface @0.38 | on-surface | on-surface | on-surface |
| Placeholder / prefix / suffix | on-surface-variant | = | = | (derived) on-surface @0.38 | = | = | = |
| Caret | primary | – | primary | – | – | – | error |
| Leading icon | on-surface-variant | on-surface-variant | on-surface-variant | on-surface @0.38 | on-surface-variant | on-surface-variant | on-surface-variant |
| Trailing icon | on-surface-variant | on-surface-variant | on-surface-variant | on-surface @0.38 | error | on-error-container | error |
| Supporting text | on-surface-variant | on-surface-variant | on-surface-variant | on-surface @0.38 | error | error | error |
| Counter | (derived) as supporting text in all states | | | | | | |

All values are system color roles; hover SL opacity = `--md-sys-state-hover-state-layer-opacity`. Baseline hex: surface-container-highest #e6e0e9, on-surface #1d1b20, on-surface-variant #49454f, outline #79747e, primary #6750a4, error #b3261e, on-error-container #8c1d18. Outlined has no container color and no state layer. Outline contrast vs background ≥ 3:1.

### 4.2 Size, layout & shape

**Source values**

| Attribute | Filled | Outlined |
| --- | --- | --- |
| Container height / target | 56px | 56px |
| Label alignment (unpopulated) | vertically centered | vertically centered |
| Top/bottom padding | 8px | – (derived 16px, see below) |
| Start/end padding, no icons | 16px | 16px |
| Start/end padding on an icon side (edge → icon) | 12px | 12px |
| Gap icon ↔ text | 16px | 16px |
| Icon size / alignment | 24px, vertically centered | same |
| Floated label horizontal padding (notch) | – | 4px each side |
| Supporting text / counter top padding | 4px | 4px |
| Gap supporting text ↔ counter | 16px | 16px |
| Shape | `--md-sys-shape-corner-extra-small-top` (4px TL/TR) | `--md-sys-shape-corner-extra-small` (4px) |
| Indicator / outline width | enabled/hover/disabled 1px; focus 3px (§11) | 1px; focus 3px |
| Embedded image height | 24px | 24px |

**Exact geometry per configuration (y from container top; x from inline-start; derived from the values above unless noted)**

| Configuration | Filled | Outlined |
| --- | --- | --- |
| Input line box | y 24→48 (8 + 16 floated label line) | y 16→40 (centered: (56−24)/2) |
| Resting label (empty, unfocused) | y 16→40 (centered), body-large | y 16→40, body-large |
| Floated label | y 8→24 (line-height 16), body-small size | centered on the top outline: y −8→8 |
| Floated label as transform from rest | `translateY(-12px) scale(.75)`, origin inline-start center | `translateY(-28px) scale(.75)`; with leading icon also `translateX(-36px)` (moves to x 16) |
| No label | input centered y 16→40 | same |
| Text start x / end x, no icons | 16 / W−16 | 16 / W−16 |
| Leading icon | icon x 12→36, text from x 52 | same; floated label returns to x 16 (derived: matches Compose/MWC) |
| Trailing icon | text ends W−52, icon W−36→W−12 | same |
| Both icons | text 52 → W−52 | same |
| Interactive trailing icon | 48×48 icon-button target centered on the 24px icon (x W−48→W, y 4→52) | same |
| Prefix ↔ input / input ↔ suffix gap | (derived) 2px | 2px |
| Notch | – | x (labelX−4) → (labelX + floated label width + 4); labelX = 16 |
| Multi-line (auto-grow) | height = 8 + 16 + 24·lines + 8; min 56 | height = 16 + 24·lines + 16; min 56 |
| Text area | fixed height = rows·24 + 32 (+16 label line in filled); empty label rests at first line (y 16) | rows·24 + 32 |
| Supporting row | margin-top 4, padding-inline 16, line 16 → total field block 56 + 20 | same |
| Focus thickness change | grows upward inside container (no layout shift) | grows inward (no layout shift) |
| Width | flexible; (derived) min 200px (`min-inline-size`), set max per layout; full-width only on compact | same |

**Density** (guidelines: −4px height per step, text size unchanged, opt-in only): −1 → 52px, −2 → 48px, −3 → 44px. Filled: top/bottom padding 8→6/4/2; outlined input centered (padding 14/12/10). Interactive icon targets keep 48px (may overflow container).

### 4.3 Typography

| Part | Role |
| --- | --- |
| Input text, prefix, suffix, placeholder | body-large (16/24, 400, 0.5) |
| Label resting | body-large |
| Label floated | font/weight/tracking body-large; size `--md-sys-typescale-body-small-size` (12), line-height `--md-sys-typescale-body-small-line-height` (16) |
| Supporting / error text, counter | body-small (12/16, 400, 0.4) |

Label: single line, never truncated (source) → field must be wide enough; (derived) `white-space: nowrap` with no ellipsis.

### 4.4 Elevation
None (level 0 in all states).

### 4.5 Component token list

**`md.comp.filled-text-field`**
```
container.color                     → md.sys.color.surface-container-highest
container.shape                     → md.sys.shape.corner.extra-small.top (4px TL/TR)
disabled.container.color            → md.sys.color.on-surface
disabled.container.opacity          → 0.04
hover.state-layer.color             → md.sys.color.on-surface
hover.state-layer.opacity           → md.sys.state.hover.state-layer-opacity (0.08)
error.hover.state-layer.color       → md.sys.color.on-surface
error.hover.state-layer.opacity     → md.sys.state.hover.state-layer-opacity (0.08)
active-indicator.height             → 1px
active-indicator.color              → md.sys.color.on-surface-variant
hover.active-indicator.height       → 1px
hover.active-indicator.color        → md.sys.color.on-surface
focus.active-indicator.height       → 2px
focus.active-indicator.thickness    → md.sys.state.focus-indicator.thickness (3px)
focus.active-indicator.color        → md.sys.color.primary
disabled.active-indicator.height    → 1px
disabled.active-indicator.color     → md.sys.color.on-surface
disabled.active-indicator.opacity   → 0.38
error.active-indicator.color        → md.sys.color.error
error.hover.active-indicator.color  → md.sys.color.on-error-container
error.focus.active-indicator.color  → md.sys.color.error
caret.color                         → md.sys.color.primary
error.focus.caret.color             → md.sys.color.error
input-text.color                    → md.sys.color.on-surface
input-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-large.* (type = composite)
input-text.prefix.color             → md.sys.color.on-surface-variant
input-text.suffix.color             → md.sys.color.on-surface-variant
input-text.placeholder.color        → md.sys.color.on-surface-variant
{hover,focus,error,error.hover,error.focus}.input-text.color → md.sys.color.on-surface
disabled.input-text.color           → md.sys.color.on-surface
disabled.input-text.opacity         → 0.38
label-text.color                    → md.sys.color.on-surface-variant
label-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-large.* (type = composite)
label-text.populated.line-height    → md.sys.typescale.body-small.line-height (16)
label-text.populated.size           → md.sys.typescale.body-small.size (12)
hover.label-text.color              → md.sys.color.on-surface-variant
focus.label-text.color              → md.sys.color.primary
disabled.label-text.color           → md.sys.color.on-surface
disabled.label-text.opacity         → 0.38
error.label-text.color              → md.sys.color.error
error.hover.label-text.color        → md.sys.color.on-error-container
error.focus.label-text.color        → md.sys.color.error
leading-icon.size                   → 24px
{,hover,focus,error,error.hover,error.focus}.leading-icon.color → md.sys.color.on-surface-variant
disabled.leading-icon.color         → md.sys.color.on-surface
disabled.leading-icon.opacity       → 0.38
trailing-icon.size                  → 24px
{,hover,focus}.trailing-icon.color  → md.sys.color.on-surface-variant
disabled.trailing-icon.color        → md.sys.color.on-surface
disabled.trailing-icon.opacity      → 0.38
error.trailing-icon.color           → md.sys.color.error
error.hover.trailing-icon.color     → md.sys.color.on-error-container
error.focus.trailing-icon.color     → md.sys.color.error
supporting-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-small.* (type = composite)
{,hover,focus}.supporting-text.color → md.sys.color.on-surface-variant
disabled.supporting-text.color      → md.sys.color.on-surface
disabled.supporting-text.opacity    → 0.38
{error,error.hover,error.focus}.supporting-text.color → md.sys.color.error
```

**`md.comp.outlined-text-field`** — identical to filled for caret, input-text (incl. prefix/suffix/placeholder, disabled 0.38), label-text (incl. populated size/line-height, focus/disabled/error*), leading-icon, trailing-icon and supporting-text tokens, except:
```
container.shape                     → md.sys.shape.corner.extra-small (4px)
outline.width                       → 1px
outline.color                       → md.sys.color.outline
hover.outline.width                 → 1px
hover.outline.color                 → md.sys.color.on-surface
focus.outline.width                 → 3px
focus.outline.color                 → md.sys.color.primary
disabled.outline.width              → 1px
disabled.outline.color              → md.sys.color.on-surface
disabled.outline.opacity            → 0.12
error.outline.color                 → md.sys.color.error
error.hover.outline.color           → md.sys.color.on-error-container
error.focus.outline.color           → md.sys.color.error
hover.label-text.color              → md.sys.color.on-surface   (filled: on-surface-variant)
(no container.color, no state-layer, no active-indicator tokens)
```

## 5. States & interaction
States (each empty & populated): enabled, hovered, focused, disabled; error × enabled/hovered/focused. No pressed/dragged visuals.

- **Hover** (pointer over container, not disabled): filled → SL on-surface 0.08 over container + indicator on-surface; outlined → outline on-surface, label on-surface.
- **Focus**: indicator/outline 3px primary, label primary, caret primary. This **is** the focus indicator — no separate focus ring primitive on the field. Shown whenever the input has focus (`:focus`, not only `:focus-visible` — text inputs always show focus); focus on a trailing icon button shows that button's own focus ring primitive instead.
- **Label float**: floated when focused **or** populated **or** autofilled **or** a placeholder/prefix/suffix must be visible while focused. Otherwise rests centered. Floating moves label (§4.2 transforms) and opens the outline notch.
- **Prefix/suffix**: rendered only while label is floated (derived; would collide with resting label). Same for placeholder (only when focused & empty).
- **Error**: indicator/outline, label, trailing icon, supporting text → `error`; hover variants → `on-error-container` (supporting text stays error); caret error when focused. Input text and leading icon unchanged. Show trailing error icon (auto, replaces trailing icon unless consumer keeps it — derived).
- **Disabled**: disabled primitive values from tokens (content @0.38, filled container @0.04, outline @0.12); no hover; not focusable.
- **Read-only**: enabled visuals; focusable; caret visible; label "read-only" (e.g. supporting text "Read-only").
- **Clear icon**: shown only when value non-empty.

- **State × part matrix**: §4.1 table (7 state columns). Precedence: disabled > error-focus > error-hover > error > focus > hover > enabled; focus sets width 3px in both normal and error.

## 6. Motion & behavior
Source shows the label animating middle → top but gives no timing. Decisions (no overshoot, functional motion):
- Label float: `transform` + `color` with `--md-sys-motion-spring-fast-effects` (150ms, no overshoot); outline notch width and font-size are not animated (notch opens via the hidden-label technique, §10).
- Indicator/outline width & color: `--md-sys-motion-spring-fast-effects`.
- Filled hover state layer opacity: `--md-sys-motion-spring-fast-effects`.
- Supporting ↔ error text swap: instant (no layout shift).
- Multi-line growth: instant height change (avoid animating layout per keystroke).
- Reduced motion: label jumps instantly (transition-duration 0).
- Adaptive: compact → may be full width; medium/expanded → bounded by flexible margins/containers, never full width on large screens.

## 7. Usage guidelines
- Choose variant by visual style, UI goals, distinctness from buttons/surroundings. Don't mix filled and outlined in the same form/region.
- **Every field has a label**, unless an adjacent label (aligned to the container's leading edge) describes it. Labels: aligned with input text, always visible, never truncated, never multi-line.
- **Required**: asterisk after the label; explain it in supporting text or one note at the top of the form; mark all required fields; asterisk uses the required-text color if colored.
- Supporting text: ideally one line (may wrap); persistent or focus-only.
- Counter whenever a character/word limit exists (`used/limit`).
- **Error text replaces supporting text**. One possible error → how to avoid it; several → the most likely. Long errors may wrap; leave room between fields.
- Error icon strongly recommended.
- Icons optional: input method, affordances (clear, visibility, dropdown, calendar), validity. Images 24px high.
- On web prefer text areas over auto-growing multi-line.

## 8. Accessibility
| Element | Web mapping |
| --- | --- |
| Input | native `<input>` / `<textarea>` (role textbox), labelled by visible `<label for>` |
| Label | accessible name = label text **including the asterisk** when required; plus native `required` |
| Supporting text | own text, in `aria-describedby` |
| Error text | `aria-invalid="true"`; error text in `aria-describedby` **after** supporting text (source: supporting first, then error); container `role="alert"` when it appears |
| Counter | in `aria-describedby`, visually-hidden prefix "Character count, " → "Character count, 5/20"; not a live region (avoid per-keystroke chatter) |
| Prefix / suffix | each has a unique id and accessible text (e.g. visually hidden "Euro", "at gmail dot com"); referenced via `aria-describedby` |
| Interactive trailing icon | `<button type="button">` with function label ("Show password"/"Hide password" toggled, or `aria-pressed`) |
| Error icon (non-interactive) | label "Error" (`role="img" aria-label="Error"`) |
| Read-only / disabled | native `readonly` / `disabled` |

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Focus lands on (non-disabled) field; interactive icons are separate tab stops |
| Text keys | native editing |
| Enter | submits form (input) / newline (textarea) |

## 9. Implementation checklist
**API**: `variant` (`filled|outlined`), `label`, `placeholder`, `value`, `type`, `name`, `supporting-text`, `error` (bool), `error-text`, `maxlength` + `counter`, `prefix-text`, `suffix-text`, slots `leading-icon`/`trailing-icon`, `multiline` + `rows` (text area) / `autogrow`, `required`, `disabled`, `readonly`, all native constraint attrs, `autocomplete`, `inputmode`, `density` (0…−3).
Events: native `input`, `change`, `focus`, `blur`, `invalid`, `select`. Methods: `focus()`, `select()`, `setSelectionRange()`, `checkValidity()`, `reportValidity()`, `setCustomValidity()`.

**Native form participation**: real `<input>/<textarea>` in light DOM, or form-associated custom element (`ElementInternals.setFormValue`, `setValidity` anchored to inner input, `formResetCallback`, `formStateRestoreCallback`, `delegatesFocus`).
**Validation display**: show error after `invalid` event / first blur after edit / `reportValidity()`; not on initial render; error text = `error-text` or `validationMessage`.

**Edge cases**: autofill (`:autofill` → floated); value set programmatically → update populated flag; long label → never truncate (field min width); RTL (logical properties; icons/prefix/suffix/counter swap); number spinners; password reveal button; counter over limit → error state (derived).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<div class="md-text-field" data-variant="outlined" data-has-leading data-populated>
  <div class="md-text-field__field" part="field">
    <!-- outlined: 3-piece outline with notch; filled: .md-text-field__indicator instead -->
    <span class="md-text-field__outline" part="outline" aria-hidden="true">
      <span class="o-start"></span>
      <span class="o-notch"><span class="o-notch-label">Email*</span></span>
      <span class="o-end"></span>
    </span>
    <span class="md-text-field__leading" part="leading-icon" aria-hidden="true">…</span>
    <label class="md-text-field__label" part="label" for="tf1">Email*</label>
    <span class="md-text-field__input-row">
      <span class="md-text-field__prefix" id="tf1-pre" part="prefix">$<span class="vh"> US dollars</span></span>
      <input id="tf1" class="md-text-field__input" part="input" required
             aria-describedby="tf1-pre tf1-sup tf1-err tf1-count">
      <span class="md-text-field__suffix" id="tf1-suf" part="suffix">@gmail.com</span>
    </span>
    <button class="md-text-field__trailing" part="trailing-icon" type="button" aria-label="Clear">…</button>
  </div>
  <div class="md-text-field__footer" part="footer">
    <span id="tf1-sup" class="md-text-field__supporting">Use your company email</span>
    <span id="tf1-err" class="md-text-field__error" role="alert" hidden></span>
    <span id="tf1-count" class="md-text-field__counter"><span class="vh">Character count, </span>5/20</span>
  </div>
</div>
<!-- filled: <span class="md-text-field__indicator" aria-hidden="true"></span> + ::before state layer -->
<!-- text area: <textarea class="md-text-field__input" rows="4"> -->
```

**(b) Custom properties + base layout**
```css
.md-text-field {
  --_container-color: var(--md-comp-filled-text-field-container-color, var(--md-sys-color-surface-container-highest));
  --_shape: var(--md-comp-filled-text-field-container-shape, var(--md-sys-shape-corner-extra-small-top));
  --_indicator-color: var(--md-comp-filled-text-field-active-indicator-color, var(--md-sys-color-on-surface-variant));
  --_indicator-width: var(--md-comp-filled-text-field-active-indicator-height, 1px);
  --_label-color: var(--md-comp-filled-text-field-label-text-color, var(--md-sys-color-on-surface-variant));
  --_input-color: var(--md-comp-filled-text-field-input-text-color, var(--md-sys-color-on-surface));
  --_affix-color: var(--md-comp-filled-text-field-input-text-prefix-color, var(--md-sys-color-on-surface-variant));
  --_caret-color: var(--md-comp-filled-text-field-caret-color, var(--md-sys-color-primary));
  --_leading-color: var(--md-comp-filled-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant));
  --_trailing-color: var(--md-comp-filled-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant));
  --_support-color: var(--md-comp-filled-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant));
  --_sl-color: var(--md-comp-filled-text-field-hover-state-layer-color, var(--md-sys-color-on-surface));
  --_sl-opacity: 0;
  --_icon-size: var(--md-comp-filled-text-field-leading-icon-size, 24px);
  --_height: calc(56px - var(--_density, 0) * -4px);       /* density 0…-3 */
  --_pad-block: calc(8px + var(--_density, 0) * 2px);       /* filled */
  --_pad-start: 16px; --_pad-end: 16px;
  --_float-y: -12px;                                         /* filled */
  display: inline-flex; flex-direction: column; min-inline-size: 200px; /* derived */
  font: var(--md-sys-typescale-body-large-weight) var(--md-sys-typescale-body-large-size)/var(--md-sys-typescale-body-large-line-height) var(--md-sys-typescale-body-large-font);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
}
.md-text-field[data-variant="outlined"] {
  --_container-color: transparent;
  --_shape: var(--md-comp-outlined-text-field-container-shape, var(--md-sys-shape-corner-extra-small));
  --_outline-color: var(--md-comp-outlined-text-field-outline-color, var(--md-sys-color-outline));
  --_outline-width: var(--md-comp-outlined-text-field-outline-width, 1px);
  --_float-y: -28px;
}
.md-text-field[data-has-leading]  { --_pad-start: 12px; }
.md-text-field[data-has-trailing] { --_pad-end: 12px; }

.md-text-field__field {
  position: relative; display: flex; align-items: center; gap: 16px;
  min-block-size: var(--_height); padding-inline: var(--_pad-start) var(--_pad-end); box-sizing: border-box;
  background: var(--_container-color); border-radius: var(--_shape); cursor: text;
}
.md-text-field__leading, .md-text-field__trailing { flex: none; inline-size: var(--_icon-size); block-size: var(--_icon-size); }
.md-text-field__leading  { color: var(--_leading-color); }
.md-text-field__trailing { color: var(--_trailing-color); }
button.md-text-field__trailing { position: relative; border: 0; background: none; padding: 0; border-radius: 50%; } /* + touch target primitive (48px), state layer primitive, focus ring primitive */
.md-text-field__input-row { flex: 1; display: flex; align-items: baseline; gap: 2px; min-inline-size: 0;
  padding-block: calc(var(--_pad-block) + 16px) var(--_pad-block); }       /* filled: label line reserved */
.md-text-field:not(:has(.md-text-field__label)) .md-text-field__input-row,
.md-text-field[data-variant="outlined"] .md-text-field__input-row { padding-block: calc((var(--_height) - 24px) / 2); }
.md-text-field__input { flex: 1; min-inline-size: 0; border: 0; outline: 0; padding: 0; margin: 0; background: none;
  font: inherit; letter-spacing: inherit; color: var(--_input-color); caret-color: var(--_caret-color); }
.md-text-field__input::placeholder { color: var(--_affix-color); opacity: 1; }
textarea.md-text-field__input { resize: none; }                 /* text area: fixed rows */
.md-text-field[data-autogrow] textarea { field-sizing: content; } /* multi-line; JS fallback sets height=scrollHeight */
.md-text-field__prefix, .md-text-field__suffix { color: var(--_affix-color); white-space: nowrap; }
.md-text-field:not([data-floated]) :is(.md-text-field__prefix, .md-text-field__suffix) { visibility: hidden; }
.md-text-field:not([data-floated]) .md-text-field__input::placeholder { color: transparent; }

/* label */
.md-text-field__label {
  position: absolute; inset-inline-start: calc(var(--_pad-start) + (var(--_icon-size) + 16px) * var(--_lead, 0));
  inset-block-start: calc((var(--_height) - 24px) / 2);
  color: var(--_label-color); white-space: nowrap; pointer-events: none; transform-origin: 0 50%;
}
.md-text-field[data-has-leading] { --_lead: 1; }
:dir(rtl) .md-text-field__label { transform-origin: 100% 50%; }
.md-text-field[data-floated] .md-text-field__label { transform: translateY(var(--_float-y)) scale(.75); } /* 16→12px, line 24→16 effective */
.md-text-field[data-variant="outlined"][data-has-leading][data-floated] .md-text-field__label {
  transform: translateX(-36px) translateY(var(--_float-y)) scale(.75); }      /* RTL: translateX(36px) */

/* filled indicator + state layer */
.md-text-field[data-variant="filled"] .md-text-field__field::before { content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: var(--_sl-color); opacity: var(--_sl-opacity); pointer-events: none; }   /* state layer primitive */
.md-text-field__indicator { position: absolute; inset-inline: 0; inset-block-end: 0; block-size: var(--_indicator-width);
  background: var(--_indicator-color); }

/* outlined 3-piece outline with notch */
.md-text-field__outline { position: absolute; inset: 0; display: flex; pointer-events: none; border-radius: inherit; }
.md-text-field__outline > span { border: var(--_outline-width) solid var(--_outline-color); }
.o-start { inline-size: 12px; border-inline-end: 0 !important; border-start-start-radius: inherit; border-end-start-radius: inherit; }  /* labelX(16) − 4 */
.o-notch { border-inline: 0 !important; padding-inline: 4px; max-inline-size: calc(100% - 24px); }
.o-notch-label { visibility: hidden; display: inline-block; font-size: var(--md-sys-typescale-body-small-size);
  line-height: 0; white-space: nowrap; max-inline-size: 0; }          /* width 0 when resting */
.md-text-field[data-floated] .o-notch { border-block-start-color: transparent; }
.md-text-field[data-floated] .o-notch-label { max-inline-size: none; }    /* opens notch to floated label width */
.md-text-field:not(:has(.md-text-field__label)) .o-notch { display: none; }
.o-end { flex: 1; border-inline-start: 0 !important; border-start-end-radius: inherit; border-end-end-radius: inherit; }

/* footer */
.md-text-field__footer { display: flex; gap: 16px; padding: 4px 16px 0;
  font: var(--md-sys-typescale-body-small-weight) var(--md-sys-typescale-body-small-size)/var(--md-sys-typescale-body-small-line-height) var(--md-sys-typescale-body-small-font);
  letter-spacing: var(--md-sys-typescale-body-small-tracking); color: var(--_support-color); }
.md-text-field__supporting, .md-text-field__error { flex: 1; }
.md-text-field__counter { margin-inline-start: auto; white-space: nowrap; }
.md-text-field[data-error] .md-text-field__supporting { display: none; }       /* error replaces supporting */
.md-text-field[data-error] .md-text-field__error { display: block; }
```
`data-floated` = focused || populated || autofilled (set by JS; CSS-only fallback: `:has(.md-text-field__input:focus, .md-text-field__input:not(:placeholder-shown), .md-text-field__input:autofill)` with `placeholder=" "`).

**(c) State selectors** — all state vars are set on the root so specificity/order is predictable (hover 4 < later focus 4 < later error-hover/error-focus 5; disabled excluded from interactive rules)
```css
.md-text-field                     { --_hover-label-color: var(--md-comp-filled-text-field-hover-label-text-color, var(--md-sys-color-on-surface-variant)); }
.md-text-field[data-variant="outlined"] { --_hover-label-color: var(--md-comp-outlined-text-field-hover-label-text-color, var(--md-sys-color-on-surface)); }

.md-text-field:not([data-disabled]):has(> .md-text-field__field:hover) {          /* hover */
  --_sl-opacity: var(--md-comp-filled-text-field-hover-state-layer-opacity, var(--md-sys-state-hover-state-layer-opacity)); /* filled only */
  --_indicator-color: var(--md-comp-filled-text-field-hover-active-indicator-color, var(--md-sys-color-on-surface));
  --_outline-color: var(--md-comp-outlined-text-field-hover-outline-color, var(--md-sys-color-on-surface));
  --_label-color: var(--_hover-label-color);
}
.md-text-field:not([data-disabled]):has(.md-text-field__input:focus) {           /* focus (input only, not icon buttons) */
  --_indicator-color: var(--md-comp-filled-text-field-focus-active-indicator-color, var(--md-sys-color-primary));
  --_indicator-width: var(--md-comp-filled-text-field-focus-active-indicator-thickness, var(--md-sys-state-focus-indicator-thickness));
  --_outline-color: var(--md-comp-outlined-text-field-focus-outline-color, var(--md-sys-color-primary));
  --_outline-width: var(--md-comp-outlined-text-field-focus-outline-width, 3px);
  --_label-color: var(--md-sys-color-primary);
}
.md-text-field[data-error] {                                                      /* + aria-invalid="true" on input */
  --_indicator-color: var(--md-sys-color-error); --_outline-color: var(--md-sys-color-error);
  --_label-color: var(--md-sys-color-error); --_trailing-color: var(--md-sys-color-error);
  --_support-color: var(--md-sys-color-error); --_caret-color: var(--md-sys-color-error);
}
.md-text-field[data-error]:not([data-disabled]):has(> .md-text-field__field:hover) {
  --_indicator-color: var(--md-sys-color-on-error-container); --_outline-color: var(--md-sys-color-on-error-container);
  --_label-color: var(--md-sys-color-on-error-container); --_trailing-color: var(--md-sys-color-on-error-container);
}
.md-text-field[data-error]:not([data-disabled]):has(.md-text-field__input:focus) {
  --_indicator-color: var(--md-sys-color-error); --_outline-color: var(--md-sys-color-error);
  --_label-color: var(--md-sys-color-error); --_trailing-color: var(--md-sys-color-error);
}
.md-text-field[data-disabled] {                                                    /* disabled primitive; input[disabled]; wins over error (later, same specificity) */
  --_container-color: color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent);
  --_indicator-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --_outline-color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
  --_label-color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
  --_input-color: var(--_label-color); --_affix-color: var(--_label-color); --_leading-color: var(--_label-color);
  --_trailing-color: var(--_label-color); --_support-color: var(--_label-color);
  cursor: default;
}
.md-text-field[data-variant="outlined"][data-disabled] { --_container-color: transparent; }
```
`--_indicator-*`/`--_sl-*` are only consumed by filled parts, `--_outline-*` only by the outlined outline, so one rule set serves both variants. Read-only: no visual change (`input[readonly]`).

**(d) Motion**
```css
.md-text-field__label { transition: transform var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing); }
.md-text-field__indicator, .md-text-field__outline > span, .md-text-field__field::before {
  transition: block-size, border-width, border-color, background-color, opacity;
  transition-duration: var(--md-sys-motion-spring-fast-effects-duration);
  transition-timing-function: var(--md-sys-motion-spring-fast-effects-easing); }
@media (prefers-reduced-motion: reduce) { .md-text-field * , .md-text-field *::before { transition-duration: 0s !important; } }
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-text-field__indicator { background: CanvasText; }
  .md-text-field__outline > span { border-color: CanvasText; }
  .md-text-field:has(.md-text-field__input:focus) .md-text-field__indicator { background: Highlight; }
  .md-text-field:has(.md-text-field__input:focus) .md-text-field__outline > span:not(.o-notch) { border-color: Highlight; }
  .md-text-field[data-floated] .o-notch { border-block-start-color: transparent; }
  .md-text-field[data-variant="filled"] .md-text-field__field { border: 1px solid CanvasText; border-block-end: 0; }
  .md-text-field[data-disabled] * { color: GrayText; border-color: GrayText; }
}
```

**(f) JS responsibilities**
- Maintain `data-floated` (focus/blur/input/`animationstart` for autofill/programmatic `value`), `data-populated`, `data-disabled`, `data-has-leading/trailing`.
- Validation: on `invalid`/blur-after-edit set `data-error` + `aria-invalid`, fill error text (unhide `role="alert"` node so it announces), restore supporting text when valid.
- Counter: update `n/max` on `input`; over limit → error.
- Click on container (not on buttons) → `input.focus()`.
- Clear button: visible only when populated; on click clear value, dispatch `input`, refocus input. Password toggle: switch `type`, update `aria-label`.
- Multi-line fallback without `field-sizing`: set `style.height = scrollHeight` on input.
- Form-associated custom element wiring (§9) when encapsulated.

## 11. Source gaps & decisions
- **Filled focus indicator**: `focus.active-indicator.height` = 2dp vs `focus.active-indicator.thickness` = sys focus thickness (3dp). Decision: **3px** via the `thickness` token (newer, system-linked, matches outlined 3dp); `-focus-active-indicator-height` (2px) remains overridable.
- **Outlined top/bottom padding** not given → input centered (16px each side at 56px).
- **Floated label positions** not given → filled label line at 8→24 (8px top padding + 16px line), outlined label centered on top outline; outlined + leading icon floats to x 16 (Compose/MWC behaviour), filled stays aligned with text.
- **Notch** start offset not given → label at x 16, notch = 4px padding each side (source), so outline start segment = 12px.
- **Prefix/suffix gap, min width, counter colors, disabled placeholder/prefix color** not tokenized → 2px gap, 200px min width, counter follows supporting-text colors, disabled affixes at on-surface 0.38.
- **Supporting row inline padding** not given → 16px (aligned with no-icon text start).
- **Motion** not specified → fast effects spring (no overshoot) for label/indicator/color.
- **Density** values not in component page → guidelines density rule (−4px per step: 52/48/44).
- **Anatomy order** differs between Specs and Guidelines tabs for outlined (label/icon numbering) → Specs order used.
- **Counter alignment**: one image alt says both supporting text and counter are trailing-aligned; measurements and M3 convention → supporting start, counter end.
- **Error role**: source says error message gets role "alert" → `role="alert"` node shown on error; also `aria-describedby` ordering supporting → error per source.
