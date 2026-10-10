// Generates the LLM-facing documentation (https://llmstxt.org):
//   llms.txt       a concise index: what the library is, when to choose it,
//                  key facts, the export index of every entry (read from the
//                  entry sources, so it cannot drift), a quick reference and
//                  links to every doc
//   llms-full.txt  the complete documentation in one file, with a table of
//                  contents
// Both ship in the npm package and are copied into website/public so the
// demo site serves them too. Run: npm run docs:llms
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
// The index links to the branch releases are cut from; llms-full.txt inlines
// the same documents so the installed package never depends on the links.
const RAW =
  'https://raw.githubusercontent.com/ealush/emoji-picker-react/master';

const SUMMARY = `Emoji picker for React: batteries included with \`<EmojiPicker />\`, or BYOD (bring your own design, design language and design library) with \`unstyled\` and \`emoji-picker-react/primitives\`. Both paths share search, keyboard navigation, localization and virtualization. Use your existing Tailwind, shadcn/ui, CSS Modules, Emotion, styled-components, MUI or plain CSS design.`;

const KEY_FACTS = `Key facts:

- Install: \`npm install emoji-picker-react\`. Minimal use: \`import EmojiPicker from 'emoji-picker-react'; <EmojiPicker onEmojiClick={(e) => insert(e.emoji)} />\`.
- Choose batteries included or BYOD for both "I just need an emoji picker" (the default component needs no styling) and "it must match our design system" (\`unstyled\` or primitives + the project's styling solution).
- Entry points: \`emoji-picker-react\` (the default picker, enums and types; registers the English dataset), \`emoji-picker-react/primitives\` (composable parts, hooks, tokens and the same enums; loads the dataset on demand), \`emoji-picker-react/data\` (search and lookup without React), \`emoji-picker-react/data/emojis-<locale>\` (28 datasets). The complete export list is below.
- Styling: \`--epr-*\` CSS variables (they always yield to consumer CSS), \`[data-epr-part="…"]\` selectors, \`className\`/\`style\`. Ordinary resets are handled by library classes; more specific rules and !important can still override structural geometry. With Tailwind v4 or other @layer setups pass \`cssLayer="epr"\` and declare \`@layer epr, theme, base, components, utilities;\` first.
- Use \`colorScheme="light" | "dark" | "auto"\` on Root, or prefer it over \`theme\` on EmojiPicker (CSS-in-JS wrappers reserve \`theme\`). Props accept string literals or enums.
- Accessibility: automated axe and keyboard/focus regression checks; grid semantics (emoji buttons are \`role="gridcell"\`); every UI string localizable through \`labels\`. Manual screen-reader verification has a separate release protocol.
- Works with React 16.8–19, SSR, React Server Components (client entries are marked "use client"), TypeScript.
- Composition owns presence and placement: Root renders exactly the parts you supply — omit Search, Preview, SkinTone, Panel or Reactions to omit that UI, and place SkinTone inside Search or Preview (or anywhere in Root). The default picker assembles the same parts from its legacy props. Use SearchInput as={Input} with an input-forwarding adapter. Root/EmojiPicker components replace Emoji, CategoryHeader, CategoryButton, SkinToneButton, ClearButton and ExpandButton; List components override grid slots. Use useSearchActions, useCategoryNavigation and usePickerMode for custom controls. Bare Root and unstyled remove all branded decoration; geometry and presence belong to your JSX. Do not invent asChild, onEmojiSelect or a renderer-independent UI engine.
- Read the installed package llms-full.txt first; it matches the installed version. The primitives entry, \`unstyled\`, \`columns\`, \`components\`, \`labels\` and loader \`emojiData\` exist from 5.0.0; a 4.x installation has only the v4 props.
- Do not override structural layout (viewport overflow, grid geometry); position the picker by wrapping it.`;

// Public entries: [specifier, source file]. The export index is read from
// these files so it cannot drift from what ships.
const ENTRIES: Array<[string, string]> = [
  ['emoji-picker-react', 'src/index.tsx'],
  ['emoji-picker-react/primitives', 'src/primitives/index.ts'],
  ['emoji-picker-react/data', 'src/data.ts'],
];

const LOCALES =
  'bn, da, de, en, en-gb, es, es-mx, et, fi, fr, hi, hu, it, ja, ko, lt, ms, nb, nl, pl, pt, ru, sv, th, uk, vi, zh, zh-hant';

