import { parseNativeEmoji } from './parseNativeEmoji';

const CELL = 32;
const BATCH = 64;
type Candidate = [unified: string, text: string, comparison: string];

/** One reusable canvas and result cache per detected document/font. */
export function createNativeEmojiSequenceSupport(
  ctx: CanvasRenderingContext2D,
  baselineWidth: number,
) {
  const results = new Map<string, boolean | null>();
  const font = ctx.font;

  function prime(ids: Iterable<string>): void {
    const candidates: Candidate[] = [];
    for (const unified of ids) {
      if (results.has(unified)) continue;
      // Also deduplicates identities queued in this synchronous batch.
      results.set(unified, null);
      try {
        const text = parseNativeEmoji(unified);
        const width = ctx.measureText(text).width;
        // Uncombined joins, modifiers and flags occupy multiple advances.
        if (width <= 0 || width >= baselineWidth * 1.5) {
          results.set(unified, false);
        } else {
          candidates.push([
            unified,
            text,
            text.replace(/[\u{e0020}-\u{e007f}]/gu, ''),
          ]);
        }
      } catch {
        // Invalid identities/restricted rendering stay inconclusive.
      }
    }
    for (let offset = 0; offset < candidates.length; offset += BATCH) {
      probe(candidates.slice(offset, offset + BATCH));
    }
  }

  function draw(text: string, y: number, ink: string): void {
    // Glyph overhang must not contaminate a neighboring cell's pixels.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, CELL, CELL);
    ctx.clip();
    ctx.fillStyle = ink;
    ctx.fillText(text, 0, y);
    ctx.restore();
  }

  function probe(candidates: Candidate[]): void {
    try {
      const height = candidates.length * CELL;
      ctx.canvas.width = CELL;
      ctx.canvas.height = height * 2;
      ctx.font = font;
      ctx.textBaseline = 'top';
      candidates.forEach(([, text, comparison], index) => {
        const y = index * CELL;
        draw(text, y, '#000');
        draw(comparison, y + height, text === comparison ? '#f00' : '#000');
      });
      // One readback per bounded atlas instead of one per sequence.
      const pixels = ctx.getImageData(0, 0, CELL, height * 2).data;
      const artwork = new Uint32Array(
        pixels.buffer,
        pixels.byteOffset,
        pixels.length / 4,
      );
      candidates.forEach(([unified, text, comparison], index) => {
        const start = index * CELL * CELL;
        let alpha = 0;
        let difference = 0;
        for (let pixel = start; pixel < start + CELL * CELL; pixel++) {
          alpha |= pixels[pixel * 4 + 3];
          difference |= artwork[pixel] ^ artwork[pixel + CELL * height];
        }
        // Ordinary emoji artwork must ignore text ink (including grayscale
        // artwork). A subdivision flag must differ from its tagless black
        // flag fallback; unsupported tag sequences silently draw that flag.
        results.set(
          unified,
          alpha !== 0 &&
            (text === comparison ? difference === 0 : difference !== 0),
        );
      });
    } catch {
      // A blocked/unavailable readback must not empty the picker.
      for (const [unified] of candidates) results.set(unified, null);
    }
  }

  return {
    prime,
    supports(unified: string): boolean | null {
      // Only unusual explicit IDs need a lazy probe during rendering.
      // Normal inventory is primed in Root's layout effect before filtering.
      if (!results.has(unified)) prime([unified]);
      return results.get(unified) as boolean | null;
    },
  };
}
