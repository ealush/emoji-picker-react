import { act, render } from '@testing-library/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const styleCount = (root: ParentNode = document) =>
  root.querySelectorAll('style').length;

function Pickers({ count, nonce }: { count: number; nonce?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <EmojiPicker key={index} nonce={nonce} autoFocusSearch={false} />
      ))}
    </>
  );
}

describe('library styles render once per document or shadow root', () => {
  it('emits one set of style elements for many pickers', () => {
    const { unmount } = render(<Pickers count={1} />);
    const single = styleCount();
    unmount();

    render(<Pickers count={4} />);
    expect(single).toBeGreaterThan(0);
    expect(styleCount()).toBe(single);
  }, 10000);

  it('does not defer to an owner removed from the document', () => {
    const { container } = render(<EmojiPicker autoFocusSearch={false} />);
    const single = styleCount();
    container.remove();

    render(<EmojiPicker autoFocusSearch={false} />);
    expect(styleCount()).toBe(single);
  });

  it('hands the styles to a remaining picker when the owner unmounts', () => {
    function Toggle({ first }: { first: boolean }) {
      return (
        <>
          {first && <EmojiPicker autoFocusSearch={false} />}
          <EmojiPicker autoFocusSearch={false} />
        </>
      );
    }
    const { rerender } = render(<Toggle first />);
    const owned = styleCount();
    rerender(<Toggle first={false} />);
    expect(styleCount()).toBe(owned);
  });

  it('keeps a separate set per nonce', () => {
    render(
      <>
        <EmojiPicker autoFocusSearch={false} />
        <EmojiPicker nonce="abc" autoFocusSearch={false} />
      </>,
    );
    const nonced = Array.from(document.querySelectorAll('style')).filter(
      (style) => style.getAttribute('nonce') === 'abc',
    );
    expect(nonced.length).toBeGreaterThan(0);
    expect(nonced.length * 2).toBe(styleCount());
  });

  it('renders styles inside each shadow root', () => {
    render(<EmojiPicker autoFocusSearch={false} />);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<EmojiPicker autoFocusSearch={false} />));
    expect(styleCount(shadow)).toBeGreaterThan(0);
    act(() => root.unmount());
  });

  it('server markup carries styles for every picker, so hydration matches', () => {
    const one = renderToString(<Pickers count={1} />);
    const two = renderToString(<Pickers count={2} />);
    const tags = (html: string) => html.match(/<style/g)?.length ?? 0;
    expect(tags(two)).toBe(tags(one) * 2);
  });
});
