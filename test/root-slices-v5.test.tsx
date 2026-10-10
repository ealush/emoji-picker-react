import { act, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PickerConfigProvider } from '../src/components/context/PickerConfigContext';
import {
  PickerContextProvider,
  useActiveSkinToneState,
  useEmojiVariationPickerState,
  useFilterRef,
  useNavigationRegistry,
  useReactionsModeState,
  useSearchTermState,
  useSkinToneFanOpenState,
  useVisibleCategoriesState,
} from '../src/components/context/PickerContext';
import { PickerDataProvider } from '../src/components/context/PickerDataContext';
import { NavigationRegistry } from '../src/state/navigationRegistry';
import { SkinTones } from '../src/types/exposedTypes';

// Render isolation gates.
//
// Each probe mirrors the exact slice subscriptions of its real region
// component (Search subscribes to search + skin-tone slices, Preview to
// reactions + variation, CategoryNav to the viewport slice, Reactions to
// the reactions slice). Services subscribers must never rerender from
// state updates.

interface Counters {
  search: number;
  reactions: number;
  categoryNav: number;
  preview: number;
  services: number;
}

interface Setters {
  setSearch: (value: string) => Promise<string>;
  setReactions: (value: boolean) => void;
  setVariation: (value: Parameters<ReturnType<typeof useEmojiVariationPickerState>[1]>[0]) => void;
  setVisibleCategories: (value: string[]) => void;
  setSkinTone: (value: SkinTones) => void;
}

function SearchProbe({ counters }: { counters: Counters }) {
  useSearchTermState();
  useActiveSkinToneState();
  useSkinToneFanOpenState();
  useFilterRef();
  counters.search += 1;
  return null;
}

function ReactionsProbe({ counters }: { counters: Counters }) {
  useReactionsModeState();
  counters.reactions += 1;
  return null;
}

function CategoryNavProbe({ counters }: { counters: Counters }) {
  useVisibleCategoriesState();
  counters.categoryNav += 1;
  return null;
}

function PreviewProbe({ counters }: { counters: Counters }) {
  useReactionsModeState();
  useEmojiVariationPickerState();
  counters.preview += 1;
  return null;
}

function ServicesProbe({ counters }: { counters: Counters }) {
  useFilterRef();
  useNavigationRegistry();
  counters.services += 1;
  return null;
}

function Capture({ setters }: { setters: Setters }) {
  const [, setSearch] = useSearchTermState();
  const [, setReactions] = useReactionsModeState();
  const [, setVariation] = useEmojiVariationPickerState();
  const [, setVisibleCategories] = useVisibleCategoriesState();
  const [, setSkinTone] = useActiveSkinToneState();
  setters.setSearch = setSearch;
  setters.setReactions = (value: boolean) => setReactions(value);
  setters.setVariation = setVariation;
  setters.setVisibleCategories = (value: string[]) =>
    setVisibleCategories(value);
  setters.setSkinTone = (value: SkinTones) => setSkinTone(value);
  return null;
}

function renderRoot(counters: Counters, setters: Setters) {
  return render(
    <PickerConfigProvider>
      <PickerDataProvider>
        <PickerContextProviderForTest counters={counters} setters={setters} />
      </PickerDataProvider>
    </PickerConfigProvider>,
  );
}

function PickerContextProviderForTest({
  counters,
  setters,
}: {
  counters: Counters;
  setters: Setters;
}) {
  return (
    <PickerContextProvider>
      <SearchProbe counters={counters} />
      <ReactionsProbe counters={counters} />
      <CategoryNavProbe counters={counters} />
      <PreviewProbe counters={counters} />
      <ServicesProbe counters={counters} />
      <Capture setters={setters} />
    </PickerContextProvider>
  );
}

function freshCounters(): Counters {
  return { search: 0, reactions: 0, categoryNav: 0, preview: 0, services: 0 };
}

function freshSetters(): Setters {
  return {
    setSearch: () => Promise.resolve(''),
    setReactions: () => {},
    setVariation: () => {},
    setVisibleCategories: () => {},
    setSkinTone: () => {},
  };
}

