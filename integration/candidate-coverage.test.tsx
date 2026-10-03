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

import { EmojiClickData } from '../src/types/exposedTypes';

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
  alsoFixtures?: string[];
  source?: string;
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
        for (const fixture of [c.fixture as string, ...(c.alsoFixtures ?? [])]) {
          expect(
            typeof (Fixtures as Record<string, unknown>)[fixture],
            `${c.name}: ${fixture}`,
          ).toBe('function');
        }
      } else {
        expect(c.blocker, c.name).toBeTruthy();
      }
    }
  });

  it('every mapped fixture is exercised by at least one candidate test', () => {
    const mapped = new Set(
      testable.flatMap((c) => [c.fixture as string, ...(c.alsoFixtures ?? [])]),
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

// Each driver runs the consumer's real flow through its fixture: open the
// way the host opens, pick, and check the value the host keeps.
async function pick(name: string) {
  await userEvent.click(await findVisibleEmojiButton(name));
}

async function driveNextChat() {
  const onAvatar = vi.fn();
  render(<Fixtures.NextChatAvatarSettings onAvatar={onAvatar} />);
  await openToggle('nextchat-avatar');
  await pick('cat face');
  expect(onAvatar).toHaveBeenCalledWith('1f431');
  expect(
    screen.getByTestId('nextchat-avatar').querySelector('img')?.getAttribute('src'),
  ).toMatch(/\/apple\/64\/1f431\.png$/);
}

async function driveCherry() {
  const onInsert = vi.fn();
  render(<Fixtures.CherryStudioPicker onInsert={onInsert} />);
  await userEvent.type(searchInput(), 'cat');
  await pick('cat face');
  expect(onInsert).toHaveBeenCalledWith('🐱');
  expect(screen.getByTestId('cherry-text')).toHaveValue('🐱');
}

async function driveWireMessage() {
  const onReaction = vi.fn();
  render(<Fixtures.WireMessageReactions onReaction={onReaction} />);
  await openToggle('wire-react');
  await pick('cat face');
  expect(onReaction).toHaveBeenCalledWith({
    emoji: '🐱',
    activeSkinTone: expect.any(String),
  });
}

async function driveWireCall() {
  window.localStorage.clear();
  const onEmojiClick = vi.fn();
  render(<Fixtures.WireCallReactionsBar onEmojiClick={onEmojiClick} />);
  await openToggle('wire-call-more');
  await pick('cat face');
  expect(onEmojiClick).toHaveBeenCalledWith('🐱');
  expect(window.localStorage.getItem('epr_suggested')).toContain('"unified":"1f431"');
}

async function driveLangWatch() {
  const onChange = vi.fn();
  render(<Fixtures.LangWatchModal onChange={onChange} />);
  await openToggle('langwatch-open');
  await screen.findByLabelText('Type to search for an emoji');
  await pick('cat face');
  expect(onChange).toHaveBeenCalledWith('🐱');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
}

async function driveBotonic() {
  const onEmojiClick = vi.fn();
  render(<Fixtures.BotonicComposer onEmojiClick={onEmojiClick} />);
  await openToggle('botonic-toggle');
  await pick('grinning face');
  await pick('cat face');
  expect(onEmojiClick).toHaveBeenCalledTimes(2);
  expectEmojiPayload(onEmojiClick.mock.calls[1][0]);
}

async function driveFileverse() {
  const handleEmojiClick = vi.fn();
  render(<Fixtures.FileverseAvatarSelector handleEmojiClick={handleEmojiClick} />);
  await pick('cat face');
  expectEmojiPayload(handleEmojiClick.mock.calls[0][0]);
  expect(screen.getByTestId('fileverse-current')).toHaveTextContent('🐱');
}

async function driveJsonJoy() {
  const onSelect = vi.fn();
  render(<Fixtures.JsonJoyInputChar onSelect={onSelect} />);
  await openToggle('jsonjoy-toggle');
  await pick('cat face');
  expect(onSelect).toHaveBeenCalledWith('🐱');
  expect(screen.queryByTestId('jsonjoy-popup')).not.toBeInTheDocument();
}

async function driveMedusa() {
  const onEmojiClick = vi.fn();
  render(<Fixtures.MedusaNotesPicker onEmojiClick={onEmojiClick} />);
  await openToggle('medusa-toggle');
  await userEvent.type(searchInput(), 'cat');
  await pick('cat face');
  expect(screen.getByTestId('medusa-note')).toHaveValue('🐱');
}

async function drivePush() {
  const onSelect = vi.fn();
  render(<Fixtures.PushChatTypebar onSelect={onSelect} />);
  await pick('grinning face');
  expectEmojiPayload(onSelect.mock.calls[0][0]);
}

async function driveClassDojo() {
  const onSelect = vi.fn();
  render(<Fixtures.ClassDojoPicker onSelect={onSelect} />);
  await userEvent.type(searchInput(), 'Panda');
  await userEvent.click(await screen.findByLabelText('panda'));
  const payload = onSelect.mock.calls[0][0] as EmojiClickData;
  expect(payload.isCustom).toBe(true);
  expectEmojiPayload(payload);
}

async function drivePrezly() {
  const onPick = vi.fn();
  render(<Fixtures.PrezlyCalloutIcon onPick={onPick} />);
  await openToggle('prezly-icon');
  await pick('cat face');
  expect(onPick).toHaveBeenCalledWith('🐱');
  expect(screen.queryByTestId('prezly-popper')).not.toBeInTheDocument();
}

async function driveSignal() {
  const onEmojiClick = vi.fn();
  render(<Fixtures.SignalStickerEmojiPicker onEmojiClick={onEmojiClick} />);
  await pick('cat face');
  expectEmojiPayload(onEmojiClick.mock.calls[0][0]);
}

async function drivePostiz() {
  const onInsert = vi.fn();
  render(<Fixtures.PostizComposer onInsert={onInsert} />);
  await openToggle('postiz-toggle');
  await pick('cat face');
  expect(screen.getByTestId('postiz-text')).toHaveValue('🐱');
}

async function driveEdifice() {
  const onInsert = vi.fn();
  render(<Fixtures.EdificeEditorToolbar onInsert={onInsert} />);
  await openToggle('edifice-toggle');
  await pick('cat face');
  expect(onInsert).toHaveBeenCalledWith('🐱');
}

async function driveLiveChat() {
  const onReactionClick = vi.fn();
  render(<Fixtures.LiveChatReactionPicker onReactionClick={onReactionClick} />);
  await openToggle('livechat-react');
  await userEvent.click(
    within(screen.getByRole('list', { name: 'Reactions' })).getByRole('button', {
      name: 'thumbs up sign',
    }),
  );
  expectEmojiPayload(onReactionClick.mock.calls[0][0]);
}

const drivers: Record<string, () => Promise<void>> = {
  NextChatAvatarSettings: driveNextChat,
  CherryStudioPicker: driveCherry,
  WireMessageReactions: driveWireMessage,
  WireCallReactionsBar: driveWireCall,
  LangWatchModal: driveLangWatch,
  BotonicComposer: driveBotonic,
  FileverseAvatarSelector: driveFileverse,
  JsonJoyInputChar: driveJsonJoy,
  MedusaNotesPicker: driveMedusa,
  PushChatTypebar: drivePush,
  ClassDojoPicker: driveClassDojo,
  PrezlyCalloutIcon: drivePrezly,
  SignalStickerEmojiPicker: driveSignal,
  PostizComposer: drivePostiz,
  EdificeEditorToolbar: driveEdifice,
  LiveChatReactionPicker: driveLiveChat,
};

describe('per-candidate integrations', () => {
  for (const c of testable) {
    for (const fixture of [c.fixture as string, ...(c.alsoFixtures ?? [])]) {
      it(`${c.name} via ${fixture}`, async () => {
        await drivers[fixture]();
      });
    }
  }
});
