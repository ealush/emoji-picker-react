import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Categories } from '../src/config/categoryConfig';
import { List, Root, Search, Viewport } from '../src/primitives';
import { __resetPrimitiveWarningsForTest } from '../src/primitives/scope';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

// Render probe: BtnPlus is a plain (non-memoized) child rendered only by
// the reactions bar, so its execution count mirrors Reactions renders.
let btnPlusRenders = 0;
vi.mock('../src/components/Reactions/BtnPlus', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../src/components/Reactions/BtnPlus')>();
  return {
    ...actual,
    BtnPlus: (props: Record<string, never>) => {
      btnPlusRenders += 1;
      return actual.BtnPlus(props);
    },
  };
});

afterEach(() => {
  __resetPrimitiveWarningsForTest();
  vi.unstubAllEnvs();
  btnPlusRenders = 0;
});

const miniData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

function gridFirstButton(): HTMLElement {
  const grid = document.querySelector('[role="grid"]') as HTMLElement;
  const button = grid.querySelector('button') as HTMLElement;
  if (!button) {
    throw new Error('no grid button found');
  }
  return button;
}

describe('v5 primitives usability (item 9)', () => {
  it('exports a default token preset covering the documented geometry', async () => {
    const primitives = (await import('../src/primitives')) as Record<
      string,
      unknown
    >;
    const tokens = primitives.defaultPickerTokens as Record<string, string>;
    expect(tokens).toBeDefined();
    expect(tokens['--epr-emoji-size']).toBe('30px');
    expect(tokens['--epr-search-input-height']).toBe('40px');
    expect(tokens['--epr-category-navigation-button-size']).toBe('30px');
    expect(tokens['--epr-preview-height']).toBe('70px');
    expect(tokens['--epr-picker-border-radius']).toBe('8px');
    expect(Object.keys(tokens).length).toBeGreaterThan(50);
    // The dark-theme values stay out of the shared preset: the packed
    // package check scans the primitives bundle for their absence.
    expect(
      Object.keys(tokens).some((key) => key.startsWith('--epr-dark')),
    ).toBe(false);
  });

  it('bare Root applies the token preset as inherited variables', async () => {
    const primitives = (await import('../src/primitives')) as Record<
      string,
      unknown
    >;
    const tokens = primitives.defaultPickerTokens as Record<string, string>;
    const { container } = render(
      <Root
        emojiData={miniData}
        style={tokens as unknown as React.CSSProperties}
      >
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.style.getPropertyValue('--epr-emoji-size')).toBe('30px');
    expect(aside.style.getPropertyValue('--epr-search-input-height')).toBe(
      '40px',
    );
  });

  it('merges inputProps.className with the library input class', () => {
    render(
      <Root emojiData={miniData}>
        <Search inputProps={{ className: 'consumer-class' }} />
      </Root>,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.classList.contains('consumer-class')).toBe(true);
    // Library atomic classes (epr_<hash>) survived alongside it.
    expect(input.className).toMatch(/epr_/);
    expect(input.classList.length).toBeGreaterThan(1);
  });

  it('Search outside Root degrades gracefully in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Search />)).not.toThrow();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('outside <Root>'),
      );
      expect(document.querySelector('[data-epr-part="search"]')).toBeNull();
    } finally {
      warn.mockRestore();
      errors.mockRestore();
    }
  });

  it('Viewport outside Root degrades gracefully in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <Viewport>
            <List />
          </Viewport>,
        ),
      ).not.toThrow();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('outside <Root>'),
      );
    } finally {
      warn.mockRestore();
      errors.mockRestore();
    }
  });

  it('grid letter keys are not swallowed when Search is omitted', () => {
    render(
      <Root emojiData={miniData}>
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const button = gridFirstButton();
    act(() => {
      button.focus();
    });
    const notPrevented = fireEvent.keyDown(button, { key: 'a' });
    expect(notPrevented).toBe(true);
  });

  it('grid letter keys still type-to-search when Search is present', async () => {
    render(
      <Root emojiData={miniData}>
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    const button = gridFirstButton();
    act(() => {
      button.focus();
    });
    const notPrevented = fireEvent.keyDown(button, { key: 'a' });
    expect(notPrevented).toBe(false);
    expect(input.value).toBe('a');
  });

  it('typing does not rerender the reactions bar', async () => {
    const { container } = render(
      <Root emojiData={miniData} reactionsDefaultOpen>
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    // The panel (and its search input) hides in reactions mode, but the
    // input still exists and typing still commits through the controller.
    const input = container.querySelector(
      '[data-epr-part="search"] input',
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(btnPlusRenders).toBeGreaterThan(0);
    btnPlusRenders = 0;
    let value = '';
    for (const ch of ['s', 'm', 'i', 'l', 'e']) {
      value += ch;
      fireEvent.change(input, { target: { value } });
    }
    expect(btnPlusRenders).toBe(0);
  });
});
