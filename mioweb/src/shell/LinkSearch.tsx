import { useNavigate } from '@tanstack/solid-router';
import { createMemo, createSignal, For, Show, type Component, type JSX } from 'solid-js';
import { ListItem } from '../components/ui/list';
import { Search, SearchGroup } from '../components/ui/search';
import { openLink } from '../link/actions';
import { LinkThumbnail } from '../link/LinkThumbnail';
import { hostOf } from '../link/validate';
import { directoryName, pathLabel, useTree } from '../tree/lookup';
import { ROOT_ID } from '../tree/types';
import { goToDirectory } from './navigation';
import styles from './shell.module.css';

const MAX_DIRECTORIES = 6;
const MAX_LINKS = 30;
const RECENT = 5;

/** Lowercased, accent-free text for matching. */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Searches the cached tree: directory names and link titles and URLs, all
 * words matching. Before typing it suggests the newest links. Picking a
 * directory opens it; picking a link opens the page in a new tab.
 */
export const LinkSearch: Component<{ leading?: JSX.Element; trailing?: JSX.Element }> = (props) => {
  const tree = useTree();
  const navigate = useNavigate();
  const [query, setQuery] = createSignal('');

  const words = () => fold(query()).split(/\s+/).filter(Boolean);

  const directories = createMemo(() => {
    const w = words();
    if (w.length === 0) return [];
    const out = [];
    for (const d of tree().directories.values()) {
      if (d.id === ROOT_ID) continue;
      const name = fold(d.name);
      if (w.every((word) => name.includes(word))) out.push(d);
      if (out.length === MAX_DIRECTORIES) break;
    }
    return out;
  });

  const links = createMemo(() => {
    const w = words();
    const all = tree().allLinks;
    if (w.length === 0) return [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, RECENT);
    const out = [];
    for (const l of all) {
      const text = fold(`${l.title} ${l.url}`);
      if (w.every((word) => text.includes(word))) out.push(l);
      if (out.length === MAX_LINKS) break;
    }
    return out;
  });

  const onSelect = (value: string) => {
    const [kind, raw] = value.split(':');
    const id = Number(raw);
    if (kind === 'd') {
      goToDirectory(navigate, id);
    } else if (kind === 'l') {
      const link = tree().links.get(id);
      if (link) openLink(link);
    }
  };

  return (
    <Search
      placeholder="Search links"
      class={styles.search}
      leading={props.leading}
      trailing={props.trailing}
      value={query()}
      onValueChange={setQuery}
      onSelect={onSelect}
      onOpenChange={(open) => !open && setQuery('')}
      resultsLabel="Links and directories"
      empty={<>No links or directories match “{query()}”</>}
      status={(n, q) => (q ? (n === 0 ? 'No matches' : `${n} ${n === 1 ? 'match' : 'matches'}`) : '')}
    >
      <Show when={directories().length > 0}>
        <SearchGroup label="Directories">
          <For each={directories()}>
            {(d) => (
              <ListItem
                value={`d:${d.id}`}
                textValue={d.name}
                leadingIcon="folder"
                headline={d.name}
                supportingText={pathLabel(tree(), d.parentId ?? ROOT_ID)}
              />
            )}
          </For>
        </SearchGroup>
      </Show>
      <Show when={links().length > 0}>
        <SearchGroup label={query().trim() ? 'Links' : 'Recently added'}>
          <For each={links()}>
            {(l) => (
              <ListItem
                value={`l:${l.id}`}
                textValue={l.title}
                leading={<LinkThumbnail link={l} row />}
                headline={l.title}
                supportingText={`${hostOf(l.url)} · ${directoryName(tree().directories.get(l.directoryId))}`}
                trailingIcon="open_in_new"
              />
            )}
          </For>
        </SearchGroup>
      </Show>
    </Search>
  );
};
