import { JSDOM } from 'jsdom';
import {
  installGlobals,
  FixtureIntersectionObserver,
} from '../scripts/fixtureDom.js';
// Shared benchmark utilities (PERFORMANCE.md §4, §10).
// Wall-clock comparison only; deterministic invariants (single base-index
// construction, render isolation, cancellation) live in unit tests.
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Representative queries per PERFORMANCE.md §4.1: lengths 1, 2, 4, 8 plus
// a no-match query. All match the packaged English dataset.
const COLD_QUERIES = ['a', 'sm', 'cat', 'birthday', 'zzz-no-match'];

// Realistic typing prefixes per PERFORMANCE.md §4.2, plus a
// backspace/retype tail.
const INCREMENTAL_SEQUENCES = [
  ['c', 'ca', 'cat'],
  ['s', 'sm', 'smi', 'smil', 'smile'],
  ['smil', 'smi', 'smil', 'smile'],
];

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });
  installGlobals(dom);
  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = FixtureIntersectionObserver;
  }
}

export { median, mean, COLD_QUERIES, INCREMENTAL_SEQUENCES, installDom };
