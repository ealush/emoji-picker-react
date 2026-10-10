// Ports every Storybook recipe (stories/recipes/*) into the website's live
// Designs gallery. Storybook stays the source of truth; run
// `npm run designs` after changing a recipe and commit the output.
//
// For each recipe:
//   shell.tsx            -> website/src/components/designs/<Name>.tsx
//   picker.tsx           -> website/src/components/designs/<Name>Picker.tsx
//   app.css + panel.css + picker.css -> website/src/styles/designs/<dir>.css
//   picker.tsx + panel.css + picker.css -> website/public/recipes/<dir>.json
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
import { readRecipe, type Recipe } from './recipeMetadata.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipesDir = path.join(root, 'stories/recipes');
const componentsDir = path.join(root, 'website/src/components/designs');
const stylesDir = path.join(root, 'website/src/styles/designs');
const sourcesDir = path.join(root, 'website/public/recipes');
// Gallery thumbnails for the website carousel (same images as the README).
const thumbnailsDir = path.join(root, 'website/public/designs');
const screenshotsDir = path.join(root, 'docs/designs');
const baselinesDir = path.join(root, 'playwright/recipes.spec.ts-snapshots');
const readmePath = path.join(root, 'README.md');
const DEMO_URL = 'https://ealush.com/emoji-picker-react/#designs';
const GALLERY_COLUMNS = 3;

const recipes = fs
  .readdirSync(recipesDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      fs.existsSync(path.join(recipesDir, entry.name, 'recipe.json')),
  )
  .map((entry) => {
    const dir = entry.name;
    const recipe = readRecipe(path.join(recipesDir, dir, 'recipe.json'));
    return { dir, ...recipe };
  })
  .sort((a, b) => a.order - b.order);

// Library imports resolve to the package the website installs; the
// stylesheet is bundled through styles/designs/index.css instead.
function rewriteImports(source: string) {
  return source
    .replace(
      /from '\.\.\/\.\.\/\.\.\/src\/primitives'/g,
      "from 'emoji-picker-react/primitives'",
    )
    .replace(/from '\.\.\/\.\.\/\.\.\/src'/g, "from 'emoji-picker-react'");
}

// Ports one recipe module for the website gallery: package imports are
// rewritten and raw CSS imports are stripped (gallery styles arrive
// through styles/designs/index.css). Relative imports beyond the
// allow-list fail the port.
function portModule(
  source: string,
  dir: string,
  file: string,
  allow: string[] = [],
) {
  const ported = rewriteImports(source).replace(
    /^import '\.\/(app|panel)\.css';\n/m,
    '',
  );
  const leftover = ported.match(
    /from '\.{1,2}\/[^']*'|^import '\.{1,2}\/[^']*'/m,
  );
  if (leftover && !allow.includes(leftover[0])) {
    throw new Error(
      `stories/recipes/${dir}/${file}: unported import ${leftover[0]}`,
    );
  }
  return (
    `// Generated from stories/recipes/${dir} by scripts/portDesigns.mts.\n` +
    `// Do not edit; change the recipe and run \`npm run designs\`.\n` +
    ported
  );
}

// Ports picker.tsx for the snippet payload: same import rewrite, but the
// sibling panel.css import stays (consumers download it alongside).
function portSnippet(source: string, dir: string) {
  const ported = rewriteImports(source);
  const relativeImports =
    ported.match(/^import .* from '\.[^']*'|^import '\.[^']*'/gm) ?? [];
  for (const statement of relativeImports) {
    if (statement.replace(/;$/, '') !== `import './panel.css'`) {
      throw new Error(
        `stories/recipes/${dir}/picker.tsx: unported import ${statement}`,
      );
    }
  }
  return ported;
}

// Validate every input before replacing any generated output. A missing
// baseline, source file, marker or unported import must leave the gallery intact.
const readme = fs.readFileSync(readmePath, 'utf8');
const markers = /<!-- DESIGNS:START[\s\S]*?<!-- DESIGNS:END -->/;
if (!markers.test(readme)) {
  throw new Error(
    'README.md: missing <!-- DESIGNS:START --> / <!-- DESIGNS:END --> markers',
  );
}
const sources = new Map<string, Record<string, string | undefined>>();
const screenshots = new Map<string, Buffer>();
for (const recipe of recipes) {
  const read = (file: string, optional = false) => {
    const filePath = path.join(recipesDir, recipe.dir, file);
    if (optional && !fs.existsSync(filePath)) return undefined;
    return fs.readFileSync(filePath, 'utf8');
  };
  const files: Record<string, string | undefined> = Object.fromEntries(
    ['shell.tsx', 'picker.tsx', 'picker.css', 'picker.module.css'].map(
      (file) => [file, read(file)],
    ),
  );
  for (const file of ['app.css', 'panel.css']) {
    files[file] = read(file, true);
  }
  portModule(
    shellForGallery(recipe, files['shell.tsx']!),
    recipe.dir,
    'shell.tsx',
    [`from './${recipe.name}Picker'`],
  );
  portModule(files['picker.tsx']!, recipe.dir, 'picker.tsx');
  portSnippet(files['picker.tsx']!, recipe.dir);
  sources.set(recipe.dir, files);
  const baseline = path.join(baselinesDir, `${storySlug(recipe.title)}.png`);
  if (!fs.existsSync(baseline)) {
    throw new Error(
      `${path.relative(root, baseline)} missing; run npx playwright test recipes`,
    );
  }
  screenshots.set(recipe.dir, fs.readFileSync(baseline));
}

fs.rmSync(componentsDir, { recursive: true, force: true });
fs.rmSync(stylesDir, { recursive: true, force: true });
fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(stylesDir, { recursive: true });

// The gallery shell renders the recipe's PickerExample, which lives in
// the sibling <Name>Picker module after porting.
function shellForGallery(recipe: Recipe & { dir: string }, source: string) {
  return source.replace("from './picker'", `from './${recipe.name}Picker'`);
}

fs.mkdirSync(sourcesDir, { recursive: true });
for (const recipe of recipes) {
  const from = (file: string) => sources.get(recipe.dir)![file]!;
  const maybe = (file: string) => sources.get(recipe.dir)![file];
  fs.writeFileSync(
    path.join(componentsDir, `${recipe.name}.tsx`),
    portModule(
      shellForGallery(recipe, from('shell.tsx')),
      recipe.dir,
      'shell.tsx',
      [`from './${recipe.name}Picker'`],
    ),
  );
  fs.writeFileSync(
    path.join(componentsDir, `${recipe.name}Picker.tsx`),
    portModule(from('picker.tsx'), recipe.dir, 'picker.tsx'),
  );
  // The snippet is picker-only: the composition plus the picker and panel
  // styles. Host app chrome (app.css) stays out of the payload.
  const imports = [`'./picker.css'`];
  if (maybe('panel.css') !== undefined) {
    imports.unshift(`'./panel.css'`);
  }
  const files = [
    { name: 'emoji-picker.tsx', content: "'use client';\n" + portSnippet(from('picker.tsx'), recipe.dir) },
    ...(maybe('panel.css') !== undefined
      ? [{ name: 'panel.css', content: maybe('panel.css')! }]
      : []),
    { name: 'picker.css', content: from('picker.css') },
    { name: 'picker.module.css', content: from('picker.module.css') },
    {
      name: 'README.md',
      content:
        `# ${recipe.title}\n\n${recipe.description}\n\n` +
        `Install emoji-picker-react 5 or later, import ${imports.join(' and ')}, then render <PickerExample className="${recipe.rootClass}" />. ` +
        `Pass onEmojiClick to insert the chosen emoji into your app. For CSS Modules, import picker.module.css and pass styles.picker as className. ` +
        `This snippet is the picker only; the surrounding demo app chrome is not included.\n`,
    },
  ];
  fs.writeFileSync(
    path.join(sourcesDir, `${recipe.dir}.json`),
    JSON.stringify({ files }, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(stylesDir, `${recipe.dir}.css`),
    `/* Generated from stories/recipes/${recipe.dir} by scripts/portDesigns.mts. */\n` +
      [maybe('app.css'), maybe('panel.css'), from('picker.css')]
        .filter((content) => content !== undefined)
        .join('\n'),
  );
}

const imports = recipes
  .map(
    (recipe) => `import { Shell as ${recipe.name} } from './${recipe.name}';`,
  )
  .join('\n');
const entries = recipes
  .map(
    (recipe) =>
      `  {\n` +
      `    id: ${JSON.stringify(recipe.dir)},\n` +
      `    title: ${JSON.stringify(recipe.title.replace(/^Examples\//, ''))},\n` +
      `    description: ${JSON.stringify(recipe.description)},\n` +
      `    rootClass: ${JSON.stringify(recipe.rootClass)},\n` +
      `    kind: ${JSON.stringify(recipe.title.startsWith('Examples/') ? 'In context' : 'Design system')},\n` +
      `    Example: (props: { className?: string }) => React.createElement(${recipe.name}, { ...props, Root: ${recipe.root === 'EmojiPicker' ? 'GalleryDefaultPicker' : 'GalleryRoot'} }),\n` +
      `  },`,
  )
  .join('\n');

fs.writeFileSync(
  path.join(componentsDir, 'index.ts'),
  `// Generated by scripts/portDesigns.mts from stories/recipes/*/recipe.json.\n` +
    `import React from 'react';\nimport { GalleryRoot, GalleryDefaultPicker } from '../GalleryPicker';\n${imports}\n\nexport const DESIGN_EXAMPLES = [\n${entries}\n];\n`,
);
fs.writeFileSync(
  path.join(stylesDir, 'index.css'),
  `/* Generated by scripts/portDesigns.mts: every recipe's host + picker CSS. */\n` +
    recipes.map((recipe) => `@import './${recipe.dir}.css';`).join('\n') +
    '\n',
);

// Storybook's story-id slug of the recipe title, which names its baseline.
function storySlug(title: string) {
  return `recipes-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

fs.rmSync(screenshotsDir, { recursive: true, force: true });
fs.mkdirSync(screenshotsDir, { recursive: true });
fs.rmSync(thumbnailsDir, { recursive: true, force: true });
fs.mkdirSync(thumbnailsDir, { recursive: true });
for (const recipe of recipes) {
  fs.writeFileSync(
    path.join(screenshotsDir, `${recipe.dir}.png`),
    screenshots.get(recipe.dir)!,
  );
  fs.writeFileSync(
    path.join(thumbnailsDir, `${recipe.dir}.png`),
    screenshots.get(recipe.dir)!,
  );
}

function galleryCell(recipe: Recipe & { dir: string }) {
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
    `<tr>${recipes
      .slice(index, index + GALLERY_COLUMNS)
      .map(galleryCell)
      .join('')}</tr>`,
  );
}
const gallery =
  `<!-- DESIGNS:START (generated by scripts/portDesigns.mts; run \`npm run designs\`) -->\n` +
  `Every design below is the same picker, recomposed and restyled. [Try them live](${DEMO_URL}).\n\n` +
  `<table>\n${rows.join('\n')}\n</table>\n` +
  `<!-- DESIGNS:END -->`;
fs.writeFileSync(readmePath, readme.replace(markers, gallery));

console.log(
  `designs: ported ${recipes.length} recipes to website/, screenshots to docs/designs/ and website/public/designs/, README gallery updated`,
);
