import type { useNavigate } from '@tanstack/solid-router';
import { ROOT_ID } from '../tree/types';

type Navigate = ReturnType<typeof useNavigate>;

export type Destination = 'library' | 'recent' | 'popular' | 'settings';

/** URL of a directory's page: the Library itself for the root. */
export const directoryHref = (id: number) => (id === ROOT_ID ? '/' : `/d/${id}`);

export const goToDirectory = (navigate: Navigate, id: number, replace = false) =>
  id === ROOT_ID
    ? navigate({ to: '/', replace })
    : navigate({ to: '/d/$directoryId', params: { directoryId: id }, replace });

/** The top-level destination a path belongs to. */
export const destinationOf = (pathname: string): Destination | undefined => {
  if (pathname === '/' || pathname.startsWith('/d/')) return 'library';
  if (pathname.startsWith('/recent')) return 'recent';
  if (pathname.startsWith('/popular')) return 'popular';
  if (pathname.startsWith('/settings')) return 'settings';
  return undefined;
};

/** The directory a path shows, or undefined outside the Library. */
export const directoryOf = (pathname: string): number | undefined => {
  if (pathname === '/') return ROOT_ID;
  const match = /^\/d\/(\d+)/.exec(pathname);
  return match ? Number(match[1]) : undefined;
};
