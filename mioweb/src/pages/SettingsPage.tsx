import { useSelector } from '@tanstack/solid-store';
import { createSignal, Show, type Component } from 'solid-js';
import { AppBar } from '../components/ui/app-bar';
import { Button, ButtonGroup } from '../components/ui/buttons';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Dialog } from '../components/ui/dialog';
import { Icon } from '../components/ui/icon';
import { List, ListItem } from '../components/ui/list';
import { TextField } from '../components/ui/text-field';
import { createClients } from '../core/api';
import { errorMessage, toApiError } from '../core/errors';
import { notify } from '../core/feedback';
import { formatRelative, plural } from '../core/format';
import {
  normalizeBaseUrl,
  settingsStore,
  updateSettings,
  validateBaseUrl,
  type ContrastPreference,
  type ThemePreference,
} from '../core/settings';
import { useTree } from '../tree/lookup';
import { clearTree, refresh, syncStore } from '../tree/store';
import { PageBody, Section } from './parts';
import styles from './settings.module.css';

/**
 * Server connection, appearance and sync. With `setup`, it's the first
 * screen: only the connection form, which opens the Library once saved.
 */
export const SettingsPage: Component<{ setup?: boolean }> = (props) => (
  <Show
    when={!props.setup}
    fallback={
      <div class={styles.setup}>
        <div class={styles.setupHeader}>
          <div class={styles.logo}>
            <Icon name="bookmarks" filled size={36} />
          </div>
          <h1 class={styles.setupTitle}>Welcome to Mio Link</h1>
          <p class={styles.setupText}>Connect to your miolink server to see your links on this device.</p>
        </div>
        <ServerForm setup />
      </div>
    }
  >
    <AppBar variant="medium-flexible" title="Settings" />
    <PageBody>
      <div class={styles.columns}>
        <Section title="Server">
          <ServerForm />
        </Section>
        <Section title="Appearance">
          <Appearance />
        </Section>
        <Section title="Sync">
          <SyncStatus />
        </Section>
        <Show when={import.meta.env.DEV}>
          <Section title="Developer">
            <div class={styles.buttons}>
              <Button color="outlined" icon="widgets" href="/gallery">
                Component gallery
              </Button>
            </div>
          </Section>
        </Show>
      </div>
    </PageBody>
  </Show>
);

/**
 * Server address and API key. Saving checks them with `Ping` first, so a
 * typo or a wrong key is caught here instead of on every screen.
 */
const ServerForm: Component<{ setup?: boolean }> = (props) => {
  const settings = useSelector(settingsStore);
  const [baseUrl, setBaseUrl] = createSignal(settings().baseUrl);
  const [apiKey, setApiKey] = createSignal(settings().apiKey);
  const [showKey, setShowKey] = createSignal(false);
  const [urlError, setUrlError] = createSignal<string>();
  const [keyError, setKeyError] = createSignal<string>();
  const [checking, setChecking] = createSignal(false);
  const [confirmDisconnect, setConfirmDisconnect] = createSignal(false);

  const dirty = () => normalizeBaseUrl(baseUrl()) !== settings().baseUrl || apiKey().trim() !== settings().apiKey;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (checking()) return;
    const url = normalizeBaseUrl(baseUrl());
    const key = apiKey().trim();
    const invalidUrl = validateBaseUrl(url);
    setUrlError(invalidUrl);
    setKeyError(key ? undefined : 'Enter the API key.');
    if (invalidUrl || !key) return;

    setChecking(true);
    try {
      await createClients(url, key).health.ping({});
      setBaseUrl(url);
      updateSettings({ baseUrl: url, apiKey: key });
      notify(props.setup ? 'Connected' : 'Server settings saved');
    } catch (err) {
      const error = toApiError(err);
      if (error.kind === 'unauthenticated') setKeyError('The server rejected this key.');
      else if (error.kind === 'unreachable')
        setUrlError('Couldn’t reach this server. Check the address, and that it allows this site (MIOLINK_CORS_ORIGINS).');
      else setUrlError(errorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  const disconnect = () => {
    updateSettings({ apiKey: '' });
    clearTree();
    setApiKey('');
  };

  return (
    <form class={styles.form} onSubmit={submit} novalidate>
      <TextField
        variant="outlined"
        label="Server address"
        type="url"
        inputMode="url"
        autocomplete="url"
        spellcheck={false}
        placeholder="https://links.example.com"
        leading={<Icon name="dns" />}
        value={baseUrl()}
        onValueChange={(v) => {
          setBaseUrl(v);
          setUrlError(undefined);
        }}
        errorText={urlError()}
        supportingText="The address of your miobackend server"
        readOnly={checking()}
      />
      <TextField
        variant="outlined"
        label="API key"
        type={showKey() ? 'text' : 'password'}
        autocomplete="off"
        spellcheck={false}
        leading={<Icon name="key" />}
        trailing={
          <IconButton
            color="standard"
            icon={showKey() ? 'visibility_off' : 'visibility'}
            label={showKey() ? 'Hide API key' : 'Show API key'}
            onClick={() => setShowKey(!showKey())}
          />
        }
        value={apiKey()}
        onValueChange={(v) => {
          setApiKey(v);
          setKeyError(undefined);
        }}
        errorText={keyError()}
        supportingText="Created with make keygen. It’s stored in this browser only."
        readOnly={checking()}
      />
      <div class={styles.buttons}>
        <Button color="filled" type="submit" icon={props.setup ? 'link' : 'check'} disabled={checking() || (!props.setup && !dirty())}>
          {checking() ? 'Checking…' : props.setup ? 'Connect' : 'Save'}
        </Button>
        <Show when={!props.setup && settings().apiKey}>
          <Button color="text" icon="logout" onClick={() => setConfirmDisconnect(true)} disabled={checking()}>
            Disconnect this browser
          </Button>
        </Show>
      </div>

      <Dialog.Root open={confirmDisconnect()} onOpenChange={setConfirmDisconnect}>
        <Dialog.Content
          icon="logout"
          headline="Disconnect this browser?"
          supportingText="The API key and the saved copy of your links are removed from this browser. Your links stay on the server."
          actions={<Dialog.Action close>Cancel</Dialog.Action>}
          confirmAction={
            <Dialog.Action close onClick={disconnect}>
              Disconnect
            </Dialog.Action>
          }
        />
      </Dialog.Root>
    </form>
  );
};

const THEMES: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: 'brightness_auto' },
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
];

