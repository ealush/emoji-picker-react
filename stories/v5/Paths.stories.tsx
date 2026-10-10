import type { Meta } from '@storybook/react-vite';
import React, { forwardRef, useState, type InputHTMLAttributes } from 'react';

import EmojiPicker, { type EmojiClickData } from '../../src';
import * as Picker from '../../src/primitives';

// The three ways to use the picker, side by side with the CSS each one
// needs. Mirrors example/ and docs/v5/STYLING_RECIPES.md.
const meta = {
  title: 'Paths',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

function useLog() {
  const [log, setLog] = useState<string[]>([]);
  const record = (data: EmojiClickData) =>
    setLog((entries) =>
      [`${data.emoji} ${data.names[data.names.length - 1]}`, ...entries].slice(0, 5),
    );
  const view = (
    <ol aria-label="Selections" style={{ margin: '12px 0 0', paddingLeft: 20 }}>
      {log.map((entry, i) => (
        <li key={`${i}-${entry}`}>{entry}</li>
      ))}
    </ol>
  );
  return { record, view };
}

/** One component, no CSS import; a class with --epr-* variables brands it. */
export function BatteriesIncluded() {
  const { record, view } = useLog();
  return (
    <div>
      <style>{`
        .brand-picker {
          --epr-bg-color: #faf5ff;
          --epr-category-label-bg-color: #faf5ffe6;
          --epr-search-input-bg-color: #f3e8ff;
          --epr-picker-border-color: #e9d5ff;
          --epr-text-color: #6b21a8;
          --epr-highlight-color: #7c3aed;
          --epr-hover-bg-color: #ede9fe;
          --epr-focus-bg-color: #ddd6fe;
          --epr-picker-border-radius: 16px;
          --epr-emoji-size: 26px;
        }
        .brand-picker [data-epr-part='category-label'] {
          font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
        }
      `}</style>
      <EmojiPicker
        className="brand-picker"
        colorScheme="light"
        columns={8}
        onEmojiClick={record}
      />
      {view}
    </div>
  );
}

/** The supplied layout and behavior; every decorative style is yours. */
export function Unstyled() {
  const { record, view } = useLog();
  return (
    <div>
      <style>{`
        .paper-picker {
          --epr-emoji-size: 28px;
          --epr-emoji-padding: 6px;
          --epr-category-label-height: 32px;
          background: Canvas; color: CanvasText;
          border: 1px solid #8884; border-radius: 14px;
          font: 14px/1.4 system-ui, sans-serif; box-shadow: 0 12px 32px #0002;
        }
        .paper-picker [data-epr-part='search'] { padding: 12px 12px 8px; }
        .paper-picker [data-epr-part='search-input'] {
          padding-inline: 12px 36px; border: 1px solid #8886; border-radius: 10px;
          background: transparent; color: inherit; font: inherit;
        }
        .paper-picker [data-epr-part='category-nav'] { padding: 0 8px 8px; border-bottom: 1px solid #8883; }
        .paper-picker :is([data-epr-part='emoji'], [data-epr-part='category-tab'],
            [data-epr-part='search-clear'], [data-epr-part='skin-tone-button']) {
          border: 0; border-radius: 8px; background: transparent; color: inherit; cursor: pointer;
        }
        .paper-picker [data-epr-part='category-tab'] { color: #8888; }
        .paper-picker [data-epr-part='category-tab'][aria-selected='true'] { color: #2563eb; }
        .paper-picker [data-epr-part='emoji'][data-epr-active] { background: #8882; }
        .paper-picker :is(button, input):focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
        .paper-picker [data-epr-part='category-label'] {
          background: Canvas; color: #888; font-size: 11px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
        }
        .paper-picker [data-epr-part='variation-picker'] {
          background: Canvas; border: 1px solid #8884; border-radius: 10px; box-shadow: 0 4px 12px #0003;
        }
        .paper-picker [data-epr-part='preview'] { border-top: 1px solid #8883; }
      `}</style>
      <EmojiPicker
        unstyled
        className="paper-picker"
        width={360}
        height={440}
        onEmojiClick={record}
      />
      {view}
    </div>
  );
}

// A design-system input: forwards its ref and native props to one <input>.
const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Field(props, ref) {
    return (
      <span className="field">
        <span aria-hidden>🔎</span>
        <input ref={ref} {...props} />
      </span>
    );
  },
);

