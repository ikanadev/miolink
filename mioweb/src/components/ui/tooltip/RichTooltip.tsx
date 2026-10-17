import { Popover, usePopover } from '@ark-ui/solid/popover';
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Ripple } from '../shared/Ripple';
import styles from './tooltip.module.css';
import {
  claimOpen,
  createLongPress,
  HIDE_DELAY,
  OVERFLOW_PADDING,
  releaseOpen,
  renderTrigger,
  SHOW_DELAY,
  type TooltipCloseReason,
  type TooltipOpenChangeDetails,
  type TooltipPlacement,
  type TooltipTriggerAttrs,
  type TooltipTriggerProps,
} from './trigger';

export type RichTooltipProps = {
  /** Optional one-line title. Include it when the tooltip opens by itself. */
  subhead?: JSX.Element;
  /** The explanation; may contain an inline link. */
  supportingText: JSX.Element;
  /** Up to two `RichTooltipAction`s, side by side. */
  actions?: JSX.Element;
  /**
   * Opens on click (or `open`/`defaultOpen`, e.g. on page load) instead of
   * hover, focus and long-press, and stays open until the user interacts
   * elsewhere or presses Escape. Avoid on icon buttons.
   */
  persistent?: boolean;
  /** The trigger: a single element. */
  children?: JSX.Element;
  /** Render-prop alternative to `children`: `{(t) => <button {...t()} />}`. */
  asChild?: (props: TooltipTriggerProps) => JSX.Element;
  /** Default `bottom-end`; `bottom` centers it under the trigger. */
  placement?: TooltipPlacement;
  /** Gap to the trigger: 4px with a visual boundary (default), 8px without. */
  offset?: number;
  /** Hover delay before showing, in ms (transient). Default 500. */
  showDelay?: number;
  /** Delay before hiding after the pointer or focus leaves, in ms (transient). Default 1500. */
  hideDelay?: number;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
  disabled?: boolean;
  /** Class for the tooltip container. */
  class?: string;
};

const RichTooltipContext = createContext<{ close: (reason: TooltipCloseReason) => void }>();

/**
 * M3 rich tooltip (m3-guidelines/components/tooltips.md): optional subhead,
 * supporting text and up to two text actions on a surface-container card.
 *
 * Built on Ark UI `Popover` (non-modal), not `Tooltip`: its content is
 * interactive, so it is a `role="dialog"` with `aria-expanded`/`aria-controls`
 * on the trigger, Tab moves from the trigger into it and out to the next
 * element without a focus trap, and Escape or an outside interaction closes
 * it. Transient tooltips drive the popover's `open` from hover, keyboard
 * focus and long-press, with the hover region covering the tooltip itself.
 */
