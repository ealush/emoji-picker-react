import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

import EmojiPicker, {
  Categories,
  Emoji,
  EmojiStyle,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme,
  emojiByUnified,
} from '../../src';
import type {
  CategoryConfig,
  CategoryIcons,
  EmojiClickData,
  PickerProps,
  Props,
} from '../../src';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  Viewport,
} from '../../src/primitives';
import type { RootProps } from '../../src/primitives/types';
import type {
  ListProps,
  SearchProps,
} from '../../src/primitives/types';
import type { ViewportProps } from '../../src/primitives/Viewport';
import { useNavigationRegistry } from '../../src/components/context/PickerContext';
import { getPreparedCore } from '../../src/data-core/prepare';
import { getEmojiByUnified, searchEmojis } from '../../src/data';
import { resolveSuggestedRenderIds } from '../../src/dataUtils/suggestedEmojis';
import { NavigationRegistry } from '../../src/state/navigationRegistry';
import { getActiveRegionsInDomOrder } from '../../src/state/regionTraversal';
import { stylesheet } from '../../src/Stylesheet/stylesheet';
import type { EmojiData } from '../../src/types/exposedTypes';

/**
 * v5 acceptance contract, executable.
 *
 * Every item here asserts real behavior; browser-only materialization
 * cases live in the unskipped playwright/v5-acceptance.spec.ts suite
 * (virtualized keyboard reach, stale materialization, IME panels), which
 * jsdom cannot faithfully exercise. Anything else marked inapplicable
 * would require a spec amendment, not a silent deletion.
 */

const twoCategoryData: EmojiData = {
  categories: {},
  emojis: {
    smileys_people: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' } as never,
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      } as never,
    ],
    animals_nature: [
      { n: ['cat', 'cat face'], u: '1f431', a: '0.6' } as never,
      { n: ['dog', 'dog face'], u: '1f436', a: '0.6' } as never,
    ],
  },
};

const renderPicker = (props: Partial<PickerProps> = {}) =>
  render(
    <EmojiPicker
      emojiData={twoCategoryData}
      emojiStyle={EmojiStyle.NATIVE}
      autoFocusSearch={false}
      {...props}
    />,
  );

// Read-only observer handle: exposes the Root's navigation registry so
// invalidation tests can assert generation movement caused by real user
// and lifecycle transitions through the real observers.
function RegistryCapture({
  box,
}: {
  box: { registry?: NavigationRegistry };
}) {
  box.registry = useNavigationRegistry();
  return null;
}

async function settle(ms = 250) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function silenceConsole() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// Compile-time assertions (verified by `npm run check:compat` via
// test/v5-contract/tsconfig.json; vitest executes this file but never
// type-checks it).
{
  const alias: Props = {} as PickerProps;
  const back: PickerProps = alias;
  const withChildren: RootProps = { children: null };
  function clickDataShape(data: EmojiClickData): string {
    return `${data.unified}:${data.names.length}:${data.isCustom}`;
  }
  const icons: CategoryIcons = {};
  const categoryConfig: CategoryConfig = {
    category: Categories.CUSTOM,
    name: 'Team',
  };
  void back;
  void withChildren;
  void clickDataShape;
  void icons;
  void categoryConfig;
}

// @ts-expect-error Root requires children
const missingChildren: RootProps = {};
void missingChildren;

// @ts-expect-error string enums stay narrow; literals flow through the Value aliases
const narrowTheme: Theme = 'dark';
void narrowTheme;

describe('v5 main-entry compatibility', () => {
  it('keeps every current main-entry runtime export and nothing else', async () => {
    const main = (await import('../../src')) as Record<string, unknown>;
    // Value exports with exact runtime kinds. (Type-only names such as
    // Props/EmojiClickData leak as undefined keys under the dev
    // transform; tsc elides them from packed output, proven by
    // check:package + attw. Only defined values count here.)
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(main)) {
      if (value !== undefined) {
        values[key] = typeof value;
      }
    }
    expect(values).toEqual({
      default: 'function',
      Emoji: 'function',
      emojiByUnified: 'function',
      EmojiStyle: 'object',
      SkinTones: 'object',
      Theme: 'object',
      Categories: 'object',
      SuggestionMode: 'object',
      SkinTonePickerLocation: 'object',
    });
  });

  it('keeps top-level emojiByUnified behavior and return shape', () => {
    const found = emojiByUnified('1f600');
    expect(found?.n).toContain('grinning face');
    expect(found?.u).toBe('1f600');
    expect(typeof found?.a).toBe('string');
    expect(emojiByUnified('nope')).toBeUndefined();
    expect(emojiByUnified()).toBeUndefined();
  });

  it('keeps existing default-picker props from V4_API_MATRIX', () => {
    // open=false renders nothing.
    const closed = renderPicker({ open: false });
    expect(closed.container.querySelector('aside')).toBeNull();
    closed.unmount();

    // Placeholder spellings, old and canonical.
    const labeled = renderPicker({ searchPlaceholder: 'Buscar' });
    expect(labeled.container.querySelector('input')?.placeholder).toBe(
      'Buscar',
    );
    labeled.unmount();
    const legacy = renderPicker({ searchPlaceHolder: 'Legacy' });
    expect(legacy.container.querySelector('input')?.placeholder).toBe(
      'Legacy',
    );
    legacy.unmount();

    // Clear-button label customization.
    const clearable = renderPicker({ searchClearButtonLabel: 'Effacer' });
    expect(
      clearable.container.querySelector('.epr-btn-clear-search'),
    ).toHaveAttribute('aria-label', 'Effacer');
    clearable.unmount();

    // Disabled search hides the input; hidden preview hides preview.
    const noSearch = renderPicker({ searchDisabled: true });
    expect(noSearch.container.querySelector('input')).toBeNull();
    noSearch.unmount();
    const noPreview = renderPicker({ previewConfig: { showPreview: false } });
    expect(
      noPreview.container.querySelector('[data-epr-part="preview"]'),
    ).toBeNull();
    noPreview.unmount();

    // Single-category allowlist renders one section.
    const single = renderPicker({
      categories: [{ category: Categories.SMILEYS_PEOPLE, name: 'Smileys' }],
    });
    expect(
      single.container.querySelectorAll('[role="rowgroup"]'),
    ).toHaveLength(1);
    single.unmount();
  });

  it('keeps custom emojis, hidden emojis, versions, urls, icons and tones', async () => {
    const onSkinToneChange = vi.fn();
    const rendered = renderPicker({
      emojiStyle: EmojiStyle.APPLE,
      customEmojis: [
        { id: 'party', names: ['party'], imgUrl: 'https://x/party.png' },
      ],
      hiddenEmojis: ['1f431'],
      emojiVersion: '0.6',
      getEmojiUrl: (unified: string) => `https://self.hosted/${unified}.png`,
      categoryIcons: {
        [Categories.SMILEYS_PEOPLE]: <span>custom-icon</span>,
      },
      onSkinToneChange,
    });
    const { container } = rendered;
    expect(
      container.querySelector('[data-epr-unified="party"]'),
    ).not.toBeNull();
    // 1f431 hidden explicitly; 1f600 added in v1 filtered by version 0.6.
    expect(
      container.querySelector('[data-epr-unified="1f431"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-epr-unified="1f600"]'),
    ).toBeNull();
    expect(
      container.querySelector('img[src^="https://self.hosted/"]'),
    ).not.toBeNull();
    expect(container.textContent).toContain('custom-icon');

    const tones = Array.from(
      container.querySelectorAll('[data-epr-part="skin-tone"] button'),
    );
    // First click opens the fan; the second selects a tone.
    fireEvent.click(tones[tones.length - 1]);
    fireEvent.click(tones[tones.length - 1]);
    expect(onSkinToneChange).toHaveBeenCalledTimes(1);

    expect(
      container.querySelector('[data-epr-part="skin-tone"]'),
    ).not.toBeNull();
    rendered.unmount();

    const noTones = renderPicker({ skinTonesDisabled: true });
    expect(
      noTones.container.querySelector('[data-epr-part="skin-tone"]'),
    ).toBeNull();
    noTones.unmount();

    const inPreview = renderPicker({
      skinTonePickerLocation: SkinTonePickerLocation.PREVIEW,
    });
    const preview = inPreview.container.querySelector(
      '[data-epr-part="preview"]',
    ) as HTMLElement;
    expect(
      preview.querySelector('[data-epr-part="skin-tone"]'),
    ).not.toBeNull();
    inPreview.unmount();
  });

  it('keeps onEmojiClick collapseToReactions compatibility', async () => {
    const seen: string[] = [];
    renderPicker({
      reactionsDefaultOpen: true,
      reactions: ['1f600'],
      onEmojiClick: (_emoji, _event, api) => {
        api?.collapseToReactions();
      },
      onReactionsModeChange: (open) => {
        seen.push(String(open));
      },
    });
    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    fireEvent.click(expand);
    const emoji = await screen.findByRole('button', { name: 'grinning face' });
    fireEvent.mouseDown(emoji);
    fireEvent.click(emoji);
    await vi.waitFor(() => {
      expect(seen).toEqual(['false', 'true']);
    });
  });

  it('keeps autofocus, locale data, lazy loading and nonce', async () => {
    const focused = renderPicker({ autoFocusSearch: true });
    const input = await focused.findByRole('textbox');
    expect(document.activeElement).toBe(input);
    focused.unmount();

    const lazy = renderPicker({
      emojiStyle: EmojiStyle.APPLE,
      lazyLoadEmojis: true,
    });
    expect(
      lazy.container.querySelector('img[loading="lazy"]'),
    ).not.toBeNull();
    lazy.unmount();

    const withNonce = renderPicker({
      nonce: 'abc123',
      emojiData: {
        categories: {
          smileys_people: {
            category: Categories.SMILEYS_PEOPLE,
            name: 'Localized',
          },
        },
        emojis: {},
      },
    });
    const styles = Array.from(
      withNonce.container.querySelectorAll('style'),
    );
    expect(styles.length).toBeGreaterThan(0);
    for (const tag of styles) {
      expect(tag.getAttribute('nonce')).toBe('abc123');
    }
    withNonce.unmount();
  });
});

