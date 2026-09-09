import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle, Props } from '../../src';
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
  },
};

const renderReactions = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      reactionsDefaultOpen
      reactions={['1f600', '1f603']}
      {...props}
    />,
  );
};

const activeLabel = () =>
  document.activeElement?.getAttribute('aria-label') ?? '';

async function waitForFocus(label: RegExp | string) {
  await vi.waitFor(() => {
    if (typeof label === 'string') {
      expect(activeLabel()).toBe(label);
    } else {
      expect(activeLabel()).toMatch(label);
    }
  });
}

describe('reactions keyboard support (a11y)', () => {
  it('focuses the first reaction when reactions open', async () => {
    // https://github.com/ealush/emoji-picker-react/issues/411
    renderReactions();

    await waitForFocus('grinning face');
  });

  it('moves focus between reactions and the expand button with arrow keys', async () => {
    // https://github.com/ealush/emoji-picker-react/issues/411
    renderReactions();
    await waitForFocus('grinning face');

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowRight',
    });
    await waitForFocus(/grinning face with big eyes/i);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowRight',
    });
    await waitForFocus('Show all Emojis');

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowLeft',
    });
    await waitForFocus(/grinning face with big eyes/i);
  });

  it('keeps the reactions list itself as a named list', () => {
    renderReactions();

    expect(
      screen.getByRole('list', { name: /reactions/i }),
    ).toBeInTheDocument();
  });
});
