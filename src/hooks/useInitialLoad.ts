import { useEffect } from 'react';

export function useMarkInitialLoad(
  dispatch: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    dispatch(true);
  }, []);
}
