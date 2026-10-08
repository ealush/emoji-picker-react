import { render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import EmojiPicker, { Categories } from '../src';
import * as nativeSupport from '../src/dataUtils/nativeEmojiSupport';

afterEach(() => vi.restoreAllMocks());

it('binds rendered native glyphs to the same font token and fallback as detection', () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('test-browser');
  const probe = vi
    .spyOn(nativeSupport, 'detectNativeEmojiSupport')
    .mockReturnValue(nativeSupport.UNKNOWN_SUPPORT);
  const { container } = render(
    <EmojiPicker
      style={
        { '--epr-emoji-font-family': 'Custom Emoji' } as React.CSSProperties
      }
      categories={[Categories.SMILEYS_PEOPLE]}
      emojiData={{
        categories: {},
        emojis: {
          [Categories.SMILEYS_PEOPLE]: [
            { u: '1f600', n: ['grinning face'], a: '1' },
          ],
        },
      }}
    />,
  );
  const glyph = container.querySelector('.epr-emoji-native')!;
  expect(glyph).not.toBeNull();
  expect(probe).toHaveBeenCalledWith('Custom Emoji', false);
  // jsdom does not resolve custom properties or reliably cascade
  // !important against universal resets. Inspect the matching rule
  // injected for this real glyph; a browser probe covers its computed font.
  const fontRule = Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
    .find(
      (rule) =>
        glyph.matches(rule.selectorText) &&
        rule.style
          .getPropertyValue('font-family')
          .includes('--epr-emoji-font-family'),
    );
  expect(fontRule).toBeDefined();
  expect(fontRule?.style.getPropertyValue('font-family')).toBe(
    `var(--epr-emoji-font-family, ${nativeSupport.DEFAULT_NATIVE_EMOJI_FONT})`,
  );
  expect(fontRule?.style.getPropertyPriority('font-family')).toBe('important');
});
