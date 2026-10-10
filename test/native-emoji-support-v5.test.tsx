import { act, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import {
  useNativeEmojiSupport,
  useRequestNativeProbe,
} from '../src/components/context/PickerContext';
import { List, Root, Viewport } from '../src/primitives';
import { NavigationRegistry } from '../src/state/navigationRegistry';
import { isNearViewport } from '../src/virtualization/virtualizationHelpers';
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

// jsdom has no layout, so the grid itself requests nothing here; these
// ask for exact checks the way it does for cells near the viewport.
const MELTING_FAMILY = ['1fae0', '1fae2'];
const PINK_HEART = ['1fa77'];

function Request({ ids }: { ids: string[] }) {
  const request = useRequestNativeProbe();
  React.useEffect(() => request(ids), [request, ids]);
  return null;
}

function Picker({ children }: { children: React.ReactNode }) {
  return (
    <Root style={{ height: 400 }}>
      <Viewport>
        <List />
      </Viewport>
      {children}
    </Root>
  );
}

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

  it('checks only the glyphs it is asked about, after paint', async () => {
    const drawn = new Set<string>();
    installFakeCanvas((text) => {
      drawn.add(text);
      return text !== '\u{1FAE2}';
    });
    const { container } = render(
      <Picker>
        <Request ids={MELTING_FAMILY} />
      </Picker>,
    );
    // Before paint: a baseline, version samples and a flag only.
    expect(drawn.size).toBeLessThan(40);
    // Melting face's version renders, so its sibling is predicted visible.
    expect(
      container.querySelector('[data-epr-unified="1fae2"]'),
    ).not.toBeNull();
    // The requested check then finds that one glyph missing...
    await waitFor(() =>
      expect(container.querySelector('[data-epr-unified="1fae2"]')).toBeNull(),
    );
    // ...without drawing the rest of the inventory.
    expect(drawn.size).toBeLessThan(60);
    expect(
      container.querySelector('[data-epr-unified="1fae0"]'),
    ).not.toBeNull();
  });

  it('keeps one support snapshot when checks confirm the prediction', async () => {
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
      <Picker>
        <Request ids={MELTING_FAMILY} />
        <Observe />
      </Picker>,
    );
    await waitFor(() => expect(drawn.has('\u{1FAE2}')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 50));
    // A second snapshot would rerender the whole grid for nothing.
    seen.delete(null);
    expect(seen.size).toBe(1);
  });

  it('keeps its snapshot when a webfont load changes no result', async () => {
    let probes = 0;
    installFakeCanvas((text) => {
      if (text === '\u{1F600}') probes += 1;
      return true;
    });
    const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: fonts,
    });
    try {
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
      await new Promise((resolve) => setTimeout(resolve, 100));
      const before = probes;
      act(() => {
        fonts.dispatchEvent(new Event('loadingdone'));
      });
      // The refresh re-probes the font in the background...
      await waitFor(() => expect(probes).toBeGreaterThan(before));
      await new Promise((resolve) => setTimeout(resolve, 100));
      // ...and, with identical results, publishes nothing new.
      seen.delete(null);
      expect(seen.size).toBe(1);
    } finally {
      if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
      else delete (document as { fonts?: FontFaceSet }).fonts;
    }
  });

  it('lets a corrective result keep pending navigation', async () => {
    installFakeCanvas((text) => text !== '\u{1FAE2}');
    const invalidate = vi.spyOn(NavigationRegistry.prototype, 'invalidate');
    const { container } = render(
      <Picker>
        <Request ids={MELTING_FAMILY} />
      </Picker>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const before = invalidate.mock.calls.length;
    // The exact check hides one glyph the version prediction showed...
    await waitFor(() =>
      expect(container.querySelector('[data-epr-unified="1fae2"]')).toBeNull(),
    );
    // ...without cancelling a category jump or focus move in flight.
    expect(invalidate).toHaveBeenCalledTimes(before);
  });

  it('shows supported glyphs newer than a failing version sample', async () => {
    installFakeCanvas(
      (text) =>
        text !== SHAKING_FACE &&
        text !== '\u{1FAE9}' &&
        !text.startsWith('\u{1F642}\u200D'),
    );
    const { container } = render(
      <Picker>
        <Request ids={PINK_HEART} />
      </Picker>,
    );
    // Pink heart (15.0) is predicted hidden with its version's sample...
    expect(container.querySelector('[data-epr-unified="1fa77"]')).toBeNull();
    // ...until its own check shows the font draws it.
    await waitFor(() =>
      expect(
        container.querySelector('[data-epr-unified="1fa77"]'),
      ).not.toBeNull(),
    );
    expect(container.querySelector('[data-epr-unified="1fae8"]')).toBeNull();
  });

  it('treats only measured cells within a viewport as near', () => {
    const dimensions = { emojiSize: 40, emojisPerRow: 8, categoryHeight: 400 };
    const near = (top: number, scrollTop = 1000) =>
      isNearViewport({
        scrollTop,
        clientHeight: 300,
        topOffset: 0,
        style: { top },
        dimensions,
      });
    expect(near(1100)).toBe(true); // visible
    expect(near(1550)).toBe(true); // within a viewport below
    expect(near(700)).toBe(true); // within a viewport above
    expect(near(1700)).toBe(false);
    expect(near(600)).toBe(false);
    // Unmeasured grids request nothing instead of a whole category.
    expect(
      isNearViewport({
        scrollTop: 0,
        clientHeight: 0,
        topOffset: 0,
        style: { top: 0 },
        dimensions,
      }),
    ).toBe(false);
  });

  it('predicts flags and each version from its own sample', () => {
    // Draws the 16.0 sample but not 15.1 sequences or flags, like
    // Firefox's bundled font misses 15.1 while drawing 16.0.
    installFakeCanvas(
      (text) =>
        !/[\u{1F1E6}-\u{1F1FF}]/u.test(text) &&
        !text.startsWith('\u{1F642}\u200D'),
    );
    const probe = detectNativeEmojiSupport();
    if (!('snapshot' in probe)) throw new Error('expected a conclusive probe');
    const samples = new Map([
      [14, '1fae0'],
      [15.1, '1f642-200d-2194-fe0f'],
      [16, '1fae9'],
    ]);
    const snapshot = nativeSupportSnapshot(probe, samples);
    expect(snapshot.countryFlags).toBe(false);
    expect(Array.from(snapshot.failedVersions)).toEqual([15.1]);
    const predicted = { ...snapshot, supports: () => undefined };
    expect(isNativeEmojiSupported(predicted, '1f1e9-1f1ea')).toBe(false);
    expect(
      isNativeEmojiSupported(predicted, '1f6b6-200d-27a1-fe0f', 15.1),
    ).toBe(false);
    expect(isNativeEmojiSupported(predicted, '1fac6', 16)).toBe(true);
    expect(isNativeEmojiSupported(predicted, '1fae2', 14)).toBe(true);
    // An exact result always wins over the prediction.
    expect(
      isNativeEmojiSupported(
        { ...predicted, supports: () => true },
        '1f6b6-200d-27a1-fe0f',
        15.1,
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
