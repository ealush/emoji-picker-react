import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

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
