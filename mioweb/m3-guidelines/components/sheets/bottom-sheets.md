# Bottom sheets

> Source: https://m3.material.io/components/bottom-sheets · M3 Expressive · values shown for baseline light scheme; see ../../guidelines.md for the full token reference.

## 1. Overview
Bottom sheets display **supplementary** content and actions anchored to the bottom of the screen (mobile-first). They can hold menu items (list or grid), actions, and supplemental content, and can be dismissed to interact with the main content.

**Use when**
- Compact and medium window sizes.
- Content is additional/secondary, not the app's main content.
- Standard: complementary content that coexists with the main UI (audio player, location details over a map).
- Modal: alternative to inline menus or simple dialogs on mobile, especially long action lists or items needing descriptions and icons.

**Don't use when**
- Content is the app's primary content.
- Expanded (desktop) windows → prefer a **side sheet** with similar content.
- Complex tasks/flows on large screens → consider a non-transient surface (e.g. floating sheet).
- Modal bottom sheets: **mobile apps only**.

**Changes vs. M2**
- Color: new color mappings, dynamic-color compatible.
- Shape: 28dp top corner radius.
- Layout: new max-width 640dp; optional drag handle with accessible 48dp hit target.

> The source lists no Expressive-specific token changes (no shape-morph / spring tokens) for bottom sheets. Motion below uses the system springs (guidelines: "default" speed = partial-screen motion such as bottom sheets).

## 2. Variants & configurations

| Variant / configuration | Description | Notes |
| --- | --- | --- |
| **Standard** | Coexists with main UI; both regions viewable and interactive simultaneously. | No scrim. Preset heights from preview to full-screen; at full-screen height shows a **collapse icon** in an app bar to return to initial position. Content may continue below the screen. |
| **Modal** | In front of app content like a dialog; blocks other app functionality until confirmed/dismissed/action taken. | Above a **scrim**. Initial position capped at **50% of screen height**; can be pulled to full screen and scrolled internally. Show a close affordance when full-screen. |
| With drag handle | Optional 32×4dp handle; dragging or selecting changes height. | Top 48dp of sheet is the interactive region. |
| Expandable (collapsed ↔ expanded) | Sheet fully raised and toggled between collapsed and expanded states (by system or user). | Predictable footprint. |
| Minimized | Docked minimized state (token only; no guidance text in source). | Container shape `corner.none` (token `docked.minimized.container.shape`). |

Both variants share identical specs except the scrim.

## 3. Anatomy
1. **Container** (required) – holds all elements; size determined by content and available space.
2. **Drag handle** (optional) – resize/cycle heights; button role, focusable.
3. **Scrim** (modal only) – overlay behind the sheet.

Optional content: **list items** (label text, icons, text buttons…), **dividers** (e.g. inset divider), **media** (thumbnail, image/illustration, video), app bar with collapse/close icon at full-screen height.

## 4. Tokens & specs

### 4.1 Color

| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | `--md-comp-sheet-bottom-docked-container-color` | `--md-sys-color-surface-container-low` (#f7f2fa) |
| Drag handle | – | `--md-comp-sheet-bottom-docked-drag-handle-color` | `--md-sys-color-on-surface-variant` (#49454f) |
| Focus indicator | focused (drag handle) | `--md-comp-sheet-bottom-focus-indicator-color` | `--md-sys-color-secondary` (#625b71) |
| Scrim | modal only | not tokenized; color role **Scrim** | `--md-sys-color-scrim` @ 32% (system scrim rule, guidelines § Elevation; on Android handled by system UI) |
| Drag handle state layer | hover/focus/pressed | not tokenized | (derived) `on-surface-variant` via state layer primitive |

Disabled state: not applicable.

### 4.2 Size, layout & shape

| Attribute | Value |
| --- | --- |
| Width | Full window width, up to max **640dp** (max-width may be overridden) |
| Height | Variable (content); modal initial height ≤ 50% of screen |
| Top margin | 72dp (minimum gap from top of window when fully expanded) |
| Top margin, window width > 640dp | 56dp |
| Start/end margin, window width > 640dp | 56dp (sheet centered horizontally – derived: 640 max-width + centered) |
| Container shape | `--md-sys-shape-corner-extra-large-top` (28dp top-left/top-right, bottom 0) |
| Minimized container shape | `--md-sys-shape-corner-none` |
| Drag handle | 32 × 4dp, horizontally centered |
| Drag handle padding top/bottom | 22dp (→ 22 + 4 + 22 = 48dp handle region) |
| Drag handle hit area | top 48dp of the sheet when resizing is available and handle present |
| Drag handle radius | (derived) `--md-sys-shape-corner-full` |
| Focus indicator | thickness 3dp, outer offset 2dp (focus ring primitive) |

### 4.3 Typography
No typography tokens; content uses its own components' typescales (lists, buttons, app bar).

### 4.4 Elevation

| Variant | Level |
| --- | --- |
| Standard | `--md-sys-elevation-level1` |
| Modal | `--md-sys-elevation-level1` + scrim |

### 4.5 Component token list — `md.comp.sheet.bottom`
```
docked.container.color                → md.sys.color.surface-container-low (#f7f2fa)
docked.container.shape                → md.sys.shape.corner.extra-large.top (28dp TL/TR)
docked.minimized.container.shape      → md.sys.shape.corner.none
docked.standard.container.elevation   → md.sys.elevation.level1
docked.modal.container.elevation      → md.sys.elevation.level1
docked.drag-handle.color              → md.sys.color.on-surface-variant (#49454f)
docked.drag-handle.width              → 32dp
docked.drag-handle.height             → 4dp
focus.indicator.color                 → md.sys.color.secondary (#625b71)
focus.indicator.thickness             → md.sys.state.focus-indicator.thickness (3dp)
focus.indicator.outline.offset        → md.sys.state.focus-indicator.outer-offset (2dp)
```

## 5. States & interaction
- **Drag handle**: focusable (tab order); focus ring primitive. Selecting it (click/tap/Space/Enter) **cycles through preset heights or closes** the sheet. Dragging changes height. Hover/pressed: state layer primitive on a 48×48 circle/pill behind the handle (derived; source silent).
- **Dragging**: handle / top 48dp drags the sheet; on release snap to nearest preset height, using release velocity to pick the next detent (derived); dragging below the lowest detent past ~50% of its height or a downward fling closes (modal, derived).
- **Scrim** (modal): selecting the scrim **always closes** the sheet.
- **Sheets must cycle preset heights and close completely without dragging**. If no drag handle but multiple heights, provide a button for this.
- **Modal dismissal**: tap an item/action inside, tap scrim, swipe down, close affordance in the sheet's app bar; Escape (web mapping).
- **Standard at full height**: collapse icon in app bar returns to initial position.

| Part × state | Rest | Hover | Focus-visible | Pressed | Dragging |
| --- | --- | --- | --- | --- | --- |
| Container | surface-container-low, level1 | – | – | – | follows pointer, no transition |
| Drag handle | on-surface-variant | state layer hover | focus ring + focus state layer | state layer pressed | state layer dragged (derived) |

## 6. Motion & behavior
- **Enter/exit** ("enter & exit beyond bounds" pattern): sheet slides up from bottom edge; exit slides down. Spatial property `transform` → `--md-sys-motion-spring-default-spatial` (CSS: `-easing`/`-duration` helpers). Common transitions must not bounce (guidelines) → for open/close use the **standard** scheme spring or `--md-sys-motion-easing-emphasized-decelerate` (enter, `--md-sys-motion-duration-medium4`) / `--md-sys-motion-easing-emphasized-accelerate` (exit, `--md-sys-motion-duration-short4`) (derived from legacy table: enter 400ms / exit 200ms).
- **Scrim**: opacity 0 → 0.32 with `--md-sys-motion-spring-default-effects`.
- **Detent change / snap after drag**: JS spring (`spring-default-spatial` stiffness/damping) preserving release velocity.
- **Modal visibility**: initial top position ≤ 50% of screen height; if content exceeds 50%, user can pull to full screen and scroll internally.
- **Scrolling**: content scrolls when exceeding visible height; horizontal scroll independent of the screen.
- **Predictive back** (Android): sheet detaches from left/right edges (shrinks) and previews previous screen; release/fling commits, cancel restores. Web: optional, not required.
- **Responsive**: compact full width; medium/expanded max-width 640dp (overridable), when window > 640dp → 56dp top and side margins; expanded (desktop) → swap for side sheet.
- **Reduced motion**: replace slide with a short opacity fade (`spring-fast-effects`), snap detents instantly.

## 7. Usage guidelines
- Content supplementary; container is the only required element.
- Standard: main region frequently scrolled/panned and both must be usable (music player while browsing).
- Modal: blocking → menus to focus choices; appears from a user action (button/overflow icon).
- Display a close affordance in a full-screen modal bottom sheet.
- Use dividers to separate kinds of content/actions.
- Don't exceed 50% screen height initially for modal.
- Don't use modal bottom sheets outside mobile; on desktop use side sheets.

## 8. Accessibility
**Roles & ARIA**
- Drag handle: role **button** (source), the **only** labeled element (source), e.g. `aria-label="Resize sheet"`; (web mapping) `aria-description`/live text of current height ("Half height") optional.
- Modal: native `<dialog>` opened with `showModal()` → modal semantics, inert background, top layer; `aria-labelledby` to header (web mapping).
- Standard: `<section role="region" aria-label>` / `<aside>`; not modal, no focus trap.

**Keyboard**

| Key | Action |
| --- | --- |
| Tab | Focus lands on drag handle |
| Space / Enter | Toggles between available heights (on drag handle) |
| Escape | (web mapping) closes modal sheet (`<dialog>` `cancel` event) |

**Focus**
- Modal: on open focus the drag handle (first focusable; source "initial focus"), keep focus inside; restore to invoker on close.
- Single-pointer alternative for every drag action; top 48dp = touch target.

## 9. Implementation checklist
**Suggested API**
- `open`, `variant`: `standard` | `modal`, `detents` (e.g. `["peek","half","full"]` or px/%), `detent`, `drag-handle` (bool), `max-width` (default 640px), `dismissible`.
- Slots: default content, `header` (app bar with collapse/close), `handle`.
- Events: `open`, `close` (cancelable, `reason`: `scrim|swipe|escape|action|handle`), `detent-change`, `drag-start/end`.
- Methods: `show()`, `close()`, `setDetent(n)`, `cycleDetent()`.

**Edge cases**
- Content shorter than a detent → height = content (cap detents at content height).
- Drag vs. internal scroll: when content `scrollTop > 0`, a downward drag scrolls content; at top, it drags the sheet.
- No drag handle + multiple detents → visible button alternative.
- Window resize across 640px → recompute margins; on expanded windows consider side sheet.
- Virtual keyboard: use `dvh`/`visualViewport` to keep sheet above keyboard (derived).
- Body scroll lock for modal (`overflow: hidden` on root while open).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Modal -->
<dialog class="md-bottom-sheet" data-variant="modal" aria-labelledby="bs-title">
  <div class="md-bottom-sheet__container" part="container">
    <button class="md-bottom-sheet__handle" part="handle" type="button" aria-label="Resize sheet">
      <span class="md-bottom-sheet__handle-bar" aria-hidden="true"></span>
    </button>
    <header part="header"><!-- optional app bar; close icon at full height --></header>
    <div class="md-bottom-sheet__content" part="content"><!-- slot --></div>
  </div>
</dialog>
<!-- Standard: same inner structure inside <section class="md-bottom-sheet" data-variant="standard" role="region" aria-label="…"> -->
```
Scrim = `dialog::backdrop` (modal). Standard has no scrim.

**(b) Custom properties**
```css
.md-bottom-sheet {
  --md-comp-sheet-bottom-docked-container-color: var(--md-sys-color-surface-container-low);
  --md-comp-sheet-bottom-docked-container-shape: var(--md-sys-shape-corner-extra-large-top);
  --md-comp-sheet-bottom-docked-minimized-container-shape: var(--md-sys-shape-corner-none);
  --md-comp-sheet-bottom-docked-standard-container-elevation: var(--md-sys-elevation-level1);
  --md-comp-sheet-bottom-docked-modal-container-elevation: var(--md-sys-elevation-level1);
  --md-comp-sheet-bottom-docked-drag-handle-color: var(--md-sys-color-on-surface-variant);
  --md-comp-sheet-bottom-docked-drag-handle-width: 32px;
  --md-comp-sheet-bottom-docked-drag-handle-height: 4px;
  --md-comp-sheet-bottom-focus-indicator-color: var(--md-sys-color-secondary);
  --md-comp-sheet-bottom-focus-indicator-thickness: var(--md-sys-state-focus-indicator-thickness);
  --md-comp-sheet-bottom-focus-indicator-outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
  --_max-width: 640px; --_top-margin: 72px; --_side-margin: 0px;
  --_offset: 0px; /* set by JS: translateY for current detent/drag */
}
.md-bottom-sheet {
  position: fixed; inset: auto 0 0 0; margin: 0 auto; padding: 0; border: 0;
  width: min(100% - 2 * var(--_side-margin), var(--_max-width)); max-width: none;
  max-height: calc(100dvh - var(--_top-margin)); background: transparent; overflow: visible;
}
@media (min-width: 641px) { .md-bottom-sheet { --_top-margin: 56px; --_side-margin: 56px; } }
.md-bottom-sheet__container {
  display: flex; flex-direction: column; max-height: inherit;
  background: var(--md-comp-sheet-bottom-docked-container-color);
  border-radius: var(--md-comp-sheet-bottom-docked-container-shape);
  box-shadow: var(--md-comp-sheet-bottom-docked-standard-container-elevation);
  transform: translateY(var(--_offset)); touch-action: none;
}
[data-variant="modal"] .md-bottom-sheet__container { box-shadow: var(--md-comp-sheet-bottom-docked-modal-container-elevation); }
.md-bottom-sheet[data-minimized] .md-bottom-sheet__container { border-radius: var(--md-comp-sheet-bottom-docked-minimized-container-shape); }
.md-bottom-sheet__handle {          /* 48px region: 22 + 4 + 22 */
  position: relative; align-self: center; width: 48px; height: 48px; /* derived hit width */
  display: grid; place-items: center; border: 0; padding: 0; background: none; cursor: grab;
  border-radius: var(--md-sys-shape-corner-full); /* state layer primitive clips to this */
}
.md-bottom-sheet__handle-bar {
  width: var(--md-comp-sheet-bottom-docked-drag-handle-width);
  height: var(--md-comp-sheet-bottom-docked-drag-handle-height);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--md-comp-sheet-bottom-docked-drag-handle-color);
}
.md-bottom-sheet__content { overflow: auto; overscroll-behavior: contain; touch-action: pan-x pan-y; flex: 1; }
.md-bottom-sheet::backdrop { background: color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent); }
```

**(c) States**
| Selector | Change |
| --- | --- |
| `.md-bottom-sheet__handle:hover / :active` | state layer primitive (on-surface-variant, hover / pressed opacity) |
| `.md-bottom-sheet__handle:focus-visible` | focus ring primitive: `outline: var(--md-comp-sheet-bottom-focus-indicator-thickness) solid var(--md-comp-sheet-bottom-focus-indicator-color); outline-offset: var(--md-comp-sheet-bottom-focus-indicator-outline-offset)` |
| `[data-dragging]` | `transition: none` on container; handle `cursor: grabbing`; dragged state layer |
| `[data-detent="full"]` | show close (modal) / collapse (standard) icon in header |
| `[data-minimized]` | radius `corner-none` |

**(d) Motion**
```css
.md-bottom-sheet__container { transition: transform var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial-easing); }
.md-bottom-sheet[data-dragging] .md-bottom-sheet__container { transition: none; }
dialog.md-bottom-sheet[open] .md-bottom-sheet__container { @starting-style { transform: translateY(100%); } }
dialog.md-bottom-sheet::backdrop { transition: opacity var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing); }
@media (prefers-reduced-motion: reduce) {
  .md-bottom-sheet__container { transition: opacity var(--md-sys-motion-spring-fast-effects-duration) linear; }
}
```
Closing: animate container to `translateY(100%)`, then `dialog.close()` on `transitionend`.

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-bottom-sheet__container { border: 1px solid CanvasText; border-bottom: 0; }
  .md-bottom-sheet__handle-bar { background: CanvasText; }
  .md-bottom-sheet__handle:focus-visible { outline-color: Highlight; }
}
```

