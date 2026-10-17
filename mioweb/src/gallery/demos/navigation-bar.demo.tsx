import { createSignal, For, type Component } from 'solid-js';
import { NavigationBar, NavigationBarItem } from '../../components/ui/navigation-bar';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'navigation-bar', name: 'Navigation bar' };

const note = {
  margin: '0',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
} as const;

const DESTINATIONS = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'search', label: 'Search', icon: 'search' },
  { value: 'library', label: 'Library', icon: 'library_music' },
  { value: 'saved', label: 'Saved', icon: 'bookmark' },
  { value: 'profile', label: 'Profile', icon: 'person' },
];

const NavigationBarDemo: Component = () => {
  const [value, setValue] = createSignal('home');
  const [reselects, setReselects] = createSignal(0);
  const [inbox, setInbox] = createSignal(3);
  const [scroller, setScroller] = createSignal<HTMLElement>();

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>Vertical items (compact), 3 destinations, controlled; select the active one again to reselect</p>
      <div style={{ 'max-inline-size': '412px' }}>
        <NavigationBar
          label="Main"
          layout="vertical"
          value={value()}
          onValueChange={setValue}
          onReselect={() => setReselects((n) => n + 1)}
        >
          <For each={DESTINATIONS.slice(0, 3)}>
            {(d) => <NavigationBarItem value={d.value} label={d.label} icon={d.icon} />}
          </For>
        </NavigationBar>
      </div>
      <p style={note}>
        Selected: {value()} · reselected {reselects()} times
      </p>

      <p class={g.label}>Vertical, 5 destinations with small and large badges (the inbox count clears when selected)</p>
      <div style={{ 'max-inline-size': '412px' }}>
        <NavigationBar
          label="Mail"
          layout="vertical"
          defaultValue="mail"
          onValueChange={(v) => v === 'inbox' && setInbox(0)}
        >
          <NavigationBarItem value="mail" label="Mail" icon="mail" />
          <NavigationBarItem value="inbox" label="Inbox" icon="inbox" badge={inbox()} badgeLabel={`${inbox()} unread`} />
          <NavigationBarItem value="chat" label="Chat" icon="chat_bubble" badge />
          <NavigationBarItem value="meet" label="Meet" icon="videocam" badge={1200} />
          <NavigationBarItem value="spaces" label="Spaces" icon="group" />
        </NavigationBar>
      </div>

      <p class={g.label}>Horizontal items (medium), 4 destinations, centered with equal widths</p>
      <NavigationBar label="Library sections" layout="horizontal" defaultValue="home">
        <For each={DESTINATIONS.slice(0, 4)}>
          {(d) => (
            <NavigationBarItem
              value={d.value}
              label={d.label}
              icon={d.icon}
              badge={d.value === 'saved' ? 12 : undefined}
              aria-label={d.value === 'library' ? 'Music library' : undefined}
            />
          )}
        </For>
      </NavigationBar>

      <p class={g.label}>Auto layout: drag the corner; vertical below 600px, horizontal from 600px</p>
      <div
        style={{
          resize: 'horizontal',
          overflow: 'hidden',
          'inline-size': '420px',
          'min-inline-size': '280px',
          'max-inline-size': '100%',
          border: '1px dashed var(--md-sys-color-outline-variant)',
        }}
      >
        <NavigationBar label="Adaptive" defaultValue="search">
          <For each={DESTINATIONS.slice(0, 4)}>
            {(d) => <NavigationBarItem value={d.value} label={d.label} icon={d.icon} />}
          </For>
        </NavigationBar>
      </div>

      <p class={g.label}>Links (aria-current="page"), Space or Enter follows them; activeIcon swaps the glyph</p>
      <div style={{ 'max-inline-size': '412px' }}>
        <NavigationBar label="Site" layout="vertical" defaultValue="news">
          <NavigationBarItem
            value="news"
            label="News"
            icon="newspaper"
            href="#navigation-bar"
          />
          <NavigationBarItem value="alerts" label="Alerts" icon="notifications" activeIcon="notifications_active" href="#navigation-bar" />
          <NavigationBarItem value="settings" label="Settings" icon="settings" href="#navigation-bar" />
        </NavigationBar>
      </div>

      <p class={g.label}>Hide on scroll: scroll down to hide, up to show; Tab into it shows it</p>
      <div style={{ 'max-inline-size': '412px' }}>
        <div ref={setScroller} class={g.frame} style={{ display: 'flex', 'flex-direction': 'column' }}>
          <div class={g.filler} style={{ flex: '1' }}>
            <For each={Array.from({ length: 12 })}>{() => <div />}</For>
          </div>
          <NavigationBar
            label="Scrolling"
            layout="vertical"
            defaultValue="home"
            hideOnScroll
            scrollTarget={scroller()}
            style={{ position: 'sticky', bottom: '0' }}
          >
            <For each={DESTINATIONS.slice(0, 4)}>
              {(d) => <NavigationBarItem value={d.value} label={d.label} icon={d.icon} />}
            </For>
          </NavigationBar>
        </div>
      </div>
    </div>
  );
};

export default NavigationBarDemo;
