import { Meta } from '@storybook/react-vite';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props, Theme } from '../../src';
import { Template, TemplateDark } from '../utils/pickerStoryUtils';

const meta = {
  tags: ['visual'],
  title: 'Picker/Search & Visibility',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const SearchDisabled = (args: Props) => (
  <Template {...args} searchDisabled />
);

export const SearchDisabledDark = (args: Props) => (
  <TemplateDark {...args} searchDisabled theme={Theme.DARK} />
);

export const CustomSearchPlaceholder = () => (
  <Template searchPlaceholder="👀 Find" />
);

export const CustomSearchClearButtonLabel = (args: Props) => (
  <Template {...args} searchClearButtonLabel="Reset search" />
);

export const HiddenEmojis = (args: Props) => (
  <Template {...args} hiddenEmojis={['1f604', '1f60d', '1f607']} />
);

export const HideEmojisByUnicode = (args: Props) => (
  <Template {...args} emojiStyle={EmojiStyle.NATIVE} />
);
