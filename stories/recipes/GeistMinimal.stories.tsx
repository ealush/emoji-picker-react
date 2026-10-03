import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './GeistMinimal.css';

const meta = {
  title: 'Recipes/Geist minimal',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

function Header({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} geist-header`}>
      {category.name}
    </h3>
  );
}

const components = { CategoryHeader: Header };

// theme="light" supplies the default color tokens; the CSS only adjusts
// a handful. suggestedEmojis pins a product-specific first row.
export function GeistMinimal() {
  return (
    <Picker.Root
      className="geist-picker"
      theme="light"
      searchPlaceholder="Search…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
      suggestedEmojis={['1f680', '2705', '1f6a7', '1f41b', '1f525', '1f4a1', '1f389', '1f440']}
    >
      <Picker.Search />
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List components={components} />
        <Picker.Empty />
      </Picker.Viewport>
    </Picker.Root>
  );
}
