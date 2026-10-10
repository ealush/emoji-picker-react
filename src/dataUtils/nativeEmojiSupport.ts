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
// Detection runs in two phases so it never stalls the first paint.
// Drawing every sequence costs 0.2-0.8 s of main-thread time, depending
// on the browser and font, so before paint the picker samples one glyph
// per emoji version and a country flag, and predicts from that. Every
// rendered sequence (skin tones and flag tags included) is then checked in
// cached pixel batches between tasks. Exact results replace predictions:
// one version sample cannot prove font coverage.

export const DEFAULT_NATIVE_EMOJI_FONT =
  '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji"';

const BASELINE_EMOJI = '\u{1F600}'; // grinning face (Emoji 1.0)

const FLAG_SAMPLE = '1f1fa-1f1f8'; // regional indicators U + S

type NativeEmojiProbe = ReturnType<typeof createNativeEmojiSequenceSupport>;

/**
 * Platform support as filtering reads it. `supports` returns a probed
 * identity's exact result (null when inconclusive, undefined when not
 * probed yet); the version and flag fields predict the rest.
 */
export type NativeEmojiSupport = {
  supports: (unified: string) => boolean | null | undefined;
  /** Emoji versions whose sample the font cannot draw. */
  failedVersions: Set<number>;
  countryFlags: boolean;
};

export const UNKNOWN_SUPPORT = {};

let cache = new WeakMap<
  Document,
  Map<string, NativeEmojiProbe | typeof UNKNOWN_SUPPORT>
>();

/**
 * Probes the font synchronously, sampling versions and flags only.
 * Exact sequence results accumulate on the returned probe through
 * `prime`, which pickers call in background batches.
 */
export function detectNativeEmojiSupport(
  fontFamily: string = DEFAULT_NATIVE_EMOJI_FONT,
  refresh = false,
  ownerDocument: Document | undefined = typeof document === 'undefined'
    ? undefined
    : document,
): NativeEmojiProbe | typeof UNKNOWN_SUPPORT {
  if (!ownerDocument) return UNKNOWN_SUPPORT;
  const fonts =
    cache.get(ownerDocument) ||
    new Map<string, NativeEmojiProbe | typeof UNKNOWN_SUPPORT>();
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

/**
 * Whether a rendered identity should show. An exact result wins; until
 * one exists, flags and emojis of a version whose sample failed are
 * predicted unsupported. `addedIn` is the emoji's version, when known.
 */
export function isNativeEmojiSupported(
  support: NativeEmojiSupport | null,
  unified: string,
  addedIn = 0,
): boolean {
  const exact = support && support.supports(unified);
  return typeof exact === 'boolean'
    ? exact
    : !support ||
        !(
          support.failedVersions.has(addedIn) ||
          (!support.countryFlags && isCountryFlagUnified(unified))
        );
}

/** The picker's view of a probe: frozen results, never drawing. */
/**
 * The picker's view of a probe: frozen results, never drawing, plus a
 * prediction for identities not checked yet. `samples` maps each emoji
 * version to one emoji introduced in it. Versions are judged one by one:
 * fonts often draw a newer version's single glyphs but not an older
 * version's sequences.
 */
export function nativeSupportSnapshot(
  probe: NativeEmojiProbe,
  samples: Map<number, string>,
): NativeEmojiSupport {
  probe.prime([FLAG_SAMPLE, ...samples.values()]);
  const failedVersions = new Set<number>();
  samples.forEach((unified, version) => {
    if (probe.supports(unified) === false) failedVersions.add(version);
  });
  return {
    supports: probe.snapshot(),
    failedVersions,
    // Only a definite failure predicts missing flags.
    countryFlags: probe.supports(FLAG_SAMPLE) !== false,
  };
}

/** Test-only: forget cached probe results. */
export function __resetNativeEmojiSupportForTest(): void {
  cache = new WeakMap();
}

function probe(
  fontFamily: string,
  ownerDocument: Document,
): NativeEmojiProbe | typeof UNKNOWN_SUPPORT {
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
  // Regional-indicator pairs, plus tag-sequence subdivision flags: fonts
  // without the former lack the latter too.
  return /^(1f1[ef][\da-f]-1f1[ef][\da-f]$|1f3f4-e00)/i.test(unified);
}
