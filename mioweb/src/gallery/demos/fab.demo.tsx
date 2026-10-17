import { createSignal, For, type Component } from 'solid-js';
import { Fab, type FabColor, type FabSize } from '../../components/ui/buttons/fab';
import { IconButton } from '../../components/ui/buttons/icon-button';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'fab', name: 'FAB' };

const SIZES: FabSize[] = ['fab', 'medium', 'large'];
const COLORS: FabColor[] = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
];

const FabDemo: Component = () => {
  const [visible, setVisible] = createSignal(true);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Sizes (FAB, medium, large)</p>
      <div class={g.row}>
        <For each={SIZES}>{(size) => <Fab size={size} icon="edit" label={`Compose (${size})`} />}</For>
      </div>
      <p class={g.label}>Color styles</p>
      <For each={COLORS}>
        {(color) => (
          <div class={g.row}>
            <For each={SIZES}>{(size) => <Fab size={size} color={color} icon="add" label={`Create (${color})`} />}</For>
          </div>
        )}
      </For>
      <p class={g.label}>Surface (baseline, not recommended): default and lowered</p>
      <div class={g.row}>
        <Fab color="surface" icon="add" label="Create (surface)" />
        <Fab color="surface" lowered icon="add" label="Create (surface, lowered)" />
      </div>
      <p class={g.label}>Link, no tooltip</p>
      <div class={g.row}>
        <Fab href="#fab" size="medium" icon="link" label="Jump to the FAB section" />
        <Fab size="medium" color="tertiary" icon="navigation" label="Navigate" tooltip={false} />
      </div>
      <p class={g.label}>Enter / exit (scale from center)</p>
      <div class={g.row}>
        <IconButton
          color="outlined"
          icon={visible() ? 'visibility_off' : 'visibility'}
          label={visible() ? 'Hide FAB' : 'Show FAB'}
          onClick={() => setVisible((v) => !v)}
        />
        <Fab size="medium" visible={visible()} icon="add" label="Add link" />
      </div>
    </div>
  );
};

export default FabDemo;
