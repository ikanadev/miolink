import { createSignal, For, type Component, type JSX } from 'solid-js';
import { IconButton } from '../../components/ui/buttons/icon-button';
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
  type NavigationDrawerCloseReason,
} from '../../components/ui/navigation-drawer';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'navigation-drawer', name: 'Navigation drawer' };

const note = {
  margin: '0',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
} as const;

/** A flex row: drawer on the start edge, filler content that reflows next to it. */
const Frame = (props: { children: JSX.Element; height?: string }) => (
  <div
    class={g.frame}
    style={{ display: 'flex', overflow: 'hidden', 'block-size': props.height ?? '560px', padding: '0' }}
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

const drawerStyle = { 'block-size': '100%' };

/** The classic mail drawer: destinations with badge text, a divider, a labelled section. */
const MailItems = (props: { unread: number }) => (
  <>
    <NavigationDrawerItem value="inbox" label="Inbox" icon="inbox" badge={props.unread} badgeLabel={`${props.unread} unread`} />
    <NavigationDrawerItem value="outbox" label="Outbox" icon="send" badge={100} />
    <NavigationDrawerItem value="favorites" label="Favorites" icon="favorite" />
    <NavigationDrawerItem value="trash" label="Trash" icon="delete" />
    <NavigationDrawerDivider />
    <NavigationDrawerSection label="Labels">
      <NavigationDrawerItem value="family" label="Family" icon="label" />
      <NavigationDrawerItem value="school" label="School" icon="label" badge />
      <NavigationDrawerItem
        value="work"
        label="Work projects, quarterly reports and long-running threads"
        icon="label"
        badge={1200}
      />
    </NavigationDrawerSection>
  </>
);

const NavigationDrawerDemo: Component = () => {
  const [value, setValue] = createSignal('inbox');
  const [unread, setUnread] = createSignal(24);
  const [dismissOpen, setDismissOpen] = createSignal(true);
  const [modalOpen, setModalOpen] = createSignal(false);
  const [modalValue, setModalValue] = createSignal('favorites');
  const [lastClose, setLastClose] = createSignal<NavigationDrawerCloseReason>();

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p style={note}>
        No longer recommended in M3 Expressive: prefer the expanded navigation rail. Kept for legacy layouts.
      </p>

      <p class={g.label}>
        Standard, permanent: headline, badge text, divider, section, a long label truncated; Arrow Up/Down,
        Home/End move between items
      </p>
      <Frame>
        <NavigationDrawer
          headline="Mail"
          style={drawerStyle}
          value={value()}
          onValueChange={(v) => {
            setValue(v);
            if (v === 'inbox') setUnread(0);
          }}
        >
          <MailItems unread={unread()} />
        </NavigationDrawer>
        <Content>
          <p style={{ ...note, padding: '16px 16px 0' }}>Selected: {value()}</p>
        </Content>
      </Frame>

      <p class={g.label}>Standard, dismissible: a menu button in the content opens and closes it; the content reflows</p>
      <Frame height="480px">
        <NavigationDrawer
          headline="Photos"
          style={drawerStyle}
          dismissible
          open={dismissOpen()}
          defaultValue="library"
        >
          <NavigationDrawerItem value="library" label="Library" icon="photo_library" />
          <NavigationDrawerItem value="albums" label="Albums" icon="photo_album" />
          <NavigationDrawerItem value="shared" label="Shared" icon="group" badge={3} />
          <NavigationDrawerItem value="archive" label="Archive" icon="archive" />
        </NavigationDrawer>
        <Content>
          <div style={{ padding: '8px' }}>
            <IconButton
              color="standard"
              icon={dismissOpen() ? 'menu_open' : 'menu'}
              mirror
              label={dismissOpen() ? 'Hide navigation' : 'Show navigation'}
              aria-expanded={dismissOpen() ? 'true' : 'false'}
              onClick={() => setDismissOpen(!dismissOpen())}
            />
          </div>
        </Content>
      </Frame>

      <p class={g.label}>
        Modal: opened from a menu button; closes on scrim, Escape, a swipe toward the start edge (touch) or a selection
      </p>
      <div class={g.row}>
        <IconButton
          color="standard"
          icon="menu"
          label="Open navigation"
          aria-haspopup="dialog"
          onClick={() => setModalOpen(true)}
        />
        <NavigationDrawer
          variant="modal"
          headline="Mail"
          open={modalOpen()}
          onOpenChange={(open, reason) => {
            setModalOpen(open);
            setLastClose(reason);
          }}
          value={modalValue()}
          onValueChange={setModalValue}
        >
          <MailItems unread={8} />
        </NavigationDrawer>
        <p style={note}>
          Selected: {modalValue()}
          {lastClose() ? ` · closed by ${lastClose()}` : ''}
        </p>
      </div>

      <p class={g.label}>Text-only destinations, no headline (aria-label), links with aria-current="page"</p>
      <Frame height="320px">
        <NavigationDrawer label="Settings" style={drawerStyle} defaultValue="general">
          <NavigationDrawerItem value="general" label="General" href="#navigation-drawer" />
          <NavigationDrawerItem value="account" label="Account" href="#navigation-drawer" />
          <NavigationDrawerItem value="privacy" label="Privacy and security" href="#navigation-drawer" />
          <NavigationDrawerItem value="about" label="About" href="#navigation-drawer" />
        </NavigationDrawer>
        <Content />
      </Frame>

      <p class={g.label}>RTL: anchored to the right edge, end corners mirrored</p>
      <div dir="rtl">
        <Frame height="400px">
          <NavigationDrawer headline="Mail" style={drawerStyle} defaultValue="outbox">
            <NavigationDrawerItem value="inbox" label="Inbox" icon="inbox" badge={5} />
            <NavigationDrawerItem value="outbox" label="Outbox" icon="send" />
            <NavigationDrawerItem value="trash" label="Trash" icon="delete" />
          </NavigationDrawer>
          <Content />
        </Frame>
      </div>
    </div>
  );
};

export default NavigationDrawerDemo;
