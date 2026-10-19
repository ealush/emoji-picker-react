import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import { EmojiStyle } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

const data: Picker.EmojiData = {
  categories: {
    smileys_people: {
      category: Picker.Categories.SMILEYS_PEOPLE,
      name: 'Faces',
    },
  },
  emojis: {
    smileys_people: [
      { u: '1f600', n: ['grinning face'], a: '1' },
      { u: '1f44d', n: ['thumbs up'], a: '1', v: ['1f44d-1f3fb'] },
    ],
  },
};

const grid = (
  <Picker.Viewport>
    <Picker.List />
  </Picker.Viewport>
);

const variationMenu = (root: ParentNode) =>
  root.querySelectorAll('[data-epr-part="variation-picker"] button');

describe('Escape belongs to the host when there is nothing to undo', () => {
  it('lets Escape through with an empty search', async () => {
    render(<EmojiPicker emojiData={data} autoFocusSearch={false} />);
    const cell = await screen.findByRole('gridcell', { name: 'thumbs up' });
    cell.focus();
    // fireEvent returns false when the picker called preventDefault.
    expect(fireEvent.keyDown(cell, { key: 'Escape' })).toBe(true);
    expect(cell).toHaveFocus();
  });

  it('clears a non-empty search, and only then lets Escape through', async () => {
    render(<EmojiPicker emojiData={data} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'thumbs' } });
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(input).toHaveValue('');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(true);
  });

  it('clears text a controlled parent has not accepted yet', () => {
    const proposals: string[] = [];
    // The parent lags: the input shows "cat" while searchValue is still "".
    render(
      <EmojiPicker
        emojiData={data}
        searchValue=""
        onSearchChange={(next) => proposals.push(next)}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'cat' } });
    expect(input).toHaveValue('cat');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(proposals).toEqual(['cat', '']);
  });

  it('still consumes Escape that closes the variation menu', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Picker.Root emojiData={data}>{grid}</Picker.Root>,
    );
    const cell = screen.getByRole('gridcell', { name: 'thumbs up' });
    fireEvent.mouseDown(cell);
    act(() => vi.advanceTimersByTime(500));
    expect(variationMenu(container)).toHaveLength(2);
    expect(fireEvent.keyDown(cell, { key: 'Escape' })).toBe(false);
  });
});

describe('suggestedEmojis owns the recents', () => {
  it('records nothing in localStorage while suggestedEmojis is set', async () => {
    render(
      <EmojiPicker
        emojiData={data}
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojis={['1f600']}
      />,
    );
    fireEvent.click(
      (await screen.findAllByRole('gridcell', { name: 'thumbs up' }))[0],
    );
    expect(window.localStorage.getItem('epr_suggested')).toBeNull();
  });

  it('records picks without suggestedEmojis', async () => {
    render(<EmojiPicker emojiData={data} emojiStyle={EmojiStyle.NATIVE} />);
    fireEvent.click(await screen.findByRole('gridcell', { name: 'thumbs up' }));
    expect(window.localStorage.getItem('epr_suggested')).toContain('1f44d');
  });
});
