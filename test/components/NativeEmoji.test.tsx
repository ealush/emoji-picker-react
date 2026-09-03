import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { stylesheet } from '../../src/Stylesheet/stylesheet';
import { NativeEmoji } from '../../src/components/emoji/NativeEmoji';

describe('NativeEmoji', () => {
  it('renders at the configured emoji size, not the zeroing reset', () => {
    // The suite renders components without the picker's <PickerStyleTag>,
    // so mount the emitted CSS the same way the app does.
    render(
      <>
        <style>{stylesheet.getStyle()}</style>
        <NativeEmoji unified="1f600" style={{}} />
      </>,
    );
    const emoji = screen.getByText('😀');
    // emojiStyles.external zeroes the font-size for image containers; the
    // real size must win the cx() composition or native emoji are invisible.
    expect(getComputedStyle(emoji).fontSize).toBe('var(--epr-emoji-size)');
  });
});
