/**
 * Time helpers for the time picker. Times are canonical 24h `HH:mm`
 * strings (no seconds, no time zone); minutes since midnight in between.
 */

export type HourCycle = 'h12' | 'h23';

const pad = (n: number) => String(n).padStart(2, '0');

const HHMM_RE = /^(\d{2}):(\d{2})$/;

/** `HH:mm` -> minutes since midnight, or undefined when it isn't a valid time. */
export const parseHHmm = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const m = HHMM_RE.exec(value);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h <= 23 && min <= 59 ? h * 60 + min : undefined;
};

export const toHHmm = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const defaultLocale = () =>
  (typeof document !== 'undefined' && document.documentElement.lang) ||
  (typeof navigator !== 'undefined' && navigator.language) ||
  'en-US';

/** The locale's clock: h11/h12 -> `h12`, h23/h24 -> `h23`. */
export const localeHourCycle = (locale: string): HourCycle => {
  try {
    const cycle = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions().hourCycle;
    return cycle === 'h11' || cycle === 'h12' ? 'h12' : 'h23';
  } catch {
    return 'h12';
  }
};

const utc = (minutes: number) => new Date(Date.UTC(2000, 0, 1, Math.floor(minutes / 60), minutes % 60));

/** Localized AM/PM labels (`formatToParts` -> `dayPeriod`). */
export const dayPeriods = (locale: string): [string, string] => {
  const label = (minutes: number, fallback: string) => {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        hourCycle: 'h12',
        timeZone: 'UTC',
      }).formatToParts(utc(minutes));
      return parts.find((p) => p.type === 'dayPeriod')?.value ?? fallback;
    } catch {
      return fallback;
    }
  };
  return [label(9 * 60, 'AM'), label(21 * 60, 'PM')];
};

const numbers = new Map<string, Intl.NumberFormat>();

/** Locale digits; `padded` gives two digits ("07"). */
export const formatNumber = (n: number, locale: string, padded = false) => {
  const key = `${locale}|${padded}`;
  let f = numbers.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      useGrouping: false,
      minimumIntegerDigits: padded ? 2 : 1,
    });
    numbers.set(key, f);
  }
  return f.format(n);
};

// Bidi marks and narrow no-break spaces some locales put in times.
const BIDI = /[‎‏؜]/g;
const SPACES = /[  ]/g;

export type TimeFieldFormat = {
  /** Shown as helper text, e.g. "hh:mm AM" or "HH:mm". */
  pattern: string;
  /** Minutes -> field text in the locale's format (Latin digits so it can be typed). */
  format: (minutes: number) => string;
  /**
   * Field text -> minutes. Lenient: any separator, "7", "730", "07:30",
   * "7:30 pm", "19.30", "19 h 30". `null` for empty text, `undefined` when
   * it isn't a time.
   */
  parse: (text: string) => number | null | undefined;
};

const fieldFormats = new Map<string, TimeFieldFormat>();

export const timeFieldFormat = (locale: string, hourCycle: HourCycle): TimeFieldFormat => {
  const key = `${locale}|${hourCycle}`;
  const cached = fieldFormats.get(key);
  if (cached) return cached;

  const dtf = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle,
    timeZone: 'UTC',
    numberingSystem: 'latn',
  });
  const clean = (s: string) => s.replace(BIDI, '').replace(SPACES, ' ').trim();
  const pattern = clean(
    dtf
      .formatToParts(utc(9 * 60 + 5))
      .map((p) =>
        p.type === 'hour'
          ? hourCycle === 'h12'
            ? 'hh'
            : 'HH'
          : p.type === 'minute'
            ? 'mm'
            : p.type === 'dayPeriod'
              ? 'AM'
              : p.value,
      )
      .join(''),
  );
  const [am, pm] = dayPeriods(locale).map((p) => p.toLowerCase().replace(/[.\s]/g, ''));

  const parse = (text: string): number | null | undefined => {
    const t = clean(text).toLowerCase();
    if (!t) return null;
    const groups = t.match(/\d+/g) ?? [];
    // Letters other than the "h" separator ("19 h 30") name the period.
    const letters = t.replace(/[\d\s:.,h]/g, '');
    let period: 'am' | 'pm' | undefined;
    if (letters) {
      if (letters === am || letters === 'am' || letters === 'a') period = 'am';
      else if (letters === pm || letters === 'pm' || letters === 'p') period = 'pm';
      else return undefined;
    }
    let h: number;
    let m: number;
    if (groups.length === 1) {
      const g = groups[0];
      if (g.length <= 2) [h, m] = [Number(g), 0];
      else if (g.length <= 4) [h, m] = [Number(g.slice(0, -2)), Number(g.slice(-2))];
      else return undefined;
    } else if (groups.length === 2 && groups[1].length === 2 && groups[0].length <= 2) {
      [h, m] = [Number(groups[0]), Number(groups[1])];
    } else return undefined;
    if (m > 59) return undefined;
    if (period) {
      if (h < 1 || h > 12) return undefined;
      h = (h % 12) + (period === 'pm' ? 12 : 0);
    } else if (h > 23) return undefined;
    return h * 60 + m;
  };

  const format = (minutes: number) => clean(dtf.format(utc(minutes)));
  const result = { pattern, format, parse };
  fieldFormats.set(key, result);
  return result;
};
