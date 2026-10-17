import { createEffect, on, splitProps, type Component, type JSX } from 'solid-js';
import { createFrameLoop, prefersReducedMotion, springAt } from '../shared/motion';
import { progressAria, withVars, type IndicatorColor } from '../shared/progress';
import { morphPath } from './shapes';
import styles from './loading-indicator.module.css';

export type LoadingIndicatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'color'> & {
  /**
   * Accessible name describing what is loading ("Loading news article",
   * "Refreshing page"). Without it (or `aria-label` / `aria-labelledby`)
   * the indicator is decorative: `aria-hidden`, no progressbar role. Omit
   * it only when the indicator sits inside a control that already says
   * it's busy.
   */
  label?: string;
  /** Circular primary-container container, for use over other content. Default false. */
  contained?: boolean;
  /** Box size in px, 24-240. Default 48; the shape is 38/48 of it. */
  size?: number;
  /** Stops the animation (the indicator stays on its current frame). */
  paused?: boolean;
  /**
   * `current` draws the shape in `currentColor`, the label or icon color
   * of the button it sits in. Default `default`.
   */
  color?: IndicatorColor;
};

const SHAPES = 7;
/* Compose LoadingIndicator.kt values, not md.sys.motion tokens. */
const MORPH_INTERVAL = 650;
const MORPH_STIFFNESS = 200;
const MORPH_DAMPING = 0.6;
const ROTATION_PERIOD = 4666;

/**
 * M3 Expressive loading indicator: a
 * shape that keeps morphing through seven Material shapes while turning, for
 * short indeterminate waits (200ms-5s). Default (uncontained) or contained;
 * 24-240px.
 *
 * Exposed as an indeterminate progressbar (no value) when named, decorative
 * otherwise. The morph runs on one shared requestAnimationFrame loop and
 * stops while the indicator is off screen or `paused`. With reduced motion
 * it holds the first shape and only spins slowly (CSS). Inside a button use
 * `color="current"`.
 */
export const LoadingIndicator: Component<LoadingIndicatorProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'contained', 'size', 'paused', 'color', 'class', 'style']);
  let root: HTMLDivElement | undefined;
  let path: SVGPathElement | undefined;
  let start: number | undefined;
  let pausedAt: number | undefined;

  const reduced = () => prefersReducedMotion();

  const draw = (elapsed: number) => {
    if (!path) return;
    if (reduced()) {
      path.setAttribute('d', morphPath(0, 0, 0, 0));
      return;
    }
    const morph = Math.floor(elapsed / MORPH_INTERVAL);
    const p = springAt((elapsed - morph * MORPH_INTERVAL) / 1000, MORPH_STIFFNESS, MORPH_DAMPING);
    // θ = 90·p + base + g: a quarter turn per morph on top of a linear spin.
    const base = 90 + 90 * morph;
    const global = (360 * (elapsed % ROTATION_PERIOD)) / ROTATION_PERIOD;
    path.setAttribute('d', morphPath(morph % SHAPES, (morph + 1) % SHAPES, p, (90 * p + base + global) % 360));
  };

  const invalidate = createFrameLoop(
    () => root,
    (now) => {
      if (local.paused || reduced()) {
        draw(pausedAt ?? 0);
        return false;
      }
      if (start === undefined) start = now - (pausedAt ?? 0);
      pausedAt = undefined;
      draw(now - start);
      return true;
    },
  );

  createEffect(
    on([() => local.paused, reduced], ([paused]) => {
      if (paused && start !== undefined && pausedAt === undefined) {
        pausedAt = performance.now() - start;
        start = undefined;
      }
      invalidate();
    }),
  );

  const size = () => (local.size === undefined ? undefined : Math.min(240, Math.max(24, local.size)));

  return (
    <div
      {...rest}
      ref={root}
      {...progressAria(undefined, props)}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-contained={local.contained ? '' : undefined}
      data-reduced={reduced() ? '' : undefined}
      data-paused={local.paused ? '' : undefined}
      data-color={local.color === 'current' ? 'current' : undefined}
      style={withVars(size() ? { '--_size': `${size()}px` } : {}, local.style)}
    >
      <svg class={styles.indicator} viewBox="0 0 100 100" aria-hidden="true">
        <path ref={path} class={styles.shape} />
      </svg>
    </div>
  );
};
