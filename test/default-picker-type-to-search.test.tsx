import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker, { Categories } from '../src';

const emojiData = {
  categories: {},
  emojis: {
    [Categories.ANIMALS_NATURE]: [
      { u: '1f431', n: ['cat'], a: '1' },
      { u: '1f426', n: ['bird'], a: '1' },
      { u: '1f987', n: ['bat'], a: '1' },
    ],
  },
};

function renderPicker() {
  const { container } = render(
    <EmojiPicker
      emojiData={emojiData}
      categories={[Categories.ANIMALS_NATURE]}
      autoFocusSearch={false}
      emojiVersion="15.0"
    />,
  );
  const input = screen.getByRole('textbox');
  const cat = () =>
    container.querySelector<HTMLButtonElement>(
      'button[data-epr-unified="1f431"]',
    )!;
  const bird = () =>
    container.querySelector<HTMLButtonElement>(
      'button[data-epr-unified="1f426"]',
    );
  const bat = () =>
    container.querySelector<HTMLButtonElement>(
      'button[data-epr-unified="1f987"]',
    );
  return { input, cat, bird, bat };
}

describe('default picker type-to-search integration', () => {
  it('inserts the grid key into Search and continues ordinary input typing', async () => {
    const user = userEvent.setup();
    const { input, cat, bird, bat } = renderPicker();
    cat().focus();
    await user.keyboard('c');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('c');
    await waitFor(() => expect(bird()).toBeNull());
    expect(cat()).not.toBeNull();
    await user.keyboard('at');
    expect(input).toHaveValue('cat');
    // Let the accepted-query debounce settle before checking results;
    // stale "ca" results would otherwise also satisfy these assertions.
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(cat()).not.toBeNull();
    expect(bird()).toBeNull();
    expect(bat()).toBeNull();
  });

  it('appends to text entered directly into Search when focus returns to the grid', async () => {
    const user = userEvent.setup();
    const { input, cat, bird, bat } = renderPicker();
    await user.type(input, 'ca');
    await waitFor(() => expect(bird()).toBeNull());
    cat().focus();
    await user.keyboard('t');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('cat');
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(cat()).not.toBeNull();
    expect(bird()).toBeNull();
    expect(bat()).toBeNull();
  });
});
