import { splitProps, type Component, type JSX } from 'solid-js';
import styles from './icon.module.css';

export type IconProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Material Symbols ligature name, e.g. `arrow_back`. */
  name: string;
  /** Filled glyph (FILL 1). Default icons are filled; toggles use unfilled when unselected. */
  filled?: boolean;
  /** Size in px; also sets the optical size. Defaults to the parent's --md-icon-size or 24. */
  size?: number;
  /** Weight axis, 100-700. Default 400. */
  weight?: number;
  /** Mirror in RTL. Use for directional glyphs (arrow_back, send). */
  mirror?: boolean;
};

/**
 * A Material Symbols (Outlined) glyph. Decorative by default (aria-hidden);
 * the control that contains it carries the accessible name. Color is
 * currentColor.
 */
export const Icon: Component<IconProps> = (props) => {
  const [local, rest] = splitProps(props, ['name', 'filled', 'size', 'weight', 'mirror', 'class', 'style']);
  return (
    <span
      aria-hidden="true"
      translate="no"
      {...rest}
      class={local.class ? `${styles.icon} ${local.class}` : styles.icon}
      data-filled={local.filled ? '' : undefined}
      data-mirror={local.mirror ? '' : undefined}
      style={{
        ...(local.size
          ? {
              '--md-icon-size': `${local.size}px`,
              '--md-icon-optical-size': Math.min(48, Math.max(20, local.size)),
            }
          : {}),
        ...(local.weight ? { '--md-icon-weight': local.weight } : {}),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
    >
      {local.name}
    </span>
  );
};
