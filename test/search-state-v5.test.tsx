import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle, Props } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      },
    ],
    [Categories.ANIMALS_NATURE]: [
      { n: ['cat', 'cat face'], u: '1f431', a: '0.6' },
      { n: ['dog', 'dog face'], u: '1f436', a: '0.6' },
    ],
  },
};

const renderPicker = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      {...props}
    />,
  );
};

function gridUnified(unified: string): HTMLElement | null {
  const grid = document.querySelector('[role="grid"]');
  return grid?.querySelector(
    `[data-epr-unified="${unified}"]`,
  ) as HTMLElement | null;
}

function gridButton(name: string): HTMLElement {
  const grid = document.querySelector('[role="grid"]') as HTMLElement;
  const button = Array.from(grid.querySelectorAll('button')).find(
    (candidate) => candidate.getAttribute('aria-label') === name,
  );
  if (!button) {
    throw new Error(`grid button ${name} not found`);
  }
  return button as HTMLElement;
}

const U = {
  grin: '1f600',
  bigEyes: '1f603',
  cat: '1f431',
  dog: '1f436',
};

async function settle(ms = 250) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

describe('v5 uncontrolled search (STATE.md §1–§3)', () => {
  it('uses defaultSearchValue for initial filtering without emitting', async () => {
    const onSearchChange = vi.fn();
    renderPicker({
      defaultSearchValue: 'dog',
      onSearchChange,
    });

    expect(onSearchChange).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('emits raw user text synchronously and filters the normalized query', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: ' Cat ' } });

    // Raw proposal emitted synchronously, before any debounce.
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenLastCalledWith(' Cat ');

    await vi.waitFor(() => {
      expect(gridUnified(U.cat)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.dog)).toBeNull();
  });

  it('clear proposes and commits an empty value', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'dog' } });
    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();

    const clear = document.querySelector(
      '.epr-btn-clear-search',
    ) as HTMLElement;
    fireEvent.click(clear);

    expect(onSearchChange).toHaveBeenLastCalledWith('');
    expect(input.value).toBe('');
    await vi.waitFor(() => {
      expect(gridUnified(U.cat)).not.toBeNull();
    });
  });

  it('unmounting before the scheduled search frame drops the pending search', async () => {
    const setSpy = vi.spyOn(globalThis, 'setTimeout');
    try {
      const { unmount } = renderPicker({});
      const input = (await screen.findByRole('textbox')) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'dog' } });
      // Unmount while the animation frame is still pending; when the
      // frame fires it must schedule nothing (no debounce timer).
      unmount();
      const callsAtUnmount = setSpy.mock.calls.length;
      await act(async () => {
        await new Promise(requestAnimationFrame);
      });
      expect(setSpy.mock.calls.length).toBe(callsAtUnmount);
    } finally {
      setSpy.mockRestore();
    }
  });

  it('unmounting mid-debounce clears the pending trailing edge', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    try {
      const { unmount } = renderPicker({});
      const input = (await screen.findByRole('textbox')) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'dog' } });
      // Let the frame schedule the debounce timer first...
      await act(async () => {
        await new Promise(requestAnimationFrame);
      });
      // ...then unmount before the 100ms trailing edge; the timer must
      // die with the Root instead of firing a post-unmount update.
      const callsBefore = clearSpy.mock.calls.length;
      unmount();
      expect(clearSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    } finally {
      clearSpy.mockRestore();
    }
  });
});

function AcceptingPicker({
  proposals,
  initial = '',
}: {
  proposals: string[];
  initial?: string;
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      searchValue={value}
      onSearchChange={(next) => {
        proposals.push(next);
        setValue(next);
      }}
    />
  );
}

function IgnoringPicker({ proposals }: { proposals: string[] }) {
  return (
    <EmojiPicker
      emojiData={minimalEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      searchValue=""
      onSearchChange={(next) => {
        proposals.push(next);
      }}
    />
  );
}

describe('v5 controlled search (STATE.md §1–§4)', () => {
  it('accepting parent: proposal flows to the prop and filters after debounce', async () => {
    const proposals: string[] = [];
    render(<AcceptingPicker proposals={proposals} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'd' } });
    expect(proposals).toEqual(['d']);

    fireEvent.change(input, { target: { value: 'do' } });
    expect(proposals).toEqual(['d', 'do']);

    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();
    expect(input.value).toBe('do');
  });

  it('ignoring parent: proposal emits but results never filter', async () => {
    const proposals: string[] = [];
    render(<IgnoringPicker proposals={proposals} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'z' } });
    expect(proposals).toEqual(['z']);

    // A rejected proposal does not persist visibly: the input reconciles
    // back to the accepted prop after the quiet window.
    await vi.waitFor(() => {
      expect(input.value).toBe('');
    });

    // ...and schedules no filtering: the full grid survives well past the
    // debounce window.
    await settle(300);
    expect(gridUnified(U.cat)).not.toBeNull();
    expect(gridUnified(U.dog)).not.toBeNull();
    expect(proposals).toEqual(['z']);
  });

  it('parent-driven changes filter without re-emitting', async () => {
    const onSearchChange = vi.fn();
    const { rerender } = renderPicker({
      searchValue: '',
      onSearchChange,
    });
    await screen.findByRole('textbox');

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        searchValue="dog"
        onSearchChange={onSearchChange}
      />,
    );

    expect(onSearchChange).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();
  });

  it('controlled searchValue still filters when Search is omitted', async () => {
    const onSearchChange = vi.fn();
    const { rerender } = renderPicker({
      searchValue: '',
      searchDisabled: true,
      onSearchChange,
    });

    expect(screen.queryByRole('textbox')).toBeNull();

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        searchValue="dog"
        searchDisabled
        onSearchChange={onSearchChange}
      />,
    );

    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();
    expect(onSearchChange).not.toHaveBeenCalled();
  });
});

