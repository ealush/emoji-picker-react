import { act, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { useNativeEmojiSupport } from '../src/components/context/PickerContext';
import { List, Root, Viewport } from '../src/primitives';
import {
  __resetNativeEmojiSupportForTest,
  detectNativeEmojiSupport,
  isCountryFlagUnified,
  isNativeEmojiSupported,
  nativeSupportSnapshot,
} from '../src/dataUtils/nativeEmojiSupport';

// A fake 2D context: `supported` decides which strings draw as a single
// fixed artwork; everything else follows text ink and has double width.
function installFakeCanvas(supported: (text: string, font: string) => boolean) {
  const draws = new Map<
    string,
    {
      text: string;
      font: string;
      ink: string;
      x: number;
      y: number;
    }
  >();
  const context = {
    font: '',
    textBaseline: '',
    fillStyle: '',
    canvas: {
      set width(_value: number) {
        draws.clear();
      },
      set height(_value: number) {
        draws.clear();
      },
    },
    save: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    rect: () => undefined,
    clip: () => undefined,
    fillText: (text: string, x: number, y: number) => {
      draws.set(`${x},${y}`, {
        text,
        x,
        y,
        font: context.font,
        ink: context.fillStyle,
      });
    },
    measureText: (text: string) => ({
      width: supported(text, context.font) ? 24 : 48,
    }),
    getImageData: (_x: number, _y: number, width: number, height: number) => {
      const data = new Uint8ClampedArray(width * height * 4);
      for (const { text, font, ink, x, y } of draws.values()) {
        if (x >= width || y >= height) continue;
        const index = (y * width + x) * 4;
        const fixed = supported(text, font);
        // Artwork differs per sequence, so a tagged subdivision flag is
        // distinguishable from its tagless black-flag fallback.
        data[index] = fixed
          ? 150 + (text.length % 100)
          : ink === '#f00'
            ? 255
            : 0;
        data[index + 1] = fixed ? 100 : 0;
        data[index + 3] = 255;
      }
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
  it('checks individual glyphs rather than inferring version-wide support', () => {
    installFakeCanvas(
      (text) =>
        text !== SHAKING_FACE &&
        !text.startsWith('\u{1FAE9}') &&
        !text.startsWith('\u{1F642}‍') &&
        !text.startsWith('\u{1F1FA}'),
    );
    const probe = detectNativeEmojiSupport();
    if (!('snapshot' in probe)) throw new Error('expected a conclusive probe');
    expect(probe.supports('1fae0')).toBe(true);
    expect(probe.supports('1fae8')).toBe(false);
    expect(probe.supports('1f1fa-1f1f8')).toBe(false);
    // Snapshots answer only what was probed; they never draw.
    const view = probe.snapshot();
    expect(view('1fae8')).toBe(false);
    expect(view('1f970')).toBeUndefined();
  });

  it('keeps the full sequence check off the mount path', async () => {
    const drawn: string[] = [];
    installFakeCanvas((text) => {
      drawn.push(text);
      return text !== '\u{1FAE2}';
    });
    const { container } = render(<EmojiPicker />);
    // Before paint: a baseline, version samples and a flag only.
    expect(new Set(drawn).size).toBeLessThan(40);
    // Melting face's version renders, so its sibling is predicted visible.
    expect(
      container.querySelector('[data-epr-unified="1fae2"]'),
    ).not.toBeNull();
    // The background check then finds that one glyph missing.
    await waitFor(() =>
      expect(container.querySelector('[data-epr-unified="1fae2"]')).toBeNull(),
    );
    expect(new Set(drawn).size).toBeGreaterThan(1000);
    expect(
      container.querySelector('[data-epr-unified="1fae0"]'),
    ).not.toBeNull();
  });

  it('keeps one support snapshot when the full check confirms the prediction', async () => {
    const drawn = new Set<string>();
    installFakeCanvas((text) => {
      drawn.add(text);
      return true;
    });
    const seen = new Set<unknown>();
    function Observe() {
      seen.add(useNativeEmojiSupport());
      return null;
    }
    render(
      <Root style={{ height: 400 }}>
        <Viewport>
          <List />
        </Viewport>
        <Observe />
      </Root>,
    );
    await waitFor(() => expect(drawn.size).toBeGreaterThan(1000));
    await new Promise((resolve) => setTimeout(resolve, 50));
    // A second snapshot would rerender the grid and, through
    // NavigationInvalidation, cancel in-flight keyboard or tab navigation.
    seen.delete(null);
    expect(seen.size).toBe(1);
  });

  it('shows supported glyphs newer than a failing version sample', async () => {
    installFakeCanvas(
      (text) =>
        text !== SHAKING_FACE &&
        text !== '\u{1FAE9}' &&
        !text.startsWith('\u{1F642}\u200D'),
    );
    const { container } = render(<EmojiPicker />);
    // Pink heart (15.0) is predicted hidden with its version's sample...
    expect(container.querySelector('[data-epr-unified="1fa77"]')).toBeNull();
    // ...until its own probe shows the font draws it.
    await waitFor(() =>
      expect(
        container.querySelector('[data-epr-unified="1fa77"]'),
      ).not.toBeNull(),
    );
    expect(container.querySelector('[data-epr-unified="1fae8"]')).toBeNull();
  });

  it('predicts missing country flags before checking each flag', () => {
    installFakeCanvas((text) => !/[\u{1F1E6}-\u{1F1FF}]/u.test(text));
    const probe = detectNativeEmojiSupport();
    if (!('snapshot' in probe)) throw new Error('expected a conclusive probe');
    const samples = new Map([
      [14, '1fae0'],
      [16, '1fae9'],
    ]);
    expect(nativeSupportSnapshot(probe, samples)).toMatchObject({
      countryFlags: false,
      maxVersion: 16,
    });
    const predicted = {
      supports: () => undefined,
      maxVersion: 14,
      countryFlags: false,
    };
    expect(isNativeEmojiSupported(predicted, '1f1e9-1f1ea')).toBe(false);
    expect(isNativeEmojiSupported(predicted, '1fae8', 15)).toBe(false);
    expect(isNativeEmojiSupported(predicted, '1fae0', 14)).toBe(true);
    expect(
      isNativeEmojiSupported(
        { ...predicted, supports: () => true },
        '1fae8',
        15,
      ),
    ).toBe(true);
    expect(isNativeEmojiSupported(null, '1fae8', 15)).toBe(true);
  });

  it('is inconclusive without fixed emoji artwork', () => {
    installFakeCanvas(() => false);
    expect(detectNativeEmojiSupport()).toEqual({});
  });

  it('is inconclusive under jsdom', () => {
    expect(detectNativeEmojiSupport()).toEqual({});
  });

  it('recognizes regional-indicator flags only', () => {
    expect(isCountryFlagUnified('1f1fa-1f1f8')).toBe(true);
    expect(isCountryFlagUnified('1f3c1')).toBe(false);
    expect(isCountryFlagUnified('1f3f4-200d-2620-fe0f')).toBe(false);
    // England: a tag sequence, missing wherever country flags are.
    expect(
      isCountryFlagUnified('1f3f4-e0067-e0062-e0065-e006e-e0067-e007f'),
    ).toBe(true);
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

  it('still probes when emojiVersion supplies an additional cap', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('test-browser');
    render(<EmojiPicker emojiVersion="15.0" />);
    expect(spy).toHaveBeenCalled();
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
