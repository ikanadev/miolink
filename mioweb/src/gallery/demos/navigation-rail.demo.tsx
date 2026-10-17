import { createSignal, For, type Component, type JSX } from 'solid-js';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { Checkbox } from '../../components/ui/checkbox';
import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailSection,
} from '../../components/ui/navigation-rail';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'navigation-rail', name: 'Navigation rail' };

const note = {
  margin: '0',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
} as const;

const DESTINATIONS = [
  { value: 'inbox', label: 'Inbox', icon: 'inbox' },
  { value: 'starred', label: 'Starred', icon: 'star' },
  { value: 'sent', label: 'Sent', icon: 'send' },
  { value: 'drafts', label: 'Drafts', icon: 'draft' },
  { value: 'trash', label: 'Trash', icon: 'delete' },
];

/** A flex row: rail on the leading edge, filler content that reflows next to it. */
const Frame = (props: { children: JSX.Element; height?: string }) => (
  <div
    class={g.frame}
    style={{ display: 'flex', overflow: 'hidden', 'block-size': props.height ?? '520px', padding: '0' }}
  >
    {props.children}
  </div>
);

const Content = (props: { children?: JSX.Element }) => (
  <div style={{ flex: '1', 'min-inline-size': '0', overflow: 'auto' }}>
    {props.children}
    <div class={g.filler}>
      <For each={Array.from({ length: 8 })}>{() => <div />}</For>
    </div>
  </div>
);

const railStyle = { 'block-size': '100%' };

