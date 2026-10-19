import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => window.localStorage.clear());

const data: Picker.EmojiData = {
  categories: {
    smileys_people: {
      category: Picker.Categories.SMILEYS_PEOPLE,
      name: 'Faces',
    },
    animals_nature: {
      category: Picker.Categories.ANIMALS_NATURE,
      name: 'Animals',
    },
  },
  emojis: {
    smileys_people: [{ u: '1f600', n: ['grinning face'], a: '1' }],
    animals_nature: [{ u: '1f431', n: ['cat face'], a: '1' }],
  },
};

// The default picker: tones sit in Search, right of the input.
function searchWith(text: string, caret: number) {
  render(<EmojiPicker emojiData={data} />);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.change(input, { target: { value: text } });
  input.focus();
  input.setSelectionRange(caret, caret);
  return input;
}

// fireEvent returns false when the picker called preventDefault.
const press = (target: Element, key: string, modifiers = {}) =>
  fireEvent.keyDown(target, { key, ...modifiers });

describe('arrow keys in the search input', () => {
  it('leave the caret in the text while it can move', () => {
    const input = searchWith('cat', 1);
    expect(press(input, 'ArrowRight')).toBe(true);
    expect(press(input, 'ArrowLeft')).toBe(true);
    expect(input).toHaveFocus();
  });

  it('leave at the edge of the text', async () => {
    const input = searchWith('cat', 3);
    expect(press(input, 'ArrowRight')).toBe(false);
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        'data-epr-part',
        'skin-tone-button',
      ),
    );
  });

  it.each([
    ['Shift', { shiftKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
  ])('stay in the input with %s held', (_, modifier) => {
    const input = searchWith('cat', 3);
    // Shift+ArrowRight at the end, Shift+ArrowLeft at the start, and
    // Shift+Up/Down extend the selection; Ctrl/Alt move by word.
    expect(press(input, 'ArrowRight', modifier)).toBe(true);
    expect(press(input, 'ArrowDown', modifier)).toBe(true);
    input.setSelectionRange(0, 0);
    expect(press(input, 'ArrowLeft', modifier)).toBe(true);
    expect(press(input, 'ArrowUp', modifier)).toBe(true);
    expect(input).toHaveFocus();
  });
});

describe('arrow keys on the tone control', () => {
  it('ignore modified arrows', async () => {
    const input = searchWith('', 0);
    press(input, 'ArrowRight');
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        'data-epr-part',
        'skin-tone-button',
      ),
    );
    const tone = document.activeElement as HTMLElement;
    expect(press(tone, 'ArrowLeft', { shiftKey: true })).toBe(true);
    expect(press(tone, 'ArrowDown', { ctrlKey: true })).toBe(true);
    expect(tone).toHaveFocus();
    // Unmodified, the arrow still moves.
    expect(press(tone, 'ArrowLeft')).toBe(false);
  });
});
