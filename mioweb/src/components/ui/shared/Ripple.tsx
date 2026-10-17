import { getOwner, onCleanup, runWithOwner, type Component } from 'solid-js';
import styles from './ripple.module.css';

/** Shortest time a ripple stays pressed, so a quick click still shows it. */
const MIN_PRESS_MS = 225;

const isDisabled = (el: HTMLElement) =>
  el.matches(':disabled, [data-disabled], [aria-disabled="true"]');

/**
 * Pressed-state feedback for the parent element: a circle that grows from the
 * pointer (or from the center for Enter/Space) at the pressed state layer
 * opacity, clipped to the parent's shape. Place it as a child of a positioned
 * element (the `interactive` class from interaction.module.css does that).
 * With reduced motion it shows the static pressed layer instead.
 *
 * Keyboard presses (Space, Enter) also set `data-key-pressed` on the parent
 * while they last, so components can show their pressed shape: Enter fires
 * `click` on keydown without an `:active` phase. Not `data-pressed`, which
 * Ark's Toggle uses for the selected state.
 */
export const Ripple: Component = () => {
  let el!: HTMLSpanElement;
  let pressedAt = 0;
  let releaseTimer: number | undefined;
  const owner = getOwner();

  const press = (x?: number, y?: number, keyboard = false) => {
    clearTimeout(releaseTimer);
    const rect = el.getBoundingClientRect();
    const px = x === undefined ? rect.width / 2 : x - rect.left;
    const py = y === undefined ? rect.height / 2 : y - rect.top;
    // Radius that reaches the farthest corner from the press point.
    const radius = Math.hypot(Math.max(px, rect.width - px), Math.max(py, rect.height - py));
    el.style.setProperty('--_x', `${px}px`);
    el.style.setProperty('--_y', `${py}px`);
    el.style.setProperty('--_size', `${radius * 2}px`);
    el.dataset.state = 'idle';
    void el.offsetWidth; // restart the grow transition
    el.dataset.state = 'pressed';
    if (keyboard) el.parentElement?.setAttribute('data-key-pressed', '');
    pressedAt = performance.now();
  };

  const release = () => {
    if (el.dataset.state !== 'pressed') return;
    const wait = Math.max(0, MIN_PRESS_MS - (performance.now() - pressedAt));
    releaseTimer = window.setTimeout(() => {
      el.dataset.state = 'released';
      el.parentElement?.removeAttribute('data-key-pressed');
    }, wait);
  };

  // Listeners go on the parent once the span is in the DOM. Not onMount: some
  // Ark parts render children where effects run before refs are assigned.
  const attach = () => {
    const host = el.parentElement;
    if (!host) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || isDisabled(host)) return;
      press(e.clientX, e.clientY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isDisabled(host) || e.target !== host) return;
      if (e.key === ' ' || e.key === 'Enter') press(undefined, undefined, true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') release();
    };
    // Enter fires click on keydown with no keyup guarantee on the same element.
    const onBlur = () => release();

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointerup', release);
    host.addEventListener('pointercancel', release);
    host.addEventListener('pointerleave', release);
    host.addEventListener('keydown', onKeyDown);
    host.addEventListener('keyup', onKeyUp);
    host.addEventListener('blur', onBlur);
    onCleanup(() => {
      clearTimeout(releaseTimer);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointerup', release);
      host.removeEventListener('pointercancel', release);
      host.removeEventListener('pointerleave', release);
      host.removeEventListener('keydown', onKeyDown);
      host.removeEventListener('keyup', onKeyUp);
      host.removeEventListener('blur', onBlur);
    });
  };

  return (
    <span
      ref={(node) => {
        el = node;
        queueMicrotask(() => runWithOwner(owner, attach));
      }}
      class={styles.ripple}
      data-state="idle"
      aria-hidden="true"
    />
  );
};
