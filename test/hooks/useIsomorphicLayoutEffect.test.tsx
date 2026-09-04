import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { useIsomorphicLayoutEffect } from '../../src/hooks/useIsomorphicLayoutEffect';

describe('useIsomorphicLayoutEffect', () => {
  it('uses useLayoutEffect on the client, where window exists', () => {
    expect(typeof window).not.toBe('undefined');
    expect(useIsomorphicLayoutEffect).toBe(React.useLayoutEffect);
  });

  it('runs the effect when mounted', () => {
    let calls = 0;
    const { unmount } = renderHook(() =>
      useIsomorphicLayoutEffect(() => {
        calls += 1;
      }),
    );

    expect(calls).toBe(1);
    unmount();
  });
});
