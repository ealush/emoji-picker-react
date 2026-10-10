import { createRequire } from 'node:module';
const scriptRunner = createRequire(import.meta.url).resolve('tsx/cli');
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

function fixture({
  baseline = true,
  markers = true,
  shell = 'export function Shell() { return null; }',
  picker = 'export function PickerExample() { return null; }',
  metadata = {},
} = {}) {
  const root = mkdtempSync(join(tmpdir(), 'epr-designs-'));
  for (const dir of [
    'scripts',
    'stories/recipes/example',
    'stories/recipes/helpers',
    'playwright/recipes.spec.ts-snapshots',
    'website/src/components/designs',
    'website/src/styles/designs',
    'website/public/designs',
    'docs/designs',
  ])
    mkdirSync(join(root, dir), { recursive: true });
  copyFileSync(
    'scripts/portDesigns.mts',
    join(root, 'scripts/portDesigns.mts'),
  );
  copyFileSync(
    'scripts/recipeMetadata.mts',
    join(root, 'scripts/recipeMetadata.mts'),
  );
  writeFileSync(
    join(root, 'stories/recipes/example/recipe.json'),
    JSON.stringify({
      title: 'Example',
      name: 'Example',
      rootClass: 'example',
      description: 'Fixture',
      order: 1,
      ...metadata,
    }),
  );
  for (const file of [
    'shell.tsx',
    'picker.tsx',
    'app.css',
    'picker.css',
    'picker.module.css',
  ])
    writeFileSync(
      join(root, 'stories/recipes/example', file),
      file === 'shell.tsx' ? shell : file === 'picker.tsx' ? picker : '/* fixture */',
    );
  writeFileSync(
    join(root, 'README.md'),
    markers
      ? '<!-- DESIGNS:START -->\n<!-- DESIGNS:END -->'
      : '# No gallery markers',
  );
  if (baseline)
    writeFileSync(
      join(root, 'playwright/recipes.spec.ts-snapshots/recipes-example.png'),
      'fixture baseline',
    );
  const outputs = [
    'website/src/components/designs',
    'website/src/styles/designs',
    'website/public/designs',
    'docs/designs',
  ];
  for (const dir of outputs)
    writeFileSync(join(root, dir, 'sentinel'), 'existing output');
  return {
    root,
    outputs,
    run: () =>
      spawnSync(
        process.execPath,
        [scriptRunner, join(root, 'scripts/portDesigns.mts')],
        {
          encoding: 'utf8',
        },
      ),
  };
}

it.each([
  { baseline: false },
  { markers: false },
  { metadata: { order: 'invalid' } },
  { shell: "import Thing from './unported';" },
])('preserves generated outputs when input validation fails: %j', (options) => {
  const { root, outputs, run } = fixture(options);
  try {
    expect(run().status).not.toBe(0);
    for (const dir of outputs)
      expect(readFileSync(join(root, dir, 'sentinel'), 'utf8')).toBe(
        'existing output',
      );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

it('skips helper directories and produces stable gallery output on reruns', () => {
  const { root, run } = fixture();
  try {
    expect(run().status).toBe(0);
    const generated = join(root, 'website/src/components/designs/Example.tsx');
    const generatedPicker = join(
      root,
      'website/src/components/designs/ExamplePicker.tsx',
    );
    const first = readFileSync(generated, 'utf8');
    const firstPicker = readFileSync(generatedPicker, 'utf8');
    expect(run().status).toBe(0);
    expect(readFileSync(generated, 'utf8')).toBe(first);
    expect(readFileSync(generatedPicker, 'utf8')).toBe(firstPicker);
    expect(readFileSync(join(root, 'docs/designs/example.png'), 'utf8')).toBe(
      'fixture baseline',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
