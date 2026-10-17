import {
  DatePicker as ArkDatePicker,
  parseDate,
  type DateValue,
  type UseDatePickerContext,
} from '@ark-ui/solid/date-picker';
import { Dialog as ArkDialog } from '@ark-ui/solid/dialog';
import { Popover } from '@ark-ui/solid/popover';
import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  Match,
  on,
  onCleanup,
  onMount,
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
import { Icon } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import { TextField, type TextFieldVariant } from '../text-field';
import {
  clampIso,
  daysInMonth,
  defaultLocale,
  fieldFormat,
  formatIso,
  formatNumber,
  isIsoDate,
  localeWeekStart,
  localTimeZone,
  todayIso,
  toIso,
} from './date-utils';
import styles from './date-picker.module.css';

export type DatePickerVariant = 'docked' | 'modal' | 'modal-input';
export type DatePickerMode = 'calendar' | 'input';

export type DatePickerLabels = {
  /** Calendar icon button and docked popup name. */
  chooseDate: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  selectMonth: string;
  selectYear: string;
  switchToInput: string;
  switchToCalendar: string;
  /** Full-screen range picker close button. */
  close: string;
  /** Field labels. */
  date: string;
  startDate: string;
  endDate: string;
  /** Modal supporting text per mode. */
  selectDate: string;
  selectDates: string;
  enterDate: string;
  enterDates: string;
  /** Modal headline with nothing selected. */
  selectedDate: string;
  /** Error texts. */
  invalidDate: (pattern: string) => string;
  outOfRange: string;
  unavailable: string;
  endBeforeStart: string;
};

const DEFAULT_LABELS: DatePickerLabels = {
  chooseDate: 'Choose date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  selectMonth: 'Select month',
  selectYear: 'Select year',
  switchToInput: 'Switch to text input',
  switchToCalendar: 'Switch to calendar',
  close: 'Close',
  date: 'Date',
  startDate: 'Start date',
  endDate: 'End date',
  selectDate: 'Select date',
  selectDates: 'Select dates',
  enterDate: 'Enter date',
  enterDates: 'Enter dates',
  selectedDate: 'Selected date',
  invalidDate: (pattern) => `Invalid date. Use ${pattern}`,
  outOfRange: 'Date out of range',
  unavailable: 'Date not available',
  endBeforeStart: 'End date is before start date',
};

export type DatePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> & {
  /**
   * Default `docked`: an outlined field with a calendar that drops down below
   * it (medium and expanded windows; near and distant dates). `modal`: the
   * calendar in a dialog (near-term dates on compact windows; a range is a
   * full-screen picker there). `modal-input`: the same dialog opening in
   * text-entry mode (distant dates such as a date of birth).
   */
  variant?: DatePickerVariant;
  /** Select a start and end date instead of one date. */
  range?: boolean;
  /**
   * Committed value as ISO `YYYY-MM-DD` strings: `[date]` or `[]`; with
   * `range`, `[start, end]`, `[start]`, or `['', end]` while only the end
   * field has a date.
   */
  value?: string[];
  defaultValue?: string[];
  /** Called when a value is committed (OK/Save, Enter, or a field edit on blur/Enter). */
  onValueChange?: (value: string[]) => void;
  /** Earliest / latest selectable date (ISO). */
  min?: string;
  max?: string;
  /** Dates that can't be picked (shown at 38%, skipped by Enter and clicks). */
  isDateUnavailable?: (date: string) => boolean;
  /** BCP 47 tag for names, numerals, the typed format and the week start. Default: `<html lang>`, then the browser's. */
  locale?: string;
  /** First column of the week, 0 = Sunday. Default: from the locale. */
  startOfWeek?: number;
  /** Controlled open state of the calendar (docked popup or modal dialog). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Modal variants: calendar or text entry. Controlled. */
  mode?: DatePickerMode;
  /** Mode each time the modal opens when uncontrolled. Default `input` for `modal-input`, else `calendar`. */
  defaultMode?: DatePickerMode;
  onModeChange?: (mode: DatePickerMode) => void;
  /**
   * Modal variants: render the text field (with the calendar button that
   * opens the dialog). Default true. Without it, open the dialog with `open`.
   */
  field?: boolean;
  /** Field style. Default `outlined` (spec). */
  fieldVariant?: TextFieldVariant;
  /** Field label (single). Default "Date". */
  label?: string;
  /** Range field labels. Default "Start date" / "End date". */
  startLabel?: string;
  endLabel?: string;
  /** Helper text under the field(s). Default: the locale's format, e.g. "MM/DD/YYYY". */
  helperText?: JSX.Element;
  /** An app-level error under the (last) field, e.g. from the server. */
  errorText?: JSX.Element;
  /** Modal header: headline override. Default: the pending date(s). */
  headline?: JSX.Element;
  /** Modal header: supporting text override. Default "Select date" / "Enter date". */
  supportingText?: JSX.Element;
  /** Default "OK" ("Save" in the full-screen range picker). */
  confirmLabel?: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** Show a Clear action that empties the pending selection. */
  clearable?: boolean;
  /** Default "Clear". */
  clearLabel?: string;
  /** Docked: show the leading/trailing days of other months (at 38%). Default true. */
  showOutsideDays?: boolean;
  /** Form name: one hidden ISO input, or `<name>-start` and `<name>-end` for a range. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Localized accessible names and messages. */
  labels?: Partial<DatePickerLabels>;
};

