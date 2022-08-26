import { useEffect } from 'react';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

export function useOnScroll(
  bodyRef: React.MutableRefObject<HTMLDivElement | null>
) {
  const { closeAllOpenToggles, dependencyArray } = useCloseAllOpenToggles();

  useEffect(() => {
    if (!bodyRef.current) {
      return;
    }

    bodyRef.current.addEventListener('scroll', onScroll, {
      passive: true
    });

    function onScroll() {
      closeAllOpenToggles();
    }

    return () => {
      bodyRef.current?.removeEventListener('scroll', onScroll);
    };
  }, dependencyArray);
}
