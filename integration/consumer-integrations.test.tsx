/**
 * Real-consumer integration tests for the picker under test (../src).
 *
 * Each fixture in ./fixtures.tsx reproduces a consumer's actual integration
 * code (props, callbacks, open/close behavior copied from the upstream file
 * it names). Each test drives that consumer's real user flow and asserts
 * the contract the consumer relies on: what it reads from the payload,
 * which legacy props it passes, what it persists or reads back, and how
 * its host closes.
 */
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SkinTones } from '../src';
import { EmojiClickData } from '../src/types/exposedTypes';

import {
  BotonicComposer,
  CherryStudioPicker,
  ClassDojoPicker,
  EdificeEditorToolbar,
  FileverseAvatarSelector,
  JsonJoyInputChar,
  LangWatchModal,
  LiveChatReactionPicker,
  MedusaNotesPicker,
  NextChatAvatarSettings,
  PostizComposer,
  PrezlyCalloutIcon,
  PushChatTypebar,
  SignalStickerEmojiPicker,
  WireCallReactionsBar,
  WireMessageReactions,
} from './fixtures';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

const SEARCH_LABEL = 'Type to search for an emoji';

/** The visible grid cell for an emoji name (skips hidden filtered copies). */
async function gridEmoji(name: string, scope: HTMLElement = document.body) {
  const cells = await within(scope).findAllByRole('gridcell', { name });
  return (
    cells.find((cell) => !cell.closest('[hidden]') && cell.style.display !== 'none') ??
    cells[0]
  );
}

function suggestedRow(container: HTMLElement, name: string) {
  return container.querySelector(
    `[role="rowgroup"][aria-label="${name}"]`,
  ) as HTMLElement | null;
}

function unifiedsIn(element: HTMLElement | null) {
  return Array.from(
    element?.querySelectorAll('button[data-epr-unified]') ?? [],
  ).map((button) => button.getAttribute('data-epr-unified'));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NextChat: avatar picker with its own CDN', () => {
  it('requests images from the CDN, stores e.unified, and renders it with <Emoji>', async () => {
    const getEmojiUrl = vi.fn(
      (unified: string, style: string) =>
        `https://fastly.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`,
    );
    const onAvatar = vi.fn();
    render(<NextChatAvatarSettings onAvatar={onAvatar} getEmojiUrl={getEmojiUrl} />);

    // The stored avatar renders as an image from NextChat's CDN (v4 did;
    // no emojiStyle is passed anywhere).
    const avatar = screen.getByTestId('nextchat-avatar');
    expect(avatar.querySelector('img')?.getAttribute('src')).toBe(
      'https://fastly.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f603.png',
    );

    await userEvent.click(avatar);
    const popover = screen.getByTestId('nextchat-popover');
    await gridEmoji('cat face', popover);
    expect(getEmojiUrl).toHaveBeenCalledWith(expect.any(String), 'apple');

    await userEvent.click(await gridEmoji('cat face', popover));
    expect(onAvatar).toHaveBeenCalledTimes(1);
    expect(onAvatar).toHaveBeenCalledWith('1f431');
    expect(screen.queryByTestId('nextchat-popover')).not.toBeInTheDocument();
    expect(avatar.querySelector('img')?.getAttribute('src')).toMatch(
      /\/apple\/64\/1f431\.png$/,
    );
  });
});

