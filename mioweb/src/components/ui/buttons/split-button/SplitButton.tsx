import { Show, splitProps, type Component, type JSX } from 'solid-js';
import { Icon } from '../../icon/Icon';
import { MenuContent, MenuRoot, MenuTrigger, type MenuRootProps } from '../../menu';
import { Ripple } from '../../shared/Ripple';
import base from '../shared/button-base.module.css';
import type { ButtonSize } from '../shared/types';
import styles from './split-button.module.css';

/** Button color styles without `text` (split buttons have no text style). */
export type SplitButtonColor = 'elevated' | 'filled' | 'tonal' | 'outlined';

export type SplitButtonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'onSelect'> & {
  /** The main action's label, 1-2 words. With `iconOnly` it's the accessible name only. */
  label: string;
  /** Optional icon of the main action (Material Symbols name). */
  icon?: string;
  /** Show only `icon` on the leading button. */
  iconOnly?: boolean;
  /** Mirror the icon in RTL (directional glyphs). */
  mirror?: boolean;
  /** Accessible name of the menu button: the options it opens ("More watch options"). */
  menuLabel: string;
  /** Default `filled`. Colors don't change while the menu is open. */
  color?: SplitButtonColor;
  /** Default `small`. */
  size?: ButtonSize;
  disabled?: boolean;
  /** The main action. */
  onClick?: (event: MouseEvent) => void;
  /** Menu items (`MenuItem`, `MenuGroup`, ...). */
  children: JSX.Element;
  /** Controlled open state of the menu. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A menu item was selected (its `value`). */
  onSelect?: (value: string) => void;
  /** Other menu options (color, density, ...). */
  menu?: Omit<MenuRootProps, 'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'onSelect'>;
};

/**
 * M3 split button: a
 * leading button for the main action and a trailing menu button whose
 * chevron rotates while its menu (the Ark UI `Menu` of `../../menu`) is open.
 * Both halves reuse the button base: four color styles, five sizes. The menu
 * opens 4px below the trailing button, aligned to its start edge, and flips
 * when there's no room; Ark handles aria-expanded, arrow keys, Escape and
 * focus return.
 */
export const SplitButton: Component<SplitButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'iconOnly',
    'mirror',
    'menuLabel',
    'color',
    'size',
    'disabled',
    'onClick',
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'onSelect',
    'menu',
    'class',
  ]);

  if (import.meta.env.DEV && (local.color as string) === 'text') {
    console.warn('SplitButton: there is no text style; use elevated, filled, tonal or outlined.');
  }

  const color = () => local.color ?? 'filled';
  const size = () => local.size ?? 'small';
  const iconOnly = () => local.iconOnly === true && local.icon !== undefined;

  return (
    <MenuRoot
      positioning={{ placement: 'bottom-start', gutter: 4 }}
      {...local.menu}
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={(details) => local.onOpenChange?.(details.open)}
      onSelect={(details) => local.onSelect?.(details.value)}
    >
      <div
        role="group"
        {...rest}
        class={local.class ? `${styles.root} ${local.class}` : styles.root}
        data-size={size()}
      >
        <button
          type="button"
          class={`${styles.half} ${styles.leading}`}
          data-color={color()}
          data-size={size()}
          data-icon-only={iconOnly() ? '' : undefined}
          aria-label={iconOnly() ? local.label : undefined}
          disabled={local.disabled}
          onClick={(e) => local.onClick?.(e)}
        >
          <Ripple />
          <Show when={local.icon}>
            {(name) => <Icon class={base.icon} name={name()} filled mirror={local.mirror} />}
          </Show>
          <Show when={!iconOnly()}>
            <span class={base.label}>{local.label}</span>
          </Show>
        </button>
        <MenuTrigger
          type="button"
          class={`${styles.half} ${styles.trailing}`}
          data-color={color()}
          data-size={size()}
          aria-label={local.menuLabel}
          disabled={local.disabled}
        >
          <Ripple />
          {/* M3: the menu button rotates with the standard motion scheme, not the expressive one. */}
          <Icon class={styles.menuIcon} name="keyboard_arrow_down" filled data-motion-scheme="standard" />
        </MenuTrigger>
      </div>
      <MenuContent>{local.children}</MenuContent>
    </MenuRoot>
  );
};
