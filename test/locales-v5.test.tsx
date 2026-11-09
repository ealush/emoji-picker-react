import { act, render } from '@testing-library/react';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import {
  EMOJI_DATA_LOCALES,
  emojiDataForLocale,
  matchEmojiDataLocale,
} from '../src/locales';

describe('matchEmojiDataLocale', () => {
  it.each([
    ['es', 'es'],
    ['es-MX', 'es-mx'],
    ['es_ES', 'es'],
    ['es-419', 'es-mx'],
    ['fr-CA', 'fr'],
    ['pt-BR', 'pt'],
    ['zh-CN', 'zh'],
    ['zh-Hans-SG', 'zh'],
    ['zh-TW', 'zh-hant'],
    ['zh-Hant-HK', 'zh-hant'],
    ['no', 'nb'],
    ['nn-NO', 'nb'],
    ['en-GB', 'en-gb'],
    ['en-AU', 'en'],
    ['he', 'en'],
    ['', 'en'],
  ])('%s → %s', (tag, expected) => {
    expect(matchEmojiDataLocale(tag)).toBe(expected);
  });

  it('takes the first supported locale in preference order', () => {
    expect(matchEmojiDataLocale(['he-IL', 'ar', 'de-AT', 'fr'])).toBe('de');
    expect(matchEmojiDataLocale([])).toBe('en');
  });

  it('covers every bundled non-legacy dataset', async () => {
    const { readdirSync } = await import('node:fs');
    const { join } = await import('node:path');
    const files = readdirSync(join(__dirname, '..', 'src', 'data'))
      .map((file) => /^emojis-(.+)\.json$/.exec(file)?.[1])
      .filter(Boolean)
      .sort();
    expect([...EMOJI_DATA_LOCALES].sort()).toEqual(files);
  });
});

describe('browser locale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads navigator.languages', () => {
    vi.stubGlobal('navigator', { languages: ['ja-JP', 'en-US'] });
    expect(matchEmojiDataLocale()).toBe('ja');
  });

  it('falls back to navigator.language', () => {
    vi.stubGlobal('navigator', { languages: [], language: 'ko-KR' });
    expect(matchEmojiDataLocale()).toBe('ko');
  });

  it('is English without a navigator (server rendering)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(matchEmojiDataLocale()).toBe('en');
  });
});

describe('emojiDataForLocale', () => {
  it('returns one stable loader per dataset', () => {
    expect(emojiDataForLocale('de-DE')).toBe(emojiDataForLocale('de-CH'));
    expect(emojiDataForLocale('de')).not.toBe(emojiDataForLocale('fr'));
  });

  it('translates the picker for the matched locale', async () => {
    const { container } = render(
      <EmojiPicker emojiData={emojiDataForLocale(['he', 'de-AT'])} />,
    );
    await vi.waitFor(() => {
      expect(container.querySelector('[placeholder="Suchen"]')).not.toBeNull();
    });
    expect(
      container
        .querySelector('button[data-epr-unified="1f600"]')
        ?.getAttribute('aria-label'),
    ).toBe('grinsendes Gesicht');
  });
});

describe('server rendering', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('hydrates when the server picked English and the browser picks German', async () => {
    // jsdom has a window, so React warns about useLayoutEffect during
    // renderToString; real SSR is covered by test/ssr.test.tsx.
    const originalError = console.error.bind(console);
    const errors: unknown[][] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      if (
        args.some((a) => typeof a === 'string' && a.includes('useLayoutEffect'))
      )
        return;
      errors.push(args);
      originalError(...args);
    });

    vi.stubGlobal('navigator', undefined);
    const serverHtml = renderToString(
      <EmojiPicker emojiData={emojiDataForLocale()} />,
    );
    vi.unstubAllGlobals();

    vi.stubGlobal('navigator', { ...navigator, languages: ['de-DE'] });
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    const recoverable = vi.fn();
    await act(async () => {
      hydrateRoot(container, <EmojiPicker emojiData={emojiDataForLocale()} />, {
        onRecoverableError: recoverable,
      });
    });
    await vi.waitFor(() => {
      expect(container.querySelector('[placeholder="Suchen"]')).not.toBeNull();
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).toEqual([]);
  });
});
