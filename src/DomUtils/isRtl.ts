// Computed direction, so `dir` on any ancestor (or CSS) applies.
export function isRtl(element: Element | null): boolean {
  return (
    !!element &&
    typeof window !== 'undefined' &&
    window.getComputedStyle(element).direction === 'rtl'
  );
}
