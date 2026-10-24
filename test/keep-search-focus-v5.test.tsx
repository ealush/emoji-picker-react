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
import {
  engineLoaded,
  expectHighlight,
  highlighted,
  hundred,
  layout,
  mockGridGeometry,
  renderPicker,
  renderPickerWithoutKeepFocus,
  resetLayout,
} from './support/keepSearchFocusPicker';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  resetLayout();
});

describe('keepSearchFocus', () => {
  it('keeps a consumed Escape from reaching the host', async () => {
    const { input } = await renderPicker();
    const host = vi.fn();
    document.addEventListener('keydown', host);
    try {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await expectHighlight(input, 'emoji 0');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).toHaveBeenCalledTimes(1); // only ArrowDown
      fireEvent.change(input, { target: { value: 'emoji' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).toHaveBeenCalledTimes(2); // nothing left to undo
    } finally {
      document.removeEventListener('keydown', host);
    }
  });

  it('consumes highlight and search Escape before document capture dismissal', async () => {
    const { input } = await renderPicker();
    const host = vi.fn();
    document.addEventListener('keydown', host, true);
    try {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await expectHighlight(input, 'emoji 0');
      host.mockClear();
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).not.toHaveBeenCalled();
      fireEvent.change(input, { target: { value: 'emoji' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).not.toHaveBeenCalled();
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(host).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('keydown', host, true);
    }
  });

  it('moves once per rapid arrow press before the next animation frame', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 2');
  });

  it('preserves rapid arrows while a destination is outside the rendered window', async () => {
    const { input } = await renderPicker();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    for (let step = 0; step < 10; step++) {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    }
    const body = document.querySelector<HTMLElement>(
      '[data-epr-part="viewport"]',
    )!;
    await waitFor(() => {
      fireEvent.scroll(body);
      expect(highlighted()?.getAttribute('aria-label')).toBe('emoji 60');
    });
  });

  it('does not pick the previous query results during the filter debounce', async () => {
    const { input, onEmojiClick } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji 9' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // No stale result may be emitted, even before the new grid commits.
    expect(onEmojiClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('gridcell', { name: 'emoji 0' })).toBeNull(),
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onEmojiClick.mock.calls[0][0].names).toEqual(['emoji 9']);
  });

  it('resets the highlight and preview when caller suggestions are replaced', async () => {
    mockGridGeometry();
    let active: Picker.EmojiClickData | null = null;
    function Active() {
      active = Picker.useActiveEmoji();
      return null;
    }
    const composition = (ids: string[]) => (
      <Picker.Root
        emojiData={hundred}
        emojiStyle="native"
        categories={[Categories.SUGGESTED]}
        suggestedEmojis={ids}
        keepSearchFocus
        autoFocusSearch={false}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <Active />
      </Picker.Root>
    );
    const view = render(composition(['1f600', '1f601', '1f602']));
    await engineLoaded();
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');
    view.rerender(composition(['1f602', '1f601', '1f600']));
    await expectHighlight(input, 'emoji 2');
    expect(active?.names).toEqual(['emoji 2']);
  });
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
    layout.searchBeside = true;
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
    layout.searchBelow = true;
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
    layout.cellsOutOfView = true;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Each arrow applies, even within the same frame.
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 50');
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

  it('keeps the search on Escape when virtualization unmounted the highlighted cell', async () => {
    const { input } = await renderPicker();
    fireEvent.change(input, { target: { value: 'emoji' } });
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
    expect(highlighted()).toBeNull();
    // Escape ends the highlight the input still names, and only that.
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect((input as HTMLInputElement).value).toBe('emoji');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect((input as HTMLInputElement).value).toBe('');
  });

  it.each([
    ['Shift', { shiftKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
  ])(
    'leaves %s+arrows to the input while a cell is highlighted',
    async (_, modifier) => {
      const { input } = await renderPicker();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await expectHighlight(input, 'emoji 0');
      for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
        // Not prevented: the input extends the selection or moves by word.
        expect(fireEvent.keyDown(input, { key, ...modifier })).toBe(true);
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await expectHighlight(input, 'emoji 0');
    },
  );

  it('moves the highlight by reading direction in RTL', async () => {
    const { input } = await renderPicker();
    input.style.direction = 'rtl';
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    // ArrowLeft points forward in RTL.
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    await expectHighlight(input, 'emoji 1');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 0');
  });

  it('previews a hovered cell, then the highlight again once the pointer leaves', async () => {
    let active: Picker.EmojiClickData | null = null;
    function CaptureActive() {
      active = Picker.useActiveEmoji();
      return null;
    }
    // Any part inside the Root can read the active emoji.
    const { input } = await renderPicker({}, <CaptureActive />);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
    const hovered = screen.getByRole('gridcell', { name: 'emoji 2' });
    // Keyboard use pauses hover until the pointer moves.
    fireEvent.mouseMove(hovered);
    await waitFor(() => expect(active?.names).toContain('emoji 2'));
    fireEvent.mouseOut(hovered, { relatedTarget: null });
    await waitFor(() => expect(active?.names).toContain('emoji 0'));
    // Enter still selects the highlighted cell.
    await expectHighlight(input, 'emoji 0');
  });

  it('ends the highlight when keepSearchFocus is turned off', async () => {
    mockGridGeometry();
    const onEmojiClick = vi.fn();
    const picker = (keepSearchFocus: boolean) => (
      <Picker.Root
        emojiData={hundred}
        categories={[Categories.SMILEYS_PEOPLE]}
        autoFocusSearch={false}
        keepSearchFocus={keepSearchFocus}
        onEmojiClick={onEmojiClick}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>
    );
    const { rerender } = render(picker(true));
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    await engineLoaded();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    await expectHighlight(input, 'emoji 1');

    rerender(picker(false));
    expect(highlighted()).toBeNull();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    // Enter selects the first result, as without the prop.
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(onEmojiClick).toHaveBeenCalled());
    expect(onEmojiClick.mock.calls[0][0].names).toContain('emoji 0');
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
    layout.searchBelow = true;
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
