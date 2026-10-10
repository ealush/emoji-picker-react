import { existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function readJsonc(path: string) {
  const text = readFileSync(path, 'utf8').replace(/\/\/.*$/gm, '');
  return JSON.parse(text);
}

// The static prefix of an include pattern (up to the first glob char).
function staticPrefix(pattern: string) {
  const index = pattern.search(/[*?{[]/);
  return index === -1 ? pattern : pattern.slice(0, index);
}

function isCovered(file: string, include: string[]) {
  const rel = relative(root, file).split(sep).join('/');
  return include.some((pattern) => rel.startsWith(staticPrefix(pattern)));
}

// Files Vite loads into Storybook that the library tsconfig excludes.
const docgenSubjects = [
  join(root, 'registry', 'emoji-picker.tsx'),
  join(root, 'integration', 'fixtures.tsx'),
  join(root, 'stories', 'utils', 'pickerStoryUtils.tsx'),
  join(root, 'stories', 'v5', 'MuiComposition.tsx'),
];

describe('storybook docgen project', () => {
  it('points the docgen plugin at the storybook tsconfig', () => {
    const main = readFileSync(join(root, '.storybook', 'main.ts'), 'utf8');
    expect(main).toContain('reactDocgenTypescriptOptions');
    expect(main).toContain('tsconfig.storybook.json');
  });

  it('covers every story-bearing directory', () => {
    const config = readJsonc(join(root, 'tsconfig.storybook.json'));
    expect(config.include).toEqual(
      expect.arrayContaining([
        'stories/**/*.tsx',
        'registry/**/*.tsx',
        'integration/**/*.tsx',
        '.storybook/**/*.ts',
      ]),
    );
    for (const file of docgenSubjects) {
      expect(existsSync(file)).toBe(true);
      expect(isCovered(file, config.include)).toBe(true);
    }
  });

  it('leaves the production library project scoped to src', () => {
    const config = readJsonc(join(root, 'tsconfig.json'));
    expect(config.include).toEqual(['src', 'types']);
  });
});
