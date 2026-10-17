import { children as resolveChildren, Show, splitProps, type Component, type JSX } from 'solid-js';
import { Ripple } from '../shared/Ripple';
import styles from './search.module.css';

const present = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value != null && value !== false;

// ---- Frame (shared by SearchBar, Search and the search view header) ----

export type SearchBarFrameProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> & {
  leading?: JSX.Element;
  trailing?: JSX.Element;
  /** The field: a `<button>` (trigger) or an `<input>` wrapped by `SearchField`. */
  children: JSX.Element;
};

/**
 * The 56px pill: leading slot (48px target), the field, trailing slot (up
 * to two 48px targets, no gap). Padding is 4px at an edge with an element
 * and 16px at an edge without one. The state layer and focus ring cover the
 * whole container and follow the field, not the nested icon buttons.
 *
 * Internal; `SearchBar` and `Search` render it. Parents restyle it through
 * `[data-search-bar]` (e.g. the search app bar's container color).
 */
export const SearchBarFrame: Component<SearchBarFrameProps> = (props) => {
  const [local, rest] = splitProps(props, ['leading', 'trailing', 'children', 'class']);
  const leading = resolveChildren(() => local.leading);
  const trailing = resolveChildren(() => local.trailing);
  return (
    <div
      {...rest}
      class={local.class ? `${styles.bar} ${local.class}` : styles.bar}
      data-search-bar=""
      data-leading={present(leading()) ? '' : undefined}
      data-trailing={present(trailing()) ? '' : undefined}
    >
      <Show when={present(leading())}>
        <span class={styles.leading}>{leading()}</span>
      </Show>
      {local.children}
      <Show when={present(trailing())}>
        <span class={styles.trailing}>{trailing()}</span>
      </Show>
    </div>
  );
};

// ---- SearchBar (trigger) ----

export type SearchBarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> & {
  /** Hinted search text; also the button's accessible name. Should contain "Search". */
  placeholder: string;
  /** Navigation icon button (Menu) or a decorative icon (`<Icon name="search" />`). */
  leading?: JSX.Element;
  /** Up to two icon buttons, or an avatar plus one icon button. */
  trailing?: JSX.Element;
  /** The bar was activated (click, Enter, Space): open the search view. */
  onActivate?: () => void;
  /** Whether the view it opens is showing (`aria-expanded`). */
  expanded?: boolean;
  /** Id of the view it opens (`aria-controls`). */
  controls?: string;
};

/**
 * A search bar that is only an entry point: the hint is a `<button>`
 * (`aria-haspopup="dialog"`) filling the pill, and activating it opens a
 * separate search view or page. The search app bar (`AppBar
 * variant="search"`) uses it. For a bar you type into, with suggestions,
 * use `Search`.
 */
export const SearchBar: Component<SearchBarProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'placeholder',
    'leading',
    'trailing',
    'onActivate',
    'expanded',
    'controls',
  ]);
  return (
    <SearchBarFrame {...rest} leading={local.leading} trailing={local.trailing}>
      <button
        type="button"
        class={`${styles.field} ${styles.trigger}`}
        aria-haspopup="dialog"
        aria-expanded={local.expanded === undefined ? undefined : local.expanded ? 'true' : 'false'}
        aria-controls={local.controls}
        onClick={() => local.onActivate?.()}
      >
        <Ripple />
        <span class={styles.hint} data-search-hint="">
          {local.placeholder}
        </span>
      </button>
    </SearchBarFrame>
  );
};
