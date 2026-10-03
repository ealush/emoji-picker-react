import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { SkinTonePickerLocation, SkinTones } from '../src';
import * as Picker from '../src/primitives';

const tones = (container: HTMLElement) =>
  container.querySelectorAll('[data-epr-part="skin-tone"]');
const tone = (container: HTMLElement, label: string) =>
  container.querySelector(`[aria-label="${label}"]`) as HTMLElement;

describe('SkinTone primitive', () => {
  it('places the skin tone control anywhere and drives the grid', () => {
    const onSkinToneChange = vi.fn();
    const { container } = render(
      <Picker.Root
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
        onSkinToneChange={onSkinToneChange}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <footer>
          <Picker.SkinTone direction="vertical" className="mine" />
        </footer>
      </Picker.Root>,
    );
    // Exactly one control: the built-in search placement is off.
    expect(tones(container)).toHaveLength(1);
    expect(
      container.querySelector('footer [data-epr-part="skin-tone"]'),
    ).not.toBeNull();
    expect(container.querySelector('footer .mine')).not.toBeNull();

    fireEvent.click(tone(container, 'Skin tone NEUTRAL'));
    fireEvent.click(tone(container, 'Skin tone DARK'));
    expect(onSkinToneChange).toHaveBeenCalledWith(SkinTones.DARK);
    expect(
      container.querySelector('[data-epr-unified="1f44d-1f3ff"]'),
    ).not.toBeNull();
  });

  it('removes the built-in control with NONE in the default picker', () => {
    const { container } = render(
      <EmojiPicker skinTonePickerLocation={SkinTonePickerLocation.NONE} />,
    );
    expect(tones(container)).toHaveLength(0);
  });

  it('keeps NONE when search is disabled', () => {
    const { container } = render(
      <EmojiPicker
        searchDisabled
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      />,
    );
    expect(tones(container)).toHaveLength(0);
  });

  it('warns when the built-in placement is also active', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Picker.Root skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}>
        <Picker.SkinTone />
      </Picker.Root>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('skinTonePickerLocation="NONE"'),
    );
    warn.mockRestore();
  });

  it('renders nothing when skin tones are disabled', () => {
    const { container } = render(
      <Picker.Root
        skinTonesDisabled
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <Picker.SkinTone className="mine" />
      </Picker.Root>,
    );
    expect(container.querySelector('.mine')).toBeNull();
  });
});
