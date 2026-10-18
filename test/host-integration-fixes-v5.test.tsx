import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as Picker from '../src/primitives';
import enData from '../src/data/emojis-en.json';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

describe('emoji names', () => {
  // The dataset keeps keywords shortest first and the CLDR short name
  // last; aria-labels and the preview read the last entry.
  it.each([
    ['1f680', 'rocket'],
    ['1f609', 'winking face'],
    ['1f929', 'star struck'],
    ['1f610', 'neutral face'],
  ])('names %s "%s"', (unified, name) => {
    const record = Object.values(enData.emojis)
      .flat()
      .find((emoji) => emoji.u === unified);
    expect(record?.n.at(-1)).toBe(name);
  });

  it('announces the short name, not the longest keyword', () => {
    render(
      <Picker.Root emojiData={enData as Picker.EmojiData}>
        <Picker.Viewport style={{ height: 300 }}>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(
      screen.getAllByRole('gridcell', { name: 'winking face' }).length,
    ).toBeGreaterThan(0);
  });
});
