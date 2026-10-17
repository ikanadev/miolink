import { createRootRoute, Outlet } from '@tanstack/solid-router';
import { AppShell } from '../shell/AppShell';

export const Route = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
