import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './LinearPalette.css';

const meta = {
  title: 'Recipes/Linear command palette',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// No CategoryNav and no Preview: rendering only the parts you want is the
// whole configuration. Keyboard hints live in a consumer footer.
export function LinearPalette() {
  return (
    <Picker.Root
      className="linear-picker"
      searchPlaceholder="Search emoji…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty className="linear-empty">
          {({ search }) => `No emoji matches “${search}”`}
        </Picker.Empty>
      </Picker.Viewport>
      <footer className="linear-footer">
        <span>
          <kbd>↑↓←→</kbd> navigate
        </span>
        <span>
          <kbd>↵</kbd> insert
        </span>
        <span>
          <kbd>esc</kbd> close
        </span>
      </footer>
    </Picker.Root>
  );
}