describe('v5 type-to-search (STATE.md §4)', () => {
  it('uncontrolled: grid key appends, commits, emits, and focuses Search', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const first = gridButton('grinning face');
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });

    expect(onSearchChange).toHaveBeenCalledWith('d');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(input.value).toBe('d');
    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
  });

  it('controlled ignoring parent: focus still transfers immediately', async () => {
    const proposals: string[] = [];
    render(<IgnoringPicker proposals={proposals} />);
    const first = gridButton('grinning face');
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });

    // Focus moves on the keystroke even though the parent rejects it.
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(proposals).toEqual(['d']);

    await settle(300);
    expect(gridUnified(U.cat)).not.toBeNull();
  });

  it('grid keys in non-Latin scripts start a search too', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const first = gridButton('grinning face');
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    act(() => {
      first.focus();
    });
    // Hebrew letter shin: one printable character, outside [a-zA-Z0-9].
    fireEvent.keyDown(first, { key: 'ש' });

    expect(onSearchChange).toHaveBeenCalledWith('ש');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(input.value).toBe('ש');
  });

  it('named keys and punctuation on the grid never start a search', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const first = gridButton('grinning face');

    act(() => {
      first.focus();
    });
    for (const key of ['Tab', 'Enter', 'Home', '.', '-', 'F5']) {
      fireEvent.keyDown(first, { key });
    }
    await settle(150);

    expect(onSearchChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('searchDisabled: grid typing is a no-op for search and focus', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ searchDisabled: true, onSearchChange });
    const first = gridButton('grinning face');

    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    await settle(150);

    expect(onSearchChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('burst typing from the Grid proposes c, then ca, then cat', async () => {
    const proposals: string[] = [];
    render(<AcceptingPicker proposals={proposals} />);
    const first = gridButton('grinning face');
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    act(() => {
      first.focus();
    });
    // The first key moves focus into Search, so the following keys are
    // ordinary input edits. A deferred focus transfer would emit 'c','a','t'.
    fireEvent.keyDown(first, { key: 'c' });
    fireEvent.change(input, { target: { value: 'ca' } });
    fireEvent.change(input, { target: { value: 'cat' } });

    expect(proposals).toEqual(['c', 'ca', 'cat']);
    expect(input.value).toBe('cat');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it('accept-and-transform parent still lands focus in Search', async () => {
    const proposals: string[] = [];
    function TransformingPicker() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={minimalEmojiData}
          emojiStyle={EmojiStyle.NATIVE}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setValue(next.toUpperCase());
          }}
        />
      );
    }
    render(<TransformingPicker />);
    const first = gridButton('grinning face');
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });

    // The parent accepted a transformed value, never the exact proposal —
    // focus transfer must not depend on an acceptance comparison.
    expect(proposals).toEqual(['d']);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(input.value).toBe('D');
  });
});

describe('v5 IME composition (STATE.md §5)', () => {
  it('uncontrolled: intermediate input neither emits nor filters; end commits once', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'do' } });
    fireEvent.change(input, { target: { value: 'dog' } });

    expect(onSearchChange).not.toHaveBeenCalled();
    await settle(300);
    // No intermediate filtering: the full grid is intact.
    expect(gridUnified(U.cat)).not.toBeNull();

    fireEvent.compositionEnd(input);

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenLastCalledWith('dog');
    await vi.waitFor(() => {
      expect(gridUnified(U.dog)).not.toBeNull();
    });
    await settle();
    expect(gridUnified(U.cat)).toBeNull();
  });

  it('controlled ignoring parent: end emits once and reconciles to the prop', async () => {
    const proposals: string[] = [];
    render(<IgnoringPicker proposals={proposals} />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(proposals).toEqual([]);

    fireEvent.compositionEnd(input);

    expect(proposals).toEqual(['dog']);
    // Rejected composition reconciles the input to the parent value.
    expect(input.value).toBe('');
    await settle(300);
    expect(gridUnified(U.cat)).not.toBeNull();
  });
});

