import { useEffect } from 'react';
import { ElementRef } from '../components/context/ElementRefContext';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

export function useOnScroll(BodyRef: ElementRef) {
  const { closeAllOpenToggles, dependencyArray } = useCloseAllOpenToggles();

  useEffect(() => {
    if (!BodyRef.current) {
      return;
    }

    BodyRef.current.addEventListener('scroll', onScroll, {
      passive: true
    });

    function onScroll() {
      closeAllOpenToggles();
    }

    return () => {
      BodyRef.current?.removeEventListener('scroll', onScroll);
    };
  }, dependencyArray);
}
