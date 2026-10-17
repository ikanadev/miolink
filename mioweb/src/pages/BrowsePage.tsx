import { useSelector } from '@tanstack/solid-store';
import { useNavigate } from '@tanstack/solid-router';
import { createEffect, createMemo, Show, type Component } from 'solid-js';
import { AppBar } from '../components/ui/app-bar';
import { Button } from '../components/ui/buttons/button';
import { FabMenu, FabMenuItem } from '../components/ui/buttons/fab-menu';
import { IconButton } from '../components/ui/buttons/icon-button';
import { openDialog } from '../core/dialogs';
import { notify } from '../core/feedback';
import { plural } from '../core/format';
import { createMediaQuery, MEDIUM_UP } from '../core/media';
import { settingsStore } from '../core/settings';
import { deletedHere } from '../directory/api';
import { DirectoryGrid, DirectoryMenu } from '../directory/DirectoryGrid';
import { LinkCollection } from '../link/LinkCollection';
import { directoryHref, goToDirectory } from '../shell/navigation';
import { directoryName, linksIn, pathTo, subdirectories, subtreeCount, useTree } from '../tree/lookup';
import { ROOT_ID, type Directory } from '../tree/types';
import {
  Breadcrumbs,
  EmptyState,
  LinkViewControls,
  PageBody,
  PageHeading,
  SearchTopBar,
  Section,
  sortLinks,
  SyncButton,
  TreeGate,
} from './parts';
import styles from './page.module.css';

/**
 * A directory's contents: its subdirectories as cards, then its links. The
 * Library (root) has the search app bar; other directories a collapsing
 * app bar with Back, the directory's name and its actions.
 */
export const BrowsePage: Component<{ directoryId: number }> = (props) => {
  const tree = useTree();
  const settings = useSelector(settingsStore);
  const navigate = useNavigate();
  const wide = createMediaQuery(MEDIUM_UP);

  const isRoot = () => props.directoryId === ROOT_ID;
  const directory = () => tree().directories.get(props.directoryId);
  const path = createMemo(() => pathTo(tree(), props.directoryId));
  const directories = () => subdirectories(tree(), props.directoryId);
  const links = createMemo(() => sortLinks(linksIn(tree(), props.directoryId), settings().linkSort));

  // The ancestors seen last, to find where to go if this directory is deleted elsewhere.
  let lastPath: Directory[] = [];
  createEffect(() => {
    if (path().length > 0) lastPath = path();
  });
  createEffect(() => {
    if (!tree().loaded || directory()) return;
    const fallback = [...lastPath].reverse().find((d) => d.id !== props.directoryId && tree().directories.has(d.id));
    if (!fallback) return;
    const gone = lastPath.find((d) => !tree().directories.has(d.id));
    if (!gone || !deletedHere.has(gone.id)) notify(gone ? `“${gone.name}” was deleted` : 'This directory was deleted');
    goToDirectory(navigate, fallback.id, true);
  });

  const summary = (d: Directory) => {
    const dirs = subdirectories(tree(), d.id).length;
    const count = linksIn(tree(), d.id).length;
    if (dirs === 0 && count === 0) return 'Empty';
    return [dirs > 0 ? plural(dirs, 'directory', 'directories') : '', count > 0 ? plural(count, 'link', 'links') : '']
      .filter(Boolean)
      .join(' · ');
  };

  const totals = () => {
    const { directories, links } = subtreeCount(tree(), ROOT_ID);
    return `${plural(directories, 'directory', 'directories')} · ${plural(links, 'link', 'links')}`;
  };

  const newDirectory = () => openDialog({ kind: 'new-directory', parentId: props.directoryId });
  const newLink = () => openDialog({ kind: 'new-link', directoryId: props.directoryId });
  const up = () => goToDirectory(navigate, directory()?.parentId ?? ROOT_ID);

  const empty = () => directories().length === 0 && links().length === 0;

  return (
    <>
      <Show
        when={!isRoot()}
        fallback={
          <SearchTopBar
            trailing={
              <>
                <Show when={wide()}>
                  <IconButton color="standard" icon="create_new_folder" label="New directory" onClick={newDirectory} />
                </Show>
                <SyncButton />
              </>
            }
          />
        }
      >
        <AppBar
          variant="medium-flexible"
          title={directory()?.name ?? ''}
          leading={<IconButton color="standard" icon="arrow_back" label="Up to the parent directory" mirror onClick={up} />}
          trailing={
            <Show when={directory()}>
              {(d) => (
                <>
                  <Show when={wide()} fallback={<SyncButton />}>
                    <IconButton color="standard" icon="create_new_folder" label="New directory" onClick={newDirectory} />
                  </Show>
                  <DirectoryMenu directory={d()} label={`Directory options for ${d().name}`} />
                </>
              )}
            </Show>
          }
        />
      </Show>

      <TreeGate>
        <PageBody>
          <Show
            when={directory()}
            fallback={
              <EmptyState
                icon="folder_off"
                title="Directory not found"
                actions={
                  <Button color="filled" icon="folder_open" onClick={() => goToDirectory(navigate, ROOT_ID)}>
                    Go to Library
                  </Button>
                }
              >
                It may have been deleted on another device.
              </EmptyState>
            }
          >
            <Show when={isRoot()} fallback={<Show when={path().length > 2}><Breadcrumbs path={path()} /></Show>}>
              <PageHeading title="Library" meta={totals()} />
            </Show>

            <Show when={empty()}>
              <EmptyState
                icon={isRoot() ? 'bookmark_add' : 'folder_open'}
                title={isRoot() ? 'Save your first link' : `“${directoryName(directory())}” is empty`}
                actions={
                  <>
                    <Button color="filled" icon="add_link" onClick={newLink}>
                      New link
                    </Button>
                    <Button color="tonal" icon="create_new_folder" onClick={newDirectory}>
                      New directory
                    </Button>
                  </>
                }
              >
                {isRoot()
                  ? 'Paste a URL and Mio Link fetches its title and preview image. Group links into directories, nested as deep as you like.'
                  : 'Add links here, or directories to organize them further.'}
              </EmptyState>
            </Show>

            <Show when={directories().length > 0}>
              <Section title="Directories" meta={String(directories().length)}>
                <DirectoryGrid
                  directories={directories()}
                  summary={summary}
                  href={directoryHref}
                  onOpen={(id) => goToDirectory(navigate, id)}
                />
              </Section>
            </Show>

            <Show when={links().length > 0}>
              <Section title="Links" meta={String(links().length)} actions={<LinkViewControls />}>
                <LinkCollection links={links()} view={settings().linkView} label={`Links in ${directoryName(directory())}`} />
              </Section>
            </Show>
          </Show>
        </PageBody>
      </TreeGate>

      <Show when={!wide() && directory()}>
        <div class={styles.fab}>
          <FabMenu icon="add" label="Add to this directory">
            <FabMenuItem icon="add_link" label="New link" onClick={newLink} />
            <FabMenuItem icon="create_new_folder" label="New directory" onClick={newDirectory} />
          </FabMenu>
        </div>
      </Show>
    </>
  );
};
