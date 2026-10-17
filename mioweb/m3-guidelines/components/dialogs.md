# Dialogs

> Source: https://m3.material.io/components/dialogs · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview
A dialog is a **modal** window in front of app content that provides critical information or asks for a decision. It disables all app functionality while open and stays on screen until confirmed, dismissed, or a required action is taken. Dedicated to a **single task**.

**Use when:** a prompt must block normal operation (high-risk confirmation, e.g. deleting progress); critical information requires a task, decision or acknowledgement.
**Don't use when:** information is low/medium priority (→ snackbar); options can be offered without interruption (→ dropdown menu); information is non-critical (→ inline UI such as a tooltip).

| Component | Importance | Action needed |
| --- | --- | --- |
| Snackbar | Low | Optional – may have no button, can auto-disappear |
| Dialog | High | Required – blocks main content until an action is confirmed |

**Changes vs. M2:** new color mappings + dynamic color; greater padding (larger radius and title); optional custom positioning of basic dialogs; corner radius 28dp; larger, darker headline (headline-small).

> The source lists no Expressive-specific changes (no shape-morph or spring tokens) for dialogs.

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| **Basic dialog** | Floating modal over a scrim: alerts, quick selection, confirmation; can host lists, date pickers, time pickers | 280–560px wide, 28px corners, level3, `surface-container-high`. Centered by default; custom position on medium/expanded windows (≥ 56px from edges). |
| Basic – with icon | Optional 24px hero icon above the headline | With icon: icon + headline **center-aligned**. Without: **start-aligned**. |
| Basic – with dividers | 1px dividers between scrolling content and headline/actions | Shown when content scrolls |
| Basic – side-by-side / stacked actions | Max 2 text buttons, end-aligned; stacked for long labels | Stacked: confirming above dismissive |
| **Full-screen dialog** | Fills the screen; multi-step tasks, forms, unsaved changes, nested dialogs | **Compact windows only.** 0 radius, level0, `surface`. 56px header: close (X), headline, confirming text button. |
| Full-screen – bottom action bar | Optional 56px bar at the bottom | Width = container width |
| Adaptive | Full-screen (compact) ↔ basic (medium+) | Swap when the breakpoint changes, keeping state |

## 3. Anatomy

**Basic:** 1. Container · 2. Icon (optional, 24px, `secondary`) · 3. Headline (optional) · 4. Supporting text · 5. Divider (optional, 1px) · 6. Buttons (label text) · 7. Scrim.

**Full-screen:** 1. Container · 2. Header region (56px) · 3. Icon (close affordance, 24px) — the only navigation in the header · 4. Headline (optional, title-large, start-aligned) · 5. Text button (confirming action) · 6. Divider (optional, 1px).

## 4. Tokens & specs

### 4.1 Color

