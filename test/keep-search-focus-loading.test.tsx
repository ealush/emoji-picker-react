import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

// Counts loads of the keepSearchFocus highlight engine, which pickers
// import on demand, and can make them fail.
const engine = { loads: 0, fail: false };

// The engine loads once per page. Each test starts from a fresh module
// graph and a fresh engine mock, so none depends on what an earlier one
// loaded.
beforeEach(() => {
  vi.resetModules();
  engine.loads = 0;
  engine.fail = false;
  vi.doMock('../src/hooks/searchHighlight', async (importOriginal) => {
    engine.loads += 1;
    if (engine.fail) throw new Error('chunk failed to load');
    return importOriginal();
  });
});
afterEach(() => vi.restoreAllMocks());

const fixture = () => import('./support/keepSearchFocusPicker');
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('keepSearchFocus loading', () => {
  it('is not loaded by pickers without keepSearchFocus', async () => {
    const { renderPickerWithoutKeepFocus } = await fixture();
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
    const { renderPickerNow, engineLoaded, expectHighlight, highlighted } =
      await fixture();
    const { input } = renderPickerNow();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await frame();
    expect(document.activeElement).toBe(input);
    expect(highlighted()).toBeNull();
    await engineLoaded();
    expect(engine.loads).toBe(1);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await expectHighlight(input, 'emoji 0');
  });

  it('falls back to the default navigation when it fails to load', async () => {
    engine.fail = true;
    const { renderPickerNow, highlighted } = await fixture();
    const { input } = renderPickerNow();
    // Offline, blocked by CSP, or gone after a deploy.
    await waitFor(() => expect(engine.loads).toBe(1));
    await frame();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('gridcell', { name: 'emoji 0' }),
      ),
    );
    expect(highlighted()).toBeNull();
  });
});
