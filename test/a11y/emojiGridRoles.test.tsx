import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../../src';
import { Categories } from '../../src/config/categoryConfig';
import { EmojiData } from '../../src/types/exposedTypes';

vi.mock('../../src/hooks/preloadEmoji', () => ({
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
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

const renderPicker = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      {...props}
    />,
  );
};

describe('emoji grid semantics (a11y)', () => {
  it('exposes the emoji list as a grid so screen readers enter focus mode', () => {
    // https://github.com/ealush/emoji-picker-react/issues/508
    // Without a composite-widget role, screen readers keep their
    // virtual-cursor keybindings and swallow arrow keys before they
    // reach the picker's keyboard handler.
    renderPicker();

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('names every category group so its purpose is announced', () => {
    // https://github.com/ealush/emoji-picker-react/issues/512
    // Expected announcement: "Smileys and People ... grinning face button".
    renderPicker();

    const grid = screen.getByRole('grid');
    expect(
      within(grid).getByRole('rowgroup', { name: 'Smileys & People' }),
    ).toBeInTheDocument();
    expect(
      within(grid).getByRole('rowgroup', { name: 'Animals & Nature' }),
    ).toBeInTheDocument();
  });
});
