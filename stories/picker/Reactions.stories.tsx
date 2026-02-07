import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props, Theme } from '../../src';
import { Template, TemplateDark } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Reactions',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const ReactionsMenu = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    onReactionClick={data => {
      console.log('Clicked reaction!', data);
    }}
  />
);

export const ReactionsMenuNoExpand = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    allowExpandReactions={false}
    emojiStyle={EmojiStyle.NATIVE}
    onReactionClick={data => {
      console.log('Clicked reaction!', data);
    }}
  />
);

export const CustomReactions = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    reactions={[
      '1f4a9',
      '1f4aa',
      '1f4ab',
      // angry
      '1f620'
    ]}
  />
);

export const ReactionsMenuDark = (args: Props) => (
  <TemplateDark
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    theme={Theme.DARK}
  />
);

export const ReactionsMenuAuto = (args: Props) => (
  <Template
    {...args}
    reactionsDefaultOpen={true}
    emojiStyle={EmojiStyle.NATIVE}
    theme={Theme.AUTO}
  />
);
ReactionsMenuAuto.parameters = { visualTest: false };

export const CollapseToReactions = () => (
  <EmojiPicker
    onEmojiClick={(emoji, event, { collapseToReactions }) => {
      collapseToReactions();
      console.log(emoji, event);
    }}
    emojiStyle={EmojiStyle.NATIVE}
  />
);
