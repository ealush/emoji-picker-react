import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      { n: ['face', 'grinning face with big eyes'], u: '1f603', a: '0.6' },
      // Must exist: the preview falls back to this emoji when idle.
      { n: ['smiling face with smiling eyes'], u: '1f60a', a: '0.6' },
    ],
  },
};

function renderPicker(props: Partial<Props> = {}) {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE]}
      autoFocusSearch={false}
      {...props}
    />,
  );
}

// focusElement() defers via requestAnimationFrame; flush before asserting.
async function flushFocus() {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise(resolve => setTimeout(resolve, 0));
}

function mockRect(el: Element, rect: Partial<DOMRect>) {
  return vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Hovering a partially-below-the-fold emoji must update the preview without
 * moving DOM focus: focusing it would make the browser scroll it into view,
 * yanking the scroll position while the user is browsing.
 * Related: https://github.com/ealush/emoji-picker-react/pull/509
 */
describe('below-fold hover never takes focus', () => {
  it('updates the preview but keeps focus on the search input', async () => {
    renderPicker();

    const search = screen.getByLabelText(
      'Type to search for an emoji',
    ) as HTMLInputElement;
    search.focus();
    expect(document.activeElement).toBe(search);

    const buttons = await screen.findAllByLabelText('grinning face');
    const emojiButton = buttons[buttons.length - 1];
    const body = document.querySelector('.epr-body') as HTMLElement;

    // Button peeking 10px above the body's bottom edge (30px tall).
    mockRect(body, { y: 0, height: 200 });
    mockRect(emojiButton, { y: 190, height: 30 });

    fireEvent.mouseOver(emojiButton);
    await flushFocus();

    // Preview follows the hover...
    expect(await screen.findByText('grinning face')).toBeDefined();
    // ...but focus stays put, so no scroll jump happens.
    expect(document.activeElement).toBe(search);
  });

  it('still takes focus when the hovered emoji is fully visible', async () => {
    renderPicker();

    const search = screen.getByLabelText(
      'Type to search for an emoji',
    ) as HTMLInputElement;
    search.focus();

    const buttons = await screen.findAllByLabelText('grinning face');
    const emojiButton = buttons[buttons.length - 1];
    const body = document.querySelector('.epr-body') as HTMLElement;

    // Fully inside the body viewport.
    mockRect(body, { y: 0, height: 200 });
    mockRect(emojiButton, { y: 100, height: 30 });

    fireEvent.mouseOver(emojiButton);
    await flushFocus();

    expect(document.activeElement).toBe(emojiButton);
  });
});
