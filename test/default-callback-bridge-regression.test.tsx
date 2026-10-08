import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { useMutableConfig } from '../src/config/mutableConfig';

vi.mock('../src/EmojiPickerReact', () => ({
  default: function Probe() {
    const config = useMutableConfig();
    return (
      <button
        onClick={() => {
          config.current.onSearchChange?.('cat');
          config.current.onReactionsModeChange?.(true);
        }}
      >
        Propose
      </button>
    );
  },
}));

it('forwards and refreshes both default-picker state callbacks', () => {
  const first = { onSearchChange: vi.fn(), onReactionsModeChange: vi.fn() };
  const second = { onSearchChange: vi.fn(), onReactionsModeChange: vi.fn() };
  const { rerender } = render(<EmojiPicker {...first} />);
  fireEvent.click(screen.getByRole('button'));
  expect(first.onSearchChange).toHaveBeenCalledWith('cat');
  expect(first.onReactionsModeChange).toHaveBeenCalledWith(true);
  rerender(<EmojiPicker {...second} />);
  fireEvent.click(screen.getByRole('button'));
  expect(second.onSearchChange).toHaveBeenCalledWith('cat');
  expect(second.onReactionsModeChange).toHaveBeenCalledWith(true);
  expect(first.onSearchChange).toHaveBeenCalledTimes(1);
});
