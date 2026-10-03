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

// A vertical category rail: CategoryNav is placed in its own column and
// orientation="vertical" stacks the tabs and moves keyboard navigation to
// Up/Down (announced through aria-orientation).
export function DiscordSidebar() {
  return (
    <Picker.Root className="discord-picker" searchPlaceholder="Find the perfect emoji">
      <div className="discord-layout">
        <div className="discord-rail">
          <Picker.CategoryNav orientation="vertical" />
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
