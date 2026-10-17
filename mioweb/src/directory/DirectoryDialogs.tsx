import { createEffect, createSignal, on, Show, type Component } from 'solid-js';
import { Dialog } from '../components/ui/dialog';
import { TextField } from '../components/ui/text-field';
import { handleWriteFailure, notify } from '../core/feedback';
import { useDialog } from '../core/useDialog';
import { DirectoryPickerDialog } from '../tree/DirectoryPicker';
import { directoryName, isWithin, subdirectories, subtreeCount, useTree } from '../tree/lookup';
import { refresh } from '../tree/store';
import { createDirectory, deleteDirectory, moveDirectory, renameDirectory } from './api';
import { validateDirectoryName } from './validate';
import styles from '../core/form.module.css';

/** Every directory write dialog, opened through `openDialog`. Rendered once by the shell. */
export const DirectoryDialogs: Component = () => (
  <>
    <NewDirectoryDialog />
    <RenameDirectoryDialog />
    <MoveDirectoryDialog />
    <DeleteDirectoryDialog />
  </>
);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type NameDialogProps = {
  open: boolean;
  onClose: () => void;
  headline: string;
  confirmLabel: string;
  supportingText?: string;
  initialName: string;
  /** Returns an error message, or undefined when the name can be sent. */
  validate: (name: string) => string | undefined;
  /** Runs the write; throws on failure. */
  save: (name: string) => Promise<void>;
  notFound: string;
};

/**
 * A form dialog with one name field. It stays open while the write runs
 * (busy confirm, dismissal blocked). Invalid names and server rejections
 * show under the field; connection failures inside the dialog for a retry.
 */
