// Other datasets and stored IDs disagree with ours on U+FE0F: `2764` and
// `2764-fe0f` are the same heart. Either spelling must reach the emoji.
import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { getEmojiByUnified } from '../src/data';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(cleanup);

// A dataset that spells the smiling face without FE0F.
const bareData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { u: '263a', n: ['smiling face'], a: '1' },
      { u: '1f600', n: ['grinning face'], a: '1' },
    ],
  },
};

// Cells and their glyphs both carry data-epr-unified: list each once.
const ids = (selector: string) => [
  ...new Set(
    Array.from(document.querySelectorAll(`${selector} [data-epr-unified]`)).map(
      (cell) => cell.getAttribute('data-epr-unified'),
    ),
  ),
];
const reactionIds = () => ids('[data-epr-part="reaction"]');
const suggestedIds = () => ids('[data-epr-category="suggested"]');
const rendered = (unified: string) =>
  !!document.querySelector(`[role="gridcell"][data-epr-unified="${unified}"]`);

describe('emoji IDs with or without U+FE0F', () => {
  it('the data API finds the record under either spelling', () => {
    expect(getEmojiByUnified('2764')?.unified).toBe('2764-fe0f');
    expect(getEmojiByUnified('2764-FE0F')?.unified).toBe('2764-fe0f');
    expect(
      getEmojiByUnified('263a-fe0f', { emojiData: bareData })?.unified,
    ).toBe('263a');
  });

  it('reactions resolve a bare ID to the dataset spelling', () => {
    render(<EmojiPicker reactionsDefaultOpen reactions={['2764', '1f44d']} />);
    expect(reactionIds()).toEqual(['2764-fe0f', '1f44d']);
  });

  it('suggestedEmojis resolve either spelling', () => {
    render(<EmojiPicker suggestedEmojis={['2764', '1f600']} />);
    expect(suggestedIds()).toEqual(['2764-fe0f', '1f600']);
    cleanup();
    render(
      <EmojiPicker emojiData={bareData} suggestedEmojis={['263a-fe0f']} />,
    );
    expect(suggestedIds()).toEqual(['263a']);
  });

  it('hiddenEmojis hide the emoji under either spelling', () => {
    render(<EmojiPicker hiddenEmojis={['2764']} />);
    expect(rendered('2764-fe0f')).toBe(false);
    cleanup();
    render(<EmojiPicker emojiData={bareData} hiddenEmojis={['263a-fe0f']} />);
    expect(rendered('263a')).toBe(false);
    expect(rendered('1f600')).toBe(true);
  });
});
