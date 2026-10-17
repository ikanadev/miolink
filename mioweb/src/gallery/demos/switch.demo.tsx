import { createSignal, For, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons';
import { List, ListItem } from '../../components/ui/list';
import { Switch, SwitchIcon, type SwitchIcons } from '../../components/ui/switch';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'switch', name: 'Switch' };

const ICONS: { icons: SwitchIcons; name: string }[] = [
  { icons: 'none', name: 'No icons' },
  { icons: 'selected', name: 'Icon when selected' },
  { icons: 'both', name: 'Icons on both' },
];

const SETTINGS = [
  { value: 'sync', label: 'Sync on open' },
  { value: 'thumbs', label: 'Load thumbnails' },
  { value: 'tabs', label: 'Open links in a new tab' },
  { value: 'beta', label: 'Beta features (disabled)' },
];

const SwitchDemo: Component = () => {
  const [wifi, setWifi] = createSignal(true);
  const [settings, setSettings] = createSignal<string[]>(['sync', 'thumbs']);
  const [submitted, setSubmitted] = createSignal('');

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <For each={ICONS}>
        {(c) => (
          <>
            <p class={g.label}>{c.name}: unselected, selected, disabled unselected, disabled selected</p>
            <div class={g.row} style={{ gap: '16px' }}>
              <Switch icons={c.icons} label={`${c.name}, unselected`} />
              <Switch icons={c.icons} defaultChecked label={`${c.name}, selected`} />
              <Switch icons={c.icons} disabled label={`${c.name}, disabled`} />
              <Switch icons={c.icons} disabled defaultChecked label={`${c.name}, disabled selected`} />
            </div>
          </>
        )}
      </For>

      <p class={g.label}>Settings column: label leading, switch trailing, supporting text (controlled: {wifi() ? 'on' : 'off'})</p>
      <div style={{ display: 'grid', 'max-inline-size': '360px' }}>
        <Switch checked={wifi()} onCheckedChange={setWifi} icons="selected" supportingText="Use Wi-Fi when available">
          Wi-Fi
        </Switch>
        <Switch defaultChecked supportingText="Use dark colors app-wide">
          Dark theme
        </Switch>
        <Switch icons="both">Show link counts</Switch>
        <Switch disabled supportingText="Not available on this device">
          Haptics
        </Switch>
      </div>

      <p class={g.label}>In a form (submits name=value only when on){submitted() && `: ${submitted()}`}</p>
      <form
        class={g.row}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(`notify=${new FormData(e.currentTarget).get('notify') ?? '(off)'}`);
        }}
      >
        <Switch name="notify" value="yes">
          Notifications
        </Switch>
        <Button type="submit" color="tonal">
          Submit
        </Button>
      </form>

      <p class={g.label}>In a multi-select list (trailing SwitchIcon): {settings().join(', ') || 'none'}</p>
      <div style={{ 'max-inline-size': '360px' }}>
        <List label="Settings" selection="multi" selectionIndicator="none" value={settings()} onValueChange={setSettings}>
          <For each={SETTINGS}>
            {(s) => (
              <ListItem
                value={s.value}
                headline={s.label}
                disabled={s.value === 'beta'}
                trailing={
                  // Decorative: the option is the control and exposes aria-selected.
                  <SwitchIcon checked={settings().includes(s.value)} disabled={s.value === 'beta'} icons="selected" />
                }
              />
            )}
          </For>
        </List>
      </div>

      <p class={g.label}>SwitchIcon (decorative, for rows that are the control themselves)</p>
      <div class={g.row}>
        <SwitchIcon />
        <SwitchIcon checked />
        <SwitchIcon icons="both" />
        <SwitchIcon icons="both" checked />
        <SwitchIcon disabled />
        <SwitchIcon checked disabled />
      </div>
    </div>
  );
};

export default SwitchDemo;
