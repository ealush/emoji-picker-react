import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import { eventBelongsToPicker } from '../src/DomUtils/eventBelongsToPicker';
import { getActiveElement } from '../src/DomUtils/getActiveElement';

const data: Picker.EmojiData = {
  categories: {
    smileys_people: {
      category: Picker.Categories.SMILEYS_PEOPLE,
      name: 'Faces',
    },
  },
  emojis: { smileys_people: [{ u: '1f600', n: ['grinning face'], a: '1' }] },
};
const grid = (
  <Picker.Viewport>
    <Picker.List />
  </Picker.Viewport>
);
const cell = (root: Element) =>
  root.querySelector('[role="gridcell"]') as HTMLElement;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('BYOD API hardening', () => {
  it('opens long-press variations after a shadow event is retargeted to its host', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const toneData: Picker.EmojiData = {
      categories: data.categories,
      emojis: {
        smileys_people: [
          { u: '1f44d', n: ['thumbs up'], a: '1', v: ['1f44d-1f3fb'] },
        ],
      },
    };
    const { unmount } = render(
      createPortal(
        <Picker.Root emojiData={toneData}>{grid}</Picker.Root>,
        shadow,
      ),
    );
    try {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        composed: true,
      });
      cell(shadow as unknown as Element).dispatchEvent(event);
      expect(event.target).toBe(host);
      act(() => vi.advanceTimersByTime(500));
      expect(
        shadow.querySelectorAll('[data-epr-part="variation-picker"] button'),
      ).toHaveLength(2);
    } finally {
      unmount();
      host.remove();
      vi.useRealTimers();
    }
  });

  it('forwards design-library input classes for their sizing rules', () => {
    render(
      <Picker.Root emojiData={data}>
        <Picker.SearchInput className="library-input" />
        {grid}
      </Picker.Root>,
    );
    expect(screen.getByRole('textbox')).toHaveClass('library-input');
  });

  it('resolves native focus and captured events inside an open shadow root', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const { unmount } = render(
      createPortal(
        <Picker.Root emojiData={data}>
          <Picker.SearchInput />
          {grid}
        </Picker.Root>,
        shadow,
      ),
    );
    const root = shadow.querySelector('aside')!;
    const input = shadow.querySelector('input')!;
    input.focus();
    expect(document.activeElement).toBe(host);
    expect(getActiveElement()).toBe(input);
    const belongs = vi.fn((event: Event) => eventBelongsToPicker(event, root));
    window.addEventListener('keydown', belongs, true);
    try {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'x',
          bubbles: true,
          composed: true,
        }),
      );
      expect(belongs).toHaveReturnedWith(true);
    } finally {
      window.removeEventListener('keydown', belongs, true);
      unmount();
      host.remove();
    }
  });

  it('keeps nested bare Root callbacks isolated', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const { container } = render(
      <Picker.Root emojiData={data} onEmojiClick={outer}>
        {grid}
        <Picker.Root emojiData={data} onEmojiClick={inner}>
          {grid}
        </Picker.Root>
      </Picker.Root>,
    );
    const roots = container.querySelectorAll('[data-epr-part="root"]');
    fireEvent.click(cell(roots[1]));
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it('does not let an inner Escape clear the outer search', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Picker.Root
        emojiData={data}
        defaultSearchValue="outer"
        onSearchChange={outer}
      >
        <Picker.SearchInput aria-label="Outer search" />
        {grid}
        <Picker.Root
          emojiData={data}
          defaultSearchValue="inner"
          onSearchChange={inner}
        >
          <Picker.SearchInput aria-label="Inner search" />
          {grid}
        </Picker.Root>
      </Picker.Root>,
    );
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Inner search' }), {
      key: 'Escape',
    });
    expect(inner).toHaveBeenCalledExactlyOnceWith('');
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Outer search' })).toHaveValue(
      'outer',
    );
  });

  it('keeps nested default-picker callbacks fresh through its memo boundary', () => {
    const outer = vi.fn();
    const old = vi.fn();
    const next = vi.fn();
    const tree = (onEmojiClick: typeof old) => (
      <Picker.Root emojiData={data} onEmojiClick={outer}>
        <EmojiPicker emojiData={data} onEmojiClick={onEmojiClick} />
      </Picker.Root>
    );
    const { container, rerender } = render(tree(old));
    rerender(tree(next));
    fireEvent.click(
      cell(container.querySelectorAll('[data-epr-part="root"]')[1]),
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(old).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it('does not detach a stable input ref on unrelated rerenders and runs its cleanup once', () => {
    const cleanup = vi.fn();
    const ref = vi.fn((node: HTMLInputElement | null) =>
      node ? cleanup : undefined,
    );
    const tree = (className: string) => (
      <Picker.Root emojiData={data}>
        <Picker.SearchInput ref={ref} className={className} />
        {grid}
      </Picker.Root>
    );
    const { rerender, unmount } = render(tree('first'));
    rerender(tree('second'));
    expect(ref).toHaveBeenCalledTimes(1);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it.each(['disabled', 'readOnly'] as const)(
    'does not type to a %s native input',
    (flag) => {
      const changed = vi.fn();
      const { container } = render(
        <Picker.Root emojiData={data} onSearchChange={changed}>
          <Picker.SearchInput {...{ [flag]: true }} />
          {grid}
        </Picker.Root>,
      );
      const button = cell(container);
      button.focus();
      fireEvent.keyDown(button, { key: 'x' });
      expect(changed).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox')).toHaveValue('');
      expect(document.activeElement).toBe(button);
    },
  );

  it('rejects innerHTML at managed structural boundaries without replacing children', () => {
    const injection = {
      dangerouslySetInnerHTML: { __html: '<p>replacement</p>' },
    };
    const { container } = render(
      <Picker.Root emojiData={data} {...injection}>
        <Picker.SearchInput />
        <Picker.Viewport {...injection}>
          <Picker.List {...injection} />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(cell(container)).toBeTruthy();
    expect(container).not.toHaveTextContent('replacement');
  });

  it('loads data with Root presence and cancels pending data when removed', async () => {
    let signal: AbortSignal | undefined;
    const loader = vi.fn(
      ({ signal: current }: Picker.EmojiDataLoaderOptions) => {
        signal = current;
        return new Promise<Picker.EmojiData>(() => {});
      },
    );
    // Presence belongs to the caller's JSX: conditional rendering of Root
    // itself controls whether the picker (and its data loading) exists.
    const tree = (open: boolean) => (
      <>
        {open ? (
          <Picker.Root emojiData={loader}>{grid}</Picker.Root>
        ) : null}
      </>
    );
    const { container, rerender } = render(tree(false));
    expect(container.querySelector('aside')).toBeNull();
    expect(loader).not.toHaveBeenCalled();
    rerender(tree(true));
    expect(loader).toHaveBeenCalledTimes(1);
    rerender(tree(false));
    expect(signal?.aborted).toBe(true);
    expect(container.querySelector('aside')).toBeNull();
  });

  it.each([
    { unexpected: true },
    { categories: [], emojis: {} },
    { categories: {}, emojis: { smileys_people: [null] } },
    {
      categories: {},
      emojis: { smileys_people: [{ u: '1f600', n: 'face', a: '1' }] },
    },
    { categories: { smileys_people: null }, emojis: {} },
    {
      categories: {},
      emojis: { smileys_people: [{ u: 'not-a-code', n: ['face'], a: '1' }] },
    },
    {
      categories: {},
      emojis: { smileys_people: [{ u: '110000', n: ['face'], a: '1' }] },
    },
    {
      categories: {},
      emojis: {
        smileys_people: [
          { u: '1f600', n: ['face'], a: '1', v: ['not-a-code'] },
        ],
      },
    },
  ])(
    'exposes malformed loader output as a recoverable error (%j)',
    async (payload) => {
      const loader = vi
        .fn()
        .mockResolvedValueOnce(payload)
        .mockResolvedValue(data);
      render(
        <Picker.Root
          emojiData={loader}
          categories={[Picker.Categories.SMILEYS_PEOPLE]}
        >
          <Picker.Viewport>
            <Picker.List />
            <Picker.LoadError />
          </Picker.Viewport>
        </Picker.Root>,
      );
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Could not load emojis',
      );
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(
        await screen.findByRole('gridcell', { name: 'grinning face' }),
      ).toBeTruthy();
    },
  );

  it('preserves design-library cell appearance and required grid geometry', () => {
    function Cell({ emoji: _emoji, ...props }: Picker.EmojiRenderProps) {
      return <button {...props} className={`${props.className} host-cell`} />;
    }
    function Header({
      category: _category,
      ...props
    }: Picker.CategoryHeaderRenderProps) {
      return <h3 {...props} className={`${props.className} host-header`} />;
    }
    const { container } = render(
      <>
        <style>{`.host-cell { border: 2px solid red; border-radius: 3px; background-color: red; outline: 1px solid blue; }
        .host-header { font-size: 12px; font-weight: normal; text-transform: none; }`}</style>
        <Picker.Root
          emojiData={data}
          categories={[Picker.Categories.SMILEYS_PEOPLE]}
        >
          <Picker.Viewport>
            <Picker.List components={{ Emoji: Cell, CategoryHeader: Header }} />
          </Picker.Viewport>
        </Picker.Root>
      </>,
    );
    const button = cell(container);
    const appearance = getComputedStyle(button);
    expect(appearance.borderRadius).toBe('3px');
    expect(appearance.borderTopWidth).toBe('2px');
    expect(button).not.toHaveClass('epr-btn', 'epr-emoji-appearance');
    expect(button).toHaveClass('epr-emoji');
    expect(button.style.position).toBe('absolute');
    expect(container.querySelector('.host-header')).not.toHaveClass(
      'epr-category-label-appearance',
    );
    expect(
      getComputedStyle(container.querySelector('.host-header')!).fontSize,
    ).toBe('12px');
  });

  it('measures bordered custom buttons by their outer box for virtualized rows', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.tagName === 'BUTTON' ? 36 : 400;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.tagName === 'BUTTON' ? 40 : 400;
      },
    );
    function Cell({ emoji: _emoji, ...props }: Picker.EmojiRenderProps) {
      return (
        <button
          {...props}
          style={{ ...props.style, border: '2px solid red' }}
        />
      );
    }
    const rows: Picker.EmojiData = {
      categories: data.categories,
      emojis: {
        smileys_people: [
          '1f600',
          '1f603',
          '1f604',
          '1f601',
          '1f606',
          '1f605',
        ].map((u) => ({ u, n: [u], a: '1' })),
      },
    };
    const { container } = render(
      <Picker.Root
        emojiData={rows}
        categories={[Picker.Categories.SMILEYS_PEOPLE]}
      >
        <Picker.Viewport>
          <Picker.List components={{ Emoji: Cell }} />
        </Picker.Viewport>
      </Picker.Root>,
    );
    const cells = container.querySelectorAll<HTMLElement>('[role="gridcell"]');
    expect(cells[2].style.top).toBe('40px');
    expect(cells[4].style.top).toBe('80px');
  });

  it('forwards design-library input options while Root manages search', () => {
    const Input = React.forwardRef<
      HTMLInputElement,
      React.InputHTMLAttributes<HTMLInputElement> & { variant: 'quiet' }
    >(({ variant, ...props }, ref) => (
      <input {...props} ref={ref} data-variant={variant} />
    ));
    const changed = vi.fn();
    render(
      <Picker.Root emojiData={data} onSearchChange={changed}>
        <Picker.SearchInput as={Input} variant="quiet" />
        {grid}
      </Picker.Root>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-variant', 'quiet');
    fireEvent.change(input, { target: { value: 'face' } });
    expect(changed).toHaveBeenCalledExactlyOnceWith('face');
  });

  it('keeps an out-of-scope production tone setter inert', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let set: ReturnType<typeof Picker.useSkinTone>[1] | undefined;
    function Probe() {
      [, set] = Picker.useSkinTone();
      return null;
    }
    render(<Probe />);
    expect(() => act(() => set?.(Picker.SkinTones.DARK))).not.toThrow();
  });
});