const CONTRASTS: { value: ContrastPreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'standard', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const Appearance: Component = () => {
  const settings = useSelector(settingsStore);
  return (
    <div class={styles.appearance}>
      <div class={styles.option}>
        <span class={styles.optionLabel}>
          Theme
        </span>
        <ButtonGroup
          variant="connected"
          selection="single"
          required
          label="Theme"
          value={[settings().theme]}
          onValueChange={(v) => v[0] && updateSettings({ theme: v[0] as ThemePreference })}
        >
          {THEMES.map((t) => (
            <Button color="tonal" value={t.value} icon={t.icon}>
              {t.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div class={styles.option}>
        <span class={styles.optionLabel}>Contrast</span>
        <ButtonGroup
          variant="connected"
          selection="single"
          required
          label="Contrast"
          value={[settings().contrast]}
          onValueChange={(v) => v[0] && updateSettings({ contrast: v[0] as ContrastPreference })}
        >
          {CONTRASTS.map((c) => (
            <Button color="tonal" value={c.value}>
              {c.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    </div>
  );
};

const SyncStatus: Component = () => {
  const sync = useSelector(syncStore);
  const tree = useTree();
  const status = () => {
    const s = sync();
    if (s.syncing) return 'Syncing…';
    if (s.error) return `Failed: ${errorMessage(s.error)}`;
    if (s.syncedAt) return `Up to date, checked ${formatRelative(s.syncedAt)}`;
    return tree().loaded ? 'Showing the saved copy' : 'Not synced yet';
  };

  const resync = () => {
    clearTree();
    void refresh();
  };

  return (
    <div class={styles.sync}>
      <List label="Sync status" interaction="non-interactive" class={styles.syncList}>
        <ListItem
          leadingIcon={sync().error ? 'sync_problem' : 'cloud_done'}
          overline="Status"
          headline={status()}
        />
        <ListItem
          leadingIcon="folder_copy"
          overline="Saved in this browser"
          headline={`${plural(tree().directories.size > 0 ? tree().directories.size - 1 : 0, 'directory', 'directories')} · ${plural(tree().allLinks.length, 'link', 'links')}`}
          trailingText={tree().loaded ? `Revision ${tree().revision}` : undefined}
        />
      </List>
      <div class={styles.buttons}>
        <Button color="tonal" icon="sync" onClick={() => void refresh()} disabled={sync().syncing}>
          Sync now
        </Button>
        <Button color="text" icon="restart_alt" onClick={resync} disabled={sync().syncing}>
          Download everything again
        </Button>
      </div>
    </div>
  );
};
