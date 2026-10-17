import { RadioGroup as ArkRadioGroup } from '@ark-ui/solid/radio-group';
import { Show, splitProps, type Component, type JSX } from 'solid-js';
import { Ripple } from '../shared/Ripple';
import styles from './radio-button.module.css';

/**
 * 20px icon: a ring (r 9 + 2px stroke = 20px outer) and a 10px dot, both
 * derived (spec §4.2, §11).
 */
const Glyph: Component = () => (
  <svg class={styles.glyph} viewBox="0 0 20 20" aria-hidden="true">
    <circle class={styles.ring} cx="10" cy="10" r="9" />
    <circle class={styles.dot} cx="10" cy="10" r="5" />
  </svg>
);

export type RadioGroupProps = Omit<
  ArkRadioGroup.RootProps,
  'asChild' | 'invalid' | 'onValueChange'
> & {
  /**
   * Visible group title, rendered as Ark's `RadioGroup.Label` and used as the
   * radiogroup's accessible name. Without it, pass `aria-label`.
   */
  label?: JSX.Element;
  /** Called when the user selects a radio. */
  onValueChange?: (value: string | null) => void;
  /** Error styling on every radio and aria-invalid on their inputs. */
  error?: boolean;
};

/**
 * M3 radio group: Ark UI
 * `RadioGroup` (role="radiogroup"). It owns the selected value and passes
 * `name`, `disabled`, `required`, `readOnly` and `form` to the native radio
 * inputs inside its `RadioButton`s, so exclusivity, arrow keys, Tab to the
 * checked radio, form submission and reset are native. Vertical by default
 * (spec §7); `orientation="horizontal"` lays the radios out in a row.
 */
export const RadioGroup: Component<RadioGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'onValueChange', 'error', 'class', 'children', 'orientation']);
  return (
    <ArkRadioGroup.Root
      {...rest}
      orientation={local.orientation ?? 'vertical'}
      class={local.class ? `${styles.group} ${local.class}` : styles.group}
      invalid={local.error}
      onValueChange={(d) => local.onValueChange?.(d.value)}
    >
      <Show when={local.label != null}>
        <ArkRadioGroup.Label class={styles.groupLabel}>{local.label}</ArkRadioGroup.Label>
      </Show>
      <div class={styles.items}>{local.children}</div>
    </ArkRadioGroup.Root>
  );
};

export type RadioButtonProps = Omit<ArkRadioGroup.ItemProps, 'children' | 'asChild' | 'invalid'> & {
  /** The value the group takes when this radio is selected. */
  value: string;
  /** Visible label after the icon; clicking it selects the radio. */
  children?: JSX.Element;
  /**
   * Accessible name when there's no visible label (rendered visually
   * hidden). Prefer `children`; one of the two is required.
   */
  label?: string;
  /** Error styling for this radio only (the group's `error` covers all of them). */
  error?: boolean;
};

/**
 * One M3 radio button inside a `RadioGroup`: Ark's `RadioGroup.Item` (a
 * `<label>`), a 40px state layer circle (`ItemControl`) with the ring and
 * dot, the label text, and a visually hidden native `<input type="radio">`
 * that holds focus.
 */
export const RadioButton: Component<RadioButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['children', 'label', 'error', 'class']);

  if (import.meta.env.DEV && local.children == null && !local.label) {
    console.warn('RadioButton: pass a visible label (children) or `label`.');
  }

  return (
    <ArkRadioGroup.Item
      {...rest}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      invalid={local.error}
    >
      <ArkRadioGroup.ItemControl class={styles.control}>
        <Ripple />
        <Glyph />
      </ArkRadioGroup.ItemControl>
      <Show
        when={local.children != null}
        fallback={<ArkRadioGroup.ItemText class={styles.hiddenLabel}>{local.label}</ArkRadioGroup.ItemText>}
      >
        <ArkRadioGroup.ItemText class={styles.label}>{local.children}</ArkRadioGroup.ItemText>
      </Show>
      <ArkRadioGroup.ItemHiddenInput />
    </ArkRadioGroup.Item>
  );
};

export type RadioButtonIconProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  checked?: boolean;
  disabled?: boolean;
  error?: boolean;
};

/**
 * The radio icon alone, decorative (aria-hidden, no state layer): for rows
 * where another element is the control and exposes the state, such as the
 * leading slot of a single-select `ListItem` (an option with aria-selected)
 * or a menu item. Never use it as a control by itself.
 */
export const RadioButtonIcon: Component<RadioButtonIconProps> = (props) => {
  const [local, rest] = splitProps(props, ['checked', 'disabled', 'error', 'class']);
  return (
    <span
      aria-hidden="true"
      {...rest}
      class={local.class ? `${styles.icon} ${local.class}` : styles.icon}
      data-state={local.checked ? 'checked' : 'unchecked'}
      data-disabled={local.disabled ? '' : undefined}
      data-invalid={local.error && !local.disabled ? '' : undefined}
    >
      <Glyph />
    </span>
  );
};
