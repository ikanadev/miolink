import { createSignal, For, type Component } from 'solid-js';
import { Button, ButtonGroup, IconButton, type ButtonSize } from '../../components/ui/buttons';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'button-group', name: 'Button group' };

const SIZES: ButtonSize[] = ['xsmall', 'small', 'medium', 'large', 'xlarge'];

const ButtonGroupDemo: Component = () => {
  const [view, setView] = createSignal(['grid']);
  const [filters, setFilters] = createSignal<string[]>(['links']);
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Standard, actions (press one: it grows and its neighbours give up padding, labels stay whole; arrow keys move focus)</p>
      <div class={g.row}>
        <ButtonGroup label="Playback">
          <IconButton color="tonal" icon="skip_previous" label="Previous" />
          <IconButton color="filled" icon="play_arrow" label="Play" width="wide" />
          <IconButton color="tonal" icon="skip_next" label="Next" />
        </ButtonGroup>
        <ButtonGroup label="Edit">
          <Button color="tonal" icon="content_cut">
            Cut
          </Button>
          <Button color="tonal" icon="content_copy">
            Copy
          </Button>
          <Button color="filled" icon="content_paste">
            Paste
          </Button>
        </ButtonGroup>
      </div>
      <p class={g.label}>Standard sizes</p>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <ButtonGroup size={size} label={`Formatting (${size})`}>
              <Button color="tonal">Bold</Button>
              <Button color="filled">Italic</Button>
              <Button color="tonal">Underline</Button>
            </ButtonGroup>
          )}
        </For>
      </div>
      <p class={g.label}>Standard, multi-select toggles, square (each a tab stop; arrow keys, Home, End move focus)</p>
      <div class={g.row}>
        <ButtonGroup selection="multi" shape="square" label="Text style">
          <IconButton color="tonal" value="bold" icon="format_bold" label="Bold" />
          <IconButton color="tonal" value="italic" icon="format_italic" label="Italic" />
          <IconButton color="tonal" value="underline" icon="format_underlined" label="Underline" />
        </ButtonGroup>
      </div>
      <p class={g.label}>Connected, single-select, required (view: {view().join(', ')})</p>
      <ButtonGroup
        variant="connected"
        selection="single"
        required
        value={view()}
        onValueChange={setView}
        label="View"
      >
        <Button color="tonal" value="list" icon="view_list">
          List
        </Button>
        <Button color="tonal" value="grid" icon="grid_view">
          Grid
        </Button>
        <Button color="tonal" value="tree" icon="account_tree">
          Tree
        </Button>
      </ButtonGroup>
      <p class={g.label}>Connected, multi-select, square, one disabled (filters: {filters().join(', ') || 'none'})</p>
      <ButtonGroup
        variant="connected"
        selection="multi"
        shape="square"
        value={filters()}
        onValueChange={setFilters}
        label="Filters"
      >
        <Button color="outlined" value="links">
          Links
        </Button>
        <Button color="outlined" value="folders">
          Folders
        </Button>
        <Button color="outlined" value="recent">
          Recent
        </Button>
        <Button color="outlined" value="shared" disabled>
          Shared
        </Button>
      </ButtonGroup>
      <p class={g.label}>Connected sizes (icon buttons)</p>
      <For each={SIZES}>
        {(size) => (
          <ButtonGroup variant="connected" size={size} selection="single" defaultValue={['day']} label={`Range (${size})`}>
            <IconButton color="filled" value="day" icon="calendar_view_day" label="Day" />
            <IconButton color="filled" value="week" icon="calendar_view_week" label="Week" />
            <IconButton color="filled" value="month" icon="calendar_view_month" label="Month" />
          </ButtonGroup>
        )}
      </For>
    </div>
  );
};

export default ButtonGroupDemo;
