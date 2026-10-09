import { render, screen, within } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { SkinTones } from '../src';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

describe('recents under an active skin tone', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('lists an emoji once when recents hold it neutral and toned', async () => {
    // A neutral pick followed by a medium-tone pick of the same emoji.
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([
        { unified: '1f44d-1f3fd', original: '1f44d', count: 1 },
        { unified: '1f44d', original: '1f44d', count: 1 },
      ]),
    );
    const consoleError = vi.spyOn(console, 'error');

    render(
      <EmojiPicker skinTone={SkinTones.MEDIUM} autoFocusSearch={false} />,
    );

    const recents = await screen.findByRole('rowgroup', {
      name: 'Frequently Used',
    });
    const thumbs = await within(recents).findAllByRole('gridcell', {
      name: 'thumbs up',
    });
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0].textContent).toBe('👍🏽');
    expect(
      consoleError.mock.calls.some((call) =>
        String(call[0]).includes('same key'),
      ),
    ).toBe(false);
  });
});
