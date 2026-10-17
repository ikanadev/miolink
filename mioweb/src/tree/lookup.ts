import { createStore, useSelector } from '@tanstack/solid-store';
import type { Accessor } from 'solid-js';
import { treeStore } from './store';
import { ROOT_ID, type Directory, type Link } from './types';

/** Lookups over the cached tree, rebuilt whenever the cache changes. */
export type TreeIndex = {
  /** Something is cached (the first sync finished at some point). */
  loaded: boolean;
  revision: number;
  directories: Map<number, Directory>;
  links: Map<number, Link>;
  /** Subdirectories by parent id, sorted by name. */
  childDirs: Map<number, Directory[]>;
  /** Links by directory id, in id order. */
  linksByDir: Map<number, Link[]>;
  /** Every link, in id order. */
  allLinks: Link[];
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
export const compareNames = (a: string, b: string) => collator.compare(a, b);

const build = (): TreeIndex => {
  const cache = treeStore.get();
  const directories = new Map<number, Directory>();
  const childDirs = new Map<number, Directory[]>();
  const links = new Map<number, Link>();
  const linksByDir = new Map<number, Link[]>();

  for (const d of Object.values(cache.directories)) {
    directories.set(d.id, d);
    if (d.parentId === null) continue;
    const siblings = childDirs.get(d.parentId);
    if (siblings) siblings.push(d);
    else childDirs.set(d.parentId, [d]);
  }
  for (const list of childDirs.values()) list.sort((a, b) => compareNames(a.name, b.name));

  const allLinks = Object.values(cache.links);
  for (const l of allLinks) {
    links.set(l.id, l);
    const list = linksByDir.get(l.directoryId);
    if (list) list.push(l);
    else linksByDir.set(l.directoryId, [l]);
  }

  return { loaded: cache.revision > 0, revision: cache.revision, directories, links, childDirs, linksByDir, allLinks };
};

/** Derived store: recomputed from `treeStore` only. */
export const treeIndex = createStore(build);

/** The index as a Solid accessor, for components. */
export const useTree = (): Accessor<TreeIndex> => useSelector(treeIndex);

const NONE: never[] = [];

export const subdirectories = (tree: TreeIndex, id: number): Directory[] => tree.childDirs.get(id) ?? NONE;
export const linksIn = (tree: TreeIndex, id: number): Link[] => tree.linksByDir.get(id) ?? NONE;

/** Directories from the root to `id`, both included. Empty when `id` isn't cached. */
export const pathTo = (tree: TreeIndex, id: number): Directory[] => {
  const path: Directory[] = [];
  let current = tree.directories.get(id);
  while (current) {
    path.unshift(current);
    current = current.parentId === null ? undefined : tree.directories.get(current.parentId);
  }
  return path;
};

/** "Library / Work / Reading": a directory's location as text. */
export const pathLabel = (tree: TreeIndex, id: number): string =>
  pathTo(tree, id)
    .map((d) => directoryName(d))
    .join(' / ');

/** Display name: the root is "Library". */
export const directoryName = (d: Directory | undefined) => (!d ? '' : d.id === ROOT_ID ? 'Library' : d.name);

/** Whether `id` is `ancestor` or inside it. */
export const isWithin = (tree: TreeIndex, id: number, ancestor: number): boolean => {
  let current = tree.directories.get(id);
  while (current) {
    if (current.id === ancestor) return true;
    current = current.parentId === null ? undefined : tree.directories.get(current.parentId);
  }
  return false;
};

/** What deleting a directory removes besides itself: every subdirectory and link inside it. */
export const subtreeCount = (tree: TreeIndex, id: number) => {
  let directories = 0;
  let links = linksIn(tree, id).length;
  const stack = [...subdirectories(tree, id)];
  while (stack.length > 0) {
    const d = stack.pop()!;
    directories++;
    links += linksIn(tree, d.id).length;
    stack.push(...subdirectories(tree, d.id));
  }
  return { directories, links };
};

/** Every directory in tree order (depth first, siblings by name) with its depth; the root is depth 0. */
export const flattenTree = (tree: TreeIndex): { directory: Directory; depth: number }[] => {
  const out: { directory: Directory; depth: number }[] = [];
  const root = tree.directories.get(ROOT_ID);
  if (!root) return out;
  const visit = (d: Directory, depth: number) => {
    out.push({ directory: d, depth });
    for (const child of subdirectories(tree, d.id)) visit(child, depth + 1);
  };
  visit(root, 0);
  return out;
};
