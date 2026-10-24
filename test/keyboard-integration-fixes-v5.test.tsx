// Keyboard fixes backported to 5.0.x: fast Enter during the search
// debounce, Escape consumed by a search clear, and rapid arrow presses.
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as Picker from '../src/primitives';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const hundred: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: Array.from({ length: 100 }, (_, i) => ({
      u: (0x1f600 + i).toString(16),
      n: [`emoji ${i}`],
      a: '1',
    })),
  },
};

// 6 columns of 40px cells under a 40px label, in an 80px viewport.
function mockGridGeometry() {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      const part = this.getAttribute('data-epr-part');
      if (part === 'viewport') return 80;
      if (part === 'category-content')
        return parseFloat(this.style.height) || 0;
      if (part === 'category')
        return (
          (parseFloat(
            this.querySelector<HTMLElement>(
              '[data-epr-part="category-content"]',
            )!.style.height,
          ) || 0) + 40
        );
      return 40;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.getAttribute('data-epr-part') === 'category-content'
        ? 40
        : parseFloat(this.style.top) || 0;
    },
  );
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const element = this as HTMLElement;
      const viewport = document.querySelector<HTMLElement>(
        '[data-epr-part="viewport"]',
      );
      const box = (top: number, height: number) =>
        ({ top, bottom: top + height, height, left: 0, right: 240 }) as DOMRect;
      if (element === viewport) return box(0, 80);
      if (element.getAttribute('data-epr-part') === 'search-input')
        return box(-40, 30);
      return box(
        40 + (parseFloat(element.style.top) || 0) - viewport!.scrollTop,
        40,
      );
    },
  );
}

function renderPicker() {
  mockGridGeometry();
  const onEmojiClick = vi.fn();
  render(
    <Picker.Root
      emojiData={hundred}
      categories={[Categories.SMILEYS_PEOPLE]}
      autoFocusSearch={false}
      onEmojiClick={onEmojiClick}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>,
  );
  const input = screen.getByRole('textbox');
  act(() => input.focus());
  return { input, onEmojiClick };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('5.0.x keyboard integration fixes', () => {
  it('queues fast Enter until the matching results commit', async () => {
    const { input, onEmojiClick } = renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 9' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(onEmojiClick).toHaveBeenCalledTimes(1));
    expect(onEmojiClick.mock.calls[0][0].names).toEqual(['emoji 9']);
  });

  it('cancels a queued Enter when another key follows', async () => {
    const { input, onEmojiClick } = renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 9' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Shift' });
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    expect(onEmojiClick).not.toHaveBeenCalled();
  });

  it('materializes the first matching result for queued Enter from a scrolled grid', async () => {
    const { input, onEmojiClick } = renderPicker();
    const body = document.querySelector<HTMLElement>(
      '[data-epr-part="viewport"]',
    )!;
    body.scrollTop = 600;
    fireEvent.scroll(body);
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    fireEvent.change(input, { target: { value: 'emoji 9' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      fireEvent.scroll(body);
      expect(onEmojiClick).toHaveBeenCalledTimes(1);
    });
    expect(onEmojiClick.mock.calls[0][0].names).toEqual(['emoji 9']);
  });

  it('consumes a search-clearing Escape before document capture dismissal', async () => {
    const { input } = renderPicker();
    const host = vi.fn();
    document.addEventListener('keydown', host, true);
    try {
      fireEvent.change(input, { target: { value: 'emoji' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).not.toHaveBeenCalled();
      await waitFor(() => expect(input).toHaveValue(''));
      // Nothing left to clear: the host's own Escape handling runs.
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('keydown', host, true);
    }
  });

  it('moves once per rapid arrow press before the next animation frame', async () => {
    renderPicker();
    const first = await screen.findByRole('gridcell', { name: 'emoji 0' });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('gridcell', { name: 'emoji 2' }),
      ),
    );
  });
});
