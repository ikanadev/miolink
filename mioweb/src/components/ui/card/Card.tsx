import {
  createContext,
  Show,
  splitProps,
  useContext,
  type Component,
  type JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Icon, type IconProps } from '../icon/Icon';
import { Ripple } from '../shared/Ripple';
import styles from './card.module.css';

export type CardVariant = 'elevated' | 'filled' | 'outlined';
export type CardOrientation = 'vertical' | 'horizontal';

const CardContext = createContext<{ disabled: () => boolean }>({ disabled: () => false });

const INTERACTIVE =
  'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable="false"])';

const merge = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

export type CardProps = JSX.HTMLAttributes<HTMLElement> & {
  /** Default `elevated`. */
  variant?: CardVariant;
  /** Media beside the content (`horizontal`) or above it. Default `vertical`. */
  orientation?: CardOrientation;
  /** Root element. Use `li` inside a list, `article` for standalone content. Default `div`. */
  as?: 'div' | 'article' | 'section' | 'li';
  /**
   * Fades the card and disables its `CardAction`. Disable any other controls
   * inside it too.
   */
  disabled?: boolean;
  /** The card is being picked up and moved: dragged elevation and state layer, above its siblings. */
  dragged?: boolean;
};

/**
 * M3 card (m3-guidelines/components/cards.md): elevated, filled or outlined
 * container for content about one subject.
 *
 * - Non-actionable (default): a plain container; controls inside handle
 *   their own states.
 * - Directly actionable: put one `CardAction` (link with `href`, or button)
 *   inside, usually around the headline text. It stretches over the whole
 *   card, which then gets the state layer, ripple, focus ring and hover
 *   elevation. Other controls stay outside the action in the DOM (never
 *   nested) and sit above it.
 */
export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'orientation',
    'as',
    'disabled',
    'dragged',
    'class',
    'ref',
  ]);

  const setRef = (el: HTMLElement) => {
    (local.ref as ((el: HTMLElement) => void) | undefined)?.(el);
    if (import.meta.env.DEV) {
      queueMicrotask(() => {
        const count = el.querySelectorAll(`.${CSS.escape(styles.action)}`).length;
        if (count > 1) {
          console.warn(`Card: ${count} CardActions. A card has at most one primary action.`);
        }
      });
    }
  };

  return (
    <CardContext.Provider value={{ disabled: () => !!local.disabled }}>
      <Dynamic
        component={local.as ?? 'div'}
        {...rest}
        ref={setRef}
        class={merge(styles.root, local.class)}
        data-variant={local.variant ?? 'elevated'}
        data-orientation={local.orientation ?? 'vertical'}
        data-disabled={local.disabled ? '' : undefined}
        data-dragged={local.dragged && !local.disabled ? '' : undefined}
      />
    </CardContext.Provider>
  );
};

type ActionCommon = {
  /** Accessible name of the whole card, usually the headline text. */
  children: JSX.Element;
  class?: string;
};

export type CardActionProps = ActionCommon &
  (
    | ({ href: string } & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'>)
    | ({ href?: undefined } & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>)
  );

/**
 * The card's primary action: a link (`href`) or a button. Its hit area
 * covers the whole card. Wrap the headline text with it so the card's
 * accessible name is the headline; it must not contain other controls.
 * Disabled with the card (a disabled link loses its href and leaves the tab
 * order).
 */
export const CardAction: Component<CardActionProps> = (props) => {
  const [local, rest] = splitProps(props as CardActionProps & { href?: string }, [
    'children',
    'class',
    'href',
    'ref',
  ]);
  const card = useContext(CardContext);

  const setRef = (el: HTMLElement) => {
    (local.ref as ((el: HTMLElement) => void) | undefined)?.(el);
    if (import.meta.env.DEV) {
      queueMicrotask(() => {
        if (el.querySelector(INTERACTIVE)) {
          console.warn(
            'CardAction: contains an interactive element. Nested controls are not allowed; place them in the card outside the action.',
          );
        }
      });
    }
  };

  return (
    <Show
      when={local.href !== undefined}
      fallback={
        <button
          type="button"
          {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={setRef}
          class={merge(styles.action, local.class)}
          disabled={card.disabled()}
        >
          <Ripple />
          {local.children}
        </button>
      }
    >
      <a
        {...(rest as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={setRef}
        class={merge(styles.action, local.class)}
        href={card.disabled() ? undefined : local.href}
        role={card.disabled() ? 'link' : undefined}
        aria-disabled={card.disabled() ? 'true' : undefined}
      >
        <Ripple />
        {local.children}
      </a>
    </Show>
  );
};

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

/** Image, video or thumbnail. Full width above the content, or a column in a horizontal card. Use `alt=""` for decorative images. */
export const CardMedia: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <div {...rest} class={merge(styles.media, local.class)} />;
};

/** Text block with the card's 16px padding. */
export const CardContent: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <div {...rest} class={merge(styles.content, local.class)} />;
};

type TextProps = {
  /** Truncate after this many lines. */
  maxLines?: number;
};

const textStyle = (maxLines: number | undefined, style: unknown) => ({
  ...(maxLines ? { '--_max-lines': maxLines } : {}),
  ...(typeof style === 'object' ? (style as JSX.CSSProperties) : {}),
});

export type CardHeadlineProps = JSX.HTMLAttributes<HTMLHeadingElement> &
  TextProps & {
    /** Heading level. Default 3. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  };

/** The card's subject (title-large). */
export const CardHeadline: Component<CardHeadlineProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'level', 'maxLines', 'style']);
  return (
    <Dynamic
      component={`h${local.level ?? 3}`}
      {...rest}
      class={merge(styles.headline, local.class)}
      data-max-lines={local.maxLines ? '' : undefined}
      style={textStyle(local.maxLines, local.style)}
    />
  );
};

export type CardTextProps = JSX.HTMLAttributes<HTMLParagraphElement> & TextProps;

/** Smaller line under the headline: byline, location, URL (body-medium). */
export const CardSubhead: Component<CardTextProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'maxLines', 'style']);
  return (
    <p
      {...rest}
      class={merge(styles.subhead, local.class)}
      data-max-lines={local.maxLines ? '' : undefined}
      style={textStyle(local.maxLines, local.style)}
    />
  );
};

/** Body text (body-medium). */
export const CardSupportingText: Component<CardTextProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'maxLines', 'style']);
  return (
    <p
      {...rest}
      class={merge(styles.supportingText, local.class)}
      data-max-lines={local.maxLines ? '' : undefined}
      style={textStyle(local.maxLines, local.style)}
    />
  );
};

/** Row of buttons or icon buttons at the end of the card. Only in non-actionable cards, or beside a `CardAction`. */
export const CardActions: Component<DivProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <div {...rest} class={merge(styles.actions, local.class)} />;
};

/** A 24px icon in the card's icon color (primary). */
export const CardIcon: Component<IconProps> = (props) => {
  const [local, rest] = splitProps(props, ['class']);
  return <Icon filled {...rest} class={merge(styles.icon, local.class)} />;
};
