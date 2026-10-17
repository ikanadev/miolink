import { useSelector } from '@tanstack/solid-store';
import { useNavigate } from '@tanstack/solid-router';
import { For, Show, type Component, type JSX } from 'solid-js';
import { AppBar } from '../components/ui/app-bar';
import { Button, ButtonGroup } from '../components/ui/buttons';
import { Fab } from '../components/ui/buttons/fab';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Icon } from '../components/ui/icon';
import { LoadingIndicator } from '../components/ui/loading-and-progress';
import { Menu } from '../components/ui/menu';
import { errorMessage } from '../core/errors';
import { openDialog } from '../core/dialogs';
import { createMediaQuery, MEDIUM_UP, routerClick } from '../core/media';
import { settingsStore, updateSettings, type LinkSort } from '../core/settings';
import { LinkSearch } from '../shell/LinkSearch';
import { directoryHref, goToDirectory } from '../shell/navigation';
import { compareNames, directoryName, useTree } from '../tree/lookup';
import { refresh, syncStore } from '../tree/store';
import type { Directory, Link } from '../tree/types';
import styles from './page.module.css';

/** Centered page content with the window class's margins. */
export const PageBody: Component<{ children: JSX.Element }> = (props) => (
  <div class={styles.body}>{props.children}</div>
);

/** A titled block of a page, with optional actions at the end of the title row. */
export const Section: Component<{ title: string; meta?: string; actions?: JSX.Element; children: JSX.Element }> = (
  props,
) => (
  <section class={styles.section} aria-label={props.title}>
    <div class={styles.sectionHeader}>
      <h2 class={styles.sectionTitle}>
        {props.title}
        <Show when={props.meta}>
          <span class={styles.sectionMeta}>{props.meta}</span>
        </Show>
      </h2>
      <Show when={props.actions}>
        <div class={styles.sectionActions}>{props.actions}</div>
      </Show>
    </div>
    {props.children}
  </section>
);

/** Large icon, headline, explanation and actions, for empty pages and errors. */
export const EmptyState: Component<{ icon: string; title: string; children?: JSX.Element; actions?: JSX.Element }> = (
  props,
) => (
  <div class={styles.empty}>
    <div class={styles.emptyIcon}>
      <Icon name={props.icon} size={40} />
    </div>
    <h2 class={styles.emptyTitle}>{props.title}</h2>
    <Show when={props.children}>
      <p class={styles.emptyText}>{props.children}</p>
    </Show>
    <Show when={props.actions}>
      <div class={styles.emptyActions}>{props.actions}</div>
    </Show>
  </div>
);

/**
 * Shows the page once the tree is cached. Before the first sync it shows
 * progress, or the failure with Retry (and Settings for a rejected key).
 */
export const TreeGate: Component<{ children: JSX.Element }> = (props) => {
  const tree = useTree();
  const sync = useSelector(syncStore);
  const navigate = useNavigate();
  return (
    <Show
      when={tree().loaded}
      fallback={
        <Show
          when={!sync().syncing && sync().error}
          fallback={
            <div class={styles.loading}>
              <LoadingIndicator label="Loading your links" size={64} />
            </div>
          }
        >
          {(error) => (
            <EmptyState
              icon={error().kind === 'unauthenticated' ? 'key_off' : 'cloud_off'}
              title={error().kind === 'unauthenticated' ? 'The API key was rejected' : 'Couldn’t load your links'}
              actions={
                <>
                  <Button color="filled" icon="refresh" onClick={() => void refresh()}>
                    Retry
                  </Button>
                  <Button color="outlined" icon="settings" onClick={() => navigate({ to: '/settings' })}>
                    Settings
                  </Button>
                </>
              }
            >
              {errorMessage(error())}
            </EmptyState>
          )}
        </Show>
      }
    >
      {props.children}
    </Show>
  );
};

/** Syncs now; shows a loading indicator while any sync runs. */
export const SyncButton: Component = () => {
  const sync = useSelector(syncStore);
  return (
    <Show
      when={!sync().syncing}
      fallback={
        <span class={styles.syncing}>
          <LoadingIndicator label="Syncing" size={40} />
        </span>
      }
    >
      <IconButton color="standard" icon="sync" label="Sync now" onClick={() => void refresh()} />
    </Show>
  );
};

