import { splitProps, type Component, type JSX } from 'solid-js';
import { easeEmphasizedDecelerate, easeStandard, readPx } from '../shared/motion';
import {
  createProgressDriver,
  progressAria,
  progressFraction,
  withVars,
  type IndicatorColor,
  type ProgressFrame,
  type ProgressShape,
} from '../shared/progress';
import styles from './circular-progress.module.css';

export type CircularProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'color'> & {
  /** Progress between 0 and `max`. Omit for an indeterminate indicator. */
  value?: number;
  /** Default 1. */
  max?: number;
  /**
   * Accessible name: the process and what it affects ("Refreshing page").
   * Without it (or `aria-label` / `aria-labelledby`) the indicator is
   * decorative: `aria-hidden`, no progressbar role (e.g. inside a busy
   * button that names the action).
   */
  label?: string;
  /** Default `flat`. Use flat at very small sizes (inside small buttons). */
  shape?: ProgressShape;
  /** Outer diameter in px, 24-240. Default 40 (flat) or 48 (wavy). */
  size?: number;
  /** Active indicator and track thickness in px. Default 4. */
  thickness?: number;
  /** Show the track. Default true; remove it inside buttons. */
  track?: boolean;
  /**
   * `current` draws the active indicator in `currentColor`, the button's
   * label or icon color (M3 in-button use, with `track={false}`). Default `default`.
   */
  color?: IndicatorColor;
};

type Geometry = {
  size: number;
  active: number;
  track: number;
  gap: number;
  amplitude: number;
  wavelength: number;
};

/* Compose ProgressIndicator.kt circular indeterminate cycle. */
const CYCLE = 6000;
const KICK_EVERY = 1500;
const KICK_DURATION = 300;
const SWEEP_MIN = 0.1;
const SWEEP_MAX = 0.87;

/**
 * M3 circular progress indicator:
 * determinate or indeterminate, flat or wavy, 24-240px, configurable
 * thickness, with a 4px gap between the active indicator and the track.
 * Fills clockwise from 12 o'clock and isn't mirrored in RTL.
 *
 * For short indeterminate waits prefer `LoadingIndicator`. The wavy shape's
 * amplitude and wavelength scale with the size (derived). Drawn in an SVG by
 * the shared progress driver. The circular indeterminate track is kept
 * (source: "a fixed track"); pass `track={false}` to match Compose.
 */
