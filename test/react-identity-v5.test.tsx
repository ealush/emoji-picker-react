import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { flushSync } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const twoCategoryData: EmojiData = {
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

function TwoPickers() {
  return (
    <>
      <EmojiPicker emojiData={twoCategoryData} />
      <EmojiPicker emojiData={twoCategoryData} />
    </>
  );
}

// renderToString under jsdom logs React's useLayoutEffect SSR warning; the
// node-environment SSR suite covers the warning-free path.
beforeEach(() => {
  // eslint-disable-next-line no-console
  const originalError = console.error.bind(console);
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (
      args.some(
        (arg) => typeof arg === 'string' && arg.includes('useLayoutEffect'),
      )
    ) {
      return;
    }
    originalError(...args);
  });
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('v5 multi-root hydration and isolation', () => {
  it('hydrates two Roots without errors and with zero library ids', async () => {
    const html = renderToString(<TwoPickers />);
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;

    const hydrationErrors: unknown[][] = [];
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((...args: unknown[]) => {
        if (
          args.some(
            (arg) =>
              typeof arg === 'string' && arg.includes('useLayoutEffect'),
          )
        ) {
          return;
        }
        hydrationErrors.push(args);
      });

    try {
      act(() => {
        flushSync(() => {
          hydrateRoot(container, <TwoPickers />);
        });
      });
      await act(async () => {});
    } finally {
      errorSpy.mockRestore();
    }

    expect(hydrationErrors).toEqual([]);
    expect(container.querySelectorAll('[id]')).toHaveLength(0);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('a keyboard event in Root A focuses inside Root A, never Root B', async () => {
    const html = renderToString(<TwoPickers />);
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;

    act(() => {
      flushSync(() => {
        hydrateRoot(container, <TwoPickers />);
      });
    });
    await act(async () => {});

    const asides = container.querySelectorAll('aside');
    expect(asides).toHaveLength(2);

    const inputA = asides[0].querySelector('input') as HTMLInputElement;
    act(() => {
      inputA.focus();
    });
    fireEvent.keyDown(inputA, { key: 'ArrowDown' });

    await vi.waitFor(() => {
      expect(
        (document.activeElement as HTMLElement | null)?.getAttribute(
          'aria-label',
        ),
      ).toMatch(/Frequently Used/i);
    });
    expect(asides[0].contains(document.activeElement)).toBe(true);
    expect(asides[1].contains(document.activeElement)).toBe(false);
  });
});
