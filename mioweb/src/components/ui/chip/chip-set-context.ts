import { createContext, useContext } from 'solid-js';

export type ChipSetSelection = 'none' | 'single' | 'multi';

export type ChipSetState = {
  selection: () => ChipSetSelection;
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
};

/**
 * Set by `ChipSet`: with a selection mode, `FilterChip`s with a `value`
 * take their selected state from it and render as toggles (multi) or
 * radios (single).
 */
export const ChipSetContext = createContext<ChipSetState>();

export const useChipSet = () => useContext(ChipSetContext);