describe('Cherry Studio: app-owned recents passed as characters', () => {
  it('shows stored characters as Recently used and inserts picks', async () => {
    const onInsert = vi.fn();
    const { container } = render(<CherryStudioPicker onInsert={onInsert} />);
    await screen.findByRole('grid');

    // Recents are the characters Cherry stores (🧠, 📁), resolved in order.
    expect(unifiedsIn(suggestedRow(container, 'Recently used'))).toEqual([
      '1f9e0',
      '1f4c1',
    ]);
    // autoFocusSearch: typing goes straight into search.
    expect(screen.getByLabelText(SEARCH_LABEL)).toHaveFocus();
    expect(screen.getByLabelText(SEARCH_LABEL)).toHaveAttribute(
      'placeholder',
      'Search emoji',
    );

    await userEvent.click(await gridEmoji('cat face'));
    expect(onInsert).toHaveBeenCalledWith('🐱');
    expect(screen.getByTestId('cherry-text')).toHaveValue('🐱');
    // The app's recents update flows back in as the first suggestion.
    await vi.waitFor(() =>
      expect(unifiedsIn(suggestedRow(container, 'Recently used'))).toEqual([
        '1f431',
        '1f9e0',
        '1f4c1',
      ]),
    );
  });

  it('honors hiddenEmojis, CSS variables through style, and full-size layout', async () => {
    const { container } = render(<CherryStudioPicker hiddenEmojis={['1f9e0']} />);
    await screen.findByRole('grid');
    expect(unifiedsIn(suggestedRow(container, 'Recently used'))).toEqual(['1f4c1']);
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.style.getPropertyValue('--epr-highlight-color')).toBe('#4f46e5');
    expect(aside.style.width).toBe('100%');
    expect(aside.style.height).toBe('100%');
    expect(aside.className).toContain('cherry-emoji-picker-react');
  });
});

describe('Wire: message reactions adapter', () => {
  it('passes searchPlaceHolder and defaultSkinTone, and reads activeSkinTone', async () => {
    const onReaction = vi.fn();
    render(<WireMessageReactions onReaction={onReaction} />);
    await userEvent.click(screen.getByTestId('wire-react'));

    expect(screen.getByLabelText(SEARCH_LABEL)).toHaveAttribute(
      'placeholder',
      'Search Emoji',
    );
    await userEvent.click(await gridEmoji('thumbs up sign'));

    expect(onReaction).toHaveBeenCalledTimes(1);
    expect(onReaction.mock.calls[0][0]).toEqual({
      emoji: '👍🏽',
      activeSkinTone: SkinTones.MEDIUM,
    });
    expect(screen.getByTestId('wire-reactions')).toHaveTextContent('👍🏽');
  });
});

describe("Wire: calling reactions bar reads the picker's recents", () => {
  it('a pick persists to epr_suggested in the shape Wire parses, and leads the bar', async () => {
    const onEmojiClick = vi.fn();
    const { unmount } = render(<WireCallReactionsBar onEmojiClick={onEmojiClick} />);
    await userEvent.click(screen.getByTestId('wire-call-more'));
    await userEvent.click(await gridEmoji('cat face'));

    expect(onEmojiClick).toHaveBeenCalledWith('🐱');
    // Picking closes the picker and returns to the bar.
    expect(await screen.findByTestId('wire-call-bar')).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem('epr_suggested') ?? '[]');
    expect(stored).toEqual([
      expect.objectContaining({ unified: '1f431', original: '1f431', count: 1 }),
    ]);

    // Wire re-reads storage on render: the recent pick comes first.
    unmount();
    render(<WireCallReactionsBar />);
    const buttons = within(screen.getByTestId('wire-call-bar')).getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('🐱');
  });

  it('a mousedown outside closes the picker', async () => {
    render(<WireCallReactionsBar />);
    await userEvent.click(screen.getByTestId('wire-call-more'));
    expect(screen.getByRole('dialog', { name: 'Pick a reaction' })).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('wire-call-sent'));
    expect(screen.queryByRole('dialog', { name: 'Pick a reaction' })).not.toBeInTheDocument();
  });
});

