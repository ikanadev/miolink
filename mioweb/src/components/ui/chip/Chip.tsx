import { Toggle } from '@ark-ui/solid/toggle';
import { createSignal, Match, Show, splitProps, Switch, type Component, type JSX } from 'solid-js';
import { Icon } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import { useChipSet } from './chip-set-context';
import styles from './chip.module.css';

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';

type ChipCommon = {
  /** The label: a noun or short phrase, 20 characters or fewer. Truncates with an ellipsis. */
  label: string;
  disabled?: boolean;
  /** Shows the dragged state (level4 elevation, 0.16 state layer) while the app drags the chip. */
  dragged?: boolean;
  /** Class on the chip's root (the container). */
  class?: string;
  /** Style on the chip's root. */
  style?: JSX.CSSProperties;
};

type ButtonAttrs = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'class' | 'style' | 'disabled' | 'value' | 'onChange' | 'aria-pressed'
>;

type AnchorAttrs = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'class' | 'style'>;

type RootProps = {
  variant: ChipVariant;
  elevated?: boolean;
  selected?: boolean;
  disabled?: boolean;
  dragged?: boolean;
  leading?: 'icon' | 'check' | 'avatar';
  trailing?: 'remove' | 'menu';
  class?: string;
  style?: JSX.CSSProperties;
  children: JSX.Element;
};

/** The non-focusable container; the actions inside it are native buttons or a link. */
const ChipRoot: Component<RootProps> = (props) => (
  <span
    class={props.class ? `${styles.root} ${props.class}` : styles.root}
    style={props.style}
    data-chip=""
    data-variant={props.variant}
    data-elevated={props.elevated ? '' : undefined}
    data-selected={props.selected ? '' : undefined}
    data-disabled={props.disabled ? '' : undefined}
    data-dragged={props.dragged ? '' : undefined}
    data-leading={props.leading}
    data-trailing={props.trailing}
  >
    {props.children}
  </span>
);

const Label: Component<{ text: string }> = (props) => <span class={styles.label}>{props.text}</span>;

const LeadingIcon: Component<{ icon?: string; check?: boolean }> = (props) => (
  <span class={styles.leading} aria-hidden="true">
    <Show when={props.icon}>{(name) => <Icon class={styles.icon} name={name()} />}</Show>
    <Show when={props.check}>
      <Icon class={styles.check} name="check" />
    </Show>
  </span>
);

const isChip = (el: Element | null): el is HTMLElement =>
  el instanceof HTMLElement && el.hasAttribute('data-chip') && !el.hasAttribute('data-disabled');

/**
 * Calls `onRemove`, then, if the chip left the DOM while it had focus, moves
 * focus to the next chip, or the previous one if none follows (spec §8).
 */
const removeChip = (root: HTMLElement | null | undefined, onRemove: (() => void) | undefined) => {
  if (!onRemove) return;
  if (!root) return onRemove();
  const hadFocus = root.contains(document.activeElement);
  let next: Element | null = root.nextElementSibling;
  while (next && !isChip(next)) next = next.nextElementSibling;
  if (!next) {
    next = root.previousElementSibling;
    while (next && !isChip(next)) next = next.previousElementSibling;
  }
  onRemove();
  queueMicrotask(() => {
    if (!hadFocus || root.isConnected) return;
    next?.querySelector<HTMLElement>('button:not(:disabled), a[href]')?.focus();
  });
};

const chipOf = (el: Element) => el.closest<HTMLElement>('[data-chip]');

const TrailingButton: Component<{
  kind: 'remove' | 'menu';
  label: string;
  disabled?: boolean;
  expanded?: boolean;
  onClick: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
}> = (props) => (
  <button
    type="button"
    class={styles.trailing}
    aria-label={props.label}
    aria-haspopup={props.kind === 'menu' ? 'menu' : undefined}
    aria-expanded={props.kind === 'menu' ? !!props.expanded : undefined}
    disabled={props.disabled}
    onClick={(e) => props.onClick(e)}
  >
    <Icon name={props.kind === 'remove' ? 'close' : 'arrow_drop_down'} />
  </button>
);

/** Delete or Backspace on a removable chip's primary action removes it (spec §8). */
const removeKeyHandler =
  (onRemove: () => void, user: unknown) => (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
    if (typeof user === 'function') user(e);
    else if (Array.isArray(user) && typeof user[0] === 'function') user[0](user[1], e);
    if (e.defaultPrevented) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemove();
    }
  };

// ---------------------------------------------------------------------------
// Assist

export type AssistChipProps = ChipCommon &
  ButtonAttrs & {
    /** Leading icon (Material Symbols name), in `primary`. */
    icon?: string;
    /** Elevated style: only on images or busy backgrounds. */
    elevated?: boolean;
    href?: undefined;
  };

/** An assist chip that navigates. */
export type LinkAssistChipProps = ChipCommon &
  AnchorAttrs & {
    icon?: string;
    elevated?: boolean;
    href: string;
  };