type Menu = 'month' | 'year' | null;
type CalendarLayout = 'docked' | 'modal' | 'range';
type Api = UseDatePickerContext;
type VisibleRange = { start: DateValue; end: DateValue };

/** Months rendered by the scrolling range picker (derived: one year from the focused month). */
const RANGE_MONTHS = 12;
/** Year span when there's no min/max (derived, as Compose: 1900-2100). */
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const COMPACT_QUERY = '(max-width: 599.98px)';

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
const iso = (d: DateValue) => d.toString().slice(0, 10);
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

type Ctx = {
  locale: Accessor<string>;
  timeZone: string;
  range: Accessor<boolean>;
  min: Accessor<string | undefined>;
  max: Accessor<string | undefined>;
  isUnavailable: (date: string) => boolean;
  startOfWeek: Accessor<number | undefined>;
  pending: Accessor<string[]>;
  setPending: (value: string[]) => void;
  labels: Accessor<DatePickerLabels>;
  menu: Accessor<Menu>;
  setMenu: (menu: Menu) => void;
  showOutsideDays: Accessor<boolean>;
  /** Docked: Enter on a date commits and closes (spec §8 keyboard). */
  onDayEnter: () => void;
};

/**
 * M3 date picker:
 * docked (outlined field + calendar drop-down with month and year menus),
 * modal (dialog with header, month grid and year grid; a range is a
 * full-screen, vertically scrolling picker on compact windows) and modal
 * date input (text fields in the dialog, switchable with the calendar).
 * Single date or range, min/max and unavailable dates, locale-aware names,
 * typed format and week start.
 *
 * Ark UI `DatePicker` (inline) provides the calendar model, grid keyboard
 * and ARIA; Ark `Popover` the docked drop-down and the project's `Dialog`
 * root the modal. The calendar edits a pending selection: OK/Save commits,
 * Cancel, Escape and outside clicks discard. The field always allows typing
 * (lenient parsing on blur/Enter, no masks).
 */
