import { createSignal, For, type Component } from 'solid-js';
import { Icon } from '../../components/ui/icon';
import { IconButton } from '../../components/ui/buttons/icon-button';
import { TextField, type TextFieldVariant } from '../../components/ui/text-field';
import g from '../gallery.module.css';
import type { DemoMeta } from '.';

export const meta: DemoMeta = { id: 'text-field', name: 'Text field' };

const VARIANTS: TextFieldVariant[] = ['filled', 'outlined'];

const grid = {
  display: 'grid',
  gap: '16px 24px',
  'grid-template-columns': 'repeat(auto-fill, minmax(240px, 1fr))',
  'align-items': 'start',
} as const;

const PasswordField: Component<{ variant: TextFieldVariant }> = (props) => {
  const [visible, setVisible] = createSignal(false);
  return (
    <TextField
      variant={props.variant}
      label="Password"
      type={visible() ? 'text' : 'password'}
      defaultValue="hunter22"
      trailing={
        <IconButton
          color="standard"
          icon={visible() ? 'visibility_off' : 'visibility'}
          label={visible() ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible())}
        />
      }
    />
  );
};

/** The app's use: a URL field validated natively, then by a (fake) server. */
const LinkForm: Component = () => {
  const [url, setUrl] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [serverError, setServerError] = createSignal<string>();
  return (
    <form
      style={{ display: 'grid', gap: '16px', 'max-inline-size': '480px' }}
      onSubmit={(e) => {
        e.preventDefault();
        setServerError(url().includes('example') ? undefined : 'The page could not be reached.');
      }}
      onReset={() => {
        setUrl('');
        setTitle('');
        setServerError(undefined);
      }}
    >
      <p class={g.label}>* required</p>
      <TextField
        label="URL"
        type="url"
        name="url"
        required
        autocomplete="off"
        inputMode="url"
        clearable
        leading={<Icon name="link" />}
        value={url()}
        onValueChange={(v) => {
          setUrl(v);
          setServerError(undefined);
        }}
        errorText={serverError()}
        supportingText="Try https://example.com, or anything else for a server error"
      />
      <TextField
        label="Title"
        name="title"
        maxLength={60}
        counter
        value={title()}
        onValueChange={setTitle}
      />
      <div class={g.row}>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  );
};

const TextFieldDemo: Component = () => (
  <div style={{ display: 'grid', gap: '16px' }}>
    <For each={VARIANTS}>
      {(variant) => (
        <>
          <p class={g.label}>{variant === 'filled' ? 'Filled' : 'Outlined'}</p>
          <div style={grid}>
            <TextField variant={variant} label="Label" />
            <TextField variant={variant} label="Populated" defaultValue="Input text" />
            <TextField variant={variant} label="Placeholder" placeholder="Shown while focused" />
            <TextField variant={variant} placeholder="No label" aria-label="No label" />
            <TextField
              variant={variant}
              label="Search"
              leading={<Icon name="search" />}
              clearable
              defaultValue="Clear me"
            />
            <PasswordField variant={variant} />
            <TextField variant={variant} label="Price" prefixText="$" prefixLabel="Dollars" suffixText=".00" />
            <TextField
              variant={variant}
              label="Email"
              type="email"
              suffixText="@gmail.com"
              suffixLabel="at gmail dot com"
            />
            <TextField variant={variant} label="Directory name" supportingText="Supporting text" />
            <TextField
              variant={variant}
              label="Directory name"
              defaultValue="Recipes"
              errorText="A directory with this name already exists."
              supportingText="Hidden while there is an error"
            />
            <TextField variant={variant} label="Invalid, no text" invalid defaultValue="Value" />
            <TextField variant={variant} label="Bio" maxLength={20} counter defaultValue="Hello" />
            <TextField variant={variant} label="Name" required supportingText="Required (blur after typing)" />
            <TextField variant={variant} label="Disabled" disabled defaultValue="Can't edit" />
            <TextField variant={variant} label="Disabled empty" disabled leading={<Icon name="link" />} />
            <TextField
              variant={variant}
              label="Read-only"
              readOnly
              defaultValue="https://example.com"
              supportingText="Read-only"
            />
            <TextField variant={variant} label="Multi-line (grows)" multiline />
            <TextField
              variant={variant}
              label="Text area"
              multiline
              rows={4}
              autoGrow={false}
              maxLength={200}
              counter
            />
            <TextField variant={variant} label="Dense" dense defaultValue="Opt-in only" />
            <TextField
              variant={variant}
              label="A very long label that does not fit in the field"
              leading={<Icon name="title" />}
            />
          </div>
        </>
      )}
    </For>
    <p class={g.label}>Form: native validation, server error, controlled values, reset</p>
    <LinkForm />
  </div>
);

export default TextFieldDemo;
