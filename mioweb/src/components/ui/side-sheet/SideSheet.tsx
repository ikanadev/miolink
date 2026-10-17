import { Dialog as ArkDialog, useDialogContext } from '@ark-ui/solid/dialog';
import {
  createContext,
  createEffect,
  createSignal,
  on,
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
import styles from './side-sheet.module.css';

export type SideSheetVariant = 'modal' | 'standard';
export type SideSheetCloseReason = 'scrim' | 'escape' | 'close-button' | 'action';
/** Logical edge the sheet is anchored to. `end` (default) is the right edge, the left one in RTL. */
export type SideSheetSide = 'end' | 'start';
export type SideSheetDir = 'ltr' | 'rtl';

const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

/** Spec: 256px default width, 400px max. */
const DEFAULT_WIDTH = 256;
const MAX_WIDTH = 400;

type SheetState = {
  variant: Accessor<SideSheetVariant>;
  busy: Accessor<boolean>;
  dir: Accessor<SideSheetDir | undefined>;
  setReason: (reason: SideSheetCloseReason) => void;
  setHeadlineEl: (el: HTMLElement | undefined) => void;
  setContentEl: (el: HTMLElement | undefined) => void;
};

const SheetContext = createContext<SheetState>();

const useSheet = (): SheetState => {
  const state = useContext(SheetContext);
  if (!state) throw new Error('SideSheet parts must be inside <SideSheet.Root>.');
  return state;
};

// ---- Root ----

export type SideSheetRootProps = {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Called when the user opens or closes the sheet. With `open` controlled,
   * not setting it to false cancels the close. `reason` says what closed it.
   */
  onOpenChange?: (open: boolean, reason?: SideSheetCloseReason) => void;
  /**
   * Default `modal`: rendered in a portal above a scrim, traps focus, locks
   * page scroll, inert background. `standard` renders in place, in the
   * layout flow: put it in a flex row next to the main content
   * (`flex: 1; min-inline-size: 0`), which shrinks as the sheet opens.
   */
  variant?: SideSheetVariant;
  /** Default true. False keeps the sheet open on Escape and scrim clicks (close button and actions still close it). */
  dismissible?: boolean;
  /** Close on Escape. Default: true for modal sheets, false for standard ones. */
  closeOnEscape?: boolean;
  /** A save is running: nothing closes the sheet (actions included) and the container is aria-busy. */
  busy?: boolean;
  /**
   * Element to focus on open. Default: the headline (`tabindex="-1"`), or
   * the first focusable element without one. Standard sheets that are open
   * on mount don't move focus.
   */
  initialFocusEl?: () => HTMLElement | null;
  /** Element to focus on close. Default: the element focused before opening (the trigger). */
  finalFocusEl?: () => HTMLElement | null;
  /**
   * Text direction. Default: inherited where a standard sheet is rendered,
   * the document's direction for a modal one (its portal leaves the
   * subtree). Set it when only part of the page is RTL.
   */
  dir?: SideSheetDir;
  /** Mount content on first open. Default true. */
  lazyMount?: boolean;
  /** Unmount content after closing, so form and scroll state reset. Default true. */
  unmountOnExit?: boolean;
  onExitComplete?: () => void;
  children?: JSX.Element;
};

/**
 * Holds the open state and behavior (Ark UI `Dialog`): focus trap, initial
 * and returned focus, Escape, scroll lock and inert background (modal).
 */
export const SideSheetRoot = (props: SideSheetRootProps) => {
  const [innerOpen, setInnerOpen] = createSignal(props.defaultOpen ?? false);
  const open = () => props.open ?? innerOpen();
  const variant = () => props.variant ?? 'modal';
  const modal = () => variant() === 'modal';
  const busy = () => !!props.busy;
  const dismissible = () => !busy() && (props.dismissible ?? true);

  // What triggered the next onOpenChange. Ark reports the close without it.
  let reason: SideSheetCloseReason | undefined;
  let reasonTimer: number | undefined;
  const setReason = (next: SideSheetCloseReason) => {
    reason = next;
    clearTimeout(reasonTimer);
    reasonTimer = window.setTimeout(() => (reason = undefined));
  };
  onCleanup(() => clearTimeout(reasonTimer));

  const [headlineEl, setHeadlineEl] = createSignal<HTMLElement>();
  const [contentEl, setContentEl] = createSignal<HTMLElement>();

  // Standard sheets aren't trapped, so Ark neither skips the initial focus
  // for a sheet that is open on mount nor returns focus on close: handle both here.
  let skipInitialFocus = open();
  let opener: HTMLElement | null = null;
  createEffect(
    on(open, (isOpen, wasOpen) => {
      if (wasOpen === undefined || modal()) return;
      if (isOpen) {
        skipInitialFocus = false;
        opener = document.activeElement as HTMLElement | null;
      } else if (wasOpen) {
        const content = contentEl();
        const active = document.activeElement;
        const lost = !active || active === document.body || !!content?.contains(active);
        const target = props.finalFocusEl?.() ?? opener;
        if (lost && target?.isConnected) target.focus({ preventScroll: true });
        opener = null;
      }
    }),
  );

  const initialFocusEl = (): HTMLElement | null => {
    const custom = props.initialFocusEl?.();
    if (custom) return custom;
    // `false` tells Ark not to move focus (its type doesn't list it).
    if (!modal() && skipInitialFocus) return false as unknown as null;
    return headlineEl() ?? null;
  };

  const state: SheetState = {
    variant,
    busy,
    dir: () => props.dir,
    setReason,
    setHeadlineEl,
    setContentEl,
  };

  return (
    <SheetContext.Provider value={state}>
      <ArkDialog.Root
        open={open()}
        role="dialog"
        modal={modal()}
        trapFocus={modal()}
        preventScroll={modal()}
        restoreFocus
        initialFocusEl={initialFocusEl}
        finalFocusEl={props.finalFocusEl}
        lazyMount={props.lazyMount ?? true}
        unmountOnExit={props.unmountOnExit ?? true}
        onExitComplete={props.onExitComplete}
        closeOnEscape={dismissible() && (props.closeOnEscape ?? modal())}
        closeOnInteractOutside={dismissible() && modal()}
        onEscapeKeyDown={() => setReason('escape')}
        onInteractOutside={() => {
          if (modal()) setReason('scrim');
        }}
        onOpenChange={(details) => {
          const why = reason;
          reason = undefined;
          if (!details.open && busy()) return;
          setInnerOpen(details.open);
          props.onOpenChange?.(details.open, details.open ? undefined : why);
        }}
      >
        {props.children}
      </ArkDialog.Root>
    </SheetContext.Provider>
  );
};

// ---- Trigger ----

export type SideSheetTriggerProps = ArkDialog.TriggerProps;

/**
 * Opens (or, for a standard sheet, toggles) the sheet; focus returns to it on
 * close. Usually a button through `asChild`:
 * `<SideSheet.Trigger asChild={(p) => <Button {...p()}>Filters</Button>} />`.
 */
export const SideSheetTrigger = (props: SideSheetTriggerProps) => <ArkDialog.Trigger {...props} />;

// ---- Content ----

export type SideSheetContentProps = Omit<ArkDialog.ContentProps, 'title' | 'children' | 'dir'> & {
  /** Title in the header. Names the sheet (aria-labelledby) and gets initial focus; without one, pass `aria-label`. */
  headline?: JSX.Element;
  children?: JSX.Element;
  /**
   * Bottom actions (Save, Cancel), start-aligned under a divider. Wrap
   * closing ones in `SideSheet.Close`.
   */
  actions?: JSX.Element;
  /** Divider above the actions. Default true. */
  actionsDivider?: boolean;
  /** Standard docked sheets: a divider on the edge facing the main content. Default true. */
  divider?: boolean;
  /** Shows a back button at the start of the header (in-sheet navigation) and is called when it's pressed. */
  onBack?: () => void;
  /** Accessible name of the back button. Default "Back". */
  backLabel?: string;
  /** Accessible name of the close button (always present, spec §8). Default "Close". */
  closeLabel?: string;
  /** Default `end`: the right edge, the left one in RTL. */
  side?: SideSheetSide;
  /** Inset 16px from the window edges with all corners rounded. */
  detached?: boolean;
  /** Width in px. Default 256, capped at 400 and the window width. */
  width?: number;
  /** No side padding in the body, for full-bleed content such as lists. */
  flush?: boolean;
};

/**
 * The sheet: a header (optional back button, headline, close button), the
 * scrolling body and optional actions. Modal sheets render with the scrim
 * in a portal; standard ones render in place.
 */
export const SideSheetContent = (props: SideSheetContentProps) => {
  const [local, rest] = splitProps(props, [
    'headline',
    'children',
    'actions',
    'actionsDivider',
    'divider',
    'onBack',
    'backLabel',
    'closeLabel',
    'side',
    'detached',
    'width',
    'flush',
    'class',
    'style',
    'ref',
  ]);
  const sheet = useSheet();
  const api = useDialogContext();
  const [inheritedDir, setInheritedDir] = createSignal<SideSheetDir>();

  const modal = () => sheet.variant() === 'modal';
  // Ark sets dir="ltr" on its parts unless a LocaleProvider says otherwise.
  const dir = () => sheet.dir() ?? inheritedDir() ?? 'ltr';
  const side = () => local.side ?? 'end';
  const hasHeadline = () => 'headline' in props && props.headline !== undefined;
  const hasActions = () => 'actions' in props && props.actions !== undefined;
  const width = () => Math.min(Math.max(local.width ?? DEFAULT_WIDTH, 0), MAX_WIDTH);
  const headlineTitle = () => (typeof local.headline === 'string' ? local.headline : undefined);

  const close = () => {
    if (sheet.busy()) return;
    sheet.setReason('close-button');
    api().setOpen(false);
  };

  const attrs = () => ({
    'data-variant': sheet.variant(),
    'data-side': side(),
    'data-detached': local.detached ? '' : undefined,
  });

  const positioner = () => (
    <ArkDialog.Positioner
      ref={(el: HTMLDivElement) =>
        queueMicrotask(() => {
          const parent = el.parentElement ?? document.documentElement;
          setInheritedDir(getComputedStyle(parent).direction === 'rtl' ? 'rtl' : 'ltr');
        })
      }
      class={styles.positioner}
      dir={dir()}
      data-state={api().open ? 'open' : 'closed'}
      style={{ '--_width': `${width()}px` }}
      {...attrs()}
    >
      <ArkDialog.Content
        {...rest}
        ref={(el: HTMLDivElement) => {
          sheet.setContentEl(el);
          if (typeof local.ref === 'function') (local.ref as (el: HTMLDivElement) => void)(el);
        }}
        class={cx(styles.container, local.class)}
        style={local.style}
        dir={dir()}
        {...attrs()}
        data-divider={!modal() && local.divider !== false ? '' : undefined}
        data-back={local.onBack ? '' : undefined}
        data-flush={local.flush ? '' : undefined}
        aria-busy={sheet.busy() ? 'true' : undefined}
      >
        <div class={styles.header}>
          <Show when={local.onBack}>
            {(onBack) => (
              <IconButton
                color="standard"
                icon="arrow_back"
                mirror
                label={local.backLabel ?? 'Back'}
                onClick={() => onBack()()}
              />
            )}
          </Show>
          <Show when={hasHeadline()} fallback={<span class={styles.spacer} />}>
            <ArkDialog.Title
              ref={(el: HTMLHeadingElement) => sheet.setHeadlineEl(el)}
              class={styles.headline}
              tabIndex={-1}
              title={headlineTitle()}
            >
              {local.headline}
            </ArkDialog.Title>
          </Show>
          <IconButton
            color="standard"
            icon="close"
            label={local.closeLabel ?? 'Close'}
            aria-disabled={sheet.busy() ? 'true' : undefined}
            onClick={close}
          />
        </div>

        <SheetBody>{local.children}</SheetBody>

        <Show when={hasActions()}>
          <Show when={local.actionsDivider !== false}>
            <hr class={styles.divider} aria-hidden="true" />
          </Show>
          <div class={styles.actions}>{local.actions}</div>
        </Show>
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  );

  onCleanup(() => {
    sheet.setHeadlineEl(undefined);
    sheet.setContentEl(undefined);
  });

  return (
    <Show when={modal()} fallback={positioner()}>
      <Portal>
        <ArkDialog.Backdrop class={styles.scrim} dir={dir()} />
        {positioner()}
      </Portal>
    </Show>
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

export type SideSheetCloseProps = {
  /**
   * Renders the closing element, usually a Button:
   * `asChild={(p) => <Button {...p()}>Cancel</Button>}`.
   */
  asChild: (props: () => SideSheetCloseChildProps) => JSX.Element;
  /** Runs before closing; `preventDefault()` keeps the sheet open. */
  onClick?: (event: MouseEvent) => void;
};

export type SideSheetCloseChildProps = {
  'aria-disabled'?: 'true';
  onClick: (event: MouseEvent) => void;
};

/**
 * Closes the sheet with reason `action` (a button inside it). Ignored (and
 * marked aria-disabled) while the sheet is busy.
 */
export const SideSheetClose = (props: SideSheetCloseProps) => {
  const sheet = useSheet();
  const api = useDialogContext();
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
      api().setOpen(false);
    },
  }));
};

/**
 * M3 side sheet: modal
 * (portal, scrim, focus trap) and standard (in the layout flow, the main
 * content shrinks to make room), docked or detached, on the inline-end edge
 * (or start), with a header (back, headline, close), a scrolling body and
 * optional bottom actions. Behavior is Ark UI `Dialog`.
 *
 * ```tsx
 * <SideSheet.Root open={open()} onOpenChange={setOpen} busy={saving()}>
 *   <SideSheet.Content
 *     headline="Filters"
 *     actions={<>
 *       <Button color="filled" onClick={save}>Save</Button>
 *       <SideSheet.Close asChild={(p) => <Button {...p()} color="outlined">Cancel</Button>} />
 *     </>}
 *   >
 *     ...
 *   </SideSheet.Content>
 * </SideSheet.Root>
 * ```
 */
export const SideSheet = {
  Root: SideSheetRoot,
  Trigger: SideSheetTrigger,
  Content: SideSheetContent,
  Close: SideSheetClose,
  /** Ark's dialog API (open, setOpen) as a render prop. */
  Context: ArkDialog.Context,
};