const QUICK_REFERENCE = `Quick reference:

\`\`\`tsx
// Batteries included: theme the built-in look with colorScheme and --epr-* variables.
import EmojiPicker from 'emoji-picker-react';
<EmojiPicker colorScheme="auto" columns={8} className="my-picker" onEmojiClick={(e) => insert(e.emoji)} />

// Unstyled: same layout and behavior, your CSS on [data-epr-part] selectors (color variables do nothing here).
<EmojiPicker unstyled className="my-picker" />

// Composed: your layout, your components; Root keeps state, keyboard, ARIA and virtualization.
import * as Picker from 'emoji-picker-react/primitives';
<Picker.Root columns={8} style={{ height: 400 }} components={{ Emoji: MyCell }} onEmojiClick={(e) => insert(e.emoji)}>
  <Picker.SearchInput as={MyInput} />
  <Picker.CategoryNav />
  <Picker.Viewport><Picker.List /><Picker.Empty /><Picker.Loading /><Picker.LoadError /></Picker.Viewport>
  <Picker.Preview />
</Picker.Root>

// Data only (no React): search and lookup.
import { searchEmojis, getEmojiByUnified } from 'emoji-picker-react/data';
searchEmojis('party'); getEmojiByUnified('1f389'); // { emoji: '🎉', name: 'party popper', unified, names, … }
\`\`\``;

// [path, title, description] — the index links; llms-full.txt inlines them.
const DOCS: Array<[string, string, string]> = [
  [
    'docs/v5/AGENT_GUIDE.md',
    'Agent integration guide',
    'installed-version discovery, batteries included/BYOD, typed input/cell contracts, localization and verification',
  ],
  [
    'docs/v5/PROMPTS.md',
    'Copyable integration prompts',
    'setup, brand styling, design-library composition, recipe adoption and v4-to-v5 migration',
  ],
  [
    'README.md',
    'README',
    'overview, quick start, choosing a path, styling with any solution, common tasks',
  ],
  ['PROPS.md', 'Props reference', 'every prop of the default <EmojiPicker />'],
  ['CSS_VARIABLES.md', 'CSS variables', 'every --epr-* design token'],
  [
    'CUSTOMIZATION.md',
    'Customization',
    'custom emojis and groups, category icons, preview, CSP nonce',
  ],
  [
    'INTERNATIONALIZATION.md',
    'Internationalization',
    'locale datasets and labels',
  ],
  [
    'docs/v5/ADOPTION.md',
    'Adoption',
    'native input, loading recovery, registry installation and source downloads',
  ],
  ['docs/v5/API.md', 'v5 API', 'all v5 additions with examples'],
  [
    'docs/v5/PRIMITIVES.md',
    'Primitives',
    'composable parts, hooks, custom cells, grammar',
  ],
  [
    'docs/v5/STYLING.md',
    'Styling',
    'tokens, parts, cascade, structural rules',
  ],
  [
    'docs/v5/STYLING_RECIPES.md',
    'Styling recipes by library',
    'theme, unstyled and composed snippets for plain CSS, CSS Modules, Tailwind, shadcn/ui, Emotion, styled-components and MUI',
  ],
  ['docs/v5/DATA_API.md', 'Data API', 'framework-free search and lookup'],
  [
    'docs/v5/MIGRATION.md',
    'Migrating from v4',
    'what changed and how to upgrade',
  ],
  [
    'website/README.md',
    'Website examples',
    'typed customization, locale loading and composition',
  ],
];

const EXAMPLES: Array<[string, string, string]> = [
  [
    'stories/recipes/README.md',
    'Design recipes',
    '25 designs, each in seven styling stacks',
  ],
  [
    'stories/integrations/README.md',
    'Styling integrations',
    'shadcn/ui, Tailwind, Emotion, styled-components, CSS Modules, CSS, MUI',
  ],
  [
    'example/README.md',
    'Example app',
    'Vite + React 19 app running the batteries-included, unstyled, composed and data-API paths',
  ],
];

// One complete worked example inlined into llms-full.txt: the picker-only
// composition plus its styles, never the surrounding demo app chrome.
const WORKED_EXAMPLE = [
  'stories/recipes/team-chat/picker.tsx',
  'stories/recipes/team-chat/picker.css',
];

const read = (file: string) => readFileSync(join(root, file), 'utf8').trim();

/**
 * Names exported by an entry source file: `export { a, b as c } from`,
 * `export type { … }`, `export default function X`, and local
 * `export function|const|enum|class|interface|type X`.
 */
