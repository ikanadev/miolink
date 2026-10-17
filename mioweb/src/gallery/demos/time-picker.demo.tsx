import { createSignal, For, type Component, type JSX } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { TimePicker, type TimePickerProps } from '../../components/ui/time-picker';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'time-picker', name: 'Time picker' };

const grid: JSX.CSSProperties = {
  display: 'grid',
  gap: '24px',
  'grid-template-columns': 'repeat(auto-fill, minmax(260px, 1fr))',
  'align-items': 'start',
};

/** A picker with its committed value printed under it. */
const Example: Component<TimePickerProps & { title: string }> = (props) => {
  const [value, setValue] = createSignal(props.defaultValue ?? '');
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <p class={g.label}>{props.title}</p>
      <TimePicker {...props} value={value()} onValueChange={setValue} />
      <span class={g.label}>Value: {JSON.stringify(value())}</span>
    </div>
  );
};

/** No field: the app opens the dialog (e.g. from a button). */
const ButtonLaunched: Component<{ title: string } & Pick<TimePickerProps, 'orientation' | 'variant' | 'hourCycle'>> = (
  props,
) => {
  const [open, setOpen] = createSignal(false);
  const [value, setValue] = createSignal('');
  const [live, setLive] = createSignal('');
  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      <p class={g.label}>{props.title}</p>
      <div class={g.row}>
        <Button color="tonal" icon="alarm" onClick={() => setOpen(true)}>
          Set alarm
        </Button>
        <span class={g.label}>
          Value: {JSON.stringify(value())}
          {open() ? ` (pending ${live()})` : ''}
        </span>
      </div>
      <TimePicker
        field={false}
        orientation={props.orientation}
        variant={props.variant}
        hourCycle={props.hourCycle}
        open={open()}
        onOpenChange={setOpen}
        value={value()}
        onValueChange={setValue}
        onPendingChange={setLive}
      />
    </div>
  );
};

const LOCALES = [
  { locale: 'en-US', title: 'en-US (12h, AM/PM)' },
  { locale: 'de-DE', title: 'de-DE (24h, two rings)' },
  { locale: 'ko-KR', title: 'ko-KR (12h, 오전/오후)' },
  { locale: 'ar-EG', title: 'ar-EG (Arabic digits, ص/م)' },
];

const TimePickerDemo: Component = () => (
  <div style={{ display: 'grid', gap: '32px' }}>
    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Field + dialog: type a time (lenient: 7:30 pm, 1930, 19.30) or open the dial with the clock button.
        Drag or tap the dial; picking an hour advances to minutes. Arrow Up/Down and digits on the hour and
        minute boxes; arrows around the dial, Enter selects.
      </p>
      <div style={grid}>
        <Example title="Dial (orientation auto)" label="Start time" />
        <Example title="Selected" label="Meeting" defaultValue="14:45" />
        <Example title="Input variant" label="Reminder" variant="input" defaultValue="08:05" />
        <Example title="24h (hourCycle h23)" label="Departure" hourCycle="h23" defaultValue="21:10" />
        <Example title="12h forced (hourCycle h12)" label="Pickup" hourCycle="h12" defaultValue="06:30" />
        <Example title="5-minute step" label="Slot" minuteStep={5} defaultValue="10:15" />
        <Example
          title="Min/max 09:00–17:30 (out of range at 38%)"
          label="Office hours"
          min="09:00"
          max="17:30"
          defaultValue="12:00"
          helperText="Between 9:00 AM and 5:30 PM"
        />
        <Example title="Error" label="Check-in" errorText="Fully booked" defaultValue="15:00" />
        <Example title="Disabled" label="Time" disabled defaultValue="09:00" />
        <Example title="Read-only" label="Time" readOnly defaultValue="09:00" />
      </div>
    </section>

    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Layouts, launched by a button (no field)</p>
      <div style={grid}>
        <ButtonLaunched title="Vertical dial" orientation="vertical" />
        <ButtonLaunched title="Horizontal dial" orientation="horizontal" />
        <ButtonLaunched title="Horizontal dial, 24h" orientation="horizontal" hourCycle="h23" />
        <ButtonLaunched title="Input picker" variant="input" />
      </div>
    </section>

    <section style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Locales: hour cycle, AM/PM labels and digits</p>
      <div style={grid}>
        <For each={LOCALES}>
          {(item) => <Example title={item.title} locale={item.locale} defaultValue="16:20" />}
        </For>
      </div>
    </section>

    <form
      style={{ display: 'grid', gap: '16px', 'max-inline-size': '320px' }}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(JSON.stringify(Object.fromEntries(data.entries())));
      }}
    >
      <p class={g.label}>Form participation (hidden HH:mm input)</p>
      <TimePicker name="alarm" label="Alarm" defaultValue="07:00" />
      <div class={g.row}>
        <Button type="submit" color="filled">
          Submit
        </Button>
      </div>
    </form>
  </div>
);

export default TimePickerDemo;
