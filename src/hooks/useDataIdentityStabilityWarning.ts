/* global process: readonly */
import * as React from 'react';

import type { CustomEmoji } from '../config/customEmojiConfig';
import defaultEmojiData from '../data/emojis';
import type { EmojiData } from '../types/exposedTypes';

interface IdentityTracker {
  prev: unknown;
  consecutiveChanges: number;
  warned: boolean;
}

function trackIdentity(
  tracker: IdentityTracker,
  value: unknown,
  isDefault: boolean,
  message: string,
): void {
  if (isDefault) {
    tracker.prev = value;
    tracker.consecutiveChanges = 0;
    return;
  }
  if (tracker.prev !== undefined && tracker.prev !== value) {
    tracker.consecutiveChanges += 1;
  } else if (tracker.prev === value) {
    tracker.consecutiveChanges = 0;
  }
  tracker.prev = value;
  if (tracker.consecutiveChanges >= 3 && !tracker.warned) {
    tracker.warned = true;
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}

function freshTracker(): IdentityTracker {
  return { prev: undefined, consecutiveChanges: 0, warned: false };
}

/**
 * Dev-only diagnostic per docs/v5/PERFORMANCE.md §2.
 *
 * Identity caching only helps when callers keep data props referentially
 * stable. If a non-default `emojiData` (or `customEmojis`) changes identity
 * on three consecutive committed renders, warn once that repeated identity
 * churn defeats prepared-data caching. Behavior stays correct; this is
 * diagnostic only. A single/occasional replacement (e.g. locale change)
 * must not warn. No deep-compare or clone is performed.
 */
export function useDataIdentityStabilityWarning(
  emojiData: EmojiData | undefined,
  customEmojis: CustomEmoji[] | undefined,
): void {
  const emojiState = React.useRef<IdentityTracker>(freshTracker());
  const customState = React.useRef<IdentityTracker>(freshTracker());

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    trackIdentity(
      emojiState.current,
      emojiData,
      !emojiData || emojiData === (defaultEmojiData as unknown as EmojiData),
      '[emoji-picker-react] `emojiData` changed identity on three consecutive renders. ' +
        'Memoize/reuse the dataset object so the prepared-data cache can be shared. ' +
        'Behavior remains correct; caching is only defeated by identity churn.',
    );
    trackIdentity(
      customState.current,
      customEmojis,
      !customEmojis || customEmojis.length === 0,
      '[emoji-picker-react] `customEmojis` changed identity on three consecutive renders. ' +
        'Memoize/reuse the array so custom-emoji derivation can be cached. ' +
        'Behavior remains correct; caching is only defeated by identity churn.',
    );
  });
}