describe('v5 sliced state render isolation (PERFORMANCE §3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reactions toggle rerenders Reactions/Preview only, not Search/CategoryNav/services', () => {
    const counters = freshCounters();
    const setters = freshSetters();
    renderRoot(counters, setters);
    const base = { ...counters };

    act(() => {
      setters.setReactions(true);
    });

    expect(counters.reactions).toBe(base.reactions + 1);
    expect(counters.preview).toBe(base.preview + 1);
    expect(counters.search).toBe(base.search);
    expect(counters.categoryNav).toBe(base.categoryNav);
    expect(counters.services).toBe(base.services);
  });

  it('accepted search query rerenders Search only, not Reactions', () => {
    const counters = freshCounters();
    const setters = freshSetters();
    renderRoot(counters, setters);
    const base = { ...counters };

    act(() => {
      setters.setSearch('cat');
    });
    // Debounce pending: nothing committed yet.
    expect(counters.search).toBe(base.search);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(counters.search).toBe(base.search + 1);
    expect(counters.reactions).toBe(base.reactions);
    expect(counters.categoryNav).toBe(base.categoryNav);
    expect(counters.preview).toBe(base.preview);
    expect(counters.services).toBe(base.services);
  });

  it('variation change rerenders Preview only', () => {
    const counters = freshCounters();
    const setters = freshSetters();
    renderRoot(counters, setters);
    const base = { ...counters };

    act(() => {
      setters.setVariation({ u: '1f600' } as never);
    });

    expect(counters.preview).toBe(base.preview + 1);
    expect(counters.search).toBe(base.search);
    expect(counters.reactions).toBe(base.reactions);
    expect(counters.categoryNav).toBe(base.categoryNav);
    expect(counters.services).toBe(base.services);
  });

  it('viewport/scroll update rerenders CategoryNav only, not Search/Preview/Reactions/services', () => {
    const counters = freshCounters();
    const setters = freshSetters();
    renderRoot(counters, setters);
    const base = { ...counters };

    act(() => {
      setters.setVisibleCategories(['smileys_people']);
    });

    expect(counters.categoryNav).toBe(base.categoryNav + 1);
    expect(counters.search).toBe(base.search);
    expect(counters.reactions).toBe(base.reactions);
    expect(counters.preview).toBe(base.preview);
    expect(counters.services).toBe(base.services);
  });

  it('activity in Root A does not rerender Root B', () => {
    const countersA = freshCounters();
    const settersA = freshSetters();
    const countersB = freshCounters();
    const settersB = freshSetters();
    renderRoot(countersA, settersA);
    renderRoot(countersB, settersB);
    const baseB = { ...countersB };
    const baseA = { ...countersA };

    act(() => {
      settersA.setReactions(true);
    });
    act(() => {
      settersA.setVisibleCategories(['smileys_people']);
    });

    expect(countersB).toEqual(baseB);

    // Symmetric: activity in B leaves A alone.
    act(() => {
      settersB.setReactions(true);
    });

    expect(countersA.reactions).toBe(baseA.reactions + 1);
    expect(countersA.search).toBe(baseA.search);
    expect(countersA.categoryNav).toBe(baseA.categoryNav + 1);
  });

  it('each Root owns an isolated navigation registry, disposed on unmount', () => {
    const seen: NavigationRegistry[] = [];

    function RegistryCapture() {
      seen.push(useNavigationRegistry());
      return null;
    }

    function RootWithCapture() {
      return (
        <PickerConfigProvider>
          <PickerDataProvider>
            <PickerContextProvider>
              <RegistryCapture />
            </PickerContextProvider>
          </PickerDataProvider>
        </PickerConfigProvider>
      );
    }

    render(<RootWithCapture />);
    const { unmount } = render(<RootWithCapture />);

    expect(seen).toHaveLength(2);
    expect(seen[0]).toBeInstanceOf(NavigationRegistry);
    expect(seen[1]).toBeInstanceOf(NavigationRegistry);
    expect(seen[0]).not.toBe(seen[1]);

    const token = seen[1].currentGeneration();
    expect(seen[1].isCurrent(token)).toBe(true);
    unmount();
    // Root unmount invalidates pending materialize/scroll/focus work.
    expect(seen[1].isCurrent(token)).toBe(false);
  });
});

describe('NavigationRegistry', () => {
  it('registers regions with unique ids and unregisters on cleanup', () => {
    const registry = new NavigationRegistry();
    const element = document.createElement('div');
    const unregister = registry.register('search', element);
    const second = registry.register('grid', element);

    const regions = registry.getRegions();
    expect(regions).toHaveLength(2);
    expect(regions[0].id).not.toBe(regions[1].id);
    expect(regions[0].kind).toBe('search');

    unregister();
    expect(registry.getRegions()).toHaveLength(1);
    second();
    expect(registry.getRegions()).toHaveLength(0);
  });

  it('invalidates pending generations without moving focus itself', () => {
    const registry = new NavigationRegistry();
    const token = registry.currentGeneration();
    expect(registry.isCurrent(token)).toBe(true);

    registry.invalidate();
    expect(registry.isCurrent(token)).toBe(false);
    expect(registry.isCurrent(registry.currentGeneration())).toBe(true);
  });

  it('dispose clears regions and invalidates every outstanding token', () => {
    const registry = new NavigationRegistry();
    const element = document.createElement('div');
    registry.register('preview', element);
    const token = registry.currentGeneration();

    registry.dispose();
    expect(registry.getRegions()).toHaveLength(0);
    expect(registry.isCurrent(token)).toBe(false);
  });

  it('instances are isolated across Roots', () => {
    const a = new NavigationRegistry();
    const b = new NavigationRegistry();
    a.register('search', document.createElement('div'));

    expect(a.getRegions()).toHaveLength(1);
    expect(b.getRegions()).toHaveLength(0);
    b.invalidate();
    expect(a.isCurrent(a.currentGeneration())).toBe(true);
  });
});
