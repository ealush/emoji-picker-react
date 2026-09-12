import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
describe('custom emoji groups', () => {  it('renders one section and nav tab per group plus the shared bucket', async () => {
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
    expect(
      within(screen.getByRole('rowgroup', { name: 'Animals' })).getByLabelText(
        'panda',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowgroup', { name: 'People' })).getByLabelText(
        'ninja',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowgroup', { name: 'Misc' })).getByLabelText(
        'orphan',
      ),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('rowgroup', { name: 'Animals' }),
      ).queryByLabelText('ninja'),
    ).toBeNull();
  });

  it('auto-appends a section for groups missing from categories', async () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByRole('tab', { name: 'animals' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowgroup', { name: 'animals' })).getByLabelText(
        'panda',
      ),
    ).toBeInTheDocument();
  });

  it('hides tabs for groups with no members', () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis}
        categories={[
          { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'ghost', name: 'Ghost' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Ghost' })).toBeNull();
  });

  it('renders duplicate group entries once', () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals 2' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getAllByRole('heading', { name: 'Animals' })).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'Animals 2' })).toBeNull();
  });

  it('hides the ungrouped Custom tab when every custom is grouped', () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis.filter((emoji) => emoji.group)}
        autoFocusSearch={false}
      />,
    );

    expect(screen.queryByRole('tab', { name: 'Custom Emojis' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'animals' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'people' })).toBeInTheDocument();
  });

  it('respects categories as an allowlist: no CUSTOM, no appended groups', () => {
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customEmojis}
        categories={[
          { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.queryByRole('tab', { name: 'animals' })).toBeNull();
    expect(screen.queryByRole('rowgroup', { name: 'animals' })).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Smileys & People' }),
    ).toBeInTheDocument();
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

/**
 * Runtime prop replacement. Both `customEmojis` and `categories` are
 * immutable inputs: new references must rebuild every derived view, even
 * when array lengths are unchanged.
 */
describe('custom emoji group updates', () => {
  beforeEach(() => {
    // Suggested emojis persist across tests in this file via localStorage;
    // clicks in earlier tests would otherwise leak into search assertions.
    window.localStorage.clear();
  });

  const pandaAnimals = {
    names: ['Panda'],
    imgUrl: 'https://example.com/panda.png',
    id: 'panda',
    group: 'animals',
  };
  const ninjaPeople = {
    names: ['Ninja'],
    imgUrl: 'https://example.com/ninja.png',
    id: 'ninja',
    group: 'people',
  };

  it('A: replaces same-length custom data without remounting', async () => {
    const { rerender } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByRole('tab', { name: 'animals' })).toBeInTheDocument();

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[ninjaPeople]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.queryByRole('tab', { name: 'animals' })).toBeNull();
    expect(
      screen.queryByRole('rowgroup', { name: 'animals' }),
    ).toBeNull();
    expect(screen.getByRole('tab', { name: 'people' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowgroup', { name: 'people' })).getByLabelText(
        'ninja',
      ),
    ).toBeInTheDocument();

    const input = screen.getByLabelText('Type to search for an emoji');
    await userEvent.type(input, 'ninja');
    expect(await screen.findByLabelText('ninja')).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'panda');
    expect(screen.queryByLabelText('panda')).toBeNull();
  });

  it('B: replaces category presentation with the same emoji array', async () => {
    const customs = [pandaAnimals, ninjaPeople];
    const { rerender } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customs}
        categories={[
          {
            category: Categories.CUSTOM,
            group: 'animals',
            name: 'Animals',
            icon: <span data-testid="icon-v1">V1</span>,
          },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.getByTestId('icon-v1')).toBeInTheDocument();

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={customs}
        categories={[
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
          {
            category: Categories.CUSTOM,
            group: 'animals',
            name: 'Wildlife',
            icon: <span data-testid="icon-v2">V2</span>,
          },
        ]}
        autoFocusSearch={false}
      />,
    );

    const tabs = within(screen.getByRole('tablist'))
      .getAllByRole('tab')
      .map(tab => tab.getAttribute('aria-label'));
    expect(tabs).toEqual(['People', 'Wildlife']);
    const headings = screen.getAllByRole('heading').map(h => h.textContent);
    expect(headings).toEqual(['People', 'Wildlife']);
    expect(screen.queryByRole('tab', { name: 'Animals' })).toBeNull();
    expect(screen.getByTestId('icon-v2')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-v1')).toBeNull();
  });

  it('C: moves an emoji between groups keeping id and length', async () => {
    const { rerender } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(
      within(screen.getByRole('rowgroup', { name: 'Animals' })).getByLabelText(
        'panda',
      ),
    ).toBeInTheDocument();

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[{ ...pandaAnimals, group: 'people' }]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(
      within(screen.getByRole('rowgroup', { name: 'People' })).getByLabelText(
        'panda',
      ),
    ).toBeInTheDocument();
    // The emptied Animals section hides (display: none), dropping out of
    // the accessibility tree: panda is gone from Animals.
    expect(screen.queryByRole('rowgroup', { name: 'Animals' })).toBeNull();
  });

  it('D: moves an emoji between a group and the ungrouped bucket', async () => {
    // Smileys keeps two tabs visible so the nav bar itself renders.
    const categories = [
      { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
      { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
      { category: Categories.CUSTOM, name: 'Misc' },
    ];
    const { rerender } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals]}
        categories={categories}
        autoFocusSearch={false}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Misc' })).toBeNull();

    const ungrouped = { ...pandaAnimals };
    delete (ungrouped as Partial<typeof ungrouped>).group;
    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[ungrouped]}
        categories={categories}
        autoFocusSearch={false}
      />,
    );

    expect(screen.queryByRole('tab', { name: 'Animals' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Misc' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('rowgroup', { name: 'Misc' })).getByLabelText(
        'panda',
      ),
    ).toBeInTheDocument();
  });
});
