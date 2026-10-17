import { useSelector } from '@tanstack/solid-store';
import { createEffect, createMemo, createSignal, on, Show, type Component } from 'solid-js';
import { Button } from '../components/ui/buttons/button';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Dialog } from '../components/ui/dialog';
import { Divider } from '../components/ui/divider';
import { List, ListItem } from '../components/ui/list';
import { SideSheet } from '../components/ui/side-sheet';
import { TextField } from '../components/ui/text-field';
import { closeLinkDetails, dialogsStore, openDialog } from '../core/dialogs';
import { handleWriteFailure, notify } from '../core/feedback';
import { formatCount, formatDateTime } from '../core/format';
import { pathLabel, useTree } from '../tree/lookup';
import { refresh } from '../tree/store';
import type { Link } from '../tree/types';
import { copyLinkUrl, onLinkOpened } from './actions';
import { refreshLinkMetadata, updateLinkTitle } from './api';
import { LinkThumbnail } from './LinkThumbnail';
import { MAX_TITLE_LENGTH, validateLinkTitle } from './validate';
import form from '../core/form.module.css';
import styles from './details.module.css';

/**
 * A link's details in a modal side sheet: thumbnail, editable title, URL,
 * location, dates and views, and its actions. It opens after a link is
 * created so the fetched title can be fixed, and closes by itself when the
 * link disappears (deleted here or elsewhere).
 */