**Basic (`md.comp.dialog`)**

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | dialog.container.color | `--md-sys-color-surface-container-high` (#ece6f0) |
| Icon | – | dialog.with-icon.icon.color | `--md-sys-color-secondary` (#625b71) |
| Headline | – | dialog.headline.color | `--md-sys-color-on-surface` (#1d1b20) |
| Supporting text | – | dialog.supporting-text.color | `--md-sys-color-on-surface-variant` (#49454f) |
| Action label | enabled / hover / focus / pressed | dialog.action[.state].label-text.color | `--md-sys-color-primary` (#6750a4) |
| Action state layer | hover / focus / pressed | dialog.action.{state}.state-layer.color/opacity | `--md-sys-color-primary` @ 0.08 / 0.10 / 0.10 |
| Action disabled | disabled (confirming only) | none in source | text-button disabled: label `on-surface` @ 0.38 (derived, see buttons.md) |
| Action focus ring | focus-visible | none in source | focus ring primitive |
| Divider | – | none in source | `--md-sys-color-outline-variant` (derived: divider.md) |
| Scrim | – | none in source (color role "Scrim" in diagram) | `--md-sys-color-scrim` @ 0.32 (derived: guidelines elevation/scrim rule) |

**Full-screen (`md.comp.full-screen-dialog`)**

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | full-screen-dialog.container.color | `--md-sys-color-surface` (#fef7ff) |
| Header container | at rest | full-screen-dialog.header.container.color | `--md-sys-color-surface` |
| Header container | content scrolled under | full-screen-dialog.header.on-scroll.container.color | `--md-sys-color-surface-container` (#f3edf7) |
| Close icon | – | full-screen-dialog.header.icon.color | `--md-sys-color-on-surface` |
| Close icon state layer | hover / focus / pressed | none in source | icon-button standard: `on-surface-variant` state layer (derived: icon-buttons.md); icon uses token color |
| Headline | – | full-screen-dialog.header.headline.color | `--md-sys-color-on-surface` |
| Header action label | enabled / hover / focus / pressed | full-screen-dialog.header.action[.state].label-text.color | `--md-sys-color-primary` |
| Header action state layer | hover / focus / pressed | full-screen-dialog.header.action.{state}.state-layer.color/opacity | `--md-sys-color-primary` @ 0.08 / 0.10 / 0.10 |
| Body text | – | none (diagram: "On surface variant") | `--md-sys-color-on-surface-variant` |
| Scrim | – | none | no scrim (covers the screen) |

> Source conflict: full-screen color diagram labels the container "Surface container high"; tokens say `surface`. Follow tokens.

### 4.2 Size, layout & shape

**Basic**

| Attribute | Value |
| --- | --- |
| Shape | 28px → `--md-sys-shape-corner-extra-large` |
| Width | min 280px, max 560px; never wider than viewport − 2 × 16px (derived) |
| Height | dynamic; `max-block-size: calc(100dvh − 48px)` (derived: 24px min viewport margin); content region scrolls |
| Padding top / start / end / bottom | 24px |
| Icon size | 24px |
| Icon → headline | 16px |
| Headline → body | 16px |
| Body → actions | 24px |
| Between buttons | 8px |
| Buttons | Small text buttons, 40px tall (see buttons.md), touch target primitive |
| Divider | 1px, full container width (derived), only at top/bottom of the scroll region |
| Alignment | with icon: icon + headline centered; supporting text stays start-aligned (derived: centered paragraphs hurt readability). Without icon: start-aligned. |
| Actions | row, `justify-content: flex-end`; stacked: column, end-aligned, confirming above dismissive |
| Custom position (medium+) | anywhere inside a 56px margin from screen edges |
| Headline overflow | wraps; may truncate after 2 lines (source); default: no clamp, opt-in `-webkit-line-clamp: 2` (derived, a11y: must fit 4 lines at 200% text) |

**Full-screen**

| Attribute | Value |
| --- | --- |
| Shape | 0 → `--md-sys-shape-corner-none` |
| Size | fills the viewport (`100vw × 100dvh`); content column max 560px centered (derived reading of "Container width; Max 560dp") |
| Header | 56px tall (`header.container.height`), full width; `padding-inline: 4px 12px`, gap 8px (derived: small top app bar + "padding between elements 8dp") |
| Close icon button | 48px target, 24px icon (`header.icon.size`) at the start |
| Headline | flex 1, start-aligned, one line, ellipsis (long headlines go in the content area) |
| Header action | small text button at the end |
| Content padding top / start / end | 24px; gap between elements 8px |
| Bottom action bar | 56px tall, full width, buttons end-aligned, `padding-inline: 24px`, gap 8px (derived) |
| Divider | 1px |

### 4.3 Typography

| Part | Typescale |
| --- | --- |
| Basic headline | `md.sys.typescale.headline-small` → `--md-sys-typescale-headline-small-*` (24/32, 400, 0) |
| Basic supporting text | `md.sys.typescale.body-medium` → `--md-sys-typescale-body-medium-*` (14/20, 400, 0.25) |
| Basic action label | `md.sys.typescale.label-large` → `--md-sys-typescale-label-large-*` (14/20, 500, 0.1) |
| Full-screen headline | `md.sys.typescale.title-large` → `--md-sys-typescale-title-large-*` (22/28, 400, 0) |
| Full-screen header action | `md.sys.typescale.label-large` |

### 4.4 Elevation

| Part | State | Level |
| --- | --- | --- |
| Basic container | always | `--md-sys-elevation-level3` (6dp) |
| Full-screen container | always | `--md-sys-elevation-level0` |
| Full-screen header | at rest | `--md-sys-elevation-level0` |
| Full-screen header | content scrolled beneath | `--md-sys-elevation-level2` (3dp) + `surface-container` |

### 4.5 Component token list

**Basic – `md.comp.dialog`**
```
container.color                      → md.sys.color.surface-container-high (#ece6f0)
container.elevation                  → md.sys.elevation.level3 (6dp)
container.shape                      → md.sys.shape.corner.extra-large (28dp)
headline.color                       → md.sys.color.on-surface (#1d1b20)
headline.{font,line-height,size,weight,tracking} → md.sys.typescale.headline-small.* (Roboto brand, 32, 24, 400, 0)
supporting-text.color                → md.sys.color.on-surface-variant (#49454f)
supporting-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-medium.* (Roboto, 20, 14, 400, 0.25)
with-icon.icon.color                 → md.sys.color.secondary (#625b71)
with-icon.icon.size                  → 24dp
action.label-text.color              → md.sys.color.primary (#6750a4)
action.label-text.{font,line-height,size,weight,tracking} → md.sys.typescale.label-large.* (Roboto, 20, 14, 500, 0.1)
action.hover.label-text.color        → md.sys.color.primary
action.hover.state-layer.color       → md.sys.color.primary
action.hover.state-layer.opacity     → md.sys.state.hover.state-layer-opacity (0.08)
action.focus.label-text.color        → md.sys.color.primary
action.focus.state-layer.color       → md.sys.color.primary
action.focus.state-layer.opacity     → md.sys.state.focus.state-layer-opacity (0.1)
action.pressed.label-text.color      → md.sys.color.primary
action.pressed.state-layer.color     → md.sys.color.primary
action.pressed.state-layer.opacity   → md.sys.state.pressed.state-layer-opacity (0.1)
(*.type tokens alias the font tokens above)
```

**Full-screen – `md.comp.full-screen-dialog`**
```
container.color                              → md.sys.color.surface (#fef7ff)
container.elevation                          → md.sys.elevation.level0 (0dp)
container.shape                              → md.sys.shape.corner.none
header.container.color                       → md.sys.color.surface
header.container.elevation                   → md.sys.elevation.level0
header.container.height                      → 56dp
header.on-scroll.container.color             → md.sys.color.surface-container (#f3edf7)
header.on-scroll.container.elevation         → md.sys.elevation.level2 (3dp)
header.headline.color                        → md.sys.color.on-surface (#1d1b20)
header.headline.{font,line-height,size,weight,tracking} → md.sys.typescale.title-large.* (Roboto brand, 28, 22, 400, 0)
header.icon.color                            → md.sys.color.on-surface
header.icon.size                             → 24dp
header.action.label-text.color               → md.sys.color.primary (#6750a4)
header.action.label-text.{font,line-height,size,weight,tracking} → md.sys.typescale.label-large.*
header.action.hover.label-text.color         → md.sys.color.primary
header.action.hover.state-layer.color        → md.sys.color.primary
header.action.hover.state-layer.opacity      → md.sys.state.hover.state-layer-opacity (0.08)
header.action.focus.label-text.color         → md.sys.color.primary
header.action.focus.state-layer.color        → md.sys.color.primary
header.action.focus.state-layer.opacity      → md.sys.state.focus.state-layer-opacity (0.1)
header.action.pressed.label-text.color       → md.sys.color.primary
header.action.pressed.state-layer.color      → md.sys.color.primary
header.action.pressed.state-layer.opacity    → md.sys.state.pressed.state-layer-opacity (0.1)
```

## 5. States & interaction

| Part | Hover | Focus-visible | Pressed | Disabled |
| --- | --- | --- | --- | --- |
| Container / scrim | none | – | – | – |
| Action (basic & header) | primary state layer 0.08 | 0.10 + focus ring | 0.10 + ripple | label on-surface @ 0.38, no state layer (confirming only) |
| Close icon (full-screen) | icon-button state layer 0.08 | 0.10 + focus ring | 0.10 | never disabled |
| Full-screen header | – | – | – | at rest: surface/level0 → scrolled: surface-container/level2 |

- **Disabled rules:** basic confirming action may be disabled until a required choice is made; **dismissive actions are never disabled**; full-screen confirmation is **never disabled** (validate on submit, inline errors).
- **Close paths:** action button (returnValue = action), Escape (`cancel`), scrim click (`cancel`, only when dismissal is safe — opt-in), close icon (full-screen), programmatic.
- **Full-screen dirty close:** any close path except confirm → keep open, show a basic "Discard changes?" dialog ("Keep editing" / "Discard").
- **Confirm failure:** general errors (e.g. network) → basic dialog; field errors inline, all at once.

## 6. Motion & behavior

- **Enter/exit:** source: "enter and exit transition pattern", video shows a fade. Decision (derived; guidelines within-bounds pattern, no bouncy springs for common transitions):
  - Basic enter: container opacity 0 → 1 (spring primitive `default-effects`, ≈200ms) + `clip-path: inset(0 0 35% 0 round 28px)` → `inset(0 round 28px)` and `translate: 0 -16px → 0` with `--md-sys-motion-easing-emphasized-decelerate` / `--md-sys-motion-duration-medium4` (400ms); content fades in after 100ms.
  - Basic exit: opacity → 0, `--md-sys-motion-easing-emphasized-accelerate` / `--md-sys-motion-duration-short4` (200ms).
  - Scrim: opacity 0 → 0.32 with `default-effects`; exit same duration as container.
  - Full-screen enter: `translate: 0 100% → 0` with emphasized decelerate 400ms; exit `translate: 0 100%` emphasized accelerate 200ms. From a FAB: **container transform** (View Transitions API, derived).
  - Header on-scroll color/shadow: `default-effects` spring.
- **Reduced motion:** opacity only, `--md-sys-motion-duration-short3` (150ms); no clip/translate/container transform.
- **Scrolling:** avoid; when needed, headline pinned top, actions pinned bottom, only content scrolls; dividers show at the scroll edges (top divider when `scrollTop > 0`, bottom when not at end — derived). Background never scrolls (lock page scroll, `overscroll-behavior: contain`).
- **Position:** never obscured or partially off-screen (except full-screen dialogs, which other dialogs/menus may cover). Opening a full-screen dialog resets perceived elevation so menus and basic dialogs can appear above it.
- **Adaptive:** compact → full-screen allowed; medium → basic, centered by default, position may be overridden (e.g. end side); expanded → basic over scrim, custom position within 56px margins. Swap full-screen ↔ basic on breakpoint change without losing state.

## 7. Usage guidelines

**Headline:** brief, clear statement or question ("Use location service?"); no apologies, alarm ("Warning!") or ambiguity ("Are you sure?"); may wrap to a second line, then truncate. Full-screen: long/variable headlines (translations) go in the content area.

**Buttons (basic):** max **two**. One → acknowledgement ("OK"). Two → confirming + dismissive. End-aligned; confirming closest to the edge, dismissive before it (mirrors in RTL). Side by side; stack for long labels (confirming above). No third "Learn more" action — use inline expansion or inform before the dialog. No unclear choices ("Cancel" with nothing proposed).

**Full-screen:** for keyboard input/forms, changes not saved instantly, nested dialogs; compact only. Save with **Save** or a specific verb (**Send**, **Create**), not "Done/OK/Close". Close icon or dismissive action closes. Don't use the confirming action to dismiss; don't confirm the confirm with a basic dialog (only on failure). Close "X" is the only header navigation.

**Content:** basic dialogs may contain lists, date pickers, time pickers — follow those components.

## 8. Accessibility

- **Use cases:** open/close; provide and submit inputs; scroll to reach all content.
- **Roles (web):** basic dialogs use `role="alertdialog"` (source); full-screen / form dialogs `role="dialog"` (native `<dialog>` default). Opened with `showModal()` → implicit `aria-modal`, background inert, top layer.
- **Name/description:** `aria-labelledby` → headline (no headline → `aria-label`); `aria-describedby` → supporting text (alert dialogs).
- **Icons:** hero icon decorative (`aria-hidden="true"`); close button `aria-label="Close"`.
- **Initial focus:** first interactive element (source). In a confirm dialog the dismissive button comes first in DOM order, so destructive actions aren't the default target. Use `autofocus` to override (e.g. first field in a form).
- **Focus trap & return:** Tab/Shift+Tab cycle inside (native modal dialogs keep focus inside the page's top layer; add explicit wrap if browser chrome is reachable, derived); on close, focus returns to the invoker (native for `showModal()`; verify the invoker still exists, else focus the next logical element).
- **Scrollable content:** keyboard-reachable — make the scroll region focusable (`tabindex="0"`, labelled by the headline) when it overflows and contains no focusable elements (derived).
- **200% text:** concise strings; headline should fit within four lines at 200%; if truncated, provide one-tap access to the full text.
- **Use sparingly** — dialogs disrupt screen-reader flow.
- **Keyboard:**

| Key | Action |
| --- | --- |
| Tab | Next interactive element; wraps last → first |
| Shift + Tab | Previous interactive element; wraps first → last |
| Space / Enter | Triggers/commits the focused element |
| Escape | Closes the dialog (`cancel`; can be intercepted for dirty full-screen dialogs) |

## 9. Implementation checklist

- [ ] Native `<dialog>` + `showModal()`; `::backdrop` as scrim.
- [ ] Props: `open` (reflect), `variant: basic | full-screen | adaptive`, `position: center | start | end | top | bottom` (medium+), `role: alert | dialog`, `stacked-actions`, `scrim-dismiss` (default off), `dirty` (full-screen).
- [ ] Slots: `icon`, `headline`, `content`, `actions`; full-screen: `close`, `headline`, `header-action`, `content`, `bottom-actions`.
- [ ] Methods `show()`, `close(returnValue?)`; events `open`, `opened`, `cancel` (cancelable), `close` (detail.reason: `action | escape | scrim | close-button | programmatic`, returnValue), `closed`.
- [ ] Layout: 24px padding, 16 / 16 / 24 gaps, 8px button gap, 280–560px, max height viewport − 48px, pinned headline/actions, scroll dividers.
- [ ] Icon present → centered icon + headline.
- [ ] Full-screen: 56px header, scroll-linked header color/elevation, optional 56px bottom bar, slide-up motion, dirty-close confirmation.
- [ ] Page scroll lock; reduced motion; forced colors; RTL via logical properties.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Basic -->
<dialog class="md-dialog" role="alertdialog" aria-labelledby="d1-h" aria-describedby="d1-t">
  <form method="dialog" class="md-dialog__container" part="container">
    <span class="md-dialog__icon md-icon" part="icon" aria-hidden="true">delete</span>
    <h2 class="md-dialog__headline" part="headline" id="d1-h">Permanently delete?</h2>
    <div class="md-dialog__content" part="content">
      <p id="d1-t">Deleting the selected messages will also remove them from synced devices.</p>
    </div>
    <div class="md-dialog__actions" part="actions">
      <button class="md-button md-button--text" value="cancel">Cancel</button>
      <button class="md-button md-button--text" value="delete">Delete</button>
    </div>
  </form>
</dialog>

<!-- Full-screen -->
<dialog class="md-dialog md-dialog--full-screen" aria-labelledby="d2-h">
  <form method="dialog" class="md-dialog__container">
    <header class="md-dialog__header" part="header">
      <button class="md-icon-button" value="close" formnovalidate aria-label="Close"><span class="md-icon" aria-hidden="true">close</span></button>
      <h2 class="md-dialog__headline" id="d2-h">New event</h2>
      <button class="md-button md-button--text" value="save">Save</button>
    </header>
    <div class="md-dialog__content">…fields…</div>
    <!-- optional --><div class="md-dialog__bottom-bar">…</div>
  </form>
</dialog>
```
`form method="dialog"` closes with `returnValue` = clicked button's `value`. Close/cancel buttons use `formnovalidate`.

**(b) Custom properties**
```css
.md-dialog {
  --md-comp-dialog-container-color: var(--md-sys-color-surface-container-high);
  --md-comp-dialog-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-dialog-container-shape: var(--md-sys-shape-corner-extra-large);
  --md-comp-dialog-headline-color: var(--md-sys-color-on-surface);
  --md-comp-dialog-supporting-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-dialog-with-icon-icon-color: var(--md-sys-color-secondary);
  --md-comp-dialog-with-icon-icon-size: 24px;
  --md-comp-dialog-action-label-text-color: var(--md-sys-color-primary);
  --md-comp-dialog-scrim-color: var(--md-sys-color-scrim);   /* derived */
  --md-comp-dialog-scrim-opacity: 0.32;                       /* derived */
}
.md-dialog--full-screen {
  --md-comp-full-screen-dialog-container-color: var(--md-sys-color-surface);
  --md-comp-full-screen-dialog-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-full-screen-dialog-header-container-color: var(--md-sys-color-surface);
  --md-comp-full-screen-dialog-header-container-height: 56px;
  --md-comp-full-screen-dialog-header-on-scroll-container-color: var(--md-sys-color-surface-container);
  --md-comp-full-screen-dialog-header-on-scroll-container-elevation: var(--md-sys-elevation-level2);
  --md-comp-full-screen-dialog-header-headline-color: var(--md-sys-color-on-surface);
  --md-comp-full-screen-dialog-header-icon-color: var(--md-sys-color-on-surface);
  --md-comp-full-screen-dialog-header-action-label-text-color: var(--md-sys-color-primary);
}
```

**(c) Layout & states**
```css
html:has(.md-dialog:modal) { overflow: hidden; scrollbar-gutter: stable; }
.md-dialog {
  padding: 0; border: 0; background: transparent; overflow: visible;
  min-inline-size: min(280px, 100vw - 32px); max-inline-size: min(560px, 100vw - 32px);
  max-block-size: calc(100dvh - 48px);
}
.md-dialog::backdrop { background: color-mix(in srgb, var(--md-comp-dialog-scrim-color) calc(var(--md-comp-dialog-scrim-opacity) * 100%), transparent); }
.md-dialog__container {
  display: flex; flex-direction: column; box-sizing: border-box; max-block-size: inherit;
  padding-block: 24px; /* inline padding on children so dividers can be full width */
  background: var(--md-comp-dialog-container-color);
  border-radius: var(--md-comp-dialog-container-shape);
  box-shadow: var(--md-comp-dialog-container-elevation); /* elevation primitive */
}
.md-dialog__icon { align-self: center; font-size: var(--md-comp-dialog-with-icon-icon-size); color: var(--md-comp-dialog-with-icon-icon-color); margin-block-end: 16px; }
.md-dialog__headline { margin: 0; padding: 0 24px 16px; color: var(--md-comp-dialog-headline-color);
  font: var(--md-sys-typescale-headline-small-weight) var(--md-sys-typescale-headline-small-size)/var(--md-sys-typescale-headline-small-line-height) var(--md-sys-typescale-headline-small-font);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking); }
.md-dialog__container:has(.md-dialog__icon) .md-dialog__headline { text-align: center; }
.md-dialog__content { flex: 1 1 auto; min-block-size: 0; overflow-y: auto; overscroll-behavior: contain;
  padding-inline: 24px; color: var(--md-comp-dialog-supporting-text-color);
  font: var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size)/var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
  border-block: 1px solid transparent; }
.md-dialog__content > :first-child { margin-block-start: 0; } .md-dialog__content > :last-child { margin-block-end: 0; }
.md-dialog[data-scroll-top] .md-dialog__content { border-block-start-color: var(--md-sys-color-outline-variant); }
.md-dialog[data-scroll-more] .md-dialog__content { border-block-end-color: var(--md-sys-color-outline-variant); }
.md-dialog__actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 24px 24px 0; }
.md-dialog[data-stacked-actions] .md-dialog__actions { flex-direction: column-reverse; align-items: flex-end; }
.md-dialog__actions .md-button { color: var(--md-comp-dialog-action-label-text-color); }
/* buttons: state layer primitive (primary, 0.08/0.10/0.10), focus ring primitive, ripple primitive, touch target primitive;
   :disabled → label on-surface @ 0.38 via color-mix, no state layer */

/* Custom position (medium+) */
@media (min-width: 600px) {
  .md-dialog[data-position="end"] { margin-block: auto; margin-inline: auto 56px; }
  .md-dialog[data-position="start"] { margin-block: auto; margin-inline: 56px auto; }
  .md-dialog[data-position] { max-block-size: calc(100dvh - 112px); }
}

/* Full-screen */
.md-dialog--full-screen { inline-size: 100vw; block-size: 100dvh; max-inline-size: none; max-block-size: none; margin: 0; }
.md-dialog--full-screen::backdrop { background: transparent; }
.md-dialog--full-screen .md-dialog__container { block-size: 100%; padding: 0; border-radius: var(--md-comp-full-screen-dialog-container-shape);
  background: var(--md-comp-full-screen-dialog-container-color); box-shadow: none; }
.md-dialog__header { position: sticky; top: 0; display: flex; align-items: center; gap: 8px; flex: none;
  block-size: var(--md-comp-full-screen-dialog-header-container-height); padding-inline: 4px 12px;
  background: var(--md-comp-full-screen-dialog-header-container-color);
  transition: background-color var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing),
              box-shadow var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing); }
.md-dialog[data-scroll-top] .md-dialog__header { background: var(--md-comp-full-screen-dialog-header-on-scroll-container-color);
  box-shadow: var(--md-comp-full-screen-dialog-header-on-scroll-container-elevation); }
.md-dialog__header .md-icon-button { color: var(--md-comp-full-screen-dialog-header-icon-color); }
.md-dialog__header .md-dialog__headline { flex: 1; min-inline-size: 0; padding: 0; text-align: start;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--md-comp-full-screen-dialog-header-headline-color);
  font: var(--md-sys-typescale-title-large-weight) var(--md-sys-typescale-title-large-size)/var(--md-sys-typescale-title-large-line-height) var(--md-sys-typescale-title-large-font);
  letter-spacing: var(--md-sys-typescale-title-large-tracking); }
.md-dialog--full-screen .md-dialog__content { padding: 24px; display: flex; flex-direction: column; gap: 8px;
  inline-size: 100%; max-inline-size: 560px; margin-inline: auto; box-sizing: border-box; border: 0; }
.md-dialog__bottom-bar { flex: none; block-size: 56px; display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-inline: 24px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant); }
/* Adaptive: JS toggles .md-dialog--full-screen at the compact breakpoint (see f) */
```

**(d) Motion**
```css
.md-dialog, .md-dialog::backdrop {
  transition: opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-accelerate),
              overlay var(--md-sys-motion-duration-short4) allow-discrete, display var(--md-sys-motion-duration-short4) allow-discrete;
  opacity: 0;
}
.md-dialog[open], .md-dialog[open]::backdrop { opacity: 1;
  transition-duration: var(--md-sys-motion-spring-default-effects-duration); transition-timing-function: var(--md-sys-motion-spring-default-effects-easing); }
