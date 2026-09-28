import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
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

function renderCompact(props = {}) {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      reactionsDefaultOpen
      reactions={['1f600', '1f603']}
      {...props}
    />,
  );
}

async function waitForFocus(label: RegExp | string) {
  await vi.waitFor(() => {
    const active = document.activeElement?.getAttribute('aria-label') ?? '';
    if (typeof label === 'string') {
      expect(active).toBe(label);
    } else {
      expect(active).toMatch(label);
    }
  });
}

// STATE.md §8: expansion activates the managed panel and moves focus to
// Search when present and autofocus is enabled; collapse restores focus to
// a valid reactions control. Mounts never steal focus.
describe('v5 reactions focus management (STATE.md §8)', () => {
  it('does not steal focus on compact mount', async () => {
    renderCompact();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(document.activeElement?.tagName).not.toBe('BUTTON');
  });

  it('expansion focuses Search when present and autofocus is enabled', async () => {
    renderCompact();
    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    act(() => {
      expand.focus();
    });
    fireEvent.click(expand);
    await waitForFocus('Type to search for an emoji');
  });

  it('expansion without autofocus focuses the next valid region', async () => {
    renderCompact({ autoFocusSearch: false });
    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    act(() => {
      expand.focus();
    });
    fireEvent.click(expand);
    // Categories is the first focusable region after Search in DOM order.
    await waitForFocus(/Frequently Used/i);
  });

  it('collapse restores focus to the first reactions control', async () => {
    renderCompact({
      onEmojiClick: (_emoji: unknown, _event: unknown, api?: { collapseToReactions: () => void }) => {
        api?.collapseToReactions();
      },
    });
    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    fireEvent.click(expand);
    await waitForFocus('Type to search for an emoji');

    const emoji = await screen.findByRole('button', { name: 'grinning face' });
    fireEvent.mouseDown(emoji);
    fireEvent.click(emoji);
    await waitForFocus('grinning face');
    const bar = await screen.findByRole('list', { name: /reactions/i });
    const [first] = Array.from(bar.querySelectorAll('button'));
    expect(document.activeElement).toBe(first);
  });
});
