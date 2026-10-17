import { createSignal, For, type Component } from 'solid-js';
import { Carousel, CarouselItem } from '../../components/ui/carousel';
import { Button } from '../../components/ui/buttons/button';
import { IconButton } from '../../components/ui/buttons/icon-button';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'carousel', name: 'Carousel' };

type Hue = 'primary' | 'secondary' | 'tertiary' | 'error';
const HUES: Hue[] = ['primary', 'tertiary', 'secondary', 'error'];

/** Placeholder scene (demo data only): hills and a sun in a color role's tones. */
const Scene: Component<{ hue: Hue; variant: number }> = (props) => {
  const v = () => props.variant % 3;
  return (
    <svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="240" fill={`var(--md-sys-color-${props.hue}-container)`} />
      <circle
        cx={[240, 90, 170][v()]}
        cy={[70, 60, 90][v()]}
        r={[34, 26, 44][v()]}
        fill={`var(--md-sys-color-${props.hue})`}
        opacity="0.85"
      />
      <path
        d={
          [
            'M0 240 L0 170 Q80 110 160 160 T320 140 L320 240 Z',
            'M0 240 L0 150 Q100 190 200 130 T320 170 L320 240 Z',
            'M0 240 L0 190 Q60 120 140 170 T320 120 L320 240 Z',
          ][v()]
        }
        fill={`var(--md-sys-color-on-${props.hue}-container)`}
        opacity="0.35"
      />
      <path
        d="M0 240 L0 210 Q120 170 220 205 T320 195 L320 240 Z"
        fill={`var(--md-sys-color-on-${props.hue}-container)`}
        opacity="0.6"
      />
    </svg>
  );
};

type Item = { title: string; label: string; short: string };

const PLACES: Item[] = [
  { title: 'Lake Tahoe', label: 'California', short: 'CA' },
  { title: 'Torres del Paine', label: 'Chile', short: 'CL' },
  { title: 'Lofoten', label: 'Norway', short: 'NO' },
  { title: 'Banff', label: 'Canada', short: 'CA' },
  { title: 'Dolomites', label: 'Italy', short: 'IT' },
  { title: 'Kyoto', label: 'Japan', short: 'JP' },
  { title: 'Cappadocia', label: 'Türkiye', short: 'TR' },
  { title: 'Queenstown', label: 'New Zealand', short: 'NZ' },
  { title: 'Isle of Skye', label: 'Scotland', short: 'UK' },
  { title: 'Zhangjiajie', label: 'China', short: 'CN' },
];

const hue = (i: number) => HUES[i % HUES.length];

const CarouselDemo: Component = () => {
  const [index, setIndex] = createSignal(0);
  const [opened, setOpened] = createSignal('nothing yet');

  return (
    <div style={{ display: 'grid', gap: '16px', 'min-inline-size': '0' }}>
      <p class={g.label}>
        Multi-browse with a header and Show all (items morph large → medium → small; text adapts: title + label,
        label, short label). Drag with the mouse, use a trackpad, or Tab / arrows / Home / End.
      </p>
      <div style={{ display: 'grid', 'min-inline-size': '0' }}>
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'padding-inline-start': '16px' }}>
          <h3 id="carousel-demo-places" style={{ margin: 0, font: 'inherit' }}>
            Places to visit
          </h3>
          <IconButton color="standard" icon="arrow_forward" mirror label="Show all places" />
        </div>
        <Carousel label="Places to visit" onIndexChange={setIndex}>
          <For each={PLACES}>
            {(item, i) => (
              <CarouselItem
                title={item.title}
                label={item.label}
                labelShort={item.short}
                onClick={() => setOpened(item.title)}
              >
                <Scene hue={hue(i())} variant={i()} />
              </CarouselItem>
            )}
          </For>
        </Carousel>
        <div style={{ padding: '4px' }}>
          <Button color="text">Show all</Button>
        </div>
      </div>
      <p class={g.label}>
        First large item: {PLACES[index()]?.title ?? '—'} · Last opened: {opened()}
      </p>

      <p class={g.label}>Multi-browse, center-aligned, 240px large items, visuals only</p>
      <Carousel label="Photos" align="center" largeItemMaxWidth={240}>
        <For each={Array.from({ length: 12 }, (_, i) => i)}>
          {(i) => (
            <CarouselItem aria-label={`Photo ${i + 1}`}>
              <Scene hue={hue(i + 1)} variant={i} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>Hero (one large item + a small preview; one item per swipe)</p>
      <Carousel label="Featured" layout="hero" style={{ 'block-size': '260px' }}>
        <For each={PLACES.slice(0, 6)}>
          {(item, i) => (
            <CarouselItem title={item.title} label={item.label} href={`#carousel-${i()}`}>
              <Scene hue={hue(i() + 2)} variant={i()} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>Center-aligned hero (small leading and trailing previews)</p>
      <Carousel label="Featured, centered" layout="hero" align="center" style={{ 'block-size': '260px' }}>
        <For each={PLACES.slice(2, 8)}>
          {(item, i) => (
            <CarouselItem title={item.title} label={item.label}>
              <Scene hue={hue(i())} variant={i() + 1} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>Uncontained (free scrolling, items bleed past the trailing edge)</p>
      <Carousel label="Recent" layout="uncontained">
        <For each={PLACES}>
          {(item, i) => (
            <CarouselItem title={item.title} label={item.label}>
              <Scene hue={hue(i() + 3)} variant={i() + 2} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>Uncontained multi-aspect ratio, with snapping (16:9, 9:16, 1:1, 3:4 ...)</p>
      <Carousel label="Mixed media" layout="uncontained-multi-aspect" snap>
        <For each={[16 / 9, 9 / 16, 1, 3 / 4, 4 / 3, 16 / 9, 1, 9 / 16]}>
          {(ratio, i) => (
            <CarouselItem aspectRatio={ratio} label={PLACES[i()].title}>
              <Scene hue={hue(i())} variant={i()} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>With outline; item 3 disabled (focusable, announced, not activatable)</p>
      <Carousel label="Outlined" outline>
        <For each={PLACES.slice(0, 7)}>
          {(item, i) => (
            <CarouselItem title={item.title} label={item.label} labelShort={item.short} disabled={i() === 2}>
              <Scene hue={hue(i())} variant={i()} />
            </CarouselItem>
          )}
        </For>
      </Carousel>

      <p class={g.label}>Right to left</p>
      <div dir="rtl">
        <Carousel label="Right to left">
          <For each={PLACES.slice(0, 8)}>
            {(item, i) => (
              <CarouselItem title={item.title} label={item.label} labelShort={item.short}>
                <Scene hue={hue(i() + 1)} variant={i()} />
              </CarouselItem>
            )}
          </For>
        </Carousel>
      </div>

      <p class={g.label}>Full-screen (vertical, one item at a time; shown in a phone-sized frame)</p>
      <div
        style={{
          'inline-size': 'min(100%, 360px)',
          'block-size': '560px',
          overflow: 'hidden',
          'border-radius': 'var(--md-sys-shape-corner-large)',
          border: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <Carousel label="Stories" layout="full-screen" style={{ 'block-size': '100%' }}>
          <For each={PLACES.slice(0, 5)}>
            {(item, i) => (
              <CarouselItem title={item.title} label={item.label}>
                <Scene hue={hue(i())} variant={i()} />
              </CarouselItem>
            )}
          </For>
        </Carousel>
      </div>
    </div>
  );
};

export default CarouselDemo;
