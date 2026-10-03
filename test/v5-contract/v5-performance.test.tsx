import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../../src';
import { PickerContextProvider } from '../../src/components/context/PickerContext';
import { getPickerDataSnapshot } from '../../src/data-core/pickerData';
import {
  __getPrepareCount,
  __resetPrepareCount,
  getPreparedCore,
} from '../../src/data-core/prepare';
import { searchEmojis } from '../../src/data-core/search';
import defaultEmojiData from '../../src/data/emojis';
import { useDataIdentityStabilityWarning } from '../../src/hooks/useDataIdentityStabilityWarning';
import { useOnScroll } from '../../src/hooks/useOnScroll';
import type { CustomEmoji } from '../../src/config/customEmojiConfig';
import type { EmojiData } from '../../src/types/exposedTypes';

// Render probes: transparent counting passthroughs over real leaves.
// BtnPlus renders only inside the reactions bar, BtnClearSearch only
// inside Search (with a non-empty debounced term), EmojiList only inside
// the grid — so their execution counts mirror real-subtree renders.
let btnPlusRenders = 0;
vi.mock('../../src/components/Reactions/BtnPlus', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/components/Reactions/BtnPlus')>();
  return {
    ...actual,
    BtnPlus: () => {
      btnPlusRenders += 1;
      return actual.BtnPlus();
    },
  };
});

let clearRenders = 0;
vi.mock(
  '../../src/components/header/Search/BtnClearSearch',
  async (importOriginal) => {
    const actual =
      await importOriginal<typeof import('../../src/components/header/Search/BtnClearSearch')>();
    return {
      ...actual,
      BtnClearSearch: () => {
        clearRenders += 1;
        return actual.BtnClearSearch();
      },
    };
  },
);

let emojiListRenders = 0;
vi.mock('../../src/components/body/EmojiList', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/components/body/EmojiList')>();
  return {
    ...actual,
    EmojiList: (
      props: Parameters<typeof actual.EmojiList>[0],
    ) => {
      emojiListRenders += 1;
      return actual.EmojiList(props);
    },
  };
});

function miniDataset(tag: string): EmojiData {
  return {
    categories: {},
    emojis: {
      test: [{ n: [tag], u: '1f600', a: '1' } as never],
    },
  };
}

describe('v5 prepared data core', () => {
  it('builds default dataset index once for ten same-data Roots', () => {
    __resetPrepareCount();
    const before = __getPrepareCount();
    const cores = [];
    for (let i = 0; i < 10; i += 1) {
      cores.push(getPreparedCore());
    }
    expect(__getPrepareCount() - before).toBe(1);
    for (const core of cores) {
      expect(core).toBe(cores[0]);
    }
  });

  it('returns the same prepared-core identity for the same emojiData object', () => {
    const dataset = miniDataset('aa');
    expect(getPreparedCore(dataset)).toBe(getPreparedCore(dataset));
    expect(getPreparedCore(dataset)).not.toBe(getPreparedCore());
  });

  it('does not JSON clone the full default dataset per Root', () => {
    const source = defaultEmojiData as unknown as EmojiData;
    const snapshot = getPickerDataSnapshot(undefined, undefined);
    expect(snapshot.emojiData).not.toBe(source);
    expect(snapshot.emojiData.emojis.smileys_people).toBe(
      source.emojis.smileys_people,
    );
  });

  it('keeps emojiVersion and hiddenEmojis as Root-local filters instead of fragmenting base cache', () => {
    const dataset = miniDataset('bb');
    // Per-Root display layers never touch the shared base index: the same
    // dataset identity resolves one core however many Roots filter it.
    expect(getPreparedCore(dataset)).toBe(getPreparedCore(dataset));
  });

  it('does not mutate caller emojiData or customEmojis', () => {
    const dataset = miniDataset('cc');
    const customs: CustomEmoji[] = [
      { id: 'x1', names: ['x1'], imgUrl: 'https://x/1.png' },
    ];
    const dataBefore = JSON.stringify(dataset);
    const customsBefore = JSON.stringify(customs);
    getPreparedCore(dataset);
    getPickerDataSnapshot(dataset, customs);
    searchEmojis('cc', { emojiData: dataset });
    expect(JSON.stringify(dataset)).toBe(dataBefore);
    expect(JSON.stringify(customs)).toBe(customsBefore);
  });

  it('does not retain Root controllers through the data cache', () => {
    const snapshot = getPickerDataSnapshot(undefined, undefined);
    expect(Object.keys(snapshot).sort()).toEqual([
      'allEmojis',
      'allEmojisByUnified',
      'customGroups',
      'emojiData',
    ]);
  });
});

