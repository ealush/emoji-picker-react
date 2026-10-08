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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isUnified(value: string): boolean {
  return value
    .split('-')
    .every(
      (hex) => /^[\da-f]{1,6}$/i.test(hex) && parseInt(hex, 16) <= 0x10ffff,
    );
}

function hasValidEncoding(value: Record<string, unknown>): boolean {
  if (value.imgUrl !== undefined) return typeof value.imgUrl === 'string';
  return (
    typeof value.u === 'string' &&
    isUnified(value.u) &&
    (value.v === undefined ||
      (isStringArray(value.v) && value.v.every(isUnified)))
  );
}

function isEmoji(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.u === 'string' &&
    !!value.u &&
    isStringArray(value.n) &&
    value.n.length > 0 &&
    typeof value.a === 'string' &&
    hasValidEncoding(value)
  );
}

function isEmojiGroup(value: unknown): boolean {
  return Array.isArray(value) && value.every(isEmoji);
}

function isCategory(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.category === 'string' &&
    typeof value.name === 'string'
  );
}

function normalize(result: EmojiData | { default: EmojiData }): EmojiData {
  const data =
    isRecord(result) && 'default' in result ? result.default : result;
  if (
    !isRecord(data) ||
    !isRecord(data.categories) ||
    !isRecord(data.emojis) ||
    !Object.values(data.emojis).every(isEmojiGroup) ||
    !Object.values(data.categories).every(isCategory)
  ) {
    throw new Error(
      '[emoji-picker-react] emojiData loader must resolve an EmojiData dataset or { default: EmojiData }.',
    );
  }
  return data as EmojiData;
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
export function useResolvedEmojiData(
  input?: EmojiDataInput,
  enabled = true,
): Resolved {
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
    if (!needsLoad || !enabled) {
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
  }, [input, needsLoad, attempt, enabled]);

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
