import { createSignal, splitProps, type Component, type JSX } from 'solid-js';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { Menu, type MenuRootProps } from '../../components/ui/menu';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'menu', name: 'Menu' };

/** A menu opened from a standard icon button. */
const Overflow = (props: MenuRootProps & { icon?: string; label: string; children: JSX.Element }) => {
  const [local, rest] = splitProps(props, ['icon', 'label', 'children']);
  return (
    <Menu.Root {...rest}>
      <Menu.Trigger
        asChild={(p) => (
          <IconButton {...p()} color="standard" icon={local.icon ?? 'more_vert'} label={local.label} />
        )}
      />
      <Menu.Content>{local.children}</Menu.Content>
    </Menu.Root>
  );
};

const EditItems = () => (
  <>
    <Menu.Item value="cut" leadingIcon="content_cut" trailingText="Ctrl+X">
      Cut
    </Menu.Item>
    <Menu.Item value="copy" leadingIcon="content_copy" trailingText="Ctrl+C">
      Copy
    </Menu.Item>
    <Menu.Item value="paste" leadingIcon="content_paste" trailingText="Ctrl+V" disabled>
      Paste
    </Menu.Item>
    <Menu.Divider />
    <Menu.Root>
      <Menu.TriggerItem leadingIcon="share">Share</Menu.TriggerItem>
      <Menu.Content>
        <Menu.Item value="email" leadingIcon="mail">
          Email
        </Menu.Item>
        <Menu.Item value="message" leadingIcon="chat">
          Message
        </Menu.Item>
        <Menu.Root>
          <Menu.TriggerItem leadingIcon="more_horiz">More</Menu.TriggerItem>
          <Menu.Content>
            <Menu.Item value="qr">QR code</Menu.Item>
            <Menu.Item value="nearby">Nearby</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </Menu.Content>
    </Menu.Root>
    <Menu.Item value="details" leadingIcon="info" supportingText="Size, dates and location">
      Details
    </Menu.Item>
  </>
);

const MenuDemo: Component = () => {
  const [sort, setSort] = createSignal('date');
  const [last, setLast] = createSignal('none');
  const [toolbar, setToolbar] = createSignal(true);
  const [statusBar, setStatusBar] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Standard and vibrant: icons, trailing text, supporting text, disabled, divider, submenus. Last
        selected: {last()}
      </p>
      <div class={g.row}>
        <Overflow label="Edit options" onSelect={(e) => setLast(e.value)}>
          <EditItems />
        </Overflow>
        <Overflow label="Edit options (vibrant)" color="vibrant" onSelect={(e) => setLast(e.value)}>
          <EditItems />
        </Overflow>
      </div>

      <p class={g.label}>Single select (closes) and multi select (stays open). Sort: {sort()}</p>
      <div class={g.row}>
        <Overflow label="Sort" icon="sort">
          <Menu.RadioGroup label="Sort by" value={sort()} onValueChange={setSort}>
            <Menu.RadioItem value="name" leadingIcon="sort_by_alpha">
              Name
            </Menu.RadioItem>
            <Menu.RadioItem value="date" leadingIcon="schedule">
              Date added
            </Menu.RadioItem>
            <Menu.RadioItem value="views" leadingIcon="visibility">
              Most viewed
            </Menu.RadioItem>
            <Menu.RadioItem value="size" leadingIcon="straighten" disabled>
              Size
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Overflow>
        <Overflow label="View" icon="visibility" color="vibrant">
          <Menu.Group label="Show">
            <Menu.CheckboxItem value="toolbar" checked={toolbar()} onCheckedChange={setToolbar}>
              Toolbar
            </Menu.CheckboxItem>
            <Menu.CheckboxItem value="status" checked={statusBar()} onCheckedChange={setStatusBar}>
              Status bar
            </Menu.CheckboxItem>
            <Menu.CheckboxItem value="minimap" checked disabled>
              Minimap
            </Menu.CheckboxItem>
          </Menu.Group>
        </Overflow>
      </div>

      <p class={g.label}>Groups: section labels with dividers (web), gap layout, links</p>
      <div class={g.row}>
        <Overflow label="Account" icon="account_circle">
          <Menu.Group label="Links">
            <Menu.Item value="docs" leadingIcon="menu_book" href="https://m3.material.io" target="_blank">
              Material 3
            </Menu.Item>
            <Menu.Item value="ark" leadingIcon="open_in_new" href="https://ark-ui.com" target="_blank">
              Ark UI
            </Menu.Item>
          </Menu.Group>
          <Menu.Divider />
          <Menu.Group label="Account">
            <Menu.Item value="settings" leadingIcon="settings">
              Settings
            </Menu.Item>
            <Menu.Item value="signout" leadingIcon="logout">
              Sign out
            </Menu.Item>
          </Menu.Group>
        </Overflow>
        <Overflow label="Folder (gap layout)" icon="folder" layout="gap">
          <Menu.Group>
            <Menu.Item value="open" leadingIcon="folder_open">
              Open
            </Menu.Item>
            <Menu.Item value="rename" leadingIcon="edit">
              Rename
            </Menu.Item>
            <Menu.Item value="move" leadingIcon="drive_file_move">
              Move
            </Menu.Item>
          </Menu.Group>
          <Menu.Group>
            <Menu.Item value="delete" leadingIcon="delete">
              Delete
            </Menu.Item>
          </Menu.Group>
        </Overflow>
      </div>

      <p class={g.label}>Baseline, density -2, instant</p>
      <div class={g.row}>
        <Overflow label="Baseline menu" variant="baseline">
          <Menu.Item value="refresh" leadingIcon="refresh">
            Refresh
          </Menu.Item>
          <Menu.Item value="current" leadingIcon="check" selected>
            Current view
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item value="help" leadingIcon="help" disabled>
            Help
          </Menu.Item>
        </Overflow>
        <Overflow label="Dense menu" density={-2}>
          <EditItems />
        </Overflow>
        <Overflow label="Instant menu" instant>
          <EditItems />
        </Overflow>
      </div>

      <p class={g.label}>Context menu: right click or long press the area</p>
      <Menu.Root onSelect={(e) => setLast(e.value)}>
        <Menu.ContextTrigger
          asChild={(p) => (
            <div
              {...p()}
              style={{
                display: 'grid',
                'place-items': 'center',
                'block-size': '160px',
                border: '1px dashed var(--md-sys-color-outline)',
                'border-radius': 'var(--md-sys-shape-corner-large)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Right click here
            </div>
          )}
        />
        <Menu.Content>
          <Menu.Item value="open-link" leadingIcon="open_in_new">
            Open
          </Menu.Item>
          <Menu.Item value="edit-link" leadingIcon="edit">
            Edit
          </Menu.Item>
          <Menu.Item value="move-link" leadingIcon="drive_file_move">
            Move
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item value="delete-link" leadingIcon="delete">
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  );
};

export default MenuDemo;
