import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';

// Compile the examples from Markdown itself, so prose cannot quietly retain
// an API removed from the implementation while a separate fixture stays green.
const repoRoot = join(__dirname, '..');
const examples = Object.entries({
  'docs/v5/API.md': 5,
  'website/README.md': 3,
  'README.md': 1,
  'docs/v5/MIGRATION.md': 1,
  'docs/v5/DEFAULT_COMPOSITION.md': 1,
  'INTERNATIONALIZATION.md': 3,
}).flatMap(([source, minimum]) => {
  const markdown = readFileSync(join(repoRoot, source), 'utf8');
  const blocks = [...markdown.matchAll(/^```tsx check\r?\n([\s\S]*?)^```/gm)];
  if (blocks.length < minimum)
    throw new Error(`${source} must retain ${minimum} checked examples`);
  return blocks.map(([block, code]) => ({
    source,
    code,
    line: markdown.slice(0, markdown.indexOf(block)).split('\n').length,
  }));
});
const scratchParent = join(repoRoot, '.codex-tmp');
mkdirSync(scratchParent, { recursive: true });
const scratch = mkdtempSync(join(scratchParent, 'api-docs-'));
try {
  const files = examples.map(({ source, code, line }, index) => {
    const file = join(scratch, `example-${index + 1}.tsx`);
    writeFileSync(file, `// ${source}:${line}\n${code}`);
    return file;
  });
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2019,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    jsx: ts.JsxEmit.React,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    types: ['node'],
    baseUrl: repoRoot,
    paths: {
      'emoji-picker-react': ['src/index.tsx'],
      'emoji-picker-react/primitives': ['src/primitives/index.ts'],
      'emoji-picker-react/data': ['src/data.ts'],
      'emoji-picker-react/data/emojis-*': ['src/data/emojis-*'],
    },
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    const host: ts.FormatDiagnosticsHost = {
      getCurrentDirectory: () => repoRoot,
      getCanonicalFileName: (file) => file,
      getNewLine: () => '\n',
    };
    throw new Error(ts.formatDiagnostics(diagnostics, host));
  }
  console.log(`Public documentation: ${examples.length} examples type-check`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
