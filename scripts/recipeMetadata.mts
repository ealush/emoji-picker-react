import { readFileSync } from 'node:fs';

export type Recipe = {
  title: string;
  name: string;
  rootClass: string;
  description: string;
  order: number;
  root?: string;
};

/** Validate metadata before any generator can replace committed output. */
export function readRecipe(file: string): Recipe {
  const value: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!value || typeof value !== 'object')
    throw new Error(`${file}: expected recipe object`);
  for (const key of ['title', 'name', 'rootClass', 'description'] as const) {
    if (
      !(key in value) ||
      typeof (value as Record<string, unknown>)[key] !== 'string'
    ) {
      throw new Error(`${file}: expected string "${key}"`);
    }
  }
  if (
    !('order' in value) ||
    typeof value.order !== 'number' ||
    !Number.isFinite(value.order)
  ) {
    throw new Error(`${file}: expected finite numeric "order"`);
  }
  if ('root' in value && typeof value.root !== 'string')
    throw new Error(`${file}: expected string "root"`);
  return value as Recipe;
}
