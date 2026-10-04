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
export type EmojiDataLoaderOptions = { signal?: AbortSignal };
export type EmojiDataLoader = (
  options: EmojiDataLoaderOptions,
) => Promise<EmojiData | { default: EmojiData }>;

export type EmojiDataInput = EmojiData | EmojiDataLoader;

export type EmojiDataState = {
  loading: boolean;
  error: Error | null;
  retry: () => void;
};
type Resolved = EmojiDataState & { data: EmojiData | undefined };

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
    error: Error | null;
    attempt: number;
  } | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const retry = React.useCallback(() => setAttempt((value) => value + 1), []);

  React.useEffect(() => {
    if (!needsLoad) {
      return;
    }
    let cancelled = false;
    const controller =
      typeof AbortController === 'undefined'
        ? undefined
        : new AbortController();
    // Invoke immediately, preserving the loader contract, and convert
    // synchronous exceptions into the same recoverable failure state.
    let load: Promise<EmojiData>;
    try {
      load =
        typeof input === 'function'
          ? Promise.resolve(input({ signal: controller?.signal })).then(
              normalize,
            )
          : loadDefaultEmojiData();
    } catch (error) {
      load = Promise.reject(error);
    }
    load.then(
      (data) => {
        if (!cancelled) {
          setLoaded({ source: input, data, error: null, attempt });
        }
      },
      (error) => {
        if (!cancelled) {
          setLoaded({
            source: input,
            data: EMPTY_EMOJI_DATA,
            attempt,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      },
    );
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [input, needsLoad, attempt]);

  return React.useMemo(() => {
    if (!needsLoad) {
      return {
        data: input as EmojiData | undefined,
        loading: false,
        error: null,
        retry,
      };
    }
    if (loaded && loaded.source === input && loaded.attempt === attempt) {
      return { data: loaded.data, loading: false, error: loaded.error, retry };
    }
    return { data: EMPTY_EMOJI_DATA, loading: true, error: null, retry };
  }, [input, needsLoad, loaded, attempt, retry]);
}

const DataLoadingContext = /* @__PURE__ */ React.createContext<EmojiDataState>({
  loading: false,
  error: null,
  retry: () => {},
});

export const DataLoadingProvider = DataLoadingContext.Provider;

export function useIsEmojiDataLoading(): boolean {
  return React.useContext(DataLoadingContext).loading;
}

export function useEmojiDataState(): EmojiDataState {
  return React.useContext(DataLoadingContext);
}
