import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle, Props } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { PickerConfigProvider } from '../src/components/context/PickerConfigContext';
import {
  ElementRefContextProvider,
  usePickerMainRef,
} from '../src/components/context/ElementRefContext';
import {
  PickerContextProvider,
  useNavigationRegistry,
} from '../src/components/context/PickerContext';
import { PickerDataProvider } from '../src/components/context/PickerDataContext';
import { useRegisterRegion } from '../src/hooks/useRegisterRegion';
import {
  NavigationRegistry,
  __resetNavigationWarningsForTest,
  duplicateRegionPolicy,
  reportDuplicateRegion,
} from '../src/state/navigationRegistry';
import {
  getActiveRegionsInDomOrder,
  getNextRegion,
  getPrevRegion,
} from '../src/state/regionTraversal';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => {
  __resetNavigationWarningsForTest();
  vi.unstubAllEnvs();
});

function buildTree(): {
  root: HTMLDivElement;
  search: HTMLDivElement;
  categories: HTMLDivElement;
  grid: HTMLDivElement;
} {
  const root = document.createElement('div');
  const search = document.createElement('div');
  const categories = document.createElement('div');
  const grid = document.createElement('div');
  // Deliberately shuffled append order: traversal must follow DOM order,
  // not insertion order.
  root.appendChild(grid);
  root.appendChild(search);
  root.appendChild(categories);
  document.body.appendChild(root);
  return { root, search, categories, grid };
}

describe('region traversal (NAVIGATION.md §3)', () => {
  it('orders by DOM document order, not registration order', () => {
    const { root, search, categories, grid } = buildTree();
    const registry = new NavigationRegistry();
    registry.register('grid', grid);
    registry.register('categories', categories);
    registry.register('search', search);

    const kinds = getActiveRegionsInDomOrder(registry, root).map(
      (region) => region.kind,
    );
    expect(kinds).toEqual(['grid', 'search', 'categories']);

    root.remove();
  });

  it('filters hidden, inert, and disconnected regions', () => {
    const { root, search, categories, grid } = buildTree();
    const registry = new NavigationRegistry();
    registry.register('search', search);
    registry.register('categories', categories);
    registry.register('grid', grid);

    categories.hidden = true;
    expect(
      getActiveRegionsInDomOrder(registry, root).map((r) => r.kind),
    ).toEqual(['grid', 'search']);

    categories.hidden = false;
    grid.setAttribute('inert', '');
    expect(
      getActiveRegionsInDomOrder(registry, root).map((r) => r.kind),
    ).toEqual(['search', 'categories']);

    grid.removeAttribute('inert');
    grid.remove();
    expect(
      getActiveRegionsInDomOrder(registry, root).map((r) => r.kind),
    ).toEqual(['search', 'categories']);

    root.remove();
  });

  it('excludes portal roots outside the Root element', () => {
    const { root, search, categories, grid } = buildTree();
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    const registry = new NavigationRegistry();
    registry.register('search', search);
    registry.register('categories', categories);
    registry.register('grid', outside);

    expect(
      getActiveRegionsInDomOrder(registry, root).map((r) => r.kind),
    ).toEqual(['search', 'categories']);

    outside.remove();
    root.remove();
  });

  it('keeps only the authoritative registration per singleton kind', () => {
    const { root, search, categories } = buildTree();
    const extra = document.createElement('div');
    root.appendChild(extra);

    const registry = new NavigationRegistry();
    registry.register('search', search);
    registry.register('search', extra);
    registry.register('categories', categories);

    const active = getActiveRegionsInDomOrder(registry, root);
    expect(active.filter((r) => r.kind === 'search')).toHaveLength(1);
    expect(active[0].element).toBe(search);

    root.remove();
  });

  it('resolves next/previous regions with undefined at the edges', () => {
    const { root, search, categories, grid } = buildTree();
    const registry = new NavigationRegistry();
    registry.register('search', search);
    registry.register('categories', categories);
    registry.register('grid', grid);

    // DOM order: grid, search, categories.
    expect(getNextRegion(registry, root, 'grid')?.kind).toBe('search');
    expect(getNextRegion(registry, root, 'search')?.kind).toBe('categories');
    expect(getNextRegion(registry, root, 'categories')).toBeUndefined();
    expect(getPrevRegion(registry, root, 'grid')).toBeUndefined();
    expect(getPrevRegion(registry, root, 'search')?.kind).toBe('grid');
    expect(getPrevRegion(registry, root, 'categories')?.kind).toBe('search');

    root.remove();
  });
});

describe('duplicate region policy (NAVIGATION.md §2)', () => {
  it('throws in development', () => {
    expect(duplicateRegionPolicy()).toBe('throw');
    expect(() => reportDuplicateRegion('search')).toThrow(
      /Duplicate <Search> region/,
    );
  });

  it('warns once and keeps the first registration in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(duplicateRegionPolicy()).toBe('warn-once');
      reportDuplicateRegion('search');
      reportDuplicateRegion('search');
      expect(warn).toHaveBeenCalledTimes(1);

      const registry = new NavigationRegistry();
      const first = document.createElement('div');
      const second = document.createElement('div');
      registry.register('search', first);
      registry.register('search', second);
      expect(registry.getAuthoritativeRegion('search')?.element).toBe(first);
    } finally {
      warn.mockRestore();
    }
  });
});

