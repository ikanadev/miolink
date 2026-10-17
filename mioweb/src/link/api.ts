import { api } from '../core/api';
import { applyWrite, setLinkViews } from '../tree/store';
import { int64, toLink } from '../tree/convert';
import type { Link } from '../tree/types';

// LinkService calls. Writes apply their result to the cached tree (or
// refresh it when another device changed it). Failures throw; callers turn
// them into messages with `toApiError`.

const put = (link: Link) => (t: { links: Record<number, Link> }) => {
  t.links[link.id] = link;
};

/** Saves a URL; the server fetches its title and thumbnail. */
export const createLink = async (directoryId: number, url: string): Promise<Link> => {
  const res = await api().link.createLink({ directoryId: int64(directoryId), url });
  const link = toLink(res.link!);
  applyWrite(res.previousRevision, res.revision, put(link));
  return link;
};

export const updateLinkTitle = async (id: number, title: string): Promise<Link> => {
  const res = await api().link.updateLink({ id: int64(id), title });
  const link = toLink(res.link!);
  applyWrite(res.previousRevision, res.revision, put(link));
  return link;
};

export const moveLink = async (id: number, directoryId: number): Promise<Link> => {
  const res = await api().link.moveLink({ id: int64(id), directoryId: int64(directoryId) });
  const link = toLink(res.link!);
  applyWrite(res.previousRevision, res.revision, put(link));
  return link;
};

export const deleteLink = async (id: number): Promise<void> => {
  const res = await api().link.deleteLink({ id: int64(id) });
  applyWrite(res.previousRevision, res.revision, (t) => {
    delete t.links[id];
  });
};

/** Fetches the page again, replacing the title (even an edited one) and thumbnail. */
export const refreshLinkMetadata = async (id: number): Promise<Link> => {
  const res = await api().link.refreshLinkMetadata({ id: int64(id) });
  const link = toLink(res.link!);
  applyWrite(res.previousRevision, res.revision, put(link));
  return link;
};

/** Counts a view. Fire and forget: a failed count isn't worth bothering the user. */
export const recordView = (id: number) => {
  void (async () => {
    try {
      const res = await api().link.recordView({ id: int64(id) });
      setLinkViews(id, Number(res.views));
    } catch (err) {
      console.warn('miolink: RecordView failed', err);
    }
  })();
};
