import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vitest executes with the repository root as cwd.
const SRC = join(process.cwd(), 'src');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

function read(relativePath: string): string {
  return readFileSync(join(SRC, relativePath), 'utf8');
}

function importersOf(matcher: RegExp): string[] {
  return sourceFiles(SRC)
    .filter((file) => matcher.test(readFileSync(file, 'utf8')))
    .map((file) => file.slice(SRC.length + 1));
}

// Source-architecture assertion: the default picker must be assembled
// from the exported primitive modules. Private parallel Search/List/
// Reactions renderers must not exist or be used by the default tree.
describe('v5 one-implementation architecture', () => {
  it('assembles the default picker from the primitive modules', () => {
    const emojiPicker = read('EmojiPickerReact.tsx');
    expect(emojiPicker).toMatch(/from '\.\/primitives'/);
    expect(emojiPicker).toContain('<Root');
    expect(emojiPicker).toContain('<Viewport>');
    expect(emojiPicker).toContain('<List');
    expect(emojiPicker).toContain('<Preview');

    const header = read('components/header/Header.tsx');
    expect(header).toMatch(/primitives/);
    expect(header).toContain('<Search');
    expect(header).toContain('<CategoryNav');
  });

  it('uses the shared behavior modules, not parallel renderers', () => {
    // Each managed region renders exactly once, inside its primitive.
    // (Module imports of the same files for hooks/context are fine.)
    const renderersOf = (jsx: RegExp): string[] =>
      importersOf(jsx).filter((file) => !file.startsWith('primitives/'));
    expect(renderersOf(/<EmojiList[\s>]/)).toEqual([]);
    expect(renderersOf(/<SearchContainer[\s>]/)).toEqual([]);
    expect(renderersOf(/<CategoryNavigation[\s>]/)).toEqual([]);
    expect(renderersOf(/<Reactions[\s>]/)).toEqual(['EmojiPickerReact.tsx']);

    // ...and each primitive genuinely renders its managed region.
    expect(read('primitives/List.tsx')).toMatch(/<EmojiList[\s>]/);
    expect(read('primitives/Search.tsx')).toMatch(/<SearchContainer[\s>]/);
    expect(read('primitives/CategoryNav.tsx')).toMatch(
      /<CategoryNavigation[\s>]/,
    );
    expect(read('EmojiPickerReact.tsx')).toMatch(/<Reactions[\s>]/);
  });

  it('keeps default appearance out of the primitives closure', () => {
    // The primitives bundle must not drag in the branded default
    // appearance. Anything the
    // primitives need from the default tree must move to a side-effect-free
    // module (see labelHeight.ts).
    const offenders = importersOf(
      /from '.*main\/defaultAppearance'|from '.*EmojiPickerReact'/,
    ).filter((file) => file.startsWith('primitives/'));
    expect(offenders).toEqual([]);
  });

  it('exports explicit Panel and Reactions using the same managed parts', () => {
    const entry = read('primitives/index.ts');
    expect(entry).toContain('export { Panel }');
    expect(entry).toContain('export { Reactions }');
    expect(read('primitives/Panel.tsx')).toContain('data-epr-part="panel"');
    expect(read('primitives/Root.tsx')).toContain('{children}');
  });

  it('keeps every library-owned data attribute in the data-epr namespace', () => {
    const offenders = sourceFiles(SRC).filter((file) => {
      const content = readFileSync(file, 'utf8');
      return (
        /(^|[^\w-])data-unified=/.test(content) ||
        /(^|[^\w-])data-name=/.test(content) ||
        /(^|[^\w-])data-emojis-per-row=/.test(content) ||
        /(^|[^\w-])data-full-name=/.test(content)
      );
    });
    expect(offenders).toEqual([]);
  });

  it('leaves panel and reactions presence to the caller', () => {
    const root = read('primitives/Root.tsx');
    expect(root).not.toContain('<Panel');
    expect(root).not.toMatch(/<Reactions(?:\s|\/|>)/);
    // Root must not install an ErrorBoundary (error ownership stays with
    // the default wrapper / application).
    expect(root).not.toContain('<ErrorBoundary');
  });
});
