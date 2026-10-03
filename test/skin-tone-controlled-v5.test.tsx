import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EmojiPicker, { SkinTones } from '../src';

const thumbsUp = (container: HTMLElement) =>
  container.querySelector('[data-epr-unified^="1f44d"]');

const tone = (container: HTMLElement, label: string) =>
  container.querySelector(`[aria-label="${label}"]`) as HTMLElement;

describe('controlled skinTone', () => {
  it('renders the controlled tone and follows prop updates', () => {
    const { container, rerender } = render(
      <EmojiPicker skinTone={SkinTones.DARK} />,
    );
    expect(thumbsUp(container)?.getAttribute('data-epr-unified')).toBe(
      '1f44d-1f3ff',
    );
    rerender(<EmojiPicker skinTone={SkinTones.LIGHT} />);
    expect(thumbsUp(container)?.getAttribute('data-epr-unified')).toBe(
      '1f44d-1f3fb',
    );
  });

  it('reports selection without changing a controlled value', () => {
    const onSkinToneChange = vi.fn();
    const { container } = render(
      <EmojiPicker
        skinTone={SkinTones.NEUTRAL}
        onSkinToneChange={onSkinToneChange}
      />,
    );
    fireEvent.click(tone(container, 'Skin tone NEUTRAL'));
    fireEvent.click(tone(container, 'Skin tone MEDIUM'));
    expect(onSkinToneChange).toHaveBeenCalledWith(SkinTones.MEDIUM);
    expect(thumbsUp(container)?.getAttribute('data-epr-unified')).toBe('1f44d');
  });

  it('is applied by a parent that accepts the change', () => {
    function Controlled() {
      const [tone, setTone] = React.useState(SkinTones.NEUTRAL);
      return <EmojiPicker skinTone={tone} onSkinToneChange={setTone} />;
    }
    const { container } = render(<Controlled />);
    fireEvent.click(tone(container, 'Skin tone NEUTRAL'));
    fireEvent.click(tone(container, 'Skin tone MEDIUM'));
    expect(thumbsUp(container)?.getAttribute('data-epr-unified')).toBe(
      '1f44d-1f3fd',
    );
  });
});