function exportsOf(file: string) {
  const text = read(file);
  const values = new Set<string>();
  const types = new Set<string>();
  let defaultName: string | null = null;

  for (const match of text.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
    const listIsType = !!match[1];
    for (const raw of match[2].split(',')) {
      let item = raw.trim();
      if (!item) continue;
      const inlineType = /^type\s+/.test(item);
      item = item.replace(/^type\s+/, '');
      const alias = item.match(/\bas\s+(\w+)$/);
      const name = alias ? alias[1] : item.split(/\s+/)[0];
      (listIsType || inlineType ? types : values).add(name);
    }
  }
  const defaultMatch = text.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultMatch) defaultName = defaultMatch[1];
  for (const match of text.matchAll(/^export\s+(interface|type)\s+(\w+)/gm)) {
    types.add(match[2]);
  }
  for (const match of text.matchAll(
    /^export\s+(?:async\s+)?(function|const|let|enum|class)\s+(\w+)/gm,
  )) {
    values.add(match[2]);
  }
  const sorted = (set: Set<string>) =>
    [...set].sort((a, b) => a.localeCompare(b));
  return { defaultName, values: sorted(values), types: sorted(types) };
}

function exportIndex() {
  const lines = ['Exports (generated from the entry sources):', ''];
  for (const [specifier, file] of ENTRIES) {
    const { defaultName, values, types } = exportsOf(file);
    const parts = [];
    if (defaultName) parts.push(`default \`${defaultName}\``);
    if (values.length)
      parts.push(`values ${values.map((n) => `\`${n}\``).join(', ')}`);
    if (types.length)
      parts.push(`types ${types.map((n) => `\`${n}\``).join(', ')}`);
    lines.push(`- \`${specifier}\`: ${parts.join('; ')}.`);
  }
  lines.push(
    `- \`emoji-picker-react/data/emojis-<locale>\`: default export, an \`EmojiData\` dataset (${LOCALES}).`,
  );
  return lines.join('\n');
}

const link = ([file, title, description]: [string, string, string]) =>
  `- [${title}](${RAW}/${file}): ${description}`;

const EXPORTS = exportIndex();

const index = [
  '# emoji-picker-react',
  '',
  `> ${SUMMARY}`,
  '',
  KEY_FACTS,
  '',
  EXPORTS,
  '',
  QUICK_REFERENCE,
  '',
  '## Docs',
  '',
  ...DOCS.map(link),
  '',
  '## Examples',
  '',
  ...EXAMPLES.map(link),
  '',
  '## Optional',
  '',
  `- [llms-full.txt](${RAW}/llms-full.txt): the complete documentation in one file`,
  '',
].join('\n');

const sections = [...DOCS, ...EXAMPLES];
const full = [
  '# emoji-picker-react — complete documentation',
  '',
  `> ${SUMMARY}`,
  '',
  '> Generated by `npm run docs:llms`. Do not edit by hand.',
  '',
  KEY_FACTS,
  '',
  EXPORTS,
  '',
  QUICK_REFERENCE,
  '',
  'Contents:',
  '',
  ...sections.map(
    ([file, title, description], i) =>
      `${i + 1}. ${title} (${file}): ${description}`,
  ),
  `${sections.length + 1}. Worked example: team chat picker composition (stories/recipes/team-chat/picker.tsx; picker only, demo app chrome excluded)`,
];
for (const [file, title] of sections) {
  full.push(
    '',
    `<!-- source: ${file} -->`,
    '',
    `<!-- ${title} -->`,
    '',
    read(file),
  );
}
full.push(
  '',
  '<!-- worked example: team chat picker composition (stories/recipes/team-chat/picker.tsx; picker only, demo app chrome excluded) -->',
);
for (const file of WORKED_EXAMPLE) {
  const lang = file.endsWith('.css') ? 'css' : 'tsx';
  full.push('', `\`${file}\``, '', '```' + lang, read(file), '```');
}

writeFileSync(join(root, 'llms.txt'), index);
writeFileSync(join(root, 'llms-full.txt'), `${full.join('\n')}\n`);

const websitePublic = join(root, 'website', 'public');
if (existsSync(websitePublic)) {
  copyFileSync(join(root, 'llms.txt'), join(websitePublic, 'llms.txt'));
  copyFileSync(
    join(root, 'llms-full.txt'),
    join(websitePublic, 'llms-full.txt'),
  );
}
console.log(
  `llms.txt (index) and llms-full.txt written from ${sections.length} docs and ${ENTRIES.length} entry sources.`,
);
