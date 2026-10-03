import * as React from 'react';

import {
  EMPTY_EMOJI_DATA,
  getRegisteredDefaultEmojiData,
  loadDefaultEmojiData,
} from '../data/defaultEmojiData';
import type { EmojiData } from '../types/exposedTypes';

/**
 * Asynchronous dataset source, e.g.
 * `() => import('emoji-picker-react/data/emojis-fr')`.
 * Hoist it (module scope or useCallback): a new function identity loads
 * again.
 */
export type EmojiDataLoader = () => Promise<EmojiData | { default: EmojiData }>;

export type EmojiDataInput = EmojiData | EmojiDataLoader;

type Resolved = { data: EmojiData | undefined; loading: boolean };

function normalize(result: EmojiData | { default: EmojiData }): EmojiData {
  return 'default' in result && result.default
    ? result.default
    : (result as EmojiData);
}

/**
 * Resolve Root's `emojiData` input to a synchronous dataset:
 * - an object is used as-is (synchronous, SSR-safe);
 * - a loader is awaited (Root renders empty, `Loading` shows meanwhile);
 * - absent: the registered default dataset when an entry registered it
 *   (the default picker always does), otherwise the bundled English
 *   dataset is loaded on demand (a separate chunk in ESM builds).
 * `data: undefined` means "the registered default".
 */
export function useResolvedEmojiData(input?: EmojiDataInput): Resolved {
  const needsLoad =
    typeof input === 'function' ||
    (input === undefined && getRegisteredDefaultEmojiData() === null);

  const [loaded, setLoaded] = React.useState<{
    source: EmojiDataInput | undefined;
    data: EmojiData;
  } | null>(null);

  React.useEffect(() => {
    if (!needsLoad) {
      return;
    }
    let cancelled = false;
    const load =
      typeof input === 'function'
        ? input().then(normalize)
        : loadDefaultEmojiData();
    load.then(
      (data) => {
        if (!cancelled) {
          setLoaded({ source: input, data });
        }
      },
      (error) => {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error('[emoji-picker-react] emojiData failed to load', error);
          setLoaded({ source: input, data: EMPTY_EMOJI_DATA });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [input, needsLoad]);

  if (!needsLoad) {
    return { data: input as EmojiData | undefined, loading: false };
  }
  if (loaded && loaded.source === input) {
    return {
      data: typeof input === 'function' ? loaded.data : undefined,
      loading: false,
    };
  }
  return { data: EMPTY_EMOJI_DATA, loading: true };
}

const DataLoadingContext = React.createContext(false);

export const DataLoadingProvider = DataLoadingContext.Provider;

export function useIsEmojiDataLoading(): boolean {
  return React.useContext(DataLoadingContext);
}