const NameDialog: Component<NameDialogProps> = (props) => {
  const [name, setName] = createSignal('');
  const [fieldError, setFieldError] = createSignal<string>();
  const [error, setError] = createSignal<string>();
  const [saving, setSaving] = createSignal(false);
  const formId = `name-dialog-${Math.random().toString(36).slice(2)}`;

  createEffect(
    on(
      () => props.open,
      (open) => {
        if (!open) return;
        setName(props.initialName);
        setFieldError(undefined);
        setError(undefined);
      },
    ),
  );

  const submit = async (e: Event) => {
    e.preventDefault();
    if (saving()) return;
    const value = name().trim();
    const invalid = props.validate(value);
    if (invalid) return setFieldError(invalid);
    setError(undefined);
    setSaving(true);
    try {
      await props.save(value);
      props.onClose();
    } catch (err) {
      handleWriteFailure(err, {
        field: setFieldError,
        inline: setError,
        close: props.onClose,
        refresh: () => void refresh(),
        notFound: props.notFound,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root role="dialog" open={props.open} onOpenChange={(open) => !open && props.onClose()} busy={saving()}>
      <Dialog.Content
        headline={props.headline}
        supportingText={props.supportingText}
        actions={<Dialog.Action close>Cancel</Dialog.Action>}
        confirmAction={
          <Dialog.Action type="submit" form={formId} busy={saving()}>
            {props.confirmLabel}
          </Dialog.Action>
        }
      >
        <form id={formId} class={styles.form} onSubmit={submit} novalidate>
          <TextField
            variant="outlined"
            label="Name"
            value={name()}
            onValueChange={(v) => {
              setName(v);
              setFieldError(undefined);
            }}
            errorText={fieldError()}
            readOnly={saving()}
            maxLength={255}
            autocomplete="off"
            ref={(el) => queueMicrotask(() => el.select())}
          />
          <Show when={error()}>
            <p class={styles.error} role="alert">
              {error()}
            </p>
          </Show>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const NewDirectoryDialog: Component = () => {
  const { open, request, close } = useDialog('new-directory');
  const tree = useTree();
  const parentId = () => request()?.parentId ?? 1;
  return (
    <NameDialog
      open={open()}
      onClose={close}
      headline="New directory"
      supportingText={`In ${directoryName(tree().directories.get(parentId()))}`}
      confirmLabel="Create"
      initialName=""
      validate={(name) => validateDirectoryName(name, subdirectories(tree(), parentId()))}
      save={async (name) => {
        await createDirectory(parentId(), name);
        notify(`Created “${name}”`);
      }}
      notFound="The parent directory was deleted on another device."
    />
  );
};

const RenameDirectoryDialog: Component = () => {
  const { open, request, close } = useDialog('rename-directory');
  const tree = useTree();
  const directory = () => tree().directories.get(request()?.id ?? -1);
  return (
    <NameDialog
      open={open()}
      onClose={close}
      headline="Rename directory"
      confirmLabel="Rename"
      initialName={directory()?.name ?? ''}
      validate={(name) => {
        const d = directory();
        if (!d) return undefined;
        return validateDirectoryName(name, subdirectories(tree(), d.parentId ?? -1), d.id);
      }}
      save={async (name) => {
        const d = directory();
        if (!d || name === d.name) return;
        await renameDirectory(d.id, name);
        notify(`Renamed to “${name}”`);
      }}
      notFound="This directory was deleted on another device."
    />
  );
};

const MoveDirectoryDialog: Component = () => {
  const { open, request, close } = useDialog('move-directory');
  const tree = useTree();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const directory = () => tree().directories.get(request()?.id ?? -1);

  createEffect(on(open, (o) => o && setError(undefined)));

  const confirm = async (target: number) => {
    const d = directory();
    if (!d) return close();
    const clash = validateDirectoryName(d.name, subdirectories(tree(), target), d.id);
    if (clash) return setError('The destination already has a directory with this name.');
    setBusy(true);
    setError(undefined);
    try {
      await moveDirectory(d.id, target);
      close();
      notify(`Moved “${d.name}” to ${directoryName(tree().directories.get(target))}`);
    } catch (err) {
      handleWriteFailure(err, {
        inline: setError,
        close,
        refresh: () => void refresh(),
        notFound: 'The directory or destination was deleted on another device.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DirectoryPickerDialog
      open={open()}
      onOpenChange={(o) => !o && close()}
      headline={`Move “${directory()?.name ?? ''}”`}
      confirmLabel="Move"
      initial={directory()?.parentId ?? 1}
      current={directory()?.parentId ?? undefined}
      isDisabled={(id) => {
        const d = directory();
        return !!d && isWithin(tree(), id, d.id);
      }}
      busy={busy()}
      error={error()}
      onConfirm={confirm}
    />
  );
};

const DeleteDirectoryDialog: Component = () => {
  const { open, request, close } = useDialog('delete-directory');
  const tree = useTree();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const directory = () => tree().directories.get(request()?.id ?? -1);
  // Counted when the dialog opens, so the text doesn't change as the cache updates after the delete.
  const [count, setCount] = createSignal({ directories: 0, links: 0 });
  const [name, setName] = createSignal('');

  createEffect(
    on(open, (o) => {
      if (!o) return;
      setError(undefined);
      const d = directory();
      setName(d?.name ?? '');
      setCount(d ? subtreeCount(tree(), d.id) : { directories: 0, links: 0 });
    }),
  );

  const summary = () => {
    const { directories, links } = count();
    if (directories === 0 && links === 0) return 'The directory is empty.';
    const parts = [];
    if (directories > 0) parts.push(plural(directories, 'subdirectory', 'subdirectories'));
    if (links > 0) parts.push(plural(links, 'link', 'links'));
    return `Everything in it will be deleted too: ${parts.join(' and ')}. This can’t be undone.`;
  };

  const confirm = async (e: MouseEvent) => {
    e.preventDefault();
    const d = directory();
    if (!d) return close();
    setBusy(true);
    setError(undefined);
    try {
      await deleteDirectory(d.id);
      close();
      notify(`Deleted “${d.name}”`);
    } catch (err) {
      handleWriteFailure(err, {
        inline: setError,
        close,
        refresh: () => void refresh(),
        notFound: 'This directory was already deleted on another device.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open()} onOpenChange={(o) => !o && close()} busy={busy()}>
      <Dialog.Content
        icon="delete"
        headline={`Delete “${name()}”?`}
        supportingText={summary()}
        actions={<Dialog.Action close>Cancel</Dialog.Action>}
        confirmAction={
          <Dialog.Action busy={busy()} onClick={confirm}>
            Delete
          </Dialog.Action>
        }
      >
        <Show when={error()}>
          <p class={styles.error} role="alert">
            {error()}
          </p>
        </Show>
      </Dialog.Content>
    </Dialog.Root>
  );
};
