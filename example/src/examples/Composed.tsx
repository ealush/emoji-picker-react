import * as Picker from 'emoji-picker-react/primitives';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';

import './composed.css';

type Props = { onPick: (message: string) => void };

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

// Replacements for the managed controls. Each spreads every managed prop
// (behavior, ARIA, measured geometry) onto one native element. Defined at
// module scope: a new identity would remount every cell.
const components: Picker.PickerComponents = {
  Emoji: ({ emoji, className, ...props }) => (
    <button
      {...props}
      className={`${className} cell${emoji.isActive ? ' cell-active' : ''}`}
    />
  ),
  CategoryHeader: ({ category, className, ...props }) => (
    <div {...props} className={`${className} section`}>
      {category.name}
    </div>
  ),
  CategoryButton: ({ category, className, ...props }) => (
    <button
      {...props}
      className={`${className} tab${category.isActive ? ' tab-active' : ''}`}
    />
  ),
  SkinToneButton: ({ tone, className, ...props }) => (
    <button
      {...props}
      className={`${className} tone${tone.isActive ? ' tone-active' : ''}`}
    />
  ),
};

// Custom preview and toolbar built from the public hooks.
function Toolbar() {
  const active = Picker.useActiveEmoji();
  const { search, resultCount } = Picker.useSearchState();
  const { clear } = Picker.useSearchActions();
  const { categories, activeCategory, jumpToCategory } =
    Picker.useCategoryNavigation();
  return (
    <footer className="toolbar">
      <span className="toolbar-preview">
        {active ? (
          <>
            <span className="toolbar-glyph">{active.emoji}</span>
            {active.names[active.names.length - 1]}
          </>
        ) : search ? (
          `${resultCount ?? 0} results for “${search}”`
        ) : (
          'Hover or arrow through the grid'
        )}
      </span>
      {search ? (
        <button type="button" onClick={clear}>
          Clear
        </button>
      ) : (
        <select
          aria-label="Jump to category"
          value={activeCategory ?? ''}
          onChange={(event) => jumpToCategory(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </footer>
  );
}

// Hoisted: a new loader identity would load the dataset again.
const loadFrench = () => import('emoji-picker-react/data/emojis-fr');

export function Composed({ onPick }: Props) {
  const [french, setFrench] = useState(false);
  return (
    <div className="example">
      <div className="example-controls">
        <label>
          <input
            type="checkbox"
            checked={french}
            onChange={(event) => setFrench(event.target.checked)}
          />{' '}
          Load the French dataset on demand
        </label>
      </div>

      <Picker.Root
        className="card"
        columns={8}
        components={components}
        skinTonePickerLocation={Picker.SkinTonePickerLocation.NONE}
        emojiData={french ? loadFrench : undefined}
        labels={
          french
            ? {
                searchPlaceholder: 'Rechercher',
                searchLabel: 'Rechercher un emoji',
                loading: 'Chargement…',
              }
            : undefined
        }
        onEmojiClick={(data) =>
          onPick(`${data.emoji}  ${data.names[data.names.length - 1]}  (${data.unified})`)
        }
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
    </div>
  );
}
