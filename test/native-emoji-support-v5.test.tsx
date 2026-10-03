import { render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import {
  __resetNativeEmojiSupportForTest,
  detectNativeEmojiSupport,
  isCountryFlagUnified,
} from '../src/dataUtils/nativeEmojiSupport';

// A fake 2D context: `supported` decides which strings draw as a single
// color glyph; everything else draws gray-scale and double width.
function installFakeCanvas(supported: (text: string) => boolean) {
  let lastText = '';
  const context = {
    font: '',
    textBaseline: '',
    fillStyle: '',
    clearRect: () => undefined,
    fillText: (text: string) => {
      lastText = text;
    },
    measureText: (text: string) => ({ width: supported(text) ? 24 : 48 }),
    getImageData: () => {
      const data = new Uint8ClampedArray(32 * 32 * 4);
      data[0] = supported(lastText) ? 250 : 0;
      data[1] = supported(lastText) ? 100 : 0;
      data[2] = 0;
      data[3] = 255;
      return { data };
    },
  };
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('test-browser');
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
}

const SHAKING_FACE = '\u{1FAE8}'; // 15.0

afterEach(() => {
  __resetNativeEmojiSupportForTest();
  vi.restoreAllMocks();
});

describe('native emoji support detection', () => {
  it('reports the newest version whose sample renders', () => {
    installFakeCanvas(
      (text) =>
        text !== SHAKING_FACE &&
        !text.startsWith('\u{1FAE9}') &&
        !text.startsWith('\u{1F642}‍') &&
        !text.startsWith('\u{1F1FA}'),
    );
    expect(detectNativeEmojiSupport()).toEqual({
      maxVersion: 14,
      countryFlags: false,
    });
  });

  it('is inconclusive without color emoji rendering', () => {
    installFakeCanvas(() => false);
    expect(detectNativeEmojiSupport()).toEqual({
      maxVersion: null,
      countryFlags: true,
    });
  });

  it('is inconclusive under jsdom', () => {
    expect(detectNativeEmojiSupport().maxVersion).toBeNull();
  });

  it('recognizes regional-indicator flags only', () => {
    expect(isCountryFlagUnified('1f1fa-1f1f8')).toBe(true);
    expect(isCountryFlagUnified('1f3c1')).toBe(false);
    expect(isCountryFlagUnified('1f3f4-200d-2620-fe0f')).toBe(false);
  });

  it('hides emojis newer than the platform supports in the native picker', () => {
    installFakeCanvas(
      (text) =>
        text !== SHAKING_FACE &&
        !text.startsWith('\u{1FAE9}') &&
        !text.startsWith('\u{1F642}‍'),
    );
    const { container } = render(<EmojiPicker />);
    // Melting face (14.0) stays; shaking face (15.0) is filtered.
    expect(
      container.querySelector(`[data-epr-unified="1fae0"]`),
    ).not.toBeNull();
    expect(container.querySelector('[data-epr-unified="1fae8"]')).toBeNull();
  });

  it('does not probe when emojiVersion is pinned', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('test-browser');
    render(<EmojiPicker emojiVersion="15.0" />);
    expect(spy).not.toHaveBeenCalled();
  });
});
