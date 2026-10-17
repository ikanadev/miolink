import { For, type Component } from 'solid-js';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Card, CardAction, CardContent, CardHeadline, CardIcon, CardSubhead } from '../components/ui/card';
import { Menu } from '../components/ui/menu';
import { openDialog } from '../core/dialogs';
import { routerClick } from '../core/media';
import type { Directory } from '../tree/types';
import styles from './directory.module.css';

export type DirectoryGridProps = {
  directories: readonly Directory[];
  /** "2 directories · 5 links" for a directory. */
  summary: (d: Directory) => string;
  /** URL of a directory's page (for the link) and how to go there without a reload. */
  href: (id: number) => string;
  onOpen: (id: number) => void;
};

/** Subdirectories as cards: the card opens the directory, its menu renames, moves or deletes it. */
export const DirectoryGrid: Component<DirectoryGridProps> = (props) => (
  <ul class={styles.grid} aria-label="Directories">
    <For each={props.directories}>
      {(d) => (
        <Card as="li" variant="outlined" class={styles.card}>
          <CardContent class={styles.content}>
            <CardIcon name="folder" class={styles.icon} />
            <div class={styles.text}>
              <CardHeadline level={3} maxLines={1} class={styles.name}>
                <CardAction href={props.href(d.id)} onClick={routerClick(() => props.onOpen(d.id))}>
                  {d.name}
                </CardAction>
              </CardHeadline>
              <CardSubhead maxLines={1}>{props.summary(d)}</CardSubhead>
            </div>
          </CardContent>
          <div class={styles.menu}>
            <DirectoryMenu directory={d} />
          </div>
        </Card>
      )}
    </For>
  </ul>
);

/** Rename, move and delete for a directory (never the root). */
export const DirectoryMenu: Component<{ directory: Directory; icon?: string; label?: string }> = (props) => (
  <Menu.Root
    onSelect={(e) => {
      const id = props.directory.id;
      if (e.value === 'new') openDialog({ kind: 'new-directory', parentId: id });
      if (e.value === 'rename') openDialog({ kind: 'rename-directory', id });
      if (e.value === 'move') openDialog({ kind: 'move-directory', id });
      if (e.value === 'delete') openDialog({ kind: 'delete-directory', id });
    }}
  >
    <Menu.Trigger
      asChild={(p) => (
        <IconButton
          {...p()}
          color="standard"
          icon={props.icon ?? 'more_vert'}
          label={props.label ?? `More options for ${props.directory.name}`}
        />
      )}
    />
    <Menu.Content>
      <Menu.Item value="new" leadingIcon="create_new_folder">
        New directory inside
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item value="rename" leadingIcon="edit">
        Rename
      </Menu.Item>
      <Menu.Item value="move" leadingIcon="drive_file_move">
        Move
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item value="delete" leadingIcon="delete">
        Delete
      </Menu.Item>
    </Menu.Content>
  </Menu.Root>
);
