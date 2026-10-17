import { useSelector } from '@tanstack/solid-store';
import { createMemo, For, Show, type Component } from 'solid-js';
import { Button } from '../components/ui/buttons/button';
import { openDialog } from '../core/dialogs';
import { dateGroup, formatRelative, plural } from '../core/format';
import { settingsStore } from '../core/settings';
import { LinkCollection } from '../link/LinkCollection';
import { pathLabel, useTree } from '../tree/lookup';
import { ROOT_ID, type Link } from '../tree/types';
import { EmptyState, LinkViewControls, NewLinkFab, PageBody, PageHeading, SearchTopBar, Section, TreeGate } from './parts';

/** Every link, newest first, grouped by when it was added (Today, Yesterday, This week, ...). */
export const RecentPage: Component = () => {
  const tree = useTree();
  const settings = useSelector(settingsStore);

  const groups = createMemo(() => {
    const now = Date.now();
    const sorted = [...tree().allLinks].sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
    const out: { title: string; links: Link[] }[] = [];
    for (const link of sorted) {
      const title = dateGroup(link.createdAt, now);
      const last = out[out.length - 1];
      if (last?.title === title) last.links.push(link);
      else out.push({ title, links: [link] });
    }
    return out;
  });

  const detail = (link: Link) => `${formatRelative(link.createdAt)} · ${pathLabel(tree(), link.directoryId)}`;

  return (
    <>
      <SearchTopBar />
      <TreeGate>
        <PageBody>
          <PageHeading title="Recent" meta={plural(tree().allLinks.length, 'link', 'links') + ', newest first'} />
          <Show
            when={groups().length > 0}
            fallback={
              <EmptyState
                icon="schedule"
                title="Nothing saved yet"
                actions={
                  <Button
                    color="filled"
                    icon="add_link"
                    onClick={() => openDialog({ kind: 'new-link', directoryId: ROOT_ID })}
                  >
                    New link
                  </Button>
                }
              >
                Links you save on any device show up here, newest first.
              </EmptyState>
            }
          >
            <For each={groups()}>
              {(group, i) => (
                <Section
                  title={group.title}
                  meta={String(group.links.length)}
                  actions={i() === 0 ? <LinkViewControls sort={false} /> : undefined}
                >
                  <LinkCollection
                    links={group.links}
                    view={settings().linkView}
                    label={`Links added ${group.title.toLowerCase()}`}
                    detail={detail}
                  />
                </Section>
              )}
            </For>
          </Show>
        </PageBody>
      </TreeGate>
      <NewLinkFab directoryId={ROOT_ID} />
    </>
  );
};
