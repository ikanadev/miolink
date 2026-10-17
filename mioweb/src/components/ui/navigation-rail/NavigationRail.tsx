import { Dialog as ArkDialog } from '@ark-ui/solid/dialog';
import {
  createComputed,
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
import { ExtendedFab, type ExtendedFabProps } from '../buttons/extended-fab';
import { IconButton } from '../buttons/icon-button';
import { NavigationItem, type NavigationItemLayout, type NavigationItemProps } from '../shared/NavigationItem';
import { createArrowNavigation } from '../shared/navigation-keys';
import styles from './navigation-rail.module.css';

/** `collapse` (default): the menu button switches between the collapsed and expanded rail. `hide`: no collapsed rail; the expanded rail only appears while `expanded`. */
export type NavigationRailExpandedBehavior = 'collapse' | 'hide';
/** Item group position. Menu, FAB and logo always stay at the top. */
export type NavigationRailAlignment = 'top' | 'center';
/** Expanded rail: the pill hugs icon and label (default) or fills the rail width minus 16px margins. */
export type NavigationRailIndicator = 'hug' | 'fill';
export type NavigationRailDir = 'ltr' | 'rtl';

/** The rail's FAB: a FAB while collapsed, an extended FAB while expanded. */
export type NavigationRailFab = Omit<ExtendedFabProps, 'extended' | 'size' | 'visible' | 'icon'> & {
  icon: string;
};

export type NavigationRailProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'dir'> & {
  /** Accessible name of the `<nav>` landmark (and of the modal), e.g. "Main". */
  label?: string;
  /** Selected destination (controlled). */
  value?: string;
  /** Initially selected destination (uncontrolled). */
  defaultValue?: string;
  /** The user selected another destination. */
  onValueChange?: (value: string) => void;
  /** The user selected the active destination again. */
  onReselect?: (value: string) => void;
  /** Expanded (controlled). With `modal`, the modal expanded rail is open. */
  expanded?: boolean;
  /** Initially expanded (uncontrolled). */
  defaultExpanded?: boolean;
  /** The menu button, Escape, the scrim or a selection in the modal changed `expanded`. */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * The expanded rail opens over the content (surface-container, level 2,
   * 16px end corners, 32% scrim, focus trapped) instead of beside it. With
   * `expandedBehavior="collapse"` the collapsed rail stays in the layout.
   */
  modal?: boolean;
  /** Default `collapse`. With `hide`, open the rail from a menu button elsewhere (e.g. the app bar) through `expanded`. */
  expandedBehavior?: NavigationRailExpandedBehavior;
  /** Collapsed width 80px instead of 96px. */
  narrow?: boolean;
  /** Default `top`. `center` centers the items (tablets, for reach). */
  alignment?: NavigationRailAlignment;
  /** Default `hug`. */
  indicator?: NavigationRailIndicator;
  /** Default true. False puts the rail directly on the page's surface (transparent container). */
  fill?: boolean;
  /** A divider on the edge facing the content. */
  divider?: boolean;
  /** Default true. Shows the menu button that expands and collapses the rail. */
  menuButton?: boolean;
  /** Menu button name while collapsed. Default "Expand navigation". */
  expandLabel?: string;
  /** Menu button name while expanded. Default "Collapse navigation". */
  collapseLabel?: string;
  /** Optional FAB below the menu button, above the items. */
  fab?: NavigationRailFab;
  /** Optional logo at the top. Must not look like a button. */
  logo?: JSX.Element;
  /** Secondary destinations, shown only in the expanded rail: `NavigationRailSection`s. */
  secondary?: JSX.Element;
  /** Text direction of the modal (its portal leaves the subtree). Default: read from the rail or the document. */
  dir?: NavigationRailDir;
  /** 3 to 7 `NavigationRailItem`s. */
  children: JSX.Element;
};

type RailContextValue = {
  value: () => string | undefined;
  layout: () => NavigationItemLayout;
  select: (value: string) => void;
};

const RailContext = createContext<RailContextValue>();

const LOCAL = [
  'label',
  'value',
  'defaultValue',
  'onValueChange',
  'onReselect',
  'expanded',
  'defaultExpanded',
  'onExpandedChange',
  'modal',
  'expandedBehavior',
  'narrow',
  'alignment',
  'indicator',
  'fill',
  'divider',
  'menuButton',
  'expandLabel',
  'collapseLabel',
  'fab',
  'logo',
  'secondary',
  'dir',
  'children',
  'class',
  'ref',
] as const;

const ITEM_SELECTOR = '[data-rail-item]';

/**
 * M3 Expressive navigation rail
 * (m3-guidelines/components/navigation/navigation-rail.md): a vertical
 * `<nav>` on the leading edge with an optional menu button, FAB and logo
 * at the top and 3-7 destinations, exactly one active.
 *
 * - Collapsed: 96px (narrow 80px), vertical items, badges on the icon.
 * - Expanded (standard): 220-360px beside the content, which reflows as
 *   the width animates; horizontal items with label-large, badges after
 *   the label, optional secondary destinations.
 * - Expanded modal: over the content in an Ark UI Dialog (portal, scrim,
 *   focus trap, Escape and scrim dismiss, focus returns to the opener);
 *   selecting a destination closes it.
 *
 * Items are links (`href`) or buttons with `aria-current="page"` on the
 * active one. Tab or Arrow Up/Down (Home/End) move between them.
 * Place it in a flex row next to the main content (`flex: 1;
 * min-inline-size: 0`). It is sticky and 100dvh tall; override
 * `block-size` when it lives in a shorter container.
 */
export const NavigationRail: Component<NavigationRailProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);

  const [innerValue, setInnerValue] = createSignal(local.defaultValue);
  const value = () => (local.value !== undefined ? local.value : innerValue());
  const selectValue = (next: string) => {
    if (next === value()) {
      local.onReselect?.(next);
      return;
    }
    setInnerValue(next);
    local.onValueChange?.(next);
  };

  const [innerExpanded, setInnerExpanded] = createSignal(local.defaultExpanded ?? false);
  const expanded = () => (local.expanded !== undefined ? local.expanded : innerExpanded());
  const setExpanded = (next: boolean) => {
    if (next === expanded()) return;
    setInnerExpanded(next);
    local.onExpandedChange?.(next);
  };

  const modal = () => !!local.modal;
  const behavior = () => local.expandedBehavior ?? 'collapse';
  // The rail in the layout: absent for a modal rail that hides when collapsed.
  const hasInline = () => !(modal() && behavior() === 'hide');
  const inlineLayout = (): NavigationItemLayout => {
    if (modal()) return 'vertical';
    return expanded() || behavior() === 'hide' ? 'horizontal' : 'vertical';
  };
  const inlineHidden = () => !modal() && behavior() === 'hide' && !expanded();
  const modalOpen = () => modal() && expanded();

  const inlineId = createUniqueId();
  const modalId = createUniqueId();

  let nav: HTMLElement | undefined;
  const [animating, setAnimating] = createSignal(false);

  // ---- Width animation (standard rail) ----
  // The inner column has the target width at once; the <nav> animates its
  // inline size between the old and new widths and clips the inner column,
  // so the icons don't move horizontally. Measured: the expanded width hugs
  // the labels (220-360px), which CSS can't interpolate.
  let fromWidth: number | undefined;
  let endTimer: number | undefined;
  const standardExpanded = () => !modal() && expanded();

  const finish = () => {
    clearTimeout(endTimer);
    if (nav) nav.style.inlineSize = '';
    setAnimating(false);
  };

  // Runs before the DOM updates (computations precede render effects).
  createComputed(
    on(
      standardExpanded,
      () => {
        fromWidth = nav?.isConnected ? nav.getBoundingClientRect().width : undefined;
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      standardExpanded,
      () => {
        const from = fromWidth;
        fromWidth = undefined;
        const el = nav;
        if (!el || from === undefined) return;
        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) return;
        const border = el.offsetWidth - el.clientWidth;
        const to = inlineHidden() ? 0 : inner.getBoundingClientRect().width + border;
        if (Math.abs(to - from) < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
          finish();
          return;
        }
        setAnimating(true);
        el.style.inlineSize = `${from}px`;
        void el.offsetWidth;
        el.style.inlineSize = `${to}px`;
        clearTimeout(endTimer);
        // Safety net when transitionend never fires (e.g. display: none).
        endTimer = window.setTimeout(finish, 1500);
      },
      { defer: true },
    ),
  );

  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.target === nav && e.propertyName === 'inline-size') finish();
  };
  onCleanup(() => clearTimeout(endTimer));

  // ---- Keyboard: Arrow Up/Down, Home/End between items (Tab still works) ----
  const onKeyDown = createArrowNavigation(ITEM_SELECTOR);

  if (import.meta.env.DEV) {
    onMount(() => {
      if (!nav) return;
      const list = nav.querySelector(`.${styles.list}`);
      const count = list?.querySelectorAll(ITEM_SELECTOR).length ?? 0;
      if (count < 3 || count > 7) {
        console.warn(`NavigationRail: ${count} destinations. Use 3 to 7 in the collapsed rail.`);
      }
      const active = nav.querySelectorAll(`${ITEM_SELECTOR}[aria-current="page"]`).length;
      if (active > 1) console.warn(`NavigationRail: ${active} active destinations; only one may be active.`);
    });
  }

  const resolveDir = (): NavigationRailDir => {
    if (local.dir) return local.dir;
    const from = nav ?? document.documentElement;
    return getComputedStyle(from).direction === 'rtl' ? 'rtl' : 'ltr';
  };

  // ---- Shared body: header, items, secondary ----
  const body = (where: 'inline' | 'modal') => {
    const layout = (): NavigationItemLayout => (where === 'modal' ? 'horizontal' : inlineLayout());
    const isExpanded = () => (where === 'modal' ? true : expanded());
    const controls = where === 'modal' || modal() ? modalId : inlineId;
    const ctx: RailContextValue = {
      value,
      layout,
      select: (next) => {
        selectValue(next);
        // Navigation completes the modal's task (derived, spec §5).
        if (where === 'modal') setExpanded(false);
      },
    };
    const showMenu = () => local.menuButton ?? true;
    const hasHeader = () => showMenu() || !!local.fab || local.logo !== undefined;

    return (
      <RailContext.Provider value={ctx}>
        <div
          id={where === 'modal' ? undefined : inlineId}
          class={styles.inner}
          data-layout={layout()}
          data-narrow={local.narrow ? '' : undefined}
          data-indicator={local.indicator ?? 'hug'}
          data-align={local.alignment ?? 'top'}
          data-animating={where === 'inline' && animating() ? '' : undefined}
          onKeyDown={onKeyDown}
        >
          <Show when={hasHeader()}>
            <div class={styles.header}>
              <Show when={local.logo !== undefined}>
                <div class={styles.logo}>{local.logo}</div>
              </Show>
              <Show when={showMenu()}>
                <IconButton
                  class={styles.menu}
                  color="standard"
                  icon={isExpanded() ? 'menu_open' : 'menu'}
                  mirror
                  label={
                    isExpanded()
                      ? (local.collapseLabel ?? 'Collapse navigation')
                      : (local.expandLabel ?? 'Expand navigation')
                  }
                  aria-expanded={isExpanded() ? 'true' : 'false'}
                  aria-controls={controls}
                  aria-haspopup={where === 'inline' && modal() ? 'dialog' : undefined}
                  onClick={() => setExpanded(!expanded())}
                />
              </Show>
              <Show when={local.fab}>
                {(fab) => <ExtendedFab {...fab()} class={styles.fab} size="small" extended={layout() === 'horizontal'} />}
              </Show>
            </div>
          </Show>
          <div class={styles.scroll}>
            <ul class={styles.list} role="list">
              {local.children}
            </ul>
            <Show when={layout() === 'horizontal' && local.secondary !== undefined}>
              <div class={styles.secondary}>{local.secondary}</div>
            </Show>
          </div>
        </div>
      </RailContext.Provider>
    );
  };

  return (
    <>
      <Show when={hasInline()}>
        <nav
          aria-label={local.label}
          {...rest}
          ref={(el) => {
            nav = el;
            if (typeof local.ref === 'function') (local.ref as (el: HTMLElement) => void)(el);
          }}
          class={local.class ? `${styles.root} ${local.class}` : styles.root}
          data-expanded={String(standardExpanded())}
          data-hidden={inlineHidden() ? '' : undefined}
          data-no-fill={local.fill === false ? '' : undefined}
          data-divider={local.divider ? '' : undefined}
          aria-hidden={inlineHidden() ? 'true' : undefined}
          onTransitionEnd={onTransitionEnd}
        >
          {body('inline')}
        </nav>
      </Show>

      <Show when={modal()}>
        <ArkDialog.Root
          open={modalOpen()}
          role="dialog"
          modal
          trapFocus
          preventScroll
          restoreFocus
          closeOnEscape
          closeOnInteractOutside
          lazyMount
          unmountOnExit
          onOpenChange={(details) => setExpanded(details.open)}
        >
          <Portal>
            <ArkDialog.Backdrop class={styles.scrim} />
            <ArkDialog.Positioner class={styles.positioner} dir={resolveDir()}>
              <ArkDialog.Content
                id={modalId}
                class={styles.modal}
                dir={resolveDir()}
                aria-label={local.label}
                data-behavior={behavior()}
                data-narrow={local.narrow ? '' : undefined}
                data-no-fill={local.fill === false ? '' : undefined}
                {...(hasInline() ? {} : rest)}
              >
                <nav aria-label={local.label} class={styles.modalNav}>
                  {body('modal')}
                </nav>
              </ArkDialog.Content>
            </ArkDialog.Positioner>
          </Portal>
        </ArkDialog.Root>
      </Show>
    </>
  );
};

