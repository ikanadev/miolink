import { createSignal, onCleanup, splitProps, type Component, type JSX } from 'solid-js';
import { ChipSetContext, type ChipSetSelection, type ChipSetState } from './chip-set-context';
import styles from './chip.module.css';

export type ChipSetProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'role'> & {
  /**
   * Accessible name of the set, e.g. "Filter results". Also a secondary
   * indicator of interactivity (spec §8); show a visible label when you can
   * and point to it with `aria-labelledby` instead.
   */
  label?: string;
  /**
   * Default `none`. With `single` (a radiogroup) or `multi` (a group of
   * toggles), `FilterChip`s with a `value` are selected through the set.
   * Keep every set on a page in the same mode (spec §7).
   */
  selection?: ChipSetSelection;
  /** With a selection mode: the last selected chip can't be deselected. */
  required?: boolean;
  /** Controlled selected values. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Default `wrap` (rows; at most 2 recommended). `scroll` keeps one row that scrolls horizontally. */
  layout?: 'wrap' | 'scroll';
  /** `strong` uses the `outline` role for the stroke (3:1 contrast) instead of `outline-variant`. */
  outline?: 'default' | 'strong';
  /** `neutral` draws unselected leading icons in `on-surface-variant` instead of `primary`. */
  iconColor?: 'primary' | 'neutral';
  /** The chips, as direct children (removal moves focus between siblings). */
  children: JSX.Element;
};

const FOCUSABLE = 'button, a[href]';

/**
 * Roving tabindex (spec §8, web mapping): the set is one tab stop; the
 * chips and their trailing buttons are traversed in DOM order with the
 * arrow keys (Right/Down next, Left/Up previous, swapped in RTL, wrapping)
 * and Home/End. Tab lands on the last focused chip, else the first selected
 * one, else the first. Returns the cleanup.
 */
function rovingFocus(root: HTMLElement): () => void {
  let current: HTMLElement | undefined;

  const items = () =>
    Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) =>
        el.closest('[data-chip-set]') === root &&
        !el.closest('[hidden]') &&
        !el.matches(':disabled, [aria-disabled="true"]'),
    );

  const sync = () => {
    const els = items();
    if (!current || !els.includes(current)) {
      current = els.find((el) => el.matches('[aria-checked="true"], [aria-pressed="true"]')) ?? els[0];
    }
    for (const el of els) el.tabIndex = el === current ? 0 : -1;
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target !== current && items().includes(target)) {
      current = target;
      sync();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const els = items();
    const index = els.indexOf(e.target as HTMLElement);
    if (index < 0) return;
    const rtl = getComputedStyle(root).direction === 'rtl';
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
        next = rtl ? index - 1 : index + 1;
        break;
      case 'ArrowLeft':
        next = rtl ? index + 1 : index - 1;
        break;
      case 'ArrowDown':
        next = index + 1;
        break;
      case 'ArrowUp':
        next = index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = els.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    els[(next + els.length) % els.length].focus();
  };

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'href'],
  });
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('keydown', onKeyDown);
  return () => {
    observer.disconnect();
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('keydown', onKeyDown);
  };
}

/**
 * Chip set (spec §7, §9): the container chips always appear in. 8px gaps,
 * wrapping rows or one scrolling row, one tab stop with arrow-key
 * navigation. `role="group"`, or `role="radiogroup"` for single selection.
 * Space/Enter activate or toggle the focused chip; Delete/Backspace remove
 * a removable one, and focus moves to its neighbour.
 */
export const ChipSet: Component<ChipSetProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'selection',
    'required',
    'value',
    'defaultValue',
    'onValueChange',
    'layout',
    'outline',
    'iconColor',
    'children',
    'class',
    'ref',
  ]);

  const [inner, setInner] = createSignal(local.defaultValue ?? []);
  const value = () => local.value ?? inner();
  const selection = () => local.selection ?? 'none';

  const state: ChipSetState = {
    selection,
    isSelected: (v) => value().includes(v),
    toggle: (v) => {
      const current = value();
      const on = current.includes(v);
      let next: string[];
      if (selection() === 'single') next = on ? [] : [v];
      else next = on ? current.filter((x) => x !== v) : [...current, v];
      if (local.required && next.length === 0) return;
      setInner(next);
      local.onValueChange?.(next);
    },
  };

  return (
    <ChipSetContext.Provider value={state}>
      <div
        {...rest}
        ref={(el) => {
          onCleanup(rovingFocus(el));
          (local.ref as ((el: HTMLDivElement) => void) | undefined)?.(el);
        }}
        class={local.class ? `${styles.set} ${local.class}` : styles.set}
        role={selection() === 'single' ? 'radiogroup' : 'group'}
        aria-label={local.label}
        aria-required={selection() === 'single' && local.required ? 'true' : undefined}
        data-chip-set=""
        data-layout={local.layout ?? 'wrap'}
        data-outline={local.outline === 'strong' ? 'strong' : undefined}
        data-icon-color={local.iconColor === 'neutral' ? 'neutral' : undefined}
      >
        {local.children}
      </div>
    </ChipSetContext.Provider>
  );
};
