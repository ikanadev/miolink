import { createSignal, For, type Component } from 'solid-js';
import { AppBar } from '../components/ui/app-bar';
import { IconButton } from '../components/ui/buttons/icon-button';
import { demos } from './demos';
import styles from './gallery.module.css';

type Theme = 'system' | 'light' | 'dark';
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const ICON: Record<Theme, string> = { system: 'brightness_auto', light: 'light_mode', dark: 'dark_mode' };

/** Component gallery: one section per component in src/components/ui. */
export const Gallery: Component = () => {
  const [theme, setTheme] = createSignal<Theme>('system');
  const [contrast, setContrast] = createSignal(false);

  const cycleTheme = () => {
    const next = NEXT[theme()];
    setTheme(next);
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
  };

  const toggleContrast = (on: boolean) => {
    setContrast(on);
    if (on) document.documentElement.dataset.contrast = 'high';
    else delete document.documentElement.dataset.contrast;
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
              label="High contrast"
              toggle
              selected={contrast()}
              onSelectedChange={toggleContrast}
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
