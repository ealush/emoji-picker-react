import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBodyRef } from '../../src/components/context/ElementRefContext';
import { DataEmojis } from '../../src/dataUtils/DataTypes';
import { useCategoryHeight } from '../../src/hooks/useCategoryHeight';
import { useEmojiVirtualization } from '../../src/hooks/useEmojiVirtualization';
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
