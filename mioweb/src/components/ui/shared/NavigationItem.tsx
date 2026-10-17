import { Show, splitProps, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Badge, badgeAccessibleText, formatBadge, type BadgeValue } from '../badge';
import { Icon } from '../icon';
import { Ripple } from './Ripple';
import styles from './navigation-item.module.css';

export type NavigationItemLayout = 'vertical' | 'horizontal';
/** Where the badge goes: on the icon's top-end corner, or after the label inside the pill. */
export type NavigationItemBadgePlacement = 'icon' | 'label';
/** How a badge after the label looks: the error-colored Badge pill, or plain label text (drawer). */
export type NavigationItemBadgeStyle = 'badge' | 'text';

export type NavigationItemProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Visible label, 1-2 words. Required: navigation items always show it. */
  label: string;
  /**
   * Material Symbols name. Outlined while inactive, filled while active.
   * Required by the bar and rail (their item props re-require it); without
   * one, a horizontal item drops the icon and its gap (text-only drawer).
   */
  icon?: string;
  /** Another glyph for the active state, when the filled `icon` isn't the right one. */
  activeIcon?: string;
  /** Renders an `<a href>` instead of a `<button>`. */
  href?: string;
  /** Link target, with `href`. */
  target?: string;
  /** Link rel, with `href`. */
  rel?: string;
  /**
   * Badge: `true` for the small dot, a count or up to 4 characters for the
   * large badge. 0 or an empty string hides it.
   */
  badge?: BadgeValue | true;
  /**
   * `icon` (default): the icon's top-end corner (bar, collapsed rail).
   * `label`: after the label, inside the pill (expanded rail; horizontal
   * layout only).
   */
  badgePlacement?: NavigationItemBadgePlacement;
  /**
   * With `badgePlacement="label"`: `badge` (default) renders the Badge pill,
   * `text` renders the value as plain text in the label's typescale and
   * color (navigation drawer). The small dot (`true`) is always a Badge.
   */
  badgeStyle?: NavigationItemBadgeStyle;
  /** Horizontal layout: a label too long for the item ends with an ellipsis instead of overflowing (drawer). */
  truncate?: boolean;
  /** Overrides the visually hidden badge text read after the name (default from `badgeAccessibleText`). */
  badgeLabel?: string;
  /** Sets `aria-current="page"`, the filled icon, the indicator and the bold label. */
  active?: boolean;
  /** Icon above the label (`vertical`, default) or beside it in the pill (`horizontal`). */
  layout?: NavigationItemLayout;
};

/**
 * One navigation destination, shared by NavigationBar, the navigation rail
 * and the navigation drawer. Not exported from the library: hosts wrap it (in an `<li>`) and
 * pass `layout` and `active`. The `aria-label` prop, when set, replaces the
 * visible label as the accessible name (e.g. "Music library" for
 * "Library"); badge text is appended either way.
 *
 * Space activates links too (M3 Accessibility keyboard tables; links only react to Enter natively).
 */
export const NavigationItem: Component<NavigationItemProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'activeIcon',
    'href',
    'target',
    'rel',
    'badge',
    'badgeLabel',
    'badgePlacement',
    'badgeStyle',
    'truncate',
    'active',
    'layout',
    'class',
    'aria-label',
    'onKeyDown',
    'ref',
  ]);

  const badgeValue = () => (local.badge === true ? undefined : local.badge);
  const hasBadge = () => local.badge !== undefined && local.badge !== 0 && local.badge !== '';
  const badgeText = () => local.badgeLabel ?? badgeAccessibleText(badgeValue());
  const badgeAfterLabel = () => local.badgePlacement === 'label' && local.layout === 'horizontal';

  const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLElement; target: Element }) => {
    const handler = local.onKeyDown as JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> | undefined;
    if (typeof handler === 'function') handler(e);
    else if (Array.isArray(handler)) handler[0](handler[1], e);
    if (e.defaultPrevented || local.href === undefined || e.key !== ' ' || e.target !== e.currentTarget) return;
    e.preventDefault();
    if (!e.repeat) e.currentTarget.click();
  };

  const badgeAsText = () => local.badgeStyle === 'text' && local.badge !== true;

  const icon = () => (
    <Icon name={(local.active && local.activeIcon) || local.icon || ''} filled={!!local.active} />
  );

  return (
    <Dynamic
      component={local.href !== undefined ? 'a' : 'button'}
      type={local.href !== undefined ? undefined : 'button'}
      href={local.href}
      target={local.target}
      rel={local.rel}
      {...rest}
      ref={(el: HTMLElement) => (local.ref as ((el: HTMLElement) => void) | undefined)?.(el)}
      class={local.class ? `${styles.item} ${local.class}` : styles.item}
      data-layout={local.layout ?? 'vertical'}
      data-no-icon={local.icon ? undefined : ''}
      data-truncate={local.truncate ? '' : undefined}
      aria-current={local.active ? 'page' : undefined}
      aria-label={
        local['aria-label'] !== undefined
          ? `${local['aria-label']}${hasBadge() ? `, ${badgeText()}` : ''}`
          : undefined
      }
      onKeyDown={onKeyDown}
    >
      <Ripple />
      <span class={styles.indicator} aria-hidden="true" />
      <Show when={local.icon}>
        <span class={styles.icon} aria-hidden="true">
          <Show when={local.badge !== undefined && !badgeAfterLabel()} fallback={icon()}>
            <Badge value={badgeValue()}>{icon()}</Badge>
          </Show>
        </span>
      </Show>
      <span class={styles.label} data-part="label">{local.label}</span>
      <Show when={local.badge !== undefined && badgeAfterLabel()}>
        <span class={styles.trailingBadge} aria-hidden="true">
          <Show when={badgeAsText()} fallback={<Badge value={badgeValue()} />}>
            <Show when={hasBadge()}>
              <span class={styles.badgeText}>{formatBadge(badgeValue() as BadgeValue)}</span>
            </Show>
          </Show>
        </span>
      </Show>
      <Show when={local['aria-label'] === undefined && hasBadge()}>
        <span class={styles.hidden}>, {badgeText()}</span>
      </Show>
    </Dynamic>
  );
};
