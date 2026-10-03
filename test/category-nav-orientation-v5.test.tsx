import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import en from '../src/data/emojis-en';
import * as Picker from '../src/primitives';

function Composition({
  orientation,
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <Picker.Root emojiData={en} autoFocusSearch={false}>
      <div style={{ display: 'flex' }}>
        <Picker.CategoryNav orientation={orientation} />
        <div>
          <Picker.Search />
          <Picker.Viewport>
            <Picker.List />
          </Picker.Viewport>
        </div>
      </div>
    </Picker.Root>
  );
}

const tabs = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>('[data-epr-part="category-tab"]'),
  );

describe('CategoryNav orientation', () => {
  it('is horizontal by default', async () => {
    const { container } = render(<Composition />);
    const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');

    const [first, second] = tabs(container);
    first.focus();
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    await vi.waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    await vi.waitFor(() => expect(document.activeElement).toBe(first));
  });

  it('vertical: Up/Down move between tabs, Right leaves for the next region', async () => {
    const { container } = render(<Composition orientation="vertical" />);
    const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical');

    const [first, second] = tabs(container);
    first.focus();
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    await vi.waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.keyDown(tablist, { key: 'ArrowUp' });
    await vi.waitFor(() => expect(document.activeElement).toBe(first));

    // Across the axis: the next region in DOM order is Search.
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(container.querySelector('input')),
    );
  });
});
