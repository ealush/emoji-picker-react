import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-epr-part="root"]')!;

describe('columns', () => {
  it('marks the root and drops the default width so the picker fits them', () => {
    const { container } = render(
      <EmojiPicker columns={6} autoFocusSearch={false} />,
    );
    const aside = root(container);
    expect(aside.getAttribute('data-epr-columns')).toBe('6');
    expect(aside.style.getPropertyValue('--epr-columns')).toBe('6');
    expect(aside.style.width).toBe('');
  });

  it('keeps an explicit width', () => {
    const { container } = render(
      <EmojiPicker columns={6} width={400} autoFocusSearch={false} />,
    );
    expect(root(container).style.width).toBe('400px');
  });

  it('is available on a bare Root', () => {
    const { container } = render(
      <Picker.Root columns={8}>
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(root(container).getAttribute('data-epr-columns')).toBe('8');
  });

  it.each([0, -2, 2.5, Number.NaN])(
    'ignores an invalid value (%s) and keeps the default width',
    (columns) => {
      const { container } = render(
        <EmojiPicker columns={columns} autoFocusSearch={false} />,
      );
      const aside = root(container);
      expect(aside.hasAttribute('data-epr-columns')).toBe(false);
      expect(aside.style.width).toBe('350px');
    },
  );
});
