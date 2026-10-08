/** Shared query normalization used by the picker runtime and data API. */
export function normalizeQuery(input: string): string {
  return typeof input === 'string' ? input.trim().toLowerCase() : '';
}
