// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

import { compileFixture } from '../scripts/compileFixture';

it.each(['cjs', 'esm'] as const)(
  'keeps packed consumer imports external in %s fixtures',
  (format) => {
    const scratch = mkdtempSync(join(tmpdir(), 'epr-fixture-test-'));
    try {
      const output = join(
        scratch,
        `consumer.${format === 'esm' ? 'mjs' : 'cjs'}`,
      );
      compileFixture(
        join(__dirname, '../scripts/node18-fixture/consumer.mts'),
        output,
        format,
      );
      const code = readFileSync(output, 'utf8');
      expect(code).toContain('"emoji-picker-react"');
      expect(code).toContain('"emoji-picker-react/primitives"');
      expect(code).toContain('"emoji-picker-react/data/emojis-fr"');
      expect(code).not.toContain('shipstyles');
      expect(code).not.toContain('src/primitives');
      expect(code.length).toBeLessThan(10000);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  },
);
