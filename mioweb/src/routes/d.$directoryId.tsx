import { createFileRoute, redirect } from '@tanstack/solid-router';
import { BrowsePage } from '../pages/BrowsePage';
import { ROOT_ID } from '../tree/types';

/** A directory other than the root (`/d/1` redirects to the Library). */
export const Route = createFileRoute('/d/$directoryId')({
  params: {
    parse: (raw) => ({ directoryId: Number(raw.directoryId) }),
    stringify: (params) => ({ directoryId: String(params.directoryId) }),
  },
  beforeLoad: ({ params }) => {
    if (!Number.isSafeInteger(params.directoryId) || params.directoryId === ROOT_ID) throw redirect({ to: '/' });
  },
  component: DirectoryRoute,
});

function DirectoryRoute() {
  const params = Route.useParams();
  return <BrowsePage directoryId={params().directoryId} />;
}