**(f) JS responsibilities**
- Open: `showModal()` (modal) / toggle `hidden` (standard); set initial detent ≤ 50% viewport for modal; lock body scroll; focus handle.
- Pointer drag on handle + top 48px (`pointerdown` → `setPointerCapture`, update `--_offset`, `data-dragging`); on `pointerup` pick detent by position + velocity, animate with spring; close if below lowest detent threshold.
- Handle `click`/Space/Enter → `cycleDetent()` (last step closes if `dismissible`); announce new height via handle `aria-description`.
- Scrim click (`click` whose target is the `<dialog>` itself) → close(reason `scrim`); `cancel` (Escape) → close(reason `escape`).
- Restore focus to invoker on close; recompute margins on resize.

## 11. Source gaps & decisions
- **Scrim opacity** not on page → 32% (guidelines system scrim rule).
- **Motion** not specified → default spatial/effects springs (guidelines classify bottom sheets as default-speed motion); open/close without bounce per "common transitions must not use bouncy springs".
- **Drag handle state layers / radius / hit width** not specified → state layer primitive, full radius, 48px hit area (matches the 48dp height).
- **Detent model** (peek/half/full, snap thresholds, fling) not specified → JS spring with velocity, 50% threshold to close.
- **Minimized** state only exists as a token → exposed as `data-minimized` changing radius to none; no further behaviour defined.
- **Side margins > 640dp**: source says 56dp side margins while also capping width at 640 → implemented as `width: min(100% - 112px, 640px)` centered.
- **Escape / `<dialog>` semantics** not in source → web mapping; source only mandates labeling the drag handle as button.
