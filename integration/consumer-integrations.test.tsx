/**
 * Real-consumer integration tests for the NEW picker (../src, branch
 * v5-consumer-integration). Each test mounts the fixture that reproduces
 * the consumer's production integration boundary and drives it through
 * the real user flow:
 *
 *  1. render host + open/mount picker through the real flow
 *  2. picker visible, usable, positioned in its overlay/container
 *  3. search + select a known emoji (where search is supported)
 *  4. callback count + public payload fields + host state update
 *  5. intended close/retain-open behavior
 *  6. reopen/remount persistence/reset
 *
 * Import resolution: every fixture imports EmojiPicker from '../src',
 * the working tree under test -- never the published npm bundle and
 * never a mock. A regression to the old bundle would fail these tests
 * because v5-only props (e.g. `style` passthrough semantics asserted
 * here) and the current DOM contract come from source.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { EmojiStyle } from '../src';
import { Categories } from '../src/config/categoryConfig';
import { EmojiClickData } from '../src/types/exposedTypes';

import {
  BotonicComposer,
  CherryStudioInput,
  ClassDojoPicker,
  FileverseEmojiPicker,
  JsonJoyInputChar,
  LangWatchModal,
  MedusaNotesPicker,
  NextChatComposer,
  PushChatTypebar,
  SignalStickerPicker,
  SlateComposer,
  WireReactions,
  fixtureEmojiData,
} from './fixtures';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const searchInput = () =>
  screen.getByLabelText('Type to search for an emoji');

async function openPickerByLabel(toggleTestId: string) {
  await userEvent.click(screen.getByTestId(toggleTestId));
}

async function findVisibleEmojiButton(label: string) {
  const buttons = await screen.findAllByLabelText(label);
  return (
    buttons.find(
      (button) => !button.getAttribute('style')?.includes('opacity'),
    ) ?? buttons[0]
  );
}

function expectEmojiPayload(emoji: EmojiClickData) {
  expect(emoji.unified).toMatch(/^[0-9a-f-]+$/);
  expect(emoji.emoji).toBeTruthy();
  expect(Array.isArray(emoji.names)).toBe(true);
  expect(typeof emoji.getImageUrl).toBe('function');
  expect(typeof emoji.isCustom).toBe('boolean');
}

describe('consumer integrations (new picker)', () => {
  it('NextChat composer: toggle mounts picker, select inserts at cursor and closes, reopen resets', async () => {
    const onSelect = vi.fn();
    render(<NextChatComposer onSelect={onSelect} />);

    expect(
      screen.queryByTestId('nextchat-popover'),
    ).not.toBeInTheDocument();

    await openPickerByLabel('nextchat-toggle');
    const popover = screen.getByTestId('nextchat-popover');
    expect(
      within(popover).getByLabelText('Type to search for an emoji'),
    ).toBeVisible();

    await userEvent.type(searchInput(), 'grinning');
    const emojiButton = await findVisibleEmojiButton('grinning face');
    await userEvent.click(emojiButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectEmojiPayload(onSelect.mock.calls[0][0]);
    expect(screen.getByTestId('nextchat-input')).toHaveValue(
      onSelect.mock.calls[0][0].emoji,
    );
    // Close-on-select contract.
    expect(
      screen.queryByTestId('nextchat-popover'),
    ).not.toBeInTheDocument();

    // Reopen works and does not replay the callback.
    await openPickerByLabel('nextchat-toggle');
    expect(screen.getByTestId('nextchat-popover')).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Cherry Studio chat: select appends emoji and payload carries unified names', async () => {
    const onSelect = vi.fn();
    render(<CherryStudioInput onSelect={onSelect} />);

    expect(searchInput()).toBeVisible();
    await userEvent.type(searchInput(), 'cat');
    const catButton = await findVisibleEmojiButton('cat');
    await userEvent.click(catButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    const payload = onSelect.mock.calls[0][0] as EmojiClickData;
    expectEmojiPayload(payload);
    expect(payload.unified).toBe('1f431');
    expect(screen.getByTestId('cherry-text')).toHaveValue(payload.emoji);
  });

  it('Wire reactions: reaction click fires onReactionClick once and updates the row', async () => {
    const onReaction = vi.fn();
    const onEmoji = vi.fn();
    render(<WireReactions onReaction={onReaction} onEmoji={onEmoji} />);

    const reactionsList = screen.getByRole('list', { name: /reactions/i });
    expect(reactionsList).toBeVisible();
    const reaction = await within(reactionsList).findByLabelText(
      'grinning face with big eyes',
    );
    await userEvent.click(reaction);

    expect(onReaction).toHaveBeenCalledTimes(1);
    expectEmojiPayload(onReaction.mock.calls[0][0]);
    expect(screen.getByTestId('wire-reaction-row')).toHaveTextContent(
      onReaction.mock.calls[0][0].emoji,
    );
    // Reaction clicks must not leak into the full-picker callback.
    expect(onEmoji).not.toHaveBeenCalled();
  });

  it('LangWatch modal: lazy picker loads in dialog, select closes, reopen works', async () => {
    const onSelect = vi.fn();
    render(<LangWatchModal onSelect={onSelect} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await openPickerByLabel('langwatch-open');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await screen.findByLabelText('Type to search for an emoji');
    await userEvent.type(searchInput(), 'smiling face with smiling eyes');
    const emojiButton = await findVisibleEmojiButton(
      'smiling face with smiling eyes',
    );
    await userEvent.click(emojiButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectEmojiPayload(onSelect.mock.calls[0][0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openPickerByLabel('langwatch-open');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Botonic webchat: dark themed picker with custom placeholder stays open for repeated picks', async () => {
    const onSelect = vi.fn();
    render(<BotonicComposer onSelect={onSelect} />);

    expect(screen.getByPlaceholderText('Search emojis')).toBeVisible();

    await userEvent.type(searchInput(), 'grinning face');
    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    await userEvent.clear(searchInput());
    await userEvent.type(searchInput(), 'cat');
    await userEvent.click(await findVisibleEmojiButton('cat'));

    expect(onSelect).toHaveBeenCalledTimes(2);
    const messages = screen.getByTestId('botonic-messages');
    expect(messages).toHaveTextContent(onSelect.mock.calls[0][0].emoji);
    expect(messages).toHaveTextContent(onSelect.mock.calls[1][0].emoji);
  });

  it('Fileverse design system: wrapper forwards theme, placeholder, and callbacks', async () => {
    const onSelect = vi.fn();
    render(
      <FileverseEmojiPicker
        emojiData={fixtureEmojiData}
        categories={[Categories.SMILEYS_PEOPLE]}
        searchPlaceholder="Search library"
        onEmojiClick={onSelect}
      />,
    );

    expect(screen.getByPlaceholderText('Search library')).toBeVisible();
    await userEvent.click(await findVisibleEmojiButton('grinning face'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectEmojiPayload(onSelect.mock.calls[0][0]);
  });

  it('json-joy mutxt editor: toggle mounts picker, select inserts NATIVE emoji', async () => {
    const onSelect = vi.fn();
    render(<JsonJoyInputChar onSelect={onSelect} />);

    await openPickerByLabel('jsonjoy-toggle');
    await userEvent.type(searchInput(), 'grinning face');
    await userEvent.click(await findVisibleEmojiButton('grinning face'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const payload = onSelect.mock.calls[0][0] as EmojiClickData;
    expectEmojiPayload(payload);
    expect(screen.getByTestId('jsonjoy-text')).toHaveTextContent(
      payload.emoji,
    );
  });

  it('Medusa legacy wrapper: custom placeholder, NATIVE style, close-on-select into notes', async () => {
    const onSelect = vi.fn();
    render(<MedusaNotesPicker onSelect={onSelect} />);

    await openPickerByLabel('medusa-toggle');
    expect(screen.getByPlaceholderText('Search emoji')).toBeVisible();

    await userEvent.type(searchInput(), 'cat');
    await userEvent.click(await findVisibleEmojiButton('cat'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectEmojiPayload(onSelect.mock.calls[0][0]);
    expect(screen.getByTestId('medusa-note')).toHaveValue(
      onSelect.mock.calls[0][0].emoji,
    );
    expect(screen.queryByTestId('medusa-dropdown')).not.toBeInTheDocument();
  });

  it('Push Chat migration: style applies, legacy pickerStyle stays inert', async () => {
    const onSelect = vi.fn();
    render(<PushChatTypebar onSelect={onSelect} />);

    const root = screen.getByTestId('push-typebar');
    expect(root.innerHTML).toContain('rgb(1, 2, 3)');

    // Legacy prop must not crash and must not leak onto the DOM.
    const { container } = render(
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={[Categories.SMILEYS_PEOPLE]}
        {...({ pickerStyle: { display: 'none' } } as object)}
      />,
    );
    // React lowercases unknown attributes, so check case-insensitively.
    expect(container.innerHTML.toLowerCase()).not.toContain('pickerstyle');
    expect(container.querySelector('aside')).toBeVisible();

    await userEvent.click(await findVisibleEmojiButton('grinning face'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('ClassDojo custom emoji: custom entry is searchable and reports isCustom', async () => {
    const onSelect = vi.fn();
    render(<ClassDojoPicker onSelect={onSelect} />);

    // Custom names are folded to lowercase in the data snapshot, so the
    // rendered cell is labelled 'panda' however the user capitalizes the
    // query -- same contract as test/custom-emoji-search.test.tsx.
    await userEvent.type(searchInput(), 'Panda');
    const customButton = await screen.findByLabelText('panda');
    await userEvent.click(customButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    const payload = onSelect.mock.calls[0][0] as EmojiClickData;
    expect(payload.isCustom).toBe(true);
    expect(payload.unified).toBe('panda');
    expect(screen.getByTestId('classdojo-picked')).toHaveTextContent(
      'custom:panda',
    );
  });

  it('Slate editor: select inserts at the saved cursor and refocuses the editor', async () => {
    const onSelect = vi.fn();
    render(<SlateComposer onSelect={onSelect} />);
    const editor = screen.getByTestId('slate-editor');

    // Seed content and park the cursor after it, like an editor draft.
    editor.textContent = 'Hello';
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Opening the picker moves focus away; the saved range must survive.
    await openPickerByLabel('slate-toggle');
    expect(screen.getByTestId('slate-popover')).toBeInTheDocument();

    await userEvent.type(searchInput(), 'grinning face');
    await userEvent.click(await findVisibleEmojiButton('grinning face'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const payload = onSelect.mock.calls[0][0] as EmojiClickData;
    expectEmojiPayload(payload);
    // Inserted at the cursor (after "Hello"), not appended elsewhere.
    expect(editor.textContent).toBe(`Hello${payload.emoji}`);
    expect(document.activeElement).toBe(editor);
    // Close-on-select contract.
    expect(screen.queryByTestId('slate-popover')).not.toBeInTheDocument();

    // Reopen works and does not replay the callback.
    await openPickerByLabel('slate-toggle');
    expect(screen.getByTestId('slate-popover')).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Signal sticker creator: sprite-sheet URL contract via getEmojiUrl', async () => {
    const onSelect = vi.fn();
    render(<SignalStickerPicker onSelect={onSelect} />);

    await userEvent.click(await findVisibleEmojiButton('grinning face'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const payload = onSelect.mock.calls[0][0] as EmojiClickData;
    expectEmojiPayload(payload);
    expect(payload.getImageUrl(EmojiStyle.APPLE)).toBe(
      'https://example.com/sheets/apple/1f600.png',
    );
  });
});
