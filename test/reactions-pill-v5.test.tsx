import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { structuralStyles } from '../src/primitives/structuralStyles';
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
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

describe('v5 reactions pill presentation', () => {
  it('keeps the collapsed presentation classes on the aside in reactions mode', () => {
    const { container } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        reactionsDefaultOpen
        allowExpandReactions={false}
      />,
    );
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside).not.toBeNull();

    // Every collapsed token must survive class conflict resolution:
    // dropped tokens render the default 8px radius and opaque background
    // instead of the v4 50px translucent pill.
    const collapsed = structuralStyles.collapsed as unknown as Set<string>;
    expect(collapsed.size).toBeGreaterThan(0);
    for (const token of collapsed) {
      expect(
        aside.classList.contains(token),
        `collapsed token missing from aside: ${token}`,
      ).toBe(true);
    }
  });
});
