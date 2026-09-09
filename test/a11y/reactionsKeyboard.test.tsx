import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle, Props } from '../../src';
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
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      },
    ],
  },
};

const renderReactions = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      reactionsDefaultOpen
      reactions={['1f600', '1f603']}
      {...props}
    />,
  );
};

const activeLabel = () =>
  document.activeElement?.getAttribute('aria-label') ?? '';

async function waitForFocus(label: RegExp | string) {
  await vi.waitFor(() => {
    if (typeof label === 'string') {
      expect(activeLabel()).toBe(label);
    } else {
      expect(activeLabel()).toMatch(label);
    }
  });
}

describe('reactions keyboard support (a11y)', () => {
  it('does not steal focus when reactions open', async () => {
    // Deliberate: opening in reactions mode leaves focus alone; keyboard
    // users tab into the bar, where arrows take over (see below).
    // https://github.com/ealush/emoji-picker-react/issues/411
    renderReactions();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(document.activeElement?.tagName).not.toBe('BUTTON');
  });

  it('moves focus between reactions and the expand button with arrow keys', async () => {
    // https://github.com/ealush/emoji-picker-react/issues/411
    renderReactions();

    // Keyboard users tab into the bar; arrows take over from there.
    const bar = await screen.findByRole('list', { name: /reactions/i });
    const [first] = Array.from(bar.querySelectorAll('button'));
    first.focus();
    await waitForFocus('grinning face');

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowRight',
    });
    await waitForFocus(/grinning face with big eyes/i);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowRight',
    });
    await waitForFocus('Show all Emojis');

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowLeft',
    });
    await waitForFocus(/grinning face with big eyes/i);
  });

  it('supports arrow keys in a late-mounted reactions bar', async () => {
    // When the user collapses the full picker, the bar mounts after the
    // keyboard listener effect first ran, so the listener must reinstall
    // on open. (Autofocus stays mount-only: collapsing by mouse click
    // must not steal focus.)
    render(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        reactions={['1f600', '1f603']}
        onEmojiClick={(_emoji, _event, api) => api?.collapseToReactions()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'grinning face' }),
    );

    // The collapse mounted the bar; keyboard users tab into it.
    const bar = await screen.findByRole('list', { name: /reactions/i });
    const [first] = Array.from(bar.querySelectorAll('button'));
    first.focus();
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'grinning face',
    );

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowRight',
    });
    await waitForFocus(/grinning face with big eyes/i);
  });

  it('keeps the reactions list itself as a named list', () => {
    renderReactions();

    expect(
      screen.getByRole('list', { name: /reactions/i }),
    ).toBeInTheDocument();
  });
});
