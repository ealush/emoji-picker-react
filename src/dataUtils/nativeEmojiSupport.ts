import { isJsdom } from '../DomUtils/isJsdom';

import { createNativeEmojiSequenceSupport } from './nativeEmojiSequenceSupport';

// Native emoji support detection.
//
// The native emoji style renders with the platform's emoji font, which lags
// behind the dataset: an emoji newer than the OS font draws as a blank box
// ("tofu") or decomposes into several glyphs, and Windows has no country
// flag glyphs at all. The picker probes the platform on the client and
// refreshes after emoji font changes or loading. SSR output is unaffected;
// detected unsupported glyphs are hidden.
//
// Every rendered sequence is checked in cached pixel batches, including
// skin tones and flag tags. One version sample cannot prove font coverage.

export const DEFAULT_NATIVE_EMOJI_FONT =
  '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji"';

const BASELINE_EMOJI = '\u{1F600}'; // grinning face (Emoji 1.0)

export type NativeEmojiSupport = Partial<
  ReturnType<typeof createNativeEmojiSequenceSupport>
>;

export const UNKNOWN_SUPPORT: NativeEmojiSupport = {};

let cache = new WeakMap<Document, Map<string, NativeEmojiSupport>>();

export function detectNativeEmojiSupport(
  fontFamily: string = DEFAULT_NATIVE_EMOJI_FONT,
  refresh = false,
  ownerDocument: Document | undefined = typeof document === 'undefined'
    ? undefined
    : document,
): NativeEmojiSupport {
  if (!ownerDocument) return UNKNOWN_SUPPORT;
  const fonts =
    cache.get(ownerDocument) || new Map<string, NativeEmojiSupport>();
  cache.set(ownerDocument, fonts);
  if (refresh) fonts.delete(fontFamily);
  const cached = fonts.get(fontFamily);
  if (cached) {
    return cached;
  }
  const result = probe(fontFamily, ownerDocument);
  // Bound retained font caches even when an application switches themes
  // through many dynamically named families. Mounted Roots retain theirs.
  if (fonts.size >= 16) fonts.clear();
  fonts.set(fontFamily, result);
  return result;
}

export function isNativeEmojiSupported(
  support: NativeEmojiSupport | null,
  unified: string,
): boolean {
  return support?.supports?.(unified) !== false;
}

/** Test-only: forget cached probe results. */
export function __resetNativeEmojiSupportForTest(): void {
  cache = new WeakMap();
}

function probe(
  fontFamily: string,
  ownerDocument: Document,
): NativeEmojiSupport {
  if (isJsdom()) return UNKNOWN_SUPPORT;
  try {
    const canvas = ownerDocument.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return UNKNOWN_SUPPORT;
    ctx.font = `24px ${fontFamily}`;
    ctx.textBaseline = 'top';
    const baselineWidth = ctx.measureText(BASELINE_EMOJI).width;
    const sequences = createNativeEmojiSequenceSupport(ctx, baselineWidth);
    // A stable baseline rejects text fallback, noise and blocked readbacks.
    if (!baselineWidth || sequences.supports('1f600') !== true)
      return UNKNOWN_SUPPORT;
    return sequences;
  } catch {
    return UNKNOWN_SUPPORT;
  }
}

/** Whether a unified code is a regional-indicator country flag. */
export function isCountryFlagUnified(unified: string): boolean {
  const parts = unified.toLowerCase().split('-');
  return (
    parts.length === 2 &&
    parts.every((part) => {
      const code = parseInt(part, 16);
      return code >= 0x1f1e6 && code <= 0x1f1ff;
    })
  );
}
