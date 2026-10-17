/** The hidden root directory: always exists, has no parent, can't be renamed, moved or deleted. */
export const ROOT_ID = 1;

/** A directory as the app keeps it (proto messages never leave the API modules). */
export type Directory = {
  id: number;
  /** null only for the root. */
  parentId: number | null;
  name: string;
  /** Unix milliseconds, UTC. */
  createdAt: number;
};

export type Link = {
  id: number;
  directoryId: number;
  title: string;
  url: string;
  /** Path relative to the API base URL, or empty. */
  thumbnailUrl: string;
  views: number;
  /** Unix milliseconds, UTC. */
  createdAt: number;
};
