// Generates every styling-stack variant of every design recipe.
//
// Each recipe folder (stories/recipes/<slug>/) holds:
//   recipe.json  title, export name, picker root class, root component
//   shell.tsx    the composition (JSX) + mock app chrome, shared by stacks
//   app.css      the mock app's CSS, shared by stacks
//   picker.css   the picker's styles — the source of truth
//
// From picker.css this script writes:
//   picker.module.css   the CSS Modules variant
//   <Name>.stories.tsx  stories for CSS, CSS Modules, Emotion,
//                       styled-components, MUI, Tailwind and shadcn/ui
//
// All variants of a recipe are screenshot-tested against one baseline, so
// a stack that renders differently fails. Run: npm run recipes
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import postcss from 'postcss';

const recipesDir = join(import.meta.dirname, '..', 'stories', 'recipes');

// shadcn/ui semantic variables a brand palette maps onto.
const SHADCN_TOKENS = {
  '--epr-bg-color': '--popover',
  '--epr-text-color': '--muted-foreground',
  '--epr-highlight-color': '--primary',
  '--epr-hover-bg-color': '--accent',
  '--epr-picker-border-color': '--border',
  '--epr-search-border-color': '--input',
  '--epr-search-border-color-active': '--ring',
  '--epr-search-input-text-color': '--popover-foreground',
};

function parsePicker(css, rootClass) {
  const rootSelector = new RegExp(`^\\.${rootClass}(?![\\w-])`);
  const rules = [];
  postcss.parse(css).walkRules((rule) => {
    const selectors = rule.selectors.map((selector) => selector.trim());
    for (const selector of selectors) {
      if (!rootSelector.test(selector)) {
        throw new Error(
          `${rootClass}: picker.css rule "${selector}" is not scoped to .${rootClass}`,
        );
      }
    }
    const decls = [];
    rule.walkDecls((decl) => {
      decls.push({ prop: decl.prop, value: decl.value.replace(/\s+/g, ' ') });
    });
    rules.push({
      // Selector relative to the root: '' (the root itself), ' [part]',
      // '[data-epr-part=root]', ' .cell:hover', …
      rests: selectors.map((selector) => selector.replace(rootSelector, '')),
      decls,
    });
  });
  return rules;
}

