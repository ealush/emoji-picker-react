import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';
import { Root, Search, Viewport, List, Preview } from '../../src/primitives';

// Behavior fixture for `columns` (playwright/adoption-behavior.spec.ts).
const meta = {
  title: 'Picker/Columns',
  component: EmojiPicker,
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const SixColumns = () => <EmojiPicker columns={6} />;

export const NarrowContainer = () => (
  <div style={{ width: 220 }}>
    <EmojiPicker columns={9} />
  </div>
);

export const PrimitiveColumns = () => (
  <Root columns={6} style={{ height: 450 }}>
    <Search />
    <Viewport>
      <List />
    </Viewport>
    <Preview />
  </Root>
);
