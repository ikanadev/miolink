import { Dialog as ArkDialog, useDialogContext } from '@ark-ui/solid/dialog';
import {
  children as resolveChildren,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Button, type ButtonProps } from '../buttons/button';
import { Icon } from '../icon/Icon';
import { IconButton } from '../buttons/icon-button';
import styles from './dialog.module.css';

export type DialogVariant = 'basic' | 'full-screen';
export type DialogLayout = 'basic' | 'full-screen';
export type DialogPosition = 'center' | 'start' | 'end';
export type DialogCloseReason = 'escape' | 'scrim' | 'action' | 'close-button';
export type DialogDividers = 'auto' | 'always' | 'never';

const cx = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

/** Compact window class (spec: full-screen dialogs are for compact windows only). */
const COMPACT_QUERY = '(max-width: 599.98px)';

type DialogState = {
  layout: Accessor<DialogLayout>;
  position: Accessor<DialogPosition>;
  busy: Accessor<boolean>;
  setReason: (reason: DialogCloseReason) => void;
  setContentEl: (el: HTMLElement) => void;
};

const DialogStateContext = createContext<DialogState>();

const useDialogState = (): DialogState => {
  const state = useContext(DialogStateContext);
  if (!state) throw new Error('Dialog parts must be inside <Dialog.Root>.');
  return state;
};

// ---- Root ----

export type DialogRootProps = Omit<
  ArkDialog.RootProps,
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'role'
  | 'modal'
  | 'trapFocus'
  | 'preventScroll'
  | 'closeOnEscape'
  | 'closeOnInteractOutside'
> & {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Called when the user opens or closes the dialog. With `open` controlled,
   * not setting it to false cancels the close (e.g. to confirm discarding
   * changes). `reason` says what closed it.
   */
  onOpenChange?: (open: boolean, reason?: DialogCloseReason) => void;
  /**
   * Default `basic`. `full-screen` is full screen in compact windows (< 600px)
   * and swaps to a basic dialog in larger ones, keeping its state.
   */
  variant?: DialogVariant;
  /** Default `alertdialog` for basic dialogs, `dialog` for full-screen ones. Use `dialog` for forms. */
  role?: 'alertdialog' | 'dialog';
  /**
   * A save is running: Escape, the scrim and close actions don't close the
   * dialog, close actions are marked disabled and the container aria-busy.
   */
  busy?: boolean;
  /** Default true. False keeps the dialog open on Escape and scrim clicks (actions still close it). */
  dismissible?: boolean;
  /** Close on a scrim click. Default: true for `dialog`, false for `alertdialog` (a decision is required). */
  closeOnScrimClick?: boolean;
  /** Basic dialogs in medium and larger windows: horizontal placement, 56px from the edge. Default `center`. */
  position?: DialogPosition;
};

/**
 * Holds the open state and behavior (Ark UI `Dialog`): focus trap, initial
 * and returned focus, Escape, scroll lock and inert background. Content is
 * mounted only while open (`lazyMount` and `unmountOnExit` default to true),
 * so form state resets on reopen.
 */
