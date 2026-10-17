import { splitProps, type Component, type JSX } from 'solid-js';
import { easeEmphasizedAccelerate, readPx } from '../shared/motion';
import {
  createProgressDriver,
  progressAria,
  progressFraction,
  windowed,
  withVars,
  type IndicatorColor,
  type ProgressFrame,
  type ProgressShape,
} from '../shared/progress';
import styles from './linear-progress.module.css';

export type LinearProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'color'> & {
  /** Progress between 0 and `max`. Omit for an indeterminate indicator. */
  value?: number;
  /** Default 1. */
  max?: number;
  /**
   * Accessible name: the process and what it affects ("Loading news
   * article"). Without it (or `aria-label` / `aria-labelledby`) the
   * indicator is decorative: `aria-hidden`, no progressbar role.
   */
  label?: string;
  /** Default `flat`. `wavy` raises the height to thickness + 2 × amplitude (10px). */
  shape?: ProgressShape;
  /** Active indicator and track thickness in px. Default 4. */
  thickness?: number;
  /** Show the track (and the stop indicator). Default true; remove it inside buttons. */
  track?: boolean;
  /** `current` draws the active indicator and stop in `currentColor`. Default `default`. */
  color?: IndicatorColor;
  /**
   * Dot at the trailing end (determinate only). Default true; remove it
   * only when the track has 3:1 contrast with everything around it.
   */
  stopIndicator?: boolean;
};

type Geometry = {
  width: number;
  height: number;
  active: number;
  track: number;
  gap: number;
  amplitude: number;
  wavelength: number;
  wavelengthIndeterminate: number;
  stopSize: number;
  stopSpace: number;
};

/* Compose ProgressIndicator.kt linear indeterminate cycle. */
const CYCLE = 1750;

type Span = [number, number];

/**
 * M3 linear progress indicator:
 * determinate or indeterminate, flat or wavy, configurable thickness, 4px
 * gap between the active indicator and the track, a stop indicator for
 * determinate progress, and a dot as soon as progress starts.
 *
 * Drawn in an SVG by the shared progress driver (web mapping: one renderer
 * for flat and wavy instead of the spec's CSS boxes for flat): the value
 * animates with the progress spring, the indeterminate cycle uses Compose's
 * two segments. Fills from the leading edge; mirrored in RTL. Not built on
 * Ark's Progress, whose parts assume a single range and set the
 * progressbar's accessible name to the value text.
 *
 * Spans its container's width (min 40px) with 4px end insets
 * (margin-inline); override with `class`.
 */
