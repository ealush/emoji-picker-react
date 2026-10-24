import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBodyRef } from '../../src/components/context/ElementRefContext';
import { useActiveSkinToneState } from '../../src/components/context/PickerContext';
import { DataEmojis } from '../../src/dataUtils/DataTypes';
import { useVariationsDisabledConfig } from '../../src/config/useConfig';
import { preloadEmojiIfNeeded } from '../../src/hooks/preloadEmoji';
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
  useVariationsDisabledConfig: vi.fn(() => false),
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

vi.mock('../../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: vi.fn(),
}));

vi.mock('../../src/virtualization/virtualizationHelpers', () => ({
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
    (useVariationsDisabledConfig as any).mockReturnValue(false);
    (useActiveSkinToneState as any).mockReturnValue(['neutral']);

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

  it('preloads only the rendered image with variationsDisabled', () => {
    (shouldVirtualize as any).mockReturnValue(true);
    (useVariationsDisabledConfig as any).mockReturnValue(true);
    (useActiveSkinToneState as any).mockReturnValue(['1f3fc']);
    renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: [
          { n: ['thumbs up'], u: '1f44d', a: '0.6', v: ['1f44d-1f3fc'] },
          ...mockEmojis,
        ],
        topOffset: 5000,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );
    // The active tone's image for emojis that have it, else the base.
    expect(
      (preloadEmojiIfNeeded as any).mock.calls.map((call: unknown[]) =>
        call.at(-1),
      ),
    ).toEqual(['1f44d-1f3fc', '1f600', '1f431', '1f436']);
  });

  it('leaves the full preload to variations when they are on', () => {
    (shouldVirtualize as any).mockReturnValue(true);
    renderHook(() =>
      useEmojiVirtualization({
        categoryEmojis: mockEmojis,
        topOffset: 5000,
        onHeightReady: vi.fn(),
        scrollTop: 0,
        isCategoryVisible: true,
        positioned: true,
      }),
    );
    expect(preloadEmojiIfNeeded).toHaveBeenCalled();
    for (const call of (preloadEmojiIfNeeded as any).mock.calls)
      expect(call.at(-1)).toBeUndefined();
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
