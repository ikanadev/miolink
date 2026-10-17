import { Dialog as ArkDialog } from '@ark-ui/solid/dialog';
import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  Index,
  Match,
  on,
  onCleanup,
  Show,
  splitProps,
  Switch,
  untrack,
  type Accessor,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Button } from '../buttons/button';
import { IconButton } from '../buttons/icon-button';
import { DialogRoot } from '../dialog';
import { Ripple } from '../shared/Ripple';
import { TextField, type TextFieldVariant } from '../text-field';
import {
  dayPeriods,
  defaultLocale,
  formatNumber,
  localeHourCycle,
  parseHHmm,
  timeFieldFormat,
  toHHmm,
  type HourCycle,
} from './time-utils';
import styles from './time-picker.module.css';

export type TimePickerVariant = 'dial' | 'input';
export type TimePickerOrientation = 'vertical' | 'horizontal' | 'auto';
export type TimePickerHourCycle = HourCycle;

export type TimePickerLabels = {
  /** Clock icon button on the field. */
  chooseTime: string;
  /** Field label. */
  time: string;
  /** Dial headline. */
  selectTime: string;
  /** Input headline. */
  enterTime: string;
  hour: string;
  minute: string;
  period: string;
  /** Name of the hour/minute time selector group. */
  editUnit: string;
  selectHours: string;
  selectMinutes: string;
  /** Dial value names ("7 hours", "30 minutes"). */
  hours: (value: string) => string;
  minutes: (value: string) => string;
  /** Keyboard icon button on the dial (spec §8). */
  switchToInput: string;
  /** Clock icon button on the input (spec §8). */
  switchToDial: string;
  invalidTime: (pattern: string) => string;
  enterValidTime: string;
  outOfRange: string;
};

const DEFAULT_LABELS: TimePickerLabels = {
  chooseTime: 'Choose time',
  time: 'Time',
  selectTime: 'Select time',
  enterTime: 'Enter time',
  hour: 'Hour',
  minute: 'Minute',
  period: 'Period',
  editUnit: 'Edit hour or minute',
  selectHours: 'Select hours',
  selectMinutes: 'Select minutes',
  hours: (v) => `${v} hours`,
  minutes: (v) => `${v} minutes`,
  switchToInput: 'Toggle input picker',
  switchToDial: 'Toggle dial picker',
  invalidTime: (pattern) => `Invalid time. Use ${pattern}`,
  enterValidTime: 'Enter a valid time',
  outOfRange: 'Time out of range',
};

export type TimePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> & {
  /** Committed value, 24h `HH:mm`, or `''` for none. */
  value?: string;
  defaultValue?: string;
  /** Called when a value is committed (OK, or a field edit on blur/Enter). */
  onValueChange?: (value: string) => void;
  /** Live pending value while the dialog is open (`HH:mm`). */
  onPendingChange?: (value: string) => void;
  /**
   * View each time the dialog opens. Default `dial` (clock face + time
   * selector); `input` for keyboard entry only. The icon button at the start
   * of the actions switches between them.
   */
  variant?: TimePickerVariant;
  /** Called when the user switches between the dial and the input. */
  onVariantChange?: (variant: TimePickerVariant) => void;
  /**
   * Dial layout. Default `auto`: vertical when the viewport is at least
   * 560px tall, horizontal when it's shorter but at least 400px tall and
   * 600px wide, otherwise the input picker alone (spec §6, derived thresholds).
   */
  orientation?: TimePickerOrientation;
  /** 12h (with AM/PM) or 24h. Default: from the locale. */
  hourCycle?: TimePickerHourCycle;
  /** BCP 47 tag for digits, AM/PM labels, the field format and the default hour cycle. Default: `<html lang>`, then the browser's. */
  locale?: string;
  /** Minute granularity of the dial and the minute box arrows. Default 1. */
  minuteStep?: number;
  /** Earliest / latest selectable time (`HH:mm`). Values outside are shown at 38% and can't be picked. */
  min?: string;
  max?: string;
  /** Controlled open state of the dialog. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Render the text field with the clock button that opens the dialog. Default true. Without it, open the dialog with `open`. */
  field?: boolean;
  /** Field style. Default `outlined`. */
  fieldVariant?: TextFieldVariant;
  /** Field label. Default "Time". */
  label?: string;
  /** Helper text under the field. Default: the locale's format, e.g. "hh:mm AM". */
  helperText?: JSX.Element;
  /** An app-level error under the field. */
  errorText?: JSX.Element;
  /** Dialog headline. Default "Select time" (dial) / "Enter time" (input). */
  headline?: string;
  /** Default "OK". */
  confirmLabel?: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** Form name: a hidden input with the `HH:mm` value. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Localized accessible names and messages. */
  labels?: Partial<TimePickerLabels>;
};