export const DialogRoot = (props: DialogRootProps) => {
  const [local, rest] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'variant',
    'role',
    'busy',
    'dismissible',
    'closeOnScrimClick',
    'position',
    'onEscapeKeyDown',
    'onInteractOutside',
    'lazyMount',
    'unmountOnExit',
    'initialFocusEl',
    'children',
  ]);

  // Ark is always controlled, so a blocked close (busy) never closes it.
  const [innerOpen, setInnerOpen] = createSignal(local.defaultOpen ?? false);
  const open = () => local.open ?? innerOpen();

  const [compact, setCompact] = createSignal(false);
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(COMPACT_QUERY);
    setCompact(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mql.addEventListener('change', onChange);
    onCleanup(() => mql.removeEventListener('change', onChange));
  }

  const variant = () => local.variant ?? 'basic';
  const role = () => local.role ?? (variant() === 'basic' ? 'alertdialog' : 'dialog');
  const busy = () => !!local.busy;
  const dismissible = () => !busy() && (local.dismissible ?? true);

  // What triggered the next onOpenChange. Ark reports the close without it.
  let reason: DialogCloseReason | undefined;
  let reasonTimer: number | undefined;
  const setReason = (next: DialogCloseReason) => {
    reason = next;
    clearTimeout(reasonTimer);
    reasonTimer = window.setTimeout(() => (reason = undefined));
  };
  onCleanup(() => clearTimeout(reasonTimer));

  // Alertdialogs focus the first close action (the safest choice), like Ark's CloseTrigger.
  const [contentEl, setContentEl] = createSignal<HTMLElement>();
  const initialFocusEl = () =>
    local.initialFocusEl?.() ??
    (role() === 'alertdialog'
      ? contentEl()?.querySelector<HTMLElement>('[data-dialog-close]:not([aria-disabled="true"])')
      : undefined) ??
    null;

  const state: DialogState = {
    layout: () => (variant() === 'full-screen' && compact() ? 'full-screen' : 'basic'),
    position: () => local.position ?? 'center',
    busy,
    setReason,
    setContentEl,
  };

  return (
    <DialogStateContext.Provider value={state}>
      <ArkDialog.Root
        {...rest}
        open={open()}
        role={role()}
        initialFocusEl={initialFocusEl}
        lazyMount={local.lazyMount ?? true}
        unmountOnExit={local.unmountOnExit ?? true}
        closeOnEscape={dismissible()}
        closeOnInteractOutside={dismissible() && (local.closeOnScrimClick ?? role() === 'dialog')}
        onEscapeKeyDown={(e) => {
          setReason('escape');
          local.onEscapeKeyDown?.(e);
        }}
        onInteractOutside={(e) => {
          setReason('scrim');
          local.onInteractOutside?.(e);
        }}
        onOpenChange={(details) => {
          const why = reason;
          reason = undefined;
          if (!details.open && busy()) return;
          setInnerOpen(details.open);
          local.onOpenChange?.(details.open, details.open ? undefined : why);
        }}
      >
        {local.children}
      </ArkDialog.Root>
    </DialogStateContext.Provider>
  );
};

// ---- Trigger ----

export type DialogTriggerProps = ArkDialog.TriggerProps;

/**
 * Opens the dialog; focus returns to it on close. Usually a button through
 * `asChild`: `<Dialog.Trigger asChild={(p) => <Button {...p()}>Delete</Button>} />`.
 */
export const DialogTrigger = (props: DialogTriggerProps) => <ArkDialog.Trigger {...props} />;

// ---- Content ----

export type DialogContentProps = Omit<ArkDialog.ContentProps, 'title' | 'children'> & {
  /** Hero icon above the headline (Material Symbols name). Centers the icon, headline and supporting text. */
  icon?: string;
  /** Brief statement or question. It names the dialog (aria-labelledby); without one, pass `aria-label` to the root. */
  headline?: JSX.Element;
  /** Body copy, first in the scrolling region; describes the dialog (aria-describedby). */
  supportingText?: JSX.Element;
  /** Further content (lists, fields). Scrolls between the pinned headline and actions. */
  children?: JSX.Element;
  /**
   * Dismissive actions (`<DialogAction close>Cancel</DialogAction>`), at the
   * trailing edge of the actions row. Not shown in the full-screen layout,
   * where the close button replaces them.
   */
  actions?: JSX.Element;
  /**
   * The confirming action, closest to the trailing edge. In the full-screen
   * layout it moves to the header. Pass JSX inline: it's re-rendered when the
   * layout swaps.
   */
  confirmAction?: JSX.Element;
  /** Full-screen layout only: a 56px bottom action bar. */
  bottomBar?: JSX.Element;
  /** Stack the actions (long labels): confirming above dismissive. */
  stackedActions?: boolean;
  /** Dividers around the scrolling region. `auto` (default) shows them while the content overflows. */
  dividers?: DialogDividers;
  /** Accessible name of the full-screen close button. Default "Close". */
  closeLabel?: string;
};

/**
 * The scrim and the dialog container, rendered in a portal. Lays out the
 * headline (and icon) pinned at the top, the scrolling body, and the actions
 * pinned at the bottom; or, in the full-screen layout, a 56px header with the
 * close button, headline and confirming action.
 */
