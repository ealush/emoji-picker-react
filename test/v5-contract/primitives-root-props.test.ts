import { describe, expect, it } from 'vitest';

import type { PickerProps } from '../../src/index';
import type {
  PickerAppearanceProps,
  PickerCompositionProps,
  RootProps,
} from '../../src/primitives/types';

type MissingFromRoot = Exclude<
  keyof PickerProps,
  keyof RootProps | PickerAppearanceProps | PickerCompositionProps
>;

// Compile-time gate (docs/v5/PRIMITIVES.md §5): Root takes every
// PickerProps behavior prop by subtraction, so a new behavior prop flows
// to Root automatically. Appearance props stay with the default picker;
// composition props (presence/placement) belong to the caller's JSX and
// are translated by the default picker. If a behavior prop ever skips
// Root, this assignment fails type-check (see `npm run type-check`).
const allBehaviorPropsReachRoot: MissingFromRoot extends never ? true : false =
  true;

describe('v5 Root prop contract (PRIMITIVES.md §5)', () => {
  it('covers every PickerProps behavior prop except appearance and composition', () => {
    expect(allBehaviorPropsReachRoot).toBe(true);
  });
});
