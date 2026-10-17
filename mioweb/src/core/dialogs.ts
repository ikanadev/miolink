import { createStore } from '@tanstack/solid-store';

/**
 * The write dialogs and the link details sheet are opened from many places
 * (cards, menus, search, the app bar), so they live once in the shell and
 * are opened through this store with only ids as payload.
 */
export type DialogRequest =
  | { kind: 'new-directory'; parentId: number }
  | { kind: 'rename-directory'; id: number }
  | { kind: 'move-directory'; id: number }
  | { kind: 'delete-directory'; id: number }
  | { kind: 'new-link'; directoryId: number; url?: string }
  | { kind: 'move-link'; id: number }
  | { kind: 'delete-link'; id: number };

export type DialogsState = {
  dialog: DialogRequest | null;
  /** Link shown in the details sheet. */
  linkDetails: number | null;
};

export const dialogsStore = createStore<DialogsState>({ dialog: null, linkDetails: null });

export const openDialog = (dialog: DialogRequest) => dialogsStore.setState((s) => ({ ...s, dialog }));
export const closeDialog = () => dialogsStore.setState((s) => ({ ...s, dialog: null }));

export const openLinkDetails = (id: number) => dialogsStore.setState((s) => ({ ...s, linkDetails: id }));
export const closeLinkDetails = () => dialogsStore.setState((s) => ({ ...s, linkDetails: null }));
