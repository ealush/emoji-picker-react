import { act, render, screen, within } from '@testing-library/react';
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
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

// A controllable IntersectionObserver: captures observed targets and only
// reports intersections when the test says so. This simulates environments
// where the observer never fires on its own (zero-height containers,
// hidden modals at mount), which deadlocks emoji rendering.
// https://github.com/ealush/emoji-picker-react/issues/469
// https://github.com/ealush/emoji-picker-react/issues/475
let capturedCallback: IntersectionObserverCallback | null = null;
let capturedTargets: Element[] = [];

class ManualIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    capturedCallback = callback;
  }

  observe(target: Element) {
    capturedTargets.push(target);
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function fireIntersections(ids: string[]) {
  const entries = capturedTargets.map(
    (target) =>
      ({
        target,
        isIntersecting: ids.includes(target.getAttribute('data-name') ?? ''),
        intersectionRatio: ids.includes(
          target.getAttribute('data-name') ?? '',
        )
          ? 1
          : 0,
        boundingClientRect: {},
        intersectionRect: {},
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry),
  );
  capturedCallback?.(entries, {} as IntersectionObserver);
}

const renderPicker = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      {...props}
    />,
  );
};

const emojisIn = (name: string) =>
  within(screen.getByRole('rowgroup', { name })).queryAllByRole('button');

describe('first-paint render gating', () => {
  const realIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    capturedCallback = null;
    capturedTargets = [];
    // @ts-expect-error - test shim
    globalThis.IntersectionObserver = ManualIntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = realIO;
  });

  it('renders the first category without waiting for the observer', () => {
    // The observer is the only writer of visibleCategories. When it never
    // fires (zero-height container, hidden modal), nothing renders at all.
    // The first category must paint optimistically to break the deadlock.
    renderPicker();

    expect(capturedTargets.length).toBeGreaterThan(0);
    expect(emojisIn('Smileys & People')).toHaveLength(1);
  });

  it('renders later categories once the observer reports them', () => {
    renderPicker();

    expect(emojisIn('Animals & Nature')).toHaveLength(0);

    act(() => {
      fireIntersections([Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]);
    });

    expect(emojisIn('Animals & Nature')).toHaveLength(1);
  });
});
