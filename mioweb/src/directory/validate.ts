import type { Directory } from '../tree/types';

const MAX_NAME = 255;

/**
 * The backend's directory name rules (1-255 characters, no "/", not "." or
 * ".."), plus a duplicate check against the cached siblings so the common
 * mistake doesn't need a round trip. Returns an error message or undefined.
 */
export const validateDirectoryName = (
  name: string,
  siblings: readonly Directory[],
  ignoreId?: number,
): string | undefined => {
  const length = [...name].length;
  if (length === 0) return 'Enter a name.';
  if (length > MAX_NAME) return `Use at most ${MAX_NAME} characters.`;
  if (name.includes('/')) return 'Names can’t contain “/”.';
  if (name === '.' || name === '..') return `“${name}” isn’t a valid name.`;
  if (siblings.some((d) => d.name === name && d.id !== ignoreId)) return 'A directory with this name already exists here.';
  return undefined;
};
