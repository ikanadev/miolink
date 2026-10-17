import { createSignal, For, type Component } from 'solid-js';
import {
  AssistChip,
  ChipSet,
  FilterChip,
  InputChip,
  InputChipField,
  SuggestionChip,
} from '../../components/ui/chip';
import { Icon } from '../../components/ui/icon';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'chip', name: 'Chips' };

const AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="#7d5260"/><circle cx="12" cy="9" r="4" fill="#ffd8e4"/><path d="M4 22a8 8 0 0 1 16 0z" fill="#ffd8e4"/></svg>',
  );

const ChipDemo: Component = () => {
  const [types, setTypes] = createSignal(['links']);
  const [sort, setSort] = createSignal(['recent']);
  const [tags, setTags] = createSignal(['Recipes', 'Reading list', 'Work', 'Travel']);
  const [people, setPeople] = createSignal(['Ana López', 'Ben Ito', 'Chen Wu']);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [field, setField] = createSignal(['solid', 'ark-ui']);
  const [saved, setSaved] = createSignal(false);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <p class={g.label}>Assist: flat, elevated, link, disabled ("Save" becomes "Saved")</p>
      <ChipSet label="Actions">
        <AssistChip label="Add to calendar" icon="event" />
        <AssistChip label={saved() ? 'Saved' : 'Save'} icon={saved() ? 'bookmark_added' : 'bookmark'} onClick={() => setSaved(!saved())} />
        <AssistChip label="Share" icon="share" elevated />
        <AssistChip label="Open docs" icon="open_in_new" href="https://m3.material.io/components/chips" target="_blank" />
        <AssistChip label="No icon" />
        <AssistChip label="Disabled" icon="event" disabled />
        <AssistChip label="Disabled elevated" icon="event" elevated disabled />
      </ChipSet>

      <p class={g.label}>Filter, multi-select (types: {types().join(', ') || 'none'})</p>
      <ChipSet label="Filter by type" selection="multi" value={types()} onValueChange={setTypes}>
        <FilterChip value="links" label="Links" />
        <FilterChip value="folders" label="Folders" />
        <FilterChip value="images" label="Images" icon="image" />
        <FilterChip value="videos" label="Videos" elevated />
        <FilterChip value="archived" label="Archived" disabled />
      </ChipSet>

      <p class={g.label}>Filter, single-select, required (radiogroup; sort: {sort().join(', ')})</p>
      <ChipSet label="Sort by" selection="single" required value={sort()} onValueChange={setSort}>
        <FilterChip value="recent" label="Recent" />
        <FilterChip value="name" label="Name" />
        <FilterChip value="views" label="Most viewed" />
      </ChipSet>

      <p class={g.label}>Filter: standalone toggles, selected/disabled, menu and remove trailing actions</p>
      <ChipSet label="Filter options" outline="strong">
        <FilterChip label="Selected" defaultSelected />
        <FilterChip label="Elevated selected" elevated defaultSelected />
        <FilterChip label="Disabled selected" disabled selected />
        <FilterChip
          label="Any date"
          trailing="menu"
          menuExpanded={menuOpen()}
          onMenuClick={() => setMenuOpen(!menuOpen())}
        />
        <For each={tags()}>
          {(tag) => (
            <FilterChip
              label={tag}
              trailing="remove"
              defaultSelected={tag === 'Work'}
              onRemove={() => setTags(tags().filter((t) => t !== tag))}
            />
          )}
        </For>
      </ChipSet>

      <p class={g.label}>Input: avatar, icon, selected, disabled (Delete/Backspace removes; arrows move)</p>
      <ChipSet label="Recipients">
        <For each={people()}>
          {(person, i) => (
            <InputChip
              label={person}
              avatar={i() === 0 ? AVATAR : i() === 1 ? <Icon name="account_circle" size={24} /> : undefined}
              icon={i() === 2 ? 'person' : undefined}
              selected={i() === 1}
              onRemove={() => setPeople(people().filter((p) => p !== person))}
            />
          )}
        </For>
        <InputChip label="Disabled" icon="person" disabled onRemove={() => {}} />
        <InputChip label="Dragged" icon="drag_indicator" dragged onRemove={() => {}} />
      </ChipSet>

      <p class={g.label}>Input chip field (Enter adds; Backspace selects, then removes; double-click edits)</p>
      <div style={{ 'max-inline-size': '480px' }}>
        <InputChipField
          label="Tags"
          placeholder="Add a tag"
          value={field()}
          onValueChange={(d) => setField(d.value)}
          icon="sell"
        />
      </div>

      <p class={g.label}>Suggestion: flat, elevated, disabled; one scrolling row; neutral icons</p>
      <ChipSet label="Suggested replies" layout="scroll" iconColor="neutral">
        <SuggestionChip label="Sounds good" />
        <SuggestionChip label="On my way" icon="directions_walk" />
        <SuggestionChip label="Call me later" elevated />
        <SuggestionChip label="Thanks!" icon="favorite" elevated />
        <SuggestionChip label="Let's meet tomorrow" />
        <SuggestionChip label="Can't talk now" />
        <SuggestionChip label="Disabled" disabled />
      </ChipSet>

      <p class={g.label}>Truncation (narrow container)</p>
      <div style={{ 'max-inline-size': '160px' }}>
        <ChipSet label="Truncated">
          <AssistChip label="A very long assist chip label" icon="event" />
          <FilterChip label="A very long filter label" trailing="remove" onRemove={() => {}} />
        </ChipSet>
      </div>
    </div>
  );
};

export default ChipDemo;
