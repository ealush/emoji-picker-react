import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// Concept: a phosphor CRT — green-on-black monospace, scanlines, prompt
// headers ("> SMILEYS & PEOPLE") and an inverted block cursor for focus.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

function Prompt({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} crt-prompt`}>
      {`> ${category.name.toUpperCase()}`}
    </h3>
  );
}

const components = { CategoryHeader: Prompt };

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="crt-bezel">
      <RootComponent
        className={className}
        searchPlaceholder="grep emoji…"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <div className="crt-status">
          <span>emoji.sh</span>
          <span>tty1 · 80×24</span>
        </div>
        <Picker.Search />
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List components={components} />
          <Picker.Empty>{({ search }) => `grep: ${search}: no matches`}</Picker.Empty>
        </Picker.Viewport>
      </RootComponent>
    </div>
  );
}
