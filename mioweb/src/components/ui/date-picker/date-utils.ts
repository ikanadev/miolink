/**
 * Plain calendar-date helpers for the date picker. Dates are ISO
 * `YYYY-MM-DD` strings with no time or time zone; formatting goes through
 * `Intl` in UTC so a date never shifts by a day.
 */

export type DatePart = 'year' | 'month' | 'day';

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isIsoDate = (value: string | undefined): value is string => {
  if (!value) return false;
  const m = ISO_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
};

export const toIso = (year: number, month: number, day: number) =>
  `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

export const isoParts = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m, day: d };
};

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const daysInMonth = (year: number, month: number) =>
  month === 2 && isLeap(year) ? 29 : MONTH_DAYS[month - 1];

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** Today in the browser's time zone. */
export const todayIso = () => {
  const d = new Date();
  return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

export const localTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const defaultLocale = () =>
  (typeof document !== 'undefined' && document.documentElement.lang) ||
  (typeof navigator !== 'undefined' && navigator.language) ||
  'en-US';

export const clampIso = (iso: string, min?: string, max?: string) => {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
};

/** A UTC Date for formatting (works for years < 100 too). */
const utcDate = (iso: string) => {
  const { year, month, day } = isoParts(iso);
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  return d;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Formats an ISO date with `Intl` options (cached per locale + options). */
export const formatIso = (iso: string, locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    formatters.set(key, f);
  }
  return f.format(utcDate(iso));
};

const numbers = new Map<string, Intl.NumberFormat>();

/** Locale digits for day numbers and years (no grouping: "2026", not "2,026"). */
export const formatNumber = (n: number, locale: string) => {
  let f = numbers.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { useGrouping: false });
    numbers.set(locale, f);
  }
  return f.format(n);
};

// Bidi marks some locales put around the separators.
const BIDI = /[‎‏؜]/g;

export type FieldFormat = {
  /** Order of the parts in typed dates for this locale. */
  order: DatePart[];
  /** Shown as the helper text, e.g. "MM/DD/YYYY", "DD.MM.YYYY". */
  pattern: string;
  /** ISO -> field text in the locale's numeric format. */
  format: (iso: string) => string;
  /**
   * Field text -> ISO. Lenient (spec §8, no masks): any non-digit separators,
   * 1-2 digit month and day, 2 or 4 digit year, or 6/8 digits without
   * separators. `null` for empty text, `undefined` when it isn't a date.
   */
  parse: (text: string) => string | null | undefined;
};

const fieldFormats = new Map<string, FieldFormat>();

/** The locale's numeric date format for text fields (Latin digits so it can be typed). */
export const fieldFormat = (locale: string): FieldFormat => {
  const cached = fieldFormats.get(locale);
  if (cached) return cached;

  const dtf = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
    numberingSystem: 'latn',
  });
  const parts = dtf.formatToParts(utcDate('2023-11-22'));
  const order = parts
    .filter((p): p is Intl.DateTimeFormatPart & { type: DatePart } =>
      p.type === 'year' || p.type === 'month' || p.type === 'day',
    )
    .map((p) => p.type);
  const pattern = parts
    .map((p) =>
      p.type === 'year' ? 'YYYY' : p.type === 'month' ? 'MM' : p.type === 'day' ? 'DD' : p.value,
    )
    .join('')
    .replace(BIDI, '')
    .trim();

  const parse = (text: string): string | null | undefined => {
    const t = text.replace(BIDI, '').trim();
    if (!t) return null;
    let groups = t.split(/\D+/).filter(Boolean);
    if (groups.length === 1 && (groups[0].length === 8 || groups[0].length === 6)) {
      const s = groups[0];
      const width = { year: s.length - 4, month: 2, day: 2 };
      let i = 0;
      groups = order.map((part) => {
        const g = s.slice(i, i + width[part]);
        i += width[part];
        return g;
      });
    }
    if (groups.length !== 3) return undefined;
    const value: Record<DatePart, string> = { year: '', month: '', day: '' };
    order.forEach((part, i) => (value[part] = groups[i]));
    if (value.month.length > 2 || value.day.length > 2) return undefined;
    if (value.year.length !== 2 && value.year.length !== 4) return undefined;
    // Derived: two-digit years are in this century.
    const year = value.year.length === 2 ? 2000 + Number(value.year) : Number(value.year);
    const month = Number(value.month);
    const day = Number(value.day);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return undefined;
    return toIso(year, month, day);
  };

  const format = (iso: string) => dtf.format(utcDate(iso)).replace(BIDI, '');

  const result = { order, pattern, format, parse };
  fieldFormats.set(locale, result);
  return result;
};

/** First day of the week for a locale (0 = Sunday), when the browser knows it. */
export const localeWeekStart = (locale: string): number | undefined => {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    return info ? info.firstDay % 7 : undefined;
  } catch {
    return undefined;
  }
};
