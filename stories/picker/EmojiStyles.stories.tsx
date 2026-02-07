import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props } from '../../src';
import { Template } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Emoji Styles',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const EmojiImageApple = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.APPLE} />
);
export const EmojiImageFacebook = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.FACEBOOK} />
);
export const EmojiImageGoogle = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.GOOGLE} />
);
export const EmojiImageTwitter = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.TWITTER} />
);