export const DialogContent = (props: DialogContentProps) => {
  const [local, rest] = splitProps(props, [
    'icon',
    'headline',
    'supportingText',
    'children',
    'actions',
    'confirmAction',
    'bottomBar',
    'stackedActions',
    'dividers',
    'closeLabel',
    'class',
    'ref',
  ]);
  const state = useDialogState();
  const [scrolled, setScrolled] = createSignal(false);
  const [overflow, setOverflow] = createSignal(false);

  const fullScreen = () => state.layout() === 'full-screen';
  // `in` checks the slots without rendering them (confirmAction renders in two places).
  const hasHeadline = () => 'headline' in props && props.headline !== undefined;
  const hasConfirm = () => 'confirmAction' in props;
  const actions = resolveChildren(() => local.actions);
  const hasActions = () => {
    const a = actions.toArray();
    return a.length > 0 || hasConfirm();
  };
  const hasHeader = () => !fullScreen() && (hasHeadline() || !!local.icon);
  const showActions = () => !fullScreen() && hasActions();

  const headline = (cls: string) => (
    <Show when={hasHeadline()}>
      <ArkDialog.Title class={cls}>{local.headline}</ArkDialog.Title>
    </Show>
  );

  return (
    <Portal>
      <ArkDialog.Backdrop class={styles.scrim} />
      <ArkDialog.Positioner
        class={styles.positioner}
        data-layout={state.layout()}
        data-position={state.position()}
      >
        <ArkDialog.Content
          {...rest}
          ref={(el: HTMLDivElement) => {
            state.setContentEl(el);
            if (typeof local.ref === 'function') (local.ref as (el: HTMLDivElement) => void)(el);
          }}
          class={cx(styles.container, local.class)}
          data-layout={state.layout()}
          data-icon={local.icon && !fullScreen() ? '' : undefined}
          data-header={hasHeader() ? '' : undefined}
          data-actions={showActions() ? '' : undefined}
          data-scrolled={scrolled() ? '' : undefined}
          data-overflow={overflow() ? '' : undefined}
          data-dividers={local.dividers ?? 'auto'}
          data-stacked={local.stackedActions ? '' : undefined}
          aria-busy={state.busy() ? 'true' : undefined}
        >
          <Show
            when={fullScreen()}
            fallback={
              <Show when={hasHeader()}>
                <div class={styles.header}>
                  <Show when={local.icon}>
                    {(name) => <Icon class={styles.icon} name={name()} />}
                  </Show>
                  {headline(styles.headline)}
                </div>
              </Show>
            }
          >
            <div class={styles.bar}>
              <ArkDialog.CloseTrigger
                asChild={(p) => (
                  <IconButton
                    {...p({ onClick: () => state.setReason('close-button') })}
                    color="standard"
                    icon="close"
                    label={local.closeLabel ?? 'Close'}
                    aria-disabled={state.busy() ? 'true' : undefined}
                  />
                )}
              />
              {headline(styles.barHeadline)}
              <Show when={hasConfirm()}>
                <div class={styles.barAction}>{local.confirmAction}</div>
              </Show>
            </div>
          </Show>

          <ScrollBody
            class={styles.body}
            overflow={overflow()}
            onScrolled={setScrolled}
            onOverflow={setOverflow}
          >
            <Show when={'supportingText' in props && props.supportingText !== undefined}>
              <ArkDialog.Description class={styles.supportingText}>
                {local.supportingText}
              </ArkDialog.Description>
            </Show>
            {local.children}
          </ScrollBody>

          <Show when={showActions()}>
            <div class={styles.actions}>
              {actions()}
              <Show when={hasConfirm()}>{local.confirmAction}</Show>
            </div>
          </Show>

          <Show when={fullScreen() && 'bottomBar' in props}>
            <div class={styles.bottomBar}>{local.bottomBar}</div>
          </Show>
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Portal>
  );
};

/**
 * The scrolling region. Reports whether it overflows (dividers) and whether
 * it is scrolled (full-screen header color). Focusable while it overflows so
 * keyboard users can scroll it.
 */
