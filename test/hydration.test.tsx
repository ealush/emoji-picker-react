import { act } from '@testing-library/react';
import React from 'react';
import { flushSync } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const LS_KEY = 'epr_suggested';

// renderToString under jsdom (where window exists) logs React's
// useLayoutEffect SSR warning. Real SSR runs without window, where the
// isomorphic hook uses useEffect instead — covered by test/ssr.test.tsx.
beforeEach(() => {
  // eslint-disable-next-line no-console
  const originalError = console.error.bind(console);
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (
      args.some(
        (arg) => typeof arg === 'string' && arg.includes('useLayoutEffect'),
      )
    ) {
      return;
    }
    originalError(...args);
  });
});

describe('hydration with returning-user suggestions', () => {
  afterEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders identical HTML with and without stored suggestions', () => {
    // Server: no window, so no suggestions.
    window.localStorage.clear();
    const serverHtml = renderToString(<EmojiPicker />);

    // Returning user: suggestions exist before the first client render.
    // Effects never run during server rendering, so this must match the
    // server HTML exactly or hydration will mismatch.
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 3 }]),
    );
    const firstClientHtml = renderToString(<EmojiPicker />);

    expect(firstClientHtml).toBe(serverHtml);
  });

  it('shows stored suggestions after mount', async () => {
    window.localStorage.clear();
    const html = renderToString(<EmojiPicker />);

    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 3 }]),
    );

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;

    act(() => {
      flushSync(() => {
        hydrateRoot(container, <EmojiPicker />);
      });
    });
    await act(async () => {});

    expect(container.querySelector('[data-unified="1f600"]')).not.toBeNull();
  });
});
