import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker from '../src';
import { Categories } from '../src/config/categoryConfig';
import { List, Preview, Root, Viewport } from '../src/primitives';
import { EmojiData } from '../src/types/exposedTypes';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

// A descendant that always fails render, shared by the default tree and
// the Preview primitive (same module, same mock).
vi.mock('../src/components/footer/Preview', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../src/components/footer/Preview')>();
  return {
    ...actual,
    Preview: () => {
      throw new Error('preview boom');
    },
  };
});

const miniData: EmojiData = {
  categories: {
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
  },
  emojis: {
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
    ],
  },
};

function silenceErrors() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('v5 error ownership (boundary placement)', () => {
  it('default picker catches a descendant render error and renders null', () => {
    const errors = silenceErrors();
    try {
      const { container } = render(<EmojiPicker emojiData={miniData} />);
      expect(container.querySelector('aside')).toBeNull();
    } finally {
      errors.mockRestore();
    }
  });

  it('bare Root lets the same descendant error propagate (no boundary)', () => {
    const errors = silenceErrors();
    try {
      expect(() =>
        render(
          <Root emojiData={miniData}>
            <Viewport>
              <List />
            </Viewport>
            <Preview />
          </Root>,
        ),
      ).toThrow('preview boom');
    } finally {
      errors.mockRestore();
    }
  });
});
