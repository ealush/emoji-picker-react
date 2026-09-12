import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../../src';
import { Categories } from '../../src/config/categoryConfig';
import { EmojiData } from '../../src/types/exposedTypes';

vi.mock('../../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      { n: ['smiling face with smiling eyes'], u: '1f60a', a: '0.6' },
    ],
  },
};

// Controllable observer: records every observed target and only reports
// intersections on demand. Unlike the global test mock (which reports
// everything visible immediately), this proves re-subscription happens.
let capturedCallback: IntersectionObserverCallback | null = null;
let observedTargets: Element[] = [];
let disconnected = 0;

class ManualIntersectionObserver {
  private observed: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    capturedCallback = callback;
  }

  observe(target: Element) {
    this.observed.push(target);
    observedTargets.push(target);
  }

  unobserve(target: Element) {
    observedTargets = observedTargets.filter(t => t !== target);
  }

  disconnect() {
    // A disconnected observer forgets its targets, like the real one.
    const mine = new Set(this.observed);
    observedTargets = observedTargets.filter(t => !mine.has(t));
    this.observed = [];
    disconnected += 1;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function fireVisible(dataName: string) {
  const entries = observedTargets.map(
    target =>
      ({
        target,
        isIntersecting:
          target.getAttribute('data-name') === dataName,
        intersectionRatio:
          target.getAttribute('data-name') === dataName ? 1 : 0,
        boundingClientRect: {},
        intersectionRect: {},
        rootBounds: null,
        time: Date.now(),
      }) as unknown as IntersectionObserverEntry,
  );
  capturedCallback?.(entries, {} as IntersectionObserver);
}

function observedNames() {
  return observedTargets.map(
    target => target.getAttribute('data-name') ?? '',
  );
}

const pandaAnimals = {
  names: ['Panda'],
  imgUrl: 'https://example.com/panda.png',
  id: 'panda',
  group: 'animals',
};
const ninjaPeople = {
  names: ['Ninja'],
  imgUrl: 'https://example.com/ninja.png',
  id: 'ninja',
  group: 'people',
};

/**
 * Category observation must follow the effective category list: added
 * sections get observed, removed ones stop contributing, and newly
 * visible groups render, activate, and navigate.
 */
describe('category observation follows group updates', () => {
  const realIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    capturedCallback = null;
    observedTargets = [];
    disconnected = 0;
    window.localStorage.clear();
    // @ts-expect-error - test shim
    globalThis.IntersectionObserver = ManualIntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = realIO;
  });

  it('observes a newly added group and activates its tab when visible', async () => {
    const { rerender, unmount } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(observedNames()).toContain('custom:animals');
    expect(observedNames()).not.toContain('custom:people');

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals, ninjaPeople]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    // The new section is observed...
    expect(observedNames()).toContain('custom:people');

    // ...and reporting it visible renders its content + activates its tab.
    fireVisible('custom:people');
    expect(
      await screen.findByLabelText('ninja'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'People' }).getAttribute('aria-selected'),
    ).toBe('true');

    unmount();
    expect(disconnected).toBeGreaterThan(0);
  });

  it('stops observing removed sections', async () => {
    const { rerender } = render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals, ninjaPeople]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
          { category: Categories.CUSTOM, group: 'people', name: 'People' },
        ]}
        autoFocusSearch={false}
      />,
    );

    expect(observedNames()).toContain('custom:people');

    const before = observedTargets.length;
    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        customEmojis={[pandaAnimals]}
        categories={[
          { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
        ]}
        autoFocusSearch={false}
      />,
    );

    // Re-subscription drops the removed element (or at minimum the set
    // no longer contains it among currently rendered sections).
    const after = observedNames().filter(name => name === 'custom:people');
    expect(after).toHaveLength(0);
    expect(observedTargets.length).toBeLessThanOrEqual(before);
  });
});
