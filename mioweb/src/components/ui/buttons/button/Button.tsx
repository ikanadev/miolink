import { Toggle } from '@ark-ui/solid/toggle';
import { ToggleGroup, useToggleGroupContext } from '@ark-ui/solid/toggle-group';
import { Match, Show, splitProps, Switch, type Component, type JSX } from 'solid-js';
import { Icon } from '../../icon/Icon';
import { Ripple } from '../../shared/Ripple';
import base from '../shared/button-base.module.css';
import { useButtonGroup } from '../shared/group-context';
import type { ButtonShape, ButtonSize } from '../shared/types';
import styles from './button.module.css';

export type ButtonColor = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';

type Common = {
  /** The label: 1-3 words, sentence case. Required (icon-only actions are icon buttons). */
  children: JSX.Element;
  /** Default `filled`. */
  color?: ButtonColor;
  /** Default `small` (40px container, 48px target), or the group's size. */
  size?: ButtonSize;
  /** Default `round`, or the group's shape. */
  shape?: ButtonShape;
  /** Optional leading icon (Material Symbols name). Decorative; the label is the name. */
  icon?: string;
  /** Mirror the icon in RTL (directional glyphs such as arrow_forward). */
  mirror?: boolean;
  /** Stretch to the container's width. The content stays centered. */
  fullWidth?: boolean;
  /** Small buttons only: `wide` is the legacy 24px padding (not recommended). Default `default`. */
  padding?: 'default' | 'wide';
  disabled?: boolean;
  class?: string;
};

type ButtonAttrs = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'disabled' | 'aria-pressed' | 'value'
>;

type AnchorAttrs = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'children'>;

export type ButtonProps = Common &
  ButtonAttrs & {
    toggle?: false;
    href?: undefined;
    /**
     * Inside a `ButtonGroup` with a selection mode: the item's value. The
     * group owns the selection; the button renders as a toggle (multi) or a
     * radio (single).
     */
    value?: string;
  };

/** A link styled as a button: use only for navigation. */
export type LinkButtonProps = Common &
  AnchorAttrs & {
    href: string;
    toggle?: false;
  };

export type ToggleButtonProps = Omit<Common, 'color'> &
  Omit<ButtonAttrs, 'onChange'> & {
    /** Binary selection (Save, Favorite). Text buttons have no toggle. */
    toggle: true;
    /** Default `filled`. */
    color?: Exclude<ButtonColor, 'text'>;
    href?: undefined;
    /** Controlled selected state. */
    selected?: boolean;
    defaultSelected?: boolean;
    /** Called after `selected` flips. `preventDefault()` in `onClick` cancels the flip. */
    onSelectedChange?: (selected: boolean) => void;
    /** Icon when selected; defaults to `icon`. Selected icons are filled, unselected outlined. */
    selectedIcon?: string;
    /**
     * Label when selected (keep a similar length). The label change then
     * conveys the state, so aria-pressed is omitted (M3 Accessibility).
     */
    selectedLabel?: JSX.Element;
    /**
     * Icon weight when selected (for example 600), for glyphs that have no
     * filled version (M3 Accessibility: semibold, or bold if that's not enough).
     */
    selectedWeight?: number;
  };

type AnyButtonProps = Common &
  ButtonAttrs &
  Omit<ToggleButtonProps, keyof Common | keyof ButtonAttrs | 'toggle' | 'color' | 'href'> & {
    toggle?: boolean;
    href?: string;
    value?: string;
  };

/** Selected state of a group item, read from the surrounding Ark ToggleGroup. */
const GroupItemContent: Component<{ value: string; children: (selected: boolean) => JSX.Element }> = (
  props,
) => {
  const api = useToggleGroupContext();
  return <>{props.children(api().value.includes(props.value))}</>;
};

/**
 * M3 button: default or
 * toggle, five color styles, five sizes, round or square with the pressed
 * and selected shape morphs, optional leading icon. Toggles are Ark UI
 * `Toggle`; inside a selectable `ButtonGroup`, items with a `value` are Ark
 * `ToggleGroup` items. `href` renders a link.
 */
