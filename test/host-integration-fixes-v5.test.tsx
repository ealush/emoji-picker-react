import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import { EmojiStyle } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

const data: Picker.EmojiData = {
  categories: {
    smileys_people: {
      category: Picker.Categories.SMILEYS_PEOPLE,
      name: 'Faces',
    },
  },
  emojis: {
    smileys_people: [
      { u: '1f600', n: ['grinning face'], a: '1' },
      { u: '1f44d', n: ['thumbs up'], a: '1', v: ['1f44d-1f3fb'] },
    ],
  },
};

const grid = (
  <Picker.Viewport>
    <Picker.List />
  </Picker.Viewport>
);

const variationMenu = (root: ParentNode) =>
  root.querySelectorAll('[data-epr-part="variation-picker"] button');

describe('Escape belongs to the host when there is nothing to undo', () => {
  it('lets Escape through with an empty search', async () => {
    render(<EmojiPicker emojiData={data} autoFocusSearch={false} />);
    const cell = await screen.findByRole('gridcell', { name: 'thumbs up' });
    cell.focus();
    // fireEvent returns false when the picker called preventDefault.
    expect(fireEvent.keyDown(cell, { key: 'Escape' })).toBe(true);
    expect(cell).toHaveFocus();
  });

  it('clears a non-empty search, and only then lets Escape through', async () => {
    render(<EmojiPicker emojiData={data} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'thumbs' } });
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(input).toHaveValue('');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(true);
  });

  it('clears text a controlled parent has not accepted yet', () => {
    const proposals: string[] = [];
    // The parent lags: the input shows "cat" while searchValue is still "".
    render(
      <EmojiPicker
        emojiData={data}
        searchValue=""
        onSearchChange={(next) => proposals.push(next)}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'cat' } });
    expect(input).toHaveValue('cat');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(proposals).toEqual(['cat', '']);
    // The draft is gone at once, so the next Escape reaches the host.
    expect(input).toHaveValue('');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(true);
    expect(proposals).toEqual(['cat', '']);
  });

  it('leaves the text to a controlled parent that holds a value', () => {
    const proposals: string[] = [];
    // The parent ignores proposals: "dog" stays accepted.
    render(
      <EmojiPicker
        emojiData={data}
        searchValue="dog"
        onSearchChange={(next) => proposals.push(next)}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(proposals).toEqual(['']);
    expect(input).toHaveValue('dog');
    // The parent rejected the clear: the next Escape reaches the host.
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(true);
    expect(proposals).toEqual(['']);
  });

  it('clears again after a rejected clear once the search changes', () => {
    const proposals: string[] = [];
    function Parent() {
      const [value, setValue] = React.useState('dog');
      return (
        <>
          <button onClick={() => setValue('cat')}>set cat</button>
          <EmojiPicker
            emojiData={data}
            searchValue={value}
            // Rejects clears, accepts anything else.
            onSearchChange={(next) => {
              proposals.push(next);
              if (next) setValue(next);
            }}
          />
        </>
      );
    }
    render(<Parent />);
    const input = screen.getByRole('textbox');
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(true);
    // A new value is a new search: Escape tries to clear it first.
    fireEvent.click(screen.getByRole('button', { name: 'set cat' }));
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false);
    expect(proposals).toEqual(['', '']);
  });

  it('still consumes Escape that closes the variation menu', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Picker.Root emojiData={data}>{grid}</Picker.Root>,
    );
    const cell = screen.getByRole('gridcell', { name: 'thumbs up' });
    fireEvent.mouseDown(cell);
    act(() => vi.advanceTimersByTime(500));
    expect(variationMenu(container)).toHaveLength(2);
    expect(fireEvent.keyDown(cell, { key: 'Escape' })).toBe(false);
  });
});

