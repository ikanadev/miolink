import { useSelector } from '@tanstack/solid-store';
import { useNavigate, useRouterState } from '@tanstack/solid-router';
import { createEffect, createSignal, For, Match, on, Show, Switch, type Component, type JSX } from 'solid-js';
import { NavigationBar, NavigationBarItem } from '../components/ui/navigation-bar';
import { NavigationRail, NavigationRailItem, NavigationRailSection } from '../components/ui/navigation-rail';
import { snackbar, SnackbarHost } from '../components/ui/snackbar';
import { openDialog } from '../core/dialogs';
import { errorMessage } from '../core/errors';
import { setOpenSettings } from '../core/feedback';
import { createMediaQuery, MEDIUM_UP, routerClick } from '../core/media';
import { isConfigured, settingsStore } from '../core/settings';
import { DirectoryDialogs } from '../directory/DirectoryDialogs';
import { LinkDetailsSheet } from '../link/LinkDetailsSheet';
import { LinkDialogs } from '../link/LinkDialogs';
import { SettingsPage } from '../pages/SettingsPage';
import { isWithin, subdirectories, useTree } from '../tree/lookup';
import { refresh, syncStore } from '../tree/store';
import { ROOT_ID } from '../tree/types';
import { destinationOf, directoryHref, directoryOf, goToDirectory, type Destination } from './navigation';
import styles from './shell.module.css';

const DESTINATIONS: { value: Destination; label: string; icon: string; href: string }[] = [
  { value: 'library', label: 'Library', icon: 'folder_open', href: '/' },
  { value: 'recent', label: 'Recent', icon: 'schedule', href: '/recent' },
  { value: 'popular', label: 'Most viewed', icon: 'trending_up', href: '/popular' },
  { value: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

/**
 * The app frame: a navigation rail (medium and larger windows) or a
 * navigation bar (compact windows) around the current page, plus the
 * dialogs, the link details sheet and the snackbars every page shares.
 * Until a server is configured it shows only the setup screen.
 */
export const AppShell: Component<{ children: JSX.Element }> = (props) => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const settings = useSelector(settingsStore);
  const sync = useSelector(syncStore);
  const tree = useTree();
  const wide = createMediaQuery(MEDIUM_UP);
  const [expanded, setExpanded] = createSignal(false);

  setOpenSettings(() => navigate({ to: '/settings' }));

  const destination = () => destinationOf(pathname());
  const currentDirectory = () => directoryOf(pathname());
  const go = (href: string) => routerClick(() => navigate({ to: href }));

  // A failed background sync over cached data: say so once per kind of failure.
  createEffect(
    on(
      () => sync().error,
      (error, previous) => {
        if (!error || !tree().loaded || previous?.kind === error.kind) return;
        const settingsAction = error.kind === 'unauthenticated' || error.kind === 'not-configured';
        snackbar.show({
          id: 'sync',
          message: `Couldn’t sync. ${errorMessage(error)}`,
          actionLabel: settingsAction ? 'Settings' : 'Retry',
          onAction: () => (settingsAction ? navigate({ to: '/settings' }) : void refresh()),
        });
      },
    ),
  );
  createEffect(() => {
    if (!sync().error) snackbar.dismiss('sync');
  });

  /** New links go to the directory on screen, or the Library. */
  const newLink = () => openDialog({ kind: 'new-link', directoryId: currentDirectory() ?? ROOT_ID });

  const topDirectories = () => subdirectories(tree(), ROOT_ID);
  const activeTop = () => {
    const current = currentDirectory();
    if (current === undefined || current === ROOT_ID) return undefined;
    return topDirectories().find((d) => isWithin(tree(), current, d.id))?.id;
  };

  return (
    <Switch>
      {/* The component gallery keeps its own page chrome. */}
      <Match when={pathname() === '/gallery'}>{props.children}</Match>

      <Match when={!isConfigured(settings())}>
        <main class={styles.setup}>
          <SettingsPage setup />
        </main>
        <SnackbarHost />
      </Match>

      <Match when={true}>
        <div class={styles.shell}>
          <Show when={wide()}>
            <NavigationRail
              label="Main"
              class={styles.rail}
              value={destination()}
              expanded={expanded()}
              onExpandedChange={setExpanded}
              fab={{ icon: 'add_link', label: 'New link', onClick: newLink }}
              secondary={
                <Show when={topDirectories().length > 0}>
                  <NavigationRailSection label="Directories">
                    <For each={topDirectories()}>
                      {(d) => (
                        <NavigationRailItem
                          value={`dir:${d.id}`}
                          label={d.name}
                          icon="folder"
                          href={directoryHref(d.id)}
                          active={activeTop() === d.id}
                          onClick={routerClick(() => goToDirectory(navigate, d.id))}
                        />
                      )}
                    </For>
                  </NavigationRailSection>
                </Show>
              }
            >
              <For each={DESTINATIONS}>
                {(d) => (
                  <NavigationRailItem
                    value={d.value}
                    label={d.label}
                    icon={d.icon}
                    href={d.href}
                    active={
                      d.value === 'library' ? destination() === 'library' && (!expanded() || !activeTop()) : undefined
                    }
                    onClick={go(d.href)}
                  />
                )}
              </For>
            </NavigationRail>
          </Show>

          <main class={styles.main}>{props.children}</main>

          <Show when={!wide()}>
            <NavigationBar label="Main" fixed value={destination()}>
              <For each={DESTINATIONS}>
                {(d) => (
                  <NavigationBarItem
                    value={d.value}
                    label={d.label === 'Most viewed' ? 'Popular' : d.label}
                    icon={d.icon}
                    href={d.href}
                    onClick={go(d.href)}
                  />
                )}
              </For>
            </NavigationBar>
          </Show>
        </div>

        <DirectoryDialogs />
        <LinkDialogs />
        <LinkDetailsSheet />
        <SnackbarHost
          bottomOffset={wide() ? undefined : destination() === 'settings' ? '80px' : '152px'}
        />
      </Match>
    </Switch>
  );
};
