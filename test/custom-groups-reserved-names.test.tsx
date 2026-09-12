import { fireEvent, render, screen, within } from '@testing-library/react';
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
      { n: ['smiling face with smiling eyes'], u: '1f60a', a: '0.6' },
    ],
  },
};

const RESERVED = ['__proto__', 'constructor', 'toString'] as const;

function renderPicker(group: string, props: Partial<Props> = {}) {
  const id = emojiId(group);
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      customEmojis={[
        {
          names: [id],
          imgUrl: `https://example.com/${id}.png`,
          id,
          group,
        },
      ]}
      categories={[
        // Two entries so the navigation bar renders (it hides for one).
        { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        { category: Categories.CUSTOM, group, name: `Group ${group}` },
      ]}
      autoFocusSearch={false}
      {...props}
    />,
  );
}

function emojiId(group: string) {
  return `emoji-${group.replace(/[^a-z]/gi, '').toLowerCase() || 'x'}`;
}

/**
 * Group names are user-controlled strings and must behave as ordinary
 * data — including names inherited from Object.prototype.
 */
describe.each(RESERVED)('reserved group name %s', group => {
  it('renders section, tab, and emoji without crashing', async () => {
    const { container } = renderPicker(group);

    // No error-boundary fallback: the picker root stays mounted.
    expect(container.querySelector('.epr-main')).not.toBeNull();

    // Exactly one tab and one section.
    expect(
      screen.getByRole('tab', { name: `Group ${group}` }),
    ).toBeInTheDocument();
    const section = screen.getByRole('rowgroup', {
      name: `Group ${group}`,
    });
    expect(section).toBeInTheDocument();
  });

  it('places the emoji in its own section and navigates to it', async () => {
    renderPicker(group);
    const id = emojiId(group);

    const section = screen.getByRole('rowgroup', { name: `Group ${group}` });
    expect(
      within(section).getByLabelText(id),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: `Group ${group}` }));
    expect(
      within(screen.getByRole('rowgroup', { name: `Group ${group}` })).getByLabelText(
        id,
      ),
    ).toBeInTheDocument();
  });

  it('searches and clicks the emoji', async () => {
    const onEmojiClick = vi.fn();
    renderPicker(group, { onEmojiClick });
    const id = emojiId(group);

    const input = screen.getByLabelText('Type to search for an emoji');
    await userEvent.type(input, id);
    const matches = await screen.findAllByLabelText(id);
    expect(matches.length).toBeGreaterThan(0);

    await userEvent.clear(input);
    const section = screen.getByRole('rowgroup', { name: `Group ${group}` });
    fireEvent.click(within(section).getByLabelText(id));
    expect(onEmojiClick).toHaveBeenCalled();
    expect(onEmojiClick.mock.calls[0][0]).toMatchObject({
      unified: id,
      isCustom: true,
    });
  });
});
