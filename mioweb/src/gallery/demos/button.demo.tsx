import { createSignal, For, type Component } from 'solid-js';
import { Button, type ButtonColor, type ButtonSize } from '../../components/ui/buttons';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'button', name: 'Button' };

const COLORS: ButtonColor[] = ['elevated', 'filled', 'tonal', 'outlined', 'text'];
const TOGGLE_COLORS = ['elevated', 'filled', 'tonal', 'outlined'] as const;
const SIZES: ButtonSize[] = ['xsmall', 'small', 'medium', 'large', 'xlarge'];

const ButtonDemo: Component = () => {
  const [saved, setSaved] = createSignal(false);
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Default: label, leading icon, square, disabled</p>
      <For each={COLORS}>
        {(color) => (
          <div class={g.row}>
            <Button color={color}>Label</Button>
            <Button color={color} icon="add">
              New link
            </Button>
            <Button color={color} shape="square">
              Square
            </Button>
            <Button color={color} disabled>
              Disabled
            </Button>
            <Button color={color} icon="add" disabled>
              Disabled
            </Button>
          </div>
        )}
      </For>
      <p class={g.label}>Toggle: unselected, selected (round and square), disabled</p>
      <For each={TOGGLE_COLORS}>
        {(color) => (
          <div class={g.row}>
            <Button color={color} icon="favorite" toggle>
              Favorite
            </Button>
            <Button color={color} icon="favorite" toggle defaultSelected>
              Favorite
            </Button>
            <Button color={color} icon="bookmark" toggle shape="square">
              Bookmark
            </Button>
            <Button color={color} icon="bookmark" toggle shape="square" defaultSelected>
              Bookmark
            </Button>
            <Button color={color} icon="favorite" toggle disabled>
              Favorite
            </Button>
            <Button color={color} icon="favorite" toggle defaultSelected disabled>
              Favorite
            </Button>
          </div>
        )}
      </For>
      <p class={g.label}>Toggle with a selected label (no aria-pressed), controlled</p>
      <div class={g.row}>
        <Button
          color="tonal"
          icon="bookmark_add"
          selectedIcon="bookmark_added"
          toggle
          selected={saved()}
          onSelectedChange={setSaved}
          selectedLabel="Saved"
        >
          Save
        </Button>
      </div>
      <p class={g.label}>Sizes (round, outlined square, outlined round)</p>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <Button size={size} icon="edit">
              Edit
            </Button>
          )}
        </For>
      </div>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <Button size={size} color="outlined" shape="square" icon="edit">
              Edit
            </Button>
          )}
        </For>
      </div>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <Button size={size} color="outlined" icon="edit">
              Edit
            </Button>
          )}
        </For>
      </div>
      <p class={g.label}>Selected toggles per size (round, square becoming a pill)</p>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <Button size={size} icon="favorite" toggle defaultSelected>
              Saved
            </Button>
          )}
        </For>
      </div>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <Button size={size} color="tonal" icon="bookmark" toggle shape="square" defaultSelected>
              Saved
            </Button>
          )}
        </For>
      </div>
      <p class={g.label}>Selected weight for a glyph without a filled version (600)</p>
      <div class={g.row}>
        <Button color="outlined" icon="check" toggle selectedWeight={600}>
          Done
        </Button>
      </div>
      <p class={g.label}>Small padding: default 16px, legacy 24px (not recommended)</p>
      <div class={g.row}>
        <Button color="tonal">Default padding</Button>
        <Button color="tonal" padding="wide">
          Legacy padding
        </Button>
      </div>
      <p class={g.label}>Link, full width</p>
      <div class={g.row}>
        <Button color="text" href="https://m3.material.io/components/buttons" target="_blank" rel="noopener">
          Open spec
        </Button>
        <Button color="text" href="https://m3.material.io" disabled>
          Disabled link
        </Button>
      </div>
      <Button color="tonal" fullWidth icon="send" mirror>
        Send
      </Button>
    </div>
  );
};

export default ButtonDemo;
