import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker, { Categories, EmojiStyle } from '../src';
import { EmojiData } from '../src/types/exposedTypes';

const english: EmojiData = {
  categories: {
    smileys_people: { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
    animals_nature: { category: Categories.ANIMALS_NATURE, name: 'Animals & Nature' },
  },
  emojis: {
    smileys_people: [{ n: ['grinning face'], u: '1f600', a: '1' }],
    animals_nature: [{ n: ['cat face'], u: '1f431', a: '0.6' }],
  },
};

const spanish: EmojiData = {
  categories: {
    smileys_people: { category: Categories.SMILEYS_PEOPLE, name: 'Caritas y personas' },
    animals_nature: { category: Categories.ANIMALS_NATURE, name: 'Animales y naturaleza' },
  },
  emojis: english.emojis,
};

const explicitCategories = [Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE];

describe('configuration normalization', () => {
  it('hiddenEmojis matches dataset ids case-insensitively and ignores whitespace', () => {
    render(
      <EmojiPicker
        emojiData={english}
        emojiStyle={EmojiStyle.NATIVE}
        hiddenEmojis={['1F600', ' 1f431 ']}
      />,
    );
    expect(document.querySelector('[data-epr-unified="1f600"]')).toBeNull();
    expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
  });

  it('a localized picker with explicit categories does not rename a later default picker', () => {
    const first = render(
      <EmojiPicker
        emojiData={spanish}
        emojiStyle={EmojiStyle.NATIVE}
        categories={explicitCategories}
      />,
    );
    expect(screen.getByRole('rowgroup', { name: 'Caritas y personas' })).toBeTruthy();
    first.unmount();

    // No emojiData: the bundled dataset and the built-in category names.
    render(<EmojiPicker emojiStyle={EmojiStyle.NATIVE} categories={explicitCategories} />);
    expect(screen.getByRole('rowgroup', { name: 'Smileys & People' })).toBeTruthy();
    expect(screen.queryByRole('rowgroup', { name: 'Caritas y personas' })).toBeNull();
  });

  it('a "recent" picker does not rename the Suggested tab of a later "frequent" picker', () => {
    const categories = [Categories.SUGGESTED, Categories.SMILEYS_PEOPLE];
    const first = render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojisMode="recent"
        categories={categories}
      />,
    );
    // The section itself is hidden without stored recents; the tab is not.
    expect(screen.getByRole('tab', { name: 'Recently Used' })).toBeTruthy();
    first.unmount();

    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojisMode="frequent"
        categories={categories}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Frequently Used' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: 'Recently Used' })).toBeNull();
  });

  it('an explicit category entry with its own name does not leak into later pickers', () => {
    const first = render(
      <EmojiPicker
        emojiData={english}
        emojiStyle={EmojiStyle.NATIVE}
        categories={[{ category: Categories.SMILEYS_PEOPLE, name: 'Faces' }]}
      />,
    );
    expect(screen.getByRole('rowgroup', { name: 'Faces' })).toBeTruthy();
    first.unmount();

    render(
      <EmojiPicker
        emojiData={english}
        emojiStyle={EmojiStyle.NATIVE}
        categories={[Categories.SMILEYS_PEOPLE]}
      />,
    );
    expect(screen.getByRole('rowgroup', { name: 'Smileys & People' })).toBeTruthy();
  });
});
