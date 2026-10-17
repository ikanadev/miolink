import { createMemo, createSignal, For, Show, type Component, type JSX } from 'solid-js';
import { AppBar } from '../../components/ui/app-bar';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { ChipSet, FilterChip } from '../../components/ui/chip';
import { Icon } from '../../components/ui/icon';
import { ListItem } from '../../components/ui/list';
import {
  Search,
  SearchBar,
  SearchGroup,
  type SearchLayout,
  type SearchVariant,
} from '../../components/ui/search';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'search', name: 'Search' };

const LINKS = [
  { title: 'SolidJS: reactive JavaScript library', url: 'solidjs.com', dir: 'Dev' },
  { title: 'Material Design 3: Search', url: 'm3.material.io/components/search', dir: 'Design' },
  { title: 'Ark UI: headless components', url: 'ark-ui.com', dir: 'Dev' },
  { title: 'Connect RPC', url: 'connectrpc.com', dir: 'Dev' },
  { title: 'SQLite documentation', url: 'sqlite.org/docs.html', dir: 'Reading' },
  { title: 'Material Symbols', url: 'fonts.google.com/icons', dir: 'Design' },
  { title: 'Jetpack Compose', url: 'developer.android.com/compose', dir: 'Android' },
];
const RECENT = ['solid', 'material search', 'sqlite'];

const Avatar = () => (
  <button
    type="button"
    data-avatar=""
    aria-label="Account"
    style={{
      display: 'grid',
      'place-items': 'center',
      padding: 0,
      border: 0,
      cursor: 'pointer',
      background: 'var(--md-sys-color-primary-container)',
      color: 'var(--md-sys-color-on-primary-container)',
      font: 'inherit',
      'font-size': '14px',
    }}
  >
    K
  </button>
);

/** A Search over the sample links, with recent queries before typing. */
const LinkSearch: Component<{
  variant?: SearchVariant;
  layout?: SearchLayout;
  leading?: JSX.Element;
  trailing?: JSX.Element;
  filters?: boolean;
  onLog: (line: string) => void;
}> = (props) => {
  const [query, setQuery] = createSignal('');
  const [dirs, setDirs] = createSignal<string[]>([]);
  const matches = createMemo(() => {
    const q = query().trim().toLowerCase();
    return LINKS.filter(
      (l) =>
        (q === '' || l.title.toLowerCase().includes(q) || l.url.includes(q)) &&
        (dirs().length === 0 || dirs().includes(l.dir)),
    );
  });

  const extra = () => ('leading' in props ? { leading: props.leading } : {});

  return (
    <Search
      placeholder="Search links"
      variant={props.variant}
      layout={props.layout}
      {...extra()}
      trailing={props.trailing}
      value={query()}
      onValueChange={setQuery}
      onSearch={(v) => props.onLog(`search "${v}"`)}
      onSelect={(v) => props.onLog(`select ${v}`)}
      onOpenChange={(open, reason) => props.onLog(open ? 'open' : `close (${reason})`)}
      header={
        props.filters ? (
          <ChipSet label="Filter by directory" selection="multi" value={dirs()} onValueChange={setDirs}>
            <For each={['Dev', 'Design', 'Reading']}>{(d) => <FilterChip label={d} value={d} />}</For>
          </ChipSet>
        ) : undefined
      }
      empty={<>No links match “{query()}”</>}
      status={(n, q) => (n === 0 ? (q ? 'No links' : '') : `${n} ${q ? 'links' : 'recent searches and links'}`)}
    >
      <Show when={query() === ''}>
        <SearchGroup label="Recent">
          <For each={RECENT}>
            {(r) => (
              <ListItem
                value={`recent:${r}`}
                headline={r}
                leadingIcon="history"
                // Fills the query and keeps the view open (preventDefault skips onSelect).
                onClick={(e) => {
                  e.preventDefault();
                  setQuery(r);
                }}
              />
            )}
          </For>
        </SearchGroup>
      </Show>
      <Show when={matches().length > 0}>
        <SearchGroup label={query() === '' ? 'Links' : 'Results'}>
          <For each={matches()}>
            {(l) => (
              <ListItem
                value={l.url}
                headline={l.title}
                supportingText={l.url}
                leadingIcon="link"
                trailingText={l.dir}
              />
            )}
          </For>
        </SearchGroup>
      </Show>
    </Search>
  );
};

const Example = (props: { label: string; children: JSX.Element }) => (
  <div style={{ display: 'grid', gap: '8px' }}>
    <p class={g.label}>{props.label}</p>
    <div
      style={{
        padding: '16px 0',
        'border-radius': '16px',
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface)',
      }}
    >
      {props.children}
    </div>
  </div>
);

const SearchDemo: Component = () => {
  const [log, setLog] = createSignal<string[]>([]);
  const onLog = (line: string) => setLog((l) => [line, ...l].slice(0, 4));
  const [appBarOpen, setAppBarOpen] = createSignal(0);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>
        Click a bar or Tab to it and press Enter, Space, ArrowDown or type. Arrow keys highlight
        suggestions, Enter picks one or searches, Escape clears the highlight then closes. Auto
        layout: docked from 600px, full screen below.
      </p>
      <p class={g.label} aria-live="off">
        Events: {log().join(' · ') || '—'}
      </p>

      <Example label="Contained, auto layout, search icon, avatar">
        <LinkSearch trailing={<Avatar />} onLog={onLog} />
      </Example>

      <Example label="Contained, menu button, voice + avatar, filter chips">
        <LinkSearch
          leading={<IconButton color="standard" icon="menu" label="Open navigation menu" />}
          trailing={
            <>
              <IconButton color="standard" icon="mic" label="Voice search" />
              <Avatar />
            </>
          }
          filters
          onLog={onLog}
        />
      </Example>

      <Example label="Contained, always full screen">
        <LinkSearch layout="full-screen" onLog={onLog} />
      </Example>

      <Example label="Divided (baseline), docked">
        <LinkSearch variant="divided" layout="docked" onLog={onLog} />
      </Example>

      <Example label="Divided (baseline), full screen, no leading icon">
        <LinkSearch variant="divided" layout="full-screen" leading={null} onLog={onLog} />
      </Example>

      <Example label="SearchBar: entry point only (opens something else)">
        <div style={{ 'padding-inline': '24px' }}>
          <SearchBar
            placeholder="Search everything"
            leading={<Icon name="search" />}
            trailing={<IconButton color="standard" icon="more_vert" label="More options" />}
            onActivate={() => onLog('SearchBar activated')}
          />
        </div>
      </Example>

      <Example label="Search app bar hosting a Search (docked/full-screen view)">
        <AppBar
          variant="search"
          leading={<IconButton color="standard" icon="menu" label="Open navigation menu" />}
          trailing={<Avatar />}
          search={<LinkSearch onLog={onLog} />}
        />
      </Example>

      <Example label="Search app bar with the built-in trigger">
        <AppBar
          variant="search"
          searchPlaceholder="Search links"
          searchLeading={<Icon name="search" />}
          searchTrailing={<IconButton color="standard" icon="mic" label="Voice search" />}
          onSearchOpen={() => {
            setAppBarOpen((n) => n + 1);
            onLog(`onSearchOpen (${appBarOpen()})`);
          }}
        />
      </Example>
    </div>
  );
};

export default SearchDemo;
