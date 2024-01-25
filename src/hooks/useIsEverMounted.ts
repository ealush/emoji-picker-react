import * as React from 'react';

let isEverMounted = false;

export function useIsEverMounted() {
  const [isMounted, setIsMounted] = React.useState(isEverMounted);

  React.useEffect(() => {
    setIsMounted(true);
    isEverMounted = true;
  }, []);

  return isMounted || isEverMounted;
}
