import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, {
  EmojiStyle,
  Props,
  SkinTones,
  Theme
} from '../src';
import { Categories } from '../src/config/categoryConfig';
import {
  EmojiData,
  SkinTonePickerLocation,
  SuggestionMode
} from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set()
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People'
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature'
    },
    [Categories.SUGGESTED]: {
      category: Categories.SUGGESTED,
      name: 'Frequently Used'
    },
    [Categories.CUSTOM]: {
      category: Categories.CUSTOM,
      name: 'Custom Emojis'
    }
  },
  emojis: {
    [Categories.SUGGESTED]: [],
    [Categories.CUSTOM]: [],
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6'
      },
      { n: ['face', 'smiling face with smiling eyes'], u: '1f60a', a: '0.6' }
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }]
  }
};

const minimalCustomEmojis = [
  {
    names: ['Panda'],
    imgUrl: 'https://example.com/panda.png',
    id: 'panda'
  }
];

const renderPicker = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      {...props}
    />
  );
};

const findVisibleEmojiButton = async (label: string) => {
  const buttons = await screen.findAllByLabelText(label);
  return (
    buttons.find(button => !button.getAttribute('style')?.includes('opacity')) ??
    buttons[0]
  );
};

describe('EmojiPicker', () => {
  it('renders the search input and category navigation', async () => {
    renderPicker();

    expect(
      screen.getByLabelText('Type to search for an emoji')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', { name: 'Category navigation' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('tab', { name: 'Smileys & People' })
    ).toBeInTheDocument();
  });

  it('fires onEmojiClick when selecting an emoji', async () => {
    const onEmojiClick = vi.fn();
    renderPicker({ onEmojiClick });

    const emojiButton = await findVisibleEmojiButton('grinning face');
    await userEvent.click(emojiButton);

    expect(onEmojiClick).toHaveBeenCalled();
  });

  it('supports searching and clearing results', async () => {
    renderPicker();
    const input = screen.getByLabelText('Type to search for an emoji');

    await userEvent.type(input, 'grinning');

    expect(input).toHaveValue('grinning');
    const clearButton = screen.getByLabelText('Clear');

    await screen.findByRole('status');
    fireEvent.click(clearButton);
    expect(input).toHaveValue('');
  });

  it('renders reactions menu and fires reaction clicks', async () => {
    const onReactionClick = vi.fn();
    renderPicker({
      reactionsDefaultOpen: true,
      allowExpandReactions: false,
      onReactionClick
    });

    // Use accessible role query instead of brittle CSS selector
    const reactionsList = screen.getByRole('list', { name: /reactions/i });
    const reaction = await within(reactionsList).findByLabelText(
      'grinning face with big eyes'
    );
    await userEvent.click(reaction);

    expect(onReactionClick).toHaveBeenCalled();
  });

  it('allows selecting a skin tone and notifies change', async () => {
    const onSkinToneChange = vi.fn();
    renderPicker({ onSkinToneChange });

    const neutralTone = screen.getByLabelText('Skin tone NEUTRAL');
    await userEvent.click(neutralTone);

    const mediumTone = screen.getByLabelText('Skin tone MEDIUM');
    await userEvent.click(mediumTone);

    expect(onSkinToneChange).toHaveBeenCalledWith(SkinTones.MEDIUM);
  });

  it('hides search when searchDisabled is set', () => {
    renderPicker({ searchDisabled: true });

    expect(
      screen.queryByLabelText('Type to search for an emoji')
    ).not.toBeInTheDocument();
  });

  it('hides skin tones when skinTonesDisabled is set', () => {
    renderPicker({ skinTonesDisabled: true });

    expect(screen.queryByLabelText('Skin tone NEUTRAL')).toBeNull();
  });

  it.each([
    {
      label: 'default configuration',
      props: {}
    },
    {
      label: 'dark theme with custom sizing',
      props: { theme: Theme.DARK, width: 320, height: 420 }
    },
    {
      label: 'auto theme with preview hidden',
      props: { theme: Theme.AUTO, previewConfig: { showPreview: false } }
    },
    {
      label: 'search disabled',
      props: { searchDisabled: true }
    },
    {
      label: 'search in preview skin tone picker',
      props: { skinTonePickerLocation: SkinTonePickerLocation.PREVIEW }
    },
    {
      label: 'skin tones disabled with native emoji',
      props: { skinTonesDisabled: true, emojiStyle: EmojiStyle.NATIVE }
    },
    {
      label: 'lazy loaded recent suggestions',
      props: { lazyLoadEmojis: true, suggestedEmojisMode: SuggestionMode.RECENT }
    },
    {
      label: 'auto focus off with custom emojis',
      props: { autoFocusSearch: false, customEmojis: minimalCustomEmojis }
    },
    {
      label: 'custom categories and hidden preview',
      props: {
        categories: [
          {
            name: 'Smileys & People',
            category: Categories.SMILEYS_PEOPLE
          }
        ],
        previewConfig: { showPreview: false }
      }
    }
  ])('supports interactions for $label', async ({ props }) => {
    const onEmojiClick = vi.fn();
    renderPicker({ onEmojiClick, ...props });

    const searchInput = screen.queryByLabelText(
      'Type to search for an emoji'
    );
    if (searchInput) {
      await userEvent.type(searchInput, 'grinning');
      expect(searchInput).toHaveValue('grinning');
    }

    const emojiButton = await findVisibleEmojiButton('grinning face');
    await userEvent.click(emojiButton);

    expect(onEmojiClick).toHaveBeenCalled();

    if (searchInput) {
      await userEvent.clear(searchInput);
    }
  });
});
