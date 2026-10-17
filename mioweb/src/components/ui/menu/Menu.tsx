import { Menu as ArkMenu } from '@ark-ui/solid/menu';
import {
  children as resolveChildren,
  createContext,
  createSignal,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Icon } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import styles from './menu.module.css';

export type MenuColor = 'standard' | 'vibrant';
export type MenuVariant = 'vertical' | 'baseline';
export type MenuLayout = 'list' | 'gap';
export type MenuDensity = 0 | -1 | -2 | -3;

type MenuStyle = {
  color: MenuColor;
  variant: MenuVariant;
  layout: MenuLayout;
  density: MenuDensity;
  instant: boolean;
};

const StyleContext = createContext<Accessor<MenuStyle>>();

const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

/*
 * Ark keeps DOM focus on the content and marks the current item with
 * data-highlighted (aria-activedescendant), so items never match
 * :focus-visible. The content shows the focus ring on the highlighted item
 * only while the last input was the keyboard.
 */
const [modality, setModality] = createSignal<'keyboard' | 'pointer'>('pointer');
let tracking = false;
const trackModality = () => {
  if (tracking || typeof document === 'undefined') return;
  tracking = true;
  const toPointer = () => setModality('pointer');
  document.addEventListener(
    'keydown',
    (e) => {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) setModality('keyboard');
    },
    true,
  );
  document.addEventListener('pointerdown', toPointer, true);
  document.addEventListener('pointermove', toPointer, true);
};

// ---- Root ----

export type MenuRootProps = ArkMenu.RootProps & {
  /** Default `standard`. `vibrant` (tertiary) is for emphasis; vertical menus only. Submenus inherit it. */
  color?: MenuColor;
  /** Default `vertical` (M3 Expressive). `baseline` is the legacy menu. Submenus inherit it. */
  variant?: MenuVariant;
  /**
   * Default `list`: one surface, groups separated by `Menu.Divider` (the web
   * recommendation). `gap`: each `Menu.Group` is its own segment, 2px apart.
   * Use at most 1-2 gaps and never in a scrolling menu.
   */
  layout?: MenuLayout;
  /** Default 0. Each step removes 4px from the item height. */
  density?: MenuDensity;
  /** Open and close without animation (dense desktop products). */
  instant?: boolean;
};

/**
 * Root of a menu or, nested inside `Menu.Content`, of a submenu (with a
 * `Menu.TriggerItem` and its own `Menu.Content`). Ark UI `Menu.Root`: takes
 * `open`/`onOpenChange`, `onSelect`, `closeOnSelect`, `positioning`,
 * `loopFocus`, `typeahead`, `onExitComplete`, ...
 */
export const MenuRoot = (props: MenuRootProps) => {
  const [local, rest] = splitProps(props, ['color', 'variant', 'layout', 'density', 'instant']);
  const parent = useContext(StyleContext);
  const style = (): MenuStyle => ({
    color: local.color ?? parent?.().color ?? 'standard',
    variant: local.variant ?? parent?.().variant ?? 'vertical',
    layout: local.layout ?? parent?.().layout ?? 'list',
    density: local.density ?? parent?.().density ?? 0,
    instant: local.instant ?? parent?.().instant ?? false,
  });
  return (
    <StyleContext.Provider value={style}>
      <ArkMenu.Root {...rest} />
    </StyleContext.Provider>
  );
};

// ---- Triggers ----

export type MenuTriggerProps = ArkMenu.TriggerProps;

/**
 * The element that opens the menu. Usually an icon button or button through
 * `asChild`: `<Menu.Trigger asChild={(p) => <IconButton {...p()} icon="more_vert" label="More" />} />`.
 * It gets aria-haspopup, aria-expanded, aria-controls and a pressed state
 * layer while the menu is open.
 */
export const MenuTrigger = (props: MenuTriggerProps) => {
  const [local, rest] = splitProps(props, ['class']);
  return <ArkMenu.Trigger {...rest} class={cx(styles.trigger, local.class)} />;
};

export type MenuContextTriggerProps = ArkMenu.ContextTriggerProps;

