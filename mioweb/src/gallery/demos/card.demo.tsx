import { createSignal, For, Show, type Component } from 'solid-js';
import {
  Card,
  CardAction,
  CardActions,
  CardContent,
  CardHeadline,
  CardIcon,
  CardMedia,
  CardSubhead,
  CardSupportingText,
  type CardVariant,
} from '../../components/ui/card';
import { Icon } from '../../components/ui/icon';
import { IconButton } from '../../components/ui/buttons/icon-button';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'card', name: 'Card' };

const VARIANTS: CardVariant[] = ['elevated', 'filled', 'outlined'];

const grid = (min: number) => ({
  display: 'grid',
  'grid-template-columns': `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`,
  gap: '8px',
});

/** Stand-in for a stored thumbnail (decorative, like a page's preview image). */
const Thumbnail: Component<{ hue: 'primary' | 'secondary' | 'tertiary' }> = (props) => (
  <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="160" height="90" fill={`var(--md-sys-color-${props.hue}-container)`} />
    <circle cx="120" cy="30" r="18" fill={`var(--md-sys-color-${props.hue})`} />
    <path d="M0 90 L55 40 L95 75 L120 55 L160 90 Z" fill={`var(--md-sys-color-on-${props.hue}-container)`} opacity="0.5" />
  </svg>
);

/** No thumbnail: an icon on the media surface. */
const NoThumbnail = () => (
  <div style={{ display: 'grid', 'place-items': 'center', 'block-size': '100%', color: 'var(--md-sys-color-on-surface-variant)' }}>
    <Icon name="link" size={32} />
  </div>
);

type Link = { title: string; url: string; hue?: 'primary' | 'secondary' | 'tertiary' };

const LINKS: Link[] = [
  { title: 'Material 3 Expressive: new components and motion', url: 'https://m3.material.io/blog/building-with-m3-expressive', hue: 'primary' },
  { title: 'SolidJS', url: 'https://www.solidjs.com/', hue: 'tertiary' },
  { title: 'A very long page title that wraps onto a second line and then gets truncated after two lines', url: 'https://example.com/articles/2026/10/a-very-long-path-that-does-not-fit-on-one-line?ref=share', hue: 'secondary' },
  { title: 'example.org', url: 'https://example.org/' },
];

const host = (url: string) => new URL(url).host;

/** How the app shows a saved link: thumbnail, title and URL; the whole card opens it. */
const LinkCard: Component<{ link: Link; variant?: CardVariant; horizontal?: boolean; disabled?: boolean }> = (props) => (
  <Card
    as="li"
    variant={props.variant ?? 'filled'}
    orientation={props.horizontal ? 'horizontal' : 'vertical'}
    disabled={props.disabled}
  >
    <CardMedia style={props.horizontal ? undefined : { 'aspect-ratio': '1.91' }}>
      <Show when={props.link.hue} fallback={<NoThumbnail />}>
        {(hue) => <Thumbnail hue={hue()} />}
      </Show>
    </CardMedia>
    <CardContent>
      <CardHeadline level={4} maxLines={2}>
        <CardAction href={props.link.url} target="_blank" rel="noopener noreferrer">
          {props.link.title}
        </CardAction>
      </CardHeadline>
      <CardSubhead maxLines={1}>{host(props.link.url)}</CardSubhead>
    </CardContent>
    <div style={{ 'align-self': 'flex-start', padding: '8px' }}>
      <IconButton color="standard" icon="more_vert" label={`More options for ${props.link.title}`} disabled={props.disabled} />
    </div>
  </Card>
);

const CardDemo: Component = () => {
  const [clicks, setClicks] = createSignal(0);
  const [dragged, setDragged] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Non-actionable: elevated, filled, outlined (controls inside handle their own states)</p>
      <div style={grid(240)}>
        <For each={VARIANTS}>
          {(variant) => (
            <Card variant={variant} as="article" aria-labelledby={`card-demo-${variant}`}>
              <CardContent>
                <CardIcon name="folder" />
                <CardHeadline id={`card-demo-${variant}`}>Reading list</CardHeadline>
                <CardSubhead>12 links · {variant}</CardSubhead>
                <CardSupportingText>Articles and docs saved to read later, synced to every device.</CardSupportingText>
              </CardContent>
              <CardActions>
                <IconButton color="standard" icon="share" label="Share" />
                <IconButton color="standard" icon="edit" label="Rename" />
                <IconButton color="tonal" icon="open_in_new" label="Open" />
              </CardActions>
            </Card>
          )}
        </For>
      </div>

      <p class={g.label}>Link cards (directly actionable link, stretched over the card) with a separate overflow button</p>
      <ul style={{ ...grid(220), margin: 0, padding: 0 }}>
        <For each={LINKS}>{(link) => <LinkCard link={link} />}</For>
      </ul>

      <p class={g.label}>Horizontal link cards in each variant</p>
      <ul style={{ ...grid(320), margin: 0, padding: 0 }}>
        <For each={VARIANTS}>{(variant, i) => <LinkCard link={LINKS[i()]} variant={variant} horizontal />}</For>
      </ul>

      <p class={g.label}>Directly actionable button (whole card)</p>
      <div style={grid(240)}>
        <For each={VARIANTS}>
          {(variant) => (
            <Card variant={variant}>
              <CardContent>
                <CardHeadline>
                  <CardAction onClick={() => setClicks((n) => n + 1)}>Count clicks</CardAction>
                </CardHeadline>
                <CardSupportingText>Clicked {clicks()} times.</CardSupportingText>
              </CardContent>
            </Card>
          )}
        </For>
      </div>

      <p class={g.label}>Disabled (actionable)</p>
      <ul style={{ ...grid(220), margin: 0, padding: 0 }}>
        <For each={VARIANTS}>{(variant, i) => <LinkCard link={LINKS[i()]} variant={variant} disabled />}</For>
      </ul>

      <p class={g.label}>Dragged (the app drives this while the card is picked up)</p>
      <div class={g.row}>
        <IconButton
          color="tonal"
          icon="drag_pan"
          label="Pick up the cards"
          toggle
          selected={dragged()}
          onSelectedChange={setDragged}
        />
      </div>
      <div style={grid(240)}>
        <For each={VARIANTS}>
          {(variant) => (
            <Card variant={variant} dragged={dragged()}>
              <CardContent>
                <CardHeadline>
                  <CardAction onClick={() => setDragged((d) => !d)}>{variant}</CardAction>
                </CardHeadline>
                <CardSupportingText>{dragged() ? 'Dragged elevation and state layer.' : 'At rest.'}</CardSupportingText>
              </CardContent>
            </Card>
          )}
        </For>
      </div>
    </div>
  );
};

export default CardDemo;
