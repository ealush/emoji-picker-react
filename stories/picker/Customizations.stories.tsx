import { Meta } from '@storybook/react';
import React, { useEffect, useState } from 'react';

import EmojiPicker, { Props } from '../../src';
import { Categories } from '../../src/config/categoryConfig';
import { Template, customEmojis } from '../utils/pickerStoryUtils';

const meta = {
  title: 'Picker/Customizations',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true,
  },
} satisfies Meta<typeof EmojiPicker>;

export default meta;

export const CustomEmojis = (args: Props) => (
  <Template {...args} customEmojis={customEmojis} />
);

export const CustomEmojisDefered = (args: Props) => {
  const [custom, setCustomEmojis] = useState<any>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomEmojis(customEmojis);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return <Template {...args} customEmojis={custom} />;
};
CustomEmojisDefered.parameters = {
  visualTestDelay: 2500,
};

export const CustomPreviewConfig = (args: Props) => (
  <Template
    {...args}
    previewConfig={{
      defaultEmoji: '1fae5',
      defaultCaption: 'What have we here?',
    }}
  />
);

export const CustomCategoryConfig = (args: Props) => (
  <Template
    {...args}
    categories={[
      {
        name: 'Fun and Games',
        category: Categories.ACTIVITIES,
      },
      {
        name: 'Smileys & Emotion',
        category: Categories.SMILEYS_PEOPLE,
      },
      {
        name: 'Flags',
        category: Categories.FLAGS,
      },
      {
        name: 'Yum Yum',
        category: Categories.FOOD_DRINK,
      },
    ]}
  />
);
