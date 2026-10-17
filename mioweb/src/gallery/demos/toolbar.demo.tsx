import { createSignal, For, Show, type Component, type JSX } from 'solid-js';
import { Button } from '../../components/ui/buttons/button';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { Menu } from '../../components/ui/menu';
import { TextField } from '../../components/ui/text-field';
import {
  Toolbar,
  ToolbarAction,
  ToolbarDivider,
  ToolbarFab,
  type ToolbarColor,
} from '../../components/ui/toolbar';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'toolbar', name: 'Toolbar' };

const note = {
  margin: '0',
  color: 'var(--md-sys-color-on-surface-variant)',
  'font-family': 'var(--md-sys-typescale-body-medium-font)',
  'font-size': 'var(--md-sys-typescale-body-medium-size)',
  'line-height': 'var(--md-sys-typescale-body-medium-line-height)',
} as const;

/** A surface standing in for page content behind the toolbars. */
const Stage = (props: { children: JSX.Element; height?: string; align?: 'center' | 'end' }) => (
  <div
    style={{
      display: 'flex',
      'align-items': 'center',
      'justify-content': props.align === 'end' ? 'flex-end' : 'center',
      'min-block-size': props.height ?? '112px',
      padding: '16px 0',
      'border-radius': 'var(--md-sys-shape-corner-large)',
      background: 'var(--md-sys-color-surface-container-lowest)',
      border: '1px solid var(--md-sys-color-outline-variant)',
    }}
  >
    {props.children}
  </div>
);

const Formatting = (props: { color: ToolbarColor }) => (
  <Toolbar label={`Formatting (${props.color})`} color={props.color}>
    <ToolbarAction toggle icon="format_bold" label="Bold" defaultSelected />
    <ToolbarAction toggle icon="format_italic" label="Italic" />
    <ToolbarAction toggle icon="format_underlined" label="Underline" />
    <ToolbarAction icon="format_color_text" label="Text color" disabled />
    <ToolbarAction icon="format_list_bulleted" label="Bulleted list" />
    <IconButton icon="check" label="Done" color="filled" width="wide" tooltip />
  </Toolbar>
);