// --- CSS-in-JS (Emotion / styled-components): nested template ----------------
function toTemplate(rules) {
  const lines = [];
  for (const { rests, decls } of rules) {
    const body = decls.map(({ prop, value }) => `${prop}: ${value};`);
    if (rests.length === 1 && rests[0] === '') {
      lines.push(...body.map((line) => `  ${line}`));
    } else {
      lines.push('', `  ${rests.map((rest) => `&${rest}`).join(',\n  ')} {`);
      lines.push(...body.map((line) => `    ${line}`), '  }');
    }
  }
  return lines.join('\n').replace(/`/g, '\\`');
}

// --- MUI styled(): object syntax ------------------------------------------
const camel = (prop) =>
  prop.startsWith('--')
    ? prop
    : prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

function toObject(rules, indent = '  ') {
  const lines = [];
  const entries = (decls, pad) =>
    decls.map(
      ({ prop, value }) =>
        `${pad}${JSON.stringify(camel(prop)).replace(/^"([a-zA-Z]+)"$/, '$1')}: ${JSON.stringify(value)},`,
    );
  for (const { rests, decls } of rules) {
    if (rests.length === 1 && rests[0] === '') {
      lines.push(...entries(decls, indent));
    } else {
      const key = rests.map((rest) => `&${rest}`).join(', ');
      lines.push(`${indent}${JSON.stringify(key)}: {`);
      lines.push(...entries(decls, indent + '  '), `${indent}},`);
    }
  }
  return lines.join('\n');
}

// --- CSS Modules -----------------------------------------------------------
function toModule(rules, header) {
  const out = [header];
  for (const { rests, decls } of rules) {
    const selectors = rests.map(
      (rest) =>
        '.picker' +
        // Other classes in the selector belong to the shell (custom cells,
        // headers): keep them global.
        rest.replace(/\.([a-zA-Z][\w-]*)/g, ':global(.$1)'),
    );
    out.push(
      `${selectors.join(',\n')} {`,
      ...decls.map(({ prop, value }) => `  ${prop}: ${value};`),
      '}',
    );
  }
  return out.join('\n') + '\n';
}

// --- Tailwind: arbitrary properties and variants ---------------------------
// Spaces become underscores. Leading whitespace is significant in
// selectors (descendant vs compound), so it is never trimmed there.
function twValue(text, where, { trim = true } = {}) {
  if (text.includes('_')) {
    throw new Error(`underscore in ${where} cannot be expressed in Tailwind`);
  }
  return (trim ? text.trim() : text).replace(/\s+/g, '_');
}

// Attribute values that are identifiers lose their quotes:
// [data-epr-part='emoji'] -> [data-epr-part=emoji].
const unquoteAttributes = (selector) =>
  selector.replace(/=(['"])([\w-]+)\1\]/g, '=$2]');

function toTailwind(rules, tokenOverride = {}) {
  const classes = [];
  for (const { rests, decls } of rules) {
    for (const rest of rests) {
      const variant =
        rest === ''
          ? ''
          : `[&${twValue(unquoteAttributes(rest), rest, { trim: false })}]:`;
      for (const { prop, value } of decls) {
        const finalValue = rest === '' && tokenOverride[prop] ? tokenOverride[prop] : value;
        classes.push(`${variant}[${prop}:${twValue(finalValue, prop)}]`);
      }
    }
  }
  return classes;
}

const quote = (text) =>
  text.includes("'") ? JSON.stringify(text) : `'${text}'`;

function generate(slug) {
  const folder = join(recipesDir, slug);
  const recipe = JSON.parse(readFileSync(join(folder, 'recipe.json'), 'utf8'));
  const css = readFileSync(join(folder, 'picker.css'), 'utf8');
  const rules = parsePicker(css, recipe.rootClass);

  writeFileSync(
    join(folder, 'picker.module.css'),
    toModule(
      rules,
      `/* Generated by scripts/generateRecipes.mjs from picker.css — do not edit. */`,
    ),
  );

  const rootDecls = rules.find(
    (rule) => rule.rests.length === 1 && rule.rests[0] === '',
  )?.decls ?? [];
  const shadcnTheme = {};
  const shadcnTokens = {};
  for (const { prop, value } of rootDecls) {
    const variable = SHADCN_TOKENS[prop];
    // Values that reference other variables would not resolve where the
    // theme is declared (outside the picker).
    if (variable && !value.includes('var(')) {
      shadcnTheme[variable] = value;
      shadcnTokens[prop] = `var(${variable})`;
    }
  }

  const isDefault = recipe.root === 'EmojiPicker';
  const rootImport = isDefault
    ? `import EmojiPicker from '../../../src';`
    : `import * as Picker from '../../../src/primitives';`;
  const root = isDefault ? 'EmojiPicker' : 'Picker.Root';
  const list = (classes) =>
    `[\n${classes.map((name) => `  ${quote(name)},`).join('\n')}\n].join(' ')`;

  const stories = `// Generated by scripts/generateRecipes.mjs from picker.css — do not edit.
// Change picker.css or shell.tsx, then run \`npm run recipes\`.
//
// The same design in seven styling stacks. Every variant renders the shared
// shell (shell.tsx) and is screenshot-tested against one baseline.
import styledEmotion from '@emotion/styled';
import { styled as styledMui } from '@mui/material/styles';
import type { Meta } from '@storybook/react-vite';
import React from 'react';
import styledComponents from 'styled-components';

${rootImport}

import modules from './picker.module.css';
import { Shell } from './shell';

import '../../integrations/tailwind.css';
import './picker.css';

const meta = {
  title: 'Recipes/${recipe.title}',
  tags: ['recipe'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

/** Plain CSS: picker.css, applied with className. */
export const CSS = () => <Shell className="${recipe.rootClass}" />;

/** CSS Modules: picker.module.css. */
export const CSSModules = () => <Shell className={modules.picker} />;

/** Emotion: styled() over the picker root. */
const EmotionRoot = styledEmotion(${root})\`
${toTemplate(rules)}
\`;

export const Emotion = () => <Shell Root={EmotionRoot} />;

/** styled-components: styled() over the picker root. */
const StyledComponentsRoot = styledComponents(${root})\`
${toTemplate(rules)}
\`;

export const StyledComponents = () => <Shell Root={StyledComponentsRoot} />;

/** MUI: styled() with object styles (plug in theme values as needed). */
const MuiRoot = styledMui(${root})({
${toObject(rules)}
});

export const MUI = () => <Shell Root={MuiRoot} />;

/**
 * Tailwind v4: arbitrary properties for tokens, arbitrary variants for
 * parts. cssLayer="epr" puts the picker's CSS in a cascade layer declared
 * before Tailwind's (\`@layer epr, theme, base, components, utilities;\`),
 * so utilities override it.
 */
const LayeredRoot = (props: React.ComponentProps<typeof ${root}>) => (
  <${root} cssLayer="epr" {...props} />
);

const tailwind = ${list(toTailwind(rules))};

export const Tailwind = () => <Shell Root={LayeredRoot} className={tailwind} />;

/**
 * shadcn/ui: the brand palette lives in shadcn's theme variables (your
 * globals.css); the picker classes consume them, so it follows the theme.
 */
const shadcnTheme = ${JSON.stringify(shadcnTheme, null, 2).replace(/\n/g, '\n')} as React.CSSProperties;

const shadcn = ${list(toTailwind(rules, shadcnTokens))};

export const Shadcn = () => (
  // display: contents — the theme scope adds no box.
  <div style={{ display: 'contents', ...shadcnTheme }}>
    <Shell Root={LayeredRoot} className={shadcn} />
  </div>
);
`;
  writeFileSync(join(folder, `${recipe.name}.stories.tsx`), stories);
  return recipe;
}

const slugs = readdirSync(recipesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => existsSync(join(recipesDir, entry.name, 'recipe.json')))
  .map((entry) => entry.name)
  .sort();

for (const slug of slugs) {
  const recipe = generate(slug);
  console.log(`recipe: ${recipe.title} (7 stacks)`);
}
