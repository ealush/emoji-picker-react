import { useRef, useState } from 'react';

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 0
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const timer = useRef<number | null>(null);

  function debouncedSetState(value: T) {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(() => {
      setState(value);
    }, delay);
  }

  return [state, debouncedSetState];
}
