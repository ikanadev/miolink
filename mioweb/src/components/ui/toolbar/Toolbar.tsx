import {
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Fab, type FabButtonProps } from '../buttons/fab';
import { IconButton, type ToggleIconButtonProps } from '../buttons/icon-button';
import { Divider, type DividerProps } from '../divider';
import { Menu } from '../menu';
import styles from './toolbar.module.css';

export type ToolbarVariant = 'docked' | 'floating';
export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarColor = 'standard' | 'vibrant';
export type ToolbarLayout = 'even' | 'center' | 'edges';
export type ToolbarScrollBehavior = 'none' | 'hide' | 'collapse';
export type ToolbarSide = 'start' | 'end';

export type ToolbarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'color'> & {
  /** Accessible name of the toolbar (`aria-label`), e.g. "Formatting". */
  label: string;
  /**
   * Default `floating`: a pill over the content with contextual actions.
   * `docked`: a full-width bar at the bottom with global actions (replaces
   * the bottom app bar).
   */
  variant?: ToolbarVariant;
  /** Floating only. Default `horizontal`. Vertical is for medium and larger windows. */
  orientation?: ToolbarOrientation;
  /** Default `standard` (surface-container). `vibrant` (primary-container) for emphasis or a temporary mode. */
  color?: ToolbarColor;
  /** Floating only. Default true: level3 shadow. False over visually distinct content. */
  elevated?: boolean;
  /**
   * Docked only. `even` (default, compact windows): items evenly spaced.
   * `center`: items grouped in the center, 32px apart. `edges`: first and
   * last items at the edges, the rest spread between.
   */
  layout?: ToolbarLayout;
  /**
   * `hide`: slide off screen while scrolling down, back on scrolling up, at
   * the end of the content or when focus enters. `collapse` (floating
   * only): hide every action but the FAB (which grows to 80px) or the
   * `keyAction`. Default `none`. Never both.
   */
  scrollBehavior?: ToolbarScrollBehavior;
  /** The scrolling element watched by `scrollBehavior`. Default: window. */
  scrollTarget?: HTMLElement;
  /** Controlled shown/hidden state (overrides `scrollBehavior="hide"`). Focus inside always shows it. */
  visible?: boolean;
  /** Controlled collapsed state (overrides `scrollBehavior="collapse"`). Focus inside the toolbar expands it. */
  collapsed?: boolean;
  /**
   * `position: fixed`. Docked: bottom of the window, full width. Floating
   * horizontal: bottom center, 16px from the edge. Floating vertical:
   * centered on `side`, 24px from the edge. Default false: the caller
   * places it.
   */
  fixed?: boolean;
  /** Floating vertical: the window edge it sits on (and hides toward). Default `end`. */
  side?: ToolbarSide;
  /** Floating only: a `ToolbarFab` placed 8px after the toolbar, outside its arrow-key order. */
  fab?: JSX.Element;
  /**
   * Extra `Menu.*` items always shown in the overflow menu, after the
   * actions that didn't fit. The overflow button appears when this is set
   * or when a `ToolbarAction` doesn't fit.
   */
  menu?: JSX.Element;
  /** Accessible name of the overflow button. Default "More options". */
  overflowLabel?: string;
  /** Items: `ToolbarAction`s (can move to the overflow menu), icon buttons, buttons, text fields, `ToolbarDivider`s. */
  children?: JSX.Element;
};

type ActionEntry = {
  el: () => HTMLElement | undefined;
  value: string;
  label: () => string;
  icon: () => string;
  toggle: () => boolean;
  selected: () => boolean;
  disabled: () => boolean;
  keyAction: () => boolean;
};

type ToolbarContextValue = {
  color: () => ToolbarColor;
  orientation: () => ToolbarOrientation;
  collapsed: () => boolean;
  register: (entry: ActionEntry) => void;
  unregister: (entry: ActionEntry) => void;
  isOverflowed: (entry: ActionEntry) => boolean;
};

const ToolbarContext = createContext<ToolbarContextValue>();

const FOCUSABLE =
  'button, a[href], input, select, textarea, [role="button"], [contenteditable="true"], [tabindex]';