/** Area that opens the menu at the pointer on right click or long press (touch, pen). */
export const MenuContextTrigger = (props: MenuContextTriggerProps) => <ArkMenu.ContextTrigger {...props} />;

// ---- Content ----

export type MenuContentProps = ArkMenu.ContentProps;

/** The menu surface, rendered in a portal and positioned against its trigger. */
export const MenuContent = (props: MenuContentProps) => {
  const [local, rest] = splitProps(props, ['class', 'children']);
  const style = useContext(StyleContext) ?? (() => undefined);
  trackModality();
  return (
    <Portal>
      <ArkMenu.Positioner>
        <ArkMenu.Content
          {...rest}
          class={cx(styles.content, local.class)}
          data-color={style()?.color ?? 'standard'}
          data-variant={style()?.variant ?? 'vertical'}
          data-layout={style()?.layout ?? 'list'}
          data-density={style()?.density ?? 0}
          data-instant={style()?.instant ? '' : undefined}
          data-focus-visible={modality() === 'keyboard' ? '' : undefined}
          aria-orientation="vertical"
        >
          {local.children}
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </Portal>
  );
};

// ---- Items ----

type ItemSlots = {
  /** Material Symbols name of the 20px leading icon (decorative). */
  leadingIcon?: string;
  /** Custom leading content (image, swatch, progress) in place of `leadingIcon`. */
  leading?: JSX.Element;
  /** Second line under the label. */
  supportingText?: JSX.Element;
  /** Trailing text, e.g. a keyboard shortcut ("⌘C"). */
  trailingText?: JSX.Element;
  /** Badge before the trailing icon. */
  badge?: JSX.Element;
  /** Material Symbols name of the trailing icon. */
  trailingIcon?: string;
  /** Custom trailing content in place of `trailingIcon`. */
  trailing?: JSX.Element;
  /** The label: the item's accessible name. */
  children?: JSX.Element;
};

const SLOTS = [
  'leadingIcon',
  'leading',
  'supportingText',
  'trailingText',
  'badge',
  'trailingIcon',
  'trailing',
  'children',
] as const;

/** Typeahead text: the label when it's plain text, so icon ligatures and trailing text don't count. */
const textOf = (label: unknown): string | undefined => {
  if (typeof label === 'string') return label;
  if (Array.isArray(label) && label.every((part) => typeof part === 'string')) return label.join('');
  return undefined;
};

type BodyProps = ItemSlots & {
  selected?: boolean;
  /** Extra trailing part: the submenu arrow or the check indicator. */
  end?: JSX.Element;
};

const ItemBody = (props: BodyProps) => {
  const leading = resolveChildren(() => props.leading);
  const supporting = resolveChildren(() => props.supportingText);
  const trailingText = resolveChildren(() => props.trailingText);
  const badge = resolveChildren(() => props.badge);
  const trailing = resolveChildren(() => props.trailing);
  return (
    <>
      <Ripple />
      <Show when={leading() || props.leadingIcon}>
        <span class={styles.leading}>
          <Show when={leading()} fallback={<Icon name={props.leadingIcon!} filled={props.selected} />}>
            {leading()}
          </Show>
        </span>
      </Show>
      <span class={styles.text}>
        <span class={styles.label}>{props.children}</span>
        <Show when={supporting()}>
          <span class={styles.supporting}>{supporting()}</span>
        </Show>
      </span>
      <Show when={trailingText()}>
        <span class={styles.trailingText}>{trailingText()}</span>
      </Show>
      <Show when={badge()}>
        <span class={styles.badge}>{badge()}</span>
      </Show>
      <Show when={trailing() || props.trailingIcon}>
        <span class={styles.trailing}>
          <Show when={trailing()} fallback={<Icon name={props.trailingIcon!} filled={props.selected} />}>
            {trailing()}
          </Show>
        </span>
      </Show>
      {props.end}
    </>
  );
};

