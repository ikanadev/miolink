import { createSignal, Show, type Component } from 'solid-js';
import { ListItemImage } from '../components/ui/list';
import { thumbnailSrc } from '../core/api';
import type { Link } from '../tree/types';
import { hostOf } from './validate';
import styles from './link.module.css';

const TONES = ['primary', 'secondary', 'tertiary'] as const;

/** A stable tone per host, so links from one site share a placeholder color. */
const toneOf = (host: string) => {
  let hash = 0;
  for (const ch of host) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
};

/**
 * The link's stored thumbnail, or a placeholder with the site's initial
 * when there is none (or it fails to load). Decorative: the title next to
 * it names the link.
 */
export const LinkThumbnail: Component<{ link: Link; class?: string; /** Inside a ListItem's leading slot. */ row?: boolean }> = (
  props,
) => {
  const [failed, setFailed] = createSignal(false);
  const src = () => (failed() ? undefined : thumbnailSrc(props.link.thumbnailUrl));
  const host = () => hostOf(props.link.url);

  return (
    <Show
      when={src()}
      fallback={
        <div
          class={props.class ? `${styles.placeholder} ${props.class}` : styles.placeholder}
          data-row={props.row ? '' : undefined}
          data-tone={toneOf(host())}
          aria-hidden="true"
        >
          {host().charAt(0).toUpperCase()}
        </div>
      }
    >
      {(url) =>
        props.row ? (
          <ListItemImage kind="video" src={url()} onError={() => setFailed(true)} />
        ) : (
        <img
          class={props.class ? `${styles.thumbnail} ${props.class}` : styles.thumbnail}
          src={url()}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
        )
      }
    </Show>
  );
};
