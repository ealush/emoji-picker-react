import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import EmojiPicker from '../src';
import { compareConfig } from '../src/config/compareConfig';

// Props that the memo comparator used to ignore: updating them after mount
// had no effect at all.
describe('config updates after mount', () => {
  it('applies previewConfig changes', () => {
    const { container, rerender } = render(
      <EmojiPicker previewConfig={{ showPreview: true }} />,
    );
    expect(container.querySelector('[data-epr-part="preview"]')).not.toBeNull();
    rerender(<EmojiPicker previewConfig={{ showPreview: false }} />);
    expect(container.querySelector('[data-epr-part="preview"]')).toBeNull();
  });

  it('applies reactions changes', () => {
    const { container, rerender } = render(
      <EmojiPicker reactionsDefaultOpen reactions={['1f600']} />,
    );
    const count = () =>
      container.querySelectorAll(
        '[data-epr-part="reactions"] [data-unified], [data-epr-part="reactions"] button[data-epr-unified]',
      ).length;
    const before = count();
    rerender(
      <EmojiPicker reactionsDefaultOpen reactions={['1f600', '1f44d']} />,
    );
    expect(count()).toBe(before + 1);
  });

  it('accepts reactions as emoji characters, like suggestedEmojis', () => {
    const { container } = render(
      <EmojiPicker
        reactionsDefaultOpen
        reactions={['👍', '1F602', '❤️', '❤', 'not-an-emoji']}
      />,
    );
    const ids = Array.from(
      container.querySelectorAll(
        '[data-epr-part="reaction"] button[data-epr-unified]',
      ),
    ).map((button) => button.getAttribute('data-epr-unified'));
    // "❤" (no variation selector) resolves to the same heart as "❤️".
    expect(ids).toEqual(['1f44d', '1f602', '2764-fe0f', '2764-fe0f']);
  });

  it('applies hiddenEmojis changes', () => {
    const { container, rerender } = render(<EmojiPicker />);
    expect(
      container.querySelector('[data-epr-unified="1f600"]'),
    ).not.toBeNull();
    rerender(<EmojiPicker hiddenEmojis={['1f600']} />);
    expect(container.querySelector('[data-epr-unified="1f600"]')).toBeNull();
  });

  it('ignores callback identity and equal inline literals', () => {
    expect(
      compareConfig(
        {
          onEmojiClick: () => undefined,
          reactions: ['1f600'],
          previewConfig: { showPreview: false },
        },
        {
          onEmojiClick: () => undefined,
          reactions: ['1f600'],
          previewConfig: { showPreview: false },
        },
      ),
    ).toBe(true);
    expect(
      compareConfig(
        { allowExpandReactions: true },
        { allowExpandReactions: false },
      ),
    ).toBe(false);
    expect(compareConfig({}, { nonce: 'abc' })).toBe(false);
  });

  it('keeps searchPlaceholder updates working', () => {
    const { rerender } = render(<EmojiPicker searchPlaceholder="One" />);
    rerender(<EmojiPicker searchPlaceholder="Two" />);
    expect(screen.getByPlaceholderText('Two')).toBeInTheDocument();
  });
});
