import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import * as Picker from '../src/primitives';
import { Categories, EmojiData } from '../src/types/exposedTypes';

const data: EmojiData = {
  categories: {
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals',
    },
  },
  emojis: {
    [Categories.ANIMALS_NATURE]: [
      { u: '1f431', n: ['cat'], a: '1' },
      { u: '1f436', n: ['dog'], a: '1' },
    ],
  },
};

describe.each(['default', 'composed'])(
  '%s controlled search clearing',
  (entry) => {
    it.each(['Escape', 'Clear'])(
      'preserves the accepted input and filter after rejecting %s',
      async (action) => {
        const onSearchChange = vi.fn();
        const props = {
          emojiData: data,
          emojiStyle: EmojiStyle.NATIVE,
          autoFocusSearch: false,
          searchValue: 'cat',
          onSearchChange,
        };
        render(
          entry === 'default' ? (
            <EmojiPicker {...props} />
          ) : (
            <Picker.Root {...props}>
              <Picker.Search />
              <Picker.Viewport>
                <Picker.List />
              </Picker.Viewport>
            </Picker.Root>
          ),
        );
        const input = screen.getByRole('textbox');
        // Let initialization, requestAnimationFrame and debounced filtering finish.
        // Otherwise an unrelated pending render can mask the direct DOM mutation.
        await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
        expect(input).toHaveValue('cat');
        expect(
          screen.getByRole('gridcell', { name: 'cat' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('gridcell', { name: 'dog' })).toBeNull();
        act(() => input.focus());
        if (action === 'Escape') fireEvent.keyDown(input, { key: 'Escape' });
        else fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(onSearchChange).toHaveBeenCalledExactlyOnceWith('');
        expect(input).toHaveValue('cat');
        await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
        expect(input).toHaveValue('cat');
        expect(
          screen.getByRole('gridcell', { name: 'cat' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('gridcell', { name: 'dog' })).toBeNull();
        expect(document.activeElement).toBe(input);
      },
    );
  },
);
