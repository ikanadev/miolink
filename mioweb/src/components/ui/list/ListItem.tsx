import { Collapsible } from '@ark-ui/solid/collapsible';
import { Listbox } from '@ark-ui/solid/listbox';
import { createMemo, createUniqueId, onMount, Show, splitProps, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import { useListContext } from './List';
import styles from './list.module.css';

export type ListItemProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'ref' | 'onContextMenu'> & {
  /** Label text (required). One line, truncated. */
  headline: JSX.Element;
  /** Below the headline: one line, or two in a 3-line item without overline. */
  supportingText?: JSX.Element;
  /** Small text above the headline. */
  overline?: JSX.Element;
  /** Meta information at the end (count, date, size). */
  trailingText?: JSX.Element;
  /** Leading slot: icon, `ListItemAvatar`, `ListItemImage`, checkbox/radio. */
  leading?: JSX.Element;
  /** Shorthand for a leading `<Icon name>`. */
  leadingIcon?: string;
  /**
   * Trailing slot. Single-action and select items: decorative only (icon,
   * text). Multi-action items: icon buttons (secondary actions).
   */
  trailing?: JSX.Element;
  /** Shorthand for a trailing `<Icon name>`. */
  trailingIcon?: string;
  /** Extra content under the text (badge, inline label). */
  children?: JSX.Element;
  /** 1, 2 or 3 lines (56, 72, 88px; 3 top-aligns). Default from the text slots. */
  lines?: 1 | 2 | 3;
  /** Highlighted (secondary-container, 16px corners). Select lists set it from their value. */
  selected?: boolean;
  disabled?: boolean;
  /** Dragged state (elevation 4, 16px corners); reordering itself isn't built in. */
  dragged?: boolean;
  /** Select lists: the item's value (required there). */
  value?: string;
  /** Select lists: text for typeahead when `headline` isn't a string. */
  textValue?: string;
  /** Renders the action as a link. */
  href?: string;
  target?: string;
  rel?: string;
  download?: string;
  /**
   * Nested items (usually a `List`). Makes the item an expand/collapse
   * toggle with a trailing chevron; the item's own action is the toggle.
   */
  nested?: JSX.Element;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Set on the whole item (including the trailing slot), for a secondary
   * menu on right click or long press. Disables the iOS link callout.
   */
  onContextMenu?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
};

const LOCAL = [
  'headline',
  'supportingText',
  'overline',
  'trailingText',
  'leading',
  'leadingIcon',
  'trailing',
  'trailingIcon',
  'children',
  'lines',
  'selected',
  'disabled',
  'dragged',
  'value',
  'textValue',
  'href',
  'nested',
  'expanded',
  'defaultExpanded',
  'onExpandedChange',
  'onContextMenu',
  'class',
] as const;

/**
 * One row of a `List`: leading | content (overline, headline, supporting
 * text) | trailing. What it renders depends on the list:
 *
 * - non-interactive: `<li>` with the content.
 * - single-action: `<li>` holding one `<a>` (with `href`) or `<button>`
 *   that covers the item; `rest` props (onClick, aria-*) go to it.
 * - multi-action: the primary `<a>`/`<button>` covers leading and content;
 *   `trailing` holds secondary icon buttons beside it.
 * - select list: an Ark `Listbox.Item` (role option).
 */
export const ListItem: Component<ListItemProps> = (props) => {
  const [local, rest] = splitProps(props, LOCAL);
  const ctx = useListContext();

  const lines = () =>
    local.lines ?? (local.overline && local.supportingText ? 3 : local.overline || local.supportingText ? 2 : 1);

  const itemAttrs = () => ({
    class: local.class ? `${styles.item} ${local.class}` : styles.item,
    'data-variant': ctx.variant(),
    'data-segmented': ctx.segmented() ? '' : undefined,
    'data-selectable': ctx.selectable() ? '' : undefined,
    'data-lines': lines(),
    'data-overline': local.overline ? '' : undefined,
    'data-dragged': local.dragged ? '' : undefined,
    'data-contextmenu': local.onContextMenu ? '' : undefined,
    onContextMenu: local.onContextMenu,
  });

  // Plain items set their own state attributes; Listbox items get them from Ark.
  const stateAttrs = () => ({
    'data-selected': local.selected ? '' : undefined,
    'data-disabled': local.disabled ? '' : undefined,
  });

  const leading = () => (
    <Show when={local.leading ?? local.leadingIcon}>
      <span class={styles.leading}>
        {local.leading ?? <Icon name={local.leadingIcon!} />}
      </span>
    </Show>
  );

  const content = () => (
    <span class={styles.content}>
      <Show when={local.overline}>
        <span class={styles.overline}>{local.overline}</span>
      </Show>
      <span class={styles.headline}>{local.headline}</span>
      <Show when={local.supportingText}>
        <span class={styles.supporting}>{local.supportingText}</span>
      </Show>
      {local.children}
    </span>
  );

  const trailing = (extra?: JSX.Element) => (
    <Show when={local.trailing ?? local.trailingIcon ?? local.trailingText ?? extra}>
      <span class={styles.trailing}>
        <Show when={local.trailingText}>
          <span class={styles.trailingText}>{local.trailingText}</span>
        </Show>
        {local.trailing ?? (local.trailingIcon && <Icon name={local.trailingIcon} />)}
        {extra}
      </span>
    </Show>
  );

  // ---- Combobox option (search view): the input keeps focus ----
  if (ctx.option) {
    const option = ctx.option;
    const id = createUniqueId();
    const highlighted = () => option.highlighted(id);
    const optionValue = () =>
      local.value ?? local.textValue ?? (typeof local.headline === 'string' ? local.headline : '');
    return (
      <div
        {...rest}
        {...itemAttrs()}
        id={id}
        role="option"
        aria-selected={highlighted() ? 'true' : 'false'}
        aria-disabled={local.disabled ? 'true' : undefined}
        data-disabled={local.disabled ? '' : undefined}
        data-highlighted={highlighted() ? '' : undefined}
        class={`${itemAttrs().class} ${styles.row} ${styles.option}`}
        // Clicking an option must not move focus out of the input.
        onMouseDown={(e) => e.preventDefault()}
        onPointerMove={() => {
          if (!local.disabled && !highlighted()) option.highlight(id);
        }}
        onClick={(e) => {
          callHandler(rest.onClick, e);
          if (!local.disabled && !e.defaultPrevented) option.select(optionValue(), e.currentTarget);
        }}
      >
        <Ripple />
        {leading()}
        {content()}
        {trailing()}
      </div>
    );
  }

  // ---- Select list (Ark Listbox) ----
  if (ctx.selectable()) {
    const item = createMemo(() => ({
      value: local.value ?? '',
      label: local.textValue ?? (typeof local.headline === 'string' ? local.headline : ''),
      disabled: !!local.disabled,
    }));
    if (import.meta.env.DEV && local.value == null) {
      console.warn('ListItem: items of a select list need a `value`.');
    }
    let el!: HTMLDivElement;
    onMount(() =>
      ctx.register({
        el,
        value: () => item().value,
        label: () => item().label,
        disabled: () => item().disabled,
      }),
    );
    return (
      <Listbox.Item
        {...rest}
        {...itemAttrs()}
        ref={el}
        item={item()}
        class={`${itemAttrs().class} ${styles.row} ${styles.option}`}
      >
        <Ripple />
        {leading()}
        {content()}
        {trailing(
          ctx.checkIndicator() ? (
            <Listbox.ItemIndicator class={styles.indicator}>
              <Icon name="check" />
            </Listbox.ItemIndicator>
          ) : undefined,
        )}
      </Listbox.Item>
    );
  }

  // ---- Non-interactive ----
  if (ctx.interaction() === 'non-interactive') {
    return (
      <li {...rest} {...itemAttrs()} {...stateAttrs()}>
        <div class={styles.row}>
          {leading()}
          {content()}
          {trailing()}
        </div>
      </li>
    );
  }

  const actionAttrs = () => ({
    ...rest,
    href: local.disabled ? undefined : local.href,
    type: local.href === undefined ? ('button' as const) : undefined,
    disabled: local.href === undefined ? local.disabled : undefined,
    'aria-disabled': local.href !== undefined && local.disabled ? ('true' as const) : undefined,
  });

  // ---- Expand & collapse (Ark Collapsible): the whole row is the toggle ----
  if (local.nested !== undefined) {
    return (
      <Collapsible.Root
        {...itemAttrs()}
        {...stateAttrs()}
        data-expandable=""
        open={local.expanded}
        defaultOpen={local.defaultExpanded}
        onOpenChange={(d) => local.onExpandedChange?.(d.open)}
        disabled={local.disabled}
        asChild={(p) => <li {...p()} />}
      >
        <Collapsible.Trigger {...rest} class={`${styles.action} ${styles.row}`}>
          <Ripple />
          {leading()}
          {content()}
          {trailing(
            <span class={styles.expandIcon}>
              <Icon name="keyboard_arrow_down" />
            </span>,
          )}
        </Collapsible.Trigger>
        <Collapsible.Content class={styles.nested}>{local.nested}</Collapsible.Content>
      </Collapsible.Root>
    );
  }

  // ---- Multi-action: primary action + trailing secondary actions ----
  if (ctx.interaction() === 'multi-action') {
    return (
      <li {...itemAttrs()} {...stateAttrs()}>
        <div class={`${styles.row} ${styles.split}`}>
          <Dynamic component={local.href === undefined ? 'button' : 'a'} {...actionAttrs()} class={styles.action}>
            <Ripple />
            {leading()}
            {content()}
          </Dynamic>
          {trailing()}
        </div>
      </li>
    );
  }

  // ---- Single-action ----
  return (
    <li {...itemAttrs()} {...stateAttrs()}>
      <Dynamic
        component={local.href === undefined ? 'button' : 'a'}
        {...actionAttrs()}
        class={`${styles.action} ${styles.row}`}
      >
        <Ripple />
        {leading()}
        {content()}
        {trailing()}
      </Dynamic>
    </li>
  );
};

export type ListItemAvatarProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Image; without it the avatar shows `children` (initials) on primary-container. */
  src?: string;
  /** Image description; empty (decorative) by default. */
  alt?: string;
  children?: JSX.Element;
};

