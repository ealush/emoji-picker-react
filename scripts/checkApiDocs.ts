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
const sourcePath = join(repoRoot, 'docs/v5/API.md');
const markdown = readFileSync(sourcePath, 'utf8');
const examples = [...markdown.matchAll(/^```tsx check\r?\n([\s\S]*?)^```/gm)];
if (examples.length < 5) {
  throw new Error('API.md must retain at least five checked usage examples');
}
const scratchParent = join(repoRoot, '.codex-tmp');
mkdirSync(scratchParent, { recursive: true });
const scratch = mkdtempSync(join(scratchParent, 'api-docs-'));
try {
  const files = examples.map(([block, code], index) => {
    const file = join(scratch, `example-${index + 1}.tsx`);
    const offset = markdown.indexOf(block);
    const line = markdown.slice(0, offset).split('\n').length;
    writeFileSync(file, `// docs/v5/API.md:${line}\n${code}`);
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
  console.log(`API documentation: ${examples.length} examples type-check`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
