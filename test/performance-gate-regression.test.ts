import { createRequire } from 'node:module';
import { afterEach, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
import { gate } from '../bench/run';
const { metrics: baselineMetrics } = require('../bench/baseline.json');
const metrics = { ...baselineMetrics, baseBuildsForTenMounts: 0, baseBuildsForFreshTenMounts: 1 };
afterEach(() => vi.restoreAllMocks());

it.each([NaN, Infinity, -1, undefined])(
  'rejects invalid current timing %s',
  (value) => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const current = JSON.parse(JSON.stringify(metrics));
    current.cold[Object.keys(current.cold)[0]] = value;
    expect(gate(current, metrics)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('invalid timing metric'),
      ]),
    );
  },
);

it('rejects an invalid baseline and accepts valid identical metrics', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const baseline = JSON.parse(JSON.stringify(metrics));
  baseline.mount.ten = NaN;
  expect(gate(metrics, baseline)).toEqual(
    expect.arrayContaining([expect.stringContaining('invalid timing metric')]),
  );
  expect(gate(metrics, metrics)).toEqual([]);
});


it.each([0, 2, undefined])('rejects a missing or incorrect fresh-mount preparation count %s', (value) => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  const current = { ...metrics, baseBuildsForFreshTenMounts: value };
  expect(gate(current, metrics)).toEqual(expect.arrayContaining([
    expect.stringContaining('base builds for ten fresh-dataset mounts'),
  ]));
});
