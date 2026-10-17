/*
 * The loading indicator's seven shapes (loading-indicator.md §6.2, from
 * Compose's MaterialShapes.kt) and their morph.
 *
 * There is no web shape-morph API, so this is the spec's fallback (§6.5,
 * step 4, derived): each shape is built as a rounded polygon in the unit
 * square, normalized, and resampled to SAMPLES radii at evenly spaced
 * angles around its center (all seven are star-convex). A morph lerps the
 * radii; the outline is drawn as a closed Catmull-Rom curve. Visually close
 * to Compose's vertex-matched morph, not identical. Computed once, on first
 * use.
 */

type Point = { x: number; y: number };
type Vertex = Point & { r: number };

/** Radii per shape. Divisible by 4 so quarter turns land on samples. */
export const SAMPLES = 120;

const rotate = (p: Point, deg: number, c: Point): Point => {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
};

/** Compose's customPolygon/doRepeat: `reps` rotated copies, optionally mirrored. */
const customPolygon = (points: Vertex[], reps: number, mirror = false): Vertex[] => {
  const c = { x: 0.5, y: 0.5 };
  if (!mirror) {
    const out: Vertex[] = [];
    for (let i = 0; i < points.length * reps; i++) {
      const p = points[i % points.length];
      out.push({ ...rotate(p, (Math.floor(i / points.length) * 360) / reps, c), r: p.r });
    }
    return out;
  }
  const angles = points.map((p) => (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI);
  const dists = points.map((p) => Math.hypot(p.x - c.x, p.y - c.y));
  const section = 360 / (reps * 2);
  const out: Vertex[] = [];
  for (let it = 0; it < reps * 2; it++) {
    for (let index = 0; index < points.length; index++) {
      const i = it % 2 === 0 ? index : points.length - 1 - index;
      if (i === 0 && it % 2 !== 0) continue;
      const deg = section * it + (it % 2 === 0 ? angles[i] : section - angles[i] + 2 * angles[0]);
      const a = (deg * Math.PI) / 180;
      out.push({ x: c.x + Math.cos(a) * dists[i], y: c.y + Math.sin(a) * dists[i], r: points[i].r });
    }
  }
  return out;
};

/** RoundedPolygon.star(n, innerRadius, rounding), radius 1 around the origin. */
const star = (n: number, inner: number, rounding: number, rotateDeg = 0): Vertex[] => {
  const out: Vertex[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((i * Math.PI) / n) + (rotateDeg * Math.PI) / 180;
    const radius = i % 2 === 0 ? 1 : inner;
    out.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius, r: rounding });
  }
  return out;
};

/**
 * Outline of a polygon whose corners are rounded with circular arcs. Like
 * graphics-shapes, a corner's cut is scaled down when it and its neighbour
 * don't fit on their shared edge.
 */
const outline = (vertices: Vertex[]): Point[] => {
  const n = vertices.length;
  const corner = vertices.map((v, i) => {
    const prev = vertices[(i + n - 1) % n];
    const next = vertices[(i + 1) % n];
    const u1 = { x: prev.x - v.x, y: prev.y - v.y };
    const u2 = { x: next.x - v.x, y: next.y - v.y };
    const l1 = Math.hypot(u1.x, u1.y);
    const l2 = Math.hypot(u2.x, u2.y);
    u1.x /= l1;
    u1.y /= l1;
    u2.x /= l2;
    u2.y /= l2;
    const angle = Math.acos(Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y)));
    const cut = v.r > 0 ? v.r / Math.tan(angle / 2) : 0;
    return { u1, u2, angle, cut, next: l2 };
  });
  // Ratio each corner can keep: the smaller of its two edges' fit.
  const fit = corner.map((k, i) => {
    const sum = k.cut + corner[(i + 1) % n].cut;
    return sum > k.next ? k.next / sum : 1;
  });
  const out: Point[] = [];
  vertices.forEach((v, i) => {
    const k = corner[i];
    const cut = k.cut * Math.min(fit[i], fit[(i + n - 1) % n]);
    if (cut <= 1e-6) {
      out.push(v);
      return;
    }
    const radius = cut * Math.tan(k.angle / 2);
    const bis = { x: k.u1.x + k.u2.x, y: k.u1.y + k.u2.y };
    const bl = Math.hypot(bis.x, bis.y);
    const d = radius / Math.sin(k.angle / 2);
    const center = { x: v.x + (bis.x / bl) * d, y: v.y + (bis.y / bl) * d };
    const a0 = Math.atan2(v.y + k.u1.y * cut - center.y, v.x + k.u1.x * cut - center.x);
    const a1 = Math.atan2(v.y + k.u2.y * cut - center.y, v.x + k.u2.x * cut - center.x);
    let sweep = a1 - a0;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    while (sweep < -Math.PI) sweep += 2 * Math.PI;
    const steps = Math.max(2, Math.ceil(Math.abs(sweep) / (Math.PI / 90)));
    for (let s = 0; s <= steps; s++) {
      const a = a0 + (sweep * s) / steps;
      out.push({ x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius });
    }
  });
  return out;
};

const ellipse = (rx: number, ry: number, rotateDeg: number): Point[] =>
  Array.from({ length: 360 }, (_, i) => {
    const a = (i * Math.PI) / 180;
    return rotate({ x: Math.cos(a) * rx, y: Math.sin(a) * ry }, rotateDeg, { x: 0, y: 0 });
  });

