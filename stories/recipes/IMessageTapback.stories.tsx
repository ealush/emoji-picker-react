import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

import './IMessageTapback.css';

const meta = {
  title: 'Recipes/iMessage tapback',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Tapback set: love, like, dislike, laugh, emphasize, question.
export function IMessageTapback() {
  return (
    <div className="imessage-stage">
      <EmojiPicker
        className="imessage-picker"
        reactionsDefaultOpen
        reactions={['2764-fe0f', '1f44d', '1f44e', '1f602', '203c-fe0f', '2753']}
      />
      <div className="imessage-bubble">Dinner at 8? I booked the place by the river.</div>
    </div>
  );
}
