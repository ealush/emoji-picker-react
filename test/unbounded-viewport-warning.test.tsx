import { render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as Picker from '../src/primitives';
import { __resetViewportWarningsForTest } from '../src/primitives/Viewport';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

function renderWithViewportHeight(clientHeight: number, scrollHeight: number) {
  const callbacks: Array<() => void> = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  render(
    <Picker.Root>
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>,
  );
  const viewport = document.querySelector('[data-epr-part="viewport"]')!;
  Object.defineProperty(viewport, 'clientHeight', { value: clientHeight });
  Object.defineProperty(viewport, 'scrollHeight', { value: scrollHeight });
  callbacks.forEach((callback) => callback());
}

const heightWarnings = (warn: ReturnType<typeof vi.spyOn>) =>
  warn.mock.calls.filter((call) => String(call[0]).includes('no height limit'));

describe('unbounded Viewport warning', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    __resetViewportWarningsForTest();
  });

  it('warns once when the Viewport grows to its whole content', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithViewportHeight(window.innerHeight * 10, window.innerHeight * 10);
    expect(heightWarnings(warn)).toHaveLength(1);
  });

  it('stays quiet when the Viewport scrolls', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithViewportHeight(400, 30000);
    expect(heightWarnings(warn)).toHaveLength(0);
  });
});
