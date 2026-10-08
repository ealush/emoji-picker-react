import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.CUSTOM]: {
      category: Categories.CUSTOM,
      name: 'Custom Emojis',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
    [Categories.CUSTOM]: [],
  },
};

const teamCustomEmojis = [
  {
    names: ['Panda'],
    imgUrl: 'https://example.com/panda.png',
    id: 'panda',
  },
];

const renderPicker = (props = {}) =>
  render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[
        Categories.SMILEYS_PEOPLE,
        { category: Categories.CUSTOM, name: 'Custom Emojis' },
      ]}
      customEmojis={teamCustomEmojis}
      {...props}
    />,
  );

/**
 * Custom emoji search folds case end to end: custom names are lowercased
 * when derived into the data snapshot and the query is lowercased before
 * matching, so a capitalized declaration ('Panda') is found by a query in
 * any case. Grid cells carry role="gridcell", so label queries (not button
 * role queries) locate them -- mirroring test/custom-groups.test.tsx.
 */
describe('custom emoji search case folding', () => {
  it.each([['panda'], ['Panda'], ['PANDA']])(
    'finds capitalized custom emoji for query %s',
    async (query) => {
      const onEmojiClick = vi.fn();
      renderPicker({ onEmojiClick });

      await userEvent.type(
        screen.getByLabelText('Type to search for an emoji'),
        query,
      );

      const customButton = await screen.findByLabelText('panda');
      await userEvent.click(customButton);

      expect(onEmojiClick).toHaveBeenCalledTimes(1);
      expect(onEmojiClick.mock.calls[0][0]).toMatchObject({
        unified: 'panda',
        isCustom: true,
      });
    },
  );
});
