import { createStore } from '@tanstack/solid-store';
import { readJson, writeJson } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ContrastPreference = 'system' | 'standard' | 'medium' | 'high';
export type LinkView = 'grid' | 'list';
export type LinkSort = 'name' | 'newest' | 'oldest' | 'views';

export type Settings = {
  /** API base URL without a trailing slash, e.g. `https://links.example.com`. Empty until configured. */
  baseUrl: string;
  /**
   * The shared API key. Stored in localStorage: the browser offers no
   * storage that script can read but other script on this origin can't, so
   * the key is as safe as the origin serving the app.
   */
  apiKey: string;
  theme: ThemePreference;
  contrast: ContrastPreference;
  linkView: LinkView;
  linkSort: LinkSort;
};

const KEY = 'miolink.settings';

const DEFAULTS: Settings = {
  baseUrl: '',
  apiKey: '',
  theme: 'system',
  contrast: 'system',
  linkView: 'grid',
  linkSort: 'newest',
};

export const settingsStore = createStore<Settings>({ ...DEFAULTS, ...readJson<Partial<Settings>>(KEY) });

settingsStore.subscribe((s) => writeJson(KEY, s));

export const updateSettings = (patch: Partial<Settings>) =>
  settingsStore.setState((s) => ({ ...s, ...patch }));

export const isConfigured = (s: Settings) => s.baseUrl !== '' && s.apiKey !== '';

/** Trims a typed server address and drops trailing slashes. */
export const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

/** Validates a typed server address: an absolute http(s) URL. Returns an error message or undefined. */
export const validateBaseUrl = (value: string): string | undefined => {
  const url = normalizeBaseUrl(value);
  if (!url) return 'Enter the server address.';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'Use an http:// or https:// address.';
  } catch {
    return 'Enter a full address, like https://links.example.com.';
  }
  return undefined;
};
