import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as Picker from '../src/primitives';
import { useNavigationRegistry } from '../src/components/context/PickerContext';
import { Categories } from '../src/config/categoryConfig';
import { EmojiData, EmojiStyle, SkinTones } from '../src/types/exposedTypes';
import { emojiRenderInfo } from '../src/components/body/listComponents';
import { NavigationRegistry } from '../src/state/navigationRegistry';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => vi.restoreAllMocks());

const data: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'People',
    },
    [Categories.SUGGESTED]: {
      category: Categories.SUGGESTED,
      name: 'Suggested',
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      {
        u: '1f44d',
        n: ['thumbs up'],
        a: '1',
        v: ['1f44d-1f3fd', '1f44d-1f3ff'],
      },
      { u: '1f600', n: ['grinning face'], a: '1' },
    ],
    [Categories.ANIMALS_NATURE]: [{ u: '1f431', n: ['cat face'], a: '1' }],
  },
};
const categories = [Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE];
const rootProps = {
  emojiData: data,
  emojiStyle: EmojiStyle.NATIVE,
  categories,
  autoFocusSearch: false,
};

function Grid() {
  return (
    <Picker.Viewport>
      <Picker.List />
    </Picker.Viewport>
  );
}

function CaptureActive({
  onActive,
}: {
  onActive: (emoji: Picker.EmojiClickData | null) => void;
}) {
  const active = Picker.useActiveEmoji();
  React.useEffect(() => onActive(active), [active, onActive]);
  return null;
}

function JumpControl({
  onRegistry,
}: {
  onRegistry: (registry: NavigationRegistry) => void;
}) {
  const registry = useNavigationRegistry();
  const { jumpToCategory } = Picker.useCategoryNavigation();
  React.useEffect(() => onRegistry(registry), [onRegistry, registry]);
  return (
    <button onClick={() => jumpToCategory(Categories.ANIMALS_NATURE)}>
      Jump
    </button>
  );
}

describe('release review keyboard regressions', () => {
  it.each(['Enter', 'ArrowDown', 'ArrowRight', 'Escape'])(
    'leaves composing %s to the IME',
    (key) => {
      const select = vi.fn();
      const search = vi.fn();
      render(
        <Picker.Root
          {...rootProps}
          onEmojiClick={select}
          onSearchChange={search}
        >
          <Picker.SearchInput />
          <Picker.CategoryNav />
          <Grid />
        </Picker.Root>,
      );
      const input = screen.getByRole('textbox');
      act(() => input.focus());
      fireEvent.compositionStart(input);
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        isComposing: true,
      });
      fireEvent(input, event);
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(input);
      expect(select).not.toHaveBeenCalled();
      expect(search).not.toHaveBeenCalled();
      // The Root's composition state also owns keys lacking the native flag.
      const unflagged = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(input, unflagged);
      expect(unflagged.defaultPrevented).toBe(false);
    },
  );

  it('leaves legacy keyCode 229 confirmation unclaimed', () => {
    const select = vi.fn();
    render(
      <Picker.Root {...rootProps} onEmojiClick={select}>
        <Picker.SearchInput />
        <Grid />
      </Picker.Root>,
    );
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 229,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByRole('textbox'), event);
    expect(event.defaultPrevented).toBe(false);
    expect(select).not.toHaveBeenCalled();
  });

  it('follows late mounting, replacement and remounting of search and categories', async () => {
    function LateParts() {
      const [stage, setStage] = React.useState(0);
      return (
        <>
          <button onClick={() => setStage(stage + 1)}>Next</button>
          {stage > 0 && stage !== 3 && (
            <Picker.SearchInput
              key={stage === 2 ? 'search-replacement' : 'search-first'}
            />
          )}
          {stage > 0 && stage !== 3 && (
            <Picker.CategoryNav
              key={stage === 2 ? 'nav-replacement' : 'nav-first'}
            />
          )}
        </>
      );
    }
    render(
      <Picker.Root {...rootProps}>
        <LateParts />
        <Grid />
      </Picker.Root>,
    );
    for (const stage of [1, 2, 3, 4]) {
      fireEvent.click(screen.getByText('Next'));
      if (stage === 3) {
        expect(screen.queryByRole('textbox')).toBeNull();
        continue;
      }
      const input = screen.getByRole('textbox');
      act(() => input.focus());
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole('tab', { name: 'People' }),
        ),
      );
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
      await waitFor(() => expect(document.activeElement).toBe(input));
    }
  });

  it('attaches grid commands when Viewport mounts after Root', async () => {
    function LateGrid() {
      const [show, setShow] = React.useState(false);
      return (
        <>
          <button onClick={() => setShow(true)}>Show</button>
          {show && <Grid />}
        </>
      );
    }
    render(
      <Picker.Root {...rootProps}>
        <LateGrid />
      </Picker.Root>,
    );
    fireEvent.click(screen.getByText('Show'));
    const first = screen.getByRole('gridcell', { name: 'thumbs up' });
    const second = screen.getByRole('gridcell', { name: 'grinning face' });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(second));
  });

  it.each([' ', 'a', 'ArrowDown'])(
    'preserves consumer controls’ %s keys in Viewport',
    (key) => {
      const search = vi.fn();
      render(
        <Picker.Root {...rootProps} onSearchChange={search}>
          <Picker.SearchInput />
          <Picker.Viewport>
            <input aria-label="Consumer" />
            <button>Consumer button</button>
            <Picker.List />
          </Picker.Viewport>
        </Picker.Root>,
      );
      for (const target of [
        screen.getByLabelText('Consumer'),
        screen.getByText('Consumer button'),
      ]) {
        act(() => target.focus());
        const event = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        });
        fireEvent(target, event);
        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(target);
      }
      expect(search).not.toHaveBeenCalled();
    },
  );
});

