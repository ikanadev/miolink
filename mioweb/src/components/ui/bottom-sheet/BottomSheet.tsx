import { Drawer, useDrawer, type UseDrawerReturn } from '@ark-ui/solid/drawer';
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { IconButton } from '../buttons/icon-button';
import { Ripple } from '../shared/Ripple';
import styles from './bottom-sheet.module.css';

export type BottomSheetVariant = 'modal' | 'standard';
export type BottomSheetCloseReason = 'scrim' | 'escape' | 'swipe' | 'handle' | 'close-button' | 'action';
/**
 * A preset height: a fraction of the window height (`0.5`), pixels (`320`
 * or `'320px'`) or rem (`'20rem'`). Capped at the content's height.
 */
export type BottomSheetDetent = number | `${number}px` | `${number}rem`;

const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

/** Spec: a modal sheet opens at no more than 50% of the screen height. */
const DEFAULT_DETENTS: BottomSheetDetent[] = [0.5, 1];

type ResolvedDetent = { value: BottomSheetDetent; height: number };

/** Same resolution as Ark's drawer (zag `resolveSnapPoint`), deduped the same way. */
const resolveDetents = (detents: BottomSheetDetent[], contentSize: number): ResolvedDetent[] => {
  const html = document.documentElement;
  const viewport = html.clientHeight;
  const max = Math.min(contentSize, viewport);
  if (!(max > 0)) return [];
  const rootFont = parseFloat(getComputedStyle(html).fontSize) || 16;
  const points: ResolvedDetent[] = [];
  for (const value of detents) {
    let px: number;
    if (typeof value === 'number') px = value <= 1 ? Math.max(0, value) * viewport : value;
    else if (value.endsWith('rem')) px = parseFloat(value) * rootFont;
    else px = parseFloat(value);
    if (!Number.isFinite(px)) continue;
    points.push({ value, height: Math.min(Math.max(px, 0), max) });
  }
  // Keep the last of points within 1px of each other, like Ark.
  const deduped: ResolvedDetent[] = [];
  for (let i = points.length - 1; i >= 0; i--) {
    if (!deduped.some((p) => Math.abs(p.height - points[i].height) <= 1)) deduped.unshift(points[i]);
  }
  return deduped.sort((a, b) => a.height - b.height);
};

type SheetState = {
  api: UseDrawerReturn;
  variant: Accessor<BottomSheetVariant>;
  detents: Accessor<BottomSheetDetent[]>;
  dismissible: Accessor<boolean>;
  busy: Accessor<boolean>;
  setReason: (reason: BottomSheetCloseReason) => void;
  /** True once the current pointer press turned into a drag (ignores the click that follows). */
  dragged: () => boolean;
  resetDragged: () => void;
};

const SheetContext = createContext<SheetState>();

const useSheet = (): SheetState => {
  const state = useContext(SheetContext);
  if (!state) throw new Error('BottomSheet parts must be inside <BottomSheet.Root>.');
  return state;
};

// ---- Root ----

export type BottomSheetRootProps = {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Called when the user opens or closes the sheet. With `open` controlled,
   * not setting it to false cancels the close (the sheet snaps back after a
   * swipe). `reason` says what closed it.
   */
  onOpenChange?: (open: boolean, reason?: BottomSheetCloseReason) => void;
  /**
   * Default `modal`: above a scrim, traps focus, locks page scroll, inert
   * background. `standard` coexists with the page: no scrim, no focus trap.
   */
  variant?: BottomSheetVariant;
  /**
   * Preset heights, lowest to highest. Default `[0.5, 1]`: opens at half the
   * window (or the content's height if shorter) and can be pulled to full
   * height. Detents taller than the content collapse into one.
   */
  detents?: BottomSheetDetent[];
  /** Controlled current detent (one of `detents`). */
  detent?: BottomSheetDetent;
  /** Initial detent. Default: the first one. */
  defaultDetent?: BottomSheetDetent;
  onDetentChange?: (detent: BottomSheetDetent) => void;
  /**
   * Default true. False keeps the sheet open on Escape, scrim clicks, swipes
   * and the handle; only actions (`BottomSheet.Close`) close it.
   */
  dismissible?: boolean;
  /** Close on Escape. Default: true for modal sheets, false for standard ones. */
  closeOnEscape?: boolean;
  /** A save is running: nothing closes the sheet (actions included) and the container is aria-busy. */
  busy?: boolean;
  /** Element to focus on open. Default: the first focusable element (the drag handle). */
  initialFocusEl?: () => HTMLElement | null;
  /** Mount content on first open. Default true. */
  lazyMount?: boolean;
  /** Unmount content after closing, so form state resets. Default true. */
  unmountOnExit?: boolean;
  onExitComplete?: () => void;
  children?: JSX.Element;
};

