import { createSignal, For, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { LoadingIndicator } from '../../components/ui/loading-and-progress/loading-indicator';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'loading-indicator', name: 'Loading indicator' };

const SIZES = [24, 48, 96, 160];

const LoadingIndicatorDemo: Component = () => {
  const [paused, setPaused] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Default (uncontained) and contained, 48px</p>
      <div class={g.row}>
        <LoadingIndicator label="Loading news article" paused={paused()} />
        <LoadingIndicator label="Refreshing page" contained paused={paused()} />
        <Button color="outlined" icon={paused() ? 'play_arrow' : 'pause'} onClick={() => setPaused((p) => !p)}>
          {paused() ? 'Resume' : 'Pause'}
        </Button>
      </div>
      <p class={g.label}>Sizes (24-240px; the shape is 38/48 of the box)</p>
      <div class={g.row}>
        <For each={SIZES}>{(size) => <LoadingIndicator label={`Loading (${size}px)`} size={size} />}</For>
      </div>
      <div class={g.row}>
        <For each={SIZES}>{(size) => <LoadingIndicator label={`Loading (${size}px, contained)`} size={size} contained />}</For>
      </div>
      <p class={g.label}>Inside a button: the label color, 24px</p>
      <div class={g.row}>
        <Button aria-busy="true">
          <span style={{ display: 'inline-flex', 'align-items': 'center', gap: '8px' }}>
            <LoadingIndicator
              size={24}
              style={{ '--_color': 'currentColor' }}
            />
            Saving
          </span>
        </Button>
      </div>
    </div>
  );
};

export default LoadingIndicatorDemo;
