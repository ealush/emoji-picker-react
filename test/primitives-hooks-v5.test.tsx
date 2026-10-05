import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { SkinTones } from '../src';
import * as Picker from '../src/primitives';

const input = (container: HTMLElement) =>
  container.querySelector('input') as HTMLInputElement;

async function search(container: HTMLElement, value: string) {
  fireEvent.change(input(container), { target: { value } });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
}

describe('Empty', () => {
  it('shows the localized empty state in the default picker only when nothing matches', async () => {
    const { container } = render(
      <EmojiPicker labels={{ searchResultsNone: 'Nada' }} />,
    );
    expect(container.querySelector('[data-epr-part="empty"]')).toBeNull();
    await search(container, 'zzzz-no-such-emoji');
    await vi.waitFor(() => {
      expect(
        container.querySelector('[data-epr-part="empty"]')?.textContent,
      ).toBe('Nada');
    });
    await search(container, 'cat');
    await vi.waitFor(() => {
      expect(container.querySelector('[data-epr-part="empty"]')).toBeNull();
    });
  });

  it('accepts a render function receiving the search text', async () => {
    const { container } = render(
      <Picker.Root>
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty className="mine">
            {({ search }) => `Nothing for “${search}”`}
          </Picker.Empty>
        </Picker.Viewport>
      </Picker.Root>,
    );
    await search(container, 'qqqq');
    await vi.waitFor(() => {
      const empty = container.querySelector('[data-epr-part="empty"]');
      expect(empty?.textContent).toBe('Nothing for “qqqq”');
      expect(empty?.className).toContain('mine');
    });
  });

  it('announces counts that match what the list shows', async () => {
    // The only "cat face" match is hidden: the raw match dictionary still
    // holds it, but the list shows nothing, so neither may the announcement.
    const { container } = render(<EmojiPicker hiddenEmojis={['1f431']} />);
    await search(container, 'cat face');
    await vi.waitFor(() => {
      expect(
        container.querySelectorAll(
          '[data-epr-part="list"] button[data-epr-unified]',
        ).length,
      ).toBe(0);
      expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
        'No results found',
      );
      expect(container.querySelector('[data-epr-part="empty"]')).not.toBeNull();
    });
  });
});

describe('hooks', () => {
  it('useActiveEmoji reports the hovered emoji', () => {
    const seen: Array<string | null> = [];
    function Probe() {
      const active = Picker.useActiveEmoji();
      seen.push(active ? active.unified : null);
      return <output data-testid="probe">{active?.names[0] ?? ''}</output>;
    }
    const { container } = render(
      <Picker.Root>
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <Probe />
      </Picker.Root>,
    );
    const button = container.querySelector(
      'button[data-epr-unified="1f600"]',
    ) as HTMLElement;
    fireEvent.mouseOver(button);
    expect(seen[seen.length - 1]).toBe('1f600');
    expect(container.querySelector('output')?.textContent).not.toBe('');
  });

  it('useSkinTone reads and sets the tone and reports changes', () => {
    const onSkinToneChange = vi.fn();
    let api: ReturnType<typeof Picker.useSkinTone> | null = null;
    function Probe() {
      api = Picker.useSkinTone();
      return null;
    }
    const { container } = render(
      <Picker.Root onSkinToneChange={onSkinToneChange}>
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <Probe />
      </Picker.Root>,
    );
    expect(api![0]).toBe(SkinTones.NEUTRAL);
    act(() => api![1](SkinTones.DARK));
    expect(api![0]).toBe(SkinTones.DARK);
    expect(onSkinToneChange).toHaveBeenCalledWith(SkinTones.DARK);
    expect(
      container.querySelector('[data-epr-unified="1f44d-1f3ff"]'),
    ).not.toBeNull();
  });

  it('useSearchState exposes the search and visible count', async () => {
    let state: Picker.SearchState | null = null;
    function Probe() {
      state = Picker.useSearchState();
      return null;
    }
    const { container } = render(
      <Picker.Root>
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
        <Probe />
      </Picker.Root>,
    );
    expect(state).toEqual({ search: '', resultCount: null });
    await search(container, 'zzzz-none');
    await vi.waitFor(() => {
      expect(state).toEqual({ search: 'zzzz-none', resultCount: 0 });
    });
  });

  it('throws outside Root in development', () => {
    function Probe() {
      Picker.useSkinTone();
      return null;
    }
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(
      /useSkinTone\(\) must be called inside <Root>/,
    );
  });
});

describe('hook result identity', () => {
  it('keeps useCategoryNavigation and its members stable across unrelated renders', () => {
    const seen: Picker.CategoryNavigation[] = [];
    function Probe() {
      seen.push(Picker.useCategoryNavigation());
      return null;
    }
    function Host({ tick }: { tick: number }) {
      return (
        <Picker.Root style={{ height: 300 }} data-tick={tick}>
          <Probe />
          <Picker.Viewport>
            <Picker.List />
          </Picker.Viewport>
        </Picker.Root>
      );
    }
    const { rerender } = render(<Host tick={0} />);
    const before = seen[seen.length - 1];
    rerender(<Host tick={1} />);
    const after = seen[seen.length - 1];

    expect(before.categories.length).toBeGreaterThan(0);
    expect(after.categories).toBe(before.categories);
    expect(after.jumpToCategory).toBe(before.jumpToCategory);
    expect(after).toBe(before);
  });
});
