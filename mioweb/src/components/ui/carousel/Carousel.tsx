import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
} from 'solid-js';
import { prefersReducedMotion, readPx } from '../loading-and-progress/shared/motion';
import { Ripple } from '../shared/Ripple';
import {
  buildModel,
  placeItem,
  sizeClass,
  snapPoints,
  SMALL_MAX,
  stateAt,
  targetFor,
  type KeylineKind,
  type KeylineModel,
} from './keylines';
import styles from './carousel.module.css';

export type CarouselLayout = 'multi-browse' | 'uncontained' | 'uncontained-multi-aspect' | 'hero' | 'full-screen';
export type CarouselAlign = 'start' | 'center';

const merge = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

/** Default large item max width for multi-browse and uncontained (derived: Compose sample value). */
const DEFAULT_LARGE_MAX = 186;
/** Multi-aspect item ratios are clamped to 9:16 ... 16:9 (spec). */
const MIN_RATIO = 9 / 16;
const MAX_RATIO = 16 / 9;
/** Mouse movement before a press turns into a drag. */
const DRAG_THRESHOLD = 6;

const HAS_SCROLLEND = typeof window !== 'undefined' && 'onscrollend' in window;

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

interface ItemRecord {
  li: HTMLLIElement;
  mask: () => HTMLElement | undefined;
}

interface CarouselContextValue {
  register: (record: ItemRecord) => void;
  unregister: (record: ItemRecord) => void;
  items: Accessor<ItemRecord[]>;
}

const CarouselContext = createContext<CarouselContextValue>();

export type CarouselProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Accessible name of the carousel (`aria-label`). */
  label: string;
  /** Default `multi-browse`. */
  layout?: CarouselLayout;
  /**
   * `center` centers the large items once scrolled (center-aligned hero
   * with `layout="hero"`). Applies to `multi-browse` and `hero`. Default `start`.
   */
  align?: CarouselAlign;
  /**
   * Snap items to the layout on release. Default true, except for the
   * uncontained layouts (free scrolling). Full-screen always snaps.
   */
  snap?: boolean;
  /**
   * Large item max width in px: drives how many items fit. Default 186
   * (multi-browse, uncontained), or the available width minus one small item
   * (hero).
   */
  largeItemMaxWidth?: number;
  /** 1px outline on every item. */
  outline?: boolean;
  /** Index of the first large item, after scrolling settles. */
  onIndexChange?: (index: number) => void;
  /** `CarouselItem`s. */
  children?: JSX.Element;
};

/**
 * M3 carousel (m3-guidelines/components/carousel.md): a scrollable row of
 * visual items.
 *
 * - `multi-browse` / `hero` (optionally `align="center"`): items morph
 *   between large, medium and small widths as they scroll, masking a visual
 *   that keeps the large width (parallax). Laid out by `keylines.ts`; snaps
 *   through invisible markers.
 * - `uncontained` / `uncontained-multi-aspect`: fixed-size items in a plain
 *   scrolling row that bleeds past the trailing edge.
 * - `full-screen`: one edge-to-edge item at a time, scrolling vertically.
 *
 * With reduced motion, `multi-browse` and `hero` become a row of same-size
 * items (no morph, no parallax). Every item is a tab stop; arrows move
 * between items, Home/End jump to the ends, and the cross-axis arrows leave
 * the carousel. Give the carousel a block size (default 220px; full-screen
 * 100dvh). On scrolling pages, add a "Show all" button below it (spec §7).
 */
