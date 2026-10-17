import { createSignal, For, type Component, type JSX } from 'solid-js';
import { CheckboxIcon } from '../../components/ui/checkbox';
import { Icon } from '../../components/ui/icon';
import { IconButton } from '../../components/ui/buttons/icon-button';
import {
  List,
  ListDivider,
  ListItem,
  ListItemAvatar,
  ListItemImage,
} from '../../components/ui/list';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'list', name: 'List' };

/** Placeholder thumbnail (no network in the gallery). */
const thumb = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="56" height="56" fill="url(#g)"/></svg>`,
  )}`;

const LINKS = [
  { title: 'SolidJS: reactive JavaScript library', url: 'https://www.solidjs.com/', src: thumb('#4f88c6', '#2c4f7c') },
  { title: 'Material Design 3', url: 'https://m3.material.io/components/lists', src: thumb('#7d5260', '#d0bcff') },
  { title: 'A very long link title that does not fit on a single line and gets truncated', url: 'https://example.com/a/very/long/path/that/keeps/going/and/going', src: thumb('#386a20', '#b7f397') },
];

const Column = (props: { title: string; children: JSX.Element; frame?: boolean }) => (
  <div style={{ display: 'grid', gap: '8px', 'align-content': 'start' }}>
    <p class={g.label}>{props.title}</p>
    <div
      style={
        props.frame
          ? { padding: '8px', 'border-radius': '24px', background: 'var(--md-sys-color-surface-container)' }
          : { border: '1px solid var(--md-sys-color-outline-variant)', 'border-radius': '16px', padding: '8px 0' }
      }
    >
      {props.children}
    </div>
  </div>
);

