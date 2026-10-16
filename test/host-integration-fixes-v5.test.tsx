import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';
import enData from '../src/data/emojis-en.json';
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

describe('emoji names', () => {
  // The dataset keeps keywords shortest first and the CLDR short name
  // last; aria-labels and the preview read the last entry.
  it.each([
    ['1f680', 'rocket'],
    ['1f600', 'grinning face'],
    ['1f9d1-200d-1f4bb', 'technologist'],
    ['1f1fa-1f1f8', 'flag: United States'],
  ])('names %s "%s"', (unified, name) => {
    const record = Object.values(enData.emojis)
      .flat()
      .find((emoji) => emoji.u === unified);
    expect(record?.n.at(-1)).toBe(name);
  });

  it('announces the short name, not the longest keyword', () => {
    render(
      <Picker.Root emojiData={enData as Picker.EmojiData}>
        <Picker.Viewport style={{ height: 300 }}>
          <Picker.List />
        </Picker.Viewport>
      </Picker.Root>,
    );
    expect(
      screen.getAllByRole('gridcell', { name: 'grinning face' }).length,
    ).toBeGreaterThan(0);
  });
});
