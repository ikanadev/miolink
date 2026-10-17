# Tooltips

> Source: https://m3.material.io/components/tooltips · M3 Expressive · values shown for baseline light scheme; see ../guidelines.md for the full token reference.

## 1. Overview

A tooltip adds brief context to a UI element.

- **Plain tooltip:** briefly labels or describes an element; best for elements with no text (icon-only buttons, icon-only fields).
- **Rich tooltip:** more context (definition, explanation, value of a new feature). Optional subhead, inline link, up to two text buttons.
- **Don't use:** a plain tooltip on an element that already has visible label text; a tooltip for critical information (e.g. destructive-action warning) — use a dialog.
- **Compared with M2:** new color mappings + dynamic color; rich tooltips have more rounded corners (12px).
- The source has no Expressive-specific changes; tooltips keep the M3 spec.

## 2. Variants & configurations

| Variant | Description | Configurations |
| --- | --- | --- |
| **Plain** (`md.comp.plain-tooltip`) | Small inverse-surface label | Single line of text |
| **Rich** (`md.comp.rich-tooltip`) | Surface card with optional subhead and actions | 1) subhead + text + 2 buttons; 2) subhead + text + 1 button; 3) subhead + text; 4) text + 1 button; 5) text + 2 buttons. Text may contain an inline link. |
| Rich, **transient** (default) | Shown on hover, focus, long-press, or when the parent becomes selected; hides automatically | – |
| Rich, **persistent** | Shown on click/tap of the parent, or on page load to introduce a feature | Stays until the user interacts with another UI element. Not triggered by hover. Avoid on icon buttons. |

## 3. Anatomy

Plain: 1. **Container** (inverse-surface, 4px corners) · 2. **Supporting text** (body-small, one line).

Rich: 1. **Subhead** (optional, title-small, one line) · 2. **Container** (surface-container, 12px corners, level2) · 3. **Supporting text** (body-medium, may include an inline link) · 4. **Text buttons** (optional, up to 2, side by side).

## 4. Tokens & specs

### 4.1 Color

