import { createSignal, For, type Component } from 'solid-js';
import { FabMenu, FabMenuItem, type FabSize } from '../../components/ui/buttons';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'fab-menu', name: 'FAB menu' };

const SIZES: FabSize[] = ['fab', 'medium', 'large'];
const COLORS = ['primary-container', 'secondary', 'tertiary-container'] as const;

const FabMenuDemo: Component = () => {
  const [log, setLog] = createSignal('none');
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Sizes and color sets (primary, secondary, tertiary). The menu opens above the FAB. Last action: {log()}
      </p>
      <div class={g.row} style={{ 'align-items': 'flex-end', 'min-block-size': '360px' }}>
        <For each={SIZES}>
          {(size, i) => (
            <FabMenu size={size} color={COLORS[i()]} icon="add" label={`Create options (${size})`}>
              <FabMenuItem icon="link" label="Link" onClick={() => setLog('link')} />
              <FabMenuItem icon="create_new_folder" label="Directory" onClick={() => setLog('directory')} />
              <FabMenuItem icon="content_paste" label="Paste from clipboard" onClick={() => setLog('paste')} />
            </FabMenu>
          )}
        </For>
      </div>
    </div>
  );
};

export default FabMenuDemo;
