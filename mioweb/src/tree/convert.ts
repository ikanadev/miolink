import { timestampMs } from '@bufbuild/protobuf/wkt';
import type { Directory as DirectoryPb } from '../gen/miolink/directory/v1/directory_pb';
import type { Link as LinkPb } from '../gen/miolink/link/v1/link_pb';
import type { Directory, Link } from './types';

// IDs, revisions and views are int64 (bigint) in the protos. They stay far
// below 2^53 for a personal link manager, so the app uses plain numbers.

export const toDirectory = (d: DirectoryPb): Directory => ({
  id: Number(d.id),
  parentId: d.parentId === undefined ? null : Number(d.parentId),
  name: d.name,
  createdAt: d.createdAt ? timestampMs(d.createdAt) : 0,
});

export const toLink = (l: LinkPb): Link => ({
  id: Number(l.id),
  directoryId: Number(l.directoryId),
  title: l.title,
  url: l.url,
  thumbnailUrl: l.thumbnailUrl,
  views: Number(l.views),
  createdAt: l.createdAt ? timestampMs(l.createdAt) : 0,
});

/** For requests: an app id or revision as int64. */
export const int64 = (n: number) => BigInt(n);