type Unit = 'hour' | 'minute';
const DAY = 24 * 60;

/** Dial geometry (spec §4.2, derived from Compose): 256px face, rings at 101 / 69px. */
const DIAL_SIZE = 256;
const OUTER_RADIUS = 101;
const INNER_RADIUS = 69;
/** 24h: a pointer closer than this to the center picks the inner ring (spec §9, derived midpoint). */
const RING_SPLIT = 85;

const TALL_QUERY = '(min-height: 560px)';
const WIDE_QUERY = '(min-height: 400px) and (min-width: 600px)';

const useMedia = (query: string) => {
  const [matches, setMatches] = createSignal(true);
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    onCleanup(() => mql.removeEventListener('change', onChange));
  }
  return matches;
};

const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const digitsOnly = (s: string) => s.replace(/\D/g, '').slice(0, 2);
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 12h display hour (1-12) of a 24h hour. */
const to12 = (h: number) => ((h + 11) % 12) + 1;
/** 24h hour from a 12h hour (1-12) and the period. */
const to24 = (h12: number, pm: boolean) => (h12 % 12) + (pm ? 12 : 0);

type DialOption = {
  /** 24h hour or minute. */
  value: number;
  /** Clock position, 0 = 12 o'clock, clockwise. */
  pos: number;
  inner: boolean;
  label: string;
  /** Spoken name without the unit ("7", "30"). */
  name: string;
  disabled: boolean;
};

/**
 * M3 time picker (m3-guidelines/components/date-and-time-pickers/time-pickers.md):
 * a modal dialog with the dial picker (hour/minute time selector, AM/PM
 * period selector and a 256px clock face, vertical or horizontal) or the
 * input picker (two numeric fields), switched by the keyboard/clock icon
 * button. 12h or 24h from the locale (two rings for 24h), min/max and a
 * minute step. The dialog edits a pending time: OK commits, Cancel, Escape
 * and scrim clicks discard. An optional text field shows the committed
 * time and accepts typing (lenient parsing on blur/Enter).
 *
 * Ark UI has no dial time picker, so the dial, the time selector and the
 * input fields are built here: a listbox of options for the dial (single
 * tab stop, arrow keys), radios for hour/minute and AM/PM, native text
 * inputs. The project's `Dialog` root provides the modal behavior.
 */
