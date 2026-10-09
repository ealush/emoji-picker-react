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
      <Picker.Root onSkinToneChange={onSkinToneChange}>
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <footer>
          <Picker.SkinTone orientation="vertical" className="mine" />
        </footer>
      </Picker.Root>,
    );
    // Exactly one control: nothing is inserted automatically.
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

  it('ignores a stale placement switch without hiding the mounted part', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <Picker.Root
        {...({
          skinTonePickerLocation: SkinTonePickerLocation.PREVIEW,
        } as object)}
      >
        <Picker.SkinTone />
      </Picker.Root>,
    );
    expect(
      container.querySelector('[data-epr-part="skin-tone"]'),
    ).not.toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Root ignores composition props'),
    );
    warn.mockRestore();
  });

  it('renders the mounted part when skin tones are disabled on Root', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const { container } = render(
        <Picker.Root {...({ skinTonesDisabled: true } as object)}>
          <Picker.SkinTone className="mine" />
        </Picker.Root>,
      );
      // Presence belongs to the caller's JSX; the default picker (not Root)
      // translates skinTonesDisabled into omitting the part.
      expect(container.querySelector('.mine')).not.toBeNull();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Root ignores composition props'),
      );
    } finally {
      warn.mockRestore();
    }
  });
});
