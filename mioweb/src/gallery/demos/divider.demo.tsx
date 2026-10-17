import { For, type Component } from 'solid-js';
import { Divider, type DividerInset } from '../../components/ui/divider';
import { Icon } from '../../components/ui/icon';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'divider', name: 'Divider' };

const INSETS: { inset: DividerInset; label: string }[] = [
  { inset: 'none', label: 'Full width' },
  { inset: 'start', label: 'Inset (16px start)' },
  { inset: 'middle', label: 'Middle inset (16px both ends)' },
];

const surface = {
  background: 'var(--md-sys-color-surface-container-low)',
  'border-radius': 'var(--md-sys-shape-corner-medium)',
  color: 'var(--md-sys-color-on-surface)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-weight': 'var(--md-sys-typescale-body-medium-weight)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
  'letter-spacing': 'var(--md-sys-typescale-body-medium-tracking)',
  'max-inline-size': '360px',
} as const;

const DividerDemo: Component = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <p class={g.label}>Horizontal: full width, inset, middle inset</p>
    <div style={{ ...surface, 'padding-block': '8px' }}>
      <For each={INSETS}>
        {(item) => (
          <>
            <p style={{ margin: 0, padding: '12px 16px' }}>{item.label}, below:</p>
            <Divider inset={item.inset} />
          </>
        )}
      </For>
      <p style={{ margin: 0, padding: '12px 16px' }}>Content</p>
    </div>

    <p class={g.label}>Inset aligned with content after an icon (inset overridden with style)</p>
    <div style={{ ...surface, 'padding-block': '8px' }}>
      <For each={['Inbox', 'Starred', 'Sent']}>
        {(name, i) => (
          <>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '16px', padding: '12px 16px' }}>
              <Icon name="mail" />
              {name}
            </div>
            {i() < 2 && <Divider inset="start" style={{ '--_inset-start': '56px' }} />}
          </>
        )}
      </For>
    </div>

    <p class={g.label}>Vertical, stretching to the row's height; semantic separator (decorative=false)</p>
    <div style={{ ...surface, display: 'flex', padding: '16px', gap: '16px', 'max-inline-size': '480px' }}>
      <p style={{ margin: 0, flex: 1 }}>Text on one side of the divider.</p>
      <Divider orientation="vertical" decorative={false} />
      <p style={{ margin: 0, flex: 1 }}>Media or other content on the other side.</p>
    </div>

    <p class={g.label}>Vertical with middle inset (16px at the block ends)</p>
    <div style={{ ...surface, display: 'flex', 'block-size': '96px', 'align-items': 'center', 'max-inline-size': '480px' }}>
      <p style={{ margin: 0, flex: 1, 'padding-inline': '16px' }}>Left</p>
      <Divider orientation="vertical" inset="middle" />
      <p style={{ margin: 0, flex: 1, 'padding-inline': '16px' }}>Right</p>
    </div>
  </div>
);

export default DividerDemo;
