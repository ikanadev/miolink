# Snackbar

> Source: https://m3.material.io/components/snackbar · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview

A snackbar is a brief, low-priority message about a process the app has performed or will perform. It appears temporarily near the bottom of the UI.

- Doesn't interrupt: the user can keep using the page without interacting with it.
- Either auto-dismisses (no action) or persists until the user acts on it or dismisses it (with an action).
- Only **one** snackbar visible at a time.
- **Snackbar** = low priority, action optional ("Email archived" + "Undo"). **Dialog** = high priority, action required, blocks the app.
- Never the only way to reach a core use case.
- **Compared with M2:** new color mappings + dynamic color; clarified temporary (dismissive) vs persistent-until-action (non-dismissive).
- No Expressive-specific changes. Material Web doesn't ship a snackbar; guidance applies to custom implementations.

## 2. Variants & configurations

| Configuration | Description | Height |
| --- | --- | --- |
| Single line | Supporting text only | 48px |
| Single line with action | Text + one text button on the same row | 48px |
| Two lines | Two lines of text (compact windows only) | 68px |
| Two lines with action | Two lines + text button on the same row | 68px |
| Two lines with longer action | Action on its own (third) line below the text, end-aligned | 68px text block + 48px action row = 116px (derived) |
| + Close icon (optional) | Trailing close (×) icon button, after the action | same as row |

Behavioural type: **dismissive** (no action → auto-dismiss 4–10s) or **non-dismissive** (has action → stays until action/close/Esc).

## 3. Anatomy

1. **Container**: inverse-surface, 4px corners, level3 elevation, opaque (slight transparency only if text stays legible).
2. **Supporting text**: body-medium; one line where possible, max two lines in compact windows. No icons, bold, or inline links.
3. **Action** (optional): one **text button**, label inverse-primary.
4. **Close icon button** (optional): 24px icon, inverse-on-surface.

## 4. Tokens & specs

