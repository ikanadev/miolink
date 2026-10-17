import { createSignal, For, Show, type Component, type JSX } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { Checkbox } from '../../components/ui/checkbox';
import { List, ListItem } from '../../components/ui/list';
import {
  SideSheet,
  type SideSheetCloseReason,
  type SideSheetDir,
  type SideSheetSide,
} from '../../components/ui/side-sheet';
import { TextField } from '../../components/ui/text-field';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'side-sheet', name: 'Side sheet' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const text: JSX.CSSProperties = {
  margin: 0,
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-weight': 'var(--md-sys-typescale-body-medium-weight)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
  'letter-spacing': 'var(--md-sys-typescale-body-medium-tracking)',
};

const stack: JSX.CSSProperties = { display: 'grid', gap: '16px', 'align-content': 'start' };

const closed = (reason?: SideSheetCloseReason) => `Closed (${reason ?? 'programmatic'})`;

/** (1) Modal with in-sheet navigation (back), actions and busy save. */
const Filters: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [page, setPage] = createSignal<'filters' | 'sort'>('filters');
  const [sort, setSort] = createSignal('Name');
  const [saving, setSaving] = createSignal(false);
  const [status, setStatus] = createSignal('');

  const save = async () => {
    setSaving(true);
    await wait(1500);
    setSaving(false);
    setOpen(false);
    setStatus(`Saved (sort: ${sort()})`);
  };

  return (
    <div class={g.row}>
      <SideSheet.Root
        open={open()}
        busy={saving()}
        onOpenChange={(o, reason) => {
          setOpen(o);
          if (o) {
            setPage('filters');
            setStatus('');
          } else setStatus(closed(reason));
        }}
      >
        <SideSheet.Trigger asChild={(p) => <Button {...p()} color="filled" icon="filter_list">Filters</Button>} />
        <SideSheet.Content
          headline={page() === 'filters' ? 'Filters' : 'Sort by'}
          onBack={page() === 'sort' ? () => setPage('filters') : undefined}
          flush={page() === 'sort'}
          actions={
            <>
              <Button color="filled" disabled={saving()} onClick={save}>
                {saving() ? 'Saving…' : 'Save'}
              </Button>
              <SideSheet.Close asChild={(p) => <Button {...p()} color="outlined">Cancel</Button>} />
            </>
          }
        >
          <Show
            when={page() === 'filters'}
            fallback={
              <List label="Sort by">
                <For each={['Name', 'Date added', 'Most viewed']}>
                  {(label) => (
                    <ListItem
                      headline={label}
                      trailingIcon={sort() === label ? 'check' : undefined}
                      onClick={() => {
                        setSort(label);
                        setPage('filters');
                      }}
                    />
                  )}
                </For>
              </List>
            }
          >
            <div style={stack}>
              <TextField label="Title contains" disabled={saving()} />
              <Checkbox defaultChecked disabled={saving()}>Include subdirectories</Checkbox>
              <Checkbox disabled={saving()}>Only links with thumbnails</Checkbox>
              <Button color="text" icon="sort" onClick={() => setPage('sort')}>
                Sort: {sort()}
              </Button>
            </div>
          </Show>
        </SideSheet.Content>
      </SideSheet.Root>
      <span class={g.label}>{status()}</span>
    </div>
  );
};

