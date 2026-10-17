import { createSignal, onCleanup, onMount, type Accessor } from 'solid-js';

/*
 * Motion helpers shared by the loading indicator and the progress
 * indicators. Their animations are driven from JS (shape morphs, waves,
 * multi-segment keyframes), so the easing curves below repeat the values of
 * the md.sys.motion easing tokens in motion.css.
 */

/** A CSS cubic-bezier(x1, y1, x2, y2) timing function, for t in [0, 1]. */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Bisection: monotonic in t because x1, x2 are in [0, 1].
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (bx(mid) < x) lo = mid;
      else hi = mid;
    }
    return by((lo + hi) / 2);
  };
};

/** --md-sys-motion-easing-standard */
export const easeStandard = cubicBezier(0.2, 0, 0, 1);
/** --md-sys-motion-easing-emphasized-accelerate */
export const easeEmphasizedAccelerate = cubicBezier(0.3, 0, 0.8, 0.15);
/** --md-sys-motion-easing-emphasized-decelerate */
export const easeEmphasizedDecelerate = cubicBezier(0.05, 0.7, 0.1, 1);

/**
 * Position of an underdamped spring from 0 to 1 at time t (seconds), unit
 * mass, starting at rest.
 */
export const springAt = (t: number, stiffness: number, damping: number) => {
  const w0 = Math.sqrt(stiffness);
  const wd = w0 * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w0 * t) * (Math.cos(wd * t) + ((damping * w0) / wd) * Math.sin(wd * t));
};

/**
 * A retargetable spring (semi-implicit Euler, ≤4ms sub-steps, velocity kept
 * when the target changes). `step` returns true while it's still moving.
 */
export const createSpring = (stiffness: number, damping: number, initial = 0) => {
  const c = 2 * damping * Math.sqrt(stiffness);
  const s = { value: initial, velocity: 0, target: initial };
  return {
    state: s,
    jump(to: number) {
      s.value = s.target = to;
      s.velocity = 0;
    },
    step(dtMs: number) {
      let left = Math.min(dtMs, 64) / 1000;
      while (left > 0) {
        const h = Math.min(left, 0.004);
        s.velocity += (-stiffness * (s.value - s.target) - c * s.velocity) * h;
        s.value += s.velocity * h;
        left -= h;
      }
      if (Math.abs(s.value - s.target) < 0.001 && Math.abs(s.velocity) < 0.01) {
        s.value = s.target;
        s.velocity = 0;
        return false;
      }
      return true;
    },
  };
};

/* ---- Reduced motion ---- */

let reducedMotion: Accessor<boolean> | undefined;

/** `prefers-reduced-motion: reduce`, shared by every instance and kept current. */
export const prefersReducedMotion = (): boolean => {
  if (!reducedMotion) {
    const mql = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    const [get, set] = createSignal(mql?.matches ?? false);
    mql?.addEventListener('change', (e) => set(e.matches));
    reducedMotion = get;
  }
  return reducedMotion();
};

/* ---- Shared frame loop ---- */

/** Draws one frame at `now` (rAF time, ms). Returns true to get another frame. */
export type FrameCallback = (now: number) => boolean;

const callbacks = new Set<FrameCallback>();
let frameId = 0;

const tick = (now: number) => {
  frameId = 0;
  for (const cb of [...callbacks]) {
    if (!cb(now)) callbacks.delete(cb);
  }
  if (callbacks.size > 0) frameId = requestAnimationFrame(tick);
};

/**
 * Runs `frame` on the shared requestAnimationFrame loop while the element is
 * on screen. The loop stops for an instance when `frame` returns false
 * (nothing is moving) or when the element leaves the viewport; call the
 * returned `invalidate` after a change that needs drawing (new props, a
 * resize). Hidden tabs get no frames from rAF, so they cost nothing.
 */
export const createFrameLoop = (element: () => Element | undefined, frame: FrameCallback) => {
  let onScreen = true;

  const invalidate = () => {
    if (!onScreen || callbacks.has(frame)) return;
    callbacks.add(frame);
    if (!frameId) frameId = requestAnimationFrame(tick);
  };

  onMount(() => {
    const el = element();
    if (el && typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver((entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        if (onScreen) invalidate();
        else callbacks.delete(frame);
      });
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    }
    invalidate();
  });
  onCleanup(() => callbacks.delete(frame));

  return invalidate;
};

/** Reads a length custom property (e.g. "4px") from computed style, in px. */
export const readPx = (style: CSSStyleDeclaration, name: string, fallback: number) => {
  const v = parseFloat(style.getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
};
