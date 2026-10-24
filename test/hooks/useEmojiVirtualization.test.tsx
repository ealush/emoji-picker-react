import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBodyRef } from '../../src/components/context/ElementRefContext';
import { DataEmojis } from '../../src/dataUtils/DataTypes';
import { useEmojiStyleConfig } from '../../src/config/useConfig';
import { preloadEmoji } from '../../src/hooks/preloadEmoji';
import { useCategoryHeight } from '../../src/hooks/useCategoryHeight';
import { useEmojiVirtualization } from '../../src/hooks/useEmojiVirtualization';
import { useIsEmojiDisallowed } from '../../src/hooks/useDisallowedEmojis';
import { useIsEmojiHidden } from '../../src/hooks/useIsEmojiHidden';
import {
  getEmojiPositionStyle,
  shouldVirtualize,
} from '../../src/virtualization/virtualizationHelpers';

// Mock dependencies
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useBodyRef: vi.fn(() => ({ current: { clientHeight: 300 } })),
}));

const requestNativeProbe = vi.fn();
vi.mock('../../src/components/context/PickerContext', () => ({
  useActiveSkinToneState: vi.fn(() => ['neutral']),
  useRequestNativeProbe: () => requestNativeProbe,
}));

vi.mock('../../src/config/useConfig', () => ({
  useEmojiStyleConfig: vi.fn(() => 'native'),
  useGetEmojiUrlConfig: vi.fn(() => () => ''),
  useLazyLoadEmojisConfig: vi.fn(() => false),
  useSkinTonesDisabledConfig: vi.fn(() => false),
}));

vi.mock('../../src/hooks/useCategoryHeight', () => ({
  useCategoryHeight: vi.fn(() => ({
    categoryHeight: 1000,
    emojisPerRow: 8,
    emojiSize: 40,
  })),
}));

vi.mock('../../src/hooks/useDisallowedEmojis', () => ({
  useIsEmojiDisallowed: vi.fn(() => () => false),
}));

vi.mock('../../src/hooks/useIsEmojiHidden', () => ({
  useIsEmojiHidden: vi.fn(() => () => ({
    failedToLoad: false,
    filteredOut: false,
    hidden: false,
  })),
}));

vi.mock('../../src/hooks/preloadEmoji', () => ({ preloadEmoji: vi.fn() }));

vi.mock('../../src/virtualization/virtualizationHelpers', async (original) => ({
  ...(await original<
    typeof import('../../src/virtualization/virtualizationHelpers')
  >()),
  getEmojiPositionStyle: vi.fn(() => ({ top: 0, insetInlineStart: 0 })),
  shouldVirtualize: vi.fn(() => false),
}));

const mockEmojis: DataEmojis = [
  { n: ['grinning face'], u: '1f600', a: '1' },
  { n: ['cat'], u: '1f431', a: '1' },
  { n: ['dog'], u: '1f436', a: '1' },
];

