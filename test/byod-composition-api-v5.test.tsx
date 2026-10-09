import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import * as Picker from '../src/primitives';

const data: Picker.EmojiData = {
  categories: {},
  emojis: {
    smileys_people: [
      { u: '1f600', n: ['grinning face'], a: '1' },
      {
        u: '1f44d',
        n: ['thumbs up'],
        a: '1',
        v: ['1f44d-1f3fb', '1f44d-1f3fd'],
      },
    ],
    animals_nature: [{ u: '1f431', n: ['cat face'], a: '1' }],
  },
};
const categories = [
  Picker.Categories.SMILEYS_PEOPLE,
  Picker.Categories.ANIMALS_NATURE,
];
const components: Picker.PickerComponents = {
  Emoji: ({ emoji, ...props }) => (
    <button {...props} data-custom-emoji={emoji.unified} />
  ),
  CategoryHeader: ({ category, ...props }) => (
    <div {...props} data-custom-header={category.id} />
  ),
  CategoryButton: ({ category, ...props }) => (
    <button {...props} data-custom-category={category.id} />
  ),
  SkinToneButton: ({ tone, ...props }) => (
    <button {...props} data-custom-tone={tone.skinTone} />
  ),
  ExpandButton: (props) => <button {...props} data-custom-expand />,
  ClearButton: (props) => <button {...props} data-custom-clear />,
};
function Grid() {
  return (
    <Picker.Viewport>
      <Picker.List />
      <Picker.Empty />
    </Picker.Viewport>
  );
}

function Actions() {
  const search = Picker.useSearchState();
  const { setValue, clear } = Picker.useSearchActions();
  const mode = Picker.usePickerMode();
  const nav = Picker.useCategoryNavigation();
  return (
    <>
      <button onClick={() => setValue('cat')}>Set search</button>
      <button onClick={clear}>Clear search</button>
      <button onClick={mode.expand}>Expand</button>
      <button onClick={mode.collapse}>Collapse</button>
      <output data-testid="accepted-search">{search.search}</output>
      <output data-testid="mode">{String(mode.reactionsOpen)}</output>
      <output data-testid="categories">
        {nav.categories.map((c) => c.id).join(',')}
      </output>
    </>
  );
}

