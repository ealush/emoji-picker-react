import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './NotionIconPicker.css';

const meta = {
  title: 'Recipes/Notion icon picker',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// App chrome (tabs, Remove, Random) is ordinary consumer UI inside Root.
// Category tabs move to the bottom just by rendering CategoryNav last.
export function NotionIconPicker() {
  return (
    <Picker.Root
      className="notion-picker"
      searchPlaceholder="Filter…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <div className="notion-tabs">
        <button type="button" aria-pressed="true">
          Emoji
        </button>
        <button type="button" aria-pressed="false">
          Icons
        </button>
        <button type="button" aria-pressed="false">
          Upload
        </button>
        <button type="button" className="notion-remove">
          Remove
        </button>
      </div>
      <div className="notion-search-row">
        <Picker.Search />
        <button type="button" className="notion-random">
          🎲 Random
        </button>
      </div>
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </Picker.Root>
  );
}