/**
 * Holds the open state and behavior (Ark UI `Drawer`, swiping down): drag to
 * resize between detents and to dismiss, focus trap, initial and returned
 * focus, Escape, scroll lock and inert background (modal).
 */
export const BottomSheetRoot = (props: BottomSheetRootProps) => {
  const [innerOpen, setInnerOpen] = createSignal(props.defaultOpen ?? false);
  const open = () => props.open ?? innerOpen();
  const variant = () => props.variant ?? 'modal';
  const modal = () => variant() === 'modal';
  const busy = () => !!props.busy;
  const dismissible = () => !busy() && (props.dismissible ?? true);
  const detents = () => (props.detents?.length ? props.detents : DEFAULT_DETENTS);

  // What triggered the next onOpenChange. Ark reports the close without it.
  let reason: BottomSheetCloseReason | undefined;
  let reasonTimer: number | undefined;
  const setReason = (next: BottomSheetCloseReason) => {
    reason = next;
    clearTimeout(reasonTimer);
    reasonTimer = window.setTimeout(() => (reason = undefined));
  };
  onCleanup(() => clearTimeout(reasonTimer));

  // Plain variables: read inside Ark's callbacks, which run before effects.
  let dragging = false;
  let dragged = false;

  const id = createUniqueId();
  const api = useDrawer(() => ({
    id,
    open: open(),
    modal: modal(),
    trapFocus: modal(),
    preventScroll: modal(),
    restoreFocus: true,
    swipeDirection: 'down' as const,
    snapPoints: detents(),
    snapPoint: props.detent,
    defaultSnapPoint: props.defaultDetent ?? detents()[0],
    initialFocusEl: props.initialFocusEl,
    closeOnEscape: dismissible() && (props.closeOnEscape ?? modal()),
    closeOnInteractOutside: dismissible() && modal(),
    onEscapeKeyDown: () => setReason('escape'),
    onInteractOutside: () => setReason('scrim'),
    onSnapPointChange: (details) => props.onDetentChange?.(details.snapPoint as BottomSheetDetent),
    onOpenChange: (details) => {
      const why = !details.open && dragging ? 'swipe' : reason;
      reason = undefined;
      // A swipe is a dismissal like Escape or the scrim.
      if (!details.open && (busy() || (why === 'swipe' && !dismissible()))) return;
      setInnerOpen(details.open);
      props.onOpenChange?.(details.open, details.open ? undefined : why);
    },
  }));

  createEffect(() => {
    dragging = api().dragging;
    if (dragging) dragged = true;
  });

  const state: SheetState = {
    api,
    variant,
    detents,
    dismissible,
    busy,
    setReason,
    dragged: () => dragged,
    resetDragged: () => (dragged = false),
  };

  return (
    <SheetContext.Provider value={state}>
      <Drawer.RootProvider
        value={api}
        lazyMount={props.lazyMount ?? true}
        unmountOnExit={props.unmountOnExit ?? true}
        onExitComplete={props.onExitComplete}
      >
        {props.children}
      </Drawer.RootProvider>
    </SheetContext.Provider>
  );
};

// ---- Trigger ----

export type BottomSheetTriggerProps = Drawer.TriggerProps;

/**
 * Opens the sheet; focus returns to it on close. Usually a button through
 * `asChild`: `<BottomSheet.Trigger asChild={(p) => <Button {...p()}>Share</Button>} />`.
 */
export const BottomSheetTrigger = (props: BottomSheetTriggerProps) => <Drawer.Trigger {...props} />;

// ---- Content ----

export type BottomSheetContentProps = Omit<Drawer.ContentProps, 'title' | 'children' | 'draggable'> & {
  /** Title in a header row under the handle. Names the sheet (aria-labelledby); without one, pass `aria-label`. */
  headline?: JSX.Element;
  children?: JSX.Element;
  /** Show the drag handle (top 48px). Default true. Without it and with several detents, add your own control. */
  dragHandle?: boolean;
  /**
   * Default true: the whole sheet can be dragged (like Compose's
   * ModalBottomSheet), except text fields, scrolled content and
   * `[data-no-drag]`. False: only the handle region drags.
   */
  draggable?: boolean;
  /** Minimized (docked) state: square corners. */
  minimized?: boolean;
  /** Max width in px. Default 640. */
  maxWidth?: number;
  /** Accessible name of the drag handle. Default "Resize sheet" (or "Close sheet" with a single detent). */
  handleLabel?: string;
  /** Full-height modal sheets: accessible name of the close button. Default "Close". */
  closeLabel?: string;
  /** Full-height standard sheets: accessible name of the collapse button. Default "Collapse". */
  collapseLabel?: string;
};

