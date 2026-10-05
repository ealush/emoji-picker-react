import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

// Record, at the moment each scroll is applied, whether the Animals section
// was still hidden by the previous search (jsdom has no layout, so the
// offset itself cannot be asserted).
const jumps: Array<{
  top: number;
  animalsHidden: boolean;
  searchActive: boolean;
}> = [];
vi.mock('../src/DomUtils/scrollTo', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../src/DomUtils/scrollTo')>();
  return {
    ...actual,
    scrollTo: (root: unknown, top = 0) => {
      const animals = document.querySelector(
        '[data-epr-category="animals_nature"]',
      );
      jumps.push({
        top,
        animalsHidden: !!animals?.classList.contains('epr-hidden'),
        searchActive: !!document.querySelector('.epr-search-active'),
      });
    },
  };
});

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const data: EmojiData = {
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
    [Categories.SMILEYS_PEOPLE]: [{ n: ['grinning face'], u: '1f600', a: '1' }],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat face'], u: '1f431', a: '1' }],
  },
};

const wait = (ms: number) =>
  act(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe('category jump right after clearing the search', () => {
  it('waits for a native BYOD input to clear even when the target section stays visible', async () => {
    render(
      <Picker.Root
        emojiData={data}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      >
        <Picker.SearchInput />
        <Picker.CategoryNav />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    const search = screen.getByRole('textbox');
    fireEvent.change(search, { target: { value: 'face' } });
    await wait(250);
    expect(document.querySelector('.epr-search-active')).toBeTruthy();
    expect(
      document.querySelector('[data-epr-category="animals_nature"]'),
    ).not.toHaveClass('epr-hidden');
    fireEvent.change(search, { target: { value: '' } });
    jumps.length = 0;
    fireEvent.click(screen.getByRole('tab', { name: 'Animals & Nature' }));
    await vi.waitFor(() => expect(jumps.length).toBeGreaterThan(0));
    expect(jumps.every((jump) => !jump.searchActive)).toBe(true);
  });

  it(
    'waits for the section the pending filter still hides, then jumps',
    { timeout: 10000 },
    async () => {
      render(
        <EmojiPicker
          emojiData={data}
          categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        />,
      );
      const search = await screen.findByLabelText(
        'Type to search for an emoji',
      );
      fireEvent.change(search, { target: { value: 'grinning' } });
      await wait(250);
      expect(
        document
          .querySelector('[data-epr-category="animals_nature"]')
          ?.classList.contains('epr-hidden'),
      ).toBe(true);

      // Clear, then click the tab inside the 100 ms debounce window.
      fireEvent.change(search, { target: { value: '' } });
      jumps.length = 0;
      fireEvent.click(screen.getByRole('tab', { name: 'Animals & Nature' }));
      // Once the cleared search restores the section, the jump lands.
      await vi.waitFor(
        () => {
          expect(
            document
              .querySelector('[data-epr-category="animals_nature"]')
              ?.classList.contains('epr-hidden'),
          ).toBe(false);
          expect(jumps.length).toBeGreaterThan(0);
        },
        { timeout: 5000, interval: 50 },
      );

      expect(jumps.length).toBeGreaterThan(0);
      // Never jumps while the target is hidden (that lands at the top).
      expect(jumps.every((jump) => !jump.animalsHidden)).toBe(true);
    },
  );
});
