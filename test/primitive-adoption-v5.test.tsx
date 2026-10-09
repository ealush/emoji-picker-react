import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import fullData from '../src/data/emojis-en';
const data = {
  categories: fullData.categories,
  emojis: { smileys_people: fullData.emojis.smileys_people.slice(0, 4) },
};
import * as Picker from '../src/primitives';

describe('primitive adoption contracts', () => {
  it('recovers from a synchronous loader failure using localized retry', async () => {
    const loader = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('Offline');
      })
      .mockResolvedValue(data);
    render(
      <Picker.Root
        emojiData={loader}
        labels={{ loadingError: 'Sin conexión', retryLoading: 'Reintentar' }}
      >
        <Picker.Viewport>
          <Picker.List />
          <Picker.Loading />
          <Picker.LoadError />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByRole('gridcell', { name: 'grinning face' });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('aborts an old source and ignores its late failure', async () => {
    let signal: AbortSignal | undefined;
    let reject: (error: Error) => void = () => {};
    const loader: Picker.EmojiDataLoader = (options) => {
      signal = options.signal;
      return new Promise((_resolve, fail) => {
        reject = fail;
      });
    };
    const tree = (source: Picker.EmojiDataInput) => (
      <Picker.Root emojiData={source}>
        <Picker.Viewport>
          <Picker.List />
          <Picker.LoadError />
        </Picker.Viewport>
      </Picker.Root>
    );
    const { rerender } = render(tree(loader));
    expect(signal?.aborted).toBe(false);
    rerender(tree(data));
    expect(signal?.aborted).toBe(true);
    await act(async () => reject(new Error('Late failure')));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.getByRole('gridcell', { name: 'grinning face' }),
    ).toBeTruthy();
  });

  it('rebuilds cached searches when asynchronous data arrives', async () => {
    let resolve: (data: Picker.EmojiData) => void = () => {};
    const loader = () =>
      new Promise<Picker.EmojiData>((done) => {
        resolve = done;
      });
    render(
      <Picker.Root emojiData={loader} defaultSearchValue="grinning">
        <Picker.SearchInput />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
          <Picker.Loading />
        </Picker.Viewport>
      </Picker.Root>,
    );
    await act(async () => new Promise(resolve => setTimeout(resolve, 150)));
    expect(screen.queryAllByText('No results found')).toHaveLength(0);
    await act(async () => resolve(data));
    expect(
      await screen.findByRole('gridcell', { name: 'grinning face' }),
    ).toBeVisible();
    expect(screen.queryAllByText('No results found')).toHaveLength(0);
  });

  it('aborts StrictMode attempts and unmount without leaking failures', async () => {
    const signals: AbortSignal[] = [];
    const failures: Array<(error: Error) => void> = [];
    const loader: Picker.EmojiDataLoader = ({ signal }) => {
      if (signal) signals.push(signal);
      return new Promise((_resolve, reject) => failures.push(reject));
    };
    const { unmount } = render(
      <React.StrictMode>
        <Picker.Root emojiData={loader}>
          <Picker.Viewport>
            <Picker.List />
            <Picker.LoadError />
          </Picker.Viewport>
        </Picker.Root>
      </React.StrictMode>,
    );
    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBe(true);
    unmount();
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    await act(async () =>
      failures.forEach((reject) => reject(new Error('Cancelled'))),
    );
  });

  it('keeps explicit panel presence while accepting consumer layout props', () => {
    const { container } = render(
      <Picker.Root emojiData={data} reactionsDefaultOpen>
        <Picker.Reactions />
        <Picker.Panel
          className="panel-layout"
          style={{ gap: 12, display: 'flex' }}
          aria-label="Full picker"
        >
          <Picker.SearchInput />
          <Picker.Viewport>
            <Picker.List />
          </Picker.Viewport>
        </Picker.Panel>
      </Picker.Root>,
    );
    const panel = container.querySelector('[data-epr-part="panel"]')!;
    expect(panel).toHaveClass('panel-layout');
    expect(panel).toHaveAttribute('hidden');
    expect(panel).toHaveAttribute('inert');
    expect(panel).toHaveStyle({ display: 'none', gap: '12px' });
    expect(panel).toHaveAttribute('aria-label', 'Full picker');
  });

  it('forwards a native input ref and shares controlled search/IME behavior', async () => {
    const ref = React.createRef<HTMLInputElement>();
    const emit = vi.fn();
    const Input = React.forwardRef<
      HTMLInputElement,
      React.InputHTMLAttributes<HTMLInputElement>
    >((props, inputRef) => (
      <input {...props} ref={inputRef} data-design-system="input" />
    ));
    render(
      <Picker.Root emojiData={data} searchValue="cat" onSearchChange={emit}>
        <Picker.SearchInput
          as={Input}
          ref={ref}
          placeholder="Find emoji"
          className="my-input"
        />
        <Picker.Viewport>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(ref.current).toBe(screen.getByRole('textbox'));
    expect(ref.current).toHaveClass('my-input');
    fireEvent.compositionStart(ref.current!);
    fireEvent.change(ref.current!, { target: { value: '猫' } });
    expect(emit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(ref.current!, { data: '猫' });
    expect(emit).toHaveBeenCalledExactlyOnceWith('猫');
    expect(ref.current).toHaveValue('cat');
  });

  it('updates custom active cell markup without rerendering unrelated cells', () => {
    const counts = new Map<string, number>();
    function Cell({ emoji, ...props }: Picker.EmojiRenderProps) {
      counts.set(emoji.unified, (counts.get(emoji.unified) ?? 0) + 1);
      return (
        <button {...props} data-custom-active={emoji.isActive ? 'yes' : 'no'} />
      );
    }
    render(
      <Picker.Root emojiData={data} previewConfig={{ showPreview: false }}>
        <Picker.Viewport>
          <Picker.List components={{ Emoji: Cell }} />
        </Picker.Viewport>
      </Picker.Root>,
    );
    const first = screen.getByRole('gridcell', { name: 'grinning face' });
    const second = screen.getByRole('gridcell', {
      name: 'grinning face with big eyes',
    });
    const unaffected = counts.get('1f604');
    fireEvent.mouseOver(first);
    expect(first).toHaveAttribute('data-epr-active');
    expect(first).toHaveAttribute('data-custom-active', 'yes');
    fireEvent.focus(second);
    expect(second).toHaveAttribute('data-custom-active', 'yes');
    expect(first).not.toHaveAttribute('data-epr-active');
    expect(counts.get('1f604')).toBe(unaffected);
  });
});
