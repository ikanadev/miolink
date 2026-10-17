import { Switch as ArkSwitch } from '@ark-ui/solid/switch';
import { createSignal, createUniqueId, Show, splitProps, type Component, type JSX } from 'solid-js';
import { Icon } from '../icon';
import { Ripple } from '../shared/Ripple';
import styles from './switch.module.css';

/**
 * Icons in the handle: `none` (default), `selected` (check when
 * on) or `both` (check when on, close when off; the off handle is 24px).
 */
export type SwitchIcons = 'none' | 'selected' | 'both';

/** Check and close glyphs, both rendered so they can cross-fade. */
const HandleIcons: Component = () => (
  <>
    <Icon class={`${styles.handleIcon} ${styles.onIcon}`} name="check" size={16} />
    <Icon class={`${styles.handleIcon} ${styles.offIcon}`} name="close" size={16} />
  </>
);

export type SwitchProps = Omit<
  ArkSwitch.RootProps,
  'children' | 'asChild' | 'onCheckedChange' | 'aria-label' | 'invalid'
> & {
  /** Visible label before the switch; clicking it toggles. */
  children?: JSX.Element;
  /**
   * Accessible name when there's no visible label (rendered visually
   * hidden). Prefer `children`; one of the two is required.
   */
  label?: string;
  /** Secondary text under the label, linked with aria-describedby. */
  supportingText?: JSX.Element;
  /** Icons in the handle. Default `none`. */
  icons?: SwitchIcons;
  /** Called on user changes, including Enter. */
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * M3 switch. Ark UI `Switch`: the root
 * is a `<label>`, a visually hidden native `<input type="checkbox"
 * role="switch">` holds focus and form participation (`name`, `value`,
 * `required`, `form`), and the track/handle react to Ark's data attributes.
 * The label and optional supporting text come first and the switch trails
 * them, as in settings lists.
 */
export const Switch: Component<SwitchProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'children',
    'label',
    'supportingText',
    'icons',
    'onCheckedChange',
    'class',
  ]);
  // Ark's press tracking is pointer-only; Space/Enter on the focused input
  // mark the control as pressed so the handle grows to 28px.
  const [keyPressed, setKeyPressed] = createSignal(false);
  const supportingId = createUniqueId();

  if (import.meta.env.DEV && local.children == null && !local.label) {
    console.warn('Switch: pass a visible label (children) or `label`.');
  }

  return (
    <ArkSwitch.Root
      {...rest}
      class={local.class ? `${styles.root} ${local.class}` : styles.root}
      onCheckedChange={(d) => local.onCheckedChange?.(d.checked)}
    >
      <Show
        when={local.children != null}
        fallback={<ArkSwitch.Label class={styles.hiddenLabel}>{local.label}</ArkSwitch.Label>}
      >
        <span class={styles.text}>
          <ArkSwitch.Label class={styles.label}>{local.children}</ArkSwitch.Label>
          <Show when={local.supportingText != null}>
            <span class={styles.supporting} id={supportingId} data-disabled={rest.disabled ? '' : undefined}>
              {local.supportingText}
            </span>
          </Show>
        </span>
      </Show>
      <ArkSwitch.Control
        class={styles.control}
        data-icons={local.icons ?? 'none'}
        data-key-pressed={keyPressed() ? '' : undefined}
      >
        <span class={styles.handleContainer}>
          <ArkSwitch.Context>
            {(api) => (
              <span class={styles.stateLayer} data-disabled={api().disabled ? '' : undefined}>
                <Ripple />
              </span>
            )}
          </ArkSwitch.Context>
          <ArkSwitch.Thumb class={styles.handle}>
            <HandleIcons />
          </ArkSwitch.Thumb>
        </span>
      </ArkSwitch.Control>
      <ArkSwitch.HiddenInput
        role="switch"
        aria-describedby={local.supportingText != null ? supportingId : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            // M3 Accessibility: Enter toggles too, instead of submitting the form.
            e.preventDefault();
            if (!e.repeat) e.currentTarget.click();
          }
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) setKeyPressed(true);
        }}
        onKeyUp={() => setKeyPressed(false)}
        onBlur={() => setKeyPressed(false)}
      />
    </ArkSwitch.Root>
  );
};

export type SwitchIconProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  checked?: boolean;
  disabled?: boolean;
  icons?: SwitchIcons;
};

/**
 * The switch track and handle alone, decorative (aria-hidden, no state
 * layer): for rows where another element is the control and exposes the
 * state, such as the trailing slot of a multi-select `ListItem` (an option
 * with aria-selected). Never use it as a control by itself.
 */
export const SwitchIcon: Component<SwitchIconProps> = (props) => {
  const [local, rest] = splitProps(props, ['checked', 'disabled', 'icons', 'class']);
  return (
    <span
      aria-hidden="true"
      {...rest}
      class={`${styles.control} ${styles.icon}${local.class ? ` ${local.class}` : ''}`}
      data-state={local.checked ? 'checked' : 'unchecked'}
      data-disabled={local.disabled ? '' : undefined}
      data-icons={local.icons ?? 'none'}
    >
      <span class={styles.handleContainer}>
        <span class={styles.handle}>
          <HandleIcons />
        </span>
      </span>
    </span>
  );
};
