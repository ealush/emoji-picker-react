import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

import './SlackReactions.css';

const meta = {
  title: 'Recipes/Slack reactions',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// The default picker in reactions mode with Slack's common reaction set.
// The "+" expands to the full picker in place.
export function SlackReactions() {
  return (
    <div className="slack-stage">
      <div className="slack-message">
        <div className="slack-avatar" />
        <div>
          <span className="slack-name">Ana Ramírez</span>
          <div>Shipped the release notes — take a look before standup 🚀</div>
        </div>
      </div>
      <EmojiPicker
        className="slack-picker"
        reactionsDefaultOpen
        reactions={['2705', '1f440', '1f64c', '1f525', '1f389', '1f44d']}
        width={420}
        height={380}
      />
    </div>
  );
}
