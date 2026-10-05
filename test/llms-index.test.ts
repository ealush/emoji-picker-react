import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as dataEntry from '../src/data';
import * as mainEntry from '../src/index';
import * as primitivesEntry from '../src/primitives';

// llms.txt is what coding agents read first. Its "Entry points" line names
// the public exports of every entry; this keeps that line honest when an
// export is added, renamed or removed.
const llms = readFileSync(join(process.cwd(), 'llms.txt'), 'utf8');
const entryPoints = llms
  .split('\n')
  .find((line) => line.startsWith('- Entry points:'));

function namesBetween(start: string, end: string): string[] {
  const text = entryPoints!;
  const from = text.indexOf(start);
  const to = end ? text.indexOf(end, from) : text.length;
  expect(from, `llms.txt names ${start}`).toBeGreaterThanOrEqual(0);
  const section = text.slice(from, to === -1 ? undefined : to);
  return Array.from(section.matchAll(/\b([A-Za-z][A-Za-z0-9]*)\b/g))
    .map((match) => match[1])
    .filter((word) => /^(use[A-Z]|[A-Z])/.test(word) || word.endsWith('Tokens'));
}

describe('llms.txt entry-point index', () => {
  it('lists real exports of emoji-picker-react', () => {
    const names = namesBetween('`emoji-picker-react` (', '`emoji-picker-react/primitives`');
    expect(names).toContain('EmojiPicker');
    for (const name of names) {
      if (name === 'EmojiPicker') {
        expect(typeof mainEntry.default).toBe('function');
      } else if (['PickerProps', 'EmojiClickData', 'PickerComponents'].includes(name)) {
        // Type-only exports: checked by compat/exports-map type fixtures.
      } else {
        expect(name in mainEntry, `main entry exports ${name}`).toBe(true);
      }
    }
  });

  it('lists real exports of emoji-picker-react/primitives', () => {
    const names = namesBetween('`emoji-picker-react/primitives` (', '`emoji-picker-react/data`');
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) {
      expect(name in primitivesEntry, `primitives entry exports ${name}`).toBe(true);
    }
  });

  it('lists real exports of emoji-picker-react/data', () => {
    for (const name of ['searchEmojis', 'getEmojiByUnified']) {
      expect(entryPoints).toContain(name);
      expect(name in dataEntry, `data entry exports ${name}`).toBe(true);
    }
  });
});