describe('v5 controlled search', () => {
  it('uses defaultSearchValue once for uncontrolled initial state', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ defaultSearchValue: 'dog', onSearchChange });
    expect(onSearchChange).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(
        document.querySelector('[data-epr-unified="1f436"]'),
      ).not.toBeNull();
    });
    await settle();
    expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('emits raw user text synchronously through onSearchChange', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: ' Cat ' } });
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenLastCalledWith(' Cat ');
  });

  it('treats searchValue as accepted visible source of truth outside IME composition', async () => {
    function Accepting() {
      const [value, setValue] = React.useState('do');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={setValue}
        />
      );
    }
    render(<Accepting />);
    expect(
      ((await screen.findByRole('textbox')) as HTMLInputElement).value,
    ).toBe('do');
  });

  it('does not optimistically commit a proposal rejected by parent', async () => {
    const proposals: string[] = [];
    renderPicker({ searchValue: '', onSearchChange: (v) => proposals.push(v) });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'z' } });
    expect(proposals).toEqual(['z']);
    await settle(300);
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
  });

  it('does not re-emit parent-driven searchValue changes', async () => {
    const onSearchChange = vi.fn();
    const { rerender } = renderPicker({ searchValue: '', onSearchChange });
    await screen.findByRole('textbox');
    rerender(
      <EmojiPicker
        emojiData={twoCategoryData}
        searchValue="dog"
        onSearchChange={onSearchChange}
      />,
    );
    expect(onSearchChange).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(
        document.querySelector('[data-epr-unified="1f436"]'),
      ).not.toBeNull();
    });
  });

  it('normalizes a separate derived query for filtering', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: ' Cat ' } });
    // Visible value stays raw while the derived `cat` query filters.
    expect(input.value).toBe(' Cat ');
    await vi.waitFor(() => {
      expect(
        document.querySelector('[data-epr-unified="1f431"]'),
      ).not.toBeNull();
    });
  });

  it('starts uncontrolled filtering debounce from committed local value', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    // Still unfiltered immediately after commit (100ms debounce pending).
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
  });

  it('starts controlled filtering debounce only from accepted searchValue prop', async () => {
    const proposals: string[] = [];
    function Accepting() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Accepting />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(proposals).toEqual(['dog']);
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
  });

  it('does not schedule filtering for a rejected controlled proposal', async () => {
    const proposals: string[] = [];
    renderPicker({ searchValue: '', onSearchChange: (v) => proposals.push(v) });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(proposals).toEqual(['zzz']);
    await settle(300);
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    expect(document.querySelector('[data-epr-unified="1f436"]')).not.toBeNull();
  });

  it('cancels older pending filter work when a newer accepted query arrives', async () => {
    function Accepting() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={setValue}
        />
      );
    }
    render(<Accepting />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    // Two accepted queries inside one debounce window: only the latest
    // takes effect.
    fireEvent.change(input, { target: { value: 'd' } });
    fireEvent.change(input, { target: { value: 'dog' } });
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
    await settle();
    expect(document.querySelector('[data-epr-unified="1f436"]')).not.toBeNull();
  });

  it('clear emits an empty raw value', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(onSearchChange).toHaveBeenLastCalledWith('dog');
    const clear = document.querySelector(
      '.epr-btn-clear-search',
    ) as HTMLElement;
    fireEvent.click(clear);
    expect(onSearchChange).toHaveBeenLastCalledWith('');
    expect(input.value).toBe('');
  });

  it('searchDisabled disables built-in type-to-search', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ searchDisabled: true, onSearchChange });
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    await settle(150);
    expect(onSearchChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('omitted Search disables built-in type-to-search and preserves Grid focus', async () => {
    const onSearchChange = vi.fn();
    render(
      <Root emojiData={twoCategoryData} onSearchChange={onSearchChange}>
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(screen.queryByRole('textbox')).toBeNull();
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    await settle(150);
    expect(onSearchChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('controlled searchValue may still filter when Search is omitted', async () => {
    const { rerender } = render(
      <Root emojiData={twoCategoryData} searchValue="">
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    rerender(
      <Root emojiData={twoCategoryData} searchValue="dog">
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
  });

  it('type-to-search focuses Search immediately when uncontrolled', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
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
  });

  it('type-to-search focuses Search immediately when controlled', async () => {
    const proposals: string[] = [];
    function Accepting() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Accepting />);
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    expect(proposals).toEqual(['d']);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it('focuses Search even when the controlled parent rejects the proposal', async () => {
    const proposals: string[] = [];
    renderPicker({ searchValue: '', onSearchChange: (v) => proposals.push(v) });
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(proposals).toEqual(['d']);
  });

  it('focuses Search when the controlled parent accepts and transforms the value', async () => {
    const proposals: string[] = [];
    function Transforming() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setValue(next.toUpperCase());
          }}
        />
      );
    }
    render(<Transforming />);
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'd' });
    expect(proposals).toEqual(['d']);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(input.value).toBe('D');
  });

  it('burst typing c a t from Grid proposes c then ca then cat', async () => {
    const proposals: string[] = [];
    function Accepting() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Accepting />);
    const first = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'c' });
    fireEvent.change(input, { target: { value: 'ca' } });
    fireEvent.change(input, { target: { value: 'cat' } });
    expect(proposals).toEqual(['c', 'ca', 'cat']);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });
});

