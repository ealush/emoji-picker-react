import { act, render, waitFor } from '@testing-library/react';
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
function installFakeCanvas(supported: (text: string, font: string) => boolean) {
  let lastText = '';
  const context = {
    font: '',
    textBaseline: '',
    fillStyle: '',
    clearRect: () => undefined,
    fillText: (text: string) => {
      lastText = text;
    },
    measureText: (text: string) => ({
      width: supported(text, context.font) ? 24 : 48,
    }),
    getImageData: () => {
      const data = new Uint8ClampedArray(32 * 32 * 4);
      data[0] = supported(lastText, context.font) ? 250 : 0;
      data[1] = supported(lastText, context.font) ? 100 : 0;
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

  it('does not add a synchronous render for an inconclusive probe', () => {
    installFakeCanvas(() => false);
    const onRender = vi.fn();
    const first = render(
      <React.Profiler id="native" onRender={onRender}>
        <EmojiPicker />
      </React.Profiler>,
    );
    const commits = onRender.mock.calls.length;
    first.unmount();
    onRender.mockClear();
    render(
      <React.Profiler id="pinned" onRender={onRender}>
        <EmojiPicker emojiVersion="15.0" />
      </React.Profiler>,
    );
    expect(onRender).toHaveBeenCalledTimes(commits);
  });

  it('does not probe when emojiVersion is pinned', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('test-browser');
    render(<EmojiPicker emojiVersion="15.0" />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('reprobes after the native font family changes', async () => {
    let newerFont = false;
    installFakeCanvas(
      (text) =>
        newerFont ||
        (!text.startsWith('\u{1FAE9}') &&
          !text.startsWith('\u{1F642}‍') &&
          text !== SHAKING_FACE),
    );
    const style = (font: string) =>
      ({ '--epr-emoji-font-family': font }) as React.CSSProperties;
    const { container, rerender } = render(
      <EmojiPicker style={style('before')} />,
    );
    expect(container.querySelector('[data-epr-unified="1fae8"]')).toBeNull();
    newerFont = true;
    rerender(<EmojiPicker style={style('after')} />);
    await waitFor(() =>
      expect(
        container.querySelector('[data-epr-unified="1fae8"]'),
      ).not.toBeNull(),
    );
  });

  it.each([
    ['class', 'root'],
    ['class', 'ancestor'],
    ['data-theme', 'root'],
    ['data-theme', 'ancestor'],
  ])(
    'refreshes already-loaded fonts selected by %s on the %s',
    async (attribute, target) => {
      const probe = vi.spyOn(
        await import('../src/dataUtils/nativeEmojiSupport'),
        'detectNativeEmojiSupport',
      );
      installFakeCanvas(
        (text, font) =>
          font.includes('after') ||
          (!text.startsWith('\u{1FAE9}') &&
            !text.startsWith('\u{1F642}‍') &&
            text !== SHAKING_FACE),
      );
      const selector =
        attribute === 'class' ? '.after' : '[data-theme="after"]';
      const stylesheet = document.createElement('style');
      stylesheet.textContent = `
      .font-refresh-picker { --epr-emoji-font-family: before; }
      ${selector}.font-refresh-picker,
      ${selector} .font-refresh-picker { --epr-emoji-font-family: after; }
    `;
      document.head.appendChild(stylesheet);
      const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
      const fonts = new EventTarget();
      const loadingEvent = vi.spyOn(fonts, 'dispatchEvent');
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: fonts,
      });
      try {
        const { container, unmount } = render(
          <div>
            <EmojiPicker className="font-refresh-picker" />
          </div>,
        );
        const root = container.querySelector<HTMLElement>(
          '.font-refresh-picker',
        )!;
        const element = target === 'root' ? root : root.parentElement!;
        expect(
          container.querySelector('[data-epr-unified="1fae8"]'),
        ).toBeNull();
        const original = element.getAttribute(attribute);
        act(() =>
          element.setAttribute(attribute, `${original || ''} after`.trim()),
        );
        await waitFor(() =>
          expect(
            container.querySelector('[data-epr-unified="1fae8"]'),
          ).not.toBeNull(),
        );
        // Returning to an already-measured font must also update filtering.
        act(() => {
          if (original === null) element.removeAttribute(attribute);
          else element.setAttribute(attribute, original);
        });
        await waitFor(() =>
          expect(
            container.querySelector('[data-epr-unified="1fae8"]'),
          ).toBeNull(),
        );
        const probesBefore = probe.mock.calls.length;
        await act(async () => {
          element.setAttribute('data-unrelated', 'unchanged-font');
        });
        expect(probe).toHaveBeenCalledTimes(probesBefore);
        expect(loadingEvent).not.toHaveBeenCalled();
        unmount();
      } finally {
        stylesheet.remove();
        if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
        else delete (document as { fonts?: FontFaceSet }).fonts;
      }
    },
  );

  it('refreshes a cached probe when webfonts finish loading', async () => {
    let loaded = false;
    installFakeCanvas(
      (text) =>
        loaded ||
        (!text.startsWith('\u{1FAE9}') &&
          !text.startsWith('\u{1F642}‍') &&
          text !== SHAKING_FACE),
    );
    const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: fonts,
    });
    try {
      const { container, unmount } = render(<EmojiPicker />);
      expect(container.querySelector('[data-epr-unified="1fae8"]')).toBeNull();
      loaded = true;
      act(() => fonts.dispatchEvent(new Event('loadingdone')));
      await waitFor(() =>
        expect(
          container.querySelector('[data-epr-unified="1fae8"]'),
        ).not.toBeNull(),
      );
      unmount();
    } finally {
      if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
      else delete (document as { fonts?: FontFaceSet }).fonts;
    }
  });
});
