// Computed direction, so `dir` on any ancestor (or CSS) applies. Client
// only: called from event handlers and an opened tone fan.
export function isRtl(element: Element | null): boolean {
  return !!element && getComputedStyle(element).direction === 'rtl';
}
