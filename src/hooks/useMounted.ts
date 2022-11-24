import { useState, useEffect } from 'react';

export function useMounted() {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, [])
  return mounted;
}