/**
 * The scrim (modal) and the sheet, rendered in a portal: the drag handle,
 * an optional header (headline; at full height a close button for modal
 * sheets or a collapse button for standard ones) and the scrolling body.
 */
export const BottomSheetContent = (props: BottomSheetContentProps) => {
  const [local, rest] = splitProps(props, [
    'headline',
    'children',
    'dragHandle',
    'draggable',
    'minimized',
    'maxWidth',
    'handleLabel',
    'closeLabel',
    'collapseLabel',
    'class',
    'style',
    'ref',
  ]);
  const sheet = useSheet();
  const api = sheet.api;
  const descriptionId = createUniqueId();
  const [atMaxHeight, setAtMaxHeight] = createSignal(false);
  const [contentEl, setContentEl] = createSignal<HTMLDivElement>();

  const modal = () => sheet.variant() === 'modal';
  const resolved = () => {
    const size = api().getContentSize();
    return size ? resolveDetents(sheet.detents(), size) : [];
  };
  const currentIndex = (points: ResolvedDetent[]) => {
    const value = api().snapPoint;
    const exact = points.findIndex((p) => Object.is(p.value, value));
    if (exact !== -1) return exact;
    // A detent merged into a taller one (content shorter than it).
    const size = api().getContentSize() ?? 0;
    const height = size * api().getOpenPercentage();
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.height - height) < Math.abs(points[best].height - height)) best = i;
    });
    return best;
  };
  const single = () => resolved().length <= 1;
  // Expanded (no snap offset) and as tall as the window allows.
  const full = () => api().open && atMaxHeight() && !api().dragging && api().getOpenPercentage() > 0.999;

  const heightText = () => {
    const points = resolved();
    if (points.length <= 1) return undefined;
    const i = currentIndex(points);
    return i === points.length - 1 ? 'Expanded' : i === 0 ? 'Collapsed' : 'Partially expanded';
  };

  const close = (why: BottomSheetCloseReason) => {
    if (!sheet.dismissible()) return;
    sheet.setReason(why);
    api().setOpen(false);
  };

  /** Spec: selecting the handle cycles the preset heights, or closes with only one. */
  const onHandleClick = () => {
    if (sheet.dragged()) {
      sheet.resetDragged();
      return;
    }
    const points = resolved();
    if (points.length <= 1) {
      close('handle');
      return;
    }
    const next = points[(currentIndex(points) + 1) % points.length];
    api().setSnapPoint(next.value);
  };

  const collapse = () => {
    const first = resolved()[0];
    if (first) api().setSnapPoint(first.value);
  };

  const showAction = () => full() && (modal() || !single());
  const hasHeadline = () => 'headline' in props && props.headline !== undefined;
  const hasHeader = () => hasHeadline() || showAction();

  // Tracks whether the sheet reached its max height (window minus the top margin).
  createEffect(() => {
    const el = contentEl();
    if (!el) return;
    const update = () => {
      const max = parseFloat(getComputedStyle(el).maxBlockSize);
      setAtMaxHeight(Number.isFinite(max) && el.offsetHeight >= max - 1);
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    update();
    onCleanup(() => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    });
  });

  return (
    <Portal>
      <Show when={modal()}>
        <Drawer.Backdrop class={styles.scrim} />
      </Show>
      <Drawer.Positioner class={styles.positioner} data-variant={sheet.variant()}>
        <Drawer.Content
          {...rest}
          ref={(el: HTMLDivElement) => {
            setContentEl(el);
            if (typeof local.ref === 'function') (local.ref as (el: HTMLDivElement) => void)(el);
          }}
          draggable={local.draggable ?? true}
          class={cx(styles.container, local.class)}
          style={
            local.maxWidth
              ? { ...(typeof local.style === 'object' ? local.style : {}), '--_max-width': `${local.maxWidth}px` }
              : local.style
          }
          role={modal() ? undefined : 'region'}
          data-variant={sheet.variant()}
          data-minimized={local.minimized ? '' : undefined}
          data-handle={local.dragHandle !== false ? '' : undefined}
          data-header={hasHeader() ? '' : undefined}
          data-full={full() ? '' : undefined}
          aria-busy={sheet.busy() ? 'true' : undefined}
        >
          <Show when={local.dragHandle !== false}>
            <Drawer.Grabber class={styles.handleRegion}>
              <button
                type="button"
                class={styles.handle}
                aria-label={local.handleLabel ?? (single() ? 'Close sheet' : 'Resize sheet')}
                aria-describedby={heightText() ? descriptionId : undefined}
                aria-disabled={single() && !sheet.dismissible() ? 'true' : undefined}
                onPointerDown={() => sheet.resetDragged()}
                onClick={onHandleClick}
              >
                <Ripple />
                <Drawer.GrabberIndicator class={styles.handleBar} aria-hidden="true" />
              </button>
              <span id={descriptionId} class={styles.srOnly}>
                {heightText()}
              </span>
            </Drawer.Grabber>
          </Show>

          <Show when={hasHeader()}>
            <div class={styles.header}>
              <Show when={hasHeadline()}>
                <Drawer.Title class={styles.headline}>{local.headline}</Drawer.Title>
              </Show>
              <Show when={showAction()}>
                <div class={styles.headerAction}>
                  <Show
                    when={modal()}
                    fallback={
                      <IconButton
                        color="standard"
                        icon="expand_more"
                        label={local.collapseLabel ?? 'Collapse'}
                        onClick={collapse}
                      />
                    }
                  >
                    <IconButton
                      color="standard"
                      icon="close"
                      label={local.closeLabel ?? 'Close'}
                      aria-disabled={sheet.busy() ? 'true' : undefined}
                      onClick={() => close('close-button')}
                    />
                  </Show>
                </div>
              </Show>
            </div>
          </Show>

          <SheetBody>{local.children}</SheetBody>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  );
};

