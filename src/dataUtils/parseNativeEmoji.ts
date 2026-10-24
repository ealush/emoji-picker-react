export function parseNativeEmoji(unified: string): string {
  return String.fromCodePoint(
    ...unified.split('-').map((hex) => parseInt(hex, 16)),
  );
}
