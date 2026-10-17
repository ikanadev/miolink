import { createSignal } from 'solid-js';

const [keyboard, setKeyboard] = createSignal(false);
let tracking = false;

const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta']);

/**
 * Whether the last interaction was the keyboard. Select-list and combobox
 * options never take DOM focus (the listbox or the input keeps it), so
 * `:focus-visible` can't tell a keyboard highlight from a click or hover.
 */
export function useKeyboardModality(): () => boolean {
  if (!tracking && typeof document !== 'undefined') {
    tracking = true;
    document.addEventListener(
      'keydown',
      (e) => {
        if (!e.metaKey && !e.ctrlKey && !e.altKey && !MODIFIERS.has(e.key)) setKeyboard(true);
      },
      true,
    );
    document.addEventListener('pointerdown', () => setKeyboard(false), true);
  }
  return keyboard;
}

/** A pointer moved the highlight (combobox options highlight on hover). */
export const setPointerModality = () => setKeyboard(false);
