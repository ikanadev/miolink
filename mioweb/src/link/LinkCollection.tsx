import { For, Match, Show, Switch, type Component, type JSX } from 'solid-js';
import {
  Card,
  CardAction,
  CardContent,
  CardHeadline,
  CardMedia,
  CardSubhead,
  CardSupportingText,
} from '../components/ui/card';
import { List, ListItem } from '../components/ui/list';
import type { LinkView } from '../core/settings';
import type { Link } from '../tree/types';
import { onLinkOpened } from './actions';
import { LinkMenu } from './LinkMenu';
import { LinkThumbnail } from './LinkThumbnail';
import { hostOf } from './validate';
import styles from './link.module.css';

export type LinkCollectionProps = {
  links: readonly Link[];
  /** Grid of cards with large thumbnails, or a compact list. */
  view: LinkView;
  /** Accessible name of the list. */
  label: string;
  /** Extra line per link, e.g. its directory or view count. */
  detail?: (link: Link) => JSX.Element;
};

/** Saved links as cards or list rows. Activating one opens it in a new tab and counts the view. */
export const LinkCollection: Component<LinkCollectionProps> = (props) => (
  <Switch>
    <Match when={props.view === 'grid'}>
      <ul class={styles.grid} aria-label={props.label}>
        <For each={props.links}>{(link) => <LinkCard link={link} detail={props.detail?.(link)} />}</For>
      </ul>
    </Match>
    <Match when={props.view === 'list'}>
      <List label={props.label} interaction="multi-action" segmented>
        <For each={props.links}>{(link) => <LinkRow link={link} detail={props.detail?.(link)} />}</For>
      </List>
    </Match>
  </Switch>
);

const LinkCard: Component<{ link: Link; detail?: JSX.Element }> = (props) => (
  <Card as="li" variant="filled" class={styles.card}>
    <CardMedia class={styles.media}>
      <LinkThumbnail link={props.link} />
    </CardMedia>
    <div class={styles.cardBody}>
      <CardContent class={styles.cardContent}>
        <CardHeadline level={3} maxLines={2} class={styles.cardTitle}>
          <CardAction
            href={props.link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkOpened(props.link)}
            onAuxClick={(e) => e.button === 1 && onLinkOpened(props.link)}
          >
            {props.link.title}
          </CardAction>
        </CardHeadline>
        <CardSubhead maxLines={1}>{hostOf(props.link.url)}</CardSubhead>
        <Show when={props.detail}>
          <CardSupportingText maxLines={1} class={styles.detail}>
            {props.detail}
          </CardSupportingText>
        </Show>
      </CardContent>
      <div class={styles.cardMenu}>
        <LinkMenu link={props.link} />
      </div>
    </div>
  </Card>
);

const LinkRow: Component<{ link: Link; detail?: JSX.Element }> = (props) => (
  <ListItem
    href={props.link.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => onLinkOpened(props.link)}
    onAuxClick={(e: MouseEvent) => e.button === 1 && onLinkOpened(props.link)}
    leading={<LinkThumbnail link={props.link} row />}
    headline={props.link.title}
    supportingText={
      <>
        {hostOf(props.link.url)}
        <Show when={props.detail}>
          {' · '}
          {props.detail}
        </Show>
      </>
    }
    trailing={<LinkMenu link={props.link} />}
  />
);
