import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, {
  Categories,
  EmojiStyle,
  Props,
  Theme
} from '../../src';
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

export const NoSuggested = (args: Props) => (
  <Template
    {...args}
    categories={[
      { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
      { category: Categories.ANIMALS_NATURE, name: 'Animals & Nature' },
      { category: Categories.FOOD_DRINK, name: 'Food & Drink' },
      { category: Categories.TRAVEL_PLACES, name: 'Travel & Places' },
      { category: Categories.ACTIVITIES, name: 'Activities' },
      { category: Categories.OBJECTS, name: 'Objects' },
      { category: Categories.SYMBOLS, name: 'Symbols' },
      { category: Categories.FLAGS, name: 'Flags' }
    ]}
  />
);
