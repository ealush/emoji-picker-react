import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const recipesDir = join(__dirname, '..', 'stories', 'recipes');
const publicDir = join(__dirname, '..', 'website', 'public', 'recipes');

const dirs = readdirSync(recipesDir).filter((dir) => {
  if (dir === 'README.md') return false;
  return statSync(join(recipesDir, dir)).isDirectory();
});

function read(dir: string, file: string) {
  return readFileSync(join(recipesDir, dir, file), 'utf8');
}

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Class tokens referenced by a stylesheet's selectors.
function cssClasses(css: string) {
  const classes = new Set<string>();
  for (const match of stripComments(css).matchAll(
    /(?<![0-9])\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g,
  )) {
    classes.add(match[1]);
  }
  return classes;
}

// Class tokens baked into a component's className literals. Dynamic
// segments (`${className}`, ternaries) contribute nothing.
function jsxClasses(tsx: string) {
  const classes = new Set<string>();
  for (const match of tsx.matchAll(/className=(?:"([^"]*)"|`([^`]*)`)/g)) {
    for (const token of (match[1] ?? match[2]).split(/[^_a-zA-Z0-9-]+/)) {
      if (token && token !== 'className') classes.add(token);
    }
  }
  return classes;
}

describe.each(dirs)('recipe snippet boundary: %s', (dir) => {
  it('ships the picker composition as picker.tsx, composed by shell.tsx', () => {
    const picker = read(dir, 'picker.tsx');
    const shell = read(dir, 'shell.tsx');
    expect(picker).toMatch(/export function PickerExample/);
    expect(picker).not.toContain('app.css');
    expect(shell).toContain(`from './picker'`);
    // Picker parts and hooks compose in picker.tsx only; shell.tsx keeps
    // host chrome plus host state and handlers. (Type positions like
    // ComponentType<Picker.RootProps> stay in shell prop types.)
    for (const part of [
      'Search',
      'SkinTone',
      'CategoryNav',
      'Viewport',
      'List',
      'Empty',
      'Preview',
      'Panel',
    ]) {
      expect(shell).not.toContain(`<Picker.${part}`);
    }
    expect(shell).not.toMatch(/<RootComponent[\s/>]/);
    expect(shell).not.toMatch(/Picker\.use[A-Z]/);
  });

  it('styles every picker class outside the host stylesheet', () => {
    const picker = read(dir, 'picker.tsx');
    const needed = jsxClasses(picker);
    const app = existsSync(join(recipesDir, dir, 'app.css'))
      ? read(dir, 'app.css')
      : '';
    const panel = existsSync(join(recipesDir, dir, 'panel.css'))
      ? read(dir, 'panel.css')
      : '';
    const styled = new Set([
      ...cssClasses(panel),
      ...cssClasses(read(dir, 'picker.css')),
    ]);
    const hostOnly = [...cssClasses(app)].filter((name) => !styled.has(name));
    const leaked = [...needed].filter((name) => hostOnly.includes(name));
    expect(leaked).toEqual([]);
    for (const name of needed) {
      expect(
        styled.has(name),
        `${dir}: .${name} is used by picker.tsx but styled nowhere in the snippet CSS`,
      ).toBe(true);
    }
  });

  it('publishes a picker-only snippet payload', () => {
    const payload = JSON.parse(
      readFileSync(join(publicDir, `${dir}.json`), 'utf8'),
    ) as { files: { name: string; content: string }[] };
    const names = payload.files.map((file) => file.name);
    expect(names).toContain('emoji-picker.tsx');
    expect(names).toContain('picker.css');
    expect(names).toContain('README.md');
    expect(names).not.toContain('app.css');
    expect(names).not.toContain('shell.tsx');
    const tsx = payload.files.find(
      (file) => file.name === 'emoji-picker.tsx',
    )!.content;
    expect(tsx).toContain('PickerExample');
    expect(tsx).not.toContain(`from './picker'`);
  });
});