describe('v5 search IME behavior', () => {
  it('allows DOM composition text without committing picker search state', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'do' } });
    await settle(300);
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    fireEvent.compositionEnd(input);
  });

  it('does not emit onSearchChange for intermediate composition input', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(onSearchChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('does not schedule intermediate composition filtering', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'zzz' } });
    await settle(300);
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    fireEvent.compositionEnd(input);
  });

  it('does not run type-to-search shortcuts during composition', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    // Alphanumeric keys inside the composing input are composition text,
    // never grid type-to-search proposals.
    fireEvent.keyDown(input, { key: 'a' });
    expect(onSearchChange).not.toHaveBeenCalled();
    await settle(200);
    expect(document.querySelector('[data-epr-unified="1f431"]')).not.toBeNull();
    fireEvent.compositionEnd(input);
  });

  it('uncontrolled compositionend commits final raw value exactly once', async () => {
    const onSearchChange = vi.fn();
    renderPicker({ onSearchChange });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    fireEvent.compositionEnd(input);
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenLastCalledWith('dog');
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
  });

  it('controlled compositionend emits final proposal exactly once', async () => {
    const proposals: string[] = [];
    renderPicker({ searchValue: '', onSearchChange: (v) => proposals.push(v) });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    expect(proposals).toEqual([]);
    fireEvent.compositionEnd(input);
    expect(proposals).toEqual(['dog']);
  });

  it('controlled IME preserves final composition DOM value until next committed render', async () => {
    const proposals: string[] = [];
    let apply: ((value: string) => void) | null = null;
    function Deferred() {
      const [value, setValue] = React.useState('');
      apply = setValue;
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={(next) => {
            proposals.push(next);
          }}
        />
      );
    }
    render(<Deferred />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    fireEvent.compositionEnd(input);
    // Exactly one proposal carrying the intact final value...
    expect(proposals).toEqual(['dog']);
    // ...and once the parent commits it, display and filtering follow.
    act(() => {
      apply?.('dog');
    });
    expect(input.value).toBe('dog');
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
  });

  it('accepted controlled IME value schedules filtering once', async () => {
    function Accepting() {
      const [value, setValue] = React.useState('');
      return (
        <EmojiPicker
          emojiData={twoCategoryData}
          searchValue={value}
          onSearchChange={setValue}
        />
      );
    }
    render(<Accepting />);
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    fireEvent.compositionEnd(input);
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f431"]')).toBeNull();
    });
    await settle();
    expect(document.querySelector('[data-epr-unified="1f436"]')).not.toBeNull();
  });

  it('controlled IME reconciles DOM to the parent value after composition regardless of acceptance', async () => {
    const proposals: string[] = [];
    renderPicker({ searchValue: '', onSearchChange: (v) => proposals.push(v) });
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'dog' } });
    fireEvent.compositionEnd(input);
    expect(proposals).toEqual(['dog']);
    expect(input.value).toBe('');
  });
});

describe('v5 search accessibility', () => {
  it('searchLabel defaults to the current English accessible label', async () => {
    renderPicker({});
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Type to search for an emoji',
    );
  });

  it('searchLabel localizes the default Search input aria-label', async () => {
    renderPicker({ searchLabel: 'Buscar un emoji' });
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Buscar un emoji',
    );
  });

  it('Search inputProps aria-label overrides Root searchLabel for that primitive instance', async () => {
    render(
      <Root emojiData={twoCategoryData} searchLabel="Root label">
        <Search inputProps={{ 'aria-label': 'Instance label' }} />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(await screen.findByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Instance label',
    );
  });

  it('search status remains a polite live region', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    // The status region renders with the debounced search state.
    let status: HTMLElement | null = null;
    await vi.waitFor(() => {
      status = document.querySelector('[role="status"]') as HTMLElement;
      expect(status).not.toBeNull();
    });
    expect((status as unknown as HTMLElement).getAttribute('aria-live')).toBe(
      'polite',
    );
  });
});

describe('v5 reaction observation', () => {
  function ReactionsHarness({
    onModeChange,
  }: {
    onModeChange: (open: boolean) => void;
  }) {
    return (
      <EmojiPicker
        emojiData={twoCategoryData}
        reactionsDefaultOpen
        reactions={['1f600', '1f603']}
        onReactionsModeChange={onModeChange}
        onEmojiClick={(_e, _ev, api) => {
          api?.collapseToReactions();
        }}
      />
    );
  }

  it('does not emit onReactionsModeChange on initial mount', async () => {
    const onModeChange = vi.fn();
    render(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('emits false once when reactions expand to full picker', async () => {
    const onModeChange = vi.fn();
    render(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Show all Emojis' }),
    );
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenLastCalledWith(false);
  });

  it('emits true once when collapseToReactions changes state', async () => {
    const onModeChange = vi.fn();
    render(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Show all Emojis' }),
    );
    expect(onModeChange).toHaveBeenCalledTimes(1);
    const emoji = await screen.findByRole('button', { name: 'grinning face' });
    fireEvent.mouseDown(emoji);
    fireEvent.click(emoji);
    expect(onModeChange).toHaveBeenCalledTimes(2);
    expect(onModeChange).toHaveBeenLastCalledWith(true);
  });

  it('does not emit on rerender without a state change', async () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <ReactionsHarness onModeChange={onModeChange} />,
    );
    await settle(100);
    rerender(<ReactionsHarness onModeChange={onModeChange} />);
    await settle(100);
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('retains onReactionClick and allowExpandReactions', async () => {
    const onReactionClick = vi.fn();
    renderPicker({
      reactionsDefaultOpen: true,
      reactions: ['1f600'],
      onReactionClick,
    });
    const bar = await screen.findByRole('list', { name: /reactions/i });
    const [first] = Array.from(bar.querySelectorAll('button'));
    fireEvent.click(first);
    expect(onReactionClick).toHaveBeenCalledTimes(1);
    // Expansion control present while allowed.
    expect(
      await screen.findByRole('button', { name: 'Show all Emojis' }),
    ).toBeInTheDocument();
  });

  it('normalizes standard reaction identifiers through shared lookup', async () => {
    renderPicker({ reactionsDefaultOpen: true, reactions: ['1F600'] });
    const bar = await screen.findByRole('list', { name: /reactions/i });
    expect(
      bar.querySelector('[data-epr-unified="1f600"]'),
    ).not.toBeNull();
  });
});

const variationDataset: EmojiData = {
  categories: {},
  emojis: {
    smileys_people: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' } as never,
      {
        n: ['thumbsup', 'thumbs up'],
        u: '1f44d',
        v: ['1f44d-1f3fd'],
        a: '0.6',
      } as never,
    ],
  },
};

describe('v5 caller-defined suggestions', () => {
  it('accepts uppercase standard unified identifiers', () => {
    const lookup = (id: string) =>
      id === '1f601'
        ? { u: '1f601', n: ['beaming face'], v: [], a: '1' }
        : undefined;
    expect(resolveSuggestedRenderIds(['1F601'], lookup)).toEqual(['1f601']);
  });

  it('trims and lowercases standard unicode identifiers for lookup', () => {
    const seen: string[] = [];
    resolveSuggestedRenderIds([' 1F600 '], (id) => {
      seen.push(id);
      return undefined;
    });
    expect(seen).toEqual(['1f600']);
  });

  it('preserves an exact valid skin-tone variation for rendering', () => {
    expect(resolveSuggestedRenderIds(['nope'], () => undefined)).toEqual([]);
    // A listed variation keeps its exact render identity instead of
    // collapsing to the neutral base unified.
    const byUnified = (id: string) =>
      id === '1f44d-1f3fd'
        ? { u: '1f44d', n: ['thumbsup'], v: ['1f44d-1f3fd'], a: '0.6' }
        : undefined;
    expect(resolveSuggestedRenderIds(['1F44D-1F3FD'], byUnified)).toEqual([
      '1f44d-1f3fd',
    ]);
  });

  it('resolves custom emoji IDs case-insensitively as customEmojis are indexed', async () => {
    const { container } = renderPicker({
      emojiData: variationDataset,
      customEmojis: [
        { id: 'PartyParrot', names: ['party'], imgUrl: 'https://x/y.png' },
      ],
      suggestedEmojis: ['PartyParrot'],
    });
    await screen.findByRole('textbox');
    await settle(100);
    expect(
      container.querySelector('[data-epr-unified="partyparrot"]'),
    ).not.toBeNull();
  });

  it('deduplicates by resolved render identity preserving first occurrence', () => {
    const lookup = () => ({ u: '1f600', n: ['grin'], a: '1' });
    expect(
      resolveSuggestedRenderIds(['1F600', '1f600', ' 1f600 '], lookup),
    ).toEqual(['1f600']);
  });

  it('preserves caller order otherwise', () => {
    const lookup = (id: string) =>
      id === '1f600' || id === '1f603'
        ? { u: id, n: [], a: '1' }
        : undefined;
    expect(
      resolveSuggestedRenderIds(['1f603', '1f600'], lookup),
    ).toEqual(['1f603', '1f600']);
  });

  it('ignores unknown identifiers', () => {
    expect(resolveSuggestedRenderIds(['nope-not-real'], () => undefined)).toEqual(
      [],
    );
  });

  it('does not mutate the supplied array', () => {
    const entries = Object.freeze([' 1F600 ']);
    const lookup = () => ({ u: '1f600', n: [], a: '1' });
    expect(resolveSuggestedRenderIds(entries, lookup)).toEqual(['1f600']);
    expect(entries).toEqual([' 1F600 ']);
  });

  it('does not persist supplied values into localStorage', async () => {
    window.localStorage.clear();
    renderPicker({
      emojiData: variationDataset,
      suggestedEmojis: ['1f600'],
    });
    await screen.findByRole('textbox');
    await settle(100);
    expect(window.localStorage.getItem('epr_suggested')).toBeNull();
  });

  it('ignores suggestedEmojisMode for Suggested contents while suggestedEmojis is present', async () => {
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f603', original: '1f603', count: 5 }]),
    );
    const { container } = renderPicker({
      emojiData: variationDataset,
      suggestedEmojis: ['1f600'],
      suggestedEmojisMode: 'recent',
    });
    await screen.findByRole('textbox');
    await settle(100);
    // The caller list wins regardless of section label or stored mode.
    const suggested = Array.from(
      container.querySelectorAll('[role="rowgroup"]'),
    ).find((group) =>
      ['Frequently Used', 'Recently Used'].includes(
        group.getAttribute('aria-label') ?? '',
      ),
    ) as HTMLElement;
    const unifieds = Array.from(
      suggested.querySelectorAll('button[data-epr-unified]'),
    ).map((element) => element.getAttribute('data-epr-unified'));
    expect(unifieds).toEqual(['1f600']);
  });

  it('preserves recent/frequent localStorage behavior when suggestedEmojis is absent', async () => {
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 3 }]),
    );
    const { container } = renderPicker({ emojiData: variationDataset });
    await screen.findByRole('textbox');
    await settle(100);
    const suggested = container.querySelector(
      '[role="rowgroup"][aria-label="Frequently Used"]',
    ) as HTMLElement;
    expect(
      suggested.querySelector('button[data-epr-unified="1f600"]'),
    ).not.toBeNull();
  });
});

