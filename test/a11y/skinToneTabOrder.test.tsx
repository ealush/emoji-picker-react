import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkinTonePicker } from '../../src/components/header/SkinTonePicker/SkinTonePicker';
import { SkinTones } from '../../src/types/exposedTypes';

// Mocks
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useSkinTonePickerRef: vi.fn(),
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useSkinToneFanOpenState: vi.fn(),
  useActiveSkinToneState: vi.fn(),
}));

vi.mock('../../src/config/useConfig', () => ({
  useOnSkinToneChangeConfig: vi.fn(),
  useSkinTonesDisabledConfig: vi.fn(),
}));

vi.mock('../../src/hooks/useCloseAllOpenToggles', () => ({
  useCloseAllOpenToggles: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/hooks/useFocus', () => ({
  useFocusSearchInput: vi.fn(() => vi.fn()),
}));

// Import mocks to configure return values
import {
  useSkinTonesDisabledConfig,
  useOnSkinToneChangeConfig,
} from '../../src/config/useConfig';
import {
  useSkinToneFanOpenState,
  useActiveSkinToneState,
} from '../../src/components/context/PickerContext';
import { useSkinTonePickerRef } from '../../src/components/context/ElementRefContext';

describe('SkinTonePicker tab order (a11y)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSkinTonePickerRef as any).mockReturnValue({ current: null });
    (useSkinTonesDisabledConfig as any).mockReturnValue(false);
    (useOnSkinToneChangeConfig as any).mockReturnValue(vi.fn());
    (useActiveSkinToneState as any).mockReturnValue([
      SkinTones.NEUTRAL,
      vi.fn(),
    ]);
  });

  it('removes closed, inactive tones from the tab order', () => {
    // Regression test for https://github.com/ealush/emoji-picker-react/issues/492
    // Closed tones are opacity:0 and stacked, but still focusable, so Tab
    // cycles through invisible buttons.
    (useSkinToneFanOpenState as any).mockReturnValue([false, vi.fn()]);

    render(<SkinTonePicker />);

    const tones = screen.getAllByRole('button');
    // neutral + 5 variations
    expect(tones).toHaveLength(6);

    const tabbables = tones.filter((tone) => tone.tabIndex !== -1);
    expect(tabbables).toHaveLength(1);
    expect(tabbables[0].getAttribute('aria-label')).toMatch(/neutral/i);
  });

  it('restores every tone to the tab order when the fan opens', () => {
    (useSkinToneFanOpenState as any).mockReturnValue([true, vi.fn()]);

    render(<SkinTonePicker />);

    const tones = screen.getAllByRole('button');
    expect(tones).toHaveLength(6);
    for (const tone of tones) {
      expect(tone.tabIndex).not.toBe(-1);
    }
  });
});
