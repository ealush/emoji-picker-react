import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle, SkinTonePickerLocation } from '../src';
import * as Picker from '../src/primitives';
import { __resetRootWarningsForTest } from '../src/primitives/Root';

const toneButtons = () =>
  document.querySelectorAll('[data-epr-part="skin-tone-button"]');

describe('skin tone control placement fallbacks', () => {
  it('moves a preview-located control to Search when the preview is off', () => {
    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        previewConfig={{ showPreview: false }}
      />,
    );
    expect(toneButtons().length).toBeGreaterThan(0);
    expect(
      document.querySelector('[data-epr-part="search"] [data-epr-part="skin-tone"]'),
    ).not.toBeNull();
  });

  it('moves a search-located control to the preview when search is off', () => {
    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        searchDisabled
        skinTonePickerLocation={SkinTonePickerLocation.SEARCH}
      />,
    );
    expect(
      document.querySelector('[data-epr-part="preview"] [data-epr-part="skin-tone"]'),
    ).not.toBeNull();
  });

  it('renders no built-in control when neither region exists', () => {
    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        searchDisabled
        previewConfig={{ showPreview: false }}
      />,
    );
    expect(toneButtons().length).toBe(0);
  });

  it('keeps an explicit NONE', () => {
    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      />,
    );
    expect(toneButtons().length).toBe(0);
  });
});

describe('custom emoji images', () => {
  it('use the emoji name as alternative text', () => {
    render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        customEmojis={[{ id: 'PARROT', names: ['party parrot'], imgUrl: '/parrot.gif' }]}
      />,
    );
    const image = document.querySelector('img[src="/parrot.gif"]') as HTMLImageElement;
    expect(image.alt).toBe('party parrot');
  });
});

describe('Root theme prop', () => {
  afterEach(() => {
    __resetRootWarningsForTest();
    vi.restoreAllMocks();
  });

  it('warns once in development and never reaches the DOM', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Picker.Root {...({ theme: 'dark' } as object)}>
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    const root = screen.getByRole('complementary');
    expect(root.getAttribute('theme')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('colorScheme');
  });
});
