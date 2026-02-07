import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBodyRef } from '../../src/components/context/ElementRefContext';
import { DataEmojis } from '../../src/dataUtils/DataTypes';
import { useCategoryHeight } from '../../src/hooks/useCategoryHeight';
import { useEmojiVirtualization } from '../../src/hooks/useEmojiVirtualization';
import {
  getEmojiPositionStyle,
  shouldVirtualize
} from '../../src/virtualization/virtualizationHelpers';

// Mock dependencies
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useBodyRef: vi.fn(() => ({ current: { clientHeight: 300 } }))
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useActiveSkinToneState: vi.fn(() => ['neutral'])
}));

vi.mock('../../src/config/useConfig', () => ({
  useEmojiStyleConfig: vi.fn(() => 'native'),
  useGetEmojiUrlConfig: vi.fn(() => () => ''),
  useLazyLoadEmojisConfig: vi.fn(() => false),
  useSkinTonesDisabledConfig: vi.fn(() => false)
}));

vi.mock('../../src/hooks/useCategoryHeight', () => ({
  useCategoryHeight: vi.fn(() => ({
    categoryHeight: 1000,
    rowHeight: 40,
    rowsCount: 100
  }))
}));

vi.mock('../../src/hooks/useDisallowedEmojis', () => ({
  useIsEmojiDisallowed: vi.fn(() => () => false)
}));

vi.mock('../../src/hooks/useIsEmojiHidden', () => ({
  useIsEmojiHidden: vi.fn(() => () => ({
    failedToLoad: false,
    filteredOut: false,
    hidden: false
  }))
}));

vi.mock('../../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: vi.fn()
}));

vi.mock('../../src/virtualization/virtualizationHelpers', () => ({
  getEmojiPositionStyle: vi.fn(() => ({ top: 0, left: 0 })),
  shouldVirtualize: vi.fn(() => false)
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
      current: { clientHeight: 300 }
    });
    // ... (other mocks) ...
    (useCategoryHeight as any).mockReturnValue({
      categoryHeight: 1000,
      rowHeight: 40,
      rowsCount: 100
    });
    // ... (other mocks) ...
    
    // Virtualization mocks
    (getEmojiPositionStyle as any).mockReturnValue({ top: 0, left: 0 });
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
        isCategoryVisible: true
      })
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
        isCategoryVisible: true
      })
    );
    
    expect(result.current.virtualizedCounter).toBe(3); // All 3 virtualized
    expect(result.current.emojis.length).toBe(0);
  });
});