export const TimePicker = (props: TimePickerProps) => {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'onPendingChange',
    'variant',
    'onVariantChange',
    'orientation',
    'hourCycle',
    'locale',
    'minuteStep',
    'min',
    'max',
    'open',
    'defaultOpen',
    'onOpenChange',
    'field',
    'fieldVariant',
    'label',
    'helperText',
    'errorText',
    'headline',
    'confirmLabel',
    'cancelLabel',
    'name',
    'required',
    'disabled',
    'readOnly',
    'labels',
    'class',
  ]);

  const labels = createMemo(() => ({ ...DEFAULT_LABELS, ...local.labels }));
  const locale = () => local.locale ?? defaultLocale();
  const hourCycle = (): HourCycle => local.hourCycle ?? localeHourCycle(locale());
  const h12 = () => hourCycle() === 'h12';
  const periods = createMemo(() => dayPeriods(locale()));
  const fmt = createMemo(() => timeFieldFormat(locale(), hourCycle()));
  const step = () => Math.min(30, Math.max(1, Math.round(local.minuteStep ?? 1)));
  const minT = () => parseHHmm(local.min);
  const maxT = () => parseHHmm(local.max);

  const inRange = (t: number) =>
    (minT() === undefined || t >= minT()!) && (maxT() === undefined || t <= maxT()!);
  const clamp = (t: number) => {
    if (minT() !== undefined && t < minT()!) return minT()!;
    if (maxT() !== undefined && t > maxT()!) return maxT()!;
    return t;
  };
  /** An hour with no selectable minute (derived for min/max, spec §5). */
  const hourDisabled = (h: number) =>
    (maxT() !== undefined && h * 60 > maxT()!) || (minT() !== undefined && h * 60 + 59 < minT()!);

  // ---- Committed value ----
  const normalize = (v: string | undefined) => {
    const t = parseHHmm(v);
    return t === undefined ? '' : toHHmm(t);
  };
  const [ownValue, setOwnValue] = createSignal(untrack(() => normalize(local.defaultValue)));
  const value = createMemo(() => (local.value !== undefined ? normalize(local.value) : ownValue()));
  const commit = (next: string) => {
    if (local.value === undefined) setOwnValue(next);
    local.onValueChange?.(next);
  };

  // ---- Open state ----
  const [ownOpen, setOwnOpen] = createSignal(untrack(() => local.defaultOpen ?? false));
  const open = () => local.open ?? ownOpen();
  const setOpen = (next: boolean) => {
    if (open() === next) return;
    if (local.open === undefined) setOwnOpen(next);
    local.onOpenChange?.(next);
  };

  // ---- Orientation and view ----
  const tall = useMedia(TALL_QUERY);
  const wide = useMedia(WIDE_QUERY);
  const autoOrientation = () => (local.orientation ?? 'auto') === 'auto';
  const orientation = (): 'vertical' | 'horizontal' =>
    autoOrientation() ? (!tall() && wide() ? 'horizontal' : 'vertical') : (local.orientation as 'vertical' | 'horizontal');
  /** Spec §6/§8: when the dial can't fit, show the input picker alone. */
  const dialFits = () => !autoOrientation() || tall() || wide();

  const [view, setView] = createSignal<TimePickerVariant>('dial');
  const shownView = (): TimePickerVariant => (dialFits() ? view() : 'input');

  // ---- Pending time (minutes since midnight) ----
  const [pending, setPendingRaw] = createSignal(0);
  const [unit, setUnit] = createSignal<Unit>('hour');
  const setPending = (t: number) => {
    const next = ((t % DAY) + DAY) % DAY;
    if (next === pending()) return;
    setPendingRaw(next);
    local.onPendingChange?.(toHHmm(next));
  };
  const hour = () => Math.floor(pending() / 60);
  const minute = () => pending() % 60;
  const pm = () => hour() >= 12;

  const setHour = (h: number) => setPending(clamp(h * 60 + minute()));
  const setMinute = (m: number) => setPending(clamp(hour() * 60 + m));
  const setPm = (next: boolean) => {
    if (next === pm()) return;
    setPending(clamp(pending() + (next ? 12 * 60 : -12 * 60)));
  };
  /** Every hour of the period is out of range. */
  const periodDisabled = (isPm: boolean) => {
    for (let h = isPm ? 12 : 0; h < (isPm ? 24 : 12); h++) if (!hourDisabled(h)) return false;
    return true;
  };

  // ---- Input view text ----
  const [hourText, setHourText] = createSignal('');
  const [minuteText, setMinuteText] = createSignal('');
  const [showInputErrors, setShowInputErrors] = createSignal(false);

  const syncInputText = () => {
    setHourText(pad2(h12() ? to12(hour()) : hour()));
    setMinuteText(pad2(minute()));
  };

  const hourInvalid = () => {
    const t = hourText();
    if (!t) return true;
    const n = Number(t);
    return h12() ? n < 1 || n > 12 : n > 23;
  };
  const minuteInvalid = () => !minuteText() || Number(minuteText()) > 59;
  /** The typed time, or undefined while a field is invalid. */
  const typedTime = (): number | undefined => {
    if (hourInvalid() || minuteInvalid()) return undefined;
    const n = Number(hourText());
    return (h12() ? to24(n, pm()) : n) * 60 + Number(minuteText());
  };
  const outOfRange = () => {
    const t = typedTime();
    return t !== undefined && !inRange(t);
  };
  const inputError = (): string | undefined => {
    const t = typedTime();
    if (t === undefined) return labels().enterValidTime;
    return inRange(t) ? undefined : labels().outOfRange;
  };

  // Before the surface renders, so the dial mounts on the value.
  createComputed(
    on(open, (isOpen) => {
      if (!isOpen) return;
      untrack(() => {
        const t = parseHHmm(value());
        setPendingRaw(clamp(t ?? nowMinutes()));
        setUnit('hour');
        setView(local.variant ?? 'dial');
        syncInputText();
        setShowInputErrors(false);
      });
    }),
  );

  const confirm = () => {
    if (shownView() === 'input') {
      setShowInputErrors(true);
      const t = typedTime();
      if (t === undefined || !inRange(t)) return;
      setPending(t);
    }
    const next = toHHmm(pending());
    if (next !== value()) commit(next);
    setOpen(false);
  };
  const cancel = () => setOpen(false);

  // ---- Surface and focus ----
  let surface: HTMLElement | undefined;
  /** Spec §8: focus the hour selector (dial) / hour field (input). */
  const initialFocus = () => surface?.querySelector<HTMLElement>('[data-hour-control]') ?? null;
  const focusSoon = () => requestAnimationFrame(() => initialFocus()?.focus());

  const toggleView = () => {
    if (shownView() === 'dial') {
      syncInputText();
      setShowInputErrors(false);
      setView('input');
      local.onVariantChange?.('input');
    } else {
      // An invalid typed time blocks switching back until fixed.
      setShowInputErrors(true);
      const t = typedTime();
      if (t === undefined || !inRange(t)) return;
      setPending(t);
      setUnit('hour');
      setView('dial');
      local.onVariantChange?.('dial');
    }
    focusSoon();
  };

  // ---- Field outside the dialog ----
  const [fieldText, setFieldText] = createSignal('');
  const [fieldError, setFieldError] = createSignal<string>();
  createEffect(
    on([value, fmt], () => {
      const t = parseHHmm(value());
      setFieldText(t === undefined ? '' : fmt().format(t));
      setFieldError(undefined);
    }),
  );
  const commitField = () => {
    const parsed = fmt().parse(fieldText());
    if (parsed === undefined) return setFieldError(labels().invalidTime(fmt().pattern));
    if (parsed !== null && !inRange(parsed)) return setFieldError(labels().outOfRange);
    setFieldError(undefined);
    const next = parsed === null ? '' : toHHmm(parsed);
    if (next !== value()) commit(next);
    setFieldText(parsed === null ? '' : fmt().format(parsed));
  };

  const triggerDisabled = () => !!(local.disabled || local.readOnly);

  const field = () => (
    <TextField
      class={styles.field}
      variant={local.fieldVariant ?? 'outlined'}
      label={local.label ?? labels().time}
      value={fieldText()}
      onValueChange={setFieldText}
      onBlur={commitField}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commitField();
      }}
      supportingText={local.helperText ?? fmt().pattern}
      errorText={fieldError() ?? local.errorText}
      placeholder={fmt().pattern}
      autocomplete="off"
      required={local.required}
      disabled={local.disabled}
      readOnly={local.readOnly}
      trailing={
        <ArkDialog.Trigger
          asChild={(tp) => (
            <IconButton
              {...tp()}
              color="standard"
              icon="schedule"
              label={labels().chooseTime}
              disabled={triggerDisabled()}
            />
          )}
        />
      }
    />
  );

  const ctx: Ctx = {
    locale,
    labels,
    h12,
    step,
    periods,
    unit,
    setUnit,
    hour,
    minute,
    pm,
    setHour,
    setMinute,
    setPm,
    inRange,
    hourDisabled,
    periodDisabled,
  };

  const errorId = createUniqueId();

  const headline = () => local.headline ?? (shownView() === 'input' ? labels().enterTime : labels().selectTime);

  return (
    <div {...rest} class={local.class ? `${styles.root} ${local.class}` : styles.root}>
      <DialogRoot
        role="dialog"
        open={open()}
        onOpenChange={(isOpen) => (isOpen ? setOpen(true) : cancel())}
        initialFocusEl={initialFocus}
      >
        <Show when={local.field !== false}>{field()}</Show>
        <Portal>
          <ArkDialog.Backdrop class={styles.scrim} />
          <ArkDialog.Positioner class={styles.dialogPositioner} data-layout="basic">
            <ArkDialog.Content
              ref={(el: HTMLDivElement) => (surface = el)}
              class={styles.dialog}
              data-layout="basic"
              data-view={shownView()}
              data-orientation={orientation()}
              data-hour-cycle={hourCycle()}
            >
              <ArkDialog.Title class={styles.headline}>{headline()}</ArkDialog.Title>
              <Switch>
                <Match when={shownView() === 'dial'}>
                  <div class={styles.display}>
                    <TimeSelector ctx={ctx} />
                    <Show when={h12()}>
                      <PeriodSelector ctx={ctx} orientation={orientation()} />
                    </Show>
                  </div>
                  <Dial ctx={ctx} />
                </Match>
                <Match when={shownView() === 'input'}>
                  <div class={styles.inputArea}>
                    <div class={styles.inputs}>
                      <TimeInputs
                        ctx={ctx}
                        hourText={hourText()}
                        minuteText={minuteText()}
                        onHourText={(t) => {
                          setHourText(t);
                          const typed = typedTime();
                          if (typed !== undefined && inRange(typed)) setPending(typed);
                        }}
                        onMinuteText={(t) => {
                          setMinuteText(t);
                          const typed = typedTime();
                          if (typed !== undefined && inRange(typed)) setPending(typed);
                        }}
                        hourInvalid={showInputErrors() && (hourInvalid() || outOfRange())}
                        minuteInvalid={showInputErrors() && (minuteInvalid() || outOfRange())}
                        onBlurField={() => setShowInputErrors(true)}
                        onEnter={confirm}
                        errorId={errorId}
                      />
                      <Show when={h12()}>
                        <PeriodSelector
                          ctx={ctx}
                          orientation="vertical"
                          onChange={() => {
                            const typed = typedTime();
                            if (typed !== undefined && inRange(typed)) setPending(typed);
                          }}
                        />
                      </Show>
                    </div>
                    <p id={errorId} class={styles.inputError} aria-live="polite">
                      {showInputErrors() ? inputError() : ''}
                    </p>
                  </div>
                </Match>
              </Switch>
              <div class={styles.actions}>
                <Show when={dialFits()}>
                  <IconButton
                    class={styles.toggle}
                    color="standard"
                    icon={shownView() === 'dial' ? 'keyboard' : 'schedule'}
                    label={shownView() === 'dial' ? labels().switchToInput : labels().switchToDial}
                    onClick={toggleView}
                  />
                </Show>
                <Button color="text" onClick={cancel}>
                  {local.cancelLabel ?? 'Cancel'}
                </Button>
                <Button
                  color="text"
                  onClick={confirm}
                  disabled={shownView() === 'input' && !!inputError()}
                >
                  {local.confirmLabel ?? 'OK'}
                </Button>
              </div>
            </ArkDialog.Content>
          </ArkDialog.Positioner>
        </Portal>
      </DialogRoot>
      <Show when={local.name}>{(name) => <input type="hidden" name={name()} value={value()} />}</Show>
    </div>
  );
};

