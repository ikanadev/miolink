/*
 * Keyline layout engine for the multi-browse and hero carousel layouts
 * (derived from the Material Components Android / Compose carousel
 * strategies).
 *
 * Every item has an "unadjusted" position: where its center would be if all
 * items were large and laid out in a row (`base + i * step - p`). A keyline
 * state is a list of slots (center + width) across the container; an item
 * between two keylines takes the interpolated center and width. As the
 * scroll offset `p` grows, the state moves from `start` (large items first)
 * to `end` (large items last), through `middle` (large items centered) for
 * center alignment.
 *
 * One change from the spec's literal steps 4-5 (derived): each state also
 * records `u0`, the unadjusted offset of its first keyline, chosen so that
 * the state's focal (large) keylines sit where a large item would be. The
 * scroll range and the transitions follow from it: `P` puts the last item on
 * the end state's last focal keyline, and each transition lasts as long as
 * the focal range takes to move. With the spec's fixed offsets, the items
 * scrolled during the end transition (the middle item of a 3-item carousel,
 * for example) never became large.
 */

/** Small item width range (spec: 40-56dp). */
export const SMALL_MIN = 40;
export const SMALL_MAX = 56;

export type KeylineKind = 'multi-browse' | 'hero';
export type ItemSize = 'large' | 'medium' | 'small';

export interface Arrangement {
  /** Large, medium and small slot counts. */
  l: number;
  m: number;
  s: number;
  /** Slot widths in px (M, S are 0 when there are none). */
  L: number;
  M: number;
  S: number;
}

export interface Keyline {
  c: number;
  w: number;
}

export interface KeylineState {
  /** k slots plus one anchor before and after, outside the container. */
  lines: Keyline[];
  /** Unadjusted offset of keyline 0 (lines[1]). Keyline j is at u0 + j * step. */
  u0: number;
  /** Index (0-based, without the anchor) of the first focal keyline. */
  focal: number;
}

interface Stop {
  p: number;
  state: KeylineState;
}

interface Region {
  from: number;
  to: number;
  state: KeylineState;
}