/** The scrolling region. Focusable while it overflows so keyboard users can scroll it. */
const SheetBody = (props: { children: JSX.Element }) => {
  let el!: HTMLDivElement;
  const [overflow, setOverflow] = createSignal(false);
  onMount(() => {
    const update = () => setOverflow(el.scrollHeight > el.clientHeight + 1);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const mutation = new MutationObserver(update);
    mutation.observe(el, { childList: true, subtree: true, characterData: true });
    onCleanup(() => {
      observer.disconnect();
      mutation.disconnect();
    });
  });
  return (
    <div ref={el} class={styles.body} tabIndex={overflow() ? 0 : undefined}>
      {props.children}
    </div>
  );
};

// ---- Close ----

export type BottomSheetCloseProps = {
  /**
   * Renders the closing element, usually a Button or ListItem:
   * `asChild={(p) => <Button {...p()}>Cancel</Button>}`.
   */
  asChild: (props: () => BottomSheetCloseChildProps) => JSX.Element;
  /** Runs before closing; `preventDefault()` keeps the sheet open. */
  onClick?: (event: MouseEvent) => void;
};

export type BottomSheetCloseChildProps = {
  'aria-disabled'?: 'true';
  onClick: (event: MouseEvent) => void;
};

/**
 * Closes the sheet with reason `action` (an item or button inside it).
 * Ignored (and marked aria-disabled) while the sheet is busy.
 */
export const BottomSheetClose = (props: BottomSheetCloseProps) => {
  const sheet = useSheet();
  return props.asChild(() => ({
    'aria-disabled': sheet.busy() ? 'true' : undefined,
    onClick: (event: MouseEvent) => {
      if (sheet.busy()) {
        event.preventDefault();
        return;
      }
      props.onClick?.(event);
      if (event.defaultPrevented) return;
      sheet.setReason('action');
      sheet.api().setOpen(false);
    },
  }));
};

/**
 * M3 bottom sheet:
 * modal (scrim, focus trap) and standard (coexists with the page), with a
 * drag handle that cycles the detents, drag to resize and swipe to dismiss,
 * and a close/collapse button at full height. Behavior is Ark UI `Drawer`.
 *
 * ```tsx
 * <BottomSheet.Root open={open()} onOpenChange={setOpen} busy={saving()}>
 *   <BottomSheet.Content headline="Add link">
 *     <form>...</form>
 *   </BottomSheet.Content>
 * </BottomSheet.Root>
 * ```
 */
export const BottomSheet = {
  Root: BottomSheetRoot,
  Trigger: BottomSheetTrigger,
  Content: BottomSheetContent,
  Close: BottomSheetClose,
  /** Ark's drawer API (open, setOpen, snapPoint, setSnapPoint) as a render prop. */
  Context: Drawer.Context,
};
