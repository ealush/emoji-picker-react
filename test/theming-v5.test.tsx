import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';
import { stylesheet } from '../src/Stylesheet/stylesheet';
import * as Picker from '../src/primitives';
import {
  structuralPickerTokens,
  darkPickerTokens,
} from '../src/primitives/tokens';

function Bare(props: Partial<React.ComponentProps<typeof Picker.Root>>) {
  return (
    <Picker.Root {...props}>
      <Picker.Search />
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>
  );
}

const allStyles = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('style'))
    .map((tag) => tag.innerHTML)
    .join('\n');

describe('primitives theming', () => {
  it('applies every geometry token on a bare Root', () => {
    const { container } = render(<Bare />);
    const css = allStyles(container);
    for (const token of Object.keys(structuralPickerTokens)) {
      expect(css).toContain(token);
    }
    // ...but no color theme unless asked for.
    expect(container.querySelector('aside')?.className).not.toMatch(
      /epr-theme-/,
    );
  });

  it.each([
    ['light', 'epr-theme-light'],
    ['dark', 'epr-theme-dark'],
    ['auto', 'epr-theme-auto'],
  ] as const)('applies the %s color theme on request', (theme, marker) => {
    const { container } = render(<Bare theme={theme} />);
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.className).toContain(marker);
    expect(aside.getAttribute('theme')).toBeNull();
    if (theme !== 'light') {
      expect(allStyles(container)).toContain(
        `--epr-bg-color:${darkPickerTokens['--epr-bg-color']}`,
      );
    }
  });

  it('scopes behavioral state rules to the structural root', () => {
    const css = stylesheet.getStyle();
    expect(css).toContain('.epr-structural-root:not(.epr-search-active)');
    expect(css).not.toContain('.EmojiPickerReact:not(.epr-search-active)');
  });
});

describe('unstyled default picker', () => {
  it('drops the branded chrome and color tokens but keeps layout', () => {
    const { container } = render(<EmojiPicker unstyled className="mine" />);
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.className).not.toContain('epr-main');
    expect(aside.className).not.toContain('EmojiPickerReact');
    expect(aside.className).toContain('epr-structural-root');
    expect(aside.className).toContain('mine');
    expect(aside.style.width).toBe('350px');
    expect(
      container.querySelector('[data-epr-part="viewport"]'),
    ).not.toBeNull();
  });

  it('keeps the branded default otherwise', () => {
    const { container } = render(<EmojiPicker />);
    expect(container.querySelector('aside')?.className).toContain('epr-main');
  });
});
