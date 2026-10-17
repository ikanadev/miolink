import { Slider as ArkSlider, useSlider } from '@ark-ui/solid/slider';
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  onCleanup,
  Show,
  splitProps,
  type Component,
  type JSX,
} from 'solid-js';
import { Icon } from '../icon';
import styles from './slider.module.css';

/**
 * `standard`: one value, active track from the minimum. `centered`: one
 * value, active track from the middle. `range`: two handles, active track
 * between them (spec §2).
 */
export type SliderVariant = 'standard' | 'centered' | 'range';
/** Spec sizes XS–XL; XL is for hero moments only (spec §2). */
export type SliderSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
export type SliderOrientation = 'horizontal' | 'vertical';

export type SliderProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'onInput' | 'dir' | 'aria-label'
> & {
  /** Default `standard`. */
  variant?: SliderVariant;
  /** Default `xsmall`. */
  size?: SliderSize;
  /** Default `horizontal`. Vertical puts the minimum at the bottom; avoid it for range. */
  orientation?: SliderOrientation;
  /** Default 0. */
  min?: number;
  /** Default 100. */
  max?: number;
  /** Default 1. With `stops`, the handle snaps to these values. */
  step?: number;
  /**
   * Page Up/Down, Shift + Arrows and Space + Arrows step. Default: one step
   * with `stops`, otherwise 10% of the range (derived, spec §8).
   */
  largeStep?: number;
  /** Controlled value: one number, two for `range`. */
  value?: number[];
  /** Initial value. Default: the midpoint, or `[min, max]` for `range`. */
  defaultValue?: number[];
  /** Called continuously while dragging or on each key step. */
  onValueChange?: (value: number[]) => void;
  /** Called when a drag or key press commits. */
  onValueChangeEnd?: (value: number[]) => void;
  /** Accessible name of the handle. Range handles get "<label> minimum/maximum". */
  label: string;
  /** Range only: names for the two handles, replacing the ones derived from `label`. */
  thumbLabels?: [string, string];
  /** Stop indicators at every step (spec §2 "Stops"). Avoid too many. */
  stops?: boolean;
  /** Stop at the end of the inactive track for 3:1 contrast (spec §3). Default true. */
  endStop?: boolean;
  /** Value indicator above the handle while pressed or keyboard focused. */
  labeled?: boolean;
  /** Formats the value indicator and the handle's aria-valuetext ("50%", "−2 EV"). */
  valueLabel?: (value: number) => string;
  /** Inset icon (Material Symbols name). Honored only for standard M/L/XL. */
  icon?: string;
  /** Icon shown instead of `icon` at the minimum (e.g. `volume_off`). */
  iconMin?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Form field name; a range submits it twice as `name[]`. */
  name?: string;
  form?: string;
  /** Range only: minimum steps between the two handles. Default 0 (equal allowed). */
  minStepsBetweenThumbs?: number;
};

/** Spec §4.2: handle width enabled / focused or pressed, and handle-track gap. */
const HANDLE_WIDTH = 4;
const HANDLE_WIDTH_NARROW = 2;
const GAP = 6;
/** Spec §4.2: inset icon size and padding (mirrors the CSS size sets). */
const ICON_METRICS: Partial<Record<SliderSize, { size: number; padding: number }>> = {
  medium: { size: 24, padding: 6 },
  large: { size: 24, padding: 6 },
  xlarge: { size: 32, padding: 8 },
};

type Segment = { pos: 'before0' | 'after0' | 'between' | 'after1' | 'center'; active: boolean };
const SEGMENTS: Record<SliderVariant, Segment[]> = {
  standard: [
    { pos: 'before0', active: true },
    { pos: 'after0', active: false },
  ],
  centered: [
    { pos: 'before0', active: false },
    { pos: 'after0', active: false },
    { pos: 'center', active: true },
  ],
  range: [
    { pos: 'before0', active: false },
    { pos: 'between', active: true },
    { pos: 'after1', active: false },
  ],
};

type Stop = { fraction: number; end?: 'start' | 'end'; state: 'active' | 'inactive' | 'hidden' };

/**
 * M3 slider on Ark UI `Slider`. Ark
 * owns the behavior: pointer drag and select-jump (nearest handle for
 * range), keyboard, the focusable `role="slider"` handles, aria values and
 * hidden inputs for forms. Ark positions the handles; `thumbSize` is the
 * 4px handle width so handle centers travel from 2px to length − 2px
 * (spec §4.2). The tracks, stops and inset icon are drawn here from Ark's
 * `--slider-thumb-offset-*` variables, leaving the 6px gap around each
 * handle.
 */
