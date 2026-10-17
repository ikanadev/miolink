import { ToggleGroup } from '@ark-ui/solid/toggle-group';
import { createEffect, createSignal, onCleanup, Show, splitProps, type Component, type JSX } from 'solid-js';
import {
  ButtonGroupContext,
  type ButtonGroupSelection,
  type ButtonGroupState,
  type ButtonGroupVariant,
} from '../shared/group-context';
import type { ButtonShape, ButtonSize } from '../shared/types';
import styles from './button-group.module.css';

export type ButtonGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> & {
  /** Default `standard`. `connected` is for selecting options (it replaces segmented buttons). */
  variant?: ButtonGroupVariant;
  /** Default `small`. Applied to every item. */
  size?: ButtonSize;
  /** Default `round`. Applied to every item. */
  shape?: ButtonShape;
  /**
   * Default `none` (an action group). `single` is a radio group, `multi` a
   * set of toggles; items then need a `value`.
   */
  selection?: ButtonGroupSelection;
  /** With a selection mode: the last selected item can't be deselected. */
  required?: boolean;
  /** Controlled selected values. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Accessible name of the group (optional). */
  label?: string;
  /** `Button` and `IconButton` items (not text buttons or standard icon buttons). */
  children: JSX.Element;
};

/** Pressed item width multiplier (`pressed.item.width.multiplier`, 15%). */
const PRESSED_GROWTH = 0.15;
/** Neighbours never shrink below a 48px target (derived). */
const MIN_ITEM_WIDTH = 48;

const isDisabled = (el: Element) => el.matches(':disabled, [data-disabled], [aria-disabled="true"]');

type Rest = { width: number; padStart: number; padEnd: number; minWidth: number };

type Target = { width: number; padStart: number; padEnd: number };

const px = (value: string) => parseFloat(value) || 0;

/** Rest geometry of an item; `minWidth` keeps its content (label, icon) whole. */
const measure = (el: HTMLElement): Rest => {
  const cs = getComputedStyle(el);
  const padStart = px(cs.paddingInlineStart);
  const padEnd = px(cs.paddingInlineEnd);
  const inFlow = [...el.children].filter((child) => getComputedStyle(child).position !== 'absolute');
  const content =
    inFlow.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0) +
    px(cs.columnGap) * Math.max(0, inFlow.length - 1);
  return {
    width: el.getBoundingClientRect().width,
    padStart,
    padEnd,
    minWidth: content + px(cs.borderInlineStartWidth) + px(cs.borderInlineEndWidth),
  };
};

/**
 * Standard group press "bounce": the pressed item grows 15% and its
 * neighbours shrink by the same amount, so the group keeps its width.
 * Neighbours give the width up from their padding first, so labels are never
 * truncated (M3: don't truncate label text). Animated with the Web
 * Animations API on inline-size and padding with the fast spatial spring
 * curve; releasing animates back and then hands the values back to CSS.
 * Skipped with reduced motion and outside the standard variant.
 */
const attachPressBounce = (root: HTMLElement, enabled: () => boolean) => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let rest: Map<HTMLElement, Rest> | undefined;
  const running = new Map<HTMLElement, Animation>();

  const timing = (): KeyframeAnimationOptions => {
    const cs = getComputedStyle(root);
    return {
      duration: parseFloat(cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-duration')) || 350,
      easing: cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-easing').trim() || 'ease-out',
      fill: 'forwards',
    };
  };

  const animateTo = (targets: Map<HTMLElement, Target>, onDone?: () => void) => {
    const options = timing();
    let last: Animation | undefined;
    for (const [el, target] of targets) {
      const cs = getComputedStyle(el);
      const keyframes = [
        {
          inlineSize: `${el.getBoundingClientRect().width}px`,
          paddingInlineStart: cs.paddingInlineStart,
          paddingInlineEnd: cs.paddingInlineEnd,
        },
        {
          inlineSize: `${target.width}px`,
          paddingInlineStart: `${target.padStart}px`,
          paddingInlineEnd: `${target.padEnd}px`,
        },
      ];
      running.get(el)?.cancel();
      try {
        last = el.animate(keyframes, options);
      } catch {
        // An easing the browser doesn't accept: fall back to a plain curve.
        last = el.animate(keyframes, { ...options, easing: 'ease-out' });
      }
      running.set(el, last);
    }
    if (last && onDone) last.onfinish = onDone;
  };

  const atRest = (r: Rest): Target => ({ width: r.width, padStart: r.padStart, padEnd: r.padEnd });

  const press = (item: HTMLElement) => {
    if (!enabled() || motion.matches || isDisabled(item)) return;
    const items = [...root.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.getClientRects().length > 0,
    );
    const index = items.indexOf(item);
    if (index < 0) return;
    // Measured once per press-release cycle, before any animation changes them.
    rest ??= new Map(items.map((el) => [el, measure(el)]));
    const restOf = (el: HTMLElement) => rest?.get(el) ?? measure(el);

    const neighbours = [items[index - 1], items[index + 1]].filter((el): el is HTMLElement => !!el);
    const pressed = restOf(item);
    const delta = pressed.width * PRESSED_GROWTH;
    const targets = new Map<HTMLElement, Target>([[item, { ...atRest(pressed), width: pressed.width + delta }]]);
    // Neighbours give up their share down to 48px and to their content width
    // (never growing, so items already narrower stay put); what they can't
    // give, the group absorbs. Padding shrinks by what the content box can't
    // spare, so the label keeps its max-content width.
    for (const el of neighbours) {
      const r = restOf(el);
      const width = Math.max(Math.min(r.width, MIN_ITEM_WIDTH), r.minWidth, r.width - delta / neighbours.length);
      const spare = width - r.minWidth;
      const cut = Math.max(0, r.padStart + r.padEnd - spare) / 2;
      targets.set(el, { width, padStart: Math.max(0, r.padStart - cut), padEnd: Math.max(0, r.padEnd - cut) });
    }
    // Items that were part of a previous press go back to rest.
    for (const el of running.keys()) if (!targets.has(el)) targets.set(el, atRest(restOf(el)));
    animateTo(targets);
  };

  const release = () => {
    if (!rest || running.size === 0) return;
    const targets = new Map<HTMLElement, Target>();
    for (const el of running.keys()) {
      const r = rest.get(el);
      if (r) targets.set(el, atRest(r));
    }
    animateTo(targets, () => {
      for (const animation of running.values()) animation.cancel();
      running.clear();
      rest = undefined;
    });
  };

  const itemOf = (target: EventTarget | null) => {
    let el = target instanceof Element ? target : null;
    while (el && el.parentElement !== root) el = el.parentElement;
    return el instanceof HTMLElement ? el : null;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const item = itemOf(e.target);
    if (!item) return;
    press(item);
    window.addEventListener('pointerup', release, { once: true });
    window.addEventListener('pointercancel', release, { once: true });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
    const item = itemOf(e.target);
    if (item && item === e.target) press(item);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') release();
  };

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('keyup', onKeyUp);
  root.addEventListener('focusout', release);
  onCleanup(() => {
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('keyup', onKeyUp);
    root.removeEventListener('focusout', release);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    for (const animation of running.values()) animation.cancel();
  });
};