export const DatePicker = (props: DatePickerProps) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'range',
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'isDateUnavailable',
    'locale',
    'startOfWeek',
    'open',
    'defaultOpen',
    'onOpenChange',
    'mode',
    'defaultMode',
    'onModeChange',
    'field',
    'fieldVariant',
    'label',
    'startLabel',
    'endLabel',
    'helperText',
    'errorText',
    'headline',
    'supportingText',
    'confirmLabel',
    'cancelLabel',
    'clearable',
    'clearLabel',
    'showOutsideDays',
    'name',
    'required',
    'disabled',
    'readOnly',
    'labels',
    'class',
  ]);

  const labels = createMemo(() => ({ ...DEFAULT_LABELS, ...local.labels }));
  const variant = () => local.variant ?? 'docked';
  const docked = () => variant() === 'docked';
  const range = () => !!local.range;
  const locale = () => local.locale ?? defaultLocale();
  const timeZone = localTimeZone();
  const fmt = createMemo(() => fieldFormat(locale()));
  const min = () => (isIsoDate(local.min) ? local.min : undefined);
  const max = () => (isIsoDate(local.max) ? local.max : undefined);
  const indices = () => (range() ? [0, 1] : [0]);

  const normalize = (list: string[] | undefined): string[] => {
    const valid = (list ?? []).map((v) => (isIsoDate(v) ? v : ''));
    if (!range()) return valid[0] ? [valid[0]] : [];
    const [start = '', end = ''] = valid;
    return end ? [start, end] : start ? [start] : [];
  };

  // ---- Committed value ----
  const [ownValue, setOwnValue] = createSignal(untrack(() => normalize(local.defaultValue)), {
    equals: sameList,
  });
  const value = createMemo(() => (local.value !== undefined ? normalize(local.value) : ownValue()), [], {
    equals: sameList,
  });
  const commit = (next: string[]) => {
    if (local.value === undefined) setOwnValue(next);
    local.onValueChange?.(next);
  };

  // ---- Open state and mode ----
  const [ownOpen, setOwnOpen] = createSignal(untrack(() => local.defaultOpen ?? false));
  const open = () => local.open ?? ownOpen();
  const setOpen = (next: boolean) => {
    if (open() === next) return;
    if (local.open === undefined) setOwnOpen(next);
    local.onOpenChange?.(next);
  };

  const defaultMode = (): DatePickerMode =>
    local.defaultMode ?? (variant() === 'modal-input' ? 'input' : 'calendar');
  const [ownMode, setOwnMode] = createSignal<DatePickerMode>(untrack(defaultMode));
  const mode = (): DatePickerMode => (docked() ? 'calendar' : (local.mode ?? ownMode()));
  const setMode = (next: DatePickerMode) => {
    if (local.mode === undefined) setOwnMode(next);
    local.onModeChange?.(next);
  };

  // ---- Pending selection (the calendar and the dialog's text fields) ----
  const [pending, setPending] = createSignal<string[]>([], { equals: sameList });
  const [menu, setMenu] = createSignal<Menu>(null);
  const [inputText, setInputText] = createSignal<string[]>([]);
  const [inputErrors, setInputErrors] = createSignal<(string | undefined)[]>([]);

  const syncInputText = () => setInputText(indices().map((i) => (pending()[i] ? fmt().format(pending()[i]) : '')));

  // Before the surface renders, so the calendar mounts focused on the value.
  createComputed(
    on(open, (isOpen) => {
      if (!isOpen) return;
      untrack(() => {
        setPending(value());
        setMenu(null);
        if (local.mode === undefined) setOwnMode(defaultMode());
        syncInputText();
        setInputErrors([]);
      });
    }),
  );

  const validate = (date: string): string | undefined => {
    if ((min() && date < min()!) || (max() && date > max()!)) return labels().outOfRange;
    if (local.isDateUnavailable?.(date)) return labels().unavailable;
    return undefined;
  };

  /** Parses the dialog's text fields; sets their errors. */
  const readInputs = (): string[] | null => {
    const out: string[] = [];
    const errors: (string | undefined)[] = [];
    for (const i of indices()) {
      const parsed = fmt().parse(inputText()[i] ?? '');
      if (parsed === undefined) errors[i] = labels().invalidDate(fmt().pattern);
      else if (parsed) errors[i] = validate(parsed);
      out[i] = parsed ?? '';
    }
    if (!errors.some(Boolean) && range() && out[0] && out[1] && out[1] < out[0]) {
      errors[1] = labels().endBeforeStart;
    }
    setInputErrors(errors);
    return errors.some(Boolean) ? null : normalize(out);
  };

  const blurInput = (i: number) => {
    const parsed = fmt().parse(inputText()[i] ?? '');
    const error =
      parsed === undefined ? labels().invalidDate(fmt().pattern) : parsed ? validate(parsed) : undefined;
    setInputErrors((errs) => {
      const next = [...errs];
      next[i] = error;
      return next;
    });
    if (error) return;
    const next = [...pending()];
    next[i] = parsed ?? '';
    setPending(normalize(next));
    if (parsed) setInputText((t) => t.map((v, j) => (j === i ? fmt().format(parsed) : v)));
  };

  const confirm = () => {
    if (!docked() && mode() === 'input') {
      const parsed = readInputs();
      if (!parsed) return;
      setPending(parsed);
    }
    const next = normalize(pending());
    if (!sameList(next, value())) commit(next);
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  const clear = () => {
    setPending([]);
    setInputText(indices().map(() => ''));
    setInputErrors([]);
  };

  // ---- Field(s) outside the surface ----
  const [fieldText, setFieldText] = createSignal<string[]>([]);
  const [fieldErrors, setFieldErrors] = createSignal<(string | undefined)[]>([]);
  createEffect(
    on([value, fmt], () => {
      setFieldText(indices().map((i) => (value()[i] ? fmt().format(value()[i]) : '')));
      setFieldErrors([]);
    }),
  );
  const setAt = <T,>(list: T[], i: number, v: T) => {
    const next = [...list];
    next[i] = v;
    return next;
  };

  const commitField = (i: number) => {
    const parsed = fmt().parse(fieldText()[i] ?? '');
    let error =
      parsed === undefined ? labels().invalidDate(fmt().pattern) : parsed ? validate(parsed) : undefined;
    const next = range() ? [value()[0] ?? '', value()[1] ?? ''] : [''];
    next[i] = parsed ?? '';
    if (!error && range() && next[0] && next[1] && next[1] < next[0]) error = labels().endBeforeStart;
    setFieldErrors((errs) => setAt(errs, i, error));
    if (error) return;
    const normalized = normalize(next);
    if (!sameList(normalized, value())) commit(normalized);
    setFieldText((t) => setAt(t, i, parsed ? fmt().format(parsed) : ''));
  };

  // ---- Surfaces ----
  let surface: HTMLElement | undefined;
  const cellSelector = '[data-part="table-cell-trigger"][tabindex="0"]';
  const initialFocus = () => {
    if (!surface) return null;
    return !docked() && mode() === 'input'
      ? surface.querySelector<HTMLElement>('input')
      : surface.querySelector<HTMLElement>(cellSelector);
  };
  const focusSoon = () => requestAnimationFrame(() => initialFocus()?.focus());

  const [compact, setCompact] = createSignal(false);
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia(COMPACT_QUERY);
    setCompact(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mql.addEventListener('change', onChange);
    onCleanup(() => mql.removeEventListener('change', onChange));
  }

  /** The full-screen range picker (modal range in calendar mode). */
  const rangeCalendar = () => !docked() && range() && mode() === 'calendar';
  const dialogLayout = () => (rangeCalendar() && compact() ? 'full-screen' : 'basic');

  const toggleMode = () => {
    if (mode() === 'calendar') {
      setMenu(null);
      syncInputText();
      setInputErrors([]);
      setMode('input');
    } else {
      // Invalid typed input blocks switching back until fixed (spec §6).
      const parsed = readInputs();
      if (!parsed) return;
      setPending(parsed);
      setMode('calendar');
    }
    focusSoon();
  };

  const ctx: Ctx = {
    locale,
    timeZone,
    range,
    min,
    max,
    isUnavailable: (date) => !!local.isDateUnavailable?.(date),
    startOfWeek: () => local.startOfWeek ?? localeWeekStart(locale()),
    pending,
    setPending,
    labels,
    menu,
    setMenu,
    showOutsideDays: () => local.showOutsideDays ?? true,
    onDayEnter: () => {
      if (!docked()) return;
      const selected = pending().filter(Boolean);
      if (selected.length === (range() ? 2 : 1)) confirm();
    },
  };

  const headline = () => {
    if (local.headline !== undefined) return local.headline;
    const v = pending();
    if (!range()) {
      return v[0]
        ? formatIso(v[0], locale(), { weekday: 'short', month: 'short', day: 'numeric' })
        : labels().selectedDate;
    }
    const part = (date: string | undefined, fallback: string) =>
      date ? formatIso(date, locale(), { month: 'short', day: 'numeric' }) : fallback;
    return `${part(v[0], labels().startDate)} – ${part(v[1], labels().endDate)}`;
  };

  const supportingText = () =>
    local.supportingText ??
    (mode() === 'input'
      ? range()
        ? labels().enterDates
        : labels().enterDate
      : range()
        ? labels().selectDates
        : labels().selectDate);

  const triggerDisabled = () => !!(local.disabled || local.readOnly);

  const fieldTrigger = () =>
    docked() ? (
      <Popover.Trigger
        asChild={(tp) => (
          <IconButton
            {...tp()}
            color="standard"
            icon="calendar_today"
            label={labels().chooseDate}
            disabled={triggerDisabled()}
          />
        )}
      />
    ) : (
      <ArkDialog.Trigger
        asChild={(tp) => (
          <IconButton
            {...tp()}
            color="standard"
            icon="calendar_today"
            label={labels().chooseDate}
            disabled={triggerDisabled()}
          />
        )}
      />
    );

  const fieldLabel = (i: number) =>
    range()
      ? i === 0
        ? (local.startLabel ?? labels().startDate)
        : (local.endLabel ?? labels().endDate)
      : (local.label ?? labels().date);

  const fields = () => (
    <div class={styles.fields} data-range={range() ? '' : undefined}>
      <For each={indices()}>
        {(i) => (
          <TextField
            class={styles.field}
            variant={local.fieldVariant ?? 'outlined'}
            label={fieldLabel(i)}
            value={fieldText()[i] ?? ''}
            onValueChange={(text) => setFieldText((t) => setAt(t, i, text))}
            onBlur={() => commitField(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitField(i);
            }}
            supportingText={local.helperText ?? fmt().pattern}
            errorText={fieldErrors()[i] ?? (i === indices().length - 1 ? local.errorText : undefined)}
            placeholder={fmt().pattern}
            inputMode="numeric"
            autocomplete="off"
            required={local.required}
            disabled={local.disabled}
            readOnly={local.readOnly}
            trailing={i === indices().length - 1 ? fieldTrigger() : undefined}
          />
        )}
      </For>
    </div>
  );

  const actions = () => (
    <div class={styles.actions}>
      <Show when={local.clearable}>
        <Button color="text" class={styles.clear} onClick={clear}>
          {local.clearLabel ?? 'Clear'}
        </Button>
      </Show>
      <Button color="text" onClick={cancel}>
        {local.cancelLabel ?? 'Cancel'}
      </Button>
      <Button color="text" onClick={confirm}>
        {local.confirmLabel ?? 'OK'}
      </Button>
    </div>
  );

  const modeButton = () => (
    <IconButton
      class={styles.modeButton}
      color="standard"
      icon={mode() === 'input' ? 'calendar_today' : 'edit'}
      label={mode() === 'input' ? labels().switchToCalendar : labels().switchToInput}
      onClick={toggleMode}
    />
  );

  const inputBody = () => (
    <div class={styles.inputBody} data-range={range() ? '' : undefined}>
      <For each={indices()}>
        {(i) => (
          <TextField
            variant="outlined"
            label={fieldLabel(i)}
            value={inputText()[i] ?? ''}
            onValueChange={(text) => setInputText((t) => setAt(t, i, text))}
            onBlur={() => blurInput(i)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              confirm();
            }}
            supportingText={fmt().pattern}
            errorText={inputErrors()[i]}
            placeholder={fmt().pattern}
            inputMode="numeric"
            autocomplete="off"
          />
        )}
      </For>
    </div>
  );

  const hiddenInputs = () => (
    <Show when={local.name}>
      {(name) => (
        <Show when={range()} fallback={<input type="hidden" name={name()} value={value()[0] ?? ''} />}>
          <input type="hidden" name={`${name()}-start`} value={value()[0] ?? ''} />
          <input type="hidden" name={`${name()}-end`} value={value()[1] ?? ''} />
        </Show>
      )}
    </Show>
  );

  return (
    <div
      {...rest}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      data-variant={variant()}
      data-range={range() ? '' : undefined}
    >
      <Show
        when={docked()}
        fallback={
          <DialogRoot
            role="dialog"
            open={open()}
            onOpenChange={(isOpen) => (isOpen ? setOpen(true) : cancel())}
            initialFocusEl={initialFocus}
          >
            <Show when={local.field !== false}>{fields()}</Show>
            <Portal>
              <ArkDialog.Backdrop class={styles.scrim} />
              <ArkDialog.Positioner class={styles.dialogPositioner} data-layout={dialogLayout()}>
                <ArkDialog.Content
                  ref={(el: HTMLDivElement) => (surface = el)}
                  class={styles.dialog}
                  data-layout={dialogLayout()}
                  data-view={rangeCalendar() ? 'range' : mode() === 'input' ? 'input' : 'calendar'}
                >
                  <Show when={rangeCalendar()}>
                    <div class={styles.rangeBar}>
                      <ArkDialog.CloseTrigger
                        asChild={(tp) => (
                          <IconButton {...tp()} color="standard" icon="close" label={labels().close} />
                        )}
                      />
                      <Button color="text" onClick={confirm}>
                        {local.confirmLabel ?? 'Save'}
                      </Button>
                    </div>
                  </Show>
                  <header class={styles.header}>
                    <ArkDialog.Title class={styles.supportingText}>{supportingText()}</ArkDialog.Title>
                    <div class={styles.headlineRow}>
                      <p class={styles.headline}>{headline()}</p>
                      {modeButton()}
                    </div>
                  </header>
                  <Switch>
                    <Match when={mode() === 'calendar'}>
                      <Calendar ctx={ctx} layout={range() ? 'range' : 'modal'} />
                    </Match>
                    <Match when={mode() === 'input'}>{inputBody()}</Match>
                  </Switch>
                  <Show when={!rangeCalendar()}>{actions()}</Show>
                </ArkDialog.Content>
              </ArkDialog.Positioner>
            </Portal>
          </DialogRoot>
        }
      >
        <Popover.Root
          open={open()}
          onOpenChange={(d) => (d.open ? setOpen(true) : cancel())}
          positioning={{ placement: 'bottom-start', gutter: 4, flip: true }}
          initialFocusEl={initialFocus}
          lazyMount
          unmountOnExit
        >
          <Popover.Anchor class={styles.anchor}>{fields()}</Popover.Anchor>
          <Portal>
            <Popover.Positioner class={styles.positioner}>
              <Popover.Content
                ref={(el: HTMLDivElement) => (surface = el)}
                class={styles.docked}
                data-motion-scheme="standard"
                aria-label={labels().chooseDate}
              >
                <Calendar ctx={ctx} layout="docked" />
                <Show when={!menu()}>{actions()}</Show>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Show>
      {hiddenInputs()}
    </div>
  );
};

