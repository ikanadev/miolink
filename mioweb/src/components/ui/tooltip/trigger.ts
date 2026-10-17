import type { UseTooltipProps } from '@ark-ui/solid/tooltip';
import { children as resolveChildren, onCleanup, type JSX } from 'solid-js';
import { spread } from 'solid-js/web';

/*
 * Shared by Tooltip and RichTooltip: the one-at-a-time manager, the trigger
 * slot (an element child or an Ark-style `asChild` render prop), long-press
 * and the trigger's accessible name.
 */

export type TooltipPlacement = NonNullable<NonNullable<UseTooltipProps['positioning']>['placement']>;

/** Why a tooltip closed. */
export type TooltipCloseReason =
  | 'pointerleave'
  | 'blur'
  | 'escape'
  | 'outside-interaction'
  | 'other-tooltip'
  /** The trigger was clicked or pressed. */
  | 'trigger'
  /** A rich tooltip action was activated. */
  | 'action'
  /** The `open` prop, scrolling, disabling, ... */
  | 'other';

export type { TriggerAttrs as TooltipTriggerAttrs };

export type TooltipOpenChangeDetails = { open: boolean; reason?: TooltipCloseReason };

type TriggerAttrs = Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> & {
  ref?: (el: HTMLElement) => void;
};

/** Props for the trigger. Call it (optionally with your own props) and spread the result. */
export type TooltipTriggerProps = (userProps?: TriggerAttrs) => TriggerAttrs;

/** Default show delay on hover (derived: M3 gives no value; ~500ms is the common web delay). */
export const SHOW_DELAY = 500;
/** Hide delay after the pointer or focus leaves (M3 Tooltips, Behavior: 1.5s). */
export const HIDE_DELAY = 1500;
/** Touch hold before a transient tooltip shows (derived: platform long-press timeout). */
export const LONG_PRESS_MS = 500;
/** Viewport padding used when shifting and flipping (M3 Tooltips, Placement: 8px increments). */
export const OVERFLOW_PADDING = 8;

// ---- One at a time ----------------------------------------------------------

type Entry = { close: (reason: TooltipCloseReason) => void };
let current: Entry | null = null;

/** Registers `entry` as the open tooltip and closes the previous one (M3: one tooltip at a time). */
export const claimOpen = (entry: Entry) => {
  if (current && current !== entry) current.close('other-tooltip');
  current = entry;
};

export const releaseOpen = (entry: Entry) => {
  if (current === entry) current = null;
};

// ---- Trigger slot -----------------------------------------------------------

/**
 * Renders the trigger for Ark's `Trigger asChild`. With `asChild` the props
 * are handed to the caller's render function; with an element child they are
 * spread onto that element. Event handlers are attached as native listeners
 * (`on:*`) there, so they add to the element's own handlers instead of
 * replacing Solid's delegated ones.
 */
export const renderTrigger = (
  // Ark's `asChild` props function (typed per element there).
  arkProps: (userProps?: any) => JSX.HTMLAttributes<any>,
  child: () => JSX.Element,
  asChild: ((props: TooltipTriggerProps) => JSX.Element) | undefined,
  own: () => TriggerAttrs,
): JSX.Element => {
  const withOwn: TooltipTriggerProps = (user) => {
    const ref = (el: HTMLElement) => {
      own().ref?.(el);
      user?.ref?.(el);
    };
    // A function source: Ark's mergeProps re-reads it on every access, so
    // `own()` stays reactive. Its keys must not change between calls.
    const source = () => ({ ...own(), ...user, ref });
    return arkProps(source) as TriggerAttrs;
  };
  if (asChild) return asChild(withOwn);

  const resolved = resolveChildren(child);
  const el = resolved.toArray().find((n): n is HTMLElement => n instanceof HTMLElement);
  if (!el) {
    if (import.meta.env.DEV) console.warn('Tooltip: the trigger must be a single element.');
    return resolved();
  }
  const props = withOwn();
  const native: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    const name = /^on[A-Z]/.test(key) ? `on:${key.slice(2).toLowerCase()}` : key;
    Object.defineProperty(native, name, {
      enumerable: true,
      get: () => (props as Record<string, unknown>)[key],
    });
  }
  spread(el, native, false, true);
  return el;
};

// ---- Long press -------------------------------------------------------------

/**
 * Touch long-press for transient tooltips (M3 Tooltips, Behavior). `onOpen` runs after the
 * hold; `onRelease` when the finger lifts after a long press. `pressed()`
 * stays true until the next pointerdown, so the click that follows a long
 * press can be ignored.
 */
export const createLongPress = (onOpen: () => void, onRelease: () => void) => {
  let timer: number | undefined;
  let pressed = false;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  onCleanup(cancel);
  return {
    pressed: () => pressed,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        pressed = false;
        if (e.pointerType !== 'touch') return;
        cancel();
        timer = window.setTimeout(() => {
          timer = undefined;
          pressed = true;
          onOpen();
        }, LONG_PRESS_MS);
      },
      onPointerUp: () => {
        cancel();
        if (pressed) onRelease();
      },
      onPointerCancel: () => {
        cancel();
        if (pressed) onRelease();
      },
      onContextMenu: (e: MouseEvent) => {
        // The hold that shows the tooltip shouldn't also open the context menu.
        if (pressed || timer !== undefined) e.preventDefault();
      },
    },
  };
};

// ---- Accessible name --------------------------------------------------------

const textOf = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof Element) || node.getAttribute('aria-hidden') === 'true') return '';
  return Array.from(node.childNodes, textOf).join('');
};

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Approximate accessible name of the trigger: aria-labelledby (ignoring
 * `ownId`, the tooltip itself), aria-label, then visible text.
 */
export const accessibleName = (el: HTMLElement, ownId?: string) => {
  const ids = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter((id) => id && id !== ownId);
  if (ids.length) {
    return normalize(ids.map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '').join(' '));
  }
  const label = el.getAttribute('aria-label');
  if (label?.trim()) return normalize(label);
  return normalize(textOf(el));
};

export const sameText = (a: string, b: string) => normalize(a) === normalize(b);
