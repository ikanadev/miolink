import { createSignal, For, onCleanup, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { CircularProgress, LinearProgress } from '../../components/ui/loading-and-progress';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'progress-indicator', name: 'Progress indicators' };

const STEPS = [0, 0.01, 0.1, 0.3, 0.6, 0.95, 1];

const ProgressIndicatorDemo: Component = () => {
  const [value, setValue] = createSignal(0.3);
  const [running, setRunning] = createSignal(false);
  const step = (delta: number) => setValue((v) => Math.min(1, Math.max(0, Math.round((v + delta) * 100) / 100)));

  // Simulated process: indeterminate for a moment, then determinate to 100%.
  const [simulated, setSimulated] = createSignal<number | undefined>(undefined);
  let timer: number | undefined;
  const simulate = () => {
    clearInterval(timer);
    setRunning(true);
    setSimulated(undefined);
    let ticks = 0;
    timer = window.setInterval(() => {
      ticks += 1;
      if (ticks < 4) return;
      const next = Math.min(1, (simulated() ?? 0) + 0.12);
      setSimulated(next);
      if (next >= 1) {
        clearInterval(timer);
        setRunning(false);
      }
    }, 600);
  };
  onCleanup(() => clearInterval(timer));

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Value: {Math.round(value() * 100)}% (animated with the progress spring)</p>
      <div class={g.row}>
        <IconButton color="outlined" icon="remove" label="Decrease progress" onClick={() => step(-0.1)} />
        <IconButton color="outlined" icon="add" label="Increase progress" onClick={() => step(0.1)} />
        <IconButton
          color="tonal"
          icon="play_arrow"
          label="Run a simulated process"
          disabled={running()}
          onClick={simulate}
        />
      </div>

      <p class={g.label}>Linear: flat and wavy, determinate</p>
      <LinearProgress label="Uploading file" value={value()} />
      <LinearProgress label="Uploading file (wavy)" value={value()} shape="wavy" />
      <p class={g.label}>Linear: indeterminate</p>
      <LinearProgress label="Loading my episodes" />
      <LinearProgress label="Loading my episodes (wavy)" shape="wavy" />
      <p class={g.label}>Linear: 8px thickness, no stop indicator, no track (the stop goes with it)</p>
      <LinearProgress label="Syncing (thick)" value={value()} thickness={8} />
      <LinearProgress label="Syncing (thick, wavy)" value={value()} thickness={8} shape="wavy" />
      <LinearProgress label="Syncing (no stop indicator)" value={value()} stopIndicator={false} />
      <LinearProgress label="Syncing (no track)" track={false} />
      <LinearProgress label="Syncing (no track, determinate)" value={value()} track={false} />
      <p class={g.label}>Linear: indeterminate, then determinate</p>
      <LinearProgress label="Downloading update" value={simulated()} shape="wavy" />

      <p class={g.label}>Circular: flat and wavy, determinate</p>
      <div class={g.row}>
        <CircularProgress label="Uploading file" value={value()} />
        <CircularProgress label="Uploading file (wavy)" value={value()} shape="wavy" />
        <CircularProgress label="Uploading file (thick)" value={value()} thickness={8} size={52} />
        <CircularProgress label="Uploading file (96px, wavy)" value={value()} shape="wavy" size={96} />
      </div>
      <p class={g.label}>Circular: indeterminate</p>
      <div class={g.row}>
        <CircularProgress label="Refreshing page" />
        <CircularProgress label="Refreshing page (wavy)" shape="wavy" />
        <CircularProgress label="Refreshing page (24px)" size={24} />
        <CircularProgress label="Refreshing page (96px, wavy)" shape="wavy" size={96} />
        <CircularProgress label="Downloading update" value={simulated()} shape="wavy" />
      </div>
      <p class={g.label}>Inside a button: the label color, flat, no track, decorative (the button says it's busy)</p>
      <div class={g.row}>
        <Button aria-busy="true">
          <span style={{ display: 'inline-flex', 'align-items': 'center', gap: '8px' }}>
            <CircularProgress size={24} color="current" track={false} />
            Refreshing
          </span>
        </Button>
        <Button color="tonal" aria-busy={running()} onClick={simulate}>
          <span style={{ display: 'inline-flex', 'align-items': 'center', gap: '8px' }}>
            <CircularProgress size={24} value={simulated()} color="current" track={false} />
            Download
          </span>
        </Button>
      </div>

      <p class={g.label}>Low and complete values: nothing at 0, a dot as soon as it starts</p>
      <For each={STEPS}>{(v) => <LinearProgress label={`Progress ${v * 100}%`} value={v} />}</For>
      <div class={g.row}>
        <For each={STEPS}>{(v) => <CircularProgress label={`Progress ${v * 100}%`} value={v} />}</For>
      </div>
    </div>
  );
};

export default ProgressIndicatorDemo;