const TEXT_INPUT =
  'input:not([type="button"], [type="checkbox"], [type="radio"], [type="submit"], [type="reset"], [type="image"]), textarea, select, [contenteditable="true"]';

let actionId = 0;

const call = <E extends Event>(handler: unknown, e: E) => {
  if (typeof handler === 'function') handler(e);
  else if (Array.isArray(handler)) handler[0](handler[1], e);
};

const LOCAL = [
  'label',
  'variant',
  'orientation',
  'color',
  'elevated',
  'layout',
  'scrollBehavior',
  'scrollTarget',
  'visible',
  'collapsed',
  'fixed',
  'side',
  'fab',
  'menu',
  'overflowLabel',
  'children',
  'class',
  'ref',
  'onKeyDown',
  'onFocusIn',
  'onFocusOut',
] as const;

/**
 * M3 Expressive toolbar: docked
 * (full-width bottom bar) or floating (pill, horizontal or vertical, with
 * an optional FAB), standard or vibrant colors. `role="toolbar"` with a
 * roving tabindex: one Tab stop, Arrow keys (Left/Right, Up/Down when
 * vertical, mirrored in RTL) and Home/End move between items; arrows are
 * left to text fields. `ToolbarAction`s that don't fit move, from the end,
 * into an overflow menu in the trailing slot. Standard icon buttons and
 * text buttons inside take the toolbar's item colors; filled and tonal
 * ones keep their own for emphasis.
 */
