import { Toast, Toaster, useToastContext, type ToastOptions } from '@ark-ui/solid/toast';
import { createEffect, on, Show, splitProps, type Accessor, type Component, type JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Button } from '../buttons/button/Button';
import { IconButton } from '../buttons/icon-button/IconButton';
import { snackbar as appSnackbar, type Snackbar, type SnackbarMeta } from './createSnackbar';
import styles from './snackbar.module.css';

export type SnackbarAlign = 'center' | 'start';

export type SnackbarHostProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'dir'> & {
  /** Text direction of the region. Default: Ark's locale (ltr). */
  dir?: 'ltr' | 'rtl';
  /** Defaults to the app-wide `snackbar`. */
  snackbar?: Snackbar;
  /** Medium and wider windows: centered or start-aligned. Compact windows fill the width. Default `center`. */
  align?: SnackbarAlign;
  /**
   * Extra distance above the bottom margin (CSS length), so the snackbar
   * sits above a FAB, navigation bar or docked toolbar.
   */
  bottomOffset?: string;
  /** Name of the notification region. Default "Notifications". */
  label?: string;
  /** Accessible name of the close icon button. Default "Close". */
  closeLabel?: string;
};

type ItemProps = {
  toast: Accessor<ToastOptions>;
  closeLabel: string;
  onExit: (root: HTMLElement) => void;
};

const SnackbarItem: Component<ItemProps> = (props) => {
  const api = useToastContext();
  let root!: HTMLDivElement;

  createEffect(
    on(
      () => api().visible,
      (visible, wasVisible) => {
        if (wasVisible && !visible) props.onExit(root);
      },
      { defer: true },
    ),
  );

  const meta = () => (props.toast().meta ?? {}) as Partial<SnackbarMeta>;
  const hasActions = () => !!props.toast().action || !!props.toast().closable;

  return (
    <Toast.Root
      ref={root}
      class={styles.root}
      data-long-action={meta().longAction ? '' : undefined}
      data-has-actions={hasActions() ? '' : undefined}
    >
      <Toast.Description class={styles.text}>{props.toast().description}</Toast.Description>
      <Show when={hasActions()}>
        <div class={styles.actions}>
          <Show when={props.toast().action}>
            {(action) => (
              <Toast.ActionTrigger
                asChild={(p) => (
                  <Button {...p()} color="text">
                    {action().label}
                  </Button>
                )}
              />
            )}
          </Show>
          <Show when={props.toast().closable}>
            <Toast.CloseTrigger
              asChild={(p) => <IconButton {...p()} color="standard" icon="close" label={props.closeLabel} />}
            />
          </Show>
        </div>
      </Show>
    </Toast.Root>
  );
};

/**
 * Renders the snackbars of a `Snackbar` manager
 * with Ark UI `Toaster`: a persistent polite live region at the bottom of
 * the window, in a portal. Mount it once per manager.
 *
 * Keyboard: the manager's hotkey (default Alt+G) moves focus to the
 * snackbar's first button; Tab moves between action and close; Esc
 * dismisses; when the snackbar leaves while focused, focus returns to where
 * it was before. Timers pause while the snackbar is hovered or focused.
 */
export const SnackbarHost: Component<SnackbarHostProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'snackbar',
    'align',
    'bottomOffset',
    'label',
    'closeLabel',
    'class',
    'style',
  ]);
  let group: HTMLDivElement | undefined;
  let returnTo: HTMLElement | null = null;

  const onFocusIn = (event: FocusEvent) => {
    const from = event.relatedTarget;
    if (from instanceof HTMLElement && !group?.contains(from)) returnTo = from;
    // The hotkey focuses the region itself: move on to the visible snackbar's first control.
    if (event.target === group) {
      const open = group.querySelector<HTMLElement>('[data-part="root"][data-state="open"]');
      (open?.querySelector<HTMLElement>('button') ?? open)?.focus();
    }
  };

  const onExit = (root: HTMLElement) => {
    if (!root.contains(document.activeElement)) return;
    const target = returnTo;
    returnTo = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <Portal>
      <Toaster
        {...rest}
        ref={(el: HTMLDivElement) => (group = el)}
        toaster={(local.snackbar ?? appSnackbar).toaster}
        label={local.label ?? 'Notifications'}
        class={local.class ? `${styles.group} ${local.class}` : styles.group}
        data-align={local.align ?? 'center'}
        style={{
          ...(typeof local.style === 'object' ? local.style : {}),
          ...(local.bottomOffset ? { '--_bottom-offset': local.bottomOffset } : {}),
        }}
        onFocusIn={onFocusIn}
      >
        {(toast) => <SnackbarItem toast={toast} closeLabel={local.closeLabel ?? 'Close'} onExit={onExit} />}
      </Toaster>
    </Portal>
  );
};
