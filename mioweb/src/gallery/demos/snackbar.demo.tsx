import { createSignal, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import {
  createSnackbar,
  SnackbarHost,
  type SnackbarDismissReason,
  type SnackbarOptions,
} from '../../components/ui/snackbar';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'snackbar', name: 'Snackbar' };

// The demo has its own manager and host; the app mounts the default one once.
const demo = createSnackbar();

const SnackbarDemo: Component = () => {
  const [align, setAlign] = createSignal<'center' | 'start'>('center');
  const [aboveFab, setAboveFab] = createSignal(false);
  const [log, setLog] = createSignal('Nothing yet');

  const show = (options: SnackbarOptions) =>
    demo.show({
      ...options,
      onClose: (reason: SnackbarDismissReason) => setLog(`"${options.message}" closed: ${reason}`),
    });

  let count = 0;

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Single line (auto-dismiss after 4s)</p>
      <div class={g.row}>
        <Button color="tonal" onClick={() => show({ message: 'Saved to Mio Link' })}>
          Saved
        </Button>
        <Button color="tonal" onClick={() => show({ message: 'Directory deleted' })}>
          Deleted
        </Button>
        <Button color="tonal" onClick={() => show({ message: 'Link copied', duration: 10000 })}>
          10s
        </Button>
      </div>

      <p class={g.label}>With action (persists until acted on or dismissed)</p>
      <div class={g.row}>
        <Button
          color="tonal"
          onClick={() =>
            show({ message: "Couldn't connect", actionLabel: 'Retry', onAction: () => setLog('Retry pressed') })
          }
        >
          Retry
        </Button>
        <Button
          color="tonal"
          onClick={() =>
            show({
              message: 'The API key was rejected',
              actionLabel: 'Settings',
              closable: true,
              onAction: () => setLog('Settings pressed'),
            })
          }
        >
          Settings + close
        </Button>
        <Button
          color="tonal"
          onClick={() => show({ message: 'Link moved', actionLabel: 'Undo', duration: 4000 })}
        >
          Action, 4s asked (raised to 10s)
        </Button>
      </div>

      <p class={g.label}>Close icon, two lines, longer action</p>
      <div class={g.row}>
        <Button color="tonal" onClick={() => show({ message: 'Saved to Mio Link', closable: true })}>
          Close icon
        </Button>
        <Button
          color="tonal"
          onClick={() =>
            show({
              message: 'Saved to Mio Link without a title. The page took too long to answer, so the hostname is used.',
              closable: true,
            })
          }
        >
          Two lines
        </Button>
        <Button
          color="tonal"
          onClick={() =>
            show({
              message: "Couldn't load the page's title and preview image",
              actionLabel: 'Retry',
            })
          }
        >
          Two lines + action
        </Button>
        <Button
          color="tonal"
          onClick={() =>
            show({
              message: 'Saved to Mio Link without a thumbnail',
              actionLabel: 'Refresh metadata',
              longAction: true,
              closable: true,
            })
          }
        >
          Longer action
        </Button>
      </div>

      <p class={g.label}>Queue (one at a time) and replace</p>
      <div class={g.row}>
        <Button
          color="outlined"
          onClick={() => {
            for (const n of [1, 2, 3]) show({ message: `Queued message ${n} of 3` });
          }}
        >
          Queue three
        </Button>
        <Button
          color="outlined"
          onClick={() => show({ message: `Syncing… (update ${++count})`, replace: true })}
        >
          Replace
        </Button>
        <Button color="outlined" onClick={() => demo.dismiss()}>
          Dismiss
        </Button>
      </div>

      <p class={g.label}>Placement (medium and wider windows), offset above a FAB</p>
      <div class={g.row}>
        <Button
          color="outlined"
          toggle
          selected={align() === 'start'}
          onSelectedChange={(on) => setAlign(on ? 'start' : 'center')}
        >
          Start-aligned
        </Button>
        <Button color="outlined" toggle selected={aboveFab()} onSelectedChange={setAboveFab}>
          Above FAB
        </Button>
      </div>

      <p class={g.label}>
        Alt+G focuses the snackbar, Esc dismisses it. Last event: {log()}
      </p>

      {/* Above a 56px FAB with its 16px margin (derived example). */}
      <SnackbarHost snackbar={demo} align={align()} bottomOffset={aboveFab() ? '72px' : undefined} />
    </div>
  );
};

export default SnackbarDemo;
