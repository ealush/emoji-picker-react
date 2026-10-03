import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { getPickerDataSnapshot } from '../src/data-core/pickerData';
import { getPreparedCore } from '../src/data-core/prepare';
import { searchEmojis } from '../src/data-core/search';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

function datasetWith(tag: string): EmojiData {
  return {
    categories: {
      [Categories.SMILEYS_PEOPLE]: {
        category: Categories.SMILEYS_PEOPLE,
        name: 'Smileys & People',
      },
    },
    emojis: {
      [Categories.SMILEYS_PEOPLE]: [
        { n: [tag, 'grinning face'], u: '1f600', a: '1' },
      ],
    },
  };
}

describe('v5 shared search caches', () => {
  it('never writes per-query results into the shared data snapshot', async () => {
    const dataset = datasetWith('leakprobe');
    const snapshot = getPickerDataSnapshot(dataset, undefined);
    // Fail closed: any write into shared snapshot state throws.
    Object.freeze(snapshot);
    for (const value of Object.values(snapshot)) {
      if (value && typeof value === 'object') {
        Object.freeze(value);
      }
    }

    const { unmount } = render(
      <EmojiPicker emojiData={dataset} emojiStyle={EmojiStyle.NATIVE} />,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    for (const query of [
      'leakprobe',
      'leakprob',
      'leakpro',
      'leakpr',
      'leakp',
    ]) {
      fireEvent.change(input, { target: { value: query } });
    }
    unmount();

    // Same cached snapshot, structurally incapable of holding queries.
    expect(getPickerDataSnapshot(dataset, undefined)).toBe(snapshot);
    expect('searchIndex' in snapshot).toBe(false);
  });

  it('bounds the shared query memo with eviction of oldest entries', () => {
    const dataset = datasetWith('memoprobe');
    const core = getPreparedCore(dataset);

    for (let i = 0; i < 600; i += 1) {
      searchEmojis(`memoprobe-query-${i}`, { emojiData: dataset });
    }

    expect(core.queryMemo.size).toBeLessThanOrEqual(500);
    // The most recent query survives eviction.
    expect(core.queryMemo.has('memoprobe-query-599')).toBe(true);
  });
});
