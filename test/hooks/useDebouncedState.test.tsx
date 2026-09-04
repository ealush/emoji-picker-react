import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedState } from '../../src/hooks/useDebouncedState';

describe('useDebouncedState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the initial value until the delay elapses', async () => {
    const { result } = renderHook(() => useDebouncedState('a', 100));

    let pending: Promise<string>;
    act(() => {
      pending = result.current[1]('b');
    });

    expect(result.current[0]).toBe('a');

    await act(async () => {
      vi.advanceTimersByTime(100);
      await pending;
    });

    expect(result.current[0]).toBe('b');
  });

  it('last write wins when calls overlap', async () => {
    const { result } = renderHook(() => useDebouncedState('a', 100));

    let pending: Promise<string>;
    act(() => {
      result.current[1]('b');
    });
    act(() => {
      pending = result.current[1]('c');
    });

    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(100);
      await pending;
    });

    expect(result.current[0]).toBe('c');
  });
});