.md-dialog[open]:not(.md-dialog--full-screen) .md-dialog__container {
  animation: md-dialog-in var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate); }
@keyframes md-dialog-in { from { clip-path: inset(0 0 35% 0 round 28px); translate: 0 -16px; } to { clip-path: inset(0 round 28px); translate: 0 0; } }
@starting-style { .md-dialog[open], .md-dialog[open]::backdrop { opacity: 0; } }
.md-dialog--full-screen { opacity: 1; translate: 0 100%;
  transition: translate var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-accelerate),
              overlay var(--md-sys-motion-duration-short4) allow-discrete, display var(--md-sys-motion-duration-short4) allow-discrete; }
.md-dialog--full-screen[open] { translate: 0 0; transition-duration: var(--md-sys-motion-duration-medium4); transition-timing-function: var(--md-sys-motion-easing-emphasized-decelerate); }
@starting-style { .md-dialog--full-screen[open] { translate: 0 100%; } }
@media (prefers-reduced-motion: reduce) {
  .md-dialog, .md-dialog::backdrop, .md-dialog--full-screen { translate: none; transition-property: opacity, overlay, display; transition-duration: var(--md-sys-motion-duration-short3); }
  .md-dialog--full-screen { opacity: 0; } .md-dialog--full-screen[open] { opacity: 1; }
  .md-dialog[open] .md-dialog__container { animation: none; }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-dialog__container { border: 1px solid CanvasText; }
  .md-dialog::backdrop { background: rgb(0 0 0 / 0.5); forced-color-adjust: none; }
  .md-dialog[data-scroll-top] .md-dialog__content, .md-dialog[data-scroll-more] .md-dialog__content { border-color: CanvasText; }
  .md-dialog__header { border-block-end: 1px solid CanvasText; }
}
```

**(f) Behaviour (JS)**
- `show()` → `showModal()`; dispatch `open`, then `opened` on `animationend`/`transitionend`.
- Initial focus: native modal focus (first focusable / `[autofocus]`).
- `cancel` event (Escape): re-dispatch cancelable `cancel`; if prevented (required decision, dirty full-screen) → `preventDefault()`. Dirty full-screen → open the discard basic dialog stacked on top.
- Scrim click (opt-in `scrim-dismiss`): `closedby="any"` where supported; fallback: `click` on the `<dialog>` whose target is the dialog itself and coordinates fall outside the container rect → treat as `cancel`.
- `close` event → read `returnValue`, dispatch `close`/`closed` with reason; restore focus to the invoker if `isConnected`.
- Scroll dividers / header elevation: `scroll` listener (or `IntersectionObserver` sentinels at both ends) on `.md-dialog__content` toggles `data-scroll-top` / `data-scroll-more`; also re-evaluate on `ResizeObserver`.
- Stacked actions: if the buttons' total width exceeds the actions row, set `data-stacked-actions` (ResizeObserver), or let authors force it.
- Adaptive: `matchMedia('(max-width: 599.98px)')` change while open → toggle `.md-dialog--full-screen` (and header vs footer action visibility); keep form state (same DOM).
- Make `.md-dialog__content` `tabindex="0"` when it overflows and has no focusable descendants.

## 11. Source gaps & decisions

- **Scrim opacity:** not tokenized → `scrim` @ 0.32 (guidelines scrim rule); `--md-comp-dialog-scrim-*` names are derived.
- **Divider color / placement:** not tokenized → `outline-variant` 1px, shown only at scroll edges (top when scrolled, bottom when more content).
- **Disabled action, close-icon state layer:** no dialog tokens → text-button / standard icon-button specs.
- **Full-screen container color:** diagram "surface container high" vs token `surface` → token.
- **Full-screen "max 560dp" on a compact-only variant:** interpreted as the content column max width; container fills the viewport.
- **Full-screen header internals:** only height 56 and "padding between elements 8dp" given → `padding-inline: 4px 12px`, gap 8px (small top app bar convention); bottom bar `padding-inline: 24px`.
- **Viewport margins & max height:** not given for centered dialogs → ≥ 16px inline, 24px block; 56px for custom positions (source).
- **Center alignment with icon:** applied to icon + headline only; supporting text stays start-aligned.
- **Enter/exit motion values:** not given (video: fade) → fade + short downward reveal (emphasized decelerate 400ms), exit fade 200ms; full-screen slides up; no bouncy springs (common transition).
- **Role:** source says basic = `alertdialog` on web; native `<dialog>` default `dialog` kept for full-screen/form dialogs. Authors may use `dialog` for list/picker basic dialogs (derived).
- **Scrim click to dismiss:** not in source → off by default (dialogs stay until confirmed/dismissed); opt-in for safe dismissals.
- **Headline truncation:** source allows wrap + truncate; default no clamp because of the 200%-text rule, opt-in 2-line clamp.