/** RoundedPolygon.normalized(): fit in the unit square, centered. */
const normalize = (points: Point[]): Point[] => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = 1 / Math.max(maxX - minX, maxY - minY);
  const ox = (1 - (maxX - minX) * scale) / 2;
  const oy = (1 - (maxY - minY) * scale) / 2;
  return points.map((p) => ({ x: (p.x - minX) * scale + ox, y: (p.y - minY) * scale + oy }));
};

/** Densify the outline, then read the radius at each sample angle around (0.5, 0.5). */
const toRadii = (points: Point[]): Float64Array => {
  const polar: { a: number; r: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / 0.005));
    for (let s = 0; s < steps; s++) {
      const x = p.x + ((q.x - p.x) * s) / steps - 0.5;
      const y = p.y + ((q.y - p.y) * s) / steps - 0.5;
      polar.push({ a: Math.atan2(y, x), r: Math.hypot(x, y) });
    }
  }
  polar.sort((u, v) => u.a - v.a);
  const radii = new Float64Array(SAMPLES);
  // j = last outline point at or before the sample angle (−1: wrap to the last one).
  let j = -1;
  for (let i = 0; i < SAMPLES; i++) {
    const a = -Math.PI + (i * 2 * Math.PI) / SAMPLES;
    while (j < polar.length - 1 && polar[j + 1].a <= a) j++;
    const u = polar[j < 0 ? polar.length - 1 : j];
    const v = polar[(j + 1) % polar.length];
    const span = (v.a - u.a + 2 * Math.PI) % (2 * Math.PI) || 1e-9;
    const t = Math.max(0, Math.min(1, (((a - u.a) + 2 * Math.PI) % (2 * Math.PI)) / span));
    radii[i] = u.r + (v.r - u.r) * t;
  }
  return radii;
};

export type LoadingShapes = {
  /** Radii of each shape at SAMPLES angles from −π, in unit-square units. */
  radii: Float64Array[];
  /**
   * Scale that fits every shape, under any rotation, in 38/48 of the box
   * (§4.2): min over shapes of 1 / (2 × max radius), times 38/48.
   */
  scale: number;
};

let cache: LoadingShapes | undefined;

export const loadingShapes = (): LoadingShapes => {
  if (cache) return cache;
  const polygons: Point[][] = [
    // 1 Soft burst
    outline(customPolygon([{ x: 0.193, y: 0.277, r: 0.053 }, { x: 0.176, y: 0.055, r: 0.053 }], 10)),
    // 2 Cookie 9-sided, rotated −90°
    outline(star(9, 0.8, 0.5, -90)),
    // 3 Pentagon
    outline(customPolygon([{ x: 0.5, y: -0.009, r: 0.172 }, { x: 1.03, y: 0.365, r: 0.164 }, { x: 0.828, y: 0.97, r: 0.169 }], 1, true)),
    // 4 Pill
    outline(customPolygon([{ x: 0.961, y: 0.039, r: 0.426 }, { x: 1.001, y: 0.428, r: 0 }, { x: 1, y: 0.609, r: 1 }], 2, true)),
    // 5 Sunny
    outline(star(8, 0.8, 0.15)),
    // 6 Cookie 4-sided
    outline(customPolygon([{ x: 1.237, y: 1.236, r: 0.258 }, { x: 0.5, y: 0.918, r: 0.233 }], 4)),
    // 7 Oval: circle scaled (1, 0.64), rotated −45°
    ellipse(1, 0.64, -45),
  ];
  const radii = polygons.map((p) => toRadii(normalize(p)));
  const maxRadius = Math.max(...radii.map((r) => Math.max(...r)));
  cache = { radii, scale: (1 / (2 * maxRadius)) * (38 / 48) };
  return cache;
};

/**
 * SVG path (viewBox 0 0 100 100) of the morph from shape `from` to `to` at
 * progress p (not clamped: the spring's overshoot carries into the outline),
 * rotated by `rotation` degrees clockwise and centered on its bounding box.
 */
export const morphPath = (from: number, to: number, p: number, rotation: number): string => {
  const { radii, scale } = loadingShapes();
  const a = radii[from];
  const b = radii[to];
  const rot = (rotation * Math.PI) / 180;
  const xs = new Float64Array(SAMPLES);
  const ys = new Float64Array(SAMPLES);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < SAMPLES; i++) {
    const r = a[i] + (b[i] - a[i]) * p;
    const angle = -Math.PI + (i * 2 * Math.PI) / SAMPLES + rot;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    xs[i] = x;
    ys[i] = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const k = scale * 100;
  for (let i = 0; i < SAMPLES; i++) {
    xs[i] = 50 + (xs[i] - cx) * k;
    ys[i] = 50 + (ys[i] - cy) * k;
  }
  // Closed Catmull-Rom spline through the samples, as cubic Béziers.
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(xs[0])} ${f(ys[0])}`;
  for (let i = 0; i < SAMPLES; i++) {
    const i0 = (i + SAMPLES - 1) % SAMPLES;
    const i2 = (i + 1) % SAMPLES;
    const i3 = (i + 2) % SAMPLES;
    d +=
      `C${f(xs[i] + (xs[i2] - xs[i0]) / 6)} ${f(ys[i] + (ys[i2] - ys[i0]) / 6)} ` +
      `${f(xs[i2] - (xs[i3] - xs[i]) / 6)} ${f(ys[i2] - (ys[i3] - ys[i]) / 6)} ${f(xs[i2])} ${f(ys[i2])}`;
  }
  return `${d}Z`;
};
