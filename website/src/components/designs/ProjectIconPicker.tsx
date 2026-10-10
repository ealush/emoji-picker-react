// Generated from stories/recipes/project-icon-picker by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './ProjectIconPickerPicker';

// In context: a project settings form. Picking an emoji sets the
// project's icon (live preview tile).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
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
      <PickerExample
        Root={RootComponent}
        className={className}
        onEmojiClick={(emoji) => setIcon(emoji.emoji)}
      />
    </form>
  );
}