type Ctx = {
  locale: Accessor<string>;
  labels: Accessor<TimePickerLabels>;
  h12: Accessor<boolean>;
  step: Accessor<number>;
  periods: Accessor<[string, string]>;
  unit: Accessor<Unit>;
  setUnit: (unit: Unit) => void;
  hour: Accessor<number>;
  minute: Accessor<number>;
  pm: Accessor<boolean>;
  setHour: (h: number) => void;
  setMinute: (m: number) => void;
  setPm: (pm: boolean) => void;
  inRange: (t: number) => boolean;
  hourDisabled: (h: number) => boolean;
  periodDisabled: (pm: boolean) => boolean;
};

// ---- Time selector (dial view): hour and minute boxes ----

/** Typed digits within this delay build one number (derived). */
const TYPE_AHEAD_MS = 1000;

const TimeSelector = (props: { ctx: Ctx }) => {
  const ctx = props.ctx;
  const boxes: Partial<Record<Unit, HTMLButtonElement>> = {};
  let buffer = '';
  let bufferUnit: Unit | undefined;
  let bufferTimer: number | undefined;
  onCleanup(() => clearTimeout(bufferTimer));

  const hourText = () => formatNumber(ctx.h12() ? to12(ctx.hour()) : ctx.hour(), ctx.locale(), true);
  const minuteText = () => formatNumber(ctx.minute(), ctx.locale(), true);

  const select = (u: Unit) => {
    ctx.setUnit(u);
    boxes[u]?.focus();
  };

  const stepUnit = (u: Unit, delta: number) => {
    if (u === 'hour') {
      // 12h wraps within the period (07 AM -> 08 AM ... 12 AM); 24h over the day.
      const next = ctx.h12()
        ? to24(((to12(ctx.hour()) - 1 + delta + 12) % 12) + 1, ctx.pm())
        : (ctx.hour() + delta + 24) % 24;
      ctx.setHour(next);
    } else {
      const s = ctx.step();
      const base = Math.round(ctx.minute() / s) * s;
      ctx.setMinute((((base + delta * s) % 60) + 60) % 60);
    }
  };

  const typeDigit = (u: Unit, digit: string) => {
    clearTimeout(bufferTimer);
    if (bufferUnit !== u) buffer = '';
    bufferUnit = u;
    const max = u === 'minute' ? 59 : ctx.h12() ? 12 : 23;
    let typed = buffer + digit;
    if (Number(typed) > max) typed = digit;
    const n = Number(typed);
    const complete = typed.length === 2 || n * 10 > max;
    if (u === 'hour') {
      if (!(ctx.h12() && n === 0)) ctx.setHour(ctx.h12() ? to24(n, ctx.pm()) : n);
    } else ctx.setMinute(n);
    buffer = complete ? '' : typed;
    if (complete && u === 'hour') select('minute');
    else bufferTimer = window.setTimeout(() => (buffer = ''), TYPE_AHEAD_MS);
  };

  const onKeyDown = (u: Unit, e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowUp':
        stepUnit(u, 1);
        break;
      case 'ArrowDown':
        stepUnit(u, -1);
        break;
      // The row is always left-to-right (spec §11), so Left is the hour.
      case 'ArrowLeft':
        select('hour');
        break;
      case 'ArrowRight':
        select('minute');
        break;
      default:
        if (/^\d$/.test(e.key)) typeDigit(u, e.key);
        else return;
    }
    e.preventDefault();
  };

  const box = (u: Unit, text: () => string) => (
    <button
      ref={(el) => (boxes[u] = el)}
      type="button"
      role="radio"
      class={styles.box}
      aria-checked={ctx.unit() === u}
      aria-label={`${u === 'hour' ? ctx.labels().hour : ctx.labels().minute}, ${text()}`}
      tabIndex={ctx.unit() === u ? 0 : -1}
      data-hour-control={u === 'hour' ? '' : undefined}
      onClick={() => ctx.setUnit(u)}
      onKeyDown={(e) => onKeyDown(u, e)}
    >
      <Ripple />
      <span class={styles.boxLabel}>{text()}</span>
    </button>
  );

  return (
    <div class={styles.time} role="radiogroup" aria-label={ctx.labels().editUnit} dir="ltr">
      {box('hour', hourText)}
      <span class={styles.separator} aria-hidden="true">
        :
      </span>
      {box('minute', minuteText)}
    </div>
  );
};

