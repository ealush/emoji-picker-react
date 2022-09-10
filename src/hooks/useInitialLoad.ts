import { useEffect } from 'react';
import * as React from 'react';

export function useMarkInitialLoad(
  dispatch: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    dispatch(true);
  }, [dispatch]);
}
