import { describe, expect, it } from 'vitest';

import {
  mergeAllowedHosts,
  parseAllowedHosts,
} from '../.storybook/allowedHosts';

describe('Storybook development hosts', () => {
  it('normalizes comma-separated hostnames without duplicates', () => {
    expect(parseAllowedHosts(undefined)).toEqual([]);
    expect(parseAllowedHosts(' a.invalid, ,b.invalid, a.invalid ')).toEqual([
      'a.invalid',
      'b.invalid',
    ]);
  });
  it('preserves defaults, existing hosts and an explicit unrestricted Vite setting', () => {
    expect(mergeAllowedHosts(undefined, [])).toBeUndefined();
    expect(mergeAllowedHosts(['old.invalid'], [])).toEqual(['old.invalid']);
    expect(
      mergeAllowedHosts(['old.invalid'], ['new.invalid', 'old.invalid']),
    ).toEqual(['old.invalid', 'new.invalid']);
    expect(mergeAllowedHosts(true, ['new.invalid'])).toBe(true);
  });
});
