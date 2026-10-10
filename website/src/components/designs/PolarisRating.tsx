// Generated from stories/recipes/polaris-rating by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './PolarisRatingPicker';

// In context: a rating card on a milestone page.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="polaris-card">
      <h2 className="polaris-title">How did your first sale feel?</h2>
      <p className="polaris-subdued">Pick an emoji — we will add it to your milestone.</p>
      <PickerExample Root={RootComponent} className={className} />
      <div className="polaris-actions">
        <button type="button">Skip</button>
        <button type="button" className="polaris-primary">
          Save
        </button>
      </div>
    </div>
  );
}
