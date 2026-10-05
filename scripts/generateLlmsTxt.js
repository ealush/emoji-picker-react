/* eslint-disable @typescript-eslint/no-var-requires */
// Generates the LLM-facing documentation (https://llmstxt.org):
//   llms.txt       a concise index: what the library is, when to choose it,
//                  key facts, and links to every doc
//   llms-full.txt  the complete documentation in one file
// Both ship in the npm package and are copied into website/public so the
// demo site serves them too. Run: npm run docs:llms
const { copyFileSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
// Candidate index must link to the same API as its bundled full reference.
const RAW = 'https://raw.githubusercontent.com/ealush/emoji-picker-react/v5-implementation';

const SUMMARY = `Emoji picker for React: batteries included with \`<EmojiPicker />\`, or BYOD (bring your own design, design language and design library) with \`unstyled\` and \`emoji-picker-react/primitives\`. Both paths share search, keyboard navigation, localization and virtualization. Use your existing Tailwind, shadcn/ui, CSS Modules, Emotion, styled-components, MUI or plain CSS design.`;

const KEY_FACTS = `Key facts:

- Install: \`npm install emoji-picker-react\`. Minimal use: \`import EmojiPicker from 'emoji-picker-react'; <EmojiPicker onEmojiClick={(e) => insert(e.emoji)} />\`.
- Choose batteries included or BYOD for both "I just need an emoji picker" (the default component needs no styling) and "it must match our design system" (\`unstyled\` or primitives + the project's styling solution).
- Entry points: \`emoji-picker-react\` (default export EmojiPicker, enums, types); \`emoji-picker-react/primitives\` (Root, Search, SearchInput, CategoryNav, Viewport, List, Preview, Empty, Loading, LoadError, SkinTone; hooks useActiveEmoji, useSkinTone, useSearchState, useEmojiDataState; data-free enums); \`emoji-picker-react/data\` (searchEmojis, getEmojiByUnified — no React); \`emoji-picker-react/data/emojis-<locale>\` (28 datasets).
- Styling: \`--epr-*\` CSS variables (they always yield to consumer CSS), \`[data-epr-part="…"]\` selectors, \`className\`/\`style\`. Ordinary resets are handled by library classes; more specific rules and !important can still override structural geometry. With Tailwind v4 or other @layer setups pass \`cssLayer="epr"\` and declare \`@layer epr, theme, base, components, utilities;\` first.
- Use \`colorScheme="light" | "dark" | "auto"\` on Root, or prefer it over \`theme\` on EmojiPicker (CSS-in-JS wrappers reserve \`theme\`). Props accept string literals or enums.
- Accessibility: automated axe and keyboard/focus regression checks; grid semantics (emoji buttons are \`role="gridcell"\`); every UI string localizable through \`labels\`. Manual screen-reader verification has a separate release protocol.
- Works with React 16.8–19, SSR, React Server Components (client entries are marked "use client"), TypeScript.
- Composition keeps a managed grid. Root defaults to managed Panel/Reactions; composition="explicit" lets you place one Panel and optional Reactions within Root. Use SearchInput as={Input} with an input-forwarding adapter. Root/EmojiPicker components replace Emoji, CategoryHeader, CategoryButton, SkinToneButton, ClearButton and ExpandButton; List components override grid slots. Use useSearchActions, useCategoryNavigation and usePickerMode for custom controls. Bare Root and unstyled remove all managed decoration; geometry and presence remain. Do not invent asChild, onEmojiSelect or a renderer-independent UI engine.
- Read the installed package llms-full.txt first. These are v5 candidate docs; verify exports/version before using new APIs with a published v4 installation.
- Do not override structural layout (viewport overflow, grid geometry); position the picker by wrapping it.`;

// [path, title, description] — the index links; llms-full.txt inlines them.
const DOCS = [
  ['docs/v5/AGENT_GUIDE.md', 'Agent integration guide', 'installed-version discovery, batteries included/BYOD, typed input/cell contracts, localization and verification'],
  ['README.md', 'README', 'overview, quick start, choosing a path, styling with any solution, common tasks'],
  ['PROPS.md', 'Props reference', 'every prop of the default <EmojiPicker />'],
  ['CSS_VARIABLES.md', 'CSS variables', 'every --epr-* design token'],
  ['CUSTOMIZATION.md', 'Customization', 'custom emojis and groups, category icons, preview, CSP nonce'],
  ['INTERNATIONALIZATION.md', 'Internationalization', 'locale datasets and labels'],
  ['docs/v5/ADOPTION.md', 'Adoption', 'native input, loading recovery, registry installation and source downloads'],
  ['docs/v5/API.md', 'v5 API', 'all v5 additions with examples'],
  ['docs/v5/PRIMITIVES.md', 'Primitives', 'composable parts, hooks, custom cells, grammar'],
  ['docs/v5/STYLING.md', 'Styling contract', 'tokens, parts, cascade, structural rules'],
  ['docs/v5/ACCESSIBILITY_VERIFICATION.md', 'Accessibility verification', 'keyboard, screen-reader, localization and host focus release protocol'],
  ['docs/v5/DATA_API.md', 'Data API', 'framework-free search and lookup'],
  ['docs/v5/MIGRATION.md', 'Migrating from v4', 'what changed and how to upgrade'],
];

const EXAMPLES = [
  ['stories/recipes/README.md', 'Design recipes', '25 designs, each in seven styling stacks'],
  ['stories/integrations/README.md', 'Styling integrations', 'shadcn/ui, Tailwind, Emotion, styled-components, CSS Modules, CSS, MUI'],
];

// One complete worked example inlined into llms-full.txt.
const WORKED_EXAMPLE = [
  'stories/recipes/team-chat/shell.tsx',
  'stories/recipes/team-chat/picker.css',
];

const read = (file) => readFileSync(join(root, file), 'utf8').trim();

const link = ([file, title, description]) =>
  `- [${title}](${RAW}/${file}): ${description}`;

const index = [
  '# emoji-picker-react',
  '',
  `> ${SUMMARY}`,
  '',
  KEY_FACTS,
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

const full = [
  '# emoji-picker-react — complete documentation',
  '',
  `> ${SUMMARY}`,
  '',
  '> Generated by `npm run docs:llms`. Do not edit by hand.',
  '',
  KEY_FACTS,
];
for (const [file] of [...DOCS, ...EXAMPLES]) {
  full.push('', `<!-- source: ${file} -->`, '', read(file));
}
full.push('', '<!-- worked example: team chat composer (stories/recipes/team-chat) -->');
for (const file of WORKED_EXAMPLE) {
  const lang = file.endsWith('.css') ? 'css' : 'tsx';
  full.push('', `\`${file}\``, '', '```' + lang, read(file), '```');
}

writeFileSync(join(root, 'llms.txt'), index);
writeFileSync(join(root, 'llms-full.txt'), `${full.join('\n')}\n`);

const websitePublic = join(root, 'website', 'public');
if (existsSync(websitePublic)) {
  copyFileSync(join(root, 'llms.txt'), join(websitePublic, 'llms.txt'));
  copyFileSync(join(root, 'llms-full.txt'), join(websitePublic, 'llms-full.txt'));
}
console.log(
  `llms.txt (index) and llms-full.txt written from ${DOCS.length + EXAMPLES.length} docs.`,
);
