import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../src';
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
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      // Must exist: the preview falls back to this emoji when idle.
      { n: ['smiling face with smiling eyes'], u: '1f60a', a: '0.6' },
    ],
  },
};

const customEmojis = [
  {
    names: ['Panda'],
    imgUrl: 'https://example.com/panda.png',
    id: 'panda',
    group: 'animals',
  },
  {
    names: ['Ninja'],
    imgUrl: 'https://example.com/ninja.png',
    id: 'ninja',
    group: 'people',
  },
  {
    names: ['Orphan'],
    imgUrl: 'https://example.com/orphan.png',
    id: 'orphan',
  },
];

const renderPicker = (props: Partial<Props> = {}) =>
  render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      customEmojis={customEmojis}
      categories={[
        { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
        { category: Categories.CUSTOM, group: 'people', name: 'People' },
        { category: Categories.CUSTOM, name: 'Misc' },
      ]}
      autoFocusSearch={false}
      {...props}
    />,
  );

/**
 * Grouped custom emojis (issues #510, #485, #447, #165, #379).
 * Each `{ category: CUSTOM, group }` entry renders its own section with
 * its own nav tab; ungrouped customs share the classic bucket.
 */
describe('custom emoji groups', () => {
  it('renders one section and nav tab per group plus the shared bucket', async () => {
    renderPicker();

    // Nav tabs.
    expect(screen.getByRole('tab', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Misc' })).toBeInTheDocument();

    // Sections.
    expect(
      screen.getByRole('heading', { name: 'Animals' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Misc' })).toBeInTheDocument();

    // Each emoji lives in exactly one section.
    const panda = await screen.findByLabelText('panda');
    const ninja = await screen.findByLabelText('ninja');
    const orphan = await screen.findByLabelText('orphan');
    expect(panda).toBeInTheDocument();
    expect(ninja).toBeInTheDocument();
    expect(orphan).toBeInTheDocument();
  });

  it('places group sections in categories order, interleaved with standard categories', () => {
    renderPicker();

    const headings = screen.getAllByRole('heading').map((h) => h.textContent);
    expect(headings).toEqual(['Smileys & People', 'Animals', 'People', 'Misc']);
  });

  it('renders a per-group custom icon', () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis}
        categories={[
          {
            category: Categories.CUSTOM,
            group: 'animals',
            name: 'Animals',
            icon: <span data-testid="animals-icon">A</span>,
          },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByTestId('animals-icon')).toBeInTheDocument();
  });

  it('finds grouped customs through search', async () => {
    renderPicker();
    const input = screen.getByLabelText('Type to search for an emoji');
    await userEvent.type(input, 'ninja');

    expect(await screen.findByLabelText('ninja')).toBeInTheDocument();
  });

  it('emits clicks for grouped customs', async () => {
    const onEmojiClick = vi.fn();
    renderPicker({ onEmojiClick });

    const panda = await screen.findByLabelText('panda');
    await userEvent.click(panda);

    expect(onEmojiClick).toHaveBeenCalled();
    expect(onEmojiClick.mock.calls[0][0]).toMatchObject({
      unified: 'panda',
      isCustom: true,
    });
  });

  it('keeps working with ungrouped customs only (back-compat)', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[
          {
            names: ['Panda'],
            imgUrl: 'https://example.com/panda.png',
            id: 'panda',
          },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(await screen.findAllByLabelText('panda')).not.toHaveLength(0);
    expect(
      within(screen.getByRole('tablist')).getAllByRole('tab'),
    ).not.toHaveLength(0);
  });
});