describe('suggestedEmojis owns the recents', () => {
  it('records nothing in localStorage while suggestedEmojis is set', async () => {
    render(
      <EmojiPicker
        emojiData={data}
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojis={['1f600']}
      />,
    );
    fireEvent.click(
      (await screen.findAllByRole('gridcell', { name: 'thumbs up' }))[0],
    );
    expect(window.localStorage.getItem('epr_suggested')).toBeNull();
  });

  it('treats an empty suggestedEmojis as app-owned: empty Suggested, nothing recorded', async () => {
    const recents = JSON.stringify([
      { unified: '1f600', original: '1f600', count: 3 },
    ]);
    window.localStorage.setItem('epr_suggested', recents);
    const { container } = render(
      <EmojiPicker
        emojiData={data}
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojis={[]}
      />,
    );
    fireEvent.click(await screen.findByRole('gridcell', { name: 'thumbs up' }));
    // The stored recents neither show up in Suggested nor gain the pick.
    expect(
      container.querySelectorAll(
        '[data-epr-category="suggested"] [data-epr-part="emoji"]',
      ),
    ).toHaveLength(0);
    expect(
      screen.getAllByRole('gridcell', { name: 'grinning face' }),
    ).toHaveLength(1);
    expect(window.localStorage.getItem('epr_suggested')).toBe(recents);
  });

  it('records picks without suggestedEmojis', async () => {
    render(<EmojiPicker emojiData={data} emojiStyle={EmojiStyle.NATIVE} />);
    fireEvent.click(await screen.findByRole('gridcell', { name: 'thumbs up' }));
    expect(window.localStorage.getItem('epr_suggested')).toContain('1f44d');
  });
});

describe('variationsDisabled', () => {
  it('turns off the long press, Space menu and marker under Root', () => {
    vi.useFakeTimers();
    const onEmojiClick = vi.fn();
    const { container } = render(
      <Picker.Root
        emojiData={data}
        variationsDisabled
        onEmojiClick={onEmojiClick}
      >
        {grid}
      </Picker.Root>,
    );
    const cell = screen.getByRole('gridcell', { name: 'thumbs up' });
    expect(cell.className).not.toContain('epr-emoji-has-variations');

    fireEvent.mouseDown(cell);
    act(() => vi.advanceTimersByTime(600));
    fireEvent.mouseUp(cell);
    expect(variationMenu(container)).toHaveLength(0);
    // The release still picks the emoji.
    fireEvent.click(cell);
    expect(onEmojiClick.mock.calls[0][0]).toMatchObject({ unified: '1f44d' });

    fireEvent.keyDown(cell, { key: ' ' });
    act(() => vi.advanceTimersByTime(100));
    expect(variationMenu(container)).toHaveLength(0);
  });

  it('closes an open menu when variations are turned off', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <Picker.Root emojiData={data}>{grid}</Picker.Root>,
    );
    const cell = screen.getByRole('gridcell', { name: 'thumbs up' });
    fireEvent.mouseDown(cell);
    act(() => vi.advanceTimersByTime(500));
    expect(variationMenu(container)).toHaveLength(2);

    rerender(
      <Picker.Root emojiData={data} variationsDisabled>
        {grid}
      </Picker.Root>,
    );
    expect(variationMenu(container)).toHaveLength(0);
    // No menu is left open to swallow Escape.
    expect(fireEvent.keyDown(cell, { key: 'Escape' })).toBe(true);
  });

  it('reports hasVariations: false to a custom cell', () => {
    const seen: boolean[] = [];
    const Emoji: NonNullable<Picker.PickerComponents['Emoji']> = ({
      emoji,
      ...props
    }) => {
      if (emoji.unified === '1f44d') seen.push(emoji.hasVariations);
      return <button {...props}>{emoji.emoji}</button>;
    };
    render(
      <Picker.Root emojiData={data} variationsDisabled components={{ Emoji }}>
        {grid}
      </Picker.Root>,
    );
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((has) => !has)).toBe(true);
  });
});
