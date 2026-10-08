// jsdom lacks parts of the platform the picker relies on (canvas, CSS
// cascade layers). Read the user agent from the document's window: on
// Node >= 21 the global `navigator` is Node's own, not jsdom's.
export function isJsdom(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const userAgent =
    document.defaultView?.navigator?.userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /jsdom/i.test(userAgent);
}