export const Toolbar: Component<ToolbarProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);

  const variant = () => local.variant ?? 'floating';
  const floating = () => variant() === 'floating';
  const orientation = (): ToolbarOrientation => (floating() ? (local.orientation ?? 'horizontal') : 'horizontal');
  const vertical = () => orientation() === 'vertical';
  const color = () => local.color ?? 'standard';
  const behavior = (): ToolbarScrollBehavior => {
    const b = local.scrollBehavior ?? 'none';
    return b === 'collapse' && !floating() ? 'none' : b;
  };

  if (import.meta.env.DEV) {
    if ('fab' in props && !floating()) console.warn('Toolbar: the FAB pairs only with floating toolbars.');
    if (local.scrollBehavior === 'collapse' && !floating()) {
      console.warn('Toolbar: `collapse` is for floating toolbars; docked toolbars stay or hide.');
    }
  }

  let root!: HTMLDivElement;
  let group: HTMLDivElement | undefined;

  // ---- Scroll: hide or collapse ----

  const [scrollHidden, setScrollHidden] = createSignal(false);
  const [scrollCollapsed, setScrollCollapsed] = createSignal(false);
  const [focusInGroup, setFocusInGroup] = createSignal(false);
  const [focusInToolbar, setFocusInToolbar] = createSignal(false);

  const hidden = () =>
    !focusInGroup() && (local.visible !== undefined ? !local.visible : behavior() === 'hide' && scrollHidden());
  const collapsed = () =>
    floating() &&
    !focusInToolbar() &&
    (local.collapsed !== undefined ? local.collapsed : behavior() === 'collapse' && scrollCollapsed());

  createEffect(() => {
    const b = behavior();
    if (b === 'none') return;
    const el = local.scrollTarget;
    const scroller: HTMLElement | Window = el ?? window;
    const position = () => (el ? el.scrollTop : window.scrollY);
    const end = () =>
      el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
    const set = b === 'hide' ? setScrollHidden : setScrollCollapsed;
    let anchor = position();
    let frame = 0;
    // Derived (spec §6): hide after one container height of downward
    // scroll, show on any upward scroll and at either end.
    const update = () => {
      frame = 0;
      const y = position();
      if (y <= 0 || y >= end() - 1) {
        set(false);
        anchor = y;
      } else if (y < anchor) {
        set(false);
        anchor = y;
      } else if (y - anchor >= (vertical() ? root.offsetWidth : root.offsetHeight)) {
        set(true);
        anchor = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onCleanup(() => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      set(false);
    });
  });

  // ---- Overflow ----

  const [entries, setEntries] = createSignal<ActionEntry[]>([]);
  const [candidates, setCandidates] = createSignal<ActionEntry[]>([]);
  const [overflowCount, setOverflowCount] = createSignal(0);
  const overflowed = createMemo(() => {
    const list = candidates();
    return list.slice(list.length - overflowCount());
  });
  // `menu` is only read inside Menu.Content (its items need the menu's context).
  const hasMenu = () => 'menu' in props;
  const showOverflow = () => overflowed().length > 0 || hasMenu();

  // Compares the items' extent with the content box rather than using
  // scrollWidth: centered or evenly spaced items overflow on both sides.
  const fits = () => {
    const v = vertical();
    const cs = getComputedStyle(root);
    const available = v
      ? root.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      : root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let start = Infinity;
    let end = -Infinity;
    for (const child of root.children) {
      const r = child.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      start = Math.min(start, v ? r.top : r.left);
      end = Math.max(end, v ? r.bottom : r.right);
    }
    return end - start <= available + 1;
  };
  const resizing = () =>
    root
      .getAnimations()
      .some((a) => a instanceof CSSTransition && /size/.test(a.transitionProperty));

  // Moves trailing actions into the menu, one at a time, until the content
  // fits. Runs outside effects so each step updates the DOM synchronously.
  const measure = () => {
    if (!root?.isConnected || collapsed() || resizing()) return;
    const list = entries()
      .filter((e) => !e.keyAction() && e.el())
      .sort((a, b) => (a.el()!.compareDocumentPosition(b.el()!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    setCandidates(list);
    let n = 0;
    setOverflowCount(0);
    while (!fits() && n < list.length) setOverflowCount(++n);
    syncTabIndex();
    // Drop the mutations this pass made, so they don't schedule another.
    mo?.takeRecords();
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      measure();
    });
  };

  // ---- Roving tabindex ----

  let mo: MutationObserver | undefined;
  let active: HTMLElement | undefined;
  const items = () =>
    [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !el.matches(':disabled') && el.getClientRects().length > 0 && !el.closest('[inert]'),
    );
  const syncTabIndex = () => {
    if (!root) return;
    const list = items();
    if (!active || !list.includes(active)) active = list[0];
    for (const el of list) el.tabIndex = el === active ? 0 : -1;
  };

  const onKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    call(local.onKeyDown, e);
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const keys = vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    if (![...keys, 'Home', 'End'].includes(e.key)) return;
    const target = e.target as HTMLElement;
    // Text fields keep the arrows for the caret; Tab leaves them (spec §8).
    if (target.matches(TEXT_INPUT)) return;
    const list = items();
    const index = list.indexOf(target);
    if (index < 0) return;
    e.preventDefault();
    const rtl = getComputedStyle(root).direction === 'rtl';
    const forward = e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
    const last = list.length - 1;
    // Arrows wrap at the ends (derived, like shared/navigation-keys.ts).
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : forward
            ? (index + 1) % list.length
            : (index - 1 + list.length) % list.length;
    list[next]?.focus();
  };

  const onFocusIn: JSX.EventHandler<HTMLDivElement, FocusEvent> = (e) => {
    call(local.onFocusIn, e);
    setFocusInToolbar(true);
    setScrollCollapsed(false);
    const target = e.target as HTMLElement;
    if (target !== active && items().includes(target)) {
      active = target;
      syncTabIndex();
    }
  };
  const onFocusOut: JSX.EventHandler<HTMLDivElement, FocusEvent> = (e) => {
    call(local.onFocusOut, e);
    if (!root.contains(e.relatedTarget as Node | null)) setFocusInToolbar(false);
  };

  // Collapse/expand animates the size: measure once it has settled.
  const onTransitionEnd = (e: TransitionEvent) => {
    if (e.target === root && e.propertyName.endsWith('size')) schedule();
  };

  onMount(() => {
    const ro = new ResizeObserver(schedule);
    const parent = (group ?? root).parentElement;
    if (parent) ro.observe(parent);
    mo = new MutationObserver(() => {
      syncTabIndex();
      schedule();
    });
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden'],
    });
    window.addEventListener('resize', schedule);
    root.addEventListener('transitionend', onTransitionEnd);
    document.fonts?.ready.then(schedule);
    syncTabIndex();
    schedule();
    onCleanup(() => {
      ro.disconnect();
      mo?.disconnect();
      window.removeEventListener('resize', schedule);
      root.removeEventListener('transitionend', onTransitionEnd);
    });
  });

  createEffect(() => {
    // Re-measure when the actions, orientation or collapse state change.
    entries();
    orientation();
    collapsed();
    schedule();
  });

  const ctx: ToolbarContextValue = {
    color,
    orientation,
    collapsed,
    register: (entry) => setEntries((list) => [...list, entry]),
    unregister: (entry) => setEntries((list) => list.filter((e) => e !== entry)),
    isOverflowed: (entry) => overflowed().includes(entry),
  };

  const findEntry = (value: string) => entries().find((e) => e.value === value);

  const placement = () =>
    vertical() ? ((local.side ?? 'end') === 'end' ? 'left-end' : 'right-end') : 'top-end';

  const renderToolbar = (hasFab: boolean) => (
    <div
      role="toolbar"
      aria-label={local.label}
      aria-orientation={vertical() ? 'vertical' : undefined}
      {...rest}
      ref={(el) => {
        root = el;
        if (typeof local.ref === 'function') (local.ref as (el: HTMLDivElement) => void)(el);
      }}
      class={local.class ? `${styles.toolbar} ${local.class}` : styles.toolbar}
      data-variant={variant()}
      data-orientation={orientation()}
      data-color={color()}
      data-layout={floating() ? undefined : (local.layout ?? 'even')}
      data-elevated={floating() ? String(local.elevated ?? true) : undefined}
      data-side={vertical() ? (local.side ?? 'end') : undefined}
      data-fixed={local.fixed && !hasFab ? '' : undefined}
      data-hidden={!hasFab && hidden() ? '' : undefined}
      data-collapsed={collapsed() ? '' : undefined}
      data-has-fab={hasFab ? '' : undefined}
      onKeyDown={onKeyDown}
      onFocusIn={onFocusIn}
      onFocusOut={onFocusOut}
    >
      {local.children}
      <Show when={showOverflow()}>
        <Menu.Root
          positioning={{ placement: placement() }}
          onSelect={(d) => {
            const entry = findEntry(d.value);
            if (entry && !entry.toggle()) entry.el()?.click();
          }}
        >
          <Menu.Trigger
            asChild={(p) => (
              <IconButton
                {...p()}
                color="standard"
                icon={vertical() ? 'more_horiz' : 'more_vert'}
                label={local.overflowLabel ?? 'More options'}
                tooltip
              />
            )}
          />
          <Menu.Content>
            <For each={overflowed()}>
              {(entry) => (
                <Show
                  when={entry.toggle()}
                  fallback={
                    <Menu.Item value={entry.value} leadingIcon={entry.icon()} disabled={entry.disabled()}>
                      {entry.label()}
                    </Menu.Item>
                  }
                >
                  <Menu.CheckboxItem
                    value={entry.value}
                    leadingIcon={entry.icon()}
                    disabled={entry.disabled()}
                    checked={entry.selected()}
                    onCheckedChange={() => entry.el()?.click()}
                  >
                    {entry.label()}
                  </Menu.CheckboxItem>
                </Show>
              )}
            </For>
            <Show when={overflowed().length > 0 && hasMenu()}>
              <Menu.Divider />
            </Show>
            {local.menu}
          </Menu.Content>
        </Menu.Root>
      </Show>
    </div>
  );

  return (
    <ToolbarContext.Provider value={ctx}>
      {(() => {
        // Resolved once, inside the provider: ToolbarFab and ToolbarAction read the context.
        const fab = resolveChildren(() => (floating() ? local.fab : undefined));
        return (
          <Show when={fab()} fallback={renderToolbar(false)}>
            <div
              ref={group}
              class={styles.group}
              data-orientation={orientation()}
              data-side={vertical() ? (local.side ?? 'end') : undefined}
              data-fixed={local.fixed ? '' : undefined}
              data-hidden={hidden() ? '' : undefined}
              data-collapsed={collapsed() ? '' : undefined}
              onFocusIn={() => {
                setFocusInGroup(true);
                setScrollHidden(false);
              }}
              onFocusOut={(e) => {
                if (!group?.contains(e.relatedTarget as Node | null)) setFocusInGroup(false);
              }}
            >
              {renderToolbar(true)}
              {fab()}
            </div>
          </Show>
        );
      })()}
    </ToolbarContext.Provider>
  );
};

