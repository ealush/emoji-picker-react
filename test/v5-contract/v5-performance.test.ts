import { describe, it } from 'vitest';

/**
 * v5 performance test plan.
 *
 * PERFORMANCE.md defines the benchmark harness and thresholds. These TODOs
 * become executable invariant/render-count tests during implementation.
 */

describe('v5 prepared data core', () => {
  it.todo('builds default dataset index once for ten same-data Roots');
  it.todo('returns the same prepared-core identity for the same emojiData object');
  it.todo('does not JSON clone the full default dataset per Root');
  it.todo('does not mutate caller emojiData or customEmojis');
  it.todo('does not retain Root controllers through the data cache');
});

describe('v5 render isolation', () => {
  it.todo('preview hover does not rerender Search CategoryNav or Reactions');
  it.todo('scroll does not rerender Search CategoryNav Preview or Reactions');
  it.todo('search query changes do not rerender Reactions');
  it.todo('Root A updates do not rerender Root B');
});

describe('v5 scroll work', () => {
  it.todo('uses a passive scroll listener');
  it.todo('coalesces virtualization updates to at most one per animation frame');
});

describe('v5 package performance invariants', () => {
  it.todo('data entry imports neither React nor ShipStyles');
  it.todo('primitives-only consumer excludes default appearance wrapper');
  it.todo('single locale consumer does not include every locale');
});
