import { act, render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
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

function scrollBody(): HTMLElement {
  return document.querySelector(
    '[data-epr-part="viewport"]',
  ) as HTMLElement;
}

describe('v5 scroll commit coalescing (PERFORMANCE.md §6)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('coalesces a burst of scroll events into one virtualization commit', async () => {
    const scheduled: FrameRequestCallback[] = [];
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        scheduled.push(callback);
        return scheduled.length;
      });

    try {
      render(<EmojiPicker emojiData={minimalEmojiData} />);
      await screen.findByRole('grid');
      const scroller = scrollBody();
      const commitsBefore = scheduled.length;

      // Burst of 120 scroll events across one frame (synchronously, so no
      // frame can flush between them).
      for (let top = 1; top <= 120; top += 1) {
        (scroller as unknown as { scrollTop: number }).scrollTop = top;
        fireEvent.scroll(scroller);
      }

      // Exactly one frame scheduled for the whole burst.
      expect(scheduled.length - commitsBefore).toBe(1);

      // Flushing applies the latest position, not an intermediate one.
      const frames = scheduled.slice(commitsBefore);
      act(() => {
        for (const frame of frames) {
          frame(0);
        }
      });

      // A later burst schedules exactly one more frame.
      for (let top = 121; top <= 130; top += 1) {
        (scroller as unknown as { scrollTop: number }).scrollTop = top;
        fireEvent.scroll(scroller);
      }
      expect(scheduled.length - commitsBefore).toBe(2);
    } finally {
      raf.mockRestore();
    }
  });

  it('keeps the scroll listener passive', () => {
    const added: Array<{ type: string; options: unknown }> = [];
    const original = HTMLElement.prototype.addEventListener;
    const addSpy = vi
      .spyOn(HTMLElement.prototype, 'addEventListener')
      .mockImplementation(function (
        this: HTMLElement,
        type: string,
        listener: EventListener,
        options?: unknown,
      ) {
        added.push({ type, options });
        return original.call(
          this,
          type,
          listener,
          options as AddEventListenerOptions,
        );
      });
    try {
      render(<EmojiPicker emojiData={minimalEmojiData} />);
      const scrollRegistrations = added.filter(
        ({ type }) => type === 'scroll',
      );
      expect(scrollRegistrations.length).toBeGreaterThan(0);
      // The picker's own registration uses object-form passive options
      // (React root listeners may use capture booleans; those are not ours).
      const objectForm = scrollRegistrations.filter(
        ({ options }) => typeof options === 'object',
      );
      expect(objectForm.length).toBeGreaterThan(0);
      for (const { options } of objectForm) {
        expect(options).toMatchObject({ passive: true });
      }
    } finally {
      addSpy.mockRestore();
    }
  });
});
