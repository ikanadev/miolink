import { createSignal, For, type Component } from 'solid-js';
import { AppBar } from '../../components/ui/app-bar';
import { Icon } from '../../components/ui/icon';
import { IconButton } from '../../components/ui/buttons/icon-button';
import {
  RichTooltip,
  RichTooltipAction,
  Tooltip,
  type TooltipOpenChangeDetails,
  type TooltipPlacement,
} from '../../components/ui/tooltip';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'tooltip', name: 'Tooltip' };

const PLACEMENTS: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];

/** Plain text button for persistent rich tooltip triggers (Button isn't available here). */
const TextTrigger: Component<{ label: string; onClick?: () => void }> = (props) => (
  <button
    type="button"
    onClick={() => props.onClick?.()}
    style={{
      'min-block-size': '40px',
      'padding-inline': '16px',
      border: '1px solid var(--md-sys-color-outline-variant)',
      'border-radius': 'var(--md-sys-shape-corner-full)',
      background: 'transparent',
      color: 'var(--md-sys-color-primary)',
      font: 'inherit',
      cursor: 'pointer',
    }}
  >
    {props.label}
  </button>
);

const describe = (d: TooltipOpenChangeDetails) => (d.open ? 'open' : `close (${d.reason})`);

const TooltipDemo: Component = () => {
  const [log, setLog] = createSignal('—');
  const [controlled, setControlled] = createSignal(false);
  const [intro, setIntro] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>
        Plain on icon buttons (hover, keyboard focus, long-press). The label equals the button's
        name, so the tooltip is aria-hidden instead of repeating it
      </p>
      <div class={g.row}>
        <Tooltip label="Back">
          <IconButton color="standard" icon="arrow_back" label="Back" mirror />
        </Tooltip>
        <Tooltip label="Settings">
          <IconButton color="tonal" icon="settings" label="Settings" />
        </Tooltip>
        <Tooltip label="Add to favorites">
          <IconButton color="outlined" icon="favorite" label="Add to favorites" toggle />
        </Tooltip>
        {/* Render-prop form (Ark asChild) */}
        <Tooltip
          label="Share"
          asChild={(trigger) => <IconButton {...trigger()} color="filled" icon="share" label="Share" />}
        />
      </div>

      <p class={g.label}>
        Extra information: aria-describedby. No accessible name: aria-labelledby (8px gap, no visual
        boundary)
      </p>
      <div class={g.row}>
        <Tooltip label="Save (Ctrl+S)">
          <IconButton color="standard" icon="save" label="Save" />
        </Tooltip>
        <Tooltip label="Storage almost full" offset={8}>
          <span tabindex="0" style={{ display: 'inline-flex', color: 'var(--md-sys-color-error)' }}>
            <Icon name="warning" />
          </span>
        </Tooltip>
      </div>

      <p class={g.label}>Placement, flipping to stay on screen</p>
      <div class={g.row}>
        <For each={PLACEMENTS}>
          {(placement) => (
            <Tooltip label={`Placed ${placement}`} placement={placement}>
              <IconButton color="tonal" icon="near_me" label={`Placement ${placement}`} />
            </Tooltip>
          )}
        </For>
      </div>

      <p class={g.label}>Delays, controlled, disabled tooltip, disabled button</p>
      <div class={g.row}>
        <Tooltip label="No show delay" showDelay={0} hideDelay={300}>
          <IconButton color="standard" icon="bolt" label="Instant" />
        </Tooltip>
        <Tooltip label="Controlled" open={controlled()} onOpenChange={(d) => setControlled(d.open)}>
          <IconButton color="standard" icon="label" label="Controlled tooltip target" />
        </Tooltip>
        <IconButton
          color="tonal"
          icon="visibility"
          label="Show the controlled tooltip"
          toggle
          selected={controlled()}
          onSelectedChange={setControlled}
        />
        <Tooltip label="Never shown" disabled>
          <IconButton color="standard" icon="block" label="Tooltip disabled" />
        </Tooltip>
        <Tooltip label="Delete">
          <IconButton color="standard" icon="delete" label="Delete" disabled />
        </Tooltip>
      </div>

      <p class={g.label}>In an app bar, plain tooltips go below</p>
      <AppBar
        title="Links"
        scrollBehavior="pinned"
        leading={
          <Tooltip label="Back">
            <IconButton color="standard" icon="arrow_back" label="Back" mirror />
          </Tooltip>
        }
        trailing={
          <>
            <Tooltip label="Search">
              <IconButton color="standard" icon="search" label="Search" />
            </Tooltip>
            <Tooltip label="More options">
              <IconButton color="standard" icon="more_vert" label="More options" />
            </Tooltip>
          </>
        }
      />

      <p class={g.label}>
        Rich, transient (hover or focus; Tab moves into the actions; Escape closes). Last event:{' '}
        {log()}
      </p>
      <div class={g.row}>
        <RichTooltip
          subhead="Saved links"
          supportingText="Links you save are synced to every device signed in with the same key."
          actions={
            <>
              <RichTooltipAction>Learn more</RichTooltipAction>
              <RichTooltipAction>Got it</RichTooltipAction>
            </>
          }
          onOpenChange={(d) => setLog(describe(d))}
        >
          <IconButton color="standard" icon="info" label="About saved links" />
        </RichTooltip>
        <RichTooltip
          subhead="Thumbnails"
          supportingText="The server copies each page's preview image."
          actions={<RichTooltipAction>Got it</RichTooltipAction>}
          onOpenChange={(d) => setLog(describe(d))}
        >
          <IconButton color="standard" icon="image" label="About thumbnails" />
        </RichTooltip>
        <RichTooltip
          subhead="Views"
          supportingText="Opening a link counts a view. Views don't trigger a sync."
          onOpenChange={(d) => setLog(describe(d))}
        >
          <IconButton color="standard" icon="visibility" label="About views" />
        </RichTooltip>
        <RichTooltip
          supportingText="Deleting a directory also deletes everything inside it."
          actions={<RichTooltipAction>Got it</RichTooltipAction>}
          placement="bottom"
          onOpenChange={(d) => setLog(describe(d))}
        >
          <IconButton color="standard" icon="folder_delete" label="About deleting" />
        </RichTooltip>
        <RichTooltip
          supportingText={
            <>
              Directory names follow{' '}
              <a href="https://man7.org/linux/man-pages/man7/path_resolution.7.html" target="_blank" rel="noreferrer">
                Linux rules
              </a>
              : no slashes, unique among siblings.
            </>
          }
          actions={
            <>
              <RichTooltipAction>Rename</RichTooltipAction>
              <RichTooltipAction>Dismiss</RichTooltipAction>
            </>
          }
          onOpenChange={(d) => setLog(describe(d))}
        >
          <IconButton color="standard" icon="help" label="About directory names" />
        </RichTooltip>
      </div>

      <p class={g.label}>Rich, persistent (click; stays until you interact elsewhere or press Escape)</p>
      <div class={g.row}>
        <RichTooltip
          persistent
          subhead="Share to Mio Link"
          supportingText="On Android, share any page to save it without opening the app."
          actions={
            <>
              <RichTooltipAction>Learn more</RichTooltipAction>
              <RichTooltipAction>Got it</RichTooltipAction>
            </>
          }
          onOpenChange={(d) => setLog(describe(d))}
        >
          <TextTrigger label="What's new" />
        </RichTooltip>
        <RichTooltip
          persistent
          open={intro()}
          onOpenChange={(d) => {
            setIntro(d.open);
            setLog(describe(d));
          }}
          subhead="New: directories"
          supportingText="Opened programmatically, as on page load to introduce a feature."
          actions={<RichTooltipAction>Got it</RichTooltipAction>}
        >
          <TextTrigger label="Directories" />
        </RichTooltip>
        <TextTrigger label="Show the introduction" onClick={() => setIntro(true)} />
      </div>
    </div>
  );
};

export default TooltipDemo;