**Plain**
| Part | Token | System role |
| --- | --- | --- |
| Container | plain-tooltip.container.color | `--md-sys-color-inverse-surface` (#322f35) |
| Supporting text | plain-tooltip.supporting-text.color | `--md-sys-color-inverse-on-surface` (#f5eff7) |

**Rich**
| Part | State | Token | System role |
| --- | --- | --- | --- |
| Container | – | rich-tooltip.container.color | `--md-sys-color-surface-container` (#f3edf7) |
| Shadow | – | rich-tooltip.container.shadow-color | `--md-sys-color-shadow` (#000000) |
| Subhead | – | rich-tooltip.subhead.color | `--md-sys-color-on-surface-variant` (#49454f) |
| Supporting text | – | rich-tooltip.supporting-text.color | `--md-sys-color-on-surface-variant` |
| Inline link | – | none | `--md-sys-color-primary`, underlined (derived: matches action color; underline so it isn't color-only) |
| Action label | enabled / hover / focus / pressed | rich-tooltip.action[.state].label-text.color | `--md-sys-color-primary` (#6750a4) |
| Action state layer | hover 0.08 / focus 0.10 / pressed 0.10 | rich-tooltip.action.{state}.state-layer.color | `--md-sys-color-primary` |
| Action disabled | – | none in source | text-button disabled spec: label `on-surface` @ 0.38 (derived: see buttons.md) |
| Action focus ring | – | none in source | focus ring primitive (`--md-sys-color-secondary`, 3px, outer offset 2px) |

### 4.2 Size, layout & shape

**Plain**
| Attribute | Value |
| --- | --- |
| Container height | 24px (`min-block-size`; single line) |
| Padding inline | 8px (source "Padding 8dp") |
| Padding block | 4px (derived: (24 − 16px line height) / 2) |
| Corner radius | 4px (`--md-sys-shape-corner-extra-small`) |
| Max width | 200px (derived: MDC-web plain tooltip; source only says "avoid wrapping") |
| Overflow | Content should fit one line; if it doesn't, wrap rather than truncate (derived: truncation would hide the accessible label) |

**Rich**
| Attribute | Value |
| --- | --- |
| Padding top | 12px |
| Padding bottom | 8px |
| Padding start / end | 16px |
| Corner radius | 12px (`--md-sys-shape-corner-medium`) |
| Max width | 320px (derived: MDC-web rich tooltip); min width none |
| Subhead → supporting text gap | 4px (derived) |
| Supporting text → actions gap | 4px (derived: the 40px button's internal space gives ~12px visual gap, matching top padding) |
| Bottom padding when no actions | 12px (derived: symmetric with top; the 8px bottom assumes a 40px button row) |
| Actions | Small text buttons (40px tall, 16px inline padding — see buttons.md), max 2, in a row with 8px gap (derived), start-aligned; row offset `margin-inline-start: -12px` (derived: label sits near the text column, state layer stays 4px inside the container). Never stack if avoidable. |
| Subhead overflow | One line; `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` (derived: source says never wrap) |

**Placement offsets**
| Variant | Default position | Gap | Notes |
| --- | --- | --- | --- |
| Plain | Directly **above**, centered | 4px if parent has a visual boundary (button); 8px if not (text, measured from baseline) | Inside an app bar: **below** at the same gap |
| Rich | **Bottom-end** (bottom-right in LTR, bottom-left in RTL) of the parent | 4px (derived: same as plain bounded parent) | Never covers the parent; shifts in **8px increments** to stay on screen, flipping to other corners if needed; on desktop may be centered below |
| Both | Viewport margin | 8px (derived: one dynamic-positioning increment) | – |

### 4.3 Typography
| Text | Typescale |
| --- | --- |
| Plain supporting text | `md.sys.typescale.body-small` → `--md-sys-typescale-body-small-*` (12/16, 400, 0.4) |
| Rich subhead | `md.sys.typescale.title-small` → `--md-sys-typescale-title-small-*` (14/20, 500, 0.1) |
| Rich supporting text | `md.sys.typescale.body-medium` → `--md-sys-typescale-body-medium-*` (14/20, 400, 0.25) |
| Rich action label | `md.sys.typescale.label-large` → `--md-sys-typescale-label-large-*` (14/20, 500, 0.1) |

### 4.4 Elevation
- Plain: no elevation token (level0; contrast comes from inverse colors).
- Rich: `md.sys.elevation.level2` (3dp) → `--md-sys-elevation-level2`, shadow color `md.sys.color.shadow` (elevation primitive).

### 4.5 Component token list

**`md.comp.plain-tooltip`**
```
container.color → md.sys.color.inverse-surface (#322f35)
container.shape → md.sys.shape.corner.extra-small (4dp)
supporting-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-small.* (Roboto, 16, 12, 400, 0.4)
supporting-text.type → body-small
supporting-text.color → md.sys.color.inverse-on-surface (#f5eff7)
```

**`md.comp.rich-tooltip`**
```
container.color → md.sys.color.surface-container (#f3edf7)
container.elevation → md.sys.elevation.level2 (3dp)
container.shadow-color → md.sys.color.shadow (#000000)
container.shape → md.sys.shape.corner.medium (12dp)
subhead.{font,line-height,size,weight,tracking} → md.sys.typescale.title-small.* (Roboto, 20, 14, 500, 0.1)
subhead.color → md.sys.color.on-surface-variant (#49454f)
supporting-text.{font,line-height,size,weight,tracking} → md.sys.typescale.body-medium.* (Roboto, 20, 14, 400, 0.25)
supporting-text.color → md.sys.color.on-surface-variant (#49454f)
action.label-text.{font,line-height,size,weight,tracking} → md.sys.typescale.label-large.* (Roboto, 20, 14, 500, 0.1)
action.label-text.color → md.sys.color.primary (#6750a4)
action.hover.label-text.color → md.sys.color.primary
action.hover.state-layer.color → md.sys.color.primary
action.hover.state-layer.opacity → md.sys.state.hover.state-layer-opacity (0.08)
action.focus.label-text.color → md.sys.color.primary
action.focus.state-layer.color → md.sys.color.primary
action.focus.state-layer.opacity → md.sys.state.focus.state-layer-opacity (0.1)
action.pressed.label-text.color → md.sys.color.primary
action.pressed.state-layer.color → md.sys.color.primary
action.pressed.state-layer.opacity → md.sys.state.pressed.state-layer-opacity (0.1)
```

## 5. States & interaction

| Trigger | Plain / rich transient | Rich persistent |
| --- | --- | --- |
| Pointer hover on parent (mouse/pen) | Show after show delay | – (hover never triggers) |
| Keyboard focus on parent (`:focus-visible`) | Show (no delay, derived) | – |
| Touch long-press on parent | Show; the press does not activate the parent (derived: platform long-press convention) | – |
| Parent becomes selected | Rich may show | – |
| Click / tap / Enter / Space on parent | – (activation hides an open plain tooltip, derived) | Toggle open |
| Page load (programmatic) | – | Open (include a subhead) |
| Pointer/focus leaves target region | Hide after **1.5s** | Stays open |
| Pointer re-enters region within 1.5s | Cancel the hide | – |
| Interaction with another UI element (click/focus outside) | Hide | Hide |
| Escape | Hide, focus unchanged (web mapping, WCAG 1.4.13) | Hide; if focus was inside, return it to the parent |
| Another tooltip opens | Hide immediately | Hide immediately |

- **Target region:** the parent; for rich tooltips also the tooltip itself plus the gap between them, so the pointer can reach actions.
- **One at a time:** a global manager closes the current tooltip when another opens.
- **Rich actions** follow text-button states: primary state layer 0.08 / 0.10 / 0.10 (state layer primitive), focus ring primitive.

## 6. Motion & behavior

- **Enter / exit:** the source gives no values. Guidelines "enter & exit within bounds" pattern applies (short fades, no z-axis motion). Decision (derived):
  - Plain: opacity 0 → 1 with spring primitive `fast-effects` (≈150ms, `--md-sys-motion-spring-fast-effects-easing`); exit opacity → 0 same curve.
  - Rich: opacity as plain + `scale: 1 0.8 → 1 1` along the block axis from the anchor-facing edge with `--md-sys-motion-easing-emphasized-decelerate` / `--md-sys-motion-duration-short4` (200ms); exit is opacity only, `--md-sys-motion-duration-short3` (150ms), `--md-sys-motion-easing-emphasized-accelerate`. No bouncy spatial spring (tooltips are a common transition).
- **Show delay:** not in source. 500ms hover (derived: MDC-web/Android long-press timeout); 0ms on keyboard focus; **warm-up**: if another tooltip was visible within the last 1.5s, show the next one immediately (derived).
- **Long-press threshold:** 500ms with ≤10px movement tolerance (derived: Android long-press timeout/touch slop); after release keep visible 1.5s.
- **Hide delay:** 1.5s after leaving the target region (source).
- **Dynamic positioning:** reposition in 8px steps to stay inside the viewport; never overlap the parent. Re-position on scroll/resize while open.
- **Reduced motion:** opacity only, ≤ `--md-sys-motion-duration-short2` (100ms), no scale.

## 7. Usage guidelines

- **Plain:** label icon-only buttons and fields ("Settings", "Present now"). Brief, one line, one piece of information (avoid name + email on separate lines). Don't duplicate a visible label.
- **Rich:** longer explanations, definitions, feature introductions.
- **Subhead:** brief, one line, never wraps, summarizes the message; include it when the tooltip appears automatically (page load).
- **Buttons:** up to 2 short text buttons relevant to the message, side by side.
- **No critical information** in tooltips — use an interruptive dialog.
- **Persistent rich:** explain features on page load or click; avoid on icon buttons.
- **Only one tooltip visible at a time.**

## 8. Accessibility

- **Use cases:** receive the tooltip message; activate a tooltip with a keyboard or switch.
- **Role:** tooltip container has the **Tooltip** role "or similar" (source).
- **Plain (web mapping):** `role="tooltip"` + `id`; parent references it with `aria-describedby`. For icon-only buttons with no other name, use `aria-labelledby` (the tooltip text *is* the name) — or set an equal `aria-label` and hide the tooltip from AT (`aria-hidden="true"`) to avoid double announcement. Never put interactive content in a plain tooltip.
- **Rich without interactive content:** `role="tooltip"`, referenced by `aria-describedby`.
- **Rich with link/buttons (web mapping):** `role="dialog"` non-modal (not `aria-modal`), `aria-labelledby` → subhead (or `aria-label`). Persistent: parent gets `aria-expanded` + `aria-controls` (or `popovertarget`, which sets them implicitly). Place the tooltip element right after the parent in the DOM so sequential focus is parent → inline link → text buttons; never trap focus.
- **Disabled parents:** native `disabled` buttons don't receive focus and may not fire pointer events; use `aria-disabled="true"` on parents that need a tooltip (derived).
- **WCAG 1.4.13:** dismissible (Escape), hoverable (pointer can move over the tooltip without it closing), persistent (stays until hover/focus leaves, user dismisses, or info is no longer valid).
- **Keyboard:**

| Key | Action |
| --- | --- |
| Tab | Moves focus to the tooltip's link/button, if any (next after the parent) |
| Space / Enter | Activates the focused element (opens a persistent rich tooltip from its parent, or activates an action) |
| Escape | Dismisses the tooltip (web mapping) |

## 9. Implementation checklist

- [ ] Properties: `variant: plain | rich`, `for` (anchor id), `persistent` (rich), `open`, `show-delay` (500ms), `hide-delay` (1500ms), `placement` (plain `top`, rich `bottom-end`), `offset` (4px / 8px), `in-app-bar` (forces plain `bottom`).
- [ ] Slots: `subhead`, default (supporting text, inline links allowed), `actions` (max 2 text buttons).
- [ ] Events: `open`, `close` (detail.reason: `pointerleave | blur | escape | outside | other-tooltip | activate | programmatic`).
- [ ] Singleton manager (one open tooltip; warm-up window).
- [ ] Triggers: pointerenter (mouse/pen) and focus-visible (transient), long-press (touch), click (persistent), programmatic.
- [ ] Rich hover region spans parent + gap + tooltip.
- [ ] Positioning in the top layer; flip and shift in 8px increments; never cover anchor; plain below in app bars; RTL mirrors `bottom-end`.
- [ ] Plain: 24px min height, 8px inline / 4px block padding, 4px radius, inverse colors, max 200px.
- [ ] Rich: padding 12 / 16 / 8 / 16 (top / inline / bottom), 12px radius, level2, max 320px.
- [ ] ARIA wiring, Escape, no focus trap, forced-colors, reduced motion.

## 10. HTML/CSS implementation blueprint

**(a) DOM**
```html
<!-- Plain: labels an icon button -->
<button class="md-icon-button" aria-labelledby="tt1" id="b1">…icon…</button>
<div class="md-tooltip md-tooltip--plain" id="tt1" role="tooltip" popover="manual" data-for="b1">Settings</div>

<!-- Rich, transient, no actions -->
<button aria-describedby="tt2" id="b2">Storage</button>
<div class="md-tooltip md-tooltip--rich" id="tt2" role="tooltip" popover="manual" data-for="b2">
  <p part="supporting-text" class="md-tooltip__text">Includes photos and files.</p>
</div>

<!-- Rich, persistent, with actions (DOM-adjacent to its parent) -->
<button id="b3" popovertarget="tt3">Share</button>
<div class="md-tooltip md-tooltip--rich" id="tt3" role="dialog" aria-labelledby="tt3-h" popover="auto" data-for="b3">
  <h2 part="subhead" class="md-tooltip__subhead" id="tt3-h">New: sharing</h2>
  <p part="supporting-text" class="md-tooltip__text">Share albums with anyone. <a href="…">Learn more</a></p>
  <div part="actions" class="md-tooltip__actions">
    <button class="md-button md-button--text md-button--small">Got it</button>
    <button class="md-button md-button--text md-button--small">Try it</button>
  </div>
</div>
```
`popover="manual"` for transient (or `popover="hint"` where supported), `popover="auto"` for persistent (gives light dismiss + Escape + top layer). Heading level of the subhead is contextual (or use `<p>` with an id).

**(b) Custom properties**
```css
.md-tooltip--plain {
  --md-comp-plain-tooltip-container-color: var(--md-sys-color-inverse-surface);
  --md-comp-plain-tooltip-container-shape: var(--md-sys-shape-corner-extra-small);
  --md-comp-plain-tooltip-supporting-text-color: var(--md-sys-color-inverse-on-surface);
  --_offset: 4px; /* 8px for unbounded (text) anchors */
}
.md-tooltip--rich {
  --md-comp-rich-tooltip-container-color: var(--md-sys-color-surface-container);
  --md-comp-rich-tooltip-container-shape: var(--md-sys-shape-corner-medium);
  --md-comp-rich-tooltip-container-elevation: var(--md-sys-elevation-level2);
  --md-comp-rich-tooltip-subhead-color: var(--md-sys-color-on-surface-variant);
  --md-comp-rich-tooltip-supporting-text-color: var(--md-sys-color-on-surface-variant);
  --md-comp-rich-tooltip-action-label-text-color: var(--md-sys-color-primary);
  --_offset: 4px;
}
```

**(c) Base styles & states**
```css
.md-tooltip { margin: 0; border: 0; inset: auto; position: fixed; overflow: visible; }
.md-tooltip--plain {
  box-sizing: border-box; min-block-size: 24px; max-inline-size: 200px;
  padding: 4px 8px;
  background: var(--md-comp-plain-tooltip-container-color);
  color: var(--md-comp-plain-tooltip-supporting-text-color);
  border-radius: var(--md-comp-plain-tooltip-container-shape);
  font: var(--md-sys-typescale-body-small-weight) var(--md-sys-typescale-body-small-size)/var(--md-sys-typescale-body-small-line-height) var(--md-sys-typescale-body-small-font);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
  pointer-events: none; /* plain is not hoverable-interactive; region = anchor */
}
.md-tooltip--rich {
  box-sizing: border-box; max-inline-size: 320px;
  padding: 12px 16px 8px;
  display: flex; flex-direction: column; gap: 4px;
  background: var(--md-comp-rich-tooltip-container-color);
  border-radius: var(--md-comp-rich-tooltip-container-shape);
  box-shadow: var(--md-comp-rich-tooltip-container-elevation); /* elevation primitive */
}
.md-tooltip--rich:not(:has(.md-tooltip__actions)) { padding-block-end: 12px; }
.md-tooltip__subhead { margin: 0; color: var(--md-comp-rich-tooltip-subhead-color);
  font: var(--md-sys-typescale-title-small-weight) var(--md-sys-typescale-title-small-size)/var(--md-sys-typescale-title-small-line-height) var(--md-sys-typescale-title-small-font);
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.md-tooltip__text { margin: 0; color: var(--md-comp-rich-tooltip-supporting-text-color);
  font: var(--md-sys-typescale-body-medium-weight) var(--md-sys-typescale-body-medium-size)/var(--md-sys-typescale-body-medium-line-height) var(--md-sys-typescale-body-medium-font);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking); }
.md-tooltip__text a { color: var(--md-sys-color-primary); text-decoration: underline; }
.md-tooltip__actions { display: flex; gap: 8px; margin-inline-start: -12px; }
/* Hover bridge across the gap so the pointer can reach the rich tooltip */
.md-tooltip--rich::before { content: ""; position: absolute; inset-inline: 0; block-size: var(--_offset); inset-block-end: 100%; }
.md-tooltip--rich[data-side="top"]::before { inset-block: 100% auto; }
```
Action buttons use the text-button styles (state layer primitive with `--md-sys-color-primary` at hover/focus/pressed opacities, focus ring primitive, ripple primitive).

**Positioning** — CSS anchor positioning where supported, JS fallback otherwise:
```css
.md-tooltip--plain { position-area: block-start; margin-block-end: var(--_offset);
  position-try-fallbacks: flip-block, --shift; }
.md-tooltip--plain[data-in-app-bar] { position-area: block-end; margin-block: var(--_offset) 0; }
.md-tooltip--rich { position-area: block-end span-inline-end; margin-block-start: var(--_offset);
  position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline; }
```
JS sets `anchor-name`/`position-anchor` from `data-for`. Fallback (no `anchor-name` support): on open/scroll/resize compute anchor rect, place per §4.2, then clamp to the viewport minus 8px margins, rounding each shift to a multiple of 8px; if still overlapping the anchor, flip side. Set `data-side` for the bridge.

**(d) Motion**
```css
.md-tooltip { opacity: 0; transition: opacity var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
  scale var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized-decelerate),
  overlay var(--md-sys-motion-duration-short3) allow-discrete, display var(--md-sys-motion-duration-short3) allow-discrete; }
.md-tooltip:popover-open { opacity: 1; }
@starting-style { .md-tooltip:popover-open { opacity: 0; } .md-tooltip--rich:popover-open { scale: 1 0.8; } }
.md-tooltip--rich { transform-origin: top; } .md-tooltip--rich[data-side="top"] { transform-origin: bottom; }
@media (prefers-reduced-motion: reduce) {
  .md-tooltip { transition: opacity var(--md-sys-motion-duration-short2) linear, overlay var(--md-sys-motion-duration-short2) allow-discrete, display var(--md-sys-motion-duration-short2) allow-discrete; }
  @starting-style { .md-tooltip--rich:popover-open { scale: none; } }
}
```

**(e) Forced colors**
```css
@media (forced-colors: active) {
  .md-tooltip { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }
  .md-tooltip__subhead, .md-tooltip__text { color: CanvasText; }
  .md-tooltip__text a { color: LinkText; }
}
```

**(f) Behaviour (JS)**
- Manager: `current` tooltip, `lastHiddenAt`; `open()` hides `current` first; warm-up if `now - lastHiddenAt < 1500`.
- Anchor listeners: `pointerenter` (`pointerType !== 'touch'`) → schedule show (500ms, 0 in warm-up); `pointerleave` → schedule hide 1500ms; `focusin` with `:focus-visible` → show; `focusout` (relatedTarget outside anchor+tooltip) → hide after 1500ms; `keydown Escape` on document while open → hide, `preventDefault` only if it closed something.
- Rich: `pointerenter` on tooltip cancels the hide; `pointerleave` re-schedules it; `focusin` inside keeps it open.
- Touch: `pointerdown` (touch) starts 500ms timer, cancel on move >10px / `pointerup` / `pointercancel`; when it fires, show, set a flag to swallow the next `click` (capture phase), and `contextmenu` `preventDefault`; anchor gets `-webkit-touch-callout: none; user-select: none` (icon buttons only).
- Persistent: `popovertarget` toggles; `popover="auto"` closes on outside interaction/Escape; on page-load intro call `showPopover()` after layout.
- Activation (`click`) of the anchor hides an open transient plain tooltip.
- Maintain ARIA: `aria-describedby`/`aria-labelledby` on the anchor; `aria-expanded` mirrors the persistent tooltip's `toggle` event.

## 11. Source gaps & decisions

- **Show delay, long-press timeout, warm-up:** not in source → 500ms hover, 0 on focus, 500ms long-press, 1.5s warm-up (MDC-web / Android conventions).
- **Enter/exit motion:** not in source → fade with fast-effects spring; rich adds a short block-axis expand (emphasized decelerate 200ms); no bouncy springs per guidelines "common transitions" rule.
- **Plain vertical padding:** source gives only "Padding 8dp" → treated as inline; 4px block derived from 24px height − 16px line height.
- **Max widths (200 / 320px), internal gaps (4px), action-row offset and gap (−12px / 8px), rich gap to anchor (4px), viewport margin (8px), 12px bottom padding without actions:** not in source → derived (MDC-web values or visual balance).
- **Plain overflow:** source says avoid wrapping → wrap as fallback instead of truncate, since the text is often the accessible name.
- **Disabled action / inline link colors:** no tokens → text-button disabled spec; link = primary + underline.
- **Rich role with actions:** source says "Tooltip role, or similar"; ARIA `tooltip` must not contain focusable content → non-modal `dialog` for rich tooltips with actions.
- **Persistent dismissal "interacts with another UI element":** mapped to `popover="auto"` light dismiss (outside click) + Escape.
- **Rich "bottom right" default:** interpreted as bottom-end so it mirrors in RTL.
- **Escape key:** not in source keyboard table → added for WCAG 1.4.13.