export const CircularProgress: Component<CircularProgressProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'max',
    'label',
    'shape',
    'size',
    'thickness',
    'track',
    'color',
    'class',
    'style',
  ]);
  let root: HTMLDivElement | undefined;
  let svg: SVGSVGElement | undefined;
  let trackPath: SVGPathElement | undefined;
  let activePath: SVGPathElement | undefined;
  const g: Geometry = { size: 40, active: 4, track: 4, gap: 4, amplitude: 1.6, wavelength: 15 };

  const fraction = () => progressFraction(local.value, local.max);
  const wavy = () => local.shape === 'wavy';

  const measure = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    g.size = el.clientWidth;
    g.active = readPx(cs, '--_active-thickness', 4);
    g.track = readPx(cs, '--_track-thickness', 4);
    g.gap = readPx(cs, '--_gap', 4);
    // The waveform keeps its proportions at any size (derived).
    const scale = g.size / 48;
    g.amplitude = readPx(cs, '--_amplitude', 1.6) * scale;
    g.wavelength = readPx(cs, '--_wavelength', 15) * scale;
    svg?.setAttribute('viewBox', `0 0 ${g.size} ${g.size}`);
  };

  const draw = (f: ProgressFrame) => {
    if (!trackPath || !activePath) return;
    const c = g.size / 2;
    const thickness = Math.max(g.active, g.track);
    const radius = Math.max(0, (g.size - thickness) / 2 - (wavy() ? g.amplitude : 0));
    if (radius <= 0) return;
    const toRad = Math.PI / 180;
    const point = (deg: number, r = radius) =>
      `${(c + r * Math.cos(deg * toRad)).toFixed(2)} ${(c + r * Math.sin(deg * toRad)).toFixed(2)}`;
    const arc = (from: number, sweep: number) => {
      if (sweep >= 359.99) return `M${point(from)}A${radius} ${radius} 0 1 1 ${point(from + 180)}A${radius} ${radius} 0 1 1 ${point(from)}`;
      if (sweep < 0.5) return `M${point(from)}L${point(from + sweep)}`;
      return `M${point(from)}A${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${point(from + sweep)}`;
    };

    // Rotation and sweep in degrees; 0° is 3 o'clock, so −90° starts at the top.
    let rotation = -90;
    let sweep = 0;
    if (f.indeterminate) {
      const t = f.elapsed % CYCLE;
      const kicks = Math.floor(t / KICK_EVERY);
      const kick = f.reduced
        ? 0
        : 90 * kicks + 90 * easeEmphasizedDecelerate(Math.min(1, (t - kicks * KICK_EVERY) / KICK_DURATION));
      rotation += (1080 * t) / CYCLE + kick;
      const half = CYCLE / 2;
      const s =
        t < half
          ? SWEEP_MIN + (SWEEP_MAX - SWEEP_MIN) * (t / half)
          : SWEEP_MAX - (SWEEP_MAX - SWEEP_MIN) * easeStandard((t - half) / half);
      sweep = s * 360;
    } else {
      sweep = f.progress * 360;
    }

    // Gap between the active and track ends along the ring: the gap plus
    // both round caps, as an angle; it shrinks near 0.
    const gapAngle = ((g.gap + (g.active + g.track) / 2) / (2 * Math.PI * radius)) * 360;
    const hasActive = f.indeterminate || f.progress > 0;
    const gap = hasActive ? Math.min(sweep, gapAngle) : 0;
    const trackSweep = 360 - sweep - 2 * gap;
    trackPath.setAttribute('d', trackSweep > 0 ? arc(rotation + sweep + gap, trackSweep) : '');

    if (!hasActive) {
      activePath.setAttribute('d', '');
      return;
    }
    const amp = g.amplitude * f.amplitude;
    if (amp <= 0.01) {
      activePath.setAttribute('d', arc(rotation, Math.max(0.1, sweep)));
      return;
    }
    // Wavy: r(θ) = R + A·sin(N·θ − φ) in the rotating frame, N whole waves
    // around the ring (min 5) so they close seamlessly, one wave per second.
    const waves = Math.max(5, Math.round((2 * Math.PI * radius) / g.wavelength));
    const phase = 2 * Math.PI * f.waveSeconds;
    // At least 12 segments per wave, and one per 2px of arc so large rings stay smooth.
    const steps = Math.max(1, Math.ceil((sweep / 360) * waves * 12), Math.ceil((sweep * toRad * radius) / 2));
    let d = '';
    for (let s = 0; s <= steps; s++) {
      const local = (sweep * s) / steps;
      const r = radius + amp * Math.sin(waves * local * toRad - phase);
      d += `${s === 0 ? 'M' : 'L'}${point(rotation + local, r)}`;
    }
    activePath.setAttribute('d', d);
  };

  createProgressDriver({
    element: () => root,
    fraction,
    wavy,
    deps: () => [local.shape, local.size, local.thickness],
    measure,
    draw,
  });

  const size = () => (local.size === undefined ? undefined : Math.min(240, Math.max(24, local.size)));

  return (
    <div
      {...rest}
      {...progressAria(fraction(), props)}
      ref={root}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-shape={local.shape ?? 'flat'}
      data-indeterminate={fraction() === undefined ? '' : undefined}
      data-no-track={local.track === false ? '' : undefined}
      data-color={local.color === 'current' ? 'current' : undefined}
      style={withVars(
        {
          ...(size() ? { '--_size': `${size()}px` } : {}),
          ...(local.thickness
            ? { '--_active-thickness': `${local.thickness}px`, '--_track-thickness': `${local.thickness}px` }
            : {}),
        },
        local.style,
      )}
    >
      <svg ref={svg} class={styles.svg} aria-hidden="true">
        <path ref={trackPath} data-part="track" />
        <path ref={activePath} data-part="active" />
      </svg>
    </div>
  );
};
