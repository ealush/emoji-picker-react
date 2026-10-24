import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  preloadEmoji,
  preloadEmojiIfNeeded,
  preloadedEmojs,
} from '../../src/hooks/preloadEmoji';
import { EmojiStyle } from '../../src/types/exposedTypes';

const thumbsUp = {
  n: ['thumbs up'],
  u: '1f44d',
  a: '0.6',
  v: ['1f44d-1f3fb', '1f44d-1f3fc'],
};

describe('preloadEmoji', () => {
  afterEach(() => {
    preloadedEmojs.clear();
    vi.useRealTimers();
  });

  it('does not schedule timers for distant cells on repeated render passes', () => {
    vi.useFakeTimers();
    const url = vi.fn((id: string) => `/${id}.png`);
    for (let pass = 0; pass < 4; pass++) {
      for (let index = 0; index < 2000; index++) {
        preloadEmojiIfNeeded(
          thumbsUp,
          EmojiStyle.APPLE,
          0,
          300,
          10000,
          { top: index * 40 },
          { emojiSize: 40, emojisPerRow: 8, categoryHeight: 10000 },
          url,
          '1f44d',
        );
      }
    }
    expect(vi.getTimerCount()).toBe(0);
    expect(url).not.toHaveBeenCalled();
  });

  it('deduplicates nearby rendered-only preloads before scheduling work', () => {
    vi.useFakeTimers();
    const url = vi.fn((id: string) => `/${id}.png`);
    const preload = () =>
      preloadEmojiIfNeeded(
        thumbsUp,
        EmojiStyle.APPLE,
        0,
        300,
        0,
        { top: 320 },
        { emojiSize: 40, emojisPerRow: 8, categoryHeight: 1000 },
        url,
        '1f44d',
      );
    preload();
    vi.runAllTimers();
    preload();
    expect(vi.getTimerCount()).toBe(0);
    expect(url).toHaveBeenCalledTimes(1);
  });

  it('requests the emoji and each skin-tone variation', () => {
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE);
    expect(getEmojiUrl.mock.calls.map(([unified]) => unified)).toEqual([
      '1f44d-1f3fb',
      '1f44d-1f3fc',
      '1f44d',
    ]);
  });

  it('requests only the rendered image when variations are off', () => {
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d');
    // With an active skin tone the cell renders that tone's image.
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d-1f3fc');
    expect(getEmojiUrl.mock.calls.map(([unified]) => unified)).toEqual([
      '1f44d',
      '1f44d-1f3fc',
    ]);
  });

  it('still requests the variations after a base-only preload', () => {
    // The cache is page-wide: another picker, or this one after the prop
    // flips, must not inherit a base-only preload as a full one.
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d');
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d');
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE);
    expect(getEmojiUrl.mock.calls.map(([unified]) => unified)).toEqual([
      '1f44d',
      '1f44d-1f3fb',
      '1f44d-1f3fc',
      '1f44d',
    ]);
  });

  it('skips a base-only preload after a full one', () => {
    const getEmojiUrl = vi.fn((unified: string) => `/${unified}.png`);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE);
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d');
    preloadEmoji(getEmojiUrl, thumbsUp, EmojiStyle.APPLE, '1f44d-1f3fc');
    expect(getEmojiUrl).toHaveBeenCalledTimes(3);
  });
});