describe('useEmojiVirtualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEmojiStyleConfig).mockReturnValue('native');

    // Default mocks
    (useBodyRef as any).mockReturnValue({
      current: { clientHeight: 300 },
    });
    // ... (other mocks) ...
    (useCategoryHeight as any).mockReturnValue({
      categoryHeight: 1000,
      emojisPerRow: 8,
      emojiSize: 40,
    });
    // ... (other mocks) ...

    // Virtualization mocks
    (getEmojiPositionStyle as any).mockReturnValue({
      top: 0,
      insetInlineStart: 0,
    });
    (shouldVirtualize as any).mockReturnValue(false);
  });

  it('constructs no cells in the initial pass before the parent ref exists', () => {
    const geometry = vi.mocked(useCategoryHeight).getMockImplementation()!;
    vi.mocked(useCategoryHeight).mockReturnValue(undefined);
    const body = { current: null as null | HTMLElement };
    vi.mocked(useBodyRef).mockReturnValue(body);
    const passes: number[] = [];
    const { result, rerender } = renderHook(() => {
      const value = useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      });
      passes.push(value.emojis.length);
      return value;
    });
    expect(passes[0]).toBe(0);
    vi.mocked(useCategoryHeight).mockImplementation(geometry);
    rerender();
    expect(result.current.emojis).toHaveLength(3);
  });

  it('renders after commit without a measurement or another update', () => {
    vi.mocked(useCategoryHeight).mockReturnValue(undefined);
    vi.mocked(useBodyRef).mockReturnValue({ current: null });
    const passes: number[] = [];
    const { result } = renderHook(() => {
      const value = useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      });
      passes.push(value.emojis.length);
      return value;
    });
    expect(passes[0]).toBe(0);
    expect(result.current.emojis).toHaveLength(3);
  });

  it.each(['native', 'apple'] as const)(
    'does not queue distant preloads with %s',
    (style) => {
      vi.mocked(useEmojiStyleConfig).mockReturnValue(style);
      vi.mocked(shouldVirtualize).mockReturnValue(true);
      const { rerender } = renderHook(() =>
        useEmojiVirtualization({
          categoryEmojis: mockEmojis,
          topOffset: 10000,
          onHeightReady: vi.fn(),
          scrollTop: 0,
          isCategoryVisible: false,
          positioned: true,
        }),
      );
      rerender();
      expect(preloadEmoji).not.toHaveBeenCalled();
    },
  );

  it('does not queue nearby preloads for native glyphs', () => {
    vi.mocked(shouldVirtualize).mockReturnValue(true);
    vi.mocked(getEmojiPositionStyle).mockReturnValue({
      top: 360,
      insetInlineStart: 0,
    });
    renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );
    expect(preloadEmoji).not.toHaveBeenCalled();
  });

  it('does not refilter the category inventory when only scroll position changes', () => {
    const disallowed = vi.fn(() => false);
    const hidden = vi.fn(() => ({
      failedToLoad: false,
      filteredOut: false,
      hidden: false,
    }));
    vi.mocked(useIsEmojiDisallowed).mockReturnValue(disallowed);
    vi.mocked(useIsEmojiHidden).mockReturnValue(hidden);
    const { rerender } = renderHook(
      ({ scrollTop }) =>
        useEmojiVirtualization({
          categoryEmojis: mockEmojis,
          topOffset: 0,
          onHeightReady: vi.fn(),
          scrollTop,
          isCategoryVisible: true,
          positioned: true,
        }),
      { initialProps: { scrollTop: 0 } },
    );
    expect(disallowed).toHaveBeenCalledTimes(mockEmojis.length);
    rerender({ scrollTop: 40 });
    rerender({ scrollTop: 80 });
    expect(disallowed).toHaveBeenCalledTimes(mockEmojis.length);
    expect(hidden).toHaveBeenCalledTimes(mockEmojis.length);
  });

  it('virtualizes emojis that are not in view', () => {
    // shouldVirtualize returns false by default mock
    const { result } = renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );

    expect(result.current.emojis.length).toBe(3);
    expect(result.current.virtualizedCounter).toBe(0);
  });

  it('increments virtualizedCounter when items are skipped', () => {
    (shouldVirtualize as any).mockReturnValue(true); // Force virtualization

    const { result } = renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 5000,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );

    expect(result.current.virtualizedCounter).toBe(3); // All 3 virtualized
    expect(result.current.emojis.length).toBe(0);
  });

  it('preloads image cells just below the viewport after commit', () => {
    vi.mocked(useEmojiStyleConfig).mockReturnValue('apple');
    vi.mocked(getEmojiPositionStyle).mockReturnValue({
      top: 360,
      insetInlineStart: 0,
    });
    (shouldVirtualize as any).mockReturnValue(true);
    renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );
    expect(preloadEmoji).toHaveBeenCalled();
  });

  it('requests native glyph checks for the rendered cells only', () => {
    const emojis: DataEmojis = [
      { n: ['thumbs up'], u: '1f44d', a: '0.6', v: ['1f44d-1f3fb'] },
      { n: ['cat'], u: '1f431', a: '0.6' },
    ];
    // The second cell is outside the rendered window.
    (shouldVirtualize as any).mockImplementation(
      ({ style }: { style: { top: number } }) => style.top > 0,
    );
    (getEmojiPositionStyle as any).mockImplementation(
      (_: unknown, index: number) => ({
        top: index * 1000,
        insetInlineStart: 0,
      }),
    );
    renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: emojis,
        topOffset: 0,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );
    // Tones wait for the variation menu; virtualized cells wait to render.
    expect(requestNativeProbe).toHaveBeenLastCalledWith(['1f44d']);
  });
});
