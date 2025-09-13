import { useEffect, useState } from 'react';

import { ElementRef } from '../components/context/ElementRefContext';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

export function useOnScroll(BodyRef: ElementRef) {
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const bodyRef = BodyRef.current;
    if (!bodyRef) {
      return;
    }

    bodyRef.addEventListener('scroll', onScroll, {
      passive: true
    });

    function onScroll() {
      setScrollTop(bodyRef?.scrollTop ?? 0);
      closeAllOpenToggles();
    }

    return () => {
      bodyRef?.removeEventListener('scroll', onScroll);
    };
  }, [BodyRef, closeAllOpenToggles]);

  return scrollTop;
}