describe('release review identity and recovery regressions', () => {
  it('preserves explicit neutral and toned suggestions through tone changes and search', async () => {
    const props = {
      ...rootProps,
      categories: [Categories.SUGGESTED],
      suggestedEmojis: ['1f44d-1f3fd', '1f44d', 'party-1f3fd'],
      customEmojis: [
        { id: 'party-1f3fd', names: ['thumbs party'], imgUrl: 'custom.png' },
      ],
    };
    const { rerender } = render(
      <Picker.Root {...props} skinTone={SkinTones.DARK}>
        <Picker.SearchInput />
        <Grid />
      </Picker.Root>,
    );
    const ids = () =>
      Array.from(
        document.querySelectorAll(
          '[data-epr-category="suggested"] [role="gridcell"]',
        ),
      ).map((cell) => cell.getAttribute('data-epr-unified'));
    expect(ids()).toEqual(['1f44d-1f3fd', '1f44d', 'party-1f3fd']);
    rerender(
      <Picker.Root {...props} skinTone={SkinTones.MEDIUM}>
        <Picker.SearchInput />
        <Grid />
      </Picker.Root>,
    );
    expect(ids()).toEqual(['1f44d-1f3fd', '1f44d', 'party-1f3fd']);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'thumbs' },
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));
    expect(ids()).toEqual(['1f44d-1f3fd', '1f44d', 'party-1f3fd']);
  });

  it('reports the neutral variation identically for custom preview and click', async () => {
    const active = vi.fn();
    const select = vi.fn();
    render(
      <Picker.Root
        {...rootProps}
        categories={[Categories.SUGGESTED]}
        suggestedEmojis={['1f44d']}
        skinTone={SkinTones.MEDIUM}
        onEmojiClick={select}
      >
        <CaptureActive onActive={active} />
        <Grid />
      </Picker.Root>,
    );
    const neutral = screen.getByRole('gridcell', { name: 'thumbs up' });
    act(() => neutral.focus());
    await waitFor(() =>
      expect(active).toHaveBeenLastCalledWith(
        expect.objectContaining({
          unified: '1f44d',
          activeSkinTone: SkinTones.NEUTRAL,
        }),
      ),
    );
    fireEvent.click(neutral);
    expect(select.mock.calls[0][0].unified).toBe(
      active.mock.calls.at(-1)![0].unified,
    );
  });

  it('preserves mixed-tone identity in matching, preview, selection and recents', async () => {
    const mixed = '1faf1-1f3fb-200d-1faf2-1f3fd';
    const active = vi.fn();
    const select = vi.fn();
    const mixedData: EmojiData = {
      ...data,
      emojis: {
        ...data.emojis,
        [Categories.SMILEYS_PEOPLE]: [
          {
            u: '1f91d',
            n: ['handshake'],
            a: '14',
            v: ['1faf1-1f3fb-200d-1faf2-1f3fc', mixed],
          },
        ],
      },
    };
    render(
      <Picker.Root
        {...rootProps}
        emojiData={mixedData}
        categories={[Categories.SUGGESTED]}
        suggestedEmojis={[mixed]}
        skinTone={SkinTones.DARK}
        onEmojiClick={select}
      >
        <CaptureActive onActive={active} />
        <Picker.SearchInput />
        <Grid />
      </Picker.Root>,
    );
    const button = screen.getByRole('gridcell', { name: 'handshake' });
    expect(button).toHaveAttribute('data-epr-unified', mixed);
    act(() => button.focus());
    await waitFor(() =>
      expect(active).toHaveBeenLastCalledWith(
        expect.objectContaining({
          unified: mixed,
          unifiedWithoutSkinTone: '1f91d',
        }),
      ),
    );
    fireEvent.click(button);
    expect(select.mock.calls[0][0]).toMatchObject({
      unified: mixed,
      unifiedWithoutSkinTone: '1f91d',
    });
    expect(JSON.parse(localStorage.getItem('epr_suggested')!)[0]).toMatchObject(
      { unified: mixed, original: '1f91d' },
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'handshake' },
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)));
    expect(screen.getByRole('gridcell', { name: 'handshake' })).toHaveAttribute(
      'data-epr-unified',
      mixed,
    );
  });

  it('recovers failed images when the resolver or rendering mode changes', () => {
    const broken = () => 'broken.png';
    const working = () => 'working.png';
    const { rerender } = render(
      <Picker.Root
        {...rootProps}
        emojiStyle={EmojiStyle.APPLE}
        getEmojiUrl={broken}
      >
        <Grid />
      </Picker.Root>,
    );
    const firstImage = screen
      .getByRole('gridcell', { name: 'grinning face' })
      .querySelector('img')!;
    fireEvent.error(firstImage);
    expect(
      screen.queryByRole('gridcell', { name: 'grinning face' }),
    ).toBeNull();
    rerender(
      <Picker.Root
        {...rootProps}
        emojiStyle={EmojiStyle.APPLE}
        getEmojiUrl={working}
      >
        <Grid />
      </Picker.Root>,
    );
    const nextImage = screen
      .getByRole('gridcell', { name: 'grinning face' })
      .querySelector('img')!;
    expect(nextImage.getAttribute('src')).toBe('working.png');
    // An old request failing after recovery must not poison the new source.
    fireEvent.error(firstImage);
    expect(
      screen.queryByRole('gridcell', { name: 'grinning face' }),
    ).not.toBeNull();
    fireEvent.error(nextImage);
    rerender(
      <Picker.Root {...rootProps} getEmojiUrl={working}>
        <Grid />
      </Picker.Root>,
    );
    expect(
      screen.getByRole('gridcell', { name: 'grinning face' }).textContent,
    ).toBe('😀');
  });

  it('omits image metadata for a native component replacement', () => {
    const resolver = vi.fn((_unified: string, style: string) => {
      if (style === 'native') throw new Error('Unsupported native image style');
      return 'image.png';
    });
    function Cell({
      emoji,
      children: _children,
      ...props
    }: Picker.EmojiRenderProps) {
      return <button {...props}>{emoji.emoji}</button>;
    }
    render(
      <Picker.Root
        {...rootProps}
        getEmojiUrl={resolver}
        components={{ Emoji: Cell }}
      >
        <Grid />
      </Picker.Root>,
    );
    expect(
      screen.getByRole('gridcell', { name: 'grinning face' }).textContent,
    ).toBe('😀');
    expect(resolver).not.toHaveBeenCalled();
    const metadata = emojiRenderInfo(
      data.emojis[Categories.SMILEYS_PEOPLE]![0],
      '1f44d',
      EmojiStyle.NATIVE,
      resolver,
    );
    expect(resolver).not.toHaveBeenCalled();
    expect(metadata.imageUrl).toBeUndefined();
    expect(resolver).not.toHaveBeenCalled();
  });

  it.each(['registry invalidation', 'a newer jump'])(
    'cancels category scroll before its actual mutation after %s',
    (cancellation) => {
      const frames: FrameRequestCallback[] = [];
      let registry!: NavigationRegistry;
      render(
        <Picker.Root {...rootProps}>
          <JumpControl
            onRegistry={(value) => {
              registry = value;
            }}
          />
          <Grid />
        </Picker.Root>,
      );
      const body = document.querySelector<HTMLElement>(
        '[data-epr-part="viewport"]',
      )!;
      const category = document.querySelector<HTMLElement>(
        '[data-epr-category="animals_nature"]',
      )!;
      Object.defineProperty(category, 'offsetTop', { value: 300 });
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
        (callback) => {
          frames.push(callback);
          return frames.length;
        },
      );
      const scroll = vi.spyOn(body, 'scrollTop', 'set');
      fireEvent.click(screen.getByText('Jump'));
      if (cancellation === 'registry invalidation') registry.invalidate();
      else fireEvent.click(screen.getByText('Jump'));
      act(() => {
        while (frames.length) frames.shift()!(0);
      });
      expect(body.scrollTop).toBe(
        cancellation === 'registry invalidation' ? 0 : 300,
      );
      expect(scroll).toHaveBeenCalledTimes(
        cancellation === 'registry invalidation' ? 0 : 1,
      );
    },
  );
});