// ---- Calendar (Ark DatePicker, inline) ----

const Calendar = (props: { ctx: Ctx; layout: CalendarLayout }) => {
  const ctx = props.ctx;
  const arkValue = createMemo(() => {
    const v = ctx.pending();
    return (v[0] ? v.filter(Boolean) : []).map((d) => parseDate(d));
  });
  const focusStart = untrack(() =>
    clampIso(ctx.pending().find(Boolean) ?? todayIso(), ctx.min(), ctx.max()),
  );
  const outside = () => (props.layout === 'docked' && ctx.showOutsideDays() ? 'show' : 'hide');

  const onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      e.key === 'Enter' &&
      target.matches('[data-part="table-cell-trigger"]:not([data-disabled])')
    ) {
      // Runs after Ark's own Enter handler (on the table) has selected the date.
      setTimeout(ctx.onDayEnter);
    }
  };

  return (
    <ArkDatePicker.Root
      inline
      class={styles.calendar}
      data-layout={props.layout}
      // Spec §6: month slides on the standard scheme (no overshoot).
      data-motion-scheme="standard"
      data-outside={outside()}
      locale={ctx.locale()}
      timeZone={ctx.timeZone}
      selectionMode={ctx.range() ? 'range' : 'single'}
      value={arkValue()}
      onValueChange={(d) => ctx.setPending(d.value.map(iso))}
      defaultFocusedValue={parseDate(focusStart)}
      min={ctx.min() ? parseDate(ctx.min()!) : undefined}
      max={ctx.max() ? parseDate(ctx.max()!) : undefined}
      isDateUnavailable={(d) => ctx.isUnavailable(iso(d))}
      startOfWeek={ctx.startOfWeek()}
      fixedWeeks={props.layout === 'modal'}
      numOfMonths={props.layout === 'range' ? RANGE_MONTHS : undefined}
      outsideDaySelectable={outside() === 'show'}
      minView="day"
      maxView="day"
      closeOnSelect={false}
      translations={{
        dayCell: (state) => state.valueText,
        prevTrigger: () => ctx.labels().previousMonth,
        nextTrigger: () => ctx.labels().nextMonth,
      }}
      // Capture: Ark's table handler stops the event's propagation.
      ref={(el: HTMLDivElement) => el.addEventListener('keydown', onKeyDown, true)}
    >
      <ArkDatePicker.Context>
        {(api) => (
          <Switch>
            <Match when={props.layout === 'docked'}>
              <DockedView ctx={ctx} api={api} />
            </Match>
            <Match when={props.layout === 'modal'}>
              <ModalView ctx={ctx} api={api} />
            </Match>
            <Match when={props.layout === 'range'}>
              <RangeView ctx={ctx} api={api} />
            </Match>
          </Switch>
        )}
      </ArkDatePicker.Context>
    </ArkDatePicker.Root>
  );
};