export type MenuItemProps = ItemSlots &
  Omit<ArkMenu.ItemProps, 'children' | 'asChild'> & {
    /** Render the item as a link. */
    href?: string;
    target?: string;
    rel?: string;
    /**
     * Visual selected state (filled, 12px corners) for a plain action item.
     * For choices prefer `Menu.RadioItem`/`Menu.CheckboxItem`, which also
     * expose aria-checked.
     */
    selected?: boolean;
  };

/**
 * An action. `onSelect` runs on click, Enter or Space; `closeOnSelect={false}`
 * keeps the menu open; `valueText` sets the typeahead text; disabled items
 * stay visible.
 */
export const MenuItem = (props: MenuItemProps) => {
  const [slots, local, rest] = splitProps(props, SLOTS, [
    'class',
    'href',
    'target',
    'rel',
    'selected',
    'valueText',
  ]);
  const label = resolveChildren(() => slots.children);
  const body = () => (
    <ItemBody {...slots} selected={local.selected}>
      {label()}
    </ItemBody>
  );
  const itemProps = () => ({
    class: cx(styles.item, local.class),
    valueText: local.valueText ?? textOf(label()),
    'data-selected': local.selected ? '' : undefined,
  });
  return (
    <Show
      when={local.href}
      fallback={
        <ArkMenu.Item {...rest} {...itemProps()}>
          {body()}
        </ArkMenu.Item>
      }
    >
      <ArkMenu.Item
        {...rest}
        {...itemProps()}
        asChild={(p) => (
          <a {...p()} href={local.href} target={local.target} rel={local.rel}>
            {body()}
          </a>
        )}
      />
    </Show>
  );
};

export type MenuCheckboxItemProps = ItemSlots & Omit<ArkMenu.CheckboxItemProps, 'children' | 'asChild'>;

/**
 * Multi-select item (role menuitemcheckbox). Checked items fill, morph to
 * 12px corners and show a check. Keeps the menu open by default.
 */
export const MenuCheckboxItem = (props: MenuCheckboxItemProps) => {
  const [slots, local, rest] = splitProps(props, SLOTS, ['class', 'closeOnSelect', 'valueText']);
  const label = resolveChildren(() => slots.children);
  return (
    <ArkMenu.CheckboxItem
      {...rest}
      closeOnSelect={local.closeOnSelect ?? false}
      valueText={local.valueText ?? textOf(label())}
      class={cx(styles.item, local.class)}
    >
      <OptionBody {...slots}>{label()}</OptionBody>
    </ArkMenu.CheckboxItem>
  );
};

export type MenuRadioItemProps = ItemSlots & Omit<ArkMenu.RadioItemProps, 'children' | 'asChild'>;

/** Single-select item (role menuitemradio) inside a `Menu.RadioGroup`. Closes the menu by default. */
export const MenuRadioItem = (props: MenuRadioItemProps) => {
  const [slots, local, rest] = splitProps(props, SLOTS, ['class', 'valueText']);
  const label = resolveChildren(() => slots.children);
  return (
    <ArkMenu.RadioItem
      {...rest}
      valueText={local.valueText ?? textOf(label())}
      class={cx(styles.item, local.class)}
    >
      <OptionBody {...slots}>{label()}</OptionBody>
    </ArkMenu.RadioItem>
  );
};

/** Checkmark as the non-color selection cue (derived: trailing position, so labels stay aligned). */
const OptionBody = (props: ItemSlots) => (
  <ArkMenu.ItemContext>
    {(state) => (
      <ItemBody
        {...props}
        selected={state().checked}
        end={
          <ArkMenu.ItemIndicator class={styles.trailing}>
            <Icon name="check" />
          </ArkMenu.ItemIndicator>
        }
      />
    )}
  </ArkMenu.ItemContext>
);

export type MenuTriggerItemProps = Omit<ItemSlots, 'trailingIcon' | 'trailing'> &
  Omit<ArkMenu.TriggerItemProps, 'children' | 'asChild'> & {
    /** Typeahead text; defaults to the label when it's plain text. */
    valueText?: string;
  };