export const LinearProgress: Component<LinearProgressProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'max',
    'label',
    'shape',
    'thickness',
    'track',
    'stopIndicator',
    'color',
    'class',
    'style',
  ]);
  let root: HTMLDivElement | undefined;
  let svg: SVGSVGElement | undefined;
  let trackPath: SVGPathElement | undefined;
  let activePath: SVGPathElement | undefined;
  let stop: SVGCircleElement | undefined;
  const g: Geometry = {
    width: 0,
    height: 4,
    active: 4,
    track: 4,
    gap: 4,
    amplitude: 3,
    wavelength: 40,
    wavelengthIndeterminate: 20,
    stopSize: 4,
    stopSpace: 0,
  };

  const fraction = () => progressFraction(local.value, local.max);
  const wavy = () => local.shape === 'wavy';

  const measure = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    g.width = el.clientWidth;
    g.height = el.clientHeight;
    g.active = readPx(cs, '--_active-thickness', 4);
    g.track = readPx(cs, '--_track-thickness', 4);
    g.gap = readPx(cs, '--_gap', 4);
    g.amplitude = readPx(cs, '--_amplitude', 3);
    g.wavelength = readPx(cs, '--_wavelength', 40);
    g.wavelengthIndeterminate = readPx(cs, '--_wavelength-indeterminate', 20);
    g.stopSize = readPx(cs, '--_stop-size', 4);
    g.stopSpace = readPx(cs, '--_stop-trailing-space', 0);
    svg?.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`);
  };

  const draw = (f: ProgressFrame) => {
    if (!trackPath || !activePath || !stop) return;
    const caps = Math.max(g.active, g.track) / 2;
    const length = Math.max(0, g.width - 2 * caps);
    const x = (fr: number) => caps + fr * length;
    const cy = g.height / 2;
    // Centerline distance between an active end and a track end: the gap
    // plus both round caps.
    const gap = length > 0 ? (g.gap + (g.active + g.track) / 2) / length : 0;

    let active: Span[] = [];
    let track: Span[] = [];
    if (f.indeterminate) {
      const t = f.elapsed % CYCLE;
      const e = easeEmphasizedAccelerate;
      const segments: Span[] = [
        [windowed(t, 250, 1250, e), windowed(t, 0, 1000, e)],
        [windowed(t, 900, 1750, e), windowed(t, 650, 1500, e)],
      ];
      active = segments.filter(([tail, head]) => head - tail > 1e-4);
      // Track: what's left after each segment and its gaps.
      track = [[0, 1]];
      for (const [tail, head] of active) {
        track = track.flatMap(([a, b]): Span[] => [
          [a, Math.min(b, tail - gap)],
          [Math.max(a, head + gap), b],
        ]);
      }
    } else if (f.progress > 0) {
      active = [[0, f.progress]];
      track = [[f.progress + Math.min(f.progress, gap), 1]];
    } else {
      track = [[0, 1]];
    }
    track = track.filter(([a, b]) => b > a);

    trackPath.setAttribute('d', track.map(([a, b]) => `M${x(a)} ${cy}L${x(b)} ${cy}`).join(''));

    const amp = g.amplitude * f.amplitude;
    const wavelength = f.indeterminate ? g.wavelengthIndeterminate : g.wavelength;
    const phase = (f.waveSeconds * wavelength) % wavelength;
    activePath.setAttribute(
      'd',
      active
        .map(([a, b]) => {
          const x0 = x(a);
          const x1 = x(b);
          if (amp <= 0.01) return `M${x0} ${cy}L${x1} ${cy}`;
          const y = (px: number) => cy + amp * Math.sin((2 * Math.PI * (px - phase)) / wavelength);
          const steps = Math.max(1, Math.ceil((x1 - x0) / 2));
          let d = `M${x0} ${y(x0).toFixed(2)}`;
          for (let s = 1; s <= steps; s++) {
            const px = x0 + ((x1 - x0) * s) / steps;
            d += `L${px.toFixed(2)} ${y(px).toFixed(2)}`;
          }
          return d;
        })
        .join(''),
    );

    // Stop indicator: centered in the track's end cap, shrinking as the
    // active indicator reaches it.
    let r = 0;
    let cx = 0;
    if (!f.indeterminate && local.stopIndicator !== false) {
      const size = Math.min(g.stopSize, g.track);
      cx = g.width - size / 2 - Math.min((g.track - size) / 2, 6) - g.stopSpace;
      const head = f.progress > 0 ? x(f.progress) + g.active / 2 : 0;
      r = Math.max(0, size - Math.max(0, head - (cx - size / 2))) / 2;
    }
    stop.setAttribute('cx', String(cx));
    stop.setAttribute('cy', String(cy));
    stop.setAttribute('r', String(r));
  };

  createProgressDriver({
    element: () => root,
    fraction,
    wavy,
    deps: () => [local.shape, local.thickness, local.stopIndicator],
    measure,
    draw,
  });

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
        local.thickness
          ? { '--_active-thickness': `${local.thickness}px`, '--_track-thickness': `${local.thickness}px` }
          : {},
        local.style,
      )}
    >
      <svg ref={svg} class={styles.svg} aria-hidden="true">
        <path ref={trackPath} data-part="track" />
        <path ref={activePath} data-part="active" />
        <circle ref={stop} data-part="stop" r="0" />
      </svg>
    </div>
  );
};
