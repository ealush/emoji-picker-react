import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Deliberately imports only the primitives entry: nothing registers the
// bundled dataset, exactly as in a primitives-only application bundle.
import { getRegisteredDefaultEmojiData } from '../src/data/defaultEmojiData';
import * as Picker from '../src/primitives';

function Composition(props: Partial<React.ComponentProps<typeof Picker.Root>>) {
  return (
    <Picker.Root {...props}>
      <Picker.Viewport>
        <Picker.List />
        <Picker.Loading>Fetching emojis</Picker.Loading>
      </Picker.Viewport>
    </Picker.Root>
  );
}

const grinning = (container: HTMLElement) =>
  container.querySelector('button[data-epr-unified="1f600"]');

describe('lazy emoji data (primitives entry)', () => {
  it('uses a loader, showing Loading until it resolves', async () => {
    let resolve: (value: { default: unknown }) => void = () => undefined;
    const loader = vi.fn(
      () =>
        new Promise<{ default: unknown }>((r) => {
          resolve = r;
        }),
    );
    const { container } = render(
      <Composition emojiData={loader as Picker.EmojiDataLoader} />,
    );
    expect(loader).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('[data-epr-part="loading"]')?.textContent,
    ).toBe('Fetching emojis');
    expect(grinning(container)).toBeNull();

    const es = (await import('../src/data/emojis-es')).default;
    resolve({ default: es });
    await vi.waitFor(() => {
      expect(container.querySelector('[data-epr-part="loading"]')).toBeNull();
      expect(grinning(container)).not.toBeNull();
    });
    // Localized dataset: Spanish names.
    expect(grinning(container)?.getAttribute('aria-label')).toBe(
      'cara sonriendo',
    );
  });

  it('loads the bundled dataset on demand when emojiData is omitted', async () => {
    expect(getRegisteredDefaultEmojiData()).toBeNull();
    const { container } = render(<Composition />);
    expect(container.querySelector('[data-epr-part="loading"]')).not.toBeNull();
    await vi.waitFor(() => {
      expect(grinning(container)).not.toBeNull();
    });
    expect(getRegisteredDefaultEmojiData()).not.toBeNull();

    // Later Roots render synchronously from the now-registered dataset.
    const second = render(<Composition />);
    expect(
      second.container.querySelector('[data-epr-part="loading"]'),
    ).toBeNull();
    expect(grinning(second.container)).not.toBeNull();
  });

  it('renders synchronously with an object (SSR-safe)', async () => {
    const en = (await import('../src/data/emojis-en')).default;
    const { container } = render(<Composition emojiData={en} />);
    expect(container.querySelector('[data-epr-part="loading"]')).toBeNull();
    expect(grinning(container)).not.toBeNull();
  });
});
