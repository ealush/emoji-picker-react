import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { useNavigationRegistry } from '../src/components/context/PickerContext';
import { Categories, SkinTonePickerLocation } from '../src/types/exposedTypes';
import {
  Root,
  Search,
  SearchInput,
  Preview,
  SkinTone,
} from '../src/primitives';
import type { EmojiData, RootProps } from '../src/primitives';
import type { NavigationRegistry } from '../src/state/navigationRegistry';

const data: EmojiData = {
  categories: {
    smileys_people: { category: Categories.SMILEYS_PEOPLE, name: 'Faces' },
  },
  emojis: { smileys_people: [{ u: '1f600', n: ['grinning face'], a: '1' }] },
};

describe('composition owns primitive presence', () => {
  it('does not insert panel, reactions, search, preview or skin tone', () => {
    const { container } = render(
      <Root emojiData={data}>
        <div>Consumer content</div>
      </Root>,
    );
    expect(container.querySelector('[data-epr-part="root"]')?.textContent).toBe(
      'Consumer content',
    );
    for (const part of [
      'panel',
      'reactions',
      'search',
      'preview',
      'skin-tone',
    ]) {
      expect(container.querySelector(`[data-epr-part="${part}"]`)).toBeNull();
    }
  });

  it('ignores stale composition switches without hiding mounted parts or leaking DOM props', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const stale = {
        open: false,
        searchDisabled: true,
        skinTonesDisabled: true,
        skinTonePickerLocation: SkinTonePickerLocation.NONE,
        composition: 'managed',
        panelProps: { id: 'unwanted-panel' },
        previewConfig: { showPreview: false },
      } as unknown as RootProps;
      const { container } = render(
        <Root {...stale} emojiData={data}>
          <Search>
            <SkinTone />
          </Search>
          <Preview />
        </Root>,
      );
      for (const part of [
        'root',
        'search',
        'search-input',
        'skin-tone',
        'preview',
      ]) {
        expect(
          container.querySelector(`[data-epr-part="${part}"]`),
        ).not.toBeNull();
      }
      const root = container.querySelector('[data-epr-part="root"]')!;
      for (const name of [
        'open',
        'searchdisabled',
        'skintonesdisabled',
        'skintonepickerlocation',
        'composition',
        'panelprops',
      ]) {
        expect(root.hasAttribute(name)).toBe(false);
      }
      expect(container.querySelector('[data-epr-part="panel"]')).toBeNull();
      expect(warning).toHaveBeenCalledWith(
        expect.stringContaining('Root ignores composition props'),
      );
    } finally {
      warning.mockRestore();
    }
  });

  it('standalone SearchInput also ignores a stale searchDisabled switch', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const stale = { searchDisabled: true } as unknown as RootProps;
      const { container } = render(
        <Root {...stale} emojiData={data}>
          <SearchInput />
        </Root>,
      );
      expect(container.querySelector('input')).not.toBeNull();
    } finally {
      warning.mockRestore();
    }
  });

  it('the default picker keeps legacy visibility and tone placement fallback', () => {
    const { container, rerender } = render(
      <EmojiPicker
        emojiData={data}
        searchDisabled
        previewConfig={{ showPreview: true }}
      />,
    );
    expect(
      container.querySelector('[data-epr-part="search-input"]'),
    ).toBeNull();
    expect(
      container.querySelector(
        '[data-epr-part="preview"] [data-epr-part="skin-tone"]',
      ),
    ).not.toBeNull();
    rerender(
      <EmojiPicker
        emojiData={data}
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
      />,
    );
    expect(
      container.querySelector('[data-epr-part="search-input"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-epr-part="preview"]')).toBeNull();
    expect(container.querySelector('[data-epr-part="skin-tone"]')).toBeNull();
    rerender(<EmojiPicker emojiData={data} open={false} />);
    expect(container.querySelector('[data-epr-part="root"]')).toBeNull();
  });
});

it('invalidates pending navigation when custom groups reorder without a dataset or geometry change', () => {
  let registry: NavigationRegistry | undefined;
  function Probe() {
    registry = useNavigationRegistry();
    return null;
  }
  const customs = [
    { id: 'a', names: ['a'], imgUrl: '/a.png', group: 'alpha' },
    { id: 'b', names: ['b'], imgUrl: '/b.png', group: 'beta' },
  ];
  const alpha = { category: Categories.CUSTOM, name: 'Alpha', group: 'alpha' };
  const beta = { category: Categories.CUSTOM, name: 'Beta', group: 'beta' };
  const { rerender } = render(
    <Root emojiData={data} customEmojis={customs} categories={[alpha, beta]}>
      <Probe />
    </Root>,
  );
  const token = registry!.currentGeneration();
  rerender(
    <Root emojiData={data} customEmojis={customs} categories={[beta, alpha]}>
      <Probe />
    </Root>,
  );
  expect(registry!.isCurrent(token)).toBe(false);
  const current = registry!.currentGeneration();
  // Fresh config objects with unchanged identities must not cancel navigation.
  rerender(
    <Root
      emojiData={data}
      customEmojis={customs}
      categories={[{ ...beta }, { ...alpha }]}
    >
      <Probe />
    </Root>,
  );
  expect(registry!.isCurrent(current)).toBe(true);
});
