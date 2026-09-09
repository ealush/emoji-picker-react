import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

// Translated dataset: 1f600 is "cara sonriente", NOT the default
// English "grinning face".
// https://github.com/ealush/emoji-picker-react/issues/503
const translatedEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.SUGGESTED]: {
      category: Categories.SUGGESTED,
      name: 'Frequently Used',
    },
    [Categories.CUSTOM]: {
      category: Categories.CUSTOM,
      name: 'Custom Emojis',
    },
  },
  emojis: {
    [Categories.SUGGESTED]: [],
    [Categories.CUSTOM]: [],
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['cara', 'cara sonriente'], u: '1f600', a: '1' },
      { n: ['gato'], u: '1f431', a: '0.6' },
      // Must exist: the preview falls back to this emoji when idle.
      { n: ['cara sonriente con ojos sonrientes'], u: '1f60a', a: '0.6' },
    ],
  },
};

describe('issue #503: space bar must not lose translated emojiData', () => {
  it('keeps the translated preview caption after space + blur', async () => {
    render(
      <EmojiPicker
        emojiData={translatedEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
      />,
    );

    const button = await screen.findByLabelText('cara sonriente');

    // Focusing shows the translated name in the preview.
    button.focus();
    await screen.findByText('cara sonriente');

    // Space opens the variation picker for the focused emoji...
    fireEvent.keyDown(button, { key: ' ' });

    // ...then focus leaves (e.g. hovering blank space), so the preview
    // falls back to the variation-picker emoji caption.
    fireEvent.blur(button);

    // The caption must still come from the translated dataset,
    // not the default English one.
    await screen.findByText('cara sonriente');
    expect(screen.queryByText('grinning face')).toBeNull();
  });
});
