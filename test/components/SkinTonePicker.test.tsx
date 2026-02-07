
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkinTonePicker } from '../../src/components/header/SkinTonePicker/SkinTonePicker';
import { SkinTones } from '../../src/types/exposedTypes';

// Mocks
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useSkinTonePickerRef: vi.fn()
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useSkinToneFanOpenState: vi.fn(),
  useActiveSkinToneState: vi.fn()
}));

vi.mock('../../src/config/useConfig', () => ({
  useOnSkinToneChangeConfig: vi.fn(),
  useSkinTonesDisabledConfig: vi.fn()
}));

vi.mock('../../src/hooks/useCloseAllOpenToggles', () => ({
  useCloseAllOpenToggles: vi.fn(() => vi.fn())
}));

vi.mock('../../src/hooks/useFocus', () => ({
  useFocusSearchInput: vi.fn(() => vi.fn())
}));

// Import mocks to configure return values
import { useSkinTonesDisabledConfig, useOnSkinToneChangeConfig } from '../../src/config/useConfig';
import { useSkinToneFanOpenState, useActiveSkinToneState } from '../../src/components/context/PickerContext';

describe('SkinTonePicker', () => {
  const setSkinToneFanOpenStateMock = vi.fn();
  const setActiveSkinToneMock = vi.fn();
  const onSkinToneChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSkinTonesDisabledConfig as any).mockReturnValue(false);
    (useSkinToneFanOpenState as any).mockReturnValue([false, setSkinToneFanOpenStateMock]);
    (useActiveSkinToneState as any).mockReturnValue([SkinTones.NEUTRAL, setActiveSkinToneMock]);
    (useOnSkinToneChangeConfig as any).mockReturnValue(onSkinToneChangeMock);
  });

  it('renders nothing if disabled', () => {
    (useSkinTonesDisabledConfig as any).mockReturnValue(true);
    const { container } = render(<SkinTonePicker />);
    expect(container.firstChild).toBeNull();
  });

  it('renders skin tones', () => {
    render(<SkinTonePicker />);
    // There are 6 skin tones
    const buttons = screen.getAllByRole('button'); // Assuming BtnSkinToneVariation renders a button
    expect(buttons.length).toBe(6);
  });

  it('opens fan on click when closed', () => {
    render(<SkinTonePicker />);
    const buttons = screen.getAllByRole('button');
    // Clicking any button when closed should open it
    fireEvent.click(buttons[0]);
    expect(setSkinToneFanOpenStateMock).toHaveBeenCalledWith(true);
  });

  it('changes skin tone on click when open', () => {
    (useSkinToneFanOpenState as any).mockReturnValue([true, setSkinToneFanOpenStateMock]);
    render(<SkinTonePicker />);
    const buttons = screen.getAllByRole('button');
    
    // Click the second skin tone
    fireEvent.click(buttons[1]);
    
    // Should verify which skin tone is at index 1.
    // data/skinToneVariations export:
    // [SkinTones.NEUTRAL, SkinTones.LIGHT, SkinTones.MEDIUM_LIGHT, SkinTones.MEDIUM, SkinTones.MEDIUM_DARK, SkinTones.DARK]
    // Index 1 is SkinTones.LIGHT ("1f3fb")
    
    expect(setActiveSkinToneMock).toHaveBeenCalledWith('1f3fb');
    expect(onSkinToneChangeMock).toHaveBeenCalledWith('1f3fb');
  });
});
