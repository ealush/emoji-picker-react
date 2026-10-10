// Generated from stories/recipes/shortcode-typeahead by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

// Name autocomplete: feed the picker's search box from your own input
// through `searchValue`, and replace the `:token` in `onEmojiClick`.
// The hint reads the same state through useActiveEmoji/useSearchState.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
  /** Current `:token` query, without the colon. Shows the full grid when empty. */
  searchValue?: string;
  /** Replace the `:token` with `emoji.emoji` in your input. Defaults to a no-op. */
  onEmojiClick?: (emoji: Picker.EmojiClickData) => void;
};

function noopEmojiClick() {}

function Hint() {
  const active = Picker.useActiveEmoji();
  const { search } = Picker.useSearchState();
  return (
    <div className="typeahead-hint">
      <span className="typeahead-name">
        {active
          ? active.names[active.names.length - 1]
          : `Emoji matching “${search}”`}
      </span>
      <span>↵ insert · esc dismiss</span>
    </div>
  );
}

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
  searchValue = '',
  onEmojiClick = noopEmojiClick,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchValue={searchValue}
      autoFocusSearch={false}
      onEmojiClick={onEmojiClick}
    >
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Hint />
    </RootComponent>
  );
}
