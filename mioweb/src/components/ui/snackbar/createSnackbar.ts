import { createToaster, type CreateToasterReturn } from '@ark-ui/solid/toast';
import type { JSX } from 'solid-js';

/** Why a snackbar left the screen. */
export type SnackbarDismissReason =
  | 'timeout'
  | 'action'
  | 'close-button'
  | 'escape'
  | 'replaced'
  | 'programmatic';

export type SnackbarOptions = {
  /** Supporting text: short, plain text (no bold, links or icons). One line when possible, at most two. */
  message: string;
  /** Label of the one text-button action ("Undo", "Retry"). Activating it runs `onAction` and dismisses. */
  actionLabel?: string;
  onAction?: () => void;
  /** Show a trailing close icon button. */
  closable?: boolean;
  /**
   * Auto-dismiss delay in ms. Without an action: default 4000, clamped to
   * 4000-10000, or `Infinity`. With an action: default `Infinity`; a finite
   * value is raised to at least 10000.
   *
   * On the web an auto-dismissing snackbar is only accessible if the same
   * information also appears inline near the trigger (e.g. "Save" becomes
   * "Saved"); otherwise add an action.
   */
  duration?: number;
  /** Put the action on its own line below the text (long action labels). */
  longAction?: boolean;
  /** Dismiss the visible snackbar and show this one next, ahead of the queue (updated information). */
  replace?: boolean;
  /** Reusing the id of a shown snackbar updates it in place. */
  id?: string;
  /** The snackbar became visible (it may wait in the queue first). */
  onOpen?: () => void;
  /** The exit transition started. */
  onDismiss?: (reason: SnackbarDismissReason) => void;
  /** The snackbar was removed; the next queued one shows after this. */
  onClose?: (reason: SnackbarDismissReason) => void;
};

export type SnackbarHandle = {
  id: string;
  dismiss: () => void;
};

export type Snackbar = {
  /** Queue a snackbar. Only one is visible at a time; the others wait in order. */
  show: (options: SnackbarOptions) => SnackbarHandle;
  /** Dismiss one snackbar, or every visible one without an id. Queued ones still show afterwards. */
  dismiss: (id?: string) => void;
  /** The Ark UI toast store, for `<SnackbarHost />`. */
  readonly toaster: CreateToasterReturn<JSX.Element>;
};

export type CreateSnackbarOptions = {
  /**
   * Keys that move focus to the snackbar, as KeyboardEvent modifier
   * properties and `code`s. Default Alt+G (derived: M3 Accessibility asks for a shortcut but names none). Document it for users.
   */
  hotkey?: string[];
};

export type SnackbarMeta = { longAction: boolean };

/* M3 Behavior: auto-dismiss after 4-10s. 4s is the default (Android's short duration; derived). */
const MIN_DURATION = 4000;
const MAX_DURATION = 10000;
/* Exit transition: --md-sys-motion-duration-short4 (snackbar.module.css). */
const REMOVE_DELAY = 200;
/* Ark sorts its queue by priority; equal priorities keep the order they were shown in. */
const PRIORITY_NEXT = 1;
const PRIORITY_QUEUED = 8;

const durationFor = (options: SnackbarOptions) => {
  const { duration } = options;
  if (options.actionLabel) {
    // Actionable snackbars persist (M3 Behavior and Accessibility); a finite duration gets the upper bound as its minimum (derived).
    return duration === undefined ? Infinity : Math.max(duration, MAX_DURATION);
  }
  if (duration === undefined) return MIN_DURATION;
  if (duration === Infinity) return Infinity;
  return Math.min(Math.max(duration, MIN_DURATION), MAX_DURATION);
};

/**
 * A snackbar manager on an Ark UI
 * toast store: one snackbar at a time, a FIFO queue, `replace` for updated
 * information, timers that pause while the snackbar is hovered or focused,
 * dismiss reasons. Render it with `<SnackbarHost snackbar={...} />` once.
 *
 * Offsets are CSS variables resolved by the host (margins per breakpoint,
 * plus `bottomOffset` to sit above a FAB or bottom bar).
 */
export const createSnackbar = (options: CreateSnackbarOptions = {}): Snackbar => {
  const toaster = createToaster<JSX.Element>({
    placement: 'bottom',
    max: 1,
    overlap: false,
    gap: 0,
    removeDelay: REMOVE_DELAY,
    pauseOnPageIdle: true,
    hotkey: options.hotkey ?? ['altKey', 'KeyG'],
    offsets: {
      top: '0px',
      left: 'var(--_margin)',
      right: 'var(--_margin)',
      bottom: 'calc(var(--_margin) + var(--_bottom-offset))',
    },
  });

  const reasons = new Map<string, SnackbarDismissReason>();

  const resolveReason = (id: string, src: string | undefined): SnackbarDismissReason => {
    const known = reasons.get(id);
    if (known) return known;
    if (src === 'timer') return 'timeout';
    if (src === 'keyboard') return 'escape';
    // Ark reports both triggers as "user"; the action records its reason first.
    if (src === 'user') return 'close-button';
    return 'programmatic';
  };

  const dismiss = (id?: string) => {
    if (id !== undefined) {
      toaster.dismiss(id);
      return;
    }
    for (const t of toaster.getVisibleToasts()) if (t.id) toaster.dismiss(t.id);
  };

  const show = (o: SnackbarOptions): SnackbarHandle => {
    if (o.replace) {
      for (const t of toaster.getVisibleToasts()) {
        if (!t.id || t.id === o.id) continue;
        reasons.set(t.id, 'replaced');
        toaster.dismiss(t.id);
      }
    }

    let opened = false;
    const meta: SnackbarMeta = { longAction: o.longAction ?? false };
    const id: string = toaster.create({
      ...(o.id === undefined ? {} : { id: o.id }),
      type: 'info',
      description: o.message,
      duration: durationFor(o),
      priority: o.replace ? PRIORITY_NEXT : PRIORITY_QUEUED,
      closable: o.closable ?? false,
      meta,
      action: o.actionLabel
        ? {
            label: o.actionLabel,
            onClick: () => {
              reasons.set(id, 'action');
              o.onAction?.();
            },
          }
        : undefined,
      onStatusChange: ({ status, src }) => {
        if (status === 'visible') {
          if (!opened) o.onOpen?.();
          opened = true;
        } else if (status === 'dismissing') {
          const reason = resolveReason(id, src);
          reasons.set(id, reason);
          o.onDismiss?.(reason);
        } else {
          const reason = reasons.get(id) ?? 'programmatic';
          reasons.delete(id);
          o.onClose?.(reason);
        }
      },
    });

    return { id, dismiss: () => dismiss(id) };
  };

  return { show, dismiss, toaster };
};

/** The app-wide snackbar. Mount `<SnackbarHost />` once (it uses this one by default). */
export const snackbar = createSnackbar();
