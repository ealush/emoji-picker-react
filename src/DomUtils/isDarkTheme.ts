export function isSystemDarkTheme(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!window.matchMedia('(prefers-color-scheme: dark)').matches;
}
