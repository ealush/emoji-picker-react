import { useEffect } from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';
import { useDisallowMouseRef } from '../components/context/PickerContext';

export function useDisallowMouseMove() {
  const DisallowMouseRef = useDisallowMouseRef();
  return function disallowMouseMove() {
    DisallowMouseRef.current = true;
  };
}

export function useAllowMouseMove() {
  const DisallowMouseRef = useDisallowMouseRef();
  return function allowMouseMove() {
    DisallowMouseRef.current = false;
  };
}

export function useIsMouseDisallowed() {
  const DisallowMouseRef = useDisallowMouseRef();
  return function isMouseDisallowed() {
    return DisallowMouseRef.current;
  };
}

export function useOnMouseMove() {
  const BodyRef = useBodyRef();
  const allowMouseMove = useAllowMouseMove();
  const isMouseDisallowed = useIsMouseDisallowed();

  useEffect(() => {
    const bodyRef = BodyRef.current;
    bodyRef?.addEventListener('mousemove', onMouseMove, {
      passive: true
    });

    function onMouseMove() {
      if (isMouseDisallowed()) {
        allowMouseMove();
      }
    }
    return () => {
      bodyRef?.removeEventListener('mousemove', onMouseMove);
    };
  }, [BodyRef, allowMouseMove, isMouseDisallowed]);
}