/**
 * Assist chip (spec §2): a smart or automated action such as "Add to
 * calendar". The label usually starts with a verb. A native `<button>`, or
 * a link with `href`. Other props go on that button or link; `class` and
 * `style` go on the chip's container.
 */
export const AssistChip: Component<AssistChipProps | LinkAssistChipProps> = (props) => {
  const [local, rest] = splitProps(props as AssistChipProps & { href?: string }, [
    'label',
    'icon',
    'elevated',
    'disabled',
    'dragged',
    'class',
    'style',
    'type',
  ]);
  const content = () => (
    <>
      <Ripple />
      <Show when={local.icon}>
        <LeadingIcon icon={local.icon} />
      </Show>
      <Label text={local.label} />
    </>
  );
  return (
    <ChipRoot
      variant="assist"
      elevated={local.elevated}
      disabled={local.disabled}
      dragged={local.dragged}
      leading={local.icon ? 'icon' : undefined}
      class={local.class}
      style={local.style}
    >
      <Show
        when={rest.href !== undefined}
        fallback={
          <button {...(rest as ButtonAttrs)} class={styles.primary} type={local.type ?? 'button'} disabled={local.disabled}>
            {content()}
          </button>
        }
      >
        {/* A disabled link drops its href (not focusable) and is marked aria-disabled. */}
        <a
          {...(rest as AnchorAttrs)}
          class={styles.primary}
          href={local.disabled ? undefined : rest.href}
          role={local.disabled ? 'link' : undefined}
          aria-disabled={local.disabled ? 'true' : undefined}
        >
          {content()}
        </a>
      </Show>
    </ChipRoot>
  );
};

// ---------------------------------------------------------------------------
// Suggestion

export type SuggestionChipProps = ChipCommon &
  ButtonAttrs & {
    /** Leading icon (Material Symbols name), in `primary`. */
    icon?: string;
    /** Elevated style: only on images or busy backgrounds. */
    elevated?: boolean;
  };

/**
 * Suggestion chip (spec §2): a product-generated suggestion such as a quick
 * reply. A native `<button>`; other props go on it, `class` and `style` on
 * the chip's container.
 */
export const SuggestionChip: Component<SuggestionChipProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'icon', 'elevated', 'disabled', 'dragged', 'class', 'style', 'type']);
  return (
    <ChipRoot
      variant="suggestion"
      elevated={local.elevated}
      disabled={local.disabled}
      dragged={local.dragged}
      leading={local.icon ? 'icon' : undefined}
      class={local.class}
      style={local.style}
    >
      <button {...rest} class={styles.primary} type={local.type ?? 'button'} disabled={local.disabled}>
        <Ripple />
        <Show when={local.icon}>
          <LeadingIcon icon={local.icon} />
        </Show>
        <Label text={local.label} />
      </button>
    </ChipRoot>
  );
};

// ---------------------------------------------------------------------------
// Filter

export type FilterChipProps = ChipCommon &
  ButtonAttrs & {
    /** Optional leading icon; the checkmark replaces it while selected. */
    icon?: string;
    /** Elevated style: only on images or busy backgrounds. */
    elevated?: boolean;
    /** Controlled selected state (standalone chips). */
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    /**
     * Inside a `ChipSet` with a selection mode: the chip's value. The set
     * owns the selection; the chip renders as a toggle (multi) or a radio
     * (single).
     */
    value?: string;
    /**
     * Optional trailing action (medium and expanded windows, spec §6):
     * `remove` (calls `onRemove`; Delete/Backspace on the chip too) or
     * `menu` (a dropdown arrow that calls `onMenuClick`).
     */
    trailing?: 'remove' | 'menu';
    onRemove?: () => void;
    /** Accessible name of the remove button. Default "Remove {label}". */
    removeLabel?: string;
    onMenuClick?: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
    /** Whether the menu opened by the trailing arrow is open (aria-expanded). */
    menuExpanded?: boolean;
    /** Accessible name of the menu button. Default "{label} options". */
    menuLabel?: string;
  };

/**
 * Filter chip (spec §2): filters a collection. Selecting it fills the
 * container and shows a leading checkmark. An Ark UI `Toggle`
 * (aria-pressed); inside a single-select `ChipSet` it's a radio
 * (aria-checked). Other props go on that button, `class` and `style` on the
 * chip's container.
 */