const ScrollBody = (props: {
  class: string;
  overflow: boolean;
  onScrolled: (scrolled: boolean) => void;
  onOverflow: (overflow: boolean) => void;
  children: JSX.Element;
}) => {
  let el!: HTMLDivElement;

  onMount(() => {
    const update = () => {
      props.onScrolled(el.scrollTop > 0);
      props.onOverflow(el.scrollHeight > el.clientHeight + 1);
    };
    const resize = new ResizeObserver(update);
    const observe = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) resize.observe(child);
    };
    const mutation = new MutationObserver(() => {
      observe();
      update();
    });
    observe();
    mutation.observe(el, { childList: true, subtree: true, characterData: true });
    el.addEventListener('scroll', update, { passive: true });
    onCleanup(() => {
      resize.disconnect();
      mutation.disconnect();
      el.removeEventListener('scroll', update);
    });
  });

  return (
    <div ref={el} class={props.class} tabIndex={props.overflow ? 0 : undefined}>
      {props.children}
    </div>
  );
};

// ---- Actions ----

export type DialogActionProps = ButtonProps & {
  /**
   * Closes the dialog after `onClick` (`preventDefault()` there keeps it open).
   * For dismissive actions (Cancel, Keep editing); marked disabled while the dialog is busy.
   */
  close?: boolean;
  /** This action is running: shows a progress indicator in place of the label and ignores presses. Keeps focus. */
  busy?: boolean;
};

/**
 * A dialog action: a text button by default (any Button color works). With
 * `close` it closes the dialog; the first one gets initial focus in an
 * alertdialog. Use `type="submit" form="<id>"` to submit a form in the body.
 */
export const DialogAction = (props: DialogActionProps) => {
  const [local, rest] = splitProps(props, ['close', 'busy', 'color', 'class', 'children', 'onClick']);
  const state = useDialogState();
  const dialog = useDialogContext();
  const blocked = () => !!local.busy || (!!local.close && state.busy());

  const onClick = (e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
    // aria-disabled (not disabled) keeps focus on the button, so Enter still clicks it.
    if (blocked()) {
      e.preventDefault();
      return;
    }
    const handler = local.onClick as JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
    if (typeof handler === 'function') handler(e);
    else if (Array.isArray(handler)) handler[0](handler[1], e);
    // Not Ark's CloseTrigger: several close actions would share its id.
    if (local.close && !e.defaultPrevented) {
      state.setReason('action');
      dialog().setOpen(false);
    }
  };

  return (
    <Button
      {...rest}
      color={local.color ?? 'text'}
      class={cx(styles.action, local.class)}
      data-busy={local.busy ? '' : undefined}
      data-dialog-close={local.close ? '' : undefined}
      aria-busy={local.busy ? 'true' : undefined}
      aria-disabled={blocked() ? 'true' : undefined}
      onClick={onClick}
    >
      <span class={styles.actionLabel}>{local.children}</span>
      <Show when={local.busy}>
        <span class={styles.progress} aria-hidden="true" />
      </Show>
    </Button>
  );
};

/**
 * M3 dialog: basic (optional hero
 * icon, headline, supporting text, scrolling content with dividers, up to
 * two text actions, side by side or stacked) and full-screen (56px header
 * with close, headline and confirming action; optional bottom bar), which
 * becomes a basic dialog in medium and larger windows. Behavior is Ark UI
 * `Dialog`.
 *
 * ```tsx
 * <Dialog.Root open={open()} onOpenChange={setOpen} busy={saving()}>
 *   <Dialog.Content
 *     headline="Delete directory?"
 *     supportingText="Deletes 3 directories and 12 links."
 *     actions={<Dialog.Action close>Cancel</Dialog.Action>}
 *     confirmAction={<Dialog.Action busy={saving()} onClick={remove}>Delete</Dialog.Action>}
 *   />
 * </Dialog.Root>
 * ```
 */
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Action: DialogAction,
  /** Ark's dialog API (open, setOpen) as a render prop. */
  Context: ArkDialog.Context,
};
