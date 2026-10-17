import { createSignal, For, type Component } from 'solid-js';
import { Tab, TabList, TabPanel, Tabs } from '../../components/ui/tabs';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'tabs', name: 'Tabs' };

const panel = {
  padding: '16px',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
} as const;

const TRAVEL = [
  { value: 'flights', label: 'Flights', icon: 'flight' },
  { value: 'trips', label: 'Trips', icon: 'luggage' },
  { value: 'explore', label: 'Explore', icon: 'explore' },
];

const CATEGORIES = [
  'Overview',
  'Specifications',
  'Reviews',
  'Accessories',
  'Support',
  'Warranty',
  'Downloads',
  'Community',
  'Related products',
];

const TabsDemo: Component = () => {
  const [inbox, setInbox] = createSignal(5);
  const [value, setValue] = createSignal('flights');

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>Primary, label only, with panels (Space/Enter or click activates; arrows move focus)</p>
      <Tabs value={value()} onValueChange={setValue}>
        <TabList label="Travel">
          <For each={TRAVEL}>{(t) => <Tab value={t.value}>{t.label}</Tab>}</For>
        </TabList>
        <For each={TRAVEL}>
          {(t) => (
            <TabPanel value={t.value} style={panel}>
              {t.label} content. Selected: {value()}
            </TabPanel>
          )}
        </For>
      </Tabs>

      <p class={g.label}>Primary, icon + label stacked (64px), with badges</p>
      <Tabs defaultValue="flights">
        <TabList label="Travel with icons">
          <Tab value="flights" icon="flight">
            Flights
          </Tab>
          <Tab value="trips" icon="luggage" badge>
            Trips
          </Tab>
          <Tab value="explore" icon="explore" badge={1000}>
            Explore
          </Tab>
        </TabList>
      </Tabs>

      <p class={g.label}>Primary, icon + label inline (48px), badge after the label; centered from 600px</p>
      <Tabs defaultValue="inbox" onValueChange={(v) => v === 'inbox' && setInbox(0)}>
        <TabList label="Mail" iconPlacement="inline" align="center">
          <Tab value="sent" icon="send">
            Sent
          </Tab>
          <Tab value="inbox" icon="inbox" badge={inbox()} badgeLabel={`${inbox()} unread`}>
            Inbox
          </Tab>
          <Tab value="drafts" icon="draft">
            Drafts
          </Tab>
        </TabList>
      </Tabs>

      <p class={g.label}>Primary, icon only (accessible names), with badges</p>
      <Tabs defaultValue="photos">
        <TabList label="Media">
          <Tab value="photos" icon="photo" label="Photos" />
          <Tab value="videos" icon="videocam" label="Video format media content" badge={3} />
          <Tab value="audio" icon="music_note" label="Audio" badge />
        </TabList>
      </Tabs>

      <p class={g.label}>Secondary, label only and label + inline badge</p>
      <Tabs defaultValue="overview">
        <TabList variant="secondary" label="Product sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="specs">Specifications</Tab>
          <Tab value="reviews" badge="New">
            Reviews
          </Tab>
        </TabList>
      </Tabs>

      <p class={g.label}>Secondary, icon + label inline</p>
      <Tabs defaultValue="map">
        <TabList variant="secondary" iconPlacement="inline" label="Views">
          <Tab value="map" icon="map">
            Map
          </Tab>
          <Tab value="list" icon="list">
            List
          </Tab>
        </TabList>
      </Tabs>

      <p class={g.label}>Scrollable, primary (52px leading offset; the selected tab scrolls into view)</p>
      <Tabs defaultValue="Overview">
        <TabList layout="scrollable" label="Categories">
          <For each={CATEGORIES}>{(c) => <Tab value={c}>{c}</Tab>}</For>
        </TabList>
      </Tabs>

      <p class={g.label}>Scrollable, secondary</p>
      <Tabs defaultValue="Reviews">
        <TabList layout="scrollable" variant="secondary" label="Categories, secondary">
          <For each={CATEGORIES}>{(c) => <Tab value={c}>{c}</Tab>}</For>
        </TabList>
      </Tabs>

      <p class={g.label}>Disabled tab (not in the spec; skipped by the keyboard)</p>
      <Tabs defaultValue="all">
        <TabList label="Filter">
          <Tab value="all">All</Tab>
          <Tab value="shared" disabled>
            Shared
          </Tab>
          <Tab value="archived">Archived</Tab>
        </TabList>
      </Tabs>

      <p class={g.label}>Primary over secondary</p>
      <Tabs defaultValue="flights">
        <TabList label="Travel, nested">
          <For each={TRAVEL}>{(t) => <Tab value={t.value}>{t.label}</Tab>}</For>
        </TabList>
        <For each={TRAVEL}>
          {(t) => (
            <TabPanel value={t.value}>
              <Tabs defaultValue="upcoming">
                <TabList variant="secondary" label={`${t.label} filter`}>
                  <Tab value="upcoming">Upcoming</Tab>
                  <Tab value="past">Past</Tab>
                </TabList>
                <TabPanel value="upcoming" style={panel}>
                  Upcoming {t.label.toLowerCase()}
                </TabPanel>
                <TabPanel value="past" style={panel}>
                  Past {t.label.toLowerCase()}
                </TabPanel>
              </Tabs>
            </TabPanel>
          )}
        </For>
      </Tabs>

      <p class={g.label}>Right to left</p>
      <div dir="rtl">
        <Tabs defaultValue="b">
          <TabList layout="scrollable" label="RTL">
            <For each={CATEGORIES.slice(0, 6)}>{(c, i) => <Tab value={String.fromCharCode(97 + i())}>{c}</Tab>}</For>
          </TabList>
        </Tabs>
      </div>
    </div>
  );
};

export default TabsDemo;
