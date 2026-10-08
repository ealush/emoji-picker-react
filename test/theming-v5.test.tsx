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
    const { container } = render(<Bare colorScheme={theme} />);
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

describe('colorScheme survives CSS-in-JS wrappers', () => {
  it('reaches Root through a wrapper that reserves `theme`', () => {
    // Emotion, styled-components and MUI consume a `theme` prop on the
    // components they wrap; colorScheme is never intercepted.
    const Wrapper = ({
      theme: _reserved,
      ...props
    }: React.ComponentProps<typeof Picker.Root> & { theme?: unknown }) => (
      <Picker.Root {...props} />
    );
    const { container } = render(
      <Wrapper colorScheme="dark">
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Wrapper>,
    );
    expect(container.querySelector('aside')?.className).toContain(
      'epr-theme-dark',
    );
  });

  it('the default picker accepts colorScheme, preferred over theme', () => {
    const { container } = render(
      <EmojiPicker colorScheme="dark" theme="light" />,
    );
    expect(container.querySelector('aside')?.className).toContain(
      'epr-dark-theme',
    );
  });

  it('a stray theme prop on Root never reaches the DOM', () => {
    const { container } = render(
      <Picker.Root {...({ theme: 'dark' } as object)}>
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(container.querySelector('aside')?.hasAttribute('theme')).toBe(false);
  });
});
