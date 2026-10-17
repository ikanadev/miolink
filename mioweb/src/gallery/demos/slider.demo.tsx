import { createSignal, For, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons';
import { Slider, type SliderSize } from '../../components/ui/slider';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'slider', name: 'Slider' };

const SIZES: { size: SliderSize; name: string }[] = [
  { size: 'xsmall', name: 'XS' },
  { size: 'small', name: 'S' },
  { size: 'medium', name: 'M' },
  { size: 'large', name: 'L' },
  { size: 'xlarge', name: 'XL' },
];

const column = { display: 'grid', gap: '8px', 'max-inline-size': '480px' } as const;

const SliderDemo: Component = () => {
  const [volume, setVolume] = createSignal([40]);
  const [price, setPrice] = createSignal([20, 80]);
  const [exposure, setExposure] = createSignal([0]);
  const [submitted, setSubmitted] = createSignal('');

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>Standard (controlled, labeled): {volume()[0]}</p>
      <div style={column}>
        <Slider label="Volume" labeled value={volume()} onValueChange={setVolume} />
      </div>

      <p class={g.label}>Standard with stops (step 10) and value indicator</p>
      <div style={column}>
        <Slider label="Brightness" step={10} stops labeled defaultValue={[30]} />
      </div>

      <p class={g.label}>Centered (−5 to 5 EV, formatted value): {exposure()[0]} EV</p>
      <div style={column}>
        <Slider
          label="Exposure"
          variant="centered"
          min={-5}
          max={5}
          step={0.5}
          labeled
          value={exposure()}
          onValueChange={setExposure}
          valueLabel={(v) => `${v > 0 ? '+' : ''}${v}`}
        />
        <Slider label="Balance" variant="centered" min={-10} max={10} step={2} stops defaultValue={[-4]} labeled />
      </div>

      <p class={g.label}>
        Range (two handles, can't cross): ${price()[0]}–${price()[1]}
      </p>
      <div style={column}>
        <Slider
          label="Price"
          variant="range"
          labeled
          value={price()}
          onValueChange={setPrice}
          valueLabel={(v) => `$${v}`}
        />
        <Slider label="Hours" variant="range" min={0} max={24} step={2} stops labeled defaultValue={[8, 18]} />
      </div>

      <p class={g.label}>Sizes XS–XL (S–XL with stops; M–XL with an inset icon that moves past the handle when there's no room)</p>
      <div style={column}>
        <For each={SIZES}>
          {(s) => <Slider label={`Size ${s.name}`} size={s.size} defaultValue={[60]} icon="volume_up" iconMin="volume_off" />}
        </For>
        <Slider label="Medium, low value" size="medium" defaultValue={[8]} icon="light_mode" />
        <Slider label="Large with stops" size="large" step={20} stops defaultValue={[40]} labeled />
      </div>

      <p class={g.label}>Vertical (minimum at the bottom): XS, M with icon, centered, XL</p>
      <div class={g.row} style={{ gap: '32px', 'padding-inline-start': '64px' }}>
        <Slider label="Vertical XS" orientation="vertical" labeled defaultValue={[30]} />
        <Slider label="Vertical medium" orientation="vertical" size="medium" icon="brightness_6" defaultValue={[70]} />
        <Slider label="Vertical centered" orientation="vertical" variant="centered" step={25} stops min={-100} defaultValue={[50]} labeled />
        <Slider label="Vertical XL" orientation="vertical" size="xlarge" icon="volume_up" defaultValue={[50]} />
      </div>

      <p class={g.label}>Right to left (minimum on the right): standard with stops, centered, range, M with icon</p>
      <div style={column} dir="rtl">
        <Slider label="RTL brightness" step={10} stops labeled defaultValue={[30]} />
        <Slider label="RTL balance" variant="centered" min={-10} max={10} step={2} stops defaultValue={[-4]} labeled />
        <Slider label="RTL hours" variant="range" min={0} max={24} step={2} stops labeled defaultValue={[8, 18]} />
        <Slider label="RTL volume" size="medium" icon="volume_up" iconMin="volume_off" defaultValue={[60]} />
      </div>

      <p class={g.label}>Disabled: standard, stops, centered, range, M with icon</p>
      <div style={column}>
        <Slider label="Disabled" disabled defaultValue={[40]} />
        <Slider label="Disabled with stops" disabled step={10} stops defaultValue={[60]} />
        <Slider label="Disabled centered" disabled variant="centered" min={-10} max={10} defaultValue={[4]} />
        <Slider label="Disabled range" disabled variant="range" defaultValue={[25, 75]} />
        <Slider label="Disabled medium" disabled size="medium" icon="volume_up" defaultValue={[50]} />
      </div>

      <p class={g.label}>Without end stop (no stops)</p>
      <div style={column}>
        <Slider label="No end stop" endStop={false} defaultValue={[50]} />
      </div>

      <p class={g.label}>In a form{submitted() && `: ${submitted()}`}</p>
      <form
        class={g.row}
        style={{ 'align-items': 'center' }}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setSubmitted(`level=${data.get('level')}, span[]=${data.getAll('span[]').join(',')}`);
        }}
      >
        <div style={{ 'inline-size': '240px' }}>
          <Slider label="Level" name="level" defaultValue={[25]} />
        </div>
        <div style={{ 'inline-size': '240px' }}>
          <Slider label="Span" name="span" variant="range" defaultValue={[10, 90]} />
        </div>
        <Button type="submit" color="tonal">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default SliderDemo;
