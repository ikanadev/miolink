import { Show, splitProps, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon } from '../../icon/Icon';
import { Ripple } from '../../shared/Ripple';
import { Tooltip } from '../../tooltip';
import type { TooltipTriggerAttrs } from '../../tooltip/trigger';
import base from '../shared/fab-base.module.css';
import type { FabColor } from '../shared/types';
import styles from './extended-fab.module.css';

export type ExtendedFabSize = 'small' | 'medium' | 'large' | 'baseline';
/** The six M3 Expressive styles plus the baseline `surface` and `branded` (not recommended). */
export type ExtendedFabColor = FabColor | 'surface' | 'branded';

export type ExtendedFabProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'disabled'
> & {
  /** Visible label, 1-2 words. Never wraps or truncates; names the button. */
  label: string;
  /** Optional leading Material Symbols name (trailing in RTL). Required to collapse. */
  icon?: string;
  /** Mirror the glyph in RTL (directional icons such as send). */
  mirror?: boolean;
  /**
   * Default `small` (56px). `baseline` is not recommended in M3 Expressive.
   * Ignored for `surface` and `branded`, which always use `baseline`.
   */
  size?: ExtendedFabSize;
  /**
   * Default `primary-container`. `surface` and `branded` are baseline styles,
   * not recommended, and only come in the baseline size.
   */
  color?: ExtendedFabColor;
  /** Surface/branded only: lowered container (surface-container-low, level 1). */
  lowered?: boolean;
  /**
   * Default true. False collapses it into a FAB of the same size (56/80/96):
   * the label fades out, the width shrinks and the icon recenters, and a
   * tooltip shows the label on hover and focus. Ignored without an icon. The
   * label stays in the DOM as the accessible name. See
   * `createExtendedOnScroll` to collapse while scrolling down.
   */
  extended?: boolean;
  /** Default true. False scales it out to its center and hides it (like `Fab`). */
  visible?: boolean;
  /** Render an `<a>` that navigates instead of a `<button>`. */
  href?: string;
  /** With `href`. */
  target?: string;
  /** With `href`. */
  rel?: string;
};

/**
 * M3 extended FAB: small,
 * medium, large (and baseline) sizes, six color styles (plus the baseline
 * surface and branded ones), an optional icon, and the collapse into a FAB.
 *
 * One per screen, 16px from the window edges. There is no disabled state:
 * hide it when the action isn't available. A custom `aria-label` must start
 * with the visible label's first word ("Create" -> "Create a new invite").
 */
export const ExtendedFab: Component<ExtendedFabProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'mirror',
    'size',
    'color',
    'lowered',
    'extended',
    'visible',
    'href',
    'class',
  ]);

  const extended = () => local.icon === undefined || (local.extended ?? true);
  const visible = () => local.visible ?? true;
  const size = (): ExtendedFabSize =>
    local.color === 'surface' || local.color === 'branded' ? 'baseline' : (local.size ?? 'small');

  const rootProps = () => ({
    ...rest,
    type: local.href === undefined ? ('button' as const) : undefined,
    href: local.href,
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-size': size(),
    'data-color': local.color ?? 'primary-container',
    'data-lowered': local.lowered ? '' : undefined,
    'data-icon': local.icon ? '' : undefined,
    'data-extended': String(extended()),
    'data-visible': String(visible()),
    'aria-hidden': visible() ? undefined : ('true' as const),
    inert: !visible(),
  });

  return (
    <Tooltip
      label={local.label}
      // No tooltip while the label is visible (M3 Accessibility).
      disabled={extended() || !visible()}
      asChild={(trigger) => (
        <Dynamic
          component={local.href === undefined ? 'button' : 'a'}
          {...trigger(rootProps() as TooltipTriggerAttrs)}
        >
          <Ripple />
          <Show when={local.icon}>
            {(name) => <Icon class={base.icon} name={name()} filled mirror={local.mirror} />}
          </Show>
          <span class={styles.labelWrap}>
            <span class={styles.label}>{local.label}</span>
          </span>
        </Dynamic>
      )}
    />
  );
};
