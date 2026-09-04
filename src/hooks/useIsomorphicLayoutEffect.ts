import * as React from 'react';

// `useLayoutEffect` warns during SSR since it never runs on the server.
// Fall back to `useEffect` there: measurement only matters on the client.
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
