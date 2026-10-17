/**
 * Arrow Up/Down and Home/End between navigation destinations (rail and
 * drawer, M3 Accessibility keyboard tables): attach the returned handler to a container's
 * `onKeyDown`. Only keys pressed on an element matching `selector` are
 * handled; Tab keeps working. Arrows wrap at the ends (derived).
 */
export const createArrowNavigation =
  (selector: string) =>
  (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const target = e.target as HTMLElement;
    if (!target.matches(selector)) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>(selector)];
    const index = items.indexOf(target);
    if (index < 0) return;
    e.preventDefault();
    const last = items.length - 1;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowDown'
            ? (index + 1) % items.length
            : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };
