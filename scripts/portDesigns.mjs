// Ports every Storybook recipe (stories/recipes/*) into the website's live
// Designs gallery. Storybook stays the source of truth; run
// `npm run designs` after changing a recipe and commit the output.
//
// For each recipe:
//   shell.tsx            -> website/src/components/designs/<Name>.tsx
//   app.css + picker.css -> website/src/styles/designs/<dir>.css
// plus the gallery index (designs/index.ts, styles/designs/index.css),
// ordered and described by each recipe.json.
//
// README screenshots: each recipe's plain-CSS screenshot baseline
// (playwright/recipes.spec.ts-snapshots) is copied to docs/designs/ and the
// README gallery between the DESIGNS markers is rewritten. Refresh the
// baselines first (npx playwright test recipes) when a recipe changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipesDir = path.join(root, 'stories/recipes');
const componentsDir = path.join(root, 'website/src/components/designs');
const stylesDir = path.join(root, 'website/src/styles/designs');
const sourcesDir = path.join(root, 'website/public/recipes');
const screenshotsDir = path.join(root, 'docs/designs');
const baselinesDir = path.join(root, 'playwright/recipes.spec.ts-snapshots');
const readmePath = path.join(root, 'README.md');
const DEMO_URL = 'https://ealush.com/emoji-picker-react/#designs';
const GALLERY_COLUMNS = 3;

const recipes = fs
  .readdirSync(recipesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const dir = entry.name;
    const recipe = JSON.parse(
      fs.readFileSync(path.join(recipesDir, dir, 'recipe.json'), 'utf8'),
    );
    for (const key of ['title', 'name', 'rootClass', 'description', 'order']) {
      if (recipe[key] === undefined) {
        throw new Error(`stories/recipes/${dir}/recipe.json: missing "${key}"`);
      }
    }
    return { dir, ...recipe };
  })
  .sort((a, b) => a.order - b.order);

// Library imports resolve to the package the website installs; the
// stylesheet is bundled through styles/designs/index.css instead.
function portShell(source, dir) {
  const ported = source
    .replace(/from '\.\.\/\.\.\/\.\.\/src\/primitives'/g, "from 'emoji-picker-react/primitives'")
    .replace(/from '\.\.\/\.\.\/\.\.\/src'/g, "from 'emoji-picker-react'")
    .replace(/^import '\.\/app\.css';\n/m, '');
  const leftover = ported.match(/from '\.{1,2}\/[^']*'|^import '\.{1,2}\/[^']*'/m);
  if (leftover) {
    throw new Error(`stories/recipes/${dir}/shell.tsx: unported import ${leftover[0]}`);
  }
  return (
    `// Generated from stories/recipes/${dir} by scripts/portDesigns.mjs.\n` +
    `// Do not edit; change the recipe and run \`npm run designs\`.\n` +
    ported
  );
}

fs.rmSync(componentsDir, { recursive: true, force: true });
fs.rmSync(stylesDir, { recursive: true, force: true });
fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(stylesDir, { recursive: true });

fs.mkdirSync(sourcesDir, { recursive: true });
for (const recipe of recipes) {
  const from = (file) =>
    fs.readFileSync(path.join(recipesDir, recipe.dir, file), 'utf8');
  fs.writeFileSync(
    path.join(componentsDir, `${recipe.name}.tsx`),
    portShell(from('shell.tsx'), recipe.dir),
  );
  const composition = portShell(from('shell.tsx'), recipe.dir)
    .replace(/^\/\/ Generated[^\n]*\n\/\/ Do not edit[^\n]*\n/, '')
    .replace("import './app.css';\n", '');
  const files = [
    { name: 'emoji-picker.tsx', content: "'use client';\n" + composition },
    { name: 'app.css', content: from('app.css') },
    { name: 'picker.css', content: from('picker.css') },
    { name: 'picker.module.css', content: from('picker.module.css') },
    { name: 'README.md', content: `# ${recipe.title}\n\n${recipe.description}\n\nInstall the v5 emoji-picker-react candidate, import app.css and picker.css, then render <Shell className="${recipe.rootClass}" />. For CSS Modules, import picker.module.css and pass styles.picker as className. The component includes its app context; adapt its insertion callback to your product.\n` },
  ];
  fs.writeFileSync(path.join(sourcesDir, `${recipe.dir}.json`), JSON.stringify({ files }, null, 2) + '\n');
  fs.writeFileSync(
    path.join(stylesDir, `${recipe.dir}.css`),
    `/* Generated from stories/recipes/${recipe.dir} by scripts/portDesigns.mjs. */\n` +
      from('app.css') +
      '\n' +
      from('picker.css'),
  );
}