/** 40px circular avatar for the leading slot: an image or initials. */
export const ListItemAvatar: Component<ListItemAvatarProps> = (props) => {
  const [local, rest] = splitProps(props, ['src', 'alt', 'children', 'class']);
  return (
    <span {...rest} class={local.class ? `${styles.avatar} ${local.class}` : styles.avatar}>
      <Show when={local.src} fallback={local.children}>
        <img src={local.src} alt={local.alt ?? ''} />
      </Show>
    </span>
  );
};

export type ListItemImageKind = 'image' | 'video' | 'video-large';

export type ListItemImageProps = Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'children'> & {
  /** `image` 56x56 (default), `video` 100x56, `video-large` 114x64. */
  kind?: ListItemImageKind;
};

/**
 * Leading media: a thumbnail or video still, cropped to fill. Corners are
 * 8px in expressive lists (0 for baseline images).
 */
export const ListItemImage: Component<ListItemImageProps> = (props) => {
  const [local, rest] = splitProps(props, ['kind', 'class', 'alt']);
  return (
    <img
      loading="lazy"
      decoding="async"
      {...rest}
      alt={local.alt ?? ''}
      class={local.class ? `${styles.image} ${local.class}` : styles.image}
      data-kind={local.kind ?? 'image'}
    />
  );
};

/** Calls a Solid event handler prop (a function or a `[handler, data]` tuple). */
function callHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  e: E & { currentTarget: T; target: Element },
) {
  if (typeof handler === 'function') (handler as (e: E) => void)(e);
  else if (Array.isArray(handler)) (handler[0] as (data: unknown, e: E) => void)(handler[1], e);
}
