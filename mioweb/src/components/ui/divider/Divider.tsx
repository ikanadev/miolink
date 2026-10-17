import { Show, splitProps, type Component, type JSX } from 'solid-js';
import styles from './divider.module.css';

export type DividerInset = 'none' | 'start' | 'middle';
export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'ref'> & {
  /**
   * `none` (default): full width. `start`: 16px inset at the inline start,
   * aligned with content after icons or avatars. `middle`: 16px at both
   * ends. On vertical dividers the insets apply to the block ends.
   */
  inset?: DividerInset;
  /** Default `horizontal`. Vertical dividers stretch to the container's cross size. */
  orientation?: DividerOrientation;
  /**
   * Default true: hidden from assistive technology. False exposes it as a
   * separator between groups (`<hr>`, or `role="separator"` with
   * `aria-orientation="vertical"`).
   */
  decorative?: boolean;
};

/**
 * M3 divider: a 1px outline-variant
 * line that groups content. Non-interactive, never focusable, no motion.
 * Horizontal dividers render an `<hr>`, vertical ones a `<div>`.
 */
export const Divider: Component<DividerProps> = (props) => {
  const [local, rest] = splitProps(props, ['inset', 'orientation', 'decorative', 'class']);
  const vertical = () => local.orientation === 'vertical';
  const decorative = () => local.decorative ?? true;

  const attrs = () => ({
    class: local.class ? `${styles.root} ${local.class}` : styles.root,
    'data-inset': local.inset ?? 'none',
    'data-orientation': vertical() ? 'vertical' : 'horizontal',
    'aria-hidden': decorative() ? ('true' as const) : undefined,
  });

  return (
    <Show when={vertical()} fallback={<hr {...rest} {...attrs()} />}>
      <div
        {...rest}
        {...attrs()}
        role={decorative() ? 'none' : 'separator'}
        aria-orientation={decorative() ? undefined : 'vertical'}
      />
    </Show>
  );
};
