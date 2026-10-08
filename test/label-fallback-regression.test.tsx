import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories, EmojiData } from '../src/types/exposedTypes';

const data: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { u: '1f600', n: ['cat smile'], a: '1' },
      { u: '1f603', n: ['cat grin'], a: '1' },
    ],
  },
};

describe('undefined localization overrides', () => {
  it('keeps the default picker mounted when multiple results use an undefined label', async () => {
    render(
      <EmojiPicker
        emojiData={data}
        emojiStyle={EmojiStyle.NATIVE}
        autoFocusSearch={false}
        labels={{ searchResultsMany: undefined }}
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'cat' },
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
    expect(screen.getByRole('textbox')).toHaveValue('cat');
    expect(screen.getByText(/^2 results found/)).toBeInTheDocument();
  });
});
