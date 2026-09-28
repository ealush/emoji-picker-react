import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../../src';
import { PickerConfigProvider } from '../../src/components/context/PickerConfigContext';
import {
  PickerContextProvider,
  useReactionsModeState,
  useSearchTermState,
  useVisibleCategoriesState,
} from '../../src/components/context/PickerContext';
import { PickerDataProvider } from '../../src/components/context/PickerDataContext';
import { getPickerDataSnapshot } from '../../src/data-core/pickerData';
import {
  __getPrepareCount,
  __resetPrepareCount,
  getPreparedCore,
} from '../../src/data-core/prepare';
import { searchEmojis } from '../../src/data-core/search';
import defaultEmojiData from '../../src/data/emojis';
import { useDataIdentityStabilityWarning } from '../../src/hooks/useDataIdentityStabilityWarning';
import type { CustomEmoji } from '../../src/config/customEmojiConfig';
import type { EmojiData } from '../../src/types/exposedTypes';

const SRC = join(process.cwd(), 'src');
const readSrc = (relativePath: string): string =>
  readFileSync(join(SRC, relativePath), 'utf8');

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
      'searchIndex',
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

  it('does not deep-compare datasets merely to diagnose identity churn', () => {
    const source = readSrc('hooks/useDataIdentityStabilityWarning.ts');
    for (const forbidden of [
      'JSON.stringify',
      'cloneDeep',
      'deepEqual',
      '.emojis',
    ]) {
      expect(source).not.toContain(forbidden);
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

function SliceHarness({
  counts,
  setters,
}: {
  counts: Record<string, number>;
  setters: Record<string, (value: never) => void>;
}) {
  return (
    <PickerConfigProvider>
      <PickerDataProvider>
        <PickerContextProvider>
          <SearchProbe counts={counts} />
          <ReactionsProbe counts={counts} />
          <ViewportProbe counts={counts} />
          <Capture setters={setters} />
        </PickerContextProvider>
      </PickerDataProvider>
    </PickerConfigProvider>
  );
}

function SearchProbe({ counts }: { counts: Record<string, number> }) {
  const [term] = useSearchTermState();
  counts.search = (counts.search ?? 0) + 1;
  return <span>{term}</span>;
}

function ReactionsProbe({ counts }: { counts: Record<string, number> }) {
  useReactionsModeState();
  counts.reactions = (counts.reactions ?? 0) + 1;
  return null;
}

function ViewportProbe({ counts }: { counts: Record<string, number> }) {
  useVisibleCategoriesState();
  counts.viewport = (counts.viewport ?? 0) + 1;
  return null;
}

function Capture({
  setters,
}: {
  setters: Record<string, (value: never) => void>;
}) {
  const [, setSearch] = useSearchTermState();
  const [, setReactions] = useReactionsModeState();
  const [, setVisible] = useVisibleCategoriesState();
  setters.setSearch = setSearch as (value: never) => void;
  setters.setReactions = setReactions as (value: never) => void;
  setters.setVisible = setVisible as (value: never) => void;
  return null;
}

function FullPickerHarness({
  onSearchChange,
}: {
  onSearchChange: (value: string) => void;
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
  return <EmojiPicker emojiData={dataset} onSearchChange={onSearchChange} />;
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
    // Hover drives preview...
    await vi.waitFor(() => {
      expect(container.textContent).toContain('grinning face');
    });
    // ...without touching search state or callbacks (hover intentionally
    // moves DOM focus to the hovered button for arrow-key continuity).
    expect(input.value).toBe('');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
    expect(onSearchChange).not.toHaveBeenCalled();
    // ...and hover state is component-local by construction: PreviewBody
    // owns it in useState rather than any shared slice.
    expect(readSrc('components/footer/Preview.tsx')).toContain(
      'useState<PreviewEmoji>',
    );
  });

  it('scroll does not rerender Search CategoryNav Preview or Reactions', () => {
    const counts: Record<string, number> = {};
    const setters: Record<string, (value: never) => void> = {};
    render(<SliceHarness counts={counts} setters={setters} />);
    const base = { ...counts };
    act(() => {
      setters.setVisible(['smileys_people'] as never);
    });
    expect(counts.viewport).toBe(base.viewport + 1);
    expect(counts.search).toBe(base.search);
    expect(counts.reactions).toBe(base.reactions);
  });

  it('accepted search query changes do not rerender Reactions', async () => {
    const counts: Record<string, number> = {};
    const setters: Record<string, (value: never) => void> = {};
    render(<SliceHarness counts={counts} setters={setters} />);
    const base = { ...counts };
    await act(async () => {
      await (setters.setSearch as (value: string) => Promise<string>)('cat');
    });
    expect(counts.search).toBe(base.search + 1);
    expect(counts.reactions).toBe(base.reactions);
    expect(counts.viewport).toBe(base.viewport);
  });

  it('Root A updates do not rerender Root B', () => {
    const countsA: Record<string, number> = {};
    const settersA: Record<string, (value: never) => void> = {};
    const countsB: Record<string, number> = {};
    const settersB: Record<string, (value: never) => void> = {};
    render(<SliceHarness counts={countsA} setters={settersA} />);
    render(<SliceHarness counts={countsB} setters={settersB} />);
    const baseB = { ...countsB };
    act(() => {
      settersA.setReactions(true as never);
    });
    expect(countsB).toEqual(baseB);
    void settersB;
  });
});

describe('v5 scroll work', () => {
  it('uses a passive scroll listener', () => {
    const source = readSrc('hooks/useOnScroll.ts');
    expect(source).toContain('passive: true');
  });

  it('coalesces virtualization updates to at most one per animation frame', () => {
    const source = readSrc('hooks/useOnScroll.ts');
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain('scheduledRef');
  });
});

describe('v5 package performance invariants', () => {
  it('data entry imports neither React nor ShipStyles', () => {
    for (const file of [
      'data.ts',
      'data-core/prepare.ts',
      'data-core/search.ts',
      'data-core/types.ts',
    ]) {
      const source = readSrc(file);
      expect(source).not.toMatch(/^import .* from ['"]react['"]/m);
      expect(source).not.toMatch(/require\(['"]react['"]\)/);
      expect(source).not.toMatch(/^import .*shipstyles.*/m);
      expect(source).not.toMatch(/require\(['"]shipstyles['"]\)/);
    }
  });

  it('primitives-only consumer excludes default appearance wrapper', () => {
    const source = readSrc('primitives/Root.tsx');
    expect(source).not.toMatch(/^import .*ErrorBoundary.*$/m);
    const offenders = ['primitives/Root.tsx']
      .map((file) => readSrc(file))
      .filter((content) => /main\/defaultAppearance/.test(content));
    expect(offenders).toEqual([]);
  });

  it('single locale consumer does not include every locale', () => {
    // Locale modules are pure data: the only permitted import is the
    // erased EmojiData type. No runtime dependency can drag in siblings.
    for (const entry of ['emojis-es', 'emojis-de', 'emojis-fr']) {
      const source = readSrc(`data/${entry}.ts`);
      const imports = source.match(/^\s*import .*$/gm) ?? [];
      expect(imports.length).toBeGreaterThan(0);
      for (const statement of imports) {
        expect(statement).toMatch(/import\s+(type\s+)?\{\s*EmojiData\s*\}/);
      }
    }
  });
});