// ---- Period selector (AM/PM) ----

const PeriodSelector = (props: {
  ctx: Ctx;
  orientation: 'vertical' | 'horizontal';
  onChange?: () => void;
}) => {
  const ctx = props.ctx;
  const name = createUniqueId();
  const option = (isPm: boolean) => (
    <label class={styles.periodOption} data-disabled={ctx.periodDisabled(isPm) ? '' : undefined}>
      <Ripple />
      <input
        class={styles.periodInput}
        type="radio"
        name={name}
        value={isPm ? 'pm' : 'am'}
        checked={ctx.pm() === isPm}
        disabled={ctx.periodDisabled(isPm)}
        onChange={() => {
          ctx.setPm(isPm);
          props.onChange?.();
        }}
      />
      <span class={styles.periodLabel}>{ctx.periods()[isPm ? 1 : 0]}</span>
    </label>
  );
  return (
    <div
      class={styles.period}
      role="radiogroup"
      aria-label={ctx.labels().period}
      data-orientation={props.orientation}
    >
      {option(false)}
      {option(true)}
    </div>
  );
};

// ---- Clock dial ----

const Dial = (props: { ctx: Ctx }) => {
  const ctx = props.ctx;
  let dial!: HTMLDivElement;
  let list!: HTMLDivElement;
  const [dragging, setDragging] = createSignal(false);
  const [active, setActive] = createSignal(0);

  const options = createMemo((): DialOption[] => {
    const loc = ctx.locale();
    if (ctx.unit() === 'minute') {
      return Array.from({ length: 12 }, (_, i) => ({
        value: i * 5,
        pos: i,
        inner: false,
        label: formatNumber(i * 5, loc, true),
        name: formatNumber(i * 5, loc),
        disabled: !ctx.inRange(ctx.hour() * 60 + i * 5),
      }));
    }
    if (ctx.h12()) {
      return Array.from({ length: 12 }, (_, i) => {
        const h = i === 0 ? 12 : i;
        const value = to24(h, ctx.pm());
        return { value, pos: i, inner: false, label: formatNumber(h, loc), name: formatNumber(h, loc), disabled: ctx.hourDisabled(value) };
      });
    }
    // 24h: outer ring 00-11, inner ring 12-23 (spec §11).
    return Array.from({ length: 24 }, (_, h) => ({
      value: h,
      pos: h % 12,
      inner: h >= 12,
      label: formatNumber(h, loc, true),
      name: formatNumber(h, loc),
      disabled: ctx.hourDisabled(h),
    }));
  });

  const current = () => (ctx.unit() === 'hour' ? ctx.hour() : ctx.minute());
  const selectedIndex = () => options().findIndex((o) => o.value === current());

  // The roving tab stop follows the selection (or the nearest label for minutes between labels).
  createEffect(
    on([() => ctx.unit(), selectedIndex], ([u, i]) =>
      setActive(i >= 0 ? i : u === 'minute' ? Math.round(ctx.minute() / 5) % 12 : 0),
    ),
  );

  // Handle angle, unwrapped so the transition takes the shortest arc (spec §10d).
  const target = () => (ctx.unit() === 'hour' ? (ctx.hour() % 12) * 30 : ctx.minute() * 6);
  const radius = () => (ctx.unit() === 'hour' && !ctx.h12() && ctx.hour() >= 12 ? INNER_RADIUS : OUTER_RADIUS);
  const [angle, setAngle] = createSignal(untrack(target));
  createComputed(
    on(target, (t) => {
      const prev = untrack(angle);
      const delta = ((((t - prev) % 360) + 540) % 360) - 180;
      setAngle(prev + delta);
    }, { defer: true }),
  );
  const between = () => ctx.unit() === 'minute' && ctx.minute() % 5 !== 0;

  const position = (o: DialOption) => {
    const r = o.inner ? INNER_RADIUS : OUTER_RADIUS;
    const theta = (o.pos * 30 * Math.PI) / 180;
    return `${(r * Math.sin(theta)).toFixed(2)}px ${(-r * Math.cos(theta)).toFixed(2)}px`;
  };

  const choose = (o: DialOption) => {
    if (o.disabled) return;
    if (ctx.unit() === 'hour') ctx.setHour(o.value);
    else ctx.setMinute(o.value);
  };

  // ---- Pointer: tap and drag ----
  let picked = false;
  const fromPointer = (e: PointerEvent) => {
    const rect = dial.getBoundingClientRect();
    const scale = rect.width / DIAL_SIZE || 1;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const dist = Math.hypot(dx, dy) / scale;
    if (ctx.unit() === 'hour') {
      const pos = Math.round(deg / 30) % 12;
      const h = ctx.h12() ? to24(pos === 0 ? 12 : pos, ctx.pm()) : pos + (dist < RING_SPLIT ? 12 : 0);
      if (ctx.hourDisabled(h)) return;
      ctx.setHour(h);
    } else {
      const s = ctx.step();
      const m = (Math.round(deg / 6 / s) * s) % 60;
      if (!ctx.inRange(ctx.hour() * 60 + m)) return;
      ctx.setMinute(m);
    }
    picked = true;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dial.setPointerCapture(e.pointerId);
    picked = false;
    // The minute handle follows the pointer 1:1; hours still animate between 30° steps.
    setDragging(ctx.unit() === 'minute');
    fromPointer(e);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dial.hasPointerCapture(e.pointerId)) return;
    if (ctx.unit() === 'minute') setDragging(true);
    fromPointer(e);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dial.hasPointerCapture(e.pointerId)) return;
    dial.releasePointerCapture(e.pointerId);
    setDragging(false);
    // Derived (platform behavior): picking an hour with the pointer advances to minutes.
    if (picked && ctx.unit() === 'hour') ctx.setUnit('minute');
  };

  // ---- Keyboard: listbox with a roving tab stop ----
  const focusActive = () =>
    list.querySelector<HTMLElement>(`[data-index="${active()}"]`)?.focus();

  const onKeyDown = (e: KeyboardEvent) => {
    const opts = options();
    const n = opts.length;
    const i = active();
    const twoRings = n === 24;
    const ringStart = twoRings && i >= 12 ? 12 : 0;
    const around = (d: number) => ringStart + (((i - ringStart + d) % 12) + 12) % 12;
    let next = i;
    switch (e.key) {
      case 'ArrowRight':
        next = around(1);
        break;
      case 'ArrowLeft':
        next = around(-1);
        break;
      // Derived: in 24h, Up/Down move between the rings (outer / inner).
      case 'ArrowDown':
        next = twoRings ? (i % 12) + 12 : around(1);
        break;
      case 'ArrowUp':
        next = twoRings ? i % 12 : around(-1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = n - 1;
        break;
      case 'Enter':
      case ' ':
        choose(opts[i]);
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next !== i) {
      setActive(next);
      focusActive();
    }
  };

  const labelLayer = (interactive: boolean) => (
    <Index each={options()}>
      {(o, i) =>
        interactive ? (
          <div
            role="option"
            class={styles.value}
            style={{ translate: position(o()) }}
            data-index={i}
            data-inner={o().inner ? '' : undefined}
            aria-label={ctx.unit() === 'hour' ? ctx.labels().hours(o().name) : ctx.labels().minutes(o().name)}
            aria-posinset={i + 1}
            aria-setsize={options().length}
            aria-selected={o().value === current()}
            aria-disabled={o().disabled ? 'true' : undefined}
            tabIndex={i === active() ? 0 : -1}
            onFocus={() => setActive(i)}
            // Screen reader activation (pointer input is handled on the dial).
            onClick={(e) => e.detail === 0 && choose(o())}
          >
            <Ripple />
            <span class={styles.valueLabel}>{o().label}</span>
          </div>
        ) : (
          <span class={styles.dialLabel} style={{ translate: position(o()) }}>
            <span class={styles.valueLabel}>{o().label}</span>
          </span>
        )
      }
    </Index>
  );

  return (
    <div
      ref={dial}
      class={styles.dial}
      dir="ltr"
      data-dragging={dragging() ? '' : undefined}
      style={{ '--_dial-angle': `${angle()}deg`, '--_dial-radius': `${radius()}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      // Keep focus where it is (the time selector or the focused value) on pointer input.
      onMouseDown={(e) => e.preventDefault()}
    >
      <div class={styles.track} aria-hidden="true" />
      <div class={styles.handle} data-between={between() ? '' : undefined} aria-hidden="true" />
      <div class={styles.center} aria-hidden="true" />
      {/* Keyed by unit so the labels crossfade on hour <-> minute (spec §6). */}
      <For each={[ctx.unit()]}>
        {(u) => (
          <>
            <div
              ref={list}
              role="listbox"
              class={styles.values}
              aria-label={u === 'hour' ? ctx.labels().selectHours : ctx.labels().selectMinutes}
              onKeyDown={onKeyDown}
            >
              {labelLayer(true)}
            </div>
            <div class={styles.onHandle} aria-hidden="true">
              {labelLayer(false)}
            </div>
          </>
        )}
      </For>
    </div>
  );
};

// ---- Input view: hour and minute fields ----

const TimeInputs = (props: {
  ctx: Ctx;
  hourText: string;
  minuteText: string;
  onHourText: (text: string) => void;
  onMinuteText: (text: string) => void;
  hourInvalid: boolean;
  minuteInvalid: boolean;
  onBlurField: () => void;
  onEnter: () => void;
  errorId: string;
}) => {
  const ctx = props.ctx;
  const hourId = createUniqueId();
  const minuteId = createUniqueId();
  let minuteInput!: HTMLInputElement;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    props.onEnter();
  };

  const padOnBlur = (text: string, set: (t: string) => void) => {
    if (text.length === 1) set(pad2(Number(text)));
    props.onBlurField();
  };

  return (
    <div class={styles.fields} dir="ltr">
      <div class={styles.inputField} data-invalid={props.hourInvalid ? '' : undefined}>
        <input
          id={hourId}
          class={styles.input}
          type="text"
          inputMode="numeric"
          autocomplete="off"
          maxLength={2}
          value={props.hourText}
          aria-invalid={props.hourInvalid}
          aria-describedby={props.hourInvalid ? props.errorId : undefined}
          data-hour-control=""
          onInput={(e) => {
            const el = e.currentTarget;
            const text = digitsOnly(el.value);
            el.value = text;
            props.onHourText(text);
            // Derived: two typed hour digits advance to the minute field.
            if (text.length === 2 && e.inputType.startsWith('insert')) {
              minuteInput.focus();
              minuteInput.select();
            }
          }}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => padOnBlur(props.hourText, props.onHourText)}
          onKeyDown={onKeyDown}
        />
        <label class={styles.supportingText} for={hourId}>
          {ctx.labels().hour}
        </label>
      </div>
      <span class={styles.separator} aria-hidden="true">
        :
      </span>
      <div class={styles.inputField} data-invalid={props.minuteInvalid ? '' : undefined}>
        <input
          ref={minuteInput}
          id={minuteId}
          class={styles.input}
          type="text"
          inputMode="numeric"
          autocomplete="off"
          maxLength={2}
          value={props.minuteText}
          aria-invalid={props.minuteInvalid}
          aria-describedby={props.minuteInvalid ? props.errorId : undefined}
          onInput={(e) => {
            const el = e.currentTarget;
            const text = digitsOnly(el.value);
            el.value = text;
            props.onMinuteText(text);
          }}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => padOnBlur(props.minuteText, props.onMinuteText)}
          onKeyDown={onKeyDown}
        />
        <label class={styles.supportingText} for={minuteId}>
          {ctx.labels().minute}
        </label>
      </div>
    </div>
  );
};
