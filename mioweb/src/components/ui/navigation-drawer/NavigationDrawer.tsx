import { Dialog as ArkDialog } from '@ark-ui/solid/dialog';
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { NavigationItem, type NavigationItemProps } from '../shared/NavigationItem';
import { createArrowNavigation } from '../shared/navigation-keys';
import styles from './navigation-drawer.module.css';

/** `standard`: beside the content, part of the layout. `modal`: over the content with a scrim. */
export type NavigationDrawerVariant = 'standard' | 'modal';
/** What closed the drawer. `select`: a destination was chosen in the modal drawer. */
export type NavigationDrawerCloseReason = 'scrim' | 'escape' | 'swipe' | 'select';
export type NavigationDrawerDir = 'ltr' | 'rtl';

export type NavigationDrawerProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'dir'> & {
  /**
   * Accessible name of the `<nav>` landmark (and of the modal). Default:
   * the headline (`aria-labelledby`). Set it when there is no headline.
   */
  label?: string;
  /** Optional title at the top of the drawer. */
  headline?: JSX.Element;
  /** Optional content above the headline (e.g. an account switcher). */
  header?: JSX.Element;
  /** Default `standard`. */
  variant?: NavigationDrawerVariant;
  /**
   * Standard drawer: `open` shows and hides it (a menu button elsewhere
   * toggles it); the content beside it reflows. Without it, the standard
   * drawer is always visible and `open` is ignored.
   */
  dismissible?: boolean;
  /** Open (controlled). Modal drawers and dismissible standard drawers only. */
  open?: boolean;
  /** Initially open (uncontrolled). Default false. */
  defaultOpen?: boolean;
  /** The user closed the modal drawer (scrim, Escape, swipe, selection). Not called when `open` changes from outside. */
  onOpenChange?: (open: boolean, reason?: NavigationDrawerCloseReason) => void;
  /** Selected destination (controlled). */
  value?: string;
  /** Initially selected destination (uncontrolled). */
  defaultValue?: string;
  /** The user selected another destination. */
  onValueChange?: (value: string) => void;
  /** The user selected the active destination again. */
  onReselect?: (value: string) => void;
  /** Modal: close when a destination is selected. Default true. */
  closeOnSelect?: boolean;
  /** Text direction of the modal (its portal leaves the subtree). Default: the document's direction. */
  dir?: NavigationDrawerDir;
  /** `NavigationDrawerItem`s, `NavigationDrawerSection`s and `NavigationDrawerDivider`s. */
  children: JSX.Element;
};

type DrawerContextValue = {
  value: () => string | undefined;
  select: (value: string) => void;
};

const DrawerContext = createContext<DrawerContextValue>();

const LOCAL = [
  'label',
  'headline',
  'header',
  'variant',
  'dismissible',
  'open',
  'defaultOpen',
  'onOpenChange',
  'value',
  'defaultValue',
  'onValueChange',
  'onReselect',
  'closeOnSelect',
  'dir',
  'children',
  'class',
  'ref',
] as const;

const ITEM_SELECTOR = '[data-drawer-item]';
/** Swipe toward the start edge: distance (share of the width) or speed (px/ms) that closes the modal (derived, spec §10f). */
const SWIPE_CLOSE_RATIO = 0.5;
const SWIPE_CLOSE_VELOCITY = 0.5;
/** Movement before a touch counts as a horizontal drag or a vertical scroll. */
const SWIPE_SLOP = 10;

/**
 * Navigation drawer,
 * a list of destinations in a 360px sheet on the start edge, with an
 * optional headline, section subheads and dividers. Exactly one
 * destination is active.
 *
 * **No longer recommended in M3 Expressive**: prefer the expanded
 * `NavigationRail`. This is kept for legacy layouts and built on the same
 * item code (`shared/NavigationItem`).
 *
 * - Standard: beside the content in a flex row (`flex: 1;
 *   min-inline-size: 0` on the content), sticky and 100dvh tall (override
 *   `block-size` in shorter containers). Permanent, or `dismissible`: its
 *   width animates with `open` and the content reflows.
 * - Modal: an Ark UI Dialog in a portal, over a 32% scrim, sliding from the
 *   start edge. Focus is trapped and returns to the opener; the scrim,
 *   Escape, a swipe toward the start edge or a selection closes it.
 *
 * Items are links (`href`) or buttons with `aria-current="page"` on the
 * active one. Tab enters the list; Arrow Up/Down, Home/End move between
 * destinations.
 */
