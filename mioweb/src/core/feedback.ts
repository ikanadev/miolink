import { snackbar } from '../components/ui/snackbar';
import { errorMessage, toApiError, type ApiError } from './errors';

let openSettings: () => void = () => {};

/** The shell registers how to reach Settings (it owns the router). */
export const setOpenSettings = (fn: () => void) => {
  openSettings = fn;
};

export const notify = (message: string) => snackbar.show({ message });

/** A failure shown on its own: a rejected key offers Settings. */
export const notifyError = (error: ApiError, id?: string) =>
  snackbar.show({
    id,
    message: errorMessage(error),
    ...(error.kind === 'unauthenticated' || error.kind === 'not-configured'
      ? { actionLabel: 'Settings', onAction: () => openSettings() }
      : {}),
  });

export type WriteFailureHandlers = {
  /** Show a message under the input (`already-exists`, `invalid-argument`). */
  field?: (message: string) => void;
  /** Show a message inside the dialog so the user can retry (unreachable, unknown). */
  inline: (message: string) => void;
  /** Close the dialog or sheet. */
  close: () => void;
  /** Refresh the tree after `not-found`. */
  refresh: () => void;
  /** Snackbar text for `not-found`. */
  notFound: string;
};

/**
 * The shared way a write dialog reacts to a failure:
 *
 * - `already-exists` / `invalid-argument`: under the field (or inline).
 * - `not-found`: the thing changed elsewhere: close, refresh, say so.
 * - `unauthenticated` / `not-configured`: close, snackbar offering Settings.
 * - anything else: inline, the dialog stays open for a retry.
 */
export const handleWriteFailure = (err: unknown, h: WriteFailureHandlers) => {
  const error = toApiError(err);
  switch (error.kind) {
    case 'already-exists':
    case 'invalid-argument':
      (h.field ?? h.inline)(errorMessage(error));
      return;
    case 'not-found':
      h.close();
      h.refresh();
      notify(h.notFound);
      return;
    case 'unauthenticated':
    case 'not-configured':
      h.close();
      notifyError(error);
      return;
    default:
      h.inline(errorMessage(error));
  }
};
