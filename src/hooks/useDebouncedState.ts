import { useRef, useState } from 'react';

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 0
): [T, (value: T) => Promise<T>] {
  const [state, setState] = useState<T>(initialValue);
  const timer = useRef<number | null>(null);

  function debouncedSetState(value: T) {
    return new Promise<T>(resolve => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = window?.setTimeout(() => {
        setState(value);
        resolve(value);
      }, delay);
    });
  }

  return [state, debouncedSetState];
}
