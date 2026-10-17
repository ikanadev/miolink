import { Checkbox as ArkCheckbox, type CheckboxCheckedState } from '@ark-ui/solid/checkbox';
import { createSignal, Show, splitProps, type Component, type JSX } from 'solid-js';
import { Ripple } from '../shared/Ripple';
import styles from './checkbox.module.css';

export type { CheckboxCheckedState };

/** Check and dash glyphs, drawn with 2px strokes in the 18px box (derived, spec §11). */
const Glyphs: Component = () => (
  <svg class={styles.glyphs} viewBox="0 0 18 18" aria-hidden="true">
    <path class={styles.check} pathLength="1" d="M3.5 9.5 7 13l7.5-7.5" />
    <path class={styles.dash} d="M4 9h10" />
  </svg>
);

const stateOf = (checked: CheckboxCheckedState | undefined) =>
  checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';

export type CheckboxProps = Omit<
  ArkCheckbox.RootProps,
  'children' | 'asChild' | 'invalid' | 'onCheckedChange' | 'aria-label'
> & {
  /** Visible label after the box; clicking it toggles the checkbox. */
  children?: JSX.Element;
  /**
   * Accessible name when there's no visible label (rendered visually
   * hidden). Prefer `children`; one of the two is required.
   */
  label?: string;
  /** Controlled state: `true`, `false` or `'indeterminate'` (set only programmatically). */
  checked?: CheckboxCheckedState;
  defaultChecked?: CheckboxCheckedState;
  /** Called on user changes. Activating an indeterminate checkbox makes it checked. */
  onCheckedChange?: (checked: CheckboxCheckedState) => void;
  /** Error styling and aria-invalid. A required checkbox also shows it on `:user-invalid`. */
  error?: boolean;
};

/**
 * M3 checkbox (m3-guidelines/components/checkbox.md): unchecked, checked
 * and indeterminate, with error and disabled states and an optional label.
 * Ark UI `Checkbox`: the root is a `<label>`, a visually hidden native input
 * holds focus and form participation (`name`, `value`, `required`, `form`),
 * and the visuals react to Ark's data attributes. Inside a `CheckboxGroup`,
 * pass `value` and the group owns the checked state.
 */
export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, rest] = splitProps(props, ['children', 'label', 'onCheckedChange', 'error', 'class']);
  // Ark's press tracking is pointer-only; Space on the focused input marks
  // the control as pressed so the pressed state layer shows (spec §5).
  const [keyPressed, setKeyPressed] = createSignal(false);

  if (import.meta.env.DEV && local.children == null && !local.label) {
    console.warn('Checkbox: pass a visible label (children) or `label`.');
  }

  return (
    <ArkCheckbox.Root
      {...rest}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      invalid={local.error}
      onCheckedChange={(d) => local.onCheckedChange?.(d.checked)}
    >
      <ArkCheckbox.Control class={styles.control} data-key-pressed={keyPressed() ? '' : undefined}>
        <Ripple />
        <span class={styles.box}>
          <Glyphs />
        </span>
      </ArkCheckbox.Control>
      <Show
        when={local.children != null}
        fallback={<ArkCheckbox.Label class={styles.hiddenLabel}>{local.label}</ArkCheckbox.Label>}
      >
        <ArkCheckbox.Label class={styles.label}>{local.children}</ArkCheckbox.Label>
      </Show>
      <ArkCheckbox.HiddenInput
        onKeyDown={(e) => {
          if (e.key === ' ' && !e.repeat) setKeyPressed(true);
        }}
        onKeyUp={() => setKeyPressed(false)}
        onBlur={() => setKeyPressed(false)}
      />
    </ArkCheckbox.Root>
  );
};

export type CheckboxIconProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  checked?: CheckboxCheckedState;
  disabled?: boolean;
  error?: boolean;
};

/**
 * The checkbox box alone, decorative (aria-hidden, no state layer): for
 * rows where another element is the control and exposes the state, such as
 * the leading slot of a multi-select `ListItem` (an option with
 * aria-selected) or a menu item. Never use it as a control by itself.
 */
export const CheckboxIcon: Component<CheckboxIconProps> = (props) => {
  const [local, rest] = splitProps(props, ['checked', 'disabled', 'error', 'class']);
  return (
    <span
      aria-hidden="true"
      {...rest}
      class={`${styles.box} ${styles.icon}${local.class ? ` ${local.class}` : ''}`}
      data-state={stateOf(local.checked)}
      data-disabled={local.disabled ? '' : undefined}
      data-invalid={local.error && !local.disabled ? '' : undefined}
    >
      <Glyphs />
    </span>
  );
};

export type CheckboxGroupProps = ArkCheckbox.GroupProps;

/**
 * Ark `Checkbox.Group` (role="group"): owns the checked values of the
 * `Checkbox`es inside it (each needs a `value`) and passes `name`,
 * `disabled`, `invalid`, `readOnly` down. Stacks them vertically; label it
 * with `aria-labelledby`, or wrap it in a `<fieldset>` with a `<legend>`.
 */
export const CheckboxGroup: Component<CheckboxGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <ArkCheckbox.Group {...rest} class={local.class ? `${styles.group} ${local.class}` : styles.group} />;
};
