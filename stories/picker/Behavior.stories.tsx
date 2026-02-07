import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { Props } from '../../src';
import { SuggestionMode } from '../../src/types/exposedTypes';
import { Template } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Behavior',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true,
  },
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const AutoFocusDisabled = (args: Props) => (
  <Template {...args} autoFocusSearch={false} />
);

export const HidePreview = (args: Props) => (
  <Template {...args} previewConfig={{ showPreview: false }} />
);

export const RecentlyUsed = (args: Props) => (
  <Template {...args} suggestedEmojisMode={SuggestionMode.RECENT} />
);

export const LazyLoaded = (args: Props) => (
  <Template {...args} lazyLoadEmojis={true} />
);
