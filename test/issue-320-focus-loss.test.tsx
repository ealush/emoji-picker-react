import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { Props } from '../src';
import { Categories } from '../src/config/categoryConfig';
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
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      { n: ['face', 'grinning face with big eyes'], u: '1f603', a: '0.6' },
    ],
  },
};

// focusElement() defers via requestAnimationFrame, so the steal lands
// a frame after mouseover. Flush frames before asserting.
async function flushFocus() {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await new Promise(resolve => setTimeout(resolve, 0));
}

function renderPickerWithExternalInput(props: Partial<Props> = {}) {
  return render(
    <div>
      <input data-testid="external-editor" aria-label="External editor" />
      <EmojiPicker
        emojiData={minimalEmojiData}
        categories={[Categories.SMILEYS_PEOPLE]}
        autoFocusSearch={false}
        {...props}
      />
    </div>,
  );
}

async function findEmojiButton(label: string) {
  const buttons = await screen.findAllByLabelText(label);
  return buttons[0];
}

/**
 * Regression tests for https://github.com/ealush/emoji-picker-react/issues/320
 *
 * Hovering an emoji must not steal focus from an element outside the picker
 * (e.g. a contentEditable/message input). The `mouseover` handler in
 * useEmojiPreviewEvents calls focusElement(button), moving
 * document.activeElement into the picker.
 */
describe('issue #320: hovering emojis must not steal external focus', () => {
  it('keeps focus in an external input when hovering an emoji', async () => {
    renderPickerWithExternalInput();

    const external = screen.getByTestId('external-editor') as HTMLInputElement;
    external.focus();
    expect(document.activeElement).toBe(external);

    const emojiButton = await findEmojiButton('grinning face');

    fireEvent.mouseOver(emojiButton);
    await flushFocus();

    // Desired behavior: external input keeps focus; preview updates without
    // moving DOM focus (keyboard nav still moves focus via explicit keys).
    expect(document.activeElement).toBe(external);
  });

  it('keeps focus in an external contentEditable when hovering an emoji', async () => {
    render(
      <div>
        <div
          data-testid="external-editable"
          contentEditable
          tabIndex={0}
          aria-label="External content editable"
        />
        <EmojiPicker
          emojiData={minimalEmojiData}
          categories={[Categories.SMILEYS_PEOPLE]}
          autoFocusSearch={false}
        />
      </div>,
    );

    const editable = screen.getByTestId('external-editable');
    (editable as HTMLElement).focus();
    expect(document.activeElement).toBe(editable);

    const emojiButton = await findEmojiButton('grinning face');
    fireEvent.mouseOver(emojiButton);
    await flushFocus();

    expect(document.activeElement).toBe(editable);
  });
});
