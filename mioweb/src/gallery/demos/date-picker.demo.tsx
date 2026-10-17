import { createSignal, For, type Component, type JSX } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { DatePicker, type DatePickerProps } from '../../components/ui/date-picker';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'date-picker', name: 'Date picker' };

const grid: JSX.CSSProperties = {
  display: 'grid',
  gap: '24px',
  'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
  'align-items': 'start',
};

const pad = (n: number) => String(n).padStart(2, '0');
const isoOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const today = isoOffset(0);

const isWeekend = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return day === 0 || day === 6;
};

/** A picker with its committed value printed under it. */
const Example: Component<DatePickerProps & { title: string }> = (props) => {
  const [value, setValue] = createSignal<string[]>(props.defaultValue ?? []);
  return (
    // Range fields sit side by side: give them a full row.
    <div style={{ display: 'grid', gap: '8px', 'grid-column': props.range ? '1 / -1' : undefined }}>
      <p class={g.label}>{props.title}</p>
      <DatePicker
        {...props}
        style={props.range ? { 'max-inline-size': '560px' } : undefined}
        value={value()}
        onValueChange={setValue}
      />
      <span class={g.label}>Value: {JSON.stringify(value())}</span>
    </div>
  );
};

const LOCALES = [
  { locale: 'en-US', title: 'en-US (Sunday, MM/DD/YYYY)' },
  { locale: 'de-DE', title: 'de-DE (Monday, DD.MM.YYYY)' },
  { locale: 'ja-JP', title: 'ja-JP (YYYY/MM/DD)' },
  { locale: 'ar-EG', title: 'ar-EG (Saturday, Arabic names and digits)' },
];

/** Modal without a field: the app opens it (e.g. from a button or a chip). */
const ButtonLaunched: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [value, setValue] = createSignal<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <p class={g.label}>Modal, launched by a button (no field)</p>
      <div class={g.row}>
        <Button color="tonal" icon="event" onClick={() => setOpen(true)}>
          Pick a date
        </Button>
        <span class={g.label}>Value: {JSON.stringify(value())}</span>
      </div>
      <DatePicker
        variant="modal"
        field={false}
        open={open()}
        onOpenChange={setOpen}
        value={value()}
        onValueChange={setValue}
        clearable
      />
    </div>
  );
};

const DatePickerDemo: Component = () => (
  <div style={{ display: 'grid', gap: '32px' }}>
    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Docked: type a date (lenient: 8/7/26, 08-07-2026, 08072026) or open the calendar; month and year
        menus, Shift+M / Shift+Y, Enter on a date commits
      </p>
      <div style={grid}>
        <Example title="Single" label="Event date" />
        <Example title="Selected, clearable" label="Due date" defaultValue={[isoOffset(3)]} clearable />
        <Example
          title="Min/max (±30 days), weekends unavailable"
          label="Delivery"
          min={isoOffset(-30)}
          max={isoOffset(30)}
          isDateUnavailable={isWeekend}
          helperText="Weekdays in the next or past 30 days"
        />
        <Example title="Range" range defaultValue={[today, isoOffset(4)]} />
        <Example title="Hide outside days" label="Date" showOutsideDays={false} />
        <Example title="Error" label="Start" errorText="This slot is taken" defaultValue={[today]} />
        <Example title="Disabled" label="Date" disabled defaultValue={[today]} />
        <Example title="Read-only" label="Date" readOnly defaultValue={[today]} />
      </div>
    </section>

    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Modal: calendar in a dialog; the edit icon switches to text input</p>
      <div style={grid}>
        <Example title="Modal" variant="modal" label="Appointment" />
        <Example
          title="Modal date input (date of birth, max today)"
          variant="modal-input"
          label="Date of birth"
          max={today}
        />
        <Example
          title="Modal range (full screen below 600px)"
          variant="modal"
          range
          defaultValue={[isoOffset(7), isoOffset(10)]}
          min={today}
        />
        <Example
          title="Modal range, no limits (scrolls both ways)"
          variant="modal"
          range
        />
        <Example title="Modal input range" variant="modal-input" range />
        <ButtonLaunched />
      </div>
    </section>

    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Locales: names, numerals, typed format and week start</p>
      <div style={grid}>
        <For each={LOCALES}>
          {(item) => <Example title={item.title} locale={item.locale} defaultValue={[today]} />}
        </For>
        <Example title="en-US, week starts Monday (override)" locale="en-US" startOfWeek={1} />
      </div>
    </section>

    <form
      style={{ display: 'grid', gap: '16px', 'max-inline-size': '480px' }}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(JSON.stringify(Object.fromEntries(data.entries())));
      }}
    >
      <p class={g.label}>Form participation (hidden ISO inputs)</p>
      <DatePicker name="trip" range variant="docked" />
      <DatePicker name="birthday" variant="modal-input" label="Birthday" />
      <div class={g.row}>
        <Button type="submit" color="filled">
          Submit
        </Button>
      </div>
    </form>
  </div>
);

export default DatePickerDemo;
