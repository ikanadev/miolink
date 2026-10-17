import type { Component } from 'solid-js';

/**
 * Every `<name>.demo.tsx` file in this folder is a gallery section. It
 * exports `meta` and a default component; no registration needed.
 */
export type DemoMeta = { id: string; name: string };
type DemoModule = { meta: DemoMeta; default: Component };

const modules = import.meta.glob<DemoModule>('./*.demo.tsx', { eager: true });

export const demos = Object.values(modules)
  .map((m) => ({ ...m.meta, component: m.default }))
  .sort((a, b) => a.name.localeCompare(b.name));
