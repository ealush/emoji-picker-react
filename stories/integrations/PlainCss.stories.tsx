import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

import './plain.css';

const meta = {
  title: 'Integrations/Plain CSS',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// The default picker keeps its structure and behavior; one stylesheet
// rebrands it.
export function PlainCss() {
  return <EmojiPicker className="brand-picker" width={350} height={440} />;
}
