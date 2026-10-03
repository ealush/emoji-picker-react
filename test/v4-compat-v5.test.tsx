import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Emoji, EmojiStyle, Theme } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData, SuggestionMode } from '../src/types/exposedTypes';

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
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

// V4_API_MATRIX.md §2: enum exports remain, and readable literals are
// accepted wherever the v4 enums are. Runtime behavior must be identical.
describe('v5 literal acceptance (V4_API_MATRIX.md)', () => {
  it('literal theme behaves like the enum', () => {
    const { container: enumTree } = render(
      <EmojiPicker emojiData={minimalEmojiData} theme={Theme.DARK} />,
    );
    const { container: literalTree } = render(
      <EmojiPicker emojiData={minimalEmojiData} theme="dark" />,
    );
    const enumAside = enumTree.querySelector('aside') as HTMLElement;
    const literalAside = literalTree.querySelector('aside') as HTMLElement;
    expect(literalAside.className).toBe(enumAside.className);
    expect(literalAside.className).toContain('epr-dark-theme');
  });

  it('literal emojiStyle resolves the same asset URLs', () => {
    const { container } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle="twitter"
        autoFocusSearch={false}
      />,
    );
    const image = container.querySelector(
      'img[src*="twitter/64/1f600.png"]',
    ) as HTMLImageElement;
    expect(image).not.toBeNull();
  });

  it('literal suggestedEmojisMode drives recent suggestions', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([
        { unified: '1f600', original: '1f600', count: 2 },
        { unified: '1f603', original: '1f603', count: 1 },
      ]),
    );
    try {
      render(
        <EmojiPicker
          emojiData={minimalEmojiData}
          suggestedEmojisMode="recent"
          autoFocusSearch={false}
        />,
      );
      // Seeded suggestion renders in Suggested *and* in its grid category.
      const matches = await screen.findAllByRole('gridcell', {
        name: 'grinning face',
      });
      expect(matches.length).toBeGreaterThanOrEqual(2);
    } finally {
      window.localStorage.clear();
    }
  });

  it('standalone Emoji accepts literal emojiStyle', () => {
    const { container } = render(<Emoji unified="1f600" emojiStyle="apple" />);
    expect(
      container.querySelector('img[src*="apple/64/1f600.png"]'),
    ).not.toBeNull();
    // Enum form renders identically.
    const { container: enumTree } = render(
      <Emoji unified="1f600" emojiStyle={EmojiStyle.APPLE} />,
    );
    expect(
      enumTree.querySelector('img[src*="apple/64/1f600.png"]'),
    ).not.toBeNull();
  });

  it('SuggestionMode enum still works', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 1 }]),
    );
    try {
      render(
        <EmojiPicker
          emojiData={minimalEmojiData}
          suggestedEmojisMode={SuggestionMode.RECENT}
          autoFocusSearch={false}
        />,
      );
      const matches = await screen.findAllByRole('gridcell', {
        name: 'grinning face',
      });
      expect(matches.length).toBeGreaterThanOrEqual(2);
    } finally {
      window.localStorage.clear();
    }
  });
});
