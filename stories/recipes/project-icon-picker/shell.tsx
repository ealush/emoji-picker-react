import React from 'react';

import { Categories } from '../../../src/primitives';
import * as Picker from '../../../src/primitives';

import './app.css';
import { PickerExample } from './picker';

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
