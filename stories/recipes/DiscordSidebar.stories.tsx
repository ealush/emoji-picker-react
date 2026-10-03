import type { Meta } from '@storybook/react-vite';
import React from 'react';

import * as Picker from '../../src/primitives';

import './DiscordSidebar.css';

const meta = {
  title: 'Recipes/Discord sidebar',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Primitives let the category nav become a vertical rail: it is placed in
// its own column and laid out with ordinary flexbox.
export function DiscordSidebar() {
  return (
    <Picker.Root className="discord-picker" searchPlaceholder="Find the perfect emoji">
      <div className="discord-layout">
        <div className="discord-rail">
          <Picker.CategoryNav />
        </div>
        <div className="discord-main">
          <Picker.Search />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </div>
      </div>
      <Picker.Preview />
    </Picker.Root>
  );
}