/** The search app bar of the top-level pages. */
export const SearchTopBar: Component<{ trailing?: JSX.Element }> = (props) => (
  <AppBar variant="search" search={<LinkSearch />} trailing={props.trailing ?? <SyncButton />} />
);

/** Page heading under a search app bar (it has no title of its own). */
export const PageHeading: Component<{ title: string; meta?: string }> = (props) => (
  <header class={styles.heading}>
    <h1 class={styles.headingTitle}>{props.title}</h1>
    <Show when={props.meta}>
      <p class={styles.headingMeta}>{props.meta}</p>
    </Show>
  </header>
);

/** Where a directory is: links to each ancestor, then the directory itself. */
export const Breadcrumbs: Component<{ path: readonly Directory[] }> = (props) => {
  const navigate = useNavigate();
  return (
    <nav aria-label="Breadcrumb" class={styles.breadcrumbs}>
      <ol>
        <For each={props.path}>
          {(d, i) => (
            <li>
              <Show when={i() > 0}>
                <Icon name="chevron_right" size={18} mirror class={styles.crumbSeparator} />
              </Show>
              <Show
                when={i() < props.path.length - 1}
                fallback={
                  <span class={styles.crumbCurrent} aria-current="page">
                    {directoryName(d)}
                  </span>
                }
              >
                <Button
                  color="text"
                  size="xsmall"
                  href={directoryHref(d.id)}
                  onClick={routerClick(() => goToDirectory(navigate, d.id))}
                >
                  {directoryName(d)}
                </Button>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
};

const SORTS: { value: LinkSort; label: string; icon: string }[] = [
  { value: 'newest', label: 'Newest first', icon: 'arrow_downward' },
  { value: 'oldest', label: 'Oldest first', icon: 'arrow_upward' },
  { value: 'name', label: 'Title', icon: 'sort_by_alpha' },
  { value: 'views', label: 'Most viewed', icon: 'trending_up' },
];

export const sortLinks = (links: readonly Link[], sort: LinkSort): Link[] => {
  const out = [...links];
  switch (sort) {
    case 'newest':
      return out.sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
    case 'oldest':
      return out.sort((a, b) => a.createdAt - b.createdAt || a.id - b.id);
    case 'name':
      return out.sort((a, b) => compareNames(a.title, b.title));
    case 'views':
      return out.sort((a, b) => b.views - a.views || b.createdAt - a.createdAt);
  }
};

/** Sort menu and grid/list switch for a set of links; both are saved settings. */
export const LinkViewControls: Component<{ sort?: boolean }> = (props) => {
  const settings = useSelector(settingsStore);
  return (
    <>
      <Show when={props.sort !== false}>
        <Menu.Root>
          <Menu.Trigger asChild={(p) => <IconButton {...p()} color="standard" icon="sort" label="Sort links" />} />
          <Menu.Content>
            <Menu.RadioGroup
              label="Sort links by"
              value={settings().linkSort}
              onValueChange={(v) => updateSettings({ linkSort: v as LinkSort })}
            >
              <For each={SORTS}>
                {(s) => (
                  <Menu.RadioItem value={s.value} leadingIcon={s.icon}>
                    {s.label}
                  </Menu.RadioItem>
                )}
              </For>
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu.Root>
      </Show>
      <ButtonGroup
        variant="connected"
        selection="single"
        required
        size="xsmall"
        label="Link layout"
        value={[settings().linkView]}
        onValueChange={(v) => v[0] && updateSettings({ linkView: v[0] as 'grid' | 'list' })}
      >
        <IconButton color="tonal" value="grid" icon="grid_view" label="Grid" />
        <IconButton color="tonal" value="list" icon="view_list" label="List" />
      </ButtonGroup>
    </>
  );
};

/** Compact windows: the FAB for a new link (larger windows use the rail's FAB). */
export const NewLinkFab: Component<{ directoryId: number }> = (props) => {
  const wide = createMediaQuery(MEDIUM_UP);
  return (
    <Show when={!wide()}>
      <div class={styles.fab}>
        <Fab
          icon="add_link"
          label="New link"
          color="primary-container"
          onClick={() => openDialog({ kind: 'new-link', directoryId: props.directoryId })}
        />
      </div>
    </Show>
  );
};