export type NavigationRailItemProps = Omit<
  NavigationItemProps,
  'layout' | 'active' | 'badgePlacement' | 'badgeStyle' | 'truncate' | 'icon'
> & {
  /** Material Symbols name. Outlined while inactive, filled while active. */
  icon: string;
  /** Identifies the destination; the rail's `value` when this item is active. */
  value: string;
  /** Overrides whether this item is active, e.g. from the router. Default: the rail's `value` equals `value`. */
  active?: boolean;
};

/**
 * One destination of a NavigationRail (or of a `NavigationRailSection`):
 * an `<li>` with a link (`href`) or a button whose hit target spans the
 * rail's width. Vertical while collapsed, horizontal while expanded; the
 * badge moves from the icon to after the label.
 */
export const NavigationRailItem: Component<NavigationRailItemProps> = (props) => {
  const [local, rest] = splitProps(props, ['value', 'active', 'onClick']);
  const rail = useContext(RailContext);
  if (!rail) throw new Error('NavigationRailItem must be inside a NavigationRail.');

  const onClick = (e: MouseEvent & { currentTarget: HTMLElement; target: Element }) => {
    const handler = local.onClick as JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined;
    if (typeof handler === 'function') handler(e);
    else if (Array.isArray(handler)) handler[0](handler[1], e);
    rail.select(local.value);
  };

  return (
    <li class={styles.listItem}>
      <NavigationItem
        {...rest}
        data-rail-item=""
        layout={rail.layout()}
        badgePlacement="label"
        active={local.active ?? rail.value() === local.value}
        onClick={onClick}
      />
    </li>
  );
};

export type NavigationRailSectionProps = {
  /** Subhead, also the group's accessible name. */
  label: string;
  /** `NavigationRailItem`s. */
  children: JSX.Element;
};

/** A group of secondary destinations with a subhead, for the rail's `secondary` slot (expanded rail only). */
export const NavigationRailSection: Component<NavigationRailSectionProps> = (props) => {
  const id = createUniqueId();
  return (
    <div class={styles.section} role="group" aria-labelledby={id}>
      <span id={id} class={styles.subhead}>
        {props.label}
      </span>
      <ul class={styles.list} role="list">
        {props.children}
      </ul>
    </div>
  );
};