const yearBounds = (ctx: Ctx) => ({
  min: ctx.min() ? Number(ctx.min()!.slice(0, 4)) : MIN_YEAR,
  max: ctx.max() ? Number(ctx.max()!.slice(0, 4)) : MAX_YEAR,
});

const yearOptions = (ctx: Ctx): Option[] => {
  const { min, max } = yearBounds(ctx);
  const out: Option[] = [];
  for (let y = min; y <= max; y++) out.push({ value: y, label: formatNumber(y, ctx.locale()) });
  return out;
};

/** Visible month as ISO (first day), its "August 2026" label and a live announcement. */
const useVisibleMonth = (ctx: Ctx, api: Api) => {
  const start = () => iso(api().visibleRange.start);
  const monthYear = () => formatIso(start(), ctx.locale(), { month: 'long', year: 'numeric' });
  return { start, monthYear };
};

const LiveMonth = (props: { text: string }) => (
  <div class={styles.visuallyHidden} aria-live="polite">
    {props.text}
  </div>
);

const MenuButton = (props: {
  label: string;
  ariaLabel: string;
  expanded: boolean;
  disabled?: boolean;
  onClick: () => void;
  ref?: (el: HTMLButtonElement) => void;
}) => (
  <button
    ref={props.ref}
    type="button"
    class={styles.menuButton}
    aria-haspopup="listbox"
    aria-expanded={props.expanded}
    aria-label={props.ariaLabel}
    disabled={props.disabled}
    onClick={() => props.onClick()}
  >
    <Ripple />
    <span class={styles.menuLabel}>{props.label}</span>
    <Icon class={styles.menuArrow} name="arrow_drop_down" />
  </button>
);