export const Carousel: Component<CarouselProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'layout',
    'align',
    'snap',
    'largeItemMaxWidth',
    'outline',
    'onIndexChange',
    'class',
    'children',
    'ref',
  ]);

  let root!: HTMLElement;
  let scroller!: HTMLDivElement;

  const layout = () => local.layout ?? 'multi-browse';
  const isKeyline = () => layout() === 'multi-browse' || layout() === 'hero';
  const reduced = () => prefersReducedMotion();
  const keylineMode = () => isKeyline() && !reduced();
  const vertical = () => layout() === 'full-screen';
  const snap = () => vertical() || (local.snap ?? !layout().startsWith('uncontained'));

  const [records, setRecords] = createSignal<ItemRecord[]>([]);
  const items = createMemo(() =>
    [...records()].sort((a, b) =>
      a.li.compareDocumentPosition(b.li) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    ),
  );
  const [snaps, setSnaps] = createSignal<number[]>([]);

  let model: KeylineModel | undefined;
  let rtl = false;
  let activeIndex = -1;

  const sign = () => (rtl ? -1 : 1);
  const behavior = (): ScrollBehavior => (reduced() ? 'auto' : 'smooth');

  /* ---- Layout ---- */

  const place = () => {
    if (!model) return;
    const p = Math.abs(scroller.scrollLeft);
    const state = stateAt(model, p);
    const list = items();
    let largest = -1;
    let largestWidth = -1;
    list.forEach((record, i) => {
      const { x, w, offscreen } = placeItem(model!, state, i, p);
      const style = record.li.style;
      style.transform = `translateX(${sign() * (p + x)}px)`;
      style.inlineSize = `${w}px`;
      record.li.dataset.size = sizeClass(model!, w);
      if (offscreen) record.li.dataset.offscreen = '';
      else delete record.li.dataset.offscreen;
      if (w > largestWidth + 0.5) {
        largest = i;
        largestWidth = w;
      }
    });
    return largest;
  };

  /** Index of the first large item (keylines) or the item at the scroll start (flow layouts). */
  const currentIndex = (): number => {
    const list = items();
    if (list.length === 0) return -1;
    if (keylineMode()) return place() ?? -1;
    const box = scroller.getBoundingClientRect();
    const padding = vertical() ? 0 : readPx(getComputedStyle(scroller), 'scroll-padding-inline-start', 0);
    let best = 0;
    let bestDistance = Infinity;
    list.forEach((record, i) => {
      const r = record.li.getBoundingClientRect();
      const offset = vertical() ? r.top - box.top : rtl ? box.right - r.right : r.left - box.left;
      const distance = Math.abs(offset - padding);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    return best;
  };

  const relayout = (keepIndex: boolean) => {
    if (!scroller) return;
    const list = items();
    const style = getComputedStyle(root);
    rtl = style.direction === 'rtl';
    const ps = readPx(style, '--_padding-start', 16);
    const pe = readPx(style, '--_padding-end', 16);
    const gap = readPx(style, '--_gap', 8);
    const Wc = scroller.clientWidth;
    const W = Wc - ps - pe;
    const track = scroller.querySelector<HTMLElement>(`.${CSS.escape(styles.track)}`);
    const previous = keepIndex ? activeIndex : -1;

    if (keylineMode()) {
      const center = local.align === 'center';
      // Hero default (derived, spec §4.2): the available width minus one small item and its gap(s).
      const heroMax = W - (center ? 2 : 1) * (gap + SMALL_MAX);
      const Lmax = local.largeItemMaxWidth ?? (layout() === 'hero' ? heroMax : DEFAULT_LARGE_MAX);
      model = buildModel({ Wc, ps, pe, gap, Lmax, n: list.length, kind: layout() as KeylineKind, center });
      if (!model) return;
      if (track) track.style.inlineSize = `${model.P + Wc}px`;
      root.style.setProperty('--_large', `${model.L}px`);
      setSnaps(snapPoints(model, list.length));
      if (previous >= 0 && previous < list.length) {
        scroller.scrollLeft = sign() * targetFor(model, previous);
      }
      place();
      return;
    }

    model = undefined;
    setSnaps([]);
    if (track) track.style.inlineSize = '';
    root.style.removeProperty('--_large');
    let itemSize = local.largeItemMaxWidth ?? DEFAULT_LARGE_MAX;
    if (isKeyline()) {
      // Reduced motion (spec §6): same-size items. Hero leaves 24px for the
      // next item to peek (derived, spec blueprint).
      itemSize = layout() === 'hero' ? Math.max(1, W - 24) : Math.max(1, Math.min(itemSize, W));
    }
    root.style.setProperty('--_item-size', `${itemSize}px`);
    for (const record of list) {
      record.li.style.transform = '';
      record.li.style.inlineSize = '';
      record.li.dataset.size = 'large';
      delete record.li.dataset.offscreen;
    }
  };

  /* ---- Scroll ---- */

  let frame = 0;
  let settleTimer: number | undefined;

  const settle = () => {
    const index = currentIndex();
    if (index >= 0 && index !== activeIndex) {
      activeIndex = index;
      local.onIndexChange?.(index);
    }
  };

  const onScroll = () => {
    if (keylineMode() && !frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    }
    // Fallback for browsers without `scrollend`.
    if (!HAS_SCROLLEND) {
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 150);
    }
  };

  const scrollToIndex = (i: number) => {
    const record = items()[i];
    if (!record) return;
    if (keylineMode() && model) {
      scroller.scrollTo({ left: sign() * targetFor(model, i), behavior: behavior() });
      return;
    }
    const box = scroller.getBoundingClientRect();
    const r = record.li.getBoundingClientRect();
    if (vertical()) {
      scroller.scrollBy({ top: r.top - box.top, behavior: behavior() });
    } else {
      const padding = readPx(getComputedStyle(scroller), 'scroll-padding-inline-start', 0);
      const delta = rtl ? r.right - (box.right - padding) : r.left - (box.left + padding);
      scroller.scrollBy({ left: delta, behavior: behavior() });
    }
  };

  /* ---- Keyboard and focus ---- */

  let pointerFocus = false;

  const indexOf = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return -1;
    const li = target.closest('li');
    return items().findIndex((record) => record.li === li);
  };

  const focusItem = (i: number) => {
    const mask = items()[i]?.mask();
    if (!mask) return;
    mask.focus({ preventScroll: true });
    scrollToIndex(i);
  };

  /** Moves focus to the nearest tab stop before or after the carousel. */
  const leave = (forward: boolean) => {
    const candidates = [...document.querySelectorAll<HTMLElement>(TABBABLE)].filter(
      (el) => !root.contains(el) && el.tabIndex >= 0 && el.getClientRects().length > 0,
    );
    const following = (el: HTMLElement) =>
      !!(root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const next = forward ? candidates.find(following) : candidates.filter((el) => !following(el)).pop();
    next?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const i = indexOf(e.target);
    if (i < 0) return;
    const last = items().length - 1;
    const prevKey = vertical() ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = vertical() ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    // Cross-axis arrows leave the carousel (spec §8; vertical for full-screen, derived).
    const outBack = vertical() ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const outForward = vertical() ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    let handled = true;
    switch (e.key) {
      case prevKey:
        if (i > 0) focusItem(i - 1);
        break;
      case nextKey:
        if (i < last) focusItem(i + 1);
        break;
      case 'Home':
        focusItem(0);
        break;
      case 'End':
        focusItem(last);
        break;
      case outBack:
        leave(false);
        break;
      case outForward:
        leave(true);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };

  // The focused item scrolls to its snap position, large and fully visible
  // (spec §8). Not on pointer focus: tapping an inactive item activates it.
  const onFocusIn = (e: FocusEvent) => {
    if (pointerFocus) return;
    const i = indexOf(e.target);
    if (i >= 0 && keylineMode()) scrollToIndex(i);
  };

  /* ---- Mouse drag (derived: no horizontal wheel on most mice, and the scrollbar is hidden) ---- */

  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;

  const suppressClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onPointerMove = (e: PointerEvent) => {
    const dx = e.clientX - dragStartX;
    if (!dragging && Math.abs(dx) > DRAG_THRESHOLD) {
      dragging = true;
      root.dataset.dragging = '';
    }
    if (dragging) scroller.scrollLeft = dragStartScroll - dx;
  };

  const onPointerUp = () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    if (!dragging) return;
    dragging = false;
    root.addEventListener('click', suppressClick, { capture: true, once: true });
    setTimeout(() => root.removeEventListener('click', suppressClick, { capture: true }), 0);
    delete root.dataset.dragging;
    if (snap() && keylineMode() && model) {
      const p = Math.abs(scroller.scrollLeft);
      const nearest = snaps().reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a), 0);
      scroller.scrollTo({ left: sign() * nearest, behavior: behavior() });
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    // Touch browsers may focus on the click that follows pointerup.
    pointerFocus = true;
    const reset = () => setTimeout(() => (pointerFocus = false), 300);
    window.addEventListener('pointerup', reset, { once: true });
    window.addEventListener('pointercancel', reset, { once: true });
    if (e.pointerType !== 'mouse' || e.button !== 0 || vertical()) return;
    dragStartX = e.clientX;
    dragStartScroll = scroller.scrollLeft;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  /* ---- Lifecycle ---- */

  onMount(() => {
    const observer = new ResizeObserver(() => relayout(true));
    observer.observe(root);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', settle);
    onCleanup(() => {
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scrollend', settle);
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      onPointerUp();
    });
  });

  createEffect(
    on(
      () => [items(), layout(), local.align, local.largeItemMaxWidth, reduced()] as const,
      () => {
        relayout(false);
        settle();
      },
    ),
  );

  const setRef = (el: HTMLElement) => {
    root = el;
    (local.ref as ((el: HTMLElement) => void) | undefined)?.(el);
  };

  return (
    <CarouselContext.Provider
      value={{
        register: (record) => setRecords((list) => [...list, record]),
        unregister: (record) => setRecords((list) => list.filter((r) => r !== record)),
        items,
      }}
    >
      <section
        {...rest}
        ref={setRef}
        class={merge(styles.root, local.class)}
        aria-roledescription="carousel"
        aria-label={local.label}
        data-layout={layout()}
        data-align={isKeyline() ? (local.align ?? 'start') : undefined}
        data-snap={snap() ? 'true' : 'false'}
        data-outline={local.outline ? '' : undefined}
        data-reduced={isKeyline() && reduced() ? '' : undefined}
      >
        <div
          ref={scroller}
          class={styles.scroller}
          onKeyDown={onKeyDown}
          onFocusIn={onFocusIn}
          onPointerDown={onPointerDown}
          onDragStart={(e) => e.preventDefault()}
        >
          <ul class={styles.track} role="list">
            {local.children}
          </ul>
          <For each={snaps()}>
            {(p) => <span class={styles.snap} style={{ 'inset-inline-start': `${p}px` }} aria-hidden="true" />}
          </For>
        </div>
      </section>
    </CarouselContext.Provider>
  );
};

