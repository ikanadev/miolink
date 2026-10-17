import { TagsInput, type TagsInputRootProps } from '@ark-ui/solid/tags-input';
import { Index, Match, Show, splitProps, Switch, type Component } from 'solid-js';
import { Icon } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import styles from './chip.module.css';

export type InputChipFieldProps = Omit<TagsInputRootProps, 'children' | 'asChild' | 'translations'> & {
  /** Visible label of the field. */
  label: string;
  /** Leading icon for every chip, or per value. */
  icon?: string | ((value: string) => string | undefined);
  /** Avatar image URL per value (24px circle, decorative). Takes precedence over `icon`. */
  avatar?: (value: string) => string | undefined;
  /** Accessible name of each chip's remove button. Default "Remove {value}". */
  removeLabel?: (value: string) => string;
};

/**
 * A text field whose entries become input chips (spec §6, §7, §9), built on
 * Ark UI `TagsInput`. Enter or the delimiter adds a chip; with the caret at
 * the start, Backspace (or ArrowLeft) selects the previous chip and a
 * second Backspace or Delete removes it; Enter or a double click on a chip
 * edits it as plain text. Focus stays in the text input, so the selected
 * chip is shown with the selected style instead of a focus ring.
 */
export const InputChipField: Component<InputChipFieldProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'icon', 'avatar', 'removeLabel', 'class', 'disabled']);

  const iconOf = (value: string) => (typeof local.icon === 'function' ? local.icon(value) : local.icon);

  return (
    <TagsInput.Root
      {...rest}
      disabled={local.disabled}
      class={local.class ? `${styles.field} ${local.class}` : styles.field}
      translations={{ deleteTagTriggerLabel: (value) => local.removeLabel?.(value) ?? `Remove ${value}` }}
    >
      <TagsInput.Context>
        {(api) => (
          <>
            <TagsInput.Label class={styles.fieldLabel}>{local.label}</TagsInput.Label>
            <TagsInput.Control class={styles.control}>
              <Index each={api().value}>
                {(value, index) => {
                  const avatar = () => local.avatar?.(value());
                  const icon = () => (avatar() ? undefined : iconOf(value()));
                  return (
                    <TagsInput.Item index={index} value={value()} class={styles.fieldItem}>
                      <TagsInput.ItemPreview
                        class={`${styles.root} ${styles.fieldChip}`}
                        data-chip=""
                        data-variant="input"
                        data-leading={avatar() ? 'avatar' : icon() ? 'icon' : undefined}
                        data-trailing={local.disabled ? undefined : 'remove'}
                        data-disabled={local.disabled ? '' : undefined}
                      >
                        <Ripple />
                        <Switch>
                          <Match when={avatar()}>{(src) => <img class={styles.avatar} src={src()} alt="" />}</Match>
                          <Match when={icon()}>
                            {(name) => (
                              <span class={styles.leading} aria-hidden="true">
                                <Icon name={name()} />
                              </span>
                            )}
                          </Match>
                        </Switch>
                        <TagsInput.ItemText class={styles.label}>{value()}</TagsInput.ItemText>
                        <Show when={!local.disabled}>
                          <TagsInput.ItemDeleteTrigger class={styles.trailing}>
                            <Icon name="close" />
                          </TagsInput.ItemDeleteTrigger>
                        </Show>
                      </TagsInput.ItemPreview>
                      <TagsInput.ItemInput class={styles.itemInput} />
                    </TagsInput.Item>
                  );
                }}
              </Index>
              <TagsInput.Input class={styles.input} />
            </TagsInput.Control>
          </>
        )}
      </TagsInput.Context>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  );
};
