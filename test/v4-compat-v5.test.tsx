import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Emoji, EmojiStyle, Theme } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData, SuggestionMode } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

// Enum exports remain, and readable literals are
// accepted wherever the v4 enums are. Runtime behavior must be identical.
describe('v5 literal acceptance', () => {
  it('literal theme behaves like the enum', () => {
    const { container: enumTree } = render(
      <EmojiPicker emojiData={minimalEmojiData} theme={Theme.DARK} />,
    );
    const { container: literalTree } = render(
      <EmojiPicker emojiData={minimalEmojiData} theme="dark" />,
    );
    const enumAside = enumTree.querySelector('aside') as HTMLElement;
    const literalAside = literalTree.querySelector('aside') as HTMLElement;
    expect(literalAside.className).toBe(enumAside.className);
    expect(literalAside.className).toContain('epr-dark-theme');
  });

  it('literal emojiStyle resolves the same asset URLs', () => {
    const { container } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle="twitter"
        autoFocusSearch={false}
      />,
    );
    const image = container.querySelector(
      'img[src*="twitter/64/1f600.png"]',
    ) as HTMLImageElement;
    expect(image).not.toBeNull();
  });

  it('literal suggestedEmojisMode drives recent suggestions', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([
        { unified: '1f600', original: '1f600', count: 2 },
        { unified: '1f603', original: '1f603', count: 1 },
      ]),
    );
    try {
      render(
        <EmojiPicker
          emojiData={minimalEmojiData}
          suggestedEmojisMode="recent"
          autoFocusSearch={false}
        />,
      );
      // Seeded suggestion renders in Suggested *and* in its grid category.
      const matches = await screen.findAllByRole('gridcell', {
        name: 'grinning face',
      });
      expect(matches.length).toBeGreaterThanOrEqual(2);
    } finally {
      window.localStorage.clear();
    }
  });

  it('standalone Emoji accepts literal emojiStyle', () => {
    const { container } = render(<Emoji unified="1f600" emojiStyle="apple" />);
    expect(
      container.querySelector('img[src*="apple/64/1f600.png"]'),
    ).not.toBeNull();
    // Enum form renders identically.
    const { container: enumTree } = render(
      <Emoji unified="1f600" emojiStyle={EmojiStyle.APPLE} />,
    );
    expect(
      enumTree.querySelector('img[src*="apple/64/1f600.png"]'),
    ).not.toBeNull();
  });

  it('SuggestionMode enum still works', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 1 }]),
    );
    try {
      render(
        <EmojiPicker
          emojiData={minimalEmojiData}
          suggestedEmojisMode={SuggestionMode.RECENT}
          autoFocusSearch={false}
        />,
      );
      const matches = await screen.findAllByRole('gridcell', {
        name: 'grinning face',
      });
      expect(matches.length).toBeGreaterThanOrEqual(2);
    } finally {
      window.localStorage.clear();
    }
  });
});

// v4 dropped props it did not know; v5 must not forward them to the DOM
// (removed props like v3's `pickerStyle` would otherwise become invalid
// attributes, and stray handlers would go live on the aside).
describe('unknown props on the default picker', () => {
  it('are dropped (not forwarded) and warned once in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onClick = vi.fn();
    const legacyProps = {
      pickerStyle: { width: '100%' },
      groupNames: {},
      onClick,
      id: 'picker',
      'data-testid': 'host-picker',
      'aria-describedby': 'hint',
    } as Record<string, unknown>;
    const { container } = render(
      <EmojiPicker emojiData={minimalEmojiData} {...legacyProps} />,
    );
    const aside = container.querySelector('aside') as HTMLElement;

    expect(aside.hasAttribute('pickerstyle')).toBe(false);
    expect(aside.hasAttribute('groupnames')).toBe(false);
    // Identifying native attributes still reach the root element.
    expect(aside.id).toBe('picker');
    expect(aside.getAttribute('data-testid')).toBe('host-picker');
    expect(aside.getAttribute('aria-describedby')).toBe('hint');
    aside.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(
      'Ignoring unknown prop(s): pickerStyle, groupNames, onClick.',
    );

    warn.mockRestore();
    error.mockRestore();
  });
});

// v4 rendered images by default. A caller-supplied image source is an
// explicit request for images (NextChat: getEmojiUrl to its own CDN, no
// emojiStyle), so it keeps the v4 image default instead of going native.
describe('custom image sources keep image rendering', () => {
  const cdn = (unified: string, style: string) =>
    `https://cdn.example/${style}/${unified}.png`;

  it('Emoji with getEmojiUrl renders the custom image', () => {
    const { container } = render(<Emoji unified="1f600" getEmojiUrl={cdn} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/apple/1f600.png',
    );
  });

  it('Emoji with emojiUrl renders that image', () => {
    const { container } = render(
      <Emoji unified="1f600" emojiUrl="https://cdn.example/own.png" />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/own.png',
    );
  });

  it('Emoji without an image source stays native', () => {
    const { container } = render(<Emoji unified="1f600" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('😀');
  });

  it('an explicit emojiStyle always wins', () => {
    const { container } = render(
      <Emoji unified="1f600" getEmojiUrl={cdn} emojiStyle={EmojiStyle.NATIVE} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('the picker with getEmojiUrl requests images from it', async () => {
    const getEmojiUrl = vi.fn(cdn);
    render(<EmojiPicker emojiData={minimalEmojiData} getEmojiUrl={getEmojiUrl} />);
    await screen.findAllByRole('gridcell');
    expect(getEmojiUrl).toHaveBeenCalledWith('1f600', 'apple');
  });
});
