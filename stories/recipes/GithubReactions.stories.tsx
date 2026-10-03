import type { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker from '../../src';

import './GithubReactions.css';

const meta = {
  title: 'Recipes/GitHub reactions',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// GitHub's fixed reaction set. allowExpandReactions={false} makes the
// compact bar terminal: there is no "+" and no full picker.
export function GithubReactions() {
  return (
    <div className="gh-stage">
      <div className="gh-comment-header">
        <strong>octocat</strong> commented 3 hours ago
      </div>
      Repro is attached. Happens on every cold start since 2.4.0.
      <div className="gh-popover-label">Pick your reaction</div>
      <EmojiPicker
        className="gh-picker"
        reactionsDefaultOpen
        allowExpandReactions={false}
        reactions={[
          '1f44d',
          '1f44e',
          '1f604',
          '1f389',
          '1f615',
          '2764-fe0f',
          '1f680',
          '1f440',
        ]}
      />
    </div>
  );
}
