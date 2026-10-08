import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

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

describe('v5 controlled search robustness (STATE.md §1)', () => {
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
    rerender(
      <IgnoringPicker proposals={proposals} searchPlaceholder=" جلد" />,
    );
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
