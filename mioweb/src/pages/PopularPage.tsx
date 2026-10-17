import { useSelector } from '@tanstack/solid-store';
import { createMemo, Show, type Component } from 'solid-js';
import { plural } from '../core/format';
import { settingsStore } from '../core/settings';
import { LinkCollection } from '../link/LinkCollection';
import { pathLabel, useTree } from '../tree/lookup';
import { ROOT_ID, type Link } from '../tree/types';
import { EmptyState, LinkViewControls, NewLinkFab, PageBody, PageHeading, SearchTopBar, Section, TreeGate } from './parts';

const LIMIT = 60;

/** The links opened most often, across every directory. */
export const PopularPage: Component = () => {
  const tree = useTree();
  const settings = useSelector(settingsStore);

  const links = createMemo(() =>
    tree()
      .allLinks.filter((l) => l.views > 0)
      .sort((a, b) => b.views - a.views || b.createdAt - a.createdAt)
      .slice(0, LIMIT),
  );

  const detail = (link: Link) => `${plural(link.views, 'view', 'views')} · ${pathLabel(tree(), link.directoryId)}`;

  return (
    <>
      <SearchTopBar />
      <TreeGate>
        <PageBody>
          <PageHeading title="Most viewed" meta="The links you open most, on every device" />
          <Show
            when={links().length > 0}
            fallback={
              <EmptyState icon="trending_up" title="No views yet">
                Open a link from Mio Link and it starts counting. Your most visited links collect here.
              </EmptyState>
            }
          >
            <Section title="Top links" meta={String(links().length)} actions={<LinkViewControls sort={false} />}>
              <LinkCollection links={links()} view={settings().linkView} label="Most viewed links" detail={detail} />
            </Section>
          </Show>
        </PageBody>
      </TreeGate>
      <NewLinkFab directoryId={ROOT_ID} />
    </>
  );
};
