import { describe, expect, it } from 'vitest';

import { compareConfig } from '../../src/config/compareConfig';
import { mergeCategoriesConfig } from '../../src/config/categoryConfig';
import type { PickerConfig } from '../../src/config/config';
import { Categories } from '../../src/types/exposedTypes';

const baseProps: PickerConfig = {};

function withCustomEmojis(ids: { id: string; group?: string }[]) {
  return {
    ...baseProps,
    customEmojis: ids.map(entry => ({
      names: [entry.id],
      imgUrl: `https://example.com/${entry.id}.png`,
      id: entry.id,
      ...(entry.group ? { group: entry.group } : {}),
    })),
  };
}

/**
 * Configuration comparison and merging must model `categories` and
 * `customEmojis` contents — not just array lengths — otherwise prop
 * updates leave the picker rendering stale groups.
 */
describe('compareConfig', () => {
  it('treats same-length custom emoji arrays with different content as different', () => {
    const prev = withCustomEmojis([{ id: 'panda', group: 'animals' }]);
    const next = withCustomEmojis([{ id: 'ninja', group: 'people' }]);

    expect(compareConfig(prev, next)).toBe(false);
  });

  it('treats regrouped emojis with identical ids as different', () => {
    const prev = withCustomEmojis([{ id: 'panda', group: 'animals' }]);
    const next = withCustomEmojis([{ id: 'panda', group: 'people' }]);

    expect(compareConfig(prev, next)).toBe(false);
  });

  it('treats different categories references as different', () => {
    const prev: PickerConfig = {
      ...baseProps,
      categories: [{ category: Categories.CUSTOM, name: 'A' }],
    };
    const next: PickerConfig = {
      ...baseProps,
      categories: [{ category: Categories.CUSTOM, name: 'B' }],
    };

    expect(compareConfig(prev, next)).toBe(false);
  });

  it('treats reordered categories as different', () => {
    const prev: PickerConfig = {
      ...baseProps,
      categories: [Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE],
    };
    const next: PickerConfig = {
      ...baseProps,
      categories: [Categories.ANIMALS_NATURE, Categories.SMILEYS_PEOPLE],
    };

    expect(compareConfig(prev, next)).toBe(false);
  });

  it('treats reused immutable references as equivalent', () => {
    const customEmojis = [{ id: 'panda', group: 'animals' }];
    const customs = customEmojis.map(entry => ({
      names: [entry.id],
      imgUrl: `https://example.com/${entry.id}.png`,
      id: entry.id,
      group: entry.group,
    }));
    const categories = [
      { category: Categories.CUSTOM, name: 'A' },
    ] as PickerConfig['categories'];
    const prev: PickerConfig = {
      ...baseProps,
      customEmojis: customs,
      categories,
    };
    const next: PickerConfig = {
      ...baseProps,
      customEmojis: customs,
      categories,
    };

    expect(compareConfig(prev, next)).toBe(true);
  });

  it('ignores callback-only changes', () => {
    const prev: PickerConfig = {
      ...baseProps,
      onEmojiClick: () => {},
    };
    const next: PickerConfig = {
      ...baseProps,
      onEmojiClick: () => {},
    };

    expect(compareConfig(prev, next)).toBe(true);
  });
});

describe('mergeCategoriesConfig group appending', () => {
  const customs = (groups: (string | undefined)[]) =>
    groups.map((group, index) => ({
      names: [`emoji-${index}`],
      imgUrl: `https://example.com/${index}.png`,
      id: `emoji-${index}`,
      ...(group ? { group } : {}),
    }));

  it('changes appended groups when same-length input switches groups', () => {
    const fromAnimals = mergeCategoriesConfig([], {}, undefined, customs([
      'animals',
    ]));
    const fromPeople = mergeCategoriesConfig([], {}, undefined, customs([
      'people',
    ]));

    expect(
      fromAnimals.map(entry => `${entry.category}:${entry.name}`),
    ).toContain('custom:animals');
    expect(
      fromPeople.map(entry => `${entry.category}:${entry.name}`),
    ).toContain('custom:people');
    expect(
      fromPeople.map(entry => `${entry.category}:${entry.name}`),
    ).not.toContain('custom:animals');
  });

  it('keeps ordering, allowlist, and empty-group behavior', () => {
    const merged = mergeCategoriesConfig(
      [
        { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
        { category: Categories.CUSTOM, group: 'b', name: 'B' },
        { category: Categories.CUSTOM, group: 'a', name: 'A' },
      ],
      {},
      undefined,
      customs(['a', 'b']),
    );

    expect(merged.map(entry => entry.name)).toEqual([
      'Smileys & People',
      'B',
      'A',
    ]);
  });
});
