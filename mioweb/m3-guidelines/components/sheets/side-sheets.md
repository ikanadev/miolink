# Side sheets

> Source: https://m3.material.io/components/side-sheets · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview
Side sheets provide optional, supplementary content and actions along the edge of the screen without interrupting the main content. People can navigate to another region within the sheet; sheets can contain a back icon for navigation.

**Use when**
- Standard: medium/expanded windows (tablet, desktop); contextual actions and info that complement primary content and stay visible while people interact with it — filters, item details, supplemental features, settings form controls.
- Modal: compact windows (mobile) — same content kinds, but must be dismissed to interact with underlying content.
- Replacement for a bottom sheet on expanded/desktop windows.

**Don't use when**
- Content is primary content.
- Content needs horizontal scrolling or layouts suggesting it.

**Changes vs. M2**
- RTL support with left side sheet.
- Color: new color mappings, dynamic-color compatible.
- Shape: modal side sheets have a 16dp corner radius.

> No Expressive-specific token changes (no shape morph / spring tokens) in the source.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| **Standard** | Coexists with primary content; body area shrinks to make room. | `surface`, level0, square corners when docked. Mostly medium/expanded. |
| **Modal** | Above a scrim; blocks underlying content until dismissed. | `surface-container-low`, level1, 16dp corners on the inner (start) side when docked. Preferred on compact. |
| Docked | Flush against the window edge, full height. | Standard `corner.none`; modal `corner.large.start`. |
| Detached | Inset from screen edges by 16dp. | `corner.large` (16dp all corners). Don't inset further. |
| With back icon | Back icon button at start of header for in-sheet navigation. | Header start padding 16dp. |
| With bottom actions | Action buttons (e.g. Save / Cancel) with optional divider above. | 72dp area, start-aligned. |
| Adaptive | Modal (compact) → standard (larger windows). | |
| RTL | Sheet on the left edge, elements mirrored. | |

## 3. Anatomy
**Standard**: 1 Divider (opt.) · 2 Headline · 3 Container (required) · 4 Close icon button.
**Modal**: 1 Back icon button (opt.) · 2 Headline · 3 Container · 4 Close icon button · 5 Divider (opt.) · 6 Action buttons (opt.) · 7 Scrim.
Content (optional): action lists, form controls, supplemental content, tabular layouts (vertical only).

## 4. Tokens & specs

### 4.1 Color

