import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// Concept: a photocopied zine — newsprint, 3px ink borders, hard offset
// shadows, sticker-style section headers and boxed emoji tiles (custom
// cells and headers through List components).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

function Tile({ emoji: _emoji, className, ...props }: Picker.EmojiRenderProps) {
  return <button {...props} className={`${className} zine-tile`} />;
}

function Sticker({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} zine-sticker`}>
      <span>{category.name}</span>
    </h3>
  );
}

const components = { Emoji: Tile, CategoryHeader: Sticker };

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="zine-desk">
      <RootComponent
        className={className}
        searchPlaceholder="FIND A FEELING"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <div className="zine-masthead">EMOJI ZINE · ISSUE 05</div>
        <Picker.Search />
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List components={components} />
          <Picker.Empty />
        </Picker.Viewport>
      </RootComponent>
    </div>
  );
}
