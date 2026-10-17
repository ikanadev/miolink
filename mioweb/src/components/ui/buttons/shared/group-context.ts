import { createContext, useContext, type Accessor } from 'solid-js';
import type { ButtonShape, ButtonSize } from './types';

export type ButtonGroupVariant = 'standard' | 'connected';
export type ButtonGroupSelection = 'none' | 'single' | 'multi';

export type ButtonGroupState = {
  variant: ButtonGroupVariant;
  size: ButtonSize;
  shape: ButtonShape;
  /** With `single` or `multi`, items with a `value` render as Ark ToggleGroup items. */
  selection: ButtonGroupSelection;
};

/**
 * Set by `ButtonGroup` for its items: `Button` and `IconButton` take their
 * default size and shape from it, and become selectable items when the group
 * has a selection mode.
 */
export const ButtonGroupContext = createContext<Accessor<ButtonGroupState>>();

export const useButtonGroup = () => useContext(ButtonGroupContext);
