// Native emoji support detection.
//
// The native emoji style renders with the platform's emoji font, which lags
// behind the dataset: an emoji newer than the OS font draws as a blank box
// ("tofu") or decomposes into several glyphs, and Windows has no country
// flag glyphs at all. When the consumer does not pin `emojiVersion`, the
// picker probes the platform once (client-only, after mount, so SSR output
// is unaffected) and hides what cannot be drawn.
//
// The probe draws one representative emoji per Unicode emoji version on a
// canvas. A supported emoji renders in color as a single glyph; an
// unsupported one renders monochrome (tofu / fallback text) or roughly
// twice as wide (an unjoined ZWJ or regional-indicator sequence).

export const DEFAULT_NATIVE_EMOJI_FONT =
  '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji"';

// Newest first. Each sample was introduced in the listed emoji version.
const VERSION_SAMPLES: ReadonlyArray<[number, string]> = [
  [16, '\u{1FAE9}'], // face with bags under eyes
  [15.1, '\u{1F642}‍↔️'], // head shaking horizontally
  [15, '\u{1FAE8}'], // shaking face
  [14, '\u{1FAE0}'], // melting face
  [13.1, '\u{1F636}‍\u{1F32B}️'], // face in clouds
  [13, '\u{1F972}'], // smiling face with tear
  [12.1, '\u{1F9D1}‍\u{1F9B0}'], // person: red hair
  [12, '\u{1F971}'], // yawning face
  [11, '\u{1F970}'], // smiling face with hearts
];

// Everything at or below this version is assumed supported when the
// newest probe fails: every platform that can draw color emoji at all
// covers Emoji 5.
const FLOOR_VERSION = 5;
const BASELINE_EMOJI = '\u{1F600}'; // grinning face (Emoji 1.0)
const FLAG_SAMPLE = '\u{1F1FA}\u{1F1F8}'; // regional indicators U + S

export type NativeEmojiSupport = {
  /** Highest emoji version the platform renders, or null when unknown. */
  maxVersion: number | null;
  /** Whether regional-indicator country flags render as flags. */
  countryFlags: boolean;
};

const UNKNOWN_SUPPORT: NativeEmojiSupport = {
  maxVersion: null,
  countryFlags: true,
};

const cache = new Map<string, NativeEmojiSupport>();

export function detectNativeEmojiSupport(
  fontFamily: string = DEFAULT_NATIVE_EMOJI_FONT,
): NativeEmojiSupport {
  const cached = cache.get(fontFamily);
  if (cached) {
    return cached;
  }
  const result = probe(fontFamily);
  cache.set(fontFamily, result);
  return result;
}

/** Test-only: forget cached probe results. */
export function __resetNativeEmojiSupportForTest(): void {
  cache.clear();
}

const CANVAS_SIZE = 32;

function probe(fontFamily: string): NativeEmojiSupport {
  const ctx = createProbeContext();
  if (!ctx) {
    return UNKNOWN_SUPPORT;
  }

  ctx.font = `${CANVAS_SIZE * 0.75}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  const baselineWidth = measure(ctx, BASELINE_EMOJI);
  // No color emoji font at all (monochrome rendering, headless test
  // environments): detection is inconclusive, so filter nothing.
  if (!baselineWidth || !rendersInColor(ctx, BASELINE_EMOJI)) {
    return UNKNOWN_SUPPORT;
  }

  const isSupported = (emoji: string) =>
    rendersInColor(ctx, emoji) && measure(ctx, emoji) < baselineWidth * 1.5;

  const newest = VERSION_SAMPLES.find(([, sample]) => isSupported(sample));

  return {
    maxVersion: newest ? newest[0] : FLOOR_VERSION,
    countryFlags: isSupported(FLAG_SAMPLE),
  };
}

function createProbeContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined' || isJsdom()) {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = CANVAS_SIZE;
    const context = canvas.getContext('2d', {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D | null;
    return context && typeof context.getImageData === 'function'
      ? context
      : null;
  } catch {
    return null;
  }
}

// jsdom has no canvas and reports every getContext call as an error,
// which would surface in consumers' own test output. Read the user agent
// from the document's window: on Node >= 21 the global `navigator` is
// Node's own, not jsdom's.
function isJsdom(): boolean {
  const userAgent =
    document.defaultView?.navigator?.userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /jsdom/i.test(userAgent);
}

function measure(ctx: CanvasRenderingContext2D, emoji: string): number {
  try {
    return ctx.measureText(emoji).width;
  } catch {
    return 0;
  }
}

function rendersInColor(ctx: CanvasRenderingContext2D, emoji: string): boolean {
  try {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#000';
    ctx.fillText(emoji, 0, 0);
    const { data } = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i < data.length; i += 4) {
      // Text drawn in black stays gray-scale; a color emoji glyph does not.
      if (
        data[i + 3] > 0 &&
        (Math.abs(data[i] - data[i + 1]) > 16 ||
          Math.abs(data[i + 1] - data[i + 2]) > 16)
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
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
