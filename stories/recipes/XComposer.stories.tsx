import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './XComposer.css';

const meta = {
  title: 'Recipes/X composer',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// The SkinTone primitive sits beside the search field in a consumer row
// (the built-in placement is turned off with NONE).
export function XComposer() {
  return (
    <Picker.Root
      className="x-picker"
      searchPlaceholder="Search emojis"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <div className="x-header">
        <Picker.Search />
        <Picker.SkinTone />
      </div>
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </Picker.Root>
  );
}