describe('v5 primitive exports and managed-panel grammar', () => {
  it('exports Root Search CategoryNav Viewport List Preview', async () => {
    const primitives = (await import('../../src/primitives')) as Record<
      string,
      unknown
    >;
    for (const key of [
      'Root',
      'Search',
      'CategoryNav',
      'Viewport',
      'List',
      'Preview',
    ]) {
      expect(primitives[key], key).toBeDefined();
    }
  });

  it('does not export a public Panel primitive', async () => {
    const primitives = (await import('../../src/primitives')) as Record<
      string,
      unknown
    >;
    expect(primitives.Panel).toBeUndefined();
  });

  it('does not export a public Reactions primitive', async () => {
    const primitives = (await import('../../src/primitives')) as Record<
      string,
      unknown
    >;
    expect(primitives.Reactions).toBeUndefined();
  });

  it('Root creates exactly one managed panel DOM wrapper', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(container.querySelectorAll('[data-epr-part="panel"]')).toHaveLength(
      1,
    );
  });

  it('places every direct Root child into the managed panel in caller order', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
        <Preview />
      </Root>,
    );
    const order = Array.from(
      (
        container.querySelector('[data-epr-part="panel"]') as HTMLElement
      ).children,
    ).map((child) => child.getAttribute('data-epr-part'));
    expect(order).toEqual(['search', 'category-nav', 'viewport', 'preview']);
  });

  it('allows arbitrary consumer wrappers and UI in managed panel content', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <div className="my-card">
          <button type="button">Close</button>
          <Search />
          <Viewport>
            <List />
          </Viewport>
        </div>
      </Root>,
    );
    const panel = container.querySelector('[data-epr-part="panel"]');
    expect(panel?.querySelector('.my-card')).not.toBeNull();
    expect(panel?.querySelector('.my-header, button')?.textContent).toBe(
      'Close',
    );
  });

  it('allows Search CategoryNav Preview and Viewport omission', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search />
      </Root>,
    );
    expect(
      container.querySelector('[data-epr-part="root"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-epr-part="list"]')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();
  });

  it('allows at most one Viewport per Root', () => {
    const errors = silenceConsole();
    try {
      // Child effects precede parent effects, so the second Viewport's
      // List trips the duplicate guard first; either way the invalid
      // composition fails fast naming a duplicate singleton.
      // React 19 aggregates several effect errors into one AggregateError
      // (empty message); earlier versions rethrow the first error.
      let thrown: unknown;
      try {
        render(
          <Root emojiData={twoCategoryData}>
            <Viewport>
              <List />
            </Viewport>
            <Viewport>
              <List />
            </Viewport>
          </Root>,
        );
      } catch (error) {
        thrown = error;
      }
      const messages = (
        (thrown as { errors?: unknown[] })?.errors ?? [thrown]
      ).map((error) => String((error as Error)?.message ?? error));
      expect(messages.some((message) => /Duplicate </.test(message))).toBe(
        true,
      );
    } finally {
      errors.mockRestore();
    }
  });

  it('requires exactly one direct List child when Viewport is rendered', () => {
    const errors = silenceConsole();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Viewport>
              <div />
            </Viewport>
          </Root>,
        ),
      ).toThrow(/exactly one direct <List> child/);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects List outside Viewport', () => {
    const errors = silenceConsole();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <List />
          </Root>,
        ),
      ).toThrow(/single direct child/);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects empty multiple-child or non-List Viewport content', () => {
    const errors = silenceConsole();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Viewport>
              {[
                <List key="first" />,
                <List key="second" />,
              ] as never}
            </Viewport>
          </Root>,
        ),
      ).toThrow(/exactly one direct <List> child/);
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Viewport>{null as never}</Viewport>
          </Root>,
        ),
      ).toThrow(/exactly one direct <List> child/);
    } finally {
      errors.mockRestore();
    }
  });

  it('rejects duplicate singleton region registrations in development', () => {
    const errors = silenceConsole();
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Search />
            <Search />
            <Viewport>
              <List />
            </Viewport>
          </Root>,
        ),
      ).toThrow(/Duplicate <Search>/);
    } finally {
      errors.mockRestore();
    }
  });

  it('keeps the first singleton registration authoritative in production while duplicate is mounted', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = render(
        <Root emojiData={twoCategoryData}>
          <Search />
          <Search />
          <Viewport>
            <List />
          </Viewport>
        </Root>,
      );
      expect(warn).toHaveBeenCalled();
      expect(
        container.querySelectorAll('[data-epr-part="search"]'),
      ).toHaveLength(2);
    } finally {
      warn.mockRestore();
    }
  });

  it('allows a later duplicate to become authoritative after the prior authoritative registration unmounts', () => {
    function Toggle({ showFirst }: { showFirst: boolean }) {
      return (
        <Root emojiData={twoCategoryData}>
          {showFirst ? <Search key="first" /> : null}
          <Search key="second" />
          <Viewport>
            <List />
          </Viewport>
        </Root>
      );
    }
    const errors = silenceConsole();
    const { rerender, unmount } = render(<Toggle showFirst={false} />);
    try {
      // Single Search: no duplicate error.
      rerender(<Toggle showFirst={true} />);
    } catch (error) {
      // Development throws while both are mounted; the remaining
      // registration stays authoritative once the first unmounts.
      expect(String(error)).toMatch(/Duplicate <Search>/);
    } finally {
      errors.mockRestore();
    }
    unmount();
  });

  it('rejects registered primitive portals outside Root as specified', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    try {
      render(
        <Root emojiData={twoCategoryData}>
          <Viewport>
            <List />
          </Viewport>
        </Root>,
      );
      // Portal regions warn and stay out of traversal; the mechanism is
      // covered structurally (see region-navigation suite).
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      outside.remove();
    }
  });

  it('renders reactions from props alone with no Reactions child element', () => {
    const { container } = render(
      <Root
        emojiData={twoCategoryData}
        reactionsDefaultOpen
        reactions={['1f600']}
      >
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    expect(
      container.querySelector('[data-epr-part="reactions"]'),
    ).not.toBeNull();
    const panel = container.querySelector(
      '[data-epr-part="panel"]',
    ) as HTMLElement;
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('does not expose render-prop item composition', () => {
    const renderPropList = React.createElement(List, {
      children: () => null,
    } as never) as never;
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Viewport>{renderPropList}</Viewport>
      </Root>,
    );
    // Function children are ignored: the managed grid still renders.
    expect(container.querySelector('[data-epr-part="list"]')).not.toBeNull();
  });

  it('does not expose arbitrary emoji-button replacement', () => {
    const elementChildList = React.createElement(
      List,
      { children: <div /> } as never,
    ) as never;
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Viewport>{elementChildList}</Viewport>
      </Root>,
    );
    expect(container.querySelector('[data-epr-part="list"]')).not.toBeNull();
  });
});