const DockedView = (props: { ctx: Ctx; api: Api }) => {
  const ctx = props.ctx;
  const api = props.api;
  const { start, monthYear } = useVisibleMonth(ctx, api);
  let monthButton!: HTMLButtonElement;
  let yearButton!: HTMLButtonElement;

  const year = () => api().visibleRange.start.year;
  const bounds = () => yearBounds(ctx);
  const monthName = (style: 'short' | 'long', month: number) =>
    formatIso(toIso(2000, month, 1), ctx.locale(), { month: style });

  const monthOptions = (): Option[] =>
    Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const first = toIso(year(), m, 1);
      const last = toIso(year(), m, daysInMonth(year(), m));
      const disabled = (!!ctx.min() && last < ctx.min()!) || (!!ctx.max() && first > ctx.max()!);
      return { value: m, label: monthName('long', m), disabled };
    });

  const shiftYear = (delta: number) => api().setFocusedValue(api().focusedValue.add({ years: delta }));

  const toggle = (which: 'month' | 'year') => ctx.setMenu(ctx.menu() === which ? null : which);

  const choose = (which: 'month' | 'year', v: number) => {
    const focused = api().focusedValue;
    api().setFocusedValue(which === 'month' ? focused.set({ month: v }) : focused.set({ year: v }));
    ctx.setMenu(null);
    queueMicrotask(() => (which === 'month' ? monthButton : yearButton).focus());
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.target as HTMLElement).matches('input')) return;
    if (e.key === 'M') monthButton.focus();
    else if (e.key === 'Y') yearButton.focus();
    else return;
    e.preventDefault();
  };

  const arrowHidden = () => (ctx.menu() ? '' : undefined);

  return (
    <div class={styles.view} onKeyDown={onKeyDown}>
      <div class={styles.dockedHeader}>
        <div class={styles.group}>
          <ArkDatePicker.PrevTrigger
            asChild={(tp) => (
              <IconButton
                {...tp()}
                color="standard"
                icon="chevron_left"
                mirror
                label={ctx.labels().previousMonth}
                aria-keyshortcuts="PageUp"
                data-hidden={arrowHidden()}
              />
            )}
          />
          <MenuButton
            ref={(el) => (monthButton = el)}
            label={monthName('short', api().visibleRange.start.month)}
            ariaLabel={`${ctx.labels().selectMonth}, ${monthName('long', api().visibleRange.start.month)}`}
            expanded={ctx.menu() === 'month'}
            disabled={ctx.menu() === 'year'}
            onClick={() => toggle('month')}
          />
          <ArkDatePicker.NextTrigger
            asChild={(tp) => (
              <IconButton
                {...tp()}
                color="standard"
                icon="chevron_right"
                mirror
                label={ctx.labels().nextMonth}
                aria-keyshortcuts="PageDown"
                data-hidden={arrowHidden()}
              />
            )}
          />
        </div>
        <div class={styles.group}>
          <IconButton
            color="standard"
            icon="chevron_left"
            mirror
            label={ctx.labels().previousYear}
            aria-keyshortcuts="Shift+PageUp"
            disabled={year() <= bounds().min}
            data-hidden={arrowHidden()}
            onClick={() => shiftYear(-1)}
          />
          <MenuButton
            ref={(el) => (yearButton = el)}
            label={formatNumber(year(), ctx.locale())}
            ariaLabel={`${ctx.labels().selectYear}, ${formatNumber(year(), ctx.locale())}`}
            expanded={ctx.menu() === 'year'}
            disabled={ctx.menu() === 'month'}
            onClick={() => toggle('year')}
          />
          <IconButton
            color="standard"
            icon="chevron_right"
            mirror
            label={ctx.labels().nextYear}
            aria-keyshortcuts="Shift+PageDown"
            disabled={year() >= bounds().max}
            data-hidden={arrowHidden()}
            onClick={() => shiftYear(1)}
          />
        </div>
      </div>
      <div class={styles.body}>
        <Switch
          fallback={
            <Slide key={start()}>
              <DayTable ctx={ctx} api={api} weeks={api().weeks} label={monthYear()} />
            </Slide>
          }
        >
          <Match when={ctx.menu() === 'month'}>
            <OptionGrid
              kind="list"
              label={ctx.labels().selectMonth}
              columns={1}
              options={monthOptions()}
              selected={api().visibleRange.start.month}
              onSelect={(m) => choose('month', m)}
            />
          </Match>
          <Match when={ctx.menu() === 'year'}>
            <OptionGrid
              kind="list"
              label={ctx.labels().selectYear}
              columns={1}
              options={yearOptions(ctx)}
              selected={year()}
              onSelect={(y) => choose('year', y)}
            />
          </Match>
        </Switch>
      </div>
      <LiveMonth text={monthYear()} />
    </div>
  );
};

