import {
  children as resolveChildren,
  createEffect,
  createSignal,
  onCleanup,
  Show,
  splitProps,
  type Component,
  type JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { SearchBar } from '../search/SearchBar';
import styles from './app-bar.module.css';

export type AppBarVariant = 'small' | 'medium-flexible' | 'large-flexible' | 'search';
export type AppBarScrollBehavior = 'pinned' | 'collapse' | 'enter-always';

export type AppBarProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'title'> & {
  /** Default `small`. */
  variant?: AppBarVariant;
  /** Headline. Small: one line, never wraps. Flexible: up to two lines. */
  title?: JSX.Element;
  /** Optional line under the headline. */
  subtitle?: JSX.Element;
  /** Center the headline and subtitle. */
  centered?: boolean;
  /** Heading level of the headline. Default 1. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Image or logo. Small: replaces the text when there's no title. Flexible: above the text. */
  image?: JSX.Element;
  /** One navigation icon button: Back or Menu. */
  leading?: JSX.Element;
  /** Up to two icon buttons, one filled/tonal icon button, or an avatar. */
  trailing?: JSX.Element;

  /** Search variant: hint text. Must contain "Search". Default "Search". */
  searchPlaceholder?: string;
  /** Search variant: icon shown inside the search container, before the hint. */
  searchLeading?: JSX.Element;
  /** Search variant: icon buttons or avatar inside the search container. */
  searchTrailing?: JSX.Element;
  /** Search variant: the search container was activated; open the search view. */
  onSearchOpen?: () => void;
  /**
   * Search variant: a `Search` to use instead of the built-in trigger (a
   * `SearchBar` built from the `search*` props), so the bar opens its own
   * focused view. It takes the search container's width and colors.
   */
  search?: JSX.Element;

  /**
   * - `pinned`: always fully visible.
   * - `collapse` (default for flexible variants): the headline scrolls away
   *   and the bar stays as a small app bar.
   * - `enter-always`: hides when scrolling down, shows when scrolling up
   *   (flexible variants collapse first).
   */
  scrollBehavior?: AppBarScrollBehavior;
  /**
   * The scrolling element the bar sits in. The bar is `position: sticky`,
   * so it must be a child of that element (or of the page). Default: window.
   */
  scrollTarget?: HTMLElement;
  /** Keep the container transparent when content scrolls under it. */
  transparentOnScroll?: boolean;
};

const LOCAL = [
  'variant',
  'title',
  'subtitle',
  'centered',
  'headingLevel',
  'image',
  'leading',
  'trailing',
  'searchPlaceholder',
  'searchLeading',
  'searchTrailing',
  'onSearchOpen',
  'search',
  'scrollBehavior',
  'scrollTarget',
  'transparentOnScroll',
  'class',
  'ref',
] as const;

/**
 * M3 Expressive app bar (m3-guidelines/components/app-bars.md): search,
 * small, medium flexible and large flexible. The container fills with
 * surface-container when content scrolls under it (no shadow).
 *
 * Put it at the top of its scrolling container.
 */
export const AppBar: Component<AppBarProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);

  const variant = () => local.variant ?? 'small';
  const flexible = () => variant() === 'medium-flexible' || variant() === 'large-flexible';
  const behavior = (): AppBarScrollBehavior =>
    local.scrollBehavior ?? (flexible() ? 'collapse' : 'pinned');
  const collapsible = () => flexible() && behavior() !== 'pinned';

  const leading = resolveChildren(() => local.leading);
  const trailing = resolveChildren(() => local.trailing);
  const searchTrailing = resolveChildren(() => local.searchTrailing);
  const has = (c: () => unknown) => {
    const v = c();
    return Array.isArray(v) ? v.length > 0 : v != null && v !== false;
  };

  if (import.meta.env.DEV) {
    createEffect(() => {
      const count = trailing.toArray().length + searchTrailing.toArray().length;
      if (count > (variant() === 'search' ? 3 : 2)) {
        console.warn(
          `AppBar: ${count} trailing actions. Use at most two icon buttons (plus an avatar in the search app bar); move the rest to a toolbar.`,
        );
      }
    });
  }

  let header!: HTMLElement;
  let expanded: HTMLDivElement | undefined;
  const [extra, setExtra] = createSignal(0);
  const [collapse, setCollapse] = createSignal(0);
  const [scrolled, setScrolled] = createSignal(false);
  const [hidden, setHidden] = createSignal(false);

  // Height of the expanded headline area: how far a flexible bar collapses.
  createEffect(() => {
    if (!collapsible() || !expanded) {
      setExtra(0);
      return;
    }
    const el = expanded;
    const ro = new ResizeObserver(() => setExtra(el.offsetHeight));
    ro.observe(el);
    onCleanup(() => ro.disconnect());
  });

  createEffect(() => {
    const target = local.scrollTarget;
    const scroller: HTMLElement | Window = target ?? window;
    const position = () => (target ? target.scrollTop : window.scrollY);
    const top = () => (target ? target.getBoundingClientRect().top : 0);
    const enterAlways = behavior() === 'enter-always';
    const max = extra();
    let last = position();
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = position();
      // How far the header has scrolled past the top of the scroller.
      const passed = top() - header.getBoundingClientRect().top;
      setCollapse(max > 0 ? Math.min(Math.max(passed, 0), max) : 0);
      setScrolled(y > max);
      if (enterAlways) {
        if (y < last || y <= header.offsetHeight) setHidden(false);
        else if (y > last) setHidden(true);
      } else {
        setHidden(false);
      }
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onCleanup(() => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
    });
  });

  const collapsed = () => collapsible() && extra() > 0 && collapse() >= extra() - 1;

  const heading = (cls: string) => (
    <Dynamic component={`h${local.headingLevel ?? 1}`} class={cls}>
      {local.title}
    </Dynamic>
  );

  return (
    <header
      {...rest}
      ref={(el) => {
        header = el;
        if (typeof local.ref === 'function') (local.ref as (el: HTMLElement) => void)(el);
      }}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-variant={variant()}
      data-centered={local.centered ? '' : undefined}
      data-collapsible={collapsible() ? '' : undefined}
      data-collapsed={collapsed() ? '' : undefined}
      data-scrolled={scrolled() ? '' : undefined}
      data-hidden={hidden() ? '' : undefined}
      data-transparent={local.transparentOnScroll ? '' : undefined}
      data-subtitle={local.subtitle ? '' : undefined}
      style={{
        '--_extra': `${extra()}px`,
        '--_collapse': `${collapse()}px`,
        '--_progress': extra() > 0 ? collapse() / extra() : 0,
      }}
    >
      <div
        class={styles.bar}
        data-leading={has(leading) ? '' : undefined}
        data-trailing={has(trailing) ? '' : undefined}
      >
        <Show when={has(leading)}>
          <div class={styles.leading}>{leading()}</div>
        </Show>

        <Show when={variant() === 'search'}>
          <div class={styles.searchSlot}>
            <Show
              when={local.search}
              fallback={
                <SearchBar
                  placeholder={local.searchPlaceholder ?? 'Search'}
                  leading={local.searchLeading}
                  trailing={has(searchTrailing) ? searchTrailing() : undefined}
                  onActivate={() => local.onSearchOpen?.()}
                />
              }
            >
              {local.search}
            </Show>
          </div>
        </Show>

        <Show when={variant() === 'small'}>
          <div class={styles.headline}>
            <Show when={local.title} fallback={local.image}>
              {heading(styles.title)}
            </Show>
            <Show when={local.subtitle}>
              <p class={styles.subtitle}>{local.subtitle}</p>
            </Show>
          </div>
        </Show>

        {/* Flexible variants: the small title shown once the bar has collapsed. */}
        <Show when={flexible()}>
          <div class={styles.headline} aria-hidden="true">
            <Show when={collapsible()}>
              <span class={`${styles.title} ${styles.collapsedTitle}`}>{local.title}</span>
            </Show>
          </div>
        </Show>

        <Show when={has(trailing)}>
          <div class={styles.trailing}>{trailing()}</div>
        </Show>
      </div>

      <Show when={flexible()}>
        <div ref={expanded} class={styles.expanded}>
          <Show when={local.image}>
            <div class={styles.image}>{local.image}</div>
          </Show>
          {heading(styles.title)}
          <Show when={local.subtitle}>
            <p class={styles.subtitle}>{local.subtitle}</p>
          </Show>
        </div>
      </Show>
    </header>
  );
};
