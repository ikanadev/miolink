import { createEffect, createSignal, For, on, Show, type Component } from 'solid-js';
import { Dialog } from '../components/ui/dialog';
import { Icon } from '../components/ui/icon';
import { List, ListItem } from '../components/ui/list';
import { directoryName, flattenTree, useTree } from './lookup';
import { ROOT_ID } from './types';
import styles from './picker.module.css';

export type DirectoryPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headline: string;
  supportingText?: string;
  /** Label of the confirm button ("Move", "Select"). */
  confirmLabel: string;
  /** Initially selected directory. */
  initial: number;
  /** Where the item is now: marked "Current" and can't be confirmed. */
  current?: number;
  /** Directories that can't be picked (a directory and its subtree when moving it). */
  isDisabled?: (id: number) => boolean;
  /** The confirm action is running. */
  busy?: boolean;
  /** Shown under the list (a failed move), so the user can retry. */
  error?: string;
  onConfirm: (id: number) => void;
};

/**
 * Picks a directory from the whole cached tree, shown indented in tree
 * order. Used to move directories and links and to choose where a new link
 * goes.
 */
export const DirectoryPickerDialog: Component<DirectoryPickerDialogProps> = (props) => {
  const tree = useTree();
  const [selected, setSelected] = createSignal(props.initial);
  const rows = () => flattenTree(tree());
  createEffect(on(() => props.open, (open) => open && setSelected(props.initial)));
  const canConfirm = () => selected() !== props.current && !props.isDisabled?.(selected());

  return (
    <Dialog.Root
      role="dialog"
      open={props.open}
      onOpenChange={(open) => props.onOpenChange(open)}
      busy={props.busy}
    >
      <Dialog.Content
        headline={props.headline}
        supportingText={props.supportingText}
        actions={<Dialog.Action close>Cancel</Dialog.Action>}
        confirmAction={
          <Dialog.Action disabled={!canConfirm()} busy={props.busy} onClick={() => props.onConfirm(selected())}>
            {props.confirmLabel}
          </Dialog.Action>
        }
      >
        <List
          selection="single"
          label="Directories"
          class={styles.pickerList}
          value={[String(selected())]}
          onValueChange={(v) => v[0] && setSelected(Number(v[0]))}
        >
          <For each={rows()}>
            {(row) => (
              <ListItem
                value={String(row.directory.id)}
                textValue={directoryName(row.directory)}
                disabled={props.isDisabled?.(row.directory.id)}
                leading={
                  <span class={styles.indent} style={{ '--depth': row.depth }}>
                    <Icon name={row.directory.id === ROOT_ID ? 'home' : 'folder'} />
                  </span>
                }
                headline={directoryName(row.directory)}
                trailingText={row.directory.id === props.current ? 'Current' : undefined}
              />
            )}
          </For>
        </List>
        <Show when={props.error}>
          <p class={styles.pickerError} role="alert">
            {props.error}
          </p>
        </Show>
      </Dialog.Content>
    </Dialog.Root>
  );
};
