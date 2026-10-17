import { children, createMemo, Show, splitProps, type Component, type JSX } from 'solid-js';
import styles from './badge.module.css';

export type BadgeValue = number | string;

export type BadgeProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /**
   * A count or a short status label: large badge. Omit for the small (dot)
   * badge. 0 or an empty string hides it.
   */
  value?: BadgeValue;
  /** Counts above it render as `${max}+`. Default 999. */
  max?: number;
  /**
   * Default true. False scales the badge out toward its icon, e.g. once its
   * destination is selected; true scales it back in.
   */
  visible?: boolean;
  /**
   * The badged icon. The badge is anchored to its upper trailing corner.
   * Without children the badge is inline, 4px after the preceding element
   * (a tab label, a list item's text).
   */
  children?: JSX.Element;
};

/** Badge text: counts above `max` become "999+"; labels keep 4 characters. */
export const formatBadge = (value: BadgeValue, max = 999) =>
  typeof value === 'number' ? (value > max ? `${max}+` : String(value)) : value.slice(0, 4);

/**
 * Text for the host's accessible name, read after the destination name
 * ("Inbox, 3 new notifications"). `noun` is singular and plural, e.g.
 * ["new message", "new messages"].
 */
export const badgeAccessibleText = (
  value?: BadgeValue,
  { max = 999, noun = ['new notification', 'new notifications'] as [string, string] } = {},
) => {
  if (value === undefined) return `${noun[0].charAt(0).toUpperCase()}${noun[0].slice(1)}`;
  if (typeof value === 'string') return value;
  if (value > max) return `More than ${max} ${noun[1]}`;
  return `${value} ${value === 1 ? noun[0] : noun[1]}`;
};

/**
 * M3 badge: a 6px dot (small) or a 16px
 * pill with up to 4 characters (large), error / on-error, anchored inside
 * an icon's upper trailing corner or inline after a label.
 *
 * Decorative (aria-hidden) and non-interactive: the host puts the meaning
 * in its own accessible name with `badgeAccessibleText`. Hosts must not
 * clip it. Appears and disappears with a scale toward the icon (fast
 * spatial spring in, emphasized accelerate out), fade only with reduced
 * motion; count changes are instant.
 */
export const Badge: Component<BadgeProps> = (props) => {
  const [local, rest] = splitProps(props, ['value', 'max', 'visible', 'children', 'class']);

  const icon = children(() => local.children);
  const empty = () => local.value === 0 || local.value === '';
  const shown = () => (local.visible ?? true) && !empty();
  // Keep the last text while the badge animates out (e.g. a count dropping to 0).
  const text = createMemo<string | undefined>(
    (prev) => (empty() ? prev : local.value === undefined ? undefined : formatBadge(local.value, local.max)),
    undefined,
  );

  const badge = () => (
    <span
      {...rest}
      aria-hidden="true"
      class={local.class ? `${styles.badge} ${local.class}` : styles.badge}
      data-size={text() === undefined ? 'small' : 'large'}
      data-placement={icon() ? 'icon' : 'inline'}
      data-visible={String(shown())}
    >
      {text()}
    </span>
  );

  return (
    <Show when={icon()} fallback={badge()}>
      <span class={styles.anchor}>
        {icon()}
        {badge()}
      </span>
    </Show>
  );
};
