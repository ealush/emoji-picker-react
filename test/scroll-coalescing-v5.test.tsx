import { act, fireEvent, renderHook } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useOnScroll } from '../src/hooks/useOnScroll';

const { closeAllOpenToggles } = vi.hoisted(() => ({
  closeAllOpenToggles: vi.fn(),
}));

vi.mock('../src/hooks/useCloseAllOpenToggles', () => ({
  useCloseAllOpenToggles: () => closeAllOpenToggles,
}));

describe('v5 scroll commit coalescing (PERFORMANCE.md §6)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('commits only the latest scroll position once per frame', () => {
    const scheduled: FrameRequestCallback[] = [];
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        scheduled.push(callback);
        return scheduled.length;
      });

    try {
      const scroller = document.createElement('div');
      const bodyRef = { current: scroller };
      const committedPositions: number[] = [];
      const { result, unmount } = renderHook(() => {
        const scrollTop = useOnScroll(bodyRef);
        React.useEffect(() => {
          committedPositions.push(scrollTop);
        }, [scrollTop]);
        return scrollTop;
      });
      expect(result.current).toBe(0);

      // Burst of 120 scroll events across one frame (synchronously, so no
      // frame can flush between them).
      for (let top = 1; top <= 120; top += 1) {
        scroller.scrollTop = top;
        fireEvent.scroll(scroller);
      }

      // Exactly one frame scheduled for the whole burst.
      expect(scheduled).toHaveLength(1);
      expect(result.current).toBe(0);
      expect(committedPositions).toEqual([0]);

      // Flushing applies the latest position, not an intermediate one.
      act(() => {
        scheduled[0](0);
      });
      expect(result.current).toBe(120);
      expect(committedPositions).toEqual([0, 120]);

      // A later burst schedules exactly one more frame.
      for (let top = 121; top <= 130; top += 1) {
        scroller.scrollTop = top;
        fireEvent.scroll(scroller);
      }
      expect(scheduled).toHaveLength(2);
      expect(result.current).toBe(120);
      act(() => {
        scheduled[1](16);
      });
      expect(result.current).toBe(130);
      expect(committedPositions).toEqual([0, 120, 130]);
      unmount();
    } finally {
      raf.mockRestore();
    }
  });

  it('cancels a pending frame and removes its scroll listener on unmount', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const scroller = document.createElement('div');
    const bodyRef = { current: scroller };
    const { unmount } = renderHook(() => useOnScroll(bodyRef));

    scroller.scrollTop = 120;
    fireEvent.scroll(scroller);
    expect(raf).toHaveBeenCalledTimes(1);
    unmount();
    expect(cancel).toHaveBeenCalledWith(42);

    fireEvent.scroll(scroller);
    expect(raf).toHaveBeenCalledTimes(1);
  });

  it('keeps its own scroll listener passive', () => {
    const scroller = document.createElement('div');
    const add = vi.spyOn(scroller, 'addEventListener');
    const { unmount } = renderHook(() => useOnScroll({ current: scroller }));

    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });
    unmount();
  });
});