| Part | Variant / state | Token | System role |
| --- | --- | --- | --- |
| Container | standard | `--md-comp-sheet-side-docked-standard-container-color` | `--md-sys-color-surface` (#fef7ff) |
| Container | modal | `--md-comp-sheet-side-docked-modal-container-color` | `--md-sys-color-surface-container-low` (#f7f2fa) |
| Headline | both | `--md-comp-sheet-side-docked-headline-color` | `--md-sys-color-on-surface-variant` (#49454f) |
| Close / back icon | both | not tokenized (color diagram) | `--md-sys-color-on-surface-variant` |
| Divider | both | `--md-comp-sheet-side-docked-divider-color` | `--md-sys-color-outline` (#79747e) — see §11 |
| Action label | hover / focus / pressed | `--md-comp-sheet-side-docked-action-{hover\|focus\|pressed}-label-text-color` | `--md-sys-color-primary` (#6750a4) |
| Action state layer | hover | `…-action-hover-state-layer-color` / `-opacity` | `primary` @ `--md-sys-state-hover-state-layer-opacity` (0.08) |
| Action state layer | focus | `…-action-focus-state-layer-color` / `-opacity` | `primary` @ `--md-sys-state-focus-state-layer-opacity` (0.10) |
| Action state layer | pressed | `…-action-pressed-state-layer-color` / `-opacity` | `primary` @ `--md-sys-state-pressed-state-layer-opacity` (0.10) |
| Focus indicator | focused | `--md-comp-sheet-side-docked-focus-indicator-color` | `--md-sys-color-secondary` (#625b71) |
| Scrim | modal | not tokenized | `--md-sys-color-scrim` @ 32% (guidelines system scrim) |

Action tokens describe text-style actions; filled/outlined action buttons use the button component specs.

### 4.2 Size, layout & shape

| Attribute | Standard | Modal |
| --- | --- | --- |
| Container width (token) | 256dp (default; resizable) | 256dp |
| Max-width | 400dp | 400dp |
| Container height (token) | 100% | 100% |
| Start/end padding | 24dp | 24dp |
| Start padding with back icon | – | 16dp |
| Gap between top elements (back/headline/close) | 12dp | 12dp |
| Header row height | (derived) 72dp: 48dp icon-button targets + 12dp block padding | same |
| Bottom actions height | 72dp | 72dp |
| Bottom actions top / bottom padding | 16dp / 24dp | 16dp / 24dp |
| Bottom actions alignment | Start (source: "Left", LTR) | Start |
| Gap between action buttons | (derived) 8dp | 8dp |
| Margins when detached | 16dp | 16dp |
| Shape, docked | `--md-sys-shape-corner-none` | `--md-sys-shape-corner-large-start` (16dp start-side corners; in LTR right-edge sheet = top-left/bottom-left) |
| Shape, detached | `--md-sys-shape-corner-large` | `--md-sys-shape-corner-large` |
| Icon buttons | 24dp icon, 48×48dp target (icon-button spec) | same |
| Focus indicator | 3dp thickness, 2dp outer offset | same |

### 4.3 Typography

| Part | Typescale role |
| --- | --- |
| Headline | `title-large` (22/28, weight 400, tracking 0); single line, ellipsis (derived) |
| Action labels | per button spec (`label-large`) |
| Content | per contained components |

### 4.4 Elevation

| Variant | Level |
| --- | --- |
| Standard | `--md-sys-elevation-level0` |
| Modal | `--md-sys-elevation-level1` + scrim |

### 4.5 Component token list — `md.comp.sheet.side`
```
docked.container.height                     → 100%
docked.container.width                      → 256dp
docked.container.shape                      → md.sys.shape.corner.none
docked.modal.container.shape                → md.sys.shape.corner.large.start (16dp TL/BL)
detached.container.shape                    → md.sys.shape.corner.large (16dp)
docked.standard.container.color             → md.sys.color.surface (#fef7ff)
docked.standard.container.elevation         → md.sys.elevation.level0
docked.modal.container.color                → md.sys.color.surface-container-low (#f7f2fa)
docked.modal.container.elevation            → md.sys.elevation.level1
docked.headline.color                       → md.sys.color.on-surface-variant (#49454f)
docked.headline.font                        → md.sys.typescale.title-large.font
docked.headline.line-height                 → md.sys.typescale.title-large.line-height (28)
docked.headline.size                        → md.sys.typescale.title-large.size (22)
docked.headline.tracking                    → md.sys.typescale.title-large.tracking (0)
docked.headline.weight                      → md.sys.typescale.title-large.weight (400)
docked.headline.type                        → md.sys.typescale.title-large (composite)
docked.divider.color                        → md.sys.color.outline (#79747e)
docked.action.hover.label-text.color        → md.sys.color.primary
docked.action.hover.state-layer.color       → md.sys.color.primary
docked.action.hover.state-layer.opacity     → md.sys.state.hover.state-layer-opacity (0.08)
docked.action.focus.label-text.color        → md.sys.color.primary
docked.action.focus.state-layer.color       → md.sys.color.primary
docked.action.focus.state-layer.opacity     → md.sys.state.focus.state-layer-opacity (0.10)
docked.action.pressed.label-text.color      → md.sys.color.primary
docked.action.pressed.state-layer.color     → md.sys.color.primary
docked.action.pressed.state-layer.opacity   → md.sys.state.pressed.state-layer-opacity (0.10)
docked.focus.indicator.color                → md.sys.color.secondary
docked.focus.indicator.thickness            → md.sys.state.focus-indicator.thickness (3dp)
docked.focus.indicator.outline.offset       → md.sys.state.focus-indicator.outer-offset (2dp)
```

## 5. States & interaction
- Container non-interactive; states apply to icon buttons and actions.
- Text actions: `primary` label; state layer primitive (`primary` @ 0.08 / 0.10 / 0.10); ripple primitive on press.
- Icon buttons: standard icon-button states (see icon-buttons.md), icon `on-surface-variant`.
- Focus ring primitive (`secondary`, 3dp, outer offset 2dp) on all focusable parts.
- Disabled icon buttons are skipped in tab order (source).
- Modal: scrim click dismisses (derived, consistent with modal bottom sheet).
- Close icon button dismisses; back icon navigates back within the sheet or exits.

| Part × state | Rest | Hover | Focus-visible | Pressed | Disabled |
| --- | --- | --- | --- | --- | --- |
| Text action | label primary | +SL primary 0.08 | +SL 0.10 + focus ring | +SL 0.10 + ripple | label on-surface @0.38 (disabled primitive) |
| Icon button | on-surface-variant | per icon-button spec | focus ring | per spec | on-surface @0.38, not focusable |

## 6. Motion & behavior
- **Enter/exit** ("beyond bounds" pattern): slides in from its edge (inline-end; left in RTL). `transform` → `--md-sys-motion-spring-default-spatial` (partial-screen = default speed, guidelines); because common transitions must not bounce, use `--md-sys-motion-easing-emphasized-decelerate` + `--md-sys-motion-duration-medium4` for enter and `--md-sys-motion-easing-emphasized-accelerate` + `--md-sys-motion-duration-short4` for exit (derived from legacy rules) when the expressive spatial curve overshoots visibly.
- **Scrim**: opacity 0 → 0.32 with `--md-sys-motion-spring-default-effects`.
- **Standard open**: body area shrinks to the sheet's width while keeping a margin on the body's trailing edge; animate the body's inline-size/grid column in sync with the sheet.
- **Scrolling**: vertical scroll independent of the page (positions persist). **No horizontal scrolling.**
- **Predictive back** (Android): sheet detaches from top and bottom edges, previous screen previews, sheet scales in the gesture direction; release/fling commits, cancel restores. Web: optional.
- **Adaptive**: modal on compact → standard on larger windows (preserve content/scroll state); replaces bottom sheets on expanded windows.
- **Reduced motion**: replace slide with short fade (`spring-fast-effects`); body resize instant.

## 7. Usage guidelines
- Place along the screen edge, usually **right** (avoids nav on the left). May be inset by **16dp**; don't inset beyond that.
- Fixed width, typically full height; dimensions depend on layout subdivision.
- Always provide affordances to leave the sheet (close; back when navigating within).
- Actions: Save, Edit, Download; emphasize with elevation, fill and tone; start-aligned.
- Dividers separate actions from content and user- from system-generated content.

## 8. Accessibility
**Roles & ARIA**
- Role: **dialog** (source). Modal: native `<dialog>` + `showModal()` (modal, inert background, Escape). Standard: non-modal `<dialog open>` / `show()` (role dialog, no trap) — `<aside>` acceptable for permanent panels (web mapping).
- `aria-labelledby` → headline. Close `aria-label="Close"`, back `aria-label="Back"`.

**Keyboard**

| Key | Action |
| --- | --- |
| Tab | Focus lands on (non-disabled) icon button / next action |
| Space / Enter | Activates the focused (non-disabled) icon button |
| Escape | (web mapping) closes modal; optional for standard |

**Focus**
- Order: headline (focusable via `tabindex="-1"` as initial focus target) → close → cancel → save (source diagram; see §11).
- Modal: initial focus on headline; restore to invoker on close.

**Requirements**
- A close affordance must **always** be present (source); dismissible via assistive tech. Touch targets ≥ 48×48dp.

## 9. Implementation checklist
**Suggested API**
- `open`, `variant`: `standard` | `modal`, `detached` (bool), `side`: `end` (default, logical) | `start`, `width` (default 256px, max 400px), `headline`, `show-back`.
- Slots: `headline`, `navigation` (back), `close` (default close provided), default content, `actions`.
- Events: `open`, `close` (cancelable, `reason`: `close-button|scrim|escape|back-gesture|action`), `back`.
- Methods: `show()`, `close()`.

**Edge cases**
- Breakpoint changes: switch modal ↔ standard preserving content/scroll.
- Clamp width: `min(var(--width), 400px, 100vw - margins)`.
- Detached inset fixed at 16px.
- Always render a close affordance (warn if consumer removes it).
- Long headline: 1-line ellipsis; full text via `title`/accessible name.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<dialog class="md-side-sheet" data-variant="modal" aria-labelledby="ss-h">
  <div class="md-side-sheet__container" part="container">
    <header class="md-side-sheet__header" part="header">
      <button class="md-icon-button" part="back" aria-label="Back" hidden>…</button>
      <h2 id="ss-h" class="md-side-sheet__headline" part="headline" tabindex="-1">Filters</h2>
      <button class="md-icon-button" part="close" aria-label="Close">…</button>
    </header>
    <div class="md-side-sheet__content" part="content"><!-- slot --></div>
    <hr class="md-side-sheet__divider" part="divider">
    <footer class="md-side-sheet__actions" part="actions"><!-- buttons --></footer>
  </div>
</dialog>
<!-- Standard: same markup, data-variant="standard", opened with show() inside a layout grid -->
```

**(b) Custom properties & layout**
```css
.md-side-sheet {
  --md-comp-sheet-side-docked-container-width: 256px;
  --md-comp-sheet-side-docked-container-height: 100%;
  --md-comp-sheet-side-docked-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-sheet-side-docked-modal-container-shape: var(--md-sys-shape-corner-large-start);
  --md-comp-sheet-side-detached-container-shape: var(--md-sys-shape-corner-large);
  --md-comp-sheet-side-docked-standard-container-color: var(--md-sys-color-surface);
  --md-comp-sheet-side-docked-standard-container-elevation: var(--md-sys-elevation-level0);
  --md-comp-sheet-side-docked-modal-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-sheet-side-docked-modal-container-elevation: var(--md-sys-elevation-level1);
  --md-comp-sheet-side-docked-headline-color: var(--md-sys-color-on-surface-variant);
  --md-comp-sheet-side-docked-divider-color: var(--md-sys-color-outline);
  --md-comp-sheet-side-docked-action-hover-state-layer-color: var(--md-sys-color-primary);
  --md-comp-sheet-side-docked-action-hover-state-layer-opacity: var(--md-sys-state-hover-state-layer-opacity);
  --md-comp-sheet-side-docked-action-focus-state-layer-opacity: var(--md-sys-state-focus-state-layer-opacity);
  --md-comp-sheet-side-docked-action-pressed-state-layer-opacity: var(--md-sys-state-pressed-state-layer-opacity);
  --md-comp-sheet-side-docked-focus-indicator-color: var(--md-sys-color-secondary);
  --md-comp-sheet-side-docked-focus-indicator-thickness: var(--md-sys-state-focus-indicator-thickness);
  --md-comp-sheet-side-docked-focus-indicator-outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
  --_margin: 0px;
  position: fixed; inset-block: 0; inset-inline: auto 0; margin: var(--_margin); padding: 0; border: 0;
  inline-size: min(var(--md-comp-sheet-side-docked-container-width), 400px, 100vw - 2 * var(--_margin));
  block-size: calc(var(--md-comp-sheet-side-docked-container-height) - 2 * var(--_margin));
  max-block-size: none; background: transparent; overflow: visible;
}
.md-side-sheet[data-detached] { --_margin: 16px; }
.md-side-sheet__container {
  display: flex; flex-direction: column; block-size: 100%;
  background: var(--md-comp-sheet-side-docked-modal-container-color);
  box-shadow: var(--md-comp-sheet-side-docked-modal-container-elevation);
  border-radius: var(--md-comp-sheet-side-docked-modal-container-shape);
}
.md-side-sheet[data-variant="standard"] .md-side-sheet__container {
  background: var(--md-comp-sheet-side-docked-standard-container-color);
  box-shadow: var(--md-comp-sheet-side-docked-standard-container-elevation);
  border-radius: var(--md-comp-sheet-side-docked-container-shape);
}
.md-side-sheet[data-detached] .md-side-sheet__container { border-radius: var(--md-comp-sheet-side-detached-container-shape); }
/* modal docked radius is on the start (inner) side; corner.large.start resolves to TL/BL physically → mirror in RTL: */
.md-side-sheet[data-variant="modal"]:not([data-detached]) .md-side-sheet__container:dir(rtl) { border-radius: 0 16px 16px 0; }
.md-side-sheet__header { display: flex; align-items: center; gap: 12px; min-block-size: 72px; padding-inline: 24px; padding-block: 12px; box-sizing: border-box; }
.md-side-sheet__header:has([part="back"]:not([hidden])) { padding-inline-start: 16px; }
.md-side-sheet__headline { flex: 1; margin: 0; color: var(--md-comp-sheet-side-docked-headline-color);
  font: var(--md-sys-typescale-title-large-weight) var(--md-sys-typescale-title-large-size)/var(--md-sys-typescale-title-large-line-height) var(--md-sys-typescale-title-large-font);
  letter-spacing: var(--md-sys-typescale-title-large-tracking); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.md-side-sheet__content { flex: 1; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding-inline: 24px; }
.md-side-sheet__divider { margin: 0; border: 0; border-block-start: 1px solid var(--md-comp-sheet-side-docked-divider-color); }
.md-side-sheet__actions { display: flex; justify-content: flex-start; align-items: center; gap: 8px; min-block-size: 72px; padding: 16px 24px 24px; box-sizing: border-box; }
.md-side-sheet::backdrop { background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent); }
/* Standard: reserve layout space instead of overlaying */
.layout:has(> .md-side-sheet[data-variant="standard"][open]) { grid-template-columns: 1fr min(var(--md-comp-sheet-side-docked-container-width), 400px); }
.layout > .md-side-sheet[data-variant="standard"] { position: sticky; inset-block-start: 0; block-size: 100dvh; }
```
(Use `.md-side-sheet[data-side="start"]` → `inset-inline: 0 auto` and mirrored radius.)

**(c) States**
| Selector | Change |
| --- | --- |
| text action `:hover / :focus-visible / :active` | label `primary`; state layer primitive with the action state-layer tokens |
| `:focus-visible` (any part) | focus ring primitive with `--md-comp-sheet-side-docked-focus-indicator-*` |
| `:disabled` action/icon | disabled primitive; removed from tab order (native `disabled`) |
| `[data-detached]` | 16px margins, `corner.large` |
| `[data-variant=standard]` | no scrim, level0, square corners, in layout flow |

**(d) Motion**
```css
.md-side-sheet[open] .md-side-sheet__container {
  transition: transform var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate);
  @starting-style { transform: translateX(100%); }
}
.md-side-sheet[open]:dir(rtl) .md-side-sheet__container { @starting-style { transform: translateX(-100%); } }
.md-side-sheet[data-closing] .md-side-sheet__container { transform: translateX(100%);
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-accelerate); }
.md-side-sheet::backdrop { transition: opacity var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing); }
.layout { transition: grid-template-columns var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized); }
@media (prefers-reduced-motion: reduce) {
  .md-side-sheet .md-side-sheet__container, .layout { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; transform: none; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-side-sheet__container { border-inline-start: 1px solid CanvasText; }
  .md-side-sheet__divider { border-color: CanvasText; }
  .md-side-sheet :focus-visible { outline-color: Highlight; }
}
```

**(f) JS responsibilities**
- `show()`: modal → `dialog.showModal()`, focus headline; standard → `dialog.show()` + set layout open state.
- `close(reason)`: dispatch cancelable `close`; set `data-closing`, on `transitionend` call `dialog.close()`; restore focus.
- Scrim: `click` with `event.target === dialog` → close(`scrim`). `cancel` (Escape) → close(`escape`).
- Watch window size (`matchMedia('(min-width: 600px)')`) to switch modal ↔ standard (adaptive), keeping DOM/scroll.
- Ensure a close button exists.

## 11. Source gaps & decisions
- **Divider color**: token = `outline`; standard color diagram labels it "Outline variant". Decision: token value `outline` (tokens are canonical); themers can remap `--md-comp-sheet-side-docked-divider-color` to `outline-variant`.
- **Close icon "optional" (anatomy) vs "always present" (accessibility)**: treated as required.
- **Focus order**: diagram alt says headline → close → save → cancel, caption says headline → close → cancel → save. Decision: follow the numbered caption (Cancel before Save) and simply let focus follow DOM order of the actions.
- **Bottom actions**: 72dp height vs 16 + 24 padding + 40dp button = 80dp. Decision: `min-block-size: 72px` with 16/24 padding (renders 80px with 40px buttons); padding wins.
- **Header height, action gap, headline truncation** not specified → 72px header, 8px gap, 1-line ellipsis (derived).
- **Scrim opacity / motion** not specified → 32% scrim; emphasized decelerate/accelerate legacy easing for enter/exit (no bounce for common transitions); default effects spring for scrim.
- **`corner.large.start`** is defined physically (topLeft/bottomLeft) → mirrored manually in RTL.
- **Modal vs standard breakpoint** not given → modal below 600px (compact), standard ≥ 600px (window size classes).
