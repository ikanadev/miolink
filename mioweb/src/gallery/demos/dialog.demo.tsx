import { createSignal, For, Show, type Component, type JSX } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { Dialog, type DialogCloseReason } from '../../components/ui/dialog';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'dialog', name: 'Dialog' };

// A plain input for the demo; the app will use TextField.
const field: JSX.CSSProperties = {
  'box-sizing': 'border-box',
  'inline-size': '100%',
  'block-size': '56px',
  padding: '0 16px',
  border: '1px solid var(--md-sys-color-outline)',
  'border-radius': 'var(--md-sys-shape-corner-extra-small)',
  background: 'transparent',
  color: 'var(--md-sys-color-on-surface)',
  font: 'inherit',
  'font-size': 'var(--md-sys-typescale-body-large-size)',
};

const fieldLabel: JSX.CSSProperties = {
  display: 'grid',
  gap: '4px',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-size': 'var(--md-sys-typescale-body-small-size)',
};

const errorText: JSX.CSSProperties = {
  margin: 0,
  color: 'var(--md-sys-color-error)',
  'font-size': 'var(--md-sys-typescale-body-small-size)',
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** (1) Confirm delete: alertdialog, Cancel gets initial focus, the scrim doesn't dismiss. */
const ConfirmDelete: Component = () => {
  const [status, setStatus] = createSignal('');
  return (
    <div class={g.row}>
      <Dialog.Root onOpenChange={(open, reason) => !open && setStatus(`Closed (${reason ?? 'programmatic'})`)}>
        <Dialog.Trigger asChild={(p) => <Button {...p()} color="tonal" icon="delete">Delete directory</Button>} />
        <Dialog.Content
          headline="Delete directory?"
          supportingText="“Recipes” and everything in it will be deleted: 3 subdirectories and 12 links."
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action close onClick={() => setStatus('Deleted')}>
              Delete
            </Dialog.Action>
          }
        />
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger asChild={(p) => <Button {...p()} color="outlined">With hero icon</Button>} />
        <Dialog.Content
          icon="delete"
          headline="Delete directory?"
          supportingText="3 subdirectories and 12 links will be deleted."
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={<Dialog.Action close>Delete</Dialog.Action>}
        />
      </Dialog.Root>
      <span class={g.label}>{status()}</span>
    </div>
  );
};

/**
 * (2) Form dialog: stays open while the save runs (busy confirm button,
 * Escape, scrim and Cancel blocked), shows an error so the user can retry.
 */
const NewDirectory: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');
  const [fail, setFail] = createSignal(true);
  const [result, setResult] = createSignal('');

  const openDialog = () => {
    setName('');
    setError('');
    setOpen(true);
  };

  const save = async (e: Event) => {
    e.preventDefault();
    const value = name().trim();
    if (!value) return setError('Enter a name.');
    if (value.includes('/')) return setError('Names can’t contain “/”.');
    setError('');
    setSaving(true);
    await wait(1500);
    setSaving(false);
    if (fail()) {
      setFail(false);
      setError('Couldn’t reach the server. Try again.');
      return;
    }
    setOpen(false);
    setResult(`Created “${value}”`);
  };

  return (
    <div class={g.row}>
      <Button color="filled" icon="create_new_folder" onClick={openDialog}>
        New directory
      </Button>
      <label class={g.label} style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
        <input type="checkbox" checked={fail()} onChange={(e) => setFail(e.currentTarget.checked)} />
        Fail the next save
      </label>
      <span class={g.label}>{result()}</span>

      <Dialog.Root role="dialog" open={open()} onOpenChange={setOpen} busy={saving()}>
        <Dialog.Content
          headline="New directory"
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action type="submit" form="new-directory-form" busy={saving()}>
              Create
            </Dialog.Action>
          }
        >
          <form id="new-directory-form" onSubmit={save} style={{ display: 'grid', gap: '4px' }}>
            <label style={fieldLabel}>
              Name
              <input
                style={field}
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                aria-invalid={error() ? 'true' : undefined}
                aria-describedby="new-directory-error"
                readOnly={saving()}
                maxLength={255}
              />
            </label>
            <p id="new-directory-error" style={errorText} role="alert">
              {error()}
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

const SORTS = ['Name', 'Date added', 'Most viewed', 'Recently opened', 'URL', 'Domain', 'Title length', 'Random'];

