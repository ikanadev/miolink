import { createSignal, onCleanup, type Accessor } from 'solid-js';

/** A media query as a signal, e.g. the medium window class `(min-width: 600px)`. */
export const createMediaQuery = (query: string): Accessor<boolean> => {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = createSignal(mql.matches);
  const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
  mql.addEventListener('change', onChange);
  onCleanup(() => mql.removeEventListener('change', onChange));
  return matches;
};

/** M3 window size classes: compact < 600px, medium 600-839px, expanded ≥ 840px. */
export const MEDIUM_UP = '(min-width: 600px)';
export const EXPANDED_UP = '(min-width: 840px)';

/**
 * Click handler for an `<a href>` that navigates inside the app: plain
 * left clicks use the router, modified clicks (new tab, new window) are
 * left to the browser.
 */
export const routerClick = (go: () => void) => (e: MouseEvent) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  go();
};
