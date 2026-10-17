import { Toggle } from '@ark-ui/solid/toggle';
import { ToggleGroup, useToggleGroupContext } from '@ark-ui/solid/toggle-group';
import { Match, splitProps, Switch, type Component, type JSX } from 'solid-js';
import { Icon } from '../../icon/Icon';
import { Ripple } from '../../shared/Ripple';
import { Tooltip } from '../../tooltip';
import type { TooltipTriggerAttrs } from '../../tooltip/trigger';
import { useButtonGroup } from '../shared/group-context';
import type { ButtonShape, ButtonSize } from '../shared/types';
import styles from './icon-button.module.css';

export type IconButtonColor = 'filled' | 'tonal' | 'outlined' | 'standard';
export type IconButtonWidth = 'narrow' | 'default' | 'wide';

type Common = {
  /** Material Symbols name. */
  icon: string;
  /** Accessible name: describes the action ("Back", "Add to favorites"), not the glyph. */
  label: string;
  /** Default `filled`. */
  color?: IconButtonColor;
  /** Default `small` (40px container, 48px target), or the group's size. */
  size?: ButtonSize;
  /** Default `default`. Changes only the leading/trailing space. */
  width?: IconButtonWidth;
  /** Default `round`, or the group's shape. */
  shape?: ButtonShape;
  /** Mirror the glyph in RTL (directional icons such as arrow_back). */
  mirror?: boolean;
  /**
   * Show `label` in a plain tooltip on hover and focus (spec §1: icon
   * buttons on the web). Default false; leave it off when the button already
   * sits in a `Tooltip` or `RichTooltip`.
   */
  tooltip?: boolean;
  disabled?: boolean;
  class?: string;
};

type ButtonAttrs = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'aria-label' | 'aria-pressed' | 'disabled' | 'value'
>;
type AnchorAttrs = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'children' | 'aria-label'>;

export type IconButtonProps = Common &
  ButtonAttrs & {
    toggle?: false;
    href?: undefined;
    /** Inside a `ButtonGroup` with a selection mode: the item's value (see `Button`). */
    value?: string;
  };

/** With `href` the icon button renders as a link: use only for navigation. */
export type LinkIconButtonProps = Common &
  AnchorAttrs & {
    href: string;
    toggle?: false;
  };

export type ToggleIconButtonProps = Common &
  Omit<ButtonAttrs, 'onChange'> & {
    /** Binary on/off action (favorite, bookmark). Renders aria-pressed. */
    toggle: true;
    href?: undefined;
    /** Controlled selected state. */
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    /** Glyph when selected; defaults to `icon`. Selected glyphs are filled, unselected outlined. */
    selectedIcon?: string;
  };

type AnyIconButtonProps = Common &
  ButtonAttrs &
  Omit<ToggleIconButtonProps, keyof Common | keyof ButtonAttrs | 'toggle' | 'href'> & {
    toggle?: boolean;
    href?: string;
    value?: string;
  };

type Wrap = (attrs: TooltipTriggerAttrs) => TooltipTriggerAttrs;

const GroupItemIcon: Component<{ value: string; children: (selected: boolean) => JSX.Element }> = (props) => {
  const api = useToggleGroupContext();
  return <>{props.children(api().value.includes(props.value))}</>;
};

/**
 * M3 icon button:
 * default or toggle, four color styles, five sizes, three widths, round or
 * square with the pressed and selected shape morphs, optional tooltip.
 * Toggles are Ark UI `Toggle`; inside a selectable `ButtonGroup`, items with
 * a `value` are Ark `ToggleGroup` items. `href` renders a link.
 */
export const IconButton: Component<IconButtonProps | LinkIconButtonProps | ToggleIconButtonProps> = (
  props,
) => {
  const [local, rest] = splitProps(props as AnyIconButtonProps, [
    'icon',
    'label',
    'color',
    'size',
    'width',
    'shape',
    'mirror',
    'tooltip',
    'disabled',
    'class',
    'toggle',
    'selected',
    'defaultSelected',
    'onSelectedChange',
    'selectedIcon',
    'value',
  ]);
  const group = useButtonGroup();

  const color = () => local.color ?? 'filled';
  const isGroupItem = () => {
    if (!group || group().selection === 'none') return false;
    if (local.value !== undefined) return true;
    if (import.meta.env.DEV) console.warn('IconButton: items of a selectable ButtonGroup need a `value`.');
    return false;
  };
  if (import.meta.env.DEV && group && color() === 'standard') {
    console.warn('IconButton: avoid standard icon buttons in a ButtonGroup (no container to morph).');
  }

  const rootProps = () => ({
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-color': color(),
    'data-size': local.size ?? group?.().size ?? 'small',
    'data-width': local.width ?? 'default',
    'data-shape': local.shape ?? group?.().shape ?? 'round',
    'aria-label': local.label,
  });

  const content = (selected: boolean) => (
    <>
      <Ripple />
      <Icon
        name={selected ? (local.selectedIcon ?? local.icon) : local.icon}
        filled={selected}
        mirror={local.mirror}
      />
    </>
  );

  const render = (wrap: Wrap) => (
    <Switch
      fallback={
        <button
          type="button"
          {...(wrap({ ...rest, ...rootProps() } as TooltipTriggerAttrs) as ButtonAttrs)}
          disabled={local.disabled}
        >
          {/* Default icon buttons use the filled glyph. */}
          {content(true)}
        </button>
      }
    >
      <Match when={isGroupItem()}>
        <ToggleGroup.Item
          {...(wrap({ ...rest, ...rootProps() } as TooltipTriggerAttrs) as ButtonAttrs)}
          value={local.value as string}
          disabled={local.disabled}
        >
          <GroupItemIcon value={local.value as string}>{content}</GroupItemIcon>
        </ToggleGroup.Item>
      </Match>
      <Match when={local.toggle}>
        <Toggle.Root
          {...(wrap({ ...rest, ...rootProps() } as TooltipTriggerAttrs) as ButtonAttrs)}
          disabled={local.disabled}
          pressed={local.selected}
          defaultPressed={local.defaultSelected}
          onPressedChange={local.onSelectedChange}
        >
          <Toggle.Context>{(api) => content(api().pressed)}</Toggle.Context>
        </Toggle.Root>
      </Match>
      <Match when={rest.href !== undefined}>
        {/* A disabled link drops its href (not focusable) and is marked aria-disabled. */}
        <a
          {...(wrap({ ...rest, ...rootProps() } as TooltipTriggerAttrs) as AnchorAttrs)}
          href={local.disabled ? undefined : rest.href}
          role={local.disabled ? 'link' : undefined}
          aria-disabled={local.disabled ? 'true' : undefined}
        >
          {content(true)}
        </a>
      </Match>
    </Switch>
  );

  return local.tooltip ? (
    <Tooltip label={local.label} disabled={local.disabled} asChild={(trigger) => render(trigger)} />
  ) : (
    render((attrs) => attrs)
  );
};
