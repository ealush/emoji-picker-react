/** Ignore delegated events from a picker nested inside this picker. */
export function eventBelongsToPicker(
  event: Event,
  container: Element | null,
): boolean {
  // At window/document capture the browser retargets a shadow-root event
  // to its host. The original composed target still identifies the picker.
  const target = (event.composedPath?.()[0] ?? event.target) as Element | null;
  // Inspect the target rather than a global Element constructor: realms
  // (iframes) and DOM test environments may have different constructors.
  return (
    typeof target?.closest === 'function' &&
    !!container &&
    target.closest('[data-epr-part="root"]') ===
      container.closest('[data-epr-part="root"]')
  );
}