describe('logical navigation through virtualized rows', () => {
  const hundred: EmojiData = {
    categories: data.categories,
    emojis: {
      [Categories.SMILEYS_PEOPLE]: Array.from({ length: 100 }, (_, i) => ({
        u: (0x1f600 + i).toString(16),
        n: [`emoji ${i}`],
        a: '1',
      })),
    },
  };

  function mockGridGeometry() {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
      function () {
        const part = this.getAttribute('data-epr-part');
        if (part === 'viewport') return 80;
        if (part === 'category-content')
          return parseFloat(this.style.height) || 0;
        if (part === 'category')
          return (
            (parseFloat(
              (
                this.querySelector(
                  '[data-epr-part="category-content"]',
                ) as HTMLElement
              ).style.height,
            ) || 0) + 40
          );
        return 40;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(
      function () {
        return this.getAttribute('data-epr-part') === 'category-content'
          ? 40
          : parseFloat(this.style.top) || 0;
      },
    );
  }

  it.each([
    { key: 'ArrowDown', start: 18, destination: 24, scroll: 0 },
    { key: 'ArrowRight', start: 23, destination: 24, scroll: 0 },
    { key: 'ArrowUp', start: 42, destination: 36, scroll: 400 },
    { key: 'ArrowLeft', start: 42, destination: 41, scroll: 400 },
  ])(
    'materializes $destination for $key from $start',
    async ({ key, start, destination, scroll }) => {
      mockGridGeometry();
      render(
        <Picker.Root
          {...rootProps}
          emojiData={hundred}
          categories={[Categories.SMILEYS_PEOPLE]}
        >
          <Grid />
        </Picker.Root>,
      );
      const body = document.querySelector<HTMLElement>(
        '[data-epr-part="viewport"]',
      )!;
      if (scroll) {
        body.scrollTop = scroll;
        fireEvent.scroll(body);
      }
      const first = await screen.findByRole('gridcell', {
        name: `emoji ${start}`,
      });
      expect(
        screen.queryByRole('gridcell', { name: `emoji ${destination}` }),
      ).toBeNull();
      act(() => first.focus());
      fireEvent.keyDown(first, { key });
      await waitFor(() => expect(body.scrollTop).not.toBe(scroll));
      // jsdom does not emit the browser's native scroll event after scrollTop.
      fireEvent.scroll(body);
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole('gridcell', { name: `emoji ${destination}` }),
        ),
      );
    },
  );

  it('cancels materialization before scrolling when the generation changes', () => {
    mockGridGeometry();
    let registry!: NavigationRegistry;
    render(
      <Picker.Root
        {...rootProps}
        emojiData={hundred}
        categories={[Categories.SMILEYS_PEOPLE]}
      >
        <JumpControl
          onRegistry={(value) => {
            registry = value;
          }}
        />
        <Grid />
      </Picker.Root>,
    );
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const first = screen.getByRole('gridcell', { name: 'emoji 18' });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    registry.invalidate();
    act(() => {
      while (frames.length) frames.shift()!(0);
    });
    expect(
      document.querySelector<HTMLElement>('[data-epr-part="viewport"]')!
        .scrollTop,
    ).toBe(0);
    expect(document.activeElement).toBe(first);
  });
});
