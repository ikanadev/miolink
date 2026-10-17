import { createSignal, For, type Component, type JSX } from 'solid-js';
import { BottomSheet, type BottomSheetCloseReason } from '../../components/ui/bottom-sheet';
import { Button } from '../../components/ui/buttons/button';
import { List, ListItem } from '../../components/ui/list';
import { TextField } from '../../components/ui/text-field';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'bottom-sheet', name: 'Bottom sheet' };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const padded: JSX.CSSProperties = {
  display: 'grid',
  gap: '16px',
  padding: '0 24px 24px',
};

const text: JSX.CSSProperties = {
  margin: 0,
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-weight': 'var(--md-sys-typescale-body-medium-weight)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
  'letter-spacing': 'var(--md-sys-typescale-body-medium-tracking)',
};

const actionsRow: JSX.CSSProperties = { display: 'flex', 'justify-content': 'flex-end', gap: '8px' };

/** (1) Modal action list: an item closes the sheet with reason "action". */
const ActionList: Component = () => {
  const [status, setStatus] = createSignal('');
  const items = [
    { icon: 'open_in_new', label: 'Open' },
    { icon: 'edit', label: 'Edit' },
    { icon: 'drive_file_move', label: 'Move' },
    { icon: 'share', label: 'Share' },
    { icon: 'delete', label: 'Delete' },
  ];
  return (
    <div class={g.row}>
      <BottomSheet.Root
        onOpenChange={(open, reason) => !open && setStatus((s) => (s.startsWith('Picked') ? s : `Closed (${reason ?? 'programmatic'})`))}
      >
        <BottomSheet.Trigger
          asChild={(p) => (
            <Button {...p({ onClick: () => setStatus('') })} color="tonal" icon="more_vert">
              Link actions
            </Button>
          )}
        />
        <BottomSheet.Content aria-label="Link actions">
          <List label="Link actions">
            <For each={items}>
              {(item) => (
                <BottomSheet.Close
                  onClick={() => setStatus(`Picked: ${item.label}`)}
                  asChild={(p) => <ListItem {...p()} leadingIcon={item.icon} headline={item.label} />}
                />
              )}
            </For>
          </List>
        </BottomSheet.Content>
      </BottomSheet.Root>
      <span class={g.label}>{status()}</span>
    </div>
  );
};

/** (2) Add link: headline, a form, busy while saving (nothing closes it), error. */
const AddLink: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [url, setUrl] = createSignal('');
  const [error, setError] = createSignal<string>();
  const [result, setResult] = createSignal('');

  const save = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!/^https?:\/\/\S+\.\S+/.test(url())) {
      setError('Enter an http(s) URL');
      return;
    }
    setError(undefined);
    setSaving(true);
    await wait(1500);
    setSaving(false);
    setOpen(false);
    setResult(`Saved ${url()}`);
  };

  return (
    <div class={g.row}>
      <Button
        color="filled"
        icon="add_link"
        onClick={() => {
          setUrl('');
          setError(undefined);
          setResult('');
          setOpen(true);
        }}
      >
        New link
      </Button>
      <span class={g.label}>{result()}</span>
      <BottomSheet.Root open={open()} onOpenChange={(o) => setOpen(o)} busy={saving()}>
        <BottomSheet.Content headline="New link">
          <form style={padded} onSubmit={save} novalidate>
            <p style={text}>Save in: Home</p>
            <TextField
              label="URL"
              type="url"
              inputMode="url"
              value={url()}
              onValueChange={setUrl}
              errorText={error()}
              disabled={saving()}
              clearable
            />
            <div style={actionsRow}>
              <BottomSheet.Close asChild={(p) => <Button {...p()} type="button" color="text">Cancel</Button>} />
              <Button type="submit" color="filled" disabled={saving()}>
                {saving() ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </BottomSheet.Content>
      </BottomSheet.Root>
    </div>
  );
};

