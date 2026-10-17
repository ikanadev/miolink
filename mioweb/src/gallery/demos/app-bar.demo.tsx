import { createSignal, For, type Component, type JSX } from 'solid-js';
import { AppBar, type AppBarProps } from '../../components/ui/app-bar';
import { Icon } from '../../components/ui/icon';
import { IconButton } from '../../components/ui/buttons/icon-button';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'app-bar', name: 'App bar' };

const Back = () => <IconButton color="standard" icon="arrow_back" label="Back" mirror />;
const Menu = () => <IconButton color="standard" icon="menu" label="Open navigation menu" />;
const Actions = () => (
  <>
    <IconButton color="standard" icon="attach_file" label="Attach file" />
    <IconButton color="standard" icon="event" label="Add event" />
  </>
);

/** A scrolling frame with an app bar at the top of its content. */
const Frame: Component<{ label: string; bar: (target: HTMLElement | undefined) => JSX.Element }> = (
  props,
) => {
  const [target, setTarget] = createSignal<HTMLElement>();
  return (
    <div>
      <p class={g.label}>{props.label}</p>
      <div ref={setTarget} class={g.frame}>
        {props.bar(target())}
        <div class={g.filler}>
          <For each={Array.from({ length: 10 })}>{() => <div />}</For>
        </div>
      </div>
    </div>
  );
};

const bar = (props: AppBarProps) => (target: HTMLElement | undefined) => (
  <AppBar scrollTarget={target} {...props} />
);

const AppBarDemo: Component = () => (
  <div style={{ display: 'grid', gap: '24px', 'grid-template-columns': 'repeat(auto-fill, minmax(320px, 1fr))' }}>
    <Frame label="Small" bar={bar({ title: 'Title', leading: <Back />, trailing: <Actions /> })} />
    <Frame
      label="Small, centered, subtitle"
      bar={bar({
        title: 'Title',
        subtitle: 'Subtitle',
        centered: true,
        leading: <Back />,
        trailing: (
          <IconButton color="filled" icon="check" label="Save" width="wide" />
        ),
      })}
    />
    <Frame
      label="Medium flexible (collapses)"
      bar={bar({
        variant: 'medium-flexible',
        title: 'Medium flexible title',
        leading: <Back />,
        trailing: <Actions />,
      })}
    />
    <Frame
      label="Medium flexible, subtitle, two lines"
      bar={bar({
        variant: 'medium-flexible',
        title: 'A longer title that wraps to a second line',
        subtitle: 'Subtitle',
        leading: <Back />,
        trailing: <Actions />,
      })}
    />
    <Frame
      label="Large flexible, centered, subtitle"
      bar={bar({
        variant: 'large-flexible',
        title: 'Large title',
        subtitle: 'Subtitle',
        centered: true,
        leading: <Back />,
        trailing: <Actions />,
      })}
    />
    <Frame
      label="Large flexible, enter-always"
      bar={bar({
        variant: 'large-flexible',
        title: 'Hides on scroll',
        scrollBehavior: 'enter-always',
        leading: <Menu />,
        trailing: <IconButton color="standard" icon="more_vert" label="More options" />,
      })}
    />
    <Frame
      label="Search"
      bar={bar({
        variant: 'search',
        searchPlaceholder: 'Search links',
        leading: <Menu />,
        searchTrailing: <IconButton color="standard" icon="mic" label="Voice search" />,
        trailing: <IconButton color="standard" icon="settings" label="Settings" />,
        onSearchOpen: () => console.log('search open'),
      })}
    />
    <Frame
      label="Search, leading icon, centered hint"
      bar={bar({
        variant: 'search',
        centered: true,
        searchLeading: <Icon name="search" />,
        onSearchOpen: () => console.log('search open'),
      })}
    />
    <Frame
      label="Small, no navigation, toggle action"
      bar={bar({
        title: 'Favorites',
        trailing: (
          <IconButton color="standard" icon="star" label="Starred only" toggle />
        ),
      })}
    />
  </div>
);

export default AppBarDemo;