// ---- Action ----

export type ToolbarActionProps = Omit<ToggleIconButtonProps, 'toggle' | 'color'> & {
  /** Default `standard`: the toolbar's item colors. `filled`/`tonal` emphasize one action. */
  color?: ToggleIconButtonProps['color'];
  /** On/off action (Bold, Favorite): renders aria-pressed and a checkbox item when in the overflow menu. */
  toggle?: boolean;
  /**
   * The high-emphasis action kept when the toolbar collapses on scroll
   * without a FAB. It never moves to the overflow menu.
   */
  keyAction?: boolean;
};

/**
 * An icon button in a toolbar that moves to the overflow menu when it
 * doesn't fit (from the end). Takes `IconButton`'s props; `tooltip`
 * defaults to true. In the menu it shows `icon` and `label`, and choosing
 * it clicks the button.
 */
export const ToolbarAction: Component<ToolbarActionProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'toggle',
    'keyAction',
    'color',
    'tooltip',
    'selected',
    'defaultSelected',
    'onSelectedChange',
    'ref',
  ]);
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error('ToolbarAction must be inside a Toolbar.');

  const [inner, setInner] = createSignal(local.defaultSelected ?? false);
  const selected = () => (local.selected !== undefined ? local.selected : inner());

  let el: HTMLElement | undefined;
  const entry: ActionEntry = {
    el: () => el,
    value: `toolbar-action-${++actionId}`,
    label: () => rest.label,
    icon: () => (selected() && rest.selectedIcon ? rest.selectedIcon : rest.icon),
    toggle: () => !!local.toggle,
    selected,
    disabled: () => !!rest.disabled,
    keyAction: () => !!local.keyAction,
  };
  onMount(() => ctx.register(entry));
  onCleanup(() => ctx.unregister(entry));

  if (import.meta.env.DEV && ctx.orientation() === 'vertical' && rest.width === 'wide') {
    console.warn('ToolbarAction: use narrow or default icon buttons in vertical toolbars, not wide.');
  }

  return (
    <IconButton
      {...(rest as unknown as ToggleIconButtonProps)}
      ref={(node: HTMLButtonElement) => {
        el = node;
        if (typeof local.ref === 'function') (local.ref as (el: HTMLButtonElement) => void)(node);
      }}
      toggle={(local.toggle ? true : undefined) as true}
      color={local.color ?? 'standard'}
      tooltip={local.tooltip ?? true}
      selected={local.toggle ? selected() : undefined}
      onSelectedChange={(next) => {
        setInner(next);
        local.onSelectedChange?.(next);
      }}
      data-key={local.keyAction ? '' : undefined}
      data-overflowed={ctx.isOverflowed(entry) ? '' : undefined}
    />
  );
};

