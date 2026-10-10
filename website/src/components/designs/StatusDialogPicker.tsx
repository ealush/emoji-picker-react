// Generated from stories/recipes/status-dialog by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';

// Inline form picker: search and grid only, with status-friendly
// suggestions first (suggestedEmojis) and the category renamed through
// `categories`.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchPlaceholder="Search for an emoji"
      autoFocusSearch={false}
      suggestedEmojis={['1f334', '1f912', '1f3e0', '1f4c5', '1f68c', '1f3a7', '1f37d-fe0f', '1f319']}
      categories={[
        { category: Categories.SUGGESTED, name: 'For your status' },
        Categories.SMILEYS_PEOPLE,
        Categories.TRAVEL_PLACES,
        Categories.ACTIVITIES,
        Categories.OBJECTS,
      ]}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