export const NavigationDrawer: Component<NavigationDrawerProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);

  const [innerValue, setInnerValue] = createSignal(local.defaultValue);
  const value = () => (local.value !== undefined ? local.value : innerValue());

  const [innerOpen, setInnerOpen] = createSignal(local.defaultOpen ?? false);
  const open = () => (local.open !== undefined ? local.open : innerOpen());
  const setOpen = (next: boolean, reason?: NavigationDrawerCloseReason) => {
    if (next === open()) return;
    setInnerOpen(next);
    local.onOpenChange?.(next, next ? undefined : reason);
  };

  const modal = () => local.variant === 'modal';
  const standardOpen = () => !local.dismissible || open();

  const headlineId = createUniqueId();
  const hasHeadline = () => local.headline !== undefined;
  const labelProps = () =>
    local.label !== undefined || !hasHeadline()
      ? { 'aria-label': local.label }
      : { 'aria-labelledby': headlineId };

  let nav: HTMLElement | undefined;
  const onKeyDown = createArrowNavigation(ITEM_SELECTOR);

  // ---- Dismissible standard drawer: return focus when it closes ----
  // Its items leave the tab order (visibility: hidden) once closed, so
  // focus inside would be lost: give it back to the element focused
  // before it opened (usually the menu button).
  let opener: HTMLElement | null = null;
  createEffect(
    on(
      () => !modal() && !!local.dismissible && open(),
      (isOpen, wasOpen) => {
        if (wasOpen === undefined) return;
        if (isOpen) {
          opener = document.activeElement as HTMLElement | null;
        } else if (wasOpen) {
          if (nav?.contains(document.activeElement) && opener?.isConnected) opener.focus({ preventScroll: true });
          opener = null;
        }
      },
    ),
  );

  if (import.meta.env.DEV) {
    onMount(() => {
      if (!nav) return;
      const active = nav.querySelectorAll(`${ITEM_SELECTOR}[aria-current="page"]`).length;
      if (active > 1) console.warn(`NavigationDrawer: ${active} active destinations; only one may be active.`);
    });
  }

  // ---- Modal: swipe toward the start edge to dismiss ----
  let swipe:
    | { id: number; x: number; y: number; t: number; dragging: boolean; offset: number; v: number }
    | undefined;
  let suppressClick = false;

  const towardStart = (el: HTMLElement, dx: number) => (el.getAttribute('dir') === 'rtl' ? Math.max(dx, 0) : Math.min(dx, 0));

  const onPointerDown = (e: PointerEvent & { currentTarget: HTMLElement }) => {
    if (e.pointerType === 'mouse' || !e.isPrimary) return;
    swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, dragging: false, offset: 0, v: 0 };
  };

  const onPointerMove = (e: PointerEvent & { currentTarget: HTMLElement }) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const el = e.currentTarget;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (!swipe.dragging) {
      if (Math.abs(dy) > SWIPE_SLOP && Math.abs(dy) > Math.abs(dx)) {
        swipe = undefined; // a vertical scroll
        return;
      }
      if (Math.abs(towardStart(el, dx)) < SWIPE_SLOP) return;
      swipe.dragging = true;
      el.setPointerCapture(e.pointerId);
      el.setAttribute('data-dragging', '');
    }
    const offset = towardStart(el, dx);
    const dt = Math.max(e.timeStamp - swipe.t, 1);
    swipe.v = (offset - swipe.offset) / dt;
    swipe.offset = offset;
    swipe.t = e.timeStamp;
    el.style.setProperty('--_drag', `${offset}px`);
  };

  const endSwipe = (e: PointerEvent & { currentTarget: HTMLElement }, cancelled: boolean) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const el = e.currentTarget;
    const { dragging, offset, v } = swipe;
    swipe = undefined;
    if (!dragging) return;
    el.removeAttribute('data-dragging');
    suppressClick = true;
    window.setTimeout(() => (suppressClick = false));
    const width = el.offsetWidth || 1;
    const fling = Math.abs(v) > SWIPE_CLOSE_VELOCITY && Math.sign(v) === Math.sign(offset);
    if (!cancelled && (Math.abs(offset) > width * SWIPE_CLOSE_RATIO || fling)) {
      // --_drag stays set: the exit animation starts from it.
      setOpen(false, 'swipe');
    } else {
      el.style.setProperty('--_drag', '0px');
    }
  };

  const onClickCapture = (e: MouseEvent) => {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
  };

  // What triggered Ark's next onOpenChange (it reports the close without it).
  let closeReason: NavigationDrawerCloseReason | undefined;

  const resolveDir = (): NavigationDrawerDir => {
    if (local.dir) return local.dir;
    return getComputedStyle(document.documentElement).direction === 'rtl' ? 'rtl' : 'ltr';
  };

  // ---- Shared body: header, headline, list ----
  const body = (where: 'standard' | 'modal') => {
    const ctx: DrawerContextValue = {
      value,
      select: (next) => {
        if (next === value()) local.onReselect?.(next);
        else {
          setInnerValue(next);
          local.onValueChange?.(next);
        }
        // Navigation completes the modal's task (spec §2).
        if (where === 'modal' && (local.closeOnSelect ?? true)) setOpen(false, 'select');
      },
    };
    return (
      <DrawerContext.Provider value={ctx}>
        <div class={styles.sheet} onKeyDown={onKeyDown}>
          <Show when={local.header !== undefined}>
            <div class={styles.header}>{local.header}</div>
          </Show>
          <Show when={hasHeadline()}>
            <h2 id={headlineId} class={styles.headline}>
              {local.headline}
            </h2>
          </Show>
          <ul class={styles.list} role="list">
            {local.children}
          </ul>
        </div>
      </DrawerContext.Provider>
    );
  };

  onCleanup(() => (swipe = undefined));

  return (
    <Show
      when={modal()}
      fallback={
        <nav
          {...labelProps()}
          {...rest}
          ref={(el) => {
            nav = el;
            if (typeof local.ref === 'function') (local.ref as (el: HTMLElement) => void)(el);
          }}
          class={local.class ? `${styles.root} ${local.class}` : styles.root}
          data-variant="standard"
          data-open={String(standardOpen())}
          aria-hidden={standardOpen() ? undefined : 'true'}
        >
          {body('standard')}
        </nav>
      }
    >
      <ArkDialog.Root
        open={open()}
        role="dialog"
        modal
        trapFocus
        preventScroll
        restoreFocus
        closeOnEscape
        closeOnInteractOutside
        lazyMount
        unmountOnExit
        onEscapeKeyDown={() => (closeReason = 'escape')}
        onInteractOutside={() => (closeReason = 'scrim')}
        onOpenChange={(details) => {
          const why = closeReason;
          closeReason = undefined;
          setOpen(details.open, why);
        }}
      >
        <Portal>
          <ArkDialog.Backdrop class={styles.scrim} />
          <ArkDialog.Positioner class={styles.positioner} dir={resolveDir()}>
            <ArkDialog.Content
              {...labelProps()}
              {...rest}
              ref={(el: HTMLElement) => {
                nav = el;
                // A drag that ends over an item must not select it.
                el.addEventListener('click', onClickCapture, true);
                if (typeof local.ref === 'function') (local.ref as (el: HTMLElement) => void)(el);
              }}
              class={local.class ? `${styles.modal} ${local.class}` : styles.modal}
              dir={resolveDir()}
              data-variant="modal"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => endSwipe(e, false)}
              onPointerCancel={(e) => endSwipe(e, true)}
            >
              <nav {...labelProps()} class={styles.modalNav}>
                {body('modal')}
              </nav>
            </ArkDialog.Content>
          </ArkDialog.Positioner>
        </Portal>
      </ArkDialog.Root>
    </Show>
  );
};