/* ---- Item ---- */

type ItemCommon = {
  /** Visual: an `<img alt="">`, `<video>`, `<picture>` or `<svg>`. Covers the item. */
  children?: JSX.Element;
  /** Title, shown on large items (title-medium). */
  title?: string;
  /** Label, shown on large and medium items (label-large). */
  label?: string;
  /** Abbreviated label for small items (label-medium). */
  labelShort?: string;
  /**
   * Accessible name when there's no title or label. The item is announced
   * as "3 of 10, <name>".
   */
  'aria-label'?: string;
  /** Faded and not activatable; stays focusable so it's still announced. */
  disabled?: boolean;
  /** Width / height for `uncontained-multi-aspect`, clamped to 9:16 ... 16:9. Default 1. */
  aspectRatio?: number;
  class?: string;
};

type AnchorAttrs = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href' | 'title' | 'aria-label'>;
type ButtonAttrs = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled' | 'title' | 'aria-label'>;

export type CarouselItemProps = ItemCommon & (({ href: string } & AnchorAttrs) | ({ href?: undefined } & ButtonAttrs));

const callHandler = <E extends Event>(handler: unknown, e: E) => {
  if (typeof handler === 'function') handler(e);
  else if (Array.isArray(handler) && typeof handler[0] === 'function') handler[0](handler[1], e);
};