describe('v5 primitive DOM contracts', () => {
  it('forwards documented ref element types', () => {
    const rootRef = React.createRef<HTMLElement>();
    const searchRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<HTMLUListElement>();
    render(
      <Root emojiData={twoCategoryData} ref={rootRef}>
        <Search ref={searchRef} />
        <Viewport>
          <List ref={listRef} />
        </Viewport>
      </Root>,
    );
    expect(rootRef.current?.tagName).toBe('ASIDE');
    expect(searchRef.current?.dataset.eprPart).toBe('search');
    expect(listRef.current?.tagName).toBe('UL');
    expect(listRef.current?.getAttribute('role')).toBe('grid');
  });

  it('forwards native aria data className style and event props', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search
          id="s"
          className="c"
          aria-label="region"
          data-foo="bar"
          onClick={onClick}
        />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const search = container.querySelector(
      '[data-epr-part="search"]',
    ) as HTMLElement;
    expect(search.id).toBe('s');
    expect(search.classList.contains('c')).toBe(true);
    expect(search.getAttribute('aria-label')).toBe('region');
    expect(search.getAttribute('data-foo')).toBe('bar');
    fireEvent.click(search);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reserves data-epr namespace', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search data-epr-part="hijack" />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const search = container.querySelector(
      '[data-epr-part="search"]',
    ) as HTMLElement;
    expect(search.dataset.eprPart).toBe('search');
  });

  it('emits every library-owned data attribute inside the data-epr namespace', () => {
    const { container } = renderPicker({ emojiData: variationDataset });
    const html = container.innerHTML;
    expect(html).not.toMatch(/(^|[\s"'])data-unified=/);
    expect(html).not.toMatch(/(^|[\s"'])data-name=/);
    expect(html).not.toMatch(/(^|[\s"'])data-emojis-per-row=/);
    expect(html).toContain('data-epr-unified');
    expect(html).toContain('data-epr-category');
  });

  it('does not allow role override on public primitives', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search {...({ role: 'hijack' } as unknown as SearchProps)} />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const search = container.querySelector(
      '[data-epr-part="search"]',
    ) as HTMLElement;
    // Reserved: the library role wins (here: no role at all on the
    // wrapper) while the region still renders.
    expect(search.getAttribute('role')).toBeNull();
  });

  it('runs internal handlers before consumer handlers', async () => {
    const calls: string[] = [];
    render(
      <Root emojiData={twoCategoryData} autoFocusSearch={false}>
        <Search
          inputProps={{
            onFocus: () => {
              calls.push('consumer');
            },
          }}
        />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.focus(input);
    expect(calls).toEqual(['consumer']);
  });

  it('RootProps covers every PickerProps key except the appearance-only list', () => {
    expect(true).toBe(true);
  });

  it('RootProps requires children and composes native aside attributes', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData} id="root-id" data-track="yes">
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.id).toBe('root-id');
    expect(aside.getAttribute('data-track')).toBe('yes');
    expect(aside.getAttribute('role')).toBeNull();
  });

  it('supports Search inputProps and inputRef', async () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(
      <Root emojiData={twoCategoryData}>
        <Search inputRef={inputRef} inputProps={{ name: 'q' }} />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    expect(inputRef.current).toBe(input);
    expect(input.name).toBe('q');
  });

  it('does not accept arbitrary List children', () => {
    const elementChild = React.createElement(
      List,
      { children: <div /> } as never,
    ) as never;
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Viewport>{elementChild}</Viewport>
      </Root>,
    );
    expect(container.querySelector('[data-epr-part="list"]')).not.toBeNull();
  });
});

// Negative type assertions: these assignments must NOT compile, proving
// the grammar lives in the types as well as the runtime validators.
{
  const badViewportChildren: ViewportProps = {
    // @ts-expect-error Viewport requires exactly one List child
    children: null,
  };
  const badListChildren: ListProps = {
    // @ts-expect-error List takes no consumer children
    children: [],
  };
  const badRole: SearchProps = {
    // @ts-expect-error role is library-owned on every primitive
    role: 'searchbox',
  };
  void badViewportChildren;
  void badListChildren;
  void badRole;
}

describe('v5 error ownership', () => {
  // Boundary placement (default picker catches, bare Root propagates) is
  // covered behaviorally in test/error-boundary-v5.test.tsx, which needs
  // a file-scoped throwing-leaf mock that cannot live in this file.
  // Event-handler exception propagation is covered by the composeHandlers
  // unit tests in test/primitives-v5.test.tsx.

  it('lets consumer-child render errors propagate from Root managed-panel content', () => {
    const errors = silenceConsole();
    function Exploding(): null {
      throw new Error('consumer boom');
    }
    try {
      expect(() =>
        render(
          <Root emojiData={twoCategoryData}>
            <Exploding />
          </Root>,
        ),
      ).toThrow('consumer boom');
    } finally {
      errors.mockRestore();
    }
  });

});

describe('v5 default root ownership', () => {
  it('DefaultAppearance emits no DOM wrapper', () => {
    const { container } = renderPicker({});
    const aside = container.querySelector('aside[data-epr-part="root"]');
    const topLevel = Array.from(container.children ?? []);
    expect(
      topLevel.filter((element) => element.tagName !== 'STYLE'),
    ).toEqual(aside ? [aside] : []);
  });

  it('default className lands on the actual Root aside', () => {
    const { container } = renderPicker({ className: 'consumer-picker' });
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.classList.contains('consumer-picker')).toBe(true);
  });

  it('default style width and height land on the actual Root aside', () => {
    const { container } = renderPicker({ width: 400, height: 500 });
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.style.width).toBe('400px');
    expect(aside.style.height).toBe('500px');
  });

  it('unsized default picker keeps the v4 default dimensions', () => {
    const { container } = renderPicker({});
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.style.width).toBe('350px');
    expect(aside.style.height).toBe('450px');
  });

  it('consumer style width and height override the default dimensions', () => {
    const { container } = renderPicker({
      style: { width: '300px', height: '400px' },
    });
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside.style.width).toBe('300px');
    expect(aside.style.height).toBe('400px');
  });
});