export const Slider: Component<SliderProps> = (props) => {
  const [local, machine, rest] = splitProps(
    props,
    [
      'variant',
      'size',
      'label',
      'thumbLabels',
      'stops',
      'endStop',
      'labeled',
      'valueLabel',
      'icon',
      'iconMin',
      'class',
      'onValueChange',
      'onValueChangeEnd',
    ],
    [
      'orientation',
      'min',
      'max',
      'step',
      'largeStep',
      'value',
      'defaultValue',
      'disabled',
      'readOnly',
      'name',
      'form',
      'minStepsBetweenThumbs',
    ],
  );

  const variant = () => local.variant ?? 'standard';
  const size = () => local.size ?? 'xsmall';
  const orientation = () => machine.orientation ?? 'horizontal';
  const min = () => machine.min ?? 0;
  const max = () => machine.max ?? 100;
  const step = () => machine.step ?? 1;
  const isRange = () => variant() === 'range';
  const largeStep = () => {
    if (machine.largeStep != null) return machine.largeStep;
    if (local.stops) return step();
    return Math.max(step(), Math.round((max() - min()) / 10 / step()) * step());
  };
  const format = (v: number) => (local.valueLabel ? local.valueLabel(v) : String(v));

  // Which handle is focused (Ark), and whether that focus is visible.
  const [focusedIndex, setFocusedIndex] = createSignal(-1);
  const [focusVisible, setFocusVisible] = createSignal(false);
  // Set after the first pointer move of a press: positions follow the
  // pointer 1:1 instead of animating (spec §6).
  const [moving, setMoving] = createSignal(false);
  // Track length along the slider axis, for stop and icon placement.
  const [length, setLength] = createSignal(0);
  const [control, setControl] = createSignal<HTMLElement>();

  const api = useSlider(() => ({
    min: min(),
    max: max(),
    step: step(),
    largeStep: largeStep(),
    orientation: orientation(),
    origin: variant() === 'centered' ? 'center' : 'start',
    value: machine.value,
    defaultValue:
      machine.defaultValue ?? (isRange() ? [min(), max()] : [min() + (max() - min()) / 2]),
    disabled: machine.disabled,
    readOnly: machine.readOnly,
    name: machine.name,
    form: machine.form,
    minStepsBetweenThumbs: machine.minStepsBetweenThumbs,
    // Only the size along the axis is used: the 4px handle (spec §4.2).
    thumbSize: { width: HANDLE_WIDTH, height: HANDLE_WIDTH },
    thumbAlignment: 'contain',
    'aria-label': isRange()
      ? (local.thumbLabels ?? [`${local.label} minimum`, `${local.label} maximum`])
      : [local.label],
    getAriaValueText: local.valueLabel ? (d) => format(d.value) : undefined,
    onFocusChange: (d) => setFocusedIndex(d.focusedIndex),
    onValueChange: (d) => local.onValueChange?.(d.value),
    onValueChangeEnd: (d) => local.onValueChangeEnd?.(d.value),
  }));

  createEffect(() => {
    const el = control();
    if (!el) return;
    const vertical = orientation() === 'vertical';
    const measure = () => setLength(vertical ? el.clientHeight : el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    onCleanup(() => observer.disconnect());
  });

  /** The handle drawn 2px wide (focused or pressed, spec §5), or -1. */
  const narrowIndex = () => (api().dragging || focusVisible() ? focusedIndex() : -1);
  const handleWidth = (i: number) => (narrowIndex() === i ? HANDLE_WIDTH_NARROW : HANDLE_WIDTH);
  const fraction = (v: number) => (max() > min() ? (v - min()) / (max() - min()) : 0);
  /** Handle center in px from the axis start (spec §4.2 "Handle travel"). */
  const center = (i: number) => 2 + fraction(api().value[i] ?? min()) * (length() - 4);
  const handleStart = (i: number) => center(i) - handleWidth(i) / 2 - GAP;
  const handleEnd = (i: number) => center(i) + handleWidth(i) / 2 + GAP;

  const hasIcon = () => variant() === 'standard' && !!local.icon && !!ICON_METRICS[size()];
  /** Spec §4.2: on the active track if it fits, else after the handle, else hidden. */
  const iconPlace = createMemo(() => {
    const metrics = ICON_METRICS[size()];
    if (!hasIcon() || !metrics) return undefined;
    const needed = metrics.size + 2 * metrics.padding;
    if (handleStart(0) >= needed) return 'active';
    if (length() - handleEnd(0) >= needed) return 'inactive';
    return 'none';
  });
  const iconName = () =>
    local.iconMin && (api().value[0] ?? min()) <= min() ? local.iconMin : local.icon;

  const stops = createMemo<Stop[]>(() => {
    const lo = min();
    const hi = max();
    if (hi <= lo) return [];
    const values: number[] = [];
    if (local.stops) {
      const count = Math.round((hi - lo) / step());
      for (let k = 0; k <= count; k++) values.push(Math.min(hi, lo + k * step()));
    }
    // End stops sit at the inactive ends: max for standard, both ends otherwise.
    const ends = variant() === 'standard' ? [hi] : [lo, hi];
    const withEnds =
      local.endStop === false
        ? values.filter((v) => !ends.includes(v))
        : [...new Set([...values, ...ends])].sort((a, b) => a - b);

    const len = length();
    const value = api().value;
    return withEnds.map((v): Stop => {
      const end = v === lo ? 'start' : v === hi ? 'end' : undefined;
      // Extreme stops: 4px inset + 2px radius from the track end (spec §4.2).
      const pos = end === 'start' ? 6 : end === 'end' ? len - 6 : 2 + fraction(v) * (len - 4);
      const inZone = value.some((_, i) => pos >= handleStart(i) && pos <= handleEnd(i));
      let active: boolean;
      if (variant() === 'range') active = pos > center(0) && pos < center(1);
      else if (variant() === 'centered') {
        const c = center(0);
        const m = len / 2;
        active = pos >= Math.min(m, c) && pos <= Math.max(m, c) && Math.abs(c - m) > 0;
      } else active = pos < center(0);
      return { fraction: fraction(v), end, state: inZone ? 'hidden' : active ? 'active' : 'inactive' };
    });
  });

  const startPress = () => {
    if (machine.disabled || machine.readOnly) return;
    const move = () => setMoving(true);
    const end = () => {
      setMoving(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };
  onCleanup(() => setMoving(false));

  /**
   * Space + Arrow steps by `largeStep` (spec §8). A native listener on the
   * handle runs before Ark's delegated handler, which skips prevented events.
   */
  const bindKeys = (el: HTMLElement, index: number) => {
    let spaceHeld = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' && e.key !== 'Shift') setFocusVisible(true);
      if (e.key === ' ') {
        e.preventDefault();
        spaceHeld = true;
        return;
      }
      if (!spaceHeld) return;
      const rtl = getComputedStyle(el).direction === 'rtl';
      const vertical = orientation() === 'vertical';
      const sign: Record<string, number> = vertical
        ? { ArrowUp: 1, ArrowDown: -1 }
        : { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
      const s = sign[e.key];
      if (!s) return;
      e.preventDefault();
      const a = api();
      const next = a.getThumbValue(index) + s * largeStep();
      a.setThumbValue(index, Math.min(a.getThumbMax(index), Math.max(a.getThumbMin(index), next)));
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') spaceHeld = false;
    };
    const onBlur = () => {
      spaceHeld = false;
    };
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('keyup', onKeyUp);
    el.addEventListener('blur', onBlur);
    onCleanup(() => {
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('keyup', onKeyUp);
      el.removeEventListener('blur', onBlur);
    });
  };

  return (
    <ArkSlider.RootProvider
      {...rest}
      value={api}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-variant={variant()}
      data-size={size()}
      data-labeled={local.labeled ? '' : undefined}
      data-narrow={narrowIndex() >= 0 ? narrowIndex() : undefined}
      data-moving={moving() ? '' : undefined}
      data-icon-place={iconPlace()}
    >
      <ArkSlider.Control class={styles.control} ref={setControl} onPointerDown={startPress}>
        <ArkSlider.Track class={styles.track} aria-hidden="true">
          <For each={SEGMENTS[variant()]}>
            {(s) => <span class={styles.segment} data-pos={s.pos} data-active={s.active ? '' : undefined} />}
          </For>
          <For each={stops()}>
            {(s) => (
              <span
                class={styles.stop}
                style={{ '--_p': s.fraction }}
                data-end={s.end}
                data-state={s.state}
              />
            )}
          </For>
          <Show when={hasIcon() && iconName()}>
            {(name) => <Icon class={styles.icon} name={name()} />}
          </Show>
        </ArkSlider.Track>
        <Index each={isRange() ? [0, 1] : [0]}>
          {(index) => (
            <ArkSlider.Thumb
              index={index()}
              class={styles.handle}
              ref={(el: HTMLElement) => bindKeys(el, index())}
              onFocus={(e) => setFocusVisible(e.currentTarget.matches(':focus-visible'))}
              onBlur={() => setFocusVisible(false)}
            >
              <Show when={local.labeled}>
                <span class={styles.valueIndicator} aria-hidden="true">
                  {format(api().value[index()] ?? min())}
                </span>
              </Show>
              <ArkSlider.HiddenInput />
            </ArkSlider.Thumb>
          )}
        </Index>
      </ArkSlider.Control>
    </ArkSlider.RootProvider>
  );
};