export type NavigationDrawerItemProps = Omit<
  NavigationItemProps,
  'layout' | 'active' | 'badgePlacement' | 'badgeStyle' | 'truncate'
> & {
  /** Identifies the destination; the drawer's `value` when this item is active. */
  value: string;
  /** Overrides whether this item is active, e.g. from the router. Default: the drawer's `value` equals `value`. */
  active?: boolean;
};

/**
 * One destination: an `<li>` with a link (`href`) or a button, a 56px
 * full-width pill. Optional icon (give every item one, or none), label
 * truncated with an ellipsis, optional badge text at the end (`true` shows
 * the small dot).
 */
export const NavigationDrawerItem: Component<NavigationDrawerItemProps> = (props) => {
  const [local, rest] = splitProps(props, ['value', 'active', 'onClick']);
  const drawer = useContext(DrawerContext);
  if (!drawer) throw new Error('NavigationDrawerItem must be inside a NavigationDrawer.');

  const onClick = (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => {
    const handler = local.onClick as JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined;
    if (typeof handler === 'function') handler(e);
    else if (Array.isArray(handler)) handler[0](handler[1], e);
    drawer.select(local.value);
  };

  return (
    <li class={styles.listItem}>
      <NavigationItem
        {...rest}
        data-drawer-item=""
        layout="horizontal"
        badgePlacement="label"
        badgeStyle="text"
        truncate
        active={local.active ?? drawer.value() === local.value}
        onClick={onClick}
      />
    </li>
  );
};

export type NavigationDrawerSectionProps = {
  /** Subhead, also the group's accessible name. */
  label: string;
  /** `NavigationDrawerItem`s. */
  children: JSX.Element;
};

/** A group of destinations under a subhead. */
export const NavigationDrawerSection: Component<NavigationDrawerSectionProps> = (props) => {
  const id = createUniqueId();
  return (
    <li class={styles.listItem}>
      <div class={styles.section} role="group" aria-labelledby={id}>
        <span id={id} class={styles.subhead}>
          {props.label}
        </span>
        <ul class={styles.list} role="list">
          {props.children}
        </ul>
      </div>
    </li>
  );
};

/** A full-width divider between groups of destinations (never between single items). */
export const NavigationDrawerDivider: Component = () => <li class={styles.divider} role="separator" />;
