import { createFileRoute } from '@tanstack/solid-router';
import { SettingsPage } from '../pages/SettingsPage';

export const Route = createFileRoute('/settings')({ component: () => <SettingsPage /> });
