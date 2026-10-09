import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';

import { describe, expect, it } from 'vitest';

// Inspect attribute/property declarations, never selectors or comments.
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.d\.ts$/.test(entry) ? [full] : [];
  });
}

function declaredParts(text: string): Set<string> {
  const parts = new Set<string>();
  const source = ts.createSourceFile(
    'part.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node: ts.Node) {
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(source) === 'data-epr-part'
    ) {
      const value = node.initializer;
      if (value && ts.isStringLiteral(value)) parts.add(value.text);
      if (
        value &&
        ts.isJsxExpression(value) &&
        value.expression &&
        ts.isStringLiteral(value.expression)
      ) {
        parts.add(value.expression.text);
      }
    }
    // Managed button props are also assembled as objects before forwarding.
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.name) &&
      node.name.text === 'data-epr-part' &&
      ts.isStringLiteral(node.initializer)
    ) {
      parts.add(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return parts;
}

function emittedParts(
  transform = (_file: string, text: string) => text,
): Set<string> {
  const parts = new Set<string>();
  for (const file of sourceFiles(join(process.cwd(), 'src'))) {
    for (const part of declaredParts(
      transform(file, readFileSync(file, 'utf8')),
    ))
      parts.add(part);
  }
  return parts;
}

function documentedParts(): Set<string> {
  const text = readFileSync(
    join(process.cwd(), 'docs', 'v5', 'STYLING.md'),
    'utf8',
  );
  const section = text.slice(
    text.indexOf('## 5. Stable part selectors'),
    text.indexOf('## 6.'),
  );
  return new Set(
    Array.from(section.matchAll(/^- `([a-z-]+)`/gm)).map((match) => match[1]),
  );
}

describe('data-epr-part contract', () => {
  it('documents every emitted part and emits every documented part', () => {
    expect([...emittedParts()].sort()).toEqual([...documentedParts()].sort());
  });

  it('ignores selectors and comments while recognizing JSX and forwarded props', () => {
    expect(
      [
        ...declaredParts(`
      // data-epr-part="comment"
      element.closest('[data-epr-part="selector"]');
      const props = { 'data-epr-part': 'button' };
      const view = <><div data-epr-part="direct" /><div data-epr-part={'expression'} /></>;
    `),
      ].sort(),
    ).toEqual(['button', 'direct', 'expression']);
  });

  it('detects a missing Root emitter even when root selectors remain', () => {
    const parts = emittedParts((file, text) =>
      file.endsWith('/primitives/Root.tsx')
        ? text.replace('data-epr-part="root"', '')
        : text,
    );
    expect(parts.has('root')).toBe(false);
    expect([...parts].sort()).not.toEqual([...documentedParts()].sort());
  });
});
