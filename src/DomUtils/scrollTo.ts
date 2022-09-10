import { useCallback } from 'react';
import { useBodyRef } from '../components/context/ElementRefContext';
import { NullableElement } from './selectors';

export function scrollTo(root: NullableElement, top: number = 0) {
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
