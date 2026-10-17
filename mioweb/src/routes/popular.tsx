import { createFileRoute } from '@tanstack/solid-router';
import { PopularPage } from '../pages/PopularPage';

export const Route = createFileRoute('/popular')({ component: PopularPage });