/** (3) Long content: opens at 50%, pull (or press the handle) to full height, where a close button appears. */
const LongContent: Component = () => (
  <BottomSheet.Root>
    <BottomSheet.Trigger asChild={(p) => <Button {...p()} color="outlined">Long list</Button>} />
    <BottomSheet.Content headline="Move to">
      <List label="Directories">
        <For each={Array.from({ length: 30 }, (_, i) => `Directory ${i + 1}`)}>
          {(name) => (
            <BottomSheet.Close asChild={(p) => <ListItem {...p()} leadingIcon="folder" headline={name} />} />
          )}
        </For>
      </List>
    </BottomSheet.Content>
  </BottomSheet.Root>
);

/** (4) Three detents (25%, 50%, full) with a detent readout; not dismissible by swipe/scrim/Escape. */
const Detents: Component = () => {
  const [detent, setDetent] = createSignal<string>('0.25');
  return (
    <div class={g.row}>
      <BottomSheet.Root
        detents={[0.25, 0.5, 1]}
        dismissible={false}
        onDetentChange={(d) => setDetent(String(d))}
        onOpenChange={(o) => o && setDetent('0.25')}
      >
        <BottomSheet.Trigger asChild={(p) => <Button {...p()} color="outlined">Three detents, not dismissible</Button>} />
        <BottomSheet.Content aria-label="Detents demo">
          <div style={padded}>
            <p style={text}>
              Current detent: {detent()}. Drag, or press the handle (Enter/Space) to cycle the heights. Escape, the
              scrim and swiping down don't close this sheet; use the button.
            </p>
            <div style={actionsRow}>
              <BottomSheet.Close asChild={(p) => <Button {...p()} color="tonal">Done</Button>} />
            </div>
            <For each={Array.from({ length: 12 }, (_, i) => i + 1)}>
              {(n) => <p style={text}>Paragraph {n}. Content continues below the visible part of the sheet.</p>}
            </For>
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    </div>
  );
};

/** (5) Standard: no scrim, the page stays interactive; collapse button at full height. */
const Standard: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [minimized, setMinimized] = createSignal(false);
  return (
    <div class={g.row}>
      <Button color="outlined" onClick={() => setOpen(!open())}>
        {open() ? 'Hide' : 'Show'} standard sheet
      </Button>
      <label class={g.label} style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
        <input type="checkbox" checked={minimized()} onChange={(e) => setMinimized(e.currentTarget.checked)} />
        Minimized (square corners)
      </label>
      <BottomSheet.Root
        variant="standard"
        detents={['160px', 1]}
        open={open()}
        onOpenChange={setOpen}
      >
        <BottomSheet.Content headline="Now playing" minimized={minimized()}>
          <div style={padded}>
            <p style={text}>
              A standard sheet coexists with the page: scroll and click behind it. Press the handle to cycle between
              160px and full height; with one detent it would close instead.
            </p>
            <For each={Array.from({ length: 16 }, (_, i) => i + 1)}>
              {(n) => <p style={text}>Track {n}</p>}
            </For>
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    </div>
  );
};

/** (6) No drag handle, single detent, handle-only drag disabled: closed with an action, Escape or the scrim. */
const NoHandle: Component = () => {
  const [reason, setReason] = createSignal<BottomSheetCloseReason | ''>('');
  return (
    <div class={g.row}>
      <BottomSheet.Root detents={[1]} onOpenChange={(o, r) => !o && setReason(r ?? '')}>
        <BottomSheet.Trigger asChild={(p) => <Button {...p()} color="outlined">Without drag handle</Button>} />
        <BottomSheet.Content headline="Sort by" dragHandle={false} draggable={false}>
          <List label="Sort by">
            <For each={['Name', 'Date added', 'Most viewed']}>
              {(label) => <BottomSheet.Close asChild={(p) => <ListItem {...p()} headline={label} />} />}
            </For>
          </List>
        </BottomSheet.Content>
      </BottomSheet.Root>
      <span class={g.label}>{reason() && `Closed (${reason()})`}</span>
    </div>
  );
};

const BottomSheetDemo: Component = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <ActionList />
    <AddLink />
    <div class={g.row}>
      <LongContent />
      <NoHandle />
    </div>
    <Detents />
    <Standard />
  </div>
);

export default BottomSheetDemo;
