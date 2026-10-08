// Generated from stories/recipes/polaris-rating by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories, SkinTonePickerLocation } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// `categories` narrows the picker to one section; CategoryNav would hide
// itself with a single tab, so it is simply not rendered.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="polaris-card">
      <h2 className="polaris-title">How did your first sale feel?</h2>
      <p className="polaris-subdued">Pick an emoji — we will add it to your milestone.</p>
      <RootComponent appearance="default"         className={className}
        categories={[Categories.SMILEYS_PEOPLE]}
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
        autoFocusSearch={false}
      >
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </RootComponent>
      <div className="polaris-actions">
        <button type="button">Skip</button>
        <button type="button" className="polaris-primary">
          Save
        </button>
      </div>
    </div>
  );
}
