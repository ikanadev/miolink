import { createEffect, createSignal, on, Show, type Component } from 'solid-js';
import { Button } from '../components/ui/buttons/button';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Dialog } from '../components/ui/dialog';
import { Icon } from '../components/ui/icon';
import { TextField } from '../components/ui/text-field';
import { openLinkDetails } from '../core/dialogs';
import { handleWriteFailure, notify } from '../core/feedback';
import { useDialog } from '../core/useDialog';
import { DirectoryPickerDialog } from '../tree/DirectoryPicker';
import { directoryName, pathLabel, useTree } from '../tree/lookup';
import { refresh } from '../tree/store';
import { ROOT_ID } from '../tree/types';
import { createLink, deleteLink, moveLink } from './api';
import { findUrl, parseLinkUrl } from './validate';
import form from '../core/form.module.css';
import styles from './dialogs.module.css';

/** Every link write dialog, opened through `openDialog`. Rendered once by the shell. */
export const LinkDialogs: Component = () => (
  <>
    <NewLinkDialog />
    <MoveLinkDialog />
    <DeleteLinkDialog />
  </>
);

/**
 * Saves a URL. The server fetches the title and thumbnail, which can take
 * a few seconds, so the dialog stays open and busy until it's done. The new
 * link then opens in the details sheet so the title can be fixed.
 */
const NewLinkDialog: Component = () => {
  const { open, request, close } = useDialog('new-link');
  const tree = useTree();
  const [url, setUrl] = createSignal('');
  const [directoryId, setDirectoryId] = createSignal(ROOT_ID);
  const [fieldError, setFieldError] = createSignal<string>();
  const [error, setError] = createSignal<string>();
  const [saving, setSaving] = createSignal(false);
  const [picking, setPicking] = createSignal(false);
  const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;

  createEffect(
    on(open, (o) => {
      if (!o) return;
      const r = request();
      setUrl(r?.url ?? '');
      setDirectoryId(r && tree().directories.has(r.directoryId) ? r.directoryId : ROOT_ID);
      setFieldError(undefined);
      setError(undefined);
    }),
  );

  // The destination was deleted elsewhere while the dialog was open.
  createEffect(() => {
    if (open() && tree().loaded && !tree().directories.has(directoryId())) setDirectoryId(ROOT_ID);
  });

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const found = findUrl(text) ?? text.trim();
      if (found) {
        setUrl(found);
        setFieldError(undefined);
      }
    } catch {
      notify('Couldn’t read the clipboard');
    }
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    if (saving()) return;
    const parsed = parseLinkUrl(url());
    if ('error' in parsed) return setFieldError(parsed.error);
    setError(undefined);
    setSaving(true);
    try {
      const link = await createLink(directoryId(), parsed.url);
      close();
      openLinkDetails(link.id);
    } catch (err) {
      handleWriteFailure(err, {
        field: setFieldError,
        inline: setError,
        close,
        refresh: () => void refresh(),
        notFound: 'The directory was deleted on another device.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog.Root role="dialog" open={open()} onOpenChange={(o) => !o && close()} busy={saving()}>
        <Dialog.Content
          headline="New link"
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action type="submit" form="new-link-form" busy={saving()}>
              Save
            </Dialog.Action>
          }
        >
          <form id="new-link-form" class={form.form} onSubmit={submit} novalidate>
            <TextField
              variant="outlined"
              label="URL"
              type="url"
              inputMode="url"
              autocomplete="off"
              spellcheck={false}
              leading={<Icon name="link" />}
              trailing={
                canPaste ? (
                  <IconButton color="standard" icon="content_paste" label="Paste" onClick={paste} disabled={saving()} />
                ) : undefined
              }
              value={url()}
              onValueChange={(v) => {
                setUrl(v);
                setFieldError(undefined);
              }}
              errorText={fieldError()}
              supportingText={saving() ? 'Fetching the page’s title and image…' : 'The title and image come from the page.'}
              readOnly={saving()}
              maxLength={2048}
            />
            <div class={styles.destination}>
              <Icon name="folder" />
              <div class={styles.destinationText}>
                <span class={styles.destinationLabel}>Save in</span>
                <span class={styles.destinationPath}>{pathLabel(tree(), directoryId()) || 'Library'}</span>
              </div>
              <Show when={tree().loaded}>
                <Button color="text" onClick={() => setPicking(true)} disabled={saving()}>
                  Change
                </Button>
              </Show>
            </div>
            <Show when={error()}>
              <p class={form.error} role="alert">
                {error()}
              </p>
            </Show>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <DirectoryPickerDialog
        open={picking()}
        onOpenChange={setPicking}
        headline="Save in"
        confirmLabel="Select"
        initial={directoryId()}
        onConfirm={(id) => {
          setDirectoryId(id);
          setPicking(false);
        }}
      />
    </>
  );
};

const MoveLinkDialog: Component = () => {
  const { open, request, close } = useDialog('move-link');
  const tree = useTree();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const link = () => tree().links.get(request()?.id ?? -1);

  createEffect(on(open, (o) => o && setError(undefined)));

  const confirm = async (target: number) => {
    const l = link();
    if (!l) return close();
    setBusy(true);
    setError(undefined);
    try {
      await moveLink(l.id, target);
      close();
      notify(`Moved to ${directoryName(tree().directories.get(target))}`);
    } catch (err) {
      handleWriteFailure(err, {
        inline: setError,
        close,
        refresh: () => void refresh(),
        notFound: 'The link or destination was deleted on another device.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DirectoryPickerDialog
      open={open()}
      onOpenChange={(o) => !o && close()}
      headline="Move link"
      supportingText={link()?.title}
      confirmLabel="Move"
      initial={link()?.directoryId ?? ROOT_ID}
      current={link()?.directoryId}
      busy={busy()}
      error={error()}
      onConfirm={confirm}
    />
  );
};

const DeleteLinkDialog: Component = () => {
  const { open, request, close } = useDialog('delete-link');
  const tree = useTree();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const [title, setTitle] = createSignal('');

  createEffect(
    on(open, (o) => {
      if (!o) return;
      setError(undefined);
      setTitle(tree().links.get(request()?.id ?? -1)?.title ?? '');
    }),
  );

  const confirm = async (e: MouseEvent) => {
    e.preventDefault();
    const id = request()?.id;
    if (id === undefined) return close();
    setBusy(true);
    setError(undefined);
    try {
      await deleteLink(id);
      close();
      notify('Link deleted');
    } catch (err) {
      handleWriteFailure(err, {
        inline: setError,
        close,
        refresh: () => void refresh(),
        notFound: 'This link was already deleted on another device.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open()} onOpenChange={(o) => !o && close()} busy={busy()}>
      <Dialog.Content
        headline="Delete link?"
        supportingText={`“${title()}” will be deleted. This can’t be undone.`}
        actions={<Dialog.Action close>Cancel</Dialog.Action>}
        confirmAction={
          <Dialog.Action busy={busy()} onClick={confirm}>
            Delete
          </Dialog.Action>
        }
      >
        <Show when={error()}>
          <p class={form.error} role="alert">
            {error()}
          </p>
        </Show>
      </Dialog.Content>
    </Dialog.Root>
  );
};
