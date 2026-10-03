import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as scrollModule from '../src/DomUtils/scrollTo';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('post-search scroll vs. category navigation', () => {
  it('a category jump right after clearing the search is not overridden', async () => {
    const calls: number[] = [];
    vi.spyOn(scrollModule, 'scrollTo').mockImplementation((_root, top) => {
      calls.push(top as number);
    });
    const { container } = render(<EmojiPicker autoFocusSearch={false} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'cat' } });
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));

    // Clear, then jump to a category inside the search debounce window.
    fireEvent.change(input, { target: { value: '' } });
    calls.length = 0;
    const animals = container.querySelector(
      '[data-epr-part="category-tab"][aria-label="Animals & Nature"]',
    ) as HTMLElement;
    fireEvent.click(animals);
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));

    // Exactly one scroll: the jump. (jsdom has no layout, so the jump's
    // own target is 0 too; the stale "back to top" would be a second call.)
    expect(calls).toHaveLength(1);
  });
});