describe('LangWatch: deferred default import in a modal', () => {
  it('loads lazily, accepts string-cast enum values, sets the icon and closes', async () => {
    const onChange = vi.fn();
    render(<LangWatchModal onChange={onChange} />);
    await userEvent.click(screen.getByTestId('langwatch-open'));
    const dialog = screen.getByRole('dialog', { name: 'Workflow Icon' });

    await within(dialog).findByRole('grid');
    // skinTonePickerLocation "PREVIEW": the skin tone control sits in the
    // preview, not beside search.
    const preview = dialog.querySelector('[data-epr-part="preview"]') as HTMLElement;
    expect(preview.querySelector('[data-epr-part="skin-tone"]')).not.toBeNull();

    await userEvent.click(await gridEmoji('smiling face with smiling eyes', dialog));
    expect(onChange).toHaveBeenCalledWith('😊');
    expect(screen.getByTestId('langwatch-result')).toHaveTextContent('😊');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Botonic: webchat composer', () => {
  it('does not steal focus, stays open for repeated picks, closes on outside click', async () => {
    const onEmojiClick = vi.fn();
    render(<BotonicComposer onEmojiClick={onEmojiClick} />);
    await userEvent.click(screen.getByTestId('botonic-toggle'));
    await screen.findByRole('grid');

    // autoFocusSearch={false}
    expect(screen.getByLabelText(SEARCH_LABEL)).not.toHaveFocus();
    // No preview.
    expect(document.querySelector('[data-epr-part="preview"]')).toBeNull();

    await userEvent.click(await gridEmoji('grinning face'));
    await userEvent.click(await gridEmoji('cat face'));
    expect(onEmojiClick).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('botonic-message')).toHaveTextContent('😀🐱');
    expect(screen.getByRole('dialog', { name: 'Emoji picker' })).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('botonic-message'));
    expect(screen.queryByRole('dialog', { name: 'Emoji picker' })).not.toBeInTheDocument();
  });
});

describe('Fileverse: AvatarSelector', () => {
  it('passes the full EmojiClickData and survives tab switches', async () => {
    const handleEmojiClick = vi.fn();
    render(<FileverseAvatarSelector handleEmojiClick={handleEmojiClick} />);
    await userEvent.click(await gridEmoji('cat face'));

    const payload = handleEmojiClick.mock.calls[0][0] as EmojiClickData;
    expect(payload).toMatchObject({
      emoji: '🐱',
      unified: '1f431',
      isCustom: false,
    });
    expect(typeof payload.getImageUrl).toBe('function');
    expect(screen.getByTestId('fileverse-current')).toHaveTextContent('🐱');

    await userEvent.click(screen.getByRole('tab', { name: 'Upload' }));
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Emoji' }));
    expect(await screen.findByRole('grid')).toBeInTheDocument();
  });
});

describe('json-joy: InputChar popup', () => {
  it('sets the character and closes the popup', async () => {
    const onSelect = vi.fn();
    render(<JsonJoyInputChar onSelect={onSelect} />);
    await userEvent.click(screen.getByTestId('jsonjoy-toggle'));
    await userEvent.type(screen.getByLabelText(SEARCH_LABEL), 'cat');
    await userEvent.click(await gridEmoji('cat face'));
    expect(onSelect).toHaveBeenCalledWith('🐱');
    expect(screen.getByTestId('jsonjoy-text')).toHaveValue('🐱');
    expect(screen.queryByTestId('jsonjoy-popup')).not.toBeInTheDocument();
  });

  it('follows the app theme flag', async () => {
    const { container } = render(<JsonJoyInputChar light={false} />);
    await userEvent.click(screen.getByTestId('jsonjoy-toggle'));
    await screen.findByRole('grid');
    expect(container.querySelector('aside')?.className).toMatch(/dark/i);
  });
});

describe('Medusa: notes dropdown', () => {
  it('keeps the legacy searchPlaceHolder, hides skin tones, appends and closes', async () => {
    const onEmojiClick = vi.fn();
    render(<MedusaNotesPicker onEmojiClick={onEmojiClick} />);
    await userEvent.click(screen.getByTestId('medusa-toggle'));
    expect(screen.getByLabelText(SEARCH_LABEL)).toHaveAttribute(
      'placeholder',
      'Search Emoji...',
    );
    expect(document.querySelector('[data-epr-part="skin-tone"]')).toBeNull();

    await userEvent.click(await gridEmoji('grinning face'));
    expect(onEmojiClick).toHaveBeenCalledWith('😀');
    expect(screen.getByTestId('medusa-note')).toHaveValue('😀');
    expect(screen.queryByTestId('medusa-dropdown')).not.toBeInTheDocument();
  });
});

