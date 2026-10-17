import { settingsStore, type Settings } from './settings';

/** Keeps the browser UI color (theme-color meta) on the current surface color. */
const syncThemeColor = () => {
  const surface = getComputedStyle(document.body).backgroundColor;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = surface;
  }
};

const apply = (s: Settings) => {
  const root = document.documentElement;
  if (s.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = s.theme;
  if (s.contrast === 'system') delete root.dataset.contrast;
  else root.dataset.contrast = s.contrast;
  syncThemeColor();
};

/**
 * Applies the saved theme and contrast (`data-theme` / `data-contrast` on
 * `<html>`, see styles/tokens/color.css) now and whenever they change.
 */
export const startTheme = () => {
  let last = settingsStore.state;
  apply(last);
  settingsStore.subscribe((s) => {
    if (s.theme !== last.theme || s.contrast !== last.contrast) apply(s);
    last = s;
  });
  for (const query of ['(prefers-color-scheme: dark)', '(prefers-contrast: more)']) {
    matchMedia(query).addEventListener('change', syncThemeColor);
  }
};
