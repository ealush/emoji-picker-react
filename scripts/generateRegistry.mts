import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'emoji-picker',
  type: 'registry:ui',
  title: 'Emoji Picker React',
  description:
    'Composable emoji picker with keyboard navigation, localized labels, custom emoji and reactions.',
  dependencies: ['emoji-picker-react@^5.0.0'],
  files: [
    {
      path: 'registry/emoji-picker.tsx',
      type: 'registry:ui',
      content: fs.readFileSync(
        path.join(root, 'registry/emoji-picker.tsx'),
        'utf8',
      ),
    },
  ],
};
// The registry index, served flat beside its items as the shadcn registry
// directory requires (`/r/registry.json` + `/r/{name}.json`). Index entries
// list files without `content`; the item JSON carries the source.
const index = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'emoji-picker-react',
  homepage: 'https://ealush.com/emoji-picker-react',
  items: [
    {
      ...registry,
      $schema: undefined,
      files: registry.files.map(({ path: file, type }) => ({
        path: file,
        type,
      })),
    },
  ],
};
const out = path.join(root, 'website/public/r');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, 'emoji-picker.json'),
  JSON.stringify(registry, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(out, 'registry.json'),
  JSON.stringify(index, null, 2) + '\n',
);
console.log(
  'registry: generated website/public/r/emoji-picker.json and registry.json',
);