describe('v5 reaction-mode observation (STATE.md §7)', () => {
  function ReactionsHarness({ onModeChange }: { onModeChange: (open: boolean) => void }) {
    return (
      <EmojiPicker
        emojiData={minimalEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        reactionsDefaultOpen
        reactions={['1f600', '1f603']}
        onReactionsModeChange={onModeChange}
        onEmojiClick={(_emoji, _event, api) => {
          api?.collapseToReactions();
        }}
      />
    );
  }

  it('does not emit on mount, emits false on expand and true on collapse', async () => {
    const onModeChange = vi.fn();
    render(<ReactionsHarness onModeChange={onModeChange} />);

    await settle(100);
    expect(onModeChange).not.toHaveBeenCalled();

    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    fireEvent.click(expand);
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenLastCalledWith(false);

    const emoji = await screen.findByRole('gridcell', { name: 'grinning face' });
    fireEvent.mouseDown(emoji);
    fireEvent.click(emoji);
    expect(onModeChange).toHaveBeenCalledTimes(2);
    expect(onModeChange).toHaveBeenLastCalledWith(true);
  });

  it('does not re-emit on rerender without a state change', async () => {
    const onModeChange = vi.fn();
    const { rerender } = render(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);

    rerender(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);
    expect(onModeChange).not.toHaveBeenCalled();
  });
});

const variationEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['thumbsup', 'thumbs up'],
        u: '1f44d',
        v: ['1f44d-1f3fd'],
        a: '0.6',
      },
    ],
  },
};

describe('v5 caller-defined suggestions (STATE.md §9)', () => {
  it('normalizes case, preserves variations, ignores unknowns, dedupes', async () => {
    const { container } = render(
      <EmojiPicker
        emojiData={variationEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojis={[
          ' 1F600 ',
          '1f600',
          '1F44D-1F3FD',
          'nope-not-real',
          '1f44d-1f3fd',
        ]}
      />,
    );
    await screen.findByRole('textbox');
    await settle(100);

    // Scope to the Suggested section: the main grid legitimately repeats
    // the same unified values in their own categories.
    const suggested = container.querySelector(
      '[role="rowgroup"][aria-label="Frequently Used"]',
    ) as HTMLElement;
    expect(suggested).not.toBeNull();
    // Each emoji renders nested data-epr-unified elements; count buttons.
    const unifieds = Array.from(
      suggested.querySelectorAll('button[data-epr-unified]'),
    ).map((element) => element.getAttribute('data-epr-unified'));
    // First occurrence wins: 1f600 once despite the duplicate, variation
    // preserved rather than collapsed to the neutral base.
    expect(unifieds.filter((u) => u === '1f600')).toHaveLength(1);
    expect(unifieds).toContain('1f44d-1f3fd');
    expect(unifieds).not.toContain('1f44d');
    expect(unifieds).not.toContain('nope-not-real');
  });

  it('resolves custom ids case-insensitively without touching localStorage', async () => {
    window.localStorage.clear();
    const { container } = render(
      <EmojiPicker
        emojiData={variationEmojiData}
        emojiStyle={EmojiStyle.NATIVE}
        customEmojis={[
          { id: 'PartyParrot', names: ['party'], imgUrl: 'https://x/y.png' },
        ]}
        suggestedEmojis={['PartyParrot']}
      />,
    );
    await screen.findByRole('textbox');
    await settle(100);

    expect(
      container.querySelector('[data-epr-unified="partyparrot"]'),
    ).not.toBeNull();
    expect(window.localStorage.getItem('epr_suggested')).toBeNull();
  });
});

describe('suggestedEmojis accepts native characters', () => {
  // Real-consumer contract: Cherry Studio stores recents as the inserted
  // characters and passes them straight through (its v4 patch API).
  it('resolves characters with and without U+FE0F to dataset IDs', async () => {
    const { container } = render(
      <EmojiPicker
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojis={['🧠', '©️', '©', '#️⃣', '❤', '🐦‍🔥', '🧠', 'not-an-emoji']}
      />,
    );
    await screen.findByRole('textbox');
    await settle(100);

    const suggested = container.querySelector(
      '[role="rowgroup"][aria-label="Frequently Used"]',
    ) as HTMLElement;
    const unifieds = Array.from(
      suggested.querySelectorAll('button[data-epr-unified]'),
    ).map((element) => element.getAttribute('data-epr-unified'));
    expect(unifieds).toEqual([
      '1f9e0',
      '00a9-fe0f',
      '0023-fe0f-20e3',
      '2764-fe0f',
      '1f426-200d-1f525',
    ]);
  });
});

describe('v5 search label (API.md §5)', () => {
  it('defaults to the English accessible label', async () => {
    renderPicker();
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Type to search for an emoji',
    );
  });

  it('searchLabel localizes the input label', async () => {
    renderPicker({ searchLabel: 'Buscar un emoji' });
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Buscar un emoji',
    );
  });
});