export interface KeylineModel {
  arrangement: Arrangement;
  /** Large item width: the visual's width inside every mask (parallax). */
  L: number;
  step: number;
  /** Maximum scroll offset. */
  P: number;
  /** Unadjusted center of item 0 at p = 0. */
  base: number;
  stops: Stop[];
  /** Scroll ranges where a state holds still; snap targets live here. */
  regions: Region[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const repeat = (w: number, count: number) => Array.from({ length: count }, () => w);

/** Steps 1-3: pick slot counts and sizes for the available width W. */
export const arrange = (
  W: number,
  g: number,
  Lmax: number,
  n: number,
  kind: KeylineKind,
  center: boolean,
): Arrangement => {
  const Lt = clamp(Lmax, 1, W);
  const St = clamp(Lt / 3, SMALL_MIN, SMALL_MAX);
  const Mt = (Lt + St) / 2;

  // n large items at the target size (or one item filling a narrow container).
  const allLarge = (): Arrangement => {
    const l = Math.max(1, Math.min(n, Math.floor((W + g) / (Lt + g))));
    return { l, m: 0, s: 0, L: Lt, M: 0, S: 0 };
  };
  if (W < Lt + g + SMALL_MIN) return allLarge();

  const s = center ? 2 : 1;
  const mOptions = kind === 'hero' ? [0] : center ? [2, 0] : [1, 0];
  const lMin = Math.max(1, Math.floor((W - s * (St + g) - mOptions[0] * (Mt + g)) / (Lt + g)));
  const lMax = Math.max(lMin, Math.ceil(W / (Lt + g)));

  let best: Arrangement | undefined;
  let bestCost = Infinity;
  for (let l = lMin; l <= lMax && l < n; l++) {
    for (const m of mOptions) {
      const k = l + m + s;
      // Slots without items would leave the last item unable to grow.
      if (k > n) continue;
      const A = W - (k - 1) * g;
      const L0 = (A - m * Mt - s * St) / l;
      const E = (L0 - Lt) * l;
      const S = clamp(St + E / s, SMALL_MIN, SMALL_MAX);
      const E2 = E - s * (S - St);
      const M = m ? clamp(Mt + E2 / m, 0.9 * Mt, 1.1 * Mt) : 0;
      const L = (A - m * M - s * S) / l;
      // L >= 2 * SMALL_MAX: legibility floor (derived, from the spec).
      const valid = L >= 2 * SMALL_MAX && S < L && (m === 0 || (S < M && M < L));
      if (!valid) continue;
      const cost = Math.abs(L - Lt);
      if (cost < bestCost - 0.5 || (Math.abs(cost - bestCost) <= 0.5 && best && l > best.l)) {
        best = { l, m, s, L, M, S };
        bestCost = Math.min(cost, bestCost);
      }
    }
  }
  return best ?? allLarge();
};

export interface ModelInput {
  /** Container inline size. */
  Wc: number;
  /** Leading / trailing padding. */
  ps: number;
  pe: number;
  gap: number;
  /** Large item max width. */
  Lmax: number;
  /** Item count. */
  n: number;
  kind: KeylineKind;
  center: boolean;
}

/** Steps 4-5: keyline states and the scroll range. */
export const buildModel = (input: ModelInput): KeylineModel | undefined => {
  const { Wc, ps, pe, gap: g, Lmax, n, kind, center } = input;
  const W = Wc - ps - pe;
  if (W <= 0 || n === 0) return undefined;

  const arrangement = arrange(W, g, Lmax, n, kind, center);
  const { l, m, s, L, M, S } = arrangement;
  const k = l + m + s;
  const step = L + g;
  const anchor = S || SMALL_MIN;

  const build = (sizes: number[], focal: number): KeylineState => {
    const lines: Keyline[] = [{ c: -(g + anchor / 2), w: anchor }];
    let x = ps;
    for (const w of sizes) {
      lines.push({ c: x + w / 2, w });
      x += w + g;
    }
    lines.push({ c: Wc + g + anchor / 2, w: anchor });
    return { lines, u0: lines[focal + 1].c - focal * step, focal };
  };

  const startSizes = [...repeat(L, l), ...repeat(M, m), ...repeat(S, s)];
  const start = build(startSizes, 0);
  const end = build([...startSizes].reverse(), k - l);
  const base = ps + L / 2;
  // At P the last item sits on the end state's last focal keyline (j = k - 1).
  const P = Math.max(0, base + (n - 1) * step - (end.u0 + (k - 1) * step));

  let stops: Stop[];
  if (P === 0) {
    stops = [{ p: 0, state: start }];
  } else if (!center) {
    const D = Math.max(0, start.u0 - end.u0);
    const a = Math.max(0, P - D);
    stops = [
      { p: 0, state: start },
      { p: a, state: start },
      { p: P, state: end },
    ];
  } else {
    const middle = build(
      [...repeat(S, s / 2), ...repeat(M, m / 2), ...repeat(L, l), ...repeat(M, m / 2), ...repeat(S, s / 2)],
      s / 2 + m / 2,
    );
    let D1 = Math.max(0, start.u0 - middle.u0);
    let D2 = Math.max(0, middle.u0 - end.u0);
    if (D1 + D2 > P) {
      const f = P / (D1 + D2);
      D1 *= f;
      D2 *= f;
    }
    stops = [
      { p: 0, state: start },
      { p: D1, state: middle },
      { p: P - D2, state: middle },
      { p: P, state: end },
    ];
  }

  const regions: Region[] = [];
  for (let i = 0; i < stops.length; i++) {
    const last = regions[regions.length - 1];
    if (last && last.state === stops[i].state) last.to = stops[i].p;
    else regions.push({ from: stops[i].p, to: stops[i].p, state: stops[i].state });
  }

  return { arrangement, L, step, P, base, stops, regions };
};

const lerpState = (a: KeylineState, b: KeylineState, t: number): KeylineState => ({
  lines: a.lines.map((line, i) => ({ c: lerp(line.c, b.lines[i].c, t), w: lerp(line.w, b.lines[i].w, t) })),
  u0: lerp(a.u0, b.u0, t),
  focal: t < 0.5 ? a.focal : b.focal,
});

/** The keyline state at scroll offset p (step 5). */
export const stateAt = (model: KeylineModel, p: number): KeylineState => {
  const { stops } = model;
  if (p <= stops[0].p) return stops[0].state;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    if (p <= b.p) {
      if (a.state === b.state || b.p === a.p) return b.state;
      return lerpState(a.state, b.state, (p - a.p) / (b.p - a.p));
    }
  }
  return stops[stops.length - 1].state;
};

export interface Placement {
  /** Inline-start edge in container coordinates. */
  x: number;
  w: number;
  /** Past the anchors, outside the container. */
  offscreen: boolean;
}

/** Step 6: where item i goes at offset p. */
export const placeItem = (model: KeylineModel, state: KeylineState, i: number, p: number): Placement => {
  const { lines } = state;
  const last = lines.length - 1;
  const u = model.base + i * model.step - p;
  // Continuous index into `lines` (0 is the leading anchor).
  const q = (u - state.u0) / model.step + 1;
  if (q <= 0 || q >= last) {
    const line = q <= 0 ? lines[0] : lines[last];
    const extra = (q <= 0 ? q : q - last) * model.step;
    return { x: line.c - line.w / 2 + extra, w: line.w, offscreen: true };
  }
  const j = Math.floor(q);
  const t = q - j;
  const c = lerp(lines[j].c, lines[j + 1].c, t);
  const w = lerp(lines[j].w, lines[j + 1].w, t);
  return { x: c - w / 2, w, offscreen: false };
};

/** Size class from the item's current width (drives the text). */
export const sizeClass = (model: KeylineModel, w: number): ItemSize => {
  const { L, M, S, m, s } = model.arrangement;
  if (s === 0) return 'large';
  if (m === 0) return w >= (L + S) / 2 ? 'large' : 'small';
  if (w >= (L + M) / 2) return 'large';
  return w <= (M + S) / 2 ? 'small' : 'medium';
};

/**
 * Scroll offset that shows item i large (on a focal keyline of a state that
 * holds still), or the closest such offset.
 */
export const targetFor = (model: KeylineModel, i: number): number => {
  const { l } = model.arrangement;
  let best = 0;
  let bestDistance = Infinity;
  for (const region of model.regions) {
    for (let q = 0; q < l; q++) {
      const line = region.state.focal + q;
      const p = model.base + i * model.step - (region.state.u0 + line * model.step);
      const clamped = clamp(p, region.from, region.to);
      const distance = Math.abs(p - clamped);
      if (distance < bestDistance - 0.5) {
        best = clamped;
        bestDistance = distance;
      }
    }
  }
  return clamp(best, 0, model.P);
};

/** Step 7: snap offsets, ascending and unique. */
export const snapPoints = (model: KeylineModel, n: number): number[] => {
  const points = [0, model.P];
  for (let i = 0; i < n; i++) points.push(targetFor(model, i));
  points.sort((a, b) => a - b);
  return points.filter((p, i) => i === 0 || p - points[i - 1] > 0.5);
};
