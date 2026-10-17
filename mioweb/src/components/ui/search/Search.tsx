import { Dialog as ArkDialog } from '@ark-ui/solid/dialog';
import {
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  Show,
  splitProps,
  untrack,
  type Component,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { IconButton } from '../buttons/icon-button';
import { Divider } from '../divider';
import { Icon } from '../icon/Icon';
import { ListContext } from '../list/List';
import { Ripple } from '../shared/Ripple';
import { SearchBarFrame } from './SearchBar';
import styles from './search.module.css';

export type SearchVariant = 'contained' | 'divided';
export type SearchLayout = 'auto' | 'docked' | 'full-screen';
/**
 * - `back`: the back button.
 * - `escape`: Escape with no highlighted option.
 * - `outside`: a click on the scrim or focus leaving the docked view.
 * - `select`: an option was chosen (with `closeOnSelect`).
 * - `history`: browser Back while the full-screen view was open.
 */
export type SearchCloseReason = 'back' | 'escape' | 'outside' | 'select' | 'history';

/** Window size classes: docked from medium (600px) up, full screen in compact windows. */
const WIDE_QUERY = '(min-width: 600px)';
/** The bar's inline margins shrink from 24px to 12px when focused: it grows 12px per side. */
const GROW = 12;
const MIN_DOCKED_WIDTH = 360;
const MAX_DOCKED_WIDTH = 720;

export type SearchProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  'children' | 'onInput' | 'onSelect' | 'onSearch'
> & {
  /** Hinted search text ("Search links"); also the input's accessible name. */
  placeholder: string;
  /** Controlled query. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled focused (open) state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason?: SearchCloseReason) => void;
  /** Default `contained` (M3 Expressive). `divided` is the baseline header + divider style. */
  variant?: SearchVariant;
  /** Default `auto`: docked from 600px up, full screen below. Swaps live on resize. */
  layout?: SearchLayout;
  /**
   * Leading element of the unfocused bar: a navigation icon button (Menu)
   * or a decorative icon. Default: a decorative search icon; `null` for
   * none. The focused view always shows Back instead.
   */
  leading?: JSX.Element;
  /**
   * Up to two icon buttons, or an avatar plus one icon button. Shown in the
   * bar and in the focused view while the query is empty; a Clear button
   * replaces them once there's text. Pass JSX inline (it renders twice).
   */
  trailing?: JSX.Element;
  /** Above the results, outside the listbox: filter chips, a "Results" label. */
  header?: JSX.Element;
  /** Options: `ListItem`s (with `value`), optionally inside `SearchGroup`s. */
  children?: JSX.Element;
  /** Shown instead of the options when there are none (e.g. "No links match"). */
  empty?: JSX.Element;
  /** Accessible name of the results listbox. Default "Suggestions". */
  resultsLabel?: string;
  /** Text announced politely when the options change. Default "N suggestions" / "No results". */
  status?: (count: number, value: string) => string;
  /** Enter with no highlighted option. The input loses focus; results stay. */
  onSearch?: (value: string) => void;
  /** An option was clicked or activated with Enter. `value` is the item's `value` (or its text). */
  onSelect?: (value: string, el: HTMLElement) => void;
  /** The Clear button emptied the query. */
  onClear?: () => void;
  /** Close the view after `onSelect`. Default true. */
  closeOnSelect?: boolean;
  /** Full-screen view: push a history entry so browser Back closes it. Default true. */
  history?: boolean;
  /** Default "Back". */
  backLabel?: string;
  /** Default "Clear search". */
  clearLabel?: string;
};

type Geometry = {
  /** Docked view box (viewport px). */
  top: number;
  left: number;
  width: number;
  /** Where the view's bar starts, relative to its final place (FLIP). */
  fromStart: number;
  fromEnd: number;
  fromY: number;
};

const defaultStatus = (count: number, value: string) =>
  count === 0 ? (value ? 'No results' : '') : `${count} ${count === 1 ? 'suggestion' : 'suggestions'}`;

/**
 * M3 Expressive search: a search bar
 * that opens focused search, with suggestions or results in a list.
 *
 * The bar's input is a combobox trigger. Activating it (click, Enter,
 * Space, ArrowDown or typing) opens the focused view, an Ark UI `Dialog`
 * in a portal holding its own bar and the results:
 *
 * - `docked` (≥ 600px): non-modal. The bar widens over the page (24 → 12px
 *   margins) and the results open below it, over a scrim. A scrim click or
 *   focus leaving the view closes it.
 * - `full-screen` (< 600px): modal (focus trap, inert page, scroll lock,
 *   history entry). The bar moves from its place to the top.
 *
 * The view's input is the combobox: Arrow Up/Down highlight options
 * (`aria-activedescendant`), Enter activates the highlighted option or runs
 * `onSearch`, Escape clears the highlight and then closes. Focus returns to
 * the bar's input on close (not after an outside click).
 */
export const Search: Component<SearchProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'placeholder',
    'value',
    'defaultValue',
    'onValueChange',
    'open',
    'defaultOpen',
    'onOpenChange',
    'variant',
    'layout',
    'leading',
    'trailing',
    'header',
    'children',
    'empty',
    'resultsLabel',
    'status',
    'onSearch',
    'onSelect',
    'onClear',
    'closeOnSelect',
    'history',
    'backLabel',
    'clearLabel',
    'class',
  ]);

  const viewId = createUniqueId();
  const listboxId = createUniqueId();

  // ---- State ----
  const [innerValue, setInnerValue] = createSignal(local.defaultValue ?? '');
  const value = () => local.value ?? innerValue();
  const setValue = (next: string) => {
    setInnerValue(next);
    local.onValueChange?.(next);
  };

  const [innerOpen, setInnerOpen] = createSignal(local.defaultOpen ?? false);
  const open = () => local.open ?? innerOpen();

  const [wide, setWide] = createSignal(true);
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(WIDE_QUERY);
    setWide(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
    mql.addEventListener('change', onChange);
    onCleanup(() => mql.removeEventListener('change', onChange));
  }
  const variant = () => local.variant ?? 'contained';
  const layout = (): 'docked' | 'full-screen' =>
    local.layout === 'docked' || local.layout === 'full-screen'
      ? local.layout
      : wide()
        ? 'docked'
        : 'full-screen';
  const fullScreen = () => layout() === 'full-screen';

  const [highlighted, setHighlighted] = createSignal<string>();
  const [count, setCount] = createSignal(0);
  const [geometry, setGeometry] = createSignal<Geometry>();

  let root!: HTMLElement;
  let bar!: HTMLDivElement;
  let pageInput!: HTMLInputElement;
  let viewInput: HTMLInputElement | undefined;
  let content: HTMLDivElement | undefined;
  const [listbox, setListbox] = createSignal<HTMLDivElement>();

  // ---- Geometry: the view starts where the bar is ----
  const measure = (): Geometry => {
    const r = bar.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const rtl = getComputedStyle(root).direction === 'rtl';
    const flip = (left: number, right: number) =>
      rtl ? { fromStart: right, fromEnd: left } : { fromStart: left, fromEnd: right };
    if (fullScreen()) {
      // The full-screen bar sits 12px from the window edges.
      return {
        top: 0,
        left: 0,
        width: vw,
        ...flip(Math.max(0, r.left - GROW), Math.max(0, vw - r.right - GROW)),
        fromY: r.top - GROW,
      };
    }
    // Docked: 12px wider per side, 360–720px (M3 Specs: docked container), inside the window.
    const width = Math.min(vw, MAX_DOCKED_WIDTH, Math.max(MIN_DOCKED_WIDTH, r.width + GROW * 2));
    const left = Math.min(Math.max(0, r.left - (width - r.width) / 2), vw - width);
    return {
      top: r.top,
      left,
      width,
      ...flip(r.left - left, left + width - r.right),
      fromY: 0,
    };
  };

  // Controlled opens (and layout swaps) measure here; user opens measure in setOpen.
  createEffect(() => {
    if (open()) {
      layout();
      untrack(() => setGeometry(measure()));
    }
  });

  // The docked view follows the bar while the page scrolls or resizes.
  createEffect(() => {
    if (!open() || fullScreen()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = measure();
      setGeometry((g) => (g ? { ...g, top: next.top, left: next.left, width: next.width } : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    onCleanup(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    });
  });

  // ---- Open / close ----
  let pushed = false;

  const setOpen = (next: boolean, reason?: SearchCloseReason) => {
    if (next === open()) return;
    if (next) setGeometry(measure());
    setInnerOpen(next);
    local.onOpenChange?.(next, next ? undefined : reason);
    if (next) return;
    setHighlighted(undefined);
    if (pushed && reason !== 'history') {
      pushed = false;
      history.back();
    }
    // After Ark releases its focus trap. Not after an outside click: focus
    // went (or goes) where the user clicked.
    if (reason !== 'outside') requestAnimationFrame(() => pageInput?.focus({ preventScroll: true }));
  };

  // Full screen: browser Back closes the view.
  createEffect(() => {
    if (!open() || !fullScreen() || local.history === false || pushed) return;
    history.pushState(history.state, '');
    pushed = true;
  });
  const onPopState = () => {
    if (!pushed) return;
    pushed = false;
    if (untrack(open)) setOpen(false, 'history');
  };
  window.addEventListener('popstate', onPopState);
  onCleanup(() => {
    window.removeEventListener('popstate', onPopState);
    if (pushed) {
      pushed = false;
      history.back();
    }
  });

  // ---- Options (aria-activedescendant) ----
  const options = () =>
    Array.from(
      listbox()?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [],
    );

  const move = (delta: 1 | -1) => {
    const els = options();
    if (els.length === 0) return;
    const index = els.findIndex((el) => el.id === highlighted());
    const next =
      index < 0 ? (delta > 0 ? 0 : els.length - 1) : (index + delta + els.length) % els.length;
    setHighlighted(els[next].id);
    els[next].scrollIntoView({ block: 'nearest' });
  };

  // Count the options; drop a highlight whose option went away.
  createEffect(() => {
    const el = listbox();
    if (!el) return;
    const update = () => {
      setCount(el.querySelectorAll('[role="option"]').length);
      const id = highlighted();
      if (id && !el.contains(document.getElementById(id))) setHighlighted(undefined);
    };
    untrack(update);
    const observer = new MutationObserver(() => untrack(update));
    observer.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-disabled'],
    });
    onCleanup(() => observer.disconnect());
  });

  // Polite announcement, debounced so typing doesn't flood it.
  const [status, setStatus] = createSignal('');
  createEffect(() => {
    const text = open() ? (local.status ?? defaultStatus)(count(), value()) : '';
    const timer = setTimeout(() => setStatus(text), 400);
    onCleanup(() => clearTimeout(timer));
  });

  const select = (selected: string, el: HTMLElement) => {
    local.onSelect?.(selected, el);
    if (local.closeOnSelect ?? true) setOpen(false, 'select');
  };

  const clear = () => {
    setValue('');
    setHighlighted(undefined);
    local.onClear?.();
    viewInput?.focus();
  };

  // ---- Bar input (closed): opens the view ----
  const onPageKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  // ---- View input (open): the combobox ----
  const onViewKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Enter': {
        e.preventDefault();
        const id = highlighted();
        const el = id ? document.getElementById(id) : null;
        if (el) {
          el.click();
        } else {
          local.onSearch?.(value());
          // The query stays visible but loses focus, so the results can be read.
          content?.focus();
        }
        break;
      }
    }
  };

  // Caret at the end when the view opens with text already typed.
  const focusViewInput = () => {
    const input = viewInput;
    if (!input) return null;
    queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length));
    return input;
  };

  let closeReason: SearchCloseReason | undefined;

  const leading = () =>
    'leading' in props ? local.leading : <Icon name="search" />;

  const viewTrailing = () => (
    <Show when={value()} fallback={local.trailing}>
      <IconButton color="standard" icon="close" label={local.clearLabel ?? 'Clear search'} onClick={clear} />
    </Show>
  );

  const geometryStyle = (): JSX.CSSProperties => {
    const g = geometry();
    if (!g) return {};
    return {
      '--_from-start': `${g.fromStart}px`,
      '--_from-end': `${g.fromEnd}px`,
      '--_from-y': `${g.fromY}px`,
      ...(fullScreen()
        ? {}
        : { top: `${g.top}px`, left: `${g.left}px`, width: `${g.width}px` }),
    };
  };

  return (
    <search
      {...rest}
      ref={root}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-search-root=""
      data-variant={variant()}
      data-layout={layout()}
      data-open={open() ? '' : undefined}
    >
      <SearchBarFrame ref={bar} leading={leading()} trailing={local.trailing}>
        <span class={styles.field} onClick={() => setOpen(true)}>
          <Ripple />
          <input
            ref={pageInput}
            class={styles.input}
            type="search"
            role="combobox"
            aria-label={local.placeholder}
            placeholder={local.placeholder}
            aria-haspopup="dialog"
            aria-expanded={open() ? 'true' : 'false'}
            aria-controls={viewId}
            autocomplete="off"
            spellcheck={false}
            value={value()}
            onKeyDown={onPageKeyDown}
            onInput={(e) => {
              setValue(e.currentTarget.value);
              setOpen(true);
            }}
          />
        </span>
      </SearchBarFrame>

      <ArkDialog.Root
        open={open()}
        ids={{ content: viewId }}
        aria-label={local.placeholder}
        modal={fullScreen()}
        trapFocus={fullScreen()}
        preventScroll={fullScreen()}
        restoreFocus={false}
        lazyMount
        unmountOnExit
        initialFocusEl={focusViewInput}
        onEscapeKeyDown={(e) => {
          // First Escape clears the highlight; the next one closes.
          if (highlighted()) {
            e.preventDefault();
            setHighlighted(undefined);
            return;
          }
          closeReason = 'escape';
        }}
        onInteractOutside={() => (closeReason = closeReason ?? 'outside')}
        onOpenChange={(details) => {
          const reason = closeReason ?? 'outside';
          closeReason = undefined;
          if (!details.open) setOpen(false, reason);
        }}
      >
        <Portal>
          <Show when={geometry()}>
            <ArkDialog.Positioner class={styles.positioner} data-layout={layout()}>
              <Show when={!fullScreen()}>
                <div class={styles.scrim} data-state={open() ? 'open' : 'closed'} aria-hidden="true" />
              </Show>
              <ArkDialog.Content
                ref={(el: HTMLDivElement) => (content = el)}
                class={styles.view}
                data-layout={layout()}
                data-variant={variant()}
                tabIndex={-1}
                style={geometryStyle()}
              >
                <SearchBarFrame
                  class={styles.viewBar}
                  leading={
                    <IconButton
                      color="standard"
                      icon="arrow_back"
                      mirror
                      label={local.backLabel ?? 'Back'}
                      onClick={() => setOpen(false, 'back')}
                    />
                  }
                  trailing={viewTrailing()}
                >
                  <span class={styles.field}>
                    <input
                      ref={(el) => (viewInput = el)}
                      class={styles.input}
                      type="search"
                      role="combobox"
                      aria-label={local.placeholder}
                      placeholder={local.placeholder}
                      aria-expanded="true"
                      aria-controls={listboxId}
                      aria-autocomplete="list"
                      aria-activedescendant={highlighted()}
                      autocomplete="off"
                      spellcheck={false}
                      enterkeyhint="search"
                      value={value()}
                      onKeyDown={onViewKeyDown}
                      onInput={(e) => {
                        setValue(e.currentTarget.value);
                        setHighlighted(undefined);
                      }}
                    />
                  </span>
                </SearchBarFrame>

                <Show when={variant() === 'divided'}>
                  <Divider class={styles.divider} />
                </Show>

                <div class={styles.results}>
                  <Show when={local.header}>
                    <div class={styles.header}>{local.header}</div>
                  </Show>
                  <ListContext.Provider
                    value={{
                      variant: () => 'expressive',
                      segmented: () => false,
                      interaction: () => 'single-action',
                      selectable: () => false,
                      checkIndicator: () => false,
                      register: () => {},
                      option: {
                        highlighted: (id) => highlighted() === id,
                        highlight: setHighlighted,
                        select,
                      },
                    }}
                  >
                    <div
                      ref={setListbox}
                      id={listboxId}
                      class={styles.listbox}
                      role="listbox"
                      aria-label={local.resultsLabel ?? 'Suggestions'}
                    >
                      {local.children}
                    </div>
                  </ListContext.Provider>
                  <Show when={count() === 0 && local.empty}>
                    <div class={styles.empty}>{local.empty}</div>
                  </Show>
                </div>

                <div class={styles.visuallyHidden} role="status">
                  {status()}
                </div>
              </ArkDialog.Content>
            </ArkDialog.Positioner>
          </Show>
        </Portal>
      </ArkDialog.Root>
    </search>
  );
};

// ---- Group ----

export type SearchGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Category label ("Recent", "Links"); names the group. */
  label?: string;
  /** `ListItem`s. */
  children?: JSX.Element;
};

/**
 * A group of options (`role="group"`) with an optional category label.
 * Groups are separated by gaps.
 */
export const SearchGroup: Component<SearchGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'children', 'class']);
  const labelId = createUniqueId();
  return (
    <div
      {...rest}
      class={local.class ? `${styles.group} ${local.class}` : styles.group}
      role="group"
      aria-labelledby={local.label ? labelId : undefined}
    >
      <Show when={local.label}>
        <div id={labelId} class={styles.groupLabel} role="presentation">
          {local.label}
        </div>
      </Show>
      {local.children}
    </div>
  );
};