describe('Push Chat: removed pickerStyle', () => {
  it('style applies; the legacy prop is dropped with a warning, never leaked', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onSelect = vi.fn();
    const { container } = render(
      <PushChatTypebar legacyPickerStyle onSelect={onSelect} />,
    );
    const aside = container.querySelector('aside') as HTMLElement;
    expect(aside.style.backgroundColor).toBe('rgb(1, 2, 3)');
    // React lowercases unknown attributes, so check case-insensitively.
    expect(container.innerHTML.toLowerCase()).not.toContain('pickerstyle');
    expect(error).not.toHaveBeenCalled();
    expect(String(warn.mock.calls[0]?.[0])).toContain('pickerStyle');

    await userEvent.click(await gridEmoji('grinning face'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('push-draft')).toHaveTextContent('😀');
  });
});

describe('ClassDojo: custom emojis in search', () => {
  it('finds the custom emoji by any case and reports isCustom', async () => {
    const onSelect = vi.fn();
    render(<ClassDojoPicker onSelect={onSelect} />);
    await userEvent.type(screen.getByLabelText(SEARCH_LABEL), 'Panda');
    await userEvent.click(await gridEmoji('panda'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({
      isCustom: true,
      unified: 'panda',
    });
    expect(screen.getByTestId('classdojo-picked')).toHaveTextContent('custom:panda');
  });
});

describe('Prezly: callout icon picker', () => {
  it('renders Apple images, sets the icon and closes', async () => {
    const onPick = vi.fn();
    const { container } = render(<PrezlyCalloutIcon onPick={onPick} />);
    await userEvent.click(screen.getByTestId('prezly-icon'));
    const popper = screen.getByTestId('prezly-popper');
    await within(popper).findByRole('grid');
    expect(popper.querySelector('img')).not.toBeNull();
    expect(container.querySelector('aside')?.style.width).toBe('275px');

    await userEvent.click(await gridEmoji('cat face', popper));
    expect(onPick).toHaveBeenLastCalledWith('🐱');
    expect(screen.getByTestId('prezly-icon')).toHaveTextContent('🐱');
    expect(screen.queryByTestId('prezly-popper')).not.toBeInTheDocument();
  });

  it('closes on a click outside', async () => {
    render(<PrezlyCalloutIcon />);
    await userEvent.click(screen.getByTestId('prezly-icon'));
    expect(screen.getByTestId('prezly-popper')).toBeInTheDocument();
    await act(async () => {
      document.body.click();
    });
    expect(screen.queryByTestId('prezly-popper')).not.toBeInTheDocument();
  });
});

describe('Signal: the fork usage run against upstream', () => {
  it('accepts the fork-era props and reports the pick', async () => {
    const onEmojiClick = vi.fn();
    const { container } = render(
      <SignalStickerEmojiPicker onEmojiClick={onEmojiClick} />,
    );
    await screen.findByRole('grid');
    expect(screen.getByLabelText(SEARCH_LABEL)).toHaveAttribute(
      'placeholder',
      'Search emoji',
    );
    expect(
      container.querySelector('[role="rowgroup"][aria-label="Category: animals_nature"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-epr-part="preview"]')).toBeNull();
    expect(container.querySelector('[data-epr-part="skin-tone"]')).toBeNull();

    await userEvent.click(await gridEmoji('cat face'));
    expect(onEmojiClick.mock.calls[0][0]).toMatchObject({ emoji: '🐱' });
    expect(screen.getByTestId('signal-picked')).toHaveTextContent('🐱');
  });
});

describe('Postiz: picker toggled through the open prop', () => {
  it('mounts on open, inserts, closes; the stored mode string sets the theme', async () => {
    const onInsert = vi.fn();
    const { container } = render(<PostizComposer onInsert={onInsert} mode="light" />);
    expect(container.querySelector('aside')).toBeNull();

    await userEvent.click(screen.getByTestId('postiz-toggle'));
    await screen.findByRole('grid');
    // "light" is the base appearance: no dark/auto theme class.
    expect(container.querySelector('aside')?.className).not.toMatch(/dark/i);

    await userEvent.click(await gridEmoji('cat face'));
    expect(onInsert).toHaveBeenCalledWith('🐱');
    expect(screen.getByTestId('postiz-text')).toHaveValue('🐱');
    expect(container.querySelector('aside')).toBeNull();

    // Reopening through the prop works again.
    await userEvent.click(screen.getByTestId('postiz-toggle'));
    expect(await screen.findByRole('grid')).toBeInTheDocument();
  });

  it('falls back to dark with no stored mode', async () => {
    const { container } = render(<PostizComposer />);
    await userEvent.click(screen.getByTestId('postiz-toggle'));
    await screen.findByRole('grid');
    expect(container.querySelector('aside')?.className).toMatch(/dark/i);
  });
});

describe('Edifice: editor toolbar insertion', () => {
  it('inserts at the editor selection with search disabled and translated recents first', async () => {
    window.localStorage.setItem(
      'epr_suggested',
      JSON.stringify([{ unified: '1f9e0', original: '1f9e0', count: 3 }]),
    );
    const onInsert = vi.fn();
    const { container } = render(<EdificeEditorToolbar onInsert={onInsert} />);
    const editor = screen.getByTestId('edifice-text') as HTMLTextAreaElement;
    editor.setSelectionRange(5, 5); // after "Hello"

    await userEvent.click(screen.getByTestId('edifice-toggle'));
    await screen.findByRole('grid');
    expect(screen.queryByLabelText(SEARCH_LABEL)).toBeNull();
    const rows = Array.from(container.querySelectorAll('[role="rowgroup"]')).map(
      (row) => row.getAttribute('aria-label'),
    );
    expect(rows[0]).toBe('Récemment utilisés');
    expect(unifiedsIn(suggestedRow(container, 'Récemment utilisés'))).toEqual(['1f9e0']);

    await userEvent.click(await gridEmoji('cat face'));
    expect(onInsert).toHaveBeenCalledWith('🐱');
    expect(editor).toHaveValue('Hello🐱 world');
  });
});

describe('RealtimeX live chat: reactions handled by onEmojiClick', () => {
  it('a reaction click reaches onEmojiClick (no onReactionClick) and closes', async () => {
    const onReactionClick = vi.fn();
    render(<LiveChatReactionPicker onReactionClick={onReactionClick} />);
    await userEvent.click(screen.getByTestId('livechat-react'));
    const bar = screen.getByRole('list', { name: 'Reactions' });
    await userEvent.click(within(bar).getByRole('button', { name: 'red heart' }));
    expect(onReactionClick).toHaveBeenCalledTimes(1);
    expect(onReactionClick.mock.calls[0][0]).toMatchObject({ unified: '2764-fe0f' });
    expect(screen.getByTestId('livechat-reactions')).toHaveTextContent('❤️');
    expect(screen.queryByTestId('livechat-popover')).not.toBeInTheDocument();
  });

  it('expands to the full picker and picks from it', async () => {
    const onReactionClick = vi.fn();
    render(<LiveChatReactionPicker onReactionClick={onReactionClick} />);
    await userEvent.click(screen.getByTestId('livechat-react'));
    await userEvent.click(screen.getByLabelText('Show all Emojis'));
    await userEvent.click(await gridEmoji('cat face'));
    expect(onReactionClick.mock.calls[0][0]).toMatchObject({ emoji: '🐱' });
    expect(screen.queryByTestId('livechat-popover')).not.toBeInTheDocument();
  });
});
