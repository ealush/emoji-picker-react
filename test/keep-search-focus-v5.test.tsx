import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import { Categories } from '../src/config/categoryConfig';
import { loadSearchHighlight } from '../src/hooks/useKeyboardNavigation';
import { EmojiData, EmojiStyle } from '../src/types/exposedTypes';

// Counts loads of the keepSearchFocus highlight engine, which pickers
// import on demand.
const engine = vi.hoisted(() => ({ loads: 0 }));
vi.mock('../src/hooks/searchHighlight', async (importOriginal) => {
  engine.loads += 1;
  return importOriginal();
});

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => vi.restoreAllMocks());

const hundred: EmojiData = {
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

// While true, every cell lays out below the viewport, as between result
// sets before the grid rerenders.
let cellsOutOfView = false;
// Lays the search input out below the grid instead of above it.
let searchBelow = false;
// Lays the search input out to the left of the grid.
let searchBeside = false;
afterEach(() => {
  cellsOutOfView = false;
  searchBelow = false;
  searchBeside = false;
});

// 6 columns of 40px cells under a 40px label, in an 80px viewport.
function mockGridGeometry() {
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
  // with searchBelow); cells sit below the label, shifted by the scroll.
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
        return searchBeside
          ? ({
              top: 0,
              bottom: 30,
              height: 30,
              left: -200,
              right: -10,
            } as DOMRect)
          : box(searchBelow ? 100 : -40, 30);
      return box(
        40 +
          (parseFloat(element.style.top) || 0) -
          viewport!.scrollTop +
          (cellsOutOfView ? 1000 : 0),
        40,
      );
    },
  );
}

function renderPickerNow(
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
const engineLoaded = () =>
  act(async () => {
    await loadSearchHighlight();
  });

async function renderPicker(
  props: Partial<Picker.RootProps> = {},
  searchChildren?: React.ReactNode,
) {
  const rendered = renderPickerNow(props, searchChildren);
  await engineLoaded();
  return rendered;
}

const highlighted = () =>
  document.querySelector<HTMLElement>('[data-epr-highlighted]');

async function expectHighlight(input: HTMLElement, name: string) {
  await waitFor(() =>
    expect(highlighted()).toBe(screen.getByRole('gridcell', { name })),
  );
  expect(input.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
  expect(document.activeElement).toBe(input);
}

// These run first: the engine stays loaded for the rest of the file.
describe('keepSearchFocus loading', () => {
  it('is not loaded by pickers without keepSearchFocus', async () => {
    renderPickerWithoutKeepFocus();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('gridcell', { name: 'emoji 0' }),
      ),
    );
    expect(engine.loads).toBe(0);
  });

  it('keeps arrows in the search input until it has loaded', async () => {
    const { input } = renderPickerNow();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(input);
    expect(highlighted()).toBeNull();
    await engineLoaded();
    expect(engine.loads).toBe(1);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
  });
});

