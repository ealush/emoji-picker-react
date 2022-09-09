import { useCallback } from 'react';
import { useBodyRef } from '../components/context/ElementRefContext';

export function scrollTo(root: HTMLElement | null, top: number = 0) {
  const $eprBody = root ? root.querySelector('.epr-body') : null;

  if (!root || !$eprBody) {
    return;
  }

  requestAnimationFrame(() => {
    $eprBody.scrollTop = top + 1;
  });
}

export function useScrollTo() {
  const BodyRef = useBodyRef();

  return useCallback(
    (top: number) => {
      requestAnimationFrame(() => {
        if (BodyRef.current) {
          BodyRef.current.scrollTop = top;
        }
      });
    },
    [BodyRef.current]
  );
}
