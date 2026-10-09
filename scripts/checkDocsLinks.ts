import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const files = [
  'README.md',
  'CONTRIBUTING.md',
  'PROPS.md',
  'CSS_VARIABLES.md',
  'CUSTOMIZATION.md',
  'INTERNATIONALIZATION.md',
  'scripts/README.md',
  'website/README.md',
  ...readdirSync(join(root, 'docs/v5'))
    .filter((file) => file.endsWith('.md'))
    .map((file) => `docs/v5/${file}`),
];
const errors: string[] = [];
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  // Ignore sample Markdown inside fenced examples; check authored navigation.
  const prose = text.replace(
    /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm,
    (block) => block.replace(/[^\n]/g, ' '),
  );
  for (const match of prose.matchAll(
    /\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g,
  )) {
    const target = match[1].split(/[?#]/)[0];
    if (!target || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(target)) continue;
    const line = prose.slice(0, match.index).split('\n').length;
    if (!existsSync(resolve(root, dirname(file), decodeURIComponent(target)))) {
      errors.push(`${file}:${line}: missing ${target}`);
    }
  }
}
if (errors.length)
  throw new Error(`Broken documentation links:\n${errors.join('\n')}`);
console.log(`Documentation links: ${files.length} Markdown files checked`);
