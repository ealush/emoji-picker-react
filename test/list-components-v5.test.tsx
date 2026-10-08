import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import en from '../src/data/emojis-en';
import * as Picker from '../src/primitives';

function BrandEmoji({
  emoji,
  children: _defaultGlyph,
  ...props
}: Picker.EmojiRenderProps) {
  return (
    <button {...props} data-brand="cell" title={emoji.names[0]}>
      <span className="brand-wrap">
        <span className="brand-glyph">{emoji.emoji}</span>
      </span>
      {emoji.hasVariations ? <i className="brand-dot" /> : null}
      {/* `children` (the default glyph) intentionally replaced */}
    </button>
  );
}

function BrandHeader({ category, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} data-brand="header">
      #{category.id}
    </h3>
  );
}

const components = { Emoji: BrandEmoji, CategoryHeader: BrandHeader };

function Composition(props: Partial<React.ComponentProps<typeof Picker.Root>>) {
  return (
    // Synchronous data: a primitives-only bundle otherwise loads the
    // dataset lazily (see the lazy data tests).
    <Picker.Root emojiData={en} {...props}>
      <Picker.Viewport>
        <Picker.List components={components} />
      </Picker.Viewport>
    </Picker.Root>
  );
}

describe('List components', () => {
  it('renders consumer cells that keep library-owned behavior attributes', () => {
    const { container } = render(<Composition />);
    const cell = container.querySelector(
      '[data-brand="cell"][data-epr-unified="1f600"]',
    ) as HTMLButtonElement;
    expect(cell).not.toBeNull();
    expect(cell.type).toBe('button');
    expect(cell.getAttribute('aria-label')).toBeTruthy();
    expect(cell.className).toContain('epr-emoji');
    expect(cell.style.position).toBe('absolute');
    expect(cell.querySelector('.brand-glyph')?.textContent).toBe('😀');
  });

  it('keeps selection working through consumer cells', () => {
    const onEmojiClick = vi.fn();
    const { container } = render(<Composition onEmojiClick={onEmojiClick} />);
    const cell = container.querySelector(
      '[data-brand="cell"][data-epr-unified="1f600"]',
    ) as HTMLElement;
    fireEvent.click(cell.querySelector('.brand-glyph') as HTMLElement);
    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onEmojiClick.mock.calls[0][0]).toMatchObject({ unified: '1f600' });
  });

  it('renders consumer category headers as the measured sticky label', () => {
    const { container } = render(<Composition />);
    const header = container.querySelector(
      '[data-brand="header"]',
    ) as HTMLElement;
    expect(header.tagName).toBe('H3');
    expect(header.getAttribute('data-epr-part')).toBe('category-label');
    expect(header.className).toContain('epr-emoji-category-label');
    expect(header.textContent).toMatch(/^#/);
  });

  it('reflects the active skin tone in the cell data', () => {
    const { container } = render(
      <Composition
        skinTone={Picker.useSkinTone ? undefined : undefined}
        defaultSkinTone={'1f3fd' as never}
      />,
    );
    expect(
      container.querySelector(
        '[data-brand="cell"][data-epr-unified="1f44d-1f3fd"] .brand-dot',
      ),
    ).not.toBeNull();
  });
});
