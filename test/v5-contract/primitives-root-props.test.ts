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
// to Root automatically. If a behavior prop ever skips Root, this
// assignment fails type-check (see `npm run check:contracts`).
const allBehaviorPropsReachRoot: MissingFromRoot extends never ? true : false =
  true;

describe('v5 Root prop contract (PRIMITIVES.md §5)', () => {
  it('covers every PickerProps behavior prop except appearance and composition switches', () => {
    expect(allBehaviorPropsReachRoot).toBe(true);
  });
});

// @ts-expect-error Presence belongs to JSX.
const search: RootProps = { children: null, searchDisabled: true };
// @ts-expect-error Presence belongs to JSX.
const tone: RootProps = { children: null, skinTonesDisabled: true };
// @ts-expect-error Placement belongs to JSX.
const location: RootProps = { children: null, skinTonePickerLocation: 'NONE' };
// @ts-expect-error Root mounting belongs to JSX.
const open: RootProps = { children: null, open: false };
// @ts-expect-error Root always renders supplied children.
const composition: RootProps = { children: null, composition: 'explicit' };
// @ts-expect-error Put panel props on Panel itself.
const panel: RootProps = { children: null, panelProps: {} };
const preview: RootProps = {
  children: null,
  // @ts-expect-error Preview presence belongs to JSX.
  previewConfig: { showPreview: false },
};
void [search, tone, location, open, composition, panel, preview];
