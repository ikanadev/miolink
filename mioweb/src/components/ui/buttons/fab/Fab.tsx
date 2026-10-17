import { Show, splitProps, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon } from '../../icon/Icon';
import { Ripple } from '../../shared/Ripple';
import { Tooltip } from '../../tooltip';
import type { TooltipTriggerAttrs } from '../../tooltip/trigger';
import base from '../shared/fab-base.module.css';
import type { FabColor as FabRoleColor } from '../shared/types';
import styles from './fab.module.css';

export type FabSize = 'fab' | 'medium' | 'large';
/** The six M3 Expressive styles plus the baseline `surface` (not recommended). */
export type FabColor = FabRoleColor | 'surface';

type Common = {
  /** Material Symbols name, rendered filled. Ignored when `children` is given. */
  icon?: string;
  /** Custom content instead of `icon` (an SVG, or the FAB menu's icons); size it with --md-icon-size. */
  children?: JSX.Element;
  /** Accessible name and tooltip: describes the action ("Compose a new message"), not the glyph. */
  label: string;
  /** Default `fab` (56px). `medium` (80px) is the most recommended; `large` is 96px. */
  size?: FabSize;
  /**
   * Default `primary-container`. `surface` is the baseline style (not
   * recommended in Expressive) and is always 56px.
   */
  color?: FabColor;
  /** Surface style only: lower container color and elevation (level1, level2 on hover). */
  lowered?: boolean;
  /**
   * Default true. False scales the FAB out to its center and removes it from
   * the tab order and the accessibility tree; true scales it back in. FABs
   * have no disabled state: hide the FAB when its action is unavailable.
   */
  visible?: boolean;
  /** Plain tooltip with `label` on hover and focus. Default true. */
  tooltip?: boolean;
  class?: string;
};

type ButtonAttrs = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'aria-label' | 'disabled'
>;
type AnchorAttrs = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'children' | 'aria-label'>;

export type FabButtonProps = Common & ButtonAttrs & { href?: undefined };
/** With `href` the FAB renders as a link. */
export type FabLinkProps = Common & AnchorAttrs & { href: string };
export type FabProps = FabButtonProps | FabLinkProps;

/**
 * M3 FAB:
 * icon-only, three sizes, six color styles plus the baseline surface style,
 * level3 elevation (level4 on hover), scale-from-center enter/exit through
 * `visible`, and a plain tooltip (`Tooltip`) with the label.
 *
 * Positioning (fixed,
 * bottom-end, 16px margins, safe-area insets) is left to the caller.
 */
export const Fab: Component<FabProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'icon',
    'children',
    'label',
    'size',
    'color',
    'lowered',
    'visible',
    'tooltip',
    'class',
  ]);

  if (import.meta.env.DEV && 'disabled' in props) {
    console.warn('Fab: FABs have no disabled state. Hide the FAB (visible={false}) when its action is unavailable.');
  }

  const visible = () => local.visible ?? true;

  const rootProps = () => ({
    ...rest,
    type: rest.href === undefined ? ('button' as const) : undefined,
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-size': local.size ?? 'fab',
    'data-color': local.color ?? 'primary-container',
    'data-lowered': local.lowered ? '' : undefined,
    'data-visible': String(visible()),
    'aria-label': local.label,
    'aria-hidden': visible() ? undefined : ('true' as const),
    inert: !visible(),
  });

  return (
    <Tooltip
      label={local.label}
      disabled={local.tooltip === false || !visible()}
      asChild={(trigger) => (
        <Dynamic
          component={rest.href === undefined ? 'button' : 'a'}
          {...trigger(rootProps() as TooltipTriggerAttrs)}
        >
          <Ripple />
          <Show when={local.children} fallback={<Icon class={base.icon} name={local.icon ?? ''} filled />}>
            {local.children}
          </Show>
        </Dynamic>
      )}
    />
  );
};
