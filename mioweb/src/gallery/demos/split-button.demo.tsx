import { createSignal, For, type Component } from 'solid-js';
import { SplitButton, type ButtonSize, type SplitButtonColor } from '../../components/ui/buttons';
import { MenuItem } from '../../components/ui/menu';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'split-button', name: 'Split button' };

const COLORS: SplitButtonColor[] = ['elevated', 'filled', 'tonal', 'outlined'];
const SIZES: ButtonSize[] = ['xsmall', 'small', 'medium', 'large', 'xlarge'];

const Items = () => (
  <>
    <MenuItem value="later" leadingIcon="schedule">
      Watch later
    </MenuItem>
    <MenuItem value="playlist" leadingIcon="playlist_add">
      Add to playlist
    </MenuItem>
    <MenuItem value="share" leadingIcon="share">
      Share
    </MenuItem>
  </>
);

const SplitButtonDemo: Component = () => {
  const [log, setLog] = createSignal('none');
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Colors: label + icon, label only, icon only, disabled. Last action: {log()}</p>
      <For each={COLORS}>
        {(color) => (
          <div class={g.row}>
            <SplitButton
              color={color}
              icon="schedule"
              label="Watch later"
              menuLabel="More watch options"
              onClick={() => setLog(`${color}: main action`)}
              onSelect={(value) => setLog(`${color}: ${value}`)}
            >
              <Items />
            </SplitButton>
            <SplitButton color={color} label="Send" menuLabel="More send options">
              <Items />
            </SplitButton>
            <SplitButton color={color} icon="add" iconOnly label="Add" menuLabel="More add options">
              <Items />
            </SplitButton>
            <SplitButton color={color} icon="send" label="Send" menuLabel="More send options" disabled>
              <Items />
            </SplitButton>
          </div>
        )}
      </For>
      <p class={g.label}>Sizes</p>
      <div class={g.row}>
        <For each={SIZES}>
          {(size) => (
            <SplitButton size={size} color="tonal" icon="edit" label="Edit" menuLabel={`More edit options (${size})`}>
              <Items />
            </SplitButton>
          )}
        </For>
      </div>
      <p class={g.label}>Right-to-left</p>
      <div class={g.row} dir="rtl">
        <SplitButton icon="send" mirror label="إرسال" menuLabel="خيارات الإرسال">
          <Items />
        </SplitButton>
      </div>
    </div>
  );
};

export default SplitButtonDemo;
