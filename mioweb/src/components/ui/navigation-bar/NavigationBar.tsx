import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { NavigationItem, type NavigationItemProps } from '../shared/NavigationItem';
import styles from './navigation-bar.module.css';

export type NavigationBarLayout = 'vertical' | 'horizontal' | 'auto';

export type NavigationBarProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Accessible name of the `<nav>` landmark, e.g. "Main". */
  label?: string;
  /** Selected destination (controlled). */
  value?: string;
  /** Initially selected destination (uncontrolled). */
  defaultValue?: string;
  /** The user selected another destination. */
  onValueChange?: (value: string) => void;
  /** The user selected the active destination again: scroll its page to the top. */
  onReselect?: (value: string) => void;
  /**
   * Item layout. `vertical`: icon above the label, items share the width
   * equally (compact windows). `horizontal`: icon and label side by side in
   * the pill, equal-width items centered (medium windows). Default `auto`:
   * vertical below 600px of bar width, horizontal from 600px.
   */
  layout?: NavigationBarLayout;
  /**
   * Hide while scrolling down, show again when scrolling up, near the top,
   * or when focus moves into the bar. Leave off when assistive technology
   * may be in use (spec §8).
   */
  hideOnScroll?: boolean;
  /** The scrolling element watched by `hideOnScroll`. Default: window. */
  scrollTarget?: HTMLElement;
  /**
   * `position: fixed` at the bottom of the window, full width. Default
   * false: the bar stays in the flow, e.g. as the last row of an app
   * layout or `position: sticky; bottom: 0` in a scrolling container.
   */
  fixed?: boolean;
  /** 3 to 5 `NavigationBarItem`s. */
  children: JSX.Element;
};

type BarContextValue = {
  value: () => string | undefined;
  layout: () => 'vertical' | 'horizontal';
  select: (value: string) => void;
};

const BarContext = createContext<BarContextValue>();

/** Bar width where `auto` switches to horizontal items: the medium window class (web mapping: bar width, not window width). */
const HORIZONTAL_MIN_WIDTH = 600;

const LOCAL = [
  'label',
  'value',
  'defaultValue',
  'onValueChange',
  'onReselect',
  'layout',
  'hideOnScroll',
  'scrollTarget',
  'fixed',
  'children',
  'class',
  'ref',
] as const;

/**
 * M3 Expressive flexible navigation bar: a 64px
 * surface-container bar with 3-5 destinations, exactly one active. A
 * `<nav>` around a `<ul>`; items are links (`href`) or buttons with
 * `aria-current="page"` on the active one, and Tab moves between them (not
 * a tablist). The level2 elevation token is rendered tonally, no shadow.
 */
export const NavigationBar: Component<NavigationBarProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);

  const [inner, setInner] = createSignal(local.defaultValue);
  const value = () => (local.value !== undefined ? local.value : inner());
  const select = (next: string) => {
    if (next === value()) {
      local.onReselect?.(next);
      return;
    }
    setInner(next);
    local.onValueChange?.(next);
  };

  let nav!: HTMLElement;
  let list!: HTMLUListElement;
  const [width, setWidth] = createSignal(0);
  const layout = () => {
    const l = local.layout ?? 'auto';
    if (l !== 'auto') return l;
    return width() >= HORIZONTAL_MIN_WIDTH ? 'horizontal' : 'vertical';
  };

  createEffect(() => {
    if ((local.layout ?? 'auto') !== 'auto') return;
    setWidth(nav.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width));
    ro.observe(nav);
    onCleanup(() => ro.disconnect());
  });

  if (import.meta.env.DEV) {
    onMount(() => {
      const count = list.children.length;
      if (count < 3 || count > 5) {
        console.warn(
          `NavigationBar: ${count} destinations. Use 3 to 5; fewer → tabs, more → a modal navigation rail or tabs.`,
        );
      }
    });
  }

  const [hidden, setHidden] = createSignal(false);
  createEffect(() => {
    if (!local.hideOnScroll) {
      setHidden(false);
      return;
    }
    const target = local.scrollTarget;
    const scroller: HTMLElement | Window = target ?? window;
    const position = () => (target ? target.scrollTop : window.scrollY);
    let last = position();
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = position();
      if (y < last || y <= nav.offsetHeight) setHidden(false);
      else if (y > last) setHidden(true);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onCleanup(() => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      setHidden(false);
    });
  });

  return (
    <BarContext.Provider value={{ value, layout, select }}>
      <nav
        aria-label={local.label}
        {...rest}
        ref={(el) => {
          nav = el;
          if (typeof local.ref === 'function') (local.ref as (el: HTMLElement) => void)(el);
        }}
        class={local.class ? `${styles.bar} ${local.class}` : styles.bar}
        data-layout={layout()}
        data-fixed={local.fixed ? '' : undefined}
        data-hidden={hidden() ? '' : undefined}
      >
        <ul ref={list} class={styles.list} role="list">
          {local.children}
        </ul>
      </nav>
    </BarContext.Provider>
  );
};

export type NavigationBarItemProps = Omit<NavigationItemProps, 'layout' | 'active' | 'badgeStyle' | 'truncate' | 'icon'> & {
  /** Material Symbols name. Outlined while inactive, filled while active. */
  icon: string;
  /** Identifies the destination; the bar's `value` when this item is active. */
  value: string;
  /**
   * Overrides whether this item is active, e.g. from the router's current
   * route. Default: the bar's `value` equals this item's `value`.
   */
  active?: boolean;
};

/**
 * One destination of a NavigationBar: an `<li>` with a link (`href`) or a
 * button. Icon outlined while inactive and filled while active; the pill
 * grows from the icon center when it becomes active. Optional badge on the
 * icon.
 */
export const NavigationBarItem: Component<NavigationBarItemProps> = (props) => {
  const [local, rest] = splitProps(props, ['value', 'active', 'onClick']);
  const bar = useContext(BarContext);
  if (!bar) throw new Error('NavigationBarItem must be inside a NavigationBar.');

  const onClick = (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => {
    const handler = local.onClick as JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined;
    if (typeof handler === 'function') handler(e);
    else if (Array.isArray(handler)) handler[0](handler[1], e);
    // Even when the handler prevents a link's default (client-side routing).
    bar.select(local.value);
  };

  return (
    <li class={styles.listItem}>
      <NavigationItem
        {...rest}
        layout={bar.layout()}
        active={local.active ?? bar.value() === local.value}
        onClick={onClick}
      />
    </li>
  );
};