/**
 * One carousel item: a link (`href`) or a button covering the item, with the
 * visual as children and optional title/label text over a scrim. The text
 * adapts to the item's size: large shows title and label, medium the label,
 * small the short label.
 */
export const CarouselItem: Component<CarouselItemProps> = (props) => {
  const [local, rest] = splitProps(props as CarouselItemProps & { href?: string; onClick?: unknown }, [
    'children',
    'title',
    'label',
    'labelShort',
    'aria-label',
    'disabled',
    'aspectRatio',
    'class',
    'href',
    'onClick',
  ]);
  const carousel = useContext(CarouselContext);
  if (!carousel) throw new Error('CarouselItem must be inside a Carousel');

  let li!: HTMLLIElement;
  let mask: HTMLElement | undefined;
  const record: ItemRecord = { li: undefined as unknown as HTMLLIElement, mask: () => mask };

  onMount(() => {
    record.li = li;
    carousel.register(record);
  });
  onCleanup(() => carousel.unregister(record));

  const index = () => carousel.items().indexOf(record);
  const accessibleName = () => {
    const name = local['aria-label'] ?? local.title ?? local.label;
    const i = index();
    const position = i >= 0 ? `${i + 1} of ${carousel.items().length}` : '';
    return [position, name].filter(Boolean).join(', ');
  };
  const ratio = () =>
    local.aspectRatio === undefined ? undefined : Math.min(MAX_RATIO, Math.max(MIN_RATIO, local.aspectRatio));

  // Set directly: the carousel writes the item's transform and inline size inline too.
  createEffect(() => {
    const r = ratio();
    if (r === undefined) li.style.removeProperty('--_ratio');
    else li.style.setProperty('--_ratio', String(r));
  });

  const onClick = (e: MouseEvent) => {
    if (local.disabled) {
      e.preventDefault();
      return;
    }
    callHandler(local.onClick, e);
  };

  const content = () => (
    <>
      <Ripple />
      <span class={styles.visual}>{local.children}</span>
      <Show when={local.title || local.label || local.labelShort}>
        <span class={styles.text} aria-hidden="true">
          <Show when={local.title}>
            <span class={styles.title}>{local.title}</span>
          </Show>
          <Show when={local.label}>
            <span class={styles.label}>{local.label}</span>
          </Show>
          <Show when={local.labelShort}>
            <span class={styles.labelShort}>{local.labelShort}</span>
          </Show>
        </span>
      </Show>
    </>
  );

  return (
    <li ref={li} class={styles.item} data-size="large">
      <Show
        when={local.href !== undefined}
        fallback={
          <button
            type="button"
            {...(rest as ButtonAttrs)}
            ref={(el) => (mask = el)}
            class={merge(styles.mask, local.class)}
            aria-label={accessibleName()}
            aria-disabled={local.disabled ? 'true' : undefined}
            onClick={onClick}
          >
            {content()}
          </button>
        }
      >
        <a
          {...(rest as AnchorAttrs)}
          ref={(el) => (mask = el)}
          class={merge(styles.mask, local.class)}
          href={local.disabled ? undefined : local.href}
          role={local.disabled ? 'link' : undefined}
          tabIndex={local.disabled ? 0 : undefined}
          aria-label={accessibleName()}
          aria-disabled={local.disabled ? 'true' : undefined}
          onClick={onClick}
        >
          {content()}
        </a>
      </Show>
    </li>
  );
};
