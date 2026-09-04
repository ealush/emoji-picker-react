// @vitest-environment node
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { getSuggested, setSuggested } from '../src/dataUtils/suggested';
import { useIsomorphicLayoutEffect } from '../src/hooks/useIsomorphicLayoutEffect';
import { SkinTones } from '../src/types/exposedTypes';

describe('SSR probe', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs without window/document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the picker to a string, styles included', () => {
    const html = renderToString(<EmojiPicker />);

    expect(html).toContain('<style');
    expect(html).toContain('EmojiPickerReact');
  });

  it('renders without the useLayoutEffect SSR warning', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    renderToString(<EmojiPicker />);

    const ssrWarnings = consoleError.mock.calls.filter((args) =>
      args.some(
        (arg) => typeof arg === 'string' && arg.includes('useLayoutEffect'),
      ),
    );
    expect(ssrWarnings).toEqual([]);
  });
});

describe('useIsomorphicLayoutEffect without window', () => {
  it('falls back to useEffect on the server', () => {
    expect(useIsomorphicLayoutEffect).toBe(React.useEffect);
  });
});

describe('suggested without browser storage', () => {
  it('returns no suggestions when window is undefined', () => {
    expect(getSuggested()).toEqual([]);
  });

  it('drops writes when window is undefined instead of throwing', () => {
    expect(() =>
      setSuggested({ n: ['grinning face'], u: '1f600', a: '1' }, SkinTones.NEUTRAL),
    ).not.toThrow();
  });
});
