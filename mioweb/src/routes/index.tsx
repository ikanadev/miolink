import { createFileRoute } from '@tanstack/solid-router';
import { BrowsePage } from '../pages/BrowsePage';
import { ROOT_ID } from '../tree/types';

/** The Library: the root directory. */
export const Route = createFileRoute('/')({
  component: () => <BrowsePage directoryId={ROOT_ID} />,
});
