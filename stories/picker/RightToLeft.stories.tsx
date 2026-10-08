import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

// Behavior fixture for dir="rtl" (playwright/adoption-behavior.spec.ts):
// the grid, tabs, search affordances and tone fan mirror, and left/right
// arrows follow the visual direction.
const meta = {
  title: 'Picker/Right To Left',
  component: EmojiPicker,
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const RightToLeft = () => (
  <div dir="rtl" style={{ padding: 15 }}>
    <EmojiPicker autoFocusSearch={false} />
  </div>
);