function RegionHost({
  kind,
  externalElement,
  onRegistry,
}: {
  kind: 'search' | 'categories';
  externalElement?: HTMLDivElement;
  onRegistry: (registry: NavigationRegistry) => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const registry = useNavigationRegistry();
  React.useEffect(() => {
    onRegistry(registry);
  }, [onRegistry, registry]);
  useRegisterRegion(
    kind,
    externalElement ? { current: externalElement } : ref,
  );
  return externalElement ? null : <div ref={ref} />;
}

// A real Root DOM element: the hook checks containment against it, so
// portal roots (outside) warn and are skipped while inside roots register.
function RootShell({ children }: { children: React.ReactNode }) {
  const PickerMainRef = usePickerMainRef();
  return (
    <aside ref={PickerMainRef as React.RefObject<HTMLElement>}>
      {children}
    </aside>
  );
}

function renderRegionHost(
  props: React.ComponentProps<typeof RegionHost>,
  onRegistry: (registry: NavigationRegistry) => void,
) {
  return render(
    <ElementRefContextProvider>
      <PickerConfigProvider>
        <PickerDataProvider>
          <PickerContextProvider>
            <RootShell>
              <RegionHost {...props} onRegistry={onRegistry} />
            </RootShell>
          </PickerContextProvider>
        </PickerDataProvider>
      </PickerConfigProvider>
    </ElementRefContextProvider>,
  );
}

describe('useRegisterRegion', () => {
  it('registers on mount and unregisters on unmount', () => {
    let registry: NavigationRegistry | undefined;

    const { unmount } = renderRegionHost({ kind: 'search' }, (next) => {
      registry = next;
    });

    expect(registry?.getRegionsByKind('search')).toHaveLength(1);
    unmount();
    expect(registry?.getRegionsByKind('search')).toHaveLength(0);
  });

  it('warns and skips portal roots outside the Root element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let registry: NavigationRegistry | undefined;
    // Never attached under the picker root: treated as a portal root.
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    try {
      renderRegionHost(
        { kind: 'grid', externalElement: outside },
        (next) => {
          registry = next;
        },
      );

      expect(warn).toHaveBeenCalledTimes(1);
      expect(registry?.getRegionsByKind('grid')).toHaveLength(0);
    } finally {
      warn.mockRestore();
      outside.remove();
    }
  });
});

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
      { n: ['face', 'grinning face with big eyes'], u: '1f603', a: '0.6' },
      { n: ['cat', 'cat face'], u: '1f431', a: '0.6' },
    ],
    [Categories.ANIMALS_NATURE]: [
      { n: ['dog', 'dog face'], u: '1f436', a: '0.6' },
      { n: ['bird', 'bird'], u: '1f426', a: '0.6' },
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

async function waitForFocus(label: RegExp | string) {
  await vi.waitFor(() => {
    const active = document.activeElement?.getAttribute('aria-label') ?? '';
    if (typeof label === 'string') {
      expect(active).toBe(label);
    } else {
      expect(active).toMatch(label);
    }
  });
}

describe('cross-region keyboard regression (NAVIGATION.md §4)', () => {
  it('Search ArrowDown enters the next DOM-order region (categories)', async () => {
    renderPicker();
    const input = await screen.findByRole('textbox');

    act(() => {
      input.focus();
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // First category tab receives focus (Suggested in the default config).
    await waitForFocus(/Frequently Used/i);
  });

  it('Categories ArrowUp returns to the previous DOM-order region (search)', async () => {
    renderPicker();
    const input = await screen.findByRole('textbox');

    act(() => {
      input.focus();
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitForFocus(/Frequently Used/i);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: 'ArrowUp',
    });
    await waitForFocus('Type to search for an emoji');
  });
});

describe('stale grid navigation cancellation (NAVIGATION.md §11)', () => {
  it('aborts a pending arrow-key focus after the filter changes', async () => {
    renderPicker();
    const buttons = await screen.findAllByRole('gridcell', {
      name: /grinning face|cat face|dog face|bird/i,
    });
    expect(buttons.length).toBeGreaterThan(1);

    const [first, second] = buttons;
    act(() => {
      first.focus();
    });
    expect(document.activeElement).toBe(first);

    // ArrowRight schedules rAF-deferred focus on the sibling…
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    // …but a synchronous filter change invalidates the generation first.
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'dog' } });

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(document.activeElement).toBe(first);
    expect(document.activeElement).not.toBe(second);
  });

  it('completes the pending focus when nothing invalidates it', async () => {
    renderPicker();
    const buttons = await screen.findAllByRole('gridcell', {
      name: /grinning face|cat face|dog face|bird/i,
    });
    const [first, second] = buttons;
    act(() => {
      first.focus();
    });

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(second);
    });
  });

  it('dispose aborts pending guarded completions', () => {
    const registry = new NavigationRegistry();
    const token = registry.currentGeneration();
    expect(registry.isCurrent(token)).toBe(true);
    registry.dispose();
    expect(registry.isCurrent(token)).toBe(false);
  });

  it('revive re-enables a disposed registry with a fresh generation', () => {
    const registry = new NavigationRegistry();
    const stale = registry.currentGeneration();
    registry.dispose();
    expect(registry.isCurrent(stale)).toBe(false);
    registry.revive();
    // Pre-unmount tokens stay dead across the remount boundary…
    expect(registry.isCurrent(stale)).toBe(false);
    // …while completions captured after the revive proceed.
    expect(registry.isCurrent(registry.currentGeneration())).toBe(true);
  });
});
