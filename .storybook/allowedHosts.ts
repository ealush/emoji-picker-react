/** Both Storybook's HTTP server and Vite must accept configured dev hosts. */
export function parseAllowedHosts(value: string | undefined): string[] {
  return [
    ...new Set(
      (value ?? '')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean),
    ),
  ];
}

export function mergeAllowedHosts(
  existing: true | string[] | undefined,
  extra: readonly string[],
): true | string[] | undefined {
  if (existing === true || extra.length === 0) return existing;
  return [...new Set([...(existing ?? []), ...extra])];
}
