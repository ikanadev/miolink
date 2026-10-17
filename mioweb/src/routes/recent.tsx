import { createFileRoute } from '@tanstack/solid-router';
import { RecentPage } from '../pages/RecentPage';

export const Route = createFileRoute('/recent')({ component: RecentPage });