// Defined at module scope: a new identity would remount every cell.
const components: Picker.PickerComponents = {
  Emoji: ({ emoji, className, ...props }) => (
    <button {...props} className={`${className} cell${emoji.isActive ? ' cell-active' : ''}`} />
  ),
  CategoryHeader: ({ category, className, ...props }) => (
    <div {...props} className={`${className} section`}>
      {category.name}
    </div>
  ),
  CategoryButton: ({ category, className, ...props }) => (
    <button {...props} className={`${className} tab${category.isActive ? ' tab-active' : ''}`} />
  ),
  SkinToneButton: ({ tone, className, ...props }) => (
    <button {...props} className={`${className} tone${tone.isActive ? ' tone-active' : ''}`} />
  ),
};

function Toolbar() {
  const active = Picker.useActiveEmoji();
  const { search, resultCount } = Picker.useSearchState();
  const { clear } = Picker.useSearchActions();
  return (
    <footer className="toolbar">
      <span>
        {active
          ? `${active.emoji} ${active.names[active.names.length - 1]}`
          : search
            ? `${resultCount ?? 0} results for “${search}”`
            : 'Hover or arrow through the grid'}
      </span>
      {search && (
        <button type="button" onClick={clear}>
          Clear
        </button>
      )}
    </footer>
  );
}

/** Your layout and components from the primitives; a bare Root carries only geometry. */
export function Composed() {
  const { record, view } = useLog();
  return (
    <div>
      <style>{`
        .card {
          --epr-emoji-size: 26px; --epr-emoji-padding: 6px;
          --epr-category-label-height: 28px; --epr-category-navigation-button-size: 28px;
          width: 352px; height: 440px; background: #0b1220; color: #e2e8f0;
          border: 1px solid #1e293b; border-radius: 16px;
          font: 14px/1.4 system-ui, sans-serif; box-shadow: 0 24px 48px rgb(2 6 23 / 60%);
        }
        .card [data-epr-part='panel'] { gap: 8px; padding: 12px 0 0; }
        .card-header { display: flex; align-items: center; gap: 8px; padding: 0 12px; }
        .field { display: flex; flex: 1; align-items: center; gap: 8px; min-width: 0; padding: 0 12px;
          border: 1px solid #1e293b; border-radius: 10px; background: #111c33; }
        .field input { flex: 1; min-width: 0; height: 36px; border: 0; background: transparent; color: inherit; font: inherit; outline: none; }
        .field:focus-within { border-color: #22d3ee; }
        .tabs { padding: 0 12px; border-bottom: 1px solid #1e293b; }
        .tab, .tone, .cell { border: 0; background: transparent; color: #64748b; cursor: pointer; border-radius: 8px; }
        .tab-active { color: #22d3ee; }
        .tone { display: grid; place-items: center; }
        .tone-active { outline: 2px solid #22d3ee; }
        .cell-active { background: #1e293b; }
        .card button:focus-visible { outline: 2px solid #22d3ee; outline-offset: -2px; }
        .section { background: #0b1220f2; color: #94a3b8; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        .card [data-epr-part='variation-picker'] { background: #111c33; border: 1px solid #1e293b; border-radius: 10px; }
        .card [data-epr-part='variation-picker'] .cell { color: inherit; }
        .notice { padding: 24px; color: #94a3b8; text-align: center; }
        .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding: 10px 12px; border-top: 1px solid #1e293b; color: #94a3b8; }
        .toolbar button { border: 1px solid #1e293b; border-radius: 8px; background: #111c33; color: inherit; font: inherit; padding: 4px 10px; }
      `}</style>
      <Picker.Root
        className="card"
        columns={8}
        components={components}
        onEmojiClick={record}
      >
        <div className="card-header">
          <Picker.SearchInput as={Field} />
          <Picker.SkinTone />
        </div>
        <Picker.CategoryNav className="tabs" />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty className="notice">
            {({ search }) => <>Nothing matches “{search}”</>}
          </Picker.Empty>
          <Picker.Loading className="notice" />
          <Picker.LoadError className="notice" />
        </Picker.Viewport>
        <Toolbar />
      </Picker.Root>
      {view}
    </div>
  );
}