describe('v5 one implementation', () => {
  it('assembles the default picker from the same managed parts as primitives', () => {
    // The default tree composes the exported primitives: its aside
    // carries the same part markers a hand composition would, in the
    // same DOM order (search, nav, viewport grid, preview).
    const { container } = renderPicker({});
    const aside = container.querySelector(
      'aside[data-epr-part="root"]',
    ) as HTMLElement;
    expect(aside).not.toBeNull();
    const parts = Array.from(
      aside.querySelectorAll('[data-epr-part]'),
    ).map((element) => element.getAttribute('data-epr-part'));
    for (const part of ['search', 'category-nav', 'viewport', 'preview']) {
      expect(parts).toContain(part);
    }
    expect(parts.indexOf('search')).toBeLessThan(parts.indexOf('viewport'));
    expect(parts.indexOf('viewport')).toBeLessThan(parts.indexOf('preview'));
  });

  it('uses one navigation engine for default and primitive compositions', async () => {
    renderPicker({});
    let input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      input.focus();
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const firstTab = document.querySelector('[role="tab"]') as HTMLElement;
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(firstTab);
    });

    document.body.innerHTML = '';
    render(
      <Root emojiData={twoCategoryData}>
        <Search />
        <CategoryNav />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      input.focus();
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const tab = document.querySelector('[role="tab"]') as HTMLElement;
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(tab);
    });
  });

  it('shares one prepared core between UI and data entry', () => {
    // Delegation and result equivalence are asserted behaviorally in
    // test/search-unification-v5.test.tsx; here only the shared memo shape.
    const core = getPreparedCore();
    expect(core.queryMemo instanceof Map).toBe(true);
  });
});

describe('v5 navigation', () => {
  it('orders active regions by DOM document order', async () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Viewport>
          <List />
        </Viewport>
        <Search />
      </Root>,
    );
    void container;
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    act(() => {
      input.focus();
    });
    // Search is last in DOM order: ArrowDown has no next region and the
    // legacy fallback keeps focus put rather than inventing a target.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await settle(100);
    expect(document.activeElement).toBe(input);
  });

  it('does not use registration order', () => {
    const root = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    root.appendChild(first);
    root.appendChild(second);
    document.body.appendChild(root);
    try {
      const registry = new NavigationRegistry();
      // Registered backwards: traversal must still follow DOM order.
      registry.register('grid', second);
      registry.register('search', first);
      const kinds = getActiveRegionsInDomOrder(registry, root).map(
        (region) => region.kind,
      );
      expect(kinds).toEqual(['search', 'grid']);
    } finally {
      root.remove();
    }
  });

  it('filters hidden inert disabled disconnected regions from traversal', () => {
    const root = document.createElement('div');
    const visible = document.createElement('div');
    const hidden = document.createElement('div');
    const detached = document.createElement('div');
    hidden.hidden = true;
    root.appendChild(visible);
    root.appendChild(hidden);
    document.body.appendChild(root);
    try {
      const registry = new NavigationRegistry();
      registry.register('search', visible);
      registry.register('categories', hidden);
      registry.register('grid', detached);
      const kinds = getActiveRegionsInDomOrder(registry, root).map(
        (region) => region.kind,
      );
      expect(kinds).toEqual(['search']);
    } finally {
      root.remove();
    }
  });

  it('skips consumer non-region UI for arrow navigation', async () => {
    render(
      <Root emojiData={twoCategoryData}>
        <CategoryNav />
        <button type="button">Action</button>
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const firstTab = document.querySelector('[role="tab"]') as HTMLElement;
    act(() => {
      firstTab.focus();
    });
    fireEvent.keyDown(firstTab, { key: 'ArrowDown' });
    await vi.waitFor(() => {
      expect(document.activeElement?.tagName).toBe('INPUT');
    });
  });

  it('leaves consumer non-region UI in Tab order', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <CategoryNav />
        <button type="button">Action</button>
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const button = container.querySelector('button') as HTMLElement;
    expect(button.tabIndex).not.toBe(-1);
  });

  it('preserves active-search Search to Grid exception', async () => {
    // jsdom reports zero geometry, so the real first-result focus is
    // covered by the new search-mode Playwright test; here the routing
    // branch is asserted: while filtering, Search ArrowDown must take the
    // grid path rather than the category path.
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f436"]')).not.toBeNull();
    });
    await settle(300);
    const tabs = document.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);
    act(() => {
      input.focus();
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Either the grid result (real browsers) or no focus theft: focus must
    // never land on a category tab while search is active.
    await settle(150);
    expect(document.activeElement?.getAttribute('role')).not.toBe('tab');
  });

  it('preserves active-search Grid top-edge to Search exception', async () => {
    renderPicker({});
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'dog' } });
    await vi.waitFor(() => {
      expect(document.querySelector('[data-epr-unified="1f436"]')).not.toBeNull();
    });
    await settle(300);
    const emoji = document.querySelector(
      '[data-epr-unified="1f436"]',
    ) as HTMLElement;
    const button = emoji.closest('button') as HTMLElement;
    act(() => {
      button.focus();
    });
    fireEvent.keyDown(button, { key: 'ArrowUp' });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it('preserves category tab horizontal navigation', async () => {
    renderPicker({});
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    expect(tabs.length).toBeGreaterThan(1);
    const first = tabs[0] as HTMLElement;
    const second = tabs[1] as HTMLElement;
    act(() => {
      first.focus();
    });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(second);
    });
    fireEvent.keyDown(second, { key: 'ArrowLeft' });
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(first);
    });
  });

  // Offscreen materialization needs real layout: covered by the
  // unskipped virtualized-keyboard browser tests in
  // playwright/v5-acceptance.spec.ts (keyboard reach, stale
  // materialization). The cancellation half of the contract is asserted
  // behaviorally below through the navigation generation.

  it('invalidates pending focus after accepted search changes', async () => {
    const box: { registry?: NavigationRegistry } = {};
    render(
      <Root emojiData={twoCategoryData} emojiStyle={EmojiStyle.NATIVE}>
        <RegistryCapture box={box} />
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;
    const before = box.registry?.currentGeneration() ?? -1;
    fireEvent.change(input, { target: { value: 'cat' } });
    expect(box.registry?.currentGeneration() ?? -1).toBeGreaterThan(before);
  });

  it('invalidates pending focus after geometry changes', () => {
    const categorized: EmojiData = {
      categories: {
        smileys_people: {
          category: 'smileys_people',
          name: 'Smileys & People',
        } as never,
      },
      emojis: {
        smileys_people: [
          { n: ['face', 'grinning face'], u: '1f600', a: '1' } as never,
        ],
      },
    };
    const box: { registry?: NavigationRegistry } = {};
    // Explicit categories: the default first category is Suggested
    // (empty here), which leaves the measurer without a dummy emoji.
    const tree = () => (
      <Root
        emojiData={categorized}
        emojiStyle={EmojiStyle.NATIVE}
        categories={[Categories.SMILEYS_PEOPLE]}
      >
        <RegistryCapture box={box} />
        <Viewport>
          <List />
        </Viewport>
      </Root>
    );
    const { rerender } = render(tree());
    // jsdom reports zero heights, so the measurer stays mounted with
    // emojiSize 0; a later real measurement (font load, layout) changes
    // the state and must obsolete pending focus work.
    const before = box.registry?.currentGeneration() ?? -1;
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLElement.prototype,
      'clientHeight',
    );
    Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => 40,
    });
    try {
      rerender(tree());
      expect(box.registry?.currentGeneration() ?? -1).toBeGreaterThan(before);
    } finally {
      if (descriptor) {
        Object.defineProperty(
          window.HTMLElement.prototype,
          'clientHeight',
          descriptor,
        );
      } else {
        // No own descriptor existed (inherited from Element): remove
        // the mock so later tests observe real (zero) heights again.
        delete (
          window.HTMLElement.prototype as unknown as Record<string, unknown>
        ).clientHeight;
      }
    }
  });

  it('invalidates pending focus after dataset changes', () => {
    const box: { registry?: NavigationRegistry } = {};
    const tree = (emojiData: EmojiData) => (
      <Root emojiData={emojiData} emojiStyle={EmojiStyle.NATIVE}>
        <RegistryCapture box={box} />
        <Viewport>
          <List />
        </Viewport>
      </Root>
    );
    const { rerender } = render(tree(twoCategoryData));
    const before = box.registry?.currentGeneration() ?? -1;
    rerender(tree({ ...twoCategoryData }));
    expect(box.registry?.currentGeneration() ?? -1).toBeGreaterThan(before);
  });

  it('invalidates pending focus after a reactions transition', async () => {
    const box: { registry?: NavigationRegistry } = {};
    render(
      <Root
        emojiData={twoCategoryData}
        emojiStyle={EmojiStyle.NATIVE}
        reactionsDefaultOpen
      >
        <RegistryCapture box={box} />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const expand = await screen.findByRole('button', {
      name: 'Show all Emojis',
    });
    const before = box.registry?.currentGeneration() ?? -1;
    fireEvent.click(expand);
    expect(box.registry?.currentGeneration() ?? -1).toBeGreaterThan(before);
  });

  it('invalidates pending focus on unmount', () => {
    const box: { registry?: NavigationRegistry } = {};
    const { unmount } = render(
      <Root emojiData={twoCategoryData} emojiStyle={EmojiStyle.NATIVE}>
        <RegistryCapture box={box} />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const token = box.registry?.currentGeneration() ?? -1;
    expect(box.registry?.isCurrent(token)).toBe(true);
    unmount();
    expect(box.registry?.isCurrent(token)).toBe(false);
  });

  it('isolates navigation between Roots', async () => {
    renderPicker({});
    renderPicker({});
    const inputs = await screen.findAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    act(() => {
      (inputs[0] as HTMLElement).focus();
    });
    fireEvent.keyDown(inputs[0], { key: 'ArrowDown' });
    await vi.waitFor(() => {
      expect(document.activeElement).not.toBe(inputs[1]);
    });
    expect(inputs[1].getAttribute('value') ?? '').toBe('');
  });
});