describe('BYOD composition API', () => {
  it('keeps default decoration but removes it from every unstyled managed control', () => {
    const { container, rerender } = render(
      <EmojiPicker emojiData={data} categories={categories} />,
    );
    expect(container.querySelector('[data-epr-part="emoji"]')).toHaveClass(
      'epr-emoji-appearance',
    );
    expect(
      container.querySelector('[data-epr-part="category-label"]'),
    ).toHaveClass('epr-category-label-appearance');
    rerender(<EmojiPicker unstyled emojiData={data} categories={categories} />);
    expect(container.querySelector('.epr-btn')).toBeNull();
    expect(container.querySelector('.epr-emoji-appearance')).toBeNull();
    expect(
      container.querySelector('.epr-category-label-appearance'),
    ).toBeNull();
    expect(container.querySelector('.epr-icn-clear-search')).toBeNull();
    expect(
      container.querySelector('[data-epr-part="skin-tone-button"]'),
    ).toHaveTextContent('✋');
    expect(container.querySelector('[data-epr-part="emoji"]')).toHaveClass(
      'epr-emoji',
    );
  });

  it('resets appearance and replacements at nested Root boundaries', () => {
    const { container } = render(
      <Picker.Root
        appearance="default"
        components={components}
        emojiData={data}
      >
        <Picker.Reactions />
        <Picker.Panel>
          <div data-testid="outer">
            <Grid />
          </div>
          <Picker.Root emojiData={data}>
            <Picker.Reactions />
            <Picker.Panel>
              <div data-testid="inner">
                <Grid />
              </div>
            </Picker.Panel>
          </Picker.Root>
        </Picker.Panel>
      </Picker.Root>,
    );
    expect(
      container.querySelector('[data-testid="outer"] [data-custom-emoji]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="inner"] [data-custom-emoji]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="inner"] .epr-btn'),
    ).toBeNull();
  });

  it('shares typed replacements across grid, category, search and tone controls', () => {
    const selected = vi.fn();
    const toneChanged = vi.fn();
    const { container } = render(
      <Picker.Root
        emojiData={data}
        categories={categories}
        components={components}
        onEmojiClick={selected}
        onSkinToneChange={toneChanged}
      >
        <Picker.Reactions />
        <Picker.Panel>
          <Picker.Search>
            <Picker.SkinTone />
          </Picker.Search>
          <Picker.CategoryNav />
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    expect(container.querySelector('[data-custom-header]')).not.toBeNull();
    expect(container.querySelectorAll('[data-custom-category]')).toHaveLength(
      2,
    );
    const cell = screen.getByRole('gridcell', { name: 'cat face' });
    fireEvent.click(cell);
    expect(selected.mock.calls[0][0].unified).toBe('1f431');
    fireEvent.click(screen.getByRole('button', { name: 'Skin tone NEUTRAL' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skin tone MEDIUM' }));
    expect(toneChanged).toHaveBeenCalledWith(Picker.SkinTones.MEDIUM);
    const medium = container.querySelector('[data-custom-tone="1f3fd"]');
    expect(medium).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'cat' } });
    fireEvent.click(container.querySelector('[data-custom-clear]')!);
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('selects the exact neutral variation and reaction even when the active tone is medium', async () => {
    const selected = vi.fn();
    const reaction = vi.fn();
    const { container, rerender } = render(
      <Picker.Root
        emojiData={data}
        categories={categories}
        skinTone={Picker.SkinTones.MEDIUM}
        components={components}
        onEmojiClick={selected}
      >
        <Picker.Reactions />
        <Picker.Panel>
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    const medium = screen.getByRole('gridcell', { name: 'thumbs up' });
    expect(medium).toHaveAttribute('data-epr-unified', '1f44d-1f3fd');
    fireEvent.mouseDown(medium);
    await vi.waitFor(() =>
      expect(
        container.querySelector(
          '[data-epr-part="variation-picker"] [data-custom-emoji="1f44d"]',
        ),
      ).not.toBeNull(),
    );
    fireEvent.mouseUp(medium);
    await act(
      async () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined)),
        ),
    );
    fireEvent.click(
      container.querySelector(
        '[data-epr-part="variation-picker"] [data-custom-emoji="1f44d"]',
      )!,
    );
    expect(selected.mock.calls[0][0]).toMatchObject({
      unified: '1f44d',
      emoji: '👍',
      activeSkinTone: Picker.SkinTones.NEUTRAL,
    });
    rerender(
      <Picker.Root
        emojiData={data}
        skinTone={Picker.SkinTones.MEDIUM}
        components={components}
        reactions={['1f44d']}
        onReactionClick={reaction}
      >
        <Picker.Reactions />
        <Picker.Panel>
          <Grid />
          <Actions />
        </Picker.Panel>
      </Picker.Root>,
    );
    fireEvent.click(screen.getByText('Collapse'));
    fireEvent.click(
      container.querySelector(
        '[data-epr-part="reactions"] [data-custom-emoji="1f44d"]',
      )!,
    );
    expect(reaction.mock.calls[0][0]).toMatchObject({
      unified: '1f44d',
      emoji: '👍',
      activeSkinTone: Picker.SkinTones.NEUTRAL,
    });
  });

  it('lets List override one slot while inheriting the remaining Root slots', () => {
    const { container } = render(
      <Picker.Root emojiData={data} components={components}>
        <Picker.Reactions />
        <Picker.Panel>
          <Picker.Viewport>
            <Picker.List
              components={{
                Emoji: ({ emoji, ...props }) => (
                  <button {...props} data-list-override={emoji.unified} />
                ),
              }}
            />
          </Picker.Viewport>
        </Picker.Panel>
      </Picker.Root>,
    );
    expect(container.querySelector('[data-list-override]')).not.toBeNull();
    expect(container.querySelector('[data-custom-header]')).not.toBeNull();
    expect(
      container.querySelector('[role="gridcell"][data-custom-emoji]'),
    ).toBeNull();
  });

  it('replaces reactions independently and preserves native refs, panel presence and dimensions', () => {
    const reaction = vi.fn();
    const panelRef = React.createRef<HTMLDivElement>();
    const reactionsRef = React.createRef<HTMLUListElement>();
    const { container } = render(
      <Picker.Root
        components={components}
        emojiData={data}
        reactions={['1f600']}
        reactionsDefaultOpen
        style={{ width: 320, height: 400 }}
        onReactionClick={reaction}
      >
        <Actions />
        <Picker.Reactions ref={reactionsRef} className="my-bar" />
        <Picker.Panel ref={panelRef}>
          <Picker.SearchInput />
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    expect(panelRef.current).toHaveAttribute('hidden');
    expect(panelRef.current).toHaveAttribute('inert');
    expect(reactionsRef.current).toHaveClass('my-bar');
    expect(container.querySelector('aside')).toHaveStyle({
      width: '320px',
      height: '400px',
    });
    fireEvent.click(
      reactionsRef.current!.querySelector('[data-custom-emoji]')!,
    );
    expect(reaction.mock.calls[0][0].unified).toBe('1f600');
    fireEvent.click(
      reactionsRef.current!.querySelector('[data-custom-expand]')!,
    );
    expect(panelRef.current).not.toHaveAttribute('hidden');
    expect(panelRef.current).not.toHaveAttribute('inert');
    expect(reactionsRef.current).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse', exact: true }),
    );
    expect(panelRef.current).toHaveAttribute('inert');
    expect(container.querySelectorAll('[data-epr-part="panel"]')).toHaveLength(
      1,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('true');
  });

  it('supports explicit full-picker-only composition without injecting a reactions bar', () => {
    const { container } = render(
      <Picker.Root emojiData={data}>
        <Picker.Panel>
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    expect(container.querySelectorAll('[data-epr-part="panel"]')).toHaveLength(
      1,
    );
    expect(container.querySelector('[data-epr-part="reactions"]')).toBeNull();
  });

  it('proposes controlled search without committing a rejected proposal or requiring an input', async () => {
    const changed = vi.fn();
    const { rerender } = render(
      <Picker.Root emojiData={data} searchValue="face" onSearchChange={changed}>
<Picker.Reactions /><Picker.Panel>
        <Actions />
      </Picker.Panel>
</Picker.Root>,
    );
    fireEvent.click(screen.getByText('Set search'));
    expect(changed).toHaveBeenLastCalledWith('cat');
    expect(screen.getByTestId('accepted-search')).toHaveTextContent('face');
    fireEvent.click(screen.getByText('Clear search'));
    expect(changed).toHaveBeenLastCalledWith('');
    expect(screen.getByTestId('accepted-search')).toHaveTextContent('face');
    rerender(
      <Picker.Root emojiData={data} searchValue="cat" onSearchChange={changed}>
<Picker.Reactions /><Picker.Panel>
        <Actions />
      </Picker.Panel>
</Picker.Root>,
    );
    expect(screen.getByTestId('accepted-search')).toHaveTextContent('cat');
    await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('commits uncontrolled search through the shared filter and reports category identities', async () => {
    const changed = vi.fn();
    render(
      <Picker.Root
        emojiData={data}
        categories={categories}
        onSearchChange={changed}
      >
        <Picker.Reactions />
        <Picker.Panel>
          <Picker.SearchInput />
          <Actions />
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    fireEvent.click(screen.getByText('Set search'));
    expect(screen.getByRole('textbox')).toHaveValue('cat');
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('gridcell', { name: 'grinning face' }),
      ).toBeNull(),
    );
    expect(screen.getByTestId('categories')).toHaveTextContent(
      'smileys_people,animals_nature',
    );
    fireEvent.click(screen.getByText('Clear search'));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(changed.mock.calls.map((call) => call[0])).toEqual(['cat', '']);
  });

  it('respects terminal reactions mode in the public expansion action', () => {
    render(
      <Picker.Root
        emojiData={data}
        reactionsDefaultOpen
        allowExpandReactions={false}
      >
        <Actions />
        <Picker.Reactions />
      </Picker.Root>,
    );
    fireEvent.click(screen.getByText('Expand'));
    expect(screen.getByTestId('mode')).toHaveTextContent('true');
  });

  it('permits a custom action to cancel expansion before invoking the managed handler', () => {
    const prevented: Picker.PickerComponents = {
      ExpandButton: ({ onClick, ...props }) => (
        <button
          {...props}
          onClick={(event) => {
            event.preventDefault();
            onClick?.(event);
          }}
        />
      ),
    };
    const { container } = render(
      <Picker.Root emojiData={data} reactionsDefaultOpen components={prevented}>
        <Picker.Reactions />
        <Picker.Panel>
          <Grid />
        </Picker.Panel>
      </Picker.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show all Emojis' }));
    expect(container.querySelector('[data-epr-part="panel"]')).toHaveAttribute(
      'hidden',
    );
  });
});