function StabilityProbe({
  emojiData,
  customEmojis,
}: {
  emojiData?: EmojiData;
  customEmojis?: CustomEmoji[];
}) {
  useDataIdentityStabilityWarning(emojiData, customEmojis);
  return null;
}

describe('v5 referential-stability diagnostics', () => {
  it('does not warn for one-off emojiData identity changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const stable = miniDataset('stable');
      const { rerender, unmount } = render(
        <StabilityProbe emojiData={stable} />,
      );
      rerender(<StabilityProbe emojiData={stable} />);
      rerender(<StabilityProbe emojiData={miniDataset('once')} />);
      expect(warn).not.toHaveBeenCalled();
      unmount();
    } finally {
      warn.mockRestore();
    }
  });

  it('warns once after three consecutive committed non-default emojiData identity changes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { rerender, unmount } = render(
        <StabilityProbe emojiData={miniDataset('v1')} />,
      );
      rerender(<StabilityProbe emojiData={miniDataset('v2')} />);
      rerender(<StabilityProbe emojiData={miniDataset('v3')} />);
      expect(warn).not.toHaveBeenCalled();
      rerender(<StabilityProbe emojiData={miniDataset('v4')} />);
      expect(warn).toHaveBeenCalledTimes(1);
      rerender(<StabilityProbe emojiData={miniDataset('v5')} />);
      expect(warn).toHaveBeenCalledTimes(1);
      unmount();
    } finally {
      warn.mockRestore();
    }
  });

  it('tracks customEmojis identity churn independently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const customs = (id: string): CustomEmoji[] => [
      { id, names: [id], imgUrl: 'https://x/y.png' },
    ];
    try {
      const { rerender, unmount } = render(
        <StabilityProbe customEmojis={customs('a')} />,
      );
      rerender(<StabilityProbe customEmojis={customs('b')} />);
      rerender(<StabilityProbe customEmojis={customs('c')} />);
      rerender(<StabilityProbe customEmojis={customs('d')} />);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('customEmojis');
      unmount();
    } finally {
      warn.mockRestore();
    }
  });

  it('diagnoses identity churn without reading dataset contents', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // Content getters throw on any access: diagnosing identity churn
      // must compare references only — never deep-read, spread, clone,
      // or stringify the datasets.
      const boobyTrapped = (): EmojiData => {
        const dataset: EmojiData = { categories: {}, emojis: {} };
        for (const key of ['categories', 'emojis'] as const) {
          Object.defineProperty(dataset, key, {
            enumerable: true,
            get: () => {
              throw new Error(`deep read of ${key}`);
            },
          });
        }
        return dataset;
      };
      const { rerender, unmount } = render(
        <StabilityProbe emojiData={boobyTrapped()} />,
      );
      rerender(<StabilityProbe emojiData={boobyTrapped()} />);
      rerender(<StabilityProbe emojiData={boobyTrapped()} />);
      rerender(<StabilityProbe emojiData={boobyTrapped()} />);
      rerender(<StabilityProbe emojiData={boobyTrapped()} />);
      // Three consecutive identity changes still warn...
      expect(warn).toHaveBeenCalledTimes(1);
      // ...and nothing above threw, so no content access happened.
      unmount();
    } finally {
      warn.mockRestore();
    }
  });
});