const ModalView = (props: { ctx: Ctx; api: Api }) => {
  const ctx = props.ctx;
  const api = props.api;
  const { start, monthYear } = useVisibleMonth(ctx, api);
  let menuButton!: HTMLButtonElement;
  const yearOpen = () => ctx.menu() === 'year';

  const chooseYear = (y: number) => {
    api().setFocusedValue(api().focusedValue.set({ year: y }));
    ctx.setMenu(null);
    queueMicrotask(() => menuButton.focus());
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.key !== 'Y') return;
    e.preventDefault();
    ctx.setMenu('year');
  };

  return (
    <div class={styles.view} onKeyDown={onKeyDown}>
      <div class={styles.nav}>
        <MenuButton
          ref={(el) => (menuButton = el)}
          label={monthYear()}
          ariaLabel={`${ctx.labels().selectYear}, ${monthYear()}`}
          expanded={yearOpen()}
          onClick={() => ctx.setMenu(yearOpen() ? null : 'year')}
        />
        <Show when={!yearOpen()}>
          <div class={styles.navArrows}>
            <ArkDatePicker.PrevTrigger
              asChild={(tp) => (
                <IconButton
                  {...tp()}
                  color="standard"
                  icon="chevron_left"
                  mirror
                  label={ctx.labels().previousMonth}
                  aria-keyshortcuts="PageUp"
                />
              )}
            />
            <ArkDatePicker.NextTrigger
              asChild={(tp) => (
                <IconButton
                  {...tp()}
                  color="standard"
                  icon="chevron_right"
                  mirror
                  label={ctx.labels().nextMonth}
                  aria-keyshortcuts="PageDown"
                />
              )}
            />
          </div>
        </Show>
      </div>
      <div class={styles.body}>
        <Show
          when={yearOpen()}
          fallback={
            <Slide key={start()}>
              <DayTable ctx={ctx} api={api} weeks={api().weeks} label={monthYear()} />
            </Slide>
          }
        >
          <OptionGrid
            kind="grid"
            label={ctx.labels().selectYear}
            columns={3}
            options={yearOptions(ctx)}
            selected={api().visibleRange.start.year}
            onSelect={chooseYear}
          />
        </Show>
      </div>
      <LiveMonth text={monthYear()} />
    </div>
  );
};

const RangeView = (props: { ctx: Ctx; api: Api }) => {
  const ctx = props.ctx;
  const api = props.api;
  const months = Array.from({ length: RANGE_MONTHS }, (_, i) => i);
  return (
    <div class={styles.view}>
      <div class={styles.weekdays} aria-hidden="true">
        <Index each={api().weekDays}>
          {(day) => (
            <span class={styles.weekday} title={day().long}>
              {day().narrow}
            </span>
          )}
        </Index>
      </div>
      <div class={styles.months}>
        <For each={months}>
          {(i) => {
            const offset = createMemo(() => api().getOffset({ months: i }));
            const title = () =>
              formatIso(iso(offset().visibleRange.start), ctx.locale(), { month: 'long', year: 'numeric' });
            return (
              <section class={styles.month}>
                <h3 class={styles.subhead}>{title()}</h3>
                <DayTable
                  ctx={ctx}
                  api={api}
                  weeks={offset().weeks}
                  visibleRange={offset().visibleRange}
                  id={`month-${i}`}
                  label={title()}
                  hideHead
                />
              </section>
            );
          }}
        </For>
      </div>
    </div>
  );
};

/** Restarts the month slide when `key` (the visible month) changes. */
const Slide = (props: { key: string; children: JSX.Element }) => {
  let el!: HTMLDivElement;
  let prev: string | undefined;
  createEffect(() => {
    const key = props.key;
    if (prev !== undefined && key !== prev && el) {
      el.removeAttribute('data-enter');
      void el.offsetWidth;
      el.setAttribute('data-enter', key > prev ? 'next' : 'prev');
    }
    prev = key;
  });
  return (
    <div
      ref={el}
      class={styles.slide}
      onAnimationEnd={(e) => e.target === el && el.removeAttribute('data-enter')}
    >
      {props.children}
    </div>
  );
};

