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
    <p class={g.label}>Sizes: filled round, outlined, square toggle selected</p>
    <div class={g.row}>
      <For each={SIZES}>{(size) => <IconButton size={size} icon="edit" label={`Edit (${size})`} />}</For>
    </div>
    <div class={g.row}>
      <For each={SIZES}>
        {(size) => <IconButton size={size} color="outlined" icon="edit" label={`Edit outlined (${size})`} />}
      </For>
    </div>
    <div class={g.row}>
      <For each={SIZES}>
        {(size) => (
          <IconButton size={size} shape="square" icon="bookmark" label={`Bookmark (${size})`} toggle />
        )}
      </For>
    </div>
    <p class={g.label}>Widths per size: narrow, default, wide</p>
    <For each={SIZES}>
      {(size) => (
        <div class={g.row}>
          <For each={WIDTHS}>
            {(width) => (
              <IconButton color="tonal" size={size} width={width} icon="add" label={`Add (${size}, ${width})`} />
            )}
          </For>
        </div>
      )}
    </For>
    <p class={g.label}>Selected weight for a glyph without a filled version (600)</p>
    <div class={g.row}>
      <IconButton color="standard" icon="check" label="Done" toggle selectedWeight={600} />
      <IconButton color="tonal" icon="check" label="Done" toggle defaultSelected selectedWeight={600} />
    </div>
    <p class={g.label}>Tooltip (on by default, hover or focus), tooltip off, link</p>
    <div class={g.row}>
      <IconButton color="standard" icon="share" label="Share" />
      <IconButton color="tonal" icon="bookmark" label="Bookmark" toggle />
      <IconButton color="standard" icon="block" label="No tooltip" tooltip={false} />
      <IconButton
        color="outlined"
        icon="open_in_new"
        label="Open the icon button spec"
        href="https://m3.material.io/components/icon-buttons"
        target="_blank"
        rel="noopener"
      />
    </div>
  </div>
);

export default IconButtonDemo;