/** Scrolling content: dividers while it overflows; confirm disabled until a choice is made. */
const Scrolling: Component = () => {
  const [choice, setChoice] = createSignal<string>();
  return (
    <Dialog.Root role="dialog" onOpenChange={(open) => open && setChoice(undefined)}>
      <Dialog.Trigger asChild={(p) => <Button {...p()} color="outlined">Scrolling content</Button>} />
      <Dialog.Content
        headline="Sort links by"
        supportingText="Applies to every directory on this device."
        actions={<Dialog.Action close>Cancel</Dialog.Action>}
        confirmAction={
          <Dialog.Action close disabled={!choice()}>
            OK
          </Dialog.Action>
        }
      >
        <div role="radiogroup" aria-label="Sort links by" style={{ display: 'grid' }}>
          <For each={SORTS}>
            {(sort) => (
              <label style={{ display: 'flex', gap: '16px', 'align-items': 'center', 'min-block-size': '56px' }}>
                <input type="radio" name="sort" checked={choice() === sort} onChange={() => setChoice(sort)} />
                {sort}
              </label>
            )}
          </For>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const Stacked: Component = () => (
  <Dialog.Root>
    <Dialog.Trigger asChild={(p) => <Button {...p()} color="outlined">Stacked actions</Button>} />
    <Dialog.Content
      headline="Refresh link details?"
      supportingText="The title you edited will be replaced with the page’s current title."
      stackedActions
      actions={<Dialog.Action close>Keep my title</Dialog.Action>}
      confirmAction={<Dialog.Action close>Replace title and thumbnail</Dialog.Action>}
    />
  </Dialog.Root>
);

const Positioned: Component = () => (
  <Dialog.Root role="dialog" position="end">
    <Dialog.Trigger asChild={(p) => <Button {...p()} color="outlined">Positioned at the end</Button>} />
    <Dialog.Content
      headline="Link copied"
      supportingText="In medium and larger windows, a basic dialog can sit 56px from an edge. Compact windows always center it."
      confirmAction={<Dialog.Action close>OK</Dialog.Action>}
    />
  </Dialog.Root>
);

/**
 * Full-screen in compact windows (< 600px; narrow the window), a basic
 * dialog otherwise. Closing with unsaved changes asks to discard them.
 */
const FullScreen: Component = () => {
  const [open, setOpen] = createSignal(false);
  const [discard, setDiscard] = createSignal(false);
  const [title, setTitle] = createSignal('Miolink on GitHub');
  const [saved, setSaved] = createSignal(title());
  const [saving, setSaving] = createSignal(false);
  const [last, setLast] = createSignal<DialogCloseReason | 'saved'>();
  const dirty = () => title() !== saved();

  const onOpenChange = (next: boolean, reason?: DialogCloseReason) => {
    if (!next && dirty()) return setDiscard(true);
    setOpen(next);
    if (!next) setLast(reason);
  };

  const save = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    await wait(800);
    setSaving(false);
    setSaved(title());
    setOpen(false);
    setLast('saved');
  };

  return (
    <div class={g.row}>
      <Button color="tonal" icon="edit" onClick={() => setOpen(true)}>
        Edit link (full-screen)
      </Button>
      <Show when={last()}>
        <span class={g.label}>Closed: {last()}</span>
      </Show>

      <Dialog.Root variant="full-screen" open={open()} onOpenChange={onOpenChange} busy={saving()}>
        <Dialog.Content
          headline="Edit link"
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action type="submit" form="edit-link-form" busy={saving()}>
              Save
            </Dialog.Action>
          }
        >
          <form id="edit-link-form" onSubmit={save} style={{ display: 'grid', gap: '16px' }}>
            <label style={fieldLabel}>
              Title
              <input style={field} value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
            </label>
            <label style={fieldLabel}>
              URL
              <input style={field} value="https://github.com/" readOnly />
            </label>
            <For each={Array.from({ length: 12 })}>
              {(_, i) => <p style={{ margin: 0 }}>Filler paragraph {i() + 1}: scroll to see the header fill.</p>}
            </For>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Nested basic dialog above the full-screen one. */}
      <Dialog.Root open={discard()} onOpenChange={setDiscard}>
        <Dialog.Content
          headline="Discard changes?"
          supportingText="Your edits to this link won’t be saved."
          actions={<Dialog.Action close>Keep editing</Dialog.Action>}
          confirmAction={
            <Dialog.Action
              onClick={() => {
                setTitle(saved());
                setDiscard(false);
                setOpen(false);
                setLast('action');
              }}
            >
              Discard
            </Dialog.Action>
          }
        />
      </Dialog.Root>
    </div>
  );
};

const DialogDemo: Component = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <p class={g.label}>Basic (alertdialog): confirm delete, hero icon</p>
    <ConfirmDelete />
    <p class={g.label}>Form dialog: busy save blocks dismissal, error and retry</p>
    <NewDirectory />
    <p class={g.label}>Scrolling content with dividers, stacked actions, custom position</p>
    <div class={g.row}>
      <Scrolling />
      <Stacked />
      <Positioned />
    </div>
    <p class={g.label}>Full-screen (compact windows) with discard confirmation</p>
    <FullScreen />
  </div>
);

export default DialogDemo;
