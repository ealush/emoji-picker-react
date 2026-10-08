import { render } from '@testing-library/react';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';

// Server rendering has no document: the markup browsers receive.
function serverStyles(element: React.ReactElement): string[] {
  vi.stubGlobal('document', undefined);
  try {
    const html = renderToString(element);
    return (html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) ?? []).map((tag) =>
      tag.replace(/^<style[^>]*>|<\/style>$/g, ''),
    );
  } finally {
    vi.unstubAllGlobals();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('library CSS cascade', () => {
  it('is unlayered by default, so ordinary app resets do not override it', () => {
    const styles = serverStyles(<EmojiPicker />);
    expect(styles.length).toBeGreaterThan(0);
    for (const css of styles) {
      expect(css.startsWith('@layer')).toBe(false);
    }
  });

  it('emits design tokens at zero specificity so any selector overrides them', () => {
    const css = serverStyles(<EmojiPicker />).join('\n');
    const tokenRules = css
      .split('\n')
      .filter((line) => /\{--epr-[\w-]+:/.test(line));
    expect(tokenRules.length).toBeGreaterThan(10);
    for (const rule of tokenRules) {
      expect(rule.startsWith(':where(')).toBe(true);
    }
    // Ordinary rules keep their class specificity.
    expect(
      css.split('\n').some((line) => /^\.epr_[\w-]+ \{[a-z]/.test(line)),
    ).toBe(true);
  });

  it('cssLayer opts into a named cascade layer (Tailwind v4)', () => {
    for (const css of serverStyles(<EmojiPicker cssLayer="epr" />)) {
      expect(css).toMatch(/^@layer epr\{/);
    }
  });

  it('ignores an invalid layer name', () => {
    for (const css of serverStyles(
      <EmojiPicker cssLayer={'x;}' as string} />,
    )) {
      expect(css.startsWith('@layer')).toBe(false);
    }
  });

  it('leaves layers and token selectors plain under jsdom', () => {
    const { container } = render(<EmojiPicker cssLayer="epr" />);
    for (const style of Array.from(container.querySelectorAll('style'))) {
      expect(style.innerHTML.startsWith('@layer')).toBe(false);
      const tokenRules = style.innerHTML
        .split('\n')
        .filter((line) => /\{--epr-[\w-]+:/.test(line));
      expect(tokenRules.every((line) => !line.startsWith(':where('))).toBe(
        true,
      );
    }
  });
});