export const LinkDetailsSheet: Component = () => {
  const tree = useTree();
  const id = useSelector(dialogsStore, (s) => s.linkDetails);
  // Kept after closing so the content doesn't vanish during the exit transition.
  const link = createMemo<Link | undefined>((prev) => {
    const current = id();
    return current === null ? prev : (tree().links.get(current) ?? prev);
  });
  const open = () => id() !== null && tree().links.has(id()!);

  const [title, setTitle] = createSignal('');
  const [titleError, setTitleError] = createSignal<string>();
  const [error, setError] = createSignal<string>();
  const [saving, setSaving] = createSignal(false);
  const [refreshing, setRefreshing] = createSignal(false);
  const [confirmDiscard, setConfirmDiscard] = createSignal(false);
  const [confirmRefresh, setConfirmRefresh] = createSignal(false);

  const dirty = () => !!link() && title().trim() !== link()!.title;

  // Reset the form for each link opened.
  createEffect(
    on(id, (current) => {
      if (current === null) return;
      setTitle(tree().links.get(current)?.title ?? '');
      setTitleError(undefined);
      setError(undefined);
    }),
  );

  // Deleted while open (here or on another device): close.
  createEffect(() => {
    if (id() !== null && tree().loaded && !tree().links.has(id()!)) closeLinkDetails();
  });

  const requestClose = () => {
    if (dirty()) setConfirmDiscard(true);
    else closeLinkDetails();
  };

  const failure = (err: unknown) =>
    handleWriteFailure(err, {
      field: setTitleError,
      inline: setError,
      close: closeLinkDetails,
      refresh: () => void refresh(),
      notFound: 'This link was deleted on another device.',
    });

  const save = async (e?: Event) => {
    e?.preventDefault();
    const l = link();
    if (!l || saving() || !dirty()) return;
    const invalid = validateLinkTitle(title());
    if (invalid) return setTitleError(invalid);
    setSaving(true);
    setError(undefined);
    try {
      const updated = await updateLinkTitle(l.id, title().trim());
      setTitle(updated.title);
      notify('Title saved');
    } catch (err) {
      failure(err);
    } finally {
      setSaving(false);
    }
  };

  const refreshFromPage = async () => {
    const l = link();
    if (!l) return;
    setConfirmRefresh(false);
    setRefreshing(true);
    setError(undefined);
    try {
      const updated = await refreshLinkMetadata(l.id);
      setTitle(updated.title);
      setTitleError(undefined);
      notify('Title and image updated');
    } catch (err) {
      failure(err);
    } finally {
      setRefreshing(false);
    }
  };

  const busy = () => saving() || refreshing();

  return (
    <>
      <SideSheet.Root open={open()} onOpenChange={(o) => !o && requestClose()} busy={busy()}>
        <SideSheet.Content
          headline="Link details"
          width={400}
          actions={
            <>
              <Button color="filled" type="submit" form="link-details-form" disabled={!dirty() || busy()}>
                {saving() ? 'Saving…' : 'Save'}
              </Button>
              <Button color="outlined" onClick={requestClose} disabled={busy()}>
                Close
              </Button>
            </>
          }
        >
          <Show when={link()}>
            {(l) => (
              <div class={styles.body}>
                <a
                  class={styles.preview}
                  href={l().url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkOpened(l())}
                  aria-label={`Open ${l().title}`}
                >
                  <LinkThumbnail link={l()} />
                </a>

                <form id="link-details-form" class={form.form} onSubmit={save} novalidate>
                  <TextField
                    variant="outlined"
                    label="Title"
                    multiline
                    value={title()}
                    onValueChange={(v) => {
                      setTitle(v);
                      setTitleError(undefined);
                    }}
                    errorText={titleError()}
                    maxLength={MAX_TITLE_LENGTH}
                    counter
                    readOnly={busy()}
                    onKeyDown={(e: KeyboardEvent) => {
                      // Titles are one line: Enter saves instead of adding a line break.
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void save();
                      }
                    }}
                  />
                </form>

                <div class={styles.url}>
                  <a href={l().url} target="_blank" rel="noopener noreferrer" onClick={() => onLinkOpened(l())}>
                    {l().url}
                  </a>
                  <div class={styles.urlActions}>
                    <IconButton color="standard" icon="content_copy" label="Copy URL" onClick={() => copyLinkUrl(l())} />
                    <IconButton
                      color="tonal"
                      icon="open_in_new"
                      label="Open in new tab"
                      href={l().url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onLinkOpened(l())}
                    />
                  </div>
                </div>

                <Show when={error()}>
                  <p class={form.error} role="alert">
                    {error()}
                  </p>
                </Show>

                <List label="Details" interaction="non-interactive">
                  <ListItem leadingIcon="folder" overline="Location" headline={pathLabel(tree(), l().directoryId)} />
                  <ListItem leadingIcon="calendar_today" overline="Added" headline={formatDateTime(l().createdAt)} />
                  <ListItem leadingIcon="visibility" overline="Views" headline={formatCount(l().views)} />
                </List>

                <Divider />

                <List label="Actions">
                  <ListItem
                    leadingIcon="drive_file_move"
                    headline="Move to another directory"
                    disabled={busy()}
                    onClick={() => openDialog({ kind: 'move-link', id: l().id })}
                  />
                  <ListItem
                    leadingIcon="refresh"
                    headline={refreshing() ? 'Refreshing…' : 'Refresh from page'}
                    supportingText="Fetch the title and image again"
                    disabled={busy()}
                    onClick={() => setConfirmRefresh(true)}
                  />
                  <ListItem
                    leadingIcon="delete"
                    headline="Delete link"
                    disabled={busy()}
                    onClick={() => openDialog({ kind: 'delete-link', id: l().id })}
                  />
                </List>
              </div>
            )}
          </Show>
        </SideSheet.Content>
      </SideSheet.Root>

      <Dialog.Root open={confirmDiscard()} onOpenChange={setConfirmDiscard}>
        <Dialog.Content
          headline="Discard the new title?"
          supportingText="The title you typed hasn’t been saved."
          actions={<Dialog.Action close>Keep editing</Dialog.Action>}
          confirmAction={
            <Dialog.Action
              close
              onClick={() => {
                setTitle(link()?.title ?? '');
                closeLinkDetails();
              }}
            >
              Discard
            </Dialog.Action>
          }
        />
      </Dialog.Root>

      <Dialog.Root open={confirmRefresh()} onOpenChange={setConfirmRefresh}>
        <Dialog.Content
          headline="Refresh from the page?"
          supportingText="The title and image are fetched again. A title you edited is replaced."
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action close onClick={refreshFromPage}>
              Refresh
            </Dialog.Action>
          }
        />
      </Dialog.Root>
    </>
  );
};
