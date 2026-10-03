import { render } from '@testing-library/react';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';

describe('library CSS cascade layer', () => {
  it('ships every rule inside @layer epr in browser/server output', () => {
    // Server rendering has no document: the markup browsers receive.
    vi.stubGlobal('document', undefined);
    let html = '';
    try {
      html = renderToString(<EmojiPicker />);
    } finally {
      vi.unstubAllGlobals();
    }
    const styles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) ?? [];
    expect(styles.length).toBeGreaterThan(0);
    for (const style of styles) {
      expect(style).toMatch(/<style[^>]*>@layer epr\{/);
    }
  });

  it('stays unlayered under jsdom, which ignores @layer rules', () => {
    const { container } = render(<EmojiPicker />);
    for (const style of Array.from(container.querySelectorAll('style'))) {
      expect(style.innerHTML.startsWith('@layer')).toBe(false);
    }
  });
});
