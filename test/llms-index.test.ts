import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as dataEntry from '../src/data';
import * as mainEntry from '../src/index';
import * as primitivesEntry from '../src/primitives';

// llms.txt is what coding agents read first. Its export index is generated
// from the entry sources by scripts/generateLlmsTxt.ts; this proves the
// generated lines name real runtime exports and that the committed file is
// current (the docs CI job also diffs it).
const llms = readFileSync(join(process.cwd(), 'llms.txt'), 'utf8');

function indexLine(specifier: string): string {
  const line = llms
    .split('\n')
    .find((candidate) => candidate.startsWith(`- \`${specifier}\`: `));
  expect(line, `llms.txt indexes ${specifier}`).toBeDefined();
  return line as string;
}

function names(line: string, kind: 'values' | 'types' | 'default'): string[] {
  const match = line.match(new RegExp(`${kind} ((?:\`[^\`]+\`(?:, )?)+)`));
  return match ? Array.from(match[1].matchAll(/`([^`]+)`/g)).map((m) => m[1]) : [];
}

const expectValues = (line: string, entry: Record<string, unknown>) => {
  const values = names(line, 'values');
  expect(values.length).toBeGreaterThan(0);
  for (const name of values) {
    expect(name in entry, `${name} is exported`).toBe(true);
  }
};

describe('llms.txt export index', () => {
  it('matches the runtime exports of emoji-picker-react', () => {
    const line = indexLine('emoji-picker-react');
    expect(names(line, 'default')).toEqual(['EmojiPicker']);
    expect(typeof mainEntry.default).toBe('function');
    expectValues(line, mainEntry);
    expect(names(line, 'types')).toEqual(
      expect.arrayContaining(['PickerProps', 'EmojiClickData', 'PickerLabels', 'CustomEmoji']),
    );
  });

  it('matches the runtime exports of emoji-picker-react/primitives', () => {
    const line = indexLine('emoji-picker-react/primitives');
    expectValues(line, primitivesEntry);
    expect(names(line, 'values')).toEqual(
      expect.arrayContaining(['Root', 'Panel', 'Reactions', 'useSearchActions', 'usePickerMode']),
    );
    expect(names(line, 'types')).toEqual(
      expect.arrayContaining(['RootProps', 'PickerComponents', 'EmojiRenderProps']),
    );
  });

  it('matches the runtime exports of emoji-picker-react/data', () => {
    const line = indexLine('emoji-picker-react/data');
    expectValues(line, dataEntry);
    expect(names(line, 'values')).toEqual(['getEmojiByUnified', 'searchEmojis']);
  });

  it('lists every runtime export of each entry (nothing missing)', () => {
    for (const [specifier, entry] of [
      ['emoji-picker-react', mainEntry],
      ['emoji-picker-react/primitives', primitivesEntry],
      ['emoji-picker-react/data', dataEntry],
    ] as const) {
      const listed = new Set(names(indexLine(specifier), 'values'));
      for (const name of Object.keys(entry)) {
        if (name === 'default') continue;
        expect(listed.has(name), `${specifier} lists ${name}`).toBe(true);
      }
    }
  });
});