const ListDemo: Component = () => {
  const [event, setEvent] = createSignal('Click, right click or long press an item');
  const [sort, setSort] = createSignal(['name']);
  const [tags, setTags] = createSignal(['work', 'later']);
  const menu = (name: string) => (e: MouseEvent) => {
    e.preventDefault();
    setEvent(`Context menu: ${name}`);
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>{event()}</p>
      <div
        style={{
          display: 'grid',
          gap: '24px',
          'grid-template-columns': 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        }}
      >
        <Column title="Single-action: directories and links">
          <List label="Directory contents">
            <For each={['Reading', 'Recipes']}>
              {(name) => (
                <ListItem
                  leadingIcon="folder"
                  headline={name}
                  trailingIcon="chevron_right"
                  onClick={() => setEvent(`Open directory: ${name}`)}
                  onContextMenu={menu(name)}
                />
              )}
            </For>
            <For each={LINKS}>
              {(link) => (
                <ListItem
                  leading={<ListItemImage src={link.src} />}
                  headline={link.title}
                  supportingText={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onContextMenu={menu(link.title)}
                />
              )}
            </For>
          </List>
        </Column>

        <Column title="Multi-action: trailing icon buttons">
          <List label="Links" interaction="multi-action">
            <For each={LINKS}>
              {(link) => (
                <ListItem
                  leading={<ListItemImage src={link.src} />}
                  headline={link.title}
                  supportingText={link.url}
                  onClick={() => setEvent(`Open: ${link.title}`)}
                  onContextMenu={menu(link.title)}
                  trailing={
                    <IconButton
                      color="standard"
                      icon="more_vert"
                      label={`More actions for ${link.title}`}
                      onClick={() => setEvent(`More: ${link.title}`)}
                    />
                  }
                />
              )}
            </For>
            <ListItem leadingIcon="folder" headline="Disabled" disabled trailing={<IconButton color="standard" icon="more_vert" label="More" disabled />} />
          </List>
        </Column>

        <Column title="Segmented (on surface-container)" frame>
          <List label="Settings" segmented>
            <ListItem leadingIcon="wifi" headline="Network" supportingText="Wi-Fi, mobile data" />
            <ListItem leadingIcon="palette" headline="Appearance" supportingText="Theme, contrast" selected />
            <ListItem leadingIcon="notifications" headline="Notifications" />
            <ListItem leadingIcon="lock" headline="Security" disabled />
          </List>
        </Column>

        <Column title="Lines, overline, trailing text, avatar, video">
          <List label="Lines">
            <ListItem leading={<ListItemAvatar>A</ListItemAvatar>} headline="One line" trailingText="100+" />
            <ListItem
              leading={<ListItemAvatar>B</ListItemAvatar>}
              headline="Two lines"
              supportingText="Supporting text"
              trailingText="Jun 12"
            />
            <ListItem
              leading={<ListItemAvatar>C</ListItemAvatar>}
              overline="Overline"
              headline="Three lines"
              supportingText="Supporting text"
              trailingIcon="star"
            />
            <ListItem
              leadingIcon="article"
              headline="Three lines, two of supporting text"
              supportingText="Supporting text that is long enough to wrap onto a second line before it gets truncated with an ellipsis."
              lines={3}
            />
            <ListItem leading={<ListItemImage kind="video" src={thumb('#6750a4', '#f2b8b5')} />} headline="Video" supportingText="100x56" />
            <ListItem leading={<ListItemImage kind="video-large" src={thumb('#006a6a', '#cce8e7')} />} headline="Large video" supportingText="114x64" />
          </List>
        </Column>

        <Column title={`Single select (check indicator): ${sort().join()}`}>
          <List label="Sort links by" selection="single" value={sort()} onValueChange={setSort}>
            <ListItem value="name" leadingIcon="sort_by_alpha" headline="Name" />
            <ListItem value="date" leadingIcon="schedule" headline="Date added" />
            <ListItem value="views" leadingIcon="visibility" headline="Most viewed" />
            <ListItem value="url" leadingIcon="link" headline="Address" disabled />
          </List>
        </Column>

        <Column title={`Multi select (leading checkbox): ${tags().join(', ')}`}>
          <List
            label="Select tags"
            selection="multi"
            selectionIndicator="none"
            value={tags()}
            onValueChange={setTags}
          >
            <For each={['work', 'later', 'reference', 'archive']}>
              {(tag) => (
                <ListItem
                  value={tag}
                  headline={tag}
                  disabled={tag === 'archive'}
                  leading={
                    // Decorative: the option is the control and exposes aria-selected.
                    <CheckboxIcon checked={tags().includes(tag)} disabled={tag === 'archive'} />
                  }
                />
              )}
            </For>
          </List>
        </Column>

        <Column title="States: selected, disabled, selected disabled, dragged">
          <List label="States">
            <ListItem leadingIcon="folder" headline="Enabled" trailingIcon="chevron_right" />
            <ListItem leadingIcon="folder" headline="Selected" trailingIcon="check" selected />
            <ListItem leadingIcon="folder" headline="Disabled" disabled />
            <ListItem leadingIcon="folder" headline="Selected, disabled" trailingIcon="check" selected disabled />
            <ListItem leadingIcon="drag_indicator" headline="Dragged" dragged />
          </List>
        </Column>

        <Column title="Expand and collapse">
          <List label="Directories">
            <ListItem
              leadingIcon="folder"
              headline="Projects"
              supportingText="2 items"
              defaultExpanded
              nested={
                <List label="Projects">
                  <ListItem leadingIcon="folder" headline="miolink" />
                  <ListItem leadingIcon="link" headline="Ark UI" supportingText="https://ark-ui.com" />
                </List>
              }
            />
            <ListItem
              leadingIcon="folder"
              headline="Archive"
              nested={
                <List label="Archive">
                  <ListItem leadingIcon="link" headline="Old link" />
                </List>
              }
            />
          </List>
        </Column>

        <Column title="Baseline with dividers; non-interactive">
          <List label="Baseline" variant="baseline">
            <ListItem leadingIcon="inbox" headline="Inbox" trailingText="24" />
            <ListDivider />
            <ListItem leading={<ListItemImage src={thumb('#984061', '#ffd9e2')} />} headline="Image (0 corners)" />
            <ListDivider inset />
            <ListItem leadingIcon="send" headline="Selected" selected />
          </List>
          <div style={{ 'block-size': '1px', background: 'var(--md-sys-color-outline-variant)' }} />
          <List label="Details" interaction="non-interactive">
            <ListItem leadingIcon="schedule" overline="Created" headline="Oct 12, 2026" />
            <ListItem leadingIcon="visibility" overline="Views" headline="42" />
          </List>
        </Column>
      </div>
    </div>
  );
};

export default ListDemo;
