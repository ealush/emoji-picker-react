// Shared fixture for the keepSearchFocus tests: a 100-emoji picker with
// mocked grid geometry.
import { act, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { expect, vi } from 'vitest';

import * as Picker from '../../src/primitives';
import { Categories } from '../../src/config/categoryConfig';
import { loadSearchHighlight } from '../../src/hooks/useKeyboardNavigation';
import { EmojiData, EmojiStyle } from '../../src/types/exposedTypes';

export const hundred: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: Array.from({ length: 100 }, (_, i) => ({
      u: (0x1f600 + i).toString(16),
      n: [`emoji ${i}`],
      a: '1',
    })),
  },
};

export const layout = {
  // Every cell lays out below the viewport, as between result sets
  // before the grid rerenders.
  cellsOutOfView: false,
  // The search input lays out below the grid instead of above it.
  searchBelow: false,
  // The search input lays out to the left of the grid.
  searchBeside: false,
};

export function resetLayout() {
  layout.cellsOutOfView = false;
  layout.searchBelow = false;
  layout.searchBeside = false;
}

// 6 columns of 40px cells under a 40px label, in an 80px viewport.
export function mockGridGeometry() {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      const part = this.getAttribute('data-epr-part');
      if (part === 'viewport') return 80;
      if (part === 'category-content')
        return parseFloat(this.style.height) || 0;
      if (part === 'category')
        return (
          (parseFloat(
            this.querySelector<HTMLElement>(
              '[data-epr-part="category-content"]',
            )!.style.height,
          ) || 0) + 40
        );
      return 40;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.getAttribute('data-epr-part') === 'category-content'
        ? 40
        : parseFloat(this.style.top) || 0;
    },
  );
  // Rects: the search input sits above the 80px viewport (or below it,
  // with layout.searchBelow); cells sit below the label, shifted by the scroll.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const element = this as HTMLElement;
      const viewport = document.querySelector<HTMLElement>(
        '[data-epr-part="viewport"]',
      );
      const box = (top: number, height: number) =>
        ({ top, bottom: top + height, height, left: 0, right: 240 }) as DOMRect;
      if (element === viewport) return box(0, 80);
      if (element.getAttribute('data-epr-part') === 'search-input')
        return layout.searchBeside
          ? ({
              top: 0,
              bottom: 30,
              height: 30,
              left: -200,
              right: -10,
            } as DOMRect)
          : box(layout.searchBelow ? 100 : -40, 30);
      return box(
        40 +
          (parseFloat(element.style.top) || 0) -
          viewport!.scrollTop +
          (layout.cellsOutOfView ? 1000 : 0),
        40,
      );
    },
  );
}

export function renderPickerNow(
  props: Partial<Picker.RootProps> = {},
  searchChildren?: React.ReactNode,
) {
  mockGridGeometry();
  const onEmojiClick = vi.fn();
  render(
    <Picker.Root
      emojiData={hundred}
      emojiStyle={EmojiStyle.NATIVE}
      categories={[Categories.SMILEYS_PEOPLE]}
      autoFocusSearch={false}
      keepSearchFocus
      onEmojiClick={onEmojiClick}
      {...props}
    >
      <Picker.Search>{searchChildren}</Picker.Search>
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>,
  );
  const input = screen.getByRole('combobox');
  act(() => input.focus());
  return { input, onEmojiClick };
}

// keepSearchFocus loads its highlight engine once the picker mounts.
export const engineLoaded = () =>
  act(async () => {
    await loadSearchHighlight();
  });

export async function renderPicker(
  props: Partial<Picker.RootProps> = {},
  searchChildren?: React.ReactNode,
) {
  const rendered = renderPickerNow(props, searchChildren);
  await engineLoaded();
  return rendered;
}

export const highlighted = () =>
  document.querySelector<HTMLElement>('[data-epr-highlighted]');

export async function expectHighlight(input: HTMLElement, name: string) {
  await waitFor(() =>
    expect(highlighted()).toBe(screen.getByRole('gridcell', { name })),
  );
  expect(input.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
  expect(document.activeElement).toBe(input);
}

export function renderPickerWithoutKeepFocus() {
  mockGridGeometry();
  const onEmojiClick = vi.fn();
  render(
    <Picker.Root
      emojiData={hundred}
      categories={[Categories.SMILEYS_PEOPLE]}
      autoFocusSearch={false}
      onEmojiClick={onEmojiClick}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>,
  );
  act(() => screen.getByRole('textbox').focus());
  return { onEmojiClick };
}