export const RichTooltip: Component<RichTooltipProps> = (props) => {
  const [local] = splitProps(props, [
    'subhead',
    'supportingText',
    'actions',
    'persistent',
    'children',
    'asChild',
    'placement',
    'offset',
    'showDelay',
    'hideDelay',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'class',
  ]);

  const id = createUniqueId();
  const ids = {
    trigger: `rich-tooltip-${id}-trigger`,
    content: `rich-tooltip-${id}`,
    title: `rich-tooltip-${id}-subhead`,
    description: `rich-tooltip-${id}-text`,
  };
  const [openState, setOpenState] = createSignal(!!local.defaultOpen);
  const isOpen = () => local.open ?? openState();
  const transient = () => !local.persistent;
  let trigger: HTMLElement | undefined;
  let content: HTMLElement | undefined;
  let showTimer: number | undefined;
  let hideTimer: number | undefined;
  let pending: TooltipCloseReason | undefined;
  let restoringFocus = false;

  const clearTimers = () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
  };

  const setOpen = (next: boolean, reason: TooltipCloseReason = 'other') => {
    clearTimers();
    if (next && local.disabled) return;
    if (next === isOpen()) return;
    if (next) {
      claimOpen(entry);
    } else {
      releaseOpen(entry);
      // Don't leave focus on hidden content: hand it back to the trigger.
      if (content?.contains(document.activeElement) && trigger) {
        restoringFocus = true;
        trigger.focus({ preventScroll: true });
        restoringFocus = false;
      }
    }
    setOpenState(next);
    local.onOpenChange?.(next ? { open: next } : { open: next, reason });
  };
  const entry = { close: (reason: TooltipCloseReason) => setOpen(false, reason) };

  const show = (delay: number) => {
    clearTimeout(hideTimer);
    if (isOpen()) return;
    clearTimeout(showTimer);
    showTimer = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = (reason: TooltipCloseReason) => {
    clearTimeout(showTimer);
    if (!isOpen()) return;
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => setOpen(false, reason), local.hideDelay ?? HIDE_DELAY);
  };
  const keep = () => clearTimeout(hideTimer);

  createEffect(() => {
    if (local.disabled && isOpen()) setOpen(false);
  });
  onCleanup(() => {
    clearTimers();
    releaseOpen(entry);
  });

  const longPress = createLongPress(
    () => setOpen(true),
    () => hide('pointerleave'),
  );

  const api = usePopover(() => ({
    id,
    ids,
    open: isOpen(),
    modal: false,
    portalled: true,
    autoFocus: false,
    restoreFocus: false,
    positioning: {
      placement: local.placement ?? 'bottom-end',
      gutter: local.offset ?? 4,
      overflowPadding: OVERFLOW_PADDING,
      flip: true,
      slide: true,
    },
    // Trigger clicks (TOGGLE), Escape and outside interactions.
    onOpenChange: ({ open }) => {
      const reason = pending ?? 'trigger';
      pending = undefined;
      if (open) {
        if (!transient()) setOpen(true);
        return;
      }
      // The click that ends a long press isn't a request to close.
      if (transient() && reason === 'trigger' && longPress.pressed()) return;
      setOpen(false, reason);
    },
    onEscapeKeyDown: () => (pending = 'escape'),
    onPointerDownOutside: () => (pending = 'outside-interaction'),
    onFocusOutside: (e) => {
      if (transient()) {
        // Focus left the trigger and the tooltip: hide after the delay (spec §5).
        e.preventDefault();
        hide('blur');
      } else {
        pending = 'outside-interaction';
      }
    },
  }));

  const hovering = (e: PointerEvent) => e.pointerType !== 'touch' && transient() && !local.disabled;

  // Stable keys (see renderTrigger); handlers run before Ark's (capture).
  const own = (): TooltipTriggerAttrs =>
    ({
      ref: (el: HTMLElement) => (trigger = el),
      'aria-describedby': isOpen() ? ids.description : undefined,
      'oncapture:pointerenter': (e: PointerEvent) => {
        if (hovering(e)) show(local.showDelay ?? SHOW_DELAY);
      },
      'oncapture:pointerleave': (e: PointerEvent) => {
        if (hovering(e)) hide('pointerleave');
      },
      'oncapture:pointerdown': (e: PointerEvent) => {
        if (!transient()) return;
        if (e.pointerType !== 'touch') clearTimeout(showTimer);
        longPress.handlers.onPointerDown(e);
      },
      'oncapture:pointerup': longPress.handlers.onPointerUp,
      'oncapture:pointercancel': longPress.handlers.onPointerCancel,
      'oncapture:contextmenu': longPress.handlers.onContextMenu,
      'oncapture:focusin': (e: FocusEvent) => {
        if (!transient() || restoringFocus) return;
        if ((e.currentTarget as HTMLElement).matches(':focus-visible')) setOpen(true);
      },
      'oncapture:focusout': (e: FocusEvent) => {
        if (!transient()) return;
        if (!content?.contains(e.relatedTarget as Node | null)) hide('blur');
      },
    }) as TooltipTriggerAttrs;

  return (
    <RichTooltipContext.Provider value={{ close: (reason) => setOpen(false, reason) }}>
      <Popover.RootProvider value={api}>
        <Popover.Trigger
          asChild={(arkProps) => renderTrigger(arkProps, () => local.children, local.asChild, own)}
        />
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              ref={(el: HTMLElement) => (content = el)}
              class={local.class ? `${styles.content} ${local.class}` : styles.content}
              data-variant="rich"
              data-persistent={local.persistent ? '' : undefined}
              onPointerEnter={(e) => hovering(e) && keep()}
              onPointerLeave={(e) => hovering(e) && hide('pointerleave')}
              onPointerDown={keep}
              onFocusIn={keep}
            >
              <Show when={local.subhead}>
                <Popover.Title class={styles.subhead}>{local.subhead}</Popover.Title>
              </Show>
              <Popover.Description class={styles.supportingText}>{local.supportingText}</Popover.Description>
              <Show when={local.actions}>
                <div class={styles.actions}>{local.actions}</div>
              </Show>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.RootProvider>
    </RichTooltipContext.Provider>
  );
};

export type RichTooltipActionProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Keep the tooltip open after the action runs. By default it closes. */
  keepOpen?: boolean;
};

/**
 * Text button for a rich tooltip's actions: primary label-large text with a
 * primary state layer (spec §4.1). Closes the tooltip unless `keepOpen` is
 * set or the click handler calls `preventDefault()`.
 */
export const RichTooltipAction: Component<RichTooltipActionProps> = (props) => {
  const [local, rest] = splitProps(props, ['keepOpen', 'onClick', 'class', 'children']);
  const tooltip = useContext(RichTooltipContext);
  return (
    <button
      type="button"
      {...rest}
      class={local.class ? `${styles.action} ${local.class}` : styles.action}
      onClick={(e) => {
        if (typeof local.onClick === 'function') local.onClick(e);
        else if (Array.isArray(local.onClick)) local.onClick[0](local.onClick[1], e);
        if (!local.keepOpen && !e.defaultPrevented) tooltip?.close('action');
      }}
    >
      <Ripple />
      {local.children}
    </button>
  );
};
