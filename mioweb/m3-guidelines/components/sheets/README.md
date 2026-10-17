# Sheets (group overview)

> Source: https://m3.material.io/components/bottom-sheets and https://m3.material.io/components/side-sheets · M3 Expressive. Shared tokens: [../../guidelines.md](../../guidelines.md).

| Component | Spec file | Variants |
| --- | --- | --- |
| Bottom sheets | [bottom-sheets.md](bottom-sheets.md) | Standard, modal (mobile only); optional drag handle (48dp region) with preset heights; max width 640dp; 28dp top corners; modal initial height ≤ 50% |
| Side sheets | [side-sheets.md](side-sheets.md) | Standard, modal; docked (or 16dp-detached) on the end edge, usually right (left in RTL); 256dp default width, max 400dp; modal has 16dp inner corners; close affordance always required |

## Choosing

| Situation | Use |
| --- | --- |
| Compact / medium windows, supplementary content or action lists | Bottom sheet (modal as an alternative to menus or simple dialogs on mobile) |
| Expanded windows (tablet/desktop), contextual content that should stay visible next to the main content (filters, details, settings) | Standard side sheet |
| Same side-sheet content on compact windows | Modal side sheet |
| Bottom-sheet content on desktop | Side sheet with similar content |

Rules shared by both:

- Sheets hold **supplementary** content only — never the app's primary content.
- Modal sheets sit above a scrim (`scrim` @ 32%, level1 shadow, `surface-container-low`), render as native `<dialog>` + `showModal()` (web mapping), trap focus and are dismissed by scrim tap, Escape, a close/back action or (bottom sheet) dragging down; standard sheets coexist with the main UI and don't block it.
- Focus ring on all interactive parts: `secondary`, 3dp, 2dp outer offset (both token sets).
- Enter/exit = "beyond bounds" slide from the anchored edge, no bounce for open/close; scrim fades with an effects spring; reduced motion → fade only.
- Implement both on one internal "sheet" primitive (edge anchoring, modal/standard mode, scrim, focus management, enter/exit motion), parameterised by edge (bottom / inline-end) — derived.
