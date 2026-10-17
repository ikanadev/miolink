import { createSignal, For, Index, type Component } from 'solid-js';
import {
  createExtendedOnScroll,
  ExtendedFab,
  type ExtendedFabColor,
  type ExtendedFabSize,
} from '../../components/ui/buttons/extended-fab';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'extended-fab', name: 'Extended FAB' };

const COLORS: ExtendedFabColor[] = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
];
const SIZES: ExtendedFabSize[] = ['small', 'medium', 'large'];

const ExtendedFabDemo: Component = () => {
  const [extended, setExtended] = createSignal(true);
  const [scroller, setScroller] = createSignal<HTMLElement>();
  const scrollExtended = createExtendedOnScroll({ target: scroller });

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Sizes, with and without icon</p>
      <div class={g.row}>
        <For each={SIZES}>{(size) => <ExtendedFab size={size} icon="edit" label="Compose" />}</For>
      </div>
      <div class={g.row}>
        <For each={SIZES}>{(size) => <ExtendedFab size={size} label="Compose" />}</For>
      </div>
      <p class={g.label}>Colors</p>
      <div class={g.row}>
        <For each={COLORS}>{(color) => <ExtendedFab color={color} icon="add" label="New task" />}</For>
      </div>
      <p class={g.label}>Collapse to FAB (click a FAB to toggle)</p>
      <div class={g.row}>
        <Index each={SIZES}>
          {(size) => (
            <ExtendedFab
              size={size()}
              icon="add"
              label="New link"
              extended={extended()}
              onClick={() => setExtended((v) => !v)}
            />
          )}
        </Index>
      </div>
      <p class={g.label}>Collapse on scroll down, expand on scroll up</p>
      <div ref={setScroller} class={g.frame}>
        <div class={g.filler}>
          <For each={Array.from({ length: 12 })}>{() => <div />}</For>
        </div>
        <div
          style={{
            position: 'sticky',
            bottom: '16px',
            display: 'flex',
            'justify-content': 'flex-end',
            'padding-inline': '16px',
          }}
        >
          <ExtendedFab size="medium" icon="add" label="New link" extended={scrollExtended()} />
        </div>
      </div>
      <p class={g.label}>Link (href), right-to-left</p>
      <div class={g.row}>
        <ExtendedFab href="#extended-fab" icon="arrow_upward" label="Back to top" />
        <div dir="rtl">
          <ExtendedFab icon="send" mirror label="إرسال" />
        </div>
      </div>
      <p class={g.label}>Baseline (not recommended): primary container with and without icon, surface, branded, lowered</p>
      <div class={g.row}>
        <ExtendedFab size="baseline" icon="edit" label="Compose" />
        <ExtendedFab size="baseline" label="Compose" />
        <ExtendedFab size="baseline" color="surface" icon="edit" label="Compose" />
        <ExtendedFab size="baseline" color="surface" lowered icon="edit" label="Compose" />
        <ExtendedFab size="baseline" color="branded" icon="edit" label="Compose" />
        <ExtendedFab size="baseline" color="branded" lowered icon="edit" label="Compose" />
      </div>
      <p class={g.label}>Surface and branded always use the baseline size, whatever `size` says</p>
      <div class={g.row}>
        <ExtendedFab size="large" color="surface" icon="edit" label="Compose" />
        <ExtendedFab
          color="branded"
          icon="edit"
          label="Compose"
          extended={extended()}
          onClick={() => setExtended((v) => !v)}
        />
      </div>
    </div>
  );
};

export default ExtendedFabDemo;
