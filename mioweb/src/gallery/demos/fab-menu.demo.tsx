import { createSignal, For, type Component } from 'solid-js';
import { Button, FabMenu, FabMenuItem, type FabSize } from '../../components/ui/buttons';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'fab-menu', name: 'FAB menu' };

const SIZES: FabSize[] = ['fab', 'medium', 'large'];
const COLORS = ['primary-container', 'secondary', 'tertiary-container'] as const;

const FabMenuDemo: Component = () => {
  const [log, setLog] = createSignal('none');
  const [open, setOpen] = createSignal(false);
  const [visible, setVisible] = createSignal(true);
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Sizes and color sets (primary, secondary, tertiary). The menu opens above the FAB. Last action: {log()}
      </p>
      <div class={g.row} style={{ 'align-items': 'flex-end', 'min-block-size': '360px' }}>
        <For each={SIZES}>
          {(size, i) => (
            <FabMenu size={size} color={COLORS[i()]} icon="add" label={`Create options (${size})`}>
              <FabMenuItem icon="link" label="Link" onClick={() => setLog('link')} />
              <FabMenuItem icon="create_new_folder" label="Directory" onClick={() => setLog('directory')} />
              <FabMenuItem icon="content_paste" label="Paste from clipboard" onClick={() => setLog('paste')} />
            </FabMenu>
          )}
        </For>
      </div>
      <p class={g.label}>
        Six items, one without an icon and one link. In a short window the items scroll behind the close button.
      </p>
      <div class={g.row} style={{ 'align-items': 'flex-end', 'min-block-size': '420px' }}>
        <FabMenu icon="edit" label="Edit options">
          <FabMenuItem icon="content_copy" label="Copy" onClick={() => setLog('copy')} />
          <FabMenuItem icon="content_cut" label="Cut" onClick={() => setLog('cut')} />
          <FabMenuItem icon="content_paste" label="Paste" onClick={() => setLog('paste')} />
          <FabMenuItem label="Select all" onClick={() => setLog('select all')} />
          <FabMenuItem icon="delete" label="Delete" onClick={() => setLog('delete')} />
          <FabMenuItem icon="help" label="Help" href="#fab-menu" />
        </FabMenu>
        <div dir="rtl">
          <FabMenu icon="share" label="Share options (RTL)" color="tertiary-container">
            <FabMenuItem icon="send" mirror label="Send" onClick={() => setLog('send')} />
            <FabMenuItem icon="mail" label="Email" onClick={() => setLog('email')} />
          </FabMenu>
        </div>
      </div>
      <p class={g.label}>
        Controlled: open is {String(open())}. Hiding the FAB closes the menu and reports it.
      </p>
      <div class={g.row} style={{ 'align-items': 'flex-end', 'min-block-size': '240px' }}>
        <Button color="outlined" onClick={() => setOpen(!open())}>
          Toggle open
        </Button>
        <Button color="outlined" onClick={() => setVisible(!visible())}>
          {visible() ? 'Hide' : 'Show'} FAB
        </Button>
        <FabMenu
          icon="add"
          label="Controlled options"
          color="secondary"
          open={open()}
          onOpenChange={setOpen}
          visible={visible()}
        >
          <FabMenuItem icon="link" label="Link" onClick={() => setLog('link')} />
          <FabMenuItem icon="note_add" label="Note" onClick={() => setLog('note')} />
        </FabMenu>
      </div>
    </div>
  );
};

export default FabMenuDemo;
