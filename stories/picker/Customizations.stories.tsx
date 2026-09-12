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
      ...customEmojis.slice(0, 2).map(emoji => ({ ...emoji, group: 'fun' })),
      ...customEmojis.slice(2, 4).map(emoji => ({ ...emoji, group: 'gear' })),
      ...customEmojis.slice(4),
    ]}
    categories={[
      Categories.SMILEYS_PEOPLE,
      { category: Categories.CUSTOM, group: 'fun', name: 'Fun' },
      { category: Categories.CUSTOM, group: 'gear', name: 'Gear' },
      { category: Categories.CUSTOM, name: 'Misc' },
    ]}
  />
);

/**
 * Stateful story for runtime group updates. All controls replace props
 * with new immutable references (never mutate): dataset switches keep
 * array length, category controls replace the categories array.
 */
export const CustomEmojisGroupedDynamic = () => {
  const localEmoji = (id: string, color: string, letter: string) => ({
    id,
    names: [id],
    imgUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="44" font-size="36" text-anchor="middle" fill="white">${letter}</text></svg>`,
    )}`,
  });

  const datasetA = [
    { ...localEmoji('panda', '#4d7c0f', 'P'), group: 'animals' },
    { ...localEmoji('frog', '#0d9488', 'F'), group: 'pond' },
  ];
  const datasetB = [
    { ...localEmoji('ninja', '#1e293b', 'N'), group: 'people' },
    { ...localEmoji('robot', '#7c3aed', 'R'), group: 'bots' },
  ];

  const [switched, setSwitched] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [renamed, setRenamed] = useState(false);
  const [ungrouped, setUngrouped] = useState(false);
  const [lastClick, setLastClick] = useState('');

  const customs = (switched ? datasetB : datasetA).map(emoji =>
    ungrouped && emoji.id === 'ninja'
      ? { id: emoji.id, names: emoji.names, imgUrl: emoji.imgUrl }
      : emoji,
  );
  const groups = [...new Set(customs.map(emoji => emoji.group))].filter(
    (group): group is string => !!group,
  );
  const entries = groups.map(group =>
    renamed && group === 'people'
      ? {
          category: Categories.CUSTOM as const,
          group,
          name: 'Crew',
          icon: <span data-testid="crew-icon">C</span>,
        }
      : { category: Categories.CUSTOM as const, group, name: group },
  );
  const ordered = reversed ? [...entries].reverse() : entries;
  const categories = ungrouped
    ? [
        { category: Categories.SMILEYS_PEOPLE as const, name: 'Smileys' },
        ...ordered,
        { category: Categories.CUSTOM as const, name: 'Misc' },
      ]
    : [
        { category: Categories.SMILEYS_PEOPLE as const, name: 'Smileys' },
        ...ordered,
      ];

  return (
    <div style={{ height: '500px', width: '400px' }}>
      <button onClick={() => setSwitched(value => !value)}>
        Switch dataset
      </button>
      <button onClick={() => setReversed(value => !value)}>
        Reverse categories
      </button>
      <button onClick={() => setRenamed(value => !value)}>
        Rename and change icon
      </button>
      <button onClick={() => setUngrouped(value => !value)}>
        Move to ungrouped
      </button>
      <output data-testid="click-result">{lastClick}</output>
      <EmojiPicker
        customEmojis={customs}
        categories={categories}
        onEmojiClick={emoji => setLastClick(emoji.unified)}
      />
    </div>
  );
};

/**
 * Reserved group names (`__proto__`, `constructor`, `toString`) must
 * behave as ordinary data. Local data-URI assets keep the story
 * deterministic with no remote requests.
 */
export const CustomEmojiReservedGroupNames = () => {
  const reserved = (group: string, color: string, letter: string) => ({
    id: `emoji-${group}`,
    names: [`emoji-${group}`],
    imgUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="44" font-size="36" text-anchor="middle" fill="white">${letter}</text></svg>`,
    )}`,
    group,
  });

  return (
    <div style={{ height: '500px', width: '400px' }}>
      <EmojiPicker
        customEmojis={[
          reserved('__proto__', '#b91c1c', 'P'),
          reserved('constructor', '#1d4ed8', 'C'),
          reserved('toString', '#047857', 'S'),
        ]}
        categories={[
          { category: Categories.SMILEYS_PEOPLE, name: 'Smileys' },
          { category: Categories.CUSTOM, group: '__proto__', name: 'Proto' },
          {
            category: Categories.CUSTOM,
            group: 'constructor',
            name: 'Constructor',
          },
          { category: Categories.CUSTOM, group: 'toString', name: 'ToString' },
        ]}
      />
    </div>
  );
};

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