/** (2) Modal options: detached, start side, RTL, width, not dismissible, long headline, no actions. */
const ModalOptions: Component = () => {
  const [detached, setDetached] = createSignal(false);
  const [start, setStart] = createSignal(false);
  const [rtl, setRtl] = createSignal(false);
  const [wide, setWide] = createSignal(false);
  const [dismissible, setDismissible] = createSignal(true);
  const [status, setStatus] = createSignal('');
  const side = (): SideSheetSide => (start() ? 'start' : 'end');
  const dir = (): SideSheetDir | undefined => (rtl() ? 'rtl' : undefined);

  return (
    <div style={stack}>
      <div class={g.row}>
        <Checkbox checked={detached()} onCheckedChange={(c) => setDetached(c === true)}>Detached</Checkbox>
        <Checkbox checked={start()} onCheckedChange={(c) => setStart(c === true)}>Start side</Checkbox>
        <Checkbox checked={rtl()} onCheckedChange={(c) => setRtl(c === true)}>RTL</Checkbox>
        <Checkbox checked={wide()} onCheckedChange={(c) => setWide(c === true)}>400px wide</Checkbox>
        <Checkbox checked={dismissible()} onCheckedChange={(c) => setDismissible(c === true)}>
          Dismissible (scrim, Escape)
        </Checkbox>
      </div>
      <div class={g.row}>
        <SideSheet.Root
          dir={dir()}
          dismissible={dismissible()}
          onOpenChange={(o, reason) => setStatus(o ? '' : closed(reason))}
        >
          <SideSheet.Trigger asChild={(p) => <Button {...p()} color="tonal">Link details</Button>} />
          <SideSheet.Content
            headline="Details for a link with a very long title that doesn't fit"
            side={side()}
            detached={detached()}
            width={wide() ? 400 : undefined}
          >
            <div style={stack}>
              <For each={Array.from({ length: 24 }, (_, i) => i + 1)}>
                {(n) => <p style={text}>Paragraph {n}. The body scrolls on its own; the header stays put.</p>}
              </For>
            </div>
          </SideSheet.Content>
        </SideSheet.Root>
        <span class={g.label}>{status()}</span>
      </div>
    </div>
  );
};

/** (3) Standard: in the layout flow; the main content shrinks while it opens. */
const Standard: Component = () => {
  const [open, setOpen] = createSignal(true);
  const [detached, setDetached] = createSignal(false);
  const [start, setStart] = createSignal(false);
  const [divider, setDivider] = createSignal(true);
  const [selected, setSelected] = createSignal('Recipes');

  const frame: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': start() ? 'row-reverse' : 'row',
    'block-size': '420px',
    overflow: 'hidden',
    border: '1px solid var(--md-sys-color-outline-variant)',
    'border-radius': 'var(--md-sys-shape-corner-medium)',
    background: detached() ? 'var(--md-sys-color-surface-container)' : 'var(--md-sys-color-surface)',
  };

  return (
    <div style={stack}>
      <div class={g.row}>
        <Checkbox checked={detached()} onCheckedChange={(c) => setDetached(c === true)}>Detached</Checkbox>
        <Checkbox checked={start()} onCheckedChange={(c) => setStart(c === true)}>Start side</Checkbox>
        <Checkbox checked={divider()} onCheckedChange={(c) => setDivider(c === true)}>Edge divider</Checkbox>
      </div>
      <div style={frame}>
        <div style={{ flex: '1', 'min-inline-size': '0', padding: '24px', overflow: 'auto', ...stack }}>
          <p style={text}>
            Main content. A standard sheet sits next to it, without a scrim; this area keeps working and shrinks
            as the sheet opens.
          </p>
          <div class={g.row}>
            <Button color="outlined" icon={open() ? 'right_panel_close' : 'right_panel_open'} onClick={() => setOpen(!open())}>
              {open() ? 'Hide' : 'Show'} details
            </Button>
          </div>
          <p style={text}>Selected directory: {selected()}</p>
        </div>
        <SideSheet.Root variant="standard" open={open()} onOpenChange={setOpen} unmountOnExit={false}>
          <SideSheet.Content
            headline="Directories"
            side={start() ? 'start' : 'end'}
            detached={detached()}
            divider={divider()}
            flush
            width={280}
          >
            <List label="Directories">
              <For each={['Recipes', 'Reading list', 'Work', 'Travel', 'Music', 'Videos', 'Tools', 'Archive']}>
                {(name) => (
                  <ListItem
                    leadingIcon="folder"
                    headline={name}
                    trailingIcon={selected() === name ? 'check' : undefined}
                    onClick={() => setSelected(name)}
                  />
                )}
              </For>
            </List>
          </SideSheet.Content>
        </SideSheet.Root>
      </div>
    </div>
  );
};

const SideSheetDemo: Component = () => (
  <div style={{ display: 'grid', gap: '24px' }}>
    <Filters />
    <ModalOptions />
    <Standard />
  </div>
);

export default SideSheetDemo;
