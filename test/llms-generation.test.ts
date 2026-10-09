import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, it } from 'vitest';

const runner = createRequire(import.meta.url).resolve('tsx/cli');
it('generates stable website copies from the current sources and actual exports', () => {
  const root = mkdtempSync(join(tmpdir(), 'epr-llms-'));
  try {
    for (const file of [
      'scripts/generateLlmsTxt.ts',
      'docs/v5',
      'README.md',
      'PROPS.md',
      'CSS_VARIABLES.md',
      'CUSTOMIZATION.md',
      'INTERNATIONALIZATION.md',
      'website/README.md',
      'stories/recipes/README.md',
      'stories/integrations/README.md',
      'example/README.md',
      'stories/recipes/team-chat/shell.tsx',
      'stories/recipes/team-chat/picker.css',
      'src/index.tsx',
      'src/primitives/index.ts',
      'src/data.ts',
    ]) {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      cpSync(file, join(root, file), { recursive: true });
    }
    mkdirSync(join(root, 'website/public'), { recursive: true });
    const run = () =>
      spawnSync(
        process.execPath,
        [runner, join(root, 'scripts/generateLlmsTxt.ts')],
        { encoding: 'utf8' },
      );
    const first = run();
    expect(first.status, first.stderr).toBe(0);
    const outputs = ['llms.txt', 'llms-full.txt'].map((file) =>
      readFileSync(join(root, file), 'utf8'),
    );
    expect(outputs[0]).toContain('Composition owns presence and placement');
    expect(outputs[1]).toContain('Root renders exactly');
    expect(outputs[0]).toContain('Website examples');
    expect(run().status).toBe(0);
    for (const [index, file] of ['llms.txt', 'llms-full.txt'].entries()) {
      expect(readFileSync(join(root, file), 'utf8')).toBe(outputs[index]);
      expect(readFileSync(join(root, 'website/public', file), 'utf8')).toBe(
        outputs[index],
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
