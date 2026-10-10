// @vitest-environment node
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';

// v5 generates no library-owned DOM IDs and no IDREF relationships. Consumer-supplied `id`
// props remain allowed, so these fixtures pass none.

describe('v5 SSR identity (no library-owned IDs)', () => {
  it('one default picker renders zero id attributes and zero IDREFs', () => {
    const html = renderToString(<EmojiPicker />);

    expect(html).not.toMatch(/\sid="/);
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('aria-labelledby');
    expect(html).not.toContain('aria-describedby');
  });

  it('two default pickers still render zero ids', () => {
    const html = renderToString(
      <>
        <EmojiPicker />
        <EmojiPicker />
      </>,
    );

    expect(html).not.toMatch(/\sid="/);
    expect(html).not.toContain('aria-controls');
  });

  it('removes the legacy fixed global ids', () => {
    const html = renderToString(<EmojiPicker />);

    expect(html).not.toContain('epr-search-id');
    expect(html).not.toContain('epr-category-nav-id');
  });
});
