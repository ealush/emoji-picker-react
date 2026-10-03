// Generated from stories/recipes/whatsapp-keyboard by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react';
import * as Picker from 'emoji-picker-react/primitives';


// A full-width, short panel: the grid recomputes columns from the
// available width, so a wide picker simply shows more per row.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="wa-stage">
      <div className="wa-chat">
        <div className="wa-bubble">Are we still on for the trip? 🏕️</div>
        <div className="wa-bubble wa-out">Yes! Bringing the tent and snacks</div>
      </div>
      <div className="wa-composer">
        <span aria-hidden>😊</span>
        <div className="wa-input">Type a message</div>
      </div>
      <RootComponent         className={className}
        searchPlaceholder="Search emoji"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
        </Picker.Viewport>
        <Picker.CategoryNav />
      </RootComponent>
    </div>
  );
}
