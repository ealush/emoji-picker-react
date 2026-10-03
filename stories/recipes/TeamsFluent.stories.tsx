import type { Meta } from '@storybook/react-vite';
import React from 'react';

import * as Picker from '../../src/primitives';

import './TeamsFluent.css';

const meta = {
  title: 'Recipes/Teams (Fluent 2)',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Tabs first, then search: an order the default picker does not offer.
// The skin tone control keeps its default search placement.
export function TeamsFluent() {
  return (
    <Picker.Root className="teams-picker" searchPlaceholder="Search emoji">
      <Picker.CategoryNav />
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.Preview />
    </Picker.Root>
  );
}
