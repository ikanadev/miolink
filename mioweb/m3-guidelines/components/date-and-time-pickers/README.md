# Date & time pickers (group overview)

> Source: https://m3.material.io/components/date-pickers and https://m3.material.io/components/time-pickers · M3 Expressive. Shared tokens: [../../guidelines.md](../../guidelines.md).

| Component | Spec file | Variants |
| --- | --- | --- |
| Date pickers | [date-pickers.md](date-pickers.md) | Docked date picker, modal date picker (single / year view / full-screen range), modal date input; single date or range |
| Time pickers | [time-pickers.md](time-pickers.md) | Dial (clock face + time selector), input (keyboard only); 12h / 24h; vertical / horizontal |

## Choosing

| Need | Use |
| --- | --- |
| Near-term date on compact windows | Modal date picker (in a dialog; full-screen modal recommended) |
| Distant past/future date (e.g. date of birth) | Modal date input or docked date picker — not the modal date picker |
| Date on medium/expanded windows | Docked date picker (drop-down from a text field) |
| Hour/minute selection | Time picker (dial for touch, input for keyboard entry); not for granular values like milliseconds |

## Shared conventions (both files)

| Aspect | Date pickers | Time pickers |
| --- | --- | --- |
| Container | `surface-container-high`, level3; modal `corner.extra-large` 28dp, docked `corner.large` 16dp, full-screen range `corner.none` / level0 | `surface-container-high`, level3, `corner.extra-large` 28dp |
| Surface | Native `<dialog>` (modal) / `popover` anchored below the field (docked) | Native `<dialog>` |
| Selected emphasis | `primary` fill / `on-primary` (dates, years); range band `secondary-container` | `primary-container` (hour/minute box), `tertiary-container` (period), `primary` dial handle |
| Keyboard-entry mode | Edit (pencil) ↔ calendar icon button; docked text field always available | Keyboard ↔ clock icon button (action row start) |
| Commit model | Pending selection; **OK/Save** commits, **Cancel**/×/scrim/Escape discards | Same (**OK** / **Cancel** / scrim / Escape) |
| State layers | hover 0.08 / focus 0.10 / pressed 0.10 (state layer primitive); focus ring primitive | Same |
| Motion | Dialog enter/exit; spring primitive (no component spring tokens) | Same |
| Density | Not allowed (48dp targets) | Not allowed (swap orientation/variant instead) |

Shared rules: both are modal surfaces (dialog semantics, scrim, focus trap) except the docked date picker; both must allow switching to a pure keyboard-entry mode; neither has Expressive-specific shape morph or spring tokens. Both files end with §10 (HTML/CSS blueprint) and §11 (source gaps & decisions).
