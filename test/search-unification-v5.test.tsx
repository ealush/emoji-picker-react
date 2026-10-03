import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { searchEmojis } from '../src/data-core/search';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/data-core/search', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../src/data-core/search')>();
  return { ...actual, searchEmojis: vi.fn(actual.searchEmojis) };
});

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const mockSearchEmojis = searchEmojis as unknown as ReturnType<typeof vi.fn>;

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
      { n: ['face', 'smiling face'], u: '1f604', a: '0.6' },
    ],
    [Categories.ANIMALS_NATURE]: [
      { n: ['cat', 'cat face'], u: '1f431', a: '0.6' },
    ],
  },
};

function gridUnifieds(): string[] {
  const grid = document.querySelector('[role="grid"]') as HTMLElement;
  const unifieds = Array.from(
    grid.querySelectorAll('[data-epr-unified]'),
  )
    .map((element) => element.getAttribute('data-epr-unified') as string)
    .filter(Boolean);
  // The same emoji can render in multiple sections; compare membership.
  return Array.from(new Set(unifieds));
}

async function settle(ms = 250) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

describe('v5 single search core', () => {
  beforeEach(() => {
    mockSearchEmojis.mockClear();
  });

  it('filters picker results through the shared data-core search', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
      />,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    mockSearchEmojis.mockClear();

    fireEvent.change(input, { target: { value: 'cat' } });

    expect(mockSearchEmojis).toHaveBeenCalledWith('cat', {
      emojiData: minimalEmojiData,
    });
    await vi.waitFor(() => {
      expect(gridUnifieds()).toEqual(['1f431']);
    });
  });

  it('matches data-entry results for the same query', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
      />,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    for (const query of ['cat', 'face', 'zzz-no-match']) {
      fireEvent.change(input, { target: { value: query } });
      const expected = (
        searchEmojis as unknown as (q: string, o?: object) => Array<{
          unified: string;
        }>
      )(query, { emojiData: minimalEmojiData }).map((entry) => entry.unified);
      await settle();
      expect(gridUnifieds().sort()).toEqual([...expected].sort());
      fireEvent.change(input, { target: { value: '' } });
      await settle();
    }
  });

  it('unions caller custom emojis on top of core results', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        customEmojis={[
          { id: 'panda', names: ['Panda'], imgUrl: 'https://x/panda.png' },
        ]}
      />,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    // The pure core knows nothing of per-Root customs.
    expect(
      (
        searchEmojis as unknown as (q: string, o?: object) => unknown[]
      )('panda', { emojiData: minimalEmojiData }),
    ).toEqual([]);

    fireEvent.change(input, { target: { value: 'panda' } });
    await vi.waitFor(() => {
      expect(gridUnifieds()).toContain('panda');
    });
  });
});