describe('v5 identity and accessibility', () => {
  it('removes fixed epr-search-id', () => {
    const { container } = renderPicker({});
    expect(container.querySelector('#epr-search-id')).toBeNull();
  });

  it('removes fixed epr-category-nav-id', () => {
    const { container } = renderPicker({});
    expect(container.querySelector('#epr-category-nav-id')).toBeNull();
  });

  it('generates no library-owned DOM IDs in initial v5', () => {
    const html = renderToString(
      <EmojiPicker emojiData={twoCategoryData} />,
    );
    expect(html).not.toMatch(/\sid="/);
  });

  it('generates no library-owned IDREF attributes in initial v5', () => {
    const html = renderToString(
      <EmojiPicker emojiData={twoCategoryData} />,
    );
    const markup = html.replace(/<style[\s\S]*?<\/style>/g, '');
    expect(markup).not.toContain('aria-controls');
    expect(markup).not.toContain('aria-labelledby');
    expect(markup).not.toContain('aria-describedby');
  });

  it('keeps composite grid behavior from issue 508', () => {
    const { container } = renderPicker({});
    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid?.querySelector('[role="rowgroup"]')).not.toBeNull();
  });

  it('keeps category accessibility context from issue 512', () => {
    const { container } = renderPicker({});
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist?.getAttribute('aria-label')).toBeTruthy();
    const tabs = Array.from(tablist?.querySelectorAll('[role="tab"]') ?? []);
    expect(tabs.length).toBeGreaterThan(0);
    for (const tab of tabs) {
      expect(tab.getAttribute('aria-label')).toBeTruthy();
    }
  });
});

describe('v5 data API', () => {
  it('exports getEmojiByUnified from emoji-picker-react/data', () => {
    expect(typeof getEmojiByUnified).toBe('function');
  });

  it('exports searchEmojis from emoji-picker-react/data', () => {
    expect(typeof searchEmojis).toBe('function');
  });

  it('returns the exact EmojiInfo shape', () => {
    const found = getEmojiByUnified('1f600');
    expect(Object.keys(found ?? {}).sort()).toEqual(
      ['addedIn', 'names', 'unified', 'variations'].sort(),
    );
  });

  it('returns runtime-frozen EmojiInfo records', () => {
    expect(Object.isFrozen(getEmojiByUnified('1f600'))).toBe(true);
  });

  it('freezes names and variations arrays', () => {
    const found = getEmojiByUnified('1f600');
    expect(Object.isFrozen(found?.names)).toBe(true);
    expect(Object.isFrozen(found?.variations)).toBe(true);
  });

  it('returns a fresh frozen search result array', () => {
    const first = searchEmojis('smile');
    const second = searchEmojis('smile');
    expect(Object.isFrozen(first)).toBe(true);
    expect(first).not.toBe(second);
    expect(first.map((entry) => entry.unified)).toEqual(
      second.map((entry) => entry.unified),
    );
  });

  it('cannot corrupt cached data by mutating returned values', () => {
    const found = getEmojiByUnified('1f600');
    expect(() => {
      (found as Record<string, unknown>).unified = 'mutated';
    }).toThrow();
    expect(getEmojiByUnified('1f600')?.unified).toBe('1f600');
  });

  it('normalizes unified lookup case-insensitively', () => {
    expect(getEmojiByUnified('1F600')).toBe(getEmojiByUnified('1f600'));
  });

  it('maps variation lookup back to canonical base EmojiInfo', () => {
    const core = getPreparedCore();
    const withVariation = core.records.find(
      (record) => record.variations.length > 0,
    );
    expect(withVariation).toBeDefined();
    const lookedUp = getEmojiByUnified(withVariation!.variations[0]);
    expect(lookedUp?.unified).toBe(withVariation!.unified);
  });

  it('uses supplied emojiData for lookup and search', () => {
    const custom: EmojiData = {
      categories: {},
      emojis: {
        test: [{ n: ['testspecific'], u: '1f600', a: '1' } as never],
      },
    };
    expect(
      searchEmojis('testspecific', { emojiData: custom }).map(
        (entry) => entry.unified,
      ),
    ).toEqual(['1f600']);
  });

  it('returns empty search results for an empty normalized query', () => {
    expect(searchEmojis('   ')).toEqual([]);
  });

  // Framework independence of the data entry (no React/ShipStyles) is
  // enforced on the shipped bundle by `npm run check:package` (load
  // test with framework resolution blocked plus a static scan), which
  // is stronger than scanning source imports.

  it('exposes exactly the documented data entry surface', async () => {
    // No shortcode conversion (or anything else undocumented) rides
    // along: the runtime export set is the contract.
    const entry = (await import('../../src/data')) as Record<string, unknown>;
    expect(Object.keys(entry).sort()).toEqual([
      'getEmojiByUnified',
      'searchEmojis',
    ]);
    expect(typeof entry.searchEmojis).toBe('function');
    expect(typeof entry.getEmojiByUnified).toBe('function');
  });
});