### 4.1 Color
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | snackbar.container.color | `--md-sys-color-inverse-surface` (#322f35) |
| Shadow | – | snackbar.container.shadow-color | `--md-sys-color-shadow` (#000000) |
| Supporting text | – | snackbar.supporting-text.color | `--md-sys-color-inverse-on-surface` (#f5eff7) |
| Action label | enabled / hover / focus / pressed | snackbar.action[.state].label-text.color | `--md-sys-color-inverse-primary` (#d0bcff) |
| Action state layer | hover 0.08 / focus 0.10 / pressed 0.10 | snackbar.action.{state}.state-layer.color | `--md-sys-color-inverse-primary` |
| Close icon | enabled / hover / focus / pressed | snackbar.icon.color, snackbar.icon.{state}.icon.color | `--md-sys-color-inverse-on-surface` |
| Close icon state layer | hover 0.08 / focus 0.10 / pressed 0.10 | snackbar.icon.{state}.state-layer.color | `--md-sys-color-inverse-on-surface` |
| Focus ring (action, close) | focus-visible | none in source | `--md-sys-color-inverse-primary` (derived: the focus ring primitive's `secondary` has too little contrast on inverse-surface) |

- No disabled state (action never disabled).
- Action color must differ from supporting text color.

### 4.2 Size, layout & shape
| Attribute | Value |
| --- | --- |
| Height, single line | 48px (`with-single-line.container.height`) |
| Height, two lines | 68px (`with-two-lines.container.height`); guideline text says "48dp to 64dp" — follow the token (68 = 40px text + 2×14px padding) |
| Corner radius | 4px (`--md-sys-shape-corner-extra-small`) |
| Text padding | block 14px, inline-start 16px, inline-end 16px when no action/close (derived: MDC; 14+20+14 = 48 and 14+40+14 = 68 match the height tokens) |
| Action / close area | inline-end padding 8px; action is a small text button (40px tall, 16px inline padding, see buttons.md), close is a 40px icon button with 24px icon (`icon.size`); 4px gap between them; both vertically centered (derived) |
| Text ↔ action gap | 8px (derived; text starts 16px from start, action area begins after) |
| Long-action layout | Text row padding 14px 16px 4px; action row end-aligned, padding 0 8px 4px (40px button + 4px = 44px) (derived) |
| Min touch target | 48×48px for action and close (touch target primitive) |
| Width, compact (< 600px) | Window width − 2 × 16px margin (compact layout margin); bottom distance 16px (derived: layout margin) |
| Width, medium+ (≥ 600px) | Shrink-to-fit; min 344px, max 672px (derived: MDC-web; keeps ~40–60 characters per line); margin 24px from edges; start-aligned or centered (choose one per app, never flush to an edge) |
| Full width | Only when the UI has no persistent navigation (app bar, nav bar); radius stays 4px |
| Z-order | Above page content, FABs, and docked toolbars; below sheets' scrims and modal dialogs (derived) |

**Placement relative to other bottom UI**
| Present at bottom | Snackbar bottom offset (derived values) |
| --- | --- |
| Nothing | 16px compact / 24px medium+ (+ `env(safe-area-inset-bottom)`) |
| Navigation bar | nav bar height + 16px — never in front of navigation |
| FAB (bottom-end) | FAB top edge + 16px (snackbar appears **above** the FAB, never in front of or behind it); FAB does not move |
| Docked toolbar | toolbar height + 16px (nudged upward) |
| Full-width snackbar + FAB | FAB may be pushed up by the snackbar height (source); apply as an instant layout offset, never as a coupled animation |
| Focused element would be fully covered (web) | Move or shrink the snackbar so the focused element stays visible |

### 4.3 Typography
| Text | Typescale |
| --- | --- |
| Supporting text | `md.sys.typescale.body-medium` → `--md-sys-typescale-body-medium-*` (14/20, 400, 0.25) |
| Action label | `md.sys.typescale.label-large` → `--md-sys-typescale-label-large-*` (14/20, 500, 0.1) |

Supporting text: max 2 lines (`-webkit-line-clamp: 2` as overflow guard, derived); medium+ aims for one line.

### 4.4 Elevation
- Container: `md.sys.elevation.level3` (6dp) → `--md-sys-elevation-level3`, shadow color `--md-sys-color-shadow` (elevation primitive). Doesn't change by state.

### 4.5 Component token list

**`md.comp.snackbar`**
```
container.color → md.sys.color.inverse-surface (#322f35)
container.shadow-color → md.sys.color.shadow (#000000)
container.elevation → md.sys.elevation.level3 (6dp)
container.shape → md.sys.shape.corner.extra-small (4dp)
with-single-line.container.height → 48dp
with-two-lines.container.height → 68dp
supporting-text.{font,line-height,size,tracking,weight} → md.sys.typescale.body-medium.* (Roboto, 20, 14, 0.25, 400)
supporting-text.type → body-medium
supporting-text.color → md.sys.color.inverse-on-surface (#f5eff7)
action.label-text.{font,line-height,size,tracking,weight} → md.sys.typescale.label-large.* (Roboto, 20, 14, 0.1, 500)
action.label-text.type → label-large
action.label-text.color → md.sys.color.inverse-primary (#d0bcff)
action.hover.label-text.color → md.sys.color.inverse-primary
action.hover.state-layer.color → md.sys.color.inverse-primary
action.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
action.focus.label-text.color → md.sys.color.inverse-primary
action.focus.state-layer.color → md.sys.color.inverse-primary
action.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
action.pressed.label-text.color → md.sys.color.inverse-primary
action.pressed.state-layer.color → md.sys.color.inverse-primary
action.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
icon.color → md.sys.color.inverse-on-surface (#f5eff7)
icon.size → 24dp
icon.hover.icon.color → md.sys.color.inverse-on-surface
icon.hover.state-layer.color → md.sys.color.inverse-on-surface
icon.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
icon.focus.icon.color → md.sys.color.inverse-on-surface
icon.focus.state-layer.color → md.sys.color.inverse-on-surface
icon.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
icon.pressed.icon.color → md.sys.color.inverse-on-surface
icon.pressed.state-layer.color → md.sys.color.inverse-on-surface
icon.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
```

## 5. States & interaction

| Part | Hover | Focus-visible | Pressed |
| --- | --- | --- | --- |
| Container | none (non-interactive) | – | – |
| Action | inverse-primary state layer 0.08 | state layer 0.10 + focus ring | state layer 0.10 + ripple |
| Close | inverse-on-surface state layer 0.08 | state layer 0.10 + focus ring | state layer 0.10 + ripple |

- **Action** → performs the action, dismisses (reason `action`).
- **Close** → dismisses (reason `close`).
- **Esc** while focus is inside → dismisses (reason `escape`), focus returns (§8).
- **Lifecycle:** queued → entering → visible → (timeout | action | close | escape | replaced | programmatic) → exiting → removed → next in queue.
- **Timer:** dismissive snackbars only; pauses while hovered, while focus is inside, and while `document.hidden` (derived, WCAG 2.2.1); resumes with the remaining time.

## 6. Motion & behavior

- **Appearing:** without warning; never blocks interaction with the page.
- **Auto-dismiss:** only without action, **4–10s** (default 4000ms on web, derived lower bound; clamp to 4000–10000). On web, auto-dismiss only when the same info is also shown inline (§8).
- **With action:** never auto-dismisses.
- **Queue:** FIFO, one at a time; never stacked or side by side. A snackbar with updated information may **immediately replace** an outdated one (same `key` → replace, skipping the queue).
- **Enter/exit values:** not in source. Decision (derived, guidelines "enter & exit within bounds": bottom elements expand upward, no scale/z-axis):
  - Enter: `clip-path: inset(100% 0 0 0 round 4px)` → `inset(0 round 4px)` with `--md-sys-motion-easing-emphasized-decelerate` over `--md-sys-motion-duration-medium1` (250ms); content opacity 0 → 1 via spring primitive `fast-effects` (≈150ms), starting 50ms later.
  - Exit: opacity 1 → 0, `--md-sys-motion-duration-short3` (150ms), `--md-sys-motion-easing-emphasized-accelerate`.
  - Replace: exit current, then enter next (no cross-fade).
- **Other components:** don't animate them with the snackbar (e.g. no FAB displacement animation).
- **Reduced motion:** opacity only, `--md-sys-motion-duration-short2` (100ms).
- **Responsive:** compact grows vertically 48 → 68px, fixed 16px from leading/trailing/bottom edges; medium+ grows horizontally (40–60 characters), aims for one line, flexible trailing distance; wide layouts start-aligned or centered consistently.

## 7. Usage guidelines

- **Text:** short, clear update tied to the process; one line when possible, two max on mobile; no icons (use a dialog), no bold/styled text, no inline links (use the action or another component).
- **Action:** at most **one** text button in colored text (e.g. "Undo"); never filled or elevated; "Dismiss"/"Cancel" usually unnecessary.
- **Container:** solid, opaque, with shadow; don't significantly alter the shape; widen in wide layouts.
- **Placement:** bottom, in front of main content; nudge up for FABs/docked toolbars; never in front of navigation or frequently used targets; above (never in front of/behind) FABs.
- **Full width** only without persistent navigation; may push up FABs.
- **Web keyboard users:** never fully obscure the focused element.

## 8. Accessibility

- **Use cases:** be alerted but not disrupted; move focus to an actionable snackbar; act on it with assistive technology.
- **Announcement (web mapping):** polite live region, never assertive. Keep a persistent, empty `role="status"` (`aria-live="polite"`, `aria-atomic="true"`) in the host and inject the message text (plus action label, e.g. "Email archived. Undo available, Alt+G" — derived) so screen readers reliably announce it. At app launch, announce after the page title (delay injection until after load).
- **Focus:** don't move focus automatically, don't trap focus. Provide a documented shortcut (default Alt+G, configurable) that moves focus to the action of a visible actionable snackbar. When the snackbar closes or focus leaves via Esc, return focus to the previously focused element; if gone, to the trigger; if gone, to the next logical element (e.g. `main`).
- **Timing (web requirement):** auto-dismiss alone is inaccessible — also show the info inline (e.g. "Save" → "Saved") **or** add an action (then no auto-dismiss).
- **Contrast:** keep the default inverse mapping.
- **Labels:** close button `aria-label="Close"` (or "Dismiss"); action label = visible text. Container gets `aria-label` only if a landmark name is needed (host: `<section aria-label="Notifications">`, derived).
- **Keyboard:**

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves between action and close; out of the snackbar freely |
| Enter / Space | Activates the focused action or close (web mapping) |
| Esc | Dismisses the snackbar when focus is in it |
| Alt+G (configurable) | Moves focus to the visible actionable snackbar (web) |

## 9. Implementation checklist

- [ ] Host/manager singleton per app (or per pane): FIFO queue, `key`-based replace, persistent live region.
- [ ] API: `show({ message, actionLabel?, onAction?, closable?, duration?, key? }) → { dismiss(reason), closed: Promise<reason> }`. Default duration 4000ms only without action; `Infinity` with action.
- [ ] Element props: `open`, `message`, `action-label`, `closable`, `timeout`, `long-action`, `align: start | center`, `full-width`.
- [ ] Events: `action`, `close` (detail.reason: `timeout | action | close | escape | replaced | programmatic`), `opened`, `closed`.
- [ ] Layout: 48 / 68px heights, 14px/16px text padding, 8px end padding, long action on third line, compact full-width minus 16px margins, medium+ 344–672px with 24px margins.
- [ ] Bottom offset API: `--md-snackbar-inset-block-end` set by scaffold (nav bar, FAB, docked toolbar, safe area).
- [ ] Styling: inverse-surface, 4px radius, level3, inverse-primary action + focus ring, inverse-on-surface close.
- [ ] Timers pause on hover/focus/hidden; queue advances on `closed`.
- [ ] Focus: no auto-focus/trap, shortcut, focus return, Esc.
- [ ] Forced colors, reduced motion, RTL (logical properties).

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<section class="md-snackbar-host" aria-label="Notifications">
  <div class="md-visually-hidden" role="status" aria-live="polite" aria-atomic="true"></div>
  <!-- inserted per message -->
  <div class="md-snackbar" part="container" data-lines="1">
    <div class="md-snackbar__text" part="supporting-text">Email archived</div>
    <div class="md-snackbar__actions" part="actions">
      <button class="md-snackbar__action" part="action" type="button">Undo</button>
      <button class="md-snackbar__close" part="close" type="button" aria-label="Close">
        <span class="md-icon" aria-hidden="true">close</span>
      </button>
    </div>
  </div>
</section>
```
The visible snackbar is not itself the live region (the hidden status region carries the announcement, so button labels aren't re-read and announcements are reliable). Add `.md-snackbar--long-action` to wrap actions to a third line.

**(b) Custom properties**
```css
.md-snackbar {
  --md-comp-snackbar-container-color: var(--md-sys-color-inverse-surface);
  --md-comp-snackbar-container-elevation: var(--md-sys-elevation-level3);
  --md-comp-snackbar-container-shape: var(--md-sys-shape-corner-extra-small);
  --md-comp-snackbar-with-single-line-container-height: 48px;
  --md-comp-snackbar-with-two-lines-container-height: 68px;
  --md-comp-snackbar-supporting-text-color: var(--md-sys-color-inverse-on-surface);
  --md-comp-snackbar-action-label-text-color: var(--md-sys-color-inverse-primary);
  --md-comp-snackbar-icon-color: var(--md-sys-color-inverse-on-surface);
  --md-comp-snackbar-icon-size: 24px;
}
```

**(c) Layout & states**
```css
.md-snackbar-host {
  position: fixed; z-index: 800; /* above content/FAB, below scrims & dialogs (derived) */
  inset-inline: 16px;
  inset-block-end: calc(var(--md-snackbar-inset-block-end, 16px) + env(safe-area-inset-bottom, 0px));
  display: flex; justify-content: center; pointer-events: none;
}
.md-snackbar {
  pointer-events: auto; box-sizing: border-box; inline-size: 100%;
  min-block-size: var(--md-comp-snackbar-with-single-line-container-height);
  display: flex; align-items: center; gap: 8px;
  padding-inline-end: 8px;
  background: var(--md-comp-snackbar-container-color);
  border-radius: var(--md-comp-snackbar-container-shape);
  box-shadow: var(--md-comp-snackbar-container-elevation); /* elevation primitive */
}
.md-snackbar:not(:has(.md-snackbar__actions > *)) { padding-inline-end: 0; }
.md-snackbar__text {
  flex: 1; min-inline-size: 0; padding: 14px 16px; padding-inline-end: 0;
  color: var(--md-comp-snackbar-supporting-text-color);
  font: var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size)/var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
}
.md-snackbar:not(:has(.md-snackbar__actions > *)) .md-snackbar__text { padding-inline-end: 16px; }
.md-snackbar__actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.md-snackbar__action { /* small text button: 40px, padding-inline 16px, full radius */
  block-size: 40px; padding-inline: 16px; border: 0; border-radius: var(--md-sys-shape-corner-full);
  background: transparent; color: var(--md-comp-snackbar-action-label-text-color);
  font: var(--md-sys-typescale-label-large-weight) var(--md-sys-typescale-label-large-size)/var(--md-sys-typescale-label-large-line-height) var(--md-sys-typescale-label-large-font);
  letter-spacing: var(--md-sys-typescale-label-large-tracking); white-space: nowrap;
  --_state-color: var(--md-sys-color-inverse-primary);
}
.md-snackbar__close { inline-size: 40px; block-size: 40px; border: 0; border-radius: var(--md-sys-shape-corner-full);
  background: transparent; color: var(--md-comp-snackbar-icon-color); font-size: var(--md-comp-snackbar-icon-size);
  --_state-color: var(--md-sys-color-inverse-on-surface); }
/* state layer primitive on both buttons, using --_state-color at hover 0.08 / focus 0.10 / pressed 0.10;
   touch target primitive (48×48); ripple primitive */
.md-snackbar :is(.md-snackbar__action, .md-snackbar__close):focus-visible {
  outline: var(--md-sys-state-focus-indicator-thickness) solid var(--md-sys-color-inverse-primary);
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
}
.md-snackbar--long-action { flex-wrap: wrap; padding-block-end: 4px; }
.md-snackbar--long-action .md-snackbar__text { flex-basis: 100%; padding: 14px 16px 4px; }
.md-snackbar--long-action .md-snackbar__actions { margin-inline-start: auto; }
@media (min-width: 600px) {
  .md-snackbar-host { inset-inline: 24px; inset-block-end: calc(var(--md-snackbar-inset-block-end, 24px) + env(safe-area-inset-bottom, 0px)); }
  .md-snackbar-host[data-align="start"] { justify-content: flex-start; }
  .md-snackbar { inline-size: auto; min-inline-size: 344px; max-inline-size: 672px; }
  .md-snackbar__text { -webkit-line-clamp: 2; }
}
.md-snackbar-host[data-full-width] { inset-inline: 0; inset-block-end: env(safe-area-inset-bottom, 0px); }
.md-snackbar-host[data-full-width] .md-snackbar { max-inline-size: none; inline-size: 100%; }
```

**(d) Motion**
```css
.md-snackbar { animation: md-snackbar-in var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized-decelerate) both; }
.md-snackbar > * { animation: md-snackbar-fade var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing) 50ms both; }
.md-snackbar[data-state="exiting"] { animation: md-snackbar-fade var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate) reverse both; }
@keyframes md-snackbar-in { from { clip-path: inset(100% 0 0 0 round 4px); } to { clip-path: inset(0 round 4px); } }
@keyframes md-snackbar-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .md-snackbar, .md-snackbar > * { animation: md-snackbar-fade var(--md-sys-motion-duration-short2) linear both; }
}
```
Note: `clip-path` clips the box-shadow during entry; drop the clip once the animation ends (`animationend` → remove), or animate a wrapper (derived).

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-snackbar { border: 1px solid CanvasText; background: Canvas; }
  .md-snackbar__text { color: CanvasText; }
  .md-snackbar__action, .md-snackbar__close { color: ButtonText; }
  .md-snackbar :focus-visible { outline-color: Highlight; }
}
```

