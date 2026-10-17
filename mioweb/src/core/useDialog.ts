import { useSelector } from '@tanstack/solid-store';
import { createMemo, type Accessor } from 'solid-js';
import { closeDialog, dialogsStore, type DialogRequest } from './dialogs';

type Of<K extends DialogRequest['kind']> = Extract<DialogRequest, { kind: K }>;

/**
 * One dialog's view of `dialogsStore`: whether it's open, and its request.
 * The request outlives the close, so the content stays the same during the
 * exit transition.
 */
export const useDialog = <K extends DialogRequest['kind']>(
  kind: K,
): { open: Accessor<boolean>; request: Accessor<Of<K> | undefined>; close: () => void } => {
  const current = useSelector(dialogsStore, (s) => s.dialog);
  const open = () => current()?.kind === kind;
  const request = createMemo<Of<K> | undefined>((prev) => {
    const r = current();
    return r?.kind === kind ? (r as Of<K>) : prev;
  });
  const close = () => {
    if (open()) closeDialog();
  };
  return { open, request, close };
};
