const MAX_URL = 2048;
const MAX_TITLE = 500;

/**
 * Checks a typed URL like the backend does: absolute http(s) with a host,
 * at most 2048 characters. A bare "example.com" gets https:// added.
 * Returns the URL to send, or an error message.
 */
export const parseLinkUrl = (input: string): { url: string } | { error: string } => {
  let value = input.trim();
  if (!value) return { error: 'Enter a URL.' };
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = `https://${value}`;
  if ([...value].length > MAX_URL) return { error: `Use at most ${MAX_URL} characters.` };
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { error: 'Enter a valid URL.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return { error: 'Use an http:// or https:// URL.' };
  if (!parsed.hostname) return { error: 'Enter a valid URL.' };
  return { url: value };
};

/** The backend's title rule: 1-500 characters after trimming. Returns an error message or undefined. */
export const validateLinkTitle = (title: string): string | undefined => {
  const length = [...title.trim()].length;
  if (length === 0) return 'Enter a title.';
  if (length > MAX_TITLE) return `Use at most ${MAX_TITLE} characters.`;
  return undefined;
};

export const MAX_TITLE_LENGTH = MAX_TITLE;

/** First http(s) URL in a piece of text (pasted or shared), if any. */
export const findUrl = (text: string): string | undefined => text.match(/https?:\/\/[^\s<>"']+/i)?.[0];

/** "example.com" from a URL, for supporting text. */
export const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};
