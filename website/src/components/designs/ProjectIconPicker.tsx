// Generated from stories/recipes/project-icon-picker by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories, SkinTonePickerLocation } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// In context: a project settings form. Picking an emoji sets the
// project's icon (live preview tile); categories are narrowed to the ones
// that make sense as icons.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [icon, setIcon] = React.useState('🚀');
  return (
    <form className="project-card" onSubmit={(event) => event.preventDefault()}>
      <h2 className="project-heading">Project settings</h2>
      <div className="project-row">
        <span className="project-tile" aria-label={`Project icon ${icon}`} role="img">
          {icon}
        </span>
        <div className="project-name">
          <span className="project-field-label">Name</span>
          <span className="project-field">Website redesign</span>
        </div>
      </div>
      <p className="project-field-label">Icon</p>
      <RootComponent appearance="default"
        className={className}
        searchPlaceholder="Search icons"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
        autoFocusSearch={false}
        onEmojiClick={(emoji: { emoji: string }) => setIcon(emoji.emoji)}
        categories={[
          Categories.OBJECTS,
          Categories.ACTIVITIES,
          Categories.TRAVEL_PLACES,
          Categories.ANIMALS_NATURE,
          Categories.FOOD_DRINK,
          Categories.SYMBOLS,
        ]}
      >
        <div className="project-toolbar">
          <Picker.Search />
          <Picker.CategoryNav />
        </div>
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
        </Picker.Viewport>
      </RootComponent>
    </form>
  );
}
