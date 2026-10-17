import { createSignal, For, type Component } from 'solid-js';
import { Button } from '../../components/ui/buttons';
import { Checkbox, CheckboxGroup, CheckboxIcon, type CheckboxCheckedState } from '../../components/ui/checkbox';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'checkbox', name: 'Checkbox' };

const STATES: CheckboxCheckedState[] = [false, true, 'indeterminate'];
const stateName = (s: CheckboxCheckedState) => (s === 'indeterminate' ? 'Indeterminate' : s ? 'Checked' : 'Unchecked');

const TOPPINGS = [
  { value: 'pickles', label: 'Pickles' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'lettuce', label: 'Lettuce' },
];

const CheckboxDemo: Component = () => {
  const [toppings, setToppings] = createSignal<string[]>(['pickles']);
  const parent = (): CheckboxCheckedState =>
    toppings().length === 0 ? false : toppings().length === TOPPINGS.length ? true : 'indeterminate';

  const [submitted, setSubmitted] = createSignal('');

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Without label: unchecked, checked, indeterminate (enabled, error, disabled)</p>
      <For each={[{}, { error: true }, { disabled: true }]}>
        {(variant) => (
          <div class={g.row} style={{ gap: '8px' }}>
            <For each={STATES}>
              {(state) => (
                <Checkbox
                  {...variant}
                  defaultChecked={state}
                  label={`${stateName(state)}${'error' in variant ? ', error' : ''}${'disabled' in variant ? ', disabled' : ''}`}
                />
              )}
            </For>
          </div>
        )}
      </For>

      <p class={g.label}>With label</p>
      <div class={g.row}>
        <Checkbox defaultChecked>Remember me</Checkbox>
        <Checkbox>Open links in a new tab</Checkbox>
        <Checkbox error>Accept the terms</Checkbox>
        <Checkbox disabled>Disabled</Checkbox>
        <Checkbox disabled defaultChecked>
          Disabled checked
        </Checkbox>
      </div>

      <p class={g.label}>Parent and children (select all): {toppings().join(', ') || 'none'}</p>
      <div>
        <Checkbox
          checked={parent()}
          onCheckedChange={(c) => setToppings(c === true ? TOPPINGS.map((t) => t.value) : [])}
        >
          All toppings
        </Checkbox>
        <CheckboxGroup
          id="toppings"
          aria-label="Toppings"
          value={toppings}
          onValueChange={setToppings}
          style={{ 'padding-inline-start': '32px' }}
        >
          <For each={TOPPINGS}>{(t) => <Checkbox value={t.value}>{t.label}</Checkbox>}</For>
        </CheckboxGroup>
      </div>

      <p class={g.label}>Required in a form (error on :user-invalid after submit){submitted() && `: ${submitted()}`}</p>
      <form
        class={g.row}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(`terms=${new FormData(e.currentTarget).get('terms') ?? '(missing)'}`);
        }}
      >
        <Checkbox name="terms" value="accepted" required>
          I agree to the terms
        </Checkbox>
        <Button type="submit" color="tonal">
          Submit
        </Button>
      </form>

      <p class={g.label}>CheckboxIcon (decorative, for rows that are the control themselves)</p>
      <div class={g.row}>
        <For each={STATES}>{(state) => <CheckboxIcon checked={state} />}</For>
        <For each={STATES}>{(state) => <CheckboxIcon checked={state} error />}</For>
        <For each={STATES}>{(state) => <CheckboxIcon checked={state} disabled />}</For>
      </div>
    </div>
  );
};

export default CheckboxDemo;
