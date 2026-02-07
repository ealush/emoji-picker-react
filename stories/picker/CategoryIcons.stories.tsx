import { Meta } from '@storybook/react';
import React from 'react';

import EmojiPicker, { Categories, CategoryConfig } from '../../src';

const meta = {
  title: 'Picker/CategoryIcons',
  component: EmojiPicker,
  parameters: {
    controls: { expanded: true },
    visualTest: true,
    actions: { argTypesRegex: null }, // Disable actions to prevent serialization issues
  },
  argTypes: {
    categoryIcons: { control: false },
    categories: { control: false },
  },
} satisfies Meta<typeof EmojiPicker>;

export default meta;

// Reusable icons for stories
const StarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color: '#fbbf24' }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const PawIcon = () => <span style={{ fontSize: '18px' }}>🐾</span>;

const FireIcon = () => <span style={{ fontSize: '18px' }}>🔥</span>;

/**
 * Demonstrates using the `categoryIcons` prop to map categories to custom React Node icons.
 */
export const CategoryIconsProp = () => {
  return (
    <div style={{ height: '500px' }}>
      <EmojiPicker
        categoryIcons={{
          [Categories.SUGGESTED]: <FireIcon />,
          [Categories.SMILEYS_PEOPLE]: <StarIcon />,
          [Categories.ANIMALS_NATURE]: <PawIcon />,
          [Categories.FOOD_DRINK]: <span style={{ fontSize: '18px' }}>🍔</span>,
          [Categories.TRAVEL_PLACES]: (
            <span style={{ fontSize: '18px' }}>✈️</span>
          ),
        }}
      />
    </div>
  );
};

/**
 * Demonstrates defining icons directly in the `categories` configuration array.
 * This approach allows defining the icon alongside the category definition.
 */
export const CategoryConfigIcon = () => {
  const categories: CategoryConfig[] = [
    {
      category: Categories.SUGGESTED,
      name: 'Recently Used',
      icon: <FireIcon />,
    },
    {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
      icon: <StarIcon />,
    },
    {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
      icon: <PawIcon />,
    },
    {
      category: Categories.FOOD_DRINK,
      name: 'Food & Drink',
    },
  ];

  return (
    <div style={{ height: '500px' }}>
      <EmojiPicker categories={categories} />
    </div>
  );
};

/**
 * Demonstrates that an icon defined in `categories` config takes precedence over `categoryIcons` prop.
 * Here, 'Smileys & People' has an icon in both, but the one from `categories` (Star) is shown.
 * 'Animals & Nature' only has an icon in `categoryIcons` (Paw), so it is shown.
 */
export const IconPrecedence = () => {
  const categories: CategoryConfig[] = [
    {
      category: Categories.SUGGESTED,
      name: 'Suggested',
    },
    {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys (Config)',
      // This config icon (Star) should override the prop icon (Fire)
      icon: <StarIcon />,
    },
    {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals', // No icon in list, falls back to categoryIcons prop
    },
  ];

  return (
    <div style={{ height: '500px' }}>
      <EmojiPicker
        categories={categories}
        categoryIcons={{
          [Categories.SMILEYS_PEOPLE]: <FireIcon />, // Ignored due to precedence
          [Categories.ANIMALS_NATURE]: <PawIcon />, // Used
        }}
      />
    </div>
  );
};

/**
 * Use image elements as custom category icons.
 */
export const ImageCategoryIcons = () => {
  return (
    <div style={{ height: '500px' }}>
      <EmojiPicker
        categoryIcons={{
          [Categories.SUGGESTED]: (
            <img
              src="https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png"
              alt="Recent"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          ),
          [Categories.SMILEYS_PEOPLE]: (
            <img
              src="https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/smily.png"
              alt="Smileys"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          ),
        }}
      />
    </div>
  );
};

// Set visual test delays
const storyParameters = {
  visualTestDelay: 1500,
};

CategoryIconsProp.parameters = storyParameters;
CategoryConfigIcon.parameters = storyParameters;
IconPrecedence.parameters = storyParameters;
ImageCategoryIcons.parameters = storyParameters;
