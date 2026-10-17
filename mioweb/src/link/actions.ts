import { toApiError, errorMessage } from '../core/errors';
import { notify, notifyError } from '../core/feedback';
import { refresh } from '../tree/store';
import type { Link } from '../tree/types';
import { recordView, refreshLinkMetadata } from './api';

/**
 * Counts a view for a link the user opened through an `<a target="_blank">`
 * (the browser opens it; this only records it).
 */
export const onLinkOpened = (link: Link) => recordView(link.id);

/** Opens a link in a new tab from script (menus, search) and counts the view. */
export const openLink = (link: Link) => {
  window.open(link.url, '_blank', 'noopener,noreferrer');
  recordView(link.id);
};

export const copyLinkUrl = async (link: Link) => {
  try {
    await navigator.clipboard.writeText(link.url);
    notify('URL copied');
  } catch {
    notify('Couldn’t copy the URL');
  }
};

/** RefreshLinkMetadata with snackbar feedback, for menus. */
export const refreshMetadata = async (link: Link) => {
  try {
    const updated = await refreshLinkMetadata(link.id);
    notify(updated.title === link.title && updated.thumbnailUrl === link.thumbnailUrl ? 'Already up to date' : 'Title and image updated');
  } catch (err) {
    const error = toApiError(err);
    if (error.kind === 'not-found') {
      void refresh();
      notify('This link was deleted on another device.');
    } else if (error.kind === 'unauthenticated' || error.kind === 'not-configured') {
      notifyError(error);
    } else {
      notify(errorMessage(error));
    }
  }
};
