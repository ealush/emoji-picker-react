import { afterEach, describe, expect, it, vi } from 'vitest';

import { preloadEmoji, preloadedEmojs } from '../../src/hooks/preloadEmoji';
import { EmojiStyle } from '../../src/types/exposedTypes';

const thumbsUp = {
  n: ['thumbs up'],
  u: '1f44d',
  a: '0.6',
  v: ['1f44d-1f3fb', '1f44d-1f3fc'],
};

describe('preloadEmoji', () => {
  afterEach(() => preloadedEmojs.clear());

  it('requests the emoji and each skin-tone variation', () => {
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE);
    expect(getEmojiUrl.mock.calls.map(([unified]) => unified)).toEqual([
      '1f44d-1f3fb',
      '1f44d-1f3fc',
      '1f44d',
    ]);
  });

  it('requests only the emoji when variations are off', () => {
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, false);
    expect(getEmojiUrl.mock.calls.map(([unified]) => unified)).toEqual([
      '1f44d',
    ]);
  });
});
