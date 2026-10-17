import { For, type Component } from 'solid-js';
import {
  IconButton,
  type ButtonSize,
  type IconButtonColor,
  type IconButtonWidth,
} from '../../components/ui/buttons';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'icon-button', name: 'Icon button' };

const COLORS: IconButtonColor[] = ['filled', 'tonal', 'outlined', 'standard'];
const SIZES: ButtonSize[] = ['xsmall', 'small', 'medium', 'large', 'xlarge'];
const WIDTHS: IconButtonWidth[] = ['narrow', 'default', 'wide'];

const IconButtonDemo: Component = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <p class={g.label}>Default, toggle (round and square), disabled</p>
    <For each={COLORS}>
      {(color) => (
        <div class={g.row}>
          <IconButton color={color} icon="settings" label="Settings" />
          <IconButton color={color} icon="favorite" label="Favorite" toggle />
          <IconButton color={color} icon="favorite" label="Favorite" toggle defaultSelected />
          <IconButton color={color} icon="bookmark" label="Bookmark" toggle shape="square" />
          <IconButton color={color} icon="bookmark" label="Bookmark" toggle shape="square" defaultSelected />
          <IconButton color={color} icon="delete" label="Delete" disabled />
          <IconButton color={color} icon="favorite" label="Favorite" toggle defaultSelected disabled />
        </div>
      )}
    </For>
    <p class={g.label}>Sizes</p>
    <div class={g.row}>
      <For each={SIZES}>{(size) => <IconButton size={size} icon="edit" label={`Edit (${size})`} />}</For>
    </div>
    <p class={g.label}>Widths</p>
    <div class={g.row}>
      <For each={WIDTHS}>
        {(width) => <IconButton color="tonal" width={width} icon="add" label={`Add (${width})`} />}
      </For>
    </div>
    <p class={g.label}>Built-in tooltip, link</p>
    <div class={g.row}>
      <IconButton color="standard" icon="share" label="Share" tooltip />
      <IconButton color="tonal" icon="bookmark" label="Bookmark" toggle tooltip />
      <IconButton color="outlined" icon="open_in_new" label="Open the icon button spec" tooltip
        href="https://m3.material.io/components/icon-buttons" target="_blank" rel="noopener" />
    </div>
  </div>
);

export default IconButtonDemo;
