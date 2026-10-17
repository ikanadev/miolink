import { createListCollection, Listbox, useListbox } from '@ark-ui/solid/listbox';
import {
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import styles from './list.module.css';

export type ListVariant = 'expressive' | 'baseline';
export type ListSelection = 'none' | 'single' | 'multi';
export type ListInteraction = 'single-action' | 'multi-action' | 'non-interactive';

type RegisteredItem = {
  el: HTMLElement;
  value: () => string;
  label: () => string;
  disabled: () => boolean;
};

/**
 * Set by a combobox popup (the search view): items render as
 * `role="option"` elements that the input highlights through
 * `aria-activedescendant`, so they never take focus.
 */
export type ListOptionContext = {
  /** The option with this id is the highlighted (active) one. */
  highlighted: (id: string) => boolean;
  /** Pointer moved over an enabled option. */
  highlight: (id: string) => void;
  /** An enabled option was clicked (or activated with Enter). */
  select: (value: string, el: HTMLElement) => void;
};

type ListContextValue = {
  variant: () => ListVariant;
  segmented: () => boolean;
  interaction: () => ListInteraction;
  /** true inside a single/multi select list (Ark Listbox). */
  selectable: () => boolean;
  checkIndicator: () => boolean;
  register: (item: RegisteredItem) => void;
  /** Items are combobox options (see `ListOptionContext`). */
  option?: ListOptionContext;
};

const defaultContext: ListContextValue = {
  variant: () => 'expressive',
  segmented: () => false,
  interaction: () => 'single-action',
  selectable: () => false,
  checkIndicator: () => false,
  register: () => {},
};

export const ListContext = createContext<ListContextValue>(defaultContext);
export const useListContext = () => useContext(ListContext);

type CommonProps = {
  /** Default `expressive` (20px icons, 8px image corners, shape morphs). `baseline` is legacy M3. */
  variant?: ListVariant;
  /** Expressive only: items separated by 2px gaps with 16px outer corners. */
  segmented?: boolean;
  /**
   * Accessible name. Required for select lists, where it should describe
   * the selection ("Select a sort order").
   */
  label?: string;
  class?: string;
  children?: JSX.Element;
};

export type ListProps = CommonProps &
  Omit<JSX.HTMLAttributes<HTMLUListElement>, 'children' | 'aria-label'> & {
    /** Default `none`. */
    selection?: 'none';
    /**
     * Default `single-action`: each item is one link/button.
     * `multi-action`: a primary action plus trailing buttons per item.
     * `non-interactive`: plain information.
     */
    interaction?: ListInteraction;
    /**
     * Interactive lists are one tab stop with roving tabindex and arrow
     * keys (wrapping; Home/End). Default true.
     */
    roving?: boolean;
  };

export type SelectListProps = CommonProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'aria-label' | 'onChange'> & {
    /** `single` (radio-like) or `multi` (checkbox-like). Items need a `value`. */
    selection: 'single' | 'multi';
    label: string;
    /** Controlled selected values. */
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    disabled?: boolean;
    /**
     * Non-color cue for selected items. `check` (default) adds a trailing
     * check icon; use `none` when items render their own checkbox/radio.
     */
    selectionIndicator?: 'check' | 'none';
  };

const COMMON = ['variant', 'segmented', 'label', 'class', 'children'] as const;

/**
 * M3 Expressive list (m3-guidelines/components/lists.md). Holds `ListItem`s
 * and `ListDivider`s.
 *
 * - `selection="none"` (default): a native `<ul>`. Interactive items are
 *   links or buttons, one tab stop with roving tabindex.
 * - `selection="single" | "multi"`: Ark UI `Listbox` (role listbox/option,
 *   aria-activedescendant, wrapping arrows, typeahead, Space/Enter select).
 */
export const List: Component<ListProps | SelectListProps> = (props) => {
  const isSelect = () => props.selection === 'single' || props.selection === 'multi';
  return (
    <Show when={isSelect()} fallback={<PlainList {...(props as ListProps)} />}>
      <SelectList {...(props as SelectListProps)} />
    </Show>
  );
};

const PlainList: Component<ListProps> = (props) => {
  const [local, rest] = splitProps(props, [...COMMON, 'selection', 'interaction', 'roving']);
  const interaction = () => local.interaction ?? 'single-action';
  let root!: HTMLUListElement;

  onMount(() => {
    if (interaction() === 'non-interactive' || local.roving === false) return;
    onCleanup(rovingFocus(root));
  });

  return (
    <ListContext.Provider
      value={{
        ...defaultContext,
        variant: () => local.variant ?? 'expressive',
        segmented: () => !!local.segmented,
        interaction,
      }}
    >
      <ul
        {...rest}
        ref={root}
        class={local.class ? `${styles.list} ${local.class}` : styles.list}
        data-list-root=""
        data-segmented={local.segmented ? '' : undefined}
        aria-label={local.label}
      >
        {local.children}
      </ul>
    </ListContext.Provider>
  );
};

const SelectList: Component<SelectListProps> = (props) => {
  const [local, rest] = splitProps(props, [
    ...COMMON,
    'selection',
    'value',
    'defaultValue',
    'onValueChange',
    'disabled',
    'selectionIndicator',
  ]);

  // Items register themselves; the collection follows their DOM order.
  const [entries, setEntries] = createSignal<RegisteredItem[]>([]);
  const collection = createMemo(() =>
    createListCollection({
      items: [...entries()]
        .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map((e) => ({ value: e.value(), label: e.label(), disabled: e.disabled() })),
    }),
  );

  const listbox = useListbox(() => ({
    collection: collection(),
    selectionMode: local.selection === 'multi' ? 'multiple' : 'single',
    value: local.value,
    defaultValue: local.defaultValue,
    onValueChange: (details) => local.onValueChange?.(details.value),
    disabled: local.disabled,
    loopFocus: true,
    typeahead: true,
  }));

  const register = (item: RegisteredItem) => {
    setEntries((list) => [...list, item]);
    onCleanup(() => setEntries((list) => list.filter((i) => i !== item)));
  };

  // Tab into the list lands on the (first) selected item, not the first one.
  const onFocus = () => {
    const api = listbox();
    if (api.highlightedValue == null && api.value.length > 0) api.highlightValue(api.value[0]);
  };

  return (
    <ListContext.Provider
      value={{
        variant: () => local.variant ?? 'expressive',
        segmented: () => !!local.segmented,
        interaction: () => 'single-action',
        selectable: () => true,
        checkIndicator: () => local.selectionIndicator !== 'none',
        register,
      }}
    >
      <Listbox.RootProvider value={listbox} class={styles.listbox}>
        <Listbox.Label class={styles.visuallyHidden}>{local.label}</Listbox.Label>
        <Listbox.Content
          {...rest}
          class={local.class ? `${styles.list} ${local.class}` : styles.list}
          data-list-root=""
          data-segmented={local.segmented ? '' : undefined}
          onFocus={onFocus}
        >
          {local.children}
        </Listbox.Content>
      </Listbox.RootProvider>
    </ListContext.Provider>
  );
};

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/**
 * Roving tabindex for a plain interactive list: the item actions and their
 * trailing buttons form one tab stop, traversed in DOM order with the arrow
 * keys (Down/Right next, Up/Left previous, wrapping; Home/End). Nested
 * lists are their own group. Returns the cleanup.
 */
function rovingFocus(root: HTMLElement): () => void {
  let current: HTMLElement | undefined;

  const items = () =>
    Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) =>
        el.closest('[data-list-root]') === root &&
        !el.closest('[hidden]') &&
        !el.matches(':disabled, [aria-disabled="true"]'),
    );

  const sync = () => {
    const els = items();
    if (!current || !els.includes(current)) {
      current = els.find((el) => el.closest('[data-selected]')) ?? els[0];
    }
    for (const el of els) el.tabIndex = el === current ? 0 : -1;
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target !== current && items().includes(target)) {
      current = target;
      sync();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    const els = items();
    const index = els.indexOf(target);
    if (index < 0) return;
    if (target.matches('input, textarea, select') && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const rtl = getComputedStyle(root).direction === 'rtl';
    let next: number;
    switch (e.key) {
      case 'ArrowDown':
        next = index + 1;
        break;
      case 'ArrowUp':
        next = index - 1;
        break;
      case 'ArrowRight':
        next = rtl ? index - 1 : index + 1;
        break;
      case 'ArrowLeft':
        next = rtl ? index + 1 : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = els.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    els[(next + els.length) % els.length].focus();
  };

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'href'],
  });
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('keydown', onKeyDown);
  return () => {
    observer.disconnect();
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('keydown', onKeyDown);
  };
}

export type ListDividerProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'ref'> & {
  /** 16px leading and trailing inset. Default full width. */
  inset?: boolean;
};

/**
 * 1px outline-variant line between items or groups. Use in uncontained
 * lists that need stronger separation; segmented lists use gaps instead.
 */
export const ListDivider: Component<ListDividerProps> = (props) => {
  const [local, rest] = splitProps(props, ['inset', 'class']);
  const ctx = useListContext();
  const attrs = () => ({
    class: local.class ? `${styles.divider} ${local.class}` : styles.divider,
    'data-inset': local.inset ? 'middle' : 'none',
    'data-orientation': 'horizontal',
  });
  // A listbox may only own options, so its divider is presentational.
  return (
    <Show when={!ctx.selectable() && !ctx.option} fallback={<div {...rest} {...attrs()} aria-hidden="true" />}>
      <li {...rest} {...attrs()} role="separator" />
    </Show>
  );
};
