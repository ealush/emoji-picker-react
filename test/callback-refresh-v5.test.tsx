import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../src';
import { Categories } from '../src/config/categoryConfig';
import {
  List,
  Root,
  Search,
  Viewport,
  Reactions,
  Panel,
  SkinTone,
} from '../src/primitives';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const minimalEmojiData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      {
        n: ['face', 'grinning face with big eyes'],
        u: '1f603',
        a: '0.6',
      },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

const renderPicker = (props: Partial<Props> = {}) => {
  return render(
    <EmojiPicker
      emojiData={minimalEmojiData}
      categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
      {...props}
    />,
  );
};

const findVisibleEmojiButton = async (label: string) => {
  const buttons = await screen.findAllByLabelText(label);
  return (
    buttons.find(
      (button) => !button.getAttribute('style')?.includes('opacity'),
    ) ?? buttons[0]
  );
};

describe('v5 callback refresh (default picker)', () => {
  it('calls the latest onEmojiClick after a callback-only parent rerender', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderPicker({ onEmojiClick: first });

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(first).toHaveBeenCalledTimes(1);

    rerender(
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        onEmojiClick={second}
      />,
    );

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls the latest onReactionClick after a callback-only parent rerender', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const picker = (onReactionClick: (...args: never[]) => void) => (
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        reactionsDefaultOpen
        allowExpandReactions={false}
        onReactionClick={onReactionClick}
      />
    );
    const { rerender } = render(picker(first));

    const reactionsList = screen.getByRole('list', { name: /reactions/i });
    await userEvent.click(
      await within(reactionsList).findByLabelText(
        'grinning face with big eyes',
      ),
    );
    expect(first).toHaveBeenCalledTimes(1);

    rerender(picker(second));

    await userEvent.click(
      await within(
        screen.getByRole('list', { name: /reactions/i }),
      ).findByLabelText('grinning face with big eyes'),
    );
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls the latest onSkinToneChange after a callback-only parent rerender', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const picker = (onSkinToneChange: (...args: never[]) => void) => (
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        onSkinToneChange={onSkinToneChange}
      />
    );
    const { rerender } = render(picker(first));

    // fireEvent: the stacked fan buttons have no jsdom layout for
    // userEvent hit-testing across two open/select cycles.
    fireEvent.click(screen.getByLabelText('Skin tone NEUTRAL'));
    fireEvent.click(screen.getByLabelText('Skin tone MEDIUM'));
    expect(first).toHaveBeenCalledTimes(1);

    rerender(picker(second));

    fireEvent.click(screen.getByLabelText('Skin tone MEDIUM'));
    fireEvent.click(screen.getByLabelText('Skin tone DARK'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls the latest onSearchChange after a callback-only parent rerender', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const picker = (onSearchChange: (...args: never[]) => void) => (
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        onSearchChange={onSearchChange}
      />
    );
    const { rerender } = render(picker(first));
    const input = (await screen.findByRole('textbox')) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'a' } });
    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenLastCalledWith('a');

    rerender(picker(second));

    fireEvent.change(input, { target: { value: 'ab' } });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenLastCalledWith('ab');
  });

  it('calls the latest onReactionsModeChange after a callback-only parent rerender', async () => {
    const first = vi.fn();
    const second = vi.fn();
    let collapse: (() => void) | null = null;
    const picker = (onReactionsModeChange: (...args: never[]) => void) => (
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]}
        reactionsDefaultOpen
        onEmojiClick={(_emoji, _event, api) => {
          collapse = api?.collapseToReactions ?? null;
        }}
        onReactionsModeChange={onReactionsModeChange}
      />
    );
    const { rerender } = render(picker(first));

    await userEvent.click(screen.getByLabelText('Show all Emojis'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenLastCalledWith(false);

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(collapse).not.toBeNull();

    rerender(picker(second));
    await act(async () => {
      (collapse as unknown as () => void)();
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenLastCalledWith(true);
  });

  it('keeps bare Root callbacks fresh across parent rerenders', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const tree = (onEmojiClick: (...args: never[]) => void) => (
      <Root emojiData={minimalEmojiData} onEmojiClick={onEmojiClick}>
        <Reactions />
        <Panel>
          <Search>
            <SkinTone />
          </Search>
          <Viewport>
            <List />
          </Viewport>
        </Panel>
      </Root>
    );
    const { rerender } = render(tree(first));

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(first).toHaveBeenCalledTimes(1);

    rerender(tree(second));

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
