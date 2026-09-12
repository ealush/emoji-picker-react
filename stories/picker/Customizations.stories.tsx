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

/**
 * Demonstrates grouping custom emojis into their own named sections.
 * Each `{ category: CUSTOM, group }` entry renders its own tab and
 * section — placed wherever it sits in `categories` — with its own
 * `name` and `icon`. Ungrouped customs share the classic bucket.
 * https://github.com/ealush/emoji-picker-react/issues/510
 */
export const CustomEmojisGrouped = (args: Props) => (
  <Template
    {...args}
    customEmojis={[
      ...customEmojis.slice(0, 2).map((emoji) => ({ ...emoji, group: 'fun' })),
      ...customEmojis.slice(2).map((emoji) => ({ ...emoji, group: 'gear' })),
    ]}
    categories={[
      Categories.SMILEYS_PEOPLE,
      { category: Categories.CUSTOM, group: 'fun', name: 'Fun' },
      { category: Categories.CUSTOM, group: 'gear', name: 'Gear' },
      { category: Categories.CUSTOM, name: 'Misc' },
    ]}
  />
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
