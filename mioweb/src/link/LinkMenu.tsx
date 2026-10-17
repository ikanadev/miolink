import type { Component } from 'solid-js';
import { IconButton } from '../components/ui/buttons/icon-button';
import { Menu } from '../components/ui/menu';
import { openDialog, openLinkDetails } from '../core/dialogs';
import type { Link } from '../tree/types';
import { copyLinkUrl, openLink, refreshMetadata } from './actions';

/** The overflow menu of a link: every action on it. */
export const LinkMenu: Component<{ link: Link }> = (props) => {
  const onSelect = (value: string) => {
    const link = props.link;
    switch (value) {
      case 'open':
        return openLink(link);
      case 'copy':
        return copyLinkUrl(link);
      case 'details':
        return openLinkDetails(link.id);
      case 'move':
        return openDialog({ kind: 'move-link', id: link.id });
      case 'refresh':
        return refreshMetadata(link);
      case 'delete':
        return openDialog({ kind: 'delete-link', id: link.id });
    }
  };

  return (
    <Menu.Root onSelect={(e) => onSelect(e.value)}>
      <Menu.Trigger
        asChild={(p) => (
          <IconButton {...p()} color="standard" icon="more_vert" label={`More options for ${props.link.title}`} />
        )}
      />
      <Menu.Content>
        <Menu.Item value="open" leadingIcon="open_in_new">
          Open in new tab
        </Menu.Item>
        <Menu.Item value="copy" leadingIcon="content_copy">
          Copy URL
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item value="details" leadingIcon="edit">
          Edit details
        </Menu.Item>
        <Menu.Item value="move" leadingIcon="drive_file_move">
          Move
        </Menu.Item>
        <Menu.Item value="refresh" leadingIcon="refresh" supportingText="Replaces the title">
          Refresh from page
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item value="delete" leadingIcon="delete">
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
};
