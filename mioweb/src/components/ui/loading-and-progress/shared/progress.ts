import { createEffect, onCleanup, onMount } from 'solid-js';
import {
  createFrameLoop,
  createSpring,
  easeEmphasizedAccelerate,
  easeStandard,
  prefersReducedMotion,
} from './motion';

/** Flat (default) or wavy active indicator; the track stays flat. */
export type ProgressShape = 'flat' | 'wavy';

/** Determinate progress in [0, 1], or undefined for indeterminate. */
export const progressFraction = (value: number | undefined, max: number | undefined) => {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  const m = max === undefined || max <= 0 ? 1 : max;
  return Math.min(1, Math.max(0, value / m));
};

/** progressbar ARIA (§8): a 0-100 value when determinate, no value when indeterminate. */
export const progressAria = (fraction: number | undefined, label: string | undefined) => ({
  role: 'progressbar' as const,
  'aria-label': label,
  'aria-valuemin': fraction === undefined ? undefined : 0,
  'aria-valuemax': fraction === undefined ? undefined : 100,
  'aria-valuenow': fraction === undefined ? undefined : Math.round(fraction * 100),
});

export type ProgressFrame = {
  indeterminate: boolean;
  /** Displayed determinate progress, animated with the progress spring. */
  progress: number;
  /** Wave amplitude factor, 0-1 (0 for flat). */
  amplitude: number;
  /** Wave clock in seconds; waves travel one wavelength per second. Frozen with reduced motion. */
  waveSeconds: number;
  /** Time since the indeterminate cycle started, in ms. */
  elapsed: number;
  reduced: boolean;
};

/* [Compose] values (progress-indicators.md §6.2), not md.sys.motion tokens. */
const PROGRESS_STIFFNESS = 50;
const PROGRESS_DAMPING = 1;
const AMPLITUDE_DURATION = 500; // --md-sys-motion-duration-long2

/**
 * Animation driver for the progress indicators: the determinate value spring
 * (50, ζ 1; jumps on mount and with reduced motion, and animates from 0 when
 * an indeterminate indicator becomes determinate), the wavy amplitude rule
 * (0 at ≤10% and ≥95%, 500ms standard up / emphasized accelerate down), the
 * wave clock and the indeterminate cycle clock. `measure` runs on resize and
 * when `deps` change; `draw` runs on every frame of the shared loop, which
 * stops once nothing moves.
 */
export const createProgressDriver = (o: {
  element: () => HTMLElement | undefined;
  fraction: () => number | undefined;
  wavy: () => boolean;
  deps: () => unknown;
  measure: (el: HTMLElement) => void;
  draw: (frame: ProgressFrame) => void;
}) => {
  const spring = createSpring(PROGRESS_STIFFNESS, PROGRESS_DAMPING);
  let first = true;
  let last: number | undefined;
  let indeterminateStart: number | undefined;
  let waveSeconds = 0;
  const amp = { value: 0, from: 0, to: 0, start: 0, set: false };

  const frame = (now: number) => {
    const dt = last === undefined ? 0 : now - last;
    last = now;
    const reduced = prefersReducedMotion();
    const fraction = o.fraction();
    const indeterminate = fraction === undefined;
    let moving = false;

    if (indeterminate) {
      spring.jump(0);
      indeterminateStart ??= now;
    } else {
      indeterminateStart = undefined;
      if (first || reduced) spring.jump(fraction);
      else {
        spring.state.target = fraction;
        moving = spring.step(dt);
      }
    }
    first = false;
    const progress = Math.min(1, Math.max(0, spring.state.value));

    const target = !o.wavy() ? 0 : indeterminate ? 1 : progress <= 0.1 || progress >= 0.95 ? 0 : 1;
    if (!amp.set || reduced) {
      amp.value = amp.from = amp.to = target;
      amp.set = true;
    } else if (target !== amp.to) {
      amp.from = amp.value;
      amp.to = target;
      amp.start = now;
    }
    if (amp.value !== amp.to) {
      const t = Math.min(1, (now - amp.start) / AMPLITUDE_DURATION);
      const ease = amp.to > amp.from ? easeStandard : easeEmphasizedAccelerate;
      amp.value = t >= 1 ? amp.to : amp.from + (amp.to - amp.from) * ease(t);
      moving = true;
    }

    if (amp.value > 0 && !reduced) {
      waveSeconds += dt / 1000;
      moving = true;
    }
    if (indeterminate) moving = true;

    o.draw({
      indeterminate,
      progress,
      amplitude: amp.value,
      waveSeconds,
      elapsed: indeterminate ? now - (indeterminateStart ?? now) : 0,
      reduced,
    });
    if (!moving) last = undefined;
    return moving;
  };

  const invalidate = createFrameLoop(o.element, frame);

  onMount(() => {
    const el = o.element();
    if (!el) return;
    const observer = new ResizeObserver(() => {
      o.measure(el);
      invalidate();
    });
    observer.observe(el);
    onCleanup(() => observer.disconnect());
  });

  createEffect(() => {
    o.deps();
    o.fraction();
    prefersReducedMotion();
    const el = o.element();
    if (el) o.measure(el);
    invalidate();
  });
};

/** A keyframe window of a cycle: 0 before `start`, 1 after `end`, eased in between. */
export const windowed = (t: number, start: number, end: number, ease: (x: number) => number) =>
  t <= start ? 0 : t >= end ? 1 : ease((t - start) / (end - start));