const DayTable = (props: {
  ctx: Ctx;
  api: Api;
  weeks: DateValue[][];
  visibleRange?: VisibleRange;
  id?: string;
  label: string;
  hideHead?: boolean;
}) => (
  <ArkDatePicker.Table class={styles.grid} id={props.id} aria-label={props.label}>
    <ArkDatePicker.TableHead class={props.hideHead ? styles.visuallyHidden : undefined}>
      <ArkDatePicker.TableRow>
        <Index each={props.api().weekDays}>
          {(day) => (
            <ArkDatePicker.TableHeader class={styles.weekday} scope="col" title={day().long}>
              <span aria-hidden="true">{day().narrow}</span>
              <span class={styles.visuallyHidden}>{day().long}</span>
            </ArkDatePicker.TableHeader>
          )}
        </Index>
      </ArkDatePicker.TableRow>
    </ArkDatePicker.TableHead>
    <ArkDatePicker.TableBody>
      <Index each={props.weeks}>
        {(week) => (
          <ArkDatePicker.TableRow>
            <Index each={week()}>
              {(day) => (
                <DayCell ctx={props.ctx} api={props.api} day={day()} visibleRange={props.visibleRange} />
              )}
            </Index>
          </ArkDatePicker.TableRow>
        )}
      </Index>
    </ArkDatePicker.TableBody>
  </ArkDatePicker.Table>
);

const DayCell = (props: { ctx: Ctx; api: Api; day: DateValue; visibleRange?: VisibleRange }) => {
  const state = createMemo(() =>
    props.api().getDayTableCellState({ value: props.day, visibleRange: props.visibleRange }),
  );

  /** Range band piece: from the start circle's center to the end circle's center. */
  const band = createMemo((): { kind?: 'start' | 'middle' | 'end'; preview?: boolean } => {
    const s = state();
    if (!props.ctx.range() || s.outsideRange) return {};
    const complete = props.ctx.pending().filter(Boolean).length === 2;
    const [first, last, within] = complete
      ? [s.firstInRange, s.lastInRange, s.inRange]
      : [s.firstInHoveredRange, s.lastInHoveredRange, s.inHoveredRange];
    if (!within && !first && !last) return {};
    if (first && last) return {};
    return { kind: first ? 'start' : last ? 'end' : 'middle', preview: !complete };
  });

  return (
    <ArkDatePicker.TableCell
      class={styles.cell}
      value={props.day}
      visibleRange={props.visibleRange}
      data-range={band().kind}
      data-preview={band().preview ? '' : undefined}
      data-outside={state().outsideRange ? '' : undefined}
    >
      <ArkDatePicker.TableCellTrigger class={styles.day}>
        <Ripple />
        <span class={styles.dayLabel}>{formatNumber(props.day.day, props.ctx.locale())}</span>
      </ArkDatePicker.TableCellTrigger>
    </ArkDatePicker.TableCell>
  );
};

// ---- Month/year menus (docked lists) and the modal year grid ----

type Option = { value: number; label: string; disabled?: boolean };

const OptionGrid = (props: {
  kind: 'list' | 'grid';
  label: string;
  columns: number;
  options: Option[];
  selected: number;
  onSelect: (value: number) => void;
}) => {
  const [active, setActive] = createSignal(untrack(() => props.selected));
  let el!: HTMLDivElement;

  const node = () => el.querySelector<HTMLElement>(`[data-value="${active()}"]`);

  /** Scrolls inside the list only, never the page. */
  const reveal = (center: boolean) => {
    const n = node();
    if (!n) return;
    const top = n.offsetTop;
    const bottom = top + n.offsetHeight;
    if (center) el.scrollTop = top - (el.clientHeight - n.offsetHeight) / 2;
    else if (top < el.scrollTop) el.scrollTop = top;
    else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight;
  };

  const focusActive = (center = false) => {
    reveal(center);
    node()?.focus({ preventScroll: true });
  };

  onMount(() => requestAnimationFrame(() => focusActive(true)));

  const moveTo = (index: number) => {
    const clamped = Math.min(props.options.length - 1, Math.max(0, index));
    setActive(props.options[clamped].value);
    focusActive();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const index = props.options.findIndex((o) => o.value === active());
    const rtl = getComputedStyle(el).direction === 'rtl';
    const step = rtl ? -1 : 1;
    switch (e.key) {
      case 'ArrowDown':
        moveTo(index + props.columns);
        break;
      case 'ArrowUp':
        moveTo(index - props.columns);
        break;
      case 'ArrowRight':
        if (props.columns === 1) return;
        moveTo(index + step);
        break;
      case 'ArrowLeft':
        if (props.columns === 1) return;
        moveTo(index - step);
        break;
      case 'Home':
        moveTo(0);
        break;
      case 'End':
        moveTo(props.options.length - 1);
        break;
      case 'Enter':
      case ' ': {
        const option = props.options[index];
        if (option && !option.disabled) props.onSelect(option.value);
        break;
      }
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={el}
      role="listbox"
      aria-label={props.label}
      class={props.kind === 'list' ? styles.menuList : styles.yearGrid}
      onKeyDown={onKeyDown}
    >
      <For each={props.options}>
        {(option) => (
          <div
            role="option"
            data-value={option.value}
            class={cx(props.kind === 'list' ? styles.menuItem : styles.year)}
            aria-selected={option.value === props.selected}
            aria-disabled={option.disabled ? 'true' : undefined}
            tabIndex={option.value === active() ? 0 : -1}
            onFocus={() => setActive(option.value)}
            onClick={() => !option.disabled && props.onSelect(option.value)}
          >
            <Ripple />
            <Show when={props.kind === 'list' && option.value === props.selected}>
              <Icon class={styles.check} name="check" />
            </Show>
            <span class={styles.optionLabel}>{option.label}</span>
          </div>
        )}
      </For>
    </div>
  );
};
