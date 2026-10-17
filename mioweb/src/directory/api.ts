import { api } from '../core/api';
import { applyWrite, deleteSubtree } from '../tree/store';
import { int64, toDirectory } from '../tree/convert';
import type { Directory } from '../tree/types';

// DirectoryService writes. Each one calls the RPC, then applies the result
// to the cached tree (or refreshes it when another device changed it).
// Failures throw; callers turn them into messages with `toApiError`.

export const createDirectory = async (parentId: number, name: string): Promise<Directory> => {
  const res = await api().directory.createDirectory({ parentId: int64(parentId), name });
  const directory = toDirectory(res.directory!);
  applyWrite(res.previousRevision, res.revision, (t) => {
    t.directories[directory.id] = directory;
  });
  return directory;
};

export const renameDirectory = async (id: number, name: string): Promise<Directory> => {
  const res = await api().directory.renameDirectory({ id: int64(id), name });
  const directory = toDirectory(res.directory!);
  applyWrite(res.previousRevision, res.revision, (t) => {
    t.directories[directory.id] = directory;
  });
  return directory;
};

export const moveDirectory = async (id: number, newParentId: number): Promise<Directory> => {
  const res = await api().directory.moveDirectory({ id: int64(id), newParentId: int64(newParentId) });
  const directory = toDirectory(res.directory!);
  applyWrite(res.previousRevision, res.revision, (t) => {
    t.directories[directory.id] = directory;
  });
  return directory;
};

/** Directories deleted from this browser, so pages showing them don't report a deletion "elsewhere". */
export const deletedHere = new Set<number>();

export const deleteDirectory = async (id: number): Promise<void> => {
  const res = await api().directory.deleteDirectory({ id: int64(id) });
  deletedHere.add(id);
  applyWrite(res.previousRevision, res.revision, (t) => deleteSubtree(t, id));
};