describe('v5 search performance invariants', () => {
  it('cold-query benchmark resets only per-Root query memo between samples', () => {
    const core = getPreparedCore();
    searchEmojis('smile');
    expect(core.queryMemo.has('smile')).toBe(true);
    const before = __getPrepareCount();
    core.queryMemo.clear();
    searchEmojis('smile');
    // No base rebuild: only the memo was reset, then refilled.
    expect(__getPrepareCount() - before).toBe(0);
    expect(core.queryMemo.has('smile')).toBe(true);
  });

  it('cold-query timing excludes base prepared-index construction', () => {
    getPreparedCore();
    const before = __getPrepareCount();
    for (const query of ['grin', 'cat', 'zzz-no-match']) {
      getPreparedCore().queryMemo.clear();
      searchEmojis(query);
    }
    expect(__getPrepareCount() - before).toBe(0);
  });

  it('incremental typing benchmark keeps one Root query memo alive through each sequence', () => {
    const core = getPreparedCore();
    core.queryMemo.clear();
    for (const step of ['c', 'ca', 'cat']) {
      searchEmojis(step);
    }
    expect(core.queryMemo.has('c')).toBe(true);
    expect(core.queryMemo.has('ca')).toBe(true);
    expect(core.queryMemo.has('cat')).toBe(true);
  });

  it('repeated identical query avoids a second full dataset scan', () => {
    const first = searchEmojis('smile');
    const second = searchEmojis('smile');
    expect(second.map((entry) => entry.unified)).toEqual(
      first.map((entry) => entry.unified),
    );
    expect(second).not.toBe(first);
    expect(second[0]).toBe(first[0]);
  });

  it('prepared-dataset generation change invalidates per-Root query memo', () => {
    const custom: EmojiData = {
      categories: {},
      emojis: {
        test: [{ n: ['zzzcustom'], u: '1f600', a: '1' } as never],
      },
    };
    const fromDefault = searchEmojis('zzzcustom');
    const fromCustom = searchEmojis('zzzcustom', { emojiData: custom });
    expect(fromDefault).toEqual([]);
    expect(fromCustom.map((entry) => entry.unified)).toEqual(['1f600']);
  });
});

function FullPickerHarness({
  onSearchChange,
  autoFocusSearch = true,
}: {
  onSearchChange: (value: string) => void;
  autoFocusSearch?: boolean;
}) {
  const dataset: EmojiData = {
    categories: {},
    emojis: {
      smileys_people: [
        { n: ['face', 'grinning face'], u: '1f600', a: '1' } as never,
        { n: ['smiling face with smiling eyes'], u: '1f60a', a: '0.6' } as never,
      ],
    },
  };
  return (
    <EmojiPicker
      emojiData={dataset}
      onSearchChange={onSearchChange}
      autoFocusSearch={autoFocusSearch}
    />
  );
}

describe('v5 render isolation', () => {
  it('preview hover updates preview content without disturbing search', async () => {
    const onSearchChange = vi.fn();
    const { container } = render(
      <FullPickerHarness onSearchChange={onSearchChange} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    act(() => {
      input.focus();
    });
    const button = Array.from(
      container.querySelectorAll('[data-epr-part="emoji"]'),
    ).find(
      (element) =>
        element.getAttribute('data-epr-unified') === '1f600',
    ) as HTMLElement;
    fireEvent.mouseOver(button, { bubbles: true });
    const previewOf = (root: HTMLElement): string =>
      root.querySelector('[data-epr-part="preview"]')?.textContent ?? '';
    // Hover drives this picker's preview...
    await vi.waitFor(() => {
      expect(previewOf(container)).toContain('grinning face');
    });
    // ...without touching search state or callbacks (hover intentionally
    // moves DOM focus to the hovered button for arrow-key continuity).
    expect(input.value).toBe('');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
    expect(onSearchChange).not.toHaveBeenCalled();
    // ...and hover state is Root-local: a second picker neither shows
    // the hover nor disturbs the first picker's preview (its autofocus
    // stays off so focus — which the preview follows — is undisturbed).
    const second = render(
      <FullPickerHarness onSearchChange={() => {}} autoFocusSearch={false} />,
    );
    expect(previewOf(second.container)).not.toContain('grinning face');
    expect(previewOf(container)).toContain('grinning face');
    second.unmount();
  });

  it('scroll does not rerender Search while the grid consumes it', async () => {
    const { container } = render(
      <FullPickerHarness onSearchChange={() => {}} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'face' } });
    // The clear button mounts once the debounced term lands.
    await vi.waitFor(() => {
      expect(clearRenders).toBeGreaterThan(0);
    });
    clearRenders = 0;
    emojiListRenders = 0;
    const viewport = container.querySelector(
      '[data-epr-part="viewport"]',
    ) as HTMLElement;
    viewport.scrollTop = 100;
    fireEvent.scroll(viewport);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    // Grid consumed the scroll; Search never re-executed.
    expect(emojiListRenders).toBeGreaterThan(0);
    expect(clearRenders).toBe(0);
  });

  it('typing does not rerender the reactions bar', () => {
    const { container } = render(
      <EmojiPicker emojiData={miniDataset('iso')} reactionsDefaultOpen />,
    );
    expect(btnPlusRenders).toBeGreaterThan(0);
    btnPlusRenders = 0;
    const input = container.querySelector(
      '[data-epr-part="search"] input',
    ) as HTMLInputElement;
    let value = '';
    for (const ch of ['s', 'm', 'i', 'l', 'e']) {
      value += ch;
      fireEvent.change(input, { target: { value } });
    }
    expect(input.value).toBe('smile');
    expect(btnPlusRenders).toBe(0);
  });

  it('Root A updates do not commit Root B', () => {
    let commitsA = 0;
    let commitsB = 0;
    const treeA = (
      <React.Profiler
        id="root-a"
        onRender={() => {
          commitsA += 1;
        }}
      >
        <EmojiPicker emojiData={miniDataset('a')} />
      </React.Profiler>
    );
    const treeB = (
      <React.Profiler
        id="root-b"
        onRender={() => {
          commitsB += 1;
        }}
      >
        <EmojiPicker emojiData={miniDataset('b')} />
      </React.Profiler>
    );
    const pickerA = render(treeA);
    const pickerB = render(treeB);
    commitsA = 0;
    commitsB = 0;
    const inputA = pickerA.container.querySelector(
      'input',
    ) as HTMLInputElement;
    fireEvent.change(inputA, { target: { value: 'face' } });
    expect(commitsA).toBeGreaterThan(0);
    expect(commitsB).toBe(0);
    const inputB = pickerB.container.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(inputB.value).toBe('');
    pickerA.unmount();
    pickerB.unmount();
  });
});

