import { useEffect, useRef, useState } from 'react';

import { ElementRef } from '../components/context/ElementRefContext';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';

export function useOnScroll(BodyRef: ElementRef) {
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const [scrollTop, setScrollTop] = useState(0);
  const latestRef = useRef(0);
  const scheduledRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    const bodyRef = BodyRef.current;
    if (!bodyRef) {
      return;
    }

    bodyRef.addEventListener('scroll', onScroll, {
      passive: true,
    });

    // High-frequency geometry work coalesces to at most one scheduled
    // virtualization update per animation frame.
    // Toggle dismissal stays immediate: those setters bail out when
    // nothing is open, so unrelated regions never rerender for it.
    function onScroll() {
      latestRef.current = bodyRef?.scrollTop ?? 0;
      if (!scheduledRef.current) {
        scheduledRef.current = true;
        frameRef.current = requestAnimationFrame(() => {
          scheduledRef.current = false;
          setScrollTop(latestRef.current);
        });
      }
      closeAllOpenToggles();
    }

    return () => {
      bodyRef?.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameRef.current);
      scheduledRef.current = false;
    };
  }, [BodyRef, closeAllOpenToggles]);

  return scrollTop;
}