export const Button: Component<ButtonProps | LinkButtonProps | ToggleButtonProps> = (props) => {
  const [local, rest] = splitProps(props as AnyButtonProps, [
    'children',
    'color',
    'size',
    'shape',
    'icon',
    'mirror',
    'fullWidth',
    'padding',
    'disabled',
    'class',
    'toggle',
    'selected',
    'defaultSelected',
    'onSelectedChange',
    'selectedIcon',
    'selectedLabel',
    'selectedWeight',
    'value',
    'type',
  ]);
  const group = useButtonGroup();

  const color = () => local.color ?? 'filled';
  const isGroupItem = () => {
    if (!group || group().selection === 'none') return false;
    if (local.value !== undefined) return true;
    if (import.meta.env.DEV) console.warn('Button: items of a selectable ButtonGroup need a `value`.');
    return false;
  };
  const isToggle = () => {
    if (!local.toggle) return false;
    if (color() !== 'text') return true;
    if (import.meta.env.DEV) console.warn('Button: text buttons have no toggle; rendering a default button.');
    return false;
  };
  if (import.meta.env.DEV && group && color() === 'text') {
    console.warn('Button: avoid text buttons in a ButtonGroup (no container to morph).');
  }

  const rootProps = () => ({
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-color': color(),
    'data-size': local.size ?? group?.().size ?? 'small',
    'data-shape': local.shape ?? group?.().shape ?? 'round',
    'data-padding': local.padding === 'wide' ? 'wide' : undefined,
    'data-full-width': local.fullWidth ? '' : undefined,
  });

  const content = (label: JSX.Element, icon: string | undefined, filled: boolean, selected = false) => (
    <>
      <Ripple />
      <Show when={icon}>
        {(name) => (
          <Icon
            class={base.icon}
            name={name()}
            filled={filled}
            weight={selected ? local.selectedWeight : undefined}
            mirror={local.mirror}
          />
        )}
      </Show>
      <span class={base.label}>{label}</span>
    </>
  );

  return (
    <Switch
      fallback={
        <button
          {...(rest as ButtonAttrs)}
          {...rootProps()}
          type={local.type ?? 'button'}
          disabled={local.disabled}
        >
          {content(local.children, local.icon, true)}
        </button>
      }
    >
      <Match when={isGroupItem()}>
        <ToggleGroup.Item
          {...(rest as ButtonAttrs)}
          {...rootProps()}
          value={local.value as string}
          disabled={local.disabled}
        >
          <GroupItemContent value={local.value as string}>
            {(selected) =>
              content(
                local.children,
                selected ? (local.selectedIcon ?? local.icon) : local.icon,
                selected,
                selected,
              )
            }
          </GroupItemContent>
        </ToggleGroup.Item>
      </Match>
      <Match when={isToggle()}>
        <Toggle.Root
          {...(rest as ButtonAttrs)}
          {...rootProps()}
          type={local.type ?? 'button'}
          disabled={local.disabled}
          pressed={local.selected}
          defaultPressed={local.defaultSelected}
          onPressedChange={local.onSelectedChange}
          // Ark always sets aria-pressed; null removes it when the label carries the state.
          aria-pressed={local.selectedLabel !== undefined ? (null as unknown as undefined) : undefined}
        >
          <Toggle.Context>
            {(api) =>
              content(
                api().pressed ? (local.selectedLabel ?? local.children) : local.children,
                api().pressed ? (local.selectedIcon ?? local.icon) : local.icon,
                api().pressed,
                api().pressed,
              )
            }
          </Toggle.Context>
        </Toggle.Root>
      </Match>
      <Match when={rest.href !== undefined}>
        {/* A disabled link drops its href (not focusable) and is marked aria-disabled. */}
        <a
          {...(rest as AnchorAttrs)}
          {...rootProps()}
          href={local.disabled ? undefined : rest.href}
          role={local.disabled ? 'link' : undefined}
          aria-disabled={local.disabled ? 'true' : undefined}
        >
          {content(local.children, local.icon, true)}
        </a>
      </Match>
    </Switch>
  );
};
