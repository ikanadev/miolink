import { Tabs as ArkTabs, useTabsContext } from '@ark-ui/solid/tabs';
import {
  createContext,
  createEffect,
  on,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Badge, badgeAccessibleText, type BadgeValue } from '../badge';
import { Icon } from '../icon';
import { Ripple } from '../shared/Ripple';
import styles from './tabs.module.css';

export type TabsVariant = 'primary' | 'secondary';
export type TabsLayout = 'fixed' | 'scrollable';
export type TabsIconPlacement = 'stacked' | 'inline';

export type TabsProps = Omit<ArkTabs.RootProps, 'asChild' | 'orientation' | 'onValueChange'> & {
  /** Called when the user activates another tab. */
  onValueChange?: (value: string) => void;
};

/**
 * M3 tabs (m3-guidelines/components/tabs.md) on Ark UI `Tabs`: holds the
 * selected value and connects a `TabList` to its `TabPanel`s. Manual
 * activation by default (spec §8): arrows, Home and End move focus, Space
 * or Enter (or a click) selects.
 */
export const Tabs: Component<TabsProps> = (props) => {
  const [local, rest] = splitProps(props, ['onValueChange', 'activationMode', 'class']);
  return (
    <ArkTabs.Root
      {...rest}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      orientation="horizontal"
      activationMode={local.activationMode ?? 'manual'}
      onValueChange={(d) => local.onValueChange?.(d.value)}
    />
  );
};

type ListContextValue = { iconPlacement: () => TabsIconPlacement };
const ListContext = createContext<ListContextValue>({ iconPlacement: () => 'stacked' as const });

export type TabListProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Default `primary` (main destinations); `secondary` for a second level below primary tabs. */
  variant?: TabsVariant;
  /**
   * Default `fixed`: equal-width tabs (at most 4). `scrollable`: tabs as wide
   * as their content in one row that scrolls, starting 52px from the leading
   * edge.
   */
  layout?: TabsLayout;
  /** Fixed layout from 600px wide: where the tab group sits. Default `start`. */
  align?: 'start' | 'center';
  /**
   * Tabs with both an icon and a label: icon above the label (64px, the
   * default) or beside it (48px). Every tab in a set uses the same content.
   */
  iconPlacement?: TabsIconPlacement;
  /** Accessible name of the tablist when no visible heading names it. */
  label?: string;
  /** The `Tab`s. */
  children: JSX.Element;
};

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const triggerOf = (list: HTMLElement, value: string | null) =>
  value == null
    ? undefined
    : Array.from(list.querySelectorAll<HTMLElement>('[data-part="trigger"]')).find(
        (el) => el.dataset.value === value,
      );

const indicatorOf = (trigger?: HTMLElement) =>
  trigger?.querySelector<HTMLElement>('[data-tab-indicator]') ?? undefined;

/**
 * The tab bar: a full-width surface with the 1px divider, holding Ark's
 * `Tabs.List` (role="tablist"). Each tab draws its own indicator; when the
 * selection changes, the new one slides and stretches from the old one's
 * position (FLIP, fast spatial spring; spec §6), and in a scrollable bar
 * the selected tab scrolls into view.
 */
export const TabList: Component<TabListProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'layout',
    'align',
    'iconPlacement',
    'label',
    'children',
    'class',
  ]);
  const tabs = useTabsContext();
  let list!: HTMLDivElement;

  createEffect(
    on(
      () => tabs().value,
      (value, prev) => {
        if (prev === undefined || value === prev || !list) return;
        const to = triggerOf(list, value);
        const next = indicatorOf(to);
        const old = indicatorOf(triggerOf(list, prev));
        if (local.layout === 'scrollable' && to) {
          to.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
        if (!next || !old || reducedMotion()) return;
        // Read the old rect first: mid-flight it includes the running transform.
        const a = old.getBoundingClientRect();
        old.getAnimations().forEach((anim) => anim.cancel());
        next.getAnimations().forEach((anim) => anim.cancel());
        const b = next.getBoundingClientRect();
        if (!b.width) return;
        const style = getComputedStyle(next);
        const duration = parseFloat(style.getPropertyValue('--md-sys-motion-spring-fast-spatial-duration')) || 350;
        const easing = style.getPropertyValue('--md-sys-motion-spring-fast-spatial-easing').trim() || 'ease';
        // Physical left/width math; the indicator's transform-origin is the physical left edge.
        next.animate(
          [
            { transform: `translateX(${a.left - b.left}px) scaleX(${a.width / b.width})` },
            { transform: 'none' },
          ],
          { duration, easing },
        );
      },
    ),
  );

  return (
    <ListContext.Provider value={{ iconPlacement: () => local.iconPlacement ?? 'stacked' }}>
      <div
        {...rest}
        class={local.class ? `${styles.bar} ${local.class}` : styles.bar}
        data-variant={local.variant ?? 'primary'}
        data-layout={local.layout ?? 'fixed'}
        data-align={local.align ?? 'start'}
        data-icon-placement={local.iconPlacement ?? 'stacked'}
      >
        <div class={styles.scroller}>
          <ArkTabs.List ref={list} class={styles.list} aria-label={local.label}>
            {local.children}
          </ArkTabs.List>
        </div>
      </div>
    </ListContext.Provider>
  );
};

