# Loading & progress (group overview)

> Source: https://m3.material.io/components/loading-indicator and https://m3.material.io/components/progress-indicators · M3 Expressive. Shared tokens: [../../guidelines.md](../../guidelines.md).

| Component | Spec file | Shows |
| --- | --- | --- |
| Loading indicator | [loading-indicator.md](loading-indicator.md) | Indeterminate activity through a looping shape-morph animation (contained or uncontained). New in M3 Expressive. |
| Progress indicators (linear, circular; flat or wavy) | [progress-indicators.md](progress-indicators.md) | Determinate or indeterminate status of a process. |

## Choosing

| Expected wait | Use |
| --- | --- |
| Instant (< 200ms) | No indicator |
| Short (200ms – 5s), indeterminate | Loading indicator — the recommended replacement for most indeterminate circular progress indicators; also pull-to-refresh and in-component loading (buttons, tabs) |
| Long (> 5s), or progress is measurable | Progress indicator (determinate when known; indeterminate → determinate as soon as information is available) |

Rules shared by both:

- Never morph a loading indicator into a progress indicator; for processes that become determinate, use an indeterminate → determinate progress indicator from the start.
- Never decorative; one indicator for a group's overall progress rather than one per item.
- Be consistent: the same process uses the same indicator type everywhere in the product.
- Neither source page gives motion values (shape sequence, keyframes, durations); both specs adopt the Jetpack Compose reference implementation's values, labelled **[Compose]**, and separate them from source facts.
- Both must expose their status to assistive technology (`role="progressbar"` with/without `aria-valuenow`, see each file) and respect `prefers-reduced-motion`.
