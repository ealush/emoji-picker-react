import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { EmojiStyle, Props, SkinTones } from '../../src';
import { SkinTonePickerLocation } from '../../src/types/exposedTypes';
import { Template } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Skin Tones',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true
  }
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const SkinTonePickerInPreview = (args: Props) => (
  <Template
    {...args}
    emojiStyle={EmojiStyle.NATIVE}
    skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
  />
);

export const SkinTonesDisabled = (args: Props) => (
  <Template {...args} skinTonesDisabled />
);

export const AlternativeDefaultSkinTone = (args: Props) => (
  <Template {...args} defaultSkinTone={SkinTones.MEDIUM} />
);

export const SkinToneChange = (args: Props) => (
  <Template
    {...args}
    onSkinToneChange={skinTone => {
      console.log('New skin tone set:', skinTone);
    }}
  />
);
