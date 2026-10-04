import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'emoji-picker', type: 'registry:ui',
  title: 'Emoji Picker React',
  description: 'Composable emoji picker with keyboard navigation, localized labels, custom emoji and reactions.',
  dependencies: ['emoji-picker-react@^5.0.0'],
  files: [{
    path: 'registry/emoji-picker.tsx', type: 'registry:ui',
    content: fs.readFileSync(path.join(root, 'registry/emoji-picker.tsx'), 'utf8'),
  }],
};
const out = path.join(root, 'website/public/r');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'emoji-picker.json'), JSON.stringify(registry, null, 2) + '\n');
console.log('registry: generated website/public/r/emoji-picker.json');
