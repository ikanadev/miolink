import { createSignal, For, type Component } from 'solid-js';
import { Badge, badgeAccessibleText } from '../../components/ui/badge';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { Icon } from '../../components/ui/icon';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'badge', name: 'Badge' };

const VALUES = [undefined, 3, 42, 999, 1000, 'New'];

const caption = {
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
} as const;

const BadgeDemo: Component = () => {
  const [count, setCount] = createSignal(3);
  const [chat, setChat] = createSignal(false);
  const [inbox, setInbox] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>On an icon: small, then large (1-4 characters, "999+" above 999)</p>
      <div class={g.row} style={{ gap: '32px', 'padding-block': '8px' }}>
        <For each={VALUES}>
          {(v) => (
            <span role="img" aria-label={`Notifications, ${badgeAccessibleText(v)}`}>
              <Badge value={v}>
                <Icon name="notifications" />
              </Badge>
            </span>
          )}
        </For>
      </div>

      <p class={g.label}>Inline, after a label</p>
      <div class={g.row}>
        <span style={{ display: 'inline-flex', 'align-items': 'center' }}>
          Inbox
          <Badge value={12} />
        </span>
        <span style={{ display: 'inline-flex', 'align-items': 'center' }}>
          Updates
          <Badge />
        </span>
      </div>

      <p class={g.label}>Count changes; 0 hides the badge</p>
      <div class={g.row}>
        <IconButton color="outlined" icon="remove" label="Fewer messages" onClick={() => setCount((c) => Math.max(0, c - 1))} />
        <IconButton color="outlined" icon="add" label="More messages" onClick={() => setCount((c) => c + 1)} />
        <IconButton color="outlined" icon="keyboard_double_arrow_up" label="1000 messages" onClick={() => setCount(1000)} />
        <span
          role="img"
          aria-label={`Messages${count() ? `, ${badgeAccessibleText(count(), { noun: ['new message', 'new messages'] })}` : ''}`}
          style={{ 'margin-inline-start': '16px' }}
        >
          <Badge value={count()}>
            <Icon name="mail" />
          </Badge>
        </span>
        <span style={caption}>{count() ? badgeAccessibleText(count(), { noun: ['new message', 'new messages'] }) : 'No badge'}</span>
      </div>

      <p class={g.label}>Hidden once the destination is selected</p>
      <div class={g.row}>
        <button
          type="button"
          aria-pressed={chat()}
          aria-label={chat() ? 'Chat' : `Chat, ${badgeAccessibleText()}`}
          onClick={() => setChat((s) => !s)}
          style={{
            display: 'grid',
            'justify-items': 'center',
            gap: '4px',
            padding: '12px 16px',
            border: 'none',
            'border-radius': 'var(--md-sys-shape-corner-large)',
            background: chat() ? 'var(--md-sys-color-secondary-container)' : 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Badge visible={!chat()}>
            <Icon name="chat" filled={chat()} />
          </Badge>
          <span style={caption}>Chat</span>
        </button>
        <button
          type="button"
          aria-pressed={inbox()}
          aria-label={inbox() ? 'Inbox' : `Inbox, ${badgeAccessibleText(5)}`}
          onClick={() => setInbox((s) => !s)}
          style={{
            display: 'grid',
            'justify-items': 'center',
            gap: '4px',
            padding: '12px 16px',
            border: 'none',
            'border-radius': 'var(--md-sys-shape-corner-large)',
            background: inbox() ? 'var(--md-sys-color-secondary-container)' : 'transparent',
            color: 'var(--md-sys-color-on-surface)',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Badge value={5} visible={!inbox()}>
            <Icon name="inbox" filled={inbox()} />
          </Badge>
          <span style={caption}>Inbox</span>
        </button>
      </div>
    </div>
  );
};

export default BadgeDemo;
