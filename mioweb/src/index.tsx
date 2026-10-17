/* @refresh reload */
import { createRouter, RouterProvider } from '@tanstack/solid-router';
import { render } from 'solid-js/web';
import 'solid-devtools';

import './styles/index.css';
import { startTheme } from './core/theme';
import { routeTree } from './routeTree.gen';
import { startSync } from './tree/store';

const router = createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true });

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

startTheme();
startSync();

render(() => <RouterProvider router={router} />, root!);
