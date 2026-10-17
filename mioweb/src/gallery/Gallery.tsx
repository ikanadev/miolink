import { createEffect, createSignal, For, onCleanup, type Component } from 'solid-js';
import { AppBar } from '../components/ui/app-bar';
import { IconButton } from '../components/ui/buttons/icon-button';
import { demos } from './demos';
import styles from './gallery.module.css';

type Theme = 'system' | 'light' | 'dark';
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const ICON: Record<Theme, string> = { system: 'brightness_auto', light: 'light_mode', dark: 'dark_mode' };

type Contrast = 'system' | 'standard' | 'medium' | 'high';
const NEXT_CONTRAST: Record<Contrast, Contrast> = {
  system: 'standard',
  standard: 'medium',
  medium: 'high',
  high: 'system',
};

/** Keeps the browser UI color (theme-color meta) on the current surface color. */
const syncThemeColor = () => {
  const surface = getComputedStyle(document.body).backgroundColor;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = surface;
  }
};

/** Component gallery: one section per component in src/components/ui. */
export const Gallery: Component = () => {
  const [theme, setTheme] = createSignal<Theme>('system');
  const [contrast, setContrast] = createSignal<Contrast>('system');

  createEffect(() => {
    theme();
    contrast();
    syncThemeColor();
  });
  for (const query of ['(prefers-color-scheme: dark)', '(prefers-contrast: more)']) {
    const mql = matchMedia(query);
    mql.addEventListener('change', syncThemeColor);
    onCleanup(() => mql.removeEventListener('change', syncThemeColor));
  }

  const cycleTheme = () => {
    const next = NEXT[theme()];
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    setTheme(next);
  };

  const cycleContrast = () => {
    const next = NEXT_CONTRAST[contrast()];
    if (next === 'system') delete document.documentElement.dataset.contrast;
    else document.documentElement.dataset.contrast = next;
    setContrast(next);
  };

  return (
    <>
      <AppBar
        title="Components"
        trailing={
          <>
            <IconButton
              color="standard"
              icon="contrast"
              label={`Contrast: ${contrast()}`}
              onClick={cycleContrast}
            />
            <IconButton
              color="standard"
              icon={ICON[theme()]}
              label={`Theme: ${theme()}`}
              onClick={cycleTheme}
            />
          </>
        }
      />
      <main class={styles.main}>
        <nav class={styles.toc} aria-label="Components">
          <For each={demos}>{(d) => <a href={`#${d.id}`}>{d.name}</a>}</For>
        </nav>
        <For each={demos}>
          {(d) => (
            <section id={d.id} class={styles.section} aria-labelledby={`${d.id}-title`}>
              <h2 id={`${d.id}-title`} class={styles.sectionTitle}>
                {d.name}
              </h2>
              <d.component />
            </section>
          )}
        </For>
      </main>
    </>
  );
};
