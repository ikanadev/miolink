import { createStore } from '@tanstack/solid-store';
import { api } from '../core/api';
import { toApiError, type ApiError } from '../core/errors';
import { settingsStore } from '../core/settings';
import { readJson, removeKey, writeJson } from '../core/storage';
import { int64, toDirectory, toLink } from './convert';
import type { Directory, Link } from './types';

/**
 * The cached tree: every directory and link, and the revision they're at.
 * It's the UI's only source of server data. Screens read it and never wait
 * on a request to show something; `refresh()` and `applyWrite()` keep it
 * current with the backend's revision protocol.
 */
export type TreeCache = {
  /** Server the cache came from. A cache for another server is discarded. */
  serverUrl: string;
  /** 0 when nothing is cached. */
  revision: number;
  directories: Record<number, Directory>;
  links: Record<number, Link>;
};

export type SyncState = {
  syncing: boolean;
  /** The last refresh's failure, cleared by the next success. */
  error: ApiError | null;
  /** When the cache was last confirmed current (unix ms). */
  syncedAt: number | null;
};

const CACHE_KEY = 'miolink.tree';

const EMPTY: TreeCache = { serverUrl: '', revision: 0, directories: {}, links: {} };

export const treeStore = createStore<TreeCache>(readJson<TreeCache>(CACHE_KEY) ?? EMPTY);
export const syncStore = createStore<SyncState>({ syncing: false, error: null, syncedAt: null });

// Persist after a burst of changes settles.
let persistTimer: ReturnType<typeof setTimeout> | undefined;
treeStore.subscribe((cache) => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    if (cache.revision === 0) removeKey(CACHE_KEY);
    else writeJson(CACHE_KEY, cache);
  }, 250);
});

const setSync = (patch: Partial<SyncState>) => syncStore.setState((s) => ({ ...s, ...patch }));

/** Drops the cache, e.g. when the server changes. */
export const clearTree = () => treeStore.setState(() => EMPTY);

let inFlight: Promise<ApiError | null> | undefined;

/**
 * Calls `GetTree(known_revision)` and replaces the cache when it changed.
 * Concurrent calls share one request. Never throws: the failure is returned
 * and kept in `syncStore`, and the cache is kept.
 */
export const refresh = (): Promise<ApiError | null> => {
  inFlight ??= doRefresh().finally(() => (inFlight = undefined));
  return inFlight;
};

const doRefresh = async (): Promise<ApiError | null> => {
  const { baseUrl } = settingsStore.state;
  if (treeStore.state.serverUrl !== baseUrl && treeStore.state.revision !== 0) clearTree();
  setSync({ syncing: true });
  try {
    const known = treeStore.state.revision;
    const res = await api().tree.getTree({ knownRevision: int64(known) });
    // Settings changed while the request ran: its answer belongs to the old server.
    if (settingsStore.state.baseUrl !== baseUrl) return null;
    if (!res.notModified) {
      const directories: Record<number, Directory> = {};
      for (const d of res.directories) directories[Number(d.id)] = toDirectory(d);
      const links: Record<number, Link> = {};
      for (const l of res.links) links[Number(l.id)] = toLink(l);
      treeStore.setState(() => ({ serverUrl: baseUrl, revision: Number(res.revision), directories, links }));
    }
    setSync({ syncing: false, error: null, syncedAt: Date.now() });
    return null;
  } catch (err) {
    const error = toApiError(err);
    console.warn('miolink: sync failed', error);
    setSync({ syncing: false, error });
    return error;
  }
};

/** Mutable copies handed to `applyWrite`'s change function. */
export type TreeDraft = {
  directories: Record<number, Directory>;
  links: Record<number, Link>;
};

/**
 * Applies a write's result. If `previousRevision` is the cached revision,
 * `change` updates the cache locally and the cache moves to `revision`.
 * Otherwise another device changed something, so the change is discarded
 * and the whole tree is refreshed.
 */
export const applyWrite = (previousRevision: bigint, revision: bigint, change: (draft: TreeDraft) => void) => {
  const cache = treeStore.state;
  if (cache.revision !== 0 && Number(previousRevision) === cache.revision) {
    const draft: TreeDraft = { directories: { ...cache.directories }, links: { ...cache.links } };
    change(draft);
    treeStore.setState((s) => ({ ...s, ...draft, revision: Number(revision) }));
  } else {
    void refresh();
  }
};

/** Removes a directory with its subdirectories and links, like the backend's ON DELETE CASCADE. */
export const deleteSubtree = (draft: TreeDraft, id: number) => {
  const doomed = new Set([id]);
  // Directories are added after their parents, so one pass in id order may
  // miss a child moved under a newer directory: repeat until nothing changes.
  let grew = true;
  while (grew) {
    grew = false;
    for (const d of Object.values(draft.directories)) {
      if (d.parentId !== null && doomed.has(d.parentId) && !doomed.has(d.id)) {
        doomed.add(d.id);
        grew = true;
      }
    }
  }
  for (const d of doomed) delete draft.directories[d];
  for (const l of Object.values(draft.links)) if (doomed.has(l.directoryId)) delete draft.links[l.id];
};

/** Updates a link's view count; RecordView doesn't change the revision. */
export const setLinkViews = (id: number, views: number) =>
  treeStore.setState((s) => {
    const link = s.links[id];
    return link ? { ...s, links: { ...s.links, [id]: { ...link, views } } } : s;
  });

/**
 * Keeps the cache current: refreshes now, when the tab becomes visible or
 * the browser comes back online, every minute while visible (cheap: an
 * unchanged tree is `not_modified`), and when the server settings change.
 * Returns a cleanup function.
 */
export const startSync = (): (() => void) => {
  const configured = () => !!settingsStore.state.baseUrl && !!settingsStore.state.apiKey;
  const maybeRefresh = () => {
    if (configured() && document.visibilityState === 'visible') void refresh();
  };

  let last = { baseUrl: settingsStore.state.baseUrl, apiKey: settingsStore.state.apiKey };
  const sub = settingsStore.subscribe((s) => {
    if (s.baseUrl === last.baseUrl && s.apiKey === last.apiKey) return;
    last = { baseUrl: s.baseUrl, apiKey: s.apiKey };
    setSync({ error: null });
    maybeRefresh();
  });

  document.addEventListener('visibilitychange', maybeRefresh);
  window.addEventListener('online', maybeRefresh);
  const timer = setInterval(maybeRefresh, 60_000);
  maybeRefresh();

  return () => {
    sub.unsubscribe();
    document.removeEventListener('visibilitychange', maybeRefresh);
    window.removeEventListener('online', maybeRefresh);
    clearInterval(timer);
  };
};
