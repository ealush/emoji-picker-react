import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './Material3.css';

const meta = {
  title: 'Recipes/Material 3',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Bottom navigation bar with the M3 pill indicator on the active tab
// ([aria-selected="true"]); circular emoji state layers.
export function Material3() {
  return (
    <Picker.Root
      className="m3-picker"
      searchPlaceholder="Search emoji"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </Picker.Root>
  );
}