export type TabProps = Omit<ArkTabs.TriggerProps, 'asChild' | 'children'> & {
  /** The value `Tabs` takes when this tab is selected; matches a `TabPanel`. */
  value: string;
  /** Material Symbols name of the 24px icon. */
  icon?: string;
  /** Visible label. Omit for an icon-only tab and pass `label`. */
  children?: JSX.Element;
  /**
   * Accessible name of an icon-only tab (its `aria-label`, with the badge
   * text appended). Describe the content, e.g. "Video format media content".
   */
  label?: string;
  /**
   * Badge: `true` for the small dot, a count or up to 4 characters for the
   * large badge. On the icon for stacked and icon-only tabs, 4px after the
   * label otherwise. 0 or an empty string hides it.
   */
  badge?: BadgeValue | true;
  /** Overrides the visually hidden badge text read after the name (default from `badgeAccessibleText`). */
  badgeLabel?: string;
};

/**
 * One tab: Ark's `Tabs.Trigger` (a `<button role="tab">`) with the state
 * layer, ripple, optional icon and badge, the label and the active
 * indicator.
 */
export const Tab: Component<TabProps> = (props) => {
  const [local, rest] = splitProps(props, ['icon', 'children', 'label', 'badge', 'badgeLabel', 'class']);
  const ctx = useContext(ListContext);

  if (import.meta.env.DEV && local.children == null && !local.label) {
    console.warn('Tab: pass a visible label (children) or `label`.');
  }

  const hasLabel = () => local.children != null;
  const badgeValue = () => (local.badge === true ? undefined : local.badge);
  const hasBadge = () => local.badge !== undefined && local.badge !== 0 && local.badge !== '';
  const badgeOnIcon = () => local.icon != null && (!hasLabel() || ctx.iconPlacement() === 'stacked');
  const badgeText = () => local.badgeLabel ?? badgeAccessibleText(badgeValue());

  const icon = () => <Icon class={styles.icon} name={local.icon!} />;

  return (
    <ArkTabs.Trigger
      {...rest}
      class={local.class ? `${styles.tab} ${local.class}` : styles.tab}
      data-has-icon={local.icon != null ? '' : undefined}
      data-has-label={hasLabel() ? '' : undefined}
      aria-label={hasLabel() ? undefined : `${local.label ?? ''}${hasBadge() ? `, ${badgeText()}` : ''}`}
    >
      <Ripple />
      <span class={styles.content}>
        <Show when={local.icon != null}>
          <Show when={badgeOnIcon() && local.badge !== undefined} fallback={icon()}>
            <Badge value={badgeValue()}>{icon()}</Badge>
          </Show>
        </Show>
        <Show when={hasLabel()}>
          <span class={styles.label}>{local.children}</span>
        </Show>
        <span class={styles.indicator} data-tab-indicator="" aria-hidden="true" />
      </span>
      <Show when={!badgeOnIcon() && local.badge !== undefined}>
        <Badge value={badgeValue()} />
      </Show>
      <Show when={hasLabel() && hasBadge()}>
        <span class={styles.hidden}>, {badgeText()}</span>
      </Show>
    </ArkTabs.Trigger>
  );
};

export type TabPanelProps = Omit<ArkTabs.ContentProps, 'asChild'> & {
  /** The `Tab` value this panel belongs to. */
  value: string;
};

/** The content of one tab: Ark's `Tabs.Content` (role="tabpanel"), hidden while its tab isn't selected. */
export const TabPanel: Component<TabPanelProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <ArkTabs.Content {...rest} class={local.class ? `${styles.panel} ${local.class}` : styles.panel} />;
};
