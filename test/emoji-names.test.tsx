import { render, screen } from '@testing-library/react';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { orderNames } from '../scripts/emojiNames';
import * as Picker from '../src/primitives';
import enData from '../src/data/emojis-en.json';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const dataDir = join(__dirname, '..', 'src', 'data');
const requireData = createRequire(import.meta.url);

type Dataset = { emojis: Record<string, { n: string[]; u: string }[]> };

describe('emoji names', () => {
  // The dataset keeps keywords shortest first and the CLDR short name
  // last; aria-labels and the preview read the last entry.
  it.each([
    ['1f680', 'rocket'],
    ['1f609', 'winking face'],
    ['1f929', 'star struck'],
    ['1f610', 'neutral face'],
  ])('names %s "%s"', (unified, name) => {
    const record = Object.values(enData.emojis)
      .flat()
      .find((emoji) => emoji.u === unified);
    expect(record?.n.at(-1)).toBe(name);
  });

  it('announces the short name, not the longest keyword', () => {
    render(
      <Picker.Root emojiData={enData as Picker.EmojiData}>
        <Picker.Viewport style={{ height: 300 }}>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(
      screen.getAllByRole('gridcell', { name: 'winking face' }).length,
    ).toBeGreaterThan(0);
  });

  it.each(
    readdirSync(dataDir).filter((file) =>
      /^emojis(-[a-z-]+)?\.json$/.test(file),
    ),
  )('%s ends every emoji with its emojibase label', (file) => {
    const lang = file.match(/^emojis-(.+)\.json$/)?.[1] ?? 'en';
    const labels = new Map(
      (
        requireData(`emojibase-data/${lang}/data.json`) as {
          hexcode: string;
          label: string;
        }[]
      ).map((record) => [record.hexcode.toLowerCase(), record.label]),
    );
    const dataset = JSON.parse(
      readFileSync(join(dataDir, file), 'utf8'),
    ) as Dataset;
    const emojis = Object.values(dataset.emojis).flat();
    expect(emojis.length).toBeGreaterThan(1000);
    // prepare.ts appends -fe0f where emoji-datasource spells it that way.
    const mismatches = emojis.flatMap(({ n, u }) => {
      const label = labels.get(u) ?? labels.get(u.replace(/-fe0f$/, ''));
      const name = label?.replace(/[_-]/g, ' ');
      return n.at(-1) === name ? [] : [`${u}: "${n.at(-1)}", label "${name}"`];
    });
    expect(mismatches).toEqual([]);
  });

  it('orders keywords shortest first and the label last', () => {
    expect(
      orderNames({
        label: 'rocket',
        shortcodes: ['rocket'],
        tags: ['rockets', 'space'],
      }),
    ).toEqual(['space', 'rockets', 'rocket']);
  });

  it('fails the build for a record without a label', () => {
    // Sorting alone would name it by its longest keyword.
    expect(() =>
      orderNames({ hexcode: '1F680', tags: ['rockets', 'space'] }),
    ).toThrow('emojibase record 1F680 has no label');
  });
});
