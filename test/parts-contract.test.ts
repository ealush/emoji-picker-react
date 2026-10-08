import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// docs/v5/STYLING.md §5 is the public part contract; every `data-epr-part`
// value the library emits must be documented there, and every documented
// part must still be emitted.
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.d\.ts$/.test(entry) ? [full] : [];
  });
}

function emittedParts(): Set<string> {
  const parts = new Set<string>();
  for (const file of sourceFiles(join(process.cwd(), 'src'))) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(
      /data-epr-part['"]?\s*[=:]\s*['"]([a-z-]+)['"]/g,
    )) {
      parts.add(match[1]);
    }
  }
  return parts;
}

function documentedParts(): Set<string> {
  const text = readFileSync(
    join(process.cwd(), 'docs', 'v5', 'STYLING.md'),
    'utf8',
  );
  const section = text.slice(
    text.indexOf('## 5. Stable part selectors'),
    text.indexOf('## 6.'),
  );
  return new Set(
    Array.from(section.matchAll(/^- `([a-z-]+)`/gm)).map((match) => match[1]),
  );
}

describe('data-epr-part contract', () => {
  it('documents every emitted part and emits every documented part', () => {
    const emitted = emittedParts();
    const documented = documentedParts();
    expect([...emitted].sort()).toEqual([...documented].sort());
  });
});
