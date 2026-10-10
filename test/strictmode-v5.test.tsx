import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../src';
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
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

const renderPicker = (props: Partial<Props> = {}, strict = false) => {
  const tree = (
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      {...props}
    />
  );
  return render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
};

describe('v5 StrictMode mount', () => {
  it('does not emit onReactionsModeChange on StrictMode mount', async () => {
    const onReactionsModeChange = vi.fn();
    renderPicker({ onReactionsModeChange }, true);

    await screen.findByRole('textbox');
    expect(onReactionsModeChange).not.toHaveBeenCalled();
  });

  it('does not steal focus on StrictMode mount when autofocus is off', async () => {
    renderPicker({ autoFocusSearch: false }, true);

    await screen.findByRole('textbox');
    expect(document.activeElement).toBe(document.body);
  });

  it('does not steal focus on plain mount when autofocus is off', async () => {
    renderPicker({ autoFocusSearch: false }, false);

    await screen.findByRole('textbox');
    expect(document.activeElement).toBe(document.body);
  });
});
