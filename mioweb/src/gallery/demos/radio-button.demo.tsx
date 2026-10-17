import { createSignal, For, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons';
import { List, ListItem } from '../../components/ui/list';
import { RadioButton, RadioButtonIcon, RadioGroup } from '../../components/ui/radio-button';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'radio-button', name: 'Radio button' };

const SORTS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date added' },
  { value: 'views', label: 'Most viewed' },
];

const RadioButtonDemo: Component = () => {
  const [sort, setSort] = createSignal<string | null>('date');
  const [listSort, setListSort] = createSignal<string[]>(['name']);
  const [submitted, setSubmitted] = createSignal('');

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Without label: unselected, selected (enabled, error, disabled)</p>
      <For each={[{}, { error: true }, { disabled: true }]}>
        {(variant) => {
          const suffix = `${'error' in variant ? ', error' : ''}${'disabled' in variant ? ', disabled' : ''}`;
          return (
            <RadioGroup {...variant} orientation="horizontal" defaultValue="b" aria-label={`States${suffix}`}>
              <RadioButton value="a" label={`Unselected${suffix}`} />
              <RadioButton value="b" label={`Selected${suffix}`} />
            </RadioGroup>
          );
        }}
      </For>

      <p class={g.label}>Vertical group with a title (controlled): {sort() ?? 'none'}</p>
      <RadioGroup label="Sort links by" value={sort()} onValueChange={setSort}>
        <For each={SORTS}>{(s) => <RadioButton value={s.value}>{s.label}</RadioButton>}</For>
        <RadioButton value="url" disabled>
          Address (disabled)
        </RadioButton>
      </RadioGroup>

      <p class={g.label}>Horizontal group (use with caution), none selected</p>
      <RadioGroup label="Open links in" orientation="horizontal">
        <RadioButton value="tab">New tab</RadioButton>
        <RadioButton value="same">Same tab</RadioButton>
        <RadioButton value="window">New window</RadioButton>
      </RadioGroup>

      <p class={g.label}>Disabled group</p>
      <RadioGroup label="Theme" disabled defaultValue="system">
        <RadioButton value="light">Light</RadioButton>
        <RadioButton value="dark">Dark</RadioButton>
        <RadioButton value="system">System</RadioButton>
      </RadioGroup>

      <p class={g.label}>Required in a form (error on :user-invalid after submit){submitted() && `: ${submitted()}`}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(`density=${new FormData(e.currentTarget).get('density') ?? '(missing)'}`);
        }}
      >
        <RadioGroup label="Density" name="density" required>
          <RadioButton value="comfortable">Comfortable</RadioButton>
          <RadioButton value="compact">Compact</RadioButton>
        </RadioGroup>
        <Button type="submit" color="tonal">
          Submit
        </Button>
      </form>

      <p class={g.label}>In a single-select list (leading RadioButtonIcon): {listSort().join()}</p>
      <div style={{ 'max-inline-size': '360px' }}>
        <List label="Sort links by" selection="single" selectionIndicator="none" value={listSort()} onValueChange={setListSort}>
          <For each={[...SORTS, { value: 'url', label: 'Address' }]}>
            {(s) => (
              <ListItem
                value={s.value}
                headline={s.label}
                disabled={s.value === 'url'}
                leading={
                  // Decorative: the option is the control and exposes aria-selected.
                  <RadioButtonIcon checked={listSort().includes(s.value)} disabled={s.value === 'url'} />
                }
              />
            )}
          </For>
        </List>
      </div>

      <p class={g.label}>RadioButtonIcon (decorative, for rows that are the control themselves)</p>
      <div class={g.row}>
        <RadioButtonIcon />
        <RadioButtonIcon checked />
        <RadioButtonIcon error />
        <RadioButtonIcon checked error />
        <RadioButtonIcon disabled />
        <RadioButtonIcon checked disabled />
      </div>
    </div>
  );
};

export default RadioButtonDemo;
