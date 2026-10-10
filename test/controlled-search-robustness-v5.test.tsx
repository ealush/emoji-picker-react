import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
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
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['smile', 'smiling face'], u: '1f604', a: '0.6' },
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
    [Categories.ANIMALS_NATURE]: [
      { n: ['cat', 'cat face'], u: '1f431', a: '0.6' },
    ],
  },
};

function AcceptingPicker({ proposals }: { proposals: string[] }) {
  const [value, setValue] = React.useState('');
  return (
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      searchValue={value}
      onSearchChange={(next) => {
        proposals.push(next);
        setValue(next);
      }}
    />
  );
}

function IgnoringPicker({
  proposals,
  searchPlaceholder,
}: {
  proposals: string[];
  searchPlaceholder?: string;
}) {
  return (
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      searchValue=""
      searchPlaceholder={searchPlaceholder}
      onSearchChange={(next) => {
        proposals.push(next);
      }}
    />
  );
}

async function settle(ms = 250) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

afterEach(() => vi.useRealTimers());

describe('v5 controlled search robustness', () => {
  it.each([5, 50, 150])(
    'preserves sequential typing with %ims gaps and a delayed parent',
    async (delay) => {
      const proposals: string[] = [];
      function DelayedPicker() {
        const [value, setValue] = React.useState('');
        return (
          <EmojiPicker
            emojiData={minimalEmojiData}
            emojiVersion="1"
            autoFocusSearch={false}
            searchValue={value}
            onSearchChange={(next) => {
              proposals.push(next);
              setTimeout(() => setValue(next), 500);
            }}
          />
        );
      }
      render(<DelayedPicker />);
      const input = screen.getByRole('textbox');
      const user = userEvent.setup({
        delay,
      });
      await user.type(input, 'cat');
      expect(proposals).toEqual(['c', 'ca', 'cat']);
      expect(input).toHaveValue('cat');
      await settle(600);
      expect(input).toHaveValue('cat');
    },
  );

  it('keeps a rejected draft for 500ms after the last edit and never filters it', async () => {
    vi.useFakeTimers();
    const proposals: string[] = [];
    render(<IgnoringPicker proposals={proposals} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    for (const key of 'cat') {
      fireEvent.change(input, { target: { value: input.value + key } });
      if (key !== 't') await act(() => vi.advanceTimersByTimeAsync(150));
    }
    expect(proposals).toEqual(['c', 'ca', 'cat']);
    expect(input).toHaveValue('cat');
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(input).toHaveValue('cat');
    expect(document.querySelector('[data-epr-part="root"]')).not.toHaveClass(
      'epr-search-active',
    );
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(input).toHaveValue('');
  });

  it('synchronizes transformed and external accepted values during a draft', async () => {
    const proposals: string[] = [];
    function TransformingPicker() {
      const [value, setValue] = React.useState('');
      return (
        <>
          <button onClick={() => setValue('dog')}>External search</button>
          <EmojiPicker
            emojiData={minimalEmojiData}
            emojiVersion="1"
            autoFocusSearch={false}
            searchValue={value}
            onSearchChange={(next) => {
              proposals.push(next);
              setValue(next.toUpperCase());
            }}
          />
        </>
      );
    }
    render(<TransformingPicker />);
    const input = screen.getByRole('textbox');
    const user = userEvent.setup({});
    await user.type(input, 'cat');
    expect(proposals).toEqual(['c', 'Ca', 'CAt']);
    expect(input).toHaveValue('CAT');
    await user.click(screen.getByRole('button', { name: 'External search' }));
    expect(input).toHaveValue('dog');
    await settle(600);
    expect(input).toHaveValue('dog');
    expect(proposals).toHaveLength(3);
  });

  it('continues sequential typing after grid-to-search focus with a delayed parent', async () => {
    const proposals: string[] = [];
    function DelayedPicker() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={minimalEmojiData}
          emojiVersion="1"
          autoFocusSearch={false}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setTimeout(() => setValue(next), 500);
          }}
        />
      );
    }
    render(<DelayedPicker />);
    const input = screen.getByRole('textbox');
    const cell = await screen.findByRole('gridcell', { name: 'grinning face' });
    act(() => cell.focus());
    const user = userEvent.setup({
      delay: 150,
    });
    await user.keyboard('cat');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('cat');
    expect(proposals).toEqual(['c', 'ca', 'cat']);
    await settle(600);
    expect(input).toHaveValue('cat');
  });

  it('accumulates a machine-speed burst without losing characters', async () => {
    const proposals: string[] = [];
    render(<AcceptingPicker proposals={proposals} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    // Back-to-back edits with no awaiting between them: each proposal must
    // build on the previous one, never on a lagging accepted value.
    fireEvent.change(input, { target: { value: 's' } });
    fireEvent.change(input, { target: { value: 'sm' } });
    fireEvent.change(input, { target: { value: 'smi' } });
    fireEvent.change(input, { target: { value: 'smil' } });
    fireEvent.change(input, { target: { value: 'smile' } });

    expect(proposals).toEqual(['s', 'sm', 'smi', 'smil', 'smile']);
    expect(input.value).toBe('smile');
  });

  it('never resurrects a reconciled proposal on an unrelated rerender', async () => {
    const proposals: string[] = [];
    const { rerender } = render(<IgnoringPicker proposals={proposals} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'z' } });
    expect(proposals).toEqual(['z']);

    // The rejected proposal reconciles back to the accepted prop.
    await vi.waitFor(() => {
      expect(input.value).toBe('');
    });

    // An unrelated rerender must not bring the dead proposal back: React
    // state and the DOM must agree after reconciliation.
    rerender(<IgnoringPicker proposals={proposals} searchPlaceholder=" جلد" />);
    await settle(150);
    expect(input.value).toBe('');
  });

  it('shows an initial controlled searchValue on first paint', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        searchValue="heart"
        onSearchChange={() => {}}
      />,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    expect(input.value).toBe('heart');
  });
});