const ToolbarDemo: Component = () => {
  const [last, setLast] = createSignal('—');
  const [collapsed, setCollapsed] = createSignal(false);
  const [keyCollapsed, setKeyCollapsed] = createSignal(false);
  const [fixed, setFixed] = createSignal(false);
  const [scroller, setScroller] = createSignal<HTMLElement>();
  const [scroller2, setScroller2] = createSignal<HTMLElement>();
  const [scroller3, setScroller3] = createSignal<HTMLElement>();
  const [scroller4, setScroller4] = createSignal<HTMLElement>();

  const act = (name: string) => () => setLast(name);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <p class={g.label}>
        Floating, standard and vibrant. Toggles (selected = secondary container / surface container), one filled wide
        action for emphasis, a disabled item. Tab enters once; Left/Right, Home/End move.
      </p>
      <Stage>
        <Formatting color="standard" />
      </Stage>
      <Stage>
        <Formatting color="vibrant" />
      </Stage>

      <p class={g.label}>Floating with a FAB (secondary container; tertiary container when vibrant)</p>
      <Stage>
        <Toolbar label="Photo actions" fab={<ToolbarFab icon="add" label="New photo" onClick={act('New photo')} />}>
          <ToolbarAction icon="image" label="Gallery" onClick={act('Gallery')} />
          <ToolbarAction icon="tune" label="Adjust" onClick={act('Adjust')} />
          <ToolbarAction icon="crop" label="Crop" onClick={act('Crop')} />
          <ToolbarAction icon="share" label="Share" onClick={act('Share')} />
        </Toolbar>
      </Stage>
      <Stage>
        <Toolbar
          label="Photo actions (vibrant)"
          color="vibrant"
          fab={<ToolbarFab icon="edit" label="Edit" onClick={act('Edit')} />}
        >
          <ToolbarAction icon="image" label="Gallery" onClick={act('Gallery')} />
          <ToolbarAction icon="tune" label="Adjust" onClick={act('Adjust')} />
          <ToolbarAction icon="crop" label="Crop" onClick={act('Crop')} />
        </Toolbar>
      </Stage>
      <p style={note}>Last action: {last()}</p>

      <p class={g.label}>Collapsed (controlled): the toolbar folds away and the FAB grows to 80px; focus expands it</p>
      <div class={g.row}>
        <Button toggle color="tonal" selected={collapsed()} onSelectedChange={setCollapsed}>
          Collapsed
        </Button>
      </div>
      <Stage height="128px">
        <Toolbar
          label="Collapsible"
          collapsed={collapsed()}
          fab={<ToolbarFab icon="add" label="Create" onClick={act('Create')} />}
        >
          <ToolbarAction icon="arrow_back" label="Back" mirror />
          <ToolbarAction icon="arrow_forward" label="Forward" mirror />
          <ToolbarAction icon="refresh" label="Reload" />
          <ToolbarAction icon="bookmark" label="Bookmark" toggle />
        </Toolbar>
      </Stage>

      <p class={g.label}>
        Collapsed without a FAB (controlled): only the key action shows. The folded actions stay in the Tab order;
        tabbing or arrowing onto one expands the toolbar
      </p>
      <div class={g.row}>
        <Button toggle color="tonal" selected={keyCollapsed()} onSelectedChange={setKeyCollapsed}>
          Collapsed
        </Button>
      </div>
      <Stage>
        <Toolbar label="Reply actions" collapsed={keyCollapsed()}>
          <ToolbarAction icon="archive" label="Archive" onClick={act('Archive')} />
          <ToolbarAction icon="delete" label="Delete" onClick={act('Delete')} />
          <ToolbarAction icon="reply" label="Reply" color="filled" keyAction onClick={act('Reply')} />
          <ToolbarAction icon="forward" label="Forward" onClick={act('Forward')} />
        </Toolbar>
      </Stage>

      <p class={g.label}>
        Text field slot: Left/Right move the caret inside the field; Tab leaves it. Right to left below
      </p>
      <Stage>
        <Toolbar label="Find in page">
          <TextField label="Find" dense />
          <ToolbarAction icon="keyboard_arrow_up" label="Previous match" />
          <ToolbarAction icon="keyboard_arrow_down" label="Next match" />
          <ToolbarAction icon="close" label="Close" />
        </Toolbar>
      </Stage>
      <Stage>
        <div dir="rtl">
          <Toolbar label="أدوات التنسيق">
            <ToolbarAction icon="arrow_back" label="رجوع" mirror />
            <ToolbarAction toggle icon="format_bold" label="غامق" />
            <ToolbarAction toggle icon="format_italic" label="مائل" />
            <ToolbarAction icon="arrow_forward" label="التالي" mirror />
          </Toolbar>
        </div>
      </Stage>

      <p class={g.label}>Fixed placement: bottom center of the window, 16px from the edge</p>
      <div class={g.row}>
        <Button toggle color="tonal" selected={fixed()} onSelectedChange={setFixed}>
          Show fixed toolbar
        </Button>
      </div>
      <Show when={fixed()}>
        <Toolbar label="Fixed actions" fixed fab={<ToolbarFab icon="add" label="Add" onClick={act('Add')} />}>
          <ToolbarAction icon="search" label="Search" onClick={act('Search')} />
          <ToolbarAction icon="share" label="Share" onClick={act('Share')} />
          <ToolbarAction icon="close" label="Hide fixed toolbar" onClick={() => setFixed(false)} />
        </Toolbar>
      </Show>

      <p class={g.label}>
        Overflow: drag the corner. Trailing actions move into the menu (toggles become checkbox items), plus fixed menu
        items
      </p>
      <div
        style={{
          resize: 'horizontal',
          overflow: 'hidden',
          'inline-size': '520px',
          'min-inline-size': '200px',
          'max-inline-size': '100%',
          border: '1px dashed var(--md-sys-color-outline-variant)',
        }}
      >
        <Stage>
          <Toolbar
            label="Editor"
            menu={
              <>
                <Menu.Item value="settings" leadingIcon="settings" onSelect={act('Settings')}>
                  Settings
                </Menu.Item>
                <Menu.Item value="help" leadingIcon="help" onSelect={act('Help')}>
                  Help
                </Menu.Item>
              </>
            }
          >
            <ToolbarAction icon="undo" label="Undo" onClick={act('Undo')} />
            <ToolbarAction icon="redo" label="Redo" onClick={act('Redo')} />
            <ToolbarDivider />
            <ToolbarAction toggle icon="format_bold" label="Bold" />
            <ToolbarAction toggle icon="format_italic" label="Italic" />
            <ToolbarAction icon="link" label="Insert link" onClick={act('Insert link')} />
            <ToolbarAction icon="image" label="Insert image" onClick={act('Insert image')} />
            <ToolbarAction icon="format_quote" label="Quote" onClick={act('Quote')} />
            <ToolbarAction icon="code" label="Code" onClick={act('Code')} disabled />
          </Toolbar>
        </Stage>
      </div>

      <p class={g.label}>Vertical floating (medium+ windows): Up/Down move; with a FAB below</p>
      <Stage height="360px">
        <div style={{ display: 'flex', gap: '48px', 'align-items': 'center', 'block-size': '328px' }}>
          <Toolbar label="Drawing tools" orientation="vertical">
            <ToolbarAction toggle icon="edit" label="Pen" defaultSelected />
            <ToolbarAction toggle icon="ink_highlighter" label="Highlighter" />
            <ToolbarAction toggle icon="ink_eraser" label="Eraser" />
            <ToolbarDivider />
            <ToolbarAction icon="undo" label="Undo" />
          </Toolbar>
          <Toolbar
            label="Map tools"
            orientation="vertical"
            color="vibrant"
            fab={<ToolbarFab icon="navigation" label="Start navigation" />}
          >
            <ToolbarAction icon="layers" label="Layers" />
            <ToolbarAction icon="my_location" label="My location" />
            <ToolbarAction icon="explore" label="Compass" />
          </Toolbar>
        </div>
      </Stage>

      <p class={g.label}>Docked (full width, square corners, no shadow): even, center and edges layouts</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        <Toolbar label="Message actions" variant="docked">
          <ToolbarAction icon="archive" label="Archive" />
          <ToolbarAction icon="delete" label="Delete" />
          <ToolbarAction icon="mark_email_unread" label="Mark unread" />
          <ToolbarAction icon="drive_file_move" label="Move" />
          <IconButton icon="reply" label="Reply" color="filled" tooltip />
        </Toolbar>
        <Toolbar label="Player" variant="docked" layout="center" color="vibrant">
          <ToolbarAction icon="skip_previous" label="Previous" />
          <ToolbarAction toggle icon="play_arrow" selectedIcon="pause" label="Play" />
          <ToolbarAction icon="skip_next" label="Next" />
        </Toolbar>
        <Toolbar label="Reader" variant="docked" layout="edges">
          <Button color="text" icon="arrow_back" mirror>
            Previous
          </Button>
          <ToolbarAction icon="text_fields" label="Text size" />
          <Button color="text" icon="arrow_forward" mirror>
            Next
          </Button>
        </Toolbar>
      </div>

      <p class={g.label}>
        Scroll behavior: docked hides, floating hides, floating collapses into the FAB or to its key action. Scroll down,
        then Tab into a hidden toolbar: it comes back
      </p>
      <div class={g.row} style={{ 'align-items': 'stretch' }}>
        <For
          each={[
            { name: 'Docked, hide', ref: setScroller },
            { name: 'Floating, hide', ref: setScroller2 },
            { name: 'Floating, collapse', ref: setScroller3 },
            { name: 'Floating, collapse to key action', ref: setScroller4 },
          ]}
        >
          {(frame, i) => (
            <div style={{ display: 'grid', gap: '8px', flex: '1 1 240px' }}>
              <p style={note}>{frame.name}</p>
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  'border-radius': 'var(--md-sys-shape-corner-large)',
                }}
              >
                <div ref={frame.ref} class={g.frame}>
                  <div class={g.filler}>
                    <For each={Array.from({ length: 14 })}>{() => <div />}</For>
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    'inset-inline': '0',
                    'inset-block-end': i() === 0 ? '0' : '16px',
                    display: 'flex',
                    'justify-content': 'center',
                    'pointer-events': 'none',
                  }}
                >
                  <div style={{ 'pointer-events': 'auto', display: 'contents' }}>
                    {i() === 0 ? (
                      <Toolbar label="Docked, hides on scroll" variant="docked" scrollBehavior="hide" scrollTarget={scroller()}>
                        <ToolbarAction icon="arrow_back" label="Back" mirror />
                        <ToolbarAction icon="search" label="Search" />
                        <ToolbarAction icon="share" label="Share" />
                      </Toolbar>
                    ) : i() === 1 ? (
                      <Toolbar
                        label="Floating, hides on scroll"
                        scrollBehavior="hide"
                        scrollTarget={scroller2()}
                      >
                        <ToolbarAction icon="arrow_back" label="Back" mirror />
                        <ToolbarAction icon="search" label="Search" />
                        <ToolbarAction icon="share" label="Share" />
                      </Toolbar>
                    ) : i() === 3 ? (
                      <Toolbar
                        label="Floating, collapses to its key action"
                        scrollBehavior="collapse"
                        scrollTarget={scroller4()}
                      >
                        <ToolbarAction icon="arrow_back" label="Back" mirror />
                        <ToolbarAction icon="edit" label="Edit" color="filled" keyAction />
                        <ToolbarAction icon="share" label="Share" />
                      </Toolbar>
                    ) : (
                      <Toolbar
                        label="Floating, collapses on scroll"
                        scrollBehavior="collapse"
                        scrollTarget={scroller3()}
                        fab={<ToolbarFab icon="add" label="Add" />}
                      >
                        <ToolbarAction icon="arrow_back" label="Back" mirror />
                        <ToolbarAction icon="search" label="Search" />
                      </Toolbar>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default ToolbarDemo;