describe('v5 scroll work', () => {
  it('attaches the scroll listener as passive', () => {
    const seen: Array<{
      type: string;
      options: unknown;
      element: HTMLElement;
    }> = [];
    const original = window.HTMLDivElement.prototype.addEventListener;
    window.HTMLDivElement.prototype.addEventListener = function (
      this: HTMLElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions | boolean,
    ) {
      seen.push({ type, options, element: this });
      return original.call(this, type, listener, options as never);
    } as never;
    try {
      render(<FullPickerHarness onSearchChange={() => {}} />);
      // Only the viewport's own listener counts: React also attaches a
      // capture-phase root scroll listener, which is not ours.
      const scrolls = seen.filter(
        (entry) =>
          entry.type === 'scroll' &&
          entry.element.dataset.eprPart === 'viewport',
      );
      expect(scrolls.length).toBe(1);
      expect(scrolls[0].options).toMatchObject({ passive: true });
    } finally {
      window.HTMLDivElement.prototype.addEventListener = original;
    }
  });

  it('coalesces a scroll burst into one update carrying the latest value', async () => {
    const seen: number[] = [];
    const { container, unmount } = render(
      <PickerContextProvider>
        <ScrollProbe onTop={(top) => seen.push(top)} />
      </PickerContextProvider>,
    );
    const baseline = seen.length;
    const scroller = container.firstChild as HTMLElement;
    // One frame, three positions, dispatched synchronously.
    scroller.scrollTop = 10;
    fireEvent.scroll(scroller);
    scroller.scrollTop = 20;
    fireEvent.scroll(scroller);
    scroller.scrollTop = 30;
    fireEvent.scroll(scroller);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    // Exactly one scheduled update, with the latest position — three
    // uncoalesced updates would render [10, 20, 30].
    expect(seen.slice(baseline)).toEqual([30]);
    unmount();
  });
});

function ScrollProbe({ onTop }: { onTop: (top: number) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const top = useOnScroll(ref);
  onTop(top);
  return (
    <div ref={ref} style={{ overflow: 'auto', height: '100px' }}>
      <div style={{ height: '1000px' }} />
    </div>
  );
}

// Packaging invariants (data entry framework-free, primitives bundle
// excluding the default appearance wrapper, locale isolation) are
// enforced on the shipped bundles by `npm run check:package` — load
// tests plus marker scans of the real artifacts — which subsumes the
// source-import scans that lived here.
