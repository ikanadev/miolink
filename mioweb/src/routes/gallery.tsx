import { createFileRoute } from '@tanstack/solid-router';
import { Gallery } from '../gallery/Gallery';

/** The component gallery (src/components/ui demos). */
export const Route = createFileRoute('/gallery')({ component: Gallery });
