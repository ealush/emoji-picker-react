import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

import './IntercomRating.css';

const meta = {
  title: 'Recipes/Intercom rating',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Reactions as a rating scale: a terminal bar (no "+") stretched to the
// card width. onReactionClick receives the chosen point on the scale.
export function IntercomRating() {
  return (
    <div className="intercom-widget">
      <div className="intercom-header">
        <h2>Hi there 👋</h2>
        <p>We typically reply in a few minutes.</p>
      </div>
      <div className="intercom-card">
        <strong>How would you rate the conversation?</strong>
        <EmojiPicker
          className="intercom-scale"
          reactionsDefaultOpen
          allowExpandReactions={false}
          reactions={['1f620', '1f641', '1f610', '1f603', '1f929']}
          onReactionClick={() => undefined}
        />
      </div>
    </div>
  );
}