// ---- FAB ----

export type ToolbarFabProps = Omit<FabButtonProps, 'size' | 'color' | 'lowered'>;

/**
 * The FAB beside a floating toolbar (pass it as `fab`): secondary container
 * with a standard toolbar, tertiary container with a vibrant one; 56px,
 * growing to 80px while the toolbar is collapsed.
 */
export const ToolbarFab: Component<ToolbarFabProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  const ctx = useContext(ToolbarContext);
  if (!ctx) throw new Error('ToolbarFab must be the `fab` of a Toolbar.');
  return (
    <Fab
      {...rest}
      class={local.class ? `${styles.fab} ${local.class}` : styles.fab}
      size={ctx.collapsed() ? 'medium' : 'fab'}
      color={ctx.color() === 'vibrant' ? 'tertiary-container' : 'secondary-container'}
    />
  );
};

// ---- Divider ----

export type ToolbarDividerProps = Omit<DividerProps, 'orientation' | 'inset'>;

/** Separates groups of items on larger screens: perpendicular to the toolbar, 32px long (derived). */
export const ToolbarDivider: Component<ToolbarDividerProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  const ctx = useContext(ToolbarContext);
  return (
    <Divider
      {...rest}
      class={local.class ? `${styles.divider} ${local.class}` : styles.divider}
      orientation={ctx?.orientation() === 'vertical' ? 'horizontal' : 'vertical'}
      inset="middle"
    />
  );
};
