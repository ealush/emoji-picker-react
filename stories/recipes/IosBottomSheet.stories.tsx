import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './IosBottomSheet.css';

const meta = {
  title: 'Recipes/iOS bottom sheet',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Narrow, touch-first: no Search (type-to-search is off with it), no
// section titles, 34px emojis.
export function IosBottomSheet() {
  return (
    <div className="ios-phone">
      <Picker.Root
        className="ios-sheet"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <div className="ios-handle" />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <Picker.CategoryNav />
      </Picker.Root>
    </div>
  );
}