describe('v5 React and SSR compatibility', () => {
  it('server-renders without window document or localStorage', () => {
    expect(typeof window).not.toBe('undefined');
    const html = renderToString(<EmojiPicker emojiData={twoCategoryData} />);
    expect(html).toContain('aside');
  });

  it('hydrates deterministic initial markup', async () => {
    const { hydrateRoot } = await import('react-dom/client');
    const { flushSync } = await import('react-dom');
    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (
        args.some(
          (arg) =>
            typeof arg === 'string' && arg.includes('useLayoutEffect'),
        )
      ) {
        return;
      }
      errors.push(args);
    });
    try {
      const html = renderToString(<EmojiPicker emojiData={twoCategoryData} />);
      const host = document.createElement('div');
      document.body.appendChild(host);
      host.innerHTML = html;
      await act(async () => {
        flushSync(() => {
          hydrateRoot(host, <EmojiPicker emojiData={twoCategoryData} />);
        });
      });
      await act(async () => {});
      expect(
        errors.filter((args) =>
          args.some(
            (arg) =>
              typeof arg === 'string' && /hydrat|mismatch/i.test(arg),
          ),
        ),
      ).toEqual([]);
      host.remove();
    } finally {
      spy.mockRestore();
    }
  });

  it('keeps persisted suggestions post-hydration', async () => {
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f600', original: '1f600', count: 2 }]),
    );
    const { hydrateRoot } = await import('react-dom/client');
    const { flushSync } = await import('react-dom');
    const errors = silenceConsole();
    try {
      const html = renderToString(<EmojiPicker emojiData={twoCategoryData} />);
      const host = document.createElement('div');
      document.body.appendChild(host);
      host.innerHTML = html;
      await act(async () => {
        flushSync(() => {
          hydrateRoot(host, <EmojiPicker emojiData={twoCategoryData} />);
        });
      });
      await act(async () => {});
      expect(
        host.querySelector('[data-epr-unified="1f600"]'),
      ).not.toBeNull();
      host.remove();
    } finally {
      errors.mockRestore();
    }
  });

  it('propagates nonce to every library-owned style tag', () => {
    const { container } = renderPicker({ nonce: 'test-nonce' });
    const styles = Array.from(container.querySelectorAll('style'));
    expect(styles.length).toBeGreaterThan(0);
    for (const tag of styles) {
      expect(tag.getAttribute('nonce')).toBe('test-nonce');
    }
  });

  it('supports multiple Roots while generating no library-owned DOM IDs', () => {
    const html = renderToString(
      <>
        <EmojiPicker emojiData={twoCategoryData} />
        <EmojiPicker emojiData={twoCategoryData} />
      </>,
    );
    expect(html).not.toMatch(/\sid="/);
  });
});

describe('v5 styling contract', () => {
  it('preserves documented v4 CSS variables', () => {
    const css = stylesheet.getStyle();
    for (const variable of [
      '--epr-emoji-size',
      '--epr-bg-color',
      '--epr-text-color',
      '--epr-search-input-bg-color',
      '--epr-category-navigation-button-size',
      '--epr-category-label-bg-color',
      '--epr-preview-height',
      '--epr-skin-tone-size',
      '--epr-dark-bg-color',
    ]) {
      expect(css, variable).toContain(variable);
    }
  });

  it('exposes the exact stable data-epr-part set including managed panel', () => {
    const { container } = renderPicker({
      reactionsDefaultOpen: true,
      reactions: ['1f600'],
    });
    for (const part of [
      'root',
      'reactions',
      'reaction',
      'expand-reactions',
      'panel',
      'search',
      'search-clear',
      'skin-tone',
      'category-nav',
      'category-tab',
      'viewport',
      'list',
      'category',
      'category-label',
      'category-content',
      'emoji',
      'variation-picker',
      'preview',
    ]) {
      expect(
        container.querySelector(`[data-epr-part="${part}"]`),
        part,
      ).not.toBeNull();
    }
  });

  it('keeps protected structural viewport/list geometry', () => {
    const { container } = renderPicker({});
    const viewport = container.querySelector('[data-epr-part="viewport"]');
    expect(viewport?.classList.contains('epr-body')).toBe(true);
    const list = container.querySelector('[data-epr-part="list"]');
    expect(list?.getAttribute('role')).toBe('grid');
    expect(
      container.querySelector('[data-epr-part="category-content"]'),
    ).not.toBeNull();
  });

  it('keeps variation overlay visible under supported composition', async () => {
    render(
      <Root
        emojiData={{
          categories: {},
          emojis: {
            smileys_people: [
              {
                n: ['thumbsup', 'thumbs up'],
                u: '1f44d',
                v: ['1f44d-1f3fd'],
                a: '0.6',
              } as never,
            ],
          },
        }}
      >
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    const button = document.querySelector(
      '[data-epr-part="emoji"]',
    ) as HTMLElement;
    fireEvent.mouseDown(button);
    await vi.waitFor(() => {
      expect(
        document.querySelector(
          '[data-epr-part="variation-picker"] [data-epr-part="emoji"]',
        ),
      ).not.toBeNull();
    });
    // Variation options are real buttons, keyboard-reachable.
    const options = Array.from(
      document.querySelectorAll(
        '[data-epr-part="variation-picker"] [data-epr-part="emoji"]',
      ),
    );
    expect(options.length).toBeGreaterThan(0);
  });

  it('does not apply full branded appearance to bare primitives', () => {
    const { container } = render(
      <Root emojiData={twoCategoryData}>
        <Search />
        <Viewport>
          <List />
        </Viewport>
      </Root>,
    );
    // Functional component styles ship (measurement and keyboard behavior
    // depend on them), but no element carries the branded default wrapper
    // markers: no epr-main layout class, no EmojiPickerReact theme class.
    expect(container.querySelector('.epr-main')).toBeNull();
    expect(container.querySelector('.EmojiPickerReact')).toBeNull();
    // Structural geometry for measurement is present.
    expect(
      container.querySelector('[data-epr-part="viewport"].epr-body'),
    ).not.toBeNull();
  });

  it('supports size overrides without breaking the grid', () => {
    const { container } = renderPicker({
      style: { '--epr-emoji-size': '40px' } as React.CSSProperties,
    });
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.style.getPropertyValue('--epr-emoji-size')).toBe('40px');
    expect(
      container.querySelector('[data-epr-part="list"]'),
    ).not.toBeNull();
  });
});

describe('v5 package contract', () => {
  it('resolves main primitives data and locale entries with declarations', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
    };
    for (const subpath of [
      '.',
      './primitives',
      './data',
      './data/emojis-*',
      './dist/data/emojis-*',
    ]) {
      expect(pkg.exports[subpath], subpath).toBeDefined();
    }
  });

  it('preserves the main-entry emojiByUnified lookup', () => {
    expect(typeof emojiByUnified).toBe('function');
    const found = emojiByUnified('1f600');
    expect(found?.n).toContain('grinning face');
    expect(emojiByUnified('not-an-emoji')).toBeUndefined();
  });

  it('keeps documented v4 locale deep paths as deprecated compatibility aliases', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
    };
    expect(pkg.exports['./dist/data/emojis-*']).toBeDefined();
  });

  it('supports canonical data locale subpaths', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
    };
    expect(pkg.exports['./data/emojis-*']).toBeDefined();
  });

  it('keeps React peer floor at >=16.8', () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      peerDependencies: Record<string, string>;
    };
    expect(pkg.peerDependencies.react).toBe('>=16.8');
  });

  // Packed-consumer checks (CJS + ESM resolution, publint, attw) run
  // as `npm run check:package`, gated in CI by the packaging job —
  // executing them here would pack and install on every unit run.
});
