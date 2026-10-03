/**
 * Per-candidate integration coverage, driven by integration/manifest.json.
 *
 * Every manifest entry with disposition `runnable` or
 * `covered-by-shared-fixture` gets a real executed test through its mapped
 * fixture's production boundary (open through the real flow, search +
 * select a known emoji, exactly-one callback with a valid public payload,
 * host state updated). Entries that are `documented-only` / `excluded`
 * have no executable boundary (no public source, unknown surface, removed
 * package) and are covered instead by the manifest-accounting test below,
 * which fails if any entry lacks a disposition, a fixture mapping, or a
 * blocker note.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Categories } from '../src/config/categoryConfig';
import { EmojiClickData, EmojiStyle } from '../src/types/exposedTypes';

import * as Fixtures from './fixtures';
import manifest from './manifest.json';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const searchInput = () =>
  screen.getByLabelText('Type to search for an emoji');

async function findVisibleEmojiButton(label: string) {
  const buttons = await screen.findAllByLabelText(label);
  return (
    buttons.find(
      (button) => !button.getAttribute('style')?.includes('opacity'),
    ) ?? buttons[0]
  );
}

function expectEmojiPayload(emoji: EmojiClickData) {
  // Standard emojis carry hex unifieds; customs carry their string id.
  expect(emoji.unified).toBeTruthy();
  if (!emoji.isCustom) {
    expect(emoji.unified).toMatch(/^[0-9a-f-]+$/);
  }
  expect(emoji.emoji).toBeTruthy();
  expect(Array.isArray(emoji.names)).toBe(true);
  expect(typeof emoji.getImageUrl).toBe('function');
  expect(typeof emoji.isCustom).toBe('boolean');
}

async function openToggle(toggleId: string) {
  await userEvent.click(screen.getByTestId(toggleId));
}

type Candidate = {
  name: string;
  disposition: string;
  fixture?: string;
  blocker?: string;
};

const testable = (manifest.candidates as Candidate[]).filter((c) =>
  ['runnable', 'covered-by-shared-fixture'].includes(c.disposition),
);

describe('manifest accounting', () => {
  it('every candidate has a disposition and every testable entry maps to a real fixture', () => {
    const known = new Set([
      'runnable',
      'covered-by-shared-fixture',
      'documented-only',
      'excluded',
    ]);
    for (const c of manifest.candidates as Candidate[]) {
      expect(known.has(c.disposition), c.name).toBe(true);
      if (c.disposition === 'runnable' || c.disposition === 'covered-by-shared-fixture') {
        expect(c.fixture, c.name).toBeTruthy();
        expect(
          typeof (Fixtures as Record<string, unknown>)[c.fixture as string],
          c.name,
        ).toBe('function');
      } else {
        expect(c.blocker, c.name).toBeTruthy();
      }
    }
  });

  it('every mapped fixture is exercised by at least one candidate test', () => {
    const mapped = new Set(
      testable.map((c) => c.fixture as string),
    );
    for (const name of Object.keys(drivers)) {
      expect(mapped.has(name), name).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Per-fixture drivers: one real flow each. Candidate tests below only supply
// the candidate label; the boundary exercised is the fixture's.
// ---------------------------------------------------------------------------

async function driveNextChat() {
  const onSelect = vi.fn();
  render(<Fixtures.NextChatComposer onSelect={onSelect} />);
  await openToggle('nextchat-toggle');
  await userEvent.type(searchInput(), 'grinning');
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.getByTestId('nextchat-input')).toHaveValue(
    onSelect.mock.calls[0][0].emoji,
  );
}

async function driveCherry() {
  const onSelect = vi.fn();
  render(<Fixtures.CherryStudioInput onSelect={onSelect} />);
  await userEvent.type(searchInput(), 'cat');
  await userEvent.click(await findVisibleEmojiButton('cat'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.getByTestId('cherry-text')).toHaveValue(
    onSelect.mock.calls[0][0].emoji,
  );
}

async function driveWire() {
  const onReaction = vi.fn();
  render(<Fixtures.WireReactions onReaction={onReaction} />);
  const reactionsList = screen.getByRole('list', { name: /reactions/i });
  const reaction = await within(reactionsList).findByLabelText(
    'grinning face with big eyes',
  );
  await userEvent.click(reaction);
  expect(onReaction).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onReaction.mock.calls[0][0]);
  expect(screen.getByTestId('wire-reaction-row')).toHaveTextContent(
    onReaction.mock.calls[0][0].emoji,
  );
}

async function driveLangWatch() {
  const onSelect = vi.fn();
  render(<Fixtures.LangWatchModal onSelect={onSelect} />);
  await openToggle('langwatch-open');
  await screen.findByLabelText('Type to search for an emoji');
  await userEvent.type(searchInput(), 'smiling face with smiling eyes');
  await userEvent.click(
    await findVisibleEmojiButton('smiling face with smiling eyes'),
  );
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
}

async function driveBotonic() {
  const onSelect = vi.fn();
  render(<Fixtures.BotonicComposer onSelect={onSelect} />);
  await userEvent.type(searchInput(), 'grinning face');
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  await userEvent.clear(searchInput());
  await userEvent.type(searchInput(), 'cat');
  await userEvent.click(await findVisibleEmojiButton('cat'));
  expect(onSelect).toHaveBeenCalledTimes(2);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expectEmojiPayload(onSelect.mock.calls[1][0]);
}

async function driveFileverse() {
  const onSelect = vi.fn();
  render(
    <Fixtures.FileverseEmojiPicker
      emojiData={Fixtures.fixtureEmojiData}
      categories={[Categories.SMILEYS_PEOPLE]}
      searchPlaceholder="Search library"
      onEmojiClick={onSelect}
    />,
  );
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
}

async function driveJsonJoy() {
  const onSelect = vi.fn();
  render(<Fixtures.JsonJoyInputChar onSelect={onSelect} />);
  await openToggle('jsonjoy-toggle');
  await userEvent.type(searchInput(), 'grinning face');
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.getByTestId('jsonjoy-text')).toHaveTextContent(
    onSelect.mock.calls[0][0].emoji,
  );
}

async function driveMedusa() {
  const onSelect = vi.fn();
  render(<Fixtures.MedusaNotesPicker onSelect={onSelect} />);
  await openToggle('medusa-toggle');
  await userEvent.type(searchInput(), 'cat');
  await userEvent.click(await findVisibleEmojiButton('cat'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.getByTestId('medusa-note')).toHaveValue(
    onSelect.mock.calls[0][0].emoji,
  );
}

async function drivePush() {
  const onSelect = vi.fn();
  render(<Fixtures.PushChatTypebar onSelect={onSelect} />);
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expectEmojiPayload(onSelect.mock.calls[0][0]);
  expect(screen.getByTestId('push-draft')).toHaveTextContent(
    onSelect.mock.calls[0][0].emoji,
  );
}

async function driveClassDojo() {
  const onSelect = vi.fn();
  render(<Fixtures.ClassDojoPicker onSelect={onSelect} />);
  await userEvent.type(searchInput(), 'Panda');
  await userEvent.click(await screen.findByLabelText('panda'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  const payload = onSelect.mock.calls[0][0] as EmojiClickData;
  expect(payload.isCustom).toBe(true);
  expectEmojiPayload(payload);
}

async function driveSignal() {
  const onSelect = vi.fn();
  render(<Fixtures.SignalStickerPicker onSelect={onSelect} />);
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  const payload = onSelect.mock.calls[0][0] as EmojiClickData;
  expectEmojiPayload(payload);
  expect(payload.getImageUrl(EmojiStyle.APPLE)).toBe(
    'https://example.com/sheets/apple/1f600.png',
  );
}

async function driveSlate() {
  const onSelect = vi.fn();
  render(<Fixtures.SlateComposer onSelect={onSelect} />);
  const editor = screen.getByTestId('slate-editor');
  editor.textContent = 'Hello';
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  await openToggle('slate-toggle');
  await userEvent.type(searchInput(), 'grinning face');
  await userEvent.click(await findVisibleEmojiButton('grinning face'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  const payload = onSelect.mock.calls[0][0] as EmojiClickData;
  expectEmojiPayload(payload);
  expect(editor.textContent).toBe(`Hello${payload.emoji}`);
}

const drivers: Record<string, () => Promise<void>> = {
  NextChatComposer: driveNextChat,
  CherryStudioInput: driveCherry,
  WireReactions: driveWire,
  LangWatchModal: driveLangWatch,
  BotonicComposer: driveBotonic,
  FileverseEmojiPicker: driveFileverse,
  JsonJoyInputChar: driveJsonJoy,
  MedusaNotesPicker: driveMedusa,
  PushChatTypebar: drivePush,
  ClassDojoPicker: driveClassDojo,
  SignalStickerPicker: driveSignal,
  SlateComposer: driveSlate,
};

describe('per-candidate integrations', () => {
  for (const c of testable) {
    it(`${c.name} via ${c.fixture}`, async () => {
      await drivers[c.fixture as string]();
    });
  }
});
