import { afterEach, describe, expect, it } from 'vitest';

import { idRef } from '../../src/DomUtils/idRef';

describe('idRef', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps an id the target already has', () => {
    const input = document.createElement('input');
    const target = document.createElement('div');
    target.id = 'host-grid';
    idRef(input, 'aria-controls', target);
    expect(input.getAttribute('aria-controls')).toBe('host-grid');
  });

  it("never reuses a host's epr-<n> id", () => {
    // A host element that a counter-based id would have hit.
    document.body.innerHTML = '<div id="epr-1"></div><div id="epr-2"></div>';
    const input = document.createElement('input');
    const targets = [1, 2, 3].map(() => {
      const target = document.createElement('div');
      document.body.appendChild(target);
      idRef(input, 'aria-activedescendant', target);
      return target;
    });
    const ids = targets.map((target) => target.id);
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) {
      expect(id).toMatch(/^epr-/);
      expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    }
    expect(input.getAttribute('aria-activedescendant')).toBe(ids[2]);
  });

  it('removes the reference without a target', () => {
    const input = document.createElement('input');
    input.setAttribute('aria-activedescendant', 'x');
    idRef(input, 'aria-activedescendant', null);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });
});