const NavigationRailDemo: Component = () => {
  const [value, setValue] = createSignal('inbox');
  const [expanded, setExpanded] = createSignal(false);
  const [unread, setUnread] = createSignal(12);
  const [narrow, setNarrow] = createSignal(false);
  const [center, setCenter] = createSignal(false);
  const [fill, setFill] = createSignal(false);
  const [divider, setDivider] = createSignal(true);
  const [noFill, setNoFill] = createSignal(false);

  const [modalOpen, setModalOpen] = createSignal(false);
  const [hiddenOpen, setHiddenOpen] = createSignal(false);
  const [hiddenModalOpen, setHiddenModalOpen] = createSignal(false);

  const items = () => (
    <>
      <NavigationRailItem value="inbox" label="Inbox" icon="inbox" badge={unread()} badgeLabel={`${unread()} unread`} />
      <NavigationRailItem value="starred" label="Starred" icon="star" />
      <NavigationRailItem value="sent" label="Sent" icon="send" />
      <NavigationRailItem value="chat" label="Chat" icon="chat_bubble" badge />
      <NavigationRailItem value="meet" label="Meet" icon="videocam" badge={1200} />
    </>
  );

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>
        Collapsed ↔ expanded (standard): menu button, FAB ↔ extended FAB, badges move after the label,
        secondary destinations when expanded; the content reflows
      </p>
      <div class={g.row} style={{ 'flex-wrap': 'wrap', gap: '8px 16px' }}>
        <Checkbox checked={narrow()} onCheckedChange={(c) => setNarrow(c === true)}>
          Narrow (80px)
        </Checkbox>
        <Checkbox checked={center()} onCheckedChange={(c) => setCenter(c === true)}>
          Center-aligned items
        </Checkbox>
        <Checkbox checked={fill()} onCheckedChange={(c) => setFill(c === true)}>
          Fill indicator (expanded)
        </Checkbox>
        <Checkbox checked={divider()} onCheckedChange={(c) => setDivider(c === true)}>
          Divider
        </Checkbox>
        <Checkbox checked={noFill()} onCheckedChange={(c) => setNoFill(c === true)}>
          No container fill
        </Checkbox>
      </div>
      <Frame>
        <NavigationRail
          label="Mail"
          style={railStyle}
          value={value()}
          onValueChange={(v) => {
            setValue(v);
            if (v === 'inbox') setUnread(0);
          }}
          expanded={expanded()}
          onExpandedChange={setExpanded}
          narrow={narrow()}
          alignment={center() ? 'center' : 'top'}
          indicator={fill() ? 'fill' : 'hug'}
          divider={divider()}
          fill={!noFill()}
          fab={{ icon: 'edit', label: 'Compose' }}
          secondary={
            <NavigationRailSection label="Labels">
              <NavigationRailItem value="work" label="Work" icon="label" />
              <NavigationRailItem value="family" label="Family" icon="label" badge={3} />
            </NavigationRailSection>
          }
        >
          {items()}
        </NavigationRail>
        <Content>
          <p style={{ ...note, padding: '16px 16px 0' }}>
            Selected: {value()} · {expanded() ? 'expanded' : 'collapsed'}
          </p>
        </Content>
      </Frame>

      <p class={g.label}>Modal expanded rail: the menu button opens it over the content (Escape, scrim or a selection closes it)</p>
      <Frame height="440px">
        <NavigationRail
          label="Library"
          style={railStyle}
          modal
          expanded={modalOpen()}
          onExpandedChange={setModalOpen}
          defaultValue="starred"
          fab={{ icon: 'add', label: 'New', color: 'secondary-container' }}
          secondary={
            <NavigationRailSection label="Folders">
              <NavigationRailItem value="photos" label="Photos" icon="folder" />
              <NavigationRailItem value="music" label="Music" icon="folder" />
            </NavigationRailSection>
          }
        >
          <For each={DESTINATIONS.slice(0, 4)}>
            {(d) => <NavigationRailItem value={d.value} label={d.label} icon={d.icon} />}
          </For>
        </NavigationRail>
        <Content />
      </Frame>

      <p class={g.label}>Hide when collapsed (standard): no collapsed rail; a menu button in the content opens it beside the content</p>
      <Frame height="400px">
        <NavigationRail
          label="Immersive"
          style={railStyle}
          expandedBehavior="hide"
          expanded={hiddenOpen()}
          onExpandedChange={setHiddenOpen}
          defaultValue="inbox"
          divider
        >
          <For each={DESTINATIONS.slice(0, 3)}>
            {(d) => <NavigationRailItem value={d.value} label={d.label} icon={d.icon} />}
          </For>
        </NavigationRail>
        <Content>
          <div style={{ padding: '8px' }}>
            <IconButton
              color="standard"
              icon="menu"
              label={hiddenOpen() ? 'Hide navigation' : 'Show navigation'}
              aria-expanded={hiddenOpen() ? 'true' : 'false'}
              onClick={() => setHiddenOpen(!hiddenOpen())}
            />
          </div>
        </Content>
      </Frame>

      <p class={g.label}>Hide when collapsed (modal): only the modal, opened from a menu button elsewhere (compact windows)</p>
      <div class={g.row}>
        <IconButton
          color="standard"
          icon="menu"
          label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => setHiddenModalOpen(true)}
        />
        <NavigationRail
          label="Compact"
          modal
          expandedBehavior="hide"
          expanded={hiddenModalOpen()}
          onExpandedChange={setHiddenModalOpen}
          defaultValue="sent"
          indicator="fill"
        >
          <For each={DESTINATIONS}>
            {(d) => <NavigationRailItem value={d.value} label={d.label} icon={d.icon} badge={d.value === 'drafts' ? 2 : undefined} />}
          </For>
        </NavigationRail>
        <p style={note}>Fill indicator, 5 destinations</p>
      </div>

      <p class={g.label}>
        Links (aria-current="page"), no menu button or FAB, center-aligned; Arrow Up/Down, Home/End move between items
      </p>
      <Frame height="440px">
        <NavigationRail label="Site" style={railStyle} menuButton={false} alignment="center" defaultValue="news">
          <NavigationRailItem value="news" label="News" icon="newspaper" href="#navigation-rail" />
          <NavigationRailItem
            value="alerts"
            label="Alerts"
            icon="notifications"
            activeIcon="notifications_active"
            href="#navigation-rail"
          />
          <NavigationRailItem value="settings" label="Settings" icon="settings" href="#navigation-rail" />
        </NavigationRail>
        <Content />
      </Frame>

      <p class={g.label}>Expanded by default (uncontrolled), RTL</p>
      <div dir="rtl">
        <Frame height="420px">
          <NavigationRail label="RTL" style={railStyle} defaultExpanded defaultValue="starred" fab={{ icon: 'edit', label: 'Compose' }}>
            <For each={DESTINATIONS.slice(0, 4)}>
              {(d) => <NavigationRailItem value={d.value} label={d.label} icon={d.icon} badge={d.value === 'sent' ? true : undefined} />}
            </For>
          </NavigationRail>
          <Content />
        </Frame>
      </div>
    </div>
  );
};

export default NavigationRailDemo;
