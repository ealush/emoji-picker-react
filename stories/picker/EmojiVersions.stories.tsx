import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props, SkinTones } from '../../src';
import { Template } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Emoji Versions',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const EmojiVersion_0_6 = (args: Props) => (
  <Template
    {...args}
    defaultSkinTone={SkinTones.MEDIUM}
    emojiVersion="0.6"
    emojiStyle={EmojiStyle.NATIVE}
  />
);
export const EmojiVersion_1_0 = (args: Props) => (
  <Template {...args} emojiVersion="1.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_2_0 = (args: Props) => (
  <Template {...args} emojiVersion="2.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_3_0 = (args: Props) => (
  <Template {...args} emojiVersion="3.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_4_0 = (args: Props) => (
  <Template {...args} emojiVersion="4.0" emojiStyle={EmojiStyle.NATIVE} />
);
export const EmojiVersion_5_0 = (args: Props) => (
  <Template {...args} emojiVersion="5.0" emojiStyle={EmojiStyle.NATIVE} />
);
