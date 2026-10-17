const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const count = new Intl.NumberFormat();

export const formatDateTime = (ms: number) => dateTime.format(ms);

export const formatCount = (n: number) => count.format(n);

export const plural = (n: number, one: string, many: string) => `${count.format(n)} ${n === 1 ? one : many}`;

/** "just now", "5 minutes ago", "yesterday", "3 days ago", or a date. */
export const formatRelative = (ms: number, now = Date.now()) => {
  const seconds = Math.round((ms - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'just now';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86400) return relative.format(Math.round(seconds / 86400), 'day');
  return dateTime.format(ms);
};

/** Start of the local day containing `ms`. */
const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** A heading for when something was added: Today, Yesterday, This week, This month, or the month and year. */
export const dateGroup = (ms: number, now = Date.now()): string => {
  const today = startOfDay(now);
  if (ms >= today) return 'Today';
  if (ms >= today - 86400_000) return 'Yesterday';
  if (ms >= today - 6 * 86400_000) return 'This week';
  const d = new Date(ms);
  const n = new Date(now);
  if (d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()) return 'Earlier this month';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};