const imports = recipes
  .map((recipe) => `import { Shell as ${recipe.name} } from './${recipe.name}';`)
  .join('\n');
const entries = recipes
  .map(
    (recipe) =>
      `  {\n` +
      `    id: ${JSON.stringify(recipe.dir)},\n` +
      `    title: ${JSON.stringify(recipe.title.replace(/^Examples\//, ''))},\n` +
      `    description: ${JSON.stringify(recipe.description)},\n` +
      `    rootClass: ${JSON.stringify(recipe.rootClass)},\n` +
      `    Example: ${recipe.name},\n` +
      `  },`,
  )
  .join('\n');

fs.writeFileSync(
  path.join(componentsDir, 'index.ts'),
  `// Generated by scripts/portDesigns.mjs from stories/recipes/*/recipe.json.\n` +
    `${imports}\n\nexport const DESIGN_EXAMPLES = [\n${entries}\n];\n`,
);
fs.writeFileSync(
  path.join(stylesDir, 'index.css'),
  `/* Generated by scripts/portDesigns.mjs: every recipe's host + picker CSS. */\n` +
    recipes.map((recipe) => `@import './${recipe.dir}.css';`).join('\n') +
    '\n',
);

// Storybook's story-id slug of the recipe title, which names its baseline.
function storySlug(title) {
  return `recipes-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

fs.rmSync(screenshotsDir, { recursive: true, force: true });
fs.mkdirSync(screenshotsDir, { recursive: true });
for (const recipe of recipes) {
  const baseline = path.join(baselinesDir, `${storySlug(recipe.title)}.png`);
  if (!fs.existsSync(baseline)) {
    throw new Error(`${path.relative(root, baseline)} missing; run npx playwright test recipes`);
  }
  fs.copyFileSync(baseline, path.join(screenshotsDir, `${recipe.dir}.png`));
}

function galleryCell(recipe) {
  const title = recipe.title.replace(/^Examples\//, '');
  return (
    `<td align="center" valign="top" width="${Math.floor(100 / GALLERY_COLUMNS)}%">` +
    `<a href="stories/recipes/${recipe.dir}"><img src="docs/designs/${recipe.dir}.png" alt="${title} design example" width="260"></a>` +
    `<br><sub><b>${title}</b></sub></td>`
  );
}

const rows = [];
for (let index = 0; index < recipes.length; index += GALLERY_COLUMNS) {
  rows.push(
    `<tr>${recipes.slice(index, index + GALLERY_COLUMNS).map(galleryCell).join('')}</tr>`,
  );
}
const gallery =
  `<!-- DESIGNS:START (generated by scripts/portDesigns.mjs; run \`npm run designs\`) -->\n` +
  `Every design below is the same picker, recomposed and restyled. [Try them live](${DEMO_URL}).\n\n` +
  `<table>\n${rows.join('\n')}\n</table>\n` +
  `<!-- DESIGNS:END -->`;
const readme = fs.readFileSync(readmePath, 'utf8');
const markers = /<!-- DESIGNS:START[\s\S]*?<!-- DESIGNS:END -->/;
if (!markers.test(readme)) {
  throw new Error('README.md: missing <!-- DESIGNS:START --> / <!-- DESIGNS:END --> markers');
}
fs.writeFileSync(readmePath, readme.replace(markers, gallery));

console.log(
  `designs: ported ${recipes.length} recipes to website/, screenshots to docs/designs/, README gallery updated`,
);