export const FilterChip: Component<FilterChipProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'elevated',
    'disabled',
    'dragged',
    'class',
    'style',
    'selected',
    'defaultSelected',
    'onSelectedChange',
    'value',
    'trailing',
    'onRemove',
    'removeLabel',
    'onMenuClick',
    'menuExpanded',
    'menuLabel',
    'onKeyDown',
  ]);
  const set = useChipSet();
  const inSet = () => !!set && set.selection() !== 'none' && local.value !== undefined;
  const single = () => inSet() && set?.selection() === 'single';
  const [inner, setInner] = createSignal(local.defaultSelected ?? false);
  const selected = () => (inSet() ? (set?.isSelected(local.value as string) ?? false) : (local.selected ?? inner()));
  const change = (next: boolean) => {
    if (inSet()) return set?.toggle(local.value as string);
    setInner(next);
    local.onSelectedChange?.(next);
  };

  let primary: HTMLButtonElement | undefined;
  const remove = () => removeChip(primary && chipOf(primary), local.onRemove);

  return (
    <ChipRoot
      variant="filter"
      elevated={local.elevated}
      selected={selected()}
      disabled={local.disabled}
      dragged={local.dragged}
      leading={local.icon ? 'icon' : 'check'}
      trailing={local.trailing}
      class={local.class}
      style={local.style}
    >
      <Toggle.Root
        {...rest}
        ref={(el: HTMLButtonElement) => {
          primary = el;
          if (typeof rest.ref === 'function') (rest.ref as (el: HTMLButtonElement) => void)(el);
        }}
        class={styles.primary}
        type="button"
        disabled={local.disabled}
        pressed={selected()}
        onPressedChange={change}
        role={single() ? 'radio' : undefined}
        aria-checked={single() ? selected() : undefined}
        // Ark always sets aria-pressed; null removes it on radios.
        aria-pressed={single() ? (null as unknown as undefined) : undefined}
        onKeyDown={
          local.trailing === 'remove'
            ? removeKeyHandler(remove, local.onKeyDown)
            : (local.onKeyDown as JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent>)
        }
      >
        <Ripple />
        <LeadingIcon icon={local.icon} check />
        <Label text={local.label} />
      </Toggle.Root>
      <Switch>
        <Match when={local.trailing === 'remove'}>
          <TrailingButton
            kind="remove"
            label={local.removeLabel ?? `Remove ${local.label}`}
            disabled={local.disabled}
            onClick={remove}
          />
        </Match>
        <Match when={local.trailing === 'menu'}>
          <TrailingButton
            kind="menu"
            label={local.menuLabel ?? `${local.label} options`}
            disabled={local.disabled}
            expanded={local.menuExpanded}
            onClick={(e) => local.onMenuClick?.(e)}
          />
        </Match>
      </Switch>
    </ChipRoot>
  );
};

// ---------------------------------------------------------------------------
// Input

export type InputChipProps = ChipCommon &
  ButtonAttrs & {
    /** Leading icon (Material Symbols name). Use `icon` or `avatar`, not both. */
    icon?: string;
    /** 24px circular avatar: an image URL (decorative, alt="") or content such as initials. */
    avatar?: string | JSX.Element;
    /** Selected look (for example the chip a Backspace selected in a field). Visual only. */
    selected?: boolean;
    /** Called by the remove button, or Delete/Backspace on the chip. Remove the chip's data here. */
    onRemove: () => void;
    /** Accessible name of the remove button. Default "Remove {label}". */
    removeLabel?: string;
  };

/**
 * Input chip (spec §2): a discrete piece of user-entered information, such
 * as a contact. Flat only, always removable. The chip is a native
 * `<button>` (its `onClick` can open details or edit) followed by a
 * separate remove button; after a removal focus moves to the next chip.
 * For chips typed into a text field, use `InputChipField`.
 */
export const InputChip: Component<InputChipProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'label',
    'icon',
    'avatar',
    'selected',
    'disabled',
    'dragged',
    'class',
    'style',
    'onRemove',
    'removeLabel',
    'onKeyDown',
    'type',
  ]);
  let primary: HTMLButtonElement | undefined;
  const remove = () => removeChip(primary && chipOf(primary), local.onRemove);
  const leading = () => (local.avatar !== undefined ? 'avatar' : local.icon ? 'icon' : undefined);

  return (
    <ChipRoot
      variant="input"
      selected={local.selected}
      disabled={local.disabled}
      dragged={local.dragged}
      leading={leading()}
      trailing="remove"
      class={local.class}
      style={local.style}
    >
      <button
        {...rest}
        ref={(el) => {
          primary = el;
          if (typeof rest.ref === 'function') (rest.ref as (el: HTMLButtonElement) => void)(el);
        }}
        class={styles.primary}
        type={local.type ?? 'button'}
        disabled={local.disabled}
        onKeyDown={removeKeyHandler(remove, local.onKeyDown)}
      >
        <Ripple />
        <Switch>
          <Match when={typeof local.avatar === 'string' && local.avatar}>
            {(src) => <img class={styles.avatar} src={src()} alt="" />}
          </Match>
          <Match when={local.avatar !== undefined}>
            <span class={styles.avatar} aria-hidden="true">
              {local.avatar}
            </span>
          </Match>
          <Match when={local.icon}>
            <LeadingIcon icon={local.icon} />
          </Match>
        </Switch>
        <Label text={local.label} />
      </button>
      <TrailingButton
        kind="remove"
        label={local.removeLabel ?? `Remove ${local.label}`}
        disabled={local.disabled}
        onClick={remove}
      />
    </ChipRoot>
  );
};
