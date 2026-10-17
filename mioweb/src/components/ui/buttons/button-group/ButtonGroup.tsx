import { ToggleGroup } from '@ark-ui/solid/toggle-group';
import { createSignal, onCleanup, Show, splitProps, type Component, type JSX } from 'solid-js';
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
/** Neighbours never shrink below a 48px target (derived, spec §5). */
const MIN_ITEM_WIDTH = 48;

const isDisabled = (el: Element) => el.matches(':disabled, [data-disabled], [aria-disabled="true"]');

/**
 * Standard group press "bounce" (spec §5): the pressed item grows 15% and
 * its neighbours shrink by the same amount, so the group keeps its width.
 * Animated with the Web Animations API on inline-size with the fast spatial
 * spring curve; releasing animates back and then hands the width back to
 * CSS. Skipped with reduced motion.
 */
const attachPressBounce = (root: HTMLElement) => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let rest: Map<HTMLElement, number> | undefined;
  const running = new Map<HTMLElement, Animation>();

  const timing = (): KeyframeAnimationOptions => {
    const cs = getComputedStyle(root);
    return {
      duration: parseFloat(cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-duration')) || 350,
      easing: cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-easing').trim() || 'ease-out',
      fill: 'forwards',
    };
  };

  const animateTo = (targets: Map<HTMLElement, number>, onDone?: () => void) => {
    const options = timing();
    let last: Animation | undefined;
    for (const [el, width] of targets) {
      const from = el.getBoundingClientRect().width;
      running.get(el)?.cancel();
      try {
        last = el.animate([{ inlineSize: `${from}px` }, { inlineSize: `${width}px` }], options);
      } catch {
        // An easing the browser doesn't accept: fall back to a plain curve.
        last = el.animate([{ inlineSize: `${from}px` }, { inlineSize: `${width}px` }], {
          ...options,
          easing: 'ease-out',
        });
      }
      running.set(el, last);
    }
    if (last && onDone) last.onfinish = onDone;
  };

  const press = (item: HTMLElement) => {
    if (motion.matches || isDisabled(item)) return;
    const items = [...root.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.getClientRects().length > 0,
    );
    const index = items.indexOf(item);
    if (index < 0) return;
    // Rest widths are measured once per press-release cycle, before any
    // animation changes them.
    rest ??= new Map(items.map((el) => [el, el.getBoundingClientRect().width]));
    const restOf = (el: HTMLElement) => rest?.get(el) ?? el.getBoundingClientRect().width;

    const neighbours = [items[index - 1], items[index + 1]].filter((el): el is HTMLElement => !!el);
    const delta = restOf(item) * PRESSED_GROWTH;
    const targets = new Map<HTMLElement, number>([[item, restOf(item) + delta]]);
    // Neighbours give up their share down to 48px (never growing, so items
    // already narrower stay put); what they can't give, the group absorbs.
    for (const el of neighbours) {
      const width = restOf(el);
      targets.set(el, Math.max(Math.min(width, MIN_ITEM_WIDTH), width - delta / neighbours.length));
    }
    // Items that were part of a previous press go back to rest.
    for (const el of running.keys()) if (!targets.has(el)) targets.set(el, restOf(el));
    animateTo(targets);
  };

  const release = () => {
    if (!rest || running.size === 0) return;
    const targets = new Map([...running.keys()].map((el) => [el, rest?.get(el) ?? 0]));
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
 * items. Without one it's a plain `role="group"` of actions.
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

  const ref = (el: HTMLElement) => {
    if (state().variant === 'standard') attachPressBounce(el);
    (local.ref as ((el: HTMLElement) => void) | undefined)?.(el);
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
          <div role="group" {...rootProps()} ref={ref}>
            {local.children}
          </div>
        }
      >
        <ToggleGroup.Root
          {...rootProps()}
          ref={ref}
          multiple={state().selection === 'multi'}
          deselectable={!local.required}
          // Spec §8: a radiogroup is one tab stop; toggles are each a tab stop.
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
