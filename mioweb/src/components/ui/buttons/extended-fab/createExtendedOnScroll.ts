import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

export type ExtendedOnScrollOptions = {
  /**
   * The scrolling element. Default: window. An accessor so a ref signal can
   * be passed; while it returns undefined nothing is tracked.
   */
  target?: Accessor<HTMLElement | undefined>;
  /** Scroll distance in px before the direction counts. Default 8 (derived). */
  threshold?: number;
};

/**
 * Scroll helper for `ExtendedFab`'s `extended` prop: false while scrolling
 * down, true when scrolling up, at the top, or at the end of the content.
 *
 *   const extended = createExtendedOnScroll({ target: scroller });
 *   <ExtendedFab extended={extended()} ... />
 */
export function createExtendedOnScroll(options: ExtendedOnScrollOptions = {}): Accessor<boolean> {
  const [extended, setExtended] = createSignal(true);

  createEffect(() => {
    const el = options.target ? options.target() : undefined;
    if (options.target && !el) return;
    const scroller: HTMLElement | Window = el ?? window;
    const threshold = options.threshold ?? 8;
    const position = () => (el ? el.scrollTop : window.scrollY);
    const end = () =>
      el
        ? el.scrollHeight - el.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

    let anchor = position();
    const onScroll = () => {
      const y = position();
      if (y <= 0 || y >= end() - 1) {
        setExtended(true);
        anchor = y;
        return;
      }
      if (Math.abs(y - anchor) < threshold) return;
      setExtended(y < anchor);
      anchor = y;
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onCleanup(() => scroller.removeEventListener('scroll', onScroll));
  });

  return extended;
}
