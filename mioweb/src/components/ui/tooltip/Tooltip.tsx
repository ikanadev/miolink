import { Tooltip as ArkTooltip, useTooltip } from '@ark-ui/solid/tooltip';
import {
  createEffect,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  splitProps,
  type Component,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import styles from './tooltip.module.css';
import {
  accessibleName,
  claimOpen,
  createLongPress,
  HIDE_DELAY,
  OVERFLOW_PADDING,
  releaseOpen,
  renderTrigger,
  sameText,
  SHOW_DELAY,
  type TooltipCloseReason,
  type TooltipOpenChangeDetails,
  type TooltipPlacement,
  type TooltipTriggerAttrs,
  type TooltipTriggerProps,
} from './trigger';

/**
 * How the tooltip relates to the trigger for assistive technology (M3
 * Tooltips and Icon buttons, Accessibility):
 * - `description`: `aria-describedby` while open (extra information).
 * - `label`: `aria-labelledby`; the tooltip is the trigger's name.
 * - `none`: the tooltip repeats the trigger's name, so it's `aria-hidden`.
 * - `auto` (default): `none` when the label equals the trigger's accessible
 *   name, `label` when the trigger has no name, else `description`.
 */
export type TooltipAriaRelation = 'auto' | 'description' | 'label' | 'none';

export type TooltipProps = {
  /** One short line. For an icon button, its action ("Back", "Settings"). */
  label: string;
  /** The trigger: a single element, e.g. `<IconButton />`. */
  children?: JSX.Element;
  /** Render-prop alternative to `children`: `{(t) => <IconButton {...t()} />}`. */
  asChild?: (props: TooltipTriggerProps) => JSX.Element;
  /** Default `top` (`bottom` inside a `<header>`, e.g. an app bar). */
  placement?: TooltipPlacement;
  /** Gap to the trigger: 4px with a visual boundary (default), 8px without (text). */
  offset?: number;
  /** Hover delay before showing, in ms. Default 500. Focus shows immediately. */
  showDelay?: number;
  /**
   * Delay before hiding after the pointer leaves, in ms. Default 1500.
   * Keyboard blur hides at once: Ark closes on the trigger's blur, and
   * holding that off would also swallow the trigger's own blur handlers.
   */
  hideDelay?: number;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
  disabled?: boolean;
  ariaRelation?: TooltipAriaRelation;
  /** Class for the tooltip container. */
  class?: string;
};

/**
 * M3 plain tooltip: a one-line
 * inverse-surface label shown on hover, keyboard focus or long-press. Built
 * on Ark UI `Tooltip`; the trigger keeps its own markup (Ark `asChild`).
 *
 *   <Tooltip label="Back"><IconButton icon="arrow_back" label="Back" /></Tooltip>
 */
export const Tooltip: Component<TooltipProps> = (props) => {
  const [local] = splitProps(props, [
    'label',
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
    'ariaRelation',
    'class',
  ]);

  const id = createUniqueId();
  const contentId = `tooltip-${id}`;
  const [trigger, setTrigger] = createSignal<HTMLElement>();
  const [detected, setDetected] = createSignal<Exclude<TooltipAriaRelation, 'auto'>>('description');
  const [longPressed, setLongPressed] = createSignal(false);
  let reason: TooltipCloseReason | undefined;
  let wasOpen = !!(props.open ?? props.defaultOpen);
  let releaseTimer: number | undefined;

  const relation = () =>
    !local.ariaRelation || local.ariaRelation === 'auto' ? detected() : local.ariaRelation;

  const detect = () => {
    const el = trigger();
    if (!el) return;
    const name = accessibleName(el, contentId);
    setDetected(!name ? 'label' : sameText(name, local.label) ? 'none' : 'description');
  };
  createEffect(on([trigger, () => local.label], () => queueMicrotask(detect)));

  const entry = {
    close: (why: TooltipCloseReason) => {
      reason = why;
      api().setOpen(false);
    },
  };

  const api = useTooltip(() => ({
    id,
    ids: { content: contentId },
    open: local.open,
    defaultOpen: local.defaultOpen,
    disabled: local.disabled,
    openDelay: local.showDelay ?? SHOW_DELAY,
    closeDelay: local.hideDelay ?? HIDE_DELAY,
    // A click after a long press shouldn't hide the tooltip it just showed.
    closeOnClick: !longPressed(),
    positioning: {
      placement: local.placement ?? (trigger()?.closest('header') ? 'bottom' : 'top'),
      gutter: local.offset ?? 4,
      overflowPadding: OVERFLOW_PADDING,
      flip: true,
      slide: true,
    },
    onOpenChange: ({ open }) => {
      if (open) reason = undefined;
      // Ark also reports a close when a pending open is cancelled, and an
      // open when the pointer comes back during the hide delay.
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) {
        detect();
        claimOpen(entry);
      } else {
        releaseOpen(entry);
      }
      local.onOpenChange?.(open ? { open } : { open, reason: reason ?? 'other' });
      reason = undefined;
    },
  }));

  onCleanup(() => {
    clearTimeout(releaseTimer);
    releaseOpen(entry);
  });

  const longPress = createLongPress(
    () => {
      setLongPressed(true);
      api().setOpen(true);
    },
    () => {
      clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => entry.close('pointerleave'), local.hideDelay ?? HIDE_DELAY);
    },
  );

  // Stable keys (see renderTrigger). Capture listeners run before Ark's
  // handlers, so the close reason is known when Ark closes the tooltip.
  const own = (): TooltipTriggerAttrs =>
    ({
      ref: setTrigger,
      // null removes Ark's aria-describedby (undefined would fall back to it).
      'aria-describedby': relation() === 'description' ? undefined : null,
      'aria-labelledby': relation() === 'label' ? contentId : undefined,
      'oncapture:pointerdown': (e: PointerEvent) => {
        reason = 'trigger';
        if (longPressed()) {
          setLongPressed(false);
          clearTimeout(releaseTimer);
          entry.close('trigger');
        }
        longPress.handlers.onPointerDown(e);
      },
      'oncapture:click': () => (reason = 'trigger'),
      'oncapture:pointerup': longPress.handlers.onPointerUp,
      'oncapture:pointercancel': longPress.handlers.onPointerCancel,
      'oncapture:contextmenu': longPress.handlers.onContextMenu,
      'oncapture:pointerleave': () => (reason = 'pointerleave'),
      'oncapture:focusout': () => (reason = 'blur'),
    }) as TooltipTriggerAttrs;

  // Escape is handled by Ark on document (capture); window capture runs first.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && api().open) reason = 'escape';
  };
  window.addEventListener('keydown', onKeyDown, true);
  onCleanup(() => window.removeEventListener('keydown', onKeyDown, true));

  return (
    <ArkTooltip.RootProvider value={api}>
      <ArkTooltip.Trigger
        asChild={(arkProps) => renderTrigger(arkProps, () => local.children, local.asChild, own)}
      />
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            class={local.class ? `${styles.content} ${local.class}` : styles.content}
            data-variant="plain"
            aria-hidden={relation() === 'none' ? 'true' : undefined}
          >
            {local.label}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.RootProvider>
  );
};