/**
 * Item that opens a submenu (aria-haspopup, aria-expanded) on hover, Enter,
 * Space or Right (Left in RTL). Put it in a nested `Menu.Root` next to the
 * submenu's `Menu.Content`.
 */
export const MenuTriggerItem = (props: MenuTriggerItemProps) => {
  const [slots, local, rest] = splitProps(
    props,
    ['leadingIcon', 'leading', 'supportingText', 'trailingText', 'badge', 'children'],
    ['class', 'valueText'],
  );
  const label = resolveChildren(() => slots.children);
  return (
    <ArkMenu.TriggerItem
      {...rest}
      class={cx(styles.item, local.class)}
      data-valuetext={local.valueText ?? textOf(label())}
    >
      <ItemBody
        {...slots}
        end={
          <span class={styles.trailing}>
            <Icon name="arrow_right" mirror />
          </span>
        }
      >
        {label()}
      </ItemBody>
    </ArkMenu.TriggerItem>
  );
};

// ---- Groups and dividers ----

export type MenuGroupProps = ArkMenu.ItemGroupProps & {
  /** Section label text heading the group; it labels the group for assistive tech. */
  label?: JSX.Element;
};

/** A group of items (role group). In the `gap` layout each group is its own segment. */
export const MenuGroup = (props: MenuGroupProps) => {
  const [local, rest] = splitProps(props, ['class', 'label', 'children']);
  return (
    <ArkMenu.ItemGroup {...rest} class={cx(styles.group, local.class)}>
      <Show when={local.label}>
        <ArkMenu.ItemGroupLabel class={styles.groupLabel}>{local.label}</ArkMenu.ItemGroupLabel>
      </Show>
      {local.children}
    </ArkMenu.ItemGroup>
  );
};

export type MenuRadioGroupProps = Omit<ArkMenu.RadioItemGroupProps, 'value' | 'onValueChange'> & {
  label?: JSX.Element;
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** Single-select group of `Menu.RadioItem`s, controlled or uncontrolled. */
export const MenuRadioGroup = (props: MenuRadioGroupProps) => {
  const [local, rest] = splitProps(props, [
    'class',
    'label',
    'children',
    'value',
    'defaultValue',
    'onValueChange',
  ]);
  const [inner, setInner] = createSignal(local.defaultValue);
  return (
    <ArkMenu.RadioItemGroup
      {...rest}
      class={cx(styles.group, local.class)}
      value={local.value !== undefined ? local.value : inner()}
      onValueChange={(e) => {
        setInner(e.value);
        local.onValueChange?.(e.value);
      }}
    >
      <Show when={local.label}>
        <ArkMenu.ItemGroupLabel class={styles.groupLabel}>{local.label}</ArkMenu.ItemGroupLabel>
      </Show>
      {local.children}
    </ArkMenu.RadioItemGroup>
  );
};

export type MenuDividerProps = ArkMenu.SeparatorProps;

/** 1px divider between groups (role separator, never focusable). */
export const MenuDivider = (props: MenuDividerProps) => {
  const [local, rest] = splitProps(props, ['class']);
  return <ArkMenu.Separator {...rest} class={cx(styles.divider, local.class)} />;
};

/**
 * M3 Expressive menu (m3-guidelines/components/menus.md): vertical (standard
 * or vibrant color, list or gap layout, density 0 to -3) or baseline, with
 * action, link, checkbox, radio and submenu items, groups with section
 * labels and dividers, and context menus. Behavior is Ark UI `Menu`.
 *
 * ```tsx
 * <Menu.Root>
 *   <Menu.Trigger asChild={(p) => <IconButton {...p()} icon="more_vert" label="More options" />} />
 *   <Menu.Content>
 *     <Menu.Item value="edit" leadingIcon="edit">Edit</Menu.Item>
 *   </Menu.Content>
 * </Menu.Root>
 * ```
 */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  ContextTrigger: MenuContextTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  TriggerItem: MenuTriggerItem,
  Group: MenuGroup,
  Divider: MenuDivider,
  /** Ark's menu API (open, setOpen, highlightedValue, ...) as a render prop. */
  Context: ArkMenu.Context,
};