/**
 * ArrowLeft/Right (mirrored in RTL), Home and End between the enabled items
 * of action and multi-select groups; Ark's roving focus covers single-select.
 * Each item stays a tab stop. Arrows wrap at the ends (derived, like Ark's
 * toggle group).
 */
const onArrowKeys = (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  const root = e.currentTarget;
  const items = [...root.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.getClientRects().length > 0 && !isDisabled(el),
  );
  const index = items.indexOf(e.target as HTMLElement);
  if (index < 0) return;
  e.preventDefault();
  const rtl = getComputedStyle(root).direction === 'rtl';
  const forward = (e.key === 'ArrowRight') !== rtl;
  const last = items.length - 1;
  const next =
    e.key === 'Home'
      ? 0
      : e.key === 'End'
        ? last
        : forward
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
  items[next]?.focus();
};

/**
 * M3 button group: an
 * invisible container for `Button` and `IconButton` items that sets their
 * size and shape, adds the gap and morphs them on press and selection.
 *
 * - `standard` (default): gap per size; the pressed item grows 15% and its
 *   neighbours make room. Hugs its content.
 * - `connected`: 2px gap, equal widths across the parent, outer corners
 *   rounded, selected items become pills. Use with a selection mode.
 *
 * With `selection="single" | "multi"` the group is an Ark UI `ToggleGroup`
 * (radiogroup with aria-checked and roving focus, or a group of
 * aria-pressed toggles, each a tab stop), and items with a `value` are its
 * items. Without one it's a plain `role="group"` of actions. Arrow keys,
 * Home and End move focus between items in every mode.
 */
export const ButtonGroup: Component<ButtonGroupProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'shape',
    'selection',
    'required',
    'value',
    'defaultValue',
    'onValueChange',
    'label',
    'children',
    'class',
    'ref',
    'onKeyDown',
  ]);

  const state = (): ButtonGroupState => ({
    variant: local.variant ?? 'standard',
    size: local.size ?? 'small',
    shape: local.shape ?? 'round',
    selection: local.selection ?? 'none',
  });

  // Controlled internally, so `required` can refuse an empty selection in
  // multi-select (Ark's `deselectable` only covers single-select).
  const [inner, setInner] = createSignal(local.defaultValue ?? []);
  const value = () => local.value ?? inner();
  const change = (next: string[]) => {
    if (local.required && next.length === 0) return;
    setInner(next);
    local.onValueChange?.(next);
  };

  if (import.meta.env.DEV) {
    createEffect(() => {
      if (state().variant === 'connected' && state().selection === 'none') {
        console.warn('ButtonGroup: avoid a connected group when none of the buttons can be toggled.');
      }
    });
  }

  const ref = (el: HTMLElement) => {
    attachPressBounce(el, () => state().variant === 'standard');
    (local.ref as ((el: HTMLElement) => void) | undefined)?.(el);
  };

  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLElement; target: Element }) => {
    if (state().selection !== 'single') onArrowKeys(e);
    const own = local.onKeyDown;
    if (typeof own === 'function') own(e as KeyboardEvent & { currentTarget: HTMLDivElement; target: Element });
  };

  const rootProps = () => ({
    ...rest,
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-variant': state().variant,
    'data-size': state().size,
    'data-shape': state().shape,
    'aria-label': local.label,
  });

  return (
    <ButtonGroupContext.Provider value={state}>
      <Show
        when={state().selection !== 'none'}
        fallback={
          <div role="group" {...rootProps()} ref={ref} onKeyDown={onKeyDown}>
            {local.children}
          </div>
        }
      >
        <ToggleGroup.Root
          {...rootProps()}
          ref={ref}
          onKeyDown={onKeyDown}
          multiple={state().selection === 'multi'}
          deselectable={!local.required}
          // A radiogroup is one tab stop; toggles are each a tab stop (arrow keys from onKeyDown).
          rovingFocus={state().selection === 'single'}
          value={value()}
          onValueChange={(details) => change(details.value)}
        >
          {local.children}
        </ToggleGroup.Root>
      </Show>
    </ButtonGroupContext.Provider>
  );
};
