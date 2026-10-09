// Generated from stories/recipes/status-dialog by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// In context: a "Set a status" dialog. The picker is an inline part of
// the form — search and grid only, with status-friendly suggestions first
// (suggestedEmojis) and the category renamed through `categories`.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="status-backdrop">
      <div className="status-dialog" role="dialog" aria-labelledby="status-title">
        <h2 id="status-title" className="status-title">
          Set a status
        </h2>
        <div className="status-field">
          <span className="status-current" aria-hidden>
            🌴
          </span>
          <span className="status-text">On vacation until Monday</span>
        </div>
        <RootComponent appearance="default"
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
        <div className="status-row">
          <span>Clear after</span>
          <span className="status-select">Today ▾</span>
        </div>
        <div className="status-actions">
          <button type="button">Cancel</button>
          <button type="button" className="status-save">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
