import { useEffect } from 'react';

import { ElementRef } from '../components/context/ElementRefContext';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

export function useOnScroll(BodyRef: ElementRef) {
  const closeAllOpenToggles = useCloseAllOpenToggles();

  useEffect(() => {
    const bodyRef = BodyRef.current;
    if (!bodyRef) {
      return;
    }

    bodyRef.addEventListener('scroll', onScroll, {
      passive: true
    });

    function onScroll() {
      closeAllOpenToggles();
    }

    return () => {
      bodyRef?.removeEventListener('scroll', onScroll);
    };
  }, [BodyRef, closeAllOpenToggles]);
}