**(f) Behaviour (JS)**
- `show()` pushes to the queue (or replaces the current one with the same `key`, reason `replaced`); if idle, render and write the message to the status region (clear, then set text on the next frame).
- Timer: `duration` only when no action; pause on `pointerenter`/`focusin`, resume on `pointerleave`/`focusout` (if not still inside) and `visibilitychange`.
- Before rendering, store `returnFocus = document.activeElement`. Global `keydown` (Alt+G, configurable) → focus the action (or close) of the visible actionable snackbar, storing the element focused at that moment as `returnFocus`.
- `keydown` Escape inside → dismiss. On dismiss, if focus was inside: focus `returnFocus` if `isConnected`, else the trigger, else `main`/first heading.
- Exit: set `data-state="exiting"`, wait for `animationend` (or timeout fallback), remove, advance the queue.
- While a modal `<dialog>` is open, hold the queue until it closes (content outside a modal dialog is inert) (derived).
- Layout offset: scaffold sets `--md-snackbar-inset-block-end` (nav bar height, FAB top, docked toolbar) — set instantly, no transition on the FAB.

## 11. Source gaps & decisions

- **Two-line height 68 (token) vs "48dp to 64dp" (guidelines):** use 68 — matches 14px padding + 2×20px lines.
- **Paddings, gaps, button sizes:** measurement image has no values → 14px block / 16px inline text padding, 8px end padding, 8px text–action gap, 4px action–close gap (MDC-derived, consistent with height tokens); action = small text button (40px), close = 40px icon button.
- **Margins / widths:** not in source → layout margins (16px compact, 24px medium+); width 344–672px on medium+ (MDC-web).
- **Offsets above FAB / nav bar / toolbar:** not in source → 16px above the obstructing element.
- **"Don't animate FAB" vs "full-width can push up FABs":** apply the push as an instant layout offset, never a coupled animation.
- **Enter/exit motion:** not in source → clip expand upward (emphasized decelerate 250ms) + fast-effects fade; exit fade 150ms; follows guidelines' within-bounds pattern (no scale).
- **Default timeout:** source gives 4–10s → 4000ms default, clamped 4000–10000ms; pause on hover/focus/hidden (WCAG 2.2.1).
- **Focus ring color:** guidelines' `secondary` fails contrast on inverse-surface → `inverse-primary`.
- **Live region:** separate hidden `role="status"` instead of making the visible snackbar live (reliable announcements, no re-reading of button labels).
- **Z-order vs modal dialogs:** not in source → below scrims/dialogs; queue holds while a modal dialog is open.
- **Shortcut:** Alt+G is the source's example → default but configurable (may conflict with app/AT shortcuts).
