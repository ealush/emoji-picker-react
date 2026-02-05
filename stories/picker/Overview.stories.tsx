import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props, Theme } from '../../src';
import { Template, TemplateDark } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Overview',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const Default = (args: Props) => <Template {...args} />;
export const Native = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.NATIVE} />
);
export const Dark = (args: Props) => (
  <TemplateDark {...args} theme={Theme.DARK} />
);
export const AutoTheme = (args: Props) => (
  <TemplateDark {...args} theme={Theme.AUTO} />
);