describe('keepSearchFocus', () => {
  it('makes the search input a combobox that controls the grid', async () => {
    const { input } = await renderPicker();
    expect(input.getAttribute('aria-haspopup')).toBe('grid');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    // The grid is linked before anything is highlighted, and stays linked.
    const grid = screen.getByRole('grid');
    expect(grid.id).not.toBe('');
    expect(input.getAttribute('aria-controls')).toBe(grid.id);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(input.getAttribute('aria-controls')).toBe(grid.id);
  });

  it('cancels a pending highlight move on Escape and on blur', async () => {
    const frame = () =>
      act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    // The move lands on the next frame; Escape comes first.
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    fireEvent.keyDown(input, { key: 'Escape' });
    await frame();
    await frame();
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    act(() => input.blur());
    await frame();
    await frame();
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('starts with ArrowRight when the search input is beside the grid', async () => {
    searchBeside = true;
    const { input } = await renderPicker();
    // ArrowDown points away from the grid: nothing to highlight.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(highlighted()).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    await expectHighlight(input, 'emoji 0');
    // The left edge faces the input: the highlight ends there.
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(highlighted()).toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('drops the active descendant when virtualization unmounts its cell', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    const body = document.querySelector<HTMLElement>(
      '[data-epr-part="viewport"]',
    )!;
    body.scrollTop = 600;
    await waitFor(() => {
      fireEvent.scroll(body);
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull();
    });
    const id = input.getAttribute('aria-activedescendant');
    expect(id ? document.getElementById(id) : null).toBeNull();
    expect(id).toBe('');
  });

  it('moves a highlight with the arrow keys while focus stays in search', async () => {
    const { input } = await renderPicker();
    // Left/Right edit text until a cell is highlighted.
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(highlighted()).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 7');
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    await expectHighlight(input, 'emoji 6');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await expectHighlight(input, 'emoji 0');
  });

  it('highlights rows that virtualization has not rendered yet', async () => {
    const { input } = await renderPicker();
    const body = document.querySelector<HTMLElement>(
      '[data-epr-part="viewport"]',
    )!;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    for (let row = 1; row < 8; row++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const name = `emoji ${row * 6}`;
      await waitFor(() => {
        // jsdom does not emit the browser's native scroll event.
        fireEvent.scroll(body);
        expect(highlighted()?.getAttribute('aria-label')).toBe(name);
      });
      await expectHighlight(input, name);
    }
    expect(body.scrollTop).toBeGreaterThan(0);
  });

  it('starts with ArrowUp when the search input is below the grid', async () => {
    searchBelow = true;
    const { input } = await renderPicker();
    // ArrowDown points away from the grid: nothing to highlight.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(highlighted()).toBeNull();

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 6');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await expectHighlight(input, 'emoji 0');
    // The top edge does not face the input, so the highlight stays.
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await expectHighlight(input, 'emoji 0');
  });

  it('clears the highlight on ArrowUp from the first row', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('selects the highlighted emoji on Enter without moving focus', async () => {
    const { input, onEmojiClick } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onEmojiClick.mock.calls[0][0].names).toContain('emoji 1');
    expect(document.activeElement).toBe(input);
  });

  it('selects the first emoji on Enter when nothing is highlighted', async () => {
    const { input, onEmojiClick } = await renderPicker();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEmojiClick.mock.calls[0][0].names).toContain('emoji 0');
    expect(document.activeElement).toBe(input);
  });

  it('selects the first result on Enter even when the results are scrolled', async () => {
    const { input, onEmojiClick } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 1' } });
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    const body = document.querySelector<HTMLElement>(
      '[data-epr-part="viewport"]',
    )!;
    // The first row of results scrolls under the label.
    body.scrollTop = 40;
    fireEvent.scroll(body);
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(onEmojiClick).toHaveBeenCalledTimes(1));
    expect(onEmojiClick.mock.calls[0][0].names).toContain('emoji 1');
    expect(document.activeElement).toBe(input);
  });

  it('dismisses the highlight on Escape before clearing the search', async () => {
    const { input } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(highlighted()).toBeNull();
    expect((input as HTMLInputElement).value).toBe('emoji');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('moves the highlight to the first result when the search changes', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');
    fireEvent.change(input, { target: { value: 'emoji 5' } });
    await expectHighlight(input, 'emoji 5');
  });

  it('does not start a highlight from typing alone', async () => {
    const { input } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 5' } });
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('drops the highlight when focus leaves the search input', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    act(() => input.blur());
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('moves an arrow pressed during the search debounce to the new first result', async () => {
    const { input } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 5' } });
    // Filtering is debounced: this lands on the old results first.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 5');
    expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull();
  });

  it('highlights the first result wherever the grid is scrolled', async () => {
    const { input } = await renderPicker({}, <Picker.SkinTone />);
    fireEvent.change(input, { target: { value: 'emoji 5' } });
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    // Mid-transition no cell is in view yet; the first result is reached
    // by its position in the results, not by what is on screen.
    cellsOutOfView = true;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Arrows stay with the pending highlight instead of leaving search.
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 5');
  });

  it('keeps arrows on the highlight while its cell is replaced', async () => {
    const { input } = await renderPicker({}, <Picker.SkinTone />);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    // New results or virtualization removed the highlighted cell; the
    // input still names it until the replacement lands.
    highlighted()!.removeAttribute('data-epr-highlighted');
    // ArrowRight would otherwise open the skin tone fan in Search.
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 0');
  });

  it('shows the highlighted emoji in the preview', async () => {
    let active: Picker.EmojiClickData | null = null;
    function CaptureActive() {
      active = Picker.useActiveEmoji();
      return null;
    }
    mockGridGeometry();
    render(
      <Picker.Root
        emojiData={hundred}
        categories={[Categories.SMILEYS_PEOPLE]}
        autoFocusSearch={false}
        keepSearchFocus
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <CaptureActive />
      </Picker.Root>,
    );
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    await engineLoaded();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => expect(active?.names).toContain('emoji 0'));
  });

  it('does not pull focus out of search on hover', async () => {
    const { input } = await renderPicker();
    const cell = screen.getByRole('gridcell', { name: 'emoji 2' });
    fireEvent.mouseOver(cell);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(input);
  });

  it('styles the highlight like focus in the default picker', async () => {
    mockGridGeometry();
    render(
      <EmojiPicker
        emojiData={hundred}
        categories={[Categories.SMILEYS_PEOPLE]}
        autoFocusSearch={false}
        keepSearchFocus
      />,
    );
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    await engineLoaded();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('');
    const rule = css.match(
      /\.([\w-]+):is\(\[data-epr-highlighted\]\) \{background-color:var\(--epr-focus-bg-color\);\}/,
    );
    expect(rule).not.toBeNull();
    expect(highlighted()!.classList).toContain(rule![1]);
  });
});

describe('default keyboard navigation', () => {
  it('enters the grid with ArrowUp when the search input is below it', async () => {
    searchBelow = true;
    renderPickerWithoutKeepFocus();
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('gridcell', { name: 'emoji 0' }),
      ),
    );
  });

  it('keeps the plain textbox and moves focus into the grid', async () => {
    const { onEmojiClick } = renderPickerWithoutKeepFocus();
    const input = screen.getByRole('textbox');
    expect(input.hasAttribute('aria-haspopup')).toBe(false);
    fireEvent.change(input, { target: { value: 'emoji' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('gridcell', { name: 'emoji 0' }),
      ),
    );
    expect(highlighted()).toBeNull();
    expect(onEmojiClick).not.toHaveBeenCalled();
  });
});

function renderPickerWithoutKeepFocus() {
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
