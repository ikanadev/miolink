import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon } from '../../icon/Icon';
import { Ripple } from '../../shared/Ripple';
import { Fab, type FabSize } from '../fab/Fab';
import type { FabColor } from '../shared/types';
import styles from './fab-menu.module.css';

/** How long the items take to exit before the list is hidden (fast effects, rounded up). */
const EXIT_MS = 200;

export type FabMenuProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> & {
  /** The FAB's icon (Material Symbols name). */
  icon: string;
  /** Accessible name of the FAB / close button: the menu it opens ("Share options"). Constant. */
  label: string;
  /** Default `fab` (56px). The menu itself is the same size for every FAB size. */
  size?: FabSize;
  /**
   * The FAB's color style, default `primary-container`. The close button and
   * items use the matching set: primary, secondary or tertiary.
   */
  color?: FabColor;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default true. False hides the FAB like `Fab`'s `visible` (and closes the menu). */
  visible?: boolean;
  /** 2-6 `FabMenuItem`s, top to bottom. */
  children: JSX.Element;
};

type FabMenuState = { close: (focusToggle: boolean) => void };
const FabMenuContext = createContext<FabMenuState>();

/**
 * M3 FAB menu: a FAB that
 * opens 2-6 related actions. Open, the FAB morphs into a 56px round close
 * button (primary, secondary or tertiary set, following the FAB's color)
 * and the items rise above it, trailing-aligned.
 *
 * Disclosure pattern (M3 Accessibility: FAB menu): the toggle has
 * aria-expanded and aria-controls, focus stays on it when it opens and Tab
 * moves to the top item. Escape, a pointer down outside, focus leaving the
 * menu or choosing an item closes it. The caller positions the root (the
 * FAB's box), usually fixed at the bottom-end; the items scroll behind the
 * close button when they don't fit.
 *
 * Always the expressive pill stack. M3's specs also describe a web
 * presentation built on the baseline menu (4dp gap) without saying when to
 * switch; for that, anchor a `Menu` to a `Fab` instead.
 */
export const FabMenu: Component<FabMenuProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'icon',
    'label',
    'size',
    'color',
    'open',
    'defaultOpen',
    'onOpenChange',
    'visible',
    'children',
    'class',
  ]);

  const listId = `fab-menu-${createUniqueId()}`;
  let root!: HTMLDivElement;
  let list!: HTMLUListElement;
  let toggle: HTMLElement | undefined;

  const [inner, setInner] = createSignal(local.defaultOpen ?? false);
  const open = () => (local.visible ?? true) && (local.open ?? inner());
  const setOpen = (next: boolean) => {
    if (next === open()) return;
    setInner(next);
    local.onOpenChange?.(next);
  };
  const close = (focusToggle: boolean) => {
    setOpen(false);
    if (focusToggle) toggle?.focus();
  };

  // The list stays rendered while its items exit.
  const [rendered, setRendered] = createSignal(open());
  const [closing, setClosing] = createSignal(false);
  createEffect(
    on(open, (isOpen) => {
      if (isOpen) {
        setClosing(false);
        setRendered(true);
        // Stagger from the item next to the close button upwards.
        const items = [...list.children] as HTMLElement[];
        items.forEach((el, i) => el.style.setProperty('--_i-from-bottom', String(items.length - 1 - i)));
        if (import.meta.env.DEV && (items.length < 2 || items.length > 6)) {
          console.warn('FabMenu: use 2-6 items.');
        }
        return;
      }
      if (!rendered()) return;
      setClosing(true);
      const timer = window.setTimeout(() => {
        setRendered(false);
        setClosing(false);
      }, EXIT_MS);
      onCleanup(() => clearTimeout(timer));
    }),
  );

  // Hiding the FAB closes the menu for good, so a controlled parent hears it.
  createEffect(
    on(
      () => local.visible ?? true,
      (isVisible) => {
        if (isVisible || !(local.open ?? inner())) return;
        setInner(false);
        local.onOpenChange?.(false);
      },
      { defer: true },
    ),
  );

  // Outside pointer down closes without moving focus. Escape is also caught
  // on the document: Safari doesn't focus buttons on click, so after a mouse
  // open focus can stay on <body>.
  createEffect(() => {
    if (!open()) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) close(true);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    onCleanup(() => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    });
  });

  const set = () => (local.color ?? 'primary-container').replace('-container', '');

  return (
    <FabMenuContext.Provider value={{ close }}>
      <div
        {...rest}
        ref={root}
        class={local.class ? `${styles.root} ${local.class}` : styles.root}
        data-color={set()}
        data-fab-size={local.size ?? 'fab'}
        data-open={open() ? '' : undefined}
        data-closing={closing() ? '' : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open()) {
            e.stopPropagation();
            close(true);
          }
        }}
        onFocusOut={(e) => {
          const next = e.relatedTarget as Node | null;
          if (open() && next && !root.contains(next)) close(false);
        }}
      >
        <Fab
          ref={(el: HTMLElement) => (toggle = el)}
          class={styles.toggle}
          label={local.label}
          size={local.size}
          color={local.color}
          visible={local.visible}
          tooltip={!open()}
          aria-expanded={open()}
          aria-controls={listId}
          onClick={() => setOpen(!open())}
        >
          <span class={styles.icons}>
            <Icon class={styles.fabIcon} name={local.icon} filled />
            <Icon class={styles.closeIcon} name="close" filled />
          </span>
        </Fab>
        <ul ref={list} id={listId} class={styles.list} hidden={!rendered()} inert={closing()}>
          {local.children}
        </ul>
      </div>
    </FabMenuContext.Provider>
  );
};

type ItemAttrs = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'>;

export type FabMenuItemProps = ItemAttrs & {
  /** Visible label (always present; never icon-only). */
  label: string;
  /** Material Symbols name. Keep icons unless they don't fit. */
  icon?: string;
  /** Mirror the icon in RTL (directional glyphs). */
  mirror?: boolean;
  /** Render a link instead of a button. */
  href?: string;
  /** Runs the action; the menu then closes and focuses the FAB unless `preventDefault()` is called. */
  onClick?: (event: MouseEvent) => void;
};

/** An action in a `FabMenu`: a pill with an icon and a label. */
export const FabMenuItem: Component<FabMenuItemProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'icon', 'mirror', 'href', 'onClick', 'class']);
  const menu = useContext(FabMenuContext);
  return (
    <li class={styles.listItem}>
      <Dynamic
        component={local.href === undefined ? 'button' : 'a'}
        type={local.href === undefined ? 'button' : undefined}
        href={local.href}
        {...rest}
        class={local.class ? `${styles.item} ${local.class}` : styles.item}
        onClick={(e: MouseEvent) => {
          local.onClick?.(e);
          if (!e.defaultPrevented) menu?.close(true);
        }}
      >
        <Ripple />
        <Show when={local.icon}>{(name) => <Icon name={name()} filled mirror={local.mirror} />}</Show>
        <span>{local.label}</span>
      </Dynamic>
    </li>
  );
};